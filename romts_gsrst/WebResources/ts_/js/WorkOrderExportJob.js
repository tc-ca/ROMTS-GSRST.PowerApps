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
         * Polls until element has text content, scroll height, or children.
         * @param targetElement Element to check
         * @param timeoutMs Maximum time to wait in milliseconds
         * @returns Promise that resolves when render is complete or timeout occurs
         */
        function waitForRender(targetElement, timeoutMs) {
            return __awaiter(this, void 0, void 0, function () {
                var startTime, pollInterval, minScrollHeight, checkCount;
                return __generator(this, function (_a) {
                    startTime = Date.now();
                    pollInterval = 100;
                    minScrollHeight = 50;
                    checkCount = 0;
                    return [2 /*return*/, new Promise(function (resolve) {
                            var checkRender = function () {
                                checkCount++;
                                var elapsed = Date.now() - startTime;
                                // Check if element has measurable content
                                var hasText = targetElement.innerText.trim().length > 0;
                                var hasHeight = targetElement.scrollHeight > minScrollHeight;
                                var hasChildren = targetElement.children.length > 0;
                                if (checkCount % 10 === 0 || hasText || hasHeight || hasChildren) {
                                    console.log("[PDFTEST] Render check #" + checkCount + " (" + elapsed + "ms): hasText=" + hasText + ", hasHeight=" + hasHeight + " (" + targetElement.scrollHeight + "px), hasChildren=" + hasChildren + " (" + targetElement.children.length + ")");
                                }
                                if (hasText || hasHeight || hasChildren) {
                                    console.log("[PDFTEST] Render complete after " + elapsed + "ms (" + checkCount + " checks).");
                                    resolve();
                                    return;
                                }
                                if (elapsed >= timeoutMs) {
                                    console.warn("[PDFTEST] Render timeout after " + timeoutMs + "ms (" + checkCount + " checks). Element may be blank. Continuing anyway.");
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
            var _a, _b;
            return __awaiter(this, void 0, void 0, function () {
                var formContext, statusAttribute, headerStatusAttribute, status, renderHostControl, renderWindow_1, payloadAttr, payloadValueRaw, payloadValue, rawPayload, ids, includeHiddenQuestions, userSettings, locale_1, cssId, style, _i, ids_1, workOrderId, workOrderIdNoBraces, fetchOptions, tasks, validTaskFound, _loop_1, _c, _d, task, e_1, errorMsgAttr;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            formContext = eContext.getFormContext();
                            console.log("[PDFTEST] onLoad triggered.");
                            // 1. Status Check
                            console.log("[PDFTEST] Checking statuscode or header_statuscode attribute...");
                            statusAttribute = formContext.getAttribute("statuscode");
                            headerStatusAttribute = formContext.getAttribute("header_ts_statuscode");
                            status = null;
                            if (statusAttribute) {
                                status = statusAttribute.getValue();
                                console.log("[PDFTEST] statuscode attribute found. Value: " + status);
                            }
                            else if (headerStatusAttribute) {
                                status = headerStatusAttribute.getValue();
                                console.log("[PDFTEST] header_statuscode attribute found. Value: " + status);
                            }
                            else {
                                console.log("[PDFTEST] ERROR: Neither statuscode nor header_statuscode attribute found. Exiting.");
                                return [2 /*return*/];
                            }
                            if (status !== 741130001) { // 741130001 = Client Processing - Questionnaire rendering and converting to PDF
                                console.log("[PDFTEST] Status is not 741130001 (got " + status + "). Skipping.");
                                return [2 /*return*/];
                            }
                            console.log("[PDFTEST] Status check passed (741130001).");
                            // 2. UX 
                            console.log("[PDFTEST] Setting form notification...");
                            formContext.ui.setFormNotification("Processing... Do not close.", "WARNING", "processing_notification");
                            _e.label = 1;
                        case 1:
                            _e.trys.push([1, 11, , 12]);
                            // 3. Host Access
                            console.log("[PDFTEST] Getting WebResource_RenderHost control...");
                            renderHostControl = formContext.getControl("WebResource_RenderHost");
                            if (!renderHostControl) {
                                console.log("[PDFTEST] ERROR: WebResource_RenderHost control not found on form.");
                                throw new Error("WebResource_RenderHost control not found on form.");
                            }
                            console.log("[PDFTEST] WebResource_RenderHost control found.");
                            // Get window reference (UCI API) - getContentWindow() already waits for the web resource to load
                            console.log("[PDFTEST] Getting render host content window...");
                            return [4 /*yield*/, renderHostControl.getContentWindow()];
                        case 2:
                            renderWindow_1 = _e.sent();
                            if (!renderWindow_1) {
                                console.log("[PDFTEST] ERROR: Unable to access render host content window.");
                                throw new Error("Render host content window not accessible.");
                            }
                            console.log("[PDFTEST] Render host content window retrieved successfully.");
                            // 4. Dependency Check
                            console.log("[PDFTEST] Checking html2pdf dependency...");
                            if (!renderWindow_1 || typeof renderWindow_1.html2pdf !== 'function') {
                                console.log("[PDFTEST] ERROR: renderWindow exists: " + !!renderWindow_1 + ", html2pdf is function: " + (typeof (renderWindow_1 === null || renderWindow_1 === void 0 ? void 0 : renderWindow_1.html2pdf) === 'function'));
                                formContext.ui.clearFormNotification("processing_notification");
                                Xrm.Navigation.openAlertDialog({ text: "Error: html2pdf library missing in WebResource_RenderHost." });
                                return [2 /*return*/];
                            }
                            console.log("[PDFTEST] html2pdf dependency check passed.");
                            // 5. The Loop (support legacy array or new { ids, includeHiddenQuestions } payload)
                            console.log("[PDFTEST] Getting ts_surveypayloadjson attribute...");
                            payloadAttr = formContext.getAttribute("ts_surveypayloadjson");
                            if (!payloadAttr) {
                                console.log("[PDFTEST] ERROR: ts_surveypayloadjson attribute not found.");
                                throw new Error("No payload JSON found.");
                            }
                            payloadValueRaw = payloadAttr.getValue();
                            console.log("[PDFTEST] Payload attribute found. Has value: " + !!payloadValueRaw + ", Type: " + typeof payloadValueRaw);
                            if (!payloadValueRaw) {
                                console.log("[PDFTEST] ERROR: Payload attribute has no value.");
                                throw new Error("No payload JSON found.");
                            }
                            payloadValue = payloadAttr.getValue();
                            console.log("[PDFTEST] Payload value length: " + ((payloadValue === null || payloadValue === void 0 ? void 0 : payloadValue.length) || 0));
                            // Ensure it's a string and trim whitespace/BOM
                            if (typeof payloadValue !== 'string') {
                                console.log("[PDFTEST] Converting payload from " + typeof payloadValue + " to string.");
                                payloadValue = String(payloadValue);
                            }
                            payloadValue = payloadValue.trim();
                            console.log("[PDFTEST] Payload after trim length: " + payloadValue.length);
                            // Check for empty before accessing charCodeAt
                            if (!payloadValue) {
                                console.log("[PDFTEST] ERROR: Payload JSON is empty after trim.");
                                throw new Error("Payload JSON is empty.");
                            }
                            // Remove BOM if present
                            if (payloadValue.charCodeAt(0) === 0xFEFF) {
                                console.log("[PDFTEST] Removing BOM from payload.");
                                payloadValue = payloadValue.slice(1);
                            }
                            console.log("[PDFTEST] Parsing payload JSON...");
                            rawPayload = void 0;
                            try {
                                rawPayload = JSON.parse(payloadValue);
                                console.log("[PDFTEST] Payload parsed successfully. Type: " + typeof rawPayload + ", IsArray: " + Array.isArray(rawPayload));
                            }
                            catch (parseError) {
                                console.log("[PDFTEST] ERROR: Failed to parse payload JSON: " + parseError.message);
                                throw new Error("Failed to parse payload JSON: " + parseError.message);
                            }
                            ids = [];
                            includeHiddenQuestions = false;
                            if (Array.isArray(rawPayload)) {
                                // Legacy behaviour: payload was just an array of GUIDs
                                ids = rawPayload;
                                console.log("[PDFTEST] Legacy payload format detected. Found " + ids.length + " work order IDs.");
                            }
                            else if (rawPayload && Array.isArray(rawPayload.ids)) {
                                ids = rawPayload.ids;
                                includeHiddenQuestions = !!rawPayload.includeHiddenQuestions;
                                console.log("[PDFTEST] New payload format detected. Found " + ids.length + " work order IDs. includeHiddenQuestions: " + includeHiddenQuestions);
                            }
                            else {
                                console.log("[PDFTEST] ERROR: Invalid payload format. Type: " + typeof rawPayload + ", Has ids: " + !!(rawPayload === null || rawPayload === void 0 ? void 0 : rawPayload.ids) + ", ids is array: " + Array.isArray(rawPayload === null || rawPayload === void 0 ? void 0 : rawPayload.ids));
                                throw new Error("Invalid payload JSON format. Expected array or object with 'ids' property. Got: " + typeof rawPayload);
                            }
                            // Determine Locale
                            console.log("[PDFTEST] Determining locale...");
                            userSettings = Xrm.Utility.getGlobalContext().userSettings;
                            locale_1 = (userSettings.languageId === 1036) ? 'fr' : 'en';
                            console.log("[PDFTEST] Locale set to: " + locale_1 + " (languageId: " + userSettings.languageId + ")");
                            // Inject CSS to hide buttons (Global)
                            console.log("[PDFTEST] Injecting CSS to hide buttons...");
                            if (renderWindow_1.document) {
                                cssId = "ts-survey-pdf-css";
                                if (!renderWindow_1.document.getElementById(cssId)) {
                                    console.log("[PDFTEST] Adding CSS style element.");
                                    style = renderWindow_1.document.createElement("style");
                                    style.id = cssId;
                                    style.innerHTML = "\n                    .sv_nav,\n                    .sv_next_btn,\n                    .sv_prev_btn,\n                    .sv_complete_btn,\n                    .sv_preview_btn,\n                    .sv_progress {\n                      display: none !important;\n                    }\n              \n                    .sv_p_root {\n                      padding-bottom: 0px !important;\n                    }\n                  ";
                                    renderWindow_1.document.head.appendChild(style);
                                }
                                else {
                                    console.log("[PDFTEST] CSS already injected.");
                                }
                            }
                            else {
                                console.log("[PDFTEST] WARNING: renderWindow.document not available.");
                            }
                            console.log("[PDFTEST] Starting loop for " + ids.length + " work order(s)...");
                            _i = 0, ids_1 = ids;
                            _e.label = 3;
                        case 3:
                            if (!(_i < ids_1.length)) return [3 /*break*/, 10];
                            workOrderId = ids_1[_i];
                            workOrderIdNoBraces = workOrderId.replace(/[{}]/g, "");
                            console.log("[PDFTEST] Processing Work Order: " + workOrderIdNoBraces);
                            fetchOptions = "?$select=msdyn_workorderservicetaskid,ovs_questionnairedefinition,ovs_questionnaireresponse" +
                                "&$filter=_msdyn_workorder_value eq " + workOrderIdNoBraces;
                            console.log("[PDFTEST] Fetching tasks with query: " + fetchOptions);
                            return [4 /*yield*/, Xrm.WebApi.retrieveMultipleRecords("msdyn_workorderservicetask", fetchOptions)];
                        case 4:
                            tasks = _e.sent();
                            console.log("[PDFTEST] Found " + tasks.entities.length + " task(s) for Work Order " + workOrderIdNoBraces);
                            validTaskFound = false;
                            // Loop through ALL tasks for the Work Order
                            console.log("[PDFTEST] Looping through " + tasks.entities.length + " task(s)...");
                            _loop_1 = function (task) {
                                var taskId, def, resp, elementPrint, elementNormal, targetElement, targetId, surveyDef, _f, _g, page, els, _h, els_1, el, survey, textareaCount, filename, options, blob_1, base64Data, exportJobId, note;
                                return __generator(this, function (_j) {
                                    switch (_j.label) {
                                        case 0:
                                            taskId = ((_a = task.msdyn_workorderservicetaskid) === null || _a === void 0 ? void 0 : _a.replace(/[{}]/g, "")) || "unknown";
                                            console.log("[PDFTEST] Checking task " + taskId + "...");
                                            console.log("[PDFTEST] Task has definition: " + !!task.ovs_questionnairedefinition + ", has response: " + !!task.ovs_questionnaireresponse);
                                            if (!(task.ovs_questionnairedefinition && task.ovs_questionnaireresponse)) return [3 /*break*/, 5];
                                            def = task.ovs_questionnairedefinition;
                                            resp = task.ovs_questionnaireresponse;
                                            console.log("[PDFTEST] Task " + taskId + " is valid. Definition length: " + ((def === null || def === void 0 ? void 0 : def.length) || 0) + ", Response length: " + ((resp === null || resp === void 0 ? void 0 : resp.length) || 0));
                                            // ---------------------------------------------------------
                                            // RENDER LOGIC
                                            // ---------------------------------------------------------
                                            console.log("[PDFTEST] Checking for SurveyJS library...");
                                            if (!renderWindow_1.Survey) {
                                                console.log("[PDFTEST] ERROR: SurveyJS library missing in WebResource.");
                                                throw new Error("SurveyJS library missing in WebResource.");
                                            }
                                            console.log("[PDFTEST] SurveyJS library found.");
                                            // Reset Globals
                                            console.log("[PDFTEST] Resetting globals...");
                                            renderWindow_1.operationList = [];
                                            renderWindow_1.activityTypeOperationTypeIdsList = [];
                                            renderWindow_1.questionsOnly = false;
                                            // Clear Previous DOM
                                            console.log("[PDFTEST] Clearing previous DOM...");
                                            if (renderWindow_1.jQuery) {
                                                renderWindow_1.jQuery("#surveyElementPrint").empty();
                                                renderWindow_1.jQuery("#surveyElement").empty();
                                                console.log("[PDFTEST] DOM cleared using jQuery.");
                                            }
                                            else {
                                                console.log("[PDFTEST] WARNING: jQuery not available.");
                                            }
                                            // Target Element
                                            console.log("[PDFTEST] Finding target element...");
                                            elementPrint = renderWindow_1.document.getElementById("surveyElementPrint");
                                            elementNormal = renderWindow_1.document.getElementById("surveyElement");
                                            targetElement = elementPrint || elementNormal;
                                            targetId = elementPrint ? "#surveyElementPrint" : "#surveyElement";
                                            console.log("[PDFTEST] Target element found: " + !!targetElement + ", ID: " + targetId);
                                            if (!targetElement) {
                                                console.log("[PDFTEST] ERROR: Target Element not found.");
                                                throw new Error("Target Element (#surveyElementPrint or #surveyElement) not found.");
                                            }
                                            // 1. Parse & Flatten Definition (Single Page)
                                            console.log("[PDFTEST] Parsing survey definition...");
                                            if (!def || typeof def !== 'string' || def.trim() === '') {
                                                console.log("[PDFTEST] Skipping task " + taskId + ": Invalid definition (type: " + typeof def + ", empty: " + (!def || def.trim() === '') + ")");
                                                return [2 /*return*/, "continue"];
                                            }
                                            surveyDef = void 0;
                                            try {
                                                surveyDef = JSON.parse(def.trim());
                                                console.log("[PDFTEST] Survey definition parsed. Pages: " + (((_b = surveyDef.pages) === null || _b === void 0 ? void 0 : _b.length) || 0));
                                            }
                                            catch (parseError) {
                                                console.log("[PDFTEST] ERROR parsing survey definition for task " + taskId + ": " + parseError.message);
                                                return [2 /*return*/, "continue"];
                                            }
                                            // Ensure surveyDef.pages exists and has at least one page
                                            if (!Array.isArray(surveyDef.pages) || surveyDef.pages.length === 0) {
                                                surveyDef.pages = [{ elements: [] }];
                                            }
                                            // If includeHiddenQuestions is true: clear visibleIf on ALL elements on ALL pages
                                            // If false: do nothing (keep original visibleIf)
                                            if (includeHiddenQuestions) {
                                                for (_f = 0, _g = surveyDef.pages; _f < _g.length; _f++) {
                                                    page = _g[_f];
                                                    els = page === null || page === void 0 ? void 0 : page.elements;
                                                    if (!Array.isArray(els))
                                                        continue;
                                                    for (_h = 0, els_1 = els; _h < els_1.length; _h++) {
                                                        el = els_1[_h];
                                                        el.visibleIf = null;
                                                    }
                                                }
                                            }
                                            // 2. Create Model
                                            console.log("[PDFTEST] Creating Survey model...");
                                            survey = new renderWindow_1.Survey.Model(surveyDef);
                                            survey.locale = locale_1;
                                            survey.mode = 'display';
                                            console.log("[PDFTEST] Survey model created. Locale: " + locale_1 + ", Mode: display");
                                            // Parse response - allow null/empty (survey will just show empty)
                                            console.log("[PDFTEST] Parsing survey response...");
                                            if (resp && typeof resp === 'string' && resp.trim() !== '') {
                                                try {
                                                    survey.data = JSON.parse(resp.trim());
                                                    console.log("[PDFTEST] Survey response parsed successfully.");
                                                }
                                                catch (parseError) {
                                                    console.log("[PDFTEST] WARNING: Failed to parse response, using empty data: " + parseError.message);
                                                    // Continue with empty data rather than failing
                                                    survey.data = {};
                                                }
                                            }
                                            else {
                                                console.log("[PDFTEST] No response data, using empty object.");
                                                survey.data = {};
                                            }
                                            survey.showCompletedPage = false;
                                            survey.showProgressBar = 'off'; // Hide progress bar
                                            console.log("[PDFTEST] Survey configured (no completed page, no progress bar).");
                                            // 3. Event Handlers (Replicating surveyRenderPrint.js)
                                            console.log("[PDFTEST] Setting up event handlers...");
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
                                            console.log("[PDFTEST] Rendering survey...");
                                            if (renderWindow_1.jQuery && renderWindow_1.jQuery.fn.Survey) {
                                                console.log("[PDFTEST] Using jQuery Survey plugin to render.");
                                                renderWindow_1.jQuery(targetId).Survey({ model: survey });
                                            }
                                            else {
                                                console.log("[PDFTEST] Using Survey.render() method.");
                                                survey.render(targetElement.id);
                                            }
                                            // Wait for rendering with polling
                                            console.log("[PDFTEST] Waiting for render to complete (max 10s)...");
                                            return [4 /*yield*/, waitForRender(targetElement, 10000)];
                                        case 1:
                                            _j.sent();
                                            console.log("[PDFTEST] Render wait completed.");
                                            // ---------------------------------------------------------
                                            // FIX: Convert TextAreas to Divs
                                            // ---------------------------------------------------------
                                            console.log("[PDFTEST] Converting textareas to divs...");
                                            if (renderWindow_1.jQuery) {
                                                textareaCount = renderWindow_1.jQuery("textarea").length;
                                                console.log("[PDFTEST] Found " + textareaCount + " textarea(s) to convert.");
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
                                                console.log("[PDFTEST] Textareas converted.");
                                            }
                                            else {
                                                console.log("[PDFTEST] WARNING: jQuery not available, skipping textarea conversion.");
                                            }
                                            filename = "WO_" + workOrderIdNoBraces + "_SURVEY_" + taskId + ".pdf";
                                            console.log("[PDFTEST] Generating PDF: " + filename);
                                            options = {
                                                margin: 0.5,
                                                filename: filename,
                                                image: { type: 'png', quality: 0.98 },
                                                html2canvas: { scale: 1, useCORS: true },
                                                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                                            };
                                            console.log("[PDFTEST] PDF options configured. Starting html2pdf conversion...");
                                            return [4 /*yield*/, renderWindow_1.html2pdf().from(targetElement).set(options).output('blob')];
                                        case 2:
                                            blob_1 = _j.sent();
                                            console.log("[PDFTEST] PDF Generated for Task " + taskId + ". Size: " + blob_1.size + " bytes");
                                            if (blob_1.size < 5 * 1024) {
                                                console.warn("[PDFTEST] Warning: " + filename + " is unusually small (" + blob_1.size + " bytes). It may be blank.");
                                            }
                                            // ---------------------------------------------------------
                                            // UPLOAD
                                            // ---------------------------------------------------------
                                            console.log("[PDFTEST] Converting blob to base64...");
                                            return [4 /*yield*/, new Promise(function (resolve, reject) {
                                                    var reader = new FileReader();
                                                    reader.onloadend = function () {
                                                        var result = reader.result;
                                                        var data = result.split(',')[1];
                                                        console.log("[PDFTEST] Base64 conversion complete. Length: " + data.length);
                                                        resolve(data);
                                                    };
                                                    reader.onerror = function (err) {
                                                        console.log("[PDFTEST] ERROR converting to base64: " + err);
                                                        reject(err);
                                                    };
                                                    reader.readAsDataURL(blob_1);
                                                })];
                                        case 3:
                                            base64Data = _j.sent();
                                            exportJobId = formContext.data.entity.getId().replace(/[{}]/g, "");
                                            console.log("[PDFTEST] Creating annotation record. Export Job ID: " + exportJobId);
                                            note = {};
                                            note.subject = filename;
                                            note.filename = filename;
                                            note.isdocument = true;
                                            note.documentbody = base64Data;
                                            note.mimetype = "application/pdf";
                                            note["objectid_ts_workorderexportjob@odata.bind"] = "/ts_workorderexportjobs(" + exportJobId + ")";
                                            return [4 /*yield*/, Xrm.WebApi.createRecord("annotation", note)];
                                        case 4:
                                            _j.sent();
                                            console.log("[PDFTEST] Uploaded Note for Task " + taskId);
                                            validTaskFound = true;
                                            console.log("[PDFTEST] Task " + taskId + " processed successfully.");
                                            return [3 /*break*/, 6];
                                        case 5:
                                            console.log("[PDFTEST] Task " + taskId + " skipped (missing definition or response).");
                                            _j.label = 6;
                                        case 6: return [2 /*return*/];
                                    }
                                });
                            };
                            _c = 0, _d = tasks.entities;
                            _e.label = 5;
                        case 5:
                            if (!(_c < _d.length)) return [3 /*break*/, 8];
                            task = _d[_c];
                            return [5 /*yield**/, _loop_1(task)];
                        case 6:
                            _e.sent();
                            _e.label = 7;
                        case 7:
                            _c++;
                            return [3 /*break*/, 5];
                        case 8:
                            if (!validTaskFound) {
                                console.log("[PDFTEST] No valid questionnaire task found for WO: " + workOrderId);
                            }
                            else {
                                console.log("[PDFTEST] Work Order " + workOrderIdNoBraces + " completed successfully.");
                            }
                            _e.label = 9;
                        case 9:
                            _i++;
                            return [3 /*break*/, 3];
                        case 10:
                            // 6. Completion
                            console.log("[PDFTEST] All Work Orders processed. Updating status...");
                            formContext.ui.clearFormNotification("processing_notification");
                            formContext.getAttribute("statuscode").setValue(741130002); // Ready For Server
                            console.log("[PDFTEST] Saving form...");
                            formContext.data.save().then(function () {
                                console.log("[PDFTEST] Form saved successfully. Showing success dialog.");
                                Xrm.Navigation.openAlertDialog({ text: "Batch Export Completed Successfully." });
                            }, function (err) {
                                console.log("[PDFTEST] ERROR saving form: " + err);
                                throw err;
                            });
                            return [3 /*break*/, 12];
                        case 11:
                            e_1 = _e.sent();
                            console.error("[PDFTEST] ERROR: ", e_1);
                            formContext.ui.clearFormNotification("processing_notification");
                            formContext.getAttribute("statuscode").setValue(741130005); // Error
                            errorMsgAttr = formContext.getAttribute("ts_errormessage");
                            if (errorMsgAttr) {
                                errorMsgAttr.setValue(e_1.message || e_1.toString());
                            }
                            formContext.data.save();
                            Xrm.Navigation.openAlertDialog({ text: "Error processing export job: " + (e_1.message || e_1.toString()) });
                            return [3 /*break*/, 12];
                        case 12: return [2 /*return*/];
                    }
                });
            });
        }
        WorkOrderExportJob.onLoad = onLoad;
    })(WorkOrderExportJob = ROM.WorkOrderExportJob || (ROM.WorkOrderExportJob = {}));
})(ROM || (ROM = {}));
