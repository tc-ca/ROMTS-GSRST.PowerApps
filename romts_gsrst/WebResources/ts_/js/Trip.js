"use strict";
/* eslint-disable @typescript-eslint/triple-slash-reference */
var ROM;
(function (ROM) {
    var Trip;
    (function (Trip) {
        // EVENTS
        function onLoad(eContext) {
            var form = eContext.getFormContext();
            if (userHasRole("System Administrator|ROM - Business Admin|ROM - Planner|ROM - Manager")) {
                form.getControl("ts_fiscalyear").setDisabled(false);
                //form.getAttribute("ts_fiscalyear").setRequiredLevel("required");
                console.log("Enable role");
            }
            else {
                form.getControl("ts_fiscalyear").setDisabled(true);
            }
            //form.getAttribute("ts_plannedfiscalquarter").setRequiredLevel("required");
            //form.getAttribute("ts_region").setRequiredLevel("required");
        }
        Trip.onLoad = onLoad;
        function userHasRole(rolesName) {
            var userRoles = Xrm.Utility.getGlobalContext().userSettings.roles;
            var hasRole = false;
            var roles = rolesName.split("|");
            roles.forEach(function (roleItem) {
                userRoles.forEach(function (userRoleItem) {
                    if (userRoleItem.name.toLowerCase() == roleItem.toLowerCase())
                        hasRole = true;
                });
            });
            return hasRole;
        }
        Trip.userHasRole = userHasRole;
    })(Trip = ROM.Trip || (ROM.Trip = {}));
})(ROM || (ROM = {}));
