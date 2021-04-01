

var qtnHelper = (function (window, document) {

    //********************global vars*******************

    //********************methods***************

    function SetReadOnlyValue(value) {
        var questionnaireVueInstance = document
            .querySelector("questionnaire-builder")
            .getVueInstance();

        questionnaireVueInstance.SetReadOnly(value);
    }

    function GetVueInstance(webResourceControl) {
        var webResourceObject = webResourceControl.getObject();
        console.log("webResourceObject:" + webResourceObject);

        if (!webResourceObject) {
            // IFrame is not visible or hidden, or the content window has not loaded
            return;
        }

        var contentWindow = webResourceObject["contentWindow"];
        console.log("contentWindow:" + contentWindow);

        var iFrameDocument = contentWindow.document;
        console.log("iFrameDocument:" + iFrameDocument);

        var questionnaireElement = iFrameDocument.querySelector("questionnaire-builder");
        console.log("questionnaireElement:" + questionnaireElement);

        var questionnaireVueInstance = questionnaireElement.getVueInstance();
        console.log("questionnaireVueInstance:" + questionnaireVueInstance);

        return questionnaireVueInstance;
    }

    async function InitializeQuestionnaireBuilder(dynParams) {
        try
        {
            let templateId   = dynParams.templateId;
            let userLang     = dynParams.userLang;
            let translations = glHelper.GetLocalizedStrings();

            Xrm.Utility.showProgressIndicator(translations.LoadingQuestionnaire);

            var questionnaireVueInstance = GetVueInstance(dynParams.webResourceControl);
    
            questionnaireVueInstance.setLanguage(userLang)

            const template = await GetTemplateById(templateId);
    
            // if issues revert to using await
            await GetLegislations()
                .then(function (legs) {
                    questionnaireVueInstance.SetLegislations(
                        legs,
                        'tree'
                    )
                });

            questionnaireVueInstance.Render(
                template,
            );
        }
        catch (error) {
            throw error;
        } finally {
            Xrm.Utility.closeProgressIndicator();
        }
    }

    
    //make this geenric methi
    async function InitializeQuestionnaireRender() {
        try {
          const sessionItem = sessionStorage.getItem("serviceTaskRenderParams");
          const dynParams = JSON.parse(sessionItem);

          // let executionContext = dynParams.executionContext; ains do i need this
          // let webResourceControl = dynParams.webResourceControl; ains do i need this
          let resultJSON = dynParams.resultjson;
          let formType = dynParams.formType;
          let userGuid = dynParams.userGuid;
          let userName = dynParams.userName;
          let userLang = dynParams.userLang;
          let serviceTaskId = dynParams.serviceTaskId;
          let activeStatus = dynParams.activeQuestionnaire;
          let siteId = dynParams.siteId;
          let translations = glHelper.GetLocalizedStrings();

          console.log("formType: " + formType);
          console.log("userGuid: " + userGuid);
          console.log("userName: " + userName);
          console.log("userLang: " + userLang);
          console.log("serviceTaskId: " + serviceTaskId);
          console.log("activestatus: " + activeStatus);
          console.log("site id: " + dynParams.siteId);

          // show progress indicator to user that questionnaire is loading
          Xrm.Utility.showProgressIndicator(translations.LoadingQuestionnaire);

          // make sure we don't get stuck!
          setTimeout(function () {
            Xrm.Utility.closeProgressIndicator();
          }, 20000);

          // we now need to get the result from AzureBlob
          var resultBlob = await GetQuestionnaireResultBlob(serviceTaskId);

          // what if this is existing service task, and i didnt save a blob before and its still in JSON?
          if (resultBlob != null) {
              resultJSON = resultBlob;
          }

          // get vue instance of our questionnaire control
          var questionnaireVueInstance = document
          .querySelector("questionnaire-builder")
          .getVueInstance();

          // understand if were existing or new service task
          if (formType > 1) {
            console.log("EXISTING QUESTIONNAIRE");
          } else {
            console.log("NEW QUESTIONNAIRE");
          }

          // we're not showing the render form if this is a new service task
          // user must select the service task type first
          if (!serviceTaskId) {
            return;
          }

          // set the language of the questionnaire by changing prop, app will adjust automatically
            questionnaireVueInstance.lang = userLang;

          // set the language of the questionnaire by changing prop, app will adjust automatically
            questionnaireVueInstance.userName = userName;

          // get json to render
          const questionnaire = JSON.parse(resultJSON);

          // set questionnaire to readonly depending on the state of the service task record
          if (activeStatus === 0) questionnaire.readOnly = false;
          else if (activeStatus === 1) questionnaire.readOnly = true;

          //set the questionnaire state for the app to display json questionnaire
          // IMPORTANT! render questionnaire first before calling other methods on the instance.
          questionnaireVueInstance.Render(questionnaire);

          //questionnaire render dependent on legislation being loaded, has to be awaited
          await getLegislationDictionnary().then(function (legs) {
            questionnaireVueInstance.SetLegislations(legs, "flat");
          });

          //questionnaire render dependent on characteristics being loaded, has to be awaited
          await GetCharacteristics(siteId).then(function (characteristics) {
            // console.log('char',JSON.stringify(characteristics));
            questionnaireVueInstance.SetCharacteristics(characteristics);
          });
        } catch (error) {
            throw error;
        } finally {
            Xrm.Utility.closeProgressIndicator();
        }
    }

    function SaveAnswers(userInput) {
        var data = JSON.stringify(userInput.data, null, 3);
        window.parentFormContext.getAttribute("qm_templatejsontxt").setValue(data);
    }

    // Function removed and logic of saving has moved to their respective form javscript files (ServiceTaskMainForm, TemplateMainForm)
    // async function DoComplete(eContext, recordGuid, isBuilderPage = false) {

    async function GetLegislations() {

        let data = null;

        var ovs_LegislationsGetRequest = {
            getMetadata: function () {
                return {
                    boundParameter: null,
                    parameterTypes: {},
                    operationType: 0,
                    operationName: "ovs_LegislationsGet"
                };
            }
        };

        await Xrm.WebApi.online.execute(ovs_LegislationsGetRequest).then(
            async function success(result) {
                if (result.ok) {
                    let resultJson = await result.json();
                    let jsonObject = resultJson.jsonResult;
                    data = JSON.parse(jsonObject);
                }
            },
            async function (error) {
                Xrm.Utility.alertDialog(error.message);
            }
        );

        return data;
    }    

    async function getLegislationDictionnary() {
        let data = [];

        var ovs_LegislationGetFlatRequest = {
            getMetadata: function () {
                return {
                    boundParameter: null,
                    parameterTypes: {},
                    operationType: 0,
                    operationName: "ovs_LegislationGetFlat"
                };
            }
        };

        await Xrm.WebApi.online.execute(ovs_LegislationGetFlatRequest).then(
            async function success(result) {
                if (result.ok) {
                    let resultJson = await result.json();
                    let jsonObject = resultJson.jsonResult;
                    data = JSON.parse(jsonObject);
                }
            },
            function (error) {
                Xrm.Utility.alertDialog(error.message);
            }
        );

        return data;
    }

    async function GetQuestionnaireResultBlob(serviceTaskId) {
        var resultJson = null;

        var parameters = {};

        parameters.guid = `${serviceTaskId}`.toUpperCase(); // must be in the format of "{GUID-ALL-CAPS-WITH-DASHES}"

        var ovs_BlobResultsGetRequest = {
            guid: parameters.guid,

            getMetadata: function() {
                return {
                    boundParameter: null,
                    parameterTypes: {
                        "guid": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        }
                    },
                    operationType: 0,
                    operationName: "ovs_BlobResultsGet"
                };
            }
        };

        await Xrm.WebApi.online.execute(ovs_BlobResultsGetRequest).then(
            async function success(result) {
                if (result.ok) {
                    var getBlobResultResponse = await result.json();
                    resultJson = getBlobResultResponse.json;
                }
            },
            function(error) {
                console.log("No Blob Result saved for Questionnaire");
                console.log(error.message);
                resultJson = null;
            }
        );

        return resultJson;
    }

      async function GetCharacteristics(siteId) {
        let data = null;
        var parameters = {};
        parameters.SiteId = siteId;

        var ovs_CharacteristicsCategoriesRequest = {
          SiteId: parameters.SiteId,
          getMetadata: function () {
            return {
              boundParameter: null,
              parameterTypes: {
                SiteId: {
                  typeName: "Edm.String",
                  structuralProperty: 1,
                },
              },
              operationType: 0,
              operationName: "ovs_CharacteristicsCategories",
            };
          },
        };

        await Xrm.WebApi.online
          .execute(ovs_CharacteristicsCategoriesRequest)
          .then(
            async function success(result) {
              if (result.ok) {
                let resultJson = await result.json();
                let characteristics = JSON.parse(resultJson.AllCharacteristics);
                let siteCharacteristics = JSON.parse(resultJson.Categories);

                data = { characteristics, siteCharacteristics };
              }
            },
            async function (error) {
              Xrm.Utility.alertDialog(error.message);
            }
          );

        return data;
      }



    async function getTemplateDataByServiceTaskId(serviceTaskId) {
        let data = null;
        var serviceTaskTypeId = null;
        var templateJson = null;
        await Xrm.WebApi.online.retrieveRecord("msdyn_workorderservicetask", serviceTaskId, "?$select=msdyn_name,ovs_questionnaireresultjson&$expand=msdyn_tasktype($select=msdyn_name,msdyn_servicetasktypeid)").then(
            function success(result) {
                data = result["ovs_questionnaireresultjson"];

                // eslint-disable-next-line no-prototype-builtins
                if (result.hasOwnProperty("msdyn_tasktype")) {
                    serviceTaskTypeId = result["msdyn_tasktype"]["msdyn_servicetasktypeid"];
                }
            },
            function (error) {
                Xrm.Utility.alertDialog(error.message);
            }
        ).then(function () {
            if (data == null || data === "null") {
                data = GetTemplateByServiceTaskType(serviceTaskTypeId);
            }
        });

        return data;
    }

    async function GetTemplateByServiceTaskType(serviceTaskTypeId) {
        let data = null;
        var translations = glHelper.GetLocalizedStrings();

        await Xrm.WebApi.online.retrieveRecord("msdyn_servicetasktype", serviceTaskTypeId, "?$select=msdyn_name&$expand=ovs_QuestionnaireTemplate($select=qm_sytemplateid,qm_templatejsontxt)").then(
            function success(result) {
                var msdyn_name = result["msdyn_name"];
                // eslint-disable-next-line no-prototype-builtins
                // check if Questionnaire Template is null
                if (result.hasOwnProperty("ovs_QuestionnaireTemplate") && result["ovs_QuestionnaireTemplate"]) {
                    var ovs_QuestionnaireTemplate_qm_sytemplateid = result["ovs_QuestionnaireTemplate"]["qm_sytemplateid"];
                    var templateJson = result["ovs_QuestionnaireTemplate"]["qm_templatejsontxt"];
                    data = JSON.parse(templateJson);
                }
                else {
                    var noTemplateMessage = translations.NoQuestionnaireForTaskType.replace("{0}", msdyn_name);
                    glHelper.DisplayFormNotification(noTemplateMessage, "WARNING", 20000);
                }
            },
            function (error) {
                Xrm.Utility.alertDialog(error.message);
            }
        );
        return data;
    }

    async function GetTemplateById(id) {
        let data = null;
        await Xrm.WebApi.online
            .retrieveRecord("qm_sytemplate", id, "?$select=qm_templatejsontxt,qm_name")
            .then(
                function success(result) {
                    var qm_templatejsontxt = result["qm_templatejsontxt"];
                    var qm_name = result["qm_name"];
                    const templateObject = JSON.parse(qm_templatejsontxt);

                    if (qm_templatejsontxt) {
                        // update the name of the template in the JSON with whats in dynamics 
                        templateObject.name = qm_name;
                    }

                    data = templateObject
                },
                function (error) {
                    Xrm.Utility.alertDialog(error.message);
                }
            );
        return data;
    }

    async function SaveQuestionnaireTemplate(questionnaire, id) {
        try {
            let data = null;
            var entity = {};
            let translations = glHelper.GetLocalizedStrings();

            Xrm.Utility.showProgressIndicator(translations.SavingQuestionnaire);

            entity.qm_templatejsontxt = JSON.stringify(questionnaire);
            // console.log("saving id: " + id);
            // console.log("saving json: " + JSON.stringify(questionnaire));
            await Xrm.WebApi.online.updateRecord("qm_sytemplate", id, entity).then(
                function success(result) {
                    data = result.id;
        
                    glHelper.DisplayFormNotification(translations.QuestionnaireSaveSuccessful, "INFO");
                },
                function (error) {
                    Xrm.Utility.alertDialog(error.message);
                }
            );
            return data;
        } catch (error) {
            throw error;
        } finally {
            Xrm.Utility.closeProgressIndicator();
        }
    }

    async function SaveQuestionnaireCompletionStatus(questionnaireResult, serviceTaskId, isQuestionnaireComplete) {
        try {
            let updatedServiceTaskId = null;
            var serviceTask = {};
    
            ////MUST BE SIMPLE STRING, CANT BE COMPLEX OBJECT
            serviceTask.ovs_questionnaireresultjson = questionnaireResult;
            serviceTask.ovs_isquestionnairecomplete = isQuestionnaireComplete;

            let translations = glHelper.GetLocalizedStrings();

            Xrm.Utility.showProgressIndicator(translations.SavingQuestionnaireCompletionStatus);

            await Xrm.WebApi.online.updateRecord("msdyn_workorderservicetask", serviceTaskId, serviceTask).then(
                function success(result) {
                    updatedServiceTaskId = result.id;
                    //Xrm.Utility.alertDialog(translations.QuestionnaireSaveSuccessful);
                },
                function (error) {
                    Xrm.Utility.alertDialog(error.message);
                }
            );

            return updatedServiceTaskId;
        }
        catch (error) {
            throw error;
        }
        finally {
            Xrm.Utility.closeProgressIndicator();
        }
    }

    async function SaveQuestionnaireToBlob(questionnaireResult, serviceTaskId) {
    
        try {
            var isSaved = null;

            let translations = glHelper.GetLocalizedStrings();

            Xrm.Utility.showProgressIndicator(translations.SavingQuestionnaire);

            // check for data
            if(!questionnaireResult) {
                console.error('SaveQuestionnaireToBlob: No data passed in!!!!')
            }
        
            // stringify object as required
            if(typeof questionnaireResult === "object"){
                questionnaireResult = JSON.stringify(questionnaireResult, undefined, 4)
            }
            else {
                questionnaireResult = questionnaireResult
            }
        
            var parameters = {};
            parameters.json = questionnaireResult;
            parameters.guid = serviceTaskId;

            var ovs_BlobResultsPostRequest = {
                json: parameters.json,
                guid: parameters.guid,

                getMetadata: function() {
                    return {
                        boundParameter: null,
                        parameterTypes: {
                            "json": {
                                "typeName": "Edm.String",
                                "structuralProperty": 1
                            },
                            "guid": {
                                "typeName": "Edm.String",
                                "structuralProperty": 1
                            }
                        },
                        operationType: 0,
                        operationName: "ovs_BlobResultsPost"
                    };
                }
            };

            await Xrm.WebApi.online.execute(ovs_BlobResultsPostRequest).then(
                async function success(result) {
                    if (result.ok) {
                        let resultJson = await result.json();
                        isSaved = resultJson.isSaved;
                        Xrm.Utility.alertDialog(translations.QuestionnaireSaveSuccessful);
                    }
                },
                function(error) {
                    Xrm.Utility.alertDialog(error.message);
                }
            );

            return isSaved;
        }
        finally {
            Xrm.Utility.closeProgressIndicator();
        }
    }


    function SaveQuestionnaireSync(questionnaireResult, serviceTaskId) {
        let updatedServiceTaskId = null;
        var serviceTask = {};

        ////MUST BE SIMPLE STRING, CANT BE COMPLEX OBJECT
        serviceTask.ovs_questionnaireresultjson = questionnaireResult;

        var req = new XMLHttpRequest();
        req.open("PATCH", Xrm.Page.context.getClientUrl() + "/api/data/v9.1/msdyn_workorderservicetasks(" + serviceTaskId + ")", false);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 204) {
                    updatedServiceTaskId = result.id;
                    glHelper.DisplayFormNotification(translations.QuestionnaireSaveSuccessful, "INFO");
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
    }

    async function downloadBlobImage(nameGuid, fileName, isFileTypeImage) {
        let data = null;
        var parameters = {};

        parameters.container = "qm_workorder_blob_container";
        parameters.name_guid = nameGuid;
        parameters.fileName = fileName;

        var ovs_BlobDownloadImageRequest = {
            container: parameters.container,
            name_guid: parameters.name_guid,
            fileName: parameters.fileName,

            getMetadata: function () {
                return {
                    boundParameter: null,
                    parameterTypes: {
                        "container": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        },
                        "name_guid": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        },
                        "fileName": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        }
                    },
                    operationType: 0,
                    operationName: "ovs_BlobDownloadImage"
                };
            }
        };

        await Xrm.WebApi.online.execute(ovs_BlobDownloadImageRequest).then(
            async function success(result) {
                if (result.ok) {
                    let questionnaireVueInstance = document
                        .querySelector("questionnaire-builder")
                        .getVueInstance();

                    let resultJson = await result.json();
                    let obj = new Object();

                    obj.guid = ovs_BlobDownloadImageRequest.name_guid;
                    obj.fileName = fileName;
                    obj.isSucess = true;
                    obj.result = resultJson.fileBody;
                    
                    if (isFileTypeImage)
                        questionnaireVueInstance.setImageBase64String(obj);
                    else
                        questionnaireVueInstance.setFileBase64String(obj);

                }
            },
            function (error) {
                Xrm.Utility.alertDialog(error.message);
            }
        );

        return data;
    }

    async function uploadBlobImage(base64String, qguid, nameGuid, fileName, isFileTypeImage) {
        let data = null;
        var parameters = {};
        parameters.container = "qm_workorder_blob_container";
        parameters.Base64String = base64String;
        parameters.name_guid = nameGuid;
        parameters.fileName = fileName;

        var ovs_BlobUploadImageRequest = {
            container: parameters.container,
            Base64String: parameters.Base64String,
            name_guid: parameters.name_guid,
            fileName: parameters.fileName,

            getMetadata: function () {
                return {
                    boundParameter: null,
                    parameterTypes: {
                        "container": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        },
                        "Base64String": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        },
                        "name_guid": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        },
                        "fileName": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        }
                    },
                    operationType: 0,
                    operationName: "ovs_BlobUploadImage"
                };
            }
        };

        await Xrm.WebApi.online.execute(ovs_BlobUploadImageRequest)
            .then(
                async function success(result) {
                    if (result.ok) {
                        let questionnaireVueInstance = document
                            .querySelector("questionnaire-builder")
                            .getVueInstance();
                        let resultJson = await result.json();
                        let obj = new Object();

                        obj.guid = ovs_BlobUploadImageRequest.name_guid;
                        obj.qguid = qguid;
                        obj.isSucess = true;
                        obj.result = resultJson.blobName;
                        
                        if (isFileTypeImage)
                            questionnaireVueInstance.setImageState(obj);
                        else
                            questionnaireVueInstance.setFileState(obj);
                    }
                },
                async function (error) {
                    Xrm.Utility.alertDialog(error.message);
                }
            );

        return data;
    }

    async function deleteBlobImage(nameGuid, fileName, isFileTypeImage) {
        let data = null;
        var parameters = {};
        parameters.container = "qm_workorder_blob_container";
        parameters.fileName = fileName;
        parameters.name_guid = nameGuid;

        var ovs_BlobDeleteFileRequest = {
            container: parameters.container,
            fileName: parameters.fileName,
            name_guid: parameters.name_guid,

            getMetadata: function () {
                return {
                    boundParameter: null,
                    parameterTypes: {
                        "container": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        },
                        "fileName": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        },
                        "name_guid": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        }
                    },
                    operationType: 0,
                    operationName: "ovs_BlobDeleteFile"
                };
            }
        };

        await Xrm.WebApi.online.execute(ovs_BlobDeleteFileRequest)
            .then(
                async function success(result) {
                    if (result.ok) {
                        let questionnaireVueInstance = document
                            .querySelector("questionnaire-builder")
                            .getVueInstance();
                        let resultJson = await result.json();
                        let obj = new Object();

                        obj.guid = ovs_BlobDeleteFileRequest.name_guid;
                        obj.isSucess = true;
                        obj.result = resultJson.isDeleted;
                        if (isFileTypeImage)
                            questionnaireVueInstance.setDeletedImageState(obj);
                        else
                            questionnaireVueInstance.setDeletedFileState(obj);
                    }
                },
                async function (error) {
                    Xrm.Utility.alertDialog(error.message);
                }
            );

        return data;
    }

    async function getBlobResults(nameGuid) {
        let data = null;
        var parameters = {};
        parameters.name_guid = nameGuid;

        var ovs_BlobResultsGetRequest = {
            name_guid: parameters.name_guid,

            getMetadata: function () {
                return {
                    boundParameter: null,
                    parameterTypes: {
                        "name_guid": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        }
                    },
                    operationType: 0,
                    operationName: "ovs_BlobResultsGet"
                };
            }
        };

        Xrm.WebApi.online.execute(ovs_BlobResultsGetRequest).then(
            function success(result) {
                if (result.ok) {
                    data = JSON.parse(result.responseText);
                }
            },
            function (error) {
                Xrm.Utility.alertDialog(error.message);
            }
        );

        return data;
    }

    async function postBlobResults(json, nameGuid) {
        let data = null;
        var parameters = {};
        parameters.json = json;
        parameters.name_guid = nameGuid;

        var ovs_BlobResultsPostRequest = {
            json: parameters.json,
            name_guid: parameters.name_guid,

            getMetadata: function () {
                return {
                    boundParameter: null,
                    parameterTypes: {
                        "json": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        },
                        "name_guid": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        }
                    },
                    operationType: 0,
                    operationName: "ovs_BlobResultsPost"
                };
            }
        };

        Xrm.WebApi.online.execute(ovs_BlobResultsPostRequest).then(
            function success(result) {
                if (result.ok) {
                    data = JSON.parse(result.responseText);
                }
            },
            function (error) {
                Xrm.Utility.alertDialog(error.message);
            }
        );

        return data;
    }

    //Public properties and methods
    return {
        SaveQuestionnaireCompletionStatus: SaveQuestionnaireCompletionStatus,
        SaveQuestionnaireToBlob: SaveQuestionnaireToBlob,
        SaveQuestionnaireSync: SaveQuestionnaireSync,
        SaveQuestionnaireTemplate: SaveQuestionnaireTemplate,
        GetTemplateById: GetTemplateById,
        GetTemplateByServiceTaskType: GetTemplateByServiceTaskType,
        getTemplateDataByServiceTaskId: getTemplateDataByServiceTaskId,
        getLegislationDictionnary: getLegislationDictionnary,
        GetLegislations: GetLegislations,
        GetCharacteristics: GetCharacteristics,
        SaveAnswers: SaveAnswers,
        InitializeQuestionnaireRender: InitializeQuestionnaireRender,
        InitializeQuestionnaireBuilder: InitializeQuestionnaireBuilder,
        GetVueInstance: GetVueInstance,
        SetReadOnlyValue: SetReadOnlyValue,
        uploadBlobImage: uploadBlobImage,
        downloadBlobImage: downloadBlobImage,
        deleteBlobImage: deleteBlobImage,
        getBlobResults: getBlobResults,
        postBlobResults: postBlobResults
    };

    //********************public methods end***************

})(window, document);



















// const createAnnotation = function (regarding, fileInfo, documentBody) {
//   /// <param name='regrding' type='MobileCRM.Refernce'/>
//   /// <param name='fileInfo' type='MobileCRM.Settings._fileInfo'/>
//   /// <param name='documentBody' type='base64'>File base 64 string.<param>

//   var note = {
//     filename: 'PDFReport.pdf',
//     mimetype: 'application/pdf',
//     isdocument: true,
//     documentbody: documentBody.slice(documentBody.indexOf(',') + 1) || ' ',
//     subject: 'PDF report doucment',
//     notetext: 'Survey JS questionnaire PDF report',
//     'objectid_tc_tcinspection@odata.bind': '/tc_tcinspections(' + regarding + ')',
//   };

//   parent.Xrm.WebApi.createRecord('annotation', note).then(
//     function success(result) {
//       console.log('Document saved: ' + result.id);
//       // perform operations on record creation
//     },
//     function (error) {
//       console.log(error.message);
//       // handle error conditions
//     }
//   );
// };

// function SavePDF(text) {
//   createAnnotation(tc_tcinspectionid.replace(/[{}]/g, ''), 'PDFReport.pdf', text);
//   return true;
// }
