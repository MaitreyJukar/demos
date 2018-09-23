(function () {
    'use strict';

    /**
    * View for rendering the number line.
    * @class NumberLine
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    */
    MathInteractives.Common.Components.Views.NumberLine = MathInteractives.Common.Player.Views.Base.extend({

        /**
      * Manager class object
      *
      * @property manager
      * @type Object
      * @default null
      */
        manager: null,

        /**
        * Unique interactivity id prefix
        * @property idPrefix
        * @default null
        * @private
        */
        idPrefix: null,

        /**
        * Model of path for preloading files
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,

        /**
        * Reference to player object
        * @property _player
        * @type Object
        * @default null
        */
        _player: null,

        /**
        * Minimum value on the number line
        * @property lineMin
        * @type Number
        * @default null
        */
        lineMin: null,

        /**
        * Maximum value on the number line
        * @property lineMax
        * @type Number
        * @default null
        */
        lineMax: null,


        /**
       * Tab Name 
       * @property tabName
       * @type String
       * @default null
       */
        tabName: '',


        /**
         * Line Width
         * @property lineWidth
         * @type Number
         * @default 400
         */
        lineWidth: 400,


        /**
        * Tick Mark Height
        * @property tickHeight
        * @type Number
        * @default 11
        */
        tickHeight: 11,


        /**
         * Center Tick Height
         * @property tickHeight
         * @type Number
         * @default 21
         */
        centerTickHeight: 21,


        /********* Accessibility Variables **********/


        /**
        * Current Droppable slot Focus item
        * @property currentDroppableItem
        * @type String
        * @default ''
        */
        currentDroppableItem: '',


        /**
        * Elements on number line are clickable/not
        * @property clickableElements
        * @type Boolean
        * @default ''
        */
        clickableElements: false,


        /************ Slider ***************************/

        /**
        * Boolean to add Slider on number line
        * @property slider
        * @type Boolean
        * @default false
        */
        slider: false,


        /**
       * View of slider
       * @property $sliderView
       * @type Object
       * @default null
       */
        $sliderView: null,

        /**
        * Slider Value
        * @property sliderValue
        * @type Number
        * @default 1
        */
        sliderValue: 1,

       
        /**
        * Boolean to fire code only once while draging
        * @property isDragStart
        * @type Boolean
        * @default false
        */
        isDragStart: false,


        /**
        * Drag Drop element view for pan balance
        * @property _$dragDropPanBalView
        * @type Object
        * @default {}
        */
        _$dragDropPanBalView: {},


        /**
        * Equation 
        * @property equation
        * @type Object
        * @default null
        */
        equation: null,

        /**
        * Drag Drop Object
        * @property dragDrop
        * @type Object
        * @default null
        */
        dragDrop: null,


        /**
       * tabIndex primary
       * @property tabIndex
       * @type number
       * @default null
       */
        tabIndexMargin: 400,


        /**
        * To store tabIndex of slider Handle
        * @property tabIndexSliderHandle
        * @type number
        * @default 0
        */
        tabIndexSliderHandle: 0,


        /**
        * Boolean to indicate whether previous focus was on handle or not
        * @property prevFocusOnSliderHandle
        * @type Boolean
        * @default false
        */
        prevFocusOnSliderHandle: false,

        /**
        * Boolean to set focus on handle on click call back
        * @property setFocusHandle
        * @type Boolean
        * @default false
        */
        setFocusHandle:false,



        /**
        * Get data from model & set in view, Calls render
        *
        * @method initialize
        **/
        initialize: function () {

            this.idPrefix = this.model.get('idPrefix');
            this.filePath = this.model.getPath();
            this.lineMin = this.model.get('lineMinValue');
            this.lineMax = this.model.get('lineMaxValue');
            this.lineWidth = this.model.get('lineWidth');
            this.tickHeight = this.model.get('tickHeight');
            this.centerTickHeight = this.model.get('centerTickHeight');
            this.slider = this.model.get('slider');
            this.manager = this.model.get('manager');
            this._player = this.model.get('player');
            this.tabName = this.model.get('tabName');
            this.equation = this.model.get('equation');
            this.dragDrop = this.model.get('dragDrop');
            this.tabIndexMargin = this.model.get('tabIndexMargin');
            this.render();
        },

        /**
        * Renders the Number Line
        *
        * @method render
        * @private
        **/
        render: function () {
            var self = this;
            var tickHeightDefault = 11,centerTickDefault = 21, maxcount = this.lineMax - this.lineMin + 1, range = [], value = this.lineMin;

            for (var i = 0; i < maxcount ; i++) {
                range[i] = value++;
            }

            this.model.setCurrentDotItemType('filled');
            var options = { range: range, idPrefix: this.idPrefix, tabName: this.tabName };
            this.$el.html(MathInteractives.Common.Components.templates.numberLine(options).trim());

            var $pointContainer = this.$el.find('.point-container'),
                margin = (parseInt(this.lineWidth / maxcount, 10) - 3);

            $pointContainer.css({ 'margin-left': margin + 'px', 'margin-right': 0 + 'px', width: 0 });

            //$($pointContainer[0]).css('margin-left', 0);
            $($pointContainer[$pointContainer.length - 1]).css('margin-right', 0);


            var $middleLine = this.$el.find('.graph-pane-middle-line')
            $middleLine.css('width', ((margin) * maxcount + (margin + 3)) + 'px');


            //this.$el.find('.graph-pane-middle-graph-points').css('width', (this.lineWidth - margin) + 'px');
            //var arrowLeftPos = parseInt(this.lineWidth, 10) + parseInt($middleLine.css('left').replace('px', ''), 10);

            this.$('.graph-pane-middle-graph-points').css({ left: this.$el.find('.graph-pane-left-arrow').width() })
            var containerwidth = parseInt($pointContainer.css('width').replace('px', ''), 10);
            this.$el.find('.graph-pane-right-arrow-line').css('width', ((containerwidth * 0.5) + margin + 1) + 'px').hide().remove();
            this.$el.find('.graph-pane-left-arrow-line').css({ 'width': ((containerwidth * 0.5) + margin + 1) + 'px', 'margin-left': '12px' }).hide().remove();

            // this.$el.find('.graph-pane-middle-graph-points').css({ 'margin-left': (margin/2)+'px' });

            this.$el.find('.graph-pane-left-arrow').css({
                'background-image': 'url("' + this.filePath.getImagePath('left-arrow') + '")'
            });
            this.$el.find('.graph-pane-right-arrow').css({
                'background-image': 'url("' + this.filePath.getImagePath('right-arrow') + '")',
            });


            // Adjust Tick Height
            if (this.tickHeight != tickHeightDefault) {
                var topMargin = (tickHeightDefault - this.tickHeight) / 2;
                this.$el.find('.point-box').css({ 'height': this.tickHeight + 'px', 'margin-top': topMargin + 'px' });
            }

            if (this.tickHeight != centerTickDefault) {
                if (this.lineMax >= 0 && this.lineMin <= 0) {
                    var topMargin = (this.tickHeight - this.centerTickHeight) / 2;
                    this.$el.find('.point-number').css('margin-top', (-topMargin + 4) + 'px');
                    this.$el.find('#' + this.idPrefix + this.tabName + 'graph-pane-0-point').css({ 'margin-top': (topMargin) + 'px', 'height': this.centerTickHeight + 'px' });
                    this.$el.find('#' + this.idPrefix + this.tabName + 'graph-pane-0-number').css({ 'margin-top': 4 + 'px' });
                }
            }


           
            //if (this.clickableElements) {
            //    this._addHitAreaOnNumberLine();
            //    this._$dragDropView.$el.find('.graph-pane').off('keydown.adv-num-line')
            //        .on('keydown.adv-num-line', $.proxy(this.onClickKeyEvent, this));
            //}

            // Functionality if slider is present on number line
            if (this.slider) {
                var equation = this.model.get('equation'),
                    selectedValue = this.model.get('sliderValue'),
                    width = (Number(this.lineWidth) - 25);

                if (equation.a < 0) {
                    this.slideHandleType = 1;

                }
                else {
                    this.slideHandleType = 2;
                }
                if (this.model.get('sliderHandleOnArrowHead') === true) {
                    selectedValue = this.lineMax + 1;

                }
               
                var options =
                {
                    containerId: this.tabName + 'graph-pane-slider-box',
                    sliderId: this.tabName + 'graph-pane-slider',
                    manager: this.manager,
                    player: this._player,
                    idPrefix: this.idPrefix,
                    width: width,
                    height: 10,
                    minValue: this.lineMin - 1,
                    maxValue: this.lineMax + 1,
                    selectedValue: selectedValue,
                    step: 1,
                    tabIndex: this.tabIndexMargin,
                    appendLabel: false,
                    isBackgroundImage: false,
                    smoothSliding: true,
                    filePath: this.filePath,
                    onStart: $.proxy(this._sliderStart, this),
                    onStop: $.proxy(this._sliderStop, this),
                    onChange: $.proxy(this._sliderClickChange, this),
                    onSlide: $.proxy(this._sliderDragChange, this),
                    sliderHandleType: this.slideHandleType,
                    points: this.caluculatePointsOnSlider(1)
                }

                // Slider View 
                this.$sliderView = MathInteractives.global.Slider.generateSlider(options);

                this.loadScreen('number-line-slider-handle');

                this.tabIndexSliderHandle = this.getTabIndex(this.tabName + 'graph-pane-slider-handle');
                
                this.$sliderView.off('onSlideHandleClick').on('onSlideHandleClick', function () {
                    self._onSliderHandleClick();
                });

                // Functionality of slider triggger when clicked on numbers of numberline

                this.$el.find('.point-number').off('click').on('click', function (event) {
                    self.$sliderView.setSelectedValue(parseInt($(event.target).text(), 10));
                    self._sliderClickChange();
                    self._sliderStop();
                    self._showHideDragDrop();
                    self.trigger('numberLineSliderOnSlide');
                }).css('cursor', 'pointer');


                if (this.model.get('sliderHandleOnArrowHead') !== true) {
                    self._setSliderHandlePosition(selectedValue);
                }
               
                self.$sliderView.setSelectedValue(selectedValue);
               
                self.setFocusHandle = true;

                // Update Width of slider box
                this.$el.find('#' + this.idPrefix + this.tabName + 'graph-pane-slider-box').css({ 'width': Number(this.lineWidth) + 'px' });
                this.$el.find('#' + this.idPrefix + this.tabName + 'graph-pane-slider').css({ 'margin-left': '4px' });
                this.updateFocusRect(self.tabName + 'graph-pane-slider-box');
               
                /************ Functionality on Key Events for accessibility ***********/

                this.setAccMessage(this.tabName + 'graph-pane-slider-handle', this.getMessage('number-line-slider-handle-acc-text', 14));

                this.$sliderView.off('onSlideHandleKeyDown').on('onSlideHandleKeyDown', function () {
                    if (self.dragDrop !== null) {
                        self._setDefaultImage();
                        self._showHideDragDrop();
                    }
                    self.updateFocusRect(self.tabName + 'graph-pane-slider-handle');
                });

                this.$sliderView.off('onSlideHandleKeyUp').on('onSlideHandleKeyUp', function () {
                    if (self.dragDrop !== null) {
                        var currentValue = self.$sliderView.getSelectedValue();
                        if (!(self.model.get('sliderHandleOnArrowHead') === true && (currentValue > self.lineMax || currentValue < self.lineMin))) {
                            self._setSliderHandleImage();
                        }
                        self._showHideDragDrop();
                        if (self.model.get('sliderHandleOnArrowHead') !== true) {
                            self._setSliderHandlePosition(selectedValue);
                        }
                    }
                    self.updateFocusRect(self.tabName + 'graph-pane-slider-handle');
                });

                if (self.dragDrop !== null) {
                    this.focusIn(this.tabName + 'graph-pane-slider-handle', $.proxy(this.onFocusSlideHandle, this),20);
                    this.focusOut(this.tabName + 'graph-pane-slider-handle', $.proxy(this.onFocusOutSlideHandle, this), 20);
                    this.focusOut(this.tabName + '-hack-div', $.proxy(this.onFocusOutHackDiv, this), 50);
                }


                /************************************************************************/

            }
            else {
               // this._generateTabIndexes('numberLineContainer');
            }
        },

        
        /**
       * Functionality when drag item is correctly dropped on slider
       * @method onCorrectItemDrop
       **/
        onCorrectItemDrop: function (event) {
            this.$sliderView.disableSlider();
            this.$el.find('.point-number').off('click').css('cursor', 'default');
            this.$sliderView.off('onSlideHandleClick');
            this.$sliderView.$el.find('.graph-pane-slider').css('cursor', 'default');
            this.trigger('activityComplete');
            this.enableTab(this.tabName + 'arrow-indicator', false);
            this.enableTab(this.tabName + 'dotted-box', false);
            this.enableTab(this.tabName + 'graph-pane-slider-handle', false);
            this.setFocus('reset-button');
        },

        /**
       * Functionality to drop drag item using context menu
       * @method onContextMenuSelect
       **/
        onContextMenuSelect: function (event,args) {


            var $xPoint = this.$('#' + this.idPrefix + this.tabName + 'graph-pane-' + this.model.get('equation').x);
            var posleft = $xPoint.offset().left, dropItem = '', dropInfo = null,
                   postop = $xPoint.offset().top;

            if (args.currentTarget.id === this.idPrefix + 'dragitems-contextmenu-0') {
                dropItem = 1;
            }
            else {
                dropItem = 2;
            }

            dropInfo = this._$dragDropPanBalView.dropUsingKeys(posleft, postop, dropItem);

            if (dropInfo.expectedCircle !== dropInfo.droppedCircle) {
                this.setAccMessage(this.tabName + 'dotted-box', this.getMessage('number-line-slider-handle-acc-text', 7) + ' ' + this.getMessage('number-line-slider-handle-acc-text', 9));
                this.setFocus(this.tabName + 'dotted-box');
            }
            else if (dropInfo.expectedArrow !== dropInfo.droppedArrow) {
                this.setAccMessage(this.tabName + 'dotted-box', this.getMessage('number-line-slider-handle-acc-text', 8) + ' ' + this.getMessage('number-line-slider-handle-acc-text', 9));
                this.setFocus(this.tabName + 'dotted-box');
            }
            else {
                this.enableTab('tab-container', true);
                this.setAccMessage('tab-container', this.getMessage('number-line-slider-handle-acc-text', 13));
                this.setFocus('tab-container');
            }

        },


        /**
        * Function to execute when focus is out of Hack div
        * @method onFocusOutHackDiv
        **/
        onFocusOutHackDiv: function () {
            this._resetTabIndexes('numberLineHackDiv');
        },


        /**
        * Function to execute when focus is out of slider handle
        * @method onFocusOutSlideHandle
        **/
        onFocusOutSlideHandle: function () {
            this.prevFocusOnSliderHandle = false;
        },
        /**
        * Function to execute when focus is on handle
        * @method onFocusSlideHandle=
        **/
        onFocusSlideHandle: function () {
            var currentValue = this.$sliderView.getSelectedValue();
            
            if (this.dragDrop !== null) {
                this.setTabIndex(this.tabName + 'graph-pane-slider-handle', this.tabIndexSliderHandle);
                
                if (this.dragDrop.xPoint === currentValue && this.prevFocusOnSliderHandle === false) {
                    if (this.model.getCurrentDotItemType() === 'filled') {
                        this.setAccMessage(this.tabName + 'graph-pane-slider-handle', this.getMessage('number-line-slider-handle-acc-text', 6));
                    }
                    else {
                        this.setAccMessage(this.tabName + 'graph-pane-slider-handle', this.getMessage('number-line-slider-handle-acc-text', 5));
                    }
                }
            }
            this.prevFocusOnSliderHandle = true;
          
        },

        /**
        * Function to calculate exact point on slider
        * @method caluculatePointsOnSlider
        * @param step {Number} steps/interval between slider points
        * @return {Array} array of slider points
        **/
        caluculatePointsOnSlider: function (step) {
            var points = [],
                max = this.lineMax;
            for (var i = this.lineMin ; i <= max; i = i + step) {
                points.push(i);
            }
            return points;
        },

        /**
        * Toggle the circle type hollow/filled
        * @method twinDotItem
        **/
        twinDotItem: function () {
            var $sliderHandle = this.$sliderView.$('.slider-handle');
            $sliderHandle.addClass('slider-handle-dropped')
            if (this.model.getCurrentDotItemType() === 'filled') {
                this.model.setCurrentDotItemType('unfilled');

                this.setAccMessage(this.tabName + 'graph-pane-slider-handle', this.getMessage('number-line-slider-handle-acc-text', 3));
                this.setFocus(this.tabName + 'graph-pane-slider-handle');
                $sliderHandle.css({
                    'background-image': 'url("' + this.filePath.getImagePath('purple-dot-outline-pan') + '")',
                    'background-position': '-196px -977px'
                });
            }
            else {
                this.model.setCurrentDotItemType('filled');
                this.setAccMessage(this.tabName + 'graph-pane-slider-handle', this.getMessage('number-line-slider-handle-acc-text', 4));
                this.setFocus(this.tabName + 'graph-pane-slider-handle');
                $sliderHandle.css({
                    'background-image': 'url("' + this.filePath.getImagePath('purple-dot-pan') + '")',
                    'background-position': '-52px -1264px'
                });
            }
            //this.setFocus(this.tabName + 'graph-pane-slider-handle');

          //  this.updateFocusRect(this.tabName + 'graph-pane-slider-handle');
        },

        /**
        * Callback function triggers 'numberLineSliderOnStart' event on slider drag start
        * @method _sliderStart
        **/
        _sliderStart: function (event) {

            this.trigger('numberLineSliderOnStart');
        },

        /**
       * Functionality onchange event of slider. 
       * @method _sliderClickChange
       **/
        _sliderClickChange: function (event) {

            var currentValue = this.$sliderView.getSelectedValue(), message = '', LHSValue = '',
                self = this;

            if (this.sliderValue !== currentValue) {
                this.sliderValue = currentValue;
                this.model.setSliderValue(currentValue);
            }

            if (this.dragDrop !== null) {
                if (this.dragDrop.xPoint === currentValue) {

                  
                    var options = {

                        idPrefix: this.idPrefix,
                        player: this._player,
                        manager: this.manager,
                        containerId: this.idPrefix + '' + this.tabName + '-drag-drop-container',
                        minPoint: this.model.get("lineMinValue"),
                        maxPoint: this.model.get("lineMaxValue"),
                        sign: this.dragDrop.sign,
                        xPoint: this.dragDrop.xPoint,
                        tickinterval: this.tickinterval,
                        numberLineView: this,
                        tabName: this.tabName,
                        path: this.filePath,
                        equation: this.equation,
                        droppedCircleItem: this.model.getCurrentDotItemType()

                    };
                    this._$dragDropPanBalView = MathInteractives.global.DragDropPan.generateDragDropPanBalance(options);

                    this._$dragDropPanBalView.model.on('change:correctEleDrop', $.proxy(this.onCorrectItemDrop, this));
                    this.trigger('drag-drop-shown');
                    // this.$sliderView = null;
                    // this.$el.find('#' + this.idPrefix + this.tabName + 'graph-pane-slider-box').css('margin-left', '41px').html('');

                    /************** Accessibility  *******/

                    this._$dragDropPanBalView.$el.find('.draggable-items').off('keydown.adv-num-line')
                     .on('keydown.adv-num-line', $.proxy(this.onClickKeyEvent, this));


                    var options = {
                        el: self._player.$el,
                        prefix: self.idPrefix,
                        elements: [self.$el.find('#'+self.idPrefix + self.tabName + 'arrow-indicator')],
                        contextMenuCount: 2,
                        manager: self.manager,
                        thisView: self,
                        nestedMenuData: {},
                        screenId: 'dragitems-contextmenu'

                    }
                    this.contextMenuView = MathInteractives.global.ContextMenu.initContextMenu(options);

                    this.$('#' + self.idPrefix + self.tabName + 'arrow-indicator').on(MathInteractives.global.ContextMenu.CONTEXTMENU_SELECT, $.proxy(this.onContextMenuSelect, this));
                    this.$('#' + self.idPrefix + self.tabName + 'arrow-indicator').on(MathInteractives.global.ContextMenu.CONTEXTMENU_OPEN, $.proxy(function () {

                        this.changeMessage('dragitems-contextmenu-0', 0, [this.dragDrop.xPoint]);
                        this.changeMessage('dragitems-contextmenu-1', 0, [this.dragDrop.xPoint]);
                        this.changeAccMessage('dragitems-contextmenu-0', 0, [this.dragDrop.xPoint]);
                        this.changeAccMessage('dragitems-contextmenu-1', 0, [this.dragDrop.xPoint]);
                        this.setFocus('dragitems-contextmenu-0');

                    }, this));

                    this.$('#' + self.idPrefix + self.tabName + 'arrow-indicator').on(MathInteractives.global.ContextMenu.CONTEXTMENU_HIDE, function () {
                        var element = this.id.replace(self.idPrefix, '');
                        self.setFocus(element);
                    });
                    

                    this._$dragDropPanBalView.off('disableSlider').on('disableSlider', $.proxy(this._disableSlider, this));
                    this._$dragDropPanBalView.off('enableSlider').on('enableSlider', $.proxy(this._enableSlider, this));

                }
                this._showHideDragDrop();

                this._generateTabIndexes('draggableContainer');
                this._generateTabIndexes('draggableItemsScreen');


            }

            LHSValue = this.equation.a * currentValue + this.equation.b;

            if ((this.lineMin <= currentValue) && (this.lineMax >= currentValue)) {

                if ((LHSValue < this.equation.c)) {
                    message = currentValue + ' , ' + this.getMessage('number-line-slider-handle-acc-text', 0);
                }
                else if (LHSValue > this.equation.c) {
                    message = currentValue + ' , ' + this.getMessage('number-line-slider-handle-acc-text', 1);
                }
                else if (LHSValue === this.equation.c) {
                    message = currentValue + ' , ' + this.getMessage('number-line-slider-handle-acc-text', 2);
                }
                else { }

                if (this.setFocusHandle) {
                    this.setFocus('tab-container');
                    this.setAccMessage(self.tabName + 'graph-pane-slider-handle', message);
                    this.setFocus(self.tabName + 'graph-pane-slider-handle');
                }
            }

            this.trigger('numberLineSliderOnChange', event, { value: currentValue });


           
        },


        /**
        * Functionality to disable Slider
        * @method _disableSlider
        **/
        _disableSlider: function () {
            this.$sliderView.disableSlider();
        },


        /**
        * Functionality to enable Slider
        * @method _enableSlider
        **/
        _enableSlider: function () {
            this.$sliderView.enableSlider();
        },

        /**
        * Functionality on click of handle of slider
        * @method _onSliderHandleClick
        **/
        _onSliderHandleClick: function () {
            var currentValue = this.$sliderView.getSelectedValue();
            if (this.slideHandleClick === false) {
                this.slideHandleClick = true;
                return;
            }
            if (this.dragDrop !== null && this.model.get('equation').x === currentValue) {
                this.setFocus('reset-button');
                this.twinDotItem();
            }
            else if (this.dragDrop !== null && this.model.get('equation').x !== currentValue) {
                this.setAccMessage(this.tabName + 'graph-pane-slider-handle', this.getMessage('number-line-slider-handle-acc-text', 10));
                this.setFocus('reset-button');
                this.setFocus(this.tabName + 'graph-pane-slider-handle');
            }
            else {
            }
        },

       
        /**
       * Functionality to set slider handle image of hollow/filled based on current values.
       * @method _setSliderHandleImage
       **/
        _setSliderHandleImage: function () {
            var $sliderHandle = this.$sliderView.$('.slider-handle');
            $sliderHandle.addClass('slider-handle-dropped');
            if (this.model.getCurrentDotItemType() === 'filled') {
                $sliderHandle.css({
                    'background-image': 'url("' + this.filePath.getImagePath('purple-dot-pan') + '")',
                    'background-position': '-52px -1264px'
                });
            }
            else {
                $sliderHandle.css({
                    'background-image': 'url("' + this.filePath.getImagePath('purple-dot-outline-pan') + '")',
                    'background-position': '-196px -977px'
                });
            }

         //   this.updateFocusRect(this.tabName + 'graph-pane-slider-handle');
        },

        /**
       * Functionality to set default handle image of slider.
       * @method _setDefaultImage
       **/
        _setDefaultImage: function (event) {

            this.$sliderView.$('.slider-handle').removeClass('slider-handle-dropped');
            this.$sliderView.setSliderHandleImage();
        },

        /**
        * Functionality on drag stop callback event of slider
        * @method _sliderStop
        **/
        _sliderStop: function (event, ui) {
            var currentValue = this.$sliderView.getSelectedValue();
            this.isDragStart = false;
            this.trigger('numberLineSliderOnStop', event, { value: currentValue });
            if (this.dragDrop !== null && currentValue <= this.lineMax) {
                this._setSliderHandleImage();
                this._showHideDragDrop();
            }
            this._setSliderHandlePosition();
        },

        /**
        * Functionality on adjust slider handle position
        * @method _setSliderHandlePosition
        **/
        _setSliderHandlePosition: function (currentValue) {
            return;
            var currentValue = (typeof currentValue !== 'undefined') ? currentValue : this.$sliderView.getSelectedValue(),
                ADDER_LEFT = 17,
                idPrefix = this.model.get('idPrefix'),
                parentLeft = this.$('#' + idPrefix + this.tabName + 'graph-pane-middle-graph-points').offset().left,
                left = this.$('#' + idPrefix + this.tabName + 'graph-pane-' + currentValue + '-number').offset().left - parentLeft + ADDER_LEFT + 'px';
            this.$sliderView.$('.slider-handle').css({ 'left': left });
        },

        /**
        * Functionality on drag of handle. This callback function is fired.
        * @method _setSliderHandlePosition
        **/
        _sliderDragChange: function (event) {

            var currentValue = this.$sliderView.getSelectedValue();
            if (this.sliderValue !== currentValue) {
                this.model.setSliderValue(currentValue);
            }

            if (this.isDragStart && this.dragDrop !== null) {

                this.slideHandleClick = false;
                this._setDefaultImage();
            }
            this.isDragStart = true;
            this._showHideDragDrop();

            this.trigger('numberLineSliderOnSlide');
        },

        /**
        * Functionality to show/hide of drag drop items 
        * @method _showHideDragDrop
        **/
        _showHideDragDrop: function () {

            if (this.model.get('dragDrop') != null) {

                var currentValue = this.$sliderView.getSelectedValue(),
                    equation = this.model.get('equation'),
                    isHide = null;
                if (currentValue === equation.x) {
                    isHide = true;
                }
                else {
                    isHide = false;
                }
                if (isHide === false) {
                    this._$dragDropPanBalView = null;
                    this.$el.find('#' + this.idPrefix + '' + this.tabName + '-drag-drop-container').html('');
                  
                    this.trigger('drag-drop-hide');
                }
                else {
                    this.trigger('drag-drop-show');
                }
            }
        },


        /**
        * Key press event handler on clickable items in number line.
          It loads screen of 'hack div on ticks', positioning it on the first tick & setting focus to it.
        * 
        *
        */
        onClickKeyEvent: function onClickKeyEvent(event) {

            event = (event) ? event : window.event;
            var charCode = (event.keyCode) ? event.keyCode : event.which;

            var $xPoint = this.$('#' + this.idPrefix + this.tabName + 'graph-pane-' + this.model.get('equation').x),
                $leftPoint = this.$('#' + this.idPrefix + this.tabName + 'graph-pane-left-arrow-container'),
                $rightPoint = this.$('#' + this.idPrefix + this.tabName + 'graph-pane-right-arrow-container');


            if (charCode === 13 || charCode === 32) {

                this.$('#' + this.idPrefix + this.tabName + '-hack-div-slot').css({ 'width': $xPoint.offset().left - $leftPoint.offset().left - 5, 'margin-left': '0px' });
              
                //  this._resetTabIndexes('numberLineHackDiv');
                this._generateTabIndexes('numberLineHackDiv');
                this.updateFocusRect(this.tabName + '-hack-div-slot');

                this.currentDroppableItem = 1;
                
                this.setAccMessage(this.tabName + '-hack-div-slot', this.getMessage('number-line-slider-handle-acc-text', 12) + ' ' + this.model.get('equation').x);
                this.setFocus(this.tabName + '-hack-div-slot');

                // bind key event handler to hack div  
                this.$('#' + this.idPrefix + this.tabName + '-hack-div-slot', '#' + this.idPrefix + this.tabName + '-hack-div-slot-right').off('keydown.adv-num-line')
                    .on('keydown.adv-num-line', $.proxy(this.onDropSlotHackEvent, this))

            }
        },

        /**
       * Key press event handler on dropslot hack div on number line.
         Different function are executed based on key codes
       * 
       */
        onDropSlotHackEvent: function onDropSlotHackEvent(event) {
            event = (event) ? event : window.event;
            var charCode = (event.keyCode) ? event.keyCode : event.which,
                currentDroppableItem = currentDroppableItem || this.currentDroppableItem;

            var $xPoint = this.$('#' + this.idPrefix + this.tabName + 'graph-pane-' + this.model.get('equation').x),

             $leftPoint = this.$('#' + this.idPrefix + this.tabName + 'graph-pane-left-arrow-container'),
             $rightPoint = this.$('#' + this.idPrefix + this.tabName + 'graph-pane-right-arrow-container');

            event.preventDefault();


            if (event.which == 9 && event.shiftKey) {
                this._resetTabIndexes('numberLineHackDiv');
                this.setFocus(this.tabName + 'arrow-indicator');
                return;
            }

            switch (charCode) {
                case 13:
                case 32:

                    var posleft = $xPoint.offset().left,
                        postop = $xPoint.offset().top;

                    var dropInfo = this._$dragDropPanBalView.dropUsingKeys(posleft, postop, this.currentDroppableItem);
                    
                    if (dropInfo.expectedCircle !== dropInfo.droppedCircle) {
                        this.setAccMessage(this.tabName + 'dotted-box', this.getMessage('number-line-slider-handle-acc-text', 7) + ' ' + this.getMessage('number-line-slider-handle-acc-text', 9));
                        this.setFocus(this.tabName + 'dotted-box');
                    }
                    else if (dropInfo.expectedArrow !== dropInfo.droppedArrow) {
                        this.setAccMessage(this.tabName + 'dotted-box', this.getMessage('number-line-slider-handle-acc-text', 8) + ' ' + this.getMessage('number-line-slider-handle-acc-text', 9));
                        this.setFocus(this.tabName + 'dotted-box');
                    }
                    else {
                        this.enableTab('tab-container', true);
                        this.setAccMessage('tab-container', this.getMessage('number-line-slider-handle-acc-text', 13));
                        this.setFocus('tab-container');
                    }

                    this._resetTabIndexes('numberLineHackDiv');

                    break;

                case 37: // left arrow key
                    if (currentDroppableItem > 1) {

                        $(event.target).parent().css({ 'width': $xPoint.offset().left - $leftPoint.offset().left - 5, 'margin-left': '0px' });
                        this.updateFocusRect(this.tabName + '-hack-div-slot');
                        this.currentDroppableItem = 1;
                        this.setFocus('temp-focus-div');
                        this.setAccMessage(this.tabName + '-hack-div-slot', this.getMessage('number-line-slider-handle-acc-text', 12) + ' ' + this.model.get('equation').x);
                        this.setFocus(this.tabName + '-hack-div-slot');
                        
                    }
                    break;
                case 39: // right arrow key
                    if (currentDroppableItem < 2) {

                        $(event.target).parent().css({ 'width': $rightPoint.offset().left - $xPoint.offset().left, 'margin-left': ($xPoint.offset().left - $leftPoint.offset().left + 10) });
                        this.updateFocusRect(this.tabName + '-hack-div-slot');
                        this.currentDroppableItem = 2;
                        this.setFocus('temp-focus-div');
                        this.setAccMessage(this.tabName + '-hack-div-slot', this.getMessage('number-line-slider-handle-acc-text', 11) + ' ' + this.model.get('equation').x);
                        this.setFocus(this.tabName + '-hack-div-slot');
                    }
                    break;
                case 9:

                    this._resetTabIndexes('numberLineHackDiv');
                    this.setFocus(this.tabName + 'arrow-indicator');

                    break;

            }
        },


        /**
        * Functionality to loadScreen & set new tab indexes of hack items 
        * @method _generateTabIndexes
        **/
        _generateTabIndexes: function (screenId) {

            this.loadScreen(this.tabName + screenId);

            switch (screenId) {
                case 'numberLineHackDiv': {
                    this.setTabIndex(this.tabName + '-hack-div-slot', this.tabIndexMargin + this.getTabIndex(this.tabName + '-hack-div-slot'));
                    break;
                }
                
                case 'numberLineContainer': {
                    this.setTabIndex(this.tabName + 'graph-pane', this.tabIndexMargin + this.getTabIndex(this.tabName + 'graph-pane'));
                    break;
                }
                case 'draggableItemsScreen': {

                    this.setTabIndex(this.tabName + 'arrow-indicator', this.tabIndexMargin + this.getTabIndex(this.tabName + 'arrow-indicator'));
                    break;

                }
                case 'draggableContainer': {
                    this.setTabIndex(this.tabName + 'dotted-box', this.tabIndexMargin + this.getTabIndex(this.tabName + 'dotted-box'));
                    break;
                }
            }
        },


        /**
        *Functionality to unloadScreen & set original tab indexes of hack items 
        * @method _resetTabIndexes
        **/
        _resetTabIndexes: function (screenId) {

            switch (screenId) {
                case 'numberLineHackDiv': {
                    this.setTabIndex(this.tabName + '-hack-div-slot', this.getTabIndex(this.tabName + '-hack-div-slot') - this.tabIndexMargin);
                    break;
                }
               
                case 'numberLineContainer': {
                    this.setTabIndex(this.tabName + 'graph-pane', this.getTabIndex(this.tabName + 'graph-pane') - this.tabIndexMargin);
                    break;
                }
                case 'draggableItemsScreen': {
                    this.setTabIndex(this.tabName + 'arrow-indicator', this.getTabIndex(this.tabName + 'arrow-indicator') - this.tabIndexMargin);
                    break;
                }
                case 'draggableContainer': {
                    this.setTabIndex(this.tabName + 'dotted-box', this.getTabIndex(this.tabName + 'dotted-box') - this.tabIndexMargin);
                    break;
                }
            }

            this.unloadScreen(this.tabName + screenId);
        }




    }, {

        generateNumberLine: function (options) {
            if (options) {
                var customNumberLineModel = new MathInteractives.Common.Components.Models.NumberLine(options);
                var customNumberLineView = new MathInteractives.Common.Components.Views.NumberLine({ model: customNumberLineModel, el: $('#' + options.containerId) });
                return customNumberLineView;
            }
        }
    });

    MathInteractives.global.NumberLine = MathInteractives.Common.Components.Views.NumberLine;
})();