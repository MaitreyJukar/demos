/*globals _, $, window, geomFunctions */
(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Views.DgtPopup = Backbone.View.extend({

        "initialize": function() {
            this.model = this.options.model;
            this.generateFunctionReference();
            this.render();

            this.onChangeOfPopupValues = _.bind(function() {
                var model = this.model,
                    engine = model.engine,
                    params;
                params = this.fetchParamsFromPopup(model.directive);
                if (params) {
                    engine._undergoingOperation.updateOperationParams(params);
                }
            }, this);
        },

        "generateFunctionReference": function() {
            this.bootstrapPopupOkClickedFunc = _.bind(this.bootstrapPopupOkClicked, this);
            this.bootstrapPopupCancelClickedFunc = _.bind(this.bootstrapPopupCancelClicked, this);
            this._onBootstrapPopupClosedFunc = _.bind(this._onBootstrapPopupClosed, this);
            this._checkNumericInputFunc = _.bind(this._checkNumericInput, this);
            this._checkNumericInputOnKeyUpFunc = _.bind(this._checkNumericInputOnKeyUp, this);
            this._checkNumericInputPasteFunc = _.bind(this._checkNumericInputPaste, this);
            this._propertiesLabelInputKeyDownEventFunc = _.bind(this._propertiesLabelInputKeyDownEvent, this);
            this.setExampleStringFunc = _.bind(this.setExampleString, this);
            this.enableDisableRadioFunc = _.bind(this.enableDisableRadio, this);
            this.changeSelectedRadioButtonFunc = _.bind(this.changeSelectedRadioButton, this);
            this._parameterValueInputKeyDownEventFunc = _.bind(this._parameterValueInputKeyDownEvent, this);
            this.eventsForMarkerPopupFunc = _.bind(this.eventsForMarkerPopup, this);
            this.hideDropDownListFunc = _.bind(this.hideDropDownList, this);
            this._eventListenerForIterateMenuItemFunc = _.bind(this._eventListenerForIterateMenuItem, this);
            this.hideErrorMessageFunc = _.bind(this.hideErrorMessage, this);
        },

        "render": function() {

            var $popup = null,
                vectorChanged, reflectChangeForFixedDistance,
                model = this.model,
                paramPopupData = model.paramPopupData,
                bootstrapAlert = MathUtilities.Tools.Dgt.templates.ParamsPopup({
                    "id": model.transformationPopupId,
                    "close": "×",
                    "title": paramPopupData.translate.title,
                    "cancel": paramPopupData.translate.cancel
                }),
                propertiesPopup = MathUtilities.Tools.Dgt.templates.PropertiesPopup({
                    "id": model.propertiesPopupId,
                    "close": "×",
                    "title": paramPopupData.properties.title,
                    "cancel": paramPopupData.properties.cancel
                }),
                parameterPopup = MathUtilities.Tools.Dgt.templates.ParameterPopup({
                    "id": model.parameterPopupId,
                    "close": "×",
                    "title": paramPopupData.parameter.title,
                    "cancel": paramPopupData.parameter.cancel
                }),
                calculatorPopup = MathUtilities.Tools.Dgt.templates.CalculatorPopup({
                    "id": model.calculatorPopupId,
                    "title": paramPopupData.calculator.title,
                    "cancel": paramPopupData.calculator.cancel
                }),
                iteratePopup = MathUtilities.Tools.Dgt.templates.IteratePopup({
                    "id": model.iteratePopupId,
                    "close": "×",
                    "title": paramPopupData.iterate.title,
                    "cancel": paramPopupData.iterate.cancel
                });
            this.$el.append(bootstrapAlert).append(propertiesPopup).append(parameterPopup).append(calculatorPopup).append(iteratePopup);
            $popup = model.$popup = this.$el;
            model.$propertiesPopup = $popup.find('#' + model.propertiesPopupId);
            model.$transformationPopup = $popup.find('#' + model.transformationPopupId);
            model.$parameterPopup = $popup.find('#' + model.parameterPopupId);
            model.$calculatorPopup = $popup.find('#' + model.calculatorPopupId);
            model.$iteratePopup = $popup.find('#' + model.iteratePopupId);
            this._attachEvents(model.$propertiesPopup);
            this._attachEvents(model.$transformationPopup);
            this._attachEvents(model.$parameterPopup);
            this._attachEvents(model.$calculatorPopup);
            this._attachEvents(model.$iteratePopup);

            vectorChanged = _.bind(function(event) {

                var $target = $(event.target),
                    showVectorValue, hideVectorValue,
                    directive = this.model.directive;
                $popup = this.getPopupContainer(directive);

                if ($target.attr('id') === 'polar-fixed-distance') {
                    showVectorValue = 'cartesian-horizontal-fixed-distance';
                    hideVectorValue = 'cartesian-horizontal-value';
                    $popup.find('input[name=' + hideVectorValue + ']:radio:checked').prop('checked', false);
                    $popup.find('#' + showVectorValue).prop('checked', true);
                } else if ($target.attr('id') === 'cartesian-horizontal-fixed-distance') {
                    showVectorValue = 'polar-fixed-distance';
                    hideVectorValue = 'polar-by-value';
                    $popup.find('input[name=' + hideVectorValue + ']:radio:checked').prop('checked', false);
                    $popup.find('#' + showVectorValue).prop('checked', true);
                } else if ($target.attr('id') === 'polar-marked-distance') {
                    showVectorValue = 'cartesian-horizontal-marked-distance';
                    hideVectorValue = 'cartesian-horizontal-value';
                    $popup.find('input[name=' + hideVectorValue + ']:radio:checked').prop('checked', false);
                    $popup.find('#' + showVectorValue).prop('checked', true);
                } else if ($target.attr('id') === 'cartesian-horizontal-marked-distance') {
                    showVectorValue = 'polar-marked-distance';
                    hideVectorValue = 'polar-by-value';
                    $popup.find('input[name=' + hideVectorValue + ']:radio:checked').prop('checked', false);
                    $popup.find('#' + showVectorValue).prop('checked', true);
                }

                if (typeof hideVectorValue !== 'undefined' && typeof showVectorValue !== 'undefined') {
                    this._showInput(hideVectorValue, showVectorValue);
                }

                showVectorValue = $target.attr('id');
                hideVectorValue = $target.attr('name');

                this._showInput(hideVectorValue, showVectorValue);

            }, this);

            reflectChangeForFixedDistance = _.bind(function(event) {
                var $target = $(event.target),
                    directive = this.model.directive,
                    value = $target.val();
                $popup = this.getPopupContainer(directive);
                if ($target.hasClass('translation-distance-polar') || $target.hasClass('translation-horizontal-distance-cartesian')) {
                    $popup.find('.translation-horizontal-distance-cartesian, .translation-distance-polar').val(value);
                }
            }, this);

            model.$transformationPopup.find('input[name=vector-unit]:radio,' +
                'input[name=polar-by-value]:radio, input[name=polar-at-value]:radio,' +
                'input[name=cartesian-horizontal-value]:radio, input[name=cartesian-vertical-value]:radio,' +
                'input[name=rotate-by-value]:radio, input[name=dilate-by-value]:radio').on('click', vectorChanged);

            model.$transformationPopup.find('.translation-distance-polar,' +
                '.translation-horizontal-distance-cartesian').on('blur', reflectChangeForFixedDistance);
        },

        "_attachEvents": function($bootstrapPopup) {
            $bootstrapPopup.find('.btn-primary').off('click', this.bootstrapPopupOkClickedFunc)
                .on('click', this.bootstrapPopupOkClickedFunc);
            $bootstrapPopup.find('.btn-cancel').off('click', this.bootstrapPopupCancelClickedFunc)
                .on('click', this.bootstrapPopupCancelClickedFunc);
            $bootstrapPopup.off('hidden.bs.modal', this._onBootstrapPopupClosedFunc)
                .on('hidden.bs.modal', this._onBootstrapPopupClosedFunc);
        },

        "getPopupContainer": function() {
            var model = this.model;

            switch (model.directive) {
                case 'properties':
                    return model.$propertiesPopup;

                case 'parameter':
                    return model.$parameterPopup;

                case 'calculator':
                    return model.$calculatorPopup;

                case 'iterate':
                case 'iterateToDepth':
                    return model.$iteratePopup;

                default:
                    return model.$transformationPopup;
            }
        },

        "_onBootstrapPopupClosed": function() {

            var $properyBarHolder, $popup, iteratePopupManager, iterateParam, defaultCheckedList,
                engine = this.model.engine,
                directive = this.model.directive;
            if (directive === 'mathjax-load-error') {
                close();
            }
            engine.grid.setGridMode(this.model.prevMode);
            engine.dgtUI.enableDgtPropertiesBar();
            this.off('selection-state-changed', this.propertiesPopupOkClicked);
            $popup = this.getPopupContainer(directive);
            iteratePopupManager = this.model.iteratePopupManager;
            iterateParam = iteratePopupManager.params;
            this._changeDefaultPopUpValues();
            engine.grid.coverGrid();
            //stops setInterval of duplicate cursor  for calculator popup
            clearInterval(this.model.interval);
            engine.dgtUI.$('.parameter-covering-div').remove();
            if (directive === 'iterate' || directive === 'iterateToDepth') {
                engine.selectionSteal = null;
                iteratePopupManager.idOfMappingImages = [];
                iteratePopupManager.idOfPreImages = [];
                iteratePopupManager.preImageArray = [];
                engine.selectionSteal = null;
                engine.grid.enableInputMode(engine.grid.INPUT_MODE_DOUBLE_CLICK, true);
                defaultCheckedList = [
                    "#full-orbit-check",
                    "#all-object-images-check",
                    "#tabulate-iterated-values-check",
                    "#to-same-relative-location-check"
                ];
                $popup.find(defaultCheckedList.join()).prop('checked', true);
                iterateParam.finalIteration = false;
            }
            if (directive === 'translate') {
                this.model.lastSelectedVector = $popup.find('input[name=vector-unit]:radio:checked').attr('id');
            }
            if (['calculator', 'parameter', 'iterate', 'iterateToDepth'].indexOf(directive) > -1) {
                engine.editableMeasurementId = null;
                if (directive === 'calculator') {
                    this.$('#custom-modal-calculate-popup').hide();
                }
                engine.dgtCalculatorManager.clearCalculatorInputOutputData();
            }
            if (['translate', 'rotate', 'dilate', 'iterate', 'iterateToDepth'].indexOf(directive) > -1) {
                $popup.find('input[type=text]').off('input', this.onChangeOfPopupValues);
                $popup.find('input[type=radio]').off('change', this.onChangeOfPopupValues);
                if (engine._undergoingOperation && !this.model.isOkClicked) {
                    engine._undergoingOperation.revertCurrentOperation();
                }
            } else if (directive === 'properties') {
                $popup.find("#original-name").prop('disabled', false); //disabled for parameter properties popup.
            }
            this.model.curPopupShown = null;
            this.model.bootstrapPopupShown = false;
            engine.trigger('calculator-state-change');
            engine.trigger('properties-state-change');
            $popup.find('input:text').off('keypress', this._checkNumericInputFunc)
                .off('keyup', this._checkNumericInputOnKeyUpFunc)
                .off('paste', this._checkNumericInputPasteFunc);
            if (directive === 'small-image-crop') {
                $properyBarHolder = this.model.engine.dgtUI.$('.dgt-properties-bar');
                $properyBarHolder.find('.crop-options .image-btn-highlighter').removeClass('selected');
                $popup.modal('hide');
            }
            if (!this.model.isOkClicked) {
                engine.performPreviousOperation(0);
                engine.accManager.setFocus(MathUtilities.Tools.Dgt.Views.DgtAccessibility.MENU_DIV);
            } else {
                this.$el.focus();
            }
            engine.dgtUI.disableOrEnableDragingOfMeasurementDivs(false); //when popup closed measurement div should be draggable again

        },

        "_showInput": function(hideVectorValue, showVectorValue) {
            var $popup = this.getPopupContainer(this.model.directive);

            $popup.find('.' + hideVectorValue + '-input').hide();
            $popup.find('.' + hideVectorValue + '-input' + '.for-' + showVectorValue).show();
            this._updateFocusRect();
        },

        "_showInputForProperties": function(objectType) {
            var model = this.model,
                $propertiesPopup = model.$propertiesPopup,
                noOfTabs, tabs, loopCtr,
                descString, labelTabExists;


            $propertiesPopup.find('.nav-tabs').show();
            $propertiesPopup.find('.active').removeClass('active');
            $propertiesPopup.find('.tab-title').hide();
            if (objectType !== 'multiple') {
                $propertiesPopup.find('.for-multiple').hide();
                if (objectType !== 'parameter') {
                    $propertiesPopup.find('.value-properties-value-holder-for-parameter').hide();
                }
                tabs = model.objectTypeMapping[objectType].tabs;
                noOfTabs = tabs.length;
                for (loopCtr = 0; loopCtr < noOfTabs; loopCtr++) {
                    $propertiesPopup.find('#' + tabs[loopCtr]).show();
                    if (tabs[loopCtr] === 'label') {
                        labelTabExists = true;
                    }
                    if (tabs[loopCtr] === 'object') {
                        descString = model.engine.getDescriptionString();
                        $propertiesPopup.find('.selected-object-properties').html(descString);
                    }
                }

                if (labelTabExists) {
                    $propertiesPopup.find('#label, .for-label').addClass('active');
                } else {
                    $propertiesPopup.find('#marker, .for-marker').addClass('active');
                }

            } else {
                $propertiesPopup.find('.nav-tabs').hide();
                $propertiesPopup.find('.active').removeClass("active");
                $propertiesPopup.find('.for-multiple').show();
            }
            $propertiesPopup.find('#show-hide-label').prop('disabled', objectType === 'measurement' || objectType === 'parameter');
        },



        "_enableDisableRadioButton": function($curParamContainer) {

            var model = this.model,
                previousMarkings = model.engine.getActiveMarking(),
                angleMarkingLength = previousMarkings.angle.length,
                ratioMarkingLength = previousMarkings.ratio.length,
                vectorMarkingLength = previousMarkings.vector.length,
                distanceMarkingLength = previousMarkings.distance.length,
                $selectedVector;

            if (vectorMarkingLength !== 0) {
                $curParamContainer.find('.marked-vector').prop('disabled', false);
            } else {
                $curParamContainer.find('.marked-vector').prop({
                    "disabled": true,
                    "checked": false
                });
                $selectedVector = $curParamContainer.find('#cartesian');
                $selectedVector.prop('checked', true);
                this._showInput($selectedVector.attr('name'), $selectedVector.attr('id'));
            }

            if (angleMarkingLength !== 0) {
                $curParamContainer.find('.marked-angle').prop('disabled', false);
            } else {
                $curParamContainer.find('.marked-angle').prop({
                    "disabled": true,
                    "checked": false
                });
                $selectedVector = $curParamContainer.find('#rotate-fixed-angle');
                $selectedVector.prop('checked', true);
                this._showInput($selectedVector.attr('name'), $selectedVector.attr('id'));
                $selectedVector = $curParamContainer.find('#polar-fixed-angle');
                $selectedVector.prop('checked', true);
                this._showInput($selectedVector.attr('name'), $selectedVector.attr('id'));
            }

            if (ratioMarkingLength !== 0) {
                $curParamContainer.find('.marked-ratio').prop('disabled', false);
            } else {
                $curParamContainer.find('.marked-ratio').prop({
                    "disabled": true,
                    "checked": false
                });
                $selectedVector = $curParamContainer.find('#dilate-fixed-ratio');
                $selectedVector.prop('checked', true);
                this._showInput($selectedVector.attr('name'), $selectedVector.attr('id'));
            }

            if (distanceMarkingLength !== 0) {
                $curParamContainer.find('.marked-distance').prop('disabled', false);
            } else {
                $curParamContainer.find('.marked-distance').prop({
                    "disabled": true,
                    "checked": false
                });
                $selectedVector = $curParamContainer.find('#polar-fixed-distance');
                $selectedVector.prop('checked', true);
                this._showInput($selectedVector.attr('name'), $selectedVector.attr('id'));
                $selectedVector = $curParamContainer.find('#cartesian-horizontal-fixed-distance');
                $selectedVector.prop('checked', true);
                this._showInput($selectedVector.attr('name'), $selectedVector.attr('id'));
                $selectedVector = $curParamContainer.find('#cartesian-vertical-fixed-distance');
                $selectedVector.prop('checked', true);
                this._showInput($selectedVector.attr('name'), $selectedVector.attr('id'));
            }

        },



        "_showInputForTranslateRotateDilate": function(directive) {

            var model = this.model,
                $transformationPopup = model.$transformationPopup,
                latex,
                $curParamContainer = $transformationPopup.find('.' + directive + '-param-container'),
                latestMarking = model.engine.getLatestMarking(),
                latestMarkingType = null,
                lastSelectedVector = model.lastSelectedVector,
                previousMarkings = model.engine.getActiveMarking(),
                angleMarkingLength = previousMarkings.angle.length,
                previousDistanceMarking,
                ratioMarkingLength = previousMarkings.ratio.length,
                vectorMarkingLength = previousMarkings.vector.length,
                distanceMarkingLength = previousMarkings.distance.length,
                $markedDistance, markedDistanceNameAttributeLength,
                latestVectorMarking = null,
                latestAngleMarking = null,
                latestRatioMarking = null,
                latestDistanceMarking = null,
                $selectedVector, $markedAngle, markedAngleNameAttributeLength, $polar, $rectangular, loopCtr,
                MathInputView = MathUtilities.Tools.Dgt.Views.MathInputView;



            if (vectorMarkingLength !== 0) {
                latestVectorMarking = previousMarkings.vector[vectorMarkingLength - 1];
                latex = model.engine.generateLabel(latestVectorMarking, latestVectorMarking.creator.sources[0]);
                MathInputView.latexToMathjax(latex, $transformationPopup.find('.translation-from-marked-distance'));
                latex = model.engine.generateLabel(latestVectorMarking, latestVectorMarking.creator.sources[1]);
                MathInputView.latexToMathjax(latex, $transformationPopup.find('.translation-to-marked-distance'));
            }

            if (angleMarkingLength !== 0) {
                latestAngleMarking = previousMarkings.angle[angleMarkingLength - 1];
                latex = model.engine.generateLabel(latestAngleMarking, latestAngleMarking.creator.sources);
                MathInputView.latexToMathjax(latex, $transformationPopup.find('.rotation-marked-angle'));
                MathInputView.latexToMathjax(latex, $transformationPopup.find('.translation-marked-angle-polar'));
            }

            if (ratioMarkingLength !== 0) {

                latestRatioMarking = previousMarkings.ratio[ratioMarkingLength - 1];
                if (latestRatioMarking.division !== 'measurement') {
                    $transformationPopup.find('.for-non-measurement').show();
                    $transformationPopup.find('.for-measurement').hide();

                    latex = model.engine.generateLabel(latestRatioMarking, latestRatioMarking.creator.sources[0]);
                    MathInputView.latexToMathjax(latex, $transformationPopup.find('.dilate-marked-ratio-numerator'));
                    latex = model.engine.generateLabel(latestRatioMarking, latestRatioMarking.creator.sources[1]);
                    MathInputView.latexToMathjax(latex, $transformationPopup.find('.dilate-marked-ratio-denominator'));
                } else {
                    $transformationPopup.find('.for-non-measurement').hide();
                    $transformationPopup.find('.for-measurement').show();
                    latex = model.engine.generateLabel(latestRatioMarking, latestRatioMarking.creator.sources);
                    MathInputView.latexToMathjax(latex, $transformationPopup.find('.dilate-marked-ratio-numerator-denominator'));
                }

            }

            if (distanceMarkingLength !== 0) {
                latestDistanceMarking = previousMarkings.distance[distanceMarkingLength - 1];
                if (distanceMarkingLength > 1) {
                    previousDistanceMarking = previousMarkings.distance[distanceMarkingLength - 2];
                } else {
                    previousDistanceMarking = previousMarkings.distance[distanceMarkingLength - 1];
                }
                latex = model.engine.generateLabel(latestDistanceMarking, latestDistanceMarking.creator.sources[0]);
                MathInputView.latexToMathjax(latex, $transformationPopup.find('.translation-marked-distance-polar'));
                MathInputView.latexToMathjax(latex, $transformationPopup.find('.translation-vertical-marked-distance-cartesian'));
                latex = model.engine.generateLabel(previousDistanceMarking, previousDistanceMarking.creator.sources[0]);
                MathInputView.latexToMathjax(latex, $transformationPopup.find('.translation-horizontal-marked-distance-cartesian'));

            }

            this._enableDisableRadioButton($curParamContainer);

            if (latestMarking !== null) {
                latestMarkingType = latestMarking.type;
            }

            if (latestMarkingType !== null) {
                if (latestVectorMarking && latestVectorMarking !== model.recentVectorMarking && latestMarkingType !== 'distance' || latestMarkingType === 'vector' && lastSelectedVector === 'marked') {
                    $transformationPopup.find('input[name=vector-unit]:radio:checked').prop('checked', false);
                    $transformationPopup.find('.marked-vector').prop('checked', true);
                    $selectedVector = $transformationPopup.find('.marked-vector');
                    this._showInput($selectedVector.attr('name'), $selectedVector.attr('id'));
                    model.recentVectorMarking = latestVectorMarking;
                }

                if (latestAngleMarking && latestAngleMarking !== model.recentAngleMarking && latestMarkingType === 'angle' || latestMarkingType === 'angle' && lastSelectedVector === 'polar') {
                    $markedAngle = $transformationPopup.find('.marked-angle');
                    markedAngleNameAttributeLength = $markedAngle.length;
                    for (loopCtr = 0; loopCtr < markedAngleNameAttributeLength; loopCtr++) {
                        $transformationPopup.find('input[name=' + $markedAngle[loopCtr].name + ']:radio:checked').prop('checked', false);
                        this._showInput($markedAngle[loopCtr].name, $markedAngle[loopCtr].id);
                    }
                    $transformationPopup.find('.marked-angle').prop('checked', true);
                    $transformationPopup.find('input[name=vector-unit]:radio:checked').prop('checked', false);
                    $polar = $transformationPopup.find('#polar');
                    $polar.prop('checked', true);
                    this._showInput($polar.attr('name'), $polar.attr('id'));
                    model.recentAngleMarking = latestAngleMarking;
                }

                if (latestRatioMarking && latestRatioMarking !== model.recentRatioMarking) {
                    $selectedVector = $transformationPopup.find('.marked-ratio');
                    this._showInput($selectedVector.attr('name'), $selectedVector.attr('id'));
                    $transformationPopup.find('.marked-ratio').prop('checked', true);
                    model.recentRatioMarking = latestRatioMarking;
                }

                if (latestDistanceMarking && latestDistanceMarking !== model.recentDistanceMarking && latestMarkingType === 'distance' || latestMarkingType === 'distance' && lastSelectedVector === 'cartesian') {
                    $markedDistance = $transformationPopup.find('.marked-distance');
                    markedDistanceNameAttributeLength = $markedDistance.length;
                    for (loopCtr = 0; loopCtr < markedDistanceNameAttributeLength; loopCtr++) {
                        $transformationPopup.find('input[name=' + $markedDistance[loopCtr].name + ']:radio:checked').prop('checked', false);
                        this._showInput($markedDistance[loopCtr].name, $markedDistance[loopCtr].id);
                    }
                    $transformationPopup.find('.marked-distance').prop('checked', true);
                    $transformationPopup.find('input[name=vector-unit]:radio:checked').prop('checked', false);
                    $rectangular = $transformationPopup.find('#cartesian');
                    $rectangular.prop('checked', true);
                    this._showInput($rectangular.attr('name'), $rectangular.attr('id'));
                    model.recentDistanceMarking = latestDistanceMarking;
                }

            }


            if (directive === 'translate' && (latestMarking === null || latestMarking !== null && model.recentMarking !== null && latestMarking !== model.recentMarking)) {
                if ((latestVectorMarking !== model.recentMarking || model.recentMarking === null) && lastSelectedVector === 'vector') {
                    $transformationPopup.find('input[name=vector-unit]:radio:checked').prop('checked', false);
                    $transformationPopup.find('.marked-vector').prop('checked', true);
                    $selectedVector = $transformationPopup.find('.marked-vector');
                    this._showInput($selectedVector.attr('name'), $selectedVector.attr('id'));
                } else if ((latestAngleMarking !== model.recentMarking || model.recentMarking === null) && lastSelectedVector === 'polar') {
                    $transformationPopup.find('input[name=vector-unit]:radio:checked').prop('checked', false);
                    $transformationPopup.find('#polar').prop('checked', true);
                    $selectedVector = $transformationPopup.find('#polar');
                    this._showInput($selectedVector.attr('name'), $selectedVector.attr('id'));
                } else if ((latestDistanceMarking !== model.recentMarking || model.recentMarking === null) && lastSelectedVector === 'cartesian') {
                    $transformationPopup.find('input[name=vector-unit]:radio:checked').prop('checked', false);
                    $transformationPopup.find('#cartesian').prop('checked', true);
                    $selectedVector = $transformationPopup.find('#cartesian');
                    this._showInput($selectedVector.attr('name'), $selectedVector.attr('id'));
                }
            }
            model.recentMarking = latestMarking;
        },

        "changeSelectedRadioButton": function(event) {
            $(':radio[id="' + this.model.engine.dgtUI.onChangeLabelText(event) + '"]').prop('checked', 'checked');

        },

        "_propertiesLabelInputKeyDownEvent": function(event) {
            var charCode = event.which || event.charCode || event.keyCode,
                keyCodeMap = this.model.engine.dgtUI.model.keyCodeMap;

            if ([keyCodeMap.SPECIAL_KEY_BACKSLASH, keyCodeMap.SPECIAL_KEY_CARET_SIGN].indexOf(charCode) > -1) {
                event.preventDefault();
            }
        },

        "_parameterValueInputKeyDownEvent": function(event) {
            var charCode, engine = this.model.engine,
                mathInputView = engine.dgtCalculatorManager.mathInputView,
                keyCodeMap = this.model.engine.dgtUI.model.keyCodeMap;
            charCode = event.which || event.charCode || event.keyCode;
            //Allow cut, copy, paste, select all
            if ((event.metaKey || event.ctrlKey) && [keyCodeMap.ALPHABET_C, keyCodeMap.ALPHABET_V, keyCodeMap.ALPHABET_A, keyCodeMap.ALPHABET_X].indexOf(charCode) > -1) {
                return;
            }
            //Allow cursor Navigation as well as Enter Key...
            if (mathInputView._isCursorNavigationKey(event) || charCode === keyCodeMap.SPECIAL_KEY_ENTER) {
                return;
            }
            if (charCode >= keyCodeMap.NUMPAD_ZERO && charCode <= keyCodeMap.SPECIAL_KEY_NUMPAD_DIVIDE && charCode !== 108) {
                //96-105: `Numpad 0-9`, 106: `*`, 107: `+`, 109: `-`, 110: `.`, 111: `/` 108: Doesn't fit into numpad section
                return;
            }
            if ((charCode >= keyCodeMap.NUMBER_1 && charCode <= keyCodeMap.NUMBER_7 || charCode === keyCodeMap.SPECIAL_KEY_PERIOD || charCode === keyCodeMap.SPECIAL_KEY_FRWD_SLASH || charCode === keyCodeMap.SPECIAL_KEY_ESCAPE) && event.shiftKey) {
                event.preventDefault();
            }
            if (charCode >= keyCodeMap.ALPHABET_A && charCode <= keyCodeMap.ALPHABET_Z) {
                event.preventDefault();
            }
            if (charCode >= keyCodeMap.NUMBER_0 && charCode <= keyCodeMap.NUMBER_9 || [keyCodeMap.SPECIAL_KEY_PERIOD, keyCodeMap.SPECIAL_KEY_FRWD_SLASH,
                    keyCodeMap.SPECIAL_KEY_BACKSPACE, keyCodeMap.SPECIAL_KEY_TAB, keyCodeMap.SPECIAL_KEY_ESCAPE,
                    keyCodeMap.SPECIAL_KEY_DELETE
                ].indexOf(charCode) > -1 ||
                charCode === keyCodeMap.SPECIAL_KEY_EQUAL && event.shiftKey) {
                return;
            }
            event.preventDefault();
        },

        "calculatorInputValidation": function(event) {
            var charCode, engine = this.model.engine,
                mathInputView = engine.dgtCalculatorManager.mathInputView,
                keyCodeMap = this.model.engine.dgtUI.model.keyCodeMap;
            charCode = event.which || event.charCode || event.keyCode;
            //Allow cursor Navigation as well as Enter Key...
            if (mathInputView._isCursorNavigationKey(event) || charCode === keyCodeMap.SPECIAL_KEY_ENTER) {
                return true;
            }
            if (charCode >= keyCodeMap.NUMPAD_ZERO && charCode <= keyCodeMap.SPECIAL_KEY_NUMPAD_DIVIDE && charCode !== 108) {
                //96-105: `Numpad 0-9`, 106: `*`, 107: `+`, 109: `-`, 110: `.`, 111: `/` 108: Doesn't fit into numpad section
                return true;
            }
            if ((charCode >= keyCodeMap.NUMBER_1 && charCode <= keyCodeMap.NUMBER_7 || [keyCodeMap.SPECIAL_KEY_PERIOD, keyCodeMap.SPECIAL_KEY_FRWD_SLASH,
                    keyCodeMap.SPECIAL_KEY_ESCAPE, keyCodeMap.ALPHABET_A,
                    keyCodeMap.ALPHABET_C
                ].indexOf(charCode) > -1) &&
                event.shiftKey) {
                return false;
            }
            if ([keyCodeMap.ALPHABET_A, keyCodeMap.ALPHABET_C, keyCodeMap.ALPHABET_E,
                    keyCodeMap.ALPHABET_L, keyCodeMap.ALPHABET_P, keyCodeMap.ALPHABET_R,
                    keyCodeMap.ALPHABET_S, keyCodeMap.ALPHABET_T
                ].indexOf(charCode) > -1) {
                return true;
            }
            if (charCode >= keyCodeMap.NUMBER_0 && charCode <= keyCodeMap.NUMBER_9 || [keyCodeMap.SPECIAL_KEY_PERIOD, keyCodeMap.SPECIAL_KEY_FRWD_SLASH,
                    keyCodeMap.SPECIAL_KEY_BACKSPACE, keyCodeMap.SPECIAL_KEY_ESCAPE,
                    keyCodeMap.SPECIAL_KEY_DELETE
                ].indexOf(charCode) > -1 ||
                charCode === keyCodeMap.SPECIAL_KEY_EQUAL && event.shiftKey) {
                return true;
            }
            return false;
        },

        "getDefaultParamsForPreview": function(directive) {
            switch (directive) {
                case 'translate':
                    return {
                        "dx": NaN,
                        "dy": NaN,
                        "coordinateSystem": "cartesian"
                    };
                case 'rotate':
                    return {
                        "angle": NaN
                    };
                case 'dilate':
                    return {
                        "ratio": NaN
                    };
            }
        },

        "fetchParamsFromPopup": function(directive) {
            var model = this.model,
                engine = model.engine,
                $popup,
                loopVar, input1 = null,
                input2 = null,
                vectorUnit = null,
                params = {},
                thicknessValue,
                curInputs, previousMarkings = engine.getActiveMarking(),
                vectorLength, tempDepth;

            $popup = this.getPopupContainer();
            curInputs = $popup.find('input:text:visible');

            if (directive === 'translate' || directive === 'rotate' || directive === 'dilate') {
                for (loopVar = 0; loopVar < curInputs.length; loopVar++) {
                    if ($(curInputs[loopVar]).val() === '') {
                        return this.getDefaultParamsForPreview(directive);
                    }
                    if (!/\d/.test($(curInputs[loopVar]).val())) {
                        return this.getDefaultParamsForPreview(directive);
                    }
                    if (directive === 'dilate' && parseFloat($(curInputs[loopVar]).val()) === 0) {
                        return this.getDefaultParamsForPreview(directive);
                    }

                }
            }

            switch (directive) {
                case 'dilate':
                    vectorUnit = $popup.find("input:radio[name='dilate-by-value']:checked").attr('id');
                    if (vectorUnit === 'dilate-fixed-ratio') {
                        input1 = Number($popup.find('.dilate-numerator').val());
                        input2 = Number($popup.find('.dilate-denominator').val());
                        params = {
                            "ratio": input1 / input2
                        };
                    } else {

                        vectorLength = previousMarkings.ratio.length;
                        input1 = previousMarkings.ratio[vectorLength - 1];
                        params = {
                            "ratio": input1
                        };
                    }
                    break;

                case 'rotate':
                    vectorUnit = $popup.find("input:radio[name='rotate-by-value']:checked").attr('id');
                    if (vectorUnit === 'rotate-fixed-angle') {
                        input1 = Number($popup.find('.rotation-angle').val());
                    } else {
                        vectorLength = previousMarkings.angle.length;
                        input1 = previousMarkings.angle[vectorLength - 1];
                    }
                    params = {
                        "angle": input1
                    };
                    break;

                case 'translate':
                    vectorUnit = $popup.find('input:radio[name="vector-unit"]:checked').attr('id');
                    if (vectorUnit === 'polar') {
                        vectorUnit = $popup.find('input:radio[name="polar-by-value"]:checked').attr('id');
                        if (vectorUnit === 'polar-fixed-distance') {
                            input1 = Number($popup.find('.translation-distance-polar').val());
                        } else {
                            vectorLength = previousMarkings.distance.length;
                            input1 = previousMarkings.distance[vectorLength - 1];
                        }

                        vectorUnit = $popup.find('input:radio[name="polar-at-value"]:checked').attr('id');
                        if (vectorUnit === 'polar-fixed-angle') {
                            input2 = Number($popup.find('.translation-angle-polar').val());
                        } else {
                            vectorLength = previousMarkings.angle.length;
                            input2 = previousMarkings.angle[vectorLength - 1];
                        }

                        params = {
                            "r": input1,
                            "angle": input2,
                            "coordinateSystem": "polar"
                        };

                    } else if (vectorUnit === 'cartesian') {
                        vectorUnit = $popup.find('input:radio[name="cartesian-horizontal-value"]:checked').attr('id');
                        if (vectorUnit === 'cartesian-horizontal-fixed-distance') {
                            input1 = Number($popup.find('.translation-horizontal-distance-cartesian').val());
                        } else {
                            vectorLength = previousMarkings.distance.length;
                            input1 = previousMarkings.distance[vectorLength - 1];
                        }

                        vectorUnit = $popup.find('input:radio[name="cartesian-vertical-value"]:checked').attr('id');
                        if (vectorUnit === 'cartesian-vertical-fixed-distance') {
                            input2 = Number($popup.find('.translation-vertical-distance-cartesian').val());
                        } else {
                            vectorLength = previousMarkings.distance.length;
                            input2 = previousMarkings.distance[vectorLength - 1];
                        }

                        params = {
                            "dx": input1,
                            "dy": input2,
                            "coordinateSystem": "cartesian"
                        };

                    } else {
                        vectorLength = previousMarkings.vector.length;
                        input1 = previousMarkings.vector[vectorLength - 1];
                        input2 = previousMarkings.vector[vectorLength - 1];
                        params = {
                            "dx": input1,
                            "dy": input2,
                            "coordinateSystem": "cartesian"
                        };
                    }

                    break;
                case 'iterate':
                case 'iterateToDepth':
                    tempDepth = this.model.iteratePopupManager.params.depth;
                    this.model.iteratePopupManager.params.depth = null;
                    params = MathUtilities.Tools.Dgt.Models.DgtEngine.cloneObject(this.model.iteratePopupManager.params); // Because we cannot serialize HTML elements
                    this.model.iteratePopupManager.params.depth = tempDepth;
                    params.depth = tempDepth;
                    break;
                case 'properties':
                    if (engine.selected[0].division === 'notation' && engine.selected.length === 1) {
                        params.typeOfMarker = $popup.find('.container-for-marker fieldset.marker-type-selected input:checked').attr('id');
                        params.strokeCount = parseInt($popup.find('#stroke-dropdown-link').val(), 10);
                        thicknessValue = MathUtilities.Tools.Dgt.Views.DgtPopup.thicknessValue;
                        params.thickness = thicknessValue[$popup.find('#thickness-dropdown-link')[0].selectedIndex];
                        if ($popup.find('#field-for-angle-defination').hasClass('marker-type-selected') === true) {
                            params.showDirection = $popup.find('#div-for-checkbox .checkbox-button').is(':checked');
                        }
                        if ($popup.find('#field-for-tick-mark-style').hasClass('marker-type-selected') === true) {
                            if ($popup.find('#div-for-direction-arrow input:checked').attr('id') === 'forward-arrow') {
                                params.direction = 0;
                            } else {
                                params.direction = 1;
                            }
                        }
                    }
            }
            return params;
        },

        "generatePreview": function(directive) {
            var model = this.model,
                engine = model.engine,
                params;

            params = this.fetchParamsFromPopup(directive);
            if (params) {
                engine.perform(directive, params);
            }
        },

        "showBootstrapPopup": function(directive, objectType, changed) {
            var model = this.model,
                $popup, $curParamContainer, currentMeasurement, loopVar, curMeasure, enableShowLabel = false,
                paramPopupData = model.paramPopupData[directive],
                key = null,
                engine = model.engine,
                selected = model.engine.selected,
                precision = ['units', 'tenths', 'hundredths', 'thousandths', 'ten-thousandths', 'hundred-thousandths'],
                iteratePopupManager, calculatorFieldInput, $cursor, tabs, DELAY = 10,
                $btnPrimary, $btnCancel, $dgtModalLabel, $btnClose;
            this.model.bootstrapPopupShown = true;
            if (!changed) {
                this.model.prevMode = engine.grid.getGridMode();
            }
            if (['properties', 'iterate', 'iterateToDepth'].indexOf(directive) > -1) {
                engine.grid.setGridMode('Graph');

            } else {
                engine.grid.setGridMode('drawing');
            }
            if (engine._undergoingOperation) {
                engine._undergoingOperation.abort();
            }
            engine.dgtUI.disableDgtPropertiesBar();
            engine.grid.coverGrid('opaque');

            model.isOkClicked = false;
            paramPopupData = model.paramPopupData[directive];
            model.directive = directive;
            $popup = this.getPopupContainer();
            $btnPrimary = $popup.find('.btn-primary');
            $btnCancel = $popup.find('.btn-cancel');
            $btnClose = $popup.find('.modal-header .close');
            $dgtModalLabel = $popup.find('.dgt-modal-label');
            this._attachEvents($popup);
            $curParamContainer = $popup.find('.' + directive + '-param-container');

            if (directive === 'translate' || directive === 'rotate' || directive === 'dilate') {
                $popup.find('input:text').off('keypress', this._checkNumericInputFunc)
                    .on('keypress', this._checkNumericInputFunc)
                    .off('keyup', this._checkNumericInputOnKeyUpFunc)
                    .on('keyup', this._checkNumericInputOnKeyUpFunc)
                    .off('paste', this._checkNumericInputPasteFunc)
                    .on('paste', this._checkNumericInputPasteFunc);
            }
            $popup.find('.param-container').hide();
            $curParamContainer.show();
            $popup.attr('data-directive', directive);
            if (directive === 'properties') {
                $popup.attr('data-for-object', objectType);
            }

            for (key in paramPopupData.defaultValues) {
                $popup.find('.' + key).val(paramPopupData.defaultValues[key]);
            }
            for (loopVar in engine.measures) {
                curMeasure = engine.measures[loopVar];
                if (curMeasure.$measureView && !curMeasure.$measureView.find('.parameter-covering-div').length) {
                    curMeasure.$measureView.prepend("<div class = 'parameter-covering-div'></div>");
                }
            }


            /*set default values*/

            switch (directive) {
                case 'translate':
                    this._showInput($popup.find('input[name=vector-unit]:radio:checked').attr('name'), $popup.find('input[name=vector-unit]:radio:checked').attr('id'));
                    this._showInputForTranslateRotateDilate(directive);
                    break;
                case 'rotate':
                    this._showInputForTranslateRotateDilate(directive);
                    break;
                case 'dilate':
                    this._showInput($popup.find('input[name=dilate-by-value]:radio:checked').attr('name'), $popup.find('input[name=dilate-by-value]:radio:checked').attr('id'));
                    this._showInputForTranslateRotateDilate(directive);
                    break;
                case 'properties':
                    this.on('selection-state-changed', this.propertiesPopupOkClicked);
                    $btnPrimary.prop('disabled', false);
                    this._showInputForProperties(objectType);
                    if (objectType === 'multiple') {
                        $popup.find('#first-selected-label').off('keydown', this._propertiesLabelInputKeyDownEventFunc)
                            .on('keydown', this._propertiesLabelInputKeyDownEventFunc);
                    } else {
                        tabs = model.objectTypeMapping[objectType].tabs;
                        if (tabs.indexOf('label') > -1) {
                            $popup.find('#selected-label').off('keydown', this._propertiesLabelInputKeyDownEventFunc)
                                .on('keydown', this._propertiesLabelInputKeyDownEventFunc);
                        }
                    }

                    engine.getPopupNameAndValue(objectType);
                    if ($popup.find('#hidden').is(':checked')) {
                        $popup.find('#hidden').prop('checked', false);
                    }

                    if (objectType === 'parameter') {
                        $popup.find("#original-name").prop('disabled', true);
                        $popup.find("#current-label").prop('checked', true);
                        $popup.find('option[value=' + precision[model.engine.selected[0].properties.precision] + ']').attr('selected', true);
                    }
                    if (['angleMark', 'tickMark'].indexOf(objectType) > -1) {
                        this.showHideRespectiveMarkerParams();
                        this._updateDataInMarkerPopup();
                        this.attachEventsOfMarkerPopup();
                    }

                    if (engine.selected[0].species === 'calculation') {
                        $popup.find("#original-name-label").text(engine.accManager.getMessage("calculator-original-name-label", 0));
                    } else {
                        $popup.find("#original-name-label").text(engine.accManager.getMessage("calculator-original-name-label", 1));
                    }
                    if (objectType === 'multiple') {
                        $popup.find('#first-selected-label').val(this.model.engine.nameInPopup);
                        this.setExampleString();
                        for (loopVar in selected) {
                            if (selected[loopVar].division !== 'measurement') {
                                enableShowLabel = true;
                                break;
                            }
                        }

                        $popup.find('#first-selected-label').off('change keyup paste', this.setExampleStringFunc)
                            .on('change keyup paste', this.setExampleStringFunc)
                            .off('change keyup paste', this.enableDisableRadioFunc)
                            .on('change keyup paste', this.enableDisableRadioFunc);

                        $popup.find('#show-labels-for-all-objects').prop({
                            "checked": true,
                            "disabled": !enableShowLabel
                        });
                    } else {
                        $popup.find('#selected-label').val(engine.nameInPopup);

                        $popup.find('input:radio[name="value-display-with"]:checked').prop('checked', false);
                        $popup.find('#' + engine.selected[0].properties.labelType).prop('checked', true);
                        $popup.find('option:selected').removeAttr('selected');
                        $popup.find('#precision').val(precision[model.engine.selected[0].properties.precision]);

                        $popup.find('#show-hide-label').prop('checked', true);
                    }
                    $popup.find('#selected-label').change(this.changeSelectedRadioButtonFunc);
                    break;
                case 'parameter':
                    if (engine.editableMeasurementId) {
                        currentMeasurement = engine.getEntityFromId(engine.editableMeasurementId);
                        $popup.find('#param-name-input').val(currentMeasurement.deletePrefixedString(currentMeasurement.properties.labelText));
                        $popup.find('#param-value-input').val(currentMeasurement.value);

                    } else {
                        this.setParameterNameAndValue();
                    }
                    $popup.find('#param-name-input').off('keydown', this._propertiesLabelInputKeyDownEventFunc)
                        .on('keydown', this._propertiesLabelInputKeyDownEventFunc);
                    $popup.find('#param-value-input').off('keydown', this._parameterValueInputKeyDownEventFunc)
                        .on('keydown', this._parameterValueInputKeyDownEventFunc);
                    break;
                case 'calculator':
                    $popup.find('.error-msg').hide();
                    this.$('#custom-modal-calculate-popup').show();
                    if (MathUtilities.Components.Utils.Models.BrowserCheck.isMobile) {
                        $cursor = $popup.find('.cur');
                        $popup.find('#calculator-input').prop('disabled', true).addClass('input-in-disabled-state');
                        if ($cursor.length === 0) {
                            $popup.find('.math-input-division').append('<div class="cur"><span>|<span></div>');
                            $cursor = $popup.find('.cur');

                        }
                        this.model.interval = setInterval(function() {
                            if ($cursor.css('visibility') === 'hidden') {
                                $cursor.css('visibility', 'visible');
                            } else {
                                $cursor.css('visibility', 'hidden');
                            }
                        }, 600);
                    }
                    $popup.find('.calculator-math-input').on('keydown', _.bind(function(event) {
                        var accManager = engine.accManager;
                        if (event.keyCode === engine.dgtUI.model.keyCodeMap.SPECIAL_KEY_TAB) {
                            if (event.shiftKey) {
                                accManager.setFocus('calculator-mathjax-display', DELAY);
                            } else {
                                accManager.setFocus('calculator-keypad-container', DELAY);
                            }
                        }
                    }, this));
                    engine.on('shift-focus-to-calculate', this.focusToCalculator);
                    break;
                case 'iterate':
                case 'iterateToDepth':
                    this._showInputForIterate(directive);
                    iteratePopupManager = this.model.iteratePopupManager;
                    iteratePopupManager.updateSelectionOfFreePoints();
                    iteratePopupManager.selected.push(iteratePopupManager.preImageArray[0]);
                    engine.selectionSteal = iteratePopupManager;
                    iteratePopupManager.selected.push(iteratePopupManager.preImageArray[0]);
                    engine.selectionSteal = iteratePopupManager;
                    engine.grid.enableInputMode(engine.grid.INPUT_MODE_DOUBLE_CLICK, false);
                    break;
            }

            /*hide or show cancel button*/
            if (['transforming-center-only', 'beta-functionality', 'small-image-crop', 'mathjax-load-error'].indexOf(directive) > -1) {
                $btnCancel.hide();
            } else {
                $btnCancel.show();
            }

            /*hide or show OK button*/
            if (['reflecting-mirror-only', 'iterate-missing-destination-image'].indexOf(directive) > -1) {
                $btnPrimary.hide();
            } else {
                $btnPrimary.show();
            }

            /* For moving focus from last element to first element in accessibility */
            if ($popup.attr('id') === 'param-options-popup') {
                $btnPrimary.attr('data-next-id-accessible', $dgtModalLabel.attr('id'));
                $dgtModalLabel.attr("data-prev-id-accessible", $btnClose.attr('id'));
            }

            $popup.modal({
                "manager": this.$el
            });
            if ($popup.attr('id') === 'param-options-popup' || $popup.attr('id') === 'param-options-popup' && $popup.hasClass('ui-draggable')) {
                if (directive !== 'translate' && directive !== 'rotate' && directive !== 'dilate') {
                    $popup.draggable({
                        "disabled": true
                    });
                    this._shiftPopupInCenter();
                }
            }

            $('.modal-scrollable').removeClass('modal-scrollable');
            $popup.css('display', 'inline-table');
            this.model.curPopupShown = directive;
            if (directive === 'calculator') {
                if (!model.engine.dgtCalculatorManager.isReopenedCalculation) {
                    calculatorFieldInput = $popup.find('.calculator-math-input').val();
                    model.engine.dgtCalculatorManager.mathInputView._setCaretPosition(null, calculatorFieldInput.length);
                    model.engine.dgtCalculatorManager.mathInputView._updateInputReferencePointer(null, calculatorFieldInput.length);
                }
                model.engine.trigger('calculator-state-change');
            }
            if (['iterate', 'iterateToDepth'].indexOf(directive) > -1) {
                // Dropdown in iterate popup does not open on click in firefox...
                $popup.find('#dropdown-menu1, #dropdown-menu2').off('click', _.bind(this.displayIteratePopupDropDown, this))
                    .on('click', _.bind(this.displayIteratePopupDropDown, this));
            }
            $curParamContainer.find('input:text:visible:first').focus().select();
            this._accessabilityOfPopup();
            this.setAccMessageForPopup(directive);
            if (['properties', 'calculator', 'iterate', 'iterateToDepth', 'translate', 'rotate', 'dilate'].indexOf(directive) > -1) {
                this._makePopupDraggable(changed, objectType);
            }
            if (['translate', 'rotate', 'dilate'].indexOf(directive) > -1) {
                $popup.find('input[type=text]').off('input', this.onChangeOfPopupValues)
                    .on('input', this.onChangeOfPopupValues);
                $popup.find('input[type=radio]').off('change', this.onChangeOfPopupValues)
                    .on('change', this.onChangeOfPopupValues);
                this.generatePreview(directive);
            }
            engine.dgtUI.disableOrEnableDragingOfMeasurementDivs(true); //true for disabling dragging of measurements div when popup is shown
            this.hideErrorMessage();
        },
        "displayIteratePopupDropDown": function(event) {
            /*on click adding toggling class open to the dropdown in iterate popup &
            preventing jquery click event to be triggered further*/
            var $popup = this.getPopupContainer();
            $popup.find('#dropdown-menu1, #dropdown-menu2').removeClass('open');
            $(event.currentTarget).addClass('open');
            event.stopPropagation();
        },
        "setAccMessageForPopup": function(directive) {
            var engine = this.model.engine,
                latestMarking, message, message2,
                activeMarkings = engine.getActiveMarking(),
                angleMarkingLength = activeMarkings.angle.length,
                ratioMarkingLength = activeMarkings.ratio.length,
                vectorMarkingLength = activeMarkings.vector.length,
                distanceMarkingLength = activeMarkings.distance.length;
            switch (directive) {
                case 'rotate':
                    if (angleMarkingLength) {
                        latestMarking = activeMarkings.angle[angleMarkingLength - 1];
                        message = engine.generateLabel(latestMarking, latestMarking.creator.sources, true).split('').join(' ');
                        engine.accManager.setAccMessage('rotate-by-value-input', 'marked angle ' + message);
                    }
                    break;
                case 'translate':
                    if (distanceMarkingLength) {
                        latestMarking = activeMarkings.distance[distanceMarkingLength - 1];
                        message = engine.generateLabel(latestMarking, latestMarking.creator.sources, true).split('').join(' ');
                        engine.accManager.setAccMessage('cartesian-vertical-value-input', 'marked horizontal distance ' + message);
                        engine.accManager.setAccMessage('polar-by-value-input', 'marked distance ' + message);
                        if (distanceMarkingLength > 1) {
                            latestMarking = activeMarkings.distance[distanceMarkingLength - 2];
                            message = engine.generateLabel(latestMarking, latestMarking.creator.sources, true).split('').join(' ');
                            engine.accManager.setAccMessage('cartesian-horizontal-value-input', 'marked vertical distance ' + message);
                        } else {
                            engine.accManager.setAccMessage('cartesian-horizontal-value-input', 'marked vertical distance ' + message);
                        }

                    }
                    if (vectorMarkingLength) {
                        latestMarking = activeMarkings.vector[vectorMarkingLength - 1];
                        message = engine.generateLabel(latestMarking, latestMarking.creator.sources[0], true).split('').join(' ');
                        engine.accManager.setAccMessage('marked-value-holder-input-from', 'marked vector from ' + message);
                        message = engine.generateLabel(latestMarking, latestMarking.creator.sources[1], true).split('').join(' ');
                        engine.accManager.setAccMessage('marked-value-holder-input-to', 'marked vector to ' + message);
                    }
                    if (angleMarkingLength) {
                        latestMarking = activeMarkings.angle[angleMarkingLength - 1];
                        message = engine.generateLabel(latestMarking, latestMarking.creator.sources, true).split('').join(' ');
                        engine.accManager.setAccMessage('polar-at-value-input', 'marked angle ' + message);
                    }
                    break;
                case 'dilate':
                    if (ratioMarkingLength) {
                        latestMarking = activeMarkings.ratio[ratioMarkingLength - 1];
                        message = engine.generateLabel(latestMarking, latestMarking.creator.sources[0], true).split('').join(' ');
                        message2 = engine.generateLabel(latestMarking, latestMarking.creator.sources[1], true).split('').join(' ');
                        engine.accManager.setAccMessage('dilate-by-value-input', 'Dilate ratio ' + message + ' upon ' + message2);
                    }

            }
        },
        "focusToCalculator": function() {
            this.accManager.setFocus('calculator-input');
        },
        "_accessabilityOfPopup": function() {
            var model = this.model,
                paramPopupData = model.paramPopupData[this.model.curPopupShown],
                $popup, directive, focusableObjectId,
                accManager = model.engine.accManager,
                text = null,
                DELAY = 20;
            if (accManager) {
                $popup = this.getPopupContainer();
                directive = model.directive;
                this.attachAccessabilityEvents();
                accManager.loadScreen($popup.prop('id'));
                if (accManager.model.nodes.get(directive)) {
                    accManager.loadScreen(directive);
                }
                if (['rotate', 'dilate'].indexOf(directive) > -1) {
                    text = accManager.getMessage(directive + "-about-center", "0", [model.engine.anchor.getLabelDataText()]);
                    accManager.setMessage(directive + "-about-center", text);
                    accManager.setAccMessage(directive + "-about-center", text);
                }
                focusableObjectId = $popup.find('.dgt-modal-label').prop('id');
                this.disableTabIndex($popup.find('.acc-label'));
                this._updateFocusRect();
                if (['iterate', 'iterateToDepth'].indexOf(directive) > -1) {
                    this.enableDisableIterateToggleBtn(this.model.idOfIterateDropdownMenuItemToEnable);
                }
                accManager.setFocus(focusableObjectId, DELAY);


                // change title of popup
                accManager.setMessage($popup.find('.dgt-modal-label').attr('id'), paramPopupData.title);
                accManager.setAccMessage($popup.find('.dgt-modal-label').attr('id'), paramPopupData.title);

                //change primary button text
                accManager.setMessage($popup.find('.btn-primary').attr('id'), paramPopupData.ok);
                accManager.setAccMessage($popup.find('.btn-primary').attr('id'), paramPopupData.ok);

                $popup.find('a').on('focusout', _.bind(this._updateFocusRect, this));
            }

        },

        "attachAccessabilityEvents": function() {
            var model = this.model,
                $popup = this.getPopupContainer();
            this._focusHandlerReference = this._focusHandlerReference || _.bind(this._focusHandler, this);
            this._shiftFocusTolistDropdownReference = this._shiftFocusTolistDropdownReference || _.bind(this._shiftFocusTolistDropdown, this);
            this._shiftFocusToParentReference = this._shiftFocusToParentReference || _.bind(this._shiftFocusToParent, this);
            $popup.find('.modal-header .close').off('keydown', this._focusHandlerReference)
                .on('keydown', this._focusHandlerReference);
            $popup.find('.dgt-modal-label').off('keydown', this._focusHandlerReference)
                .on('keydown', this._focusHandlerReference);
            $popup.find('.parent-container').off('keydown', this._shiftFocusTolistDropdownReference)
                .on('keydown', this._shiftFocusTolistDropdownReference);
            $popup.find('.acc-label').off('keydown', this._shiftFocusToParentReference)
                .on('keydown', this._shiftFocusToParentReference)
                .on('keydown', _.bind(function(event) {
                    if (this.isAccButtonPressed(event.which)) {
                        event.stopPropagation();
                    }
                }, this));
            if (model.directive === 'calculator') {
                $popup.find('.parent-container').off('keydown', this._focusHandlerReference)
                    .on('keydown', this._focusHandlerReference)
                    .on('keydown', _.bind(function(event) {
                        if (this.isAccButtonPressed(event.which)) {
                            event.stopPropagation();
                        }
                    }, this));
                $popup.find('.btn-cancel').off('keydown', this._focusHandlerReference)
                    .on('keydown', this._focusHandlerReference);
            }
        },

        "isAccButtonPressed": function(keyCode) {
            var keyCodeMap = this.model.engine.dgtUI.model.keyCodeMap;
            return [keyCodeMap.SPECIAL_KEY_TAB,
                keyCodeMap.SPECIAL_KEY_ENTER,
                keyCodeMap.SPECIAL_KEY_SPACE,
                keyCodeMap.SPECIAL_KEY_SHIFT,
                keyCodeMap.SPECIAL_KEY_ESCAPE
            ].indexOf(keyCode) > -1;
        },

        "_updateFocusRect": function() {
            var $popup = this.getPopupContainer(),
                accManager = this.model.engine.accManager;
            _.each($popup.find('.math-utilities-manager-access'), function(element, index) {
                accManager.updateFocusRect($(element).parent().prop('id'));
            });
        },
        "_focusHandler": function(event) {
            var labelId, engine = this.model.engine;
            if (event.which === engine.dgtUI.model.keyCodeMap.SPECIAL_KEY_TAB) {
                if (event.shiftKey) {
                    labelId = $(event.currentTarget).attr('data-prev-id-accessible');
                } else {
                    labelId = $(event.currentTarget).attr('data-next-id-accessible');
                }
            }
            if (event.which === engine.dgtUI.model.keyCodeMap.ALPHABET_C && event.shiftKey) {
                engine.accessibilityView.shiftFromPopupToCanvas('calculate');
            }
            if (labelId) {
                engine.accManager.setFocus(labelId);
                event.preventDefault();
            }
        },

        "_shiftFocusTolistDropdown": function(event) {
            var model = this.model,
                engine = model.engine,
                id, accManager = engine.accManager,
                labelId, $parent, arrayList;
            if (event.which === engine.dgtUI.model.keyCodeMap.SPECIAL_KEY_ENTER || event.which === engine.dgtUI.model.keyCodeMap.SPECIAL_KEY_SPACE) {
                $parent = $(event.target).closest('.parent-container');
                $parent.addClass('open');
                arrayList = $parent.find('.acc-label');
                $.each(arrayList, function(index, value) {
                    id = $(this).prop('id');
                    accManager.updateFocusRect(id);
                    accManager.enableTab(id, true);
                });
                this.enableDisableIterateToggleBtn(this.model.idOfIterateDropdownMenuItemToEnable);
                if (model.directive === 'calculator' && $parent.prop('id') === 'calculator-keypad-container') {
                    labelId = 'number-key-one';
                } else {
                    labelId = arrayList.first().prop('id');
                }
                accManager.setFocus(labelId);
                event.preventDefault();
            }

        },

        "_shiftFocusToParent": function(event) {
            var engine = this.model.engine,
                accManager = engine.accManager,
                accLabelArray = [],
                arrayOfValidKeys,
                id, keyCodeMap = engine.dgtUI.model.keyCodeMap,
                $currTarget = $(event.currentTarget),
                idOfCurrentTarget = $currTarget.prop('id'),

                arrayOfValidKeys = [keyCodeMap.SPECIAL_KEY_TAB, keyCodeMap.SPECIAL_KEY_ENTER, keyCodeMap.SPECIAL_KEY_SPACE];
            if (arrayOfValidKeys.indexOf(event.which) > -1) {
                if (this.model.curPopupShown === 'iterate' || this.model.curPopupShown === 'iterateToDepth') {
                    accLabelArray = $currTarget.closest('.parent-container').find('.acc-label.enable-iteration-menu-item');
                } else {
                    accLabelArray = $currTarget.closest('.parent-container').find('.acc-label');
                }
                if (event.shiftKey && idOfCurrentTarget === $(accLabelArray).first().prop('id') && keyCodeMap.SPECIAL_KEY_TAB === event.which) {
                    id = $currTarget.closest('.parent-container').removeClass('open').prop('id');
                    this.disableTabIndex(accLabelArray);
                    accManager.setFocus(id);
                } else if (!event.shiftKey && idOfCurrentTarget === $(accLabelArray).last().prop('id') && keyCodeMap.SPECIAL_KEY_TAB === event.which) {
                    this.disableTabIndex(accLabelArray);
                    $currTarget.closest('.parent-container').removeClass('open');
                }
                event.stopPropagation();
            } else if ($currTarget.attr("data-mappy-id") && this.$("#" + $currTarget.attr("data-mappy-id")).hasClass('selected-mappy') && event.which === engine.dgtUI.model.keyCodeMap.ALPHABET_C && event.shiftKey) {
                engine.accessibilityView.shiftFromPopupToCanvas('iterate');
                event.stopPropagation();
            }
        },
        "shiftFocusToSelectedMappy": function() {
            this.model.engine.accManager.setFocus(this.getPopupContainer().find('.selected-mappy').prop('id') + '-focusable');
        },

        "disableTabIndex": function(arrayToDisableTabIndex) {
            var accManager = this.model.engine.accManager;
            $.each(arrayToDisableTabIndex, function(index, value) {
                accManager.updateFocusRect($(this).prop('id'));
                accManager.enableTab($(this).prop('id'), false);
            });
        },

        "_makePopupDraggable": function(changed, objectType) {
            var parentContainerId, self = this,
                $popup, model, directive;
            model = this.model;
            directive = model.directive;
            $popup = this.getPopupContainer(directive);
            if (!changed) {
                this._shiftPopupInCenter();
            }
            if (['iterate', 'iterateToDepth'].indexOf(directive) > -1) {
                this._placeDropDownListUpOrDown(); //before popup opens, check for drodown list position (upward or downward)
            }
            if (directive === 'properties' && objectType === 'multiple') {
                $popup.draggable({
                    "disabled": true
                });
                return;
            }
            if (['translate', 'rotate', 'dilate'].indexOf(directive) > -1) {
                $('.modal-backdrop').css('opacity', '0.5');
            } else {
                $('.modal-backdrop').hide();
            }
            parentContainerId = '#' + model.engine.dgtUI.$('#dgt-canvas-container').attr('id');

            if ('ontouchstart' in window) {
                $.support.touch = true;
                //do not perform whole $popup enableTouch, as it can disable page scroll
                $.fn.EnableTouch('#' + $popup.attr('id') + ' .modal-header');
            }
            $popup.draggable({
                "handle": ".modal-header",
                "disabled": false,
                "containment": parentContainerId,
                "stop": function() {
                    if (['iterate', 'iterateToDepth'].indexOf(directive) > -1) {
                        self._placeDropDownListUpOrDown();
                    }
                }
            });
        },
        //for switching position of iterate dropdown menu list when dragging stops it switches the position of list item upward or downward
        "_placeDropDownListUpOrDown": function() {
            var $popup = this.getPopupContainer(),
                $dropDownMenu1 = $popup.find('#dropdown-menu1'),
                $dropDownMenu2 = $popup.find('#dropdown-menu2'),
                $dropDownMenuList1, $dropDownMenuList2, $dgtCanvas, maxLimit, PADDING = 40;
            $dropDownMenuList1 = $dropDownMenu1.find('.dropdown-menu');
            $dropDownMenuList2 = $dropDownMenu2.find('.dropdown-menu');
            $dgtCanvas = this.model.engine.dgtUI.$('#dgt-canvas-container');
            maxLimit = $dgtCanvas.offset().top + $dgtCanvas.height() - PADDING;
            if ($dropDownMenuList1.height() + $dropDownMenu1.offset().top >= maxLimit) {
                $dropDownMenuList1.addClass('move-list-up1');
            } else {
                $dropDownMenuList1.removeClass('move-list-up1');

            }
            if ($dropDownMenuList2.height() + $dropDownMenu2.offset().top >= maxLimit) {
                $dropDownMenuList2.addClass('move-list-up2');
            } else {
                $dropDownMenuList2.removeClass('move-list-up2');
            }
        },

        "_shiftPopupInCenter": function() {
            var directive = this.model.directive,
                $popup = this.getPopupContainer(directive),
                top, left;
            if (['translate', 'iterate', 'properties', 'calculator'].indexOf(directive) > -1) {
                top = this.$el.height() / 2 - $popup.height() / 2;
                left = this.$el.width() / 2 - $popup.width() / 2;
            } else {
                top = $(window).height() / 2 - $popup.height() / 2;
                left = $(window).width() / 2 - $popup.width() / 2;
            }
            $popup.css({
                "margin-left": "0",
                "margin-top": "0",
                "top": top,
                "left": left
            });
        },

        "showHideRespectiveMarkerParams": function() {
            var $popup = this.getPopupContainer(),
                specie;
            specie = this.model.engine.selected[0].species;
            $popup.find('fieldset').removeClass('marker-type-selected');
            if (specie === 'tickMark') {
                this._showInput('marker-type', 'tick-mark');
                $popup.find('.for-tick-mark fieldset').addClass('marker-type-selected');
            } else if (specie === 'angleMark') {
                this._showInput('marker-type', 'angle-mark');
                $popup.find('.for-angle-mark  fieldset').addClass('marker-type-selected');
            }
            $popup.find('.modal-body').addClass('marker-modal-body');
        },


        "_updateDataInMarkerPopup": function() {
            var params = this.model.engine.selected[0].creator._getParamData(),
                $checkBoxForShowDirection, i, index,
                $popup, thicknessValue = MathUtilities.Tools.Dgt.Views.DgtPopup.thicknessValue;
            $popup = this.getPopupContainer();
            for (i in thicknessValue) {
                if (thicknessValue[i] === params.thickness) {
                    index = parseInt(i, 10);
                }
            }
            $checkBoxForShowDirection = $popup.find('#marker-content #show-angle-direction');
            $popup.find('#' + params.typeOfMarker).prop('checked', true);
            $popup.find('#stroke-dropdown-link').val(params.strokeCount);
            $popup.find('#thickness-dropdown-link').val($popup.find('#thickness-dropdown-link option').eq(index).val());

            $checkBoxForShowDirection.prop('checked', params.showDirection === true);
            if (params.direction === 0) {
                $popup.find('#forward-arrow').prop('checked', true);
            } else if (params.direction === 1) {
                $popup.find('#backward-arrow').prop('checked', true);
            }
            $popup.find('#div-for-direction-arrow :input').prop("disabled", $popup.find('#marker-content #crossbar').prop('checked') === true);
        },
        "attachEventsOfMarkerPopup": function() {
            var $popup = this.getPopupContainer();
            $popup.find('#field-for-tick-mark-style input[type=radio]').off('change', this.eventsForMarkerPopupFunc)
                .on('change', this.eventsForMarkerPopupFunc);
            $popup.find('.btn-group ul li').off('click', this.eventsForMarkerPopupFunc)
                .on('click', this.eventsForMarkerPopupFunc);
        },
        "eventsForMarkerPopup": function(event) {
            var type = $(event.target).attr('type'),
                $popup = this.getPopupContainer();
            if (type === 'radio') {
                $popup.find('#div-for-direction-arrow :input').prop("disabled", $popup.find('#crossbar').prop('checked') === true);
            }
        },

        "_showInputForIterate": function() {
            var selectedItems, lengthOfSelectedItems, i, preImageString, arrowImageString, labelOfSelectedImage = ' ',
                arrowDivs, entity,
                model = this.model,
                latexToMathjax = MathUtilities.Tools.Dgt.Views.MathInputView.latexToMathjax,
                $popup, preImageColumn, arrowColumn, preImageText, titleOfArrowColumn, iteratePopupStructure,
                preImage = '',
                arrayOfLabels = [],
                preImageDivs,
                textMapping, arrow = '';
            model.mappingColumnCounter = 1;
            model.summaryOfHiddenImages = null;
            this.model.widthIncreased = false;
            this.model.summaryImageVisible = false;
            iteratePopupStructure = MathUtilities.Tools.Dgt.templates.IteratePopupStructure;
            textMapping = MathUtilities.Tools.Dgt.Models.DgtUiModel.textMapping;
            $popup = this.model.$iteratePopup;
            selectedItems = this.model.engine.selected;
            lengthOfSelectedItems = selectedItems.length;
            this.model.startingTabIndex = 610; //To avoid conflict in shifting focus for iterate mapping images tabIndexes 610 - 700  are reserved
            if (model.directive === 'iterate') {
                model.idOfIterateDropdownMenuItemToEnable = ['increase-iterations', 'decrease-iterations', 'full-orbit-check', 'final-iteration-check'];
            } else if (model.directive === 'iterateToDepth') {
                model.idOfIterateDropdownMenuItemToEnable = ['full-orbit-check', 'final-iteration-check'];
            }
            $popup.find('.modal-footer .btn-primary')[0].disabled = true; //disable iterate button initially
            $popup.find('#pre-image-container').empty();
            $popup.find('#mapping-image-container').empty();
            $popup.find('#summary').remove();

            preImageText = textMapping.preImage;
            titleOfArrowColumn = textMapping.to;
            if ('ontouchstart' in window) {
                $popup.find('#data-holder').text(textMapping.touchDeviceDataHolderInIterate);
            } else {
                $popup.find('#data-holder').text(textMapping.dataHolderInIterate);
            }
            $popup.find('.note-data').text(textMapping.noteDataInIterate);
            preImage = '[{ "mappy-class": "title", "data": "' + preImageText + '"},';
            arrow = '[{ "mappy-class": "title", "data": "' + titleOfArrowColumn + '"},';

            for (i = 0; i < lengthOfSelectedItems; i++) {
                entity = this.model.engine.selected[i];
                labelOfSelectedImage = entity.division === 'measurement' ? entity.getDisplayedLabel() : entity.getLabelDataText();
                if (entity.division !== 'measurement' || entity.properties && entity.properties.labelType && entity.properties.labelType !== 'original-name') {
                    labelOfSelectedImage = MathUtilities.Tools.Dgt.Models.MathInput.updateMeasurementLabelLatex(labelOfSelectedImage);
                }
                arrayOfLabels.push(labelOfSelectedImage);
                preImageString = '{"mappy-class":"pre-image-and-arrow-data","data":" "},';
                arrowImageString = '{"mappy-class":"pre-image-and-arrow-data","data":"&#x279c;"},';
                arrow = arrow + arrowImageString;
                preImage = preImage + preImageString;
            }
            preImage = preImage.substring(0, preImage.length - 1) + ']';
            arrow = arrow.substring(0, arrow.length - 1) + ']';
            preImage = $.parseJSON(preImage);
            arrow = $.parseJSON(arrow);
            preImageColumn = iteratePopupStructure({
                "column-id": "pre-image",
                "mappy": preImage
            });
            preImageColumn = preImageColumn.trim();
            arrowColumn = iteratePopupStructure({
                "column-id": "arrow",
                "mappy": arrow
            });
            arrowColumn = arrowColumn.trim();
            $popup.find('#pre-image-container').append(preImageColumn, arrowColumn);

            arrowDivs = $popup.find('#arrow .iteration-data');
            for (i = arrowDivs.length - 1; i > 0; i--) {
                $(arrowDivs[i]).html('&#x279c;');
            }
            preImageDivs = $popup.find('#pre-image .iteration-data');
            for (i = 0; i < lengthOfSelectedItems; i++) {
                latexToMathjax(arrayOfLabels[i], $(preImageDivs[i + 1]));
            }
            this._addNewColumnInIterateMapping();
            this._enableAndDisableIterateMenubar(model.idOfIterateDropdownMenuItemToEnable);
            $popup.find('#all-object-images-check').prop('checked', 'true'); // all-object-image-check dropdown list is checked by default
            $popup.find('.modal-header').off('mousedown', this.hideDropDownListFunc)
                .on('mousedown', this.hideDropDownListFunc);
            this.shiftFocusToSelectedMappyReference = this.shiftFocusToSelectedMappyReference || _.bind(this.shiftFocusToSelectedMappy, this);
            this.model.engine.off('shift-focus-to-mappy', this.shiftFocusToSelectedMappyReference)
                .on('shift-focus-to-mappy', this.shiftFocusToSelectedMappyReference);
            this._shiftPopupInCenter();

        },
        "hideDropDownList": function() {
            this.getPopupContainer().find('.open').removeClass('open');
        },
        "_eventListenerForIterateMenuItem": function(event, caseForTargetEvent, eventType) {
            var $popup = this.getPopupContainer(),
                classOfTarget, curIteration, $target,
                iteratePopupManager = this.model.iteratePopupManager,
                iterateParam, engine, maxDepth = 4;
            iterateParam = iteratePopupManager.params;
            engine = this.model.engine;
            if (engine._undergoingOperation && engine._undergoingOperation.relations.length > 0) {
                curIteration = engine._undergoingOperation.relations[0].offspring;
            }
            if (!caseForTargetEvent) {
                classOfTarget = $(event.currentTarget).attr('class');
                if (classOfTarget.indexOf('iteration-data mapping-data') > -1) {
                    caseForTargetEvent = 'iteration-data mapping-data';
                } else if (classOfTarget.indexOf('mappy-focusable-elem') > -1) {
                    caseForTargetEvent = 'mappy-focusable-elem';
                } else {
                    caseForTargetEvent = $(event.currentTarget).attr('id') || classOfTarget.substring(0, 27);
                }
            }


            if (caseForTargetEvent !== 'iteration-data mapping-data' && caseForTargetEvent !== 'mappy-focusable-elem' &&
                $('#' + caseForTargetEvent).hasClass('enable-iteration-menu-item') === false) {
                return;
            }
            switch (caseForTargetEvent) {
                case 'remove-this-map':
                    this._removeColumnInIterateMapping();
                    this.model.engine.accManager.setFocus('dropdown-menu2');
                    break;
                case 'add-new-map':
                case 'iteration-data mapping-data':
                case 'mappy-focusable-elem':
                    if (caseForTargetEvent === 'add-new-map') {
                        this._addNewColumnInIterateMapping();
                    } else {
                        if (event) {
                            $target = caseForTargetEvent === 'iteration-data mapping-data' ? $(event.currentTarget) : $popup.find('#' + $(event.currentTarget).attr('data-mappy-id'));
                        } else {
                            $target = this.eventForIterateKeyBoardShortcut(eventType);
                        }
                        $popup.find('.selected-mappy').removeClass('selected-mappy');
                        $target.addClass('selected-mappy');
                    }
                    iteratePopupManager._updateRowAndColumnIndex();
                    iteratePopupManager.selectionOfRespectivePreImage();
                    this.model.engine.accManager.setFocus('dropdown-menu2');
                    break;
                case 'increase-iterations':
                case 'decrease-iterations':
                    if (caseForTargetEvent === 'increase-iterations') {
                        if (iterateParam.depth < maxDepth) {
                            iterateParam.depth++;
                            if (iterateParam.depth === maxDepth) {
                                $popup.find('#increase-iterations').removeClass('enable-iteration-menu-item');
                            }
                        }
                        $popup.find('#decrease-iterations').addClass('enable-iteration-menu-item');

                    } else {
                        if (iterateParam.depth > 1) {
                            iterateParam.depth--;
                            if (iterateParam.depth === 1) {
                                $popup.find('#decrease-iterations').removeClass('enable-iteration-menu-item');
                            }
                        }
                        $popup.find('#increase-iterations').addClass('enable-iteration-menu-item');
                    }
                    this.updateTextForDataHolderDivInIteratePopup();
                    this.model.engine.accManager.setFocus('dropdown-menu1');

                    break;
                case 'full-orbit-check':
                    iterateParam.finalIteration = false;
                    this.model.engine.accManager.setFocus('dropdown-menu1');
                    break;
                case 'final-iteration-check':

                    iterateParam.finalIteration = true;
                    this.model.engine.accManager.setFocus('dropdown-menu1');
                    break;
                case 'all-object-images-check':
                    if (curIteration) {

                        curIteration.nonPointImage = false;
                    }
                    this.model.engine.accManager.setFocus('dropdown-menu2');
                    break;
                case 'non-point-images-check':
                    if (curIteration) {
                        curIteration.nonPointImage = true;
                    }
                    this.model.engine.accManager.setFocus('dropdown-menu2');
                    break;
                case 'tabulate-iterated-values-check':
                    if (curIteration) {
                        curIteration.tabulateValues = !curIteration.tabulateValues;
                    }
                    this.model.engine.accManager.setFocus('dropdown-menu2');
                    break;
                case 'to-same-relative-location-check':
                    if (curIteration) {
                        curIteration.toSameLocation = true;
                    }
                    this.model.engine.accManager.setFocus('dropdown-menu2');
                    break;
                case 'to-new-random-locations-check':
                    if (curIteration) {
                        curIteration.toSameLocation = false;
                    }
                    this.model.engine.accManager.setFocus('dropdown-menu2');
                    break;
            }
            this.model.iteratePopupManager.updateParams();
            if (engine._undergoingOperation) {
                if (['remove-this-map', 'non-point-images-check', 'all-object-images-check', 'to-new-random-locations-check', 'to-same-relative-location-check'].indexOf(caseForTargetEvent) === -1) {
                    this.model.iteratePopupManager.params.forceRedraw = false;
                } else {
                    this.model.iteratePopupManager.params.forceRedraw = true;
                }
                this.model.iteratePopupManager.params.forceRedraw = ['remove-this-map', 'non-point-images-check', 'all-object-images-check', 'to-new-random-locations-check', 'to-same-relative-location-check'].indexOf(caseForTargetEvent) > -1;
                this.model.iteratePopupManager.params.previewMode = true; //set actual depth when popup is closed.
                engine._undergoingOperation.updateOperationParams(this.model.iteratePopupManager.params);
            }
        },

        /*event is for keyboard arrow keys,
          it returns respective mappy div as user press arrow button
        */
        "eventForIterateKeyBoardShortcut": function(typeOfEvent) {
            var $target, $popup, selectedMappy, nextMappy, parent, indexOfCurrentParent, nextParent, shownMappingColumn,
                lengthOfShownMappingImage, prevMappy, lengthOfChildren, iteratePopupManager = this.model.iteratePopupManager;
            $popup = this.getPopupContainer();
            selectedMappy = $popup.find('.selected-mappy');
            parent = selectedMappy.closest('.map-image');
            indexOfCurrentParent = parent.index();
            nextParent = parent.next();
            shownMappingColumn = $popup.find('.map-image:visible');
            lengthOfShownMappingImage = shownMappingColumn.length;
            switch (typeOfEvent) {
                case 'up':
                    prevMappy = selectedMappy.prevAll('.mapping-data:first');
                    if (prevMappy.length !== 0 && prevMappy.hasClass('mapping-data') === true) {
                        $target = prevMappy;
                    } else {
                        lengthOfChildren = parent.find('.mapping-data').length;
                        $target = $(shownMappingColumn[indexOfCurrentParent]).find('.mappy-' + lengthOfChildren);
                    }
                    break;
                case 'left':
                    if (indexOfCurrentParent > 0) {
                        $target = parent.prevAll('.mapping-data:first').find('.mappy-' + (iteratePopupManager.selectedRowIndex + 1));
                    } else {
                        $target = $(shownMappingColumn[lengthOfShownMappingImage - 1]).find('.mappy-' + (iteratePopupManager.selectedRowIndex + 1));
                    }
                    break;
                case 'right':
                    if (indexOfCurrentParent < lengthOfShownMappingImage - 1) {
                        $target = nextParent.find('.mappy-' + (iteratePopupManager.selectedRowIndex + 1));
                    } else {
                        $target = $(shownMappingColumn[0]).find('.mappy-' + (iteratePopupManager.selectedRowIndex + 1));
                    }
                    break;
                case 'down':
                    nextMappy = selectedMappy.nextAll('.mapping-data:first');
                    if (nextMappy.length !== 0) {
                        $target = nextMappy;
                    } else {
                        $target = $(shownMappingColumn[indexOfCurrentParent]).find('.mappy-1');
                    }
                    break;
            }
            return $target;

        },
        /* updates array of ID of dropdown list  in iterate popup  which should be enable*/
        "updateArrayIdOfIterateDropDownItem": function() {

            var model = this.model,
                $popup, lengthOfMappingImages, idOfIterateDropdownMenuItemToEnable,
                index, iteratePopupManager, isNewImageProduce, curIteration, ctr;
            $popup = this.getPopupContainer();
            iteratePopupManager = model.iteratePopupManager;
            lengthOfMappingImages = $popup.find('.map-image').length;
            idOfIterateDropdownMenuItemToEnable = model.idOfIterateDropdownMenuItemToEnable;
            isNewImageProduce = iteratePopupManager.isIterationProduceNewImage();
            if (this.model.engine._undergoingOperation && this.model.engine._undergoingOperation.relations.length > 0) {
                curIteration = this.model.engine._undergoingOperation.relations[0].offspring;
            }
            //enable or disable iterate button in iterate popup
            $popup.find('.modal-footer .btn-primary')[0].disabled = isNewImageProduce === false;
            // enabale or disable add new map event in iterate popup
            index = idOfIterateDropdownMenuItemToEnable.indexOf('add-new-map');
            if (iteratePopupManager.idOfMappingImages[$popup.find('.map-image').length - 1].length <= 0 || isNewImageProduce === false) {
                if (index !== -1) {
                    idOfIterateDropdownMenuItemToEnable.splice(index, 1);
                }
            } else {
                if (index === -1) {
                    idOfIterateDropdownMenuItemToEnable.push('add-new-map');
                }
            }

            function addOrRemoveId(ConditionToCheck, idToEnable) {
                for (ctr = 0; ctr < idToEnable.length; ctr++) {
                    index = idOfIterateDropdownMenuItemToEnable.indexOf(idToEnable[ctr]);
                    if (ConditionToCheck === true && index === -1) {
                        idOfIterateDropdownMenuItemToEnable.push(idToEnable[ctr]);
                    } else if (ConditionToCheck === false && index !== -1) {
                        idOfIterateDropdownMenuItemToEnable.splice(index, 1);
                    }
                }
            }
            addOrRemoveId(lengthOfMappingImages > 1, ['remove-this-map']);
            //enable or disable all object and non-point images button
            if (curIteration) {
                addOrRemoveId(curIteration.containsShape, ['all-object-images-check', 'non-point-images-check']);
                //enable or disable tabulate iterate values button
                addOrRemoveId(curIteration.hasMeasurement, ['tabulate-iterated-values-check']);
                //enable or disable to-same-relative-location-check and  to-new-random-locations-check  button
                addOrRemoveId(curIteration.containsPOB, ['to-same-relative-location-check', 'to-new-random-locations-check']);
            }
        },
        /* updates text according to  image can be produced or not in data holder div of iterate popup  */
        "updateTextForDataHolderDivInIteratePopup": function(keyCode) {
            var $popup = this.getPopupContainer(),
                iteratePopupManager = this.model.iteratePopupManager,
                depth,
                textMapping = MathUtilities.Tools.Dgt.Models.DgtUiModel.textMapping,
                maxDepth = 4;
            if (keyCode) { //if keycode is defined it means keyboard plus or minus button is pressed for iterateToDepth
                $popup.find('#data-holder').text(textMapping.textForIterateToDepth);
                return;
            }
            if (iteratePopupManager.isIterationProduceNewImage() === true) {
                if (typeof iteratePopupManager.params.depth === 'object') {
                    depth = Math.floor(iteratePopupManager.params.depth.value);
                    depth = depth > maxDepth ? maxDepth : depth;
                    depth = depth < 0 ? 0 : depth;
                    $popup.find('#data-holder').text(textMapping.numberOfIteration + depth);
                } else {
                    $popup.find('#data-holder').text(textMapping.numberOfIteration + iteratePopupManager.params.depth);
                }
            } else {
                $popup.find('#data-holder').text(textMapping.noNewImages);
            }

        },
        /*add new columns of mapping image in iterate popup on clicking 'add new map' drop down button*/
        "_addNewColumnInIterateMapping": function() {
            var mappingImage = '',
                lengthOfArrayOfMappingColumn, idNumber,
                summaryOfHiddenImages,
                shownMapImages, summarizHiddenDiv,
                mappy, mappingImageColumn, i,
                model = this.model,
                iteratePopupManager = model.iteratePopupManager,
                lengthOfSelectedItems = iteratePopupManager.preImageArray.length,
                iteratePopupStructure = MathUtilities.Tools.Dgt.templates.IteratePopupStructure,
                textForQuestionMark = MathUtilities.Tools.Dgt.Models.DgtUiModel.textMapping.questionMark,
                $popup = this.getPopupContainer(),
                arrayOfMappingColumn = $popup.find('.map-image'),
                maxMappingImageToShow = 4;

            summarizHiddenDiv = _.bind(function() {
                var dataInSummaryImage, summaryOfHiddenImagesColumn;
                if (this.model.summaryOfHiddenImages === null) {
                    shownMapImages = $popup.find('.map-image:visible');
                    summaryOfHiddenImages = '[{ "mappy-class": "title"},';
                    this.model.summaryOfHiddenImages = summaryOfHiddenImages;
                    for (i = 0; i < lengthOfSelectedItems; i++) {
                        dataInSummaryImage = '{"data":"...."},';
                        summaryOfHiddenImages = summaryOfHiddenImages + dataInSummaryImage;
                    }
                    summaryOfHiddenImages = summaryOfHiddenImages.substring(0, summaryOfHiddenImages.length - 1) + ']';
                    summaryOfHiddenImages = $.parseJSON(summaryOfHiddenImages);
                    summaryOfHiddenImagesColumn = iteratePopupStructure({
                        "column-id": "summary",
                        "column-class": "image-holder-containers",
                        "mappy": summaryOfHiddenImages
                    });
                    summaryOfHiddenImagesColumn = summaryOfHiddenImagesColumn.trim();
                    $popup.find('#mapping-holder').append(summaryOfHiddenImagesColumn);
                } else {
                    $popup.find('#summary').show();
                }
            }, this);
            lengthOfArrayOfMappingColumn = arrayOfMappingColumn.length;
            if (lengthOfArrayOfMappingColumn > maxMappingImageToShow - 1) {
                $(arrayOfMappingColumn[maxMappingImageToShow - 1]).hide();
                summarizHiddenDiv();
            }
            mappingImage = '[{ "mappy-class": "title"},';
            for (i = 0; i < lengthOfSelectedItems; i++) {
                idNumber = '' + (lengthOfArrayOfMappingColumn + 1) + '' + (i + 1) + '';
                mappy = '{"mappy-class": "mapping-data mappy-' + (i + 1) + '", "mappy-id": "mappy-' + idNumber + '" ,"data":"' + textForQuestionMark + '"},';
                mappingImage = mappingImage + mappy;
            }
            mappingImage = mappingImage.substring(0, mappingImage.length - 1) + ']';
            mappingImage = $.parseJSON(mappingImage);
            mappingImageColumn = iteratePopupStructure({
                "column-id": "column-" + lengthOfArrayOfMappingColumn,
                "column-class": "map-image",
                "mappy": mappingImage
            });
            mappingImageColumn = mappingImageColumn.trim();
            shownMapImages = $popup.find('.map-image:visible');
            if (shownMapImages.length !== 0) {
                $(mappingImageColumn).insertBefore($(shownMapImages[0]));
            } else {
                $popup.find('#mapping-image-container').append(mappingImageColumn);
            }

            this.model.mappingColumnCounter++;
            $popup.show();
            $popup.find('.selected-mappy').removeClass('selected-mappy');
            $popup.find('.map-image:visible').first().find('.mappy-1').addClass('selected-mappy');
            arrayOfMappingColumn = $popup.find('.map-image');
            this._updateHeadingOfIterateMappingImage();
            this._setOrUpdateIdAndTabIndex(true);

            /*Call _setOrUpdateIdAndTabIndex with false as argument to update tab index for all mappy-data*/
            this._setOrUpdateIdAndTabIndex(false);
            $popup.find('.iteration-data.mapping-data, .mappy-focusable-elem').off('click', this._eventListenerForIterateMenuItemFunc)
                .on('click', this._eventListenerForIterateMenuItemFunc);

            iteratePopupManager.idOfMappingImages.push([]);
            this.updateArrayIdOfIterateDropDownItem();
            this._enableAndDisableIterateMenubar(model.idOfIterateDropdownMenuItemToEnable);
            if (arrayOfMappingColumn.length === 2) {
                $popup.find('#non-point-images-check.enable-iteration-menu-item').prop('checked', true);
                this._eventListenerForIterateMenuItem(null, 'non-point-images-check');
            }
            this._updatePositionOfIteratePopup();
            this.attachAccessabilityEvents();
        },
        "_updatePositionOfIteratePopup": function() {
            var $tool,
                $popup = this.getPopupContainer(),
                MAX_NO_OF_MAP_IMAGE_VISIBLE = 4,
                popupLeftOffset,
                toolRightOffset, popupRightOfffset;
            if ($popup.find('.map-image:visible').length < MAX_NO_OF_MAP_IMAGE_VISIBLE) {
                return;
            }
            $tool = this.$el;
            toolRightOffset = $tool.outerWidth() + $tool.offset().left;
            popupLeftOffset = $popup.offset().left;
            popupRightOfffset = $popup.outerWidth() + popupLeftOffset;
            if (popupRightOfffset > toolRightOffset) {
                $popup.css('left', popupLeftOffset - (popupRightOfffset - toolRightOffset));
            }
        },
        "_removeColumnInIterateMapping": function() {
            var $popup, mappingColumnCounter, hiddenMapImage, arrayOfMappingColumn, shownMapImages, index,
                iteratePopupManager;
            $popup = this.getPopupContainer();
            iteratePopupManager = this.model.iteratePopupManager;
            mappingColumnCounter = this.model.mappingColumnCounter;
            index = parseInt($popup.find('.selected-mappy').parent().children().first().text().replace(/[^\d.]/g, ''), 10) - 1;
            if (index > -1) {
                iteratePopupManager.idOfMappingImages.splice(index, 1);
            }
            if (mappingColumnCounter === 2) {
                return;
            }
            $popup.find('.selected-mappy').parent('.map-image').remove();
            this.model.mappingColumnCounter--;
            if (this.model.mappingColumnCounter > 3) {
                hiddenMapImage = $popup.find('.map-image:hidden');
                $popup.find(hiddenMapImage[0]).show();
            }
            this._updateHeadingOfIterateMappingImage();
            this._setOrUpdateIdAndTabIndex();
            shownMapImages = $popup.find('.map-image:visible');
            $(shownMapImages[0]).find('.mappy-1').addClass('selected-mappy');
            arrayOfMappingColumn = $popup.find('.map-image');
            if (arrayOfMappingColumn.length < 5) {
                $popup.find('#summary').hide();
            }
            this.updateArrayIdOfIterateDropDownItem();
            this._enableAndDisableIterateMenubar(this.model.idOfIterateDropdownMenuItemToEnable);
            if (arrayOfMappingColumn.length === 1) {
                $popup.find('#all-object-images-check.enable-iteration-menu-item').prop('checked', 'true');
                this._eventListenerForIterateMenuItem(null, 'all-object-images-check');
            }
            this.model.engine.accManager.setFocus('iterate-note-data'); // giving focus to note data after remove column
            this.attachAccessabilityEvents();
        },
        //for setting the id and Tabindex pass true ,for updating id and tabIndex pass false or nothing
        "_setOrUpdateIdAndTabIndex": function(set) {
            var $popup = this.getPopupContainer(),
                model = this.model,
                textForQuestionMark = MathUtilities.Tools.Dgt.Models.DgtUiModel.textMapping.questionMark,
                idOfMappingColumn, idOfMappy,
                accManager = model.engine.accManager,
                arrayOfMappy,
                arrayOfMappingColumn,
                lengthOfArrayOfMappingColumn,
                $mappyFocusElem = null;
            if (set) {
                arrayOfMappingColumn = $popup.find('.map-image').first();
            } else {
                arrayOfMappingColumn = $popup.find('.map-image');
            }
            lengthOfArrayOfMappingColumn = $popup.find('.map-image').length;
            $.each(arrayOfMappingColumn, function(index, value) {
                if (accManager) {
                    if (set) {
                        idOfMappingColumn = 'column-' + lengthOfArrayOfMappingColumn + '';
                        $(this).prop('id', idOfMappingColumn);

                        $(this).addClass('parent-container');
                        accManager.createAccDiv({
                            "elementId": idOfMappingColumn,
                            "tabIndex": model.startingTabIndex,
                            "loc": "",
                            "acc": accManager.getAccMessage('iterate-map-text', 0)
                        });


                    } else {
                        accManager.setTabIndex($(this).attr('id'), model.startingTabIndex);
                    }
                    model.startingTabIndex++;
                }
                arrayOfMappy = $(this).find('.mapping-data');
                $.each(arrayOfMappy, function(index, value) {
                    if (accManager) {
                        if (set) {
                            idOfMappy = 'mappy-' + lengthOfArrayOfMappingColumn + (index + 1);
                            $(this).prop('id', idOfMappy);

                            $(this).addClass('acc-label').text('');
                            accManager.createAccDiv({
                                "elementId": idOfMappy,
                                "loc": textForQuestionMark
                            });
                            $mappyFocusElem = $('<div>');
                            $mappyFocusElem.attr({
                                "id": idOfMappy + '-focusable',
                                "class": "mappy-focusable-elem acc-label",
                                "data-mappy-id": idOfMappy
                            });
                            $mappyFocusElem.insertBefore($(this));
                            accManager.createAccDiv({
                                "elementId": $mappyFocusElem.attr("id"),
                                "tabIndex": model.startingTabIndex

                            });

                        } else {
                            accManager.setTabIndex($(this).attr('id') + '-focusable', model.startingTabIndex);
                        }
                        model.startingTabIndex++;
                    }
                });
                lengthOfArrayOfMappingColumn--;
            });

            this.disableIterateColmn();

        },

        "disableIterateColmn": function($column) {
            var $popup = this.getPopupContainer(),
                $focusableElem,
                accManager = this.model.engine.accManager;

            $column = $column || $popup.find('.map-image');
            $focusableElem = $column.find(".mappy-focusable-elem");

            $.each($focusableElem, function() {
                accManager.enableTab($(this).attr("id"), false);
            });
        },

        "_updateHeadingOfIterateMappingImage": function() {

            var $popup, arrayOfMappingColumn, i,
                textMapping, replaceWord, textForTitleMap1, hiddenMapImage, textForFirstImage,
                lengthInStringForm;
            textMapping = MathUtilities.Tools.Dgt.Models.DgtUiModel.textMapping;
            replaceWord = MathUtilities.Components.Utils.Models.Utils.replaceWords;
            textForTitleMap1 = replaceWord(textMapping.titleForIterateMappingColumn, '1');
            textForFirstImage = textMapping.firstImage;
            $popup = this.getPopupContainer();
            hiddenMapImage = $popup.find('.map-image:hidden');
            arrayOfMappingColumn = $popup.find('.map-image');

            for (i = 0; i < arrayOfMappingColumn.length; i++) {
                lengthInStringForm = (arrayOfMappingColumn.length - i).toString();
                if (arrayOfMappingColumn.length === 1) {
                    $(arrayOfMappingColumn[0]).find('.title').text(textForFirstImage);
                    return;
                }
                $(arrayOfMappingColumn[i]).find('.title').text(replaceWord(textMapping.titleForIterateMappingColumn, lengthInStringForm));

            }
            if (hiddenMapImage.length > 1) {
                $popup.find('#summary .iteration-data.title').text(textForTitleMap1 + '-' + hiddenMapImage.length);
            } else {
                $popup.find('#summary .iteration-data.title').text(textForTitleMap1);
            }
        },

        "_enableAndDisableIterateMenubar": function(arrayOfIdToEnable) {
            var i, $popup, id, allButtons,
                lengthOfidToEnable = arrayOfIdToEnable.length,
                allDropDownItemsOfIterate;
            $popup = this.getPopupContainer();
            allDropDownItemsOfIterate = $popup.find('#button-holder label');
            allButtons = $popup.find('#button-data-container #button-holder .dropdown li input');
            for (i = 0; i < allDropDownItemsOfIterate.length; i++) {
                $(allDropDownItemsOfIterate[i]).off('click', this._eventListenerForIterateMenuItemFunc);
            }
            for (i = 0; i < allButtons.length; i++) {
                allButtons[i].disabled = true;
            }

            $popup.find('.enable-iteration-menu-item').removeClass('enable-iteration-menu-item');
            for (i = 0; i < lengthOfidToEnable; i++) {
                id = arrayOfIdToEnable[i];
                $popup.find('#' + id).addClass('enable-iteration-menu-item').off('click', this._eventListenerForIterateMenuItemFunc)
                    .on('click', this._eventListenerForIterateMenuItemFunc);
                $popup.find('#' + id).siblings('label').addClass('enable-iteration-menu-item').off('click', this.eventListenerForAccDivs)
                    .on('click', this.eventListenerForAccDivs);
                $popup.find('#' + id)[0].disabled = false;
            }
            if (this.model.curPopupShown) {
                this.enableDisableIterateToggleBtn(this.model.idOfIterateDropdownMenuItemToEnable);
            }
        },
        "eventListenerForAccDivs": function(event) {
            var caseForTargetEvent = $(event.currentTarget).attr('id'),
                targetDiv = caseForTargetEvent.replace('label-', '');
            $('#' + targetDiv).trigger('click');

        },
        "enableDisableIterateToggleBtn": function(arrayOfIdToEnable) {
            if (!arrayOfIdToEnable || ['iterate', 'iterateToDepth'].indexOf(this.model.directive) === -1) {
                return;
            }
            var toggleOption = {
                    "dropdown-menu2": ['add-new-map', 'remove-this-map', 'label-all-object-images-check',
                        'label-non-point-images-check', 'label-tabulate-iterated-values-check',
                        'label-to-same-relative-location-check', 'label-to-new-random-locations-check'
                    ]
                },
                option, dropDownIds, isEnable = false,
                accManager = this.model.engine.accManager,
                iLooper;
            for (option in toggleOption) {
                isEnable = false;
                dropDownIds = toggleOption[option];
                for (iLooper = 0; iLooper < dropDownIds.length; iLooper++) {
                    if (arrayOfIdToEnable.indexOf(dropDownIds[iLooper]) > -1 || arrayOfIdToEnable.indexOf(dropDownIds[iLooper].replace('label-', '')) > -1) {
                        accManager.enableTab(dropDownIds[iLooper], true);
                        isEnable = true;
                    } else {
                        accManager.enableTab(dropDownIds[iLooper], false);
                    }
                }
                accManager.enableTab(option, isEnable);
            }
        },
        "setExampleString": function() {
            var firstLabel = $('#first-selected-label').val(),
                nextLabel, exampleString, loopVar,
                isAlphaNum = firstLabel.match(/[A-Za-z0-9]+$/),
                accManager = this.model.engine.accManager;
            if (firstLabel.trim() === '') {
                this.model.$propertiesPopup.find('.multiple-selected-object-properties').text('');
                return;
            }
            if (isAlphaNum) {
                exampleString = accManager.getMessage('example-string', 0) + firstLabel + ', ';
            } else {
                exampleString = accManager.getMessage('example-string', 0);
            }
            for (loopVar = 0; loopVar < 4; loopVar++) {
                nextLabel = this.model.engine.getNextLabel(firstLabel, false);
                exampleString += nextLabel[0];
                firstLabel = nextLabel[0];
                if (loopVar !== 3) {
                    exampleString += ', ';
                } else {
                    exampleString += '... ';
                }
            }
            this.model.$propertiesPopup.find('.multiple-selected-object-properties').text(exampleString);
        },

        "enableDisableRadio": function() {

            var $popup = this.getPopupContainer();

            $popup.find('.btn-primary').prop('disabled', $popup.find('#first-selected-label').val().trim() === '');
        },

        "setParameterNameAndValue": function() {
            this.model.$parameterPopup.find('#param-name-input').val('t' + this.model.engine.parameterCount);
            this.model.$parameterPopup.find('#param-value-input').val('1.00');
        },
        "hideErrorMessage": function(event) {
            var model = this.model,
                $popup = this.getPopupContainer(model.directive),
                $inputField, charCode;

            if (typeof event !== 'undefined') {
                charCode = event.charCode || event.which || event.keyCode;
                $inputField = $(event.target);

                if ($inputField.val().length === 0 && charCode === MathUtilities.Tools.Dgt.Models.MathInput.CHARCODE_BACKSPACE) {
                    return;
                }

                $inputField.off('keydown', this.hideErrorMessageFunc);
            }
            $popup.find('.error-msg').hide();
            if (model.engine.accManager) {
                model.engine.accManager.enableTab($popup.find('.error-msg-container').prop('id'), false);
            }
        },
        "_enableErrorMessageBox": function() {
            var id = this.getPopupContainer().find('.error-msg-container').prop('id'),
                accManager = this.model.engine.accManager;
            accManager.enableTab(id, true);
            accManager.updateFocusRect(id);
            accManager.setFocus(id);
        },

        "showErrorMessage": function(directive) {
            var loopVar, curInputs, textMapping = MathUtilities.Tools.Dgt.Models.DgtUiModel.textMapping,
                $popup = this.getPopupContainer();
            curInputs = $popup.find('input:text:visible');
            if (['translate', 'rotate', 'dilate'].indexOf(directive) > -1) {
                for (loopVar = 0; loopVar < curInputs.length; loopVar++) {
                    if ($(curInputs[loopVar]).val() === '') {
                        $popup.find('.empty-error-param-container').show().text(textMapping.emptyTranslationValue);
                        this._enableErrorMessageBox();
                        $(curInputs[loopVar]).off('keydown', this.hideErrorMessageFunc)
                            .on('keydown', this.hideErrorMessageFunc);
                        return true;
                    }
                    if (!/\d/.test($(curInputs[loopVar]).val())) {
                        $popup.find('.empty-error-param-container').show().text(textMapping.nonNumericTranslationValue);
                        this._enableErrorMessageBox();
                        $(curInputs[loopVar]).off('keydown', this.hideErrorMessageFunc)
                            .on('keydown', this.hideErrorMessageFunc);
                        return true;
                    }
                    if (directive === 'dilate' && parseFloat($(curInputs[loopVar]).val()) === 0) {
                        if (loopVar === 0) {
                            $popup.find('.empty-error-param-container').show().text(textMapping.canNotDilateZeroValue);
                            this._enableErrorMessageBox();
                        } else if (loopVar === 1) {
                            $popup.find('.empty-error-param-container').show().text(textMapping.canNotDilateInfiniteValue);
                            this._enableErrorMessageBox();
                        }
                        $(curInputs[loopVar]).off('keydown', this.hideErrorMessageFunc)
                            .on('keydown', this.hideErrorMessageFunc);
                        return true;
                    }

                }
            }
        },
        "bootstrapPopupOkClicked": function() {
            if (this.model.engine.accessibilityView.eventsForPopup) {
                return;
            }
            var model = this.model,
                $popup = this.getPopupContainer(model.directive),
                $label, $value,
                directive = $popup.attr('data-directive'),
                params = {},
                dgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                paramPopupTitle, newLabel, newValue,
                curInputs = $popup.find('input:text:visible'),
                precision, tempDepth,
                operationType, hideObjects = false,
                closePopup = true,
                calculationDetails, isEditCalculation,
                iteratePopupManager = this.model.iteratePopupManager,
                $properyBarHolder, $newMathInputField;

            if (directive === 'small-image-crop') {
                $properyBarHolder = this.model.engine.dgtUI.$('.dgt-properties-bar');
                $properyBarHolder.find('.crop-options .image-btn-highlighter').removeClass('selected');
                $popup.modal('hide');
            }

            if (directive === 'beta-functionality') {
                $popup.modal('hide');
                return;
            }

            this._changeDefaultPopUpValues();

            switch (directive) {
                case 'translate':
                case 'rotate':
                case 'dilate':
                    if (this.showErrorMessage(directive)) {
                        return;
                    }
                    break;
                case 'parameter':
                    $label = $popup.find('#param-name-input');
                    $value = $popup.find('#param-value-input');
                    newLabel = ($label.val()).trim();

                    if (!/\d/.test($value.val()) || newLabel === "") {
                        $popup.find('.error-msg').show();
                        this.model.engine.accManager.setFocus($popup.find('.error-msg').attr('id'));
                        $value.off('keydown', this.hideErrorMessageFunc)
                            .on('keydown', this.hideErrorMessageFunc);
                        $label.off('keydown', this.hideErrorMessageFunc)
                            .on('keydown', this.hideErrorMessageFunc);
                        return;
                    }

                    $popup.find('.error-msg').hide();
                    /*
                        For code Review:

                        We had to use eval and try catch because our parser supports a very large set of mathematical expressions while we needed a very small set of it. One more reason we cant use equation parser cause it cant support 1/2 we have to passs it the latex.

                        Naturally when we get an invalid expression for eval we have to catch it to avoid a JS error in console. Thus we use eval and try catch in this rare case.

                        */
                    /*eslint-disable no-eval*/
                    try {
                        newValue = eval($value.val());
                        if (isNaN(newValue) || !isFinite(newValue)) {
                            throw 'newValue';
                        }
                        newValue = newValue.toString().trim();
                    } catch (errorMsg) {
                        $popup.find('.error-msg').show();
                        $value.off('keydown', this.hideErrorMessageFunc)
                            .on('keydown', this.hideErrorMessageFunc);
                        $label.off('keydown', this.hideErrorMessageFunc)
                            .on('keydown', this.hideErrorMessageFunc);
                        return;
                    }
                    /* Hidden or shown error message on keydown for parameter popup*/
                    /*eslint-enable no-eval */

                    paramPopupTitle = this.model.paramPopupData[directive].title;
                    if (paramPopupTitle === 'Edit Parameter Value') {
                        this.model.engine.editMeasurement({
                            "label": newLabel,
                            "value": newValue
                        });
                    } else {
                        if ($popup.find('#param-name-input').val() === 't' + this.model.engine.parameterCount || $popup.find('#param-name-input').val().trim() === '') {
                            this.model.engine.parameterCount++;
                        }

                        this.model.engine.perform(directive, {
                            "label": newLabel,
                            "value": newValue
                        });

                    }
                    break;

                case 'properties':
                    this.propertiesPopupOkClicked();

                    if ($popup.find('#hidden').is(":checked")) {
                        hideObjects = true;
                    }
                    model.engine.accManager.setFocus('point-highlighter', 10); // 10 is delay.
                    break;

                case 'calculator':
                    isEditCalculation = this.model.engine.dgtCalculatorManager.isReopenedCalculation;
                    calculationDetails = this.model.engine.dgtCalculatorManager.onCalculationComplete();

                    if (calculationDetails && !isEditCalculation) {
                        this.model.engine.perform('calculation', calculationDetails);
                    } else if (calculationDetails && isEditCalculation === true) {
                        this.model.engine.editMeasurement(calculationDetails);
                    } else {
                        closePopup = false;
                        $popup.find('.error-msg').show();
                        this._enableErrorMessageBox();
                        $newMathInputField = $popup.find('.calculator-math-input');
                        $newMathInputField.off('keydown', this.hideErrorMessageFunc)
                            .on('keydown', this.hideErrorMessageFunc);
                        /*......give error msg at proper position in calculator */
                    }
                    break;

                case 'iterate':
                case 'iterateToDepth':
                    this.model.engine.selectionSteal = null;

                    iteratePopupManager.params.previewMode = false;
                    iteratePopupManager.params.forceRedraw = false;
                    params = iteratePopupManager.params;
                    tempDepth = params.depth;
                    params.depth = null;
                    params = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(params); // Because we cannot serialize HTML elements
                    params.depth = tempDepth;
                    this.model.engine._undergoingOperation.updateOperationParams(params);

                    iteratePopupManager.deselectAll();
                    this.model.engine._undergoingOperation._operationFinished();
                    break;
            }
            precision = $popup.find('#precision').val();
            if (precision) {
                this.model.engine.changePrecision(precision);
            }

            if (closePopup) {
                model.isOkClicked = true;
                $popup.modal('hide');
                operationType = dgtOperation.getOperationType(directive);
                if (operationType === 'transform') {
                    if (model.engine._undergoingOperation) {
                        model.engine._undergoingOperation._operationFinished();
                    }
                    if (!dgtOperation.getOperationType(this.model.lastDirective)) {
                        this.model.engine.perform('selectCursor');
                    }

                } else if (operationType === 'resetBoard') {
                    this.model.engine.perform('resetBoard', {});
                }
                curInputs.blur();
            }
            if (hideObjects === true) {
                this.model.engine.showHideObjects('hideObjects');
            }
        },

        "propertiesPopupOkClicked": function() {
            var model = this.model,
                $popup = this.getPopupContainer(model.directive),
                params,
                engine = model.engine,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                input1 = ($popup.find('#selected-label').val()).trim(),
                loopVar, blankNoNameCase = false,
                selected = engine.selected,
                precision, undoData = {},
                redoData = {},
                objectId, selectedObject, changedParams,
                labelType = $popup.find('input:radio[name="value-display-with"]:checked').attr('id'),
                forObject = $popup.attr('data-for-object');
            if (['measurement', 'parameter'].indexOf(forObject) > -1) {
                this.model.engine.selected[0].changeLabelType(labelType);

                if (input1 === '' && labelType === 'current-label' || labelType === 'no-name' && !selected[0].properties.labelText) {
                    engine.updateCustomMeasurementLabel(forObject);
                } else {
                    engine.assignCustomName(input1, labelType);
                }
                precision = $popup.find('#precision').val();
                if (precision) {
                    engine.changePrecision(precision);
                }
            } else if (['tickMark', 'angleMark'].indexOf(forObject) > -1) {
                params = this.fetchParamsFromPopup(this.model.directive);
                selectedObject = engine.selected[0];
                objectId = selectedObject.id;
                changedParams = this.changedParamsOfNotation(params);

                if (!jQuery.isEmptyObject(changedParams)) {
                    undoData.id = redoData.id = objectId;
                    undoData.params = selectedObject.creator._getParamData();
                    redoData.params = changedParams;

                    model.engine.execute('redrawNotation', {
                        "undo": {
                            "actionType": 'delete',
                            "undoData": undoData
                        },
                        "redo": {
                            "actionType": 'draw',
                            "redoData": redoData
                        }
                    });

                    this.changeDefaultMarkerParams(selectedObject.species, changedParams);
                    selectedObject.changeParams(changedParams);
                }
                if (input1) {
                    engine.assignCustomName(input1, labelType);
                }
            } else {
                if (forObject === 'multiple') {
                    input1 = ($popup.find('#first-selected-label').val()).trim();
                    for (loopVar = 0; loopVar < selected.length; loopVar++) {
                        if (selected[loopVar].division === 'measurement') {
                            selected[loopVar].changeLabelType('current-label');
                        }
                    }
                    if (selected[0].division === 'measurement' && input1 === 'm' + (DgtEngine.measurementCustomLabelCount.nonParameterCount + 1)) {
                        for (loopVar = 0; loopVar < selected.length; loopVar++) {
                            if (selected[loopVar].division === 'measurement') {
                                DgtEngine.measurementCustomLabelCount.nonParameterCount++;
                            }
                        }
                    }

                }
                if (input1 === '' && labelType === 'no-name') {
                    engine.perform('showHideLabels', {
                        "visibility": false
                    });
                    blankNoNameCase = true;
                } else {
                    engine.assignCustomName(input1, labelType);
                }
            }

            if (forObject === 'multiple') {
                engine.perform('showHideLabels', {
                    "visibility": ($popup.find('#show-labels-for-all-objects')).is(':checked')
                });
            } else if (blankNoNameCase === false) {
                engine.perform('showHideLabels', {
                    "visibility": ($popup.find('#show-hide-label')).is(':checked')
                });
            }
        },
        "onCalculationPopupStateChange": function() {
            this.model.engine.trigger('calculator-state-change');
        },
        "bootstrapPopupCancelClicked": function() {
            this._changeDefaultPopUpValues();
        },

        "_changeDefaultPopUpValues": function() {

            var model = this.model,
                key = null,
                dgtUI = model.engine.dgtUI,
                $popup = this.getPopupContainer(model.directive),
                directive = $popup.attr('data-directive'),
                paramPopupData = model.paramPopupData[directive],
                loopVar,
                curInputs, $curText;

            curInputs = $popup.find('input:text:visible');
            //......reset default values of cancel click for properties.
            for (loopVar = 0; loopVar < curInputs.length; loopVar++) {
                $curText = $(curInputs[loopVar]);
                if ($curText.val() !== '') {
                    for (key in paramPopupData.defaultValues) {
                        if ($curText.hasClass(key) && !isNaN(parseFloat($curText.val()))) {
                            if ($curText.val().toString().indexOf('.') === -1 || $curText.val() === paramPopupData.defaultValues[key]) {
                                paramPopupData.defaultValues[key] = parseFloat($curText.val()).toFixed(1);
                            } else {
                                paramPopupData.defaultValues[key] = parseFloat($curText.val()).toString();
                            }
                        }
                    }

                }
            }
            $popup.off('keydown', $.proxy(dgtUI.keyDownEvents, dgtUI));
        },
        "addMeasurementToCalculator": function(measurement, event) {
            var $popup = this.getPopupContainer(this.model.directive);
            this.model.engine.dgtCalculatorManager.addMeasurementToCalculator(measurement, event);
            if ($popup.find('.error-msg').is(':visible')) {
                this.hideErrorMessage();
            }
        },

        "_checkNumericInput": function(e) {
            var charCode = e.which || e.charCode,
                $target = $(e.target);

            return this._keyPressHandler(charCode, e.keyCode, $target, $target.get(0).selectionStart);
        },

        "_checkNumericInputOnKeyUp": function(e) {
            var $target = $(e.target),
                keyCode = e.which || e.keyCode || e.charCode,
                targetVal = $target.val(),
                regex = /^[0-9.-]+$/,
                $popup = this.getPopupContainer(this.model.directive);

            if (keyCode === 13) {
                $popup.find('.btn-primary').trigger('click');
            } else if (keyCode === 27) {
                $popup.find('.btn-cancel').trigger('click');
            }

            if (targetVal === '' || regex.test(targetVal) && targetVal.length - targetVal.replace(/\./g, '').length <= 1 &&
                targetVal.length - targetVal.replace(/\-/g, '').length <= 1 && targetVal.indexOf('-') <= 0) {
                geomFunctions.traceConsole('key...return true');
                return true;
            }
            $target.val(this.model.inputLastVal);
        },

        "_checkNumericInputPaste": function(e) {
            var clipboardData = e.clipboardData || e.originalEvent.clipboardData,
                regex = /^[0-9.-]+$/;

            if (typeof clipboardData !== 'undefined') {
                clipboardData = clipboardData.getData('text/plain');
            } else {
                e.view.clipboardData.getData('text');
            }

            if (regex.test(clipboardData) && clipboardData.length - clipboardData.replace(/\./g, '').length <= 1 && clipboardData.length - clipboardData.replace(/\-/g, '').length <= 1 && clipboardData.indexOf('-') <= 0) {
                return true;
            }
            e.preventDefault();
        },

        "_keyPressHandler": function(charCode, keyCode, selector, cursorPos) {
            var val = null,
                regexInput = /^(\+|-)?(\d{1,})?([\.]\d{1,})?$/, // Search real numbers
                regexdecimal = /^(\+|-)?(\d{1,})?[\.]$/, // For significand
                curSelection = this._getSelectionText();

            val = $(selector).val();

            if (curSelection.length > 0) {
                val = val.substring(0, cursorPos) + String.fromCharCode(charCode) + val.substr(cursorPos + curSelection.length, val.length);
            }
            // For binding the keypress value to the current input's value.
            // For key press event other than backspace press.
            else if (charCode !== 8) {
                val = val.substring(0, cursorPos) + String.fromCharCode(charCode) + val.substring(cursorPos, val.length);
            }
            // Backspace press event.
            else if (charCode === 8) {
                val = val.substring(0, cursorPos - 1) + val.substring(cursorPos, val.length);
            }
            // Delete button press event.
            else if (keyCode === 46) {
                val = val.substring(0, cursorPos) + val.substring(cursorPos + 1, val.length);
            }

            // Check for selecting entire input data.
            if ($(selector).val() === curSelection && (charCode === 45 || charCode === 43 || charCode === 46)) {
                return true;
            }

            // Checks input box value's with the regex OR the first key down.
            if (regexInput.test(val) || $(selector).val() === '' && (charCode === 45 || charCode === 43 || charCode === 46)) {
                return true;
            }
            // Check for second key press (must not be '+'|'-'|'.' if already present, only numbers)
            if (($(selector).val() === '+' || $(selector).val() === '-') && (charCode > 48 && charCode < 57)) {
                return cursorPos !== 0;
            }
            // Check for '.' decimal point.
            if ($(selector).val().indexOf('.') < 0 && charCode === 46) {
                return true;
            }
            // Check for '+', '-' & number entering before '.' .
            if (cursorPos <= $(selector).val().indexOf('.') && (charCode !== 8 && charCode !== 0)) {
                return regexdecimal.test(val);
            }
            // Return false for any char other than direction and backspace.
            if (charCode !== 8 && charCode !== 0) {
                return false;
            }
        },

        /**
         *_get selected text
         *@method _getSelectionText
         */
        "_getSelectionText": function() {
            var actualValue = "",
                text = "",
                selRange = null,
                range = null;

            if (window.getSelection) { // all browsers, except IE
                if (document.activeElement &&
                    (document.activeElement.tagName.toLowerCase() === "textarea" ||
                        document.activeElement.tagName.toLowerCase() === "input")) {
                    actualValue = document.activeElement.value;
                    text = actualValue.substring(document.activeElement.selectionStart,
                        document.activeElement.selectionEnd);
                } else {
                    selRange = window.getSelection();
                    if (selRange) {
                        text = selRange.toString();
                    }
                }
            } else {
                if (document.selection.createRange) { // Internet Explorer
                    range = document.selection.createRange();
                    if (range) {
                        text = range.text;
                    }
                }
            }

            return text;
        },

        "setEngine": function(engine) {
            this.model.engine = engine;
        },

        "getPopupStates": function() {
            var paramPopupData, loopVar, transformationOptions = ['translate', 'rotate', 'dilate'],
                keys, popupValusState = {},
                curTransformationValues, curTransformation;

            paramPopupData = this.model.paramPopupData;
            for (loopVar = 0; loopVar < transformationOptions.length; loopVar++) {
                curTransformation = transformationOptions[loopVar];
                curTransformationValues = paramPopupData[curTransformation].defaultValues;
                popupValusState[curTransformation] = {};
                for (keys in curTransformationValues) {
                    popupValusState[curTransformation][keys] = curTransformationValues[keys];
                }
            }

            popupValusState.translate.selectedVector = this.model.$transformationPopup.find('.translate-param-container .vector-selection-holder .radio-button:checked').attr('id');

            return popupValusState;
        },

        "resetTextFields": function() {
            var paramPopupData = this.model.paramPopupData,
                defaultValuesForOptions = this.model.defaultValuesForOptions,
                keys, eachValue, currentDefaultValues, transformationDefaultVeluesToSet;

            for (keys in defaultValuesForOptions) {
                currentDefaultValues = defaultValuesForOptions[keys];
                transformationDefaultVeluesToSet = paramPopupData[keys].defaultValues;
                for (eachValue in currentDefaultValues) {
                    transformationDefaultVeluesToSet[eachValue] = currentDefaultValues[eachValue];
                }
            }
            this.model.lastSelectedVector = null;
            this.model.$transformationPopup.find('.translate-param-container .vector-selection-holder .radio-button').prop('checked', false);
            this.model.$transformationPopup.find('.translate-param-container .vector-selection-holder .radio-button#cartesian').prop('checked', true);
        },

        "restorePopupDefaultValues": function(defaultValuesToRestore) {

            var paramPopupData = this.model.paramPopupData,
                keys, curTransformation, eachValue, curTransformationDefaultValue;

            for (keys in defaultValuesToRestore) {
                curTransformationDefaultValue = defaultValuesToRestore[keys];
                curTransformation = paramPopupData[keys].defaultValues;
                for (eachValue in curTransformation) {
                    curTransformation[eachValue] = curTransformationDefaultValue[eachValue];
                }
            }

            this.model.$transformationPopup.find('.translate-param-container .vector-selection-holder .radio-button').prop('checked', false);
            this.model.$transformationPopup.find('.translate-param-container .vector-selection-holder .radio-button#' + defaultValuesToRestore.translate.selectedVector).prop('checked', true);
        },

        "resetMarkerParams": function() {
            var model = this.model,
                dgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;

            model.valuesForNotation = dgtEngine.cloneObject(model.defaultValuesForNotation);
        },

        "changeDefaultMarkerParams": function(notationObjectSpecie, params) {
            var model = this.model,
                key;

            for (key in params) {
                model.valuesForNotation[notationObjectSpecie][key] = params[key];
            }
        },

        "changedParamsOfNotation": function(changedParams) {
            var key, selectedEntity = this.model.engine.selected[0],
                creator = selectedEntity.creator,
                params = creator._params,
                newParams = {};

            for (key in changedParams) {
                if (params[key] !== changedParams[key]) {
                    newParams[key] = changedParams[key];
                }
            }
            return newParams;
        }
    }, { //Static
        "thicknessValue": {
            "0": 1.5,
            "1": 3,
            "2": 4,
            "3": 5
        }

    });
})(window.MathUtilities);
