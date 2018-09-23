(function () {
    if (MathInteractives.Common.Player.Views.CanvasAcc) {
        return;
    }
    'use strict';
    /***
    *
    *
    ***/
    MathInteractives.Common.Player.Views.CanvasAcc = MathInteractives.Common.Player.Views.Base.extend({

        /*
        * paper scope of the interactive
        * @property _paperScope
        * @default null
        * @type {object}
        */
        _paperScope: null,

        /*
        * Focus rect details needed to draw focus rect
        * @property _detailsForFocusRect
        * @default null
        * @type {object}
        */
        _detailsForFocusRect: null,

        /*
        * instance of manager
        * @property manager
        * @default null
        * @type {object}
        */
        manager: null,

        /*
        * instance of player
        * @property player
        * @default null
        * @type {object}
        */
        player: null,

        /*
        * id prefix for interactivity
        * @property idPrefix
        * @default null
        * @type {String}
        */
        idPrefix: null,

        /*
        * stores whether it is start of canvas or not
        * @property _isStart
        * @default true
        * @type {boolean}
        */
        _isStart: true,

        /*
        * stores whether expand true or false for draw and expand type
        * @property isExpand
        * @default false
        * @type {boolean}
        */
        isExpand: false,

        /*
        * stores whether tile is in dragging mode
        * @property isDrag
        * @default false
        * @type {boolean}
        */
        isDrag: false,

        /*
        * stores whether shif is pressed
        * @property _isShifDown
        * @default false
        * @type {boolean}
        */
        _isShifDown: false,

        /*
        * stores current focus rect object
        * @property _currentFocusRect
        * @default null
        * @type {Object}
        */
        _currentFocusRect: null,

        /*
        * stores previous text to check for jaws issue 'text doesn't read' on same text changed again.
        * @property prevText
        * @default ''
        * @type {String}
        */
        prevText: '',

        /*
        * stores last event triggered.
        * @property lastTriggeredEvent
        * @default null
        * @type {String}
        */
        lastTriggeredEvent: null,
        /*
        * Stores the most recent keyup event.
        * @property _lastArrowKeyUpEvent
        * @default null
        * @type {Object}
        */
        _lastArrowKeyUpEvent: null,
        /*
        * Stores the item on which the most recent keyup event was fired.
        * @property _lastArrowKeyUpItem
        * @default null
        * @type {Object}
        */
        _lastArrowKeyUpItem: null,
        /*
        * Stores the number of times keydown has been fired before the next keydown.
        * @property _previousArrowKeyDownCount
        * @default 0
        * @type {Number}
        */
        _previousArrowKeyDownCount: 0,
        /*
        * Stores the number of times keydown has been fired.
        * @property _currentArrowKeyDownCount
        * @default 0
        * @type {Number}
        */
        _currentArrowKeyDownCount: 0,
        /*
        * Stores the window interval for triggering keyup.
        * @property _keyUpInterval
        * @default null
        * @type {Number}
        */
        _keyUpInterval: null,

        /**
        **/
        initialize: function () {
            //initialization
            this._paperScope = this.model.get('paperScope');
            this.player = this.model.get('player');
            this.idPrefix = this.player.getIDPrefix();
            this.manager = this.model.get('manager');

            this.render();
            this._bindEvents();

            /*Initialize draw line focus rect parameters*/
            var type = this.model.get('type');
            if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAW_LINE || type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAW_AND_EXPAND || type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAG_AND_DROP) {
                this.initGridFocusRectDetails();
            }
        },

        render: function () {
            /*create div to set temp focus*/
            var canvasHolderID = this.model.get('canvasHolderID'),
                canvasAccHackDiv = this.$el.find('.acc-read-elem'),
                tempDivDimention = { height: '1px', width: '1px', top: '1px', left: '1px' };

            if (canvasAccHackDiv) {
                tempDivDimention.height = canvasAccHackDiv.height() + 'px';
                tempDivDimention.width = canvasAccHackDiv.width() + 'px';

                tempDivDimention.top = canvasAccHackDiv.css('top');
                tempDivDimention.left = canvasAccHackDiv.css('left');
            }
            var style = 'position: absolute; height: ' + tempDivDimention.height + '; width: ' + tempDivDimention.width + '; top: ' + tempDivDimention.top + '; left: ' + tempDivDimention.left + '; outline: none';

            var $tempFocusDiv = $('<div>', {
                id: canvasHolderID + 'temp-focus-div',
                style: style
            });
            this.$el.prepend($tempFocusDiv);

            /*Generate acc for canvas temp focus*/
            var hackDivOptions = {
                elementId: canvasHolderID.replace(this.idPrefix, '') + 'temp-focus-div'
            };
            this.createAccDiv(hackDivOptions);

            var tempDivHack = $tempFocusDiv.find('.acc-read-elem')
            if (tempDivHack) {
                tempDivHack.css('outline', 'none');
            }
        },

        /*
         * Initialize focus rect position and size
         * @method initGridFocusRectDetails
         * @param
         * @private
        */
        initGridFocusRectDetails: function initGridFocusRectDetails() {
            var origin = this.model.get('gridCell').origin,
                gridCellSize = this.model.get('gridCell').size,
                currentPosition = { x: origin.x, y: origin.y },
                focusRectSize = { width: gridCellSize.width, height: gridCellSize.height };

            if (!this.model.get('focusCurrentPosition')) {
                this.model.set('focusCurrentPosition', currentPosition);
            }

            if (!this.model.get('focusRectSize')) {
                this.model.set('focusRectSize', focusRectSize);
            }
        },

        /*
       * Contains all event binding related canvas accessibility
       * @method _bindEvents
       * @param
       * @private
       */
        _bindEvents: function _bindEvents() {
            var model = this.model,
                self = this;

            this.$el.on("keydown", $.proxy(this._handleKeyDownEvent, this));
            this.$el.on("keyup", $.proxy(this._handleKeyUpEvent, this));
            /*update paper items on change*/
            model.on('change:paperItems', $.proxy(function () {
                var isKeepCurrentItem = this.model.get('isKeepCurrentItem') ? true : false;
                this.model.setCollectionCanvasItems(this.model.get('paperItems'), isKeepCurrentItem);
            }, this));

            model.on('change:setAccMessageObject', function () {
                self._updateHolderAccMessage();

            })
        },
        _updateHolderAccMessage: function _updateHolderAccMessage() {
            var setMessageObject = this.model.get('setAccMessageObject'),
                elementId = setMessageObject.elementId;

            this.setAccMessage(elementId, setMessageObject.strMessage);
            this._setSelfFocus();
            this.setFocus(elementId);// temp fix as we want to set focus to canvas holder again update the function setself focus


        },
        /*
        * Change canvas model type
        * @method changeCanvasAccType
        * @param {object} type
        * @private
        */
        changeCanvasAccType: function changeCanvasAccType(type) {
            this.model.set('type', type);
        },

        /*
        * Handle keydown event on canvas area
        * @method _handleKeyDownEvent
        * @param {object} event
        * @private
        */
        _handleKeyDownEvent: function _handleKeyDownEvent(event) {
            if (event.shiftKey) {
                this._isShifDown = true;
            }
            else {
                this._isShifDown = false;
            }

            //console.log('keydown');
            var keyCode = event.keyCode,
                type = this.model.get('type'),
                isFirstSpace = false;

            if (keyCode === MathInteractives.global.CanvasAcc.KEYS.SPACE && this._isStart) {
                //setCurrentItem
                this._isStart = false;
                isFirstSpace = true;
            }

            if (!this._isStart) {
                //console.log('first space');

                if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.NAVIGATE_ITEM || type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.NAVIGATE_LINE || type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAG_AND_DROP) {

                    var itemCollection = this.model.get('collectionCanvasItems');
                    var currentCanvasItem = itemCollection.getCurrentItem();

                    if (currentCanvasItem !== null) {
                        /*Handle escape*/
                        if (event.keyCode == MathInteractives.global.CanvasAcc.KEYS.ESCAPE) {
                            this._handleEscape(type, currentCanvasItem);
                            return;
                        }

                        if ((itemCollection.hasNext() && !this._isShifDown) || (itemCollection.hasPrev() && this._isShifDown) || keyCode !== MathInteractives.global.CanvasAcc.KEYS.TAB) {
                            //itemCollection.handleItemsKeyEvent(event);
                            switch (keyCode) {
                                case MathInteractives.global.CanvasAcc.KEYS.TAB:
                                    event.preventDefault();

                                    if (!event.shiftKey) {
                                        //set next canvas element
                                        itemCollection.next();
                                    }
                                    else if (event.shiftKey) {
                                        itemCollection.prev();
                                    }
                                    this._triggerCurrentItemFocusOutEvent(event, currentCanvasItem);

                                    currentCanvasItem = itemCollection.getCurrentItem();
                                    this._handleTab(type, currentCanvasItem, event);
                                    break;
                                case MathInteractives.global.CanvasAcc.KEYS.SPACE:
                                case MathInteractives.global.CanvasAcc.KEYS.ENTER:
                                    if (isFirstSpace) {
                                        this._handleTab(type, currentCanvasItem, event);
                                    }
                                    else {
                                        this._handleSpace(type, currentCanvasItem, event);
                                    }
                                    break;
                                case MathInteractives.global.CanvasAcc.KEYS.LEFTARROW:
                                case MathInteractives.global.CanvasAcc.KEYS.RIGHTARROW:
                                case MathInteractives.global.CanvasAcc.KEYS.UPARROW:
                                case MathInteractives.global.CanvasAcc.KEYS.DOWNARROW:
                                    event.preventDefault();
                                    if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAG_AND_DROP) {
                                        this._hadleGridNavigation(type, keyCode, isFirstSpace, currentCanvasItem);
                                    }
                                    else {
                                        this._handleArrows(currentCanvasItem, keyCode);
                                    }
                                    this._handleArrowUpTrigger();
                                    break;
                                case MathInteractives.global.CanvasAcc.KEYS.DELETE:
                                    this._handleDelete(type, currentCanvasItem);
                                    break;
                                case MathInteractives.global.CanvasAcc.KEYS.ROTATE_CLOCKWISE:
                                case MathInteractives.global.CanvasAcc.KEYS.ROTATE_ANTI_CLOCKWISE:
                                    this._handleRotate(type, currentCanvasItem, keyCode);
                                    break;
                            }
                            if (this._paperScope) {
                                this._paperScope.view.draw();
                            }
                        }
                        else {
                            this._handleFocusOut(type, currentCanvasItem);
                        }
                    }
                    else {
                        this._isStart = true;
                    }
                }
                else if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAW_LINE) {
                    //handling tabs on tool and generating dashed boxes for focus rect
                    switch (keyCode) {
                        case MathInteractives.global.CanvasAcc.KEYS.SPACE:
                        case MathInteractives.global.CanvasAcc.KEYS.ENTER:
                            if (isFirstSpace) {
                                this._hadleGridNavigation(type, keyCode, isFirstSpace);
                            }
                            else {
                                this._handleDrawLineSpace();
                            }
                            break;
                        case MathInteractives.global.CanvasAcc.KEYS.LEFTARROW:
                        case MathInteractives.global.CanvasAcc.KEYS.RIGHTARROW:
                        case MathInteractives.global.CanvasAcc.KEYS.UPARROW:
                        case MathInteractives.global.CanvasAcc.KEYS.DOWNARROW:
                            event.preventDefault();
                            this._hadleGridNavigation(type, keyCode, isFirstSpace);
                            break;
                        case MathInteractives.global.CanvasAcc.KEYS.TAB:
                            this._handleGridNavigationFocusOut(type);
                            break;
                        case MathInteractives.global.CanvasAcc.KEYS.ESCAPE:
                            this._handleEscape(type);
                            break;
                    }
                }
                else if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAW_AND_EXPAND) {
                    //handle space and arrow for drawing and expanding perticular part in canvas
                    switch (keyCode) {
                        case MathInteractives.global.CanvasAcc.KEYS.SPACE:
                        case MathInteractives.global.CanvasAcc.KEYS.ENTER:
                            if (isFirstSpace) {
                                this._hadleGridNavigation(type, keyCode, isFirstSpace);
                            }
                            else {
                                this._handleDrawAndExpandSpace(keyCode, isFirstSpace);
                            }
                            break;
                        case MathInteractives.global.CanvasAcc.KEYS.LEFTARROW:
                        case MathInteractives.global.CanvasAcc.KEYS.RIGHTARROW:
                        case MathInteractives.global.CanvasAcc.KEYS.UPARROW:
                        case MathInteractives.global.CanvasAcc.KEYS.DOWNARROW:
                            event.preventDefault();
                            this._hadleGridNavigation(type, keyCode, isFirstSpace);
                            break;
                        case MathInteractives.global.CanvasAcc.KEYS.TAB:
                            this._handleGridNavigationFocusOut(type);
                            break;
                        case MathInteractives.global.CanvasAcc.KEYS.ESCAPE:
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
        _triggerCurrentItemFocusOutEvent: function (event, currentCanvasItem) {

            var eventObject = {
                item: currentCanvasItem.get('paperItem'),
                event: {
                    which: 1,
                    shiftKey: event.shiftKey
                },
                isAccessibility: true,
                isArrowKey: false
            };

            this.$el.trigger(MathInteractives.Common.Player.Models.CanvasAcc.ITEM_EVENTS.ITEM_FOCUS_OUT, eventObject);

        },
        /*
        * Handles keyup events on the canvas area
        * @method _handleKeyUpEvent
        * @param {Object} event
        * @private
        */
        _handleKeyUpEvent: function (event) {
            if (event.keyCode === MathInteractives.global.CanvasAcc.KEYS.TAB) {
                return;
            }
            /*
            if (event.shiftKey) {
                this._isShiftDownOnUp = true;
            }
            else {
                this._isShiftDownOnUp = false;
            }
            */
            //console.log('keyup');
            var keyCode = event.keyCode,
                type = this.model.get('type'),
                itemCollection = this.model.get('collectionCanvasItems'),
                currentCanvasItem = itemCollection.getCurrentItem(),
                currentObject = null;

            if (currentCanvasItem !== null) {
                currentObject = currentCanvasItem.get('paperItem');
                switch (keyCode) {
                    case MathInteractives.global.CanvasAcc.KEYS.SPACE:
                        this.$el.trigger(MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEYUP_EVENTS.SPACE_KEYUP, [event, keyCode, currentObject]);
                        break;
                    case MathInteractives.global.CanvasAcc.KEYS.ENTER:
                        this.$el.trigger(MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEYUP_EVENTS.ENTER_KEYUP, [event, keyCode, currentObject]);
                        break;
                    case MathInteractives.global.CanvasAcc.KEYS.LEFTARROW:
                    case MathInteractives.global.CanvasAcc.KEYS.RIGHTARROW:
                    case MathInteractives.global.CanvasAcc.KEYS.UPARROW:
                    case MathInteractives.global.CanvasAcc.KEYS.DOWNARROW:
                        event.preventDefault();
                        this._lastArrowKeyUpEvent = event;
                        this._lastArrowKeyUpItem = currentObject;
                        break;
                    case MathInteractives.global.CanvasAcc.KEYS.DELETE:
                        this.$el.trigger(MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEYUP_EVENTS.DELETE_KEYUP, [event, keyCode, currentObject]);
                        break;
                    case MathInteractives.global.CanvasAcc.KEYS.ROTATE_CLOCKWISE:
                    case MathInteractives.global.CanvasAcc.KEYS.ROTATE_ANTI_CLOCKWISE:
                        this._handleRotationKeyUp(event, keyCode, currentObject);
                        this.$el.trigger(MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEYUP_EVENTS.ROTATION_KEYUP, [event, keyCode, currentObject]);
                        break;
                    default:
                        // Return to prevent common key up event from firing on key up of any other keys
                        return;
                }
                // Triggers common key up event on key up of any of the above keys
                this._handleAnyKeyUp(type, currentObject, event, keyCode);

            }
        },

        /*
        * Triggers a custom event when keyup is fired on the canvas
        * @method _handleKeyUp
        * @param {String} type Stores type of the canvas item to be dealt with
        * @param {Object} currentCanvasItem Stores a reference to the current canvas item
        * @param {Object} event Event object
        * @param {Number} keyCode Keycode of the key whose up has been fired
        * @private
        */
        _handleAnyKeyUp: function (type, currentCanvasItem, event, keyCode) {

            this.$el.trigger(MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEYUP_EVENTS.ANY_KEYUP, [event, keyCode, currentCanvasItem]);
        },
        /*
        * Triggers custom events when keyup of a rotation handler is fired on the canvas
        * @method _handleRotationKeyUp
        * @param {Object} currentCanvasItem Stores a reference to the current canvas item
        * @param {Object} event Event object
        * @param {Number} keyCode Keycode of the key whose up has been fired
        * @private
        */
        _handleRotationKeyUp: function (event, keyCode, currentCanvasItem) {
            switch (keyCode) {
                case MathInteractives.global.CanvasAcc.KEYS.ROTATE_CLOCKWISE:
                    this.$el.trigger(MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEYUP_EVENTS.CLOCKWISE_ROTATION_KEYUP, [event, keyCode, currentCanvasItem]);
                    break;
                case MathInteractives.global.CanvasAcc.KEYS.ROTATE_ANTI_CLOCKWISE:
                    this.$el.trigger(MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEYUP_EVENTS.ANTI_CLOCKWISE_ROTATION_KEYUP, [event, keyCode, currentCanvasItem]);
                    break;
            }
        },

        /*
        * JAWS handles arrow keys differently. When any arrow key is held down, keydown and keyup events are fired simultaneously.
        * To overcome this, this function checks whether another keydown has occured within a set timer before the keyup is fired.
        * If another keydown has been fired, the keyup event won't be triggered.
        *
        * @method _handleArrowUpTrigger
        * @private
        */
        _handleArrowUpTrigger: function () {
            var self = this,
                keyupTimer = MathInteractives.Common.Player.Models.CanvasAcc.KEYUP_TIMER;

            self._previousArrowKeyDownCount = self._currentArrowKeyDownCount;
            self._currentArrowKeyDownCount++;
            if (self._previousArrowKeyDownCount === 0) {
                if (self._keyUpInterval) {
                    window.clearInterval(self._keyUpInterval);
                }
                self._keyUpInterval = window.setInterval(function () {
                    if (self._previousArrowKeyDownCount === self._currentArrowKeyDownCount) {
                        window.clearInterval(self._keyUpInterval);
                        self._keyUpInterval = null;
                        self._previousArrowKeyDownCount = 0;
                        self._currentArrowKeyDownCount = 0;
                        self._handleArrowKeyUp();
                        self._lastArrowKeyUpEvent = null;
                    }
                    else {
                        if (self._lastArrowKeyUpEvent) {
                            self._previousArrowKeyDownCount = self._currentArrowKeyDownCount;
                        }
                    }
                }, keyupTimer);
            }
        },

        /*
        * Triggers custom events when keyup of an arrow key is fired on the canvas.
        * @method _handleArrowKeyUp
        * @private
        */
        _handleArrowKeyUp: function () {
            if (this._lastArrowKeyUpEvent) {
                var currentCanvasItem = this._lastArrowKeyUpItem,
                    event = this._lastArrowKeyUpEvent,
                    keyCode = event.keyCode,
                    globalStaticKeyData = MathInteractives.global.CanvasAcc.KEYS;

                switch (keyCode) {
                    case globalStaticKeyData.LEFTARROW:
                        this.$el.trigger(MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEYUP_EVENTS.LEFT_ARROW_KEYUP, [event, keyCode, currentCanvasItem]);
                        break;
                    case globalStaticKeyData.RIGHTARROW:
                        this.$el.trigger(MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEYUP_EVENTS.RIGHT_ARROW_KEYUP, [event, keyCode, currentCanvasItem]);
                        break;
                    case globalStaticKeyData.UPARROW:
                        this.$el.trigger(MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEYUP_EVENTS.UP_ARROW_KEYUP, [event, keyCode, currentCanvasItem]);
                        break;
                    case globalStaticKeyData.DOWNARROW:
                        this.$el.trigger(MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEYUP_EVENTS.DOWN_ARROW_KEYUP, [event, keyCode, currentCanvasItem]);
                        break;
                }
                this.$el.trigger(MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEYUP_EVENTS.ARROW_KEYUP, [event, keyCode, currentCanvasItem]);
            }
        },

        /* handle tab key in canvas activity area
        * @method _handleTab
        * @private
        */
        _handleTab: function _handleTab(type, currentCanvasItem, event) {

            var eventObject = {
                item: currentCanvasItem.get('paperItem'),
                event: {
                    which: 1,
                    shiftKey: event.shiftKey
                },
                isAccessibility: true,
                isArrowKey: false
            };
            if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAG_AND_DROP) {
                /*------------------------ Drag set to false whenever tab -------------------------------*/
                this.isDrag = false;
                this.hideFocusRect()
                /*---------------------------------------------------------------------------------------*/

                this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.DRAG_AND_DROP_EVENTS.TAB
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }
            else {
                this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS.TAB;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }
            this._setSelfFocus();
        },

        /* handle space bar in canvas activity area
        * @method _handleSpace
        * @private
        */
        _handleSpace: function _handleSpace(type, currentCanvasItem) {
            var eventObject = { item: currentCanvasItem.get('paperItem'), event: { which: 1 }, isAccessibility: true, isArrowKey: false };
            if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAG_AND_DROP) {
                this.isDrag = !this.isDrag;
                eventObject.isDrag = this.isDrag;
                this.hideFocusRect();
                this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.DRAG_AND_DROP_EVENTS.SPACE;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);

                if (this.isDrag) {
                    var origin = this.model.get('gridCell').origin,
                        currentPosition = { x: origin.x, y: origin.y };

                    this.model.set('focusCurrentPosition', currentPosition);
                    this._hadleGridNavigation(type, null, false, currentCanvasItem, true);
                }

            }
            else {
                this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS.SPACE;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }
            if(this.model.get('disableSelfFocusOnSpace') !== true){
                this._setSelfFocus();
            }
        },

        /* handle clockwise roatation(r/R) and anti-clockwise roation(e/E) in canvas activity area
        * @method _handleRotate
        * @private
        */
        _handleRotate: function _handleRotate(type, currentCanvasItem, keyCode) {
            var eventObject = { item: currentCanvasItem.get('paperItem'), event: { which: 1 }, isAccessibility: true, isArrowKey: false };
            /*Trigger different events for clock wise and anti-clockwise rotation*/
            if (keyCode === MathInteractives.global.CanvasAcc.KEYS.ROTATE_CLOCKWISE) {
                if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAG_AND_DROP) {
                    this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.DRAG_AND_DROP_EVENTS.ROTATE_CLOCKWISE;
                }
                else {
                    this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS.ROTATE_CLOCKWISE;
                }
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }
            else if (keyCode === MathInteractives.global.CanvasAcc.KEYS.ROTATE_ANTI_CLOCKWISE) {
                if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAG_AND_DROP) {
                    this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.DRAG_AND_DROP_EVENTS.ROTATE_ANTI_CLOCKWISE;
                }
                else {
                    this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS.ROTATE_ANTI_CLOCKWISE;
                }
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }

            this._setSelfFocus();
        },

        /* handle delte key in canvas activity area
        * @method _handleDelete
        * @private
        */
        _handleDelete: function _handleDelete(type, currentCanvasItem) {
            var collectionCanvasItems = this.model.get('collectionCanvasItems'),
                eventObject = { item: currentCanvasItem.get('paperItem'), nextItem: null, event: { which: 1 }, isAccessibility: true, isArrowKey: false };

            if (!currentCanvasItem.get('paperItem').allowDelete) {
                return;
            }

            /*decide next item*/
            if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.NAVIGATE_ITEM) {
                /*Decide next item while navigating canvas item*/
                if (collectionCanvasItems.hasNext()) {
                    eventObject.nextItem = collectionCanvasItems.next().get('paperItem');
                }
                this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS.DELETE;
            }
            else if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.NAVIGATE_LINE) {

                /*Decide next item while navigating canvas line*/
                var hasNext = false;

                var currentPaperItemIndex = this.getCurrentPaperItemIndex();
                if (currentPaperItemIndex !== null && (currentPaperItemIndex + 3) < collectionCanvasItems.length) {
                    hasNext = true;
                }

                if (hasNext) {
                    collectionCanvasItems.next();
                    collectionCanvasItems.next();
                    eventObject.nextItem = collectionCanvasItems.next().get('paperItem');
                }
                this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS.DELETE;
            }
            else if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAG_AND_DROP) {
                /*Decide next item while navigating canvas item*/
                if (collectionCanvasItems.hasNext()) {
                    eventObject.nextItem = collectionCanvasItems.next().get('paperItem');
                }

                this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.DRAG_AND_DROP_EVENTS.DELETE;
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
        * @private
        */
        _handleArrows: function _handleArrows(currentCanvasItem, keyCode) {
            var currentPaperItem = currentCanvasItem.get('paperItem'),
                eventObject = { item: currentPaperItem, point: currentPaperItem.position, event: { which: 1 }, isAccessibility: true, isArrowKey: true, directionX: 0, directionY: 0 };

            switch (keyCode) {
                case MathInteractives.global.CanvasAcc.KEYS.LEFTARROW:
                    eventObject.directionX = -1;
                    eventObject.directionY = 0;
                    break;
                case MathInteractives.global.CanvasAcc.KEYS.UPARROW:
                    eventObject.directionX = 0;
                    eventObject.directionY = -1;
                    break;
                case MathInteractives.global.CanvasAcc.KEYS.RIGHTARROW:
                    eventObject.directionX = 1;
                    eventObject.directionY = 0;
                    break;
                case MathInteractives.global.CanvasAcc.KEYS.DOWNARROW:
                    eventObject.directionX = 0;
                    eventObject.directionY = 1;
                    break;
            }

            this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS.ARROW;
            this.$el.trigger(this.lastTriggeredEvent, eventObject);
            this._setSelfFocus();
        },

        /* handle focus out from canvas activity area
        * @method _handleFocusOut
        * @private
        */
        _handleFocusOut: function _handleFocusOut(type, currentCanvasItem) {
            var eventObject = { item: currentCanvasItem ? currentCanvasItem.get('paperItem') : null, event: { which: 1 }, isAccessibility: true, isArrowKey: false };
            this._isStart = true;
            this.model.setCollectionCanvasItems(this.model.get('paperItems'));
            if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAG_AND_DROP) {
                var origin = this.model.get('gridCell').origin,
                    currentPosition = { x: origin.x, y: origin.y };
                this.model.set('focusCurrentPosition', currentPosition);

                this.hideFocusRect();
                this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.DRAG_AND_DROP_EVENTS.FOCUS_OUT;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }
            else {

                this.isDrag = false;
                this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_EVENTS.FOCUS_OUT;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }
        },

        /* handle escape from canvas activity area
        * @method _handleEscape
        * @private
        */
        _handleEscape: function _handleEscape(type, currentCanvasItem) {
            var currentPaperItem = currentCanvasItem ? currentCanvasItem.get('paperItem') : null,
                eventObject = { item: currentPaperItem, event: { which: 1 }, isAccessibility: true, isArrowKey: false };

            this._isStart = true;
            this.canvasFocusOut(type, currentCanvasItem);

            if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAW_LINE) {
                this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.DRAW_LINE_EVENTS.ESCAPE;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }
            else if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAW_AND_EXPAND) {
                this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.DRAW_AND_EXPAND_EVENTS.ESCAPE;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }
            else if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAG_AND_DROP) {
                this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.DRAG_AND_DROP_EVENTS.ESCAPE;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }
            else {
                this.model.setCollectionCanvasItems(this.model.get('paperItems'));
                this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS.ESCAPE;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }
            if (this._paperScope) {
                this._paperScope.view.draw();
            }
            this._setSelfFocus();
        },

        /* Public funciton which call private _setSelfFocus function
        * @method setSelfFocus
        * @param null
        * @public
        */
        setSelfFocus: function setSelfFocus() {
            this._setSelfFocus();
        },

        /* set focus to same element through to temp div so text can be read by screen reader
        * @method _setSelfFocus
        * @private
        */
        _setSelfFocus: function () {
            if (this.player.getModalPresent()) {
                return;
            }
            //console.log("+++++++++++++++++++++++ :  " + this.lastTriggeredEvent);
            var selfFocusDisableEvents = this.model.get('selfFocusDisableEvents');
            if (selfFocusDisableEvents && this.lastTriggeredEvent) {
                var eventCount = selfFocusDisableEvents.length;
                for (var i = 0; i < eventCount; i++) {
                    if (this.lastTriggeredEvent === selfFocusDisableEvents[i]) {
                        this.lastTriggeredEvent = null;
                        return;
                    }
                }
            }
            this.lastTriggeredEvent = null;

            var id = this.el.id,
                canvasHolderID = this.model.get('canvasHolderID'),
                currentTextElement = this.$('#' + id + '-acc-elem');

            /*Space appended if same text set again as jaws doesn't read same text again on setfocus*/
            if (currentTextElement.length > 0) {
                var currentText = currentTextElement.text(),
                    accId = id.replace(this.idPrefix, '');

                if (currentText === this.prevText && currentText !== '') {
                    this.prevText = currentText + " ";
                    this.setAccMessage(accId, this.prevText);
                }
                else {
                    this.prevText = currentText;
                }
            }

            this.setFocus(canvasHolderID.replace(this.idPrefix, '') + 'temp-focus-div');
            this.manager.setFocus(id, 0);

        },

        /* Call focus out for canvas explicitly
        * @method canvasFocusOut
        * @param return
        * @public
        */
        canvasFocusOut: function canvasFocusOut(type, currentCanvasItem) {
            type = type ? type : this.model.get('type'),
                currentCanvasItem = currentCanvasItem ? currentCanvasItem : this.model.get('collectionCanvasItems').getCurrentItem();

            if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.NAVIGATE_ITEM || type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.NAVIGATE_LINE || type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAG_AND_DROP) {
                this._handleFocusOut(type, currentCanvasItem);
            } else if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAW_LINE || type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAW_AND_EXPAND) {
                this._handleGridNavigationFocusOut(type);
            }
        },

        /* Add paper item to array and collection
        * @method addPaperItem
        * @param {object} paperItem
        */
        addPaperItem: function addPaperItem(paperItem) {
            var collectionCanvasItems = this.model.get('collectionCanvasItems'),
                item = new MathInteractives.Common.Player.Models.CanvasItem({ paperItem: paperItem, paperScope: this._paperScope });

            this.model.get('paperItems').push(paperItem);
            collectionCanvasItems.add(item);
        },

        /* Remove paper item from array and collection
        * @method removePaperItem
        * @param {object} collectionPaperItem
        */
        removePaperItem: function removePaperItem(paperItem) {
            var collectionCanvasItems = this.model.get('collectionCanvasItems'),
                item = collectionCanvasItems.where({ paperItem: paperItem }),
                paperItems = this.model.get('paperItems'),
                itemIndex = paperItems.indexOf(paperItem);

            if (itemIndex > -1) {
                paperItems.splice(itemIndex, 1);
                collectionCanvasItems.remove(item);
            }
        },


        /*
        */
        updatePaperItems: function updatePaperItems(paperItems, isKeepCurrentItem) {
            this.model.set({
                'paperItems': paperItems,
                'isKeepCurrentItem': isKeepCurrentItem
            });

            if (!isKeepCurrentItem) {
                this._isStart = true;
            }
        },

        /* Set given paper item from collection and set it as currnt item
        * @method setCurrentPaperItem
        * @param {object} paper item
        * @public
        */
        setCurrentPaperItem: function setCurrentPaperItem(paperItem, updateStartBoolean) {
            if (updateStartBoolean) {
                this._isStart = false;
            }
            return this.model.setCollectionCurrentItem(paperItem);
        },

        /* Update self focus disabled events array
        * @method updateSelfFocusDisableEvents
        * @param {Array} Array of self focus disable elements
        * @public
        */
        updateSelfFocusDisableEvents: function updateSelfFocusDisableEvents(selfFocusDisableEvents) {
            this.model.set('selfFocusDisableEvents', selfFocusDisableEvents);
        },


        /* Get current paper item from collection
        * @method getCurrentPaperItem
        * @param null
        * @public
        */
        getCurrentPaperItem: function getCurrentPaperItem() {
            return this.model.getCollectionCurrentItem();
        },

        /* Return current paper item index in collection
        * @method getCurrentPaperItemIndex
        * @param null
        * @public
        */
        getCurrentPaperItemIndex: function getCurrentPaperItemIndex() {
            return this.model.getCollectionCurrentItemIndex();
        },

        /*
        * Handle space key event in draw line type
        * @method _handleDrawLineSpace
        * @param {object}
        * @private
        */
        _handleDrawLineSpace: function _handleDrawLineSpace() {
            var focusCurrentPosition = this.model.get('focusCurrentPosition'),
                eventObject = { point: { x: focusCurrentPosition.x, y: focusCurrentPosition.y }, event: { which: 1 }, isAccessibility: true, isArrowKey: false };
            this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.DRAW_LINE_EVENTS.SPACE;
            this.$el.trigger(this.lastTriggeredEvent, eventObject);
            this._setSelfFocus();
        },


        /*
        * Handle space key event in draw and expand type
        * @method _handleDrawAndExpandSpace
        * @param {object}
        * @private
        */
        _handleDrawAndExpandSpace: function _handleDrawAndExpandSpace(keyCode, isFirstSpace) {
            var focusCurrentPosition = this.model.get('focusCurrentPosition'),
                eventObject = { point: { x: focusCurrentPosition.x, y: focusCurrentPosition.y }, event: { which: 1 }, isAccessibility: true, isArrowKey: false };

            if (!isFirstSpace && (keyCode === MathInteractives.global.CanvasAcc.KEYS.SPACE || keyCode === MathInteractives.global.CanvasAcc.KEYS.ENTER)) {
                this.isExpand = !this.isExpand;
            }

            eventObject.isExpand = this.isExpand;
            this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.DRAW_AND_EXPAND_EVENTS.SPACE;
            this.$el.trigger(this.lastTriggeredEvent, eventObject);
            this._setSelfFocus();
        },

        /*
        * Handle navigation in grid through arrow keys
        * @method _hadleGridNavigation
        * @param {object}
        * @private
        */
        _hadleGridNavigation: function _hadleGridNavigation(type, keyCode, isFirstSpace, currentCanvasItem, isNoSelfFocus) {
            var focusCurrentPosition = this.model.get('focusCurrentPosition'),
                gridCellSize = this.model.get('gridCell').size,
                gridContainment = this.model.get('gridContainment'),
                eventObject = { point: { x: focusCurrentPosition.x, y: focusCurrentPosition.y }, event: { which: 1 }, isAccessibility: true, isArrowKey: true, directionX: 0, directionY: 0, isFirstSpace: isFirstSpace };

            /*Return if type is drag-drop and isDrag is false*/
            if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAG_AND_DROP && !this.isDrag) {
                return;
            }

            switch (keyCode) {
                case MathInteractives.global.CanvasAcc.KEYS.LEFTARROW:
                    eventObject.directionX = -1;
                    eventObject.directionY = 0;
                    break;
                case MathInteractives.global.CanvasAcc.KEYS.UPARROW:
                    eventObject.directionX = 0;
                    eventObject.directionY = -1;
                    break;
                case MathInteractives.global.CanvasAcc.KEYS.RIGHTARROW:
                    eventObject.directionX = 1;
                    eventObject.directionY = 0;
                    break;
                case MathInteractives.global.CanvasAcc.KEYS.DOWNARROW:
                    eventObject.directionX = 0;
                    eventObject.directionY = 1;
                    break;
            }
            var changedPoint = {
                x: eventObject.point.x + (gridCellSize.width * eventObject.directionX),
                y: eventObject.point.y + (gridCellSize.height * eventObject.directionY)
            }
            //debugger
            if (changedPoint.x >= gridContainment.minX && changedPoint.x <= gridContainment.maxX) {
                eventObject.point.x = changedPoint.x;
            }

            if (changedPoint.y >= gridContainment.minY && changedPoint.y <= gridContainment.maxY) {
                eventObject.point.y = changedPoint.y;
            }

            this.model.set('focusCurrentPosition', eventObject.point);
            this._drawFocusRect();

            if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAW_LINE) {
                this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.DRAW_LINE_EVENTS.ARROW;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }
            else if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAW_AND_EXPAND) {
                eventObject.isExpand = this.isExpand;
                this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.DRAW_AND_EXPAND_EVENTS.ARROW;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }
            else if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAG_AND_DROP) {
                eventObject.item = currentCanvasItem.get('paperItem');
                this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.DRAG_AND_DROP_EVENTS.ARROW;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }

            if (!isNoSelfFocus) {
                this._setSelfFocus();
            }
        },


        /*
        * Handle focus out from canvas in draw line type
        * @method _handleGridNavigationFocusOut
        * @param {object}
        * @private
        */
        _handleGridNavigationFocusOut: function _handleGridNavigationFocusOut(type) {
            this._isStart = true;
            var focusCurrentPosition = this.model.get('focusCurrentPosition'),
                eventObject = { point: { x: focusCurrentPosition.x, y: focusCurrentPosition.y }, event: { which: 1 }, isAccessibility: true, isArrowKey: false },
                origin = this.model.get('gridCell').origin,
                currentPosition = { x: origin.x, y: origin.y };

            this.model.set('focusCurrentPosition', currentPosition);
            this.hideFocusRect();

            if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAW_LINE) {
                this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.DRAW_LINE_EVENTS.FOCUS_OUT;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }
            else if (type === MathInteractives.Common.Player.Models.CanvasAcc.TYPE.DRAW_AND_EXPAND) {
                this.isExpand = false;
                this.lastTriggeredEvent = MathInteractives.Common.Player.Models.CanvasAcc.DRAW_AND_EXPAND_EVENTS.FOCUS_OUT;
                this.$el.trigger(this.lastTriggeredEvent, eventObject);
            }
        },

        /*
        * Draw focus rect on tab on the tool
        * @method _drawFocusRect
        * @param {object} event
        * @private
        */
        _drawFocusRect: function _drawFocusRect(points) {

            var currentPostiion = points ? points : this.model.get('focusCurrentPosition'),
                paperScope = this._paperScope,
                focusRectSize = this.model.get('focusRectSize');

            this.hideFocusRect();

            var path = new paperScope.Path.Rectangle([currentPostiion.x - focusRectSize.width / 2, currentPostiion.y - focusRectSize.height / 2], [focusRectSize.width, focusRectSize.height]);
            path.strokeColor = this.model.get('focusRectColor');
            path.strokeWidth = this.model.get('focusRectBorderWidth');
            path.dashArray = [2, 2];
            this._currentFocusRect = path;
            paperScope.view.draw();

        },

        getFocusRect: function getFocusRect() {
            return this._currentFocusRect;
        },

        /*
        * Hide focus rect from canvas
        * @method hideFocusRect
        * @param {object} event
        * @private
        */
        hideFocusRect: function hideFocusRect() {
            if (this._currentFocusRect !== null) {
                this._currentFocusRect.remove();
                this._paperScope.view.draw();
            }
        },

        /*
        * returns the next position to draw the focus rect
        * @method _getNextPosition
        * @param {object} event
        * @private
        */
        _currrentPosition: { x: 36, y: 36 },
        _getNextPosition: function _getNextPosition(event) {

            var focusRectDetails = this._detailsForFocusRect,
                canvasBounds = focusRectDetails.canvasBounds,
                gridSize = focusRectDetails.gridCellSize, incrementValue = gridSize;

            if (this._currrentPosition === null) {
                this._currrentPosition = { x: gridSize, y: gridSize };
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

        /*
        * Handling tool mouse events for drawing a line
        * @method _toolMouseEvents
        * @private
        */
        _mouseDownTriggered: false,
        _toolMouseEvents: function _toolMouseEvents() {
            //console.log(this._currentFocusRect.bounds, this._currentFocusRect.position);
            var pointToPass = {
                x: this._currentFocusRect.position.x,
                y: this._currentFocusRect.position.y
            }, paperScopeTool = this._paperScope.tool;

            if (this._mouseDownTriggered === false) {
                paperScopeTool.fire('mousedown', { point: pointToPass, event: { which: 1 } });
                this._mouseDownTriggered = true;
            } else {
                paperScopeTool.fire('mousedrag', { point: pointToPass, event: { which: 1 } });
                paperScopeTool.fire('mouseup', { point: pointToPass, event: { which: 1 } });
                this._mouseDownTriggered = false;
            }

            this._paperScope.view.draw();
        },

    }, {

        KEYS: {
            TAB: 9,
            SPACE: 32,
            ENTER: 13,
            ESCAPE: 27,
            LEFTARROW: 37,
            UPARROW: 38,
            RIGHTARROW: 39,
            DOWNARROW: 40,
            DELETE: 68,
            ROTATE_CLOCKWISE: 82,
            ROTATE_ANTI_CLOCKWISE: 69
        },
        /*
        * Initialize canvas acc for the interactive
        * @param {object} options
        * @return {object} canvasAccView
        */
        intializeCanvasAcc: function intializeCanvasAcc(options) {
            var canvasAccModel = options.model || null,
                canvasAccView = null;

            var canvasHolderID = '#' + options.canvasHolderID;

            if (canvasAccModel === null) {
                canvasAccModel = new MathInteractives.Common.Player.Models.CanvasAcc(options);
            }

            canvasAccView = new MathInteractives.Common.Player.Views.CanvasAcc({ model: canvasAccModel, el: canvasHolderID });

            return canvasAccView;
        }
    });

    MathInteractives.global.CanvasAcc = MathInteractives.Common.Player.Views.CanvasAcc;
})();
