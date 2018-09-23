/* globals $, window, _ */

(function(MathUtilities) {
    'use strict';

    /**
     * SliderPanel holds functionality related to manipulating sliders in sliderPanel
     * @class SliderPanel
     * @extends Backbone.View
     * @constructor
     */

    MathUtilities.Tools.Graphing.Views.SliderPanel = Backbone.View.extend({
        /**
         * holds collection of sliders
         * @property _sliderViewCollection
         * @type {Object}
         */
        "_sliderViewCollection": null,

        /**
         * holds collection of visible sliders
         * @property _focussedSliderNames
         * @type {Object}
         */
        "_focussedSliderNames": null,

        "_sliderNameIdMap": null,

        "_equationDataManager": null,

        "_equationPanel": null,

        "_isDataChanged": null,
        "_allSlidersVisible": false,

        "_hideOtherSliders": true,

        "TouchSimulator": MathUtilities.Components.Utils.TouchSimulator,

        "events": {
            "click .delete-constant": 'callRemoveSlider',
            "keyup .constant-textarea": '_callUpdateSliderData',
            "click #slider-settings-icon-holder": '_showHideSettingsOption',
            "click .all-constants-checkbox-container": '_callShowHideOtherSliders',
            "keyup #slider-settings-window .slider-settings-textbox": '_keyUpHandler',
            "click #keyboard-title-container": 'showHideKeyBoard',
            "click #slider-title-holder": 'showHideSliderPanel',
            "focusout .constant-textarea, .slider-settings-textbox": '_updateTextArea'
        },

        /**
         * Initialize method
         * @method initialize
         * @constructor
         */
        "initialize": function() {
            this._sliderViewCollection = {};
            this._focussedSliderNames = [];
            this._sliderNameIdMap = {};
            this._equationDataManager = this.options._equationDataManager;
            this._equationPanel = this.options._equationPanel;
            this._accManager = this._equationPanel.accManagerView;
            this.model = new MathUtilities.Tools.Graphing.Models.SliderPanel();
            this._render();
        },

        "hideKeyboard": function(isButtonClicked) {
            this._equationPanel._graphingToolView.closeKeyboard(isButtonClicked);
        },

        "showKeyBoard": function(isButtonClicked) {
            this._equationPanel._graphingToolView.openKeyboard(isButtonClicked);
            var cursorClassTag = this._equationPanel.model.get('cursorClassTag');
            if ($('#input-column').is(':visible')) {
                if (cursorClassTag.length === 1) {
                    cursorClassTag.find('textarea').focus();
                } else {
                    this.$('.list').last().find('.mathquill-editable').find('textarea').focus();
                }
            }
        },
        "updateListNumber": function(listNumber) {
            this._focussedList = listNumber;
            this.focusSliders(this._focussedSliderNames, this._focussedList);
        },
        "showHideKeyBoard": function() {
            if (this._equationPanel.isKeyboardVisible()) {
                this.hideKeyboard(true);
            } else {
                this.hidePanel();
                this.showKeyBoard(true);
            }
            this._accManager.setFocus('dummy-focus-container');
            this._accManager.setFocus('keyboard-title-container');
        },

        "showHideSliderPanel": function() {
            if (this.$('#sliders-bottom-panel-container').is(':visible')) {
                this.hidePanel();
            } else {
                this.hideKeyboard();
                this.showPanel();
            }
        },

        /**
         * _render method renders basic DOM for panel
         * @method _render
         * @constructor
         */
        "_render": function() {
            var $panel = MathUtilities.Tools.Graphing.templates['slider-panel']({
                    "createPanel": true
                }).trim(),
                $settingsIcon, $deleteIcon,
                self = this,
                mouseEnterFunction = function(event) {
                    $(this).addClass('hovered');
                },
                mouseLeaveFunction = function(event) {
                    if (self._equationPanel._graphingToolView.removeHover(event) === true) {
                        $(this).removeClass('hovered');
                    }
                };
            this.$el.append($panel);
            $settingsIcon = this.$('#slider-settings-icon-holder');
            $deleteIcon = this.$('#slider-delete-icon-holder');

            //Changed Toggle Class to addClass and removeClass to fix touch and type as enable Touch fires mouseleave and not mouseenter on mouseclick

            $settingsIcon.on('mouseenter mousedown', mouseEnterFunction).on('mouseleave mouseup', mouseLeaveFunction);
            this.TouchSimulator.enableTouch($settingsIcon);

            $deleteIcon.on('mouseenter mousedown', mouseEnterFunction).on('mouseleave mouseup', mouseLeaveFunction);
            this.TouchSimulator.enableTouch($deleteIcon);
            this._showHideOtherSliders(true);
        },

        "getSliderPanelState": function() {
            var sliders = this._sliderViewCollection,
                sliderData = [],
                currentSlider,
                sliderIndex;
            for (sliderIndex in sliders) {
                currentSlider = sliders[sliderIndex];
                if (!currentSlider.isDependent) {
                    sliderData.push(this.getSerializedSliderData(currentSlider));
                }
            }
            return sliderData;
        },

        "setSliderPanelState": function(data, hideOtherSliders) {
            if (data) {
                this.resetSliderPanel();
                var sliderCounter,
                    currentSliderData,
                    noOfSliders;
                noOfSliders = data.length;
                for (sliderCounter = 0; sliderCounter < noOfSliders; sliderCounter++) {
                    currentSliderData = data[sliderCounter];
                    this.addSlider(currentSliderData);
                }
            }
            if (hideOtherSliders) {
                this._showHideOtherSliders(false);
            }
        },

        "_keyUpHandler": function(event) {
            if (event.keyCode === MathUtilities.Tools.Graphing.Models.EquationPanel.ENTER_KEY) {
                var $targetContainer = $(event.target).parents('.constant-slider-options-row'),
                    undoRedoData = {
                        "undo": {},
                        "redo": {}
                    },
                    sliderView = this.getSliderFromCollectionUsingName($targetContainer.attr('data-constant-name')),
                    currentValue = sliderView.get('currValue'),
                    limits;
                undoRedoData.undo.dataConstant = sliderView.sliderName;
                undoRedoData.undo.limits = this._getLimitDataFromSlider(sliderView);
                undoRedoData.redo = this._getLimitData($targetContainer, sliderView);
                limits = undoRedoData.redo.limits;
                if (currentValue > limits[1]) {
                    currentValue = limits[1];
                } else if (currentValue < limits[0]) {
                    currentValue = limits[0];
                }
                sliderView.set(currentValue);
                sliderView.setLimits(limits);
                this.execute('sliderLimitChanged', undoRedoData);
            } else {
                if (!this._isDataChanged) {
                    this._isDataChanged = true;
                }
            }
        },

        /**
         * showPanel shows sliderPanel
         * @method showPanel
         * @constructor
         */
        "showPanel": function() {
            this.$('#slider-title-holder').addClass('bring-to-front');
            this.$('#sliders-bottom-panel-container').show();
            this.trigger('slider-panel-max');
            this._enableDisableSliderDeleteBtn();
        },

        /**
         * hidePanel hides sliderPanel
         * @method hidePanel
         * @constructor
         */
        "hidePanel": function() {
            this.$('#slider-title-holder').removeClass('bring-to-front');
            this.$('#sliders-bottom-panel-container').hide();
            this.trigger('slider-panel-min');
            this._hideDeleteOption();
        },

        /**
         * addSliderInCollection adds sliderView in collection
         * @method addSliderInCollection
         * @param {Object} sliderView
         * @constructor
         */
        "addSliderInCollection": function(sliderView) {
            this._sliderViewCollection[sliderView.cid] = sliderView;
            this._sliderNameIdMap[sliderView.sliderName] = sliderView.cid;
        },

        /**
         * removeSliderFromCollection removes sliderView from collection
         * @method removeSliderFromCollection
         * @param {String} sliderCid backbone id for slider object
         * @constructor
         */
        "removeSliderFromCollection": function(sliderCid) {
            var sliderView = this._sliderViewCollection[sliderCid];
            delete this._sliderViewCollection[sliderCid];
            if (sliderView !== void 0) {
                delete this._sliderNameIdMap[sliderView.sliderName];
            }
        },

        /**
         * getSliderViewUsingCid returns sliderView from collection for the given cid
         * @method getSliderViewUsingCid
         * @param {Object} slider view cid
         * @constructor
         */
        "getSliderViewUsingCid": function(cid) {
            return this._sliderViewCollection[cid];
        },

        "getSliderFromCollectionUsingName": function(sliderName) {
            return this.getSliderViewUsingCid(this._sliderNameIdMap[sliderName]);
        },

        "getSerializedSliderData": function(sliderView) {
            return {
                "sliderOptions": {
                    "currValue": sliderView.get('currValue'),
                    "val": sliderView.get('currValue'),
                    "step": sliderView.get('step'),
                    "min": sliderView.get('min'),
                    "max": sliderView.get('max'),
                    "addClass": 'graphing-tool-sprite-holder'
                },
                "sliderName": sliderView.sliderName
            };
        },

        "getSliderData": function(sliderView) {
            if (typeof sliderView === 'string') {
                sliderView = this.getSliderViewUsingCid(sliderView);
            }

            return {
                "sliderCid": sliderView.cid,
                "sliderOptions": {
                    "currValue": sliderView.get('currValue'),
                    "val": sliderView.get('currValue'),
                    "step": sliderView.get('step'),
                    "min": sliderView.get('min'),
                    "max": sliderView.get('max'),
                    "addClass": 'graphing-tool-sprite-holder'
                },
                "sliderName": sliderView.sliderName,
                "equationData": this._equationPanel._getEquationDataUsingCid(this.$('.constant-slider-container[data-slider-view=' + sliderView.cid + ']').attr('data-equation-cid'))
            };
        },
        "hideCurrentSliders": function() {
            this.$('#other-constants').append(this.$('.constant-slider-container'));
            this.$('#current-list-constants-holder').hide();
            this._focussedSliderNames = [];
            this.$('#other-constants-holder').addClass('current-constants-hidden');
            this._enableDisableSliderDeleteBtn();
        },
        "showCurrentSliders": function() {
            this.$('#current-list-constants-holder').show();
            this.$('#other-constants-holder').removeClass('current-constants-hidden');
        },

        "resetSliderPanel": function() {
            var sliderViews = this._sliderViewCollection,
                sliderIndex,
                currentSliderData,
                currentSlider,
                sliderData = {};
            for (sliderIndex in sliderViews) {
                currentSlider = sliderViews[sliderIndex];
                currentSliderData = this.getSliderData(currentSlider);
                if (currentSliderData.equationData && !this._equationPanel.hasListBox(currentSliderData.equationData.getCid())) {
                    sliderData[currentSlider.sliderName] = currentSliderData;
                    this.removeSlider({
                        "sliderName": currentSliderData.sliderName,
                        "doNotDeleteList": true
                    });
                }
            }
            this._showHideOtherSliders(true);
            return sliderData;
        },

        /**
         * addSliderToPanel adds slider for given constant to container
         * @method addSlider
         * @constructor
         */
        "addSliderToPanel": function(constant, equationCid, uniqueId) {
            var $newSlider, $newOptionRow, constantForDisplay,
                $settings = $(this.$('.slider-options')),
                $deleteIcon, sliderName,
                newSlider, newOptionRow,
                $constantOption,
                $sliderHolderDiv = $(this.$('#other-constants-holder'));
            constantForDisplay = this._equationPanel._processSliderLatex(constant);

            newSlider = MathUtilities.Tools.Graphing.templates['slider-panel']({
                "newSlider": true,
                "constantNameForDisplay": constantForDisplay,
                "constantName": constant,
                "equationCid": equationCid,
                "cid": uniqueId
            }).trim();
            newOptionRow = MathUtilities.Tools.Graphing.templates['slider-panel']({
                "newRow": true,
                "constantName": constant,
                "rangeCellText": this._accManager.getMessage('x-limit-label', 0)
            }).trim();
            $newSlider = $(newSlider);
            $constantOption = this.$('.constant-slider-options-row[data-constant-name="' + this.replaceConstantForTheta(constant.slice()) + '"]');
            $sliderHolderDiv.append($newSlider);
            $newSlider.find('.constant-name-text').html(constantForDisplay + ' =');
            sliderName = this.replaceConstantForTheta(constant.slice());
            if ($constantOption.length !== 0) {
                $constantOption.remove();
            }
            $newOptionRow = $(newOptionRow);
            $settings.append($newOptionRow);
            $deleteIcon = $newSlider.find('.delete-constant');
            $deleteIcon.on('mouseenter mousedown', function(event) {
                $deleteIcon.addClass('hovered');
            }).on('mouseleave mouseup', _.bind(function(event) {
                if (this._equationPanel._graphingToolView.removeHover(event) === true) {
                    $deleteIcon.removeClass('hovered');
                }
            }, this));
            this.TouchSimulator.enableTouch($deleteIcon);
            $newOptionRow.find('.constant-name-cell-text').html(constantForDisplay);
            return $newSlider;
        },

        "_resetSliderOptions": function(sliderCid, sliderOptions) {
            var sliderView = this.getSliderViewUsingCid(sliderCid);
            sliderView.set(sliderOptions.val);
            sliderView.setLimits([sliderOptions.min, sliderOptions.max, sliderOptions.step, sliderOptions.val]);
            return sliderView;
        },

        /**
         * addSlider adds given sliders container
         * @method addSlider
         * @param {Object} options Object containing slider properties
         */
        "addSlider": function(options) {
            var sliderName = options.sliderName,
                sliderOptions = options.sliderOptions,
                sliderBox,
                sliderView,
                currValue,
                sliderMin,
                sliderMax,
                step,
                equationData = options.equationData,
                $sliderSettings,
                existingSlider,
                isDependent = options.dependent,
                affectedEquationData,
                _equationDataManager = this._equationDataManager;
            if (sliderOptions && !sliderOptions.addClass) {
                sliderOptions.addClass = 'graphing-tool-sprite-holder';
            }
            if (!equationData) {
                equationData = this._equationPanel._createEquationData();
            }
            this._hideDeleteOption();
            existingSlider = this.$('.constant-slider-container[data-equation-cid=' + equationData.getCid() + ']');
            if (existingSlider.length !== 0) {
                sliderView = this._resetSliderOptions(existingSlider.attr('data-slider-view'), sliderOptions);
                sliderBox = this.$('.constant-slider-container[data-slider-view=' + sliderView.cid + ']');
            } else {
                sliderBox = this.addSliderToPanel(sliderName, equationData.getCid(), options.uniqueId);
                sliderView = this._createSlider({
                    "sliderEl": sliderBox.find('.slider-holder'),
                    "sliderName": sliderName,
                    "sliderOptions": sliderOptions,
                    "id": options.uniqueId
                });
            }
            currValue = sliderView.get('currValue');
            this._accManager.setAccMessage(sliderView.$el.find('.sliderH').attr('id'),
                this._accManager.getAccMessage('graphing-tool-editor-graph-style-thickness-handle', 0, [currValue]));
            equationData.setLatex(sliderName + '=' + currValue, true);
            equationData.setPrevLatex(equationData.getLatex(), true);
            equationData.setSpecie('slider');
            sliderBox.attr('data-slider-view', sliderView.cid).find('.constant-textarea').val(currValue);
            sliderView.$el.attr('data-constant', sliderName);
            affectedEquationData = _equationDataManager.changeInMathquill(equationData);
            this._equationPanel._processParsedEquationDataArray(affectedEquationData.equations, equationData);
            this._equationPanel._processTableCellsWithDefinitions(affectedEquationData.definitions);
            sliderView.sliderName = sliderName;
            $sliderSettings = this.$('.constant-slider-options-row[data-constant-name="' + this.replaceConstantForTheta(sliderName.slice()) + '"]');
            sliderMin = sliderView.get('min');
            sliderMax = sliderView.get('max');
            step = sliderView.get('step');
            $sliderSettings.find('.lower-limit-textbox').val(sliderMin);
            $sliderSettings.find('.upper-limit-textbox').val(sliderMax);
            $sliderSettings.find('.step-textbox').val(step);
            this.addSliderInCollection(sliderView);
            if (isDependent) {
                sliderView.isDependent = true;
            }
            this._enableDisableSliderDeleteBtn();
            new MathUtilities.Components.LimitTextBox.Views.limitTextBox({
                "el": sliderBox.find('.constant-textarea'),
                "option": {
                    "allowedKeys": [],
                    "allowMinus": true,
                    "inputLastVal": currValue
                }
            });
            new MathUtilities.Components.LimitTextBox.Views.limitTextBox({
                "el": $sliderSettings.find('.step-textbox'),
                "option": {
                    "allowedKeys": [],
                    "allowMinus": true,
                    "inputLastVal": step
                }
            });
            new MathUtilities.Components.LimitTextBox.Views.limitTextBox({
                "el": $sliderSettings.find('.lower-limit-textbox'),
                "option": {
                    "allowedKeys": [],
                    "allowMinus": true,
                    "inputLastVal": sliderMin
                }
            });
            new MathUtilities.Components.LimitTextBox.Views.limitTextBox({
                "el": $sliderSettings.find('.upper-limit-textbox'),
                "option": {
                    "allowedKeys": [],
                    "allowMinus": true,
                    "inputLastVal": sliderMax
                }
            });
            return sliderView;
        },

        /**
         * _createSlider creates slider view
         * @method _createSlider
         * @param {Object} options
         * @constructor
         */
        "_createSlider": function(options) {
            var EquationPanel = MathUtilities.Tools.Graphing.Models.EquationPanel,
                BASEPATH = EquationPanel.BASEPATH,
                sliderOptions = options.sliderOptions,
                sliderEl = options.sliderEl,
                sliderView, elementProperties = {},
                $element,
                self = this;
            if (sliderOptions === void 0) {
                sliderOptions = {
                    "min": EquationPanel.SLIDER_MIN_VALUE,
                    "max": EquationPanel.SLIDER_MAX_VALUE,
                    "val": EquationPanel.SLIDER_INITIAL_VALUE,
                    "step": EquationPanel.SLIDER_STEP_VALUE,
                    "currValueHide": true,
                    "addClass": 'graphing-tool-sprite-holder'
                };
            }
            if (this._equationPanel.addSliderBackground) {
                sliderOptions.sliderBackground = {
                    "isSliderContainerImageSlice": true,
                    "sliderContainerLeftImage": BASEPATH + 'img/tools/common/tools/graphing-plotting/left-slider-base.png',
                    "sliderContainerRightImage": BASEPATH + 'img/tools/common/tools/graphing-plotting/right-slider-base.png',
                    "sliderContainerMiddleImage": BASEPATH + 'img/tools/common/tools/graphing-plotting/middle-slider-base.png',
                    "sliderHeaderImage": BASEPATH + 'img/tools/common/tools/graphing-plotting/slider-handle-up-icon.png',
                    "sliderHeaderImageOnMouseOver": BASEPATH + 'img/tools/common/tools/graphing-plotting/slider-handle-hover-icon.png'
                };
            }
            sliderOptions.orientation = 'horizontal';
            sliderOptions.stepFunctionality = false;
            sliderOptions.ellipsesLimit = 4;
            sliderView = new MathUtilities.Components.Slider.Views.slider({
                "option": sliderOptions,
                "el": sliderEl
            });
            sliderView.$el.find('.sliderH').attr('id', 'slider-' + options.id);
            sliderEl.off('slider-slide').on('slider-slide', _.bind(this._sliderDrag, this))
                .off('start').on('start', _.bind(this._sliderDragStart, this, sliderView))
                .off('stop').on('stop', _.bind(this._sliderDragStop, this, sliderView))
                .off('limitChangeStart').on('limitChangeStart', _.bind(this._sliderLimitStart, this, sliderView))
                .off('limitChangeStop').on('limitChangeStop', _.bind(this._sliderLimitStop, this, sliderView));
            if ('ontouchstart' in window) {
                sliderEl.find('.limit-value').off('touchstart.slider').on('touchstart.slider', function() {
                    $element = $(this);
                    clearTimeout(self._timerId);
                    self._timerId = setTimeout(function() {
                        if ($element.hasClass('ellipses-text')) {
                            elementProperties.element = $element;
                            elementProperties.latex = $element.attr('actual-value');
                            self._equationPanel._showTooltip(elementProperties);
                        }
                    }, 400);
                });
                sliderEl.find('.limit-value').off('touchend.slider').on('touchend.slider', function() {
                    clearTimeout(self._timerId);
                    self._equationPanel._hideTooltip();
                });
            } else {
                sliderEl.find('.limit-value').off('mouseenter.slider').on('mouseenter.slider', function() {
                    var $currentElement = $(this);
                    if ($currentElement.hasClass('ellipses-text')) {
                        elementProperties.element = $currentElement;
                        elementProperties.latex = $currentElement.attr('actual-value');
                        self._equationPanel._showTooltip(elementProperties);
                    }
                }).off('mouseleave.slider').on('mouseleave.slider', function() {
                    self._equationPanel._hideTooltip();
                });
            }
            return sliderView;
        },

        /**
         * Sets undoData on slider drag start
         * @method _sliderDragStart
         * @param sliderView {Object} slider backbone view object
         * @param event {Object}
         * @return void
         */
        "_sliderDragStart": function(sliderView, event) {
            var undoData = {};
            undoData.sliderView = sliderView;
            undoData.dataConstant = sliderView.sliderName;
            undoData.currValue = sliderView.get('currValue');
            this.model.set('slidingStartData', undoData);
        },

        /**
         * Sets redoData on slider drag stop
         * @method _sliderDragStop
         * @param sliderView {Object} slider backbone view object
         * @param event {Object}
         * @return void
         */
        "_sliderDragStop": function(sliderView, event) {
            var undoData = {},
                redoData = {};
            undoData = this.model.get('slidingStartData');
            redoData.sliderView = sliderView;
            redoData.dataConstant = sliderView.sliderName;
            redoData.currValue = sliderView.get('currValue');
            if (undoData.currValue !== redoData.currValue) {
                this.execute('sliderDrag', {
                    "undo": undoData,
                    "redo": redoData
                });
            }
        },

        /**
         * Sets undoData on slider slider limit change start
         * @method _sliderLimitStart
         * @param sliderView {Object} slider backbone view object
         * @param event {Object}
         * @return void
         */
        "_sliderLimitStart": function(sliderView, event) {
            var undoData = {},
                limitRange = [];
            undoData.dataConstant = sliderView.sliderName;
            undoData.sliderView = sliderView;
            limitRange[0] = sliderView.get('min');
            limitRange[1] = sliderView.get('max');
            limitRange[2] = sliderView.get('step');
            undoData.data = limitRange;
            this.model.set('sliderLimitData', undoData);
        },

        /**
         * Sets redoData on slider slider limit change stop
         * @method _sliderLimitStop
         * @param sliderView {Object} slider backbone view object
         * @param event {Object}
         * @return void
         */
        "_sliderLimitStop": function(sliderView, event) {
            var undoData = {},
                redoData = {},
                limitRange = [];
            undoData = this.model.get('sliderLimitData');
            redoData.dataConstant = sliderView.sliderName;
            redoData.sliderView = sliderView;
            limitRange[0] = sliderView.get('min');
            limitRange[1] = sliderView.get('max');
            limitRange[2] = sliderView.get('step');
            redoData.data = limitRange;
            this.execute('sliderLimitChanged', {
                "undo": undoData,
                "redo": redoData
            });
        },

        "_sliderDrag": function(event, isSlide) {
            var _equationPanel = this._equationPanel,
                $targetSlider = $(event.target).parents('.constant-slider-container'),
                equationCid = $targetSlider.attr('data-equation-cid'),
                sliderCid = $targetSlider.attr('data-slider-view'),
                sliderView = this.getSliderViewUsingCid(sliderCid),
                currValue,
                latex,
                sliderName;
            currValue = sliderView.get('currValue');
            $targetSlider.find('.constant-textarea').val(currValue);
            sliderName = sliderView.sliderName;
            this._accManager.setAccMessage($targetSlider.find('.constant-textarea').parent().attr('id'),
                this._accManager.getAccMessage('slider-panel-messages', 1, [sliderName, currValue]));
            this._accManager.setAccMessage($targetSlider.find('.sliderH').attr('id'),
                this._accManager.getAccMessage('slider-panel-messages', 6, [sliderName, currValue]));
            if (isSlide) {
                this._accManager.setFocus('dummy-focus-container');
                this._accManager.setFocus($targetSlider.find('.sliderH').attr('id'));
            }
            latex = sliderName + '=' + currValue;
            _equationPanel._callUpdateLatex(equationCid, latex);
        },

        "callRemoveSlider": function(event) {
            var $targetSlider = $(event.target).parents('.constant-slider-container'),
                sliderCid = $targetSlider.attr('data-slider-view'),
                undoRedoData = {},
                sliderView, index, $deleteIcons,
                equationCid = $targetSlider.attr('data-equation-cid');
            undoRedoData.undo = this.getSliderData(sliderCid);
            undoRedoData.undo.actionType = 'addSlider';
            undoRedoData.redo = this.getSliderData(sliderCid);
            undoRedoData.redo.actionType = 'removeSlider';
            sliderView = this.getSliderViewUsingCid(sliderCid);
            if (!sliderView.isDependent) {
                this.execute('deleteSlider', undoRedoData);
            }
            $deleteIcons = this.$('.delete-constant');
            index = $deleteIcons.index($(event.currentTarget));
            if (index < $deleteIcons.length - 1) {
                this._accManager.setFocus($($deleteIcons[index + 1]).attr('id'));
            } else {
                if (index === 0) {
                    this._accManager.setFocus('slider-title-holder');
                } else {
                    this._accManager.setFocus($($deleteIcons[index - 1]).attr('id'));
                }
            }
            this.removeSlider({
                "sliderCid": sliderCid,
                "equationCid": equationCid,
                "$targetSlider": $targetSlider,
                "fromSliderPanel": true,
                "undoRedoData": undoRedoData
            });
        },
        "_callUpdateSliderData": function(event) {
            var $targetText = $(event.target),
                targetVal = $targetText.val().trim();
            if (targetVal === '' || !isFinite(targetVal)) {
                return;
            }
            this._updateSliderData($targetText);
        },

        "_updateTextArea": function(event) {
            var $target = $(event.target),
                dataValue = $target.attr('data-value'),
                targetVal = $target.val();
            if (Number(dataValue) === 0) { //in javaScript -0 is displayed as -0 but its value is zero.
                dataValue = 0;
            }
            if (targetVal === '') {
                $target.val(dataValue);
            }
        },

        "_updateSliderData": function($targetText) {
            var $targetSlider = $targetText.parents('.constant-slider-container'),
                sliderCid = $targetSlider.attr('data-slider-view'),
                equationCid = $targetSlider.attr('data-equation-cid'),
                latex,
                undoRedoData = {},
                targetVal = $targetText.val(),
                currentVal,
                sliderName,
                limits,
                sliderView = this.getSliderViewUsingCid(sliderCid);
            if (targetVal === '' || targetVal === '-') {
                targetVal = $targetText.attr('data-value');
            }
            undoRedoData.undo = {};
            undoRedoData.redo = {};
            currentVal = sliderView.get('currValue');
            targetVal = Number(targetVal);
            if (Number(currentVal) === targetVal) {
                return void 0;
            }
            limits = this._getLimitDataFromSlider(sliderView);
            if (targetVal < limits[0]) {
                limits[0] = targetVal;
            } else {
                if (targetVal > limits[1]) {
                    limits[1] = targetVal;
                }
            }
            sliderName = sliderView.sliderName;
            undoRedoData.undo = {
                "target": sliderName,
                "val": currentVal,
                "limits": limits
            };
            undoRedoData.redo = {
                "target": sliderName,
                "val": targetVal,
                "limits": limits
            };
            latex = sliderView.sliderName + '=' + targetVal;
            this._updateLimitBox(sliderView.sliderName, limits);
            sliderView.setLimits(limits);
            sliderView.set(targetVal);
            this._equationPanel._callUpdateLatex(equationCid, latex);
            this.execute('sliderDataChange', undoRedoData);
            this._accManager.setAccMessage($targetSlider.find('.sliderH').attr('id'),
                this._accManager.getAccMessage('slider-panel-messages', 6, [sliderName, targetVal]));
        },

        "_updateLimitBox": function(sliderName, limits) {
            var $sliderOption = this.$('.constant-slider-options-row[data-constant-name="' + this.replaceConstantForTheta(sliderName) + '"]');
            $sliderOption.find('.lower-limit-textbox').val(limits[0]);
            $sliderOption.find('.upper-limit-textbox').val(limits[1]);
            $sliderOption.find('.step-textbox').val(limits[2]);
        },

        /**
         * _enableDisableSliderDeleteBtn enable or disable delete button based on sliders present
         * @method _enableDisableSliderDeleteBtn
         * @constructor
         */
        "_enableDisableSliderDeleteBtn": function() {
            var lengthOfSliders;
            if (this._allSlidersVisible) {
                lengthOfSliders = this.$('.constant-slider-container').length;
            } else {
                lengthOfSliders = this.$('#current-list-constants .constant-slider-container').length;
            }
            if (lengthOfSliders > 0) {
                this._enableDeleteBtn();
            } else {
                this._disableDeleteBtn();
            }
        },
        "_enableDeleteBtn": function() {
            this.$('#slider-delete-icon-holder').removeClass('disabled').off('click')
                .on('click', _.bind(this._showHideDeleteOption, this));
            this.$('#slider-delete-icon').removeClass('disabled');
            this._accManager.enableTab('slider-delete-icon-holder', true);
        },
        "_disableDeleteBtn": function() {
            this._hideDeleteOption();
            this.$('#slider-delete-icon-holder').addClass('disabled')
                .off('click');
            this.$('#slider-delete-icon').addClass('disabled');
            this._accManager.enableTab('slider-delete-icon-holder', false);
        },

        /**
         * removeSlider removes given sliders container
         * @method removeSlider
         * @constructor
         */
        "removeSlider": function(options) {
            var sliderCid = options.sliderCid,
                equationCid = options.equationCid,
                sliderName = options.sliderName,
                doNotDeleteList = options.doNotDeleteList,
                fromSliderPanel = options.fromSliderPanel,
                undoRedoData = options.undoRedoData,
                isFirst, $sliderOption,
                sliderView,
                $targetSlider = options.$targetSlider;
            if (sliderCid === void 0) {
                sliderCid = this._sliderNameIdMap[sliderName];
            }
            if ($targetSlider === void 0) {
                $targetSlider = this.$('.constant-slider-container[data-slider-view=' + sliderCid + ']');
            }
            if (equationCid === void 0) {
                equationCid = $targetSlider.attr('data-equation-cid');
            }
            if (sliderName === void 0) {
                sliderView = this.getSliderViewUsingCid(sliderCid);
                sliderName = sliderView.sliderName;
            }
            if (doNotDeleteList !== true) {
                isFirst = this._equationPanel._deleteList(equationCid, {
                    "fromSliderPanel": fromSliderPanel,
                    "undoRedoData": undoRedoData
                });
                if (isFirst !== true) {
                    this._equationPanel._removeEquationData(equationCid, true);
                }
            }
            this.removeSliderFromCollection(sliderCid);
            $targetSlider.remove();
            $sliderOption = this.$('.constant-slider-options-row[data-constant-name="' + this.replaceConstantForTheta(sliderName) + '"]');
            $sliderOption.remove();
            this._enableDisableSliderDeleteBtn();
        },
        /**
         * focusSliders focuses given sliders container
         * @method focusSliders
         * @constructor
         */
        "focusSliders": function(currentConstants, listNumber) {
            var length = currentConstants.length,
                $currentSlider,
                counter;
            this._focussedList = listNumber;
            this._focussedSliderNames = currentConstants;
            this.$('#other-constants').append(this.$('.constant-slider-container'));
            this.showCurrentSliders();
            if (length > 0) {
                for (counter = 0; counter < length; counter++) {
                    currentConstants[counter] = currentConstants[counter].replace('-', '');
                    $currentSlider = this.getSliderFromCollectionUsingName(currentConstants[counter]);
                    if ($currentSlider === void 0) {
                        continue;
                    }
                    this.$('#current-list-constants').append($currentSlider.$el.parent('.constant-slider-container'));
                }
                this._enableDisableSliderDeleteBtn();
            }
            this.$('#current-list-number-holder-text').html(listNumber);
        },

        /**
         * _showHideDeleteOption shows or hides delete option for each slider in panel
         * @method _showHideDeleteOption
         * @constructor
         */
        "_showHideDeleteOption": function(event) {
            var $target = $(event.currentTarget),
                $textBoxes = this.$('.constant-textarea-holder'),
                index,
                enableTab;
            $target.toggleClass('activated');
            if ($target.hasClass('activated')) {
                this.$('.slider-holder').hide();
                this.$('.delete-constant').show();
                enableTab = false;
                this._accManager.setFocus($(this.$('.delete-constant')[0]).attr('id'));
            } else {
                this._hideDeleteOption();
                enableTab = true;
            }
            for (index = 0; index < $textBoxes.length; index++) {
                this._accManager.enableTab($($textBoxes[index]).attr('id'), enableTab);
            }
        },

        "_hideDeleteOption": function() {
            this.$('.slider-holder').show();
            this.$('.delete-constant').hide();
            this.$('#slider-delete-icon-holder').removeClass('activated');
        },

        /**
         * _showHideSettingsOption shows or hides settings option for panel
         * @method _showHideSettingsOption
         * @constructor
         */
        "_showHideSettingsOption": function(event) {
            var $settingsBtn = $(event.currentTarget),
                $showAllChkbox = this.$('#slider-all-constant-chkbox'),
                firstElementId = $(this.$('.constant-slider-options-row .constant-name-cell-text')[0]).attr('id');
            $settingsBtn.toggleClass('activated');
            if ($settingsBtn.hasClass('activated') === true) {
                if ($showAllChkbox.hasClass('activated') === true) {
                    this._showAllSliderOptions();
                } else {
                    this._showCurrentSliderOptions();
                }
                this.showSliderSettings();
                this._accManager.setFocus(firstElementId);

                if (firstElementId) {
                    this._accManager.setFocus(firstElementId);
                } else {
                    this._accManager.setFocus('slider-constants-checkbox');
                }
            } else {
                this.hideSliderSettings();
            }
        },
        "showSliderSettings": function() {
            var $settingsBtn = this.$('#slider-settings-icon-holder'),
                top,
                left,
                settingsBtnOffset = $settingsBtn.offset(),
                TOP_PADDING = 2,
                LEFT_PADDING = 2,
                $settings = this.$('#slider-settings-window');
            $settings.show();
            top = settingsBtnOffset.top - $settings.height() - TOP_PADDING;
            left = settingsBtnOffset.left - $settings.width() + $settingsBtn.width() - LEFT_PADDING;
            $settings.offset({
                "top": top,
                "left": left
            });
            this._hideDeleteOption();
        },
        "hideSliderSettings": function() {
            if (this._isDataChanged) {
                this._updateSliderLimits();
            }
            this.$('#slider-settings-icon-holder').removeClass('activated');
            this.$('#slider-settings-window').hide();
        },

        "_showCurrentSliderOptions": function() {
            var counter,
                currentConstant,
                noOfConstants = this._focussedSliderNames.length;
            this.$('.constant-slider-options-row').hide();
            for (counter = 0; counter < noOfConstants; counter++) {
                currentConstant = this._focussedSliderNames[counter];
                currentConstant = this.replaceConstantForTheta(currentConstant);
                this.$('.constant-slider-options-row[data-constant-name="' + currentConstant + '"]').show();
            }
        },
        "replaceConstantForTheta": function(currentConstant) {
            if (currentConstant.indexOf("\\theta") !== -1 || currentConstant.indexOf("\\pi") !== -1) {
                currentConstant = '\\' + currentConstant;
            }
            return currentConstant;
        },
        "_showAllSliderOptions": function() {
            this.$('.constant-slider-options-row').show();
        },
        "_getLimitData": function($container, sliderView) {
            var data = {
                    "limits": []
                },
                min,
                max,
                step,
                $min,
                $max,
                $step,
                sliderVal;
            $min = $container.find('.lower-limit-textbox');
            $max = $container.find('.upper-limit-textbox');
            $step = $container.find('.step-textbox');
            min = Number($min.val());
            max = Number($max.val());
            step = Number($step.val());
            if (min >= max) {
                sliderVal = sliderView.get('min');
                $min.val(sliderVal);
                min = sliderVal;
            }
            if (max <= min) {
                sliderVal = sliderView.get('max');
                $max.val(sliderVal);
                max = sliderVal;
            }
            if (step > (max - min) / 2) {
                sliderVal = sliderView.get('step');
                $step.val(sliderVal);
                step = sliderVal;
            }
            if (step <= 0) {
                sliderVal = sliderView.get('step');
                $step.val(sliderVal);
                step = sliderVal;
            }
            data.limits.push(min, max, step);
            data.sliderName = $container.attr('data-constant-name');
            data.dataConstant = $container.attr('data-constant-name');
            return data;
        },
        "_getLimitDataFromSlider": function(sliderView) {
            var limitData = [];
            limitData.push(sliderView.get('min'), sliderView.get('max'), sliderView.get('step'));
            return limitData;
        },

        "_updateSliderLimits": function() {
            var undoRedoData = {},
                sliderCounter,
                currentSlider,
                sliderName,
                currentSliderData,
                currentSliderName,
                sliderViewCollection = this._sliderViewCollection;
            undoRedoData.undo = {};
            undoRedoData.redo = {};
            for (sliderCounter in sliderViewCollection) {
                currentSlider = sliderViewCollection[sliderCounter];
                currentSliderName = currentSlider.sliderName;
                sliderName = this.replaceConstantForTheta(currentSliderName.slice());
                undoRedoData.undo[currentSliderName] = this._getLimitDataFromSlider(currentSlider);
                currentSliderData = this._getLimitData(this.$('.constant-slider-options-row[data-constant-name="' + sliderName + '"]'), currentSlider);
                currentSlider.setLimits(currentSliderData.limits);
                undoRedoData.redo[currentSliderName] = currentSliderData.limits;
            }
            this.execute('sliderLimitsStepChange', undoRedoData);
            this._isDataChanged = false;
        },
        /**
         * _callShowHideOtherSliders calls _showHideOtherSliders
         * @method _callShowHideOtherSliders
         * @constructor
         */
        "_callShowHideOtherSliders": function() {
            this._showHideOtherSliders(false);
        },
        /**
         * _showHideOtherSliders shows or hides non-focused constant sliders
         * @method _showHideOtherSliders
         * @param isReset {Boolean} true when called by reset function
         * @constructor
         */
        "_showHideOtherSliders": function(isReset) {
            var $checkbox,
                left,
                top,
                TOP_TOLERANCE = 2,
                $settingsPanel = this.$('#slider-settings-window'),
                $settingsBtn = this.$('#slider-settings-icon-holder');
            $checkbox = $settingsPanel.find('#slider-all-constant-chkbox');
            if (isReset) {
                $checkbox.addClass('activated');
            } else {
                $checkbox.toggleClass('activated');
            }
            left = $settingsPanel.offset().left;
            if ($checkbox.hasClass('activated')) {
                this.showOtherSliders();
                this._allSlidersVisible = true;
                this._hideOtherSliders = false;
                this._accManager.setFocus('dummy-focus-container');
                this._accManager.changeAccMessage('slider-constants-checkbox', 0, [this._accManager.getAccMessage('checked-text', 0)]);
                this._accManager.setFocus('slider-constants-checkbox');
            } else {
                this.hideOtherSliders();
                this._allSlidersVisible = false;
                this._hideOtherSliders = true;
                this._accManager.setFocus('dummy-focus-container');
                this._accManager.changeAccMessage('slider-constants-checkbox', 0, [this._accManager.getAccMessage('unchecked-text', 0)]);
                this._accManager.setFocus('slider-constants-checkbox');
            }
            top = $settingsBtn.offset().top - $settingsPanel.height() - TOP_TOLERANCE;
            $settingsPanel.offset({
                "top": top,
                "left": left
            });
            this._equationPanel._graphingToolView.setDocumentDirty();
            this._enableDisableSliderDeleteBtn();
        },
        "showOtherSliders": function() {
            this.$('#current-list-constants-holder').removeClass('all-constants-unchecked');
            this.$('#other-constants-holder').addClass('activated');
            this._showAllSliderOptions();
        },
        "hideOtherSliders": function() {
            this.$('#slider-all-constant-chkbox').removeClass('activated');
            this.$('#current-list-constants-holder').addClass('all-constants-unchecked');
            this.$('#other-constants-holder').removeClass('activated');
            this._showCurrentSliderOptions();
        },
        /**
         * updatePanelPosition updates slider panels position based on keyboard
         * @method updatePanelPosition
         * @param {Jquery Object} $keyboard Jquery keyboard object
         * @param {Boolean} isKeyboardOpen Boolean to state whether keyboard is open or not
         */
        "updatePanelPosition": function($keyboard, isKeyboardOpen) {
            var newBottom = -1;
            if (isKeyboardOpen) {
                newBottom = $keyboard.height();
            }
            this.$('#keyboard-slider-title-container').css({
                "bottom": newBottom
            });
        },

        "execute": function(actionName, undoRedoData, skipRegistration) {
            if (!skipRegistration) {
                this._equationPanel.execute(actionName, undoRedoData, skipRegistration);
                return void 0;
            }
            var sliderView,
                noOfSliders,
                currentSliderData,
                sliderCounter,
                sliderData,
                $limitStepContainer,
                sliderIndex;
            this.hideSliderSettings();
            switch (actionName) {
                case 'sliderAppendAll':
                    noOfSliders = undoRedoData.length;
                    for (sliderIndex = 0; sliderIndex < noOfSliders; sliderIndex++) {
                        currentSliderData = undoRedoData[sliderIndex];
                        if (currentSliderData.actionType === 'deleteSlider') {
                            this.removeSlider({
                                "sliderName": currentSliderData.sliderName
                            });
                        } else {
                            this._equationDataManager.addEquation(currentSliderData.equationData);
                            this.addSlider(currentSliderData);
                        }
                    }
                    break;
                case 'deleteSlider':
                    if (undoRedoData.actionType === 'removeSlider') {
                        this.removeSlider({
                            "sliderName": undoRedoData.sliderName
                        });
                    } else {
                        this._equationDataManager.addEquation(undoRedoData.equationData);
                        this.addSlider(undoRedoData);
                    }
                    break;
                case 'sliderDrag':
                    sliderView = this.getSliderFromCollectionUsingName(undoRedoData.dataConstant);
                    sliderView.set(undoRedoData.currValue);
                    break;

                case 'sliderLimitChanged':
                    sliderView = this.getSliderFromCollectionUsingName(undoRedoData.dataConstant);
                    $limitStepContainer = this.$('.constant-slider-options-row[data-constant-name="' + undoRedoData.dataConstant + '"]');
                    if (undoRedoData.limits === void 0) {
                        undoRedoData.limits = undoRedoData.data;
                    }
                    sliderView.setLimits(undoRedoData.limits);
                    $limitStepContainer.find('.lower-limit-textbox').val(undoRedoData.limits[0]);
                    $limitStepContainer.find('.upper-limit-textbox').val(undoRedoData.limits[1]);
                    $limitStepContainer.find('.step-textbox').val(undoRedoData.limits[2]);
                    break;

                case 'sliderDataChange':
                    sliderView = this.getSliderFromCollectionUsingName(undoRedoData.target);
                    sliderView.setLimits(undoRedoData.limits);
                    this._updateLimitBox(undoRedoData.target, undoRedoData.limits);
                    sliderView.set(undoRedoData.val);
                    break;

                case 'sliderLimitsStepChange':
                    for (sliderCounter in undoRedoData) {
                        sliderView = this.getSliderFromCollectionUsingName(sliderCounter);
                        sliderView.setLimits(undoRedoData[sliderCounter]);
                    }
                    break;
                case 'deleteAll':
                    if (undoRedoData !== void 0) {
                        sliderData = undoRedoData.sliderData;
                        if (undoRedoData.actionName === 'addAllSlider') {
                            for (sliderIndex in sliderData) {
                                currentSliderData = sliderData[sliderIndex];
                                this._equationDataManager.addEquation(currentSliderData.equationData);
                                this.addSlider(currentSliderData);
                            }
                        } else {
                            for (sliderIndex in sliderData) {
                                currentSliderData = sliderData[sliderIndex];
                                this.removeSlider({
                                    "sliderName": currentSliderData.sliderName
                                });
                            }
                        }
                    }
                    break;
            }
            if (this._focussedSliderNames.length !== 0) {
                this.focusSliders(this._focussedSliderNames, this._focussedList);
            }
            this._equationPanel._graphingToolView._setActiveElementFocus();
        }
    });
})(window.MathUtilities);
