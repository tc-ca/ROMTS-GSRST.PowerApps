"use strict";
var TSIS;
(function (TSIS) {
    var PPP;
    (function (PPP) {
        var Form;
        var currentRecordStatus;
        /*
        function SaveOnLoad(eContext) {
            Form = eContext.getFormContext();
            if (Form.getAttribute('ppp_name').getValue() == null)
                Form.data.save();
        }
        PPP.SaveOnLoad = SaveOnLoad;
        function proceed(eContext) {
            //var eContext = window.parentExecutionContext;
            Form = eContext.getFormContext();
            Form.getAttribute('ppp_matchfoundtime').setValue(new Date());
            Form.data.save();
            Form.getControl('WebResource_traveller').setVisible(false);
            ToggleTabs(eContext);
            Form.ui.tabs.get('tab_DetailedTravellerInformation').setFocus();
        }
        PPP.proceed = proceed;
        function ToggleTabs(eContext) {
            //var eContext = window.parentExecutionContext;
            //confirmation.setSubmitMode("Always");
            ShowHideTabs(eContext);
        }
        PPP.ToggleTabs = ToggleTabs;

        function ShowHideTabs(eContext) {
            Form = eContext.getFormContext();
            var field = Form.getAttribute('ppp_matchfound');
            var matchfound = false;
            // 927820000 is Yes
            if (field.getValue() == 927820000) {
                matchfound = true;
            }
            Form.ui.tabs.get('tab_TravellerInformation').setVisible(!matchfound);
            Form.ui.tabs.get('tab_DetailedTravellerInformation').setVisible(matchfound);
            Form.ui.tabs.get('tab_TravelDetails').setVisible(matchfound);
            Form.ui.tabs.get('tab_RecommendedAction').setVisible(matchfound);
            Form.ui.tabs.get('tab_Decision').setVisible(matchfound);
        }
        PPP.ShowHideTabs = ShowHideTabs;
        */
        function setDateTime(eContext, dateFieldName, hourFieldName, minuteFieldName, dateTimeField) {
            Form = eContext.getFormContext();
            var dateValue = null;
            var hour = null;
            var minute = null;
            var dateAttr = Form.getAttribute(dateFieldName);
            if (dateAttr == undefined)
                return;
            // if(date==null)return;
            var hourAttr = Form.getAttribute(hourFieldName);
            if (hourAttr == undefined)
                return;
            var minuteAttr = Form.getAttribute(minuteFieldName);
            if (minuteAttr == undefined)
                return;
            var dateTimeAttr = Form.getAttribute(dateTimeField);
            if (dateTimeAttr == undefined)
                return;
            dateValue = dateAttr.getValue();
            hour = hourAttr.getValue();
            minute = minuteAttr.getValue();
            if (dateValue !== null && hour !== null && minute !== null) {
                var dateTime = dateValue;
                dateTime.setHours(hour);
                dateTime.setMinutes(minute);
                dateTimeAttr.setValue(dateTime);
            }
        }
        PPP.setDateTime = setDateTime;
        function ReadOnlyOnClosed(eContext, keepLockedList, keepUnlockedList) {
            Form = eContext.getFormContext();
            var recordStatus = Form.getAttribute('ppp_recordstatus').getValue();
            var recordClosed = recordStatus == 927820002 /* Closed */ ||
                recordStatus == 927820005 /* Unresolved */;
            toggleDisabledAllControls(eContext, recordClosed, keepLockedList, keepUnlockedList);
        }
        PPP.ReadOnlyOnClosed = ReadOnlyOnClosed;
        function showHideFlightConnections(eContext, maxConnections) {
            Form = eContext.getFormContext();
            var connectionCount = Form.getAttribute('ppp_numberofflightconnection').getValue();
            if (connectionCount == null)
                connectionCount = 0;
            for (var i = 1; i <= maxConnections; i++) {
                var connectionControl = Form.getControl('ppp_flightconnection' + i);
                if (connectionControl == undefined)
                    continue;
                var connectionControl2 = Form.getControl('ppp_flightconnection' + i + '1');
                if (connectionControl2 == undefined)
                    continue;
                var connectionAttr = Form.getAttribute('ppp_flightconnection' + i);
                if (connectionAttr == undefined)
                    continue;
                if (connectionCount >= i) {
                    connectionControl.setVisible(true);
                    connectionAttr.setRequiredLevel('required');
                    connectionControl2.setVisible(true);
                }
                else {
                    connectionControl.setVisible(false);
                    connectionControl2.setVisible(false);
                    connectionAttr.setRequiredLevel('none');
                    connectionAttr.setValue(null);
                }
            }
        }
        PPP.showHideFlightConnections = showHideFlightConnections;
        function flightValidation(eContext, flightNameArray) {
            var globalContext = Xrm.Utility.getGlobalContext();
            Form = eContext.getFormContext();
            var errorMsg = 'Duplicate aerodromes not permitted.';
            if (globalContext.userSettings.languageId == 1036) {
                errorMsg = 'Duplicate aerodromes not permitted. (fr)';
            }
            for (var i = 0; i < flightNameArray.length; i++) {
                var connectionControl = Form.getControl(flightNameArray[i]);
                if (connectionControl == undefined)
                    continue;
                (connectionControl).clearNotification();
            }
            for (var x = 0; x < flightNameArray.length; x++) {
                var flightX = Form.getAttribute(flightNameArray[x]);
                var flightXId;
                if (flightX == undefined)
                    continue;
                var flightXFacility = (flightX).getValue();
                if (flightXFacility == null)
                    continue;
                else {
                    flightXId = flightXFacility[0].id;
                }
                for (var y = x + 1; y < flightNameArray.length; y++) {
                    var flightY = Form.getAttribute(flightNameArray[y]);
                    var flightYId;
                    if (flightY == undefined)
                        continue;
                    var flightYFacility = (flightY).getValue();
                    if (flightYFacility == null)
                        continue;
                    else {
                        flightYId = flightYFacility[0].id;
                    }
                    if (flightXId == flightYId) {
                        var connectionControlX = Form.getControl(flightNameArray[x]);
                        if (connectionControlX == undefined)
                            continue;
                        var connectionControlY = Form.getControl(flightNameArray[y]);
                        if (connectionControlY == undefined)
                            continue;
                        (connectionControlX).setNotification(errorMsg);
                        (connectionControlY).setNotification(errorMsg);
                    }
                }
            }
        }
        PPP.flightValidation = flightValidation;
    })(PPP = TSIS.PPP || (TSIS.PPP = {}));
})(TSIS || (TSIS = {}));
