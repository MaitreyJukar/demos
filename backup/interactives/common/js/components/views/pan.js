
(function () {
    'use strict';

    /**
    * View for rendering button and its related events
    *
    * @class Button
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.Pan = MathInteractives.Common.Player.Views.Base.extend({
        _pushedElemsInPan: null,
        _filePath: null,
        initialize: function initialize() {
            this._makeDroppable();
            this._makRowsAndColsInPan();
        },

        _makeDroppable: function () {
            var oThis = this;
            $(oThis.$el).droppable({
                drop: function (event, ui) {

                    $({ x: 0 }).animate({ x: 1 }, 10, function () {
                        oThis._onDrop(oThis, event, ui);
                        var callBack = oThis.model.get('onDrop');
                        if (callBack) {
                            callBack(event, ui);
                        }
                    });
                }
            });
        },
        _makRowsAndColsInPan: function () {
            //console.log(this.model);
        },
        _onDrop: function (oThis, event, ui) {
            if ($(event.target).attr('id') === ui.draggable.parent().parent().attr('id')) {
                return;
            }
            var $droppedElem = $(ui.draggable[0]);
            var droppedElemModel = $droppedElem.data('model');
            oThis._placeElemsInPan(oThis, $droppedElem, droppedElemModel);

            this._showPanAnimation();
        },

        _placeElemsInPan: function (oThis, $droppedElem, droppedElemModel) {
            var tempElem = $droppedElem.clone();
            oThis.$el.find('#main-tiles-cont').prepend(tempElem.data('model', droppedElemModel));
            oThis.$el.find(tempElem).css({
                top: 0,
                left: 0
            });
            var temp = oThis.$el.find(tempElem);
            temp.on('dblclick', function () { oThis._onTileInPanClick($(this), oThis); });

            oThis._makeTilesInPanDraggable();
            return;
        },

        _onTileInPanClick: function ($clickedElem) {

            var clickedElemModel = $clickedElem.data('model');
            var weight = clickedElemModel.weight;

            if (weight > 1) {
                var tempModel;
                $clickedElem.detach();
                for (var i = 0; i < weight; i++) {
                    tempModel = clickedElemModel;
                    debugger;
                    tempModel.weight = 1;
                    tempModel.id = 'weight-1';
                    tempModel.text = '1';
                    $(this.el).append($clickedElem.data('model', tempModel).clone());
                }
            }
            this._makeTilesInPanDraggable();
        },
        _makeTilesInPanDraggable: function () {
            var pan = this.el;
            $(this.el).find('#main-tiles-cont').children().draggable({
                revert: function (event) {
                    if ($(pan).attr('id') != $(event[0]).attr('id')) {
                        $(this).remove();
                        MathInteractives.global.PanBalance.showPanAnimation();
                    }
                    else {
                        return true;
                    }
                },
                revertDuration: 200,
                zIndex: 999999
            });
        },
        GetElemsPresentInPan: function () {
            return this._pushedElemsInPan;
        },
        getWieghtInPan: function () {
            var $tiles = this.$el.find('#main-tiles-cont').children();
            var wieght = 0;
            $tiles.each(function (index) {
                var tileModel = $(this).data('model');
                wieght = wieght + parseFloat(tileModel.weight);
            });
            return wieght;
        },

        _showPanAnimation: function () {
            MathInteractives.global.PanBalance.showPanAnimation();
        }
    });
})();