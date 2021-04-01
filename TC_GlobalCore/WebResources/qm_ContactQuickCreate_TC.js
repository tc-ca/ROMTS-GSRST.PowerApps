///<reference path="../../Utilities/GlobalHelper.js"/>
///<reference path="../../Utilities/questionnaireFunctions.js"/>

var Contact_QC_TC= (function (window, document) {


    return {


        OnLoad: function (executionContext) {

            var formContext = executionContext.getFormContext();


            if (window.top.QuickCreateHelper != null && window.top.QuickCreateHelper != undefined
                && window.top.QuickCreateHelper.site != null && window.top.QuickCreateHelper != undefined) {


                glHelper.SetLookup(formContext, "parentcustomerid", window.top.QuickCreateHelper.site.et, window.top.QuickCreateHelper.site.id, window.top.QuickCreateHelper.site.name);
                glHelper.SetDisabled(formContext, "parentcustomerid", true);
            }

        //parentcustomerid

        },
    }

})(window, document)