/* globals _, MathUtilities, $, window   */

(function() {
    'use strict';
    MathUtilities.Components.CanvasAcc.Views.CanvasAcc = Backbone.View.extend({

        /*
         * paper scope of the interactive
         * @property _paperScope
         * @default null
         * @type {object}
         */
        "_paperScope": null,

        /*
         * Focus rect details needed to draw focus rect
         * @property _detailsForFocusRect
         * @default null
         * @type {object}
         */
        "_detailsForFocusRect": null,

        /*
         * instance of accManager
         * @property accManager
         * @default null
         * @type {object}
         */
        "accManager": null,

        /*
         * stores whether it is start of canvas or not
         * @property _isStart
         * @default true
         * @type {boolean}
         */
        "_isStart": true,

        /*
         * stores whether expand true or false for draw and expand type
         * @property isExpand
         * @default false
         * @type {boolean}
         */
        "isExpand": false,

        /*
         * stores whether tile is in dragging mode
         * @property isDrag
         * @default false
         * @type {boolean}
         */
        "isDrag": false,

        /*
         * stores whether shift is pressed
         * @property _isShiftDown
         * @default false
         * @type {boolean}
         */
        "_isShiftDown": false,

        /*
         * stores current focus rect object
         * @property _currentFocusRect
         * @default null
         * @type {Object}
         */
        "_currentFocusRect": null,

        /*
         * stores previous text to check for jaws issue 'text doesn't read' on same text changed again.
         * @property prevText
         * @default ''
         * @type {String}
         */
        "prevText": '',

        /*
         * stores last event triggered.
         * @property lastTriggeredEvent
         * @default null
         * @type {String}
         */
        "lastTriggeredEvent": null,
        /*
         * Stores the most recent key up event.
         * @property _lastArrowKeyUpEvent
         * @default null
         * @type {Object}
         */
        "_lastArrowKeyUpEvent": null,
        /*
         * Stores the item on which the most recent key up event was fired.
         * @property _lastArrowKeyUpItem
         * @default null
         * @type {Object}
         */
        "_lastArrowKeyUpItem": null,
        /*
         * Stores the number of times key down has been fired before the next key down.
         * @property _previousArrowKeyDownCount
         * @default 0
         * @type {Number}
         */
        "_previousArrowKeyDownCount": 0,
        /*
         * Stores the number of times key down has been fired.
         * @property _currentArrowKeyDownCount
         * @default 0
         * @type {Number}
         */
        "_currentArrowKeyDownCount": 0,
        /*
         * Stores the window interval for triggering key up.
         * @property _keyUpInterval
         * @default null
         * @type {Number}
         */
        "_keyUpInterval": null,

        "initialize": function() {
            //initialization
            var model = this.model,
                type = model.get('type'),
                TYPE = MathUtilities.Components.CanvasAcc.Models.CanvasAcc.TYPE;
            this._paperScope = model.get('paperScope');
            this.accManager = model.get('accManager');

            this.render();
            this._bindEvents();

            /*Initialize draw line focus rect parameters*/
            if ([TYPE.DRAW_LINE, TYPE.DRAW_AND_EXPAND, TYPE.DRAG_AND_DROP].indexOf(type) > -1) {
                this.initGridFocusRectDetails();
            }
        },

        "render": function() {
            /*create div to set temp focus*/
            var canvasHolderID = this.model.get('canvasHolderID'),
                canvasAccHackDiv = this.$('.acc-read-elem'),
                tempDivDimention = {
                    "height": '1px',
                    "width": '1px',
                    "top": '1px',
                    "left": '1px'
                },
                style,
                $tempFocusDiv,
                hackDivOptions,
                tempDivHack;

            if (canvasAccHackDiv) {
                tempDivDimention.height = canvasAccHackDiv.height();
                tempDivDimention.width = canvasAccHackDiv.width();

                tempDivDimention.top = canvasAccHackDiv.css('top');
                tempDivDimention.left = canvasAccHackDiv.css('left');
            }
            style = 'position: absolute; height: ' + tempDivDimention.height + '; width: ' + tempDivDimention.width +
                '; top: ' + tempDivDimention.top + '; left: ' + tempDivDimention.left + '; outline: none';

            $tempFocusDiv = $('<div>', {
                "id": canvasHolderID + '-temp-focus-div',
                "style": style
            });
            this.$el.prepend($tempFocusDiv);

            /*Generate acc for canvas temp focus*/
            hackDivOptions = {
                "elementId": canvasHolderID + '-temp-focus-div'
            };
            this.accManager.createAccDiv(hackDivOptions);

            tempDivHack = $tempFocusDiv.find('.acc-read-elem');
            if (tempDivHack) {
                tempDivHack.css('outline', 'none');
            }
        },

        /*
         * Initialize focus rect position and size
         * @method initGridFocusRectDetails
         * @private
         */
        "initGridFocusRectDetails": function() {
            var model = this.model,
                origin = model.get('gridCell').origin,
                gridCellSize = model.get('gridCell').size,
                currentPosition = {
                    "x": origin.x,
                    "y": origin.y
                },
                focusRectSize = {
                    "width": gridCellSize.width,
                    "height": gridCellSize.height
                };

            if (!model.get('focusCurrentPosition')) {
                model.set('focusCurrentPosition', currentPosition);
            }

            if (!model.get('focusRectSize')) {
                model.set('focusRectSize', focusRectSize);
            }
        },

        /*
         * Contains all event binding related canvas accessibility
         * @method _bindEvents
         * @private
         */
        "_bindEvents": function() {
            var model = this.model,
                isKeepCurrentItem;

            this.$el.on("keydown", _.bind(this._handleKeyDownEvent, this));
            this.$el.on("keyup", _.bind(this._handleKeyUpEvent, this));
            /*update paper items on change*/
            model.on('change:paperItems', function() {
                isKeepCurrentItem = !!model.get('isKeepCurrentItem');
                model.setCollectionCanvasItems(model.get('paperItems'), isKeepCurrentItem);
            });

            model.on('change:setAccMessageObject', _.bind(function() {
                this._updateHolderAccMessage();
            }, this));
        },
        "_updateHolderAccMessage": function _updateHolderAccMessage() {
            var setMessageObject = this.model.get('setAccMessageObject'),
                elementId = setMessageObject.elementId;

            this.accManager.setAccMessage(elementId, setMessageObject.strMessage);
            this._setSelfFocus();
            this.accManager.setFocus(elementId); // temp fix as we want to set focus to canvas holder again update the function set self focus
        },

        /*
         * Handle key down event on canvas area
         * @method _handleKeyDownEvent
         * @param {object} event
         * @private
         */
        "_handleKeyDownEvent": function(event) {
            this._isShiftDown = event.shiftKey;
            var keyCode = event.keyCode,
                type = this.model.get('type'),
                isFirstSpace = false,
                TYPE = MathUtilities.Components.CanvasAcc.Models.CanvasAcc.TYPE,
                KEYS = MathUtilities.Components.CanvasAcc.Views.CanvasAcc.KEYS,
                itemCollection = this.model.get('collectionCanvasItems'),
                currentCanvasItem;

            if (keyCode === KEYS.SPACE && this._isStart) {
                //setCurrentItem
                this._isStart = false;
                isFirstSpace = true;
            }

            if (!this._isStart) {
                if ([TYPE.NAVIGATE_ITEM, TYPE.NAVIGATE_LINE, TYPE.DRAG_AND_DROP].indexOf(type) > -1) {

                    itemCollection = this.model.get('collectionCanvasItems');
                    currentCanvasItem = itemCollection.getCurrentItem();

                    if (currentCanvasItem !== null) {
                        /*Handle escape*/
                        if (event.keyCode === KEYS.ESCAPE) {
                            this._handleEscape(type, currentCanvasItem);
                            return void 0;
                        }

                        if ((itemCollection.hasNext() && !this._isShiftDown) || (itemCollection.hasPrev() && this._isShiftDown) || keyCode !== KEYS.TAB) {
                            switch (keyCode) {
                                case KEYS.TAB:
                                    event.preventDefault();

                                    if (event.shiftKey) {
                                        itemCollection.prev();
                                    } else {
                                        //set next canvas element
                                        itemCollection.next();
                                    }
                                    this._triggerCurrentItemFocusOutEvent(event, currentCanvasItem);

                                    currentCanvasItem = itemCollection.getCurrentItem();
                                    this._handleTab(type, currentCanvasItem, event);
                                    break;
                                case KEYS.SPACE:
                                case KEYS.ENTER:
                                    if (isFirstSpace) {
                                        this._handleTab(type, currentCanvasItem, event);
                                    } else {
                                        this._handleSpace(type, currentCanvasItem, event);
                                    }
                                    break;
                                case KEYS.LEFTARROW:
                                case KEYS.RIGHTARROW:
                                case KEYS.UPARROW:
                                case KEYS.DOWNARROW:
                                    event.preventDefault();
                                    if (type === TYPE.DRAG_AND_DROP) {
                                        this._hadleGridNavigation(type, keyCode, isFirstSpace, currentCanvasItem);
                                    } else {
                                        this._handleArrows(currentCanvasItem, keyCode);
                                    }
                                    this._handleArrowUpTrigger();
                                    break;
                                case KEYS.DELETE:
                                    this._handleDelete(type, currentCanvasItem);
                                    break;
                                case KEYS.ROTATE_CLOCKWISE:
                                case KEYS.ROTATE_ANTI_CLOCKWISE:
                                    this._handleRotate(type, currentCanvasItem, keyCode);
                                    break;
                            }
                            if (this._paperScope) {
                                this._paperScope.view.draw();
                            }
                        } else {
                            this._handleFocusOut(type, currentCanvasItem);
                        }
                    } else {
                        this._isStart = true;
                    }
                } else if (type === TYPE.DRAW_LINE) {
                    //handling tabs on tool and generating dashed boxes for focus rect
                    switch (keyCode) {
                        case KEYS.SPACE:
                        case KEYS.ENTER:
                            if (isFirstSpace) {
                                this._hadleGridNavigation(type, keyCode, isFirstSpace);
                            } else {
                                this._handleDrawLineSpace();
                            }
                            break;
                        case KEYS.LEFTARROW:
                        case KEYS.RIGHTARROW:
                        case KEYS.UPARROW:
                        case KEYS.DOWNARROW:
                            event.preventDefault();
                            this._hadleGridNavigation(type, keyCode, isFirstSpace);
                            break;
                        case KEYS.TAB:
                            this._handleGridNavigationFocusOut(type);
                            break;
                        case KEYS.ESCAPE:
                            this._handleEscape(type);
                            break;
                    }
                } else if (type === TYPE.DRAW_AND_EXPAND) {
                    //handle space and arrow for drawing and expanding particular part in canvas
                    switch (keyCode) {
                        case KEYS.SPACE:
                        case KEYS.ENTER:
                            if (isFirstSpace) {
                                this._hadleGridNavigation(type, keyCode, isFirstSpace);
                            } else {
                                this._handleDrawAndExpandSpace(keyCode, isFirstSpace);
                            }
                            break;
                        case KEYS.LEFTARROW:
                        case KEYS.RIGHTARROW:
                        case KEYS.UPARROW:
                        case KEYS.DOWNARROW:
                            event.preventDefault();
                            this._hadleGridNavigation(type, keyCode, isFirstSpace);
                            break;
                        case KEYS.TAB:
                            this._handleGridNavigationFocusOut(type);
                            break;
                        case KEYS.ESCAPE:
                            this._handleEscape(type);
                            break;
                    }
                }
            }
        },

        /*
         * trigger event on tab of paper item so calling current items focus out object
         * @method _triggerCurrentItemFocusOutEvent
         * @param {Object} event
         * @param {Object} currentCanvasItem model of item on which tab is pressed
         * @private
         */
        "_triggerCurrentItemFocusOutEvent": function(event, currentCanvasItem) {

            var eventObject = {
                "item": currentCanvasItem.get('paperItem'),
                "event": {
                    "which": 1,
                    "shiftKey": event.shiftKey
                },
                "isAccessibility": true,
                "isArrowKey": false
            };

            this.$el.trigger(MathUtilities.Components.CanvasAcc.Models.CanvasAcc.ITEM_EVENTS.ITEM_FOCUS_OUT, eventObject);

        },
        /*
         * Handles key up events on the canvas area
         * @method _handleKeyUpEvent
         * @param {Object} event
         * @private
         */
        "_handleKeyUpEvent": function(event) {

            var keyCode = event.keyCode,
                type = this.model.get('type'),
                itemCollection = this.model.get('collectionCanvasItems'),
                currentCanvasItem = itemCollection.getCurrentItem(),
                currentObject = null,
                KEYS = MathUtilities.Components.CanvasAcc.Views.CanvasAcc.KEYS,
                CANVAS_KEYUP_EVENTS = MathUtilities.Components.CanvasAcc.Models.CanvasAcc.CANVAS_KEYUP_EVENTS;

            if (event.keyCode === KEYS.TAB) {
                return void 0;
            }

            if (currentCanvasItem !== null) {
                currentObject = currentCanvasItem.get('paperItem');
                switch (keyCode) {
                    case KEYS.SPACE:
                        this.$el.trigger(CANVAS_KEYUP_EVENTS.SPACE_KEYUP, [event, keyCode, currentObject]);
                        break;
                    case KEYS.ENTER:
                        this.$el.trigger(CANVAS_KEYUP_EVENTS.ENTER_KEYUP, [event, keyCode, currentObject]);
                        break;
                    case KEYS.LEFTARROW:
                    case KEYS.RIGHTARROW:
                    case KEYS.UPARROW:
                    case KEYS.DOWNARROW:
                        event.preventDefault();
                        this._lastArrowKeyUpEvent = event;
                        this._lastArrowKeyUpItem = currentObject;
                        break;
                    case KEYS.DELETE:
                        this.$el.trigger(CANVAS_KEYUP_EVENTS.DELETE_KEYUP, [event, keyCode, currentObject]);
                        break;
                    case KEYS.ROTATE_CLOCKWISE:
                    case KEYS.ROTATE_ANTI_CLOCKWISE:
                        this._handleRotationKeyUp(event, keyCode, currentObject);
                        this.$el.trigger(CANVAS_KEYUP_EVENTS.ROTATION_KEYUP, [event, keyCode, currentObject]);
                        break;
                    default:
                        break;
                        // Return to prevent common key up event from firing on key up of any other keys
                }
                // Triggers common key up event on key up of any of the above keys
                this._handleAnyKeyUp(type, currentObject, event, keyCode);

            }
        },

        /*
         * Triggers a custom event when key up is fired on the canvas
         * @method _handleKeyUp
         * @param {String} type Stores type of the canvas item to be dealt with
         * @param {Object} currentCanvasItem Stores a reference to the current canvas item
         * @param {Object} event Event object
         * @param {Number} keyCode Key code of the key whose up has been fired
         * @private
         */
        "_handleAnyKeyUp": function(type, currentCanvasItem, event, keyCode) {

            this.$el.trigger(MathUtilities.Components.CanvasAcc.Models.CanvasAcc.CANVAS_KEYUP_EVENTS.ANY_KEYUP, [event, keyCode, currentCanvasItem]);
        },
        /*
         * Triggers custom events when key up of a rotation handler is fired on the canvas
         * @method _handleRotationKeyUp
         * @param {Object} event Event object
         * @param {Number} keyCode Key code of the key whose up has been fired
         * @param {Object} currentCanvasItem Stores a reference to the current canvas item
         * @private
         */
        "_handleRotationKeyUp": function(event, keyCode, currentCanvasItem) {
            var KEYS = MathUtilities.Components.CanvasAcc.Views.CanvasAcc.KEYS,
                CANVAS_KEYUP_EVENTS = MathUtilities.Components.CanvasAcc.Models.CanvasAcc.CANVAS_KEYUP_EVENTS;
            switch (keyCode) {
                case KEYS.ROTATE_CLOCKWISE:
                    this.$el.trigger(CANVAS_KEYUP_EVENTS.CLOCKWISE_ROTATION_KEYUP, [event, keyCode, currentCanvasItem]);
                    break;
                case KEYS.ROTATE_ANTI_CLOCKWISE:
                    this.$el.trigger(CANVAS_KEYUP_EVENTS.ANTI_CLOCKWISE_ROTATION_KEYUP, [event, keyCode, currentCanvasItem]);
                    break;
            }
        },

        /*
         * JAWS handles arrow keys differently. When any arrow key is held down, key down and key up events are fired simultaneously.
         * To overcome this, this function checks whether another key down has occurred within a set timer before the key up is fired.
         * If another key down has been fired, the key up event won't be triggered.
         *
         * @method _handleArrowUpTrigger
         * @private
         */
        "_handleArrowUpTrigger": function() {
            var KEYUP_TIMER = MathUtilities.Components.CanvasAcc.Models.CanvasAcc.KEYUP_TIMER;

            this._previousArrowKeyDownCount = this._currentArrowKeyDownCount;
            this._currentArrowKeyDownCount++;
            if (this._previousArrowKeyDownCount === 0) {
                if (this._keyUpInterval) {
                    window.clearInterval(this._keyUpInterval);
                }
                this._keyUpInterval = window.setInterval(_.bind(function() {
                    if (this._previousArrowKeyDownCount === this._currentArrowKeyDownCount) {
                        window.clearInterval(this._keyUpInterval);
                        this._keyUpInterval = null;
                        this._previousArrowKeyDownCount = 0;
                        this._currentArrowKeyDownCount = 0;
                        this._handleArrowKeyUp();
                        this._lastArrowKeyUpEvent = null;
                    } else {
                        if (this._lastArrowKeyUpEvent) {
                            this._previousArrowKeyDownCount = this._currentArrowKeyDownCount;
                        }
                    }
                }, this), KEYUP_TIMER);
            }
        },

        /*
         * Triggers custom events when key up of an arrow key is fired on the canvas.
         * @method _handleArrowKeyUp
         * @private
         */
        "_handleArrowKeyUp": function() {
            if (this._lastArrowKeyUpEvent) {
                var currentCanvasItem = this._lastArrowKeyUpItem,
                    event = this._lastArrowKeyUpEvent,
                    keyCode = event.keyCode,
                    KEYS = MathUtilities.Components.CanvasAcc.Views.CanvasAcc.KEYS,
                    CANVAS_KEYUP_EVENTS = MathUtilities.Components.CanvasAcc.Models.CanvasAcc.CANVAS_KEYUP_EVENTS;

                switch (keyCode) {
                    case KEYS.LEFTARROW:
                        this.$el.trigger(CANVAS_KEYUP_EVENTS.LEFT_ARROW_KEYUP, [event, keyCode, currentCanvasItem]);
                        break;
                    case KEYS.RIGHTARROW:
                        this.$el.trigger(CANVAS_KEYUP_EVENTS.RIGHT_ARROW_KEYUP, [event, keyCode, currentCanvasItem]);
                        break;
                    case KEYS.UPARROW:
                        this.$el.trigger(CANVAS_KEYUP_EVENTS.UP_ARROW_KEYUP, [event, keyCode, currentCanvasItem]);
                        break;
                    case KEYS.DOWNARROW:
                        this.$el.trigger(CANVAS_KEYUP_EVENTS.DOWN_ARROW_KEYUP, [event, keyCode, currentCanvasItem]);
                        break;
                }
                this.$el.trigger(CANVAS_KEYUP_EVENTS.ARROW_KEYUP, [event, keyCode, currentCanvasItem]);
            }
        },

        /* handle tab key in canvas activity area
         * @method _handleTab
         * @param {String} type Stores type of the canvas item to be dealt with
         * @param {Object} currentCanvasItem Stores a reference to the current canvas item
         * @param {Object} event Event object
         * @private
         */
        "_handleTab": function(type, currentCanvasItem, event) {

            var eventObject = {
                    "item": currentCanvasItem.get('paperItem'),
                    "event": {
                        "which": 1,
                        "shiftKey": event.shiftKey
                    },
                    "isAccessibility": true,
                    "isArrowKey": false
                },
                CanvasAcc = MathUtilities.Components.CanvasAcc.Models.CanvasAcc;
            if (type === CanvasAcc.TYPE.DRAG_AND_DROP) {
                /*------------------------ Drag set to false whenever tab -------------------------------*/
                this.isDrag = false;
                this.hideFocusRect();
                /*---------------------------------------------------------------------------------------*/

                this.lastTriggeredEvent = CanvasAcc.DRAG_AND_DROP_EVENTS.TAB;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            } else {
                this.lastTriggeredEvent = CanvasAcc.CANVAS_KEY_EVENTS.TAB;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }
            this._setSelfFocus();
        },

        /* handle space bar in canvas activity area
         * @method _handleSpace
         * @param {String} type Stores type of the canvas item to be dealt with
         * @param {Object} currentCanvasItem Stores a reference to the current canvas item
         * @private
         */
        "_handleSpace": function(type, currentCanvasItem) {
            var eventObject = {
                    "item": currentCanvasItem.get('paperItem'),
                    "event": {
                        "which": 1
                    },
                    "isAccessibility": true,
                    "isArrowKey": false
                },
                origin,
                currentPosition,
                CanvasAcc = MathUtilities.Components.CanvasAcc.Models.CanvasAcc;
            if (type === CanvasAcc.TYPE.DRAG_AND_DROP) {
                this.isDrag = !this.isDrag;
                eventObject.isDrag = this.isDrag;
                this.hideFocusRect();
                this.lastTriggeredEvent = CanvasAcc.DRAG_AND_DROP_EVENTS.SPACE;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);

                if (this.isDrag) {
                    origin = this.model.get('gridCell').origin;
                    currentPosition = {
                        "x": origin.x,
                        "y": origin.y
                    };

                    this.model.set('focusCurrentPosition', currentPosition);
                    this._hadleGridNavigation(type, null, false, currentCanvasItem, true);
                }

            } else {
                this.lastTriggeredEvent = CanvasAcc.CANVAS_KEY_EVENTS.SPACE;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }
            if (!this.model.get('disableSelfFocusOnSpace')) {
                this._setSelfFocus();
            }
        },

        /* handle clockwise rotation(r/R) and anti-clockwise rotation(e/E) in canvas activity area
         * @method _handleRotate
         * @param {String} type Stores type of the canvas item to be dealt with
         * @param {Object} currentCanvasItem Stores a reference to the current canvas item
         * @param {Object} keyCode Key code of the key whose up has been fired
         * @private
         */
        "_handleRotate": function(type, currentCanvasItem, keyCode) {
            var eventObject = {
                    "item": currentCanvasItem.get('paperItem'),
                    "event": {
                        "which": 1
                    },
                    "isAccessibility": true,
                    "isArrowKey": false
                },
                KEYS = MathUtilities.Components.CanvasAcc.Views.CanvasAcc.KEYS,
                CanvasAcc = MathUtilities.Components.CanvasAcc.Models.CanvasAcc;
            /*Trigger different events for clock wise and anti-clockwise rotation*/
            if (keyCode === KEYS.ROTATE_CLOCKWISE) {
                if (type === CanvasAcc.TYPE.DRAG_AND_DROP) {
                    this.lastTriggeredEvent = CanvasAcc.DRAG_AND_DROP_EVENTS.ROTATE_CLOCKWISE;
                } else {
                    this.lastTriggeredEvent = CanvasAcc.CANVAS_KEY_EVENTS.ROTATE_CLOCKWISE;
                }
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            } else if (keyCode === KEYS.ROTATE_ANTI_CLOCKWISE) {
                if (type === CanvasAcc.TYPE.DRAG_AND_DROP) {
                    this.lastTriggeredEvent = CanvasAcc.DRAG_AND_DROP_EVENTS.ROTATE_ANTI_CLOCKWISE;
                } else {
                    this.lastTriggeredEvent = CanvasAcc.CANVAS_KEY_EVENTS.ROTATE_ANTI_CLOCKWISE;
                }
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }

            this._setSelfFocus();
        },

        /* handle delete key in canvas activity area
         * @method _handleDelete
         * @param {String} type Stores type of the canvas item to be dealt with
         * @param {Object} currentCanvasItem Stores a reference to the current canvas item
         * @private
         */
        "_handleDelete": function(type, currentCanvasItem) {
            var collectionCanvasItems = this.model.get('collectionCanvasItems'),
                eventObject = {
                    "item": currentCanvasItem.get('paperItem'),
                    "nextItem": null,
                    "event": {
                        "which": 1
                    },
                    "isAccessibility": true,
                    "isArrowKey": false
                },
                hasNext = false,
                currentPaperItemIndex,
                CanvasAcc = MathUtilities.Components.CanvasAcc.Models.CanvasAcc;

            if (!currentCanvasItem.get('paperItem').allowDelete) {
                return void 0;
            }

            switch (type) {
                case CanvasAcc.TYPE.NAVIGATE_ITEM:
                    /*Decide next item while navigating canvas item*/
                    if (collectionCanvasItems.hasNext()) {
                        eventObject.nextItem = collectionCanvasItems.next().get('paperItem');
                    }
                    this.lastTriggeredEvent = CanvasAcc.CANVAS_KEY_EVENTS.DELETE;
                    break;
                case CanvasAcc.TYPE.NAVIGATE_LINE:
                    /*Decide next item while navigating canvas line*/

                    currentPaperItemIndex = this.model.getCollectionCurrentItemIndex();
                    hasNext = currentPaperItemIndex !== null && (currentPaperItemIndex + 3) < collectionCanvasItems.length;
                    if (hasNext) {
                        collectionCanvasItems.next();
                        collectionCanvasItems.next();
                        eventObject.nextItem = collectionCanvasItems.next().get('paperItem');
                    }
                    this.lastTriggeredEvent = CanvasAcc.CANVAS_KEY_EVENTS.DELETE;
                    break;
                case CanvasAcc.TYPE.DRAG_AND_DROP:
                    /*Decide next item while navigating canvas item*/
                    if (collectionCanvasItems.hasNext()) {
                        eventObject.nextItem = collectionCanvasItems.next().get('paperItem');
                    }

                    this.lastTriggeredEvent = CanvasAcc.DRAG_AND_DROP_EVENTS.DELETE;
                    break;

            }
            this.$el.trigger(this.lastTriggeredEvent, eventObject);

            if (!eventObject.nextItem) {
                this._isStart = true;
                this.model.setCollectionCanvasItems(this.model.get('paperItems'));
            }
            this._setSelfFocus();
        },

        /* handle arrow keys in canvas activity area
         * @method _handleArrows
         * @param {Object} currentCanvasItem Stores a reference to the current canvas item
         * @param {Object} keyCode Key code of the key whose up has been fired
         * @private
         */
        "_handleArrows": function(currentCanvasItem, keyCode) {
            var currentPaperItem = currentCanvasItem.get('paperItem'),
                eventObject = {
                    "item": currentPaperItem,
                    "point": currentPaperItem.position,
                    "event": {
                        "which": 1
                    },
                    "isAccessibility": true,
                    "isArrowKey": true,
                    "directionX": 0,
                    "directionY": 0
                },
                KEYS = MathUtilities.Components.CanvasAcc.Views.CanvasAcc.KEYS;

            switch (keyCode) {
                case KEYS.LEFTARROW:
                    eventObject.directionX = -1;
                    eventObject.directionY = 0;
                    break;
                case KEYS.UPARROW:
                    eventObject.directionX = 0;
                    eventObject.directionY = -1;
                    break;
                case KEYS.RIGHTARROW:
                    eventObject.directionX = 1;
                    eventObject.directionY = 0;
                    break;
                case KEYS.DOWNARROW:
                    eventObject.directionX = 0;
                    eventObject.directionY = 1;
                    break;
            }

            this.lastTriggeredEvent = MathUtilities.Components.CanvasAcc.Models.CanvasAcc.CANVAS_KEY_EVENTS.ARROW;
            this.$el.trigger(this.lastTriggeredEvent, eventObject);
            this._setSelfFocus();
        },

        /* handle focus out from canvas activity area
         * @method _handleFocusOut
         * @param {String} type Stores type of the canvas item to be dealt with
         * @param {Object} currentCanvasItem Stores a reference to the current canvas item
         * @private
         */
        "_handleFocusOut": function(type, currentCanvasItem) {
            var eventObject = {
                    "item": currentCanvasItem ? currentCanvasItem.get('paperItem') : null,
                    "event": {
                        "which": 1
                    },
                    "isAccessibility": true,
                    "isArrowKey": false
                },
                origin,
                currentPosition,
                CanvasAcc = MathUtilities.Components.CanvasAcc.Models.CanvasAcc;
            this._isStart = true;
            this.model.setCollectionCanvasItems(this.model.get('paperItems'));
            if (type === CanvasAcc.TYPE.DRAG_AND_DROP) {
                origin = this.model.get('gridCell').origin;
                currentPosition = {
                    "x": origin.x,
                    "y": origin.y
                };
                this.model.set('focusCurrentPosition', currentPosition);

                this.hideFocusRect();
                this.lastTriggeredEvent = CanvasAcc.DRAG_AND_DROP_EVENTS.FOCUS_OUT;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            } else {

                this.isDrag = false;
                this.lastTriggeredEvent = CanvasAcc.CANVAS_EVENTS.FOCUS_OUT;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }
        },

        /* handle escape from canvas activity area
         * @method _handleEscape
         * @param {String} type Stores type of the canvas item to be dealt with
         * @param {Object} currentCanvasItem Stores a reference to the current canvas item
         * @private
         */
        "_handleEscape": function(type, currentCanvasItem) {
            var currentPaperItem = currentCanvasItem ? currentCanvasItem.get('paperItem') : null,
                eventObject = {
                    "item": currentPaperItem,
                    "event": {
                        "which": 1
                    },
                    "isAccessibility": true,
                    "isArrowKey": false
                },
                CanvasAcc = MathUtilities.Components.CanvasAcc.Models.CanvasAcc;

            this._isStart = true;
            this.canvasFocusOut(type, currentCanvasItem);

            switch (type) {
                case CanvasAcc.TYPE.DRAW_LINE:
                    this.lastTriggeredEvent = CanvasAcc.DRAW_LINE_EVENTS.ESCAPE;
                    this.$el.trigger(this.lastTriggeredEvent, eventObject);
                    break;
                case CanvasAcc.TYPE.DRAW_AND_EXPAND:
                    this.lastTriggeredEvent = CanvasAcc.DRAW_AND_EXPAND_EVENTS.ESCAPE;
                    this.$el.trigger(this.lastTriggeredEvent, eventObject);
                    break;
                case CanvasAcc.TYPE.DRAG_AND_DROP:
                    this.lastTriggeredEvent = CanvasAcc.DRAG_AND_DROP_EVENTS.ESCAPE;
                    this.$el.trigger(this.lastTriggeredEvent, eventObject);
                    break;
                default:
                    this.model.setCollectionCanvasItems(this.model.get('paperItems'));
                    this.lastTriggeredEvent = CanvasAcc.CANVAS_KEY_EVENTS.ESCAPE;
                    this.$el.trigger(this.lastTriggeredEvent, eventObject);
                    break;
            }
            if (this._paperScope) {
                this._paperScope.view.draw();
            }
            this._setSelfFocus();
        },

        /* Public function which call private _setSelfFocus function
         * @method setSelfFocus
         * @public
         */
        "setSelfFocus": function() {
            this._setSelfFocus();
        },

        /* set focus to same element through to temp div so text can be read by screen reader
         * @method _setSelfFocus
         * @private
         */
        "_setSelfFocus": function() {
            var selfFocusDisableEvents = this.model.get('selfFocusDisableEvents'),
                eventCount,
                currentText,
                accId,
                id,
                canvasHolderID,
                currentTextElement,
                counter;
            if (selfFocusDisableEvents && this.lastTriggeredEvent) {
                eventCount = selfFocusDisableEvents.length;
                for (counter = 0; counter < eventCount; counter++) {
                    if (this.lastTriggeredEvent === selfFocusDisableEvents[counter]) {
                        this.lastTriggeredEvent = null;
                        return void 0;
                    }
                }
            }
            this.lastTriggeredEvent = null;

            id = this.el.id;
            canvasHolderID = this.model.get('canvasHolderID');
            currentTextElement = this.$('#' + id + '-acc-elem');

            /*Space appended if same text set again as jaws doesn't read same text again on set focus*/
            if (currentTextElement.length > 0) {
                currentText = currentTextElement.text();
                accId = id;

                if (currentText === this.prevText && currentText !== '') {
                    this.prevText = currentText + " ";
                    this.accManager.setAccMessage(accId, this.prevText);
                } else {
                    this.prevText = currentText;
                }
            }

            this.accManager.setFocus(canvasHolderID + '-temp-focus-div');
            this.accManager.setFocus(id, 0);

        },

        /* Call focus out for canvas explicitly
         * @method canvasFocusOut
         * @param {String} type Stores type of the canvas item to be dealt with
         * @param {Object} currentCanvasItem Stores a reference to the current canvas item
         * @public
         */
        "canvasFocusOut": function(type, currentCanvasItem) {
            var canvasType = type || this.model.get('type'),
                currCanvasItem = currentCanvasItem || this.model.get('collectionCanvasItems').getCurrentItem(),
                TYPE = MathUtilities.Components.CanvasAcc.Models.CanvasAcc.TYPE;

            if ([TYPE.NAVIGATE_ITEM, TYPE.NAVIGATE_LINE, TYPE.DRAG_AND_DROP].indexOf(canvasType) > -1) {
                this._handleFocusOut(canvasType, currCanvasItem);
            } else if ([TYPE.DRAW_LINE, TYPE.DRAW_AND_EXPAND].indexOf(canvasType) > -1) {
                this._handleGridNavigationFocusOut(canvasType);
            }
        },

        /* Add paper item to array and collection
         * @method addPaperItem
         * @param {object} paperItem
         */
        "addPaperItem": function(paperItem) {
            var collectionCanvasItems = this.model.get('collectionCanvasItems'),
                item = new MathUtilities.Components.CanvasAcc.Models.CanvasItem({
                    "paperItem": paperItem,
                    "paperScope": this._paperScope
                });

            this.model.get('paperItems').push(paperItem);
            collectionCanvasItems.add(item);
        },

        /* Remove paper item from array and collection
         * @method removePaperItem
         * @param {object} collectionPaperItem
         */
        "removePaperItem": function(paperItem) {
            var collectionCanvasItems = this.model.get('collectionCanvasItems'),
                item = collectionCanvasItems.where({
                    "paperItem": paperItem
                }),
                paperItems = this.model.get('paperItems'),
                itemIndex = paperItems.indexOf(paperItem);

            if (itemIndex > -1) {
                paperItems.splice(itemIndex, 1);
                collectionCanvasItems.remove(item);
            }
        },

        "updatePaperItems": function(paperItems, isKeepCurrentItem) {
            this.model.set({
                "paperItems": paperItems,
                "isKeepCurrentItem": isKeepCurrentItem
            });

            if (!isKeepCurrentItem) {
                this._isStart = true;
            }
        },

        /* Set given paper item from collection and set it as current item
         * @method setCurrentPaperItem
         * @param {object} paper item
         * @param {boolean} updateStartBoolean update the index of paper item or not
         * @public
         */
        "setCurrentPaperItem": function(paperItem, updateStartBoolean) {
            if (updateStartBoolean) {
                this._isStart = false;
            }
            return this.model.setCollectionCurrentItem(paperItem);
        },

        /*
         * Handle space key event in draw line type
         * @method _handleDrawLineSpace
         * @private
         */
        "_handleDrawLineSpace": function() {
            var focusCurrentPosition = this.model.get('focusCurrentPosition'),
                eventObject = {
                    "point": {
                        "x": focusCurrentPosition.x,
                        "y": focusCurrentPosition.y
                    },
                    "event": {
                        "which": 1
                    },
                    "isAccessibility": true,
                    "isArrowKey": false
                };
            this.lastTriggeredEvent = MathUtilities.Components.CanvasAcc.Models.CanvasAcc.DRAW_LINE_EVENTS.SPACE;
            this.$el.trigger(this.lastTriggeredEvent, eventObject);
            this._setSelfFocus();
        },

        /*
         * Handle space key event in draw and expand type
         * @method _handleDrawAndExpandSpace
         * @param {object} keyCode Key code of the key whose up has been fired
         * @param {Bool} isFirstSpace first time space key pressed or not
         * @private
         */
        "_handleDrawAndExpandSpace": function(keyCode, isFirstSpace) {
            var focusCurrentPosition = this.model.get('focusCurrentPosition'),
                eventObject = {
                    "point": {
                        "x": focusCurrentPosition.x,
                        "y": focusCurrentPosition.y
                    },
                    "event": {
                        "which": 1
                    },
                    "isAccessibility": true,
                    "isArrowKey": false
                },
                KEYS = MathUtilities.Components.CanvasAcc.Views.CanvasAcc.KEYS;

            if (!isFirstSpace && (keyCode === KEYS.SPACE || keyCode === KEYS.ENTER)) {
                this.isExpand = !this.isExpand;
            }

            eventObject.isExpand = this.isExpand;
            this.lastTriggeredEvent = MathUtilities.Components.CanvasAcc.Models.CanvasAcc.DRAW_AND_EXPAND_EVENTS.SPACE;
            this.$el.trigger(this.lastTriggeredEvent, eventObject);
            this._setSelfFocus();
        },

        /*
         * Handle navigation in grid through arrow keys
         * @method _hadleGridNavigation
         * @param {object} type canvas type
         * @param {Bool} keyCode Key code of the key whose up has been fired
         * @param {object} isFirstSpace first time space key pressed or not
         * @param {Bool} currentCanvasItem current canvas item 
         * @param {object} isNoSelfFocus set the focus to canvas or not
         * @private
         */
        "_hadleGridNavigation": function(type, keyCode, isFirstSpace, currentCanvasItem, isNoSelfFocus) {
            var focusCurrentPosition = this.model.get('focusCurrentPosition'),
                gridCellSize = this.model.get('gridCell').size,
                gridContainment = this.model.get('gridContainment'),
                eventObject = {
                    "point": {
                        "x": focusCurrentPosition.x,
                        "y": focusCurrentPosition.y
                    },
                    "event": {
                        "which": 1
                    },
                    "isAccessibility": true,
                    "isArrowKey": true,
                    "directionX": 0,
                    "directionY": 0,
                    "isFirstSpace": isFirstSpace
                },
                KEYS = MathUtilities.Components.CanvasAcc.Views.CanvasAcc.KEYS,
                CanvasAcc = MathUtilities.Components.CanvasAcc.Models.CanvasAcc,
                changedPoint;

            /*Return if type is drag-drop and isDrag is false*/
            if (type === CanvasAcc.TYPE.DRAG_AND_DROP && !this.isDrag) {
                return void 0;
            }

            switch (keyCode) {
                case KEYS.LEFTARROW:
                    eventObject.directionX = -1;
                    eventObject.directionY = 0;
                    break;
                case KEYS.UPARROW:
                    eventObject.directionX = 0;
                    eventObject.directionY = -1;
                    break;
                case KEYS.RIGHTARROW:
                    eventObject.directionX = 1;
                    eventObject.directionY = 0;
                    break;
                case KEYS.DOWNARROW:
                    eventObject.directionX = 0;
                    eventObject.directionY = 1;
                    break;
            }
            changedPoint = {
                "x": eventObject.point.x + (gridCellSize.width * eventObject.directionX),
                "y": eventObject.point.y + (gridCellSize.height * eventObject.directionY)
            };
            if (changedPoint.x >= gridContainment.minX && changedPoint.x <= gridContainment.maxX) {
                eventObject.point.x = changedPoint.x;
            }

            if (changedPoint.y >= gridContainment.minY && changedPoint.y <= gridContainment.maxY) {
                eventObject.point.y = changedPoint.y;
            }

            this.model.set('focusCurrentPosition', eventObject.point);
            this._drawFocusRect();

            switch (type) {
                case CanvasAcc.TYPE.DRAW_LINE:
                    this.lastTriggeredEvent = CanvasAcc.DRAW_LINE_EVENTS.ARROW;
                    this.$el.trigger(this.lastTriggeredEvent, eventObject);
                    break;
                case CanvasAcc.TYPE.DRAW_AND_EXPAND:
                    eventObject.isExpand = this.isExpand;
                    this.lastTriggeredEvent = CanvasAcc.DRAW_AND_EXPAND_EVENTS.ARROW;
                    this.$el.trigger(this.lastTriggeredEvent, eventObject);
                    break;
                case CanvasAcc.TYPE.DRAG_AND_DROP:
                    eventObject.item = currentCanvasItem.get('paperItem');
                    this.lastTriggeredEvent = CanvasAcc.DRAG_AND_DROP_EVENTS.ARROW;
                    this.$el.trigger(this.lastTriggeredEvent, eventObject);
                    break;
            }
            if (!isNoSelfFocus) {
                this._setSelfFocus();
            }
        },

        /*
         * Handle focus out from canvas in draw line type
         * @method _handleGridNavigationFocusOut
         * @param {object} type canvas type
         * @private
         */
        "_handleGridNavigationFocusOut": function(type) {
            this._isStart = true;
            var focusCurrentPosition = this.model.get('focusCurrentPosition'),
                eventObject = {
                    "point": {
                        "x": focusCurrentPosition.x,
                        "y": focusCurrentPosition.y
                    },
                    "event": {
                        "which": 1
                    },
                    "isAccessibility": true,
                    "isArrowKey": false
                },
                origin = this.model.get('gridCell').origin,
                currentPosition = {
                    "x": origin.x,
                    "y": origin.y
                },
                CanvasAcc = MathUtilities.Components.CanvasAcc.Models.CanvasAcc;

            this.model.set('focusCurrentPosition', currentPosition);
            this.hideFocusRect();

            if (type === CanvasAcc.TYPE.DRAW_LINE) {
                this.lastTriggeredEvent = CanvasAcc.DRAW_LINE_EVENTS.FOCUS_OUT;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            } else if (type === CanvasAcc.TYPE.DRAW_AND_EXPAND) {
                this.isExpand = false;
                this.lastTriggeredEvent = CanvasAcc.DRAW_AND_EXPAND_EVENTS.FOCUS_OUT;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }
        },

        /*
         * Draw focus rect on tab on the tool
         * @method _drawFocusRect
         * @param {object} points focus rect position
         * @private
         */
        "_drawFocusRect": function(points) {
            var currentPosition = points || this.model.get('focusCurrentPosition'),
                paperScope = this._paperScope,
                focusRectSize = this.model.get('focusRectSize'),
                path = new paperScope.Path.Rectangle([currentPosition.x - focusRectSize.width / 2, currentPosition.y - focusRectSize.height / 2], [focusRectSize.width, focusRectSize.height]);
            this.hideFocusRect();
            path.strokeColor = this.model.get('focusRectColor');
            path.strokeWidth = this.model.get('focusRectBorderWidth');
            path.dashArray = [2, 2]; //[2: dash length, 2: gap length]
            this._currentFocusRect = path;
            paperScope.view.draw();
        },

        "getFocusRect": function() {
            return this._currentFocusRect;
        },

        /*
         * Hide focus rect from canvas
         * @method hideFocusRect
         * @private
         */
        "hideFocusRect": function() {
            if (this._currentFocusRect !== null) {
                this._currentFocusRect.remove();
                this._paperScope.view.draw();
            }
        },

        "_currrentPosition": {
            "x": 36, //default focus rect position coordinate x
            "y": 36 //default focus rect position coordinate y
        },

        /*
         * returns the next position to draw the focus rect
         * @method _getNextPosition
         * @param {object} event
         * @private
         */
        "_getNextPosition": function(event) {

            var focusRectDetails = this._detailsForFocusRect,
                canvasBounds = focusRectDetails.canvasBounds,
                gridSize = focusRectDetails.gridCellSize,
                incrementValue = gridSize;

            if (this._currrentPosition === null) {
                this._currrentPosition = {
                    "x": gridSize,
                    "y": gridSize
                };
            }
            if (event.shiftKey) {
                incrementValue *= -1;
            }
            this._currrentPosition.x += incrementValue;

            if (this._currrentPosition.x > (canvasBounds.maxX - gridSize)) {
                this._currrentPosition.x = gridSize;
                this._currrentPosition.y += incrementValue;
            }

            if (this._currrentPosition.x < gridSize) {
                this._currrentPosition.x = canvasBounds.maxX - gridSize;
                this._currrentPosition.y -= gridSize;
            }

            if (this._currrentPosition.y < gridSize || this._currrentPosition.y > (canvasBounds.maxY)) {
                this._currrentPosition = null;
            }

        },

        "_mouseDownTriggered": false,

        /*
         * Handling tool mouse events for drawing a line
         * @method _toolMouseEvents
         * @private
         */
        "_toolMouseEvents": function() {
            var pointToPass = {
                    "x": this._currentFocusRect.position.x,
                    "y": this._currentFocusRect.position.y
                },
                paperScopeTool = this._paperScope.tool;

            if (this._mouseDownTriggered === false) {
                paperScopeTool.fire('mousedown', {
                    "point": pointToPass,
                    "event": {
                        "which": 1
                    }
                });
                this._mouseDownTriggered = true;
            } else {
                paperScopeTool.fire('mousedrag', {
                    "point": pointToPass,
                    "event": {
                        "which": 1
                    }
                });
                paperScopeTool.fire('mouseup', {
                    "point": pointToPass,
                    "event": {
                        "which": 1
                    }
                });
                this._mouseDownTriggered = false;
            }

            this._paperScope.view.draw();
        }

    }, {

        "KEYS": {
            "TAB": 9,
            "SPACE": 32,
            "ENTER": 13,
            "ESCAPE": 27,
            "LEFTARROW": 37,
            "UPARROW": 38,
            "RIGHTARROW": 39,
            "DOWNARROW": 40,
            "DELETE": 68,
            "ROTATE_CLOCKWISE": 82,
            "ROTATE_ANTI_CLOCKWISE": 69
        },
        /*
         * Initialize canvas acc for the interactive
         * @param {object} options
         * @return {object} canvasAccView
         */
        "initializeCanvasAcc": function(options) {
            var canvasAccModel = options.model || null,
                canvasAccView = null,
                canvasHolderID = '#' + options.canvasHolderID;

            if (canvasAccModel === null) {
                canvasAccModel = new MathUtilities.Components.CanvasAcc.Models.CanvasAcc(options);
            }
            canvasAccView = new MathUtilities.Components.CanvasAcc.Views.CanvasAcc({
                "model": canvasAccModel,
                "el": canvasHolderID
            });

            return canvasAccView;
        }
    });
})();
