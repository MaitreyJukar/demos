(function () {
    'use strict';
    /***
    *
    *
    ***/
    MathInteractives.Common.Player.Models.CanvasAcc = Backbone.Model.extend({
        defaults: function () {
            return {
                /* Stores type to be deal with canvas
                * @deafult MathInteractives.Common.Player.Models.CanvasAcc.TYPE.NAVIGATE_ITEM
                * @property type
                * @type {String}
                */
                type: MathInteractives.Common.Player.Models.CanvasAcc.TYPE.NAVIGATE_ITEM,

                /* Stores the collection object of model CanvasItem
                * @deafult null
                * @property collectionCanvasItems
                * @type {object}
                */
                collectionCanvasItems: null,

                /*
                * Line drawing enabled on tool
                * @property isToolLineDrawingOn
                * @type {boolean}
                * @default false
                */
                isToolLineDrawingOn: false,

                /*
                * paperItems in which tab to be move
                * @property paperItems
                * @type {object}
                * @default []
                */
                paperItems: [],

                /*
                * paper scope of the interactive
                * @property paperScope
                * @defaule null
                * @type {object}
                */
                paperScope: null,

                /*
                * Grid cell details
                * @property gridCell
                * @defaule null
                * @type {object}
                */
                gridCell: {
                    size: {
                        width: null,
                        height: null
                    },
                    origin: {
                        x: 0,
                        y: 0
                    }
                },

                /*
                * Min and max limit for grid area
                * @property gridContainment
                * @defaule null
                * @type {object}
                */
                gridContainment: {
                    minX: null,
                    maxX: null,
                    minY: null,
                    maxY: null
                },

                /*
                * Stores focus rect size
                * @property focusRectSize
                * @defaule null
                * @type {object}
                */
                focusRectSize: null,


                /*
                * Stores focus rect color
                * @property focusRectColor
                * @defaule null
                * @type {String}
                */
                focusRectColor: '#000000',

                /*
                * Stores focus rect color
                * @property focusRectBorderWidth
                * @defaule 1
                * @type {Number}
                */
                focusRectBorderWidth: 1,

                /*
                * Stores focus rect current position
                * @property focusCurrentPosition
                * @defaule null
                * @type {object}
                */
                focusCurrentPosition: null,

                /*
                * Stores array of events on which self focus will be restricted
                * @property selfFocusDisableEvents
                * @type {Array}
                * @default null
                */
                selfFocusDisableEvents: null,

                /*
                * details required to draw the focus rect on the tool
                * @property detailsForFocusRect
                * @default {size: {width: 50,height: 50},gridCellSize: 50, canvasBounds: {minX: 0,maxX: 600,minY: 0,maxY: 400}}
                * @type {object}
                */
                detailsForFocusRect: {
                    size: {
                        width: 0,
                        height: 0
                    },
                    gridCellSize: 50, canvasBounds: {
                        minX: 0,
                        maxX: 600,
                        minY: 0,
                        maxY: 400
                    }
                },

                setAccMessageObject: {/* this will trigger event in view to change acc message,
                                    but need to update entire object as trigger does not fire
                                    for its inner properties*/

                    elementId: null,
                    strMessage: null

                },

                /**
                * Disable set self focus when space is pressed.
                * @attribute disableSelfFocusOnSpace
                * @default false
                * @type Boolean
                */
                disableSelfFocusOnSpace :  false
            }

        },
        /* Initialize of the model
        * @method intialize
        * @constructor
        */
        initialize: function () {
            var collectionCanvasItems = new MathInteractives.Common.Player.Collections.CanvasItems();

            this.set('collectionCanvasItems', collectionCanvasItems);

            this._lineDrawingBoolchange();

        },



        /*Attach events
        * @method _attachEvents
        *
        */
        _attchEvents: function _attchEvents() {
            this.on('change:isToolLineDrawingOn', this._lineDrawingBoolchange);
        },

        /* sets/resets collection as per change
        * @method _lineDrawingBoolchange
        *
        */
        _lineDrawingBoolchange: function _lineDrawingBoolchange() {
            if (this.get('isToolLineDrawingOn') === true) {
                this.set('paperItems', []);
            }

            this.setCollectionCanvasItems(this.get('paperItems'));

        },

        /* adds paperItems passed to this model to the collection
        * @method setCollectionCanvasItems
        * @param {object} items array of paper items
        * @public
        */
        setCollectionCanvasItems: function setCollectionCanvasItems(items, isKeepCurrentItem) {

            var collectionCanvasItems = this.get('collectionCanvasItems'), isCurrentItemSet = false, item, CanvasItem = MathInteractives.Common.Player.Models.CanvasItem, paperScope = this.get('paperScope');

            //reseting the collection
            collectionCanvasItems.reset();

            //updating the collection
            for (var index in items) {
                item = new CanvasItem({ paperItem: items[index], paperScope: paperScope });
                collectionCanvasItems.add(item);

                if (!isKeepCurrentItem && Number(index) === 0) {
                    //setting the 0th item as initial
                    collectionCanvasItems.setCurrentItem(item);
                    isCurrentItemSet = true;
                }
            }

            if (!isCurrentItemSet && collectionCanvasItems.getCurrentItem()) {
                var currentPaperItem = collectionCanvasItems.length > 0 ? collectionCanvasItems.getCurrentItem().get('paperItem') : null;
                if (currentPaperItem) {
                    this.setCollectionCurrentItem(currentPaperItem);
                }
                else {
                    collectionCanvasItems.setCurrentItem(currentPaperItem);
                }
            }

            this.set('collectionCanvasItems', collectionCanvasItems);
        },

        /* Find given paper item in collection and set it as currnt item
        * @method setCollectionCurrentItem
        * @param {object} paper item
        * @public
        */
        setCollectionCurrentItem: function setCollectionCurrentItem(currentPaperItem) {
            var collectionCanvasItems = this.get('collectionCanvasItems'),
                item = collectionCanvasItems.where({ paperItem: currentPaperItem });

            if (item[0]) {
                collectionCanvasItems.setCurrentItem(item[0]);
                return true;
            }
            else {
                return false;
            }

        },

        /* Return current item index
        * @method getCollectionCurrentItemIndex
        * @param null
        * @public
        */
        getCollectionCurrentItemIndex: function getCollectionCurrentItemIndex() {
            return this.get('collectionCanvasItems').getCurrentItemIndex();
        },

        /* Return current item
        * @method getCollectionCurrentItem
        * @param null
        * @public
        */
        getCollectionCurrentItem: function getCollectionCurrentItem() {
            return this.get('collectionCanvasItems').getCurrentItem().get('paperItem');
        }


    }, {
        TYPE: {
            DRAW_LINE: 'canvas-type-draw-line',
            NAVIGATE_ITEM: 'canvas-type-navigate-item',
            NAVIGATE_LINE: 'canvas-type-navigate-line',
            DRAW_AND_EXPAND: 'canvas-type-draw-and-expand',
            DRAG_AND_DROP: 'canvas-type-drag-and-drop'
        },

        CANVAS_EVENTS: {
            FOCUS_OUT: 'focus-out'

        },
        ITEM_EVENTS: {
            ITEM_FOCUS_OUT: 'item-focus-out'

        },

        CANVAS_KEY_EVENTS: {
            TAB: 'canvas-tab-key',
            SPACE: 'canvas-space-key',
            ARROW: 'canvas-arrow-key',
            ESCAPE: 'canvas-escape-key',
            DELETE: 'canvas-delete-key',
            ROTATE_CLOCKWISE: 'canvas-rotate-clockwise-key',
            ROTATE_ANTI_CLOCKWISE: 'canvas-rotate-anti-clockwise-key'
        },

        DRAW_LINE_EVENTS: {
            SPACE: 'canvas-draw-line-events-space',
            ARROW: 'canvas-draw-line-events-arrow',
            FOCUS_OUT: 'canvas-draw-line-events-focus-out',
            ESCAPE: 'canvas-draw-line-events-escape'
        },

        DRAW_AND_EXPAND_EVENTS: {
            SPACE: 'canvas-draw-and-expand-events-space',
            ARROW: 'canvas-draw-and-expand-events-arrow',
            FOCUS_OUT: 'canvas-draw-and-expand-events-focus-out',
            ESCAPE: 'canvas-draw-and-expand-events-escape'
        },

        DRAG_AND_DROP_EVENTS: {
            TAB: 'canvas-drag-and-drop-events-tab',
            SPACE: 'canvas-drag-and-drop-events-space',
            ARROW: 'canvas-drag-and-drop-events-arrow',
            FOCUS_OUT: 'canvas-drag-and-drop-events-focus-out',
            ESCAPE: 'canvas-drag-and-drop-events-escape',
            ROTATE_CLOCKWISE: 'canvas-drag-and-drop-events-rotate-clockwise',
            ROTATE_ANTI_CLOCKWISE: 'canvas-drag-and-drop-events-rotate-anti-clockwise',
            DELETE: 'canvas-drag-and-drop-events-delete'
        },

        CANVAS_KEYUP_EVENTS: {
            ANY_KEYUP: 'canvas-any-key-up',
            SPACE_KEYUP: 'canvas-space-key-up',
            ENTER_KEYUP: 'canvas-enter-key-up',
            ARROW_KEYUP: 'canvas-arrow-key-up',
            DELETE_KEYUP: 'canvas-delete-key-up',
            ROTATION_KEYUP: 'canvas-rotation-key-up',
            CLOCKWISE_ROTATION_KEYUP: 'canvas-clockwise-rotation-key-up',
            ANTI_CLOCKWISE_ROTATION_KEYUP: 'canvas-anti-clockwise-rotation-key-up',
            LEFT_ARROW_KEYUP: 'canvas-left-arrow-key-up',
            RIGHT_ARROW_KEYUP: 'canvas-right-arrow-key-up',
            UP_ARROW_KEYUP: 'canvas-up-arrow-key-up',
            DOWN_ARROW_KEYUP: 'canvas-down-arrow-key-up',
        },

        KEYUP_TIMER: 300
    });

})();
