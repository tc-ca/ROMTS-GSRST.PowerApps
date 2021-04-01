///<reference path="../../Utilities/GlobalHelper.js"/>
///<reference path="../../Utilities/questionnaireFunctions.js"/>
var QuickCreateHelper = QuickCreateHelper || {};
window.top.QuickCreateHelper = QuickCreateHelper;

var WO_TDG_main = (function (window, document) {

    //variables
    var formType;
    var userSettings;
    var globalObj = window.top.QuickCreateHelper;

    //********************private methods*******************


    //********************private methods end***************

    //********************public methods***************
    return {


        OnLoad: function (executionContext) {

            var formContext = executionContext.getFormContext();

            userSettings = Xrm.Utility.getGlobalContext().userSettings;

            // 0 = Undefined, 1 = Create, 2 = Update, 3 = Read Only, 4 = Disabled, 6 = Bulk Edit
            formType = glHelper.GetFormType(formContext);
            //site
            //msdyn_serviceaccount
            var site = formContext.getAttribute("msdyn_serviceaccount");
            site.removeOnChange(WO_TDG_main.Site_OnChange); // avoid binding multiple event handlers
            site.addOnChange(WO_TDG_main.Site_OnChange);

            //site type
            var sActivity = formContext.getAttribute("ovs_oversighttype");
            sActivity.removeOnChange(WO_TDG_main.ActivityType_OnChange); // avoid binding multiple event handlers
            sActivity.addOnChange(WO_TDG_main.ActivityType_OnChange);
            //rational
            var rational = formContext.getAttribute("ovs_rational");
            rational.removeOnChange(WO_TDG_main.Rational_OnChange);
            rational.addOnChange(WO_TDG_main.Rational_OnChange);
            rational.fireOnChange();
            //fiscal year and quoter
            var fy = formContext.getAttribute("ovs_fiscalyear");
            fy.removeOnChange(WO_TDG_main.FiscalYearOnchange);
            fy.addOnChange(WO_TDG_main.FiscalYearOnchange);
            //wo status
            var systemStatus = formContext.getAttribute("msdyn_systemstatus");
            systemStatus.removeOnChange(WO_TDG_main.WO_SystemStatus_OnChange);
            systemStatus.addOnChange(WO_TDG_main.WO_SystemStatus_OnChange);
            ////statecode
            //var stateCode = formContext.getAttribute("statecode");
            //stateCode.removeOnChange(WO_TDG_main.StateCode_OnChange);
            //stateCode.addOnChange(WO_TDG_main.StateCode_OnChange);


            //on create
            if (formType == 1) {

                //region
                WO_TDG_main.SetRegion(formContext);
                //fiscal year
                WO_TDG_main.SetDefaultFiscalYear(formContext);
            }

            //on update etc
            if (formType > 1) {
                sActivity.fireOnChange();

                //set global object fo contact quick create form
                site.fireOnChange();
            }
        },

        Site_OnChange: function (executionContext) {

            var formContext = executionContext.getFormContext();
            var site = formContext.getAttribute("msdyn_serviceaccount").getValue()[0];

            globalObj.site = {};
            globalObj.site.id = site.id;
            globalObj.site.et = site.entityType;
            globalObj.site.name = site.name;

        },

        ActivityType_OnChange: function (executionContext) {

            var formContext = executionContext.getFormContext();

            var sActivityName = glHelper.GetLookupName(formContext, "ovs_oversighttype");
            formContext.getAttribute("ovs_siteofviolation").setSubmitMode("always");

            //if Oversight Activity = Consignment.
            if (sActivityName == "Consignment") {
                //make site of Consignment Activity visible and manadatory
                glHelper.SetControlVisibility(formContext, "ovs_siteofviolation", true);
                glHelper.SetRequiredLevel(formContext, "ovs_siteofviolation", true);
            } else {
                //else => clean and hide
                glHelper.SetRequiredLevel(formContext, "ovs_siteofviolation", false);
                glHelper.SetValue(formContext, "ovs_siteofviolation", null);
                glHelper.SetControlVisibility(formContext, "ovs_siteofviolation", false);
            }
        },

        Rational_OnChange: function (executionContext) {

            var globalContext = Xrm.Utility.getGlobalContext();
            var formContext = executionContext.getFormContext();
            //get current rational
            var rational = glHelper.GetLookupName(formContext, "ovs_rational");
            var isPlanned = rational == "Planned";

            //set fields based on app
            globalContext.getCurrentAppName().then(function (appName) {

                var readOnlyArray = new Array();
                var editableArray = new Array();

                if (appName == "TDG Analytics") return;

                if (formType == 1) {
                    //set Rational to default "Unplanned" for Manager or Inspector  and lock readonly!

                    //get rational "ovs_rational" , check it it has french option
                    if (appName == "TDG Management" || appName == "TDG Inspections") {

                        Xrm.WebApi.online.retrieveMultipleRecords("ovs_tyrational", "?$select=ovs_name,ovs_rationalelbl,ovs_rationalflbl,ovs_tyrationalid&$filter=startswith(ovs_name,'Unplanned')").then(
                            function success(results) {
                                var ovs_name = results.entities[0]["ovs_name"];
                                var ovs_rationalelbl = results.entities[0]["ovs_rationalelbl"];
                                var ovs_rationalflbl = results.entities[0]["ovs_rationalflbl"];
                                var ovs_tyrationalid = results.entities[0]["ovs_tyrationalid"];

                                if (userSettings.languageId == 1036)
                                    glHelper.SetLookup(formContext, "ovs_rational","ovs_tyrational", ovs_tyrationalid, ovs_rationalflbl);
                                if (userSettings.languageId == 1033)
                                    glHelper.SetLookup(formContext, "ovs_rational","ovs_tyrational", ovs_tyrationalid, ovs_rationalelbl);

                                glHelper.SetDisabled(formContext, "ovs_rational", true);
                            },
                            function (error) {
                                console.log("Fetch rational Unplanned failed. error: " + error.message);
                                Xrm.Navigation.openAlertDialog({ confirmButtonLabel: "OK", text: "Fetch rational Unplanned failed. Error :" + error.message });
                            }
                        );

                    }
                }
                else {
                    switch (appName) {


                        case "TDG Management":
                            if (isPlanned) {
                                readOnlyArray = new Array("msdyn_serviceaccount", "qm_remote", "ovs_oversighttype", "ovs_fiscalyear", "ovs_fiscalquarter", "msdyn_workordertype", "ovs_rational", "msdyn_serviceterritory");
                                editableArray = new Array();
                            }
                            else {
                                editableArray = new Array("msdyn_serviceaccount", "ovs_siteofviolation", "qm_remote", "ovs_oversighttype", "ovs_fiscalyear", "ovs_fiscalquarter", "msdyn_workordertype", "ovs_rational", "msdyn_serviceterritory");
                            }
                            break;
                        case "TDG Inspections":
                            if (isPlanned) {
                                readOnlyArray = new Array("msdyn_serviceaccount", "qm_remote", "ovs_oversighttype", "ovs_fiscalyear", "ovs_fiscalquarter", "ovs_revisedquarterid", "msdyn_workordertype", "ovs_rational", "msdyn_serviceterritory");
                                //msdyn_systemstatus - filter OptionSet (exclude Closed - Cancelled)
                                var options = new Array(); options[0] = 690970005;
                                glHelper.filterOptionSet(formContext, "msdyn_systemstatus", options, false);
                            }
                            else {
                                editableArray = new Array("msdyn_serviceaccount", "ovs_siteofviolation", "qm_remote", "ovs_oversighttype", "ovs_fiscalyear", "ovs_fiscalquarter", "ovs_revisedquarterid", "msdyn_workordertype", "msdyn_serviceterritory"); //"ovs_rational" - cannot set editable => will set all fields editable
                                //msdyn_systemstatus - remove filter OptionSet (exclude Closed - Cancelled)
                                glHelper.filterOptionSet(formContext, "msdyn_systemstatus");
                            }
                            break;
                        case "TDG Planner":
                            //if (isPlanned) {
                            //    readOnlyArray = new Array();
                            //    editableArray = new Array();
                            //}
                            //else {
                            //    readOnlyArray = new Array();
                            //    editableArray = new Array();
                            //}
                            break;
                        default:
                    }

                }


                if (readOnlyArray.length > 0)
                    for (var i = 0; i < readOnlyArray.length; i++) {

                        glHelper.SetDisabled(formContext, readOnlyArray[i], true);
                    }

                if (editableArray.length > 0)
                    for (var i = 0; i < readOnlyArray.length; i++) {

                        glHelper.SetDisabled(formContext, editableArray[i], false);
                    }

            }, function (error) {

                console.log("Get current app name error: " + error.message);
                Xrm.Navigation.openAlertDialog({ confirmButtonLabel: "OK", text: "Fetch current app name failed. Error :" + error.message });
            });
        },

        SetRegion: function (formContext) {

            var currentUserId = userSettings.userId;
            currentUserId = currentUserId.replace(/[{}]/g, "");
            Xrm.WebApi.online.retrieveRecord("systemuser", currentUserId, "?$select=_territoryid_value").then(function success(result) {
                if (result != null && result["_territoryid_value"] != null) {
                    var _territoryid_value = result["_territoryid_value"];
                    var _territoryid_value_formatted = result["_territoryid_value@OData.Community.Display.V1.FormattedValue"];
                    var _territoryid_value_lookuplogicalname = result["_territoryid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];

                    glHelper.SetLookup(formContext, "msdyn_serviceterritory", _territoryid_value_lookuplogicalname, _territoryid_value, _territoryid_value_formatted);
                }
            }, function (error) {
                console.log("Set Region failed. Error :" + error.message);
                Xrm.Navigation.openAlertDialog({ confirmButtonLabel: "OK", text: "Set Region failed. Error :" + error.message });
            });
        },

        SetDefaultFiscalYear: function (formContext) {

            Xrm.WebApi.online.retrieveMultipleRecords("tc_tcfiscalyear", "?$select=tc_name,tc_tcfiscalyearid&$filter=tc_iscurrentfiscalyear eq true").then(
                function success(results) {
                    for (var i = 0; i < results.entities.length; i++) {
                        var tc_name = results.entities[i]["tc_name"];
                        var tc_tcfiscalyearid = results.entities[i]["tc_tcfiscalyearid"];

                        glHelper.SetLookup(formContext, "ovs_fiscalyear", "tc_tcfiscalyear", tc_tcfiscalyearid, tc_name);
                    }
                },
                function (error) {
                    console.log("Set Default Fiscal Year failed. Error :" + error.message);
                    Xrm.Navigation.openAlertDialog({ confirmButtonLabel: "OK", text: "Set Default Fiscal Year failed. Error :" + error.message });
                }
            );
        },

        FiscalYearOnchange: function (executionContext) {

            var formContext = executionContext.getFormContext();
            formContext.getAttribute('ovs_fiscalquarter').setValue(null);
        },

        WO_SystemStatus_OnChange: function (executionContext) {

            var formContext = executionContext.getFormContext();

            var systemStatus = formContext.getAttribute("msdyn_systemstatus").getValue();
            //If system status is set to closed
            if (systemStatus == 690970004 || systemStatus == 690970005) {
                //Set state to Inactive
                formContext.getAttribute("statecode").setValue(1);
                //Set Status Reason to Closed
                formContext.getAttribute("statuscode").setValue(918640000);
            }
            else {
                //Keep record Active
                formContext.getAttribute("statecode").setValue(0);
                formContext.getAttribute("statuscode").setValue(1);
            }
        },

        //StateCode_OnChange: function (executionContext) {
        //    var formContext = executionContext.getFormContext();
        //    var stateCode = formContext.getAttribute("statecode").getValue();
        //    //If statecode changed to Active
        //    if (stateCode == 0) {
        //        //Change systemstatus to Open - Completed
        //        formContext.getAttribute("msdyn_systemstatus").setValue(918640003);
        //    }
        //},

    }


    //********************public methods end***************

})(window, document)