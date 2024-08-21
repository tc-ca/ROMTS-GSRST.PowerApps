var lang = parent.Xrm.Utility.getGlobalContext().userSettings.languageId;

function appendToWOST(formContext) {
    const questionnaireResponseGuid = formContext.data.entity.getId().replace(/({|})/g, '').toLowerCase();
    const activityTypeId = formContext.getAttribute("ts_activitytype")?.getValue()?.[0]?.id.replace(/({|})/g, '')?.toLowerCase() ?? '';
    const userId = Xrm.Utility.getGlobalContext().userSettings.userId.replace(/({|})/g, '').toLowerCase();
    var jsonData = {
        recordId: questionnaireResponseGuid,
        activityTypeId: activityTypeId ? activityTypeId : "",
        userId: userId,
        isAdminOrManager: isAdminOrManager()
    };
    var jsonString = JSON.stringify(jsonData).toString();
    // Centered Dialog
    var pageInput = {
        pageType: "custom",
        name: "ts_appendquestionnaireresponsetoservicetask_6789e", //Unique name of Custom page
        recordId: jsonString
           
    };

    var navigationOptions = {
        target: 2,
        position: 1,
        width: { value: 450, unit: "px" },
        height: { value: 550, unit: "px" },
        title: (lang == 1036) ? "Ajouter � la t�che de service" : "Append Questionnaire to Work Order Service Task"
    };
    Xrm.Navigation.navigateTo(pageInput, navigationOptions)
        .then(
        //function () {
        //    // Called when the dialog closes
        //    formContext.data.refresh();
        //}
    ).catch(
        function (error) {
            // Handle error
        }
    );
}

function isAdminOrManager(){
    const userRoles = Xrm.Utility.getGlobalContext().userSettings.roles;
    //If the user is a system admin or ROM - Manager, show the RATE manager review section
    let isAdminOrManager = false;
    userRoles.forEach(role => {
        if (role.name == "System Administrator" || role.name == "ROM - Manager") {
            isAdminOrManager = true;
        }
    });
    return isAdminOrManager;
}


// ###
// If(
//     IsAdminOrManager,
//     Filter(
//         'Work Orders',
//         Status = 'Status (Work Orders)'.Active  && 'Activity Type'.'Incident Type' = GUID(ActivityTypeId)
//     ),
//     Filter(
//         'Work Orders',
//         Status = 'Status (Work Orders)'.Active && Owner = UserGUID && 'Activity Type'.'Incident Type' = GUID(ActivityTypeId)
//     )

    
//     If(
//         IsAdminOrManager,
//         Filter(
//             'Work Orders',
//             Status = 'Status (Work Orders)'.Active &&
//             If(
//                 Not(IsBlank(ActivityTypeId)),
//                 'Activity Type'.'Incident Type' = GUID(ActivityTypeId),
//                 true
//             )
//         ),
//         Filter(
//             'Work Orders',
//             Status = 'Status (Work Orders)'.Active && 
//             Owner = UserGUID &&
//             If(
//                 Not(IsBlank(ActivityTypeId)),
//                 'Activity Type'.'Incident Type' = GUID(ActivityTypeId),
//                 true
//             )
//         )
//     )

//     The argument '{2BC59AA0-511A-EC11-B6E7-000D3A09CE95}' to 'GUID' function is not in a valid GUID format.