(function () {
    'use strict';
    var rightPanelClass = null;
    var prevAccId = null;
    var namespace = MathInteractives.Common.Interactivities.ArchaeologicalDig.Views;
    /**
    * Class for Archaeological Dig sub view that helps to generate some part of main view independently.
    * @class RightPanel
    * @module ArchaeologicalDig
    * @namespace MathInteractives.Interactivities.ArchaeologicalDig.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    namespace.RightPanel = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Reference to player object
        * @property player
        * @type Object
        * @default null
        */
        player: null,
        /**
        * Model of path for preloading files
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,
        /**
        * Manager object 
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,
        /**
        * Unique interactivity id prefix
        * @property idprefix
        * @default null
        * @private
        */
        idPrefix: null,
        /**
        * Holds the object of current model
        * @property model
        * @default null
        * @private
        */
        model: null,
        /**
        * Stores Current type of interactivity
        * @property type
        * @default null
        * @private
        */
        type: null,
        /**
        * Holds the view of Tooltip of junk found
        * @property junkFoundToolTipView
        * @default null
        * @private
        */
        junkFoundTooltipView: null,
        /**
        * Holds the view of Tooltip of junk information
        * @property junkInfoTooltipView
        * @default null
        * @private
        */
        objectInfoTooltipView: null,
        /**
        * Counts number of clicks of steper x and y
        * @property countForXY
        * @default null
        * @private
        */
        countForXY: null,
        /**
        * Holds top position of cursor.
        * @property cursorTop
        * @default null
        * @private
        */
        cursorTop: null,
        /**
        * Holds left position of cursor.
        * @property cursorLeft
        * @default null
        * @private
        */
        cursorLeft: null,
        /**
        * Holds object of div
        * @property cursorIconContainer
        * @default null
        * @private
        */
        $cursorIconContainer: null,
        /**
        * Holds view of right panel.
        * @property rightPanelView
        * @default null
        * @private
        */
        rightPanelView: null,
        /**
        * Holds previous acc text during focusing
        * @property prevAccText
        * @default empty string
        * @private
        */
        prevAccText: '',
        /**
        * Holds acc id of last focus child in grid container
        * @property lastFocusChildAccId
        * @default null
        * @private
        */
        lastFocusChildAccId: null,
        /**
        * holds view of tooltip of close sign
        * @property closeContainerTooltipView
        * @default null
        * @private
        */
        closeContainerTooltipView: null,

        /**
        * Initializes main view
        *
        * @method initialize
        * @public 
        **/
        initialize: function (option) {
            this.initializeDefaultProperties();
            this.idPrefix = this.player.getIDPrefix();
            this.type = this.model.get('type');
            this.model = option.model;
            this._registerHandlbarHelper();
            this._render();
            this.objectInfoTooltipView = null;
            this.objectInfoTooltipCount = -1
            this.junkFoundTooltipView = null;
        },

        /**
        * Register Handlebars custom helper 
        *
        * @method _registerHandlbarHelper
        * @private 
        **/
        _registerHandlbarHelper: function _registerHandlbarHelper() {
            Handlebars.registerHelper('archaeologicalDigCheckType', function (object, options) {
                if (object.type == 1) {
                    return options.fn(object);
                }
                else if (object.type == 2) {
                    return options.inverse(object);
                }
            });
            return this;
        },
        /**
        * Renders DOM elements
        *
        * @method _render
        * @private 
        **/
        _render: function _render() {

            var rightPanelTemplate = MathInteractives.Common.Interactivities.ArchaeologicalDig.templates['rightPanel']({
                'idPrefix': this.idPrefix,
                'type': this.type
            }).trim(),
                $object;

            this.$el.append(rightPanelTemplate);
            this.$('.1-cursor-container,.2-cursor-container,.object-container').css({ 'background-image': 'url("' + this.filePath.getImagePath('archaeological-dig-icons') + '")' });

            this.$cursorIconContainer = this.$('.cursor-icon-container');
            this.countForXY = 0;
            this.$('.empty').hide();
            this._attachEvents();
            this._placeCursor();
            this._displayAllFoundCharacter();
            $object = this.$('.' + this.type + '-cursor-container');
            this.cursorTop = parseInt($object.css('top'));
            this.cursorLeft = parseInt($object.css('left'));
        },
        /**
        * Binds events on model attributes
        *
        * @method _attachEvents
        * @private
        **/
        _attachEvents: function _attachEvents() {
            var self = this,
                gridContainer = 'type-' + this.model.get('type') + '-grid-container';
            this.model.on('display-Artifact-Part', this._displayArtifactParts, this);
            this.model.on('display-Junk', this._displayJunk, this);
            this.model.on('display-Empty-Place', this._displayEmptyPlace, this);
            this.$('.object-container').on('click', function (event) { self._displayObjectInfoTooltip(event, self) });
            this.$('.' + gridContainer).off('focusin').on('focusin', $.proxy(function (event) { this._gridContainerFocusInHandler(event); }, this));
            this.$('.' + gridContainer).off('keyup').on('keyup', function (event) {
                event.stopPropagation();
                self._gridContainerKeyUpHandler(event);
            });

        },
        /**
        * disables tab index of inner child
        * @method _gridContainerFocusInHandler        
        * @private
        */
        _gridContainerFocusInHandler: function _gridContainerFocusInHandler(event) {
            event.stopPropagation();
            event.stopImmediatePropagation();
        },
        /**
        * creates acc div for div at (0,0) position and assigns tabindex and msg to it
        * @method _gridContainerKeyUpHandler
        * @param {object} event key up event object
        * @private
        */
        _gridContainerKeyUpHandler: function _gridContainerKeyUpHandler(event) {
            var type = this.model.get('type'),
                elePreFix = 'type-' + type + '-',
                eleId = '',
                refTabIndex = 1600,
                tempX = ((type === 1) ? 0 : 3),
                tempY = ((type === 1) ? 0 : 3),
                accObj = {},
                accText = '',
                arr = [],
                type = this.model.get('type');

            if (event.keyCode === 32) {
                eleId = elePreFix + tempX + tempY;
                accObj = {
                    elementId: eleId,
                    tabIndex: refTabIndex,
                    acc: ''
                }
                this.createAccDiv(accObj);
                this._attachEventsToChildDivs(eleId);
                if (type === 2) {
                    tempX -= 3;
                    tempY -= 3;
                }
                arr.push(tempX);
                arr.push(tempY);
                accText = this.getAccMessage('child-divs-acc', 0, arr)
                this.enableTab(eleId, true);
                this.setAccMessage(eleId, accText);
                this.setFocus(eleId);
                this.lastFocusChildAccId = eleId;
            }
            if (event.keyCode === 9 && event.shiftKey === true) {
                if (this.lastFocusChildAccId !== null) {
                    this.enableTab(this.lastFocusChildAccId, false);
                }
            }
        },
        /**
        * attach keyup, keydwon and focusin events to specified element.
        * @method _attachEventsToChildDivs
        * param {string} accId of child div
        * @private
        */
        _attachEventsToChildDivs: function _attachEventsToChildDivs(eleId) {
            //            this.$('.' + eleId).off('focusin').on('focusin', function (event) {
            //                event.stopPropagation();
            //                event.stopImmediatePropagation();
            //            });
            this.$('.' + eleId).off('keyup').on('keyup', $.proxy(function (event) {
                event.stopPropagation();
                this._gridChildkeyUpHandler(event)
            }, this));

            this.$('.' + eleId).off('keydown').on('keydown', function (event) {
                var keyCodes = [37, 38, 39, 40];
                if (jQuery.inArray(event.keyCode, keyCodes) !== -1) {
                    event.preventDefault();
                }
            });
        },

        /**
        * creates acc div if required and assigns tabindex and msg to it
        * @method _gridChildkeyUpHandler
        * param {object} event key up event object
        * @private
        */
        _gridChildkeyUpHandler: function _gridChildkeyUpHandler(event) {
            var targetClassList = event.currentTarget.className.split(' '),
                targetClassListLength = targetClassList.length,
                accId = targetClassList[0],
                type = this.model.get('type'),
                min = 0,
                max = ((type === 1) ? 5 : 6),
                newEleIdPrefix = 'type-' + type + '-',
                newEleId = '',
                accObj = {},
                tempX = parseInt(accId.split('-')[2].substr(0, 1)),
                tempY = parseInt(accId.split('-')[2].substr(1, 1)),
                refTabIndex = this.getTabIndex(accId),
                check = '',
                accText = '',
                arr = [],
                type = this.model.get('type'),
                maxOrMin = '';

            switch (event.keyCode) {
                case 37:
                    {
                        if (tempX === min) {
                            maxOrMin = 'min';
                        }
                        else {
                            newEleId = newEleIdPrefix + --tempX + tempY;
                            check = 'arrowKey';
                        }
                        break;
                    } //left arrow
                case 38:
                    {
                        if (tempY === max) {
                            maxOrMin = 'max';
                        }
                        else {
                            newEleId = newEleIdPrefix + tempX + ++tempY;
                            check = 'arrowKey';
                        }
                        break;
                    } //up arrow
                case 39:
                    {
                        if (tempX === max) {
                            maxOrMin = 'max';
                        }
                        else {
                            newEleId = newEleIdPrefix + ++tempX + tempY;
                            check = 'arrowKey';
                        }
                        break;
                    } //right arrow
                case 40:
                    {
                        if (tempY === min) {
                            maxOrMin = 'min';
                        }
                        else {
                            newEleId = newEleIdPrefix + tempX + --tempY;
                            check = 'arrowKey';
                        }
                        break;
                    } //down  arrow 
                case 32:
                    {
                        if (this.$('.' + accId).hasClass('selected')) {
                            arr = this._getProperObjectName(arr, targetClassList[targetClassList.length - 1]);
                            accText = this.getAccMessage('child-divs-acc', 2, arr);
                        }
                        else {
                            accText = this.getAccMessage('child-divs-acc', 1);
                        }
                        this.enableTab(accId, true);
                        if (this.prevAccText === accText) {
                            accText += ' ';
                        }
                        this.setAccMessage(accId, accText);
                        this.prevAccText = accText;
                        this.setFocus('dummy-focus');
                        this.setFocus(accId, 50);
                        check = 'tab';
                        break;
                    }
            }
            if (check === 'arrowKey') {
                if (this.objectInfoTooltipView) {
                    this.objectInfoTooltipView.hideTooltip();
                }
                this.enableTab(accId, false);
                if (this.$('.' + newEleId).children().length === 0) {
                    accObj = {
                        elementId: newEleId,
                        tabIndex: refTabIndex,
                        acc: ''
                    }
                    this.createAccDiv(accObj);
                    this._attachEventsToChildDivs(newEleId);
                }
                else {
                    this.enableTab(newEleId, true);
                }
                if (type === 2) {
                    tempX -= 3;
                    tempY -= 3;
                }
                arr.push(tempX);
                arr.push(tempY);
                accText = this.getAccMessage('child-divs-acc', 0, arr)
                this.setAccMessage(newEleId, accText);
                this.setFocus(newEleId);
                this.lastFocusChildAccId = newEleId;
            }
            else if (check.length === 0) {
                if (this.objectInfoTooltipView) {
                    this.objectInfoTooltipView.hideTooltip();
                }
                if (maxOrMin === 'min') {
                    accText = this.getAccMessage('child-divs-acc', 3);
                }
                else if (maxOrMin === 'max') {
                    accText = this.getAccMessage('child-divs-acc', 4);
                }
                this.enableTab(accId, true);
                if (this.prevAccText === accText) {
                    accText += ' ';
                }
                this.setAccMessage(accId, accText);
                this.prevAccText = accText;
                this.setFocus('dummy-focus');
                this.setFocus(accId, 50);
            }
        },
        /**
        * Pushes proper name for articat found in arr array.
        *
        * @method _getProperObjectName
        * @private 
        * @param {array} arr, {string} artifactPartsFound
        **/
        _getProperObjectName: function _getProperObjectName(arr, objectFound) {
            switch (objectFound) {
                case 'body':
                    {
                        arr.push('Duck Body');
                        break;
                    }
                case 'brush-head':
                    {
                        arr.push('Brush')
                        break;
                    }
                case 'tin':
                    {
                        arr.push('Tin Can');
                        break;
                    }
                case 'pin':
                    {
                        arr.push('Paperclip');
                        break;
                    }
                case 'cassete':
                    {
                        arr.push('Cassette');
                        break;
                    }
                default:
                    {
                        arr.push(objectFound)
                        break;
                    }
            }
            return arr;
        },
        /**
        * Triggers When x steper value change.
        * @method _moveCursorX
        * @private
        */
        _moveCursorX: function _moveCursorX(eventParam) {
            var $object = this.$('.' + this.type + '-cursor-container'),
                returnValue;

            this.stopReading();
            this.countForXY += 1;
            this.trigger(rightPanelClass.events.ENABLE_BUTTONS, false, true);
            this.trigger(rightPanelClass.events.UPADATE_STEPER_STATUS_VALUES);
            if (this.$('.red-box-container').css('display') !== 'none') {
                this.trigger(rightPanelClass.events.HIDE_RED_BOX);
            }

            if (this.junkFoundTooltipView) {
                this.junkFoundTooltipView.hideTooltip();
            }

            if (eventParam) {
                returnValue = this.checkUpDown(eventParam);
                if (returnValue === '+') {
                    this.cursorLeft += 72;
                }
                else {
                    this.cursorLeft -= 72;
                }
                this.animateCursor($object, 'x', this.cursorLeft);
            }
        },

        /**
        * Triggers When y steper value change.
        * @method _moveCursorY
        * @private
        */

        _moveCursorY: function _moveCursorY(eventParam) {
            var $object = this.$('.' + this.type + '-cursor-container'),
                returnValue;
            this.stopReading();
            this.countForXY += 1;
            this.trigger(rightPanelClass.events.ENABLE_BUTTONS, false, true);
            this.trigger(rightPanelClass.events.UPADATE_STEPER_STATUS_VALUES);
            if (this.$('.red-box-container').css('display') !== 'none') {
                this.trigger(rightPanelClass.events.HIDE_RED_BOX);
            }

            if (this.junkFoundTooltipView) {
                this.junkFoundTooltipView.hideTooltip();
            }


            if (eventParam) {
                returnValue = this.checkUpDown(eventParam);
                if (returnValue === '+') {
                    this.cursorTop -= 72;
                }
                else {
                    this.cursorTop += 72;
                }
                this.animateCursor($object, 'y', this.cursorTop);
            }
        },

        /**
        * Checks foe up key or down key.
        * @method checkUpDown
        * @private
        */
        checkUpDown: function checkUpDown(eventParam) {
            if (eventParam.buttonType === 'spinner-up') {
                return '+';
            }
            else {
                return '-';
            }
        },

        /**
        * Removes Classes of artifactes taken by villain.
        * @method _removeClassFromRightSide
        * @private
        */
        _removeClassFromRightSide: function _removeClassFromRightSide(artifactPos) {
            var artifactParts = this.model.get('artifactParts'),
                $object,
                counter = 0,
                endValue = artifactPos.length - 1;
            for (; counter < endValue; counter++) {
                $object = this.$('.type-' + this.type + '-' + artifactParts[artifactPos[counter]].x + artifactParts[artifactPos[counter]].y);
                $object.removeClass('selected ' + artifactParts[artifactPos[counter]].id);
            }
        },

        /**
        * Animates cursor.
        * @method animateCursor
        * @private
        */
        animateCursor: function animateCursor($object, type, value) {

            var self = this;
            if (type === 'x') {
                $object.animate({ left: value }, 200, function () {
                    self.countForXY--;
                    if (self.countForXY === 0) {
                        self.trigger(rightPanelClass.events.ENABLE_BUTTONS, true, true);
                        self.trigger(rightPanelClass.events.CHECK_FOR_DIG_DISABLE);
                    }
                });
            }
            else {
                $object.animate({ top: value }, 200, function () {
                    self.countForXY--;
                    if (self.countForXY === 0) {
                        self.trigger(rightPanelClass.events.ENABLE_BUTTONS, true, true);
                        self.trigger(rightPanelClass.events.CHECK_FOR_DIG_DISABLE);
                    }
                });
            }
        },

        /**
        * Adds class to selected div of grid
        * @method _addClassToGridDiv
        * @private
        */

        _addClassToGridDiv: function _addClassToGridDiv(spinnerXValue, spinnerYValue) {
            this.$('.type-' + this.type + '-' + spinnerXValue + spinnerYValue).addClass('selected');
        },

        /**
        * rotates div.
        *
        * @method _rotateDiv
        * @private 
        **/
        _rotateDiv: function _rotateDiv(degree) {
            this.$cursorIconContainer.css({
                WebkitTransform: 'rotate(' + degree + 'deg)',
                '-webkit-transform': 'rotate(' + degree + 'deg)',
                '-moz-transform': 'rotate(' + degree + 'deg)',
                '-o-transform': 'rotate(' + degree + 'deg)',
                '-ms-transform': 'rotate(' + degree + 'deg)'
            });
        },

        /**
        * shows cursor container if value is true else hide.
        *
        * @method _showHideCursorAnimationContainer
        * @private 
        **/
        _showHideCursorAnimationContainer: function _showHideCursorAnimationContainer(bool) {
            if (bool === true) {
                this.$cursorIconContainer.addClass('dig-animation');
            }
            else {
                if (this.$cursorIconContainer.hasClass('dig-animation')) {
                    this.$cursorIconContainer.removeClass('dig-animation');
                }
            }
        },

        /**
        * create and show object Information tooltip
        *
        * @method _displayObjectInfoTooltip
        * @private
        * param event{object}, self{view object}
        **/
        _displayObjectInfoTooltip: function _displayObjectInfoTooltip(event, self) {
            var eventTarget = event.target,
                eventTargetParent = event.target.parentNode,
                eventTargetClass = eventTarget.className,
                eventTargetParentClass = eventTargetParent.className,
                hasSelectedCalss = false,
                hasEmpty = null,
                x = null,
                y = null,
                appendClass = null,
                arrowType = null,
                targetId = '',
                targetClass = '',
                container = null,
                index = null,
                currentObjectInfoTooltipViewEl = null, arrowPosition,
                tooltipArrowAdjustment = 1,
                closeTootipContainer = null;

            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isIOS === true || MathInteractives.Common.Utilities.Models.BrowserCheck.isNexus === true) {
                tooltipArrowAdjustment = 2;
            }

            if (self.junkFoundTooltipView) {
                self.junkFoundTooltipView.hideTooltip();
            }

            if (eventTargetClass.indexOf('selected') > -1) {
                hasSelectedCalss = true;
                hasEmpty = eventTargetClass.indexOf('empty');
                targetId = event.target.id;
                targetClass = event.target.className;
            }
            else if (eventTargetParentClass.indexOf('selected') > -1) {
                hasSelectedCalss = true;
                hasEmpty = eventTargetParentClass.indexOf('empty');
                targetId = event.target.parentNode.id;
                targetClass = event.target.parentNode.className;
            }

            if (hasSelectedCalss === true && hasEmpty === -1) {
                x = parseInt(targetId.substr(targetId.length - 2, 1));
                y = parseInt(targetId.substr(targetId.length - 1, 1));
                arrowType = self._getArrowType(x, y);
                if (self.type === 2) {
                    x -= 3;
                    y -= 3;
                }
                appendClass = targetClass.split(' ');

                if (appendClass[appendClass.length - 1] !== 'selected') {
                    event.stopPropagation();
                    self._initializeJunkInfoTooltip(targetId, x, y, arrowType);
                    self.objectInfoTooltipView.showTooltip();
                    if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                        closeTootipContainer = self.objectInfoTooltipView.$('.close-container');
                        closeTootipContainer.addClass('close-container-cursor');
                        //closeTootipContainer.off('touchstart').on('touchstart', function () { self._addHoverEffect() });
                        //closeTootipContainer.off('touchend').on('touchend', function () { self._removeHoverEffect() });
                        MathInteractives.Common.Utilities.Models.Utils.EnableTouch(closeTootipContainer);
                    }
                    else {
                        closeTootipContainer = self.objectInfoTooltipView.$('.close-container div');
                        closeTootipContainer.addClass('close-container-cursor');
                        closeTootipContainer.off('mouseenter').on('mouseenter', function () { self._addHoverEffect() });
                        closeTootipContainer.off('mouseleave').on('mouseleave', function () { self._removeHoverEffect() });
                    }


                    if (arrowType[1] === 'top') {
                        arrowPosition = self.objectInfoTooltipView.$('.object-info-container-arrow').css('top');
                        self.objectInfoTooltipView.$('.object-info-container-arrow').css({ 'top': parseInt(arrowPosition) + tooltipArrowAdjustment });
                    }
                    else if (arrowType[1] === 'right') {
                        arrowPosition = self.objectInfoTooltipView.$('.object-info-container-arrow').css('left');
                        self.objectInfoTooltipView.$('.object-info-container-arrow').css({ 'left': parseInt(arrowPosition) - tooltipArrowAdjustment });
                    }
                    else if (arrowType[1] === 'bottom') {
                        arrowPosition = self.objectInfoTooltipView.$('.object-info-container-arrow').css('top');
                        self.objectInfoTooltipView.$('.object-info-container-arrow').css({ 'top': parseInt(arrowPosition) - tooltipArrowAdjustment });
                    }
                    else if (arrowType[1] === 'left') {
                        arrowPosition = self.objectInfoTooltipView.$('.object-info-container-arrow').css('left');
                        self.objectInfoTooltipView.$('.object-info-container-arrow').css({ 'left': parseInt(arrowPosition) + tooltipArrowAdjustment });
                    }


                    currentObjectInfoTooltipViewEl = self.objectInfoTooltipView.$el;
                    container = currentObjectInfoTooltipViewEl.find('.image-container');
                    container.css({ 'background-image': 'url("' + self.filePath.getImagePath('archaeological-dig-images') + '")' });
                    container.addClass(appendClass[appendClass.length - 1] + '-tooltip');



                    closeTootipContainer.on('click', function (eve) {
                        self.objectInfoTooltipView.hideTooltip();
                    });
                    this.$('.object-container').off('click').on('click', function (event) { self._displayObjectInfoTooltip(event, self) });
                    // self.rightPanelView.objectInfoTooltipView.hideTooltip();
                }
            }
        },
        /**
        * Gives Hover Effect to close button of red box.
        *
        * @method _addHover  Effect
        * @private 
        **/
        _addHoverEffect: function _addHoverEffect() {
            var closeTootipContainer = null;

            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                closeTootipContainer = this.objectInfoTooltipView.$('.close-container');
            }
            else {
                closeTootipContainer = this.objectInfoTooltipView.$('.close-container div');
            }

            closeTootipContainer.addClass('cross-sign-hover');
            this._initializeCloseContainerTooltip(closeTootipContainer[0].id);
            this.closeContainerTooltipView.showTooltip();
        },

        /**
        * Removes Hover Effect to close button of red box.
        *
        * @method _removeHover  Effect
        * @private 
        **/
        _removeHoverEffect: function _removeHoverEffect() {
            var closeTootipContainer = null;

            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                closeTootipContainer = this.objectInfoTooltipView.$('.close-container');
            }
            else {
                closeTootipContainer = this.objectInfoTooltipView.$('.close-container div');
            }

            closeTootipContainer.removeClass('cross-sign-hover');
            this.closeContainerTooltipView.hideTooltip();
        },
        /**
        * returns arrowType depending on x,y values
        *
        * @method _getArrowType
        * @private
        * param x{integer},y{integer}
        **/
        _getArrowType: function _getArrowType(x, y) {
            var upperLimit = null,
                tooltipViewObject = MathInteractives.Common.Components.Theme2.Views.Tooltip, array = [];
            (this.model.get('type') === 1) ? upperLimit = 5 : upperLimit = 6;

            switch (true) {
                case (x === 0 && y === 0):
                    {
                        array.push(tooltipViewObject.ARROW_TYPE.TOP_RIGHT);
                        array.push('top');
                        return array;
                        break; //
                    }
                case (x === 0 && y === upperLimit):
                    {
                        array.push(tooltipViewObject.ARROW_TYPE.BOTTOM_RIGHT);
                        array.push('bottom');
                        return array;
                        break;
                    }
                case (x === upperLimit && y === 0):
                    {
                        array.push(tooltipViewObject.ARROW_TYPE.TOP_LEFT);
                        array.push('top');
                        return array;
                        break;
                    }
                case (x === upperLimit && y === upperLimit):
                    {
                        array.push(tooltipViewObject.ARROW_TYPE.BOTTOM_LEFT);
                        array.push('bottom');
                        return array;
                        break;
                    }
                case (x === 0 && (y > 0 && y < upperLimit)):
                    {
                        array.push(tooltipViewObject.ARROW_TYPE.RIGHT_MIDDLE);
                        array.push('right');
                        return array;
                        break;
                    }
                case (x === upperLimit && (y > 0 && y < upperLimit)):
                    {
                        array.push(tooltipViewObject.ARROW_TYPE.LEFT_MIDDLE);
                        array.push('left');
                        return array;
                        break;
                    }
                case ((x > 0 && x < upperLimit) && (y > upperLimit - 3)):
                    {
                        array.push(tooltipViewObject.ARROW_TYPE.BOTTOM_MIDDLE);
                        array.push('bottom');
                        return array;
                        break;
                    }
                case ((x > 0 && x < upperLimit) && (y <= upperLimit - 3)):
                    {
                        array.push(tooltipViewObject.ARROW_TYPE.TOP_MIDDLE);
                        array.push('top');
                        return array;
                        break;
                    }
            }
        },
        /**
        * place cursor above div with id-00
        *
        * @method _placeCursor
        * @private 
        **/
        _placeCursor: function () {
            var cursorLeft, cursorTop = null,
                type = this.type,
                steperObject = this.model.get('steperStatus'),
                xCount = steperObject.x,
                yCount = steperObject.y,
                UnitDisplacement = 72;

            if (type === 1) {
                cursorTop = 382;
                cursorLeft = 112;

                cursorLeft += (UnitDisplacement * xCount);
                cursorLeft += 'px';

                cursorTop -= (UnitDisplacement * yCount);
                cursorTop += 'px';
            }
            else if (type === 2) {
                cursorTop = 238;
                cursorLeft = 255;

                cursorLeft += (UnitDisplacement * xCount);
                cursorLeft += 'px';

                cursorTop -= (UnitDisplacement * yCount);
                cursorTop += 'px';
            }

            this.$('.' + type + '-cursor-container').css({
                'top': cursorTop,
                'left': cursorLeft
            });
        },


        /**
        * Displays all found element in container div
        *
        * @method _displayAllFoundCharacter
        * @private 
        **/
        _displayAllFoundCharacter: function _displayAllFoundCharacter() {
            this._displayArtifactParts();
            this._displayJunk();
            this._displayEmptyPlace();
        },
        /**
        * Displays all found artifact parts in corrospondent div
        *
        * @method _displayArtifactParts
        * @private 
        * param artifactPart{found artifact parts object}
        **/
        _displayArtifactParts: function _displayArtifactParts(artifactPart) {
            var artifactParts = this.model.get('artifactParts'),
                type = this.type;
            if (typeof (artifactPart) === 'undefined') {
                for (var i = 0; i < 3; i++) {
                    if (artifactParts[i].isFound === true) {
                        this.$('.type-' + type + '-' + artifactParts[i].x + artifactParts[i].y).addClass('selected ' + artifactParts[i].id);
                    }
                }
            }
            else {
                this.$('.type-' + type + '-' + artifactPart.x + artifactPart.y).addClass(artifactPart.id);
            }
        },
        /**
        * Displays all found junks in corrospondent div
        *
        * @method _displayJunk
        * @private 
        * param junk{found junks object},index{index of at which position in junk object junk has found}
        **/
        _displayJunk: function _displayJunk(junk, index) {
            var junks = this.model.get('junks'),
                ele = null,
                type = this.type,
                tooltipArrowAdjustment = 2;
            if (typeof (junk) === 'undefined') {
                for (var i = 0; i < 5; i++) {
                    for (var j = 0; j < junks[i].positionDetails.length; j++) {
                        if (junks[i].positionDetails[j].isFound === true) {
                            ele = '.type-' + type + '-' + junks[i].positionDetails[j].x + junks[i].positionDetails[j].y;
                            this.$(ele).addClass('selected ' + junks[i].id);
                        }
                    }
                }
            }
            else {
                ele = 'type-' + type + '-' + junk.positionDetails[index].x + junk.positionDetails[index].y;
                this.$('.' + ele).addClass(junk.id);
                this._initializeJunkFoundTooltip(ele);
                this.junkFoundTooltipView.showTooltip();
                var topPosition = this.junkFoundTooltipView.$('.tooltip-baseclass-arrow').css('top'),
                    leftPosition = this.junkFoundTooltipView.$('.tooltip-baseclass-arrow').css('left');
                if (MathInteractives.Common.Utilities.Models.BrowserCheck.isIOS === true || MathInteractives.Common.Utilities.Models.BrowserCheck.isNexus === true) {
                    tooltipArrowAdjustment = 2;
                }
                var browserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;
                //                if ((browserCheck.isIE === true && browserCheck.browserVersion !== '11.0')) {
                //                    this.junkFoundTooltipView.$('.tooltip-baseclass-arrow').css({ 'left': parseInt(leftPosition) + 1 });
                //                }
                this.junkFoundTooltipView.$('.tooltip-baseclass-arrow').css({ 'top': parseInt(topPosition) + tooltipArrowAdjustment });
                this.junkFoundTooltipView.$('.tooltip-baseclass-arrow').css({ 'left': parseInt(leftPosition) + 1 });
            }
        },
        /**
        * Displays all found empty palces in corrospondent div
        *
        * @method _displayEmptyPlace
        * @private         
        **/
        _displayEmptyPlace: function _displayEmptyPlace() {
            var emptyPalces = this.model.get('emptyPlacesFound'),
                coordinates = null,
                type = this.type;
            for (var i = 0; i < emptyPalces.length; i++) {
                coordinates = emptyPalces[i].split('_');
                this.$('.type-' + type + '-' + coordinates[0] + coordinates[1]).addClass('selected empty');
            }
        },

        /**
        * Initializes view for Tooltip of junk found
        * @method _initializeJunkFoundTooltip
        * @private
        * param elementId{string}
        */
        _initializeJunkFoundTooltip: function _initializeJunkFoundTooltip(elementId) {
            var tooltipProperties = {
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                id: this.idPrefix + 'junk-found-tooltip-container',
                type: MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.FORM_VALIDATION,
                baseClass: 'tooltip-baseclass',
                arrowBaseClass: 'tooltip-baseclass-arrow',
                text: this.getMessage('junk-found-text', 0),
                elementEl: this.idPrefix + elementId,
                containerWidth: 106,
                containerHeight: 40,
                textColor: '#614f39',
                arrowType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE
            };
            this.junkFoundTooltipView = MathInteractives.global.Theme2.Tooltip.generateTooltip(tooltipProperties);
        },

        /**
        * Initializes view for Tooltip of junk information
        * @method _initializeJunkInfoTooltip
        * @private
        * param elementId{string}, x{integer}, y{integer}, arrowType{string}
        */
        _initializeJunkInfoTooltip: function _initializeJunkInfoTooltip(elementId, x, y, arrowType) {
            var toolTipTemplate = MathInteractives.Common.Interactivities.ArchaeologicalDig.templates['objectInfoTooltip']({
                'idPrefix': this.idPrefix,
                'x': x,
                'y': y
            }).trim(),
                tooltipProperties = {
                    idPrefix: this.idPrefix,
                    player: this.player,
                    manager: this.manager,
                    path: this.filePath,
                    id: this.idPrefix + 'object-info-container',
                    type: MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.GENERAL,
                    baseClass: 'object-info-container ' + elementId,
                    arrowBaseClass: 'object-info-container-arrow',
                    text: toolTipTemplate,
                    elementEl: elementId,
                    containerWidth: 253,
                    containerHeight: 162,
                    textColor: '#ffffff',
                    arrowType: arrowType[0],
                    isShownOnClick: true,
                    closeOnDocumentClick: true,
                    positionType: MathInteractives.Common.Components.Theme2.Views.Tooltip.POSITION_TYPE.RIGHT
                };
            if (this.objectInfoTooltipView) {
                this.objectInfoTooltipView.hideTooltip();
                this.objectInfoTooltipView.remove();
            }
            this.objectInfoTooltipView = MathInteractives.global.Theme2.Tooltip.generateTooltip(tooltipProperties);
        },
        /**
        * Initializes view for Tooltip of close sign
        * @method _initializeCloseSignTooltip
        * @private
        * @param elementId{string}, x{integer}, y{integer}, arrowType{string}
        */
        _initializeCloseContainerTooltip: function _initializeCloseContainerTooltip(elementId) {
            var tooltipProperties = {
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                id: this.idPrefix + 'cross-sign-tooltip',
                type: MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.GENERAL,
                baseClass: 'cross-sign-tooltip',
                arrowBaseClass: 'cross-sign-tooltip-arrow',
                text: 'Close',
                elementEl: elementId,
                containerWidth: 50,
                containerHeight: 32,
                textColor: '#000000',
                arrowType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE,
                closeOnDocumentClick: true
            };
            if (this.closeContainerTooltipView !== null) {
                this.closeContainerTooltipView.hideTooltip();
                this.closeContainerTooltipView.remove();
            }
            else {
                this.closeContainerTooltipView = null;
            }
            this.closeContainerTooltipView = MathInteractives.global.Theme2.Tooltip.generateTooltip(tooltipProperties);
        }
    },
    {
        events: {
            /**
            * fired when user moves cursor in right panel.
            *       
            * @event UPADATE_STEPER_STATUS_VALUES         
            **/
            UPADATE_STEPER_STATUS_VALUES: 'updateSteperStatusValues',
            /**
            * fired when user moves cursor in right panel.
            *       
            * @event ENABLE_BUTTONS     
            * @param {Boolean} bool true denotes snable all buttons,{Boolean} callFromCursorMove true denotes trigger is from cursor move method. 
            **/
            ENABLE_BUTTONS: 'enableButtons',
            /**
            * This trgger indicate that red box in left panel needs to be hide.
            *       
            * @event HIDE_RED_BOX     
            **/
            HIDE_RED_BOX: 'hideRedBox',
            /**
            * this event causes dig button enable or disable depending on selected contanier class
            *       
            * @event CHECK_FOR_DIG_DISABLE     
            **/
            CHECK_FOR_DIG_DISABLE: 'checkForDigDisable'
        }
    });
    rightPanelClass = MathInteractives.Common.Interactivities.ArchaeologicalDig.Views.RightPanel;
})();