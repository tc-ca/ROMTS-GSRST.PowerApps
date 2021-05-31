var lang = parent.Xrm.Utility.getGlobalContext().userSettings.languageId;

var charactersRemainingLocalizedText;
var detailTextAddLocalizedText;
var detailTextMinusLocalizedText;

if (lang == 1036) {
    charactersRemainingLocalizedText = "caractères restants";
}
else {
    charactersRemainingLocalizedText = "characters remaining";
}

'use strict';
window.parentExecutionContext = null;
window.parentFormContext = null;
Survey.StylesManager.applyTheme('default');

//Add hasFormValue property to Text
Survey
    .Serializer
    .addProperty("dropdown", {
        name: "hasWorkOrderValue:boolean",
        category: "general",
        default: false
    });
Survey
    .Serializer
    .addProperty("dropdown", {
        name: "workOrderValueLogicalName:string"
    });


//add hasDetail and detail Text properties to all questions in hasDetailQuestions array. Required to load hasDetail value from JSON definition.
var hasDetailQuestions = ["radiogroup", "checkbox", "dropdown", "image", "imagepicker", "file", "boolean", "matrix", "matrixdropdown", "matrixdynamic", "signaturepad", "rating", "expression", "html", "panel", "paneldynamic", "flowpanel"];
hasDetailQuestions.forEach(function (questionName) {
    Survey.JsonObject.metaData.addProperty(questionName, {
        name: "hasDetail:boolean",
        default: true
    }),
    Survey.JsonObject.metaData.addProperty(questionName, {
        name: "detailEnglishText:string",
        default: "Detail"
    }),
    Survey.JsonObject.metaData.addProperty(questionName, {
        name: "detailFrenchText:string",
        default: "Détail"
    })
});

function InitialContext(executionContext) {
    window.parentExecutionContext = executionContext;
    window.parentFormContext = executionContext.getFormContext();
}

function InitializeSurveyRender(surveyDefinition, surveyResponse, surveyLocale, mode) {

    if (surveyDefinition == null) {
        return;
    }

    var questionnaireDefinition = JSON.parse(surveyDefinition);
    window.survey = new Survey.Model(questionnaireDefinition);
    survey.locale = surveyLocale;
    survey.showCompletedPage = false;
    survey.mode = mode;

    if (surveyResponse != null) {
        survey.data = JSON.parse(surveyResponse);
    }

    survey.onComplete.add(function (survey, options) {
        // When survey is completed, parse the resulting JSON and save it to ovs_questionnaireresponse
        var data = JSON.stringify(survey.data, null, 3);
        window.parentFormContext.getAttribute('ovs_questionnaireresponse').setValue(data.trim());

        // In order to keep the survey in place without showing a thank you or blank page
        // Set the state to running, keep the data and go to the first page
        survey.clear(false, true);
        survey.render();
    });

    survey.onAfterRenderSurvey.add(function (survey, options) {
        // Hide complete button after survey renders.
        $('.sv_complete_btn').hide();
    });

    survey.onValueChanging.add(function (survey, options) {
        //Adding a space to the questionnaireresponse to make the form dirty. The space gets trimmed off in survey.onComplete.
        var data = JSON.stringify(survey.data, null, 3) + " ";
        window.parentFormContext.getAttribute('ovs_questionnaireresponse').setValue(data);
    });

    survey.onValueChanged.add(function (survey, options) {
        const el = document.getElementById(options.name);
        if (el) {
            el.value = options.value;
        }
    });

    //Create showdown markdown converter
    var converter = new showdown.Converter();
    survey.onTextMarkdown.add(function (survey, options) {
        //convert the markdown text to html
        var str = converter.makeHtml(options.text);
        //remove root paragraphs <p></p>
        str = str.substring(3);
        str = str.substring(0, str.length - 4);
        //set html
        options.html = str;
    });

    survey.onAfterRenderQuestion.add(function (survey, options) {
        if (options.question.hasWorkOrderValue != true) return;
        if (options.question.getType() !== "dropdown") return;

        //Get associated work order's id
        var workOrderAttribute = parentFormContext.getAttribute('msdyn_workorder').getValue();
        var workOrderId = workOrderAttribute != null ? workOrderAttribute[0].id : "";

        //Retrieve associated Work Order, select the field to use as a value in the survey question
        parent.Xrm.WebApi.online.retrieveRecord("msdyn_workorder", workOrderId, "?$select=_" + options.question.workOrderValueLogicalName + "_value").then(
            async function success(results) {
                var workOrderValueText = results["_" + options.question.workOrderValueLogicalName + "_value@OData.Community.Display.V1.FormattedValue"];
                //Duplicate an existing choice to create a new choice object
                var workOrderItem = options.question.choices[0];
                //Replace text and value with the Work Order field's value
                workOrderItem.text = workOrderValueText;
                workOrderItem.value = "workOrderValue";
                //Add new choice to the question's choices array
                options.question.choices.push(workOrderItem);
                //Set the question's value to the added choice
                options.question.value = "workOrderValue";
                //Set the question's value to the added choice in the survey data
                survey.setValue((options.question.name), "workOrderValue");
                //Toggle hasWorkOrderValue to false to prevent readding the Work Order field if the survey rerenders.
                options.question.hasWorkOrderValue = false;

                //Retrieve the survey definition json from the parent work order service task.
                var surveyDefinition = JSON.parse(parentFormContext.getAttribute('ovs_questionnairedefinition').getValue());
                //Find the current question in the survey definition json object
                surveyDefinition.pages.forEach(function (page, index) {
                    page.elements.forEach(function (element, index) {
                        if (element.name == options.question.name) {
                            //Toggle hasWorkOrderValue to false to prevent duplicate work next time the survey is loaded
                            element.hasWorkOrderValue = false;
                            //Add the new choice to the survey definition to be used next time the survey definition is loaded
                            element.choices.push({ value: "workOrderValue", text: workOrderValueText });
                        }
                    });
                });
                //Save the changes made to questionnaire defintion
                parentFormContext.getAttribute('ovs_questionnairedefinition').setValue(JSON.stringify(surveyDefinition));
             });
    });
    
    // Add a character count and limit to Comment questions.
    // If the maxLength is the default value of -1, set maxLength to 1000.
    // No character count if maxLength was set to 0
    survey.onAfterRenderQuestion.add(function (survey, options) {
        if (options.question.getType() !== "comment") return;
        var comment = options.htmlElement.getElementsByTagName('textarea')[0];
        var maxLength = options.question.maxLength;
        if (maxLength == -1) {
            maxLength = 1000;
        }
        if (maxLength !== 0) {
            comment.setAttribute("maxLength", maxLength);
            var div = document.createElement("div");
            div.style.textAlign = "left";
            comment.parentNode.appendChild(div);
            var changingHandler = function () {
                var currLength = comment.value.length;
                div.innerText = (maxLength - currLength) + " " + charactersRemainingLocalizedText;
            }
            changingHandler();
            comment.onkeyup = changingHandler;
        }
    });

    function appendDetailToQuestion(survey, options) {
        var detailSurveyId = options.question.name + "-Detail";
        var detailLabel = "";
        if (lang == 1036) {
            detailLabel = options.question.detailFrenchText || "Détail";
        } else {
            detailLabel = options.question.detailEnglishText || "Detail";
        }
        //Create HTML elements

        var question = options.htmlElement;
        var detailContainer = document.createElement("div");
        var header = document.createElement("div");
        var content = document.createElement("div");
        var detailText = document.createElement("span");
        var detailSymbol = document.createElement("span");
        var detailBox = document.createElement("textarea");
        var characterCount = document.createElement("span");

        /* Append HTML elements to each other forming the following structure

        <div id="detailContainer">
            <div id="header">
            <span id="detailSymbol"></span>
                <span id="detailText"></span>
            </div>
            <div id="content">
                <textarea id="detailBox"></textarea>
                <span id="characterCount"></span>
            </div>
        </div>
        */

        header.appendChild(detailSymbol);
        header.appendChild(detailText);
        content.appendChild(detailBox);
        content.appendChild(characterCount);
        detailContainer.appendChild(header);
        detailContainer.appendChild(content);
        question.appendChild(detailContainer);

        //Set Styles, Classes, and text

        detailContainer.style.marginTop = "10px";
        header.style.backgroundColor = "#d3d3d3";
        header.style.padding = "2px";
        header.style.cursor = "pointer";
        header.style.fontWeight = "bold";
        detailBox.className = "form-control";
        detailBox.rows = 3;
        detailBox.cols = 50;
        detailBox.maxLength = 1000;
        detailBox.style.resize = "vertical";
        characterCount.style.textAlign = "left";
        detailText.innerHTML = detailLabel;

        //Expand content if detailBox has text saved previously, and load previous detailBox text
        if (survey.getValue(detailSurveyId) != null) {
            detailBox.value = survey.getValue(detailSurveyId);
            content.style.display = "block";
            detailSymbol.innerHTML = "- ";
        } else {
            content.style.display = "none";
            detailSymbol.innerHTML = "+ ";
        }

        //Add functionality to HTML elements

        //Update character count onKeyUp in detailBox
        var detailBoxOnKeyUpHandler = function () {
            var currLength = detailBox.value.length;
            characterCount.innerText = (1000 - currLength) + " " + charactersRemainingLocalizedText;
        }
        detailBoxOnKeyUpHandler();
        detailBox.onkeyup = detailBoxOnKeyUpHandler;

        //Update detail text in survey response
        detailBox.onchange = function () {
            survey.setValue((options.question.name + "-Detail"), detailBox.value);
        }

        //Toggle visibilty of content when header is clicked
        header.onclick = function () {
            if (content.style.display == "block" && detailBox.value == "") {
                content.style.display = "none";
                detailSymbol.innerHTML = "+ ";
            } else {
                content.style.display = "block";
                detailSymbol.innerHTML = "- ";
            }
        };

    }

    //Add Detail content to questions when they are rendered in the survey
    survey
        .onAfterRenderQuestion
        .add(function (survey, options) {
            //Load JSON definition, find current question, check hasDetail
            if (options.question.hasDetail != true) return;
            appendDetailToQuestion(survey, options);
        });


    $('#surveyElement').Survey({
        model: survey
    });

}

function DoComplete() {
    var currentPageNo = survey.currentPageNo;
    window.survey.doComplete();
    survey.currentPage = currentPageNo;
} 
