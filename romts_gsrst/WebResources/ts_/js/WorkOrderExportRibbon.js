var WorkOrderExportRibbon = (function () {
  "use strict";

  var STATUS_CLIENT_PROCESSING = 741130001;
  var STATUS_READY_FOR_SERVER = 741130002;
  var STATUS_READY_FOR_FLOW = 741130003;
  var STATUS_FLOW_RUNNING = 741130004;
  var STATUS_READY_FOR_MERGE = 741130005;

  var ALLOWED_ROLES = "System Administrator|ROM - Business Admin|ROM - Planner|ROM - Manager";

  function getFormContext(primaryControl) {
    if (primaryControl && typeof primaryControl.getAttribute === "function") {
      return primaryControl;
    }
    if (typeof Xrm !== "undefined" && Xrm.Page) {
      return Xrm.Page;
    }
    return null;
  }

  function getJobId(formContext) {
    return ((formContext && formContext.data && formContext.data.entity && formContext.data.entity.getId
      ? formContext.data.entity.getId()
      : "") || "").replace(/[{}]/g, "");
  }

  function getStatusCode(formContext) {
    var attr = formContext.getAttribute("statuscode") || formContext.getAttribute("header_ts_statuscode");
    return attr ? attr.getValue() : null;
  }

  function isInProgressStatus(statusCode) {
    return statusCode === STATUS_CLIENT_PROCESSING ||
      statusCode === STATUS_READY_FOR_SERVER ||
      statusCode === STATUS_READY_FOR_FLOW ||
      statusCode === STATUS_FLOW_RUNNING ||
      statusCode === STATUS_READY_FOR_MERGE;
  }

  function hasRestartRole() {
    if (typeof userHasRole === "function") {
      return userHasRole(ALLOWED_ROLES);
    }

    var roles = Xrm.Utility.getGlobalContext().userSettings.roles;
    var allowed = ALLOWED_ROLES.toLowerCase().split("|");
    var found = false;
    roles.forEach(function (role) {
      if (allowed.indexOf((role.name || "").toLowerCase()) >= 0) {
        found = true;
      }
    });
    return found;
  }

  function showAlert(text) {
    return Xrm.Navigation.openAlertDialog({ text: text });
  }

  function formatRestartedName(existingName) {
    var base = (existingName || "Batch Export").toString().trim();
    base = base.replace(/\s+\(RESTARTED.*\)$/i, "");

    var now = new Date();
    var pad2 = function (n) { return n < 10 ? "0" + n : "" + n; };
    var stamp = now.getFullYear() + "-" + pad2(now.getMonth() + 1) + "-" + pad2(now.getDate()) +
      " " + pad2(now.getHours()) + ":" + pad2(now.getMinutes());

    return base + " (RESTARTED " + stamp + ")";
  }

  function isGeneratedExportArtifact(filename) {
    var name = (filename || "").toString().trim().toLowerCase();
    if (!name) return false;

    if (/^wo_.+_survey_.+\.pdf$/i.test(name)) return true;
    if (/^wo_.+_main\.pdf$/i.test(name)) return true;
    if (/^wo_.+_merged\.pdf$/i.test(name)) return true;
    if (name.endsWith(".zip")) return true;
    return false;
  }

  async function getGeneratedArtifactNotes(jobId) {
    var query =
      "?$select=annotationid,filename,isdocument" +
      "&$filter=_objectid_value eq " + jobId + " and isdocument eq true" +
      "&$top=5000";

    var result = await Xrm.WebApi.retrieveMultipleRecords("annotation", query);
    return (result.entities || []).filter(function (n) {
      return !!n.annotationid && isGeneratedExportArtifact(n.filename);
    });
  }

  async function deleteNotes(notes) {
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
      var formContext = getFormContext(primaryControl);
      if (!formContext) return false;
      if (!hasRestartRole()) return false;

      var statusCode = getStatusCode(formContext);
      return !isInProgressStatus(statusCode);
    } catch (e) {
      return false;
    }
  }

  async function restartJob(primaryControl) {
    var formContext = getFormContext(primaryControl);
    if (!formContext) {
      await showAlert("Could not determine the current form context.");
      return;
    }

    if (!hasRestartRole()) {
      await showAlert("Only System Administrator, ROM - Business Admin, ROM - Planner, and ROM - Manager can restart a job.");
      return;
    }

    var statusCode = getStatusCode(formContext);
    if (isInProgressStatus(statusCode)) {
      await showAlert("This export job is currently in progress and cannot be restarted right now.");
      return;
    }

    var jobId = getJobId(formContext);
    if (!jobId) {
      await showAlert("Could not determine the export job ID.");
      return;
    }

    var confirm = await Xrm.Navigation.openConfirmDialog({
      title: "Restart Export Job",
      text: "This will restart the export job, remove generated export artifacts (PDF/ZIP notes), and reset progress fields. Continue?"
    });
    if (!confirm || !confirm.confirmed) return;

    try {
      Xrm.Utility.showProgressIndicator("Restarting export job...");

      var notes = await getGeneratedArtifactNotes(jobId);
      if (notes.length > 0) {
        await deleteNotes(notes);
      }

      var existingNameAttr = formContext.getAttribute("ts_name");
      var existingName = existingNameAttr ? existingNameAttr.getValue() : "";
      var restartedName = formatRestartedName(existingName);

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
      await showAlert("Export job restarted. The form will refresh.");
      await formContext.data.refresh(false);
      try { formContext.ui.refreshRibbon(); } catch (e) { }
    } catch (e) {
      try { Xrm.Utility.closeProgressIndicator(); } catch (ignored) { }
      await showAlert("Failed to restart the export job: " + (e && e.message ? e.message : e));
    }
  }

  return {
    canRestartJob: canRestartJob,
    restartJob: restartJob
  };
})();
