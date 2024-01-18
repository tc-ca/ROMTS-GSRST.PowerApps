"use strict";
var ROM;
(function (ROM) {
    var OperationType;
    (function (OperationType) {
        // export function onSave(eContext: Xrm.ExecutionContext<any, any>): void {
        //     const form = <Form.ovs_operationtype.Main.Information>eContext.getFormContext();
        //     if(form.ui.getFormType() == 1 || form.ui.getFormType() == 2){
        //         Xrm.Utility.getGlobalContext().userSettings.languageId == 1033;
        //     }
        // }
        function nameOnChange(eContext) {
            // const form = <Form.ovs_operationtype.Main.Information>eContext.getFormContext();
            // const nameAttribute = form.getAttribute("ovs_name");
            // const nameFrenchAttribute = form.getAttribute("ovs_operationtypenamefrench");
            // const nameEnglishAttribute = form.getAttribute("ovs_operationtypenameenglish");
            // if (nameAttribute != null) {
            //     const nameAttributeValue = nameAttribute.getValue();
            //     Xrm.Utility.getGlobalContext().userSettings.languageId == 1033 ? nameEnglishAttribute.setValue(nameAttributeValue) : nameFrenchAttribute.setValue(nameAttributeValue);
            // }
            generalNameOnChange(eContext, 'ovs_name', 'ovs_operationtypenamefrench', 'ovs_operationtypenameenglish');
        }
        OperationType.nameOnChange = nameOnChange;
        function frenchNameOnChange(eContext) {
            // const form = <Form.ovs_operationtype.Main.Information>eContext.getFormContext();
            // const nameAttribute = form.getAttribute("ovs_name");
            // const nameFrenchAttribute = form.getAttribute("ovs_operationtypenamefrench");
            // const nameFrenchAttributeValue = nameFrenchAttribute.getValue();
            // if (Xrm.Utility.getGlobalContext().userSettings.languageId == 1036) {
            //     nameAttribute.setValue(nameFrenchAttributeValue);
            // }
            generalFrenchNameOnChange(eContext, 'ovs_name', 'ovs_operationtypenamefrench');
        }
        OperationType.frenchNameOnChange = frenchNameOnChange;
        function englishNameOnChange(eContext) {
            // const form = <Form.ovs_operationtype.Main.Information>eContext.getFormContext();
            // const nameAttribute = form.getAttribute("ovs_name");
            // const nameEnglishAttribute = form.getAttribute("ovs_operationtypenameenglish");
            // const nameEnglishAttributeValue = nameEnglishAttribute.getValue();
            // if (Xrm.Utility.getGlobalContext().userSettings.languageId == 1033) {
            //     nameAttribute.setValue(nameEnglishAttributeValue);
            // }
            generalEnglishNameOnChange(eContext, 'ovs_name', 'ovs_operationtypenameenglish');
        }
        OperationType.englishNameOnChange = englishNameOnChange;
    })(OperationType = ROM.OperationType || (ROM.OperationType = {}));
})(ROM || (ROM = {}));
