"use strict";
var ROM;
(function (ROM) {
    var User;
    (function (User) {
        function onLoad(eContext) {
            var formContext = eContext.getFormContext();
            var hasRole = userHasRole("System Administrator|ROM - Planner|ROM - AvSec Planner|ROM - ISSO Planner");
            if (hasRole) {
                formContext.ui.tabs.get("tab_scheduling").setVisible(true);
            }
        }
        User.onLoad = onLoad;
    })(User = ROM.User || (ROM.User = {}));
})(ROM || (ROM = {}));
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
