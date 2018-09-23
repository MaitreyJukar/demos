(function () {
    'use strict';

    /**
    * View for rendering the 'Drag and Drop' tab
    *
    * @class DragDrop
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.DragDropPan = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Holds the model of path for preloading files
        *
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,


        manager: null,

        /*
        * Player instance
        * @property player
        * @default null
        */
        player: null,

        /*
        * Id prefix
        * @property idPrefix
        * @default null
        */
        idPrefix: null,

        /*
        * point of inequality true
        * @property xPoint
        * @default null
        */
        xPoint: null,


        /*
        * basePointOffset for Calculations
        * @property basePointOffset
        * @default 0
        */
        basePointOffset: 0,


        /*
        * basePointOffset for Calculations
        * @property basePointOffset
        * @default -10
        */
        basePoint: -10,


        /*
        * Max Value of Number Line
        * @property basePointOffset
        * @default 10
        */
        maxPoint: 10,

        /*
        * margin Between two points
        * @property marginInPoints
        * @default 0
        */
        marginInPoints: 0,


        /*
        * circle Dropped
        * @property droppedCircleItem
        * @type String
        * @default null
        */
        droppedCircleItem: '',

        /*
        * dropped Indicator Item ( Left arrow / Right Arrow)
        * @property droppedIndicatorItem
        * @type String
        * @default null
        */
        droppedIndicatorItem: '',

        /*
        * View for check button
        * @property checkBtnView
        * @default null
        */
        checkBtnView: null,

        /*
        * Sign of Equation
        * @property sign
        * @default '>'
        */
        sign: '>',


        /*
        * Arrow Original Width
        * @property arrowWidth
        * @default 60
        */
        arrowWidth: 60,


        /*
        * Base Position of Drag Items
        * @property basePosition
        * @default
        */

        basePosition:
            {
                circlePoint: { left: '353', top: '180' },
                arrowPoint: { left: '541', top: '180' },
                widthArrowLine: 60,
                widthArrowHead: 14,
                baseLeftIndicatorCursorAtLeft: 45
            },




        /*
        * Boolean for screen disable
        * @property screenDisable
        * @default
        */
        screenDisable: false,

        /*
        * cursor position for left indicator drag item
        * @property leftIndicatorCursorAtLeft
        * @default 45
        */
        leftIndicatorCursorAtLeft: 45,



        /*
        * Container Id
        * @property containerId
        * @default null
        */
        containerId: null,  // {{idPrefix}drag-drop-container idprefix of numberline




        /*
       * View of Number line
       * @property $numberLineView
       * @default null
       */
        $numberLineView: null,


        /**
        * Unique Name for current Tab
        * @property tabName
        * @type String
        * @default ''
        */
        tabName: '',


        /**
        * Interval Between ticks
        * @property tickinterval
        * @type Number
        * @default 1
        */
        tickinterval: 1,


        /************* Pan balance specific **************************/


        /**
        * Current Dragging Arrow
        * @property currentDragArrow
        * @type String
        * @default 'double'
        */
        currentDragArrow: 'double',

        /**
        * Correct Droppable Arrow
        * @property expectedDropArrow
        * @type String
        * @default ''
        */
        expectedDropArrow: 'right',

        /**
        * Correct Droppable Arrow
        * @property expectedDropArrow
        * @type String
        * @default ''
        */
        expectedDropDot: 'filled',

        /**
       * Left of dot point
       * @property dotPointLeft
       * @type Number
       * @default 0
       */
        dotPointLeft: 0,



        /**
        *
        *
        * @method initialize
        **/
        initialize: function initialize() {

            this.manager = this.model.get('manager');
            this.player = this.model.getPlayer();
            this.idPrefix = this.model.get("idPrefix");

            this.filePath = this.model.get('path');
            this.$numberLineView = this.model.get('numberLineView');

            this.xPoint = this.model.get("xPoint");
            this.sign = this.model.get("sign");
            this.basePoint = this.model.get("minPoint");
            this.maxPoint = this.model.get("maxPoint");
            this.tabName = this.model.get("tabName");
            this.droppedCircleItem = this.model.get("droppedCircleItem");
            this.tickinterval = this.model.get('tickinterval');

            this.render();

            var equation = this.model.get('equation'),
                UtilClass = MathInteractives.Common.Utilities.Models.Utils;

            // Set Expected Arrow Direction & Dot Type based on equation parameters.

            if (equation.a < 0) {
                switch (this.sign) {
                    case '>': this.expectedDropArrow = 'left'; this.expectedDropDot = 'unfilled'; break;
                    case '&ge;': this.expectedDropArrow = 'left'; this.expectedDropDot = 'filled'; break;
                    case '&le;': this.expectedDropArrow = 'right'; this.expectedDropDot = 'filled'; break;
                    case '<': this.expectedDropArrow = 'right'; this.expectedDropDot = 'unfilled'; break;
                }
            }
            else {
                switch (this.sign) {
                    case '>': this.expectedDropArrow = 'right'; this.expectedDropDot = 'unfilled'; break;
                    case '&ge;': this.expectedDropArrow = 'right'; this.expectedDropDot = 'filled'; break;
                    case '&le;': this.expectedDropArrow = 'left'; this.expectedDropDot = 'filled'; break;
                    case '<': this.expectedDropArrow = 'left'; this.expectedDropDot = 'unfilled'; break;
                }
            }

            this.setBasePosition();

            UtilClass.EnableTouch(this.$('.drag-drop-indicator'), { specificEvents: UtilClass.SpecificEvents.DRAGGABLE });
            UtilClass.EnableTouch(this.$('.draggable-items'));
        },

        /**
        * Renders the view.
        *
        * @method render
        **/
        render: function render() {
            var self = this;

            // Template render in container
            var options = { idPrefix: this.idPrefix, tabName: this.tabName };
            this.$el.html(MathInteractives.Common.Components.templates.dragDropPanBalance(options).trim());


            // Set Bg images of Draggable items
            this.$el.find('.drag-arrow-width').css({
                'background-image': 'url("' + this.filePath.getImagePath('arrow-line-pan') + '")',
                'background-position': '0px -4049px'
            });

            this.$el.find('#' + this.idPrefix + '' + this.tabName + 'arrow-indicator .drag-left-arrow-image').css({
                'background-image': 'url("' + this.filePath.getImagePath('purple-left-arrow-head-pan') + '")'
            });

            this.$el.find('#' + this.idPrefix + '' + this.tabName + 'arrow-indicator .drag-right-arrow-image').css({
                'background-image': 'url("' + this.filePath.getImagePath('purple-right-arrow-head-pan') + '")'
            });

            var $dotItem = this.$el.find('#' + this.idPrefix + '' + this.tabName + '-dot');
            if (this.droppedCircleItem === "unfilled") {
                $dotItem.css({
                    'background-image': 'url("' + this.filePath.getImagePath('purple-dot-outline-pan') + '")',
                    'background-position': '-196px -977px'
                });
            }
            else {
                $dotItem.css({
                    'background-image': 'url("' + this.filePath.getImagePath('purple-dot-pan') + '")',
                    'background-position': '-52px -1264px'
                });
            }

            this.$el.find('.helper-image').css({
                'background-image': 'url("' + this.filePath.getImagePath('dot-helper-pan') + '")',
                'background-position': '-196px -967px;'
            });


            /******  Relocate the circle item to the x-point of number line ********/

            this.$el.find('#' + self.idPrefix + '' + self.tabName + "dot-helper").hide();
            this.dotPointLeft = self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + 'graph-pane-' + self.xPoint).offset().left - $dotItem.width() / 2;;
            var basePointOffsetTop = self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + 'graph-pane').offset().top - 1;
            $dotItem.offset({ left: this.dotPointLeft, top: basePointOffsetTop }).addClass("itemDropped").css({ 'z-index': '2', 'visibility': 'hidden' });
            //self.droppedCircleItem = "filled";
            //$dotItem.off('click').on('click', $.proxy(self.twinDotItem, self));
            this.$numberLineView.model.on('change:currentDotItemType', $.proxy(self.twinDotItem, self));


            //var circleItem = this.$el.find('#' + this.idPrefix + '' + this.tabName + '-dot').draggable({ axis: "x", containment: "parent" });

            /******* Make Arrow items Draggable *********************/

            var $arrowIndicatorEle = this.$el.find('#' + this.idPrefix + '' + this.tabName + 'arrow-indicator').removeClass('inactive');
            var doubleIndicator = $arrowIndicatorEle.draggable({

                start: function (event, ui) {
                    MathInteractives.global.SpeechStream.stopReading();

                },
                stop: function (event, ui) {
                    self.$el.find(this).css({ 'z-index': '1' });
                    if (self.currentDragArrow === 'left') {
                        if (!self.$el.find(this).hasClass('itemDropped')) {

                            self.currentDragArrow = 'double';
                            $arrowIndicatorEle.find('.drag-left-arrow-image,.drag-right-arrow-image').show();
                            self.$el.find(this).animate({ 'position': 'absolute', 'left': self.basePosition.arrowPoint.left + 'px', 'top': self.basePosition.arrowPoint.top + 'px', 'margin-left': '0px' }, 500, function () {
                                //$arrowIndicatorEle.draggable("option", "cursorAt", { left: self.basePosition.baseLeftIndicatorCursorAtLeft })
                            });
                        }
                        else {
                            setTimeout(function () {
                                self.leftIndicatorCursorAtLeft = $arrowIndicatorEle.width() - 10;
                                $arrowIndicatorEle.draggable("option", "cursorAt", { left: self.leftIndicatorCursorAtLeft })
                            }, 600)
                        }
                    }
                    else {
                        if (!self.$el.find(this).hasClass('itemDropped')) {

                            self.currentDragArrow = 'double';
                            $arrowIndicatorEle.find('.drag-left-arrow-image, .drag-right-arrow-image').show();

                            self.$el.find(this).animate({ 'position': 'absolute', 'left': self.basePosition.arrowPoint.left + 'px', 'top': self.basePosition.arrowPoint.top + 'px' }, 500, function () {
                                //$arrowIndicatorEle.draggable("option", "cursorAt", { left: self.basePosition.baseLeftIndicatorCursorAtLeft })
                            });
                        }
                        else {
                            setTimeout(function () {
                                $arrowIndicatorEle.draggable("option", "cursorAt", { left: 0 })
                            }, 600)
                        }

                    }
                },
                drag: function (event, ui) {
                    self.$el.find(this).css('z-index', '10');

                    var $dotItem = self.$el.find('#' + self.idPrefix + '' + self.tabName + '-dot'),
                        $leftImage = $arrowIndicatorEle.find('.drag-left-arrow-image'),
                        $RightImage = $arrowIndicatorEle.find('.drag-right-arrow-image'),
                        $HelperImage = $arrowIndicatorEle.find('.drag-drop-helper-arrow').offset();

                    // Code to alter direction of draggable item when current draggable item position is left/right of slider handle(dot item)

                    if ($(this).offset().top >= $dotItem.offset().top - 50 && $(this).offset().top <= $dotItem.offset().top + 50) {

                        var dotItemLeft = self.$el.find('#' + self.idPrefix + '' + self.tabName + '-dot').offset().left
                        if (dotItemLeft >= $HelperImage.left) {
                            self.currentDragArrow = 'left';
                            $leftImage.show();
                            $RightImage.hide();
                        }
                        else {
                            self.currentDragArrow = 'right';
                            $RightImage.show();
                            $leftImage.hide();
                        }
                    }
                    else {
                        if (self.currentDragArrow !== 'double') {
                            self.currentDragArrow = 'double';
                            $leftImage.show();
                            $RightImage.show();
                        }
                    }

                },
                containment: $('#' + self.idPrefix + 'activity-area-' + self.player.getCurrentActiveTab())
            });


            this.$('.draggable-items').on('dragstart', $.proxy(function (event, ui) {
                this.trigger('number-line-drag-start', event, ui);
            }, this));


            var graphDropArea = self.$el.find('.graph-droppable').droppable({

                accept: self.$('.ui-draggable'),
                drop: function (event, ui) {

                    var element = ui.draggable[0];
                    if (element.id === "" || element.id === undefined || element.id === null) {
                        element = element.parentNode;
                    }

                    var itemLeft = self.dotPointLeft;
                    //if (element.id === self.idPrefix + '' + self.tabName + "filled-dot" || element.id === self.idPrefix + '' + self.tabName + "unfilled-dot") {
                    //    itemLeft = self.$el.find(element).offset().left + self.$el.find(element).width() / 2;
                    //}

                    if (element.id === self.idPrefix + '' + self.tabName + "arrow-indicator") {
                        if (self.currentDragArrow === 'left') {
                            itemLeft = itemLeft - self.$el.find(element).width() + 27;
                        }
                        else {
                            itemLeft = itemLeft + 14;
                        }
                    }

                    self.marginInPoints = self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + 'graph-pane-' + self.basePoint).offset().left - self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + 'graph-pane-' + (self.basePoint + self.tickinterval)).offset().left;
                    self.$el.find(element).offset({ left: itemLeft, top: basePointOffsetTop }).addClass("itemDropped");

                    if (element.id === self.idPrefix + '' + self.tabName + "arrow-indicator") {

                        if (self.currentDragArrow === 'left') {

                            if (self.expectedDropArrow === 'left' && self.droppedCircleItem === self.expectedDropDot) {

                                self.droppedIndicatorItem = "left";
                                self.$el.find('#' + self.idPrefix + '' + self.tabName + "arrow-helper").hide();
                                var $leftIndicatorContainer = $arrowIndicatorEle.css('margin-left', '0px');
                                var $leftIndicatorWidth = $arrowIndicatorEle.find('.drag-arrow-width');

                                var containerwidth = $leftIndicatorContainer.width();
                                var incWidth = $leftIndicatorContainer.offset().left - self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + 'graph-pane-left-arrow').offset().left + containerwidth;

                                $arrowIndicatorEle.find('.drag-arrow-width').css('background-position', '0px -4095px');
                                $arrowIndicatorEle.find('.drag-left-arrow-image').css('background-position', '-666px -475px');
                                $arrowIndicatorEle.find('.drag-right-arrow-image').css('background-position', '-439px -804px');

                                self.disableScreenItems();
                                self.model.setCorrectDropValue(true);
                                $leftIndicatorWidth.animate({ 'width': incWidth - 27 + 'px' }, 500);
                                $leftIndicatorContainer.animate({ 'width': (incWidth) + 'px', 'margin-left': (-incWidth + containerwidth) + 'px' }, 500, function () {
                                    var $arrowHead = $arrowIndicatorEle.find('.drag-right-arrow-image');
                                    self._pulsateDragItems($arrowHead);
                                    self.updateFocusRect(self.tabName + 'arrow-indicator');
                                    self.screenDisable = true;

                                });

                            }
                            else {
                                self.currentDragArrow = 'double';
                                self.trigger('disableSlider');
                                $arrowIndicatorEle.find('.drag-left-arrow-image').show(); self.$el.find('#' + self.idPrefix + '' + self.tabName + 'arrow-indicator').find('.drag-right-arrow-image').show();
                                $arrowIndicatorEle.animate({ 'position': 'absolute', 'left': self.basePosition.arrowPoint.left + 'px', 'top': self.basePosition.arrowPoint.top + 'px' }, 500, function () {
                                    self.trigger('enableSlider');
                                }).removeClass('itemDropped');
                            }
                        }
                        else {

                            if (self.expectedDropArrow === 'right' && self.droppedCircleItem === self.expectedDropDot) {

                                self.droppedIndicatorItem = "right";
                                self.$el.find('#' + self.idPrefix + '' + self.tabName + "arrow-helper").hide();

                                // Animate right arrow on drop
                                var $rightIndicatorWidth = $arrowIndicatorEle.find('.drag-arrow-width');
                                var incWidth = self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + 'graph-pane-right-arrow').offset().left - $arrowIndicatorEle.offset().left;


                                $arrowIndicatorEle.find('.drag-arrow-width').css('background-position', '0px -4095px');
                                $arrowIndicatorEle.find('.drag-left-arrow-image').css('background-position', '-666px -475px');
                                $arrowIndicatorEle.find('.drag-right-arrow-image').css('background-position', '-439px -804px');


                                self.disableScreenItems();
                                self.model.setCorrectDropValue(true);
                                $rightIndicatorWidth.animate({ 'width': incWidth + 'px' }, 500);
                                $arrowIndicatorEle.animate({ 'width': (incWidth + 18) + 'px' }, 500, function () {
                                    var $arrowHead = $arrowIndicatorEle.find('.drag-right-arrow-image');
                                    self._pulsateDragItems($arrowHead);
                                    self.updateFocusRect(self.tabName + 'arrow-indicator');
                                    self.screenDisable = true;
                                });
                            }
                            else {
                                self.currentDragArrow = 'double';
                                self.trigger('disableSlider');
                                $arrowIndicatorEle.find('.drag-left-arrow-image').show(); self.$el.find('#' + self.idPrefix + '' + self.tabName + 'arrow-indicator').find('.drag-right-arrow-image').show();
                                $arrowIndicatorEle.animate({ 'position': 'absolute', 'left': self.basePosition.arrowPoint.left + 'px', 'top': self.basePosition.arrowPoint.top + 'px' }, 500, function () {
                                    self.trigger('enableSlider');
                                }).removeClass('itemDropped');
                            }
                        }
                    }

                    // Enable Check
                    if (self.viewFeedbackNegative !== undefined && self.viewFeedbackNegative !== null) {
                        self.viewFeedbackNegative.closeHintFeedBackPanel();
                    }
                    if (self.droppedCircleItem !== "" && self.droppedIndicatorItem !== "") {
                        self.model.setButtonState('active');
                    }

                    self.model.setFeedbackState('hide');

                    //  self.checkBtnView.setButtonState(MathInteractives.global.Button.BUTTON_STATE_ACTIVE);
                },

                out: function (event, ui) {
                    // this .. snap to its original position


                    var element = ui.draggable[0];
                    if (element.id === "") {
                        element = element.parentNode;
                    }

                    if (self.$el.find(element).hasClass("itemDropped")) {

                        self.$el.find(element).removeClass("itemDropped");


                        if (element.id === self.idPrefix + '' + self.tabName + "arrow-indicator") {
                            if (self.droppedIndicatorItem === "left") {
                                self.droppedIndicatorItem = "";
                            }
                        }
                        else {
                            if (self.droppedIndicatorItem === "right") {
                                self.droppedIndicatorItem = "";
                            }
                        }
                    }

                    if (self.droppedCircleItem === "" || self.droppedIndicatorItem === "") {
                        //self.checkBtnView.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED);
                        self.model.setButtonState('disabled');
                    }
                    self.model.setFeedbackState('hide');
                }
            });

            // this.loadScreen('inequality');

            var $graphPane = self.$numberLineView.$el.find('.graph-pane'), droptop, dropWidth;
            //droptop = parseInt($('#'+self.idPrefix+self.tabName+'graph-pane').css('marign-top').replace('px', ''), 10) - 7;
            dropWidth = parseInt(self.$numberLineView.lineWidth, 10) + 10;
            self.$el.find('.graph-droppable').css({ 'width': dropWidth + 'px' }).offset($graphPane.offset()).offset({ 'top': $graphPane.offset().top - 5 });
        },


        /**
       * Function to toggle the circle into filled/hollow state
       * @method twinDotItem
       **/
        twinDotItem: function () {

            if (this.droppedCircleItem === 'filled') {
                this.droppedCircleItem = 'unfilled';
                this.$el.find('#' + this.idPrefix + '' + this.tabName + '-dot').css({
                    'background-image': 'url("' + this.filePath.getImagePath('purple-dot-outline-pan') + '")',
                    'background-position': '-196px -977px'
                });

            }
            else {
                this.droppedCircleItem = 'filled';
                this.$el.find('#' + this.idPrefix + '' + this.tabName + '-dot').css({
                    'background-image': 'url("' + this.filePath.getImagePath('purple-dot-pan') + '")',
                    'background-position': '-52px -1264px'
                });
            }
        },


        /**
        * Function to pulsate Drag Item thrice when correctly dropped
        * @method _pulsateDragItems
        **/
        _pulsateDragItems: function ($arrowHead) {


            var maxScale = 1.30,
                minScale = 1.00,
                incScale = 0.01,
                scaleValue = minScale,
                timerCount = 0,
                occuranceMax = 3,
                occurance = 1,
                $dotItem = $('#' + this.idPrefix + this.tabName + 'graph-pane-slider-handle'), scaleTimer;

            scaleTimer = setInterval($.proxy(function () {

                switch (timerCount) {
                    case 0: {
                        scaleValue += incScale;
                        scaleValue = parseFloat(scaleValue.toFixed(2));

                        if (scaleValue === maxScale) {
                            timerCount++;
                        }
                        break;
                    }
                    case 1: {
                        scaleValue -= incScale;
                        scaleValue = parseFloat(scaleValue.toFixed(2));

                        if (scaleValue === minScale) {
                            timerCount++;
                        }
                        break;
                    }
                    default: {
                        occurance++;
                        if (occurance <= occuranceMax) {
                            timerCount = 0;
                        }
                        else {
                            clearInterval(scaleTimer);
                        }
                        break;
                    }
                }

                $arrowHead.parent().css({
                    '-ms-transform': 'scaleY(' + scaleValue + ')',
                    '-webkit-transform': 'scaleY(' + scaleValue + ')',
                    '-moz-transform': 'scaleY(' + scaleValue + ')',
                    'transform': 'scaleY(' + scaleValue + ')'
                });

                $dotItem.css({
                    '-ms-transform': 'scale(' + scaleValue + ')',
                    '-webkit-transform': 'scale(' + scaleValue + ')',
                    '-moz-transform': 'scale(' + scaleValue + ')',
                    'transform': 'scale(' + scaleValue + ')'
                });


            }, this), 17);

        },


        /**
        * Function to drop draggable arrow item using keyboard for accessibility purpose
        * @method dropUsingKeys
        **/
        dropUsingKeys: function dropUsingKeys(left, top, slotNo) {
            var self = this;

            var $arrowIndicatorEle = this.$el.find('#' + this.idPrefix + '' + this.tabName + 'arrow-indicator');

            var $leftImage = $arrowIndicatorEle.find('.drag-left-arrow-image'),
                $RightImage = $arrowIndicatorEle.find('.drag-right-arrow-image'),
                $HelperImage = $arrowIndicatorEle.find('.drag-drop-helper-arrow').offset();

            var newLeft = left, newTop = top, returnInfo ;
            newTop = newTop - 3;

            $arrowIndicatorEle.css({ 'z-index': '1' });

            if (slotNo === 1) {
                $RightImage.hide();
                newLeft = newLeft - $arrowIndicatorEle.width() + 17;

            }
            else {
                $leftImage.hide();
                newLeft = newLeft + 5;
            }

            self.marginInPoints = self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + 'graph-pane-' + self.basePoint).offset().left - self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + 'graph-pane-' + (self.basePoint + self.tickinterval)).offset().left;
            $arrowIndicatorEle.offset({ left: newLeft, top: newTop }).addClass("itemDropped");

            returnInfo = { expectedArrow: self.expectedDropArrow, droppedArrow: self.currentDragArrow, expectedCircle: self.expectedDropDot, droppedCircle: self.droppedCircleItem };

            if (slotNo === 1) {
                self.currentDragArrow = 'left';
                returnInfo = { expectedArrow: self.expectedDropArrow, droppedArrow: self.currentDragArrow, expectedCircle: self.expectedDropDot, droppedCircle: self.droppedCircleItem };
                if (self.expectedDropArrow === 'left' && self.droppedCircleItem === self.expectedDropDot) {

                    self.droppedIndicatorItem = "left";
                    self.$el.find('#' + self.idPrefix + '' + self.tabName + "arrow-helper").hide();
                    var $leftIndicatorContainer = $arrowIndicatorEle.css('margin-left', '0px');
                    var $leftIndicatorWidth = $arrowIndicatorEle.find('.drag-arrow-width');

                    var containerwidth = $leftIndicatorContainer.width();
                    var incWidth = $leftIndicatorContainer.offset().left - self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + 'graph-pane-left-arrow').offset().left + containerwidth;

                    $arrowIndicatorEle.find('.drag-arrow-width').css('background-position', '0px -4095px');
                    $arrowIndicatorEle.find('.drag-left-arrow-image').css('background-position', '-666px -475px');
                    $arrowIndicatorEle.find('.drag-right-arrow-image').css('background-position', '-439px -804px');

                    self.disableScreenItems();
                    self.model.setCorrectDropValue(true);
                    $leftIndicatorWidth.animate({ 'width': incWidth - 27 + 'px' }, 500);
                    $leftIndicatorContainer.animate({ 'width': (incWidth) + 'px', 'margin-left': (-incWidth + containerwidth) + 'px' }, 500, function () {
                        var $arrowHead = $arrowIndicatorEle.find('.drag-right-arrow-image');
                        self._pulsateDragItems($arrowHead);
                        self.screenDisable = true;
                    });

                }
                else {
                    self.currentDragArrow = 'double';
             //       self.$numberLineView.resetDragDropTabIndex('arrow-indicator');
                    self.trigger('disableSlider');
                    $arrowIndicatorEle.find('.drag-left-arrow-image').show(); self.$el.find('#' + self.idPrefix + '' + self.tabName + 'arrow-indicator').find('.drag-right-arrow-image').show();
                    $arrowIndicatorEle.animate({ 'position': 'absolute', 'left': self.basePosition.arrowPoint.left + 'px', 'top': self.basePosition.arrowPoint.top + 'px' }, 500, function () {
                      self.trigger('enableSlider');
                    }).removeClass('itemDropped');
                    self.setFocus(self.tabName + 'dotted-box');
                }
            }
            else {
                self.currentDragArrow = 'right';
                returnInfo = { expectedArrow: self.expectedDropArrow, droppedArrow: self.currentDragArrow, expectedCircle: self.expectedDropDot, droppedCircle: self.droppedCircleItem };
                if (self.expectedDropArrow === 'right' && self.droppedCircleItem === self.expectedDropDot) {

                    self.droppedIndicatorItem = "right";
                    self.$el.find('#' + self.idPrefix + '' + self.tabName + "arrow-helper").hide();

                    // Animate right arrow on drop
                    var $rightIndicatorWidth = $arrowIndicatorEle.find('.drag-arrow-width');
                    var incWidth = self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + 'graph-pane-right-arrow').offset().left - $arrowIndicatorEle.offset().left;


                    $arrowIndicatorEle.find('.drag-arrow-width').css('background-position', '0px -4095px');
                    $arrowIndicatorEle.find('.drag-left-arrow-image').css('background-position', '-666px -475px');
                    $arrowIndicatorEle.find('.drag-right-arrow-image').css('background-position', '-439px -804px');


                    self.disableScreenItems();
                    self.model.setCorrectDropValue(true);
                    $rightIndicatorWidth.animate({ 'width': incWidth + 'px' }, 500);
                    $arrowIndicatorEle.animate({ 'width': (incWidth + 18) + 'px' }, 500, function () {
                        var $arrowHead = $arrowIndicatorEle.find('.drag-right-arrow-image');
                        self._pulsateDragItems($arrowHead);
                        self.screenDisable = true;
                    });
                }
                else {
                    self.currentDragArrow = 'double';
                  //  self.$numberLineView.resetDragDropTabIndex('arrow-indicator');
                    self.trigger('disableSlider');
                    $arrowIndicatorEle.find('.drag-left-arrow-image').show(); self.$el.find('#' + self.idPrefix + '' + self.tabName + 'arrow-indicator').find('.drag-right-arrow-image').show();
                    $arrowIndicatorEle.animate({ 'position': 'absolute', 'left': self.basePosition.arrowPoint.left + 'px', 'top': self.basePosition.arrowPoint.top + 'px' }, 500, function () {
                        self.trigger('enableSlider');
                    }).removeClass('itemDropped');
                    self.setFocus(self.tabName + 'dotted-box');
                }
            }


            // Enable Check
            if (self.viewFeedbackNegative !== undefined && self.viewFeedbackNegative !== null) {
                self.viewFeedbackNegative.closeHintFeedBackPanel();
            }
            if (self.droppedCircleItem !== "" && self.droppedIndicatorItem !== "") {
                self.model.setButtonState('active');
            }

            self.model.setFeedbackState('hide');

            return returnInfo;

        },


        /**
        * Functionality to set the Base position of Draggable Elements
        * @method setBasePosition
        **/

        setBasePosition: function setBasePosition() {
            var arrowTop, arrowLeft, self = this;
            var xPointOffsetLeft = self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + 'graph-pane-' + self.xPoint).offset().left;
            var xPointOffsetTop = self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + 'graph-pane-' + self.xPoint).offset().top;

            arrowTop = this.$el.find('#' + this.idPrefix + '' + this.tabName + 'arrow-indicator').css('top').replace('px', '');
            arrowLeft = this.$el.find('#' + this.idPrefix + '' + this.tabName + 'arrow-indicator').css('left').replace('px', '');

            this.basePosition =
                {
                    circlePoint: { left: xPointOffsetLeft, top: xPointOffsetTop },
                    arrowPoint: { left: arrowLeft, top: arrowTop },
                    widthArrowLine: 60,
                    widthArrowHead: 14
                }

            this.basePosition.baseLeftIndicatorCursorAtLeft = this.basePosition.widthArrowLine - this.basePosition.widthArrowHead;
            this.leftIndicatorCursorAtLeft = this.basePosition.baseLeftIndicatorCursorAtLeft;
        },


        /**
        * Events bound on elements in 'el'
        *
        * type Object
        **/
        events: {
            'mouseover .draggable-items': '_mouseoverDragItems',
            'mouseout  .draggable-items': '_mouseoutDragItems'
        },


        /**
        * Function to disable Screen Items
        *
        * @method disableScreenItems
        **/

        disableScreenItems: function disableScreenItems() {
            //this.checkBtnView.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED);
            // this.model.setButtonState('disabled');
            this.$el.find('#' + this.idPrefix + '' + this.tabName + 'arrow-indicator').draggable("disable").css('cursor', 'default').addClass('inactive');
            this.screenDisable = true;

        },


        /**
        * Mouse over event on drag Items
        *
        * @method _mouseoverDragItems
        **/
        _mouseoverDragItems: function _mouseoverDragItems(event) {

            var $Indicator = this.$el.find('#' + this.idPrefix + '' + this.tabName + 'arrow-indicator');
            if (!$Indicator.hasClass('inactive')) {

                if (event.target.id === '' + this.idPrefix + '' + this.tabName + 'filled-dot' || event.target.id === '' + this.idPrefix + '' + this.tabName + 'unfilled-dot') {
                    this.$el.find(event.target).css('background-position', '0px -37px');
                }
                else {
                    var element = event.target;
                    if (event.target.id === "" || event.target.id === undefined || event.target.id === null || $(event.target).hasClass('acc-read-elem')) {
                        element = event.target.parentNode;
                    }

                    this.$el.find(element).find('.drag-arrow-width').css('background-position', '0px -4072px');
                    this.$el.find(element).find('.drag-left-arrow-image').css('background-position', '-666px -448px');
                    this.$el.find(element).find('.drag-right-arrow-image').css('background-position', '-439px -777px');


                }
            }
        },
        /**
        * Mouse out event on drag Items
        *
        * @method _mouseoutDragItems
        **/
        _mouseoutDragItems: function _mouseoutDragItems(event) {
            var $Indicator = this.$el.find('#' + this.idPrefix + '' + this.tabName + 'arrow-indicator');
            if (!$Indicator.hasClass('inactive')) {
                if (event.target.id === '' + this.idPrefix + '' + this.tabName + 'filled-dot' || event.target.id === '' + this.idPrefix + '' + this.tabName + 'unfilled-dot') {
                    this.$el.find(event.target).css('background-position', '0px 0px');
                }
                else {
                    var element = event.target;
                    if (event.target.id === "" || event.target.id === undefined || event.target.id === null || $(event.target).hasClass('acc-read-elem')) {
                        element = event.target.parentNode;
                    }

                    this.$el.find(element).find('.drag-arrow-width').css('background-position', '0px -4049px');
                    this.$el.find(element).find('.drag-left-arrow-image').css('background-position', '-666px -421px');
                    this.$el.find(element).find('.drag-right-arrow-image').css('background-position', '-439px -750px');

                }
            }
        }
    }
        , {

            generateDragDropPanBalance: function (options) {
                if (options) {
                    var customDragDropModel = new MathInteractives.Common.Components.Models.DragDropPan(options);
                    var customDragDropView = new MathInteractives.Common.Components.Views.DragDropPan({ model: customDragDropModel, el: $('#' + options.containerId) });
                    return customDragDropView;
                }
            }
        });

    MathInteractives.global.DragDropPan = MathInteractives.Common.Components.Views.DragDropPan;


})();