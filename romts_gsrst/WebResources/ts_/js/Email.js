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
    var Email;
    (function (Email) {
        function onLoad(eContext) {
            return __awaiter(this, void 0, void 0, function () {
                var formContext, regarding, workOrderId, caseId, conditionWorkOrderCase_1, conditionProgramTeam_1, ownerFetchXML, userId, currentUserBusinessUnitFetchXML, caseFetchXML, workOrderContactsFetchXML, operationalContactsfetchXML, viewOperationalContactId, layoutXmlContact, viewDisplayName;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            formContext = eContext.getFormContext();
                            regarding = formContext.getAttribute("regardingobjectid").getValue();
                            if (!(regarding !== null)) return [3 /*break*/, 3];
                            if (!(regarding[0].entityType === "msdyn_workorder")) return [3 /*break*/, 3];
                            workOrderId = regarding[0].id;
                            conditionWorkOrderCase_1 = "";
                            conditionProgramTeam_1 = "";
                            //Restrict To, CC, BCC fields with Contact and User Entity
                            formContext.getControl("to").setEntityTypes(['contact', 'systemuser']);
                            formContext.getControl("cc").setEntityTypes(['contact', 'systemuser']);
                            formContext.getControl("bcc").setEntityTypes(['contact', 'systemuser']);
                            ownerFetchXML = [
                                "<fetch>",
                                "<entity name='systemuser'>",
                                "<attribute name='systemuserid'/>",
                                "<attribute name='fullname'/>",
                                "<link-entity name='msdyn_workorder' from='owninguser' to='systemuserid' link-type='inner' alias='bm'>",
                                "<filter type='and'>",
                                "<condition attribute='msdyn_workorderid' operator='eq' value='", workOrderId, "'/>",
                                "</filter>",
                                "</link-entity>",
                                "</entity >",
                                "</fetch >"
                            ].join("");
                            ownerFetchXML = "?fetchXml=" + encodeURIComponent(ownerFetchXML);
                            Xrm.WebApi.online.retrieveMultipleRecords("systemuser", ownerFetchXML).then(function success(result) {
                                var lookup = new Array();
                                lookup[0] = new Object();
                                lookup[0].id = result.entities[0].ownerid;
                                lookup[0].name = result.entities[0].fullname;
                                lookup[0].entityType = "systemuser";
                                formContext.getAttribute("from").setValue(lookup);
                            });
                            userId = Xrm.Utility.getGlobalContext().userSettings.userId;
                            currentUserBusinessUnitFetchXML = [
                                "<fetch top='50'>",
                                "  <entity name='businessunit'>",
                                "    <attribute name='name' />",
                                "    <attribute name='businessunitid' />",
                                "    <link-entity name='systemuser' from='businessunitid' to='businessunitid'>",
                                "      <filter>",
                                "        <condition attribute='systemuserid' operator='eq' value='", userId, "'/>",
                                "      </filter>",
                                "    </link-entity>",
                                "  </entity>",
                                "</fetch>",
                            ].join("");
                            currentUserBusinessUnitFetchXML = "?fetchXml=" + encodeURIComponent(currentUserBusinessUnitFetchXML);
                            Xrm.WebApi.retrieveMultipleRecords("businessunit", currentUserBusinessUnitFetchXML).then(function (result) {
                                var userBusinessUnitName = result.entities[0].name;
                                if (userBusinessUnitName.startsWith("Aviation")) {
                                    conditionProgramTeam_1 = "<condition attribute='owningbusinessunitname' operator='like' value='Aviation%'/>";
                                }
                                if (userBusinessUnitName.startsWith("Intermodal")) {
                                    conditionProgramTeam_1 = "<condition attribute='owningbusinessunitname' operator='like' value='Intermodal%'/>";
                                }
                                if (userBusinessUnitName.startsWith("Transport")) {
                                    conditionProgramTeam_1 = "<condition attribute='owningbusinessunitname' operator='like' value='Aviation%'/><condition attribute='owningbusinessunitname' operator='like' value='Aviation%'/>";
                                }
                            });
                            caseFetchXML = [
                                "<fetch distinct='true'>",
                                "<entity name='incident'>",
                                "<attribute name='incidentid'/>",
                                "<order attribute='title' descending='false'/>",
                                "<link-entity name='msdyn_workorder' from='msdyn_servicerequest' to='incidentid' link-type='inner' alias='hs'>",
                                "<filter type='and'>",
                                "<condition attribute='msdyn_workorderid' operator='eq' value='", workOrderId, "'/>",
                                "</filter>",
                                "</link-entity>",
                                "</entity>",
                                "</fetch>"
                            ].join("");
                            caseFetchXML = "?fetchXml=" + encodeURIComponent(caseFetchXML);
                            return [4 /*yield*/, Xrm.WebApi.retrieveMultipleRecords("incident", caseFetchXML).then(function success(result) {
                                    caseId = result.entities[0].incidentid;
                                    //Retrieve Contacts related to Case
                                    var caseContactsFetchXML = [
                                        "<fetch distinct='true'>",
                                        "<entity name ='contact'>",
                                        "<attribute name='fullname'/>",
                                        "<attribute name='contactid'/>",
                                        "<link-entity name='ts_operationcontact' from='ts_contact' to='contactid' link-type='inner' alias='fj'>",
                                        "<filter type='or'>",
                                        conditionProgramTeam_1,
                                        "</filter>",
                                        "<link-entity name='ts_incident_ts_operationcontact' from='ts_operationcontactid' to='ts_operationcontactid' visible='false' intersect='true'>",
                                        "<link-entity name='incident' from='incidentid' to='incidentid' alias='fs'>",
                                        "<filter type='and'>",
                                        "<condition attribute='incidentid' operator='eq' value='", caseId, "'/>",
                                        "</filter>",
                                        "</link-entity>",
                                        "</link-entity>",
                                        "</link-entity>",
                                        "</entity>",
                                        "</fetch>"
                                    ].join("");
                                    caseContactsFetchXML = "?fetchXml=" + encodeURIComponent(caseContactsFetchXML);
                                    Xrm.WebApi.retrieveMultipleRecords("contact", caseContactsFetchXML).then(function (result) {
                                        result.entities.forEach(function (contact) {
                                            conditionWorkOrderCase_1 += "<condition attribute='contactid' operator='eq' value='" + contact.contactid + "'/>";
                                        });
                                    });
                                })];
                        case 1:
                            _a.sent();
                            workOrderContactsFetchXML = [
                                "<fetch distinct='true'>",
                                "<entity name ='contact'>",
                                "<attribute name='fullname'/>",
                                "<attribute name='contactid'/>",
                                "<link-entity name='ts_operationcontact' from='ts_contact' to='contactid' link-type='inner' alias='fj'>",
                                "<filter type='or'>",
                                conditionProgramTeam_1,
                                "</filter>",
                                "<link-entity name='ts_msdyn_workorder_ts_operationcontact' from='ts_operationcontactid' to='ts_operationcontactid' visible='false' intersect='true'>",
                                "<link-entity name='msdyn_workorder' from='msdyn_workorderid' to='msdyn_workorderid' alias='fk'>",
                                "<filter type='and'>",
                                "<condition attribute='msdyn_workorderid' operator='eq' value='", workOrderId, "'/>",
                                "</filter>",
                                "</link-entity>",
                                "</link-entity>",
                                "</link-entity>",
                                "</entity>",
                                "</fetch>"
                            ].join("");
                            workOrderContactsFetchXML = "?fetchXml=" + encodeURIComponent(workOrderContactsFetchXML);
                            return [4 /*yield*/, Xrm.WebApi.retrieveMultipleRecords("contact", workOrderContactsFetchXML).then(function (result) {
                                    result.entities.forEach(function (contact) {
                                        conditionWorkOrderCase_1 += "<condition attribute='contactid' operator='eq' value='" + contact.contactid + "'/>";
                                    });
                                })];
                        case 2:
                            _a.sent();
                            operationalContactsfetchXML = "<fetch distinct='false'><entity name='contact'><attribute name='fullname'/><attribute name='contactid'/><order attribute='fullname' descending='false'/><filter type='and'><filter type='or'>" + conditionWorkOrderCase_1 + "</filter></filter></entity></fetch>";
                            viewOperationalContactId = '{ed2e1b6b-2cb1-ec11-983e-002248adef00}';
                            layoutXmlContact = '<grid name="resultset" object="2" jump="lastname" select="1" icon="1" preview="1"><row name="result" id="contactid"><cell name="fullname" width="300"/></row></grid >';
                            viewDisplayName = "Contact";
                            formContext.getControl("to").addCustomView(viewOperationalContactId, "contact", viewDisplayName, operationalContactsfetchXML, layoutXmlContact, true);
                            formContext.getControl("cc").addCustomView(viewOperationalContactId, "contact", viewDisplayName, operationalContactsfetchXML, layoutXmlContact, true);
                            formContext.getControl("bcc").addCustomView(viewOperationalContactId, "contact", viewDisplayName, operationalContactsfetchXML, layoutXmlContact, true);
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        Email.onLoad = onLoad;
    })(Email = ROM.Email || (ROM.Email = {}));
})(ROM || (ROM = {}));