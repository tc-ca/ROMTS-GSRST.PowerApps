"use strict";
/* eslint-disable @typescript-eslint/triple-slash-reference */
var ROM;
(function (ROM) {
    var Account;
    (function (Account) {
        // EVENTS
        function onLoad(eContext) {
            console.log('Onload has been called');
            console.log('Xrm execution context: ', eContext);
            hideShowOperations(eContext);
            var form = eContext.getFormContext();
            var accountType = form.getAttribute('customertypecode').getValue();
            if (accountType != null)
                form.getControl('customertypecode').setDisabled(true);
        }
        Account.onLoad = onLoad;
        function hideShowOperations(eContext) {
            console.log('hideShowOperations has been called');
            console.log('Xrm execution context: ', eContext);
            var form = eContext.getFormContext();
            var accountType = form.getAttribute('customertypecode').getValue();
            if (accountType == 948010000 /* RegulatedEntity */) {
                form.getControl('regulated_entities_subgrid').setVisible(false);
                form.getControl('sites_subgrid').setVisible(true);
            }
            if (accountType == 948010001 /* Site */) {
                form.getControl('regulated_entities_subgrid').setVisible(true);
                form.getControl('sites_subgrid').setVisible(false);
            }
        }
        Account.hideShowOperations = hideShowOperations;
    })(Account = ROM.Account || (ROM.Account = {}));
})(ROM || (ROM = {}));
