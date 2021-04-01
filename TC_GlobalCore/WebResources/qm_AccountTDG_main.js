///<reference path="../../Utilities/GlobalHelper.js"/>
///<reference path="../../Utilities/questionnaireFunctions.js"/>

var AccountTDGmain = (function (window, document) {

     //variables
    var formType;
     //optionset value: form name
    var formMapping = {
        "948010001": "TDG Site Profile",
        "948010000": "TDG Organizations",
    };

    //********************private methods*******************


    //********************private methods end***************

    //********************public methods***************
    return {


        OnLoad: function (executionContext) {

            var formContext = executionContext.getFormContext();

            // 0 = Undefined, 1 = Create, 2 = Update, 3 = Read Only, 4 = Disabled, 6 = Bulk Edit
            formType = glHelper.GetFormType(formContext);
            
            var rTypeCode = formContext.getAttribute("customertypecode");
            rTypeCode.removeOnChange(AccountTDGmain.relationShip_OnChange); // avoid binding multiple event handlers
            rTypeCode.addOnChange(AccountTDGmain.relationShip_OnChange);

            if (formType > 1) rTypeCode.fireOnChange();
        },

        relationShip_OnChange: function (executionContext) {

            var formContext = executionContext.getFormContext();

            var rType = glHelper.GetValue(formContext, "customertypecode");
            if (rType == "948010001")
                glHelper.SwitchFormByName(formContext, formMapping["948010001"]);

        },
    }
    //********************public methods end***************

})(window, document);