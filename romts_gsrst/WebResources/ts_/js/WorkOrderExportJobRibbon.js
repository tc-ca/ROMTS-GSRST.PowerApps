// Work Order Export Job ribbon helpers
// Intended usage (Ribbon Workbench):
// - Display/Enable rule: WorkOrderExportJobRibbon.canRestartFromStart(primaryControl)
// - Action:             WorkOrderExportJobRibbon.restartFromStart(primaryControl)

var WorkOrderExportJobRibbon = WorkOrderExportJobRibbon || {};

(function () {
  "use strict";

  var STATUS_CLIENT_PROCESSING = 741130001;

  function logInfo(msg, data) {
    try {
      if (typeof console === "undefined") return;
      if (data !== undefined) console.info("[WorkOrderExportJobRibbon]", msg, data);
      else console.info("[WorkOrderExportJobRibbon]", msg);
    } catch (e) {
      // ignore
    }
  }

  function logWarn(msg, data) {
    try {
      if (typeof console === "undefined") return;
      if (data !== undefined) console.warn("[WorkOrderExportJobRibbon]", msg, data);
      else console.warn("[WorkOrderExportJobRibbon]", msg);
    } catch (e) {
      // ignore
    }
  }

  function logError(msg, err) {
    try {
      if (typeof console === "undefined") return;
      console.error("[WorkOrderExportJobRibbon]", msg, err || "");
    } catch (e) {
      // ignore
    }
  }

  function logOnce(key, level, msg, data) {
    // Ribbon enable rules can be evaluated frequently; this prevents console spam without requiring a manual flag.
    try {
      var k = "tsis2:WorkOrderExportJobRibbon:once:" + key;
      if (sessionStorage && sessionStorage.getItem(k) === "1") return;
      if (sessionStorage) sessionStorage.setItem(k, "1");
    } catch (e) {
      // ignore dedupe failures (still log)
    }

    if (level === "warn") logWarn(msg, data);
    else if (level === "error") logError(msg, data);
    else logInfo(msg, data);
  }

  function getFormContext(primaryControl) {
    return primaryControl;
  }

  function getId(formContext) {
    try {
      return (formContext && formContext.data && formContext.data.entity && formContext.data.entity.getId
        ? formContext.data.entity.getId()
        : ""
      ).replace(/[{}]/g, "");
    } catch (e) {
      return "";
    }
  }

  function getAttrValue(formContext, logicalName) {
    try {
      var a = formContext.getAttribute(logicalName);
      return a ? a.getValue() : null;
    } catch (e) {
      return null;
    }
  }

  WorkOrderExportJobRibbon.isSystemAdministrator = function () {
    try {
      var roles = Xrm.Utility.getGlobalContext().userSettings.roles;
      var enable = false;
      roles.forEach(function (item) {
        if (item.name === "System Administrator") enable = true;
      });
      return enable;
    } catch (e) {
      logError("Failed to evaluate user roles (isSystemAdministrator).", e);
      return false;
    }
  };

  // Use this for BOTH display rule + enable rule (must be synchronous).
  WorkOrderExportJobRibbon.canRestartFromStart = function (primaryControl) {
    try {
      if (!WorkOrderExportJobRibbon.isSystemAdministrator()) {
        logOnce("canRestartFromStart:notSysAdmin", "info", "Restart button hidden/disabled: user is not System Administrator.");
        return false;
      }
      var formContext = getFormContext(primaryControl);
      var id = getId(formContext);
      if (!id) {
        logOnce("canRestartFromStart:notSaved", "info", "Restart button hidden/disabled: record is not saved yet (no id).");
        return false; // must be saved
      }
      var payload = getAttrValue(formContext, "ts_surveypayloadjson");
      var hasPayload = !!(payload && payload.toString().trim());
      if (!hasPayload) logOnce("canRestartFromStart:emptyPayload:" + id, "info", "Restart button hidden/disabled: ts_surveypayloadjson is empty.", { id: id });
      return hasPayload;
    } catch (e) {
      logOnce("canRestartFromStart:exception", "error", "Restart button enable rule threw an exception.", e);
      return false;
    }
  };

  async function deleteExportArtifacts(jobId) {
    // Deletes only the export-generated notes (keeps user-authored notes):
    // - WO_<WO>_SURVEY_<TASK>.pdf
    // - WO_<WO>_MAIN.pdf
    // - WO_<WO>_MERGED.pdf
    // - WorkOrderExport_<jobId>.zip
    var zipName = "WorkOrderExport_" + jobId + ".zip";
    var query =
      "?$select=annotationid,filename" +
      "&$filter=_objectid_value eq " +
      jobId +
      " and isdocument eq true and (" +
      "contains(filename,'WO_') or filename eq '" + zipName + "'" +
      " or contains(subject,'WO_') or subject eq '" + zipName + "'" +
      ")" +
      "&$top=5000";

    var notes = await Xrm.WebApi.retrieveMultipleRecords("annotation", query);
    var entities = (notes && notes.entities) ? notes.entities : [];
    logInfo("Found export artifact note(s) to delete.", { jobId: jobId, count: entities.length });

    for (var i = 0; i < entities.length; i++) {
      var noteId = entities[i].annotationid;
      if (!noteId) continue;
      await Xrm.WebApi.deleteRecord("annotation", noteId);
    }

    return entities.length;
  }

  WorkOrderExportJobRibbon.restartFromStart = async function (primaryControl) {
    var formContext = getFormContext(primaryControl);
    logInfo("Restart requested.");

    if (!WorkOrderExportJobRibbon.isSystemAdministrator()) {
      logWarn("Restart blocked: user is not System Administrator.");
      await Xrm.Navigation.openAlertDialog({ text: "This action is restricted to System Administrators." });
      return;
    }

    var jobId = getId(formContext);
    if (!jobId) {
      logWarn("Restart blocked: Export Job is not saved (no id).");
      await Xrm.Navigation.openAlertDialog({ text: "Please save the Export Job first." });
      return;
    }

    var payload = getAttrValue(formContext, "ts_surveypayloadjson");
    if (!payload || !payload.toString().trim()) {
      logWarn("Restart blocked: ts_surveypayloadjson is empty.", { jobId: jobId });
      await Xrm.Navigation.openAlertDialog({ text: "Cannot restart: ts_surveypayloadjson is empty." });
      return;
    }

    var confirmStrings = {
      title: "Restart export job from start",
      text:
        "This will delete previously generated export artifacts (PDF/ZIP notes) for this job and reset it to 'Client Processing'.\n\nContinue?"
    };
    var confirmOptions = { height: 260, width: 520 };
    var confirmResult = await Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions);
    if (!confirmResult || !confirmResult.confirmed) {
      logInfo("Restart cancelled by user.", { jobId: jobId });
      return;
    }

    Xrm.Utility.showProgressIndicator("Restarting export job...");

    try {
      var deletedCount = await deleteExportArtifacts(jobId);
      logInfo("Deleted export artifact note(s).", { jobId: jobId, deletedCount: deletedCount });

      // Reset job back to client stage; keep the same survey payload JSON.
      // Note: we do NOT attempt to clear the file column here (ts_finalexportzip) because clearing file columns
      // via client-side Web API is inconsistent across orgs; the next run will produce a fresh artifact anyway.
      var patch = {
        statuscode: STATUS_CLIENT_PROCESSING,
        ts_errormessage: null,
        ts_payloadjson: null,
        ts_totalunits: 0,
        ts_doneunits: 0,
        ts_progressmessage: "Restarted by administrator. Ready to generate questionnaire PDFs.",
        ts_lastheartbeat: new Date().toISOString()
      };

      await Xrm.WebApi.updateRecord("ts_workorderexportjob", jobId, patch);
      logInfo("Export job reset to Client Processing.", { jobId: jobId, statuscode: STATUS_CLIENT_PROCESSING });

      // Refresh so WorkOrderExportJob onLoad can pick up the ClientProcessing status immediately.
      await formContext.data.refresh(true);

      await Xrm.Navigation.openAlertDialog({
        text: "Restarted. Deleted " + deletedCount + " export artifact note(s). Processing will begin on this tab."
      });
    } catch (e) {
      var msg = (e && e.message) ? e.message : (e ? e.toString() : "Unknown error");
      logError("Restart failed.", e);
      await Xrm.Navigation.openAlertDialog({ text: "Restart failed: " + msg });
    } finally {
      try { Xrm.Utility.closeProgressIndicator(); } catch (e2) { /* ignore */ }
    }
  };
})();


