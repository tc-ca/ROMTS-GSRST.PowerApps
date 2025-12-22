"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var ROM;
(function (ROM) {
    var WorkOrderExportJob;
    (function (WorkOrderExportJob) {
        /**
         * Waits for survey element to render with measurable content.
         * Polls until element has text content.
         * @param targetElement Element to check
         * @param timeoutMs Maximum time to wait in milliseconds
         * @returns Promise that resolves when render is complete or timeout occurs
         */
        function waitForRender(targetElement, timeoutMs) {
            return __awaiter(this, void 0, void 0, function () {
                var startTime, pollInterval;
                return __generator(this, function (_a) {
                    startTime = Date.now();
                    pollInterval = 100;
                    return [2 /*return*/, new Promise(function (resolve) {
                            var checkRender = function () {
                                var elapsed = Date.now() - startTime;
                                var hasText = targetElement.innerText.trim().length > 0;
                                if (hasText) {
                                    resolve();
                                    return;
                                }
                                if (elapsed >= timeoutMs) {
                                    resolve();
                                    return;
                                }
                                setTimeout(checkRender, pollInterval);
                            };
                            checkRender();
                        })];
                });
            });
        }
        function onLoad(eContext) {
            var _a, _b, _c, _d;
            return __awaiter(this, void 0, void 0, function () {
                var formContext, formType, renderHostControl, status, renderHostControl, renderWindow_1, payloadAttr, payloadStr, rawPayload, ids, includeHiddenQuestions, totalExports, userSettings, locale_1, cssId, style, currentExportIndex, errors, _i, ids_1, workOrderId, workOrderIdNoBraces, workOrderName, workOrder, e_1, progressMessage, fetchOptions, tasks, tasksTotal, renderedCount, uploadedCount, skippedCount, _loop_1, _e, _f, task, errorMsgAttr, e_2, errorMsgAttr;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            formContext = eContext.getFormContext();
                            console.log("[PDFTEST] onLoad triggered.");
                            formType = formContext.ui.getFormType();
                            if (formType === 1) { // 1 = Create (new)
                                renderHostControl = formContext.getControl("WebResource_RenderHost");
                                if (renderHostControl) {
                                    renderHostControl.setVisible(false);
                                }
                                // Don't process if form is new - return early
                                return [2 /*return*/];
                            }
                            status = (_b = (_a = formContext.getAttribute("statuscode")) === null || _a === void 0 ? void 0 : _a.getValue()) !== null && _b !== void 0 ? _b : (_c = formContext.getAttribute("header_ts_statuscode")) === null || _c === void 0 ? void 0 : _c.getValue();
                            // Show completion notification if status is Ready For Server
                            if (status === 741130002) {
                                formContext.ui.setFormNotification("Export completed successfully", "INFO", "completion_notification");
                                return [2 /*return*/];
                            }
                            if (status !== 741130001) {
                                return [2 /*return*/];
                            }
                            _g.label = 1;
                        case 1:
                            _g.trys.push([1, 18, , 19]);
                            renderHostControl = formContext.getControl("WebResource_RenderHost");
                            if (!renderHostControl) {
                                throw new Error("WebResource_RenderHost control not found on form.");
                            }
                            return [4 /*yield*/, renderHostControl.getContentWindow()];
                        case 2:
                            renderWindow_1 = _g.sent();
                            if (!renderWindow_1) {
                                throw new Error("Render host content window not accessible.");
                            }
                            payloadAttr = formContext.getAttribute("ts_surveypayloadjson");
                            payloadStr = payloadAttr === null || payloadAttr === void 0 ? void 0 : payloadAttr.getValue();
                            if (!payloadStr) {
                                throw new Error("No payload JSON found (ts_surveypayloadjson is empty).");
                            }
                            rawPayload = void 0;
                            try {
                                rawPayload = JSON.parse(payloadStr);
                            }
                            catch (e) {
                                throw new Error("Invalid payload JSON (parse failed): " + (e.message || e));
                            }
                            if (!rawPayload || !Array.isArray(rawPayload.ids)) {
                                throw new Error("Invalid payload JSON format. Expected { ids: string[], includeHiddenQuestions?: boolean }.");
                            }
                            ids = rawPayload.ids;
                            includeHiddenQuestions = !!rawPayload.includeHiddenQuestions;
                            totalExports = ids.length;
                            userSettings = Xrm.Utility.getGlobalContext().userSettings;
                            locale_1 = (userSettings.languageId === 1036) ? 'fr' : 'en';
                            cssId = "ts-survey-pdf-css";
                            if (!renderWindow_1.document.getElementById(cssId)) {
                                style = renderWindow_1.document.createElement("style");
                                style.id = cssId;
                                style.innerHTML = "\n                .sv_nav,\n                .sv_next_btn,\n                .sv_prev_btn,\n                .sv_complete_btn,\n                .sv_preview_btn,\n                .sv_progress {\n                  display: none !important;\n                }\n          \n                .sv_p_root {\n                  padding-bottom: 0px !important;\n                }\n              ";
                                renderWindow_1.document.head.appendChild(style);
                            }
                            currentExportIndex = 0;
                            errors = [];
                            _i = 0, ids_1 = ids;
                            _g.label = 3;
                        case 3:
                            if (!(_i < ids_1.length)) return [3 /*break*/, 14];
                            workOrderId = ids_1[_i];
                            currentExportIndex++;
                            workOrderIdNoBraces = workOrderId.replace(/[{}]/g, "");
                            workOrderName = "";
                            _g.label = 4;
                        case 4:
                            _g.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, Xrm.WebApi.retrieveRecord("msdyn_workorder", workOrderIdNoBraces, "?$select=msdyn_name")];
                        case 5:
                            workOrder = _g.sent();
                            workOrderName = workOrder.msdyn_name || "";
                            return [3 /*break*/, 7];
                        case 6:
                            e_1 = _g.sent();
                            console.log("[PDFTEST] Could not retrieve work order name for " + workOrderIdNoBraces + ": " + e_1.message);
                            return [3 /*break*/, 7];
                        case 7:
                            progressMessage = workOrderName
                                ? "Processing " + currentExportIndex + " of " + totalExports + " work orders - " + workOrderName
                                : "Processing " + currentExportIndex + " of " + totalExports + " work orders";
                            formContext.ui.setFormNotification(progressMessage, "WARNING", "processing_notification");
                            fetchOptions = "?$select=msdyn_workorderservicetaskid,ovs_questionnairedefinition,ovs_questionnaireresponse" +
                                "&$filter=_msdyn_workorder_value eq " + workOrderIdNoBraces;
                            return [4 /*yield*/, Xrm.WebApi.retrieveMultipleRecords("msdyn_workorderservicetask", fetchOptions)];
                        case 8:
                            tasks = _g.sent();
                            tasksTotal = tasks.entities.length;
                            renderedCount = 0;
                            uploadedCount = 0;
                            skippedCount = 0;
                            _loop_1 = function (task) {
                                var taskId, def, resp, elementPrint, elementNormal, targetElement, targetId, surveyDef, _h, _j, page, els, _k, els_1, el, survey, filename, options, blob_1, base64Data, exportJobId, note, taskError_1, errorMessage;
                                return __generator(this, function (_l) {
                                    switch (_l.label) {
                                        case 0:
                                            taskId = ((_d = task.msdyn_workorderservicetaskid) === null || _d === void 0 ? void 0 : _d.replace(/[{}]/g, "")) || "unknown";
                                            if (!(task.ovs_questionnairedefinition && task.ovs_questionnaireresponse)) return [3 /*break*/, 8];
                                            def = task.ovs_questionnairedefinition;
                                            resp = task.ovs_questionnaireresponse;
                                            _l.label = 1;
                                        case 1:
                                            _l.trys.push([1, 6, , 7]);
                                            // ---------------------------------------------------------
                                            // RENDER LOGIC
                                            // ---------------------------------------------------------
                                            // Reset Globals
                                            renderWindow_1.operationList = [];
                                            renderWindow_1.activityTypeOperationTypeIdsList = [];
                                            renderWindow_1.questionsOnly = false;
                                            // Clear Previous DOM
                                            if (renderWindow_1.jQuery) {
                                                renderWindow_1.jQuery("#surveyElementPrint").empty();
                                                renderWindow_1.jQuery("#surveyElement").empty();
                                            }
                                            elementPrint = renderWindow_1.document.getElementById("surveyElementPrint");
                                            elementNormal = renderWindow_1.document.getElementById("surveyElement");
                                            targetElement = elementPrint || elementNormal;
                                            targetId = elementPrint ? "#surveyElementPrint" : "#surveyElement";
                                            // 1. Parse & Flatten Definition (Single Page)
                                            if (!def || typeof def !== 'string' || def.trim() === '') {
                                                return [2 /*return*/, "continue"];
                                            }
                                            surveyDef = void 0;
                                            try {
                                                surveyDef = JSON.parse(def.trim());
                                            }
                                            catch (parseError) {
                                                console.log("[PDFTEST] ERROR parsing survey definition for task " + taskId + ": " + parseError.message);
                                                return [2 /*return*/, "continue"];
                                            }
                                            // If includeHiddenQuestions is true: clear visibleIf on ALL elements on ALL pages
                                            // If false: do nothing (keep original visibleIf)
                                            if (includeHiddenQuestions) {
                                                for (_h = 0, _j = surveyDef.pages; _h < _j.length; _h++) {
                                                    page = _j[_h];
                                                    els = page === null || page === void 0 ? void 0 : page.elements;
                                                    if (!Array.isArray(els))
                                                        continue;
                                                    for (_k = 0, els_1 = els; _k < els_1.length; _k++) {
                                                        el = els_1[_k];
                                                        el.visibleIf = null;
                                                    }
                                                }
                                            }
                                            survey = new renderWindow_1.Survey.Model(surveyDef);
                                            survey.locale = locale_1;
                                            survey.mode = 'display';
                                            survey.data = resp ? JSON.parse(resp) : {};
                                            survey.showCompletedPage = false;
                                            survey.showProgressBar = 'off'; // Hide progress bar
                                            // 3. Event Handlers (Replicating surveyRenderPrint.js)
                                            // Append Details Logic
                                            survey.onAfterRenderQuestion.add(function (sender, options) {
                                                if (options.question.hasDetail != true)
                                                    return;
                                                var detailSurveyId = options.question.name + "-Detail";
                                                var detailLabel = (locale_1 === 'fr') ? (options.question.detailFrenchText || "Détail") : (options.question.detailEnglishText || "Detail");
                                                var question = options.htmlElement;
                                                var detailContainer = renderWindow_1.document.createElement("div");
                                                var header = renderWindow_1.document.createElement("div");
                                                var content = renderWindow_1.document.createElement("div");
                                                var detailText = renderWindow_1.document.createElement("span");
                                                var detailSymbol = renderWindow_1.document.createElement("span");
                                                var detailBox = renderWindow_1.document.createElement("textarea");
                                                header.appendChild(detailSymbol);
                                                header.appendChild(detailText);
                                                content.appendChild(detailBox);
                                                detailContainer.appendChild(header);
                                                detailContainer.appendChild(content);
                                                question.appendChild(detailContainer);
                                                detailContainer.style.marginTop = "10px";
                                                header.style.backgroundColor = "#d3d3d3";
                                                header.style.padding = "2px";
                                                header.style.fontWeight = "bold";
                                                detailBox.className = "form-control";
                                                detailBox.rows = 5;
                                                detailBox.readOnly = true;
                                                detailText.innerHTML = detailLabel;
                                                content.style.display = "block";
                                                detailSymbol.innerHTML = "- "; // Expanded by default
                                                if (sender.getValue(detailSurveyId) != null)
                                                    detailBox.value = sender.getValue(detailSurveyId);
                                            });
                                            // 4. Render
                                            renderWindow_1.jQuery(targetId).Survey({ model: survey });
                                            // Wait for rendering with polling
                                            return [4 /*yield*/, waitForRender(targetElement, 10000)];
                                        case 2:
                                            // Wait for rendering with polling
                                            _l.sent();
                                            // ---------------------------------------------------------
                                            // FIX: Convert TextAreas to Divs
                                            // ---------------------------------------------------------
                                            if (renderWindow_1.jQuery) {
                                                renderWindow_1.jQuery("textarea").each(function (index, el) {
                                                    var val = (renderWindow_1.jQuery(el).val() || "").toString();
                                                    var newDiv = renderWindow_1.jQuery('<div class="printed-textarea"></div>').html(val.replace(/\n/g, "<br />"));
                                                    newDiv.css("white-space", "pre-wrap");
                                                    newDiv.css("word-wrap", "break-word");
                                                    newDiv.css("border", "1px solid #ccc");
                                                    newDiv.css("padding", "5px");
                                                    newDiv.css("min-height", "50px");
                                                    newDiv.addClass("form-control");
                                                    renderWindow_1.jQuery(el).replaceWith(newDiv);
                                                });
                                            }
                                            filename = "WO_" + workOrderIdNoBraces + "_SURVEY_" + taskId + ".pdf";
                                            options = {
                                                margin: 0.5,
                                                filename: filename,
                                                image: { type: 'png', quality: 0.98 },
                                                html2canvas: { scale: 1, useCORS: true },
                                                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                                            };
                                            return [4 /*yield*/, renderWindow_1.html2pdf().from(targetElement).set(options).output('blob')];
                                        case 3:
                                            blob_1 = _l.sent();
                                            console.log("[PDFTEST] PDF Generated for Task " + taskId + ". Size: " + blob_1.size + " bytes");
                                            if (blob_1.size < 5 * 1024) {
                                                console.warn("[PDFTEST] Warning: " + filename + " is unusually small (" + blob_1.size + " bytes). It may be blank.");
                                            }
                                            return [4 /*yield*/, new Promise(function (resolve, reject) {
                                                    var reader = new FileReader();
                                                    reader.onloadend = function () {
                                                        var result = reader.result;
                                                        var data = result.split(',')[1];
                                                        resolve(data);
                                                    };
                                                    reader.readAsDataURL(blob_1);
                                                })];
                                        case 4:
                                            base64Data = _l.sent();
                                            exportJobId = formContext.data.entity.getId().replace(/[{}]/g, "");
                                            note = {};
                                            note.subject = filename;
                                            note.filename = filename;
                                            note.isdocument = true;
                                            note.documentbody = base64Data;
                                            note.mimetype = "application/pdf";
                                            note["objectid_ts_workorderexportjob@odata.bind"] = "/ts_workorderexportjobs(" + exportJobId + ")";
                                            return [4 /*yield*/, Xrm.WebApi.createRecord("annotation", note)];
                                        case 5:
                                            _l.sent();
                                            renderedCount++;
                                            uploadedCount++;
                                            return [3 /*break*/, 7];
                                        case 6:
                                            taskError_1 = _l.sent();
                                            errorMessage = "Work Order: " + workOrderIdNoBraces + " - Work order service task: " + taskId + ":\n```\n" + (taskError_1.message || taskError_1.toString()) + "\n```";
                                            errors.push(errorMessage);
                                            console.error("[PDFTEST] Error processing task " + taskId + " for work order " + workOrderIdNoBraces + ":", taskError_1);
                                            return [3 /*break*/, 7];
                                        case 7: return [3 /*break*/, 9];
                                        case 8:
                                            skippedCount++;
                                            _l.label = 9;
                                        case 9: return [2 /*return*/];
                                    }
                                });
                            };
                            _e = 0, _f = tasks.entities;
                            _g.label = 9;
                        case 9:
                            if (!(_e < _f.length)) return [3 /*break*/, 12];
                            task = _f[_e];
                            return [5 /*yield**/, _loop_1(task)];
                        case 10:
                            _g.sent();
                            _g.label = 11;
                        case 11:
                            _e++;
                            return [3 /*break*/, 9];
                        case 12:
                            console.log("[PDFTEST] WO " + workOrderIdNoBraces + ": tasks=" + tasksTotal + ", rendered=" + renderedCount + ", uploaded=" + uploadedCount + ", skipped=" + skippedCount);
                            _g.label = 13;
                        case 13:
                            _i++;
                            return [3 /*break*/, 3];
                        case 14:
                            if (!(errors.length > 0)) return [3 /*break*/, 16];
                            // Set error status and message
                            formContext.getAttribute("statuscode").setValue(741130007);
                            errorMsgAttr = formContext.getAttribute("ts_errormessage");
                            if (errorMsgAttr) {
                                errorMsgAttr.setValue(errors.join("\n\n"));
                            }
                            formContext.ui.clearFormNotification("processing_notification");
                            return [4 /*yield*/, formContext.data.save()];
                        case 15:
                            _g.sent();
                            Xrm.Navigation.openAlertDialog({ text: "Export completed with " + errors.length + " error(s). Check error message field for details." });
                            return [3 /*break*/, 17];
                        case 16:
                            formContext.ui.setFormNotification("Finalizing export...", "INFO", "processing_notification");
                            formContext.getAttribute("statuscode").setValue(741130002);
                            formContext.data.save().then(function () {
                                formContext.ui.clearFormNotification("processing_notification");
                                formContext.data.refresh(false).then(function () {
                                    // Notification will be shown in onLoad after refresh
                                });
                            }, function (err) {
                                console.log("[PDFTEST] ERROR saving form: " + err);
                                throw err;
                            });
                            _g.label = 17;
                        case 17: return [3 /*break*/, 19];
                        case 18:
                            e_2 = _g.sent();
                            console.error("[PDFTEST] ERROR: ", e_2);
                            formContext.ui.clearFormNotification("processing_notification");
                            formContext.getAttribute("statuscode").setValue(741130007);
                            errorMsgAttr = formContext.getAttribute("ts_errormessage");
                            if (errorMsgAttr) {
                                errorMsgAttr.setValue(e_2.message || e_2.toString());
                            }
                            formContext.data.save();
                            Xrm.Navigation.openAlertDialog({ text: "Error processing export job: " + (e_2.message || e_2.toString()) });
                            return [3 /*break*/, 19];
                        case 19: return [2 /*return*/];
                    }
                });
            });
        }
        WorkOrderExportJob.onLoad = onLoad;
    })(WorkOrderExportJob = ROM.WorkOrderExportJob || (ROM.WorkOrderExportJob = {}));
})(ROM || (ROM = {}));
