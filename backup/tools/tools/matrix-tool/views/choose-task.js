(function (MathUtilities) {
    'use strict';

    /**
    * A customized Backbone.Views that represents 'Choose Task' section in Matrix Tool.
    * @class ChooseTask
    * @constructor
    * @namespace Tools.MatrixTool.MatrixToolHolder.Views
    * @module MatrixTool
    * @submodule MatrixToolHolder
    * @extends Backbone.View
    */
    MathUtilities.Tools.MatrixTool.MatrixToolHolder.Views.ChooseTask = Backbone.View.extend({

        /**
        * @property _zerothPosition
        * @type Integer
        * @default 0
        */
        _zerothPosition: 0,

        /**
        *@property _firstVerticalSlider
        *@type {object}
        *@default null
        */
        _firstVerticalSlider: null,
        /**
        *@property _firstHorizontalSlider
        *@type {object}
        *@default null
        */
        _firstHorizontalSlider: null,
        /**
        *@property _secondVerticalSlider
        *@type {object}
        *@default null
        */
        _secondVerticalSlider: null,
        /**
        *@property _secondHorizontalSlider
        *@type {object}
        *@default null
        */
        _secondHorizontalSlider: null,

        /**
        * Controller of the custom combo.
        *
        * @property customComboController
        * @type Object
        * @default null
        */
        customComboController: null,

        /**
        * Condition to check if accesibility is on.
        * @property isAccesibilityOn
        * @type {Boolean} true if accessibility is on, otherwise false
        * @default null
        */
        isAccesibilityOn: null,

        /**
        * Instantiates all the data required for rendering Choose Task section.
        * @method initialize
        */
        initialize: function initialize() {

            var $el = this.$el,
                optionData = null,
                firstMatrixData = null,
                secondMatrixData = null,
                dropdownValue = 0,
                keyPress = jQuery.Event('keypress'),
                upDownArrow = [],
                goBtnView = null,
                expandView = null,
                collapseView = null,
                basePath = MathUtilities.Tools.MatrixTool.MatrixToolHolder.Models.MatrixToolHolder.BASEPATH,
                modelData,
                sliderHoriBackground,
                sliderVertBackground,
                isTouchSupported = "ontouchend" in document,
                self = this,
                taskDropDownData = this.options.taskDropDownText.messages,
                cursorPosition;

            optionData = {
                options: [{
                    optionID: 'inverse',
                    optionValue: '0',
                    optionText: taskDropDownData[0].message.loc
                },
                {
                    optionID: 'transpose',
                    optionValue: '1',
                    optionText: taskDropDownData[1].message.loc
                },
                {
                    optionID: 'determinant',
                    optionValue: '2',
                    optionText: taskDropDownData[2].message.loc
                },
                {
                    optionID: 'add',
                    optionValue: '3',
                    optionText: taskDropDownData[3].message.loc
                },
                {
                    optionID: 'subtract',
                    optionValue: '4',
                    optionText: taskDropDownData[4].message.loc
                },
                {
                    optionID: 'multiply',
                    optionValue: '5',
                    optionText: taskDropDownData[5].message.loc
                },
                {
                    optionID: 'scalar',
                    optionValue: '6',
                    optionText: taskDropDownData[6].message.loc
                },
                {
                    optionID: 'multiplyInverse',
                    optionValue: '7',
                    optionText: taskDropDownData[7].message.loc
                }]
            };

            firstMatrixData = {
                tr: [{
                    trId: 'first-1',
                    td: [{
                        inputId: 'first-11',
                        column: 'first-1'
                    },
                    {
                        inputId: 'first-12',
                        column: 'first-2'
                    },
                    {
                        inputId: 'first-13',
                        column: 'first-3'
                    },
                    {
                        inputId: 'first-14',
                        column: 'first-4'
                    },
                    {
                        inputId: 'first-15',
                        column: 'first-5'
                    }]
                },
                {
                    trId: 'first-2',
                    td: [{
                        inputId: 'first-21',
                        column: 'first-1'
                    },
                    {
                        inputId: 'first-22',
                        column: 'first-2'
                    },
                    {
                        inputId: 'first-23',
                        column: 'first-3'
                    },
                    {
                        inputId: 'first-24',
                        column: 'first-4'
                    },
                    {
                        inputId: 'first-25',
                        column: 'first-5'
                    }]
                },
                {
                    trId: 'first-3',
                    td: [{
                        inputId: 'first-31',
                        column: 'first-1'
                    },
                    {
                        inputId: 'first-32',
                        column: 'first-2'
                    },
                    {
                        inputId: 'first-33',
                        column: 'first-3'
                    },
                    {
                        inputId: 'first-34',
                        column: 'first-4'
                    },
                    {
                        inputId: 'first-35',
                        column: 'first-5'
                    }]
                },
                {
                    trId: 'first-4',
                    td: [{
                        inputId: 'first-41',
                        column: 'first-1'
                    },
                    {
                        inputId: 'first-42',
                        column: 'first-2'
                    },
                    {
                        inputId: 'first-43',
                        column: 'first-3'
                    },
                    {
                        inputId: 'first-44',
                        column: 'first-4'
                    },
                    {
                        inputId: 'first-45',
                        column: 'first-5'
                    }]
                },
                {
                    trId: 'first-5',
                    td: [{
                        inputId: 'first-51',
                        column: 'first-1'
                    },
                    {
                        inputId: 'first-52',
                        column: 'first-2'
                    },
                    {
                        inputId: 'first-53',
                        column: 'first-3'
                    },
                    {
                        inputId: 'first-54',
                        column: 'first-4'
                    },
                    {
                        inputId: 'first-55',
                        column: 'first-5'
                    }]
                }]
            };

            secondMatrixData = {
                tr: [{
                    trId: 'second-1',
                    td: [{
                        inputId: 'second-11',
                        column: 'second-1'
                    },
                    {
                        inputId: 'second-12',
                        column: 'second-2'
                    },
                    {
                        inputId: 'second-13',
                        column: 'second-3'
                    },
                    {
                        inputId: 'second-14',
                        column: 'second-4'
                    },
                    {
                        inputId: 'second-15',
                        column: 'second-5'
                    }]
                },
                {
                    trId: 'second-2',
                    td: [{
                        inputId: 'second-21',
                        column: 'second-1'
                    },
                    {
                        inputId: 'second-22',
                        column: 'second-2'
                    },
                    {
                        inputId: 'second-23',
                        column: 'second-3'
                    },
                    {
                        inputId: 'second-24',
                        column: 'second-4'
                    },
                    {
                        inputId: 'second-25',
                        column: 'second-5'
                    }]
                },
                {
                    trId: 'second-3',
                    td: [{
                        inputId: 'second-31',
                        column: 'second-1'
                    },
                    {
                        inputId: 'second-32',
                        column: 'second-2'
                    },
                    {
                        inputId: 'second-33',
                        column: 'second-3'
                    },
                    {
                        inputId: 'second-34',
                        column: 'second-4'
                    },
                    {
                        inputId: 'second-35',
                        column: 'second-5'
                    }]
                },
                {
                    trId: 'second-4',
                    td: [{
                        inputId: 'second-41',
                        column: 'second-1'
                    },
                    {
                        inputId: 'second-42',
                        column: 'second-2'
                    },
                    {
                        inputId: 'second-43',
                        column: 'second-3'
                    },
                    {
                        inputId: 'second-44',
                        column: 'second-4'
                    },
                    {
                        inputId: 'second-45',
                        column: 'second-5'
                    }]
                },
                {
                    trId: 'second-5',
                    td: [{
                        inputId: 'second-51',
                        column: 'second-1'
                    },
                    {
                        inputId: 'second-52',
                        column: 'second-2'
                    },
                    {
                        inputId: 'second-53',
                        column: 'second-3'
                    },
                    {
                        inputId: 'second-54',
                        column: 'second-4'
                    },
                    {
                        inputId: 'second-55',
                        column: 'second-5'
                    }]
                }]
            };

            $el.html(MathUtilities.Tools.MatrixTool.templates.chooseTaskContent({ options: optionData.options, trFirst: firstMatrixData.tr, trSecond: secondMatrixData.tr }).trim());


            upDownArrow[0] = [$('.first-1'), $('.first-2'), $('.first-3'), $('.first-4'), $('.first-5')];

            $('#second-matrix-holder,#scalar-holder,.symbol').hide();

            if (this.options.bAllowAccessibility || !isTouchSupported) {
                this.isAccesibilityOn = this.options.bAllowAccessibility;
            }
            

            // For nexus
            if (this._isNexus()) {
                $('.element-holder').on({
                    "keydown": $.proxy(this._keyhandlerNexus, this)
                }).on({
                    "input": $.proxy(this._keyUpHandlerNexus, this)
                });
            }

            $('.element-holder').on('keypress', $.proxy(this.onKeyPress, this)).on('keydown', $.proxy(function (e) {

                modelData = MathUtilities.Tools.MatrixTool.MatrixToolHolder.Models.ChooseTask;

                if (e.keyCode === modelData.KEYCODE_LEFT || e.keyCode === modelData.KEYCODE_RIGHT || e.keyCode === modelData.KEYCODE_UP || e.keyCode === modelData.KEYCODE_DOWN) {
                    this.model.set('cursorPosition', this.getCaretCharacterOffsetWithin(e.target));
                }

                if (e.keyCode === 8) {

                    // to prevent back-space of browser triggering
                    cursorPosition = this.getCaretCharacterOffsetWithin(e.target);
                    if (this._isIE() && cursorPosition === 0) {
                        e.preventDefault();
                    }
                    keyPress.throughKeyboard = true;
                    keyPress.keyCode = 8;
                    $(e.currentTarget).trigger(keyPress);
                }
                else if (e.keyCode === 46) {
                    keyPress.deleteKey = true;
                    keyPress.keyCode = 46;
                    $(e.currentTarget).trigger(keyPress);
                }
                else if (e.keyCode === 9) {

                    keyPress.throughKeyboard = true;
                    keyPress.keyCode = 9;
                    $(e.currentTarget).trigger(keyPress);
                }
            }, this));

            $('.element-holder').on('keyup', $.proxy(this.onKeyUp, this));

            goBtnView = MathUtilities.Components.Button.generateButton({
                'id': 'go-btn',
                'imagePathIds': [basePath + 'img/tools/common/tools/matrix-tool/button-left-right.png',
                                 basePath + 'img/tools/common/tools/matrix-tool/button-middle.png'],
                'isCustomButton': true,
                'text': self.options.goBtnText,
                'height': 39,
                'padding': 11
            });

            this.model.set('goBtnView', goBtnView);

            $('#go-btn').on('click', $.proxy(this.onChooseGoClick, this));

            dropdownValue = $('#task-dropdown').val();
            this.model.set('dropdownValue', dropdownValue);

            sliderHoriBackground = {
                isSliderContainerImageSlice: true,
                sliderContainerLeftImage: basePath + 'img/tools/common/tools/matrix-tool/left-slider-base.png',
                sliderContainerRightImage: basePath + 'img/tools/common/tools/matrix-tool/right-slider-base.png',
                sliderContainerMiddleImage: basePath + 'img/tools/common/tools/matrix-tool/middle-slider-base.png',
                sliderHeaderImage: basePath + 'img/tools/common/tools/matrix-tool/handle-up.png',
                sliderHeaderImageOnMouseOver: basePath + 'img/tools/common/tools/matrix-tool/handle-rollover.png',
                sliderHeaderImageWhenDisabled: undefined
            };

            sliderVertBackground = {
                isSliderContainerImageSlice: true,
                sliderContainerLeftImage: basePath + 'img/tools/common/tools/matrix-tool/verticle-slider-top.png',
                sliderContainerRightImage: basePath + 'img/tools/common/tools/matrix-tool/verticle-slider-bottom.png',
                sliderContainerMiddleImage: basePath + 'img/tools/common/tools/matrix-tool/verticle-slider-middle.png',
                sliderHeaderImage: basePath + 'img/tools/common/tools/matrix-tool/handle-up.png',
                sliderHeaderImageOnMouseOver: basePath + 'img/tools/common/tools/matrix-tool/handle-rollover.png',
                sliderHeaderImageWhenDisabled: undefined
            };

            this._firstVerticalSlider = new MathUtilities.Components.Slider.Views.slider({ option: { min: 0, max: 4, val: 2, step: 1, orientation: 'vertical', valueDisplay: false, stepFunctionality: false, sliderBackground: sliderVertBackground }, el: $('#first-slider-box-vertical') });
            this._firstHorizontalSlider = new MathUtilities.Components.Slider.Views.slider({ option: { min: 0, max: 4, val: 2, step: 1, orientation: 'horizontal', valueDisplay: false, stepFunctionality: false, sliderBackground: sliderHoriBackground }, el: $('#first-slider-box-horizontal') });

            this._secondVerticalSlider = new MathUtilities.Components.Slider.Views.slider({ option: { min: 0, max: 4, val: 2, step: 1, orientation: 'vertical', valueDisplay: false, stepFunctionality: false, sliderBackground: sliderVertBackground }, el: $('#second-slider-box-vertical') });
            this._secondHorizontalSlider = new MathUtilities.Components.Slider.Views.slider({ option: { min: 0, max: 4, val: 2, step: 1, orientation: 'horizontal', valueDisplay: false, stepFunctionality: false, sliderBackground: sliderHoriBackground }, el: $('#second-slider-box-horizontal') });

            $('#first-slider-box-vertical,#second-slider-box-vertical').on('change', $.proxy(this.onVerticalSliderDrag, this)).on('stop', $.proxy(this.onVerticalSliderDrag, this)).on('start', $.proxy(this.onSliderStart, this)).on('stop', $.proxy(this.onSliderStop, this));
            $('#first-slider-box-horizontal,#second-slider-box-horizontal').on('change', $.proxy(this.onHorizontalSliderDrag, this)).on('stop', $.proxy(this.onHorizontalSliderDrag, this)).on('start', $.proxy(this.onSliderStart, this)).on('stop', $.proxy(this.onSliderStop, this));

            //add id to slider handler,for accessibility
            this.$('#first-slider-box-vertical .sliderH').attr('id', 'first-vertical-slider-handler');
            this.$('#first-slider-box-horizontal .sliderH').attr('id', 'first-horizontal-slider-handler');
            this.$('#second-slider-box-vertical .sliderH').attr('id', 'second-vertical-slider-handler');
            this.$('#second-slider-box-horizontal .sliderH').attr('id', 'second-horizontal-slider-handler');

            this.defaultMatrices();
            this.hoverFunction();

            this._bindEvents();

            this.render();

        },

        /**
        * Binds events to input boxes.
        * 
        * @method _bindEvents
        * @private
        */
        _bindEvents: function () {
            var self = this, undoData;

            $('.element-holder').on('paste', $.proxy(this.pasteHandler, this));

            $('.element-holder').on('cut', function (event) {
                undoData = self._getCellData($(event.target));
                undoData.errorData = self.hideErrorMessage();
                self.model.set('cellKeyPressData', undoData);

                setTimeout(function () { self.onKeyUp(event); }, 0);
            })
        },

        /**
        *create matrices
        *@method createMatrices
        *@private
        */
        defaultMatrices: function defaultMatrices() {

            $('.first-rows,.second-rows').hide();
            $('.first-columns,.second-columns').hide().parent().hide();

            $('#first-1,#first-2,#first-3,#second-1,#second-2,#second-3').show();

            $('.first-1,.first-2,.first-3').show().parent().show();

            $('.second-1,.second-2,.second-3').show().parent().show();

            $('.element-holder').text(0).attr('contenteditable', true).attr('prev-data', '0').attr('data-content', '0');

            if (!this.isAccesibilityOn) {
                this.setCursor($('#first-11')[0], $('#first-11').text().length);
            }

        },

        /**
        *set matrix cell value to default value(0),if its hidden
        *@method setDefaultValue
        *@private
        */
        setDefaultValue: function setDefaultValue() {
            var $currentCell;
            if ($('#second-matrix-holder').css('display') === 'none') {
                $('.second-1,.second-2,.second-3').show().parent().show();

                this._secondVerticalSlider.set(2);
                this._secondHorizontalSlider.set(2);
            }
            $('.element-holder').each(function () {
                $currentCell = $(this);
                if ($currentCell.css('display') === 'none' || $currentCell.parents('.second-matrix-holder').css('display') === 'none' || $currentCell.parents('#scalar-holder').css('display') === 'none') {
                    $currentCell.text(0).attr('data-content', '0');
                }
            });
            if (!this.isAccesibilityOn) {
                $('#first-11').focus();
            }
        },


        /**
        * Change event for the dropdown.
        * @method render
        * @chainable
        * @return {Object}
        */
        render: function render() {
            return this;
        },

        /**
        * Matrix input area is shown.
        * @method onExpandClick
        * @private
        */
        onExpandClick: function onExpandClick(skipUndoRedoRegistration) {

            var calcHolderHeight = this.model.get('inputMatrixHeight'),
                padding = 10,
                resultHolderHeight = $('.result-holder').height(),
                self = this;
            $('#expand').off('click', onExpandClick);


            $('#calculation-holder').show().animate({ "height": calcHolderHeight },
                                                    {
                                                        step: function (currentHeight) {
                                                            $('.result-holder').css('min-height', resultHolderHeight - (currentHeight + padding));    //408 + 357
                                                        },
                                                        complete: function () {
                                                            self.model.set('inputMatrixHeight', $('#calculation-holder').height());
                                                            $('#collapse').show();
                                                            $('#expand').hide();
                                                            $('#expand').on('click', $.proxy(self.onExpandClick, self));
                                                            if (skipUndoRedoRegistration !== true) {
                                                                self.trigger('undoRedoRegister', { actionName: 'collapseExpand', undoRedoData: { undo: { actionType: 'collapse' }, redo: { actionType: 'expand' } } });
                                                            }
                                                        }
                                                    });
        },

        /**
        * Matrix input area is hidden.
        * @method onCollapseClick
        * @private
        */
        onCollapseClick: function onCollapseClick(skipUndoRedoRegistration) {

            var calcHolderHeight = $('#calculation-holder').height(),
                padding = 10,
                resultHolderHeight = parseInt($('.result-holder').css('min-height')),
                    self = this;
            $('#collapse').off('click', onCollapseClick);
            $('#calculation-holder').show().stop().animate({ "height": 0 },
                                                    {
                                                        step: function (currentHeight) {
                                                            var diff = (calcHolderHeight) - currentHeight;                //408 = $('#calculation-holder') height(398) + 10 padding
                                                            $('.result-holder').css('min-height', resultHolderHeight + diff);     //357 = $('.result-holder') min-height
                                                        },
                                                        complete: function () {
                                                            $('#calculation-holder').hide();
                                                            $('.result-holder').css('min-height', parseInt($('.result-holder').css('min-height')) + 10);
                                                            $('#expand').show();
                                                            $('#collapse').hide();
                                                            $('#collapse').on('click', $.proxy(self.onCollapseClick, self));
                                                            if (skipUndoRedoRegistration !== true) {
                                                                self.trigger('undoRedoRegister', { actionName: 'collapseExpand', undoRedoData: { undo: { actionType: 'expand' }, redo: { actionType: 'collapse' } } });
                                                            }
                                                        }
                                                    });
        },

        /**
        * Action to be performed on dropdown change.
        * @method onDropdownChange
        * @private
        */
        onDropdownChange: function onDropdownChange() {
            var dropdownValue = $('#task-dropdown').val(),
                answer = this.model.get('answer'),
                undoData = {},
                redoData = {},
                i, errorData;

            errorData = this.hideErrorMessage();

            undoData.dropdownValue = this.model.get('dropdownValue');
            undoData.errorData = errorData;

            this.trigger('saveToolState');

            this.model.set('dropdownValue', dropdownValue);

            switch (dropdownValue) {
                case '2':
                    $('#second-matrix-holder,#scalar-holder,.symbol').hide();
                    break;

                case '3':
                    $('.symbol').hide();
                    $('#second-matrix-holder').show();
                    $('#scalar-holder').hide();
                    $('#addSign').show();
                    break;
                case '4':
                    $('.symbol').hide();
                    $('#second-matrix-holder').show();
                    $('#scalar-holder').hide();
                    $('#subtractSign').show();
                    break;
                case '5':
                    $('.symbol').hide();
                    $('#second-matrix-holder').show();
                    $('#scalar-holder').hide();
                    $('#multiplySign').show();
                    break;
                case '6':
                    $('.symbol').hide();
                    $('#multiplySign').show();
                    $('#second-matrix-holder').hide();
                    $('#scalar-holder').show();
                    break;
                case '7':
                    $('.symbol').hide();
                    $('#second-matrix-holder').show();
                    $('#scalar-holder').hide();
                    $('#multiplySign').show();
                    break;
                default:
                    $('#second-matrix-holder,#scalar-holder,.symbol').hide();
                    break;
            }

            if ($('#use-result-btn').attr('state') !== 'buttonDisable') {
                if (answer) {
                    if (answer.length === undefined) {
                        this.trigger('disableUseResult', true);
                    }
                }
            }
            redoData.dropdownValue = this.model.get('dropdownValue');

            if ($('#task-dropdown').attr('undoRedoAction') !== 'true') {
                this.trigger('undoRedoRegister', { actionName: 'dropdownValueChange', undoRedoData: { undo: undoData, redo: redoData } });
            }

            //code to update focus rect size
            this._updateMatrixFocusRect('first');
            this._updateMatrixFocusRect('second');

            if (!this.isAccesibilityOn) {
                $($('.element-holder')[0]).find('textarea').focus();
            }

            this.setDefaultValue();
        },

        /**
        * Action to be performed on Submit button click.
        * @method onChooseGoClick
        * @private
        */
        onChooseGoClick: function () {
            var dropdownValue = this.model.get('dropdownValue');
            this.trigger('click', dropdownValue);
        },

        /**
        * Action to be performed on input area keypress.
        * @method onKeyPress
        * @private
        */
        onKeyPress: function (event) {
            var regex = /[0-9]|\.|\/|-/,
                currTargetTextLen = 0,
                htmlTemplate = null,
                currFocus = $("*:focus"),
                currTarget = null,
                numeratorText = '',
                hasDecimal = false,
                hasMinus = false,
                cursorPosition,
                charString = String.fromCharCode(event.charCode),
                targetElemId = null,
                selectedText = this.getSelectedText(),
                cursorPos = null,
                undoData = {},
                $parentCell,
                indexOfDot, errorData,
                $numerator,
                $denominator,
                cellTabIndex,
                fractionObject,
                numObject,
                denomObject,
                numText = '',
                denomText = '';

            errorData = this.hideErrorMessage();

            undoData = this._getCellData($(event.currentTarget));
            undoData.errorData = errorData;
            this.model.set('cellKeyPressData', undoData);

            // For Firefox: Detects Ctrl+V key press event, ctrl +  A.
            if (this._isValidCtrlEvents(event)) {
                return true;
            }

            if (event.keyCode === 13) {
                event.preventDefault();
                this.onChooseGoClick();
                return false;
            }
            else if ((event.keyCode === 46 && charString !== '.') || event.keyCode === 9) {
                return true;
            }
            if (charString === '/' && $(event.currentTarget).find('.numerator').length !== 0) {
                event.preventDefault();
            }
            else if (event.keyCode === 8) {
                if ($(event.currentTarget).find('.numerator').length !== 0 || $(event.currentTarget).find('.denominator').length !== 0) {

                    cursorPos = this.getCaretCharacterOffsetWithin(currFocus[0]);

                    if (currFocus.hasClass('numerator') && cursorPos === 0) {
                        currTarget = $(event.currentTarget);
                        denomText = $($(event.currentTarget).find('.denominator')).text();
                        currTarget.text(denomText).attr('data-content', denomText);
                        currTarget.attr('contenteditable', true);
                        currTarget.focus();
                        //change selector
                        this.setSelector(currTarget.parents('.matrix-cell').attr('id'), '#' + currTarget.attr('id'));
                    }
                    else if (currFocus.hasClass('denominator') && cursorPos === 0) {
                        currTarget = $(event.currentTarget);
                        numText = $($(event.currentTarget).find('.numerator')).text();
                        currTarget.text(numText).attr('data-content', numText);
                        currTarget.attr('contenteditable', true);
                        currTarget.focus();
                        //change selector
                        this.setSelector(currTarget.parents('.matrix-cell').attr('id'), '#' + currTarget.attr('id'));
                    }
                }
            }
            else if (regex.test(charString)) {
                if (currFocus.hasClass('numerator') || currFocus.hasClass('denominator')) {
                    currTarget = currFocus.text();
                }
                else {
                    currTarget = $(event.currentTarget).text();
                }

                indexOfDot = currTarget.indexOf('.');
                currTargetTextLen = currTarget.length;

                if (indexOfDot !== -1) {
                    if (charString === '.') {
                        event.preventDefault();
                    }
                    hasDecimal = true;
                    currTargetTextLen--;
                }
                cursorPosition = this.getCaretCharacterOffsetWithin(event.target);
                if (cursorPosition !== 0 && !regex.test(selectedText)) {
                    if (charString === '-') {
                        event.preventDefault();
                    }
                }
                if (currTarget.indexOf('-') !== -1) {
                    hasMinus = true;
                    currTargetTextLen--;
                }

                if (charString === '/') {
                    event.preventDefault();
                    if (currTarget !== '') {
                        numeratorText = currTarget;
                    }

                    targetElemId = $(event.currentTarget).attr('id');

                    htmlTemplate = MathUtilities.Tools.MatrixTool.templates['fraction-ui']({
                        numeratorText: numeratorText,
                        fractionId: targetElemId + '-fraction',
                        numeratorId: targetElemId + '-numerator',
                        denominatorId: targetElemId + '-denominator'
                    }).trim();

                    $(event.currentTarget).html(htmlTemplate);
                    $(event.currentTarget).attr('contenteditable', false);

                    $numerator = this.$el.find('#' + targetElemId + ' .numerator');
                    $denominator = this.$el.find('#' + targetElemId + ' .denominator');

                    if (this.isAccesibilityOn) {
                        $numerator.attr('tabindex', '-1');
                        $denominator.attr('tabindex', '-1');
                    }

                    if (currTarget !== '') {
                        $denominator.focus();
                    }
                    else {
                        $numerator.focus();
                    }
                    $('#' + targetElemId + ' .numerator').text(numeratorText);

                    this.setSelector($('#' + targetElemId).parents('.matrix-cell').attr('id'), '#' + targetElemId + ' .numerator');

                }
                return (this.checkTextOnKeyPress(event));
            }
            else {
                return false;
            }
        },
        /**
        * check if text is in proper format or not.
        * @method checkTextOnKeyPress
        * @return boolean
        * @private
        */

        checkTextOnKeyPress: function checkTextOnKeyPress(event) {
            var target = $(event.target),
                prevText = target.text(),
                regEx = /^[-]?[0-9]{0,2}(?:\.[0-9]{0,2})?$/,
                selectionLength = window.getSelection().toString().length,
                selectedText = this.getSelectedText(),
                charString = String.fromCharCode(event.charCode),
                cursorPosition = this.getCaretCharacterOffsetWithin(event.target),
                newString;

            if (selectionLength !== 0) {
                newString = prevText.replace(selectedText, charString);
            }
            else {
                newString = [prevText.slice(0, cursorPosition), charString, prevText.slice(cursorPosition)].join('');
            }
            if (regEx.test(newString)) {
                return true;
            }
            else {
                event.preventDefault();
                return false;
            }
        },

        /**
        * Action to be performed on input area keyup.
        * @method onKeyUp
        * @private
        */
        onKeyUp: function (event) {
            var inputHolder = $('.element-holder'),
                inputLength = $('.element-holder').length,
                inputValueLength = 0,
                j = 0,
                visibleElem = [],
                visibleElemLen = 0,
                currFocus = $("*:focus"),
                indexOfDot = 0,
                self = null,
                currTarget = null,
                regex = /^[-]?[0-9]{0,2}(?:\.[0-9]{0,2})?$/,
                target = $(event.target),
                currentText = target.text(),
                prevData = target.attr('prev-data'),
                modelData = MathUtilities.Tools.MatrixTool.MatrixToolHolder.Models.ChooseTask,
                currentTarget = $(event.currentTarget),
                matPos = '',
                currId = target.attr('id'),
                rowNo = '',
                colnNo = '',
                nextFocus = '',
                numArray = [],
                cursorPosition,
                numData,
                denomData,
                nextFocusObj,
                selfNum,
                selfDenom,
                numText,
                denomText,
                decimalAnswer,
                undoData = {},
                redoData = {},
                undoRedoData = {},
                $parentCell,
                curSelection = this.getSelectedText();

            if (!regex.test(currentText)) {
                target.text(prevData);
                this.setCursor(event.target, target.text().indexOf('.') + 1);
            }
            else {
                target.attr('prev-data', currentText);
            }

            if (currFocus.hasClass('numerator') || currFocus.hasClass('denominator')) {
                currTarget = currFocus.text();
                self = currFocus[0];
            }
            else {
                currTarget = $(event.currentTarget).text();
                self = event.target;
            }

            indexOfDot = currTarget.indexOf('.');
            inputValueLength = currTarget.length;

            if (indexOfDot !== -1) {
                inputValueLength--;
            }

            for (; j < inputLength; j++) {
                if ($(inputHolder[j]).parent().parent().css('display') !== 'none') {
                    if ($(inputHolder[j]).parent().css('display') !== 'none') {
                        if ($(inputHolder[j]).css('display') !== 'none') {
                            if ($(inputHolder[j]).attr('contenteditable') === 'true' || $(inputHolder[j]).attr('contenteditable') === undefined) {
                                visibleElem.push(inputHolder[j]);
                            }
                        }
                    }
                }
            }

            visibleElemLen = visibleElem.length;

            if (event.keyCode === modelData.KEYCODE_LEFT || event.keyCode === modelData.KEYCODE_UP || event.keyCode === modelData.KEYCODE_RIGHT || event.keyCode === modelData.KEYCODE_DOWN) {
                target = $(event.currentTarget);
                matPos = '';
                currId = target.attr('id');
                rowNo = '';
                colnNo = '';
                nextFocus = '';
                numArray = [];
                cursorPosition = this.model.get('cursorPosition');
                numData = null;
                denomData = null;
                nextFocusObj = null;
                selfNum = null;
                selfDenom = null;
                numText = null;
                denomText = null;
                decimalAnswer = null;
                undoData = {};
                redoData = {};
                undoRedoData = {};

                if (target.hasClass('first-columns')) {
                    matPos = 'first-';
                }
                else {
                    matPos = 'second-';
                }

                numArray = currId.substr(matPos.length, 2).split('');

                switch (event.keyCode) {
                    case modelData.KEYCODE_LEFT:
                        rowNo = numArray[0];
                        colnNo = (Number(numArray[1]) - 1).toString();
                        nextFocus = matPos + rowNo + colnNo;
                        nextFocusObj = $('#' + nextFocus);

                        if (($(currFocus[0]).hasClass('numerator') && nextFocusObj) || nextFocusObj) {
                            if (nextFocusObj.css('display') !== 'none') {
                                if (nextFocusObj.find('.denominator').length === 0) {
                                    if ($(currFocus[0]).hasClass('denominator') && cursorPosition === 0) {
                                        selfNum = $(event.currentTarget).find('.numerator')[0];
                                        this.setCursor(selfNum, $(selfNum).text().length);
                                    }
                                    else {
                                        if (cursorPosition === 0) {
                                            //if accessibility is off
                                            if (!this.isAccesibilityOn) {
                                                this.setCursor(nextFocusObj[0], nextFocusObj.text().length);
                                            }
                                        }
                                        else {
                                            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && curSelection === '') {
                                                this.setCursor($(currFocus[0])[0], cursorPosition - 1);
                                            }
                                        }
                                    }
                                }
                                else {
                                    if ($(currFocus[0]).hasClass('denominator') && cursorPosition === 0) {
                                        selfNum = $(event.currentTarget).find('.numerator')[0];
                                        this.setCursor(selfNum, $(selfNum).text().length);
                                    }
                                    else {
                                        if (cursorPosition === 0) {
                                            if (!this.isAccesibilityOn) {
                                                denomData = nextFocusObj.find('.denominator')[0];
                                                this.setCursor(denomData, $(denomData).text().length);
                                            }
                                        }
                                        else {
                                            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                                                this.setCursor($(currFocus[0])[0], cursorPosition - 1);
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                this.setCursor($(currFocus[0])[0], 0);
                            }
                        }
                        break;
                    case modelData.KEYCODE_UP:
                        rowNo = (Number(numArray[0]) - 1).toString();
                        colnNo = numArray[1];
                        nextFocus = matPos + rowNo + colnNo;
                        nextFocusObj = $('#' + nextFocus);

                        if ($(currFocus[0]).hasClass('denominator')) {
                            numData = $(event.currentTarget).find('.numerator')[0];
                            this.setCursor(numData, $(numData).text().length);
                        }
                        else if (nextFocusObj) {
                            //check if accessibility is off
                            if (nextFocusObj.css('display') !== 'none' && !this.isAccesibilityOn) {
                                if (nextFocusObj.find('.numerator').length === 0) {
                                    this.setCursor(nextFocusObj[0], nextFocusObj.text().length);
                                }
                                else {
                                    denomData = nextFocusObj.find('.denominator')[0];
                                    this.setCursor(denomData, $(denomData).text().length);
                                }
                            }
                            else {
                                this.setCursor($(currFocus[0])[0], $(currFocus[0]).text().length);
                            }
                        }
                        break;
                    case modelData.KEYCODE_RIGHT:
                        rowNo = numArray[0];
                        colnNo = (Number(numArray[1]) + 1).toString();
                        nextFocus = matPos + rowNo + colnNo;
                        nextFocusObj = $('#' + nextFocus);

                        if (($(currFocus[0]).hasClass('denominator') && nextFocusObj) || nextFocusObj) {
                            if (nextFocusObj.css('display') !== 'none') {
                                if (nextFocusObj.find('.numerator').length === 0) {
                                    if ($(currFocus[0]).hasClass('numerator') && cursorPosition === $(currFocus[0]).text().length) {
                                        selfDenom = $(event.currentTarget).find('.denominator')[0];
                                        this.setCursor(selfDenom, 0);
                                    }
                                    else {
                                        //check if accessibility is off
                                        if (cursorPosition === $(currFocus[0]).text().length && !this.isAccesibilityOn) {
                                            this.setCursor(nextFocusObj[0], 0);
                                        }
                                        else {
                                            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && curSelection === '') {
                                                this.setCursor($(currFocus[0])[0], cursorPosition + 1);
                                            }
                                        }
                                    }
                                }
                                else {
                                    if ($(currFocus[0]).hasClass('numerator') && cursorPosition === $(currFocus[0]).text().length) {
                                        selfDenom = $(event.currentTarget).find('.denominator')[0];
                                        this.setCursor(selfDenom, 0);
                                    }
                                    else {
                                        //check if accessibility is off
                                        if (cursorPosition === $(currFocus[0]).text().length && !this.isAccesibilityOn) {
                                            numData = nextFocusObj.find('.numerator')[0];
                                            this.setCursor(numData, 0);
                                        }
                                        else {
                                            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                                                this.setCursor($(currFocus[0])[0], cursorPosition + 1);
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                if ($(currFocus[0]).hasClass('numerator') && cursorPosition === $(currFocus[0]).text().length) {
                                    selfDenom = $(event.currentTarget).find('.denominator')[0];
                                    this.setCursor(selfDenom, 0);
                                }
                                else {
                                    if (cursorPosition + 1 <= $(currFocus[0]).text().length) {
                                        this.setCursor($(currFocus[0])[0], cursorPosition + 1);
                                    }
                                }
                            }
                        }
                        break;
                    case modelData.KEYCODE_DOWN:
                        rowNo = (Number(numArray[0]) + 1).toString();
                        colnNo = numArray[1];
                        nextFocus = matPos + rowNo + colnNo;
                        nextFocusObj = $('#' + nextFocus);

                        if ($(currFocus[0]).hasClass('numerator')) {
                            denomData = $(event.currentTarget).find('.denominator')[0];
                            this.setCursor(denomData, $(denomData).text().length);
                        }
                        else if (nextFocusObj) {
                            if (nextFocusObj.css('display') !== 'none' && nextFocusObj.parent().parent().css('display') !== 'none' && !this.isAccesibilityOn) {
                                if (nextFocusObj.find('.denominator').length === 0) {
                                    this.setCursor(nextFocusObj[0], nextFocusObj.text().length);
                                }
                                else {
                                    numData = nextFocusObj.find('.numerator')[0];
                                    this.setCursor(numData, $(numData).text().length);
                                }
                            }
                            else {
                                this.setCursor($(currFocus[0])[0], $(currFocus[0]).text().length);
                            }
                        }
                        break;
                }

            }
            else {
                if (currentTarget.find('.numerator').length !== 0) {
                    numText = currentTarget.find('.numerator').text();
                    denomText = currentTarget.find('.denominator').text();
                    if (numText === '') {
                        numText = 0;
                    }
                    if (denomText === '') {
                        denomText = 0;
                    }
                    decimalAnswer = numText / denomText;
                    currentTarget.attr('data-content', decimalAnswer);
                }
                else {
                    currentTarget.attr('data-content', currentTarget.text());
                }
                this.model.set('cursorPosition', this.getCaretCharacterOffsetWithin(event.currentTarget));


                redoData = {};
                redoData = this._getCellData($(event.target));
                undoData = this.model.get('cellKeyPressData');
                undoRedoData = { undo: undoData, redo: redoData };

                if (undoData && undoData.cell === redoData.cell && undoData.dataContent !== redoData.dataContent) {
                    this.trigger('undoRedoRegister', { actionName: 'CellDataChange', undoRedoData: undoRedoData });
                    this.model.set('cellKeyPressData', null); //as undo-redo registration done set data to null
                }

                //change acc message for cell
                $parentCell = $(event.target).parents('.matrix-cell');
                this.trigger('cellDataChange', $parentCell.attr('id'));
            }

            this.model.set('cellKeyPressData', null);
        },



        /**
        * Return caret position.
        * @method getCaretCharacterOffsetWithin
        * @private
        * @return {Integer}
        */
        getCaretCharacterOffsetWithin: function (element) {
            var caretOffset = 0,
                range,
                preCaretRange,
                textRange,
                preCaretTextRange;
            if (typeof window.getSelection !== "undefined") {
                if (window.getSelection().type === 'None') {
                    return;
                }
                else {
                    range = window.getSelection().getRangeAt(0);
                    preCaretRange = range.cloneRange();
                    preCaretRange.selectNodeContents(element);
                    preCaretRange.setEnd(range.endContainer, range.endOffset);
                    caretOffset = preCaretRange.toString().length;
                }
            } else if (typeof document.selection !== "undefined" && document.selection.type !== "Control") {
                textRange = document.selection.createRange();
                preCaretTextRange = document.body.createTextRange();
                preCaretTextRange.moveToElementText(element);
                preCaretTextRange.setEndPoint("EndToEnd", textRange);
                caretOffset = preCaretTextRange.text.length;
            }
            return caretOffset;
        },

        /**
        * Sets the cursor in the given node at specified position.
        * @method setCursor
        * @private
        * @param {Object} node-Object inside which cursor is to be set.
        * @param {Integer} pos-Position at which cursor is to be set.
        */
        setCursor: function setCursor(node, pos) {
            var selection,
                textRange,
                range;

            if (!node) {
                return false;
            } else if (document.createRange) {
                range = document.createRange();
                range.selectNodeContents(node);
                if (node.firstChild === null || node.firstChild === undefined) {
                    try {
                        range.setStart(node, pos);
                        range.setEnd(node, pos);
                    }
                    catch (e) {
                        return;
                    }
                }
                else {
                    range.setStart(node.firstChild, pos);
                    range.setEnd(node.firstChild, pos);
                }
                if (window.getSelection) {
                    selection = window.getSelection();
                } else {
                    selection = document.getSelection();
                }
                try {
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                catch (e) {
                    return;
                }
                node.focus();
            } else if (node.createTextRange) {
                textRange = node.createTextRange();
                textRange.collapse(true);
                textRange.moveEnd(pos);
                textRange.moveStart(pos);
                textRange.select();
                return true;
            } else if (node.setSelectionRange) {
                node.setSelectionRange(pos, pos);
                return true;
            }
            return false;
        },

        /**
        * Hide Error Message
        * @method hideErrorMessage
        * @private
        */
        hideErrorMessage: function () {
            var errorData = {};
            if ($('#error-holder').is(":visible")) {
                errorData.isVisible = true;
                errorData.errorMessage = $('#error-text').text();
                $('#error-holder').css('display', 'none').attr('data-display-flag', 'show');
                this.model.set('inputMatrixHeight', $('#calculation-holder').height());
            }
            else {
                errorData.isVisible = false;
                $('#error-holder').css('display', 'none').attr('data-display-flag', 'hide');
            }
            return errorData;
        },

        /**
        * Action to be performed on slider drag start.
        * @method onSliderStart
        * @private
        */
        onSliderStart: function (event) {
            var answer = this.model.get('answer'),
                $target = $(event.currentTarget),
                undoData = {},
                i, errorData;

            errorData = this.hideErrorMessage();

            this.model.set('sliderDragFocus', $(".element-holder:focus"));

            undoData.sliderValue = $(event.target).attr('slider-value');
            undoData.errorData = errorData;

            if ($target.hasClass('first-slider')) {
                undoData.sliderPosition = 'first';
                if ($target.hasClass('row')) {
                    undoData.isVerticalSlider = true;
                }
                else {
                    undoData.isVerticalSlider = false;
                }
            }
            else {
                undoData.sliderPosition = 'second';
                if ($target.hasClass('row')) {
                    undoData.isVerticalSlider = true;
                }
                else {
                    undoData.isVerticalSlider = false;
                }
            }
            this.trigger('saveToolState');
            this.model.set('slidingStartData', undoData);

            if (answer) {
                if (answer.length === undefined) {
                    this.trigger('disableUseResult', true);
                }
                else {
                    for (i = 0; i < answer.length; i++) {
                        if ((-99.99 > answer[i]) || (answer[i] > 99.99)) {
                            this.trigger('disableUseResult', false);
                            break;
                        }
                        else {
                            this.trigger('disableUseResult', false);
                        }
                    }
                }
            }
        },

        /**
        * Action to be performed on slider drag start.
        * @method onSliderStop
        * @private
        */
        onSliderStop: function (event) {
            var undoData = {},
            redoData = {},
            undoRedoData,
            caretPos = 0;

            undoData = this.model.get('slidingStartData');
            redoData.sliderValue = $(event.target).attr('slider-value');
            redoData.sliderPosition = undoData.sliderPosition;
            redoData.isVerticalSlider = undoData.isVerticalSlider;

            undoRedoData = {
                undo: undoData,
                redo: redoData
            };
            if (undoData.sliderValue !== redoData.sliderValue) {
                this.trigger('undoRedoRegister', { actionName: 'sliderValueChange', undoRedoData: undoRedoData });
            }

            //if accessibility is on don't change focus 
            if (this.isAccesibilityOn) {
                return;
            }

            if (this.model.get('sliderDragFocus').css('display') !== 'none' && this.model.get('sliderDragFocus').parent().parent().css('display') !== 'none' && this.model.get('sliderDragFocus').length !== 0) {
                this.setCursor(this.model.get('sliderDragFocus')[0], this.getCaretCharacterOffsetWithin(this.model.get('sliderDragFocus')[0]));
            }
            else {
                if ($(event.target).hasClass('second-slider')) {
                    caretPos = this.getCaretCharacterOffsetWithin($('#second-11')[0]);
                    if (caretPos > 2) {
                        this.setCursor($('#second-11')[0], $('#second-11').text().length);
                    }
                    else {
                        this.setCursor($('#second-11')[0], caretPos);
                    }
                }
                else {
                    caretPos = this.getCaretCharacterOffsetWithin($('#first-11')[0]);
                    if (caretPos > 2) {
                        this.setCursor($('#first-11')[0], $('#first-11').text().length);
                    }
                    else {
                        this.setCursor($('#first-11')[0], caretPos);
                    }
                }
            }
        },


        /**
        * Action to be performed on dragging vertical slider.
        * @method onVerticalSliderDrag
        * @private
        */
        onVerticalSliderDrag: function (event) {
            var currSliderValue = $(event.currentTarget).find('.slider-container').CustomSlider('option', 'value'),
                sliderPosition = null,
                firstRow = null,
                secRow = null,
                thirdRow = null,
                fourthRow = null,
                fifthRow = null,
                rows = null,
                i = 0,
                inputHolder = $('.element-holder'),
                inputLength = $('.element-holder').length;

            currSliderValue = Math.round(currSliderValue);

            if ($(event.currentTarget).hasClass('first-slider')) {
                sliderPosition = 'first';
            }
            else {
                sliderPosition = 'second';
            }

            firstRow = $('#' + sliderPosition + '-1');
            secRow = $('#' + sliderPosition + '-2');
            thirdRow = $('#' + sliderPosition + '-3');
            fourthRow = $('#' + sliderPosition + '-4');
            fifthRow = $('#' + sliderPosition + '-5');

            rows = $('.' + sliderPosition + '-rows');

            switch (currSliderValue) {
                case 0:
                    rows.show();
                    break;
                case 1:
                    rows.show();
                    fifthRow.hide().find('.element-holder').text('0').attr('data-content', '0');
                    break;
                case 2:
                    rows.show();
                    fourthRow.hide().find('.element-holder').text('0').attr('data-content', '0');
                    fifthRow.hide().find('.element-holder').text('0').attr('data-content', '0');
                    break;
                case 3:
                    rows.show();
                    thirdRow.hide().find('.element-holder').text('0').attr('data-content', '0');
                    fourthRow.hide().find('.element-holder').text('0').attr('data-content', '0');
                    fifthRow.hide().find('.element-holder').text('0').attr('data-content', '0');
                    break;
                case 4:
                    rows.show();
                    secRow.hide().find('.element-holder').text('0').attr('data-content', '0');
                    thirdRow.hide().find('.element-holder').text('0').attr('data-content', '0');
                    fourthRow.hide().find('.element-holder').text('0').attr('data-content', '0');
                    fifthRow.hide().find('.element-holder').text('0').attr('data-content', '0');
                    break;
            }

            //check if required
            if (!this.isAccesibilityOn) {
                for (i = 0; i < inputLength; i++) {
                    if ($(inputHolder[i]).find('.numerator').length === 0) {
                        $(inputHolder[i]).attr('contenteditable', true);
                    }
                    else {
                        $(inputHolder[i]).find('.numerator').attr('contenteditable', true);
                        $(inputHolder[i]).find('.denominator').attr('contenteditable', true);
                    }
                }
            }
            $(event.target).attr('slider-value', currSliderValue);

            //update focus Rect matrices
            this._updateMatrixFocusRect(sliderPosition);
        },

        /**
        * Action to be performed on dragging horizontal slider.
        * @method onHorizontalSliderDrag
        * @private
        */
        onHorizontalSliderDrag: function (event) {
            var currSliderValue = $(event.currentTarget).find('.slider-container').CustomSlider('option', 'value'),
                sliderPosition = null,
                firstColn = null,
                secColn = null,
                thirdColn = null,
                fourthColn = null,
                fifthColn = null,
                columns = null,
                i = 0,
                inputHolder = $('.element-holder'),
                inputLength = $('.element-holder').length;

            currSliderValue = Math.round(currSliderValue);


            if ($(event.currentTarget).hasClass('first-slider')) {
                sliderPosition = 'first';
            }
            else {
                sliderPosition = 'second';
            }

            firstColn = $('.' + sliderPosition + '-1');
            secColn = $('.' + sliderPosition + '-2');
            thirdColn = $('.' + sliderPosition + '-3');
            fourthColn = $('.' + sliderPosition + '-4');
            fifthColn = $('.' + sliderPosition + '-5');

            columns = $('.' + sliderPosition + '-columns');

            switch (currSliderValue) {
                case 0:
                    columns.show().parents('.matrix-cell').show();
                    secColn.hide().text('0').attr('data-content', '0').parents('.matrix-cell').hide();
                    thirdColn.hide().text('0').attr('data-content', '0').parents('.matrix-cell').hide();
                    fourthColn.hide().text('0').attr('data-content', '0').parents('.matrix-cell').hide();
                    fifthColn.hide().text('0').attr('data-content', '0').parents('.matrix-cell').hide();
                    break;

                case 1:
                    columns.show().parents('.matrix-cell').show();
                    thirdColn.hide().text('0').attr('data-content', '0').parents('.matrix-cell').hide();
                    fourthColn.hide().text('0').attr('data-content', '0').parents('.matrix-cell').hide();
                    fifthColn.hide().text('0').attr('data-content', '0').parents('.matrix-cell').hide();
                    break;

                case 2:
                    columns.show().parents('.matrix-cell').show();
                    fourthColn.hide().text('0').attr('data-content', '0').parents('.matrix-cell').hide();
                    fifthColn.hide().text('0').attr('data-content', '0').parents('.matrix-cell').hide();
                    break;

                case 3:
                    columns.show().parents('.matrix-cell').show();
                    fifthColn.hide().text('0').attr('data-content', '0').parents('.matrix-cell').hide();
                    break;

                case 4:
                    columns.show().parents('.matrix-cell').show();
                    break;

            }
            //check if required
            if (!this.isAccesibilityOn) {
                for (i = 0; i < inputLength; i++) {
                    if ($(inputHolder[i]).find('.numerator').length === 0) {
                        $(inputHolder[i]).attr('contenteditable', true);
                    }
                    else {
                        $(inputHolder[i]).find('.numerator').attr('contenteditable', true);
                        $(inputHolder[i]).find('.denominator').attr('contenteditable', true);
                    }
                }
            }

            $(event.target).attr('slider-value', currSliderValue);

            //update focus Rect matrices
            this._updateMatrixFocusRect(sliderPosition);
        },

        /**
        * Disable Submit button.
        * @method disableGoButton
        * @private
        */
        disableGoButton: function (disableBtn) {
            if (disableBtn) {
                this.model.get('goBtnView').setButtonState(MathUtilities.Components.Button.BUTTON_STATE_DISABLED);
                $('#go-btn').off('click.matrix', $.proxy(this.onChooseGoClick, this));
            }
            else {
                this.model.get('goBtnView').setButtonState(MathUtilities.Components.Button.BUTTON_STATE_ACTIVE);
                $('#go-btn').off('click.matrix').on('click.matrix', $.proxy(this.onChooseGoClick, this));
            }
        },

        hoverFunction: function hoverFunction() {
            var $undoGraph = $('#undo'),
                $redoGraph = $('#redo'),
                isTouchSupported = 'ontouchstart' in window;

            if (isTouchSupported) {
                $undoGraph.on('touchstart',

                    function () {
                        $undoGraph.addClass('hovered');
                    });

                $undoGraph.on('touchend',
                function () {
                    $undoGraph.removeClass('hovered');
                });
            }
            else {
                $undoGraph.on('mouseenter',
                    function () {
                        $undoGraph.addClass('hovered');
                    });

                $undoGraph.on('mouseleave',
                function () {
                    $undoGraph.removeClass('hovered');
                });

            }


            if (isTouchSupported) {
                $redoGraph.on('touchstart',

                    function () {
                        $redoGraph.addClass('hovered');
                    });

                $redoGraph.on('touchend',
                function () {
                    $redoGraph.removeClass('hovered');
                });
            }
            else {
                $redoGraph.on('mouseenter',
                    function () {
                        $redoGraph.addClass('hovered');
                    });

                $redoGraph.on('mouseleave',
                function () {
                    $redoGraph.removeClass('hovered');
                });

            }
        },

        /**
        * Sets slider to the specified value.
        * @method setSlider
        * @private
        * @param {String} matrix Slider id string
        * @param {Integer} verticalSliderValue Value at which vertical slider is to be placed.
        * @param {Integer} horizontalSliderValue Value at which horizontal slider is to be placed.
        */
        setSlider: function setSlider(matrix, verticalSliderValue, horizontalSliderValue) {
            if (matrix === 'firstMatrix') {
                if (verticalSliderValue !== undefined) {
                    this._firstVerticalSlider.set(5 - verticalSliderValue);
                }
                if (horizontalSliderValue !== undefined) {
                    this._firstHorizontalSlider.set(horizontalSliderValue - 1);
                }
            }
            else {
                if (verticalSliderValue !== undefined) {
                    this._secondVerticalSlider.set(5 - verticalSliderValue);
                }
                if (horizontalSliderValue !== undefined) {
                    this._secondHorizontalSlider.set(horizontalSliderValue - 1);
                }
            }
        },

        /**
        * Returns the selected text.
        * @method getSelectedText
        * @private
        */
        getSelectedText: function getSelectedText() {
            var html = "",
                container,
                i,
                sel,
                len;
            if (typeof window.getSelection !== "undefined") {
                sel = window.getSelection();
                if (sel.rangeCount) {
                    container = document.createElement("div");
                    for (i = 0, len = sel.rangeCount; i < len; ++i) {
                        container.appendChild(sel.getRangeAt(i).cloneContents());
                    }
                    html = container.innerHTML;
                }
            } else if (typeof document.selection !== "undefined") {
                if (document.selection.type === "Text") {
                    html = document.selection.createRange().htmlText;
                }
            }
            return html;
        },

        /**
        * Check if device is nexus or not
        * @method _isNexus
        * @returns {bool} Returns true if device is nexus, else returns false.
        * @private
        */
        _isNexus: function () {
            return navigator.platform === 'Linux armv7l';
        },

        /**
        * Check if browser is IE or not
        * @method _isIE
        * @returns {bool} Returns true if browser is IE, else returns false.
        * @private
        */
        _isIE: function () {
            return navigator.appName === 'Microsoft Internet Explorer';
        },

        _bPropogateEvent: true,

        /**
        * Listens keypress event , checks if value of key is valid into current value.
        * @method _keyhandlerNexus
        * @returns {bool} Returns true if value can be inserted, else returns false.
        * @private
        */
        _keyhandlerNexus: function (event) {
            var self = this,
            $target = $(event.target),
            val = $target.text(),
            cursorPos,
            charCode,
            currFocus = $("*:focus"),
            numeratorText,
            htmlTemplate,
            targetElemId,
            currTarget,
            $parentCell,
            undoData = {},
            preVal,
            char, errorData;

            errorData = this.hideErrorMessage();

            undoData = this._getCellData($(event.target));
            undoData.errorData = errorData;
            undoData.cellHTML = undoData.cellHTML.replace(/[//]/g, '')

            this.model.set('cellKeyPressData', undoData);
            cursorPos = self.getCaretCharacterOffsetWithin(event.target);
            charCode = event.which || event.charCode;

            // For Firefox: Detects Ctrl+V key press event, ctrl +  A.
            if (self._isValidCtrlEvents(event)) {
                return true;
            }

            preVal = val.substring(0, cursorPos - 1) + val.substring(cursorPos, val.length);
            char = val.substr(cursorPos - 1, 1);

            if (char === '/') {
                if ($(event.currentTarget).find('.numerator').length !== 0) {
                    event.preventDefault();
                }
                else {
                    if (currFocus.hasClass('numerator') || currFocus.hasClass('denominator')) {
                        currTarget = currFocus.text();
                    }
                    else {
                        currTarget = $(event.currentTarget).text();
                    }
                    event.preventDefault();
                    if (preVal !== '') {
                        numeratorText = preVal;
                    }

                    targetElemId = $(event.currentTarget).attr('id');

                    htmlTemplate = MathUtilities.Tools.MatrixTool.templates['fraction-ui']({
                        numeratorText: numeratorText,
                        denominatorId: targetElemId + '-denominator',
                        numeratorId: targetElemId + '-numeratorId'
                    }).trim();

                    $(event.currentTarget).html(htmlTemplate);
                    $(event.currentTarget).attr('contenteditable', false);

                    if (this._isNexus) {

                        $('.denominator').off('focusin').on('focusin', $.proxy(this._nexusFracFocusIn, this));
                        $('.numerator').off('focusin').on('focusin', $.proxy(this._nexusFracFocusIn, this));

                        $('.denominator').off('input').on('input', $.proxy(this._nexusFracInput, this));
                        $('.numerator').off('input').on('input', $.proxy(this._nexusFracInput, this));
                    }

                    if (currTarget !== '/') {
                        $('#' + targetElemId + ' .denominator').focus();
                    }
                    else {
                        $('#' + targetElemId + ' .numerator').focus();
                    }
                    $('#' + targetElemId + ' .numerator').text(numeratorText).attr('prev-data', numeratorText);
                    $('#' + targetElemId + ' .denominator').attr('prev-data', '');


                }
                self._bPropogateEvent = false;
            }
            else {
                self._bPropogateEvent = self._keyDownHandler(char, preVal, $target, cursorPos);
            }
            // To remove Character
            if (!self._bPropogateEvent) {
                $target.val(preVal);
            }
            else {
            }

            return self._bPropogateEvent;

        },

        /**
        * Input event for fractions in nexus.
        * @method _nexusFracInput
        * @private
        */
        _nexusFracInput: function (event) {
            if ($(event.currentTarget).attr('prev-data').length > $(event.currentTarget).text().length) {
                $(event.currentTarget).blur().focus();
            }
        },

        _nexusFracFocusIn: function (event) {
            if ($(event.currentTarget).text() === '') {

                this.model.set('keydownFlagForNexus', false);
                var eventId = $(event.currentTarget).attr('id'),
                    textarea = ('<input type=text id=' + eventId + '-text class=nexus-textarea value=a />');

                $(event.currentTarget).parents('#matrixToolHolder').append($(textarea));

                $('#' + eventId + '-text').on('input', $.proxy(this._nexusTextFracInput, this, [eventId]));

                $('#' + eventId + '-text').on('keydown', $.proxy(this._nexusTextFracKeydown, this, [eventId]));

                setTimeout(function () { $('#' + eventId + '-text').focus(); }, 20);
            }
            else {
                return;
            }
        },

        _nexusTextFracInput: function (args, event) {
            if (this.model.get('keydownFlagForNexus')) {
                this.model.set('keydownFlagForNexus', false);
                return;
            }
            else {
                if ($(event.currentTarget).val() !== '') {
                    this.model.set('insideKeydown', true);
                }

                if ($('#' + args[0]).hasClass('denominator')) {
                    this.model.set('numText', $($('#' + args[0]).parents('.non-leaf').find('.numerator')[0]).text());
                    $('#' + args[0]).parents('.element-holder').text($($('#' + args[0]).parents('.non-leaf').find('.numerator')[0]).text()).attr('contenteditable', true).attr('data-content', $($('#' + args[0]).parents('.non-leaf').find('.numerator')[0]).text()).focus();
                }
                else if ($('#' + args[0]).hasClass('numerator')) {
                    this.model.set('denomText', $($('#' + args[0]).parents('.non-leaf').find('.denominator')[0]).text());
                    $('#' + args[0]).parents('.element-holder').text($($('#' + args[0]).parents('.non-leaf').find('.denominator')[0]).text()).attr('contenteditable', true).attr('data-content', $($('#' + args[0]).parents('.non-leaf').find('.denominator')[0]).text()).focus();
                }
                $(event.currentTarget).remove();
            }
        },

        _nexusTextFracKeydown: function (args, event) {
            var keyCode = event.keyCode,
                charString = String.fromCharCode(keyCode),
                regex = /[0-9]|\.|\/|-/;

            this.model.set('keydownFlagForNexus', true);

            if (regex.test(charString)) {
                $('#' + args[0]).attr('prev-data', charString).text(charString).focus();
                $(event.currentTarget).remove();
                event.preventDefault();
                event.stopPropagation();
                return;
            }

        },

        /**
        * Detects ctrl + KEY events, and returns true if its type of control event.
        * @method _isValidCtrlEvents
        * @params {Object} event object
        * @returns {Bool} true if event is type of cntrl, else returns false.
        * @private
        */
        _isValidCtrlEvents: function (event) {
            var charCode = event.which || event.keyCode,
                Choose_Task_model = MathUtilities.Tools.MatrixTool.MatrixToolHolder.Models.ChooseTask,
                isControlEvent, isShiftSeletion, isMacControlEvents;
            //ctrl+v, ctrl+c,ctrl+a,ctr+x for firefox
            isControlEvent = (event.metaKey || event.ctrlKey) && (charCode === Choose_Task_model.KEYCODE_ALPHABET_V || charCode === Choose_Task_model.KEYCODE_ALPHABET_X || charCode === Choose_Task_model.KEYCODE_ALPHABET_C || charCode == Choose_Task_model.KEYCODE_ALPHABET_A);

            //window v, window+c,window+a for Mac
            isMacControlEvents = (charCode === Choose_Task_model.KEYCODE_MAC_LEFT_WINDOW_FOR_CHROME || charCode === Choose_Task_model.KEYCODE_MAC_RIGHT_WINDOW_FOR_CHROME || charCode === Choose_Task_model.KEYCODE_MAC_LEFT_RIGHT_WINDOW_FOR_MOZILLA) && (charCode === Choose_Task_model.KEYCODE_ALPHABET_V || charCode === Choose_Task_model.KEYCODE_ALPHABET_X || charCode === Choose_Task_model.KEYCODE_ALPHABET_C || charCode == Choose_Task_model.KEYCODE_ALPHABET_A);

            //shift + arrow selection
            isShiftSeletion = (event.shiftKey && (charCode === Choose_Task_model.KEYCODE_LEFT || charCode === Choose_Task_model.KEYCODE_RIGHT));

            return isControlEvent || isMacControlEvents || isShiftSeletion;

        },

        /**
        * Validates the input's text on each keydown event for nexus. 
        * 
        * @method _keyDownHandler
        * @param {number} Character code for that keypress event.
        * @param {number} Key code for that keypress event.
        * @param {string} Input type's jquery selector.
        * @param {number} Cursor position.
        * @private
        * @return {boolean} Returns true on success.
        */
        _keyDownHandler: function (char, preVal, selector, cursorPos) {
            var val = $(selector).text(),
                regexInput = /^(\+|-)?(\d{1,})?([\.]\d{1,})?$/,
                regexdecimal = /^(\+|-)?(\d{1,})?[\.]$/,
                regexDigit = /^\d{1,}$/,
                curSelection = this.getSelectedText();
           
            if (this.model.get('insideKeydown')) {

                var parentId = $(selector).attr('id'),
                    htmlTemplate = '',
                    jqParentId = $('#' + parentId),
                    denom, num;

                htmlTemplate = MathUtilities.Tools.MatrixTool.templates['fraction-ui']({
                    numeratorText: this.model.get('numText'),
                    denominatorId: parentId + '-denominator',
                    numeratorId: parentId + '-numeratorId'
                }).trim();

                jqParentId.html(htmlTemplate);


                $('.denominator').off('focusin').on('focusin', $.proxy(this._nexusFracFocusIn, this));
                $('.numerator').off('focusin').on('focusin', $.proxy(this._nexusFracFocusIn, this));

                $('.denominator').off('input').on('input', $.proxy(this._nexusFracInput, this));
                $('.numerator').off('input').on('input', $.proxy(this._nexusFracInput, this));


                jqParentId.attr('contenteditable', false);

                denom = $(jqParentId.find('.denominator')[0]);
                num = $(jqParentId.find('.numerator')[0]);

                denom.text(this.model.get('denomText'));
                num.text(this.model.get('numText'));

                if (this.model.get('denomText') === '') {
                    denom.blur().focus();
                }
                else if (this.model.get('numText') === '') {
                    num.blur().focus();
                }

                this.model.set('insideKeydown', false);

                return;
            }


            // Check for selecting entire input data.
            if ((preVal === curSelection) && (char === '+' || char === '-' || char === '.')) {
                return true;
            }

            // Checks input box value's with the regex OR the first key down.
            if (regexInput.test(val) || (preVal === '' && (char === '+' || char === '-' || char === '.'))) {
                return true;
            }
                // Check for second key press (must not be '+'|'-'|'.' if already present, only numbers)
            else if ((preVal === '+' || preVal === '-') && regexDigit.test(char)) {
                if (cursorPos === 0) {
                    return false;
                }
                return true;
            }
                // Check for '.' decimal point.
            else if (preVal.indexOf('.') < 0 && char === '.') {
                return true;
            }
                // Check for '+', '-' & number entering before '.' .
            else if ((cursorPos <= preVal.indexOf('.'))) {
                if (!regexdecimal.test(val)) {
                    return false;
                }
                return true;
            }
                // Return false for any char other than direction and backspace.
            else {
                return false;
            }
        },
        /**
        * Handle paste event.
        * @method pasteHandler
        * @private
        * @return boolean 
        */
        pasteHandler: function (event) {
            var pastedText = null;
            
            // Copys the clipboard's data ready to be pasted. ONLY for IE
            if (window.clipboardData && window.clipboardData.getData) {
                pastedText = window.clipboardData.getData('Text');
            }
                // Copys the clipboard's data ready to be pasted. For FireFox and Web-Kit
            else if (event.originalEvent.clipboardData) {
                pastedText = event.originalEvent.clipboardData.getData('text/plain');
            }
            pastedText.trim();

            return this._onPasteHandler(pastedText, event);
        },
        /**
        * Triggers on a paste event and validates the clipboard's text to be pasted. 
        * 
        * @method _onPasteHandler
        * @param {number} pastedText Content to pe paste.
        * @param {string} selector Input type's jquery selector.
        * @private
        * @return {boolean} Returns true on success.
        */
        _onPasteHandler: function (pastedText, selector) {
            var regexInput = /^[-]?[0-9]{0,2}(?:\.[0-9]{0,2})?$/,
                val = null,
                cursorPos = null,
                curSelection = this._getSelectionText(),
                $currentTarget,
                $parentCell,
                numText,
                denomText,
                decimalAnswer,
                undoData = {},
                redoData = {},
                self = this;

            if (pastedText) {
                pastedText = pastedText.trim();
                val = $(selector.target).text();
                cursorPos = this.getCaretCharacterOffsetWithin(selector.target);

                if (curSelection.length > 0) {
                    val = val.substring(0, cursorPos - curSelection.length) + pastedText + val.substr(cursorPos - curSelection.length + curSelection.length, val.length);
                }
                else {
                    // Appends the content to be pasted to the input value at  the current cursor position.
                    val = val.substring(0, cursorPos) + pastedText + val.substring(cursorPos, val.length);
                }


                // Returns false if the regular expression test falis.
                if (regexInput.test(val)) {

                    $currentTarget = $(selector.currentTarget);


                    undoData = this._getCellData($currentTarget);
                    undoData.errorData = this.hideErrorMessage();


                    //undo-redo registeration
                    setTimeout(function () {
                        //change data-content of div
                        if ($currentTarget.find('.numerator').length !== 0) {
                            numText = $currentTarget.find('.numerator').text();
                            denomText = $currentTarget.find('.denominator').text();
                            if (numText === '') {
                                numText = 0;
                            }
                            if (denomText === '') {
                                denomText = 0;
                            }
                            decimalAnswer = numText / denomText;
                            $currentTarget.attr('data-content', decimalAnswer);
                        }
                        else {
                            $currentTarget.attr('data-content', $currentTarget.text());
                        }

                        redoData = self._getCellData($currentTarget);
                        if (undoData && undoData.cell === redoData.cell && undoData.dataContent !== redoData.dataContent) {
                            self.trigger('undoRedoRegister', { actionName: 'CellDataChange', undoRedoData: { undo: undoData, redo: redoData } });
                        }
                    }, 0);

                    return true;
                }
                else {
                    return false;
                }
            }
        },
        _getSelectionText: function () {
            var actualValue = "",
                text = "",
                selRange = null,
                range = null;

            if (window.getSelection && !this._isIE()) {  // all browsers, except IE
                if (document.activeElement &&
                        (document.activeElement.tagName.toLowerCase() === "textarea" ||
                         document.activeElement.tagName.toLowerCase() === "input")) {
                    actualValue = document.activeElement.value;
                    text = actualValue.substring(document.activeElement.selectionStart,
                                              document.activeElement.selectionEnd);
                }
                else {
                    selRange = window.getSelection();
                    if (selRange) {
                        text = selRange.toString();
                    }
                }
            }
            else {
                if (document.selection.createRange) { // Internet Explorer
                    range = document.selection.createRange();
                    if (range) {
                        text = range.text;
                    }
                }
            }
            return text;
        },

        /**
        *return cell data require for undo-redo
        * 
        * @method _getCellData
        * @params {$holder} eventObject
        * @private
        */
        _getCellData: function _getCellData($holder) {
            var $parentCell, cellData = {};
            $parentCell = $holder.parents('.matrix-cell');
            cellData.cell = $parentCell.find('.element-holder').attr('id');
            cellData.cellHTML = $parentCell.find('.element-holder').html();
            cellData.dataContent = $parentCell.find('.element-holder').attr('data-content');
            cellData.prevData = $parentCell.find('.element-holder').attr('prev-data');

            return cellData;
        },

        /** method to get is accessibility mode on or off
        * @method getAccessibility
        * @private
        * @return {Boolean} true if accessibility is on,otherwise false
        */

        getAccessibility: function getAccessibility() {
            return this.isAccesibilityOn;
        },

        /** method to set accessibility mode.
        * @method setAccessibility
        * @private
        * @params {Boolean} true if accessibility to be on,otherwise false
        */
        setAccessibility: function setAccessibility(isOn) {
            if (typeof (isOn) === "boolean") {
                this.isAccesibilityOn = isOn;
            }
        },
        /**
       * Sets the selector for element.
       * @method changeSelector
       * @param accId {String} Element id of required element.
       * @param selector {String} Selector onto which focus is to be set.
       **/
        setSelector: function setSelector(accId, selector) {
            this.trigger('changeSelector', accId, selector);
        },

        /**
        *update focus rect of matrix
        *@method _updateMatrixFocusRect
        *@param matrix {string} matrix id either first or second
        */
        _updateMatrixFocusRect: function _updateMatrixFocusRect(matrix) {
            var $el = this.$el,
                cellId,
                self = this;

            //matrix Container
            self.trigger('updateFocusRect', matrix);

            //matrix cell
            $el.find('#' + matrix).find('.matrix-cell').each(function () {
                cellId = $(this).attr('id');
                self.trigger('updateFocusRect', cellId);
            });
        }

    });
}(window.MathUtilities));