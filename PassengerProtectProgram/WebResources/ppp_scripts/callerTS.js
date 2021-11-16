"use strict";
var TSIS;
(function (TSIS) {
    var PPP;
    (function (PPP) {
        // The Quick Create Form should not be able to be opened when the parent traveller form has a status of closed or unresolved
        function closeFormWhenParentTravellerStatusIsClosed(eContext) {
            var formContext = eContext.getFormContext();
            var travellerValue = formContext.getAttribute("ppp_traveller").getValue();
            var travellerId = travellerValue ? travellerValue[0].id : "";
            //Retrieve parent traveller record's record status
            Xrm.WebApi.retrieveRecord("ppp_traveller", travellerId, "?$select=ppp_recordstatus").then(function (result) {
                var parentTravellerIsClosed = (result.ppp_recordstatus == 927820002 || result.ppp_recordstatus == 927820005);
                if (parentTravellerIsClosed) {
                    formContext.ui.close();
                    return;
                }
            });
        }
        PPP.closeFormWhenParentTravellerStatusIsClosed = closeFormWhenParentTravellerStatusIsClosed;
        //Populates the name field for a new Caller record
        function buildNameText(eContext) {
            var formContext = eContext.getFormContext();
            //If the name has already been made, return
            if (formContext.getAttribute("ppp_name").getValue() != null) {
                return;
            }
            var travellerValue = formContext.getAttribute("ppp_traveller").getValue();
            var travellerName = travellerValue ? travellerValue[0].name : "";
            var travellerId = travellerValue ? travellerValue[0].id : "";
            Xrm.WebApi.retrieveMultipleRecords("ppp_caller", "?$select=ppp_name&$filter=_ppp_traveller_value eq " + travellerId).then(function success(result) {
                var currentCallerNumber = result.entities.length + 1;
                formContext.getAttribute("ppp_name").setValue(travellerName + "-" + currentCallerNumber);
            }, function (error) {
                var alertStrings = { text: error.message };
                var alertOptions = { height: 120, width: 260 };
                Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(function () { });
            });
        }
        PPP.buildNameText = buildNameText;
        function setDateTimeFieldsToNow(eContext) {
            var formContext = eContext.getFormContext();
            var name = formContext.getAttribute("ppp_name");
            //If a name has already been set, the caller record is not new, so the time fields should not be set.
            if (name.getValue() != null) {
                return;
            }
            var callDateTime = formContext.getAttribute("ppp_calldatetime");
            var callDate = formContext.getAttribute("ppp_calldate");
            var callTimeHour = formContext.getAttribute("ppp_calltimehour");
            var callTimeMinute = formContext.getAttribute("ppp_calltimeminute");
            var today = new Date();
            callDateTime === null || callDateTime === void 0 ? void 0 : callDateTime.setValue(today);
            callDate === null || callDate === void 0 ? void 0 : callDate.setValue(today);
            callTimeHour === null || callTimeHour === void 0 ? void 0 : callTimeHour.setValue(today.getHours());
            callTimeMinute === null || callTimeMinute === void 0 ? void 0 : callTimeMinute.setValue(today.getMinutes());
            /* Leaving this here if they want to swap to UTC converstions.
             *
            callDateTime.setValue(new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), today.getUTCHours(), today.getUTCMinutes()));
            callDate.setValue(new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
            callTimeHour.setValue(today.getUTCHours())
            callTimeMinute.setValue(today.getUTCMinutes())
            */
        }
        PPP.setDateTimeFieldsToNow = setDateTimeFieldsToNow;
    })(PPP = TSIS.PPP || (TSIS.PPP = {}));
})(TSIS || (TSIS = {}));
