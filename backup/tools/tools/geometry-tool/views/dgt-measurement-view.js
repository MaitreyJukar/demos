/* globals _, $, window, geomFunctions  */
(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Views.DgtMeasurement = Backbone.View.extend({

        "value": null,
        "equation": null,
        "bannerText": null,
        "_paperScope": null,
        "initialize": function() {
            this.generateFunctionReference();
            this.render();
        },
        "generateFunctionReference": function() {
            this.setParameterPopupFunc = _.bind(this.setParameterPopup, this);
            this.passInputReferenceToCalculatorFunc = _.bind(this.passInputReferenceToCalculator, this);
            this.onBannerDragStartFunc = _.bind(this.onBannerDragStart, this);
            this.onBannerDragStopFunc = _.bind(this.onBannerDragStop, this);
            this.updateBannerLabelFunc = _.bind(this.updateBannerLabel, this);
            this.updateBannerValueFunc = _.bind(this.updateBannerValue, this);
            this.changeBannerStyleFunc = _.bind(this.changeBannerStyle, this);
            this.setBannerPositionFunc = _.bind(this.setBannerPosition, this);
            this.removeBannerFunc = _.bind(this.removeBanner, this);
            this.postRenderCallbackFunc = _.bind(this.postRenderCallback, this);
            this.showHideMeasurementFunc = _.bind(this.showHideMeasurement, this);
            this.changeMeasurementBindingsFunc = _.bind(this.changeMeasurementBindings, this);
            this.updateContainmentSizeFunc = _.bind(this.updateContainmentSize, this);
            this._updateIterateTableFunc = _.bind(this._updateIterateTable, this);
            this.onMeasurementRollOverFunc = _.bind(this.onMeasurementRollOver, this);
            this.onMeasurementRollOutFunc = _.bind(this.onMeasurementRollOut, this);
            this.changeCssMouseOverFunc = _.bind(this.changeCssMouseOver, this);
            this.changeCssMouseLeaveFunc = _.bind(this.changeCssMouseLeave, this);
            this.addMeasureToCalcFunc = _.bind(this.addMeasureToCalc, this);
        },

        "render": function() {
            var measure,
                $currentMeasure, dgtUI;
            measure = MathUtilities.Tools.Dgt.templates.Measurement({
                "id": this.model.id,
                "type-iterate": this.model.species === 'measureIteration',
                "type-parameter": this.model.species === 'parameter'
            });
            this.model.$measureView = $(measure);
            $currentMeasure = this.model.$measureView;
            $currentMeasure.attr('locked', false);
            if (!this.model.creator || this.model.creator && !this.model.creator._universe) {
                this.model.engine.dgtUI.$('#dgt-measurements').append(this.model.$measureView);
                this.setBannerPosition();
                this.setBannerUnit();
            }

            if ('ontouchstart' in window) {
                $.support.touch = true;
                $.fn.EnableTouch('.dgt-measurement');
            }
            if (this.model.species === 'parameter') {
                $currentMeasure.draggable();
                this.updateContainment($currentMeasure);
                $currentMeasure.find('.dgt-measurement').on('click', {
                        "targetObj": this.model
                    }, this.onMeasurementLabelClick)
                    .on('mousedown', {
                        "targetObj": this.model
                    }, this.onMeasurementLabelDown)
                    .on('dblclick', this.setParameterPopupFunc);
            } else {
                this.updateContainment($currentMeasure);
                $currentMeasure.on('click', {
                    "targetObj": this.model
                }, this.onMeasurementLabelClick);
                $currentMeasure.on('mousedown', {
                    "targetObj": this.model
                }, this.onMeasurementLabelDown);
            }
            $currentMeasure.on('mouseup', {
                "targetObj": this.model
            }, this.onMeasurementLabelUp);
            if (this.model.species === 'calculation') {
                $currentMeasure.on('dblclick', this.passInputReferenceToCalculatorFunc);
            }
            $currentMeasure.on('dragstart', this.onBannerDragStartFunc);
            $currentMeasure.on('dragstop', this.onBannerDragStopFunc);


            this.model.on('update-banner-label', this.updateBannerLabelFunc)
                .on('update-banner-value', this.updateBannerValueFunc)
                .on('change-style', this.changeBannerStyleFunc)
                .on('relocated', this.setBannerPositionFunc)
                .on('remove-banner', this.removeBannerFunc)
                .on('MathjaxPostRenderCall', this.postRenderCallbackFunc)
                .on('show-hide-measurement', this.showHideMeasurementFunc)
                .on('change-bindings', this.changeMeasurementBindingsFunc)
                .on('update-containment-size', this.updateContainmentSizeFunc)
                .on('update-iteration-table', this._updateIterateTableFunc);

            this.changeMeasurementBindings();
            dgtUI = this.model.engine.dgtUI;
            if (['iterate', 'iterateToDepth', 'properties', 'calculator'].indexOf(dgtUI.model.dgtPopUpView.model.curPopupShown) > -1) {
                dgtUI.disableOrEnableDragingOfMeasurementDivs(true);
            }
        },

        "updateContainmentSize": function() {
            var $currentMeasure = this.model.$measureView;

            this.updateContainment($currentMeasure);
        },

        "changeMeasurementBindings": function() {

            var $currentMeasure = this.model.$measureView,
                popUpViewModel;
            $currentMeasure.off('mouseover', this.onMeasurementRollOverFunc).on('mouseover', this.onMeasurementRollOverFunc)
                .off('mouseleave', this.onMeasurementRollOutFunc).on('mouseleave', this.onMeasurementRollOutFunc);
            popUpViewModel = this.model.engine.dgtUI.model.dgtPopUpView.model;
            if (popUpViewModel.curPopupShown === 'calculator' || popUpViewModel.curPopupShown === 'properties' || popUpViewModel.curPopupShown === 'iterate') {

                $currentMeasure.on('mouseover', this.changeCssMouseOverFunc) //For Calculation.
                    .on('mouseleave', this.changeCssMouseLeaveFunc); //For Calculation.
            } else {

                $currentMeasure.off('mouseover', this.changeCssMouseOverFunc) //For Calculation.
                    .off('mouseleave', this.changeCssMouseLeaveFunc) //For Calculation.
                    .off('mousedown', this.addMeasureToCalcFunc)
                    .find('.dgt-measurement-value').prop('disabled', false); // when prop popup closed.
                if (this.model.species === 'parameter') {
                    $currentMeasure.addClass('parameter');

                }

            }
        },
        "onMeasurementRollOver": function() {
            if ($(this).hasClass('measureContainer')) {
                if ($(this).hasClass('parameter')) {
                    MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'shape', 'deselect', 'parameter');

                } else {
                    MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'shape', 'deselect', 'measurement');
                }
            } else {
                if ($(this).hasClass('parameter')) {
                    MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'shape', 'deselect', 'parameter');

                } else {
                    MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'shape', 'select', 'measurement');
                }
            }
        },
        "onMeasurementRollOut": function() {
            if (this.model.engine.selected.length > 0) {
                MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'grid', this.model.engine.selected.length);
            } else {
                MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'leave');
            }
        },
        "changePropertiesPopup": function() {
            this.model.engine.changePropertiesPopup(this.model);
        },
        //......IF calculator is open unbind the normal click double click events.
        //......when calculator is closed again on those events.
        "changeCssMouseOver": function() {
            var model = this.model,
                measure = this.model.$measureView,
                engine = model.engine;
            //......add the variable that will say that measurement can be taken as the input
            if (engine.editableMeasurementId === model.id) {
                return;
            }
            if (!this.model.isMeasurementAttribute()) { /*&& some variable that says measure can be taken as input*/
                if ('ontouchstart' in window === false) { //Not a touch device
                    measure.addClass('red-border');
                }
                /*Adding a div over the parameter while calculator popup is open in order to prevent the events to be triggered that are binded on math-input-field of parameter*/
                if (!measure.find('.parameter-covering-div').length) {
                    measure.prepend("<div class = 'parameter-covering-div'></div>");
                }
                if (engine.dgtUI.model.dgtPopUpView.model.curPopupShown === 'calculator') {
                    measure.off('mousedown', this.addMeasureToCalcFunc).on('mousedown', this.addMeasureToCalcFunc);
                    MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('calculator', 'measurement');
                } else if (engine.dgtUI.model.dgtPopUpView.model.curPopupShown === 'properties') {
                    measure.find('.dgt-measurement-value').prop('disabled', true);
                    MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'properties-popup');
                }
            }
        },
        "addMeasureToCalc": function(event) {
            var engine = this.model.engine;
            engine.dgtUI.addMeasurementToCalculator(this.model, event);
            if (engine.selected.indexOf(this.model) === -1) {
                engine._select(this.model, null, null, true);
            }
        },
        "changeCssMouseLeave": function() {
            var model = this.model,
                measure = model.$measureView;
            if (measure.hasClass('red-border')) {
                measure.removeClass('red-border');
                measure.find('.parameter-covering-div').remove();
                MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'calculator');
            }
        },
        "showHideMeasurement": function() {
            if (this.model.engine.dgtUI.model.dgtPopUpView.model.curPopupShown === 'calculator') {
                return;
            }
            if (this.model.properties.binaryInvisibility === 0) {
                this.model.$measureView.show();
            } else {
                this.model.$measureView.hide();
            }
        },


        //Opening the calculation popup on double clicking the measurement
        "passInputReferenceToCalculator": function() {

            var model = this.model,
                engine = model.engine,
                params = model.creator.getParams(),
                value = this.model.value,
                inputReference = params.inputReference.slice(0, params.inputReference.length),
                dgtPopupModel = engine.dgtUI.model.dgtPopUpView.model;


            if (['calculator', 'properties', 'iterate', 'iterateToDepth'].indexOf(dgtPopupModel.curPopupShown) > -1 ||
                model.properties.locked) {
                return;
            }

            //double click on calculation measurement...

            if (engine.getOperationMode() === 'select') {
                //double click on calculation measurement SELECTION MODE...
                if (engine.selected.indexOf(this.model) === -1) {
                    engine._select(this.model);
                }
                engine.editableMeasurementId = this.model.id;

                engine.dgtCalculatorManager.editCalculation({
                    "answer": value,
                    "inputReference": inputReference,
                    "objectIndex": this.model.creator.getParams().objectIndexInInputReference
                });


            }
        },
        //Opening the edit parameter popup on measurement double click
        "setParameterPopup": function() {
            var engine = this.model.engine,
                dgtPopupModel = engine.dgtUI.model.dgtPopUpView.model;
            if (['calculator', 'properties', 'iterate', 'iterateToDepth'].indexOf(dgtPopupModel.curPopupShown) > -1 ||
                this.model.properties.locked) {
                return;
            }

            if (engine.getOperationMode() === 'select') {
                engine.editableMeasurementId = this.model.id;
                engine.dgtUI.setTitleAndopenPopup('Edit Parameter Value', null, 'parameter');
            }
            if (engine.selected.indexOf(this.model) === -1) {
                engine._select(this.model);
            }
        },

        "onMeasurementLabelClick": function(event) {
            var targetObj = event.data.targetObj;
            if (targetObj.engine.dgtUI.model.dgtPopUpView.model.curPopupShown === 'calculator') {
                return;
            }
            if (targetObj.engine.getOperationMode() && targetObj.previouslySelected) {
                targetObj.engine._select(targetObj);
            }
        },
        "onMeasurementLabelUp": function() {
            MathUtilities.Tools.Dgt.Models.DgtEngine.measurementDragInProgress = false;
        },
        "onMeasurementLabelDown": function(event) {
            var targetObj = event.data.targetObj,
                $mesurementInput = targetObj.engine.dgtUI.$(':focus');

            if (targetObj.engine.dgtUI.model.dgtPopUpView.model.curPopupShown === 'calculator') {
                return;
            }
            if (targetObj.engine.getOperationMode() === 'select') {
                targetObj.previouslySelected = true;
                MathUtilities.Tools.Dgt.Models.DgtEngine.measurementDragInProgress = true;
                if (targetObj.engine.selected.indexOf(targetObj) === -1) {
                    targetObj.previouslySelected = false;
                    targetObj.engine._select(targetObj);
                }
                if ($mesurementInput) {
                    /* Instead of triggering blur event we are setting focus on tool-holder
                    because in IE both focus and blur are asynchronous so while blur is triggered
                    for textbox, internally jQuery invokes it after the textbox is hidden and hence it
                    has no effect and the focus remains in the textbox*/
                    targetObj.engine.dgtUI.$el.focus();
                }
            }
        },
        "onBannerDragStart": function(event) {

            if (this.model.engine.getOperationMode() !== 'select') {
                event.preventDefault();
                return;
            }
            this.model.engine.deselectAll();
            this.model.engine._select(this.model);
            this.model.dragging = true;
        },
        "onBannerDragStop": function(event) {
            var undoData = {
                    "position": []
                },
                redoData = {
                    "position": []
                },
                targetPosition = $(event.target).position(),
                model = this.model,
                position = model.equation.getPoints()[0];
            undoData.id = model.id;
            undoData.position[0] = position[0];
            undoData.position[1] = position[1];
            redoData.id = this.model.id;
            redoData.position[0] = targetPosition.top;
            redoData.position[1] = targetPosition.left;
            this.model.previouslySelected = false;
            this.model.dragging = false;
            this.model.engine.execute('relocate', {
                "undo": {
                    "actionType": 'goToPrevPosition',
                    "undoData": undoData
                },
                "redo": {
                    "actionType": 'goToNewPosition',
                    "redoData": redoData
                }
            });
            this.saveBannerPosition();
        },
        "saveBannerPosition": function() {
            var position = this.model.$measureView.position();
            this.model.equation.setPoints([
                [position.top, position.left]
            ]);

        },

        //To get the previous non incinerated measure
        "_getPreviousMeasure": function(currentId) {
            var previousId = 'm' + (currentId.substring(1, currentId.length) - 1),
                previousMeasure;
            if (currentId !== 'm0') {
                previousMeasure = this.model.engine.getEntityFromId(previousId);
            }
            return previousMeasure;
        },
        "setBannerPosition": function(newPosition) {
            var $measure = this.model.$measureView,
                previousMeasure, difference = 2,
                currentId = this.model.id,
                position, engine = this.model.engine,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;
            if (DgtEngine.restoreKind === DgtEngine.ACTION_SAVE_RESTORE) {
                position = this.model.equation.getPoints()[0];
                $measure.css({
                    "position": 'absolute',
                    "top": position[0],
                    "left": position[1]
                });
                this.saveBannerPosition();
                if (!engine._undergoingOperation || engine._undergoingOperation.directive !== 'paste') {
                    this.model.set('isPositionSet', true);
                }
                return;
            }
            if (newPosition) {
                $measure.css({
                    "position": 'absolute',
                    "top": newPosition[0],
                    "left": newPosition[1]
                });
                this.saveBannerPosition();
                this.model.set('isPositionSet', true);
                return;
            }
            if (currentId !== 'm0') {
                previousMeasure = this.model.engine.measures[this.model.engine.measures.length - difference];
                while (previousMeasure && previousMeasure._universe) {
                    difference++;
                    previousMeasure = this.model.engine.measures[this.model.engine.measures.length - difference];
                }
                while (previousMeasure && !previousMeasure.$measureView) {
                    difference++;
                    previousMeasure = this.model.engine.measures[this.model.engine.measures.length - difference];
                }
            }
            this.saveBannerPosition();
        },
        "_updateIterateTable": function(tableData, isLabelChanged) {
            if ($.isEmptyObject(tableData)) {
                return void 0;
            }
            var $currentMeasure = this.model.$measureView.find('.dgt-measurement-label'),
                rowLength,
                i, labelMap, labelDivArray, lengthOfLabelDivArray, existingRows, maxRow, noOfDataRow,
                j, columnLength, map = '',
                mapRow, postRenderCall,
                mapString, updateLabel;

            postRenderCall = _.bind(function() {
                //if label is update then avoid position change
                if (!isLabelChanged) {
                    this.model.set('isPositionSet', false);
                }
                this.trigger('MathjaxPostRenderCall');
            }, this);

            updateLabel = _.bind(function() {
                $currentMeasure.find('.iteration-data').removeClass('assign-table-cell');
                labelDivArray = $currentMeasure.find('.mappy-row').first().find('.iteration-data');
                lengthOfLabelDivArray = labelDivArray.length;
                for (i = 0; i < lengthOfLabelDivArray; i++) {
                    MathUtilities.Tools.Dgt.Views.MathInputView.latexToMathjax(tableData.label[i], labelDivArray.eq(i), postRenderCall);
                    if (i > 0) {
                        this._addEllipsisForMeasurementLabel(tableData.parameters[i - 1], labelDivArray.eq(i));
                    }
                }
            }, this);

            function createRow(columnData) {
                map = '[';
                var mappingRow;
                for (j = 0; j < columnLength; j++) {
                    if (columnData instanceof Array) {
                        mapString = '{"data":"' + columnData[j] + '"},';
                    } else {
                        mapString = '{"data":"' + columnData + '"},';
                    }
                    map += mapString;
                }
                map = map.substring(0, map.length - 1) + ']';
                map = $.parseJSON(map);
                mappingRow = MathUtilities.Tools.Dgt.templates.IteratePopupStructure({
                    "column-class": 'mappy-row',
                    "mappy": map
                });
                mappingRow = mappingRow.trim();
                return mappingRow;
            }

            function hideUnwantedRows(startingIndex) {
                var existingUnwantedRows = $currentMeasure.find('.mappy-row'),
                    lengthOfExistingRows = existingUnwantedRows.length;
                for (i = startingIndex; i < lengthOfExistingRows; i++) {
                    $(existingUnwantedRows[i]).hide();
                }
            }

            function updateExistingData(values) {
                var existingRowsData = $currentMeasure.find('.mappy-row'),
                    lengthOfValueData, noOfRowsToUpdate, $row, rowNumber, column,
                    lengthOfExistingRows = existingRowsData.length,
                    noOfColumns = values[0].length,
                    columnsInRow;
                if (isLabelChanged) {
                    updateLabel();
                }
                if (lengthOfExistingRows === 0) {
                    return void 0;
                }
                lengthOfValueData = values.length;
                if (lengthOfValueData > lengthOfExistingRows - 1) {
                    noOfRowsToUpdate = lengthOfExistingRows;
                } else {
                    noOfRowsToUpdate = lengthOfValueData + 1;
                    hideUnwantedRows(lengthOfValueData + 1);
                }

                for (rowNumber = 1; rowNumber < noOfRowsToUpdate; rowNumber++) {
                    $row = $(existingRowsData[rowNumber]);
                    columnsInRow = $row.find('.iteration-data');
                    if ($row.find('.iteration-data:hidden').length > 0) {
                        $row.show();
                    }
                    for (column = 0; column < noOfColumns; column++) {
                        $(columnsInRow[column]).text(values[0][column]);
                    }
                    tableData.values.splice(0, 1);
                }
            }

            function updateRow(row, data) {
                var columns = row.find('.iteration-data'),
                    ctr;
                for (ctr = 0; ctr < columnLength; ctr++) {
                    if (data instanceof Array) {
                        $(columns[ctr]).text(data[ctr]);
                    } else {
                        $(columns[ctr]).text(data);
                    }
                }

            }



            this.model.$measureView.find('.dgt-measurement').addClass('dgt-measurement-for-iterate');
            updateExistingData(tableData.values);
            rowLength = tableData.values.length;
            if (tableData.values.length === 0) {
                $currentMeasure.find('.iteration-data').addClass('assign-table-cell');
                return void 0;
            }
            maxRow = 12; //maximum row to display
            columnLength = tableData.values[0].length;
            if ($currentMeasure.find('.mappy-row').length === 0) {
                labelMap = createRow(' ');
                $currentMeasure.append(labelMap);
                updateLabel();
            }


            if (rowLength !== 0) {
                for (i = 0; i < rowLength; i++) {
                    existingRows = $currentMeasure.find('.mappy-row');
                    noOfDataRow = existingRows.length - 1;
                    if (noOfDataRow === maxRow) {
                        updateRow($(existingRows[maxRow - 1]), '...');
                        updateRow($(existingRows[maxRow]), tableData.values[rowLength - 1]);
                        $currentMeasure.find('.iteration-data').addClass('assign-table-cell');
                        return void 0;
                    }
                    mapRow = createRow(tableData.values[i]);
                    $currentMeasure.append(mapRow);
                }
            }
            $currentMeasure.find('.iteration-data').addClass('assign-table-cell');
        },
        "updateBannerLabel": function() {
            var $currentMeasurement = this.model.$measureView,
                labelWithoutDollar, latexLabel,
                MathInput = MathUtilities.Tools.Dgt.Models.MathInput,
                MathInputView = MathUtilities.Tools.Dgt.Views.MathInputView,
                restoreKind = MathUtilities.Tools.Dgt.Models.DgtEngine.restoreKind;
            //specific for IE
            if (navigator.userAgent.search('MSIE 9.0') > 0 || navigator.userAgent.search('Trident/7.0') > 0) {
                $currentMeasurement.find('.dgt-measurement-label').addClass('specific-for-ie-9');
            }
            if ('ontouchstart' in window === false) {
                $currentMeasurement.find('.dgt-measurement').addClass('assign-bold-font');
            }
            switch (this.model.getLabelType()) {
                case 'no-name':

                    $currentMeasurement.find('.dgt-measurement-label').text('');

                    break;

                case 'current-label':
                    labelWithoutDollar = this.model.properties.labelText;
                    labelWithoutDollar = this.model.deletePrefixedString(labelWithoutDollar);
                    labelWithoutDollar = MathInput.updateMeasurementLabelLatex(labelWithoutDollar);
                    labelWithoutDollar = labelWithoutDollar.replace(/\s/gi, '\\hspace{2mm}');
                    if (this.model.species === 'measureCoordinate' || this.model.species === 'measureEquation') {
                        latexLabel = labelWithoutDollar + ':\\hspace{1pt}';
                    } else {
                        latexLabel = labelWithoutDollar + '=\\hspace{1pt}';
                    }
                    if (restoreKind) {
                        MathInputView.latexToMathjax(latexLabel, $currentMeasurement.find('.dgt-measurement-label'));
                    } else {
                        MathInputView.latexToMathjax(latexLabel, $currentMeasurement.find('.dgt-measurement-label'), this.postRenderCallbackFunc);
                    }
                    break;
                default:
                    if (this.model.species === 'measureCoordinate' || this.model.species === 'measureEquation') {
                        latexLabel = this.model.properties.labelTextOriginal + ':\\hspace{1pt}';
                    } else if (this.model.species === 'measureIteration') {
                        latexLabel = '';
                    } else {
                        latexLabel = this.model.properties.labelTextOriginal + '=\\hspace{1pt}';
                    }
                    if (restoreKind) {
                        MathInputView.latexToMathjax(latexLabel, $currentMeasurement.find('.dgt-measurement-label'));
                    } else {
                        MathInputView.latexToMathjax(latexLabel, $currentMeasurement.find('.dgt-measurement-label'), this.postRenderCallbackFunc);
                    }
                    break;

            }

            this.updateContainment($currentMeasurement);
            this._addEllipsisForMeasurementLabel();
        },
        "_addEllipsisForMeasurementLabel": function(parameters, $divToDisplay) {
            var $currentMeasurement = this.model.$measureView,
                div, text = '...=\\thinspace',
                $measurementLabel, isMaxWidth,
                widthOfMeasurementLabel, maxWidthAllowed,
                creator, objIndex, inputReference, count,
                latex, measurement, currentMeasurementWidth,
                mathInput = this.model.engine.dgtCalculatorManager.mathInput,
                MathInputView = MathUtilities.Tools.Dgt.Views.MathInputView,
                MAX_CHARACTERS_TO_DISPLAY = 20,
                ONE_THIRD = 1 / 3;

            if ($divToDisplay) {
                $measurementLabel = $divToDisplay;
            } else {
                $measurementLabel = $currentMeasurement.find('.dgt-measurement-label');
            }
            isMaxWidth = $measurementLabel.attr('isMaxWidth');
            widthOfMeasurementLabel = $measurementLabel.outerWidth();
            maxWidthAllowed = parseInt($measurementLabel.css('max-width'), 10);
            currentMeasurementWidth = $currentMeasurement.outerWidth();

            if (widthOfMeasurementLabel >= maxWidthAllowed || currentMeasurementWidth >= maxWidthAllowed) {

                if (this.model.species === 'calculation' || this.model.species === 'measureIteration') {
                    if (parameters) {
                        inputReference = parameters.inputReference.slice();
                        objIndex = parameters.objectIndexInInputReference;
                    } else {
                        creator = this.model.creator;
                        inputReference = creator.getParams().inputReference.slice();
                        objIndex = creator.getParams().objectIndexInInputReference;
                    }
                    for (count in objIndex) {
                        measurement = this.model.getEntityFromSources(inputReference[objIndex[count]]);
                        mathInput.updateConstantMapping(measurement);
                        inputReference[objIndex[count]] = measurement;
                    }
                    latex = mathInput.getValidLatex(inputReference.slice(0, Math.floor(inputReference.length * ONE_THIRD)));
                    latex = MathUtilities.Tools.Dgt.Models.MathInput.getLatexWithLargerNumberInScientificNotation(latex);
                } else if (this.model.species === 'parameter') {
                    latex = this.model.getDisplayedLabel().slice(0, MAX_CHARACTERS_TO_DISPLAY);
                }

                if (this.model.species === 'measureIteration') {
                    latex += '...';
                }
                MathInputView.latexToMathjax(latex, $measurementLabel, this.postRenderCallbackFunc);

                if (isMaxWidth) {
                    return;
                }

                $measurementLabel.attr('isMaxWidth', true);

                if (this.model.species !== 'measureIteration') {
                    div = MathUtilities.Tools.Dgt.templates.IteratePopupStructure({
                        "column-class": "ellipsis-div"
                    });
                    $currentMeasurement.append(div);
                    div = $currentMeasurement.find('.ellipsis-div');
                    $(div).insertAfter($measurementLabel);
                    MathInputView.latexToMathjax(text, div);
                }
            } else {
                $currentMeasurement.find('.ellipsis-div').remove();
                $measurementLabel.removeAttr('isMaxWidth');
            }
        },

        "postRenderCallback": function() {
            var model = this.model;
            this.updateContainment();
            if (model.properties.binaryInvisibility === 0 && !model._incinerated) {
                this.updateBannerPosition();
                model.set('isPositionSet', true);
            }
        },

        "updateBannerValue": function(precision) {
            var model = this.model,
                $currentMeasurement = model.$measureView,
                MathInputView = MathUtilities.Tools.Dgt.Views.MathInputView,
                $currentDisplayDiv = $currentMeasurement.find('.dgt-measurement-value'),
                latex, value, indexOfE, indexOfDot,
                maxLengthOfValue = 6,
                precisionForScientificNotation = 2,
                MathHelper = MathUtilities.Components.Utils.Models.MathHelper,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;

            if (typeof precision === 'undefined') {
                precision = 2;
            }
            if (model.species === 'parameter') {
                value = model.value.toString();
                indexOfE = value.lastIndexOf('e');

                if (indexOfE > -1) {
                    value = geomFunctions.convertExponentialToDecimal(value);
                }

                indexOfDot = value.indexOf('.');

                latex = Number(value);
                if (indexOfDot > maxLengthOfValue || indexOfDot === -1 && value.length > maxLengthOfValue) {
                    latex = MathHelper._convertToDisplayableForm(latex, precisionForScientificNotation);
                } else {
                    latex = DgtEngine.roundOff(latex, precision);
                }

                latex = latex.toString();
                MathInputView.latexToMathjax(latex, $currentDisplayDiv);

                this.model.properties.precision = precision;
            } else {
                if (model.species === 'measureCoordinate' || model.species === 'measureEquation' || model.value === 'undefined') { /*undefined text needs to be handled for case of undefined slope*/
                    $currentDisplayDiv.text(model.value);
                    if (model.value === 'undefined') {
                        $currentMeasurement.find('.dgt-measurement-unit').hide();
                    } else {
                        $currentMeasurement.find('.dgt-measurement-unit').show();
                    }
                } else {
                    value = model.value.toString();
                    indexOfE = value.lastIndexOf('e');
                    if (model.species === 'calculation') {
                        if (value === 'undefined') {
                            latex = value;
                        } else {
                            if (indexOfE > -1) {
                                value = geomFunctions.convertExponentialToDecimal(value);
                            }
                            indexOfDot = value.indexOf('.');
                            latex = Number(value);
                            if (indexOfDot > maxLengthOfValue || indexOfDot === -1 && value.length > maxLengthOfValue) {
                                latex = MathHelper._convertToDisplayableForm(latex, precisionForScientificNotation);
                            } else {
                                latex = DgtEngine.roundOff(latex, precision);
                            }
                            latex = latex.toString();
                        }
                    }

                    if (model.species === 'calculation') {
                        MathInputView.latexToMathjax(latex, $currentDisplayDiv);
                    } else {
                        $currentDisplayDiv.text(DgtEngine.roundOff(model.value, precision).toString());
                    }

                    $currentMeasurement.find('.dgt-measurement-unit').show();
                }
                this.model.properties.precision = precision;
            }

            this.updateContainment($currentMeasurement);
            if (this.model.$measureView.is(':visible')) {
                this.updateBannerPosition();
            }
        },
        "setBannerUnit": function() {
            var model = this.model,
                $currentMeasurement = model.$measureView,
                dataString = '';
            dataString = model.updateUnits();
            $currentMeasurement.find('.dgt-measurement-unit').html(dataString);
        },


        "adjustWidthOfValueInput": function() {

            var $paramValue = this.model.$measureView.find('.parameter'),
                width = $('<div>' + $paramValue.val() + '</div>').getTextWidth(true);

            $paramValue.width(width);
        },

        "changeBannerStyle": function() {
            var $currentMeasurement = this.model.$measureView,
                $dgtMeasurement = $currentMeasurement.find('.dgt-measurement');
            if (this.model.engine.selected.indexOf(this.model) !== -1) {
                if (this.model.species === 'measureIteration') {
                    if (this.model.properties.locked) {
                        $currentMeasurement.addClass('measure-container-for-iterate-for-locked assign-z-index');
                    } else {
                        $currentMeasurement.addClass('measure-container-for-iterate assign-z-index');
                    }
                    return;
                }
                $currentMeasurement.addClass('measureContainer  assign-z-index');
                if (this.model.properties.locked) {
                    $dgtMeasurement.removeClass('measureText').addClass('measure-text-for-locked');
                } else {
                    $dgtMeasurement.removeClass('measure-text-for-locked').addClass('measureText');
                }
            } else {
                $currentMeasurement.removeClass('measureContainer measure-container-for-iterate measure-container-for-iterate-for-locked assign-z-index');
                $dgtMeasurement.removeClass('measureText measure-text-for-locked');
            }
        },
        "removeBanner": function() {
            var $dgtEl = this.model.engine.dgtUI.$el;
            this.model.$measureView.remove();
            $dgtEl.find('#custom-modal').remove();
            $dgtEl.focus();
        },

        "updateContainment": function($draggable) {
            $draggable = typeof $draggable === 'undefined' ? this.model.$measureView : $draggable;

            var $canvas = this.model.engine.dgtUI.$('#dgt-canvas-container'),
                canvasOffset = $canvas.offset(),
                canvasSize = {
                    "width": $canvas.width(),
                    "height": $canvas.height()
                },
                scrollbarSize = {
                    "width": 15,
                    "height": 18
                },
                propertyBar = {
                    "height": 48
                },
                draggableSize = {
                    "width": $draggable.outerWidth(),
                    "height": $draggable.outerHeight()
                };

            $draggable.draggable({
                "containment": [
                    canvasOffset.left,
                    canvasOffset.top + propertyBar.height,
                    canvasOffset.left + canvasSize.width - scrollbarSize.width - draggableSize.width,
                    canvasOffset.top + canvasSize.height - scrollbarSize.height - draggableSize.height
                ],
                "start": function() {
                    $canvas.find('.dgt-measurement-container').removeClass('assign-z-index');
                    $draggable.addClass('assign-z-index');
                }
            });
        },

        "updateBannerPosition": function() {
            if (this.model._universe) {
                return;
            }
            var $canvas = this.model.engine.dgtUI.$('#dgt-canvas-container'),
                canvasSize = {
                    "width": $canvas.width(),
                    "height": $canvas.height()
                },
                scrollbarSize = {
                    "width": 15,
                    "height": 18
                },
                PADDING = 4,
                propertyBarSize = {
                    "height": 48
                },
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                measures = this.model.engine.measures.sort(function(a, b) {
                    return Number(DgtEngine.getFirstNumberFromString(a.id)) > Number(DgtEngine.getFirstNumberFromString(b.id)) ? 1 : -1;
                }),
                canvasExtreme = {
                    "left": 0,
                    "top": propertyBarSize.height,
                    "right": canvasSize.width - scrollbarSize.width,
                    "bottom": canvasSize.height - scrollbarSize.height
                },

                $curBanner = this.model.$measureView,
                curBannerPosition = $curBanner.position(),
                prevBannerModel,

                curBannerSize = {
                    "width": $curBanner.outerWidth(),
                    "height": $curBanner.outerHeight()
                },
                difference = 1,


                $prevBanner = null,
                prevBannerPosition = null,
                prevBannerSize = null,

                defaultPosition = {
                    "top": 60,
                    "left": 10
                },
                minDistance = 220,
                top = defaultPosition.top,
                left = defaultPosition.left;

            prevBannerModel = measures[measures.indexOf(this.model) - difference];
            if (prevBannerModel) {
                while (prevBannerModel && (!prevBannerModel.$measureView || prevBannerModel.properties.binaryInvisibility !== 0)) { // Go back till you don't find a view.
                    difference++;
                    prevBannerModel = measures[measures.length - difference];
                }
            }

            if (!this.model.get('isPositionSet')) {
                //rendering measurement

                if (typeof prevBannerModel !== 'undefined' && prevBannerModel !== null) {
                    $prevBanner = prevBannerModel.$measureView;
                    prevBannerPosition = $prevBanner.position(); //relative position

                    prevBannerSize = {
                        "width": $prevBanner.width(),
                        "height": $prevBanner.height()
                    };
                    top = prevBannerPosition.top + prevBannerSize.height + PADDING;
                    left = prevBannerPosition.left;

                    if (top + curBannerSize.height > canvasExtreme.bottom) {
                        top = canvasExtreme.top;
                        left += minDistance;
                    }
                    if (left + curBannerSize.width > canvasExtreme.right) {
                        left = canvasExtreme.left;
                    }
                }
            } else {
                //measurement value update

                curBannerSize = {
                    "width": $curBanner.outerWidth(),
                    "height": $curBanner.outerHeight()
                };
                top = curBannerPosition.top;
                left = curBannerPosition.left;

                if (left + curBannerSize.width > canvasExtreme.right) {
                    left = canvasExtreme.right - curBannerSize.width;
                    if (left <= canvasExtreme.left) {
                        left = canvasExtreme.left;
                    }
                }
                if (top + curBannerSize.height > canvasExtreme.bottom) {
                    top = canvasExtreme.bottom - curBannerSize.height;
                    if (top < canvasExtreme.top) {
                        top = canvasExtreme.top;
                    }
                }
            }


            $curBanner.css({
                "top": top,
                "left": left
            });
            this.setBannerPosition();
        }
    }, {
        "bannerPositionOffset": {
            "top": 4,
            "left": 2,
            "right": 12
        }
    });
})(window.MathUtilities);
