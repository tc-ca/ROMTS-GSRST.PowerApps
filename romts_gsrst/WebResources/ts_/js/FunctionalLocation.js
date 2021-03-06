"use strict";
var ROM;
(function (ROM) {
    var FunctionalLocation;
    (function (FunctionalLocation) {
        function onLoad(eContext) {
            var form = eContext.getFormContext();
            var ownerAttribute = form.getAttribute("ownerid");
            if (ownerAttribute != null && ownerAttribute != undefined) {
                var ownerAttributeValue = ownerAttribute.getValue();
                if (ownerAttributeValue != null && ownerAttributeValue != undefined) {
                    Xrm.WebApi.retrieveRecord("systemuser", ownerAttributeValue[0].id.replace(/[{}]/g, ""), "?$select=_businessunitid_value").then(function success(result) {
                        Xrm.WebApi.retrieveRecord("businessunit", result._businessunitid_value, "?$select=name").then(function success(result) {
                            form.getAttribute("ts_businessunit").setValue(result.name);
                        }, function (error) {
                        });
                    }, function (error) {
                    });
                }
                //If site type is aerodrome, show ICAO and IATA fields
                //If Region is not International, show Class field
                var siteTypeAttribute = form.getAttribute("ts_sitetype");
                if (siteTypeAttribute != null) {
                    var siteTypeAttributeValue = form.getAttribute("ts_sitetype").getValue();
                    if (siteTypeAttributeValue != null) {
                        if (siteTypeAttributeValue[0].name == "Aerodrome") {
                            form.getControl("ts_icaocode").setVisible(true);
                            form.getControl("ts_iatacode").setVisible(true);
                            var regionAttributeValue = form.getAttribute("ts_region").getValue();
                            if (regionAttributeValue != null)
                                if (regionAttributeValue[0].name != "International") {
                                    form.getControl("ts_class").setVisible(true);
                                }
                        }
                    }
                }
                //If owner is ISSO, replace operations view
                if (ownerAttributeValue != null) {
                    if (ownerAttributeValue[0].name == "Intermodal Surface Security Oversight (ISSO)") {
                        var operationView = {
                            entityType: "savedquery",
                            id: "{4361bdce-d4ae-ec11-983e-002248ade910}",
                            name: "Active Operations ISSO"
                        };
                        form.getControl("Operations").getViewSelector().setCurrentView(operationView);
                    }
                }
            }
            if (form.getAttribute("ts_statusstartdate").getValue() != null) {
                form.getControl("ts_statusenddate").setDisabled(false);
                form.getControl("ts_description").setDisabled(false);
                form.getAttribute("ts_description").setRequiredLevel("required");
            }
        }
        FunctionalLocation.onLoad = onLoad;
        function onSave(eContext) {
            var form = eContext.getFormContext();
            var statusStartDateValue = form.getAttribute("ts_statusstartdate").getValue();
            var statusEndDateValue = form.getAttribute("ts_statusenddate").getValue();
            if (statusStartDateValue != null) {
                if (Date.parse(statusStartDateValue.toDateString()) <= Date.parse(new Date(Date.now()).toDateString())) {
                    form.getAttribute("ts_sitestatus").setValue(717750001 /* NonOperational */);
                }
            }
            if (statusEndDateValue != null) {
                if (Date.parse(statusEndDateValue.toDateString()) <= Date.parse(new Date(Date.now()).toDateString())) {
                    form.getAttribute("ts_sitestatus").setValue(717750000 /* Operational */);
                }
            }
        }
        FunctionalLocation.onSave = onSave;
        function siteTypeOnChange(eContext) {
            try {
                var form = eContext.getFormContext();
                var siteTypeAttribute = form.getAttribute("ts_sitetype");
                var icaoCodeAttribute = form.getAttribute("ts_icaocode");
                var iataCodeAttribute = form.getAttribute("ts_iatacode");
                var classAttribute = form.getAttribute("ts_class");
                if (siteTypeAttribute != null && siteTypeAttribute != undefined) {
                    var siteTypeAttributeValue = siteTypeAttribute.getValue();
                    if (siteTypeAttributeValue != null && siteTypeAttributeValue != undefined) {
                        if (siteTypeAttributeValue[0].id == "{99DA31E7-7D78-EB11-A812-0022486D697D}") { //aerodrome
                            form.getControl("ts_icaocode").setVisible(true);
                            form.getControl("ts_iatacode").setVisible(true);
                            var regionAttributeValue = form.getAttribute("ts_region").getValue();
                            if (regionAttributeValue != null) {
                                if (regionAttributeValue[0].name != "International") {
                                    form.getControl("ts_class").setVisible(true);
                                }
                                else {
                                    classAttribute.setValue() == null;
                                    form.getControl("ts_class").setVisible(false);
                                }
                            }
                            else {
                                form.getControl("ts_class").setVisible(true);
                            }
                        }
                        else {
                            icaoCodeAttribute.setValue() == null;
                            iataCodeAttribute.setValue() == null;
                            classAttribute.setValue() == null;
                            form.getControl("ts_icaocode").setVisible(false);
                            form.getControl("ts_iatacode").setVisible(false);
                            form.getControl("ts_class").setVisible(false);
                        }
                    }
                    else {
                        icaoCodeAttribute.setValue() == null;
                        iataCodeAttribute.setValue() == null;
                        classAttribute.setValue() == null;
                        form.getControl("ts_icaocode").setVisible(false);
                        form.getControl("ts_iatacode").setVisible(false);
                        form.getControl("ts_class").setVisible(false);
                    }
                }
            }
            catch (e) {
                throw new Error(e.Message);
            }
        }
        FunctionalLocation.siteTypeOnChange = siteTypeOnChange;
        function statusStartDateOnChange(eContext) {
            var form = eContext.getFormContext();
            if (form.getAttribute("ts_statusstartdate").getValue() != null) {
                form.getControl("ts_statusenddate").setDisabled(false);
                form.getControl("ts_description").setDisabled(false);
                form.getAttribute("ts_description").setRequiredLevel("required");
            }
            else {
                form.getAttribute("ts_description").setRequiredLevel("none");
                form.getAttribute("ts_description").setValue(null);
                form.getAttribute("ts_statusenddate").setValue(null);
                form.getControl("ts_statusenddate").setDisabled(true);
                form.getControl("ts_description").setDisabled(true);
            }
        }
        FunctionalLocation.statusStartDateOnChange = statusStartDateOnChange;
        function regionOnChange(eContext) {
            var form = eContext.getFormContext();
            var regionAttributeValue = form.getAttribute("ts_region").getValue();
            var classAttribute = form.getAttribute("ts_class");
            var siteTypeAttributeValue = form.getAttribute("ts_sitetype").getValue();
            if (siteTypeAttributeValue != null) {
                if (siteTypeAttributeValue[0].id == "{99DA31E7-7D78-EB11-A812-0022486D697D}")
                    if (regionAttributeValue != null) {
                        if (regionAttributeValue[0].name != "International") { //aerodrome and not International
                            form.getControl("ts_class").setVisible(true);
                        }
                        else {
                            classAttribute.setValue(null);
                            form.getControl("ts_class").setVisible(false);
                        }
                    }
                    else {
                        form.getControl("ts_class").setVisible(true);
                    }
            }
            else {
                classAttribute.setValue(null);
                form.getControl("ts_class").setVisible(false);
            }
        }
        FunctionalLocation.regionOnChange = regionOnChange;
    })(FunctionalLocation = ROM.FunctionalLocation || (ROM.FunctionalLocation = {}));
})(ROM || (ROM = {}));
