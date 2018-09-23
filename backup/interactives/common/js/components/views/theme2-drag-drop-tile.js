(function () {
    'use strict';
    /**
    * View for rendering DragDropTile.
    *
    * @class DragDropTile
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Theme2.Views
    **/
    MathInteractives.Common.Components.Theme2.Views.DragDropTile = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Holds the interactivity id prefix
        * @property idPrefix
        * @type String
        * @default null
        */
        idPrefix: null,
        /**
        * Reference to the manager object
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,
        /**
        * Reference to player
        * @property player
        * @type Object
        * @default null
        */
        player: null,
        /**
        * Holds the model of path for preloading files
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,

        /**
        * Holds the array of drag drop slots models
        * @property dragDropSlotModelArr
        * @type Array
        * @default []
        **/
        dragDropSlotModelArr: [],

        /**
        * Holds the array of drag drop slots models
        * @property dragDropSlotModelArr
        * @type Array
        * @default []
        **/
        dragButtonViews: [],

        /**
        * Holds the array of draggable tiles models
        * @property dragTilesModel
        * @type Array
        * @default []
        **/
        dragTilesModel: [],

        /**
        * Holds the array of draggable models
        * @property dragModelArr
        * @type Array
        * @default []
        **/
        dragModelArr: [],

        /**
        * Holds the array of drag drop slots models
        * @property shadow
        * @type Array
        * @default []
        **/
        shadow: 5,

        /**
        * Calls render
        * @method initialize
        **/
        initialize: function () {
            this.filePath = this.model.get('filePath');
            this.idPrefix = this.model.get('idPrefix');
            this.manager = this.model.get('manager');
            this.player = this.model.get('player');
            this.dragDropSlotModelArr = [];
            this.dragButtonViews = [];
            this.dragTilesModel = [];
            this.dragModelArr = [];
            this._render();
        },

        /**
        * Renders the data for binCastor, dropSlots, footprints and tiles.
        * @method _render
        * @private
        **/
        _render: function () {
            var dropSlots;
            if (this.model.get('dropSlotData') != null) {
                dropSlots = this._createDroppableSlot();
            }
            if (this.model.get('tileData') != null) {
                this._createDraggableTile(dropSlots);
            }

            if (this.model.get('footprintData') != null) {
                this._createFootprint()
            }
            if (this.model.get('castorData') != null) {
                this._createCastorBin();
            }
        },
        /**
        * Creates dropslot component and make them droppable.
        * @method _createDroppableSlot
        * @private
        **/
        _createDroppableSlot: function () {
            var noOfSlots = this.model.get('dropSlotData').length, i, dragDropSlotModel, preventDefaultFunctionality = false, self = this,
            dragDropClass = MathInteractives.Common.Components.Models.DragDrop, dropSlots = [];
            for (i = 0; i < noOfSlots; i++) {
                MathInteractives.global.Theme2.DropSlot.generateDropSlot({
                    'player': this.player,
                    'manager': this.manager,
                    'filePath': this.filePath,
                    'idPrefix': this.idPrefix,
                    'data': this.model.get('dropSlotData')[i]
                });
                if (this.model.get('dropSlotData')[i].preventDefaultFunctionality) {
                    preventDefaultFunctionality = this.model.get('dropSlotData')[i].preventDefaultFunctionality;
                }
                if (this.model.get('dropSlotModelData') === null || typeof this.model.get('dropSlotModelData') === 'undefined') {
                    dragDropSlotModel = dragDropClass.createDragDropModel({
                        type: 'drop',
                        elements: [
                         this.idPrefix + this.model.get('dropSlotData')[i].containerId
                    ],
                        idPrefix: this.idPrefix,
                        preventDefaultFunctionality: preventDefaultFunctionality,
                        options: this.model.get('dropSlotData')[i].options
                    });
                }
                dropSlots.push(this.idPrefix + this.model.get('dropSlotData')[i].containerId);
                
                self.dragDropSlotModelArr[i] = dragDropSlotModel;
                //for (var j = 0; j < this.dragDropSlotModelArr.length; j++) {
                //    this.dragDropSlotModelArr[j].on(dragDropClass.EVENTS.DROP.DROP, function (ev, ui) {
                //        if (ev.$element.find('.ui-draggable').length > 1) {
                //            $(ev.$element.find('.ui-draggable')[0]).remove();
                //        }
                //    });
                //}
            }
            if (this.model.get('dropSlotModelData') !== null) {
                var data = this.model.get('dropSlotModelData');
                this.dropSlotModel = dragDropClass.createDragDropModel({
                    type: data.type,
                    elements: data.elements,
                    idPrefix: data.idPrefix,
                    preventDefaultFunctionality: data.preventDefaultFunctionality,
                    options: data.options
                });
            }
            return dropSlots;
        },

        /**
        * Returns dropSlotModelArr
        * @method getDropSlotModelArr
        * @public
        **/
        getDropSlotModelArr: function () {
        return this.dragDropSlotModelArr;
        },

        /**
        * send options of draggables dynamically 
        * @method addOptionsForDraggable
        * @public
        **/
        addOptionsForDraggable: function addOptionsForDraggable(options) {
            var modelArrLen = this.dragModelArr.length,
                i = 0;
            for (; i < modelArrLen; i++) {
                this.dragModelArr[i].addOptions(options);
            }
        },
        /**
        * send options of droppables dynamically 
        * @method addOptionsForDroppable
        * @public
        **/
        addOptionsForDroppable: function addOptionsForDroppable(options) {
            var modelArrLen = this.dragDropSlotModelArr.length,
                i = 0;
            for (; i < modelArrLen; i++) {
                this.dragDropSlotModelArr[i].addOptions(options);
            }
        },

        /**
        * returns dragModelArr
        * @method getDragModelArr
        * @public
        **/
        getDragModelArr: function () {
        return this.dragModelArr;
        },

        /**
        * Creates  tile component and make them draggable.
        * @method _createDraggableTile
        * @private
        * @param {Array} [dropSlots] Id of dropSlots.
        **/
        _createDraggableTile: function (dropSlots) {
            var noOfTiles = this.model.get('tileData').length, i, preventDefaultFunctionality = false, helper = 'clone', options = {},
                dragDropClass = MathInteractives.Common.Components.Models.DragDrop;
            for (i = 0; i < noOfTiles; i++) {
                this.dragButtonViews[i] = MathInteractives.global.Theme2.Button.generateButton({
                    'player': this.player,
                    'manager': this.manager,
                    'path': this.filePath,
                    'idPrefix': this.idPrefix,
                    'data': {
                        'id': this.model.get('tileData')[i].id,
                        'type': this.model.get('tileData')[i].type,
                        'height': this.model.get('tileData')[i].height,
                        'width': this.model.get('tileData')[i].width,
                        'colorType': this.model.get('tileData')[i].colorType,
                        'boxShadowColor': this.model.get('tileData')[i].boxShadowColor,
                        'text': this.model.get('tileData')[i].text,
                        'imagePath': this.model.get('tileData')[i].imagePath
                    }
                });
                if (this.model.get('tileData')[i].preventDefaultFunctionality) {
                    preventDefaultFunctionality = this.model.get('tileData')[i].preventDefaultFunctionality
                }
                if (this.model.get('tileData')[i].options) {
                    options = this.model.get('tileData')[i].options;
                }
                if (this.model.get('tileData')[i].helper) {
                    helper = this.model.get('tileData')[i].helper;
                    options['helper'] = helper;
                }
                options['containment'] = this.model.get('tileData')[i].containment;
                if (this.model.get('dragModelData') === null || typeof this.model.get('dragModelData') === 'undefined') {
                    this.dragTilesModel[i] = dragDropClass.createDragDropModel({
                        type: 'drag',
                        elements: [this.model.get('tileData')[i].id],
                        dropSlots: dropSlots,
                        idPrefix: this.idPrefix,
                        player: this.player,
                        manager: this.manager,
                        contextMenuScreenId: this.model.get('contextMenuScreenId'),
                        preventDefaultFunctionality: preventDefaultFunctionality,
                        options: options
                    });
                }
                this.dragModelArr[i] = this.dragTilesModel[i];

                if ((this.model.get('tileData')[i].tooltipData !== null) && (typeof this.model.get('tileData')[i].tooltipData !== 'undefined')) {
                    this._generateTooltipForDraggable(i);
                }
            }
            if (this.model.get('dragModelData') !== null) {
                var data = this.model.get('dragModelData');
                this.dragModel = dragDropClass.createDragDropModel({
                    type: data.type,
                    elements: data.elements,
                    dropSlots: data.dropSlots,
                    idPrefix: data.idPrefix,
                    player: this.player,
                    manager: this.manager,
                    contextMenuScreenId: this.model.get('contextMenuScreenId'),
                    preventDefaultFunctionality: data.preventDefaultFunctionality,
                    options: data.options
                });
            }
        },

        /**
        * Generates tool tip for a draggable element
        * @method _generateTooltipForDraggable
        * @private
        * @param tileIndex {Number} index of the tile
        **/
        _generateTooltipForDraggable: function _generateTooltipForDraggable(tileIndex) {
            var tooltipProps = {},
                tileData = this.model.get('tileData')[tileIndex],
                tooltipData = tileData.tooltipData;

            $.extend(tooltipProps, tooltipData);
            tooltipProps.idPrefix = this.model.get('idPrefix');
            tooltipProps.manager = this.model.get('manager');
            tooltipProps._player = this.model.get('player');
            tooltipProps.path = this.model.get('filePath');
            tooltipProps.id = tileData.id + '-tooltip-container';
            tooltipProps.elementEl = tileData.id;
            var tooltipView = MathInteractives.global.Theme2.Tooltip.generateTooltip(tooltipProps);
        },

        /**
        * Public method to add/remove context menu items from context menu
        * @method editContextMenu
        * @param {Array} ElementsIds Array of elementIds to be editted
        * @param {boolean} If the id should be ignored
        **/
        editContextMenu: function editContextMenu(elementIds, ignore) {
            var noOfTiles = this.model.get('tileData').length, i;
            for (i = 0; i < noOfTiles; i++) {
                if (this.model.get('dragModelData') === null || typeof this.model.get('dragModelData') === 'undefined') {
                    this.dragTilesModel[i].editContextMenu(elementIds, ignore);
                }
            }
            if (this.model.get('dragModelData') !== null) {
                this.dragModel.editContextMenu(elementIds, ignore);
            }
        },

        /**
        * Creates footprint component.
        * @method _createFootprint
        * @private
        **/
        _createFootprint: function () {
            var noOfFootprints = this.model.get('footprintData').length, i, text;
            for (i = 0; i < noOfFootprints; i++) {
                if (this.model.get('footprintData')[i].text) {
                    text = this.model.get('footprintData')[i].text;
                }
                else {
                    text = null;
                }

                MathInteractives.global.Theme2.Footprint.generateFootprint({
                    'player': this.player,
                    'manager': this.manager,
                    'filePath': this.filePath,
                    'idPrefix': this.idPrefix,
                    'data': this.model.get('footprintData')[i],
                    'text': text
                });
            }

        },

        /**
        * Disables the draggable passed as an argument OR if not passed all draggable
        * @method disableDraggable
        * @public
        * @param {String} [draggableTileId] Id of the draggable to be disabled
        **/
        disableDraggable: function (draggableTileId) {
            if (draggableTileId !== undefined) {
                for (var i = 0; i < this.dragButtonViews.length; i++) {
                    if (this.dragButtonViews[i].model.get('id') === draggableTileId) {
                        this.dragTilesModel[i].disable();
                    }
                }
            }
            else {
                for (var i = 0; i < this.dragButtonViews.length; i++) {
                    this.dragTilesModel[i].disable();
                }
            }
        },

        /**
        * Enables the draggable passed as an argument OR if not passed all draggable
        * @public
        * @method enableDraggables
        * @param {String} [draggableTileId] Id of the draggable to be enabled
        **/
        enableDraggables: function (draggableTileId) {
            if (draggableTileId !== undefined) {
                for (var i = 0; i < this.dragButtonViews.length; i++) {
                    if (this.dragButtonViews[i].model.get('id') === draggableTileId) {
                        this.dragTilesModel[i].enable();
                    }
                }
            }
            else {
                for (var i = 0; i < this.dragButtonViews.length; i++) {
                    this.dragTilesModel[i].enable();
                }
            }
        },
        /**
        * Disables the Tile passed as an argument
        * @method disableTile
        * @param {String} [draggableTileId] Id of the draggable to be disabled
        * @public
        **/
        disableTile: function (draggableTileId) {
            this.dragModel.disableIndividialElement(draggableTileId);
            
        },

        /**
        * Enables the Tile passed as an argument
        * @method enableTile
        * @param {String} [draggableTileId] Id of the draggable to be enabled
        * @public
        **/
        enableTile: function (draggableTileId) {
            this.dragModel.enableIndividialElement(draggableTileId);

        },
        /**
        * Disables all Tiles 
        * @method disableAllTiles
        * @public
        **/
        disableAllTiles: function () {
            this.dragModel.disable();
        },

        /**
        * Enables all the Tiles 
        * @method enableAllTiles
        * @public
        **/       
        enableAllTiles: function () {
            this.dragModel.enable();
        },
        /**
        * Sets the state of the button to disabled
        * @method disableDraggable
        * @param {String} [buttonId] Id of the draggable button whose state it to be set to disabled
        * @param {Boolean} [isCenterAlign] If text in the tile is to be center aligned or not
        * @param {Object} [$tile] Helper, if the helper is dragged
        * @public
        **/
        setButtonDisabled: function (buttonId, isCenterAlign, $tile) {

            var top, i, $dragTile, options;
            for (i = 0; i < this.dragButtonViews.length; i++) {
                if (this.dragButtonViews[i].el.id === buttonId) {

                    $dragTile = this.dragButtonViews[i].$el;
                    if ($tile) {
                        $dragTile = $tile;
                    }
                    options = {
                        "$dragTile": $dragTile,
                        "isCenterAlign": isCenterAlign,
                        "shadow": this.shadow
                    };
                    this.dragButtonViews[i].setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED, options);
                }
            }
        },
        
        /**
        * Sets the state of all the draggable buttons to disable
        * @method setAllButtonsDisabled
        **/
        setAllButtonsDisabled: function (options) {
            for (var i = 0; i < this.dragButtonViews.length; i++) {
                if (options) {
                    options["$dragTile"] = this.dragButtonViews[i].$el;
                    this.dragButtonViews[i].setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED, options);
                }
                else {
                    this.dragButtonViews[i].setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
                }
            }
        },

        /**
        * Sets the state of the button to active
        * @method enableDraggables
        * @param {String} [buttonId] Id of the draggable button whose state it to be set to active
        * @param {Object} [$tile] Helper, if the helper is dragged
        * @public
        **/
        setButtonEnabled: function (buttonId, $tile) {

            var top, i, $dragTile, options;
            for (i = 0; i < this.dragButtonViews.length; i++) {
                if (this.dragButtonViews[i].el.id === buttonId) {

                    $dragTile = this.dragButtonViews[i].$el;
                    if ($tile) {
                        $dragTile = $tile;
                    }
                    options = {
                        "$dragTile": $dragTile,
                        "isCenterAlign": true
                    };
                    this.dragButtonViews[i].setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE, options);
                }
            }
        },

        /**
        * Sets the state of all the draggable buttons to active
        * @method setAllButtonsEnabled
        * @public
        **/
        setAllButtonsEnabled: function (options) {
            if (options) {
                var option = {
                    "$dragTile": null,
                    "isCenterAlign": true
                };
            }
            for (var i = 0; i < this.dragButtonViews.length; i++) {
                if (options) {
                    option["$dragTile"] = this.dragButtonViews[i].$el;
                    this.dragButtonViews[i].setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE, option);
                }
                else {
                    this.dragButtonViews[i].setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                }
            }
        },

        /**
        * Creates castorBin component.
        * @method _createCastorBin
        * @private
        **/
        _createCastorBin: function () {
            var noOfCastors = this.model.get('castorData').length, i;
            for (i = 0; i < noOfCastors; i++) {
                MathInteractives.global.Theme2.BinCastor.generateBinCastor({
                    'player': this.player,
                    'manager': this.manager,
                    'filePath': this.filePath,
                    'idPrefix': this.idPrefix,
                    'data': this.model.get('castorData')[i]
                });
            }

        }
    },
   {
       /**
       * Creates a model & view object for the DragDropTiles.
       * @method generateDragDropTile
       * @param options {Object} 
      
       */
       generateDragDropTile: function (options) {
           var dragDropTileModel, dragDropTileView;
           dragDropTileModel = new MathInteractives.Common.Components.Theme2.Models.DragDropTile(options);
           dragDropTileView = new MathInteractives.Common.Components.Theme2.Views.DragDropTile({ model: dragDropTileModel });
           return dragDropTileView;

       }
   });
    MathInteractives.global.Theme2.DragDropTile = MathInteractives.Common.Components.Theme2.Views.DragDropTile;
})();
