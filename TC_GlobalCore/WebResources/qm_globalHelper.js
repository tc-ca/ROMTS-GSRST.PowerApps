var glHelper = (function (window, document) {

    //********************global vars*******************
    var FORMSTAGE_Create = 1;
    var FORMSTAGE_Update = 2;
    var FORMSTAGE_RO = 3;
    var FORMSTAGE_Disabled = 4;


    //********************methods***************
       

    function getGlobalContext() {
        return Xrm.Utility.getGlobalContext();
    }

    function getFormContext(executionContext) {
        return executionContext.getFormContext();
    }

    function GetFormType(formContext) {
        if (formContext != null)
            return formContext.ui.getFormType();
        else {
            console.log("formContext is null");
            return null;
        }
    }

    function GetFormName(formContext) {
        var fs = formContext.ui.formSelector;
        if (fs != null) {
            return fs.getCurrentItem().getLabel();
        }
        else { return null; }
    }

    function SwitchFormByName(formContext, formName) {
        if (formContext.ui.formSelector.getCurrentItem().getLabel() != formName) {
            var items = formContext.ui.formSelector.items.get();
            for (var i in items) {
                var item = items[i];
                var itemId = item.getId();
                var itemLabel = item.getLabel();
                if (itemLabel == formName) {
                    SwitchFormById(formContext, itemId);
                }
            }
        }
    }

    function SwitchFormById(formContext, formId) {
        formContext.ui.formSelector.items.get(formId).navigate();
    }

    /****************************************************************************************
    VALUES
    ****************************************************************************************/

    function GetValue(formContext, attr) {
        var result;
        var val = formContext.getAttribute(attr).getValue();
        if (val == null) {
            result = "";
        }
        else {
            if (val.toString().length > 0) {
                result = val;
            }
            else {
                result = "";
            }
        }
        return result;
    }

    function GetOptionsetText(formContext, attr) {
        var val = formContext.getAttribute(attr).getText();
        return val ? val : "";
    }

    function GetLookupAttrId(formContext, attr) {
        var lu = formContext.getAttribute(attr);
        if (lu != null) {
            if (lu.getValue() != null && lu.getValue().length > 0) {
                var luValue = lu.getValue();
                if (luValue != null) {
                    return luValue[0].id;
                }
            }
            else {
                return null;
            }
        }
        return null;
    }

    function GetLookupName(formContext, attr) {
        var lu = formContext.getAttribute(attr);
        if (lu != null) {
            if (lu.getValue() != null && lu.getValue().length > 0) {
                var luValue = lu.getValue();
                if (luValue != null) {
                    return luValue[0].name;
                }
            }
            else {
                return "";
            }
        }
        return "";
    }

    function GetLookupEntityType(formContext, attr) {
        var lu = formContext.getAttribute(attr);
        if (lu != null) {
            var luValue = lu.getValue();
            if (luValue != null) {
                return luValue[0].entityType;
            }
        }
        return null;
    }

    function SetValue(formContext, attr, val) {
        formContext.getAttribute(attr).setValue(val);
        formContext.getAttribute(attr).setSubmitMode("always");
    }

    function SetLookup(formContext, attr, entityType, id, name) {
        var setLookupValue = new Array();
        setLookupValue[0] = new Object();
        setLookupValue[0].id = id;
        setLookupValue[0].entityType = entityType;
        setLookupValue[0].name = name;
        formContext.getAttribute(attr).setValue(setLookupValue);
        formContext.getAttribute(attr).setSubmitMode("always");
    }

    function SetOptionsetByText(formContext, attr, text) {
        var options = formContext.getAttribute(attr).getOptions();
        for (var i = 0; i < options.length; i++) {
            if (options[i].text == text) {
                formContext.getAttribute(attr).setValue(options[i].value);
                formContext.getAttribute(attr).setSubmitMode("always");
            }
        }
    }

    function SetOptionsetByValue(formContext, attr, intValue) {

        var oSet = formContext.getAttribute(attr);
        var options = oSet.getOptions();
        for (var i = 0; i < options.length; i++) {
            if (options[i].value == intValue) {
                oSet.setValue(options[i].value);
                oSet.setSubmitMode("always");
            }
        }
    }

    ///to restore option set to default send arrayOfIntValues as null
    function filterOptionSet(formContext, attr, arrayOfIntValues = null, isValuesToKeep = true) {
        var oSet = formContext.getControl(attr);
        var options = formContext.getControl(attr).getOptions();


        if (isValuesToKeep) {

            var optionsToKeep = new Array();

            for (var i = 0; i < options.length; i++) {

                var toKeep = false;
                //contains
                for (var j = 0; j < arrayOfIntValues.length; j++) {

                    if (options[i].value == arrayOfIntValues[j]) {
                        toKeep = true;
                        break;
                    }
                }
                if (toKeep) optionsToKeep.push(options[i]);
            }

            oSet.clearOptions();
            for (var i = 0; i < optionsToKeep.length; i++) {
                oSet.addOption(optionsToKeep[i]);
            }
        }
        else {
            for (var i = 0; i < arrayOfIntValues.length; i++) {

                oSet.removeOption(arrayOfIntValues[i]);
            }
        }
    }

    function SetRequiredLevel(formContext, attr, required) {
        if (required) {
            formContext.getAttribute(attr).setRequiredLevel("required");
        }
        else {
            formContext.getAttribute(attr).setRequiredLevel("none");
        }
    }

    function isAttributeRequired(formContext, attr) {
        return formContext.getAttribute(attr).getRequiredLevel() == 'required';
    }

    function ResetField(formContext, attr) {
        var attribute = formContext.getAttribute(attr);
        var attributeType = formContext.getAttribute(attr).getAttributeType();

        switch (attributeType) {
            case "boolean":
                attribute.setValue(false);
                break;

            case "datetime":
                attribute.setValue(null);
                break;

            case "decimal":
                attribute.setValue(0);
                break;

            case "money":
                break;

            case "double":
                attribute.setValue(0);
                break;

            case "integer":
                attribute.setValue(0);
                break;

            case "lookup":
                attribute.setValue([]);
                break;

            case "memo":
                attribute.setValue("");
                break;

            case "string":
                attribute.setValue("");
                break;

            case "optionset":
                attribute.setValue(0);
                break;
        }
    }

    /****************************************************************************************
    VISIBILITY
    ****************************************************************************************/

    function SetControlVisibility(formContext, controlname, visible) {
        if (formContext.getControl(controlname)) {
            formContext.getControl(controlname).setVisible(visible);
        }
    }

    function SetSectionVisibility(formContext, tabname, sectionname, visible) {
        var tab = formContext.ui.tabs.get(tabname);
        var section = tab.sections.get(sectionname);
        section.setVisible(visible);
    }

    function SetTabVisibility(formContext, tabname, visible) {
        formContext.ui.tabs.get(tabname).setVisible(visible);
    }

    function SetTabDisplayState(formContext, tabname, expand) {
        var tab = formContext.ui.tabs.get(tabname);
        if (expand == true) {
            tab.setDisplayState("expanded");
        }
        else {
            tab.setDisplayState("collapsed");
        }
    }

    function SetControlsSectionVisibility(ctrl, visible) {
        if (ctrl != null) { ctrl.getParent().setVisible(visible); }
    }

    /****************************************************************************************
    MISCELLANEOUS
    ****************************************************************************************/

    function SetDisabled(formContext, attr, disabled) {
        formContext.getControl(attr).setDisabled(disabled);
    }

    function GetCurrentUserId() {
        return getGlobalContext().userSettings.userId;
    }

    function GetCurrentUserName() {
        return getGlobalContext().userSettings.userName;
    }

    function GetCurrentUserLanguage() {

    //add as necessery
        var langMap = {
            "1033": "en",
            "1036": "fr",
        }
        try {
            return langMap[getGlobalContext().userSettings.languageId.toString()];
        } catch (e) {

            console.log(e);
            return "en";
        }
    }


    function RemoveOptionSetOption(formContext, attr, optionSetValue) {
        var current = formContext.getControl(attr);
        if (current)
            formContext.getControl(attr).removeOption(optionSetValue);
    }

    function GetCurrentRecordId(formContext) {

        return formContext.data.entity.getId();
    }

    function GetCurrentRecordName(formContext) {
        return formContext.data.entity.getPrimaryAttributeValue();
    }

    function setNotificationWithPhoneNumberFormat(executionContext) {
        var phoneNumber = executionContext.getEventSource();
        if (typeof (phoneNumber) != "undefined") {
            var formatedNumber = FormatPhoneNumber2(phoneNumber.getValue());
            var formContext = executionContext.getFormContext();
            var attributeName = phoneNumber.getName();
            if (formatedNumber && formatedNumber.length >= 10)  // fix for auto adjust
                phoneNumber.setValue(formatedNumber);
            if (!checkPhoneNumber(formatedNumber)) {
                formContext.getControl(attributeName).setNotification("Phone field requires 10 digit number", attributeName + "_ID");
            }
            else formContext.getControl(attributeName).clearNotification(attributeName + "_ID");
        }
    }

    function alertDialogText(messeageText, confirmaionText) {
        var mt = (messeageText != null && messeageText != undefined && messeageText.length > 0) ? messeageText : "A message from form";
        var cbl = (confirmaionText != null && confirmaionText != undefined && confirmaionText.length > 0) ? confirmaionText : "OK";
        return { confirmButtonLabel: cbl, text: mt };
    }

    //accepts two integers each must be > 100
    //if empty =>default h: 150, w: 350
    function alertDialogWindow(windowHeigth, windowWidth) {
        try {
            var wh = parseInt(windowHeigth) > 100 ? windowHeigth : 150;
            var ww = parseInt(windowWidth) > 100 ? windowWidth : 350;
            return { height: wh, width: ww };

        } catch (e) {
            return { height: 150, width: 350 };
        }
    }

    /**
   * 
   * @param {MESSAGE TO THE USER} message 
   * @param {TYPE OF NOTIFICATION ["INFO", "WARNING", "ERROR"]} type 
   * @param {TIME IN MS TO CLEAR NOTIFICATION [DEFAULT 5 SECONDS]} timeout 
   */
  function DisplayFormNotification(message, type, timeout=3000) {
    //UNIQUE ID FOR THIS NOTIFICATION. 
    //ID IS USED TO LATER CLOSE THIS SPECIFIC NOTIFICATION
    var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    var id = randLetter + Date.now();

    //DISPLAY THE NOTIFICATION
    Xrm.Page.ui.setFormNotification(message, type, id);

    //WAIT, AND CLEAR
    setTimeout(
        function () {
            Xrm.Page.ui.clearFormNotification(id);
        },
        timeout
    );
  }



  /**
   * 
   * @param {MESSAGE TO THE USER} message 
   * @param {TYPE OF NOTIFICATION [1: SUCCESS, 2: ERROR, 3: WARNING, 4: INFORMATION ]} type 
   * @param {TIME IN MS TO CLEAR NOTIFICATION [DEFAULT 5 SECONDS]} timeout 
   * @param {ACTION FUNCTION TO PERFORM WHEN NOTIFICATION CLICKED 
   * var myAction = 
   * {
   *    actionLabel: "Click here to Submit", 
   *    eventHandler: function () {
   *      Xrm.Navigation.openUrl("https://soundharyasubhash.wordpress.com");
   *      // perform other operations as required on clicking
   *    }
   * }
   *} action
  */
  function DisplayGlobalNotification(message, type, timeout=3000, action=null){
      // DEFINE NOTIFICATION OBJECT
      var notification = 
      {
        type: 2,
        level: type, // Information
        message: message
      }

      //ADD ACTION IF DEFINED
      if (!action) notification.action = action;

      //SHOW GLOBAL NOTIFICATION
      Xrm.App.addGlobalNotification(notification).then(

        function success(result) {
          console.log("Notification created with ID: " + result);

          // Wait for 5 seconds and then clear the notification
          window.setTimeout(function () { 
            Xrm.App.clearGlobalNotification(result); 
          }, timeout);

        },

        function (error) {
          console.log(error.message);
          // handle error conditions
        }
    );
  }

    function GetLocalizedStrings() {
        // TODO Replace with resx Web Resource

        let lang = GetCurrentUserLanguage();

        if (lang === "en") {
            // english
            return {
                MarkCompleteErrors: "There are errors on the Questionnaire, please fix them before Marking as Complete",
                LoadingQuestionnaire: "Loading Questionnaire...",
                QuestionnaireSaveSuccessful: "Questionnaire Saved Successfully",
                SavingQuestionnaire: "Saving Questionnaire...",
                SavingQuestionnaireCompletionStatus: "Saving Questionnaire Completion Status...",
                TaskTypeChange: "If Task Type is changed, Questionnaire progress will be lost. Proceed?",
                ConfirmationDiaglog: "Confirmation Dialog",
                NoQuestionnaireForTaskType: "No questionnaire associated with service task type {0}. Please open the Service Task Type and associate a valid Questionnaire Template"
            }
        } else {
            // french
            return {
                MarkCompleteErrors: "Il y a des erreurs dans le questionnaire, veuillez les corriger avant de marquer comme terminé",
                LoadingQuestionnaire: "Chargement du questionnaire...",
                QuestionnaireSaveSuccessful: "Questionnaire enregistré avec succès",
                SavingQuestionnaire: "Questionnaire de sauvegarde...",
                SavingQuestionnaireCompletionStatus: "Enregistrement de l'état d'achèvement du questionnaire...",
                TaskTypeChange: "Si le type de tâche est modifié, la progression du questionnaire sera perdue. Procéder?",
                ConfirmationDiaglog: "Boîte de dialogue de confirmation",
                NoQuestionnaireForTaskType: "Aucun questionnaire associé au type de tâche de service {0}. Veuillez ouvrir le type de tâche de service et associer un modèle de questionnaire valide"
            }
        }
    }   

    //Public  properties and methods
    return {

        FORMTYPE_CREATE: FORMSTAGE_Create,
        FORMTYPE_EDIT: FORMSTAGE_Update,
        FORMTYPE_READONLY: FORMSTAGE_RO,
        FORMTYPE_DISABLED: FORMSTAGE_Disabled,

        DisplayFormNotification: DisplayFormNotification,
        DisplayGlobalNotification: DisplayGlobalNotification,

        alertDialogText: alertDialogText,
        alertDialogWindow: alertDialogWindow,

        getGlobalContext: getGlobalContext,
        GetFormName: GetFormName,
        GetFormType: GetFormType,
        GetLookupAttrId: GetLookupAttrId,
        GetLookupName: GetLookupName,
        GetOptionsetText: GetOptionsetText,
        GetValue: GetValue,
        ResetField: ResetField,
        SetTabVisibility: SetTabVisibility,
        SetValue: SetValue,
        SetDisabled: SetDisabled,
        SetSectionVisibility: SetSectionVisibility,
        SetControlVisibility: SetControlVisibility,
        isAttributeRequired: isAttributeRequired,
        SetRequiredLevel: SetRequiredLevel,
        SetOptionsetByText: SetOptionsetByText,
        SetOptionsetByValue: SetOptionsetByValue,
        filterOptionSet: filterOptionSet,
        SwitchFormByName: SwitchFormByName,
        RemoveOptionSetOption: RemoveOptionSetOption,
        SetLookup: SetLookup,
        GetCurrentUserId: GetCurrentUserId,
        GetCurrentUserName: GetCurrentUserName,
        GetCurrentRecordId: GetCurrentRecordId,
        GetCurrentUserLanguage: GetCurrentUserLanguage,
        GetLocalizedStrings: GetLocalizedStrings
    };

    //********************public methods end***************

})(window, document);