/* globals _, MathUtilities, $  */

(function() {
    "use strict";
    /**
     * A customized Backbone.View that encapsulates logic behind the presentation of calculator keys.
     * @module Calculator
     * @class Key
     * @constructor
     * @extends Backbone.View
     * @namespace Tools.Calculator.Views
     */

    MathUtilities.Tools.Calculator.Views.Key = Backbone.View.extend({
        /**
         * Stores current accessible key on click
         * @property curFocusableElem
         * @type String
         * @default null
         */

        "curFocusableElem": null,

        "setIntervalID": null,

        /**
         * It is set to true on mousedown on any element
         * @property isMouseActive
         * @type Boolean
         * @default false
         */
        "isMouseActive": false,

        /**
         * Identifies currently selected element by mousedown
         * @property activeElem
         * @type Object
         * @default null
         */
        "activeElem": null,
        /**
         * It is called when an object of this class is created. It binds render method on change event of model.
         * @method initialize
         * @return
         */
        "initialize": function() {
            this.model.on("change", this.render, this);
        },

        /**
         * Sets the inner html span sub-element in el element.
         * @method render
         * @chainable
         * @return {Object} Returns the caller object of this method.
         */
        "render": function() {

            var model = this.model,
                modelCurrentStateIndex = model.get("currentState"),
                allState = model.get("jsonData"),
                currentState = allState[modelCurrentStateIndex],
                keyNewStateText = currentState.display;

            this.$("span").html(keyNewStateText);

            return this;
        },

        /**
         * Hash of CSS selectors mapped to events. Selectors are el-relative selectors.
         * @property events
         * @type Object
         */
        "events": function() {
            return {
                "mouseenter": "mouseEnter",
                "mouseleave": "mouseLeave",
                "mousedown": "mouseDown",
                "mouseup": "mouseUp"
            };
        },


        /**
         * It is mouseenter event handler for Calculator keys.
         * @method mouseenter
         * @param {Object} Its the event object.
         * @return
         */
        "mouseEnter": function(event) {
            event.preventDefault();
            var $el = this.$el;
            if ($el.prop("isDisabled") !== true) {
                $el.addClass("NORMAL-HOVER");
                if (this.activeElem === event.target && this.isMouseActive === true) {
                    $el.addClass("NORMAL-ACTIVE");
                }
            }
        },

        /**
         * It is mouseleave event handler for Calculator keys.
         * @method mouseLeave
         * @param {Object} Its the event object.
         * @return
         */
        "mouseLeave": function(event) {
            event.preventDefault();

            this.$el.removeClass("NORMAL-HOVER NORMAL-ACTIVE");
            return this;
        },

        /**
         * It is mousedown handler for Calculator keys.
         * @method mouseDown
         * @param {Object} Its the event object.
         * @return
         */
        "mouseDown": function(event) {
            event.preventDefault();
            event.stopPropagation();

            this.$el.addClass("NORMAL-ACTIVE");
            this.isMouseActive = true;
            this.activeElem = event.target;
        },

        /**
         * It is mouseup event handler for Calculator keys.
         * @method mouseUp
         * @param {Object} Its the event object.
         * @return
         */
        "mouseUp": function(event) {
            event.preventDefault();
            event.stopPropagation();

            this.$el.removeClass("NORMAL-ACTIVE");
            this.isMouseActive = false;
            this.activeElem = null;
        },

        /**
         * It is touchstart handler for Calculator keys.
         * @method touchStart
         * @return
         */
        "touchStart": function(event) {
            if (this.$el.prop("isDisabled") !== true) {
                event.preventDefault();
                event.stopPropagation();

                this.$el.addClass("NORMAL-HOVER");
            }
        },

        /**
         * It is touchend event handler for Calculator keys.
         * @method touchEnd
         * @return
         */
        "touchEnd": function(event) {
            event.preventDefault();
            event.stopPropagation();

            this.$el.removeClass("NORMAL-HOVER");
        },

        /**
         * Clears the timer.
         * @method clearTimer
         * @return
         */
        "clearTimer": function(event) {
            clearInterval(event.data.timer);
            $(document).off("mouseup", this.clearTimer);
        },

        /**
         * creates the divider between input display and output display.
         * @method createDivider
         * @param calculatorView {object} Calculator view
         * @return
         */
        "createDivider": function(calculatorView) {
            var outputContainer = $("#output-container", calculatorView.$el),
                answerDisplay = $("#answer-display", calculatorView.$el),
                inputDisplay = $("#expression-holder", calculatorView.$el),
                dividerHeight = outputContainer.height() - answerDisplay.height() - inputDisplay.height() - 8, //8 Padding between input container and divider
                divider;
            if (dividerHeight > 0) {
                $("#divider", calculatorView.$el).remove();
                divider = $("<div id = \"divider\" style=\"height:" + (dividerHeight - 3) + "px\"></div>"); //3 padding between divider and result to avoid scrollbar
                inputDisplay.after(divider);
            }

        },

        /**
         * Mouse click handler for virtual keys.
         * @method keyClickHandler
         * @param event {object} event object
         */
        "keyClickHandler": function(event) {
            event.preventDefault();
            event.stopPropagation();

            var eventData = event.data,
                keyModel = eventData.keyModel,
                keyView = eventData.keyView,
                currentState = keyModel.get("currentState"),
                jsonData = keyModel.get("jsonData")[currentState],
                key = keyView.$el.attr("key"),
                latex = jsonData.data,
                calculatorView = eventData.calculatorView,
                calculatorModel = calculatorView.model,
                calculatorDisplayDomElement = calculatorView.textboxView.$el,
                viewNameSpace = calculatorView.viewNameSpace,
                TextboxView = viewNameSpace.Textbox,
                textboxText = TextboxView.getText(calculatorDisplayDomElement),
                latexString = textboxText,
                parserlatexString = null,
                angularMeasurementUnit,
                $cursorElem = null,
                $focusElem = null,
                answer, resultEquationData, historyAccObj, inputEquationData, equationData,
                $editor = $("#editor-1", calculatorView.$el),
                $mathquillHolder = $("#math-quill-holder", calculatorView.$el),
                $answerDisplay = $("#answer-display", calculatorView.$el),
                isTouchSupported = "ontouchend" in document,
                isIE = !!document.documentMode,
                HISTORY_LIMIT = calculatorView.viewNameSpace.Calculator.HISTORY_LIMIT,
                isChrome = /chrome/i.test(navigator.userAgent),
                $historyData, historyDataCount,
                finalScientificNotationLatex,
                answerDigitString, $cursorPreviousElem,
                $inputBox = calculatorDisplayDomElement.find("textarea"),
                $this, inputExpression, historyResult, currentHeight, cursorElement,
                inputOutputBox, expressionResult, isEqualtoPressed = calculatorView.equaltoClicked,
                keysToSkip, scientificNotationLatex, standardNotationLatex, isKeysToSkipPressed, isInputFocused,
                scrollTimeout, scientificNotationLatexHistory, standardNotationLatexHistory,
                FD = MathUtilities.Components.FractDec.Models.FD,
                fd = $("#standard-panel", calculatorView.$el).children("#frac-decimal"),
                eng = $("#scientific-panel", calculatorView.$el).children()[18],
                MAX = 12,
                MIN = -7,
                limMax = Math.pow(10, MAX), //Max allowed value is 10^ MAX i.e. 10^10
                res,
                limMin = 9 * Math.pow(10, MIN), //Min allowed value is 9 * 10^MIN i.e. 9*10^-7
                input, nTrimDigits, MAXLENGTH = 11,
                prevTabIndex, currentId, count, historyAccMessage, resultLatex,
                setTextLatexVal,
                accManager = calculatorView.accManagerView,
                enableSubSection, $lasthistoryData,
                resultToDisplay = TextboxView.getText($answerDisplay),
                indexOfCaret = resultToDisplay.indexOf("^"),
                repeatedOperationsEquation, $historyBox,
                textboxModel = calculatorView.textboxView.model,
                addResultEnable = true;

            // hide history box
            calculatorView.$el.trigger("click");
            this.curFocusableElem = jsonData.id;

            if ($answerDisplay.css("display") !== "none" &&
                (indexOfCaret < 0 || indexOfCaret >= 0 && resultToDisplay.match(/frac|sqrt|pi/)) && !$(eng).hasClass("active")) {
                if (resultToDisplay === "\\text{-Infinity}" || resultToDisplay === "\\text{Infinity}" || resultToDisplay === "\\text{Error}") {
                    // Disable FD button.
                    calculatorView.disableFD();
                } else if (($(this).attr("key") === "fd" || $(this).attr("key") === "inverse") &&
                    (resultToDisplay.indexOf(".") > 0 || resultToDisplay.match(/frac|sqrt|pi/))) {
                    // Enable FD button.
                    calculatorView.enableFD();
                } else {
                    // Disable FD button.
                    calculatorView.disableFD();
                }
            } else {
                // Disable FD button.
                calculatorView.disableFD();
            }

            keysToSkip = ["inverse", "eng", "backspace", "equal", "allClear", "fd"];
            isKeysToSkipPressed = keysToSkip.indexOf(keyView.$el.attr("key")) === -1;
            if (isTouchSupported) {
                isInputFocused = calculatorView.textboxView.$el.find(".cursor").length !== 0;
            } else {
                isInputFocused = document.activeElement === calculatorView.$el.find("textarea")[0];
            }

            if (isEqualtoPressed && isKeysToSkipPressed) {
                calculatorView.equaltoClicked = false;
                if (!isInputFocused) {
                    expressionResult = TextboxView.getText($answerDisplay);
                    // do not operate on infinity or math error
                    expressionResult = expressionResult === "\\text{-Infinity}" || expressionResult === "\\text{Infinity}" || expressionResult === "\\text{Error}" ? "" : expressionResult;
                    $mathquillHolder.addClass("mathquill-holder-big");

                    TextboxView.clearText($answerDisplay);
                    $answerDisplay.hide();
                    calculatorDisplayDomElement.removeClass("equationSmallFont");

                    TextboxView.clearText(calculatorDisplayDomElement);
                    TextboxView.clearText($answerDisplay);

                    calculatorView.manageInputBoxPosition(false);
                }
            }

            if (latex) {
                calculatorDisplayDomElement.removeClass("equationSmallFont");
                switch (jsonData.keyType) {
                    case "power":
                        $inputBox.focus();
                        _.delay(function() {
                            $cursorElem = $(".cursor", calculatorDisplayDomElement);
                            if ($cursorElem.prev("sup").length > 0) { //if previous is superscript
                                calculatorView._triggerKeyDown($inputBox, 37, true); // 37 is code for left arrow
                                TextboxView.setText("^{}", calculatorDisplayDomElement);
                                $cursorElem.prev(".empty").trigger("mousedown").focus().trigger("mouseup");
                            } else if ($cursorElem.prev().html() && $cursorElem.prev().html().search(/[0-9e!]/g) === 0 || //search if prev element is number, e or !
                                $cursorElem.prev().hasClass("nonSymbola") || $cursorElem.prev().children(":last").hasClass("paren")) {
                                calculatorView._triggerKeyDown($inputBox, 94); //code for raise to without bracket
                            } else {
                                TextboxView.setText(latex, calculatorDisplayDomElement);
                                $inputBox.focus();
                                $cursorElem = $(".cursor", calculatorDisplayDomElement);
                                $focusElem = $cursorElem.prev().prev().children(".empty").length > 0 ? $cursorElem.prev().prev().children(".empty") : $cursorElem.prev(".empty");
                                $focusElem.trigger("mousedown").focus().trigger("mouseup");
                            }
                        }, 5); // time delay is used to trigger keydown event after focus set in input field
                        break;
                    case "square":
                        $inputBox.focus();
                        _.delay(function() {
                            $cursorElem = $(".cursor", calculatorDisplayDomElement);
                            if ($cursorElem.prev("sup").length > 0) { //if previous is superscript
                                calculatorView._triggerKeyDown($inputBox, 37, true);
                                TextboxView.setText("^2", calculatorDisplayDomElement);
                            } else if ($cursorElem.prev().html() &&
                                $cursorElem.prev().html().search(/[0-9e!]/g) === 0 || $cursorElem.prev().hasClass("nonSymbola") ||
                                $cursorElem.prev().children(":last").hasClass("paren")) {
                                // remove paren from the latex
                                latex = latex.substring(latex.length - 2);
                                TextboxView.setText(latex, calculatorDisplayDomElement);
                                _.delay(function() {
                                    $inputBox.focus();
                                }, 0); //to refocus input field
                                $inputBox.focus();
                            } else {
                                TextboxView.setText(latex, calculatorDisplayDomElement);
                                _.delay(function() {
                                    $inputBox.focus();
                                }, 0); //to refocus input field
                                $inputBox.focus();
                                $focusElem = $(".cursor", calculatorDisplayDomElement).prev().prev().children(".empty");
                                $focusElem.trigger("mousedown").focus().trigger("mouseup");
                            }
                        }, 5); // time delay is used to trigger keydown event after focus set in input field
                        break;
                    case "reciprocal":
                        calculatorView.manageInputBoxPosition(true);
                        $inputBox.focus();
                        _.delay(function() {
                            $cursorElem = $(".cursor", calculatorDisplayDomElement);
                            if ($cursorElem.prev().hasClass("unary-operator") ||
                                $cursorElem.prev().hasClass("binary-operator") ||
                                $cursorElem.siblings().length === 0 ||
                                $cursorElem.prev().hasClass("textarea")) {
                                TextboxView.setText(latex, calculatorDisplayDomElement);
                            } else {
                                TextboxView.setText("\\cdot" + latex, calculatorDisplayDomElement);
                            }
                            _.delay(function() {
                                $inputBox.focus();
                            }, 0); // time delay is used to refocus input field
                            $inputBox.focus();
                            $focusElem = $(".cursor", calculatorDisplayDomElement).prev().children(".empty");
                            $focusElem.trigger("mousedown").focus().trigger("mouseup");
                            calculatorView.manageDisplay(false);
                        }, 0); // time delay is used to change latex after focus set in input field
                        break;
                    default:
                        //If accessibility is on, set focus on textarea before latex is set, since it doesn't find cursor
                        if (calculatorView.isAccessible) {
                            $inputBox.focus();
                        }
                        if (jsonData.keyType === "exp") {
                            if (TextboxView.getText(calculatorDisplayDomElement) === "" && latex === "\\cdot10^{}") {
                                latex = "10^{ }";
                            } else if (!isEqualtoPressed) {
                                $cursorPreviousElem = $(".cursor", calculatorDisplayDomElement).prev();
                                if (($cursorPreviousElem.hasClass("unary-operator") ||
                                        $cursorPreviousElem.hasClass("binary-operator") ||
                                        $cursorPreviousElem.length === 0 ||
                                        $cursorPreviousElem.hasClass("textarea")) &&
                                    (TextboxView.getText(calculatorDisplayDomElement)).trim() !== "") {
                                    latex = "10^{ }";
                                } else {
                                    latex = "\\cdot10^{ }";
                                }
                            }
                        }
                        $inputBox.focus();
                        TextboxView.setText(latex, calculatorDisplayDomElement);
                        if (latex.indexOf("frac") !== -1) {
                            calculatorView.manageInputBoxPosition(true);
                        }
                        $inputBox.focus();
                        $cursorPreviousElem = $(".cursor", calculatorDisplayDomElement).prev();

                        if (jsonData.keyType === "root") {
                            $cursorPreviousElem.prev().trigger("mousedown").focus().trigger("mouseup");
                        } else if (jsonData.keyClass && jsonData.keyClass.search("xBasedFunction") > -1) {
                            if ($cursorPreviousElem.hasClass("empty")) {
                                $cursorPreviousElem.trigger("mousedown").focus().trigger("mouseup");
                            } else {
                                $cursorPreviousElem.find(".empty").trigger("mousedown").focus().trigger("mouseup");
                            }
                        }
                        break;
                }


                _.delay(function() {
                    calculatorView._recordNewScreenState(TextboxView.getText(calculatorDisplayDomElement));

                    calculatorView.resetStoredResults();
                    calculatorDisplayDomElement.find("textarea").trigger("focus");
                }, 50); // time delay is used to register for undo-redo after latex is set into input field

                // Hide the result div
                $answerDisplay.hide();

                $("#divider", calculatorView.$el).remove();

                calculatorView.manageDisplay(false);
                if (calculatorView.textboxView.$el.mathquill("latex").indexOf("frac") !== -1) {
                    calculatorView.manageInputBoxPosition(true);
                }
            } else {
                switch (key) {
                    case "inverse":
                        $this = $(this);
                        if ($this.hasClass("active")) {
                            $(".normal", calculatorView.$el).show();
                            $(".inverse", calculatorView.$el).hide();
                            $this.removeClass("active");
                            $(".inverse", calculatorView.$el).removeClass("active");
                        } else {
                            $this.addClass("active");
                            $(".normal", calculatorView.$el).hide();
                            $(".inverse", calculatorView.$el).show()
                                .addClass("active");
                        }

                        break;

                    case "equal":
                        if (TextboxView.getText(calculatorDisplayDomElement).trim() === "") {
                            return void 0;
                        }
                        $editor.addClass("equationSmallFont");
                        repeatedOperationsEquation = keyView.repeatedOperations(textboxText);
                        standardNotationLatex = textboxModel.get("standardNotationLatex");
                        if (standardNotationLatex && resultToDisplay && repeatedOperationsEquation) {
                            latexString = resultToDisplay + repeatedOperationsEquation;
                            TextboxView.clearText(calculatorDisplayDomElement);
                            TextboxView.setText(latexString, calculatorDisplayDomElement);
                        } else {
                            latexString = textboxText;
                        }
                        angularMeasurementUnit = calculatorModel.get("isAngularMeasurementUnitDegree") ? "deg" : "rad";

                        // Special case for absolute
                        // Now instead of abs(-5) absolute sign is used |-5|
                        // & hence before parsing replace left pipe symbol with 'abs('
                        // & right pipe symbol with closing bracket ')'
                        parserlatexString = latexString.replace(/\\left\\lpipe/g, "\\abs(").replace(/\\right\\rpipe/g, ")");

                        equationData = new MathUtilities.Components.EquationEngine.Models.EquationData();
                        equationData.setConstants({}, true);
                        equationData.setLatex(parserlatexString, true);
                        equationData.setUnits({
                            "angle": angularMeasurementUnit
                        }, true);
                        equationData.getDirectives().FDFlagMethod = 'sciCalculator';
                        MathUtilities.Components.EquationEngine.Models.Parser.parseEquation(equationData);
                        if (equationData.getSolution() && equationData.getSimplifiedFractionLatex() !== equationData.getSolution().toString()) {
                            calculatorView.textboxView.model.set("simplifiedFraction", equationData.getSimplifiedFractionLatex());
                        } else {
                            calculatorView.textboxView.model.set("simplifiedFraction", void 0);
                        }
                        calculatorView.resetStoredResults();
                        if (equationData.isCanBeSolved()) {
                            answer = equationData.getSolution();
                            if (answer === void 0) {
                                resultToDisplay = "\\text{Undefined}";
                            } else if (isNaN(answer) || answer === null) {
                                resultToDisplay = "\\text{Error}";
                            } else if (answer === Infinity || answer === -Infinity) {
                                resultToDisplay = "\\text{Overflow}";
                            } else {
                                answerDigitString = MathUtilities.Components.Utils.Models.MathHelper._convertToDisplayableForm(answer, 10); // 10 precision
                                resultToDisplay = answerDigitString;
                                if (answerDigitString.indexOf("cdot") === -1) {
                                    finalScientificNotationLatex = answer.toExponential(10).toString().split("e"); // 10 is number of digits after the decimal point.
                                    finalScientificNotationLatex[0] = MathUtilities.Components.Utils.Models.MathHelper._convertToDisplayableForm(Number(finalScientificNotationLatex[0]), 10); // 10 precision
                                    finalScientificNotationLatex = MathUtilities.Components.SignificantDigit.getAsLatex(finalScientificNotationLatex);
                                } else {
                                    finalScientificNotationLatex = resultToDisplay;
                                }
                                calculatorView.textboxView.model.set("solution", answer);
                                textboxModel.set({
                                    "scientificNotationLatex": finalScientificNotationLatex,
                                    "standardNotationLatex": resultToDisplay
                                });

                                indexOfCaret = resultToDisplay.indexOf("^");


                                if (calculatorModel.get("displayResultInScientificNotation")) {
                                    resultToDisplay = finalScientificNotationLatex;

                                    // Disable FD button.
                                    calculatorView.disableFD();

                                } else if (indexOfCaret < 0 && resultToDisplay.indexOf(".") > 0 || resultToDisplay.match(/frac|sqrt|pi/)) {
                                    // Enable FD button.
                                    calculatorView.enableFD();
                                }

                                resultEquationData = new MathUtilities.Components.EquationEngine.Models.EquationData();
                                resultEquationData.setConstants({}, true);
                                resultEquationData.setLatex(resultToDisplay, true);
                                resultEquationData.setUnits({
                                    "angle": angularMeasurementUnit
                                }, true);
                                equationData.getDirectives().FDFlagMethod = 'sciCalculator';
                                MathUtilities.Components.EquationEngine.Models.Parser.parseEquation(resultEquationData);
                            }

                        } else {
                            resultToDisplay = "\\text{Error}";
                            $answerDisplay.show();
                        }

                        //shows answer
                        //set new padding for input-display
                        calculatorView.manageDisplay(true);

                        TextboxView.clearText($answerDisplay);
                        TextboxView.setText(String(resultToDisplay), $answerDisplay, "latex");

                        // create divider
                        keyView.createDivider(calculatorView);

                        $answerDisplay.show();
                        $answerDisplay.mathquill("redraw");
                        accManager.loadScreen("answer-screen");

                        //set text for "answer-display"
                        if (resultToDisplay === "\\text{Error}") {
                            accManager.changeAccMessage("answer-display", 0);
                            historyAccMessage = accManager.getAccMessage("answer-display", 0);
                        } else if (resultToDisplay === "\\text{Overflow}" || resultToDisplay === "\\text{Undefined}") {
                            accManager.changeAccMessage("answer-display", 1);
                            historyAccMessage = accManager.getAccMessage("answer-display", 1);
                        } else {
                            accManager.changeAccMessage("answer-display", 2, [equationData.getAccText(), resultEquationData.getAccText()]);
                            historyAccMessage = accManager.getAccMessage("answer-display", 2, [equationData.getAccText(), resultEquationData.getAccText()]);
                        }
                        historyAccMessage += accManager.getAccMessage("history-btn", 3);

                        $("#temp-focus", calculatorView.$el).focus();

                        //Validate answer and then insert in history array
                        if (latexString !== "" && resultToDisplay !== "\\text{Error}") {

                            addResultEnable = ["\\text{Overflow}", "\\text{Undefined}"].indexOf(resultToDisplay) === -1;

                            historyDataCount = $("#history-container", calculatorView.$el).find(".history-data").length;
                            calculatorView.modelNameSpace.Textbox.history.push(latexString);

                            if (historyDataCount === HISTORY_LIMIT) {
                                // remove oldest history data
                                $("#history-container", calculatorView.$el).find(".history-data")
                                    .first().remove();
                            }
                            $lasthistoryData = $(".history-data:last", calculatorView.$el);
                            $lasthistoryData.removeClass("no-border-bottom")
                                .addClass("history-border-bottom");

                            prevTabIndex = accManager.getTabIndex($lasthistoryData.attr("id"));
                            count = parseInt($lasthistoryData.attr('data-history-count'));

                            if (prevTabIndex === null) {
                                //it starting range of history data.
                                prevTabIndex = 800;
                                count = 0;
                            }
                            count += 1;
                            currentId = "history-data-" + count;

                            $historyData = $(MathUtilities.Tools.Calculator.templates.historyStructure({
                                "id": currentId,
                                "addResultEnable": addResultEnable
                            }).trim());

                            $historyData.appendTo("#history-container", calculatorView.$el)
                                .removeClass("history-border-bottom")
                                .addClass("no-border-bottom").attr("data-history-count", count);

                            /*As history-box is hidden. We do not get width or height
                            of div generated by mathquill inside it. Hence those div
                            are not rendered properly*/
                            $historyBox = calculatorView.$el.find('#history-box');

                            $historyBox.css('visibility', 'hidden');
                            $historyBox.show();

                            $historyData.find('.history-equation-textarea').mathquill()
                                .mathquill("latex", latexString);
                            $historyData.find('.history-result').mathquill()
                                .mathquill("latex", resultToDisplay);

                            $historyBox.css('visibility', 'visible');
                            $historyBox.hide();

                            //create history object
                            historyAccObj = {
                                "elementId": currentId,
                                "tabIndex": prevTabIndex + 5,
                                "acc": currentId
                            };

                            accManager.createAccDiv(historyAccObj);

                            accManager.createAccDiv({
                                "elementId": $historyData.find('.add-equation').attr('id'),
                                "acc": accManager.getAccMessage('history-input-recall-button', 0)
                            });

                            accManager.createAccDiv({
                                "elementId": $historyData.find('.add-result').attr('id'),
                                "acc": accManager.getAccMessage('history-output-recall-button', 0)
                            });

                            accManager.setAccMessage(currentId, historyAccMessage);

                            scientificNotationLatexHistory = textboxModel.get("scientificNotationLatex");
                            standardNotationLatexHistory = textboxModel.get("standardNotationLatex");

                            if (calculatorView.isAccessible) {
                                accManager.enableTab("history-btn", true);
                            }

                            setTextLatexVal = function(latex) {
                                if (isTouchSupported) {
                                    isInputFocused = calculatorView.textboxView.$el.find(".cursor").length !== 0;
                                } else {
                                    isInputFocused = document.activeElement === calculatorView.$el.find("textarea")[0];
                                }
                                if ($('#answer-display', calculatorView.$el).is(':visible') && !isInputFocused) {
                                    TextboxView.setText(latex, calculatorDisplayDomElement, "latex");
                                } else {
                                    TextboxView.setText(latex, calculatorDisplayDomElement, "write");
                                }

                                keyView.createDivider(calculatorView);

                                $("#divider", calculatorView.$el).remove();
                                calculatorDisplayDomElement.removeClass("equationSmallFont");
                                $mathquillHolder.addClass("mathquill-holder-big");
                                calculatorView.manageInputBoxPosition(false);
                                $answerDisplay.hide();
                                calculatorView.manageDisplay(false);

                                calculatorView.equaltoClicked = false;
                                calculatorView.resetStoredResults();

                                if (latex.indexOf("frac") !== -1) {
                                    calculatorView.manageInputBoxPosition(true);
                                }

                                if (calculatorView.isAccessible) {
                                    calculatorView.hideHistoryPopUp();
                                }
                                // Disable FD button.
                                calculatorView.disableFD();

                                _.delay(function() {
                                    calculatorDisplayDomElement.find("textarea").focus();
                                }, 0); //to set focus in Mathquill after latex set.

                            };
                            enableSubSection = function(isEnable) {
                                accManager.enableTab($historyData.find('.add-equation').attr('id'), isEnable);
                                accManager.enableTab($historyData.find('.add-result').attr('id'), isEnable);
                            };
                            $historyData.on("click", function(event) {
                                var tabIndex = accManager.getTabIndex($historyData.attr('id')),
                                    addEqId = $historyData.find('.add-equation').attr('id');
                                accManager.setTabIndex(addEqId, ++tabIndex);
                                accManager.setTabIndex($historyData.find('.add-result').attr('id'), ++tabIndex);
                                enableSubSection(true);
                                accManager.setFocus(addEqId);
                            }).on('focusin', function(event) {
                                var $target = $(event.target);
                                if ($target.is($historyData) || $target.is($("#" + $historyData.attr("id") + "-acc-elem"))) {
                                    enableSubSection(false);
                                }
                            });

                            $historyData.find(".add-equation").on("click", function() {
                                event.stopPropagation();
                                setTextLatexVal(latexString);
                            }).on("keydown", function(event) {
                                if (event.keyCode === MathUtilities.Tools.Calculator.Models.Calculator.KEYCODE_TAB && event.shiftKey) {
                                    enableSubSection(false);
                                }
                            }).on("mouseover", function() {
                                $(this).addClass("hovered");
                            }).on("mouseout", function() {
                                $(this).removeClass("hovered");
                            });


                            $historyData.find(".add-result").on("click", function() {
                                event.stopPropagation();
                                setTextLatexVal(resultToDisplay);
                            }).on("keydown", function(event) {
                                if (event.keyCode === MathUtilities.Tools.Calculator.Models.Calculator.KEYCODE_TAB && !event.shiftKey) {
                                    enableSubSection(false);
                                }
                            }).on("mouseover", function() {
                                $(this).addClass("hovered");
                            }).on("mouseout", function() {
                                $(this).removeClass("hovered");
                            });

                            calculatorView.$el.find("#temp-focus").focus();
                        }

                        calculatorView.equaltoClicked = true;
                        $editor.blur();

                        if (resultToDisplay !== "") {
                            accManager.setFocus("answer-display", 30); //30 is delay used to set focus to answer
                        }
                        accManager.focusOut("answer-display", function() {
                            accManager.setTabIndex("answer-display", 80); // 80 is tabIndex for answer-display
                        }, 10); // 10 is delay
                        break;

                    case "allClear":

                        calculatorDisplayDomElement.removeClass("equationSmallFont");
                        TextboxView.clearText(calculatorDisplayDomElement);
                        TextboxView.clearText($answerDisplay);
                        calculatorView.manageInputBoxPosition(false);
                        $answerDisplay.hide();
                        calculatorView.textboxView.$el.find("textarea").focus();
                        calculatorView.resetStoredResults();
                        calculatorView._recordNewScreenState(TextboxView.getText(calculatorDisplayDomElement));

                        // Handle anomalous behavior.
                        // Anomalous behavior ---
                        // Do any computation. select the output. press clear button.
                        // From now on clear button always leaves some residue in the output filed.

                        if ($answerDisplay.find("span[class=selectable]").length === 0) {
                            $answerDisplay.append("<span class=\"selectable\"></span>");
                        }
                        $mathquillHolder.addClass("mathquill-holder-big");

                        $("#divider", calculatorView.$el).remove();
                        calculatorView.manageDisplay(false);
                        calculatorView.disableFD();

                        break;

                    case "squareRoot":
                        calculatorView.equaltoClicked = false;
                        _.delay(function() {
                            calculatorView._triggerKeyDown($inputBox, 8730, void 0, false); //code for squareRoot
                        }, 0); // delay is used to trigger keydown after focus is set in input field.
                        break;

                    case "divide":
                        calculatorView.equaltoClicked = false;
                        _.delay(function() {
                            calculatorView._triggerKeyDown($inputBox, 47); //Keycode { "/" : 47 }
                            calculatorView.resetStoredResults();

                            $("#divider", calculatorView.$el).remove();
                            calculatorView.manageDisplay(false);
                        }, 0); // delay is used to trigger keydown after focus is set in input field.

                        calculatorDisplayDomElement.removeClass("equationSmallFont");
                        calculatorView.manageInputBoxPosition(true);
                        break;

                    case "bracket":
                        calculatorView.equaltoClicked = false;
                        _.delay(function() {
                            calculatorView._triggerKeyDown($inputBox, 40, void 0, true); // code for bracket
                        }, 0); // delay is used to trigger keydown after focus is set in input field.
                        break;

                    case "plusminus":
                        calculatorView.equaltoClicked = false;
                        _.delay(function() {
                            /*code for negate functionality*/
                            calculatorView._triggerKeyDown($inputBox, 177, void 0, true);
                        }, 0);
                        break;

                    case "eng":
                        $this = $(this);

                        scientificNotationLatex = textboxModel.get("scientificNotationLatex");
                        standardNotationLatex = textboxModel.get("standardNotationLatex");

                        // toggle notation to be used to display the answer
                        calculatorModel.set("displayResultInScientificNotation", !calculatorModel.get("displayResultInScientificNotation"));

                        //display scientific notation
                        if (calculatorModel.get("displayResultInScientificNotation") && scientificNotationLatex !== "") {

                            $answerDisplay.hide();
                            TextboxView.setText(scientificNotationLatex, $answerDisplay, "latex");
                            keyView.createDivider(calculatorView);
                            $answerDisplay.show();
                            $answerDisplay.mathquill("redraw");
                            resultLatex = scientificNotationLatex;

                        } else if (standardNotationLatex !== "") {
                            $answerDisplay.hide();
                            TextboxView.setText(standardNotationLatex, $answerDisplay, "latex");
                            keyView.createDivider(calculatorView);
                            $answerDisplay.show();
                            $answerDisplay.mathquill("redraw");

                            resultLatex = standardNotationLatex;
                        }

                        if ($this.hasClass("active")) {
                            $this.removeClass("active");

                            resultToDisplay = TextboxView.getText($answerDisplay);
                            indexOfCaret = resultToDisplay.indexOf("^");

                            if (resultToDisplay.indexOf(".") < 0 && indexOfCaret < 0 && !resultToDisplay.match(/frac|sqrt|pi/)) {
                                calculatorView.disableFD();
                            } else if ($answerDisplay.css("display") !== "none" && (indexOfCaret < 0 || indexOfCaret >= 0 && resultToDisplay.match(/frac|sqrt|pi/))) {
                                if (resultToDisplay === "\\text{-Infinity}" || resultToDisplay === "\\text{Infinity}" || resultToDisplay === "\\text{Error}") {
                                    calculatorView.disableFD();
                                } else {
                                    calculatorView.enableFD();
                                }
                            }
                        } else {
                            $this.addClass("active");
                            calculatorView.disableFD();
                        }

                        if (calculatorView.isAccessible) {
                            accManager.loadScreen("answer-screen");

                            if (resultLatex) {

                                inputEquationData = new MathUtilities.Components.EquationEngine.Models.EquationData();
                                inputEquationData.setLatex(latexString, true);
                                inputEquationData.getDirectives().FDFlagMethod = 'sciCalculator';
                                MathUtilities.Components.EquationEngine.Models.Parser.parseEquation(inputEquationData);

                                equationData = new MathUtilities.Components.EquationEngine.Models.EquationData();
                                equationData.setLatex(resultLatex.toString(), true);
                                equationData.getDirectives().FDFlagMethod = 'sciCalculator';
                                MathUtilities.Components.EquationEngine.Models.Parser.parseEquation(equationData);
                                accManager.changeAccMessage("answer-display", 2, [inputEquationData.getAccText(), equationData.getAccText()]);
                            }


                            //accManager.setTabIndex("answer-display", accManager.getTabIndex("eng") + 5);
                            accManager.setFocus("answer-display");

                            accManager.focusOut("answer-display", function() {
                                accManager.setTabIndex("answer-display", 80); // tab index for answer-display
                            }, 10); // delay for focus output
                        }
                        break;

                    case "fd":
                        if ($(fd).prop("isDisabled") === false) {
                            input = TextboxView.getText($answerDisplay);

                            if (input.match(/frac|sqrt|pi/)) {
                                if (calculatorView.textboxView.model.get("solution")) {
                                    res = calculatorView.textboxView.model.get("solution");
                                    res = MathUtilities.Components.Utils.Models.MathHelper._convertToDisplayableForm(res, 10);
                                } else {
                                    res = FD.toDecimal(input);
                                }
                                // Result exists.
                                if (res) {
                                    // If results length exceeds calculator's maximum length.
                                    resultToDisplay = res.toString();
                                } else {
                                    return void 0;
                                }
                            } else {
                                if (calculatorView.textboxView.model.get("simplifiedFraction")) {
                                    resultToDisplay = calculatorView.textboxView.model.get("simplifiedFraction");
                                } else {
                                    res = FD.toFraction(input);
                                    if (res) {
                                        if (res.denominator !== 1) {
                                            if (res.numerator < 0 && res.denominator > 0 || res.denominator < 0 && res.numerator > 0) {
                                                resultToDisplay = "-\\frac{" + Math.abs(res.numerator) + "}{" + Math.abs(res.denominator) + "}";
                                            } else {
                                                resultToDisplay = "\\frac{" + res.numerator + "}{" + res.denominator + "}";
                                            }
                                        } else {
                                            resultToDisplay = res.numerator.toString();
                                        }
                                    } else {
                                        return void 0;
                                    }
                                }
                            }

                            $editor.blur();
                            $editor.addClass("equationSmallFont");
                            $("#divider", calculatorView.$el).css({
                                "height": "0"
                            });

                            TextboxView.setText(resultToDisplay, $answerDisplay, "latex");
                            $answerDisplay.show();
                            keyView.createDivider(calculatorView);
                        }

                        accManager.loadScreen("answer-screen");

                        //parse equation data
                        inputEquationData = new MathUtilities.Components.EquationEngine.Models.EquationData();
                        inputEquationData.setConstants({}, true);
                        inputEquationData.setLatex(textboxText, true);
                        inputEquationData.setUnits({
                            "angle": angularMeasurementUnit
                        }, true);
                        inputEquationData.getDirectives().FDFlagMethod = 'sciCalculator';
                        MathUtilities.Components.EquationEngine.Models.Parser.parseEquation(inputEquationData);


                        resultEquationData = new MathUtilities.Components.EquationEngine.Models.EquationData();
                        resultEquationData.setConstants({}, true);
                        resultEquationData.setLatex(resultToDisplay.toString(), true);
                        resultEquationData.setUnits({
                            "angle": angularMeasurementUnit
                        }, true);
                        resultEquationData.getDirectives().FDFlagMethod = 'sciCalculator';
                        MathUtilities.Components.EquationEngine.Models.Parser.parseEquation(resultEquationData);

                        accManager.changeAccMessage("answer-display", 2, [inputEquationData.getAccText(), resultEquationData.getAccText()]);


                        accManager.setFocus("answer-display");
                        accManager.focusOut("answer-display", function() {
                            accManager.setTabIndex("answer-display", 80); // tab index for answer-display
                        }, 10); // delay for focus out

                        break;
                }
            }
            if (isIE) {
                scrollTimeout = 55; // time delay for IE
            } else {
                scrollTimeout = 0;
            }

            _.delay(function() {
                inputOutputBox = calculatorView.$el.find("#input-output-box")[0];
                cursorElement = $(".cursor", calculatorView.textboxView.$el);
                currentHeight = calculatorView.equaltoClicked || cursorElement.length === 0 ? inputOutputBox.scrollHeight : cursorElement.position().top;
                inputOutputBox.scrollTop = currentHeight;
            }, scrollTimeout); //_delay is use to set scroll position

            if (calculatorView.isAccessible) {
                if (this.curFocusableElem !== "equal" && this.curFocusableElem !== "eng" &&
                    this.curFocusableElem !== "frac-decimal" && this.curFocusableElem !== "inverse" &&
                    this.curFocusableElem !== "exp") {
                    $this = this;
                    $("#" + this.curFocusableElem).blur();
                    accManager.setFocus($this.curFocusableElem, 350);

                } else if (calculatorView.$el.find("#scientific-panel").is(":visible") && this.curFocusableElem === "eng") {
                    //condition to check scientific mode is added as,
                    //ENG and Inv are trigger when mode is switch between scientific and standard.

                    if ($(this).hasClass("active")) {
                        accManager.changeAccMessage(this.curFocusableElem, 1);
                    } else {
                        accManager.changeAccMessage(this.curFocusableElem, 0);
                    }
                } else if (this.curFocusableElem === "exp") {
                    accManager.setFocus("math-quill-holder", 100); // delay for focus
                } else if (calculatorView.$el.find("#scientific-panel").is(":visible") && this.curFocusableElem === "inverse") {
                    if ($(this).hasClass("active")) {
                        accManager.changeAccMessage(this.curFocusableElem, 1);
                    } else {
                        accManager.changeAccMessage(this.curFocusableElem, 0);
                    }
                    accManager.setFocus("temp-focus", 60); // delay for focus
                    accManager.setFocus(this.curFocusableElem, 120); // delay for focus
                }
            }
        },
        /**
         * Repeated operations for shortening equation
         * @method repeatedOperations
         * @param {string} equationString, stores latex string of equation
         */
        "repeatedOperations": function(equationString) {
            var equationString = equationString.replace(/\\cdot /gm, "*")
                .replace(/\\left\\lpipe/g, 'abs\\left(').replace(/\\right\\rpipe/g, '\\right)')
                .replace(/\\right\)/g, ')').replace(/\\left\(/g, '('),
                index = equationString.length - 1,
                bracketCheckCounter = 0,
                currentChar,
                previousChar,
                addSubCheck,
                isFrac = this.isProperFrac(equationString),
                fracNumerator,
                fracDenominator,
                splitIndex,
                outputString,
                isMultiplicationDetected = false,
                nextChar,
                arrOpenBracket = ["(", "{"],
                arrCloseBracket = [")", "}"],
                absRegExWithBracket = /abs\(/g,
                leftBracketRegEx = /\(/g,
                rightBracketRegEx = /\)/g,
                absStartIndex, absEndIndex,
                rightBracketStartIndex, rightBracketEndIndex,
                isRightBracket, isLeftBracket,
                leftBracketLastIndex, rightBracketLastIndex;
            for (; index >= 0; index--) {
                currentChar = equationString.charAt(index);
                addSubCheck = currentChar === "+" || currentChar === "-";
                if (arrCloseBracket.indexOf(currentChar) > -1) {
                    bracketCheckCounter++;
                } else if (arrOpenBracket.indexOf(currentChar) > -1) {
                    bracketCheckCounter--;
                    if (isFrac && currentChar === '{' && bracketCheckCounter === 0) {
                        splitIndex = index;
                        break;
                    }
                } else if ((addSubCheck || currentChar === "*") && bracketCheckCounter === 0) {
                    previousChar = equationString.charAt(index - 1);
                    if (addSubCheck && (previousChar === "+" || previousChar === "-")) {
                        splitIndex = index - 1;
                        break;
                    } else if (addSubCheck && previousChar !== "*" && index !== 0) {
                        splitIndex = index;
                        break;
                    } else if (currentChar === "*" && !isMultiplicationDetected) {
                        splitIndex = index;
                        isMultiplicationDetected = true;
                    }
                }
            }
            if (splitIndex >= 0) {
                outputString = equationString.substring(splitIndex, equationString.Length);

                while (absRegExWithBracket.test(outputString)) {
                    absStartIndex = outputString.search(absRegExWithBracket);
                    absEndIndex = absRegExWithBracket.lastIndex;

                    outputString = outputString.slice(0, absStartIndex) + '\\left\\lpipe' + outputString.slice(absEndIndex);

                    isLeftBracket = leftBracketRegEx.test(outputString);
                    leftBracketLastIndex = leftBracketRegEx.lastIndex;

                    while (isLeftBracket && leftBracketLastIndex < absEndIndex) {
                        isLeftBracket = leftBracketRegEx.test(outputString);
                        leftBracketLastIndex = leftBracketRegEx.lastIndex;
                    }

                    isRightBracket = rightBracketRegEx.test(outputString);
                    rightBracketLastIndex = rightBracketRegEx.lastIndex;

                    while (isLeftBracket && isRightBracket &&
                        leftBracketLastIndex < rightBracketLastIndex) {
                        isLeftBracket = leftBracketRegEx.test(outputString);
                        leftBracketLastIndex = leftBracketRegEx.lastIndex;
                        isRightBracket = rightBracketRegEx.test(outputString);
                        rightBracketLastIndex = rightBracketRegEx.lastIndex;
                    }
                    // 1 is number of outputString characters for right bracket..
                    rightBracketStartIndex = rightBracketRegEx.lastIndex - 1;
                    rightBracketEndIndex = rightBracketRegEx.lastIndex;

                    if (rightBracketEndIndex === outputString.length) {
                        outputString = outputString.slice(0, rightBracketStartIndex) + '\\right\\rpipe';
                    } else {
                        outputString = outputString.slice(0, rightBracketStartIndex) + '\\right\\rpipe' + outputString.slice(rightBracketEndIndex);
                    }
                    absRegExWithBracket.lastIndex = leftBracketRegEx.lastIndex = rightBracketRegEx.lastIndex = 0;
                }

                outputString = outputString.replace(/\*/gm, '\\cdot ').replace('(', '\\left(')
                    .replace(')', '\\right)');
                if (isFrac) {
                    outputString = "\\cdot \\frac{1}" + outputString;
                    return outputString;
                }
                return outputString;
            }
            return false;
        },

        "isProperFrac": function(latex) {
            var fracRegEx = /^[+|-]?\\frac{.+?}{.+?}$/g, //RegEx to check whether latex contains a fraction as a first node.
                index = 0,
                length = latex.length,
                bracketCheckCounter = 0,
                bracketCorrectlyClose = 0,
                curChar;
            if (latex.match(fracRegEx)) {
                for (; index < length; index++) {
                    curChar = latex[index];
                    if (curChar.indexOf('{') > -1) {
                        bracketCheckCounter++;
                    } else if (curChar.indexOf('}') > -1) {
                        bracketCheckCounter--;
                        if (bracketCheckCounter === 0) {
                            bracketCorrectlyClose++;
                            if (bracketCorrectlyClose === 2 & index === length - 1) { //2 to check if correctly close bracket
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        },
        /**
         * Mouse down handler for virtual keys.
         * @method keyMouseDownHandler
         * @param event {object} event object
         */
        "keyMouseDownHandler": function(event) {
            event.stopPropagation();
            event.preventDefault();

            var eventData = event.data,
                keyModel = eventData.keyModel,
                currentState = keyModel.get("currentState"),
                jsonData = keyModel.get("jsonData")[currentState],
                calculatorView = eventData.calculatorView,
                keyView = eventData.keyView,
                calculatorDisplayDomElement = calculatorView.textboxView.$el,
                viewNameSpace = calculatorView.viewNameSpace,
                TextboxView = viewNameSpace.Textbox,
                isTouchSupported = "ontouchend" in document,
                $answerDisplay = $("#answer-display", calculatorView.$el),
                $mathquillHolder = $("#math-quill-holder", calculatorView.$el),
                $inputBox = calculatorDisplayDomElement.find("textarea"),
                accManager = calculatorView.accManagerView;

            this.curFocusableElem = jsonData.id;

            if (keyView.$el.attr("key") === "backspace") {
                calculatorView.resetStoredResults();
                TextboxView.clearText($answerDisplay);
                $inputBox.focus();
                $mathquillHolder.addClass("mathquill-holder-big");

                $("#divider", calculatorView.$el).remove();
                calculatorView.manageDisplay(false);
                calculatorView.equaltoClicked = false;
            }

            if (!isTouchSupported && event.which !== 1 && typeof event.which !== "undefined") { //check for undefined when backspace button is pressed in accessibility
                return void 0;
            }
            calculatorView._triggerKeyDown($inputBox, 8, true);
            calculatorView.manageInputBoxPosition(false);
            calculatorView._recordNewScreenState(TextboxView.getText(calculatorDisplayDomElement));
            keyView.setIntervalID = setInterval(function() {
                calculatorView._triggerKeyDown($inputBox, 8, true);
                calculatorView._recordNewScreenState(TextboxView.getText(calculatorDisplayDomElement));
                calculatorView.manageInputBoxPosition(false);
            }, 150); //time interval is used, to trigger mathquill key event.

            if (calculatorView.isAccessible) {
                accManager.changeAccMessage(this.curFocusableElem, 1);
                accManager.setFocus(this.curFocusableElem, 100); // 100 is delay for set focus
            }
            $(document).on("mouseup", {
                "timer": keyView.setIntervalID
            }, keyView.clearTimer);
        },
        /**
         * Mouse up handler for virtual keys.
         * @method keyMouseUpHandler
         * @param event {object} event object
         */
        "keyMouseUpHandler": function(event) {
            event.preventDefault();
            event.stopPropagation();

            var eventData = event.data,
                keyView = eventData.keyView;

            clearInterval(keyView.setIntervalID);

            $(document).off("mouseup", keyView.clearTimer);
        },

        /**
         * Destroys the view object.
         * @method destroy
         * @return
         */
        "destroy": function() {
            this.isMouseActive = null;
            this.activeElem = null;
            this.setIntervalID = null;

            this.$el.add("*").off();
            this.remove();
        }

    });
})();
