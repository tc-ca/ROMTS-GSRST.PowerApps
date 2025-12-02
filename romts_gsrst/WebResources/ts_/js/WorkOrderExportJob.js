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
        function onLoad(eContext) {
            return __awaiter(this, void 0, void 0, function () {
                var formContext, statusAttribute, status, wrControl, renderWindow_1, payloadAttr, ids, userSettings, locale_1, style, _i, ids_1, workOrderId, fetchOptions, tasks, validTaskFound, _loop_1, _a, _b, task, e_1, errorMsgAttr;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            formContext = eContext.getFormContext();
                            console.log("[PDFTEST] onLoad....");
                            statusAttribute = formContext.getAttribute("ts_processingstatus");
                            if (!statusAttribute)
                                return [2 /*return*/];
                            status = statusAttribute.getValue();
                            if (status !== 2) { // 2 = ClientProcessing
                                console.log("[PDFTEST] onLoad triggered for Processing. Status is not 2 (Current: " + status + ").");
                                return [2 /*return*/];
                            }
                            console.log("[PDFTEST] onLoad triggered for Processing. Status is 2.");
                            // 2. UX
                            formContext.ui.setFormNotification("Processing... Do not close.", "INFO", "processing_notification");
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 10, , 11]);
                            wrControl = formContext.getControl("WebResource_RenderHost");
                            if (!wrControl) {
                                throw new Error("WebResource_RenderHost control not found on form.");
                            }
                            renderWindow_1 = wrControl.getObject().contentWindow;
                            // 4. Dependency Check
                            if (!renderWindow_1 || typeof renderWindow_1.html2pdf === 'undefined') {
                                console.error("[PDFTEST] html2pdf missing in renderWindow object keys");
                                if (typeof renderWindow_1.html2pdf !== 'function') {
                                    Xrm.Navigation.openAlertDialog({ text: "Error: html2pdf library missing in WebResource_RenderHost." });
                                    formContext.ui.clearFormNotification("processing_notification");
                                    return [2 /*return*/];
                                }
                            }
                            payloadAttr = formContext.getAttribute("ts_payloadjson");
                            if (!payloadAttr || !payloadAttr.getValue()) {
                                throw new Error("No payload JSON found.");
                            }
                            ids = JSON.parse(payloadAttr.getValue());
                            console.log("[PDFTEST] Starting loop for " + ids.length + " Work Orders");
                            userSettings = Xrm.Utility.getGlobalContext().userSettings;
                            locale_1 = (userSettings.languageId === 1036) ? 'fr' : 'en';
                            console.log("[PDFTEST] Locale: " + locale_1);
                            // Inject CSS to hide buttons (Global)
                            if (renderWindow_1.document) {
                                style = renderWindow_1.document.createElement('style');
                                style.innerHTML = "\n                    .sv_nav, .sv_next_btn, .sv_prev_btn, .sv_complete_btn, .sv_preview_btn, .sv_progress { display: none !important; }\n                    .sv_p_root { padding-bottom: 0px !important; }\n                ";
                                renderWindow_1.document.head.appendChild(style);
                            }
                            _i = 0, ids_1 = ids;
                            _c.label = 2;
                        case 2:
                            if (!(_i < ids_1.length)) return [3 /*break*/, 9];
                            workOrderId = ids_1[_i];
                            console.log("[PDFTEST] Processing Work Order: " + workOrderId);
                            fetchOptions = "?$select=ovs_questionnairedefinition,ovs_questionnaireresponse&$filter=_msdyn_workorder_value eq " + workOrderId.replace(/[{}]/g, "");
                            return [4 /*yield*/, Xrm.WebApi.retrieveMultipleRecords("msdyn_workorderservicetask", fetchOptions)];
                        case 3:
                            tasks = _c.sent();
                            console.log("[PDFTEST] Data retrieved. Tasks found: " + tasks.entities.length);
                            validTaskFound = false;
                            _loop_1 = function (task) {
                                var taskId, def, resp, elementPrint, elementNormal, targetElement, targetId, surveyDef, firstPageElements_1, survey, filename, options, blob_1, base64Data, note;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            if (!(task.ovs_questionnairedefinition && task.ovs_questionnaireresponse)) return [3 /*break*/, 5];
                                            taskId = task.msdyn_workorderservicetaskid;
                                            console.log("[PDFTEST] Processing Task: " + taskId);
                                            def = task.ovs_questionnairedefinition;
                                            resp = task.ovs_questionnaireresponse;
                                            // ---------------------------------------------------------
                                            // RENDER LOGIC
                                            // ---------------------------------------------------------
                                            if (!renderWindow_1.Survey) {
                                                throw new Error("SurveyJS library missing in WebResource.");
                                            }
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
                                            if (!targetElement) {
                                                throw new Error("Target Element (#surveyElementPrint or #surveyElement) not found.");
                                            }
                                            surveyDef = JSON.parse(def);
                                            // logic: Move all elements to Page 0 and remove 'visibleIf' to show everything
                                            if (surveyDef.pages) {
                                                firstPageElements_1 = surveyDef.pages[0].elements || [];
                                                // Clean Page 0 elements
                                                firstPageElements_1.forEach(function (el) { el.visibleIf = null; });
                                                // Process subsequent pages
                                                surveyDef.pages.forEach(function (page, index) {
                                                    if (index >= 1) {
                                                        if (page.elements) {
                                                            page.elements.forEach(function (el) {
                                                                el.visibleIf = null; // Show hidden
                                                                firstPageElements_1.push(el); // Move to page 0
                                                            });
                                                        }
                                                    }
                                                });
                                                // Remove other pages
                                                surveyDef.pages = [surveyDef.pages[0]];
                                            }
                                            survey = new renderWindow_1.Survey.Model(surveyDef);
                                            survey.locale = locale_1;
                                            survey.mode = 'display';
                                            survey.data = JSON.parse(resp);
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
                                            if (renderWindow_1.jQuery && renderWindow_1.jQuery.fn.Survey) {
                                                renderWindow_1.jQuery(targetId).Survey({ model: survey });
                                            }
                                            else {
                                                survey.render(targetElement.id);
                                            }
                                            // Wait for rendering
                                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1500); })];
                                        case 1:
                                            // Wait for rendering
                                            _d.sent(); // Increased timeout for safety
                                            // ---------------------------------------------------------
                                            // FIX: Convert TextAreas to Divs
                                            // ---------------------------------------------------------
                                            if (renderWindow_1.jQuery) {
                                                renderWindow_1.jQuery("textarea").each(function (index, el) {
                                                    var val = renderWindow_1.jQuery(el).val();
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
                                            filename = "SURVEY_" + taskId + ".pdf";
                                            options = {
                                                margin: 0.5,
                                                filename: filename,
                                                image: { type: 'jpeg', quality: 0.98 },
                                                html2canvas: { scale: 2, useCORS: true },
                                                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                                            };
                                            return [4 /*yield*/, renderWindow_1.html2pdf().from(targetElement).set(options).output('blob')];
                                        case 2:
                                            blob_1 = _d.sent();
                                            console.log("[PDFTEST] PDF Generated for Task " + taskId + ". Size: " + blob_1.size + " bytes");
                                            if (blob_1.size < 1000) {
                                                console.warn("[PDFTEST] Warning: PDF size is very small. It might be blank.");
                                            }
                                            return [4 /*yield*/, new Promise(function (resolve, reject) {
                                                    var reader = new FileReader();
                                                    reader.onloadend = function () {
                                                        var result = reader.result;
                                                        var data = result.split(',')[1];
                                                        resolve(data);
                                                    };
                                                    reader.onerror = reject;
                                                    reader.readAsDataURL(blob_1);
                                                })];
                                        case 3:
                                            base64Data = _d.sent();
                                            note = {};
                                            note.subject = filename;
                                            note.filename = filename;
                                            note.documentbody = base64Data;
                                            note.mimetype = "application/pdf";
                                            note["objectid_ts_workorderexportjob@odata.bind"] = "/ts_workorderexportjobs(" + formContext.data.entity.getId().replace(/[{}]/g, "") + ")";
                                            return [4 /*yield*/, Xrm.WebApi.createRecord("annotation", note)];
                                        case 4:
                                            _d.sent();
                                            console.log("[PDFTEST] Uploaded Note for Task " + taskId);
                                            validTaskFound = true;
                                            _d.label = 5;
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            };
                            _a = 0, _b = tasks.entities;
                            _c.label = 4;
                        case 4:
                            if (!(_a < _b.length)) return [3 /*break*/, 7];
                            task = _b[_a];
                            return [5 /*yield**/, _loop_1(task)];
                        case 5:
                            _c.sent();
                            _c.label = 6;
                        case 6:
                            _a++;
                            return [3 /*break*/, 4];
                        case 7:
                            if (!validTaskFound) {
                                console.log("[PDFTEST] No valid questionnaire task found for WO: " + workOrderId);
                            }
                            _c.label = 8;
                        case 8:
                            _i++;
                            return [3 /*break*/, 2];
                        case 9:
                            // 6. Completion
                            console.log("[PDFTEST] All Work Orders processed.");
                            formContext.getAttribute("ts_processingstatus").setValue(3); // ReadyForServer
                            formContext.data.save().then(function () {
                                formContext.ui.clearFormNotification("processing_notification");
                                Xrm.Navigation.openAlertDialog({ text: "Batch Export Completed Successfully." });
                            }, function (err) { throw err; });
                            return [3 /*break*/, 11];
                        case 10:
                            e_1 = _c.sent();
                            console.error("[PDFTEST] ERROR: ", e_1);
                            formContext.ui.clearFormNotification("processing_notification");
                            formContext.getAttribute("ts_processingstatus").setValue(5); // Error
                            errorMsgAttr = formContext.getAttribute("ts_errormessage");
                            if (errorMsgAttr) {
                                errorMsgAttr.setValue(e_1.message || e_1.toString());
                            }
                            formContext.data.save();
                            Xrm.Navigation.openAlertDialog({ text: "Error processing export job: " + (e_1.message || e_1.toString()) });
                            return [3 /*break*/, 11];
                        case 11: return [2 /*return*/];
                    }
                });
            });
        }
        WorkOrderExportJob.onLoad = onLoad;
    })(WorkOrderExportJob = ROM.WorkOrderExportJob || (ROM.WorkOrderExportJob = {}));
})(ROM || (ROM = {}));
