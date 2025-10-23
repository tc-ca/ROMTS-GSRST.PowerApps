"use strict";
var ROM;
(function (ROM) {
    var TripInspectorQuickCreate;
    (function (TripInspectorQuickCreate) {
        // EVENTS
        function onLoad(eContext) {
            var form = eContext.getFormContext();
            var tripLookup = form.getAttribute("ts_trip").getValue();
            if (tripLookup && tripLookup.length > 0) {
                console.log("Trip lookup is populated automatically:", tripLookup);
                var tripId = tripLookup[0].id.replace("{", "").replace("}", "");
                console.log("Trip ID found on Quick Create:", tripId);
                // Retrieve the ts_region value from the parent Trip record
                Xrm.WebApi.retrieveRecord("ts_trip", tripId, "?$select=_ts_region_value").then(function success(result) {
                    var regionId = result["_ts_region_value"];
                    if (regionId) {
                        console.log("Trip Region retrieved:", regionId);
                        filterInspectorByRegion(form, regionId);
                    }
                    else {
                        console.log("Trip has no region set. No filter applied.");
                    }
                }, function (error) {
                    console.error("Error retrieving Trip region:", error.message);
                });
            }
        }
        TripInspectorQuickCreate.onLoad = onLoad;
        function filterInspectorByRegion(form, regionId) {
            var inspectorLookup = form.getControl("ts_inspector");
            inspectorLookup.addPreSearch(function () {
                var filterXml = "\n            <filter type=\"and\">\n                <condition attribute=\"territoryid\" operator=\"eq\" value=\"".concat(regionId, "\" />\n            </filter>");
                inspectorLookup.addCustomFilter(filterXml, "systemuser");
            });
        }
    })(TripInspectorQuickCreate = ROM.TripInspectorQuickCreate || (ROM.TripInspectorQuickCreate = {}));
})(ROM || (ROM = {}));
