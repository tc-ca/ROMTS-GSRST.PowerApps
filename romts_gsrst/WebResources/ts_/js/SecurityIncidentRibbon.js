function generateInspection(primaryControl) {
    let stakeholder = primaryControl.getAttribute("ts_stakeholder").getValue();
    let site = primaryControl.getAttribute("ts_site").getValue();

    console.log("Stakeholder " + stakeholder[0].id)
    console.log("Site " + site[0].id)

    if(!stakeholder || !site){
        showAlertDialog("One of the following fields is not set: Reporting Company, Site, Operation", "Missing values");
    }

    const securityIncidentId = primaryControl.data.entity.getId().slice(1, -1);

    let stakeholderSliced = (stakeholder[0].id).slice(1, -1);
    let siteSliced = (site[0].id).slice(1, -1);


    //Create new inspection linked to current Security Inspection

    var data =
    {
        "msdyn_ServiceAccount@odata.bind": `/accounts(${(stakeholder[0].id).slice(1, -1)})`,
        "ts_Site@odata.bind": `/msdyn_functionallocations/(${(site[0].id).slice(1, -1)})`
    }

    Xrm.WebApi.createRecord("msdyn_workorder", data).then(
        function success(result) {
            showAlertDialog("WO Created", result.id);
            console.log("WO Created " + result.id)

            // relatedSecurityIncident = [
            //     {
            //         entityType: "ts_securityincident",
            //         id: securityIncidentId
            //     }
            // ];

            // const oneToManyAssociateRequest = {
            //     getMetadata: () => ({
            //         boundParameter: null,
            //         parameterTypes: {},
            //         operationType: 2,
            //         operationName: "Associate"
            //     }),

            //     relationship: "ts_securityincident_msdyn_workorder_SecurityIncident",

            //     target: {
            //         entityType: "msdyn_workorder",
            //         id: result.id
            //     },

            //     relatedEntities: relatedSecurityIncident
            // }

            // Xrm.WebApi.online.execute(oneToManyAssociateRequest).then(
            //     function(response) {
            //         if (response.ok) {
            //             console.log("Status: %s %s", response.status, response.statusText);
            //             showAlertDialog("OK", "Status:" + response.status + " " + response.statusText);
            //         }
            //     }
            // )
            // .catch(function(error) {
            //     console.log(error.message);
            //     showAlertDialog("Error", "error.message");
            // });
        },
        // function (error) {
        //     showAlertDialog("Error", error.message);
        // }
    )
}

function showAlertDialog(text, title){
    var alertStrings = { confirmButtonLabel: "OK", text: text, title: title };
    var alertOptions = { height: 200, width: 300 };
    Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
}