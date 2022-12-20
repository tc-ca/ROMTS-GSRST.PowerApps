
function OnChangeAADUser(executionContext){
    var formContext = executionContext.getFormContext();
    var aaduserid = formContext.getAttribute("ts_aaduser").getValue();
    if(aaduserid){
        if(typeof Xrm === "undefined")
        {
            var Xrm = parent.Xrm;
        }
        Xrm.WebApi.retrieveRecord("aaduser", aaduserid[0].id, "?$select=userprincipalname,surname,givenname").then(
            function success(result) {
                console.log("Retrieved values: Name: " + result.userprincipalname );
                formContext.getAttribute("ts_name").setValue(result.userprincipalname);
                formContext.getAttribute("ts_firstname").setValue(result.givenname);
                formContext.getAttribute("ts_lastname").setValue(result.surname);
            },
            function (error) {
                console.log(error.message);
                // handle error conditions
            }
        );

    }
}
