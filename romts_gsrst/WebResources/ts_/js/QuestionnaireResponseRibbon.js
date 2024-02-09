function appendToWOST(formContext) {
    const questionnaireResponseGuid = formContext.data.entity.getId().replace(/({|})/g, '').toLowerCase();
    // Centered Dialog
    var pageInput = {
        pageType: "custom",
        name: "ts_copyservicetask_50612", //Unique name of Custom page
        recordId: questionnaireResponseGuid
    };
    var navigationOptions = {
        target: 2,
        position: 1,
        width: { value: 450, unit: "px" },
        height: { value: 550, unit: "px" },
        title: (workorderRibbon_lang == 1036) ? "Ajouter à la tâche de service" : "Append to Work Order Service Task"
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
