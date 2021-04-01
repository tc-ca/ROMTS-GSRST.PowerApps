/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
///<reference path="../Utilities/questionnaireFunctions.js"/>

var ServiceTaskRibbon = (function (window, document) {


    //********************helpers*******************
    var TDG_Inspector_Role = "TDG Inspector";
    //state object 
    var stask = {};
    stask.Active = {};
    stask.Active.statecode = 0;
    stask.Active.statuscode = 1;
    stask.Inactive = {};
    stask.Inactive.statecode = 1;
    stask.Inactive.statuscode = 2;

    function setState(formContext, isActive, isComplete) {

        if (isActive) {
            glHelper.SetValue(formContext, "statecode", stask.Active.statecode);
            glHelper.SetValue(formContext, "statuscode", stask.Active.statuscode);
        } else {
            glHelper.SetValue(formContext, "statecode", stask.Inactive.statecode);
            glHelper.SetValue(formContext, "statuscode", stask.Inactive.statuscode);
        }

        if (isComplete) glHelper.SetValue(formContext, "msdyn_percentcomplete", 100.00);

        //sync save
        formContext.data.entity.save();
    }

    function MarkAsCompleteGrid(selectedItems, gridControl) {

        console.log("MarkAsCompleteGrid started");
        var selectedTasks = selectedItems;

        for (var i = 0; i < selectedItems.length; i++) {
            console.log("MarkAsCompleteGrid current id: " + selectedTasks[i]);
            // This function has been deleted
            // updateServiceTaskCompleteAndStatus(selectedTasks[i]);
        }

        setTimeout(function () { gridControl.refresh(); }, 1000);

    }

  
    function MarkAsCompleteForm(primaryControl) {
        const formContext             = primaryControl;
        let   translations            = glHelper.GetLocalizedStrings();
        var   isQuestionnaireComplete = glHelper.GetValue(formContext, "ovs_isquestionnairecomplete");

        //Verify validation results
        if (isQuestionnaireComplete) {
            setState(formContext, false, true);
        } else {
            glHelper.DisplayFormNotification(translations.MarkCompleteErrors, "ERROR", 8000);
        }
    }

    function ActivateForm(primaryControl) {
        const formContext = primaryControl;
        setState(formContext, true, false);
    }

    function DeactivateForm(primaryControl) {
        const formContext = primaryControl;
        setState(formContext, false, false);
    }

    function isInspector() {
        var roles = Xrm.Utility.getGlobalContext().userSettings.roles;
        var enable = false;

        roles.forEach(function (item) {

            if (item.name == TDG_Inspector_Role) enable = true;

        });

        return enable;
    }

    function isQuestionnaireForm(primaryControl) {

        var result = false;
        //const formContext = primaryControl;

        //var formItem = formContext.ui.formSelector.getCurrentItem();
        //var formName = formItem.getLabel();

        //if (formName.indexOf("TDG") != -1 || formName.indexOf("Questionnaire") !=-1) {
        //    return (
        //        ServiceTaskPopForm !== undefined &&
        //        ServiceTaskPopForm.QuestionnareRenderParams !== undefined &&
        //        ServiceTaskPopForm.QuestionnareRenderParams != null
        //    );
        //}

        var globalContext = Xrm.Utility.getGlobalContext();
        var appUrl = globalContext.getCurrentAppUrl();
        //alert(appUrl);
        var appid = appUrl.substring((appUrl.indexOf("appid=") + 6));
        //alert(appid);


        var req = new XMLHttpRequest();
        req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v9.1/appmodules?$select=name&$filter=appmoduleid eq " + appid, false);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    var results = JSON.parse(this.response);
                    if (results.value.length > 0) {

                        var appName = results.value[0]["name"];

                        if (appName == "TDG Management" || appName == "TDG Inspections" || appName == "TDG Planner") result = true;
                        else result = false;

                    }
                    else result = false;

                } else {

                    console.log(this.statusText);
                    result = false;
                }
            }
        };
        req.send();

        return result;
    }

    function OpenQuestionnaire(primaryControl) {

        const formContext = primaryControl;

        if (ServiceTaskRibbon.isQuestionnaireForm(primaryControl)) {
            console.log(
                "trying to pass",
                JSON.stringify(
                    ServiceTaskPopForm.QuestionnareRenderParams
                )
            );

            var pageInput = {
                pageType: "webresource",
                webresourceName: "qm_render.html"
            };

            var navigationOptions = {
                target: 2,
                position: 1,
                width: { value: 100, unit: "%" }
            };

            sessionStorage.setItem(
                "serviceTaskRenderParams",
                JSON.stringify(ServiceTaskPopForm.QuestionnareRenderParams)
            );

            Xrm.Navigation.navigateTo(
                pageInput,
                navigationOptions
            ).then(
                function success(result) {
                    //refresh
                    console.log('questionnaire web resource success callback')

                    // const sessionItem = sessionStorage.getItem("questionnaireCompletionDetails");
                    // const questionnaireCompletionDetails = JSON.parse(sessionItem);
                    // var errorInfo = questionnaireCompletionDetails.detail;
                    // var isValid = errorInfo.isValid;
                    // var errorCount = errorInfo.errorCount;

                    // // save the completeness status of the questionnaire
                    // formContext.getAttribute("ovs_isquestionnairecomplete").setSubmitMode("dirty");
                    // glHelper.SetValue(formContext, "ovs_isquestionnairecomplete", isValid);

                    formContext.data.refresh(true).then(() => {
                        // success
                        console.log('service task ribbon data refresh success callback');
                    }, () => {
                        // fail
                        console.log('save and refresh fail');
                    });
                },
                function error() {
                    // Handle errors
                }
            );
        }
    }

    //********************public methods*******************

    return {

        MarkAsCompleteGrid: MarkAsCompleteGrid,
        MarkAsCompleteForm: MarkAsCompleteForm,
        isInspector: isInspector,
        ActivateForm: ActivateForm,
        DeactivateForm: DeactivateForm,
        setState: setState,
        isQuestionnaireForm: isQuestionnaireForm,
        OpenQuestionnaire: OpenQuestionnaire
    };


})(window, document);


