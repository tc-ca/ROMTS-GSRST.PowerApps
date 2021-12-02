"use strict";
var ROM;
(function (ROM) {
    var Operation;
    (function (Operation) {
        function siteOnChange(eContext) {
            var form = eContext.getFormContext();
            var siteAttribute = form.getAttribute("ts_site");
            if (siteAttribute != null) {
                var siteAttributeValue = siteAttribute.getValue();
                // Enable subsite field with appropriate filtered view if site selected
                if (siteAttributeValue != null && siteAttributeValue != undefined) {
                    form.getControl('ts_subsite').setDisabled(false);
                    var viewId = '{6A59549F-F162-5128-4711-79BC929540C3}';
                    var entityName = "msdyn_functionallocation";
                    var viewDisplayName = "Filtered Sites";
                    var activityTypeFetchXml = '<fetch no-lock="false"><entity name="msdyn_functionallocation"><attribute name="statecode"/><attribute name="msdyn_functionallocationid"/><attribute name="msdyn_name"/><filter><condition attribute="msdyn_functionallocationid" operator="under" value="' + siteAttributeValue[0].id + '"/></filter><order attribute="msdyn_name" descending="false"/></entity></fetch>';
                    var layoutXml = '<grid name="resultset" object="10010" jump="msdyn_name" select="1" icon="1" preview="1"><row name="result" id="msdyn_functionallocationid"><cell name="msdyn_name" width="200" /></row></grid>';
                    form.getControl("ts_subsite").addCustomView(viewId, entityName, viewDisplayName, activityTypeFetchXml, layoutXml, true);
                }
                else {
                    form.getControl('ts_subsite').setDisabled(true);
                }
            }
        }
        Operation.siteOnChange = siteOnChange;
        function operationStatusOnChange(eContext) {
            var form = eContext.getFormContext();
            var operationStatusAttribute = form.getAttribute("ts_operationstatus");
            var startDateAttribute = form.getAttribute("ts_startdate");
            var endDateAttribute = form.getAttribute("ts_enddate");
            var operationTypeAttribute = form.getAttribute("ovs_operationtypeid");
            var stakeholderAttribute = form.getAttribute("ts_stakeholder");
            var siteAttribute = form.getAttribute("ts_site");
            if (operationStatusAttribute != null) {
                var operationStatusAttributeValue = operationStatusAttribute.getValue();
                var startDateAttributeValue = startDateAttribute.getValue();
                var endDateAttributeValue = endDateAttribute.getValue();
                if (operationStatusAttributeValue != null && operationStatusAttributeValue != undefined) {
                    if (operationStatusAttributeValue == 717750001) {
                        form.getAttribute("ts_startdate").setRequiredLevel("required");
                    }
                    else {
                        form.getAttribute("ts_startdate").setRequiredLevel("none");
                    }
                }
            }
        }
        Operation.operationStatusOnChange = operationStatusOnChange;
        function endDateChanged(eContext) {
            var form = eContext.getFormContext();
            var operationStatusAttribute = form.getAttribute("ts_operationstatus");
            var startDateAttribute = form.getAttribute("ts_startdate");
            var endDateAttribute = form.getAttribute("ts_enddate");
            var operationTypeAttribute = form.getAttribute("ovs_operationtypeid");
            var stakeholderAttribute = form.getAttribute("ts_stakeholder");
            var siteAttribute = form.getAttribute("ts_site");
            var startDateAttributeValue = startDateAttribute.getValue();
            var endDateAttributeValue = endDateAttribute.getValue();
            if (endDateAttribute != null) {
                var endDateAttributeValue_1 = endDateAttribute.getValue();
                if (endDateAttributeValue_1 != null && endDateAttributeValue_1 != undefined) {
                    var operationTypeAttributeValue = operationTypeAttribute.getValue();
                    var stakeholderAttributeValue = stakeholderAttribute.getValue();
                    var siteAttributeValue = siteAttribute.getValue();
                    if (siteAttributeValue != null && siteAttributeValue != undefined &&
                        stakeholderAttributeValue != null && stakeholderAttributeValue != undefined &&
                        operationTypeAttributeValue != null && operationTypeAttributeValue != undefined &&
                        endDateAttributeValue_1 != null && endDateAttributeValue_1 != undefined) {
                        var fetchXml = '<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false"><entity name="ovs_operation"><attribute name="ovs_name"/><attribute name="ts_stakeholder"/><attribute name="ts_site"/><attribute name="ovs_operationid"/><order attribute="ovs_name" descending="true"/><filter type="and"><condition attribute="ovs_operationtypeid" operator="eq" value="' + operationTypeAttributeValue[0].id + '"/><condition attribute="ts_site" operator="eq" value="' + siteAttributeValue[0].id + '"/><condition attribute="ts_stakeholder" operator="eq" value="' + stakeholderAttributeValue[0].id + '"/></filter></entity></fetch>';
                        var encodedFetchXml = encodeURIComponent(fetchXml);
                        Xrm.WebApi.retrieveMultipleRecords("ovs_operation", "?fetchXml=" + encodedFetchXml).then(function success(result) {
                            if (result.entities.length > 0) {
                                for (var i = 0; i < result.entities.length; i++) {
                                    if (endDateAttributeValue_1 < result.entities[i].ts_workorderenddate) {
                                        var alertStrings = { text: "There exist Work Orders and/or Cases that exist after the specified end date (" + endDateAttributeValue_1 + " ). They must be resolved first before the status of the Operation can be changed." };
                                        var alertOptions = { height: 120, width: 260 };
                                        Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(function () { });
                                    }
                                }
                            }
                        }, function (error) {
                        });
                    }
                }
            }
        }
        Operation.endDateChanged = endDateChanged;
    })(Operation = ROM.Operation || (ROM.Operation = {}));
})(ROM || (ROM = {}));
