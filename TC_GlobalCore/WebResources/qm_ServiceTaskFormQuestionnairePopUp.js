
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
///<reference path="../../Utilities/GlobalHelper.js"/>
///<reference path="../../Utilities/questionnaireFunctions.js"/>

var ServiceTaskPopForm = (function (window, document) {

    //variables

    var globalContext;
    var formType;
    var renderParams = {};
    var filterTaskType = "";
    var taskType = {};
    var savedTaskType = {};
    var webResourceControl;
    //********************private methods*******************



    function setQuestionnaireResultValue(formContext, newValue) {
        formContext.getAttribute('ovs_questionnaireresultjson').setValue(newValue);
        renderParams.resultjson = newValue;
    }


    async function GetTemplateDefinitionFromSelectedTaskType(formContext) {
        // get the currently selected task type
        var selectedTaskType = formContext.getAttribute("msdyn_tasktype").getValue();
        if (!selectedTaskType) {
            console.log("No task type selected. Cannot load Questionnaire Template");
            return;
        }

        // get the json definition of the new template to be loaded
        var taskTypeId = selectedTaskType[0].id;
        var template = await qtnHelper.GetTemplateByServiceTaskType(taskTypeId);
        var templateSerialized = JSON.stringify(template);

        return templateSerialized;
    }

    function getUtilizedTaskTypesSetPreFilter(formContext) {
        var clientContext = Xrm.Utility.getGlobalContext().client;

        if (clientContext.isOffline()) { }
        else { }

        filterTaskType = "<filter type='and'><condition attribute='msdyn_servicetasktypeid' operator='not-in'>{0}</condition>";
        var conditionTemplate = "<value>{0}</value>";
        var condition = "";
        var taskTypeCtrl = formContext.getControl("msdyn_tasktype");
        taskTypeCtrl.removePreSearch(ServiceTaskPopForm.AddTaskTypeFilter);

        //get all ServiceTaskTypes exist for the current WO
        var parentWO = glHelper.GetValue(formContext, "msdyn_workorder");
        //msdyn_workorder
        if (parentWO[0] != undefined && parentWO[0] != null) {

            Xrm.WebApi.online.retrieveMultipleRecords("msdyn_workorderservicetask", "?$select=_msdyn_tasktype_value,_msdyn_workorder_value,msdyn_workorderservicetaskid&$filter=_msdyn_workorder_value eq " + parentWO[0].id).then(
                function success(results) {

                    if (results.entities.length == 0) {

                        filterTaskType = "";
                        //remove pre-filter
                        taskTypeCtrl.removePreSearch(ServiceTaskPopForm.AddTaskTypeFilter);
                    }
                    else {

                        for (var i = 0; i < results.entities.length; i++) {
                            var _msdyn_tasktype_value = results.entities[i]["_msdyn_tasktype_value"];

                            condition += conditionTemplate.replace("{0}", _msdyn_tasktype_value);
                        }

                        filterTaskType = filterTaskType.replace("{0}", condition) + "</filter>";

                        //add pre-filter
                        taskTypeCtrl.addPreSearch(ServiceTaskPopForm.AddTaskTypeFilter);
                    }
                },
                function (error) {
                    Xrm.Utility.alertDialog(error.message);
                    taskTypeCtrl.removePreSearch(ServiceTaskPopForm.AddTaskTypeFilter);
                }
            );
        } else taskTypeCtrl.removePreSearch(ServiceTaskPopForm.AddTaskTypeFilter);
    }

    function lkpObjBackUp(lkp, obj) {

        var ts = lkp.getValue();
        if (ts != undefined && ts != null) {

            obj.entityType = ts[0].entityType;
            obj.id = ts[0].id;
            obj.name = ts[0].name;
        } else obj = undefined;
    }

    parent.getContext = function () {
        return ServiceTaskPopForm.formContext;
    }

    //********************private methods end***************


    //********************public methods*******************


    //////////////////////////////////
    ////DYNAMICS EVENT HOOKS IN HERE
    /////////////////////////////////
    return {
        OnLoad: async function (executionContext) {
            //get context
            globalContext = glHelper.getGlobalContext();
            var formContext = executionContext.getFormContext();

            // 0 = Undefined, 1 = Create, 2 = Update, 3 = Read Only, 4 = Disabled, 6 = Bulk Edit
            formType = glHelper.GetFormType(formContext);

            //hide fields
            glHelper.SetControlVisibility(formContext, "ovs_isquestionnairecomplete", true); //todo set to false when done 
            glHelper.SetControlVisibility(formContext, "qm_isquestionnaireupdated", false);
            glHelper.SetControlVisibility(formContext, "statecode", false);
            glHelper.SetControlVisibility(formContext, "statuscode", false);

            //setup filter params and add pre-filter if necessery
            getUtilizedTaskTypesSetPreFilter(formContext);

            //add handlers and bk
            taskType = formContext.getAttribute("msdyn_tasktype");
            taskType.removeOnChange(ServiceTaskPopForm.OnTaskTypeChange); // avoid binding multiple event handlers
            taskType.addOnChange(ServiceTaskPopForm.OnTaskTypeChange);

            //back up current task type
            lkpObjBackUp(taskType, savedTaskType);


            var quickViewSitesControl = formContext.ui.quickForms.get("Sites");
            var siteId = "";
            if (quickViewSitesControl) {
                var serviceAccountQuickView = quickViewSitesControl.getControl(
                    "msdyn_serviceaccount"
                );

                siteId = serviceAccountQuickView.getAttribute().getValue()[0]["id"];
            }

            //grab the JSON from the hidden field on the form
            var resultjson = formContext.getAttribute('ovs_questionnaireresultjson').getValue();

            if (!resultjson || resultjson === 'null') {
                //no result, so we have to load the base template from the templateId
                var templatejson = await GetTemplateDefinitionFromSelectedTaskType(formContext);
                resultjson = templatejson;
            }

            let active = formContext.getAttribute('statecode').getValue();
            //build array of params to pass down to the questionnaire component
            renderParams = {
                //executionContext: executionContext,
                resultjson: resultjson,
                formType: formType,
                userGuid: glHelper.GetCurrentUserId(),
                userName: glHelper.GetCurrentUserName(),
                userLang: glHelper.GetCurrentUserLanguage(),
                serviceTaskId: glHelper.GetCurrentRecordId(formContext),
                activeQuestionnaire: active,
                siteId: siteId,
            };

            this.QuestionnareRenderParams = renderParams

        },

        OnSave: function (executionContext) {



        },

        OnTaskTypeChange: function (executionContext) {
            var formContext = executionContext.getFormContext();
            var newTaskType = formContext.getAttribute("msdyn_tasktype").getValue();
            var translations = glHelper.GetLocalizedStrings();

            //if new value
            if (formType != 1 && savedTaskType != undefined && savedTaskType != null && newTaskType) {
                var confirmStrings = { text: translations.TaskTypeChange, title: translations.ConfirmationDiaglog};
                var confirmOptions = { height: 200, width: 450 };
                Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
                    async function (success) {
                        //update questionnare
                        if (success.confirmed) {

                            taskType = formContext.getAttribute("msdyn_tasktype");
                            lkpObjBackUp(taskType, savedTaskType);
                            getUtilizedTaskTypesSetPreFilter(formContext);

                            // get the json definition of the new template to be loaded
                            var newTemplate = await GetTemplateDefinitionFromSelectedTaskType(formContext);

                            // apply the new template json definition to the result form field and the renderParams
                            setQuestionnaireResultValue(formContext, newTemplate);                            
                        }
                        //restore tasktype  value
                        else {
                            glHelper.SetLookup(formContext, "msdyn_tasktype", savedTaskType.entityType, savedTaskType.id, savedTaskType.name);
                        }
                    },
                    function (error) {
                        console.log(error.message);
                    }
                );
            }
        },

        AddTaskTypeFilter: function (executionContext) {
            var formContext = executionContext.getFormContext();
            formContext.getControl("msdyn_tasktype").addCustomFilter(filterTaskType, "msdyn_servicetasktype");
        },

        QuestionnareRenderParams: renderParams,
        formContext: null
    };

    //********************public methods end***************

})(window, document);
