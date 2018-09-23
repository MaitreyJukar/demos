/* globals $, window */

(function(MathUtilities) {
    'use strict';

    MathUtilities.Tools.Dgt.Models.IteratePopupManager = Backbone.Model.extend({
        "engine": null,
        "dgtpopupView": null,
        "preImageArray": [],
        "idOfMappingImages": [],
        "idOfPreImages": [],
        "numberOfSourcePoint": null,
        "prevText": '',
        "textForQuestionMark": '',
        "prevMappy": null,
        "selectedRowIndex": 0,
        "selectedColumnIndex": 0,
        "selected": [],
        "rolledOver": [],
        "params": null,


        "initialize": function(options) {
            this.setEngine(options.engine);
            this.textForQuestionMark = MathUtilities.Tools.Dgt.Models.DgtUiModel.textMapping.questionMark;
            this.prevText = this.textForQuestionMark;
            this.params = {
                'depth': 3
            };
        },
        "enableFreePointsOnly": function() {
            var selectedItems = [],
                selectedItemsInitially, looper, curPoint, curMeasure,
                lengthOfSelectedItems, freePoints = [],
                index, idOfPreImages = [],
                idOfPreImage,
                engine = this.engine,
                dgtpopupView = engine.dgtUI.model.dgtPopUpView;
            this.dgtpopupView = dgtpopupView;
            this.numberOfSourcePoint = 0;
            this.selectedColumnIndex = 0;
            this.selectedRowIndex = 0;

            selectedItemsInitially = engine.selected;
            lengthOfSelectedItems = selectedItemsInitially.length;
            for (index = 0; index < lengthOfSelectedItems; index++) {
                selectedItems.push(selectedItemsInitially[index]);
            }
            for (index = 0; index < lengthOfSelectedItems; index++) {
                if (selectedItems[index].creator && selectedItems[index].creator.sources.length !== 0 && selectedItems[index].creator.species !== 'pointOnObject' || selectedItems[index].division === 'annotation' || selectedItems[index].division === 'image') {
                    engine._select(selectedItems[index]);
                } else {
                    if (!selectedItems[index].creator || selectedItems[index].creator.sources.length === 0 || selectedItems[index].creator.species === 'pointOnObject') {
                        freePoints.push(selectedItems[index]);
                        idOfPreImage = selectedItems[index].id;
                        idOfPreImages.push(idOfPreImage);
                    }
                }
            }
            for (looper in this.engine.points) {
                curPoint = this.engine.points[looper];
                if (freePoints.indexOf(curPoint) !== -1) {
                    continue;
                }
                if (curPoint.properties.binaryInvisibility === 0 && MathUtilities.Tools.Dgt.Models.DgtIteration.isParentOf(freePoints, curPoint)) {
                    this.numberOfSourcePoint++;
                }
            }
            for (looper in this.engine.measures) {
                curMeasure = this.engine.measures[looper];
                if (curMeasure.species === 'calculation' && curMeasure.properties.binaryInvisibility === 0 &&
                    MathUtilities.Tools.Dgt.Models.DgtIteration.isParentOf(freePoints, curMeasure, true)) {
                    this.numberOfSourcePoint++;
                }
            }
            this.preImageArray = freePoints;
            this.idOfPreImages = idOfPreImages;
        },
        "updateMappyDataOfIteratePopup": function(clickedEntity) {
            var parent, indexOfCurrentParent, shownMappingColumn,
                latexToMathjax = MathUtilities.Tools.Dgt.Views.MathInputView.latexToMathjax,
                lengthOfShownMappingImage, nextMappy, dgtpopupView, $popup, selectedMappy,
                labelOfClickedPoint = clickedEntity.division === 'measurement' ? clickedEntity.getDisplayedLabel() : clickedEntity.getLabelDataText();
            if (clickedEntity.division !== 'measurement' || clickedEntity.properties &&
                clickedEntity.properties.labelType &&
                clickedEntity.properties.labelType !== 'original-name') {
                labelOfClickedPoint = MathUtilities.Tools.Dgt.Models.MathInput.updateMeasurementLabelLatex(labelOfClickedPoint);
            }
            this.avoidRepetitionOfId(clickedEntity);
            dgtpopupView = this.dgtpopupView;
            $popup = dgtpopupView.getPopupContainer();
            selectedMappy = $popup.find('.selected-mappy');
            nextMappy = selectedMappy.nextAll('.mapping-data:first');
            parent = selectedMappy.closest('.map-image');
            indexOfCurrentParent = parent.index();
            shownMappingColumn = $popup.find('.map-image:visible');
            lengthOfShownMappingImage = shownMappingColumn.length;
            if (this.engine.accManager) {
                latexToMathjax(labelOfClickedPoint, $(selectedMappy).find('.localised-text'));
            } else {
                latexToMathjax(labelOfClickedPoint, selectedMappy);
            }
            this.storeIdOfImageOfIterate(clickedEntity);
            selectedMappy.removeClass('selected-mappy');
            if (indexOfCurrentParent < lengthOfShownMappingImage - 1) {
                if (nextMappy.length !== 0) {
                    selectedMappy.nextAll('.mapping-data:first').addClass('selected-mappy');
                } else {
                    shownMappingColumn.eq(indexOfCurrentParent + 1).find('.mappy-1').addClass('selected-mappy');
                }

            } else {
                if (nextMappy.length !== 0) {
                    selectedMappy.nextAll('.mapping-data:first').addClass('selected-mappy');
                } else {
                    shownMappingColumn.first().find('.mappy-1').addClass('selected-mappy');
                }
            }
            this._updateRowAndColumnIndex();
            this.selectionOfRespectivePreImage();
        },

        "avoidRepetitionOfId": function(clickedEntity) {
            var idOfClickedPoint = clickedEntity.id,
                loopVar = 0,
                $mappy,
                mapColumn = this.idOfMappingImages[this.selectedColumnIndex],
                lengthOfMapColumn = mapColumn.length,
                dgtpopupView = this.dgtpopupView,
                $popup = dgtpopupView.getPopupContainer();
            for (; loopVar < lengthOfMapColumn; loopVar++) {
                if (mapColumn[loopVar] === idOfClickedPoint) {
                    this.idOfMappingImages[this.selectedColumnIndex][loopVar] = null;
                    $mappy = $popup.find('.selected-mappy').closest('.map-image').find('.mapping-data').eq(loopVar);
                    $mappy.find('.localised-text').text(this.textForQuestionMark);
                    return;
                }
            }
        },

        "_select": function(clickedEntity) {
            var tempDepth,
                dgtpopupView = this.dgtpopupView;
            if (!this.isValidSelection(clickedEntity)) {
                dgtpopupView.updateTextForDataHolderDivInIteratePopup();
                return;
            }
            this.updateMappyDataOfIteratePopup(clickedEntity);
            this.selectionOfRespectivePreImage();
            dgtpopupView.updateArrayIdOfIterateDropDownItem();
            dgtpopupView._enableAndDisableIterateMenubar(dgtpopupView.model.idOfIterateDropdownMenuItemToEnable);
            dgtpopupView.updateTextForDataHolderDivInIteratePopup();
            this.updateParams();
            this.params.previewMode = true; //set actual depth when popup is closed.
            if (!this.engine._undergoingOperation) {
                this.params.forceRedraw = false;
                dgtpopupView.generatePreview('iterate');
            } else {
                this.params.forceRedraw = true;
                if (typeof this.params.depth === 'object') {
                    tempDepth = this.params.depth;
                    this.params.depth = null;
                    this.params = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(this.params);
                    this.params.depth = tempDepth;
                }
                this.engine._undergoingOperation.updateOperationParams(this.params);
            }
            dgtpopupView.updateArrayIdOfIterateDropDownItem();
            dgtpopupView._enableAndDisableIterateMenubar(dgtpopupView.model.idOfIterateDropdownMenuItemToEnable);
        },
        "deselectAll": function() {
            while (this.selected.length > 0) {
                this.engine._updateDrawableColor(this.selected.pop());
            }
        },
        "rollOver": function(entity) {
            if (this.isValidSelection(entity)) {
                this.rolledOver.push(entity);
                this.engine._updateDrawableColor(entity);
                return true;
            }
        },
        "rollOut": function(entity) {
            if (this.rolledOver.indexOf(entity) > -1) {
                this.rolledOver.splice(this.rolledOver.indexOf(entity), 1);
                this.engine._updateDrawableColor(entity, entity.properties.color);
            }
        },
        "isValidSelection": function(entity) {
            return !(entity._universe || entity.division !== 'point' && entity.species !== 'calculation' && entity.species !== 'parameter' ||
                MathUtilities.Tools.Dgt.Models.DgtIteration.isParentOf(this.preImageArray, entity) !== true);
        },
        "isIterationProduceNewImage": function() {
            var idOfPreImages = this.idOfPreImages,
                idOfMappingImages = this.idOfMappingImages,
                column,
                noOfColumn = idOfMappingImages.length;

            function isArraySame(array1, array2) {
                var i, length;
                length = array2.length;
                for (i = 0; i < length; i++) {
                    if (typeof array2[i] !== 'undefined' && array1[i] !== array2[i]) {
                        return false;
                    }
                }
                return true;
            }

            if (idOfMappingImages.length === 1 && idOfMappingImages[0].length === 0) {
                return false;
            }
            if (noOfColumn === 1) {
                if (isArraySame(idOfPreImages, idOfMappingImages[0]) === false) {
                    return true;
                }
            } else {
                for (column = 0; column < noOfColumn; column++) {
                    if (isArraySame(idOfPreImages, idOfMappingImages[column]) === false) {
                        return true;
                    }
                }
            }
            return false;
        },
        "selectionOfRespectivePreImage": function() {
            var entity, engine = this.engine;
            while (this.selected.length > 0) {
                entity = this.selected.pop();
                engine._updateDrawableColor(entity);
            }
            entity = this.preImageArray[this.selectedRowIndex];
            this.selected.push(entity);
            engine._updateDrawableColor(entity);
        },
        "updateParams": function() {
            var loopVar, maps = [],
                count;
            for (loopVar = 0; loopVar < this.idOfMappingImages.length; loopVar++) {
                if (this.idOfMappingImages[loopVar].length === 0) {
                    continue;
                }
                maps.push({});
                for (count in this.idOfPreImages) {
                    if (typeof this.idOfMappingImages[loopVar][count] !== 'undefined' && this.idOfMappingImages[loopVar][count] !== null) {
                        maps[loopVar][this.idOfPreImages[count]] = this.idOfMappingImages[loopVar][count];
                    } else {
                        maps[loopVar][this.idOfPreImages[count]] = this.idOfPreImages[count];
                    }
                }
            }
            this.params.map = {
                "preImage": this.idOfPreImages,
                "maps": maps
            };

        },

        "updateSelectionOfFreePoints": function() {
            var index, engine = this.engine,
                preImageArray = this.preImageArray,
                preImageArrayLength = preImageArray.length;
            for (index = 1; index < preImageArrayLength; index++) {
                engine._select(preImageArray[index]);
            }
        },

        "_updateRowAndColumnIndex": function() {

            var $popup = this.dgtpopupView.getPopupContainer(),
                $selectedMappy = $popup.find('.selected-mappy'),
                $mapImages = $popup.find('.map-image'),
                $selectedMapImage = $selectedMappy.closest('.map-image'),
                $mapData = $selectedMapImage.find('.mapping-data'),
                columnNumber = $mapImages.index($selectedMapImage),
                rowNumber = $mapData.index($selectedMappy),
                arrayOfMappingColumnLength = $popup.find('.map-image').length;

            columnNumber = arrayOfMappingColumnLength - columnNumber;
            if (isNaN(columnNumber)) {
                columnNumber = 1;
            }
            this.selectedRowIndex = rowNumber;
            this.selectedColumnIndex = columnNumber - 1;

        },
        "storeIdOfImageOfIterate": function(drawable) {
            this.idOfMappingImages[this.selectedColumnIndex][this.selectedRowIndex] = drawable.id;
        },

        "setEngine": function(engine) {
            this.engine = engine;
        }
    });
})(window.MathUtilities);
