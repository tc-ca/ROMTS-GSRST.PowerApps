"use strict";
/* eslint-disable @typescript-eslint/triple-slash-reference */
var ROM;
(function (ROM) {
    var IncidentQuickCreate;
    (function (IncidentQuickCreate) {
        // EVENTS
        function onLoad(eContext) {
            var form = eContext.getFormContext();
            switch (form.ui.getFormType()) {
                //Create
                case 1:
                    setRegion(eContext);
                    break;
            }
        }
        IncidentQuickCreate.onLoad = onLoad;
        function regionOnChange(eContext) {
            try {
                var form = eContext.getFormContext();
                var regionAttribute = form.getAttribute("ovs_region");
                var countryAttribute = form.getAttribute("ovs_countryid");
                if (regionAttribute != null && regionAttribute != undefined) {
                    var regionAttributeValue = regionAttribute.getValue();
                    if (regionAttributeValue != null && regionAttributeValue != undefined) {
                        if (regionAttributeValue[0].name == "International") {
                            form.getControl("ovs_countryid").setVisible(true);
                        }
                    }
                    else {
                        form.getControl("ovs_countryid").setVisible(false);
                    }
                }
            }
            catch (e) {
                throw new Error(e.Message);
            }
        }
        IncidentQuickCreate.regionOnChange = regionOnChange;
        // FUNCTIONS
        function setRegion(eContext) {
            var currentUserId = Xrm.Utility.getGlobalContext().userSettings.userId;
            currentUserId = currentUserId.replace(/[{}]/g, "");
            // Get the user's territory
            Xrm.WebApi.online.retrieveRecord("systemuser", currentUserId, "?$select=_territoryid_value").then(function success(result) {
                var form = eContext.getFormContext();
                if (result != null && result["_territoryid_value"] != null) {
                    // NOTE: Our localization plugin can't localize the territory name on system user
                    // So we do an extra call to the territory table to get the localized name
                    Xrm.WebApi.online.retrieveRecord("territory", result["_territoryid_value"], "?$select=name").then(function success(result) {
                        var territoryId = result["territoryid"];
                        var territoryName = result["name"];
                        var territoryLogicalName = "territory";
                        var lookup = new Array();
                        lookup[0] = new Object();
                        lookup[0].id = territoryId;
                        lookup[0].name = territoryName;
                        lookup[0].entityType = territoryLogicalName;
                        form.getAttribute('ovs_region').setValue(lookup);
                        if (lookup[0].name == "International") {
                            form.getControl("ovs_countryid").setVisible(true);
                        }
                        else {
                            regionOnChange(eContext);
                        }
                    }, function (error) {
                        var alertStrings = { text: error.message };
                        var alertOptions = { height: 120, width: 260 };
                        Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(function () { });
                    });
                }
            }, function (error) {
                var alertStrings = { text: error.message };
                var alertOptions = { height: 120, width: 260 };
                Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(function () { });
            });
        }
    })(IncidentQuickCreate = ROM.IncidentQuickCreate || (ROM.IncidentQuickCreate = {}));
})(ROM || (ROM = {}));
