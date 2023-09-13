"use strict";
var ROM;
(function (ROM) {
    var SuggestedInspection;
    (function (SuggestedInspection) {
        function onLoad(eContext) {
            var form = eContext.getFormContext();
            setOperationTypeFilteredView(form);
        }
        SuggestedInspection.onLoad = onLoad;
        function operationTypeOnChange(eContext) {
            var form = eContext.getFormContext();
            setStakeholderFilteredView(form);
        }
        SuggestedInspection.operationTypeOnChange = operationTypeOnChange;
        function stakeholderOnChange(eContext) {
            var form = eContext.getFormContext();
        }
        SuggestedInspection.stakeholderOnChange = stakeholderOnChange;
        function siteOnChange(eContext) {
            var form = eContext.getFormContext();
        }
        SuggestedInspection.siteOnChange = siteOnChange;
        function operationOnChange(eContext) {
            var form = eContext.getFormContext();
        }
        SuggestedInspection.operationOnChange = operationOnChange;
        function activityTypeOnChange(eContext) {
            var form = eContext.getFormContext();
        }
        SuggestedInspection.activityTypeOnChange = activityTypeOnChange;
        function setOperationTypeFilteredView(form) {
            var viewId = '{8982C38D-8BB4-4C95-BD05-493398FEAE99}';
            var entityName = "ovs_operationtype";
            //const viewDisplayName = Xrm.Utility.getResourceString("ovs_/resx/WorkOrder", "FilteredOperationTypes");
            var viewDisplayName = "Operation Types";
            var fetchXml = [
                "<fetch>",
                "  <entity name='ovs_operationtype'>",
                "    <attribute name='createdon'/>",
                "    <attribute name='ovs_name'/>",
                "    <attribute name='ovs_operationtypeid'/>",
                "    <link-entity name='businessunit' from='businessunitid' to='owningbusinessunit' alias='businessunit'>",
                "      <filter>",
                "        <condition attribute='name' operator='begins-with' value='Intermodal'/>",
                "      </filter>",
                "    </link-entity>",
                "    <link-entity name='ts_ovs_operationtypes_msdyn_incidenttypes' from='ovs_operationtypeid' to='ovs_operationtypeid' intersect='true'>",
                "      <link-entity name='msdyn_incidenttype' from='msdyn_incidenttypeid' to='msdyn_incidenttypeid' alias='incidenttype'>",
                "        <filter>",
                "          <condition attribute='msdyn_defaultworkordertype' operator='eq' value='b1ee680a-7cf7-ea11-a815-000d3af3a7a7' uiname='Inspection' uitype='msdyn_workordertype'/>",
                "        </filter>",
                "      </link-entity>",
                "    </link-entity>",
                "  </entity>",
                "</fetch>"
            ].join("");
            var layoutXml = '<grid name="resultset" object="10010" jump="name" select="1" icon="1" preview="1"><row name="result" id="ovs_operationtypeid"><cell name="ovs_name" width="200" /></row></grid>';
            form.getControl("ts_operationtype").addCustomView(viewId, entityName, viewDisplayName, fetchXml, layoutXml, true);
        }
        function setStakeholderFilteredView(form) {
            var operationTypeValue = form.getAttribute("ts_operationtype").getValue();
            var operationTypeId;
            if (operationTypeValue != null) {
                operationTypeId = operationTypeValue[0].id;
            }
            var viewId = '{8982C38D-8BB4-4C95-BD05-493398FEAE98}';
            var entityName = "account";
            //const viewDisplayName = Xrm.Utility.getResourceString("ovs_/resx/WorkOrder", "FilteredStakeholders");
            var viewDisplayName = "Stakeholders";
            var fetchXml = [
                "<fetch>",
                "  <entity name='account'>",
                "    <attribute name='accountid'/>",
                "    <attribute name='createdon'/>",
                "    <attribute name='name'/>",
                "    <link-entity name='ovs_operation' from='ts_stakeholder' to='accountid'>",
                "      <filter>",
                "        <condition attribute='ovs_operationtypeid' operator='eq' value='", operationTypeId, "'uitype='ovs_operationtype'/>",
                "      </filter>",
                "    </link-entity>",
                "  </entity>",
                "</fetch>"
            ].join("");
            var layoutXml = '<grid name="resultset" object="10010" jump="name" select="1" icon="1" preview="1"><row name="result" id="accountid"><cell name="name" width="200" /></row></grid>';
            form.getControl("ts_stakeholder").addCustomView(viewId, entityName, viewDisplayName, fetchXml, layoutXml, true);
        }
    })(SuggestedInspection = ROM.SuggestedInspection || (ROM.SuggestedInspection = {}));
})(ROM || (ROM = {}));
