(function () {
    'use strict';

    /**
    * View for rendering and drawing and removing tiles upon selection and unselection, respectively, and dragging of tiles, over a canvas
    * referred here as a GridArea
    * @class GridArea
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.GridArea = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Manager class object
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,

        /**
        * Model of path for preloading files
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,

        /**
        * Reference to player object
        * @property player
        * @type Object
        * @default null
        */
        player: null,

        /**
        * Holds the model data related to tiles in the gridArea i.e. canvas
        * @property model
        * @type Object
        * @default null
        */
        model: null,

        /**
        * Holds the properties of the tile models drawn in the canvas
        * @property collection
        * @type Array
        * @default null
        */
        collection: null,

        /**
        * Maximum number of tiles to be placed horizontally in the grid area
        * @property tilesHorizontal
        * @type Number
        * @default null
        */
        tilesHorizontal: null,

        /**
        * Maximum number of tiles to be placed vertically in the grid area
        * @property tilesVertical
        * @type Number
        * @default null
        */
        tilesVertical: null,

        /**
        * Array that holds the paths of the raster images to be drawn in the grid
        * @property images
        * @type Array
        * @default null
        */
        images: null,

        /**
        * Holds the index of the image that was selected last
        * @property prevIndex
        * @type Number
        * @default null
        */
        prevIndex: null,

        /**
        * Holds the paths of the raster images to be shown in the grid when a filled grid is hovered upon
        * @property hoverImages
        * @type Array
        * @default null
        */
        hoverImages: null,

        /**
        * Paper.js tool
        * @property drawingCanvasTool
        * @type Object
        * @default null
        * @private
        */
        drawingCanvasTool: null,

        /**
        * Object that holds the x and y coordinate values of the grid in the canvas from where dragging(selection) starts
        * @property startPoint
        * @type Object
        * @default null
        */
        startPoint: null,

        /**
        * Object that holds the x and y coordinate values of the grid in the canvas where dragging(selection) ends
        * @property endPoint
        * @type Object
        * @default null
        */
        endPoint: null,

        /**
        * Paper scope for path of the canvas in which drawing is to be done
        * @property drawingCanvasScope
        * @type Object
        * @default null
        */
        drawingCanvasScope: null,

        /**
        * Holds the x and y position of the grid which is currently selected
        * @property drawingCanvasScope
        * @type Array
        * @default []
        */
        currentArray: [],

        /**
        * Holds the x and y positions of all the grid tiles that are selected when the selection stops
        * @property selectedTilesArray
        * @type Array
        * @default []
        */
        selectedTilesArray: [],

        /**
        * Holds the x and y positions of all the grid tiles that already drawn in the previous selections
        * @property drawnTilesArray
        * @type Array
        * @default []
        */
        drawnTilesArray: [],

        /**
        * Holds the x and y positions of the first grid tile from which the selection is started
        * @property startArray
        * @type Array
        * @default []
        */
        startArray: [],

        /**
        * Holds the index of the type of image to be drawn over selection in the gridArea(canvas)
        * Also it acts as the dividing line between drawing and non drawing mode in the gridArea, -1 means non-drawing mode
        * @property startArray
        * @type Number
        * @default -1
        */
        currentIndex: -1,

        /**
        * Holds the width of the canvas
        * @property canvasWidth
        * @type Number
        * @default null
        */
        canvasWidth: null,

        /**
        * Holds the height of the canvas
        * @property canvasWidth
        * @type Number
        * @default null
        */
        canvasHeight: null,

        /**
        * Holds the maximum count of images that can be drawn in the canvas
        * @property numberOfImages
        * @type Number
        * @default null
        */
        numberOfImages: null,

        /**
        * Id of the element in which the count of a drawn particular image is to be shown
        * @property numberOfImages
        * @type Number
        * @default null
        */
        showCountInId: null,

        /**
        * Counts of the images drawn inside the grids in the canvas
        * @property numberOfImages
        * @type Array
        * @default []
        */
        countArray: [],

        /**
        * Background color of the canvas
        * @property canvasBgColor
        * @type String
        * @default null
        */
        canvasBgColor: null,

        /**
        * Holds the x and y position of the tile when it is hovered upon in the non drawing mode
        * @property hoveredTile
        * @type Object
        * @default {}
        */
        hoveredTile: {},

        /**
        * Interactivity name in which this component is to be used i.e. idPrefix of the interactive
        * @property interactivityName
        * @type String
        * @default null
        */
        interactivityName: null,

        /**
        * Index of the image that is currently being dragged
        * @property indexOfDraggedImage
        * @type Number
        * @default null
        */
        indexOfDraggedImage: null,

        /**
        * Holds the information whether the tile is being dragged or not
        * @property isDragging
        * @type Boolean
        * @default false
        */
        isDragging: false,

        /**
        * Holds the information whether the tile is dropped or not
        * @property isDropped
        * @type Boolean
        * @default false
        */
        isDropped: false,

        /**
        * Image path of the image to be drawn
        * @property gridImagePath
        * @type String
        * @default null
        */
        gridImagePath: null,

        /**
        * Id of the element to which the dragging of a tile is contained
        * @property containmentDivId
        * @type String
        * @default null
        */
        containmentDivId: null,

        /**
        * Drawing has started or not
        * @property drawStarted
        * @type Boolean
        * @default false
        */
        drawStarted: false,

        /**
        * The width of a single tile i.e. a single grid in the grid area
        * @property tileWidth
        * @type Number
        * @default null
        */
        tileWidth: null,

        /**
        * The height of a single tile i.e. a single grid in the grid area
        * @property tileWidth
        * @type Number
        * @default null
        */
        tileHeight: null,

        /**
        * offset point updated while navigating to drop
        * @property navigatePoint
        * @type Object
        * @default null
        */
        navigatePoint: null,

        /**
        * image index of the tile to be replaced on dragging in canvas
        * @property tileToReplace
        * @type Number
        * @default null
        */
        tileToReplace: null,

        /**
        * tiles once stamped cannot be removed
        * @property isNotErasable
        * @type Boolean
        * @default null
        */
        isNotErasable: null,

        /**
        * allow stamping of half images at the grid end
        * @property showHalfImage
        * @type Boolean
        * @default null
        */
        showHalfImage: null,

        /**
        * canvas type for accessibility.
        * @property canvasType
        * @type String
        * @default null
        */
        canvasType: null,

        /**
        * Binds events to the canvas grid and drag image
        * @type Object
        * @private
        **/
        events: {
            'mousemove .canvas-grid': 'onCanvasGridMove',
            'mousedown .canvas-grid': 'onCanvasGridClick',
            'mouseleave .hoverImage': 'mouseLeaveFromHoverImage',
            'mouseenter .hoverImage': 'onMouseEnterHoverImage'
        },

        /**
        * Gets all properties related to the grid area from the model as well as initializing the properties received from the interactivity
        * @public
        * @param {object} options
        * @method initialize
        */
        initialize: function (options) {
            var self = this;
            self.model = options.model;
            self.player = options.player;
            self.manager = options.manager;
            self.filePath = options.path;
            self.idPrefix = self.player.getIDPrefix();

            self.tileWidth = self.model.get('tileWidth');
            self.tileHeight = self.model.get('tileHeight');
            self.collection = self.model.get('tileCollection');

            self.images = self.model.get('images');
            self.hoverImages = self.model.get('hoverImages');
            self.numberOfImages = self.images.length;
            //console.log(self.numberOfImages)
            self.countArray = self.model.get('countArray');
            //console.log(self.countArray)
            self.canvasType = self.model.get('canvasType');

            if (self.canvasType === null) {
                self.canvasType = options.canvasType;
                self.model.setCanvasType(options.canvasType);
            }

            self.tilesHorizontal = options.tilesHorizontal;
            self.tilesVertical = options.tilesVertical;
            self.showCountInId = options.showCountInId;
            self.canvasBgColor = options.canvasColor;
            self.interactivityName = options.interactivityName;
            self.containmentDivId = options.containmentDivId;
            self.isNotErasable = options.isNotErasable || false;
            self.showHalfImage = options.showHalfImage || false;

            self.manager.loadScreen('grid-area');
            self.render();
            self.attachEvents();

        },

        /**
        * Creates the canvas and append it to the el, also it creates the paper scope and sets it to the drawing canvas
        * @public
        * @method render
        **/
        render: function () {
            var self = this,
                canvas = $('<canvas>', { id: self.interactivityName + 'gridCanvas', class: 'gridCanvas' }),
                canvas1 = $('<canvas>', { id: self.interactivityName + 'drawingCanvas', class: 'drawingCanvas' }),
                grid = $('<div>', { id: self.interactivityName + 'canvas-grid', class: 'canvas-grid' }),
                hoverElement = $('<div>', { id: self.interactivityName + 'hover-image', class: 'hoverImage' }),
                collection = self.collection,
                Utils = MathInteractives.Common.Utilities.Models.Utils;

            self.$el.append(canvas);
            self.$el.append(canvas1);
            self.$el.append(grid);
            self.$el.append(hoverElement);
            //$.fn.EnableTouch('.hoverImage');
            Utils.EnableTouch(this.$('.hoverImage'));
            self.setStylesToCanvasHolderElements();

            self.drawingCanvasScope = new paper.PaperScope();
            self.drawingCanvasScope.setup(self.interactivityName + 'drawingCanvas');

            self.$('.drawingCanvas')[0].width = self.canvasWidth;
            self.$('.drawingCanvas')[0].height = self.canvasHeight;

            self.drawingCanvasTool = new self.drawingCanvasScope.Tool();

            // Setting up acc for canvas
            self._canvasAcc = MathInteractives.global.CanvasAcc.intializeCanvasAcc({
                type: self.canvasType,
                canvasHolderID: self.el.id,
                manager: self.manager,
                player: self.player,
                paperScope: self.drawingCanvasScope,
                gridCell: {
                    size: {
                        width: self.tileWidth,
                        height: self.tileHeight
                    },
                    origin: {
                        x: self.tileWidth / 2,
                        y: self.tileHeight / 2
                    }
                },
                gridContainment: {
                    minX: self.tileWidth / 2,
                    maxX: self.tileWidth * self.tilesHorizontal,
                    minY: self.tileHeight / 2,
                    maxY: self.tileHeight * self.tilesVertical
                },
                focusRectSize: {
                    width: self.tileWidth - 4,
                    height: self.tileHeight - 4
                }
            });

            self.$el.on(MathInteractives.Common.Player.Models.CanvasAcc.DRAW_AND_EXPAND_EVENTS.SPACE, $.proxy(self.accSpaceHandler, self));
            self.$el.on(MathInteractives.Common.Player.Models.CanvasAcc.DRAW_AND_EXPAND_EVENTS.FOCUS_OUT, $.proxy(self.accFocusHandler, self));
            self.$el.on(MathInteractives.Common.Player.Models.CanvasAcc.DRAW_AND_EXPAND_EVENTS.ARROW, $.proxy(self.accArrowHandler, self));

            self.$el.on(MathInteractives.Common.Player.Models.CanvasAcc.DRAG_AND_DROP_EVENTS.FOCUS_OUT, $.proxy(self.accFocusOutInDragHandler, self));
            self.$el.on(MathInteractives.Common.Player.Models.CanvasAcc.DRAG_AND_DROP_EVENTS.TAB, $.proxy(self.accTabInDragHandler, self));
            self.$el.on(MathInteractives.Common.Player.Models.CanvasAcc.DRAG_AND_DROP_EVENTS.SPACE, $.proxy(self.accSpaceInDragHandler, self));
            self.$el.on(MathInteractives.Common.Player.Models.CanvasAcc.DRAG_AND_DROP_EVENTS.ARROW, $.proxy(self.accArrowInDragHandler, self));

            self.renderGrid();

            self.showCount(self.countArray);
        },

        /**
        * Sets the styles to the elements in the el, and also makes the hoverImage draggable and the canvas droppable
        * @public
        * @method setStylesToCanvasHolderElements
        **/
        setStylesToCanvasHolderElements: function () {

            var self = this,
                hoverImage = self.$('.hoverImage'),
                gridCanvas = self.$('.gridCanvas'),
                drawingCanvas = self.$('.drawingCanvas'),
                canvasGrid = self.$('.canvas-grid'),
                Utils = MathInteractives.Common.Utilities.Models.Utils;

            hoverImage.css({
                'position': 'absolute',
                'width': self.tileWidth + 'px',
                'height': self.tileHeight + 'px',
                'cursor': 'move',
                'z-index': '0'
            }).draggable({
                start: function () {
                    self.isDragging = true;
                    self.isDropped = false;
                    self.removeTileFromCanvas();
                },
                stop: function () {
                    self.isDragging = false;
                    if (!self.isDropped) {
                        self.repaintDraggedTile();
                    }
                },
                containment: '#' + self.containmentDivId,
                revert: 'invalid'
            }).hide();

            self.canvasWidth = self.tileWidth * self.tilesHorizontal;
            self.canvasHeight = self.tileHeight * self.tilesVertical;

            gridCanvas[0].width = self.canvasWidth;
            gridCanvas[0].height = self.canvasHeight;
            gridCanvas.css({
                'position': 'absolute',
                'background-color': self.canvasBgColor
            });


            drawingCanvas[0].width = self.canvasWidth;
            drawingCanvas[0].height = self.canvasHeight;
            drawingCanvas.css({ 'position': 'absolute' });

            canvasGrid.css({
                'position': 'absolute',
                'width': (self.canvasWidth + 1) + 'px',
                'height': (self.canvasHeight + 1) + 'px',
                'top': '0px',
                'left': '0px'
            });

            //$.fn.EnableTouch('.canvas-grid');
            Utils.EnableTouch(this.$('.canvas-grid'), { specificEvents: Utils.SpecificEvents.DRAGGABLE });

            drawingCanvas.droppable({
                drop: function (event, ui) {
                    //self.log('canvas droppable')
                    self.replaceCurrentTileWithDraggedTile(event, ui);
                    self.copyTilesFromDrawingCanvasToGridCanvas();
                    //console.log("tile dropped");
                    self.dropEvent = event;
                }
            });
        },

        /**
        * Removes the tile from the grid when it is dragged; if column and row not passed, use hovered tile's positions.
        * This function is called as soon as the dragging starts in non touch devices
        * @method removeTileFromCanvas
        * @param [col] {Number} column no.
        * @param [row] {Number} row no.
        **/
        removeTileFromCanvas: function (col, row) {

            var self = this,
                c = document.getElementById(self.interactivityName + 'gridCanvas'),
                context = c.getContext("2d"),
                c1 = document.getElementById(self.interactivityName + 'drawingCanvas'),
                context1 = c1.getContext("2d"),
                startPositionX,
                startPositionY;

            if (typeof col === 'undefined') {
                col = self.hoveredTile.col
            }
            if (typeof row === 'undefined') {
                row = self.hoveredTile.row
            }

            startPositionX = (col - 1) * self.tileHeight;
            startPositionY = (row - 1) * self.tileWidth;

            context1.clearRect(startPositionX, startPositionY, self.tileWidth, self.tileHeight);
            context.clearRect(startPositionX, startPositionY, self.tileWidth, self.tileHeight);
        },

        /**
        * Repaints the tile when it is dragged and dropped from one grid to invalid area
        * @public
        * @method repaintDraggedTile
        **/
        repaintDraggedTile: function () {
            var self = this,
                obj = {},
                repaintPositionArray = [],
                children = self.drawingCanvasScope.project.activeLayer.children,
                length = children.length;

            obj.tileRow = self.hoveredTile.row;
            obj.tileCol = self.hoveredTile.col;

            repaintPositionArray[0] = obj;

            self.paintTemporaryTiles(repaintPositionArray, self.images[self.indexOfDraggedImage]);

            self.$('.hoverImage').css('z-index', '0').hide();

            for (var i = 0; i < length; i++) {
                if (children[i]._custom_prop_id === undefined || children[i]._custom_prop_id.indexOf("null_") !== -1 ||
                    children[i]._row_no === null || children[i]._col_no === null) {
                    children.splice(i, 1);
                    length--;
                    i--;
                }
            }
            //console.log(self.collection)
        },

        /**
        * Paints the tiles upon selection of the grids in the canvas
        * @public
        * @method paintTemporaryTiles
        * @param {Array} [array] Array of objects holding X and Y positions of the tiles to be drawn
        * @param {Object} [URL] The URL or path of the image that is to be set to the tiles upon selection
        **/
        paintTemporaryTiles: function (array, URL) {
            var self = this,
                children = self.drawingCanvasScope.project.activeLayer.children,
                length = children.length,
                isTouchDevice = MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;

            for (var i = 0; i < array.length; i++) {
                var x = (array[i].tileCol * self.tileWidth) - (self.tileWidth / 2);
                var y = (array[i].tileRow * self.tileHeight) - (self.tileHeight / 2);

                for (var prop = 0; prop < length; prop++) {
                    if (children[prop]._row_no === array[i].tileRow && children[prop]._col_no === array[i].tileCol) {
                        //if (children[prop]._custom_prop_id.indexOf("null_") === -1) {
                        children[prop]._custom_prop_id = 'null_' + children[prop]._custom_prop_id;
                        //console.log(children[prop]._custom_prop_id)
                        //}
                    }
                }


                self.drawingCanvasScope.activate();
                var drawingCanvasRaster = new self.drawingCanvasScope.Raster(URL);

                drawingCanvasRaster._row_no = array[i].tileRow;
                drawingCanvasRaster._col_no = array[i].tileCol;
                if (self.currentIndex !== -1) {
                    drawingCanvasRaster._custom_prop_id = self.images[self.currentIndex];
                }
                else {
                    if (!isTouchDevice) {
                        //this.log(self.indexOfDraggedImage)
                        drawingCanvasRaster._custom_prop_id = self.images[self.indexOfDraggedImage];
                    }
                    else {
                        //this.log(self.prevIndex)
                        drawingCanvasRaster._custom_prop_id = 'null';
                    }
                }
                //console.log(drawingCanvasRaster)
                array[i].raster = drawingCanvasRaster;

                drawingCanvasRaster.position.x = x;
                drawingCanvasRaster.position.y = y;
            }

            self.getCount();
        },

        /**
        * Gets the count of each image and stores it in an array,
        * each index of this array indicates the number of tiles of one particular image
        * @public
        * @method getCount
        **/
        getCount: function () {

            var self = this,
                countArray = [],
                length;

            for (var i = 0; i < self.numberOfImages; i++) {
                countArray[i] = 0;
            }

            if (self.currentIndex !== -1) {
                var children = self.drawingCanvasScope.project.activeLayer.children;
                length = children.length;

                for (var prop = 0; prop < length; prop++) {

                    if (children[prop].hasOwnProperty('_custom_prop_id')) {
                        for (var i = 0; i < self.numberOfImages; i++) {
                            if (children[prop]._custom_prop_id === self.images[i]) {
                                countArray[i] += 1;
                                break;
                            }
                        }
                    }
                }
            }
            else {
                var collection = self.collection;

                for (var i = 0; i < self.numberOfImages; i++) {
                    var tiles = collection.where({ imageIndex: i });
                    countArray[i] = tiles.length;
                }
            }

            self.countArray = countArray;
            self.showCount(self.countArray);
            self.model.setCountArray(self.countArray);
        },

        /**
        * Displays the count of each type of tile image present in the canvas, in the respective elements received from the interactivity
        * @public
        * @method showCount
        * @param {Array} [countArray] Array containing counts of each type of raster image
        **/
        showCount: function (countArray) {
            var self = this;
            self.model.setCountArray(countArray);
        },

        /**
        * Replaces the tiles with the another tiles, when a tile is dragged and dropped upon another tile
        * @public
        * @method replaceCurrentTileWithDraggedTile
        * @param {Object} [event] Draggable event
        * @param {Object} [ui] Draggable ui
        **/
        replaceCurrentTileWithDraggedTile: function (event, ui) {
            //console.log(ui.draggable)
            //console.log($(ui.draggable).attr('row'))
            var self = this,
                obj = {},
                newPositionArray = [],
                children = self.drawingCanvasScope.project.activeLayer.children,
                len = children.length,
                isTouchDevice = MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;

            obj.tileRow = Math.round(ui.position.top / self.tileHeight) + 1;
            obj.tileCol = Math.round(ui.position.left / self.tileWidth) + 1;

            newPositionArray[0] = obj;
            //console.log(self.indexOfDraggedImage)
            //console.log(newPositionArray[0])
            self.$('.hoverImage').css('z-index', '0').hide();
            //debugger
            for (var i = 0; i < len; i++) {
                if (children[i]._row_no === self.hoveredTile.row && children[i]._col_no === self.hoveredTile.col) {
                    children.splice(i, 1);
                    len--;
                    i--;
                }
            }

            if (!isTouchDevice) {
                self.collection.removeTile(self.hoveredTile.row, self.hoveredTile.col);
                self.collection.addTiles(newPositionArray, self.indexOfDraggedImage);

                self.paintTemporaryTiles(newPositionArray, self.images[self.indexOfDraggedImage]);
                len = self.drawingCanvasScope.project.activeLayer.children.length;
                for (var i = 0; i < len; i++) {
                    if (children[i]._custom_prop_id === undefined || children[i]._custom_prop_id.indexOf("null_") !== -1 ||
                        children[i]._row_no === null || children[i]._col_no === null) {
                        children.splice(i, 1);
                        len--;
                        i--;
                    }
                }
            }
            else {
                //this.log(obj.tileRow)
                //this.log(obj.tileCol)
                var row = $(ui.draggable).attr('row'),
                    col = $(ui.draggable).attr('col'),
                    index = parseFloat($(ui.draggable).attr('index')),
                    removeTile;


                if (parseInt(row) === obj.tileRow && parseInt(col) === obj.tileCol) {
                    removeTile = null;
                }
                else {
                    removeTile = $(".tileDragImage.ui-draggable[row='" + obj.tileRow.toString() + "'][col='" + obj.tileCol.toString() + "']")[0];
                }

                if (removeTile !== null) {
                    $(removeTile).remove();
                }

                self.$(ui.draggable).attr('row', obj.tileRow);
                self.$(ui.draggable).attr('col', obj.tileCol);

                self.$(ui.draggable).css('left', ((obj.tileCol - 1) * self.tileWidth + 1) + 'px');
                self.$(ui.draggable).css('top', ((obj.tileRow - 1) * self.tileHeight + 1) + 'px');
                self.collection.removeTile(row, col);
                self.collection.addTiles(newPositionArray, index);

                self.$(ui.draggable).css('background-image', 'url("' + self.images[index] + '")');
                //console.log(self.collection)
                //this.clearDrawingCanvas();
                self.getCount();
            }

            //console.log(self.collection)
            self.isDropped = true;
        },

        /**
        * Copies the content of the temporary drawing canvas, and pastes it to the grid canvas, and clears the drawing canvas
        * @public
        * @method copyTilesFromDrawingCanvasToGridCanvas
        **/
        copyTilesFromDrawingCanvasToGridCanvas: function () {
            var self = this,
                c = document.getElementById(self.interactivityName + 'drawingCanvas'),
                context = c.getContext("2d"),
                c1 = document.getElementById(self.interactivityName + 'gridCanvas'),
                context1 = c1.getContext("2d"),
                imgData = context.getImageData(0, 0, self.canvasWidth, self.canvasHeight);

            context1.putImageData(imgData, 0, 0);

            context.clearRect(0, 0, self.canvasWidth, self.canvasHeight);
        },

        /**
        * Checks if the collection is empty, if not renders the tiles by picking its information from the collection
        * This function is used when the tiles are to be drawn for a previous state, and for touch devives
        * @public
        * @method renderGrid
        **/
        renderGrid: function () {
            // Clear canvas drawing
            var self = this;
            self.drawingCanvasScope.project.activeLayer.removeChildren();

            // Loop through collection tiles and draw/raster each

            for (var i = 0; i < self.collection.length; i++) {
                self.renderTile(self.collection.models[i]);
            }
            self.updatePaperItems();

        },

        /**
        * Creates the rasters of the tile and positions it to its actual position before save and resume
        * @public
        * @method renderTile
        * @param {Object} [tile] model which holds the information of the tile i.e. imageIndex, row and column
        **/
        renderTile: function (tile) {
            this.drawingCanvasScope.activate();
            var self = this,
                index = tile.get('imageIndex'),
                raster = new self.drawingCanvasScope.Raster(self.images[index]);
            self.raster = raster;



            raster._row_no = tile.get('tileRow');
            raster._col_no = tile.get('tileCol');
            raster._custom_prop_id = self.images[index];

            raster.position.x = (tile.get('tileCol') * self.tileWidth) - (self.tileWidth / 2);
            raster.position.y = (tile.get('tileRow') * self.tileHeight) - (self.tileHeight / 2);
        },

        setCurrentCanvasPaperScope: function setCurrentCanvasPaperScope() {
            this.drawingCanvasScope.activate();
        },

        /**
        * Attaches events to the canvas tool
        * @public
        * @method attachEvents
        **/
        attachEvents: function () {
            var self = this;

            $('#' + self.containmentDivId).off('mousemove').on('mousemove', $.proxy(self.onGridAreaParentMouseMove, self));

            // Attach onMouseDrag event to the canvas tool
            self.drawingCanvasTool.onMouseDrag = function (event) {
                self.startPoint = event.point;
                self.drawRasterOnMouseDrag();
            }

            self.$el.on('keyup', function (event) {
                var keyCode = event.which || event.keyCode;
                if (keyCode === 9) {
                    self.setCurrentCanvasPaperScope();
                }
            })
        },

        /**
        * Attaches mouseup event on window
        * @public
        * @method attachMouseupEvent
        **/
        attachMouseupEvent: function () {
            var self = this;
            $(window).off('mouseup.grid-area-window').on('mouseup.grid-area-window', $.proxy(self.populateCollectionOnMouseUp, self));

        },

        /**
        * Detaches mouseup event on window
        * @public
        * @method detachMouseupEvent
        **/
        detachMouseupEvent: function () {

            var self = this;
            $(window).off('mouseup.grid-area-window');

        },

        /**
        * Copies the whole content of the drawing temporary canvas and paste it to the permanent canvas,
        * populates the collection with the tile models already drawn, and clears the drawing canvas, on mouse up of canvas
        * @public
        * @method populateCollectionOnMouseUp
        **/
        populateCollectionOnMouseUp: function (event) {

            this.detachMouseupEvent();

            if (this.currentIndex === -1 || !this.drawStarted || (typeof event !== 'undefined' && event.which !== 1)) {
                return;
            }

            var self = this,
                c = document.getElementById(self.interactivityName + 'drawingCanvas'),
                context = c.getContext("2d"),
                c1 = document.getElementById(self.interactivityName + 'gridCanvas'),
                context1 = c1.getContext("2d"),
                imgData = context.getImageData(0, 0, self.canvasWidth, self.canvasHeight),
                children = self.drawingCanvasScope.project.activeLayer.children,
                count = 0,
                len = children.length;
            //console.log(len);
            context1.putImageData(imgData, 0, 0);
            //console.log(self.selectedTilesArray.length)

            for (var i = 0; i < len; i++) {
                if (children[i]._custom_prop_id === undefined || children[i]._custom_prop_id.indexOf("null_") !== -1) {
                    children.splice(i, 1);
                    len--;
                    i--;
                }
            }

            self.collection.addTiles(self.selectedTilesArray, self.currentIndex);

            self.updatePaperItems();

            context.clearRect(0, 0, self.canvasWidth, self.canvasHeight);
            self.drawStarted = false;
        },

        countCollections: function (tile) {
            this.renderTile(tile);
        },

        removeTiles: function (tile) {
        },

        /**
        * Hides the hover image when the mouse is moved in the elements other than the canvas
        * @public
        * @method onGridAreaParentMouseMove
        * @param {Object} [event] Mouse move event
        **/
        onGridAreaParentMouseMove: function (event) {
            var self = this;

            if (self.currentIndex && !self.isDragging) {
                var currentElement = document.elementFromPoint(event.clientX, event.clientY);
                var parent = $(currentElement).parent();
                if (parent && parent[0] !== this.$el[0]) {
                    self.mouseLeaveFromHoverImage();
                }
            }

        },

        /**
        * Sets the image of the grid in the canvas
        * @public
        * @method setGridImage
        * @param {String} [gridImagePath] Path of the image
        **/
        setGridImage: function (gridImagePath) {
            this.$('.canvas-grid').css('background-image', 'url("' + gridImagePath + '")');
        },

        /**
        * Draws raster image in the grid which is clicked upon
        * @public
        * @method onCanvasGridClick
        * @param {Object} [event] Mouse click event
        **/
        onCanvasGridClick: function (event) {

            var self = this,
                target = event.target || event.srcElement,
                rect = target.getBoundingClientRect(),
                offsetX = event.clientX - rect.left,
                offsetY = event.clientY - rect.top;

            self.attachMouseupEvent();

            if (event.which === 1) {
                if (self.currentIndex === -1) {

                }
                else {
                    self.startRasterDraw(offsetX, offsetY);
                }
            }
        },

        /**
        * Calculates the start point and calls the function to draw raster images on selection(dragging)
        * @public
        * @method onCanvasGridMove
        * @param {Object} [event] Mouse Move event
        **/
        onCanvasGridMove: function (event) {

            var self = this,
                target = event.target || event.srcElement,
                rect = target.getBoundingClientRect(),
                offsetX = event.clientX - rect.left,
                offsetY = event.clientY - rect.top,
                isTouchDevice = MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;

            self.startPoint = { x: offsetX, y: offsetY };

            //Non drawing mode
            if (self.currentIndex === -1) {
                if (!isTouchDevice) {
                    self.showRasterHoverImage(offsetX, offsetY);
                }
            }
            //Drawing mode
            else {
                self.drawRasterOnMouseDrag();
            }
        },

        /**
        * Populates the collection with the models of the grids in which raster images are drawn
        * @public
        * @method onCanvasGridMouseUp
        **/
        onCanvasGridMouseUp: function () {
            this.populateCollectionOnMouseUp();
        },

        repaintDraggedTile1: function (event) {
            var self = this,
                obj = {},
                repaintPositionArray = [];
            //console.log(event)
            var row = $('#' + event.currentTarget.id).attr('row');
            var col = $('#' + event.currentTarget.id).attr('col');

            //console.log(row + "    " + col)
            var tileRowColId = MathInteractives.Common.Components.Models.GridArea.getTileId(row, col);

            tileModel = self.collection.get(tileRowColId);

            if (tileModel) {
                index = tileModel.get('imageIndex');
            }

            repaintPositionArray[0] = { tileRow: row, tileCol: col };
        },

        /**
        * Removes the tile from the grid when it is dragged
        * This function is called as soon as the dragging starts in touch devices
        * @public
        * @method removeTileFromCanvas1
        * @param {Object} [event] Draggable event
        * @param {Object} [ui] Details of the draggable
        **/
        removeTileFromCanvas1: function (event, ui) {

            var self = this,
                c = document.getElementById(self.interactivityName + 'gridCanvas'),
                context = c.getContext("2d"),
                c1 = document.getElementById(self.interactivityName + 'drawingCanvas'),
                context1 = c1.getContext("2d");

            var row = $('#' + event.currentTarget.id).attr('row');
            var col = $('#' + event.currentTarget.id).attr('col');

            var startPositionX = (col - 1) * self.tileWidth;
            var startPositionY = (row - 1) * self.tileHeight;

            context1.clearRect(startPositionX, startPositionY, self.tileWidth, self.tileHeight);
            context.clearRect(startPositionX, startPositionY, self.tileWidth, self.tileHeight);
        },

        /**
        * Shows the hover image of the grid in which tile is already drawn on mouse over
        * @public
        * @method showRasterHoverImage
        * @param {Number} [offsetX] X offset
        * @param {Number} [offsetY] Y offset
        **/
        showRasterHoverImage: function (offsetX, offsetY) {
            var self = this,
                row, col;

            if (self.currentIndex === -1) {
                //console.log(self.isDragging)
                if (!self.isDragging) {
                    //console.log(offsetX + "      " + offsetY)
                    row = Math.ceil(offsetY / self.tileWidth);
                    col = Math.ceil(offsetX / self.tileWidth);
                    //console.log(row + "    " + col)
                    self.showImageOnTile(row, col);
                }
            }
        },

        /**
        * Shows the hover image of the grid on position of tile given row and col no.s
        * @public
        * @method showImageOnTile
        * @param row {Number} row no of the tile
        * @param col {Number} col no of the tile
        **/
        showImageOnTile: function showImageOnTile(row, col) {
            var self = this,
                detailsOfTile = self.getIndexOfImageArray(row, col),
                imagePath,
                Utils = MathInteractives.Common.Utilities.Models.Utils;

            self.indexOfDraggedImage = detailsOfTile;
            //console.log(detailsOfTile)
            if (detailsOfTile !== -1) {

                if (row === self.hoveredTile.row && col === self.hoveredTile.col) {
                    return;
                }
                else {//alert('here')
                    self.hoveredTile.row = row;
                    self.hoveredTile.col = col;

                    imagePath = self.hoverImages[detailsOfTile];

                    self.$('.hoverImage').css('background-image', 'url("' + imagePath + '")');
                    self.$('.hoverImage').css('left', self.tileWidth * (col - 1) + 'px');
                    self.$('.hoverImage').css('top', self.tileHeight * (row - 1) + 'px');

                    self.$('.hoverImage').show().css('z-index', '1');
                    //$.fn.EnableTouch('.hoverImage');
                    Utils.EnableTouch(this.$('.hoverImage'));
                }
            }
            else {
                self.hoveredTile.row = null;
                self.hoveredTile.col = null;
                self.$('.hoverImage').css('background-image', '');
                self.$('.hoverImage').css('z-index', '0').hide();
            }

        },

        /**
        * Returns the index of the raster image of the tile
        * @public
        * @method showRasterHoverImage
        * @param row {Number} row no of the tile
        * @param col {Number} col no of the tile
        * @return {Number} Index of the image of the tile hovered upon
        **/
        getIndexOfImageArray: function (row, col) {

            var self = this,
                tileRowColId = MathInteractives.Common.Components.Models.GridArea.getTileId(row, col),
                collectionModelId,
                collectionModelImage,
                index = -1,
                tileModel = self.collection.get(tileRowColId);

            if (tileModel) {
                index = tileModel.get('imageIndex');
            }

            return index;
        },

        /**
        * Hides the hover image of the grid in which tile is already drawn on mouse leave
        * @public
        * @method mouseLeaveFromHoverImage
        **/
        mouseLeaveFromHoverImage: function () {
            var self = this;

            if (!self.isDragging) {
                self.hoveredTile.row = null;
                self.hoveredTile.col = null;
                self.$('.hoverImage').css('z-index', '0').hide();
                self.$('.hoverImage').css('background-image', '');

            }


            if (0 && self.dropEvent) {
                self.isDragging = false;
                var rect = document.elementFromPoint(self.dropEvent.clientX, self.dropEvent.clientY).getBoundingClientRect();
                var offsetX = self.dropEvent.clientX - rect.left;
                var offsetY = self.dropEvent.clientY - rect.top;
                self.showRasterHoverImage(offsetX, offsetY);
                self.dropEvent = undefined;
            }
        },

        /**
        * Handler for on mouse enter on Hover Image
        * @method onMouseEnterHoverImage
        * @public
        **/
        onMouseEnterHoverImage: function onMouseEnterHoverImage() {
            this.$('.hoverImage').css('cursor', 'move');
        },

        /**
        * Calculates start and end columns
        * @method calculate
        * @public
        **/
        calculate: function () {
            var self = this,
                startColumn = self.getTilePosition(self.startPoint).col,
                startRow = self.getTilePosition(self.startPoint).row,
                endColumn = self.getTilePosition(self.endPoint).col,
                endRow = self.getTilePosition(self.endPoint).row;

            if (endRow < startRow) {
                var temp = endRow;
                endRow = startRow;
                startRow = temp;
            }
            if (endColumn < startColumn) {
                var temp = endColumn;
                endColumn = startColumn;
                startColumn = temp;
            }

        },

        /**
        * Calls the paintTemporaryTiles function to draw the tile on click of a grid
        * @public
        * @method startRasterDraw
        * @param {Number} [offsetX] X position of the tile to be drawn
        * @param {Number} [offsetY] Y position of the tile to be drawn
        **/
        startRasterDraw: function (offsetX, offsetY) {


            if (this.currentIndex === -1) {
                return;
            }

            var self = this,
                URL = self.images[self.currentIndex],
                obj = {};

            //alert(offsetX + "     " + offsetY)
            self.currentArray = [];
            self.startArray = [];

            self.selectedTilesArray = [];
            self.drawnTilesArray = [];

            var tileRow = Math.ceil(offsetY / self.tileHeight);
            var tileCol = Math.ceil(offsetX / self.tileWidth);

            if (!self.showHalfImage) {
                if (tileRow > (self.canvasHeight / self.tileHeight)) {
                    tileRow = self.canvasHeight / self.tileHeight;

                }
            }

            if (tileRow < 1) {
                tileRow = 1;
            }

            if (!self.showHalfImage) {
                if (tileCol > (self.canvasWidth / self.tileWidth)) {
                    tileCol = self.canvasWidth / self.tileWidth;

                }
            }

            if (tileCol < 1) {
                tileCol = 1;
            }

            obj.tileRow = tileRow;
            obj.tileCol = tileCol;

            self.currentArray[0] = obj;
            self.startArray[0] = obj;
            self.selectedTilesArray[0] = obj;
            this.model.set('selectedTilesArray', self.selectedTilesArray); // set the value of selected tile arrays in model

            self.drawnTilesArray[0] = obj;

            self.paintTemporaryTiles(self.startArray, URL);
            self.collection.addTiles(self.selectedTilesArray, self.currentIndex);

            self.drawStarted = true;
        },

        //log: function (text) {
        //    $('.log').html($('.log').html() + "   " + text);
        //},

        /**
        * Calls the functions to draw and remove the tiles on selection and unselection of the
        * tiles respectively on mouse drag over the canvas
        * @public
        * @method drawRasterOnMouseDrag
        **/
        drawRasterOnMouseDrag: function () {

            if (this.currentIndex === -1/* || this.player.getModalPresent()*/) {
                return;
            }

            if (this.drawStarted) {
                var self = this,
                    currView = MathInteractives.Common.Components.Views.GridArea,
                    URL = self.images[self.currentIndex],
                    obj = {},
                    model = this.model,
                    startRow = self.startArray[0].tileRow,
                    startCol = self.startArray[0].tileCol,
                    tileRow = self.getTilePosition(self.startPoint).row,
                    tileCol = self.getTilePosition(self.startPoint).col,
                    tilePos;

                if (!self.showHalfImage) {
                    if (tileRow > (self.canvasHeight / self.tileHeight)) {
                        tileRow = self.canvasHeight / self.tileHeight;
                    }
                }

                if (tileRow < 1) {
                    tileRow = 1;
                }

                if (!self.showHalfImage) {
                    if (tileCol > (self.canvasWidth / self.tileWidth)) {
                        tileCol = self.canvasWidth / self.tileWidth;

                    }
                }

                if (tileCol < 1) {
                    tileCol = 1;
                }

                //alert(tileRow + "     " + tileCol)
                //alert(self.currentArray[0].tileRow + "     " + self.currentArray[0].tileCol)




                if (tileRow === self.currentArray[0].tileRow && tileCol === self.currentArray[0].tileCol) {
                    if (tileCol === 1) {
                        tilePos = 'left';

                        this.setCanvasText('reach-extreme-text', 'left');

                        if (tileRow === 1) {
                            tilePos = 'top left';

                        }
                        else if (tileRow === self.canvasHeight / self.tileHeight) {
                            tilePos = 'bottom left'
                        }
                    }
                    else if (tileCol === self.canvasWidth / self.tileWidth) {
                        tilePos = 'right';
                        this.setCanvasText('reach-extreme-text', 'right');
                        if (tileRow === 1) {
                            tilePos = 'top right'
                        }
                        else if (tileRow === self.canvasHeight / self.tileHeight) {
                            tilePos = 'bottom right'
                        }
                    }
                    else if (tileRow === 1) {
                        tilePos = 'top';
                    }
                    else if (tileRow === self.canvasHeight / self.tileHeight) {
                        tilePos = 'bottom';
                    }


                    return;
                }
                else {
                    obj.tileRow = tileRow;
                    obj.tileCol = tileCol;
                    self.currentArray = [];
                    self.currentArray[0] = obj;

                    if (self.startArray[0].tileRow > tileRow) {
                        var temp = startRow;
                        startRow = tileRow;
                        tileRow = temp;
                    }

                    if (self.startArray[0].tileCol > tileCol) {
                        var temp = startCol;
                        startCol = tileCol;
                        tileCol = temp;
                    }

                    self.selectedTilesArray = [];

                    var count = 0;
                    for (var i = startRow; i <= tileRow; i++) {
                        for (var j = startCol; j <= tileCol; j++) {
                            obj = {};
                            obj.tileRow = i;
                            obj.tileCol = j;
                            self.selectedTilesArray.push(obj);
                            if (self.isNotErasable) {
                                self.collection.addTiles([obj], self.currentIndex);
                            }
                            this.model.set('selectedTilesArray', self.selectedTilesArray);
                            count++;
                        }
                    }

                    startRow = self.startArray[0].tileRow;
                    startCol = self.startArray[0].tileCol;
                    //alert(startRow + "    " + startCol)



                    var tilesToDrawArray = currView.getDiffArray(self.drawnTilesArray, self.selectedTilesArray);

                    //console.log(tilesToDrawArray)
                    if (!self.isNotErasable) {
                        var tilesToEraseArray = currView.getDiffArray(self.selectedTilesArray, self.drawnTilesArray);
                    }
                    //console.log(tilesToEraseArray)
                    //console.log(self.selectedTilesArray.length)

                    if (tilesToDrawArray.length > 0) {
                        self.paintTemporaryTiles(tilesToDrawArray, URL);
                        self.drawnTilesArray = self.drawnTilesArray.concat(tilesToDrawArray);
                    }
                    if (!self.isNotErasable) {
                        if (tilesToEraseArray.length > 0) {
                            self.removeTemporaryTiles(tilesToEraseArray, URL);
                            self.drawnTilesArray = currView.getDiffArray(tilesToEraseArray, self.drawnTilesArray);
                        }
                    }
                    self.drawingCanvasScope.view.draw();
                }
            }
        },

        /**
        * Removes the drawn tiles upon unselection at the time of dragging on the canvas
        * @public
        * @method removeTemporaryTiles
        * @param {Array} [array] Array of objects holding X and Y positions of the tiles to be removed
        * @param {Object} [URL] The URL or path of the image that is to be removed upon unselection
        **/
        removeTemporaryTiles: function (array, URL) {
            var children = this.drawingCanvasScope.project.activeLayer.children;
            for (var i = 0; i < array.length; i++) {

                array[i].raster.remove();
                for (var prop in children) {
                    if (children[prop]._row_no === array[i].tileRow && children[prop]._col_no === array[i].tileCol) {
                        if (children[prop]._custom_prop_id.indexOf("null_") !== -1) {
                            var str = children[prop]._custom_prop_id;
                            str = str.replace("null_", "");
                            children[prop]._custom_prop_id = str;
                        }
                    }
                }
            }
            this.getCount();
        },

        /**
        * Sets the index of the type of image to be drawn on the canvas
        * currentIndex -1 means drawing is not possible on the canvas, only dragging of the tiles, if present, is possible
        * Also a different technique is implemented for dragging in touch devices
        * @public
        * @method setCurrentIndex
        * @param {Number} [index] Index that represents the type of image to be drawn upon selection, -1 means no drawing, only dragging
        **/
        setCurrentIndex: function (index) {
            var self = this,
                image = self.images[self.currentIndex],
                Utils = MathInteractives.Common.Utilities.Models.Utils,
                isTouchDevice = MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;

            self.prevIndex = self.currentIndex;
            self.currentIndex = index;

            if (self.currentIndex === -1) {

                if (isTouchDevice) {

                    for (var i = 0; i < self.collection.length; i++) {
                        var rowNo = self.collection.models[i].get('tileRow'),
                            colNo = self.collection.models[i].get('tileCol'),
                            imageIndex = self.collection.models[i].get('imageIndex'),
                            left = (colNo - 1) * self.tileWidth,
                            top = (rowNo - 1) * self.tileHeight;

                        var grid = $('<div>', { id: 'tileImage' + i, class: 'tileDragImage', row: rowNo, col: colNo });
                        this.$el.append(grid);

                        self.$('#tileImage' + i).attr('index', imageIndex);
                        self.$('#tileImage' + i).css({
                            'position': 'absolute',
                            'width': (self.tileWidth - 1) + 'px',
                            'height': (self.tileHeight - 1) + 'px',
                            'left': (left + 1) + 'px',
                            'top': (top + 1) + 'px',
                            'background-image': 'url("' + self.images[imageIndex] + '")',
                            'background-position': '-1px -1px'
                        });
                    }

                    self.$('.tileDragImage').css('z-index', '1');
                    //$.fn.EnableTouch('.tileDragImage');
                    Utils.EnableTouch(this.$('.tileDragImage'), { specificEvents: Utils.SpecificEvents.DRAGGABLE });

                    self.$('.tileDragImage').draggable({
                        start: function (event, ui) {
                            var index = self.$('#' + event.currentTarget.id).attr('index');
                            self.isDragging = true;
                            self.isDropped = false;

                            self.$('#' + event.currentTarget.id).css('background-image', 'url("' + self.hoverImages[index] + '")');
                            self.removeTileFromCanvas1(event, ui);
                        },
                        stop: function (event, ui) {
                            self.isDragging = false;
                            var index = self.$(ui.helper).attr('index');
                            self.$(ui.helper).css('background-image', 'url("' + self.images[index] + '")');

                            if (!self.isDropped) {

                            }
                        },
                        zIndex: 2,
                        containment: '#' + self.containmentDivId,
                        revert: 'invalid'
                    });
                }
            }
            else {

                if (isTouchDevice) {
                    self.$('.tileDragImage').remove();
                    var c = document.getElementById(self.interactivityName + 'drawingCanvas');
                    var context = c.getContext("2d");
                    context.clearRect(0, 0, self.canvasWidth, self.canvasHeight);
                    //self.$('.drawingCanvas').show();
                    self.renderGrid();        /* Render to fix issue in touch devices regarding collection of tiles. */
                }
            }

        },

        /**
        * Returns the array containing the counts of different images already drawn in the canvas
        * @public
        * @method setCurrentIndex
        * @return {Array} [countArray] Array consisting the count of different images
        **/
        getCountArray: function () {
            return this.countArray;
        },

        /**
        * Clears the canvas and resets the count of different images to zero
        * @public
        * @method clearCanvasAndResetCounts
        **/
        clearCanvasAndResetCounts: function () {
            var self = this,
                c = document.getElementById(self.interactivityName + 'gridCanvas'),
                context = c.getContext("2d"),
                c1 = document.getElementById(self.interactivityName + 'drawingCanvas'),
                context1 = c1.getContext("2d");

            for (var i = 1; i <= self.numberOfImages; i++) {
                self.countArray[i - 1] = 0;
                $('.' + self.showCountInId + i).text(self.countArray[i - 1]);
            }

            self.$('.tileDragImage').remove();
            self.model.setCountArray(self.countArray);
            self.drawingCanvasScope.project.activeLayer.removeChildren();
            //self.collection.reset();
            //console.log(self.collection)
            self.collection.resetCollection();
            self.hoverCanvasRaster = null;
            context.clearRect(0, 0, self.canvasWidth, self.canvasHeight);
            context1.clearRect(0, 0, self.canvasWidth, self.canvasHeight);
        },

        /**
        * Removes the tiles upon dragging
        * @public
        * @method deleteDraggedTile
        * @param {Object} [event] Draggable event
        * @param {Object} [ui] Draggable ui
        **/
        deleteDraggedTile: function (event, ui) {
            var self = this,
                children = self.drawingCanvasScope.project.activeLayer.children,
                len = children.length,
                isTouchDevice = MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;

            for (var i = 0; i < len; i++) {

                if (children[i]._row_no === self.hoveredTile.row && children[i]._col_no === self.hoveredTile.col) {
                    children.splice(i, 1);
                    len--;
                    i--;
                }
            }

            if (!isTouchDevice) {
                self.$('.hoverImage').css('z-index', '0').hide();
                self.collection.removeTile(self.hoveredTile.row, self.hoveredTile.col);
                self.countArray[self.indexOfDraggedImage]--;
                $('.' + self.showCountInId + (self.indexOfDraggedImage + 1)).text(self.countArray[self.indexOfDraggedImage]);
            }
            else {
                var row = $(ui.draggable).attr('row');
                var col = $(ui.draggable).attr('col');
                var index = parseFloat(self.$(ui.draggable).attr('index'));

                self.collection.removeTile(row, col);
                self.$(ui.draggable).remove();
                self.countArray[index]--;
                $('.' + self.showCountInId + (index + 1)).text(self.countArray[index]);
            }

            self.isDropped = true;

        },

        /**
        * Clears the drawing canvas
        * @public
        * @method clearDrawingCanvas
        **/
        clearDrawingCanvas: function () {
            var self = this,
                c = document.getElementById(self.interactivityName + 'drawingCanvas'),
                context = c.getContext("2d");

            context.clearRect(0, 0, self.canvasWidth, self.canvasHeight);
        },

        /**
        * Returns column and row no for tile having point passed as parameter.
        * @public
        * @method getTilePosition
        * @param point {Object} having two properties x and y representing point
        * @return  {Object} having two properties row and col specifying row and column no.s
        */
        getTilePosition: function (point) {
            var rowNo = Math.ceil(point.y / this.tileHeight),
                colNo = Math.ceil(point.x / this.tileWidth);
            return { row: rowNo, col: colNo };
        },

        /**
        * sets text to canvas holder for accessibility.
        * @public
        * @method canvasArrowHandler
        * @param elemId {String} accId of the element containing message to set.
        * @param [params] {Array} containing params for getMessage
        * @param msgId {Number} message id of the element containing message to set.
        */
        setCanvasText: function setCanvasText(elemId, params, msgId) {

            var parentAccId = this.el.id;

            msgId = msgId || null;

            if (typeof elemId !== 'undefined') {



                if (msgId !== null) {

                    parentAccId = parentAccId.replace(this.idPrefix, '');
                    this.setAccMessage(parentAccId, this.getAccMessage(elemId, msgId, params));
                }
                else {

                    this.manager.setAccMessage(parentAccId, this.manager.getMessage(elemId, 0, params));
                }
            }
        },

        /**
        * Change canvas type for accessibility.
        * @public
        * @method changeCanvasType
        * @param type {String} type as mentioned in model of acc canvas.
        */
        changeCanvasType: function changeCanvasType(type) {
            var children = this.drawingCanvasScope.project.activeLayer.children,
                len = children.length;

            if (typeof type !== 'undefined') {
                //console.log(type);
                this._canvasAcc.changeCanvasAccType(type);
                this.model.setCanvasType(type);
                this.canvasType = type;
            }

            if (this.canvasType === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAG_AND_DROP && len === 0) {
                this.trigger(MathInteractives.Common.Components.Views.GridArea.ON_CANVAS_NO_ELEMENT_TO_DRAG);
            }
        },

        /**
        * Space keypress handler to handle selection in drawing mode.
        * @public
        * @method accSpaceHandler
        * @param event {Object} keypress event
        * @param data {Object} data specifying details of target and action
        */
        accSpaceHandler: function accSpaceHandler(event, data) {
            //console.log('space');
            var self = this,
                offsetX = data.point.x,
                offsetY = data.point.y,
                staticData = MathInteractives.Common.Components.Views.GridArea;

            if (data.isExpand === true) {
                self.startPoint = { x: offsetX, y: offsetY };
                self.startRasterDraw(offsetX, offsetY);
                self.setCanvasText('selection-started');
                self._canvasAcc.getFocusRect().bringToFront();
                self.trigger(staticData.SELECTION_START_ON_SPACEBAR, self.selectedTilesArray);
            }
            else {
                self.populateCollectionOnMouseUp();
                self.setCanvasText('selection-ended');
                self.trigger(staticData.SELECTION_END_ON_SPACEBAR, self.selectedTilesArray);
            }
        },

        /**
        * focus out handler to handle selection in drawing mode.
        * @public
        * @method accFocusHandler
        * @param event {Object} keypress event
        * @param data {Object} data specifying details of target and action
        */
        accFocusHandler: function accFocusHandler(event, data) {
            //console.log('focus');
            var staticData = MathInteractives.Common.Components.Views.GridArea
            this.populateCollectionOnMouseUp();
            this.setCanvasText(staticData.CANVAS_TO_DRAW_TEXT);
            this.trigger(staticData.FOCUS_OUT_OF_CANVAS);
        },

        /**
        * arrow keypress handler to handle dragging for selection in drawing mode.
        * @public
        * @method accArrowHandler
        * @param event {Object} keypress event
        * @param data {Object} data specifying details of target and action
        */
        accArrowHandler: function accArrowHandler(event, data) {
            //console.log('arrow');
            var self = this,
                currPoint = data.point,
                tilePos = self.getTilePosition(currPoint),
                offsetX = currPoint.x,
                offsetY = currPoint.y;

            this.model.set('currentTilePosition', tilePos);

            if (data.isExpand === true) {
                //Drawing mode
                //console.log('draw');
                self.startPoint = { x: offsetX, y: offsetY };
                self.setCanvasText('selection-extended-text', [tilePos.col, tilePos.row]);
                self.drawRasterOnMouseDrag();

                self.trigger(MathInteractives.Common.Components.Views.GridArea.DRAW_IMAGE_ON_ARROW);

            }
            else {
                // first space on canvas

                self.setCanvasText('select-to-start-draw-text', [tilePos.col, tilePos.row]);
                self.trigger(MathInteractives.Common.Components.Views.GridArea.SPACEBAR_AND_ARROW_KEY_EVENT);
            }
            self._canvasAcc.getFocusRect().bringToFront();
        },

        /**
        * Space keypress handler to handle drag drop in dragging mode.
        * @public
        * @method accSpaceInDragHandler
        * @param event {Object} keypress event
        * @param data {Object} data specifying details of target and action
        */
        accSpaceInDragHandler: function accSpaceInDragHandler(event, data) {
            //console.log('space drag' + data.isDrag);
            if (!data.isDrag) {
                var row = data.item._row_no,
                    col = data.item._col_no,
                    children = this.drawingCanvasScope.project.activeLayer.children,
                    len = children.length,
                    newRow = this.getTilePosition(this.navigatePoint).row,
                    newCol = this.getTilePosition(this.navigatePoint).col,
                    newChildren,
                    currentRow, currentCol, currentTile;
                // Remove element on drop
                this.removeTileFromCanvas(col, row);
                this.$('.hoverImage').css('z-index', '0').hide();
                for (var i = 0; i < len; i++) {
                    if (children[i]._row_no === row && children[i]._col_no === col) {
                        children.splice(i, 1);
                        len--;
                        i--;
                    }
                }

                currentTile = this.getIndexOfImageArray(row, col);
                this.trigger(MathInteractives.Common.Components.Views.GridArea.ON_CANVAS_ELEMENT_DROP, currentTile, this.tileToReplace);
                this.collection.removeTile(row, col);

                // Add new tile
                this.paintTemporaryTiles([{ tileRow: newRow, tileCol: newCol}], this.images[this.indexOfDraggedImage]);
                this.collection.addTiles([{ tileRow: newRow, tileCol: newCol}], this.indexOfDraggedImage);
                this.copyTilesFromDrawingCanvasToGridCanvas();

                // Update paper items array in canvas for acc of draggables.
                this.updatePaperItems();

                // update counts.
                this.getCount();

                // Show hover state to new current element
                currentRow = this._canvasAcc.getCurrentPaperItem()._row_no;
                currentCol = this._canvasAcc.getCurrentPaperItem()._col_no;
                this.showImageOnTile(currentRow, currentCol);
                this.trigger(MathInteractives.Common.Components.Views.GridArea.ELEMENT_TO_START_DRAG, row, col, currentTile);
            }
        },

        /**
        * focus out handler to handle selection in dragging mode.
        * @public
        * @method accFocusOutInDragHandler
        * @param event {Object} keypress event
        * @param data {Object} data specifying details of target and action
        */
        accFocusOutInDragHandler: function accFocusOutInDragHandler(event, data) {
            //console.log('focus drag');
            this.$('.hoverImage').css('z-index', '0').hide();
            this.hoveredTile.row = null;
            this.hoveredTile.col = null;
            this.setCanvasText(MathInteractives.Common.Components.Views.GridArea.CANVAS_TO_DRAG_TEXT);
        },

        /**
        * arrow keypress handler to handle navigation in dragging mode.
        * @public
        * @method accArrowInDragHandler
        * @param event {Object} keypress event
        * @param data {Object} data specifying details of target and action
        */
        accArrowInDragHandler: function accArrowInDragHandler(event, data) {
            //console.log('arrow drag: ');
            var row = this.getTilePosition(data.point).row,
                col = this.getTilePosition(data.point).col,
                imageIndex;

            this.navigatePoint = data.point;

            imageIndex = this.getIndexOfImageArray(row, col);
            this.setCanvasText('navigate-to-drop-text', [row, col]);

            if (imageIndex !== -1) {
                this.trigger(MathInteractives.Common.Components.Views.GridArea.ELEMENT_PRESENT_ON_CANVAS_DRAG, row, col, imageIndex);
                this.tileToReplace = imageIndex;
            }
            else {
                this.tileToReplace = null;
            }
        },

        /**
        * tab handler to handle selection in dragging mode.
        * @public
        * @method accTabInDragHandler
        * @param event {Object} keypress event
        * @param data {Object} data specifying details of target and action
        */
        accTabInDragHandler: function accTabInDragHandler(event, data) {
            //console.log('tab drag')
            var row = data.item._row_no, //data.item.get('tileRow'),
                col = data.item._col_no, //data.item.get('tileCol');
                indexOfDraggedImage = this.getIndexOfImageArray(row, col);

            this.showImageOnTile(row, col);
            this.trigger(MathInteractives.Common.Components.Views.GridArea.ELEMENT_TO_START_DRAG, row, col, indexOfDraggedImage);
        },

        /**
        * updates paper items drawn for canvas access..
        * @public
        * @method updatePaperItems
        * @param event {Object} keypress event
        * @param data {Object} data specifying details of target and action
        */
        updatePaperItems: function updatePaperItems(event, data) {
            var children = this.drawingCanvasScope.project.activeLayer.children,
                len = children.length,
                paperItems = [];
            if (typeof this._canvasAcc !== 'undefined') {
                for (var i = 0; i < len; i++) {
                    // Push valid children having row and column no.s to paper item's array.
                    if (typeof children[i]._custom_prop_id !== 'undefined' && children[i]._custom_prop_id.indexOf("null_") === -1) {
                        paperItems.push(children[i]);
                    }
                }

                this._canvasAcc.updatePaperItems(paperItems);
            }
        }

    },
                                                                                                         {

        /**
        * Returns the difference between the received arrays i.e. the tiles to be drawn if selection is made by dragging over already
        * drawn tiles
        *
        * @method getDiffArray
        * @param {Array} [array1] Array of objects containing the X and Y positions of the entire selection
        * @param {Array} [array2] Array of objects containing the X and Y positions of the already drawn tiles
        * @return {Array} [array3] Array of objects containing the X and Y positions of the tiles to be drawn i.e. array1 - array2
        **/
        getDiffArray: function (array1, array2) {
            var array3 = [], count;

            for (var i = 0; i < array2.length; i++) {
                count = 0;
                for (var j = 0; j < array1.length; j++) {

                    if (array2[i].tileRow !== array1[j].tileRow || array2[i].tileCol !== array1[j].tileCol) {
                        count++;
                    }
                }

                if (count === array1.length) {
                    array3.push(array2[i]);
                }
            }
            return array3;
        },

        /**
        * accId for text change from interactivity on focus on canvas to start dragging tiles
        *
        * @property CANVAS_TO_DRAG_TEXT
        * @type String
        * @final
        **/
        CANVAS_TO_DRAG_TEXT: 'canvas-to-drag-text',

        /**
        * accId for text change from interactivity on focus on canvas to start drawing tiles
        *
        * @property CANVAS_TO_DRAW_TEXT
        * @type String
        * @final
        **/
        CANVAS_TO_DRAW_TEXT: 'canvas-to-draw-text',

        /**
        * fired in accessibility on element in canvas is dropped
        *
        * @property ON_CANVAS_ELEMENT_DROP
        * @static
        **/
        ON_CANVAS_ELEMENT_DROP: 'canvas-element-dropped',

        /**
        * fired in accessibility if element is present where dragged element to be dropped
        *
        * @property ELEMENT_PRESENT_ON_CANVAS_DRAG
        * @type string
        * @static
        **/
        ELEMENT_PRESENT_ON_CANVAS_DRAG: 'canvas-element-present',

        /**
        * accId for text change from interactivity on tile added on drop
        *
        * @property TILE_ADDED_TEXT
        * @type String
        * @final
        **/
        TILE_ADDED_TEXT: 'tile-added-text',

        /**
        * accId for text change from interactivity on tile replaced by another on drop
        *
        * @property TILE_REPLACED_TEXT
        * @type String
        * @final
        **/
        TILE_REPLACED_TEXT: 'tile-replaced-text',

        /**
        * accId for text change from interactivity on navigation and tile present already
        *
        * @property TILE_ALREADY_PRESENT_TEXT
        * @type String
        * @final
        **/
        TILE_ALREADY_PRESENT_TEXT: 'tile-present-text',

        /**
        * accId for text change from interactivity on navigation through tiles to start drag
        *
        * @property TILE_TO_DRAG_TEXT
        * @type String
        * @final
        **/
        TILE_TO_DRAG_TEXT: 'tile-to-drag-text',

        /**
        * accId for text change from interactivity on no element  present to drag
        *
        * @property ON_CANVAS_NO_ELEMENT_TO_DRAG
        * @type String
        * @final
        **/
        ON_CANVAS_NO_ELEMENT_TO_DRAG: 'no-element-to-drag-text',

        /**
        * accId for text change from interactivity on tab to start element drag
        *
        * @property ELEMENT_TO_START_DRAG
        * @type String
        * @final
        **/
        ELEMENT_TO_START_DRAG: 'element-to-start-drag-text',

        /**
        * Event triggered by space click
        * @property SELECTION_START_ON_SPACEBAR
        * @type string
        * @static
        **/
        SELECTION_START_ON_SPACEBAR: 'selection-start-on-space-click',

        /**
        * Event triggered at end of selection
        * @property SELECTION_END_ON_SPACEBAR
        * @type string
        * @static
        **/
        SELECTION_END_ON_SPACEBAR: 'selection-end-on-space-click',

        /**
        * Triggers DRAW_IMAGE_ON_ARROW
        * @property DRAW_IMAGE_ON_ARROW
        * @type string
        * @static
        **/
        DRAW_IMAGE_ON_ARROW: 'image-is-draw-on-arrow',

        /**
        * Event triggered by arrow and spacebar
        * @property SPACEBAR_AND_ARROW_KEY_EVENT
        * @type string
        * @static
        **/
        SPACEBAR_AND_ARROW_KEY_EVENT: 'spacebar-on-parent-of-canvas',

        /**
        * Event triggered by focus out on canvas
        * @property FOCUS_OUT_OF_CANVAS
        * @type string
        * @static
        **/
        FOCUS_OUT_OF_CANVAS: 'focus-out-from-canvas'
    });

})();
