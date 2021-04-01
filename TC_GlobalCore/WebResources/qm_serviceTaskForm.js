
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
///<reference path="../../Utilities/GlobalHelper.js"/>
///<reference path="../../Utilities/questionnaireFunctions.js"/>

var ServiceTaskMainForm = (function (window, document) {

//variables

    var globalContext;
    var formType;
    var renderParams = {};
    var filterTaskType = "";
    var taskType = {};
    var savedTaskType = {};
    var ttKey = "tasktypeLkp";
    var webResourceControl;
    var webResourceControlContentWindow;
    var checkQuenair;
    var isDirty = false;

//********************private methods*******************


    function changeControlsBaseOnTaskType(formContext) {

        if (formType == 1
            || taskType.getValue() == undefined
            || taskType.getValue() == null)
            glHelper.SetSectionVisibility(formContext, "ServiceTaskGeneralTab", "questionnare_section", false);

        else glHelper.SetSectionVisibility(formContext, "ServiceTaskGeneralTab", "questionnare_section", true);
    }

    function setQuestionnaireResultValue(formContext, newValue) {
        formContext.getAttribute('ovs_questionnaireresultjson').setValue(newValue);
        renderParams.resultjson = newValue;
    }

    function RenderQuestionnaire(renderParams) {
        renderParams.webResourceControl.getContentWindow().then(
        async function (win) {
            Xrm.Utility.showProgressIndicator("Loading Questionnaire...");
            qtnHelper.InitializeQuestionnaireRender(renderParams).then(function(){
                Xrm.Utility.closeProgressIndicator();
            });

            // make sure we don't get stuck!
            setTimeout(function () { Xrm.Utility.closeProgressIndicator(); }, 6000); });
    }

    function reloadQuestionnaireWebResource() {
        // var src = webResourceControl.getSrc();
        // webResourceControl.setSrc(null);
        // webResourceControl.setSrc(src);
        RenderQuestionnaire(renderParams);
    }

    async function GetTemplateDefinitionFromSelectedTaskType(formContext){
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

    async function CompleteQuestionnaire(eContext, wrCtrl) {
        var formContext = renderParams.executionContext.getFormContext();

        //hide the builder tab if this is a new template
        var recordGuid = glHelper.GetCurrentRecordId(formContext);
        console.log('saving service task ' + recordGuid);

        if (!recordGuid) return;

        var questionnaireVueInstance = qtnHelper.GetVueInstance(renderParams.webResourceControl);

        if (!questionnaireVueInstance){
            // web resource / vue has not been loaded
            // no changes to questionnaire should be saved
            return;
        }

        var questionnaire = questionnaireVueInstance.GetState();
        var serializedQuestionnaire = JSON.stringify(questionnaire);

        const result = await qtnHelper.SaveQuestionnaire(serializedQuestionnaire, recordGuid);

        // apply the new template json definition to the result form field and the renderParams
        setQuestionnaireResultValue(formContext, serializedQuestionnaire);

        // reload the webresource with the new renderParams
        reloadQuestionnaireWebResource(webResourceControl);
    }

    function getUtilizedTaskTypesSetPreFilter(formContext) {
        var clientContext = Xrm.Utility.getGlobalContext().client;

        if (clientContext.isOffline()) { }
        else { }

        filterTaskType = "<filter type='and'><condition attribute='msdyn_servicetasktypeid' operator='not-in'>{0}</condition>";
        var conditionTemplate = "<value>{0}</value>";
        var condition = "";
        var taskTypeCtrl = formContext.getControl("msdyn_tasktype");
        taskTypeCtrl.removePreSearch(ServiceTaskMainForm.AddTaskTypeFilter);

        //get all ServiceTaskTypes exist for the current WO
        var parentWO = glHelper.GetValue(formContext, "msdyn_workorder");
        //msdyn_workorder
        if (parentWO[0] != undefined && parentWO[0] != null) {

            Xrm.WebApi.online.retrieveMultipleRecords("msdyn_workorderservicetask", "?$select=_msdyn_tasktype_value,_msdyn_workorder_value,msdyn_workorderservicetaskid&$filter=_msdyn_workorder_value eq " + parentWO[0].id).then(
                function success(results) {

                    if (results.entities.length == 0) {

                        filterTaskType = "";
                        //remove pre-filter
                        taskTypeCtrl.removePreSearch(ServiceTaskMainForm.AddTaskTypeFilter);
                    }
                    else {

                        for (var i = 0; i < results.entities.length; i++) {
                            var _msdyn_tasktype_value = results.entities[i]["_msdyn_tasktype_value"];

                            condition += conditionTemplate.replace("{0}", _msdyn_tasktype_value);
                        }

                        filterTaskType = filterTaskType.replace("{0}", condition) + "</filter>";

                        //add pre-filter
                        taskTypeCtrl.addPreSearch(ServiceTaskMainForm.AddTaskTypeFilter);
                    }
                },
                function (error) {
                    Xrm.Utility.alertDialog(error.message);
                    taskTypeCtrl.removePreSearch(ServiceTaskMainForm.AddTaskTypeFilter);
                }
            );
        } else taskTypeCtrl.removePreSearch(ServiceTaskMainForm.AddTaskTypeFilter);
    }

    function lkpObjBackUp(lkp, obj) {

        var ts = lkp.getValue();
        if (ts != undefined && ts != null) {

            obj.entityType = ts[0].entityType;
            obj.id = ts[0].id;
            obj.name = ts[0].name;
        } else obj = undefined;
    }

//********************private methods end***************


//********************public methods*******************


    //////////////////////////////////
    ////DYNAMICS EVENT HOOKS IN HERE
    /////////////////////////////////
    return {

        OnLoad: async function (executionContext) {

            alert('regular service task')
            //get context
            globalContext = glHelper.getGlobalContext();
            var formContext = executionContext.getFormContext();

			// 0 = Undefined, 1 = Create, 2 = Update, 3 = Read Only, 4 = Disabled, 6 = Bulk Edit
            formType = glHelper.GetFormType(formContext);

            //hide fields
            glHelper.SetControlVisibility(formContext, "qm_isquestionnaireupdated", false);
            glHelper.SetControlVisibility(formContext, "statecode", false);
            glHelper.SetControlVisibility(formContext, "statuscode", false);
            

            //setup filter params and add pre-filter if necessery
            getUtilizedTaskTypesSetPreFilter(formContext);

            //add handlers and bk
            taskType = formContext.getAttribute("msdyn_tasktype");     
            taskType.removeOnChange(ServiceTaskMainForm.OnTaskTypeChange); // avoid binding multiple event handlers
            taskType.addOnChange(ServiceTaskMainForm.OnTaskTypeChange);

            //back up current task tpe
            lkpObjBackUp(taskType, savedTaskType);
           
            executionContext.setSharedVariable(ttKey, taskType);
            changeControlsBaseOnTaskType(formContext, executionContext);

            // Get the web resource control on the form
            webResourceControl = formContext.getControl('WebResource_Questionnaire');
            webResourceControl.getContentWindow().then(function (win) {
                webResourceControlContentWindow = win;

                // the questionnaire will tell us when its become dirty, instead of us keep asking
                webResourceControlContentWindow.addEventListener('tdg-qstnnr-updated', function() { 
                    isDirty = true;
                    glHelper.SetValue(formContext, "qm_isquestionnaireupdated", true);
                    console.log('Is dirty has been set in Dynamics to ' + isDirty);
                }, false);
            });

            
            var quickViewSitesControl = formContext.ui.quickForms.get("Sites");
           
            if (quickViewSitesControl) {
                var serviceAccountQuickView = quickViewSitesControl.getControl(
                    "msdyn_serviceaccount"
                );
               
                var siteId = serviceAccountQuickView.getAttribute().getValue()[0]["id"];
            }

            //grab the JSON from the hidden field on the form
            var resultjson = formContext.getAttribute('ovs_questionnaireresultjson').getValue();

            if (!resultjson || resultjson === 'null'){
                //no result, so we have to load the base template from the templateId
                var templatejson = await GetTemplateDefinitionFromSelectedTaskType(formContext);
                resultjson = templatejson;
            }

            let active = formContext.getAttribute('statecode').getValue();
			//build array of params to pass down to the questionnaire component
            renderParams = {
              executionContext: executionContext,
              webResourceControl: webResourceControl,
              resultjson: resultjson,
              formType: formType,
              userGuid: glHelper.GetCurrentUserId(),
              userName: glHelper.GetCurrentUserName(),
              userLang: glHelper.GetCurrentUserLanguage(),
              serviceTaskId: glHelper.GetCurrentRecordId(formContext),
              activeQuestionnaire: active,
              siteId: siteId,
            };

            RenderQuestionnaire(renderParams);

            // programmatically bind save event for the web resource here
            formContext.data.entity.removeOnSave(ServiceTaskMainForm.OnSave); // avoid multiple binds
            formContext.data.entity.addOnSave(ServiceTaskMainForm.OnSave);
            //add interval to control Questionnare isDirty
            //checkQuenair = setInterval(function () { ServiceTaskMainForm.checkQuestionnair(formContext) }, 2000);
            //keep flag on default (null)
            formContext.getAttribute("qm_isquestionnaireupdated").setSubmitMode("dirty");
        },

        OnSave: function (executionContext) {
            var vueInstance = qtnHelper.GetVueInstance(webResourceControl); // can return null!
            var formContext = executionContext.getFormContext();
            var eventArgs = executionContext.getEventArgs();
            var saveMode = eventArgs.getSaveMode();
            var json = null;
            // var isDirty = false;

            if (vueInstance) {
                json = vueInstance.GetState();
                // isDirty = vueInstance.checkIsDirty();
            }

            var state = glHelper.GetValue(formContext,"statecode");
            
            /*
            SAVE MODES
            1	Save	            All
            2	Save and Close      All
            5	Deactivate          All
            6	Reactivate          All
            47	Assign              User or Team owned entities
            58	Save as Completed   Activities
            59	Save and New        All
            70	Auto Save           All
            */

            /*
            STATE CODES
            Value   Label
            0       Active
            1       Inactive
            */

            /*
            STATUS CODES
            Value   Label
            1       Active
            2       Inactive
            */

            // Everything below for checking is dirty works now, but dynamics save is working now on 'X', so this can be simplified
            if (json !== null) {
                glHelper.SetValue(formContext, "ovs_questionnaireresultjson", JSON.stringify(json));
            }

            //keep flag on default
            glHelper.SetValue(formContext, "qm_isquestionnaireupdated", null);

            // IF SAVE MODE = DEACTIVATE OR REACTIVATE OR STATE = INACTIVE
            // if ((saveMode == 5 || saveMode == 6 || state == 1) && 
            //     vueInstance
            //     //webResourceControl.getVisible()
            //     )
            // {
            //     glHelper.SetValue(formContext, "ovs_questionnaireresultjson", JSON.stringify(json));
            // }
            // // IF ANY TYPE OF SAVE NOT DEACTIVATE OR REACTIVATE AND STATE = ACTIVE AND QUESTIONNAIRE CONTROL IS LOADED AND QUESTIONNAIRE CONTROL IS DIRTY 
            // else if (saveMode >= 1
            //     && !(saveMode == 5 || saveMode == 6)
            //     && state == 0
            //     && vueInstance //webResourceControl.getVisible() === true
            //     && isDirty === true) {

            //     var userResponse = confirm("The Inspection Questionnare has unsaved changes. Would you like to save them?");
            //     if (userResponse == true) {
                   
            //         glHelper.SetValue(formContext, "ovs_questionnaireresultjson", JSON.stringify(json));

            //         ////check if form still open after save and re-set interval
            //         //if (saveMode == 1 || saveMode == 5 || saveMode == 6 || saveMode == 70) {
            //         //    checkQuenair = setInterval(function () { ServiceTaskMainForm.checkQuestionnair(formContext) }, 2000);
            //         //}
            //     } else {
            //         //eventArgs.preventDefault();
            //     }
            // }
        },

        OnTaskTypeChange: function (executionContext) {
            var formContext = executionContext.getFormContext();
            var newTaskType = formContext.getAttribute("msdyn_tasktype").getValue();

            //if new value
            if (formType != 1 && savedTaskType != undefined && savedTaskType != null && newTaskType) {
                var confirmStrings = { text: "If Task Type is changed the whole Questionnaire progress will be lost. Proceed?", title: "Confirmation Dialog" };
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

                            // reload the webresource with the new renderParams
                            reloadQuestionnaireWebResource(webResourceControl);
                        }
                        //restore tasktype  value
                        else
                        {
                            glHelper.SetLookup(formContext, "msdyn_tasktype", savedTaskType.entityType, savedTaskType.id, savedTaskType.name);
                        }
                    },
                    function (error) {
                        console.log(error.message);
                    }
                );
            }

            changeControlsBaseOnTaskType(formContext, executionContext);
        },

        AddTaskTypeFilter: function (executionContext) {
            var formContext = executionContext.getFormContext();
            formContext.getControl("msdyn_tasktype").addCustomFilter(filterTaskType, "msdyn_servicetasktype");
        },

        checkQuestionnair: function (formContext) {

            // var isDirty = webResourceControlContentWindow.document.querySelector("questionnaire-builder").getVueInstance().checkIsDirty();
            // var keepOnSaveOn = glHelper.GetValue(formContext,"qm_isquestionnaireupdated");
            // if (isDirty && keepOnSaveOn == "" ) {

            //     glHelper.SetValue(formContext, "qm_isquestionnaireupdated", true);
            //     clearInterval(checkQuenair);
            // }
            
        },

    };

//********************public methods end***************

})(window, document);
