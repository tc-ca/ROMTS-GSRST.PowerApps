"use strict";
var ROM;
(function (ROM) {
    var RiskThreshold;
    (function (RiskThreshold) {
        // EVENTS
        function operationFrequencyOnChange(eContext) {
            try {
                var form = eContext.getFormContext();
                var test = "123";
            }
            catch (e) {
                throw new Error(e.Message);
            }
        }
        RiskThreshold.operationFrequencyOnChange = operationFrequencyOnChange;
    })(RiskThreshold = ROM.RiskThreshold || (ROM.RiskThreshold = {}));
})(ROM || (ROM = {}));
