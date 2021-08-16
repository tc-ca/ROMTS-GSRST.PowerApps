"use strict";
var ROM;
(function (ROM) {
    var QuestionnaireVersion;
    (function (QuestionnaireVersion) {
        function onLoad(eContext) {
            setNotificationMessage(eContext);
        }
        QuestionnaireVersion.onLoad = onLoad;
        function dateOnChange(eContext) {
            setNotificationMessage(eContext);
        }
        QuestionnaireVersion.dateOnChange = dateOnChange;
        function getDateNow() {
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0');
            var yyyy = today.getFullYear();
            var dateNow = yyyy + '/' + mm + '/' + dd;
            return dateNow;
        }
        function setNotificationMessage(eContext) {
            var form = eContext.getFormContext();
            var message;
            //   var dateNow = Date.parse(getDateNow());
            var dateStartAttribute = form.getAttribute("ts_effectivestartdate");
            var dateEndAttribute = form.getAttribute("ts_effectiveenddate");
            var dateStartAttributeValue = dateStartAttribute.getValue();
            var dateEndAttributeValue = dateEndAttribute.getValue();
            //if (dateStartAttributeValue != null && dateEndAttributeValue != null) {
            //    const dateStartDate = Date.parse(dateStartAttributeValue);
            //    const dateEndDate = Date.parse(dateEndAttributeValue);       
            //    if (dateStartAttributeValue=="" && dateEndAttributeValue=="")
            //        message = "Draft";
            //    if (dateStartDate > dateNow && dateEndDate > dateNow)
            //        message = "Published (Awaiting Effective Date)";
            //    if (dateStartDate < dateNow && (dateEndAttributeValue=="" || dateEndDate > dateNow))
            //        message = "Published (In Effect)";
            //    if (dateStartDate < dateNow && dateEndDate < dateNow)
            //        message = "Published (Retired)";
            //    form.ui.setFormNotification(message, "INFO", "notification");
            ////}
            if (dateStartAttributeValue == null && dateEndAttributeValue == null)
                message = "Draft";
            if (dateStartAttributeValue && dateEndAttributeValue) {
                var dateStartDate = Date.parse(dateStartAttributeValue);
                var dateEndDate = Date.parse(dateEndAttributeValue);
                if (dateStartDate > Date.now() && dateEndDate > Date.now())
                    message = "Published (Awaiting Effective Date)";
                if (dateStartDate < Date.now() && dateEndDate < Date.now())
                    message = "Published (Retired)";
                if (dateStartDate < Date.now() && dateEndDate > Date.now())
                    message = "Published (In Effect)";
            }
            if (dateStartAttributeValue && dateEndAttributeValue == null) {
                var dateStartDate = Date.parse(dateStartAttributeValue);
                if (dateStartDate < Date.now())
                    message = "Published (In Effect)";
            }
            form.ui.setFormNotification(message, "INFO", "notification");
        }
    })(QuestionnaireVersion = ROM.QuestionnaireVersion || (ROM.QuestionnaireVersion = {}));
})(ROM || (ROM = {}));
