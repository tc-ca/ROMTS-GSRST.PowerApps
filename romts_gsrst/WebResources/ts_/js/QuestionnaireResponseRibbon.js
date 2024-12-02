var lang = parent.Xrm.Utility.getGlobalContext().userSettings.languageId;

function appendToWOST(formContext) {
    const questionnaireResponseGuid = formContext.data.entity.getId().replace(/({|})/g, '').toLowerCase();
    const activityTypeId = formContext.getAttribute("ts_activitytype")?.getValue()?.[0]?.id.replace(/({|})/g, '')?.toLowerCase() ?? '';
    const userId = Xrm.Utility.getGlobalContext().userSettings.userId.replace(/({|})/g, '').toLowerCase();
ewwwwwwwwwZZZZZZZZZZZZZ
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

    
//     If(BVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
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