//window.parentExecutionContext = null;
//window.parentFormContext = null;

function InitializeButton(eContext) {
  // Assign executionContext and formContext to global variables within the web resource
  //window.parentExecutionContext = eContext;
  //window.parentFormContext = eContext.getFormContext();
}

function proceed(eContext) {
  //var eContext = window.parentExecutionContext;
  var formContext = eContext.getFormContext();
  var confirmation = formContext.getAttribute('ppp_matchfoundconfirmation');
  confirmation.setValue(true);
  formContext.getAttribute('ppp_matchfoundtime').setValue(new Date());

  formContext.data.save();
  formContext.getControl('WebResource_traveller').setVisible(false);
  ToggleTabs(eContext);
  formContext.ui.tabs.get('tab_DetailedTravellerInformation').setFocus();
}

function ToggleTabs(eContext) {
  //var eContext = window.parentExecutionContext;
  //confirmation.setSubmitMode("Always");

  ShowHideTabs(eContext, 'ppp_matchfoundconfirmation', false, [
    'tab_TravellerInformation',
  ]);
  ShowHideTabs(eContext, 'ppp_matchfoundconfirmation', true, [
    'tab_DetailedTravellerInformation',
    'tab_TravelDetails',
    'tab_RecommendedAction',
    'tab_Decision',
  ]);
}

function OnLoad(eContext) {
  // Get formContext
  var formContext = eContext.getFormContext();

  // Get the web resource control on the form
  var wrCtrl = formContext.getControl('WebResource_traveller');
  // Get the web resource inner content window
  if (wrCtrl !== null && wrCtrl !== undefined) {
    wrCtrl.getContentWindow().then(function (win) {
      win.InitializeButton(eContext);
    });
  }
}

function populateCurrentUser(eContext, userFieldName) {
  var formContext = eContext.getFormContext();
  var globalContext = Xrm.Utility.getGlobalContext();
  var isCreateForm = formContext.ui.getFormType() == 1;
  if (!isCreateForm) return;
  var field = formContext.getAttribute(userFieldName);
  if (field == null || field == 'undefined') return;

  var currentUser = new Array();
  currentUser[0] = new Object();
  currentUser[0].id = globalContext.userSettings.userId;
  currentUser[0].entityType = 'systemuser';
  globalContext.userSettings.userName;

  var userField = formContext.getAttribute(userFieldName);
  userField.setValue(currentUser);
  userField.setSubmitMode('always');
}

//function populateContactInfo(eContext, repFieldName, phoneFieldName) {

//  var formContext = eContext.getFormContext();

//  var field = formContext.getAttribute(repFieldName);

//  if (field == null || field == 'undefined') return;
//  if (field.getValue() == null) return;

//  var phoneField = formContext.getAttribute(phoneFieldName);
//  if (phoneField == null || phoneField == 'undefined') return;

//  debugger;
//  console.log(field.getValue()[0].id);
//  var contactId = field.getValue()[0].id;
//  contactId = contactId.substring(1, contactId.length - 1);

//  Xrm.WebApi.retrieveRecord('contact', contactId).then(function success(result) {
//    console.log(result);
//    phoneField.setValue(result.telephone1);
//  }, function (error) { console.log(error.message); });

//};

// Prefill a Date Field with Todays Date
function SetCallTime(eContext, fieldName) {
  var formContext = eContext.getFormContext();
  var isCreateForm = formContext.ui.getFormType() == 1;
  if (!isCreateForm) return;
  SetNow(eContext, fieldName);
}

function SetNow(eContext, fieldName) {
  var formContext = eContext.getFormContext();
  var field = formContext.getAttribute(fieldName);
  if (field == null || field == 'undefined') return;
  field.setValue(new Date()); // Set the Date field to Today
  field.setSubmitMode('always'); // Save Disabled Fields
}

function ShowHideWebResource(eContext, fieldName, confirmationFieldName, value, webResource) {
  var formContext = eContext.getFormContext();
  debugger;
  var field = formContext.getAttribute(fieldName);
  var confirmationField = formContext.getAttribute(confirmationFieldName);
  if (field == null || field == 'undefined') return;
  if (confirmationField == null || confirmationField == 'undefined') return;

  if (field.getValue() != value) {
    return;
  }
  //Only show the confirmation when 'Match found' is 'Yes' and 'Match found confirmation' is 'No'
  if (!(field.getValue() == value && confirmationField.getValue() != value)) {
    return;
  }
    //var wrCtrl = formContext.getControl(webResource);
    //if (wrCtrl == null || wrCtrl == 'undefined') return;
    //wrCtrl.setVisible(isVisible);
    
    //formContext.ui.setFormNotification("By clicking the proceed button, you will be redirected to the next page and will NOT be able to modify the information on this page.", "WARNING", "AlertMatchFoundConfirmation");
    var confirmStrings = { text: "By clicking the proceed button, you will be redirected to the next page and will NOT be able to modify the information on this page.", title: "Confirmation Match Found" };
    var confirmOptions = { height: 200, width: 450 };
    Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
      function (success) {
        if (success.confirmed) {
          console.log("Dialog closed using OK button.");
          proceed(eContext);
        }
        else {
          console.log("Dialog closed using Cancel button or X.");
          //If user cancels, reset the value.
          field.setValue(null);
        }
      });

    //if (isVisible) {
    //  console.log("set eContext");
    //  wrCtrl.getContentWindow().then(function (win) {
    //    win.InitializeButton(eContext);
    //  });
    //}
  
}

function ShowHideTabs(eContext, fieldName, value, tabs) {
  var formContext = eContext.getFormContext();

  var field = formContext.getAttribute(fieldName);
  if (field == null || field == 'undefined') return;

  var isVisible = false;

  if (field.getValue() == null) {
    isVisible = false;
  } else if (field.getValue() == value) {
    isVisible = true;
  }

  for (i = 0; i < tabs.length; i++) {
    var tab = formContext.ui.tabs.get(tabs[i]);
    if (tab == null || tab == 'undefined') return;
    tab.setVisible(isVisible);
  }
}
//'avs_name',
//  ['tab_FlightInformation', 'tab_PassengerInfo']

function ShowHideTextbox(eContext, optFieldName, value, txtFieldName) {
  var formContext = eContext.getFormContext();

  var optField = formContext.getAttribute(optFieldName);
  if (optField == null || optField == 'undefined') return;

  var targetField = formContext.getAttribute(txtFieldName);
  if (targetField == null || targetField == 'undefined') return;

  var txtField = formContext.getControl(txtFieldName);
  if (txtField == null || txtField == 'undefined') return;

  var isVisible = false;

  if (optField.getValue() == null) {
    isVisible = false;
  } else if (optField.getValue().includes(value)) {
    isVisible = true;
  }

  txtField.setVisible(isVisible);

  if (isVisible) {
    targetField.setRequiredLevel('required');
  } else {
    targetField.setRequiredLevel('none');
  }
}

function DisableSubgrid(eContext, gridName) {
  var formContext = eContext.getFormContext();
  var subGridCtrl = formContext.getControl(gridName);
  if (subGridCtrl == null) {
    return;
  }
  // Get the add button
  subGridCtrl.setDisabled(true);
}

function DisableGrid() {
  return false;
}

//Toggles display of the BPF. Takes the formcontext and the the name of the twoOption field that was changed as a string.
function showHideBusinessProcessFlow(eContext, twoOptionFieldName) {
  var formContext = eContext.getFormContext();
  var twoOptionFieldValue = formContext
    .getAttribute(twoOptionFieldName)
    .getValue();

  if (twoOptionFieldValue == null || twoOptionFieldValue == 'undefined') return;
  formContext.ui.process.setVisible(twoOptionFieldValue); //Shows BPF if twoOptionFieldValue is true, hides if false
}

//Sets the record status to the given status value
function setRecordStatus(eContext, statusValue) {
  var formContext = eContext.getFormContext();
  formContext.getAttribute('ppp_recordstatus').setValue(statusValue);
}

//Changes status to In-Progress only if passenger is present and current status is Draft
function statusChangeInProgress(eContext) {
  var formContext = eContext.getFormContext();
  var isPresent = formContext.getAttribute('ppp_ispresent').getValue();
  var recordStatus = formContext.getAttribute('ppp_recordstatus').getValue();

  if (isPresent && recordStatus == 927820001) {
    setRecordStatus(eContext, 927820003);
  } else if (!isPresent && recordStatus == 927820003) {
    setRecordStatus(eContext, 927820001);
  }
}

//Shows Passport Number if Passport was selected as an ID, hides if not
function showHidePassportNumber(eContext) {
  var formContext = eContext.getFormContext();
  var idUsedArray = formContext.getAttribute('ppp_idsused').getValue();
  var passportSelected = idUsedArray.includes(927820000);
  formContext.getControl('ppp_passportnumber').setVisible(passportSelected);
}

//If the valueField matched the desiredValue, set the given timeField to Now
function setTimeFieldNow(
  eContext,
  valueFieldName,
  desiredValue,
  timeFieldName
) {
  var formContext = eContext.getFormContext();
  var valueField = formContext.getAttribute(valueFieldName).getValue();
  if (valueField == desiredValue) {
    formContext.getAttribute(timeFieldName).setValue(new Date());
  }
}

function setDateTime(
  eContext,
  dateFieldName,
  hourFieldName,
  minuteFieldName,
  dateTimeField
) {
  var formContext = eContext.getFormContext();
  var date = formContext.getAttribute(dateFieldName).getValue();
  var hour = formContext.getAttribute(hourFieldName).getValue();
  var minute = formContext.getAttribute(minuteFieldName).getValue();
  if (date && hour && minute) {
    var dateTime = date;
    dateTime.setHours(hour);
    dateTime.setMinutes(minute);
    formContext.getAttribute(dateTimeField).setValue(dateTime);
  }
}

function showHideMatchConfirmed(eContext) {
  var formContext = eContext.getFormContext();
  var firstName = formContext.getAttribute("ppp_firstname").getValue();
  var lastName = formContext.getAttribute("ppp_lastname").getValue();
  var gender = formContext.getAttribute("ppp_gender").getValue();
  var dateOfBirth = formContext.getAttribute("ppp_dateofbirth").getValue();
  var isPresent = formContext.getAttribute("ppp_ispresent").getValue();
  var haveProceeded = formContext.getAttribute("ppp_matchfoundconfirmation").getValue();

  if (firstName && lastName && gender && dateOfBirth && isPresent && !haveProceeded) {
    formContext.getControl("ppp_matchfound").setDisabled(false);
    formContext.getControl("WebResource_traveller").setVisible(false);
  } else {
    formContext.getControl("ppp_matchfound").setDisabled(true);
    formContext.getControl("WebResource_traveller").setVisible(true);
    if (!haveProceeded) {
      formContext.getAttribute("ppp_matchfound").setValue(null);
    }
  }
  if (!recordIsNotClosed(formContext)) {
    formContext.getControl("ppp_matchfound").setDisabled(true);
  }
  if (haveProceeded) {
    formContext.getControl("ppp_matchfound").setDisabled(true);
    formContext.getControl("WebResource_traveller").setVisible(false);
  }
}

function ReadOnlyOnClosed(eContext, keepLockedList, keepUnlockedList) {
  var formContext = eContext.getFormContext();
  var recordStatus = formContext.getAttribute('ppp_recordstatus').getValue();
  var recordClosed = recordStatus == 927820002 || recordStatus == 927820005;
  toggleDisabledAllControls(eContext, recordClosed, keepLockedList, keepUnlockedList);

  //Disable the add existing buttons on all grids.
  RefreshGridRibbon(formContext, 'gridCallHistory');
  RefreshGridRibbon(formContext, 'gridFlightConnections');
  RefreshGridRibbon(formContext, 'gridFlightConnections2');
}

function toggleDisabledAllControls(eContext, disable, keepLockedList, keepUnlockedList) {
    var formContext = eContext.getFormContext();

    //Toggle everything to match record closed status
    formContext.ui.controls.forEach(function (attribute) {
      var control = formContext.getControl(attribute.getName());
      if (control) {
        control.setDisabled(disable);
      }
    });
  //Lock everything in KeepLockedList
  if (keepLockedList) {
    keepLockedList.forEach(function (attributeName) {
      var control = formContext.getControl(attributeName);
      if (control) {
        control.setDisabled(true);
      }
    });
  }

  //Unlock everything in KeepUnlockedList
  if (keepUnlockedList) {
    keepUnlockedList.forEach(function (attributeName) {
      var control = formContext.getControl(attributeName);
      if (control) {
        control.setDisabled(false);
      }
    });
  }
}

function RefreshGridRibbon(formContext, gridName) {
  var gridContext = formContext.getControl(gridName);
  if (gridContext == null || gridContext == 'undefined') return;
  gridContext.refreshRibbon();
}

function recordIsNotClosed(primaryControl) {
  var formContext = primaryControl;
  var recordStatus = formContext.getAttribute('ppp_recordstatus').getValue();

  return !(recordStatus == 927820002 || recordStatus == 927820005);
}

function refreshConnectionGrid() {
  //refreshRibbon();
  //formContext.ui.refreshRibbon();
}

function setAttributesRequirementLevel(eContext, attributes, requirementLevel) {
  var formContext = eContext.getFormContext();
  attributes.forEach(attributeName => {
    formContext.getAttribute(attributeName).setRequiredLevel(requirementLevel);
  });
}

//If starting attribute doesn't exist, make nothing required and lock.
//If starting attribute exists, require fields, and lock everything if record is closed, unlock if not closed.
function setStartingFormState(eContext, startingAttribute, requiredAttributes, keepLockedList, keepUnLockedList) {
  var formContext = eContext.getFormContext();
  if (formContext.getAttribute(startingAttribute).getValue() == null) {
    setAttributesRequirementLevel(eContext, requiredAttributes, "none");
    toggleDisabledAllControls(eContext, true, [], [])
  } else {
    setAttributesRequirementLevel(eContext, requiredAttributes, "required");
    toggleDisabledAllControls(eContext, !recordIsNotClosed(formContext), keepLockedList, keepUnLockedList);
  }
}

function showHideFlightConnections(eContext, connectionCountName, maxConnections) {
  var formContext = eContext.getFormContext();
  var connectionCount = formContext.getAttribute(connectionCountName).getValue();
  for (var i = 1; i <= maxConnections; i++) {
    if (connectionCount >= i) {
      formContext.getControl("ppp_flightconnection" + i).setVisible(true);
      formContext.getAttribute("ppp_flightconnection" + i).setRequiredLevel("required");
      formContext.getControl("ppp_flightconnection" + i + "1").setVisible(true);
    } else {
      formContext.getControl("ppp_flightconnection" + i).setVisible(false);
      formContext.getAttribute("ppp_flightconnection" + i).setRequiredLevel("none");
      formContext.getControl("ppp_flightconnection" + i + "1").setVisible(false);
      formContext.getAttribute("ppp_flightconnection" + i).setValue(null);
    }
  }
}

function flightValidation(eContext, flightNameArray) {
  var globalContext = Xrm.Utility.getGlobalContext();
  var formContext = eContext.getFormContext();
  for (var i = 0; i < flightNameArray.length; i++) {
    formContext.getControl(flightNameArray[i]).clearNotification();
  }
  for (var x = 0; x < flightNameArray.length; x++) {
    var flightX = formContext.getAttribute(flightNameArray[x])
    for (var y = 0; y < flightNameArray.length; y++) {
      var flightY = formContext.getAttribute(flightNameArray[y])
      if (x != y && flightX.getValue() != null && flightY.getValue() != null && flightX.getValue()[0].id == flightY.getValue()[0].id) {
        if (globalContext.userSettings.languageId == 1033) {
          formContext.getControl(flightNameArray[x]).setNotification("Duplicate aerodromes not permitted.");
          formContext.getControl(flightNameArray[y]).setNotification("Duplicate aerodromes not permitted.");
        } else {
          formContext.getControl(flightNameArray[x]).setNotification("Duplicate aerodromes not permitted. (fr)");
          formContext.getControl(flightNameArray[y]).setNotification("Duplicate aerodromes not permitted. (fr)");
        }
      }
    }
  }
}