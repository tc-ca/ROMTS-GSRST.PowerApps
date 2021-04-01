"use strict";
/* eslint-disable @typescript-eslint/triple-slash-reference */
///<reference path="../../Utilities/GlobalHelper.js"/>
///<reference path="../../Utilities/questionnaireFunctions.js"/>

var TemplateMainForm = (function (window, document) {

    //variables
    var globalContext;
    var mode = '';
    var builderTabName = 'tab_2';

    var formType;
    var renderParams = {};
    var webResourceControl;

    //********************private methods*******************
    function changeControlsBaseOnTaskType(formContext, executionContext) {

        var recordGuid = formContext.data.entity.getId();
        if (!recordGuid) {
            glHelper.SetTabVisibility(formContext, 'tab_2', false);
        }
        else {
            glHelper.SetTabVisibility(formContext, 'tab_2', true);
        }

    }

    function LoadQuestionnaire() {
        renderParams.webResourceControl.getContentWindow().then(function (win) {
            qtnHelper.InitializeQuestionnaireBuilder(renderParams);
        });
    }  

    function BuilderTabStateChange(){
        var webResource = renderParams.webResourceControl.getObject();

        if (!webResource){
            LoadQuestionnaire();
        }
    }

    async function CompleteQuestionnaire() {
        var formContext = renderParams.executionContext.getFormContext();

        //hide the builder tab if this is a new template
        var recordGuid = glHelper.GetCurrentRecordId(formContext);
        
        console.log('from template form ' + recordGuid);

        if (!recordGuid) return;

        var questionnaireVueInstance = qtnHelper.GetVueInstance(renderParams.webResourceControl);

        if (!questionnaireVueInstance){
            // web resource / vue has not been loaded
            // no changes to questionnaire should be saved
            return;
        }

        var questionnaire = questionnaireVueInstance.GetState();

        var templateName = formContext.getAttribute("qm_name").getValue();

        questionnaire.name = templateName;

        const result = await qtnHelper.SaveQuestionnaireTemplate(questionnaire, recordGuid);

        console.log(result);
    }

    //********************private methods end***************


    //********************public methods*******************
    return {
        OnLoad: function (executionContext) {

            //get context
            globalContext = glHelper.getGlobalContext();
            var formContext = executionContext.getFormContext();
            var id = glHelper.GetCurrentRecordId(formContext);

            // 0 = Undefined, 1 = Create, 2 = Update, 3 = Read Only, 4 = Disabled, 6 = Bulk Edit
            formType = glHelper.GetFormType(formContext);

            changeControlsBaseOnTaskType(formContext, executionContext);

            // Get the web resource control on the form
            webResourceControl = formContext.getControl('WebResource_BuilderTemplateForm');

            //grab the JSON from the hidden field on the form
            var templatejson = formContext.getAttribute('qm_templatejsontxt').getValue();
            
            //build array of params to pass down to the questionnaire component
            renderParams = {
                executionContext: executionContext,
                webResourceControl: webResourceControl, 
                templatejson: templatejson, 
                formType: formType,
                userGuid: glHelper.GetCurrentUserId(),
                userName: glHelper.GetCurrentUserName(),
                userLang: glHelper.GetCurrentUserLanguage(),
                templateId: glHelper.GetCurrentRecordId(formContext),
            }

            // programmatically bind the tab state change event for the builder tab
            var builderTab = formContext.ui.tabs.get("tab_2");
            builderTab.removeTabStateChange(BuilderTabStateChange);
            builderTab.addTabStateChange(BuilderTabStateChange);

            // programmatically bind save event for the web resource here
            formContext.data.entity.removeOnSave(CompleteQuestionnaire);
            formContext.data.entity.addOnSave(CompleteQuestionnaire);
        }
    };

    //********************public methods end***************

})(window, document);

 function PublishTemplate(executionContext) {

    //First check if the template is already published
    var recordId = executionContext.entityReference.id;

     Xrm.WebApi.online
         .retrieveRecord("qm_sytemplate", recordId, "?$select=statuscode")
         .then(
             function success(result) {
                 if (result["statuscode"] != 930840000)
                 {
                     //Template is good to go for publishing
                     var confirmStrings = { text: "Publishing a template will lock it down so it can be used in a questionnaire. You will not be able to make any further chnages to this template. Proceed?", title: "Publish Template" };
                     var confirmOptions = { height: 200, width: 450 };

                     Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
                         function (success) {
                             if (success.confirmed) {
                                 var template = {};
                                 template.statuscode = 930840000;

                                 Xrm.WebApi.online.updateRecord("qm_sytemplate", recordId, template).then(
                                     function success(result) {
                                         glHelper.DisplayFormNotification('Questionnaire Published Successfully', "INFO");
                                     },
                                     function (error) {
                                         Xrm.Utility.alertDialog(error.message);
                                     });

                                 console.log("Dialog closed using OK button.");
                             }
                             else
                                 console.log("Dialog closed using Cancel button or X.");
                         });

                 }
                 else
                     glHelper.DisplayFormNotification('Template Already Published', "ERROR",5000);
                 
             },
             function (error) {
                 Xrm.Utility.alertDialog(error.message);
             }
         );      
     
}

function CloneTemplate(executionContext) {
    debugger;
    var confirmStrings = { text: "Cloning a tamplate will create and exact copy along with related questions, reponses and related legislations. Proceed?", title: "Clone Template" };
    var confirmOptions = { height: 200, width: 450 };

    Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
        function (success) {
            if (success.confirmed)
            {
                var recordId = executionContext.entityReference.id;
                recordId = recordId.replace(/[{}]/g,"");
                
                //Begin Action Call
                
                var req = new XMLHttpRequest();
                req.open("POST", Xrm.Page.context.getClientUrl() + "/api/data/v9.1/qm_sytemplates(" + recordId + ")/Microsoft.Dynamics.CRM.ovs_CloneTemplate", false);
                req.setRequestHeader("OData-MaxVersion", "4.0");
                req.setRequestHeader("OData-Version", "4.0");
                req.setRequestHeader("Accept", "application/json");
                req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                req.onreadystatechange = function ()
                {
                    if (this.readyState === 4)
                    {
                        req.onreadystatechange = null;
                        
                        if (this.status === 200)
                        {
                            //We have a response! Let's try opening a new tab with that temaplate Id.
                            
                            var results = JSON.parse(this.response);

                            if (results != null && results.qm_sytemplateid != null)
                            {
                                //Open new record in another tab.
                                var entityFormOptions = {};
                                entityFormOptions["entityName"] = "qm_sytemplate";
                                entityFormOptions["entityId"] = results.qm_sytemplateid;
                                entityFormOptions["openInNewWindow"] = true;

                               
                                Xrm.Navigation.openForm(entityFormOptions).then(
                                    function (success) {
                                        console.log(success);
                                    },
                                    function (error) {
                                        console.log(error);
                                    });
                            }
                        }
                        else
                        {
                            Xrm.Utility.alertDialog(this.statusText);
                        }
                    }
                };
                req.send();

                //End Action Call
            }
            else
                console.log("Dialog closed using Cancel button or X.");
        });
}

