"use strict";

var STATUS_CLIENT_PROCESSING = 741130001;
var STATUS_READY_FOR_SERVER = 741130002;
var STATUS_READY_FOR_FLOW = 741130003;
var STATUS_FLOW_RUNNING = 741130004;
var STATUS_READY_FOR_MERGE = 741130005;
var STATUS_MERGE_IN_PROGRESS = 741130008;
var STATUS_READY_FOR_ZIP = 741130009;
var STATUS_ZIP_IN_PROGRESS = 741130010;
var STATUS_READY_FOR_CLEANUP = 741130011;
var STATUS_CLEANUP_IN_PROGRESS = 741130012;
var STALL_TIMEOUT_MS = 4 * 60 * 1000;

var ALLOWED_RESTART_ROLES = "System Administrator|ROM - Business Admin|ROM - Planner|ROM - Manager";

function woejGetFormContext(primaryControl) {
  if (primaryControl && typeof primaryControl.getAttribute === "function") {
    return primaryControl;
  }
  if (typeof Xrm !== "undefined" && Xrm.Page) {
    return Xrm.Page;
  }
  return null;
}

function woejGetJobId(formContext) {
  return ((formContext && formContext.data && formContext.data.entity && formContext.data.entity.getId
    ? formContext.data.entity.getId()
    : "") || "").replace(/[{}]/g, "");
}

function woejGetStatusCode(formContext) {
  var attr = formContext.getAttribute("statuscode") || formContext.getAttribute("header_ts_statuscode");
  return attr ? attr.getValue() : null;
}

function woejIsInProgressStatus(statusCode) {
  return statusCode === STATUS_CLIENT_PROCESSING ||
    statusCode === STATUS_READY_FOR_SERVER ||
    statusCode === STATUS_READY_FOR_FLOW ||
    statusCode === STATUS_FLOW_RUNNING ||
    statusCode === STATUS_READY_FOR_MERGE ||
    statusCode === STATUS_MERGE_IN_PROGRESS ||
    statusCode === STATUS_READY_FOR_ZIP ||
    statusCode === STATUS_ZIP_IN_PROGRESS ||
    statusCode === STATUS_READY_FOR_CLEANUP ||
    statusCode === STATUS_CLEANUP_IN_PROGRESS;
}

function woejHasRestartRole() {
  if (typeof userHasRole === "function") {
    return userHasRole(ALLOWED_RESTART_ROLES);
  }

  var roles = Xrm.Utility.getGlobalContext().userSettings.roles;
  var allowed = ALLOWED_RESTART_ROLES.toLowerCase().split("|");
  var found = false;
  roles.forEach(function (role) {
    if (allowed.indexOf((role.name || "").toLowerCase()) >= 0) {
      found = true;
    }
  });
  return found;
}

function woejShowAlert(text) {
  return Xrm.Navigation.openAlertDialog({ text: text });
}

async function woejPromptResumeOrRestart() {
  var choice = await Xrm.Navigation.openConfirmDialog({
    title: "Resume Or Start Over",
    text: "Select OK to resume from current progress, or Cancel to choose Start Over.",
    confirmButtonLabel: "OK (Resume)",
    cancelButtonLabel: "Start Over"
  });

  if (choice && choice.confirmed) {
    return "resume";
  }

  var restartConfirm = await Xrm.Navigation.openConfirmDialog({
    title: "Start Over Export Job",
    text: "This will remove generated export artifacts (PDF/ZIP notes) and reset progress fields. Continue?",
    confirmButtonLabel: "Start Over",
    cancelButtonLabel: "Cancel"
  });

  return restartConfirm && restartConfirm.confirmed ? "restart" : "cancelled";
}

function woejParseDateMs(value) {
  if (!value) return NaN;
  var ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : NaN;
}

function woejIsLikelyStalled(job) {
  if (!job) return false;
  var statusCode = job.statuscode;
  if (!woejIsInProgressStatus(statusCode)) return false;

  var heartbeatMs = woejParseDateMs(job.ts_lastheartbeat);
  var modifiedMs = woejParseDateMs(job.modifiedon);
  var now = Date.now();
  var heartbeatStale = Number.isFinite(heartbeatMs) ? ((now - heartbeatMs) >= STALL_TIMEOUT_MS) : true;
  var modifiedStale = Number.isFinite(modifiedMs) ? ((now - modifiedMs) >= STALL_TIMEOUT_MS) : true;

  var hasPartialProgress =
    Number(job.ts_doneunits || 0) > 0 ||
    (((job.ts_progressmessage || "").toString().trim().length) > 0) ||
    Number(job.ts_nextmergeindex || 0) > 0;

  return heartbeatStale && modifiedStale && hasPartialProgress;
}

async function woejGetLiveJobState(jobId) {
  return await Xrm.WebApi.retrieveRecord(
    "ts_workorderexportjob",
    jobId,
    "?$select=statuscode,ts_lastheartbeat,modifiedon,ts_progressmessage,ts_nextmergeindex,ts_doneunits"
  );
}

function woejGetResumeTargetStatus(statusCode) {
  if (
    statusCode === STATUS_READY_FOR_MERGE ||
    statusCode === STATUS_MERGE_IN_PROGRESS ||
    statusCode === STATUS_READY_FOR_ZIP ||
    statusCode === STATUS_ZIP_IN_PROGRESS ||
    statusCode === STATUS_READY_FOR_CLEANUP ||
    statusCode === STATUS_CLEANUP_IN_PROGRESS
  ) {
    return STATUS_READY_FOR_MERGE;
  }

  if (
    statusCode === STATUS_READY_FOR_SERVER ||
    statusCode === STATUS_READY_FOR_FLOW ||
    statusCode === STATUS_FLOW_RUNNING ||
    statusCode === STATUS_CLIENT_PROCESSING ||
    statusCode === STATUS_ACTIVE ||
    statusCode === 741130007 // STATUS_ERROR in plugin
  ) {
    return STATUS_READY_FOR_SERVER;
  }

  return STATUS_READY_FOR_SERVER;
}

async function woejReloadExportJobForm(jobId, formContext) {
  try {
    await Xrm.Navigation.openForm({
      entityName: "ts_workorderexportjob",
      entityId: jobId,
      openInNewWindow: false
    });
    return;
  } catch (e) {
    // Fallback to in-place refresh if navigation fails.
  }

  try {
    await formContext.data.refresh(false);
    try { formContext.ui.refreshRibbon(); } catch (e) { }
  } catch (e) {
    if (typeof window !== "undefined" && window.location && typeof window.location.reload === "function") {
      window.location.reload();
    }
  }
}

function woejFormatRestartedName(existingName) {
  var base = (existingName || "Export").toString().trim();
  base = base.replace(/\s*\|\s*restarted\s*@.*$/i, "");
  base = base.replace(/\s+\(restarted\s*@.*\)$/i, "");
  base = base.replace(/\s+\(restarted.*\)$/i, "");

  var now = new Date();
  var pad2 = function (n) { return n < 10 ? "0" + n : "" + n; };
  var stamp = now.getFullYear() + "-" + pad2(now.getMonth() + 1) + "-" + pad2(now.getDate()) +
    " " + pad2(now.getHours()) + ":" + pad2(now.getMinutes());
  var userName = "";
  try {
    userName = (Xrm.Utility.getGlobalContext().userSettings.userName || "").toString().trim();
  } catch (e) {
    userName = "";
  }
  if (!userName) {
    userName = "Unknown User";
  }

  return base + " | Restarted @ " + stamp + " by " + userName;
}

function woejIsGeneratedExportArtifact(filename) {
  var name = (filename || "").toString().trim().toLowerCase();
  if (!name) return false;

  if (/^wo_.+_survey_.+\.pdf$/i.test(name)) return true;
  if (/^wo_.+_main\.pdf$/i.test(name)) return true;
  if (/^wo_.+_merged\.pdf$/i.test(name)) return true;
  if (name.endsWith(".zip")) return true;
  return false;
}

async function woejGetGeneratedArtifactNotes(jobId) {
  var query =
    "?$select=annotationid,filename,isdocument" +
    "&$filter=_objectid_value eq " + jobId + " and isdocument eq true" +
    "&$top=5000";

  var result = await Xrm.WebApi.retrieveMultipleRecords("annotation", query);
  return (result.entities || []).filter(function (n) {
    return !!n.annotationid && woejIsGeneratedExportArtifact(n.filename);
  });
}

async function woejDeleteNotes(notes) {
  for (var i = 0; i < notes.length; i++) {
    try {
      await Xrm.WebApi.deleteRecord("annotation", notes[i].annotationid);
    } catch (e) {
      // Keep restart resilient even if one note cannot be deleted.
    }
  }
}

function canRestartJob(primaryControl) {
  try {
    var formContext = woejGetFormContext(primaryControl);
    if (!formContext) return false;
    if (!woejHasRestartRole()) return false;
    return true;
  } catch (e) {
    return false;
  }
}

async function restartJob(primaryControl) {
  var formContext = woejGetFormContext(primaryControl);
  if (!formContext) {
    await woejShowAlert("Could not determine the current form context.");
    return;
  }

  if (!woejHasRestartRole()) {
    await woejShowAlert("Only System Administrator, ROM - Business Admin, ROM - Planner, and ROM - Manager can restart a job.");
    return;
  }

  var jobId = woejGetJobId(formContext);
  if (!jobId) {
    await woejShowAlert("Could not determine the export job ID.");
    return;
  }

  var jobState = null;
  try {
    jobState = await woejGetLiveJobState(jobId);
  } catch (e) {
    // Fall back to form values if live retrieve fails.
  }

  var statusCode = jobState && jobState.statuscode != null
    ? jobState.statuscode
    : woejGetStatusCode(formContext);
  var inProgress = woejIsInProgressStatus(statusCode);
  var isStalled = inProgress && woejIsLikelyStalled(jobState);

  if (inProgress && !isStalled) {
    await woejShowAlert("This export job is still running. Resume/Start Over is available when the job appears stalled (no progress for at least 4 minutes).");
    return;
  }

  var mode = inProgress ? await woejPromptResumeOrRestart() : "restart";
  if (mode === "cancelled") return;

  try {
    if (mode === "resume") {
      Xrm.Utility.showProgressIndicator("Resuming export job...");

      var targetStatus = woejGetResumeTargetStatus(statusCode);
      await Xrm.WebApi.updateRecord("ts_workorderexportjob", jobId, {
        statuscode: targetStatus,
        ts_errormessage: ""
      });

      Xrm.Utility.closeProgressIndicator();
      await woejShowAlert("Resume requested. Reloading the form to continue processing.");
      await woejReloadExportJobForm(jobId, formContext);
      return;
    }

    if (!inProgress) {
      var confirm = await Xrm.Navigation.openConfirmDialog({
        title: "Restart Export Job",
        text: "This will restart the export job, remove generated export artifacts (PDF/ZIP notes), and reset progress fields. Continue?"
      });
      if (!confirm || !confirm.confirmed) return;
    }

    Xrm.Utility.showProgressIndicator("Restarting export job...");

    var notes = await woejGetGeneratedArtifactNotes(jobId);
    if (notes.length > 0) {
      await woejDeleteNotes(notes);
    }

    var existingNameAttr = formContext.getAttribute("ts_name");
    var existingName = existingNameAttr ? existingNameAttr.getValue() : "";
    var restartedName = woejFormatRestartedName(existingName);

    await Xrm.WebApi.updateRecord("ts_workorderexportjob", jobId, {
      statuscode: STATUS_CLIENT_PROCESSING,
      ts_name: restartedName,
      ts_errormessage: "",
      ts_payloadjson: null,
      ts_doneunits: 0,
      ts_totalunits: 0,
      ts_progressmessage: "",
      ts_lastheartbeat: null
    });

    // Best effort clear of file column artifact (if present).
    try {
      await Xrm.WebApi.updateRecord("ts_workorderexportjob", jobId, {
        ts_finalexportzip: null
      });
    } catch (e) {
      // Ignore if file-column clear is not available in this org/version.
    }

    Xrm.Utility.closeProgressIndicator();
    await woejShowAlert("Export job restarted. Reloading the form to resume processing.");
    await woejReloadExportJobForm(jobId, formContext);
  } catch (e) {
    try { Xrm.Utility.closeProgressIndicator(); } catch (ignored) { }
    await woejShowAlert("Failed to restart the export job: " + (e && e.message ? e.message : e));
  }
}

if (typeof window !== "undefined") {
  window.WorkOrderExportJobRibbon = window.WorkOrderExportJobRibbon || {};
  window.WorkOrderExportJobRibbon.canRestartJob = canRestartJob;
  window.WorkOrderExportJobRibbon.restartJob = restartJob;
}
