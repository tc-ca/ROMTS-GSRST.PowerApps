"use strict";
var TSIS;
(function (TSIS) {
    var PPP;
    (function (PPP) {
        var Form;
        function SaveOnLoadAC(eContext) {
            Form = eContext.getFormContext();
            if (Form.ui.getFormType() === 1 && Form.getAttribute('ppp_name').getValue() == null) {
                Form.data.save();
            }
        }
        PPP.SaveOnLoadAC = SaveOnLoadAC;
        function setDateTimeAC(eContext, dateFieldName, hourFieldName, minuteFieldName, dateTimeField) {
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
        PPP.setDateTimeAC = setDateTimeAC;
        function showHideFlightConnectionsAC(eContext, maxConnections) {
            Form = eContext.getFormContext();
            var connectionCount = Form.getAttribute('ppp_numberofflightconnection').getValue();
            if (connectionCount == null)
                connectionCount = 0;
            for (var i = 1; i <= maxConnections; i++) {
                var connectionControl = Form.getControl('ppp_flightconnection' + i);
                if (connectionControl == undefined)
                    continue;
                var connectionAttr = Form.getAttribute('ppp_flightconnection' + i);
                if (connectionAttr == undefined)
                    continue;
                if (connectionCount >= i) {
                    connectionControl.setVisible(true);
                    connectionAttr.setRequiredLevel('required');
                }
                else {
                    connectionControl.setVisible(false);
                    connectionAttr.setRequiredLevel('none');
                    connectionAttr.setValue(null);
                }
            }
        }
        PPP.showHideFlightConnectionsAC = showHideFlightConnectionsAC;
        function flightValidationAC(eContext, flightNameArray) {
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
        PPP.flightValidationAC = flightValidationAC;
        function showHideFlightComplianceAssesment(eContext, maxConnections) {
            Form = eContext.getFormContext();
            var connectionCount = Form.getAttribute('ppp_numberofnoncompliance').getValue();
            if (connectionCount == null)
                connectionCount = 1;
            for (var i = 1; i <= maxConnections; i++) {
                var connectionControl = Form.getControl('ppp_tsisnumber' + i);
                var connectionControl2 = Form.getControl('ppp_noncompliancedescription' + i);
                if (connectionControl == undefined || connectionControl2 == undefined)
                    continue;
                var connectionAttr = Form.getAttribute('ppp_tsisnumber' + i);
                var connectionAttr2 = Form.getAttribute('ppp_noncompliancedescription' + i);
                if (connectionAttr == undefined || connectionAttr2 == undefined)
                    continue;
                if (connectionCount >= i) {
                    connectionControl.setVisible(true);
                    connectionControl2.setVisible(true);
                    connectionAttr.setRequiredLevel('required');
                }
                else {
                    connectionControl.setVisible(false);
                    connectionControl2.setVisible(false);
                    connectionAttr.setValue(null);
                    connectionAttr2.setValue(null);
                    connectionAttr.setRequiredLevel('none');
                }
            }
        }
        PPP.showHideFlightComplianceAssesment = showHideFlightComplianceAssesment;
        function showHidePassengerComplianceAssesment(eContext, maxConnections) {
            Form = eContext.getFormContext();
            var connectionCount = Form.getAttribute('ppp_passengernumberofnoncompliance').getValue();
            if (connectionCount == null)
                connectionCount = 1;
            for (var i = 1; i <= maxConnections; i++) {
                var connectionControl = Form.getControl('ppp_typeofnoncompliance' + i);
                var connectionControl2 = Form.getControl('ppp_ruleid' + i);
                var connectionControl3 = Form.getControl('ppp_numberofpaxaffected' + i);
                var connectionControl4 = Form.getControl('ppp_passengernoncompliancedescription' + i);
                if (connectionControl == undefined || connectionControl2 == undefined || connectionControl3 == undefined || connectionControl4 == undefined)
                    continue;
                var connectionAttr = Form.getAttribute('ppp_typeofnoncompliance' + i);
                var connectionAttr2 = Form.getAttribute('ppp_ruleid' + i);
                var connectionAttr3 = Form.getAttribute('ppp_numberofpaxaffected' + i);
                var connectionAttr4 = Form.getAttribute('ppp_passengernoncompliancedescription' + i);
                if (connectionAttr == undefined || connectionAttr2 == undefined || connectionAttr3 == undefined || connectionAttr4 == undefined)
                    continue;
                if (connectionCount >= i) {
                    connectionControl.setVisible(true);
                    connectionControl2.setVisible(true);
                    connectionControl3.setVisible(true);
                    connectionControl4.setVisible(true);
                    connectionAttr.setRequiredLevel('required');
                }
                else {
                    connectionControl.setVisible(false);
                    connectionControl2.setVisible(false);
                    connectionControl3.setVisible(false);
                    connectionControl4.setVisible(false);
                    connectionAttr.setValue(null);
                    connectionAttr2.setValue(null);
                    connectionAttr3.setValue(null);
                    connectionAttr4.setValue(null);
                    connectionAttr.setRequiredLevel('none');
                }
            }
        }
        PPP.showHidePassengerComplianceAssesment = showHidePassengerComplianceAssesment;
        function showHideFlightOrPassengerComplianceReviewTab(eContext) {
            var _a, _b, _c, _d, _e, _f;
            Form = eContext.getFormContext();
            var recordType = Form.getAttribute('ppp_recordtype').getValue();
            // Define field lists
            var passengerFields = ["ppp_passengernumberofnoncompliance", "ppp_typeofnoncompliance1", "ppp_ruleid1", "ppp_numberofpaxaffected1", "ppp_passengernoncompliancedescription1", "ppp_typeofnoncompliance2", "ppp_ruleid2", "ppp_numberofpaxaffected2", "ppp_passengernoncompliancedescription2", "ppp_typeofnoncompliance3", "ppp_ruleid3", "ppp_numberofpaxaffected3", "ppp_passengernoncompliancedescription3", "ppp_typeofnoncompliance4", "ppp_ruleid4", "ppp_numberofpaxaffected4", "ppp_passengernoncompliancedescription4", "ppp_typeofnoncompliance5", "ppp_ruleid5", "ppp_numberofpaxaffected5", "ppp_passengernoncompliancedescription5", "ppp_typeofnoncompliance6", "ppp_ruleid6", "ppp_numberofpaxaffected6", "ppp_passengernoncompliancedescription6", "ppp_typeofnoncompliance7", "ppp_ruleid7", "ppp_numberofpaxaffected7", "ppp_passengernoncompliancedescription7", "ppp_typeofnoncompliance8", "ppp_ruleid8", "ppp_numberofpaxaffected8", "ppp_passengernoncompliancedescription8", "ppp_typeofnoncompliance9", "ppp_ruleid9", "ppp_numberofpaxaffected9", "ppp_passengernoncompliancedescription9", "ppp_typeofnoncompliance10", "ppp_ruleid10", "ppp_numberofpaxaffected10", "ppp_passengernoncompliancedescription10"];
            var flightFields = ["ppp_numberofnoncompliance", "ppp_tsisnumber1", "ppp_noncompliancedescription1", "ppp_tsisnumber2", "ppp_noncompliancedescription2", "ppp_tsisnumber3", "ppp_noncompliancedescription3", "ppp_tsisnumber4", "ppp_noncompliancedescription4", "ppp_tsisnumber5", "ppp_noncompliancedescription5", "ppp_tsisnumber6", "ppp_noncompliancedescription6", "ppp_tsisnumber7", "ppp_noncompliancedescription7", "ppp_tsisnumber8", "ppp_noncompliancedescription8", "ppp_tsisnumber9", "ppp_noncompliancedescription9", "ppp_tsisnumber10", "ppp_noncompliancedescription10"];
            var typeOfNonCompliance = Form.getAttribute('ppp_typeofnoncompliance1');
            if (recordType === 927820000) {
                // recordType is Flight
                (_a = Form.ui.tabs.get("Compliance_Review_Flight")) === null || _a === void 0 ? void 0 : _a.setVisible(true);
                (_b = Form.ui.tabs.get("Compliance_Review_Passenger")) === null || _b === void 0 ? void 0 : _b.setVisible(false);
                clearAndMakeFieldsOptional(Form, passengerFields);
                // Re-evaluate visibility of passenger fields
                showHideFlightComplianceAssesment(eContext, 10);
            }
            else if (recordType === 927820001) {
                // recordType is Passenger
                (_c = Form.ui.tabs.get("Compliance_Review_Flight")) === null || _c === void 0 ? void 0 : _c.setVisible(false);
                (_d = Form.ui.tabs.get("Compliance_Review_Passenger")) === null || _d === void 0 ? void 0 : _d.setVisible(true);
                typeOfNonCompliance.setRequiredLevel('required');
                clearAndMakeFieldsOptional(Form, flightFields);
                // Re-evaluate visibility of passenger fields
                showHidePassengerComplianceAssesment(eContext, 10);
            }
            else {
                // Hide both if the recordType is neither Flight nor Passenger
                (_e = Form.ui.tabs.get("Compliance_Review_Flight")) === null || _e === void 0 ? void 0 : _e.setVisible(false);
                (_f = Form.ui.tabs.get("Compliance_Review_Passenger")) === null || _f === void 0 ? void 0 : _f.setVisible(false);
                clearAndMakeFieldsOptional(Form, flightFields);
                clearAndMakeFieldsOptional(Form, passengerFields);
            }
        }
        PPP.showHideFlightOrPassengerComplianceReviewTab = showHideFlightOrPassengerComplianceReviewTab;
        function clearAndMakeFieldsOptional(eContext, fieldsNames) {
            fieldsNames.forEach(function (field) {
                var attribute = eContext.getAttribute(field);
                if (attribute) {
                    attribute.setValue(null);
                    attribute.setRequiredLevel("none");
                }
            });
        }
        function setRequiredFlightFieldsAC(eContext) {
            Form = eContext.getFormContext();
            var fieldsToRequire = ["ppp_recordtype", "ppp_aircarrier", "ppp_flightorigindate", "ppp_flightorigin", "ppp_flightdestination"];
            var refNumber = Form.getAttribute("ppp_name").getValue();
            var requirementLevel = refNumber ? "required" : "none";
            fieldsToRequire.forEach(function (fieldName) {
                var attribute = Form.getAttribute(fieldName);
                if (attribute) {
                    attribute.setRequiredLevel(requirementLevel);
                }
            });
        }
        PPP.setRequiredFlightFieldsAC = setRequiredFlightFieldsAC;
        function ReadOnlyOnClosedAC(eContext, keepLockedList, keepUnlockedList) {
            Form = eContext.getFormContext();
            var recordStatus = Form.getAttribute('ppp_recordstatus').getValue();
            var recordClosed = recordStatus == 927820002 /* Closed */ ||
                recordStatus == 927820001 /* Monitor */;
            PPP.toggleDisabledAllControlsAC(eContext, recordClosed, keepLockedList, keepUnlockedList);
        }
        PPP.ReadOnlyOnClosedAC = ReadOnlyOnClosedAC;
        function statusOnChangeAC(eContext, keepLockedList, keepUnlockedList) {
            Form = eContext.getFormContext();
            var recordStatus = Form.getAttribute('ppp_recordstatus').getValue();
            var recordClosed = recordStatus == 927820002 /* Closed */ ||
                recordStatus == 927820001 /* Monitor */;
            if (recordClosed) {
                Form.data.save();
            }
            if (Form.data.isValid()) {
                toggleDisabledAllControlsAC(eContext, recordClosed, keepLockedList, keepUnlockedList);
            }
        }
        PPP.statusOnChangeAC = statusOnChangeAC;
        function toggleDisabledAllControlsAC(eContext, disable, keepLockedList, keepUnlockedList) {
            Form = eContext.getFormContext();
            //Toggle everything to match record closed status
            Form.ui.controls.forEach(function (control) {
                if (control != undefined) {
                    control.setDisabled(disable);
                }
            });
            //Lock everything in KeepLockedList
            if (keepLockedList) {
                keepLockedList.forEach(function (attributeName) {
                    var control = Form.getControl(attributeName);
                    if (control != undefined) {
                        control.setDisabled(true);
                    }
                });
            }
            //Unlock everything in KeepUnlockedList
            if (keepUnlockedList) {
                keepUnlockedList.forEach(function (attributeName) {
                    var control = Form.getControl(attributeName);
                    if (control) {
                        control.setDisabled(false);
                    }
                });
            }
        }
        PPP.toggleDisabledAllControlsAC = toggleDisabledAllControlsAC;
    })(PPP = TSIS.PPP || (TSIS.PPP = {}));
})(TSIS || (TSIS = {}));
