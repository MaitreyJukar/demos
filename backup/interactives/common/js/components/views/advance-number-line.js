(function () {
    'use strict';

    /**
    * View for rendering the number line.
    * @class AdvanceNumberLine
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    */
    MathInteractives.Common.Components.Views.AdvanceNumberLine = MathInteractives.Common.Player.Views.Base.extend({

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
        * @property player
        * @type Object
        * @default null
        */
        player: null,

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


        /**
        * Drag and Drop on numberline 
        * @property dragDrop
        * @type Object
        * @default null
        */
        dragDrop: null,


        /**
       * Drag and Drop View 
       * @property dragDropView
       * @type Object
       * @default null
       */
        _$dragDropView: null,


        /**
       * Interval Between ticks 
       * @property tickinterval
       * @type Number
       * @default 1
       */
        tickinterval: 1,

        /**
        * Unique Name for current Tab 
        * @property tabName
        * @type String
        * @default ''
        */
        tabName: '',



        /********* Accessibility Variables **********/

        /**
        * Selected Draggable Item
        * @property selectedDraggable
        * @type Object
        * @default null
        */
        selectedDraggable: null,

        /**
        * Current Droppable slot Focus item
        * @property currentDroppableItem
        * @type String
        * @default ''
        */
        currentDroppableItem: '',

        /***************************************/

        /**
        * tabIndex primary
        * @property tabIndex
        * @type number
        * @default 400
        */
        startTabIndex: 400,
        /*
        * arrya of draggable items
        * @property draggableItems
        * @type Array
        * @default null
        */
        draggableItems: ['filled-dot', 'unfilled-dot', 'left-indicator', 'right-indicator'],

        /*
       * original tabIndex of dragItems
       * @property draggableItemsTabIndex
       * @type Array
       * @default  []
       */
        draggableItemsTabIndex: [],


        /**
        * To store tabIndex of Number line container
        * @property tabIndexNumberLineBox
        * @type number
        * @default 0
        */
        tabIndexNumberLineBox: 0,

        /**
        * Get data from model & set in view, Calls render
        *
        * @method initialize
        **/
        initialize: function () {

            this.manager = this.model.get('manager');
            this.player = this.model.get('player');
            this.idPrefix = this.model.get('idPrefix');
            this.filePath = this.model.getPath();
            this.lineMin = this.model.get('lineMinValue');
            this.lineMax = this.model.get('lineMaxValue');
            this.lineWidth = this.model.get('lineWidth');
            this.tickHeight = this.model.get('tickHeight');
            this.centerTickHeight = this.model.get('centerTickHeight');
            this.dragDrop = this.model.get('dragDrop');
            this.tabName = this.model.get('tabName');
            this.tickinterval = this.model.get('tickinterval');
            this.startTabIndex = this.model.get('startTabIndex');
            this.render();
        },

        /**
        * Renders the Number Line
        *
        * @method render
        * @private
        **/
        render: function () {
            var tickHeightDefault = this.tickHeight, centerTickDefault = this.centerTickHeight, maxMarkingConstant = 21, containerwidth = 500,
                $middleLine = null,
                maxcount = this.lineMax - this.lineMin + 1, range = [], value = this.lineMin;

            for (var i = 0; i < maxcount ; i++) {
                range[i] = value++;
            }

            var options = { range: range, idPrefix: this.idPrefix, tabName: this.tabName };
            this.$el.html(MathInteractives.Common.Components.templates.numberLineAdvance(options).trim());

            var arrowWidth = this.$el.find('.graph-pane-left-arrow').width() - 1;

            var $pointContainer = this.$el.find('.point-container'),
                margin = ((this.lineWidth - arrowWidth) / (maxcount - 1 + 2 * this.tickinterval));

            $middleLine = this.$el.find('.graph-pane-middle-line');
            $middleLine.css('width', this.lineWidth + 'px');

            $pointContainer.css({ 'margin-left': margin + 'px', 'margin-right': 0 + 'px', width: 0 });

            $($pointContainer[0]).css('margin-left', ((margin * this.tickinterval) + arrowWidth / 2) + 'px');
            $($pointContainer[$pointContainer.length - 1]).css('margin-right', 0 + 'px');

            //this.$el.find('.graph-pane-middle-graph-points').css('width', (this.lineWidth - margin) + 'px');

            this.$('.graph-pane-middle-graph-points').css({ left: arrowWidth })
            containerwidth = parseInt($pointContainer.css('width').replace('px', ''), 10);

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
                //var centerPoint = parseInt((this.lineMin + this.lineMax) / 2 * this.tickinterval, 10);
                if (this.lineMax >= 0 && this.lineMin <= 0) {
                    var topMargin = (this.tickHeight - this.centerTickHeight) / 2;
                    this.$el.find('.point-number').css('margin-top', (-topMargin + 4) + 'px');
                    this.$el.find('#' + this.idPrefix + '' + this.tabName + '-graph-pane-0-point').css({ 'margin-top': (topMargin) + 'px', 'height': this.centerTickHeight + 'px' });
                    this.$el.find('#' + this.idPrefix + '' + this.tabName + '-graph-pane-0-number').css({ 'margin-top': 4 + 'px' });
                    this.$el.find('#' + this.idPrefix + '' + this.tabName + '-graph-pane').css({ 'height': ($('#' + this.idPrefix + this.tabName + '-graph-pane').height() + 8) + 'px' });
                }

            }

            if (this.tickinterval > 1) {
                this.$el.find('.graph-pane-divider-tick').hide();
                for (var i = this.lineMin; i <= this.lineMax; i += this.tickinterval) {
                    this.$el.find('#' + this.idPrefix + '' + this.tabName + '-graph-pane-' + i + '-point').find('.graph-pane-divider-tick').show();
                }
            }

            this.$el.find('.point-number').hide();

            var totalTicks = Math.ceil(maxcount / this.tickinterval), markingDist;
            if (totalTicks > maxMarkingConstant) {
                markingDist = Math.ceil(totalTicks / maxMarkingConstant) * this.tickinterval;
            }
            else {
                markingDist = this.tickinterval;
            }

            for (var i = this.lineMin; i <= this.lineMax; i += markingDist) {

                this.$el.find('#' + this.idPrefix + '' + this.tabName + '-graph-pane-' + i + '-point').show();
                this.$el.find('#' + this.idPrefix + '' + this.tabName + '-graph-pane-' + i + '-number').show();
            }

            // If Drag Drop feature is also required with number line

            if (this.dragDrop !== null) {
                var options = {

                    idPrefix: this.idPrefix,
                    manager: this.manager,
                    player: this.player,
                    containerId: this.idPrefix + '' + this.tabName + '-drag-drop-container',
                    minPoint: this.model.get("lineMinValue"),
                    maxPoint: this.model.get("lineMaxValue"),
                    sign: this.model.get("dragDrop").sign,
                    xPoint: this.model.get("dragDrop").xPoint,
                    tickinterval: this.tickinterval,
                    numberLineView: this,
                    tabName: this.tabName,
                    path: this.filePath

                };
                this._$dragDropView = MathInteractives.global.DragDropNumberLine.generateDragDrop(options);

                this._$dragDropView.on('number-line-drag-start', $.proxy(function (event, ui) {
                    this.trigger('number-line-drag-start', event, ui)
                }, this));
                this._$dragDropView.$el.find('.draggable-items').off('keydown.adv-num-line')
                    .on('keydown.adv-num-line', $.proxy(this.onDraggableItemsKeyEvent, this));


                this._generateTabIndexes('draggableContainer');
                this._generateTabIndexes('draggableItemsScreen');
                this._generateTabIndexes('numberLineContainer');
                this.tabIndexNumberLineBox = this.getTabIndex(this.tabName + '-graph-pane');


                this.loadScreen('advance-number-line-container');

                /********************** Accessibility with context menu ************************/


                var self = this;
                var options = {
                    el: self.player.$el,
                    prefix: self.idPrefix,
                    elements: [self.$el.find('#' + self.idPrefix + self.tabName + 'filled-dot'), self.$el.find('#' + self.idPrefix + self.tabName + 'unfilled-dot'), self.$el.find('#' + self.idPrefix + self.tabName + 'right-indicator'), self.$el.find('#' + self.idPrefix + self.tabName + 'left-indicator')],
                    contextMenuCount: 201,
                    manager: self.manager,
                    thisView: self,
                    maxItemCount: 10,
                    nestedMenuData: {},
                    screenId: 'dragitems-type1-contextmenu'

                }

                this.contextMenuView = MathInteractives.global.ContextMenu.initContextMenu(options);
                
                var contextMenuArray = [], contextMenuExclude = [];
                for (var i = 0 ; i <= 200 ; i++) {

                    if (i >= (this.lineMin + 100) && i <= (this.lineMax + 100)) {
                        contextMenuArray.push(self.idPrefix + 'dragitems-type1-contextmenu-' + i);
                    }
                    else {
                        contextMenuExclude.push(self.idPrefix + 'dragitems-type1-contextmenu-' + i);
                    }

                }
                this.contextMenuView.editContextMenu(contextMenuArray, false);
                this.contextMenuView.editContextMenu(contextMenuExclude, true);

                var elements = '#' + self.idPrefix + self.tabName + 'right-indicator,#' + self.idPrefix + self.tabName + 'left-indicator,#' + self.idPrefix + self.tabName + 'unfilled-dot,#' + self.idPrefix + self.tabName + 'filled-dot';
                this.$(elements).on(MathInteractives.global.ContextMenu.CONTEXTMENU_SELECT, $.proxy(this.onContextMenuSelect, this))

                    .on(MathInteractives.global.ContextMenu.CONTEXTMENU_OPEN, $.proxy(function () {

                        var dropItem = parseInt($('#'+self.idPrefix + 'dragitems-type1-contextmenu-'+(this.lineMin+100)).text(), 10), accMsg = '';
                        for (var i = (this.lineMin + 100) ; i <= (this.lineMax + 100) ; i++) {

                             if (dropItem < 0)
                             { accMsg = 'negative ' + Math.abs(dropItem); }
                             else
                             {
                                 accMsg = Math.abs(dropItem);
                             }
                             this.setAccMessage('dragitems-type1-contextmenu-' + i, accMsg);
                             dropItem++;
                         }
                        
                         this.setFocus('dragitems-type1-contextmenu-0');

                     }, this))

                    .on(MathInteractives.global.ContextMenu.CONTEXTMENU_HIDE, function () {
                        var element = this.id.replace(self.idPrefix, '');
                        self.setFocus(element);
                    });
            }

        },



        /**
        * Key press event handler on draggable items in advanced number line.
          It loads screen of 'hack div on ticks', positioning it on the first tick & setting focus to it.
        * 
        *
        */
        onDraggableItemsKeyEvent: function onDraggableItemsKeyEvent(event) {

            event = (event) ? event : window.event;
            var charCode = (event.keyCode) ? event.keyCode : event.which;

            this.selectedDraggable = event.currentTarget.id;
            this.currentDroppableItem = this.model.get("lineMinValue");

            this.$el.find('#' + this.idPrefix + this.tabName + '-graph-pane-acc-elem').css({ 'width': Number(this.lineWidth) + 10 });

            if (charCode === 13 || charCode === 32) {

                this._generateTabIndexes('numberLineHackDiv');

                // hack div reposition to 1st number
                this.$('#' + this.idPrefix + this.tabName + '-hack-div-slot').css({
                    'margin-left': (this.$('#' + this.idPrefix + this.tabName + '-graph-pane-' + this.currentDroppableItem).offset().left - this.$('#' + this.idPrefix + this.tabName + '-graph-pane-left-arrow-container').offset().left - 5)
                });

                var currentDroppableItem = this.currentDroppableItem;
                if (parseInt(currentDroppableItem, 10) < 0) {
                    currentDroppableItem = 'minus ' + Math.abs(parseInt(currentDroppableItem, 10));
                }
                this.setAccMessage(this.tabName + '-hack-div-slot', currentDroppableItem);
                this.setFocus(this.tabName + '-hack-div-slot');

                // bind key event handler to hack div  
                this.$('#' + this.idPrefix + this.tabName + '-hack-div-slot').off('keydown.adv-num-line')
                    .on('keydown.adv-num-line', $.proxy(this.onDropSlotHackEvent, this))
            }
        },

        /**
       * Key press event handler on dropslot hack div on advanced number line.
          Different function are executed based on key codes
       * 
       */
        onDropSlotHackEvent: function onDropSlotHackEvent(event) {
            event = (event) ? event : window.event;
            var charCode = (event.keyCode) ? event.keyCode : event.which;

            var currentDroppableItem, min, max, tickInterval;
            currentDroppableItem = currentDroppableItem || this.currentDroppableItem;
            min = this.model.get('lineMinValue');
            max = this.model.get('lineMaxValue');
            //tickInterval = this.model.get('tickinterval');   // As drop slot should be on invisible ticks too so avoiding tickinterval
            tickInterval = 1;
            event.preventDefault();


            if (event.which == 9 && event.shiftKey) {
                //this._resetTabIndexes('numberLineHackDiv');
                this.setFocus(this.tabName + this.selectedDraggable.split(this.tabName)[1]);
                this.selectedDraggable = null;
                return;
            }

            switch (charCode) {
                case 13: // If space bar / Enter key is pressed drop the item
                case 32:
                    // Drop selected draggable item i.e this.selectedDraggable
                    // setfocus to numberline container & read message

                    var posleft = $('#' + this.idPrefix + this.tabName + '-graph-pane-' + this.currentDroppableItem).offset().left,
                        postop = $('#' + this.idPrefix + this.tabName + '-graph-pane-' + this.currentDroppableItem).offset().top;


                    this.onDragItemDrop(posleft, postop, this.currentDroppableItem);
                    this._resetTabIndexes('numberLineHackDiv');
                    break;

                case 37: // left arrow key is pressed move to left drop slot
                    if (currentDroppableItem > min) {
                        currentDroppableItem = currentDroppableItem - tickInterval;

                        $(event.target).parent().css({
                            'margin-left': (this.$('#' + this.idPrefix + this.tabName + '-graph-pane-' + currentDroppableItem).offset().left - this.$('#' + this.idPrefix + this.tabName + '-graph-pane-left-arrow-container').offset().left - 5)
                        });

                        this.currentDroppableItem = currentDroppableItem;

                        if (parseInt(currentDroppableItem, 10) < 0) {
                            currentDroppableItem = 'minus ' + Math.abs(parseInt(currentDroppableItem, 10));
                        }

                        this.setFocus(this.tabName + 'dotted-box');
                        this.setAccMessage(this.tabName + '-hack-div-slot', currentDroppableItem);
                        this.setFocus(this.tabName + '-hack-div-slot');
                    }
                    break;
                case 39:
                    // right arrow key is pressed move to right drop slot
                    if (currentDroppableItem < max) {
                        currentDroppableItem = currentDroppableItem + tickInterval;

                        $(event.target).parent().css({
                            'margin-left': (this.$('#' + this.idPrefix + this.tabName + '-graph-pane-' + currentDroppableItem).offset().left - this.$('#' + this.idPrefix + this.tabName + '-graph-pane-left-arrow-container').offset().left - 5)
                        });

                        this.currentDroppableItem = currentDroppableItem;
                        if (parseInt(currentDroppableItem, 10) < 0) {
                            currentDroppableItem = 'minus ' + Math.abs(parseInt(currentDroppableItem, 10));
                        }

                        this.setFocus(this.tabName + 'dotted-box');
                        this.setAccMessage(this.tabName + '-hack-div-slot', currentDroppableItem);
                        this.setFocus(this.tabName + '-hack-div-slot');
                    }
                    break;
                case 9:

                    this._resetTabIndexes('numberLineHackDiv');

                    if (!this.selectedDraggable) {
                        this.setFocus(this.tabName + this.draggableItems[0]);
                        return;
                    }

                    switch (this.selectedDraggable.split(this.tabName)[1]) {
                        case 'filled-dot': {
                            this.setFocus(this.tabName + 'unfilled-dot');
                            break;
                        }

                        case 'unfilled-dot': {
                            this.setFocus(this.tabName + 'left-indicator');
                            break;
                        }

                        case 'left-indicator': {
                            this.setFocus(this.tabName + 'right-indicator');
                            break;
                        }

                        case 'right-indicator': {
                            this.setFocus(this.tabName + 'filled-dot');
                            break;
                        }
                    }

                    this.selectedDraggable = null;
                    break;
            }
        },


        /**
     * Functionality to drop drag item using context menu
     * @method onDragItemDrop
     **/
        onDragItemDrop: function onDragItemDrop(posleft, postop, dropItem) {
            var currentDraggableTabIndex = 0;

            var dragItem = this.selectedDraggable.replace(this.idPrefix + this.tabName, '');

            switch (dragItem) {
                case 'filled-dot':
                    if (this._$dragDropView.droppedCircleItem === '' || this._$dragDropView.droppedCircleItem === 'filled') {
                        this.setAccMessage(this.tabName + '-graph-pane', this.getMessage('advance-number-line-container-acc-text', 1), [dropItem]);
                    }
                    else { this.setAccMessage(this.tabName + '-graph-pane', this.getMessage('advance-number-line-container-acc-text', 5), ['hollow', dropItem, 'filled']); }
                    break;
                case 'unfilled-dot':
                    if (this._$dragDropView.droppedCircleItem === '' || this._$dragDropView.droppedCircleItem === 'unfilled') {
                        this.setAccMessage(this.tabName + '-graph-pane', this.getMessage('advance-number-line-container-acc-text', 2), [dropItem]);
                    }
                    else {
                        this.setAccMessage(this.tabName + '-graph-pane', this.getMessage('advance-number-line-container-acc-text', 5), ['filled', 'hollow', dropItem]);
                    }
                    break;
                case 'left-indicator':
                    if (this._$dragDropView.droppedIndicatorItem === '' || this._$dragDropView.droppedIndicatorItem === 'left') {
                        this.setAccMessage(this.tabName + '-graph-pane', this.getMessage('advance-number-line-container-acc-text', 3), [dropItem]);
                    }
                    else {
                        this.setAccMessage(this.tabName + '-graph-pane', this.getMessage('advance-number-line-container-acc-text', 6), ['right', 'left', dropItem]);
                    }
                    break;
                case 'right-indicator':
                    if (this._$dragDropView.droppedIndicatorItem === '' || this._$dragDropView.droppedIndicatorItem === 'right') {
                        this.setAccMessage(this.tabName + '-graph-pane', this.getMessage('advance-number-line-container-acc-text', 4), [dropItem]);
                    }
                    else {
                        this.setAccMessage(this.tabName + '-graph-pane', this.getMessage('advance-number-line-container-acc-text', 6), ['left', dropItem, 'right']);
                    }
                    break;
            }

            this._$dragDropView.dropUsingKeys(posleft, postop, this.selectedDraggable);

            this.setFocus(this.tabName + '-graph-pane');

            currentDraggableTabIndex = this.getTabIndex(this.selectedDraggable.replace(this.idPrefix, ''));
            if (this.selectedDraggable !== null) {
                if (currentDraggableTabIndex <= (this.startTabIndex + this.draggableItemsTabIndex[this.draggableItems.indexOf(this.selectedDraggable.split(this.tabName)[1])])) {
                    this.setTabIndex(this.selectedDraggable.replace(this.idPrefix, ''), currentDraggableTabIndex + 80);
                }
            }

            if (this._$dragDropView.droppedCircleItem === "" || this._$dragDropView.droppedIndicatorItem === "") {
                var tabIndex = this.draggableItems.indexOf(this.selectedDraggable.split(this.tabName)[1]) % 4;
                this.setTabIndex(this.tabName + '-graph-pane', this.startTabIndex + this.draggableItemsTabIndex[tabIndex + 1] - 2);
            }
            else {
                this.setTabIndex(this.tabName + '-graph-pane', this.tabIndexNumberLineBox);
            }

            this.selectedDraggable = null;

        },



        /**
      * Functionality to drop drag item using context menu
      * @method onContextMenuSelect
      **/
        onContextMenuSelect: function (event, args) {

            this.selectedDraggable = event.currentTarget.id;

            var dropInfo = null,
                dropItem = $(args.target).text().replace('negative ', '-');

            var posleft = this.$el.find('#' + this.idPrefix + this.tabName + '-graph-pane-' + dropItem).offset().left,
                       postop = this.$el.find('#' + this.idPrefix + this.tabName + '-graph-pane-' + dropItem).offset().top;

            this.onDragItemDrop(posleft, postop, dropItem);

        },


        /**
        * Functionality to check whether items is correctly dropped.
        * @method checkDragDrop
        **/
        checkDragDrop: function checkDragDrop() {
            return this._$dragDropView.identifyCheck();
        },

        /**
        * Functionality to loadScreen & set new tab indexes of items 
        * @method _generateTabIndexes
        **/
        _generateTabIndexes: function (screenId) {

            this.loadScreen(this.tabName + screenId);

            switch (screenId) {
                case 'numberLineHackDiv': {
                    this.setTabIndex(this.tabName + '-hack-div-slot', this.startTabIndex + this.getTabIndex(this.tabName + '-hack-div-slot'));
                    break;
                }
                case 'numberLineTempFocusDiv': {
                    this.setTabIndex(this.tabName + '-hack-div-set-focus', this.startTabIndex + this.getTabIndex(this.tabName + '-hack-div-set-focus'));
                    break;
                }
                case 'numberLineContainer': {
                    this.setTabIndex(this.tabName + '-graph-pane', this.startTabIndex + this.getTabIndex(this.tabName + '-graph-pane'));
                    break;
                }
                case 'draggableItemsScreen': {

                    this.draggableItemsTabIndex.push(this.getTabIndex(this.tabName + 'filled-dot'));
                    this.draggableItemsTabIndex.push(this.getTabIndex(this.tabName + 'unfilled-dot'));
                    this.draggableItemsTabIndex.push(this.getTabIndex(this.tabName + 'left-indicator'));
                    this.draggableItemsTabIndex.push(this.getTabIndex(this.tabName + 'right-indicator'));

                    this.setTabIndex(this.tabName + '' + this.draggableItems[0], this.startTabIndex + this.draggableItemsTabIndex[0]);
                    this.setTabIndex(this.tabName + '' + this.draggableItems[1], this.startTabIndex + this.draggableItemsTabIndex[1]);
                    this.setTabIndex(this.tabName + '' + this.draggableItems[2], this.startTabIndex + this.draggableItemsTabIndex[2]);
                    this.setTabIndex(this.tabName + '' + this.draggableItems[3], this.startTabIndex + this.draggableItemsTabIndex[3]);

                    break;

                }
                case 'draggableContainer': {
                    this.setTabIndex(this.tabName + 'dotted-box', this.startTabIndex + this.getTabIndex(this.tabName + 'dotted-box'));
                    break;
                }
            }
        },

        /**
        *Functionality reset tab indexes of draggable items 
        * @method _resetTabIndexes
        **/
        resetDragDropTabIndex: function resetDragDropTabIndex(resetElement) {
            this.setTabIndex(this.tabName + resetElement, this.getTabIndex(this.tabName + resetElement) - 80);
        },


        /**
        *Function to set focus on last dropped item
        * @method setFocusOnLastDropItem
        **/
        setFocusOnDragItem: function setFocusOnDragItem(item) {

            var firstElement = this.draggableItems[0],
                lastElement = this.draggableItems[0];

            for (var i = 1; i < 4; i++) {
                if (this.getTabIndex(this.tabName + this.draggableItems[i]) < this.getTabIndex(this.tabName + firstElement)) {
                    firstElement = this.draggableItems[i];
                }
                if (this.getTabIndex(this.tabName + this.draggableItems[i]) > this.getTabIndex(this.tabName + lastElement)) {
                    lastElement = this.draggableItems[i];
                }
            }

            switch (item) {
                case 'first':
                    this.setFocus(this.tabName + firstElement);
                    break;
                case 'last':
                    this.setFocus(this.tabName + lastElement);
                    break;
            }

        },



        /**
        * Functionality to loadScreen & set new tab indexes of items 
        * @method _resetTabIndexes
        **/
        _resetTabIndexes: function (screenId) {

            switch (screenId) {
                case 'numberLineHackDiv': {
                    this.setTabIndex(this.tabName + '-hack-div-slot', this.getTabIndex(this.tabName + '-hack-div-slot') - this.startTabIndex);
                    break;
                }
                case 'numberLineTempFocusDiv': {
                    this.setTabIndex(this.tabName + '-hack-div-set-focus', this.getTabIndex(this.tabName + '-hack-div-set-focus') - this.startTabIndex);
                    break;
                }
                case 'numberLineContainer': {
                    this.setTabIndex(this.tabName + '-graph-pane', this.getTabIndex(this.tabName + '-graph-pane') - this.startTabIndex);
                    break;
                }
                case 'draggableItemsScreen': {
                    this.setTabIndex(this.tabName + 'filled-dot', this.getTabIndex(this.tabName + 'filled-dot') - this.startTabIndex);
                    this.setTabIndex(this.tabName + 'unfilled-dot', this.getTabIndex(this.tabName + 'unfilled-dot') - this.startTabIndex);
                    this.setTabIndex(this.tabName + 'left-indicator', this.getTabIndex(this.tabName + 'left-indicator') - this.startTabIndex);
                    this.setTabIndex(this.tabName + 'right-indicator', this.getTabIndex(this.tabName + 'right-indicator') - this.startTabIndex);
                    break;
                }
                case 'draggableContainer': {
                    this.setTabIndex(this.tabName + 'dotted-box', this.getTabIndex(this.tabName + 'dotted-box') - this.startTabIndex);
                    break;
                }
            }

            this.unloadScreen(this.tabName + screenId);
        }

    }, {

        generateAdvanceNumberLine: function (options) {
            if (options) {
                var customAdvanceNumberLineModel = new MathInteractives.Common.Components.Models.AdvanceNumberLine(options);
                var customAdvanceNumberLineView = new MathInteractives.Common.Components.Views.AdvanceNumberLine({ model: customAdvanceNumberLineModel, el: $('#' + options.containerId) });
                return customAdvanceNumberLineView;
            }
        }
    });

    MathInteractives.global.AdvanceNumberLine = MathInteractives.Common.Components.Views.AdvanceNumberLine;
})();