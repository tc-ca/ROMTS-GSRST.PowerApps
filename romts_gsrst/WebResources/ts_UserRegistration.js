
function OnChangeAADUser(executionContext){
    var formContext = executionContext.getFormContext();
    var aaduserid = formContext.getAttribute("ts_aaduser").getValue();
    
    if(typeof Xrm === "undefined")
    {
        var Xrm = parent.Xrm;
    }
    Xrm.WebApi.retrieveRecord("aaduser", aaduserid[0].id, "?$select=userprincipalname").then(
        function success(result) {
            console.log("Retrieved values: Name: " + result.userprincipalname );
            formContext.getAttribute("ts_name").setValue(result.userprincipalname);
        },
        function (error) {
            console.log(error.message);
            // handle error conditions
        }
    );


}
