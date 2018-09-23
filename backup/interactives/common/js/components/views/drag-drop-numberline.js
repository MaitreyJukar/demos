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
    MathInteractives.Common.Components.Views.DragDropNumberLine = MathInteractives.Common.Player.Views.Base.extend({

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
        * @default 27
        */
        arrowWidth: 27,


        /*
        * Base Position of Drag Items
        * @property basePosition
        * @default
        */

        basePosition:
            {
                filledDot: { left: '350', top: '180' },
                unfilledDot: { left: '410', top: '180' },
                rightArrow: { left: '538', top: '180' },
                leftArrow: { left: '475', top: '180' },
                widthArrowLine: 27
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
        * @default
        */
        leftIndicatorCursorAtLeft: 35,



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

            // this.tickinterval = this.model.get('tickinterval');



            this.render();
            this._attachEvents();
            this.setBasePosition();

            //$.fn.EnableTouch('.ui-draggable');
        },

        /**
        * Attaches mouse and touch events
        *
        * @method _attachEvents
        * @private
        **/
        _attachEvents: function _attachEvents() {
            var Utils = MathInteractives.Common.Utilities.Models.Utils,
                $el = this.$el.find('.draggable-items'), // returns array
                arrSize = $el.length,
                counter = 0;

            $el.off('mouseover').on('mouseover', $.proxy(this._mouseoverDragItems, this));
            $el.off('mouseout').on('mouseout', $.proxy(this._mouseoutDragItems, this));

            for (counter = 0; counter < arrSize; counter++) {
                Utils.EnableTouch($el[counter], { specificEvents: Utils.SpecificEvents.DRAGGABLE });
            }


        },

        /**
        * Renders the view.
        *
        * @method render
        **/
        render: function render() {
            var self = this;

            var options = { idPrefix: this.idPrefix, tabName: this.tabName };
            this.$el.html(MathInteractives.Common.Components.templates.dragDrop(options).trim());


            this.$el.find('.drag-arrow-width').css({
                'background-image': 'url("' + this.filePath.getImagePath('arrow-line') + '")',
                'background-position': '0px -4108px'
            });

            this.$el.find('#' + this.idPrefix + '' + this.tabName + 'left-indicator .drag-arrow-image').css({
                'background-image': 'url("' + this.filePath.getImagePath('purple-left-arrow-head') + '")',
                'background-position': '-18px -1470px'
            });

            this.$el.find('#' + this.idPrefix + '' + this.tabName + 'right-indicator .drag-arrow-image').css({
                'background-image': 'url("' + this.filePath.getImagePath('purple-right-arrow-head') + '")',
                'background-position': '-31px -1470px'
            });

            this.$el.find('#' + this.idPrefix + '' + this.tabName + 'filled-dot').css({
                'background-image': 'url("' + this.filePath.getImagePath('purple-dot') + '")',
                'background-position': '-453px -750px'
            });
            this.$el.find('#' + this.idPrefix + '' + this.tabName + 'unfilled-dot').css({
                'background-image': 'url("' + this.filePath.getImagePath('purple-dot-outline') + '")',
                'background-position': '-657px -643px'
            });


            this.$el.find('.helper-image').css({
                'background-image': 'url("' + this.filePath.getImagePath('dot-helper') + '")',
                'background-position': '0 -1470px'
            });




            var filledDot = this.$el.find('#' + this.idPrefix + '' + this.tabName + 'filled-dot').draggable({
                start: function (event, ui) {
                    MathInteractives.global.SpeechStream.stopReading();
                    if (self.$el.find(this).hasClass('itemDropped')) {
                        self.$el.find('#' + self.idPrefix + '' + self.tabName + "filled-helper").show();
                    }
                },
                stop: function (event, ui) {
                    self.$el.find(this).css({ 'z-index': '2' });
                    if (!self.$el.find(this).hasClass('itemDropped')) {
                        self.$el.find(this).animate({ 'position': 'absolute', 'left': self.basePosition.filledDot.left + 'px', 'top': self.basePosition.filledDot.top + 'px' }, 500);
                    }
                },
                drag: function (event, ui) {
                    self.$el.find(this).css('z-index', '10');
                },

                //handle:'#dot-helper',

                containment: "document"



            });
            var unfilledDot = this.$el.find('#' + this.idPrefix + '' + this.tabName + 'unfilled-dot').draggable({
                start: function (event, ui) {
                    MathInteractives.global.SpeechStream.stopReading();
                    if (self.$el.find(this).hasClass('itemDropped')) {
                        self.$el.find('#' + self.idPrefix + '' + self.tabName + "unfilled-helper").show();
                    }
                },
                stop: function (event, ui) {
                    self.$el.find(this).css({ 'z-index': '2' });
                    if (!self.$el.find(this).hasClass('itemDropped')) {
                        self.$el.find(this).animate({ 'position': 'absolute', 'left': self.basePosition.unfilledDot.left + 'px', 'top': self.basePosition.unfilledDot.top + 'px' }, 500);
                    }
                },
                drag: function (event, ui) {
                    self.$el.find(this).css('z-index', '10');
                },
                containment: "document"
            });
            var leftIndicator = this.$el.find('#' + this.idPrefix + '' + this.tabName + 'left-indicator').draggable({

                start: function (event, ui) {
                    MathInteractives.global.SpeechStream.stopReading();
                    var element = this;
                    if (element.id === "") {
                        element = element.parentNode;
                    }

                    if (self.$el.find(element).hasClass('itemDropped')) {

                        self.$el.find(element).find('.drag-arrow-width').css('width', '27px');
                        self.$el.find(element).css({ 'margin-left': '0px' });
                        self.$el.find('#' + self.idPrefix + '' + self.tabName + "left-helper").show();
                        //self.$el.find(element).css({ 'postion': 'absolute', 'left': event.pageX + 'px', 'width': '45px' });
                        self.$el.find(element).css({ 'width': '45px' });
                    }

                },
                stop: function (event, ui) {
                    self.$el.find(this).css({ 'z-index': '1' });
                    if (!self.$el.find(this).hasClass('itemDropped')) {
                        // self.$el.find('#' + self.idPrefix +'' + self.tabName + 'left-indicator').width(self.arrowWidth + 18);
                        //  self.$el.find('#' + self.idPrefix +'' + self.tabName + 'left-indicator').find('.drag-arrow-width').width(self.arrowWidth);

                        self.$el.find(this).animate({ 'position': 'absolute', 'left': self.basePosition.leftArrow.left + 'px', 'top': self.basePosition.leftArrow.top + 'px', 'margin-left': '0px' }, 500, function () {
                            self.leftIndicatorCursorAtLeft = 35;
                            self.$el.find("#" + self.idPrefix + '' + self.tabName + "left-indicator").draggable("option", "cursorAt", { left: self.leftIndicatorCursorAtLeft })
                        });
                    }
                    else {
                        setTimeout(function () {
                            self.leftIndicatorCursorAtLeft = self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').width() - 10;
                            self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').draggable("option", "cursorAt", { left: self.leftIndicatorCursorAtLeft })
                        }, 600)
                    }
                },
                drag: function (event, ui) {
                    self.$el.find(this).css('z-index', '10');
                },
                containment: "document"
            });
            var rightIndicator = this.$el.find('#' + this.idPrefix + '' + this.tabName + 'right-indicator').draggable({
                start: function (event, ui) {
                    MathInteractives.global.SpeechStream.stopReading();
                    var element = this;
                    if (element.id === "") {
                        element = element.parentNode;
                    }

                    if (self.$el.find(element).hasClass('itemDropped')) {
                        self.$el.find(element).find('.drag-arrow-width').css('width', self.basePosition.widthArrowLine + 'px');
                        //self.$el.find(element).css({ 'left': event.pageX + 'px', 'width': '54px' });
                        self.$el.find(element).css({ 'width': '46px' });
                        self.$el.find('#' + self.idPrefix + '' + self.tabName + "right-helper").show();
                    }

                },



                stop: function (event, ui) {
                    self.$el.find(this).css({ 'z-index': '1' });
                    if (!self.$el.find(this).hasClass('itemDropped')) {

                        self.$el.find(this).animate({ 'position': 'absolute', 'left': self.basePosition.rightArrow.left + 'px', 'top': self.basePosition.rightArrow.top + 'px' }, 500, function () {

                            self.$el.find('#' + self.idPrefix + '' + self.tabName + 'right-indicator').draggable("option", "cursorAt", { left: 0 })
                        });
                    }
                    else {
                        setTimeout(function () {
                            self.$el.find('#' + self.idPrefix + '' + self.tabName + 'right-indicator').draggable("option", "cursorAt", { left: 0 })
                        }, 600)
                    }
                },

                drag: function (event, ui) {
                    self.$el.find(this).css('z-index', '10');
                },
                containment: "document"
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

                    var itemLeft = self.$el.find(element).offset().left;
                    if (element.id === self.idPrefix + '' + self.tabName + "filled-dot" || element.id === self.idPrefix + '' + self.tabName + "unfilled-dot") {
                        itemLeft = self.$el.find(element).offset().left + self.$el.find(element).width() / 2;
                    }

                    if (element.id === self.idPrefix + '' + self.tabName + "left-indicator") {
                        itemLeft = self.$el.find(element).offset().left + self.$el.find(element).width() - 7;
                    }
                    var itemTop = self.$el.find(element).offset().top;

                    var basePointOffsetLeft = self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + '-graph-pane-' + self.basePoint).offset().left;
                    self.basePointOffset = basePointOffsetLeft;

                    var maxPointOffsetLeft = self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + '-graph-pane-' + self.maxPoint).offset().left;

                    var basePointOffsetTop = self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + '-graph-pane-' + self.basePoint).offset().top;

                    var margin = self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + '-graph-pane-' + self.basePoint).offset().left - self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + '-graph-pane-' + (self.basePoint + self.tickinterval)).offset().left;
                    self.marginInPoints = margin;

                    // If item dropped is within number line range
                    if (itemLeft >= basePointOffsetLeft && itemLeft <= maxPointOffsetLeft) {


                        var actualDiff = ((itemLeft - basePointOffsetLeft) / margin);
                        var diff = parseInt(actualDiff, 10);
                        if (actualDiff - diff > 0.5 || actualDiff - diff < -0.5) {
                            diff = diff - 1;
                        }

                        var newLeft = basePointOffsetLeft + (diff * margin);
                        if (element.id === self.idPrefix + '' + self.tabName + "left-indicator") {

                            var newLeft = basePointOffsetLeft + (diff * margin) - self.$el.find(element).width() + 7;
                        }

                        basePointOffsetTop = basePointOffsetTop - 3;
                        if (element.id === self.idPrefix + '' + self.tabName + "filled-dot" || element.id === self.idPrefix + '' + self.tabName + "unfilled-dot") {

                            basePointOffsetTop = basePointOffsetTop - 4;
                            newLeft = newLeft - 12;
                        }
                        self.$el.find(element).offset({ left: newLeft, top: basePointOffsetTop }).addClass("itemDropped");
                    }
                    //
                    else {

                        var newLeft = 0;
                        if (itemLeft <= basePointOffsetLeft) {
                            basePointOffsetTop = basePointOffsetTop - 3;

                            if (element.id === self.idPrefix + '' + self.tabName + "filled-dot" || element.id === self.idPrefix + '' + self.tabName + "unfilled-dot") {
                                basePointOffsetTop = basePointOffsetTop - 4;
                                newLeft = basePointOffsetLeft - 12;
                                self.$el.find(element).offset({ left: newLeft, top: basePointOffsetTop }).addClass("itemDropped");
                            }
                            else if (element.id === self.idPrefix + '' + self.tabName + "left-indicator") {
                                newLeft = basePointOffsetLeft - self.$el.find(element).width() + 7;
                            }
                            else {
                                newLeft = basePointOffsetLeft;
                            }

                            self.$el.find(element).offset({ left: newLeft, top: basePointOffsetTop }).addClass("itemDropped");
                        }

                        else {
                            basePointOffsetTop = basePointOffsetTop - 3;

                            if (element.id === self.idPrefix + '' + self.tabName + "filled-dot" || element.id === self.idPrefix + '' + self.tabName + "unfilled-dot") {
                                basePointOffsetTop = basePointOffsetTop - 4;
                                newLeft = maxPointOffsetLeft - 12;
                            }
                            else if (element.id === self.idPrefix + '' + self.tabName + "left-indicator") {
                                newLeft = maxPointOffsetLeft - self.$el.find(element).width() + 7;

                            }
                            else {
                                newLeft = maxPointOffsetLeft;
                            }

                            self.$el.find(element).offset({ left: newLeft, top: basePointOffsetTop }).addClass("itemDropped");
                        }
                    }



                    if (element.id === self.idPrefix + '' + self.tabName + "filled-dot") {
                        if (self.droppedCircleItem === "unfilled") {
                            self.$el.find('#' + self.idPrefix + '' + self.tabName + "unfilled-dot").removeClass('itemDropped').animate({ 'position': 'absolute', 'left': self.basePosition.unfilledDot.left + 'px', 'top': self.basePosition.unfilledDot.top + 'px' }, 500);
                            self.$el.find('#' + self.idPrefix + '' + self.tabName + "unfilled-helper").show();
                        }
                        self.droppedCircleItem = "filled";
                        self.$el.find('#' + self.idPrefix + '' + self.tabName + "filled-helper").hide();

                    }
                    else if (element.id === self.idPrefix + '' + self.tabName + "unfilled-dot") {
                        if (self.droppedCircleItem === "filled") {
                            self.$el.find('#' + self.idPrefix + '' + self.tabName + "filled-dot").removeClass('itemDropped').animate({ 'position': 'absolute', 'left': self.basePosition.filledDot.left + 'px', 'top': self.basePosition.filledDot.top + 'px' }, 500);
                            self.$el.find('#' + self.idPrefix + '' + self.tabName + "filled-helper").show();
                        }
                        self.droppedCircleItem = "unfilled";
                        self.$el.find('#' + self.idPrefix + '' + self.tabName + "unfilled-helper").hide();
                    }
                    else {
                        if (element.id === self.idPrefix + '' + self.tabName + "left-indicator") {
                            if (self.droppedIndicatorItem === "right") {
                                self.$el.find('#' + self.idPrefix + '' + self.tabName + 'right-indicator').css({ 'margin-left': '0px', 'width': self.arrowWidth + 13 + 'px' });
                                self.$el.find('#' + self.idPrefix + '' + self.tabName + 'right-indicator').find('.drag-arrow-width').width(self.arrowWidth);
                                self.$el.find('#' + self.idPrefix + '' + self.tabName + 'right-indicator').animate({ 'position': 'absolute', 'left': self.basePosition.rightArrow.left + 'px', 'top': self.basePosition.rightArrow.top + 'px' }, 500).removeClass('itemDropped');
                                self.$el.find('#' + self.idPrefix + '' + self.tabName + "right-helper").show();
                            }
                            self.droppedIndicatorItem = "left";
                            self.$el.find('#' + self.idPrefix + '' + self.tabName + "left-helper").hide();
                            var $leftIndicatorContainer = self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').css('margin-left', '0px');
                            var $leftIndicatorWidth = self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').find('.drag-arrow-width');

                            var containerwidth = $leftIndicatorContainer.width();
                            var incWidth = $leftIndicatorContainer.offset().left - self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + '-graph-pane-left-arrow').offset().left + containerwidth;

                            $leftIndicatorContainer.draggable("disable");
                            $leftIndicatorWidth.animate({ 'width': incWidth - 18 + 'px' }, 500);
                            $leftIndicatorContainer.animate({ 'width': (incWidth) + 'px', 'margin-left': (-incWidth + containerwidth) + 'px' }, 500, function () {
                                self.$el.find(this).draggable("enable");
                            });

                        }
                        else if (element.id === self.idPrefix + '' + self.tabName + "right-indicator") {
                            if (self.droppedIndicatorItem === "left") {
                                self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').animate({ 'position': 'absolute', 'left': self.basePosition.leftArrow.left + 'px', 'top': self.basePosition.leftArrow.top + 'px' }, 500).removeClass('itemDropped');
                                self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').css({ 'margin-left': '0px', 'width': self.arrowWidth + 18 + 'px' });
                                self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').find('.drag-arrow-width').width(self.arrowWidth);
                                self.$el.find('#' + self.idPrefix + '' + self.tabName + "left-helper").show();
                                self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').draggable("option", "cursorAt", { left: 35 });
                            }
                            self.droppedIndicatorItem = "right";
                            self.$el.find('#' + self.idPrefix + '' + self.tabName + "right-helper").hide();

                            // Animate right arrow on drop
                            var $rightIndicatorContainer = self.$el.find('#' + self.idPrefix + '' + self.tabName + 'right-indicator');
                            var $rightIndicatorWidth = self.$el.find('#' + self.idPrefix + '' + self.tabName + 'right-indicator').find('.drag-arrow-width');
                            var incWidth = self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + '-graph-pane-right-arrow').offset().left - $rightIndicatorContainer.offset().left;

                            $rightIndicatorContainer.draggable("disable");
                            $rightIndicatorWidth.animate({ 'width': incWidth + 'px' }, 500);
                            $rightIndicatorContainer.animate({ 'width': (incWidth + 18) + 'px' }, 500, function () {
                                self.$el.find(this).draggable("enable");
                            });


                        }
                        else {
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

                        if (element.id === self.idPrefix + '' + self.tabName + "filled-dot") {
                            if (self.droppedCircleItem === "filled") {
                                self.droppedCircleItem = "";
                            }
                        }
                        else if (element.id === self.idPrefix + '' + self.tabName + "unfilled-dot") {
                            if (self.droppedCircleItem === "unfilled") {
                                self.droppedCircleItem = "";
                            }
                        }
                        else {
                            if (element.id === self.idPrefix + '' + self.tabName + "left-indicator") {
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
            droptop = parseInt($graphPane.css('top'), 10) - 7;
            dropWidth = parseInt(self.$numberLineView.lineWidth, 10) + 10;
            self.$el.find('.graph-droppable').css({ 'left': $graphPane.css('left'), 'width': dropWidth + 'px', 'top': droptop + 'px' });
        },



        /**
        * Function to drop draggable arrow items & circle items using keyboard for accessibility purpose
        * @method dropUsingKeys
        **/
        dropUsingKeys: function dropUsingKeys(left, top, elementId) {
            var self = this;

            var element = self.$el.find('#' + elementId);


            var newLeft = left;
            var newTop = top;
            newTop = newTop - 3;

            element.css({ 'z-index': '1' });
            if (elementId === self.idPrefix + '' + self.tabName + "filled-dot" || elementId === self.idPrefix + '' + self.tabName + "unfilled-dot") {
                //newLeft = newLeft - self.$el.find(element).width() / 2;
                newLeft = newLeft - 12;
                element.css({ 'z-index': '2' });
                newTop = newTop - 5;
            }
            else {
                element.css({ 'margin-left': '0px', 'width': self.arrowWidth + 18 + 'px' });
                element.find('.drag-arrow-width').width(self.arrowWidth);
            }

            if (elementId === self.idPrefix + '' + self.tabName + "left-indicator") {
                newLeft = newLeft - self.$el.find(element).width() + 7;
            }

            self.marginInPoints = self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + '-graph-pane-' + self.basePoint).offset().left - self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + '-graph-pane-' + (self.basePoint + self.tickinterval)).offset().left;
            self.basePointOffset = self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + '-graph-pane-' + self.basePoint).offset().left;


            self.$el.find(element).offset({ left: newLeft, top: newTop }).addClass("itemDropped");

            if (elementId === self.idPrefix + '' + self.tabName + "filled-dot") {
                if (self.droppedCircleItem === "unfilled") {
                    self.$el.find('#' + self.idPrefix + '' + self.tabName + "unfilled-dot").removeClass('itemDropped').animate({ 'position': 'absolute', 'left': self.basePosition.unfilledDot.left + 'px', 'top': self.basePosition.unfilledDot.top + 'px' }, 500);
                    self.$el.find('#' + self.idPrefix + '' + self.tabName + "unfilled-helper").show();
                    self.$numberLineView.resetDragDropTabIndex('unfilled-dot');
                }
                self.droppedCircleItem = "filled";
                self.$el.find('#' + self.idPrefix + '' + self.tabName + "filled-helper").hide();

            }
            else if (elementId === self.idPrefix + '' + self.tabName + "unfilled-dot") {
                if (self.droppedCircleItem === "filled") {
                    self.$el.find('#' + self.idPrefix + '' + self.tabName + "filled-dot").removeClass('itemDropped').animate({ 'position': 'absolute', 'left': self.basePosition.filledDot.left + 'px', 'top': self.basePosition.filledDot.top + 'px' }, 500);
                    self.$el.find('#' + self.idPrefix + '' + self.tabName + "filled-helper").show();
                    self.$numberLineView.resetDragDropTabIndex('filled-dot');
                }
                self.droppedCircleItem = "unfilled";
                self.$el.find('#' + self.idPrefix + '' + self.tabName + "unfilled-helper").hide();
            }
            else {
                if (elementId === self.idPrefix + '' + self.tabName + "left-indicator") {
                    if (self.droppedIndicatorItem === "right") {
                        self.$el.find('#' + self.idPrefix + '' + self.tabName + 'right-indicator').css({ 'margin-left': '0px', 'width': self.arrowWidth + 13 + 'px' });
                        self.$el.find('#' + self.idPrefix + '' + self.tabName + 'right-indicator').find('.drag-arrow-width').width(self.arrowWidth);
                        self.$el.find('#' + self.idPrefix + '' + self.tabName + 'right-indicator').animate({ 'position': 'absolute', 'left': self.basePosition.rightArrow.left + 'px', 'top': self.basePosition.rightArrow.top + 'px' }, 500).removeClass('itemDropped');
                        self.$el.find('#' + self.idPrefix + '' + self.tabName + "right-helper").show();
                        self.$numberLineView.resetDragDropTabIndex('right-indicator');
                        self.updateFocusRect(self.tabName + 'right-indicator');
                    }
                    self.droppedIndicatorItem = "left";
                    self.$el.find('#' + self.idPrefix + '' + self.tabName + "left-helper").hide();
                    var $leftIndicatorContainer = self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').css('margin-left', '0px');
                    var $leftIndicatorWidth = self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').find('.drag-arrow-width');

                    var containerwidth = $leftIndicatorContainer.width();
                    var incWidth = $leftIndicatorContainer.offset().left - self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + '-graph-pane-left-arrow').offset().left + containerwidth;

                    $leftIndicatorContainer.draggable("disable");
                    $leftIndicatorWidth.animate({ 'width': incWidth - 18 + 'px' }, 500);
                    $leftIndicatorContainer.animate({ 'width': (incWidth) + 'px', 'margin-left': (-incWidth + containerwidth) + 'px' }, 500, function () {
                        self.$el.find(this).draggable("enable");
                        self.updateFocusRect(self.tabName + 'left-indicator');
                    });

                }
                else if (elementId === self.idPrefix + '' + self.tabName + "right-indicator") {
                    if (self.droppedIndicatorItem === "left") {
                        self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').animate({ 'position': 'absolute', 'left': self.basePosition.leftArrow.left + 'px', 'top': self.basePosition.leftArrow.top + 'px' }, 500).removeClass('itemDropped');
                        self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').css({ 'margin-left': '0px', 'width': self.arrowWidth + 18 + 'px' });
                        self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').find('.drag-arrow-width').width(self.arrowWidth);
                        self.$el.find('#' + self.idPrefix + '' + self.tabName + "left-helper").show();
                        self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').draggable("option", "cursorAt", { left: 35 })
                        self.$numberLineView.resetDragDropTabIndex('left-indicator');
                        self.updateFocusRect(self.tabName + 'left-indicator');
                    }
                    self.droppedIndicatorItem = "right";
                    self.$el.find('#' + self.idPrefix + '' + self.tabName + "right-helper").hide();

                    // Animate right arrow on drop
                    var $rightIndicatorContainer = self.$el.find('#' + self.idPrefix + '' + self.tabName + 'right-indicator');
                    var $rightIndicatorWidth = self.$el.find('#' + self.idPrefix + '' + self.tabName + 'right-indicator').find('.drag-arrow-width');
                    var incWidth = self.$numberLineView.$el.find('#' + self.idPrefix + '' + self.tabName + '-graph-pane-right-arrow').offset().left - $rightIndicatorContainer.offset().left;

                    $rightIndicatorContainer.draggable("disable");
                    $rightIndicatorWidth.animate({ 'width': incWidth + 'px' }, 500);
                    $rightIndicatorContainer.animate({ 'width': (incWidth + 18) + 'px' }, 500, function () {
                        self.$el.find(this).draggable("enable");
                        self.updateFocusRect(self.tabName + 'right-indicator');
                    });


                }
                else {
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

        },


        /**
        * Functionality to check the inequality identified
        * @method identifyCheck
        * @return "Success"/"Invalid Dropped"/Object (dropped position information)
        **/

        identifyCheck: function identifyCheck() {

            if (this.model.getButtonState() === 'active') {

                var self = this;
                self.model.setFeedbackState('show');

                /****************  Feedback Pane ********************/

                this.$el.find('#' + this.idPrefix + 'feedback-pane-positive').html('');
                this.$el.find('#' + this.idPrefix + 'feedback-pane-negative').html('');
                this.model.setButtonState('disabled');

                if ((this.droppedCircleItem === "filled" || this.droppedCircleItem === "unfilled") && (this.droppedIndicatorItem === "left" || this.droppedIndicatorItem === "right")) {
                    // Dropped Items are correct

                    if ((this.droppedIndicatorItem === "right" && (this.sign === '&ge;' || this.sign === ">")) || (this.droppedIndicatorItem === "left" && (this.sign === '&le;' || this.sign === "<"))) {

                        if (this.droppedCircleItem === "filled") {

                            if (this.droppedIndicatorItem === "right") {

                                var ArrowPoint = self.$el.find('#' + self.idPrefix + '' + self.tabName + 'right-indicator').offset().left;
                                var dotPoint = self.$el.find('#' + self.idPrefix + '' + self.tabName + 'filled-dot').offset().left + 12;

                                var actualDiff = ArrowPoint - dotPoint;
                                if (actualDiff < 2 && actualDiff > -2) {
                                    ArrowPoint = dotPoint;
                                }

                                // If point of dropping of circle & arrow are same than true else some comments
                                if (ArrowPoint === dotPoint) {

                                    var dropPoint = Math.round((ArrowPoint - this.basePointOffset) * this.tickinterval / (-1 * this.marginInPoints)), point = this.basePoint + dropPoint;
                                    // consider same point+1 to calculate..   // true if is at x.point & &ge; || x.point+1 && >

                                    if (((point - 1) <= this.xPoint && (point + 1) >= this.xPoint && this.sign === '&ge;')) {


                                        this.disableScreenItems();
                                        return "Success";
                                    }
                                    else {
                                        return { filled: dotPoint, unfilled: '', left: '', right: ArrowPoint, point: (this.basePoint + dropPoint), sign: '&ge;' };
                                    }
                                }
                                else {
                                    //return { filled: dotPoint, unfilled: '', left: '', right: ArrowPoint, point: (this.basePoint + dropPoint), sign: '&ge;' };
                                    return "Invalid Dropped";
                                }
                            }
                            else {

                                var ArrowPoint = self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').offset().left + self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').width() - 7;
                                var dotPoint = self.$el.find('#' + self.idPrefix + '' + self.tabName + 'filled-dot').offset().left + 12;

                                var actualDiff = ArrowPoint - dotPoint;
                                if (actualDiff < 2 && actualDiff > -2) {
                                    ArrowPoint = dotPoint;
                                }

                                if (ArrowPoint === dotPoint) {

                                    var dropPoint = Math.round((ArrowPoint - this.basePointOffset) * this.tickinterval / (-1 * this.marginInPoints)), point = this.basePoint + dropPoint;
                                    // consider same point+1 to calculate..   // true if is at x.point & &ge; || x.point+1 && >

                                    if (((point - 1) <= this.xPoint && (point + 1) >= this.xPoint && this.sign === '&le;')) {

                                        this.disableScreenItems();
                                        return "Success";
                                    }
                                    else {
                                        return { filled: dotPoint, unfilled: '', left: ArrowPoint, right: '', point: (this.basePoint + dropPoint), sign: '&le;' };
                                    }
                                }
                                else {
                                    //return { filled: dotPoint, unfilled: '', left: ArrowPoint, right: '', point: (this.basePoint + dropPoint), sign: '&le;' };
                                    return "Invalid Dropped";
                                }

                            }

                        }
                        else {

                            if (this.droppedIndicatorItem === "right") {
                                // If point of dropping of circle & arrow are same than true else some comments

                                var ArrowPoint = self.$el.find('#' + self.idPrefix + '' + self.tabName + 'right-indicator').offset().left;
                                var dotPoint = self.$el.find('#' + self.idPrefix + '' + self.tabName + 'unfilled-dot').offset().left + 12;

                                var actualDiff = ArrowPoint - dotPoint;
                                if (actualDiff < 2 && actualDiff > -2) {
                                    ArrowPoint = dotPoint;
                                }


                                if (ArrowPoint === dotPoint) {
                                    // consider point to calculate.

                                    var dropPoint = Math.round((ArrowPoint - this.basePointOffset) * this.tickinterval / (-1 * this.marginInPoints)), point = this.basePoint + dropPoint;
                                    // consider same point+1 to calculate..   // true if is at x.point & &ge; || x.point+1 && >

                                    if (((point - 1) <= this.xPoint && (point + 1) >= this.xPoint && this.sign === '>')) {

                                        this.disableScreenItems();
                                        return "Success";
                                    }
                                    else {
                                        return { filled: '', unfilled: dotPoint, left: '', right: ArrowPoint, point: (this.basePoint + dropPoint), sign: '&gt;' };
                                    }
                                }
                                else {
                                    //return { filled: '', unfilled: dotPoint, left: '', right: ArrowPoint, point: (this.basePoint + dropPoint), sign: '&gt;' };
                                    return "Invalid Dropped";
                                }
                            }
                            else {

                                var ArrowPoint = self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').offset().left + self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').width() - 7;
                                var dotPoint = self.$el.find('#' + self.idPrefix + '' + self.tabName + 'unfilled-dot').offset().left + 12;


                                var actualDiff = ArrowPoint - dotPoint;
                                if (actualDiff < 2 && actualDiff > -2) {
                                    ArrowPoint = dotPoint;
                                }

                                if (ArrowPoint === dotPoint) {
                                    // consider point to calculate.

                                    var dropPoint = Math.round((ArrowPoint - this.basePointOffset) * this.tickinterval / (-1 * this.marginInPoints)), point = this.basePoint + dropPoint;
                                    // consider same point+1 to calculate..   // true if is at x.point & &ge; || x.point+1 && >

                                    if (((point - 1) <= this.xPoint && (point + 1) >= this.xPoint && this.sign === '<')) {

                                        this.disableScreenItems();
                                        return "Success";
                                    }
                                    else {
                                        return { filled: '', unfilled: dotPoint, left: ArrowPoint, right: '', point: (this.basePoint + dropPoint), sign: '&lt;' };
                                    }
                                }
                                else {
                                    // return { filled: '', unfilled: dotPoint, left: ArrowPoint, right: '', point: (this.basePoint + dropPoint), sign: '&lt;' };
                                    return "Invalid Dropped";
                                }

                            }

                        }

                    }
                    else {

                        var ArrowPoint;
                        if (self.droppedIndicatorItem === "right") {
                            ArrowPoint = self.$el.find('#' + self.idPrefix + '' + self.tabName + '' + self.droppedIndicatorItem + '-indicator').offset().left;
                        }
                        else {
                            ArrowPoint = self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').offset().left + self.$el.find('#' + self.idPrefix + '' + self.tabName + 'left-indicator').width() - 7;
                        }
                        var dotPoint = self.$el.find('#' + self.idPrefix + '' + self.tabName + '' + self.droppedCircleItem + '-dot').offset().left + 12;

                        var actualDiff = ArrowPoint - dotPoint;
                        if (actualDiff < 2 && actualDiff > -2) {
                            ArrowPoint = dotPoint;
                        }
                        if (ArrowPoint === dotPoint) {
                            var dropPoint = Math.round((ArrowPoint - this.basePointOffset) * this.tickinterval / (-1 * this.marginInPoints) + this.basePoint);

                            var sign = "";
                            if (self.droppedIndicatorItem === "left") {
                                if (self.droppedCircleItem === "filled") {
                                    sign = "&le;";
                                }
                                else {
                                    sign = "&lt;";
                                }
                            }
                            else {
                                if (self.droppedCircleItem === "filled") {
                                    sign = "&ge;";
                                }
                                else {
                                    sign = "&gt;";
                                }
                            }

                            return { filled: dotPoint, unfilled: '', left: '', right: ArrowPoint, point: dropPoint, sign: sign };
                        }

                        else {
                            return "Invalid Dropped";
                        }

                    }

                }
                else {

                    return "Invalid Dropped"
                }
            }

            //this.checkBtnView.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED);

        },



        /**
        * Functionality to set the Base position of Draggable Elements
        * @method setBasePosition
        **/

        setBasePosition: function setBasePosition() {
            var unfilledLeft, filledLeft, unfilledTop, filledTop, rightArrowTop, rightArrowLeft, leftArrowTop, leftArrowLeft;


            filledTop = this.$el.find('#' + this.idPrefix + '' + this.tabName + 'filled-dot').css('top').replace('px', '');
            unfilledTop = this.$el.find('#' + this.idPrefix + '' + this.tabName + 'unfilled-dot').css('top').replace('px', '');
            leftArrowTop = this.$el.find('#' + this.idPrefix + '' + this.tabName + 'left-indicator').css('top').replace('px', '');
            rightArrowTop = this.$el.find('#' + this.idPrefix + '' + this.tabName + 'right-indicator').css('top').replace('px', '');
            filledLeft = this.$el.find('#' + this.idPrefix + '' + this.tabName + 'filled-dot').css('left').replace('px', '');
            unfilledLeft = this.$el.find('#' + this.idPrefix + '' + this.tabName + 'unfilled-dot').css('left').replace('px', '');
            leftArrowLeft = this.$el.find('#' + this.idPrefix + '' + this.tabName + 'left-indicator').css('left').replace('px', '');
            rightArrowLeft = this.$el.find('#' + this.idPrefix + '' + this.tabName + 'right-indicator').css('left').replace('px', '');

            this.basePosition =
                {
                    filledDot: { left: filledLeft, top: filledTop },
                    unfilledDot: { left: unfilledLeft, top: unfilledTop },
                    rightArrow: { left: rightArrowLeft, top: rightArrowTop },
                    leftArrow: { left: leftArrowLeft, top: leftArrowTop },
                    widthArrowLine: 27
                }
        },


        /**
        * Events bound on elements in 'el'
        *
        * type Object
        **/
        //        events: {

        //            'mouseover .draggable-items': '_mouseoverDragItems',
        //            'mouseout  .draggable-items': '_mouseoutDragItems'
        //            // 'touchend  .draggable-items': '_mouseoutDragItems'

        //        },


        /**
        * Function to disable Screen Items
        *
        * @method disableScreenItems
        **/

        disableScreenItems: function disableScreenItems() {
            //this.checkBtnView.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED);
            this.model.setButtonState('disabled');
            this.$el.find('#' + this.idPrefix + '' + this.tabName + 'filled-dot').draggable("disable").css('cursor', 'default');
            this.$el.find('#' + this.idPrefix + '' + this.tabName + 'unfilled-dot').draggable("disable").css('cursor', 'default');
            this.$el.find('#' + this.idPrefix + '' + this.tabName + 'left-indicator').draggable("disable").css('cursor', 'default');
            this.$el.find('#' + this.idPrefix + '' + this.tabName + 'right-indicator').draggable("disable").css('cursor', 'default');
            this.screenDisable = true;

        },


        /**
        * Mouse over event on drag Items
        *
        * @method _mouseoverDragItems
        **/
        _mouseoverDragItems: function _mouseoverDragItems(event) {
            var self = this;
            if (this.screenDisable !== true) {

                if (event.target.id === '' + self.idPrefix + '' + self.tabName + 'filled-dot' || event.target.id === '' + self.idPrefix + '' + self.tabName + 'unfilled-dot') {
                    this.$el.find(event.target).css('background-position', '0px -37px');
                }
                else {
                    var element = event.target;
                    if (event.target.id === "" || event.target.id === undefined || event.target.id === null || $(event.target).hasClass('acc-read-elem')) {
                        element = event.target.parentNode;
                    }
                    var parentNodeID = element.id;
                    this.$el.find(element).find('.drag-arrow-width').css('background-position', '0px -4131px');

                    if(parentNodeID.indexOf('left') !== -1){
                        this.$el.find(element).find('.drag-arrow-image').css('background-position', '-18px -1497px');
                    }
                    else if(parentNodeID.indexOf('right') !== -1){
                        this.$el.find(element).find('.drag-arrow-image').css('background-position', '-31px -1497px');
                    }
                }
            }
        },
        /**
        * Mouse out event on drag Items
        *
        * @method _mouseoutDragItems
        **/
        _mouseoutDragItems: function _mouseoutDragItems(event) {
            var self = this;
            if (this.screenDisable !== true) {
                if (event.target.id === '' + self.idPrefix + '' + self.tabName + 'filled-dot' || event.target.id === '' + self.idPrefix + '' + self.tabName + 'unfilled-dot') {
                    this.$el.find(event.target).css('background-position', '0px 0px');
                }
                else {
                    var element = event.target;
                    if (event.target.id === "" || event.target.id === undefined || event.target.id === null || $(event.target).hasClass('acc-read-elem')) {
                        element = event.target.parentNode;
                    }
                    var parentNodeID = element.id;
                    this.$el.find(element).find('.drag-arrow-width').css('background-position', '0px -4108px');

                    if(parentNodeID.indexOf('left') !== -1){
                        this.$el.find(element).find('.drag-arrow-image').css('background-position', '-18px -1470px');
                    }
                    else if(parentNodeID.indexOf('right') !== -1){
                        this.$el.find(element).find('.drag-arrow-image').css('background-position', '-31px -1470px');
                    }
                }
            }
        }
    }
        , {

            generateDragDrop: function (options) {
                if (options) {
                    var customDragDropModel = new MathInteractives.Common.Components.Models.DragDropNumberLine(options);
                    var customDragDropView = new MathInteractives.Common.Components.Views.DragDropNumberLine({ model: customDragDropModel, el: $('#' + options.containerId) });
                    return customDragDropView;
                }
            }
        });

    MathInteractives.global.DragDropNumberLine = MathInteractives.Common.Components.Views.DragDropNumberLine;


})();