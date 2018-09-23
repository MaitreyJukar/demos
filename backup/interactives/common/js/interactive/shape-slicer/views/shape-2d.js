(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Views.Shape2D) {
        return;
    }
    var eventManagerModel = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer.EVENT_MANAGER_MODEL,
        mainModelNameSpace = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer,
        colorPickerClassName = MathInteractives.Common.Interactivities.ShapeSlicer.Views.ColorPicker;

    /*
     *
     *   [[D E S C R I P T I O N]]
     *
     * @class Shape2D
     * @namespace MathInteractives.Interactivities.ShapeSlicer.Views
     * @extends MathInteractives.Common.Player.Views.Base
     * @constructor
     */
    MathInteractives.Common.Interactivities.ShapeSlicer.Views.Shape2D = MathInteractives.Common.Player.Views.Base.extend({

        /**
         * Holder to access static data of class
         * @property staticDataHolder
         * @type Object
         * @default null
         * @public
         **/
        staticDataHolder: null,

        /**
         * Holder to check browser and device type
         * @property browserCheck
         * @type Object
         * @default null
         * @public
         **/
        browserCheck: null,

        /**
         * Holder to access utility methods
         * @property utils
         * @type Object
         * @default null
         * @public
         **/
        utils: null,

        /**
         * Interactivity's main model
         * @property mainModel
         * @type Object
         * @default null
         * @public
         **/
        mainModel: null,

        /**
         * View for color picker
         * @property colorPickerView
         * @type Object
         * @default null
         * @public
         **/
        colorPickerView: null,


        /**
         * View for color picker button
         * @property colorPickerBtnView
         * @type Object
         * @default null
         * @public
         **/
        colorPickerBtnView: null,

        /**
         * View for trash button
         * @property trashBtnView
         * @type Object
         * @default null
         * @public
         **/
        trashBtnView: null,

        /**
         * View for clear button
         * @property clearBtnView
         * @type Object
         * @default null
         * @public
         **/
        clearBtnView: null,

        /**
         * View for save image button
         * @property saveImageBtnView
         * @type Object
         * @default null
         * @public
         **/
        saveImageBtnView: null,

        /**
         * View for view gallery button
         * @property viewGalleryBtnView
         * @type Object
         * @default null
         * @public
         **/
        viewGalleryBtnView: null,

        /**
         * jQuery object of canvas
         * @property $canvas
         * @type Object
         * @default null
         * @public
         **/
        $canvas: null,

        /**
         * Paper.js scope object
         * @property paperScope
         * @type Object
         * @default null
         * @public
         **/
        paperScope: null,

        /**
         * Paper.js group of all shapes in 2d canvas
         * @property allShapesGroup
         * @type Object
         * @default null
         * @public
         **/
        allShapesGroup: null,

        /**
         * Paper.js group of selected shape (includes shape, translateicon, selection boundary and end points)
         * @property selectedShapeGroup
         * @type Object
         * @default null
         * @public
         **/
        selectedShapeGroup: null,

        /**
         * Base 64 string of rotation icon image
         * @property rasterCircleSource
         * @type String
         * @default ''
         * @public
         **/
        rasterCircleSource: '',

        /**
         * Raster object for rotation icon
         * @property rasterCircle
         * @type Object
         * @default null
         * @public
         **/
        rasterCircle: null,

        /**
         * Symbol for rotation icon raster object
         * @property rasterSymbol
         * @type Object
         * @default null
         * @public
         **/
        rasterSymbol: null,

        /**
         * Paper.js object of rectangle of canvas size
         * @property canvasRect
         * @type Object
         * @default null
         * @public
         **/
        canvasRect: null,

        /**
         * True if the click event has been fired recently on canvas rect
         * @property isCanvasRectClicked
         * @type Boolean
         * @default false
         * @public
         **/
        isCanvasRectClicked: false,

        /**
         * True if the mouse down event has been fired recently on shape
         * @property isMouseDownOnShape
         * @type Boolean
         * @default false
         * @public
         **/
        isMouseDownOnShape: false,

        /**
         * True if the mouse up event has been fired recently on translate icon, shape or selection end point
         * @property isMouseUpOnTranslateOrRotate
         * @type Boolean
         * @default false
         * @public
         **/
        isMouseUpOnTranslateOrRotate: false,

        /**
         * True if the translate icon was dragging
         * @property isSelectedShapeDragging
         * @type Boolean
         * @default false
         * @public
         **/
        isSelectedShapeDragging: false,

        /**
         * True if the selection end point was dragging
         * @property isSelectionEndPointDragging
         * @type Boolean
         * @default false
         * @public
         **/
        isSelectionEndPointDragging: false,

        /**
         * True if the shape is scaled on hover
         * @property isShapeScaled
         * @type Boolean
         * @default false
         * @public
         **/
        isShapeScaled: false,

        /**
         * True if the mouse is currently over the shape buttons
         * @property isMouseOverShapeButtons
         * @type Boolean
         * @default false
         * @public
         **/
        isMouseOverShapeButtons: false,

        /**
         * Last shape on which mouse enter event was fired
         * @property lastLogicalHoveredShape
         * @type Object
         * @default null
         * @public
         **/
        lastLogicalHoveredShape: null,

        /**
         * Last dragged end point for rotation
         * @property lastDraggedEndPoint
         * @type Object
         * @default null
         * @public
         **/
        lastDraggedEndPoint: null,

        /**
         * Difference between event.point and current shape position at mouse down event
         * @property previousDifference
         * @type Object
         * @default null
         * @public
         **/
        previousDifference: null,

        /**
         * Keeps reference of whoops pop-up
         * @property whoopsPopup
         * @type Object
         * @default null
         * @public
         **/
        whoopsPopup: null,

        eventManager: null,

        canvasAcc: null,

        /**
       * Flag is true if focus is on canvas
       *
       * @property isFocusOnCanvas
       * @type Boolean
       * @default false
       */
        isFocusOnCanvas: false,

        /**
       * Flag for first tab on canvas
       *
       * @property isFirstTab
       * @type Boolean
       * @default true
       */
        isFirstTab: true,

        /**
       * Reference to previous Paper Object for Accessibility
       *
       * @property previousItem
       * @type Object
       * @default null
       */
        previousItem: null,


        boundaryCheck: true,

        /**
         * Initializes the right panel
         * @method initialize
         **/
        initialize: function () {
            this.initializeDefaultProperties();
            this.staticDataHolder = MathInteractives.Common.Interactivities.ShapeSlicer.Views.Shape2D;
            this.browserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;
            this.utils = MathInteractives.Common.Utilities.Models.Utils;
            this.mainModel = this.options.mainModel;
            this.eventManager = this.mainModel.get('eventManager');
            if (this.model.get('shapeColorsToUse') === null) {
                this.model.set('shapeColorsToUse', _.shuffle(this.staticDataHolder.SHAPE_COLOR));
            }
            this.$canvas = this.$('#' + this.idPrefix + 'right-panel-canvas');
            this._preloadImage();
            this._setUpCanvas();
            this.unloadScreen('right-panel-screen');
            this.loadScreen('right-panel-screen');
            this._loadCanvasForAcc();
            this._render();
            this._bindEvents();
            //To Prevent Hover on Canvas adding dummy div on it and calling stopPropagation
            this.$('.right-panel-canvas-container-modal').off('mousemove').on('mousemove', function (event) {
                event.stopPropagation();
            });
            this.eventManager.off(eventManagerModel.DESELECT_SHAPE, this._handleShapeDeselectEvent).on(eventManagerModel.DESELECT_SHAPE, this._handleShapeDeselectEvent, this);

        },

        /**
         * Event-handler bindings
         * @property events
         * @type Object
         * @public
         **/
        events: {
            'click .background-color-selector-container .back-color-selector:not(".selected")': '_onBackColorSelect',
            'mouseenter .background-color-selector-container .back-color-selector:not(".selected")': '_onBackColorMouseEnter',
            'mouseleave .background-color-selector-container .back-color-selector': '_onBackColorMouseLeave',
            'mousedown .background-color-selector-container .back-color-selector:not(".selected")': '_onBackColorMouseDown'
        },

        /**
         * Pre fetches the rotation icon image
         * @method _preloadImage
         * @private
         **/
        _preloadImage: function _preloadImage() {
            var image = new Image();
            this.rasterCircleSource = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAABWVBMVEUAAAAAAAAAAAAAAAACAgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADi4uIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD5+fnKysqdnZ03NzcAAAANDQ0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD19fXy8vLp6enl5eXe3t61tbWhoaFycnJjY2NRUVFFRUUsLCwfHx8nJycGBgYYGBgAAAAAAAAAAAAAAAAAAADu7u7Y2NjS0tLPz8++vr66urqSkpJaWlokJCQUFBRMTEwSEhIICAgAAAAAAADW1tbCwsLFxcWnp6eqqqqJiYmHh4d9fX2WlpZra2ttbW06OjoiIiJBQUEoKCgnJycfHx8AAAD////+/v7AY7KLAAAAcXRSTlMAAQIRvSITBwrIQyclDgMWCNZyUTErBId5ST47NBoG+dLCsKOYi31uaGJaBf717NXMyKCclJBrTUYvHv38+vr57+3k4eHg3NrZ1tDGgV5bVvz39/by8urf29nW0cynnff08uzr6urp5eDe3tPS0My6qK3pfE4AAAIESURBVCjPZdJVk+JAFAVg4k4SgiRAgru7u/u476y7Nv//YQNMTU2Y8/rV6eq+t00QrJE8ZnW5rBhOwCZjzARXtyqrSGRFMzhhhqGXKOCscy0XA/lQlGZxUrC/ZISplkP+7O0YLZaVGsZzOj8jVrUUfOLorDlFg5Z11Y3xZOK5bI0VspPPSZCeidS/khxTrHVOMz+pU0aH78D24sd4IoqUPyjHXSyiwU8Y/tUAwHPW9ry9vLqeZf36xRgkcVB35O93D2i0uykPAMlUX0SDkSrGHQ5mKw7f748gmZ7/zFx3QfLyhiqUnaqwr+I2KezPDVrNDLVY5DLvwemYKq5qiHmHBMLS0SL65w59dDjy1EN6e36LLpW6sHsPZCdVq1QOhyMbmo470GwP9GaBqHs3Sr0LE4g+eKf+fJ6pOBb3nZORzyExiGDXUS8LHI4jpJbgbLE33gFIewMWheFJ3fYOwRBkgkg2/uidtDtTqmCp2HDD+qB9U+xth14qb6HrRkTcFnR6MwB9cTQvbZgjdMm5TurL9tOwdRGI2UyG7JpX4KR57tl+y69ZI+oXCtyngJ4PDyVFNWKCd8lopgXA6dwfrSFGhEisEqL6oHHnW9IqcfwXOSZeynW/+kISS8Kmo9jx2mYZDIYlm76X40AEb6Mlycngmul1YAFRMUzlCOhYDmvQCCJh3tl/hUJQfQ0an+wAAAAASUVORK5CYII=';
            image.src = this.rasterCircleSource;
        },

        /**
         * Sets up paperscope and shapes group for canvas
         * @method _setUpCanvas
         * @private
         **/
        _setUpCanvas: function _setUpCanvas() {
            var shapeData = this.model.get('shapeData'),
                utils = MathInteractives.Common.Utilities.Models.Utils,
                selector = this.idPrefix + 'right-panel-canvas';

            this.paperScope = new paper.PaperScope();
            utils.EnableTouch('#' + selector, { specificEvents: utils.SPECIFIC_EVENTS.DRAGGABLE });
            this.paperScope.setup(selector);
            this.paperScope.activate();

            if (shapeData === null) {
                this.allShapesGroup = new this.paperScope.Group({
                    name: 'all-shapes-group'
                });
            }
            else {
                var self = this,
                    isSelectedGroupSaved = false,
                    selectedShapeGroupName = this.model.get('selectedShapeGroupName'),
                    selectedShapeGroup,
                    selectionGroup;


                this.paperScope.activate();
                // For saved state, import paper group element from json object.
                this.allShapesGroup = new this.paperScope.Group();
                this.allShapesGroup.importJSON(shapeData);

                this.allShapesGroup.children.forEach(function (shapeGroup) {
                    self._bindShapeEvents(shapeGroup.children['shape']);
                });
                if (selectedShapeGroupName !== '') {
                    selectedShapeGroup = this.allShapesGroup.children[selectedShapeGroupName];
                    this._deselectShape();
                    this._selectShape(selectedShapeGroup.children['shape'], selectedShapeGroup);
                }
            }
            this.model.set('shapeData', this.allShapesGroup);
            this._drawCanvasRect();
            this.paperScope.view.draw();
        },

        /**
         * Bind events to the appropriate handles
         * @method _bindEvents
         * @private
         **/
        _bindEvents: function () {
            var self = this;
            this.eventManager.off(eventManagerModel.DRAW_SLICED_SHAPE, this._draw2DShape)
                             .off(eventManagerModel.EDIT_IMAGE, this._loadShapesToEdit)
                             .off(eventManagerModel.DELETE_IMAGE, this._onDeleteGalleryImage)
                             .off(eventManagerModel.CLEAR_ALL_IMAGES, this._onGalleryClear)
                             .off(eventManagerModel.SAVE_STATE_START, this._onSaveStateStart)
                             .off(eventManagerModel.SAVE_STATE_END, this._onSaveStateEnd);
            this.mainModel.off('change:galleryImageCount', this._onGalleryObjectsCountChange)
                          .off('change:noOfSlicedShapes', this._onShapeCountChange)
                          .off('change:isSaveImageButtonEnabled', this._onSaveImageButtonStatusChange);

            this.eventManager.on(eventManagerModel.DRAW_SLICED_SHAPE, this._draw2DShape, this)
                             .on(eventManagerModel.EDIT_IMAGE, this._loadShapesToEdit, this)
                             .on(eventManagerModel.DELETE_IMAGE, this._onDeleteGalleryImage, this)
                             .on(eventManagerModel.CLEAR_ALL_IMAGES, this._onGalleryClear, this)
                             .on(eventManagerModel.SAVE_STATE_START, this._onSaveStateStart, this)
                             .on(eventManagerModel.SAVE_STATE_END, this._onSaveStateEnd, this);
            this.mainModel.on('change:galleryImageCount', this._onGalleryObjectsCountChange, this)
                          .on('change:noOfSlicedShapes', this._onShapeCountChange, this)
                          .on('change:isSaveImageButtonEnabled', this._onSaveImageButtonStatusChange, this);

        },

        /**
         * Renders the right panel
         * @method _render
         * @private
         **/
        _render: function _render() {
            var selectedShapeGroup = this.selectedShapeGroup;
            this._renderBackColorSelectors();
            this._createButtons();
            this._bindToolEvents();

            if (selectedShapeGroup !== null) {
                this._deselectShape();
                this._selectShape(selectedShapeGroup.children['shape'], selectedShapeGroup);
                this._showShapeButtons(true);
                this._setShapeButtonsPosition();
            } else {
                this._showShapeButtons(false);
            }

            var noOfSlicedShapes = this.mainModel.get('noOfSlicedShapes');
            this._showEmptyCanvasText(noOfSlicedShapes <= 0);

        },

        /**
         * Renders the background color selector buttons
         * @method _renderBackColorSelectors
         * @private
         **/
        _renderBackColorSelectors: function _renderBackColorSelectors() {
            var $wrapperDiv = $('<div/>').addClass('wrapper-fa-div'),
                $span = $('<span/>').addClass('fa fa-check'),
                self = this;

            $wrapperDiv.append($span);

            this.$('.white-color-selector').prepend($wrapperDiv).data({
                customType: this.staticDataHolder.BACKGROUND_TYPE.WHITE
            });
            this.$('.gray-color-selector').prepend($wrapperDiv.clone()).data({
                customType: this.staticDataHolder.BACKGROUND_TYPE.GRAY
            });

            var backgroundType = this.model.get('backgroundType');
            if (backgroundType === null) {
                backgroundType = this.staticDataHolder.BACKGROUND_TYPE.WHITE;
                this.model.set('backgroundType', backgroundType);
            }
            this._selectBackColorElement(this.$('.' + backgroundType.TYPE_NAME + '-color-selector'));

            this.setAccMessage('white-color-selector', this.getAccMessage('white-color-selector', 0));
            this.setAccMessage('gray-color-selector', this.getAccMessage('gray-color-selector', 1));

            this.utils.DisableTouch(this.$('.back-color-selector'));
            this.utils.EnableTouch(this.$('.back-color-selector'), 0);

            this.$('.background-color-label-container,.gray-color-selector').on('focusin.updateRect', function () {
                self.$('.background-color-label-container,.gray-color-selector').off('focusin.updateRect');
                self.updateFocusRect('background-color-label-container');
                self.updateFocusRect('white-color-selector');
                self.updateFocusRect('gray-color-selector');
            });
        },

        /**
         * Creates buttons in the right panel
         * @method _createButtons
         * @private
         **/
        _createButtons: function _createButtons() {
            var btnOptions = {
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                idPrefix: this.idPrefix,
                data: {
                    id: this.idPrefix + 'clear-button-container',
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    baseClass: 'shape-slicer-gray-button-base',
                    text: this.getMessage('button-texts', 'clear-button-text')
                }
            };
            this.clearBtnView = MathInteractives.global.Theme2.Button.generateButton(btnOptions);

            btnOptions.data.id = this.idPrefix + 'save-image-button-container';
            btnOptions.data.text = this.getMessage('button-texts', 'save-image-button-text');
            btnOptions.data.textPadding = 10;
            this.saveImageBtnView = MathInteractives.global.Theme2.Button.generateButton(btnOptions);

            btnOptions.data = {
                id: this.idPrefix + 'view-gallery-button-container',
                text: this.getMessage('button-texts', 'view-gallery-button-text'),
                type: MathInteractives.global.Theme2.Button.TYPE.FA_ICONTEXT,
                baseClass: 'shape-slicer-gray-button-base',
                icon: {
                    faClass: this.getFontAwesomeClass('gallery'),
                    fontWeight: 'normal',
                    height: 14,
                    width: 24
                }
            };

            btnOptions.data.id = this.idPrefix + 'view-gallery-button-container';
            btnOptions.data.text = this.getMessage('button-texts', 'view-gallery-button-text');
            this.viewGalleryBtnView = MathInteractives.global.Theme2.Button.generateButton(btnOptions);

            btnOptions.data = {
                id: this.idPrefix + 'color-picker-button-container',
                type: MathInteractives.global.Theme2.Button.TYPE.ICON,
                width: 26,
                height: 26,
                icon: {
                    iconPath: this.getImagePath('sprites'),
                    height: 26,
                    width: 26
                },
                tooltipText: this.getMessage('button-texts', 'color-picker-tooltip-text'),
                tooltipType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.LEFT_MIDDLE
            };
            this.colorPickerBtnView = MathInteractives.global.Theme2.Button.generateButton(btnOptions);
            this.colorPickerBtnView.$el.css({ 'height': '26px' });
            this.colorPickerBtnView.$('.custom-btn-icon').css({ 'margin-top': '0px' });

            btnOptions.data = {
                id: this.idPrefix + 'trash-button-container',
                type: MathInteractives.global.Theme2.Button.TYPE.FA_ICON,
                width: 26,
                height: 26,
                icon: {
                    faClass: this.getFontAwesomeClass('fixed-trash'),
                    fontColor: '#515050',
                    fontWeight: 'normal',
                    height: 26,
                    width: 26
                },
                tooltipText: this.getMessage('button-texts', 'trash-tooltip-text'),
                tooltipType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.LEFT_MIDDLE
            };
            this.trashBtnView = MathInteractives.global.Theme2.Button.generateButton(btnOptions);
            this._setButtonPanelWidth();
            this._bindButtonEvents();
        },

        /**
         * Binds the right panel button events
         * @method _bindButtonEvents
         * @private
         **/
        _bindButtonEvents: function _bindButtonEvents() {
            var self = this;
            this.colorPickerBtnView.$el.off('click.colorPicker').on('click.colorPicker', $.proxy(this._onColorPickerBtnClick, this));
            this.trashBtnView.$el.off('click.trash').on('click.trash', $.proxy(this._onTrashBtnClick, this));
            this.clearBtnView.$el.off('click.clear').on('click.clear', $.proxy(this._onClearBtnClick, this));
            this.saveImageBtnView.$el.off('click.saveImage').on('click.saveImage', $.proxy(this._onSaveImageBtnClick, this));
            this.viewGalleryBtnView.$el.off('click.viewGallery').on('click.viewGallery', $.proxy(this._onViewGalleryBtnClick, this));

            this.colorPickerBtnView.$el.on({
                'mouseenter': $.proxy(this._onShapeButtonsMouseEnter, this),
                'mouseleave': $.proxy(this._onShapeButtonsMouseLeave, this)
            });
            this.trashBtnView.$el.on({
                'mouseenter': $.proxy(this._onShapeButtonsMouseEnter, this),
                'mouseleave': $.proxy(this._onShapeButtonsMouseLeave, this)
            });
        },

        _onShapeButtonsMouseEnter: function _onShapeButtonsMouseEnter(event) {
            if (this.lastLogicalHoveredShape !== null) {
                this._setCursor(this.staticDataHolder.CURSOR_TYPE.DEFAULT);
                if (this.isShapeScaled) {
                    this._antiScaleShape(this.lastLogicalHoveredShape);
                }
            }
            this.isMouseOverShapeButtons = true;
        },

        _onShapeButtonsMouseLeave: function _onShapeButtonsMouseLeave(event) {
            this.isMouseOverShapeButtons = false;
            if (this.lastLogicalHoveredShape !== null && !this.player.getModalPresent()) {
                this._scaleShape(this.lastLogicalHoveredShape);
                this._setCursor(this.staticDataHolder.CURSOR_TYPE.OPEN_HAND);
            }
        },

        /**
         * Sets the bottom buttons panel width
         * @method _setButtonPanelWidth
         * @private
         **/
        _setButtonPanelWidth: function _setButtonPanelWidth() {
            var panelWidth = this.clearBtnView.$el.outerWidth(true) + this.saveImageBtnView.$el.outerWidth(true) + this.viewGalleryBtnView.$el.outerWidth(true);
            this.$('.right-part-buttons-panel').css({
                width: panelWidth
            });
        },

        /**
         * Adds hover class to respective element
         * @method _onBackColorMouseEnter
         * @param {Object} event Event object for the mouseenter event
         * @private
         **/
        _onBackColorMouseEnter: function _onBackColorMouseEnter(event) {
            $(event.currentTarget).addClass('hover');
        },

        /**
         * Removes hover class to respective element
         * @method _onBackColorMouseLeave
         * @param {Object} event Event object for the mouseleave event
         * @private
         **/
        _onBackColorMouseLeave: function _onBackColorMouseLeave(event) {
            $(event.currentTarget).removeClass('hover');
        },

        /**
         * Adds down class to respective element
         * @method _onBackColorMouseDown
         * @param {Object} event Event object for the mousedown event
         * @private
         **/
        _onBackColorMouseDown: function _onBackColorMouseDown(event) {
            $(event.currentTarget).addClass('down');
            $(document).one('mouseup.back-color-selector', function (event) {
                self.$('.back-color-selector.down').removeClass('down');
            });
        },

        /**
         * Selects the back color element
         * @method _onBackColorSelect
         * @param {Object} event Event object for the click event
         * @private
         **/
        _onBackColorSelect: function _onBackColorSelect(event) {
            this.stopReading();
            this.eventManager.trigger(eventManagerModel.ENABLE_TRY_ANOTHER);
            this._selectBackColorElement($(event.currentTarget));
        },

        /**
         * Selects the back color element and changes the panel background according to selected element
         * @method _selectBackColorElement
         * @param {Object} $element jQuery object of back color element to be selected
         * @private
         **/
        _selectBackColorElement: function _selectBackColorElement($element) {
            if ($element.hasClass('selected')) {
                return;
            }
            this.$('.back-color-selector.selected').removeClass('selected');
            this._changeBackground($element.addClass('selected').data()['customType']);

        },

        /**
         * Changes the panel background according to background type
         * @method _changeBackground
         * @param {String} type One of background type from static constant BACKGROUND_TYPE
         * @private
         **/
        _changeBackground: function _changeBackground(type) {
            var prevBackgroundType = this.model.get('backgroundType'),
                noOfSlicedShapes = this.mainModel.get('noOfSlicedShapes'),
                isSaveImageButtonEnabled = this.mainModel.get('isSaveImageButtonEnabled');

            this.$el.removeClass(prevBackgroundType.TYPE_NAME).addClass(type.TYPE_NAME);
            this.canvasRect.fillColor = type.TYPE_COLOR;
            this.paperScope.view.draw();
            this.model.set('backgroundType', type);
            if (!this.mainModel.get('saveStateLoad') && !isSaveImageButtonEnabled && noOfSlicedShapes > 0) {
                this.mainModel.set('isSaveImageButtonEnabled', true);
            }
            this.setAccMessage(type.TYPE_NAME + '-color-selector', this.getAccMessage(type.TYPE_NAME + '-color-selector', 0));
            this.setAccMessage(prevBackgroundType.TYPE_NAME + '-color-selector', this.getAccMessage(prevBackgroundType.TYPE_NAME + '-color-selector', 1));
            this.updateFocusRect('gray-color-selector');
            this.updateFocusRect('white-color-selector');
            this.player.$('.temp-focus-div').focus();
            this.setFocus(type.TYPE_NAME + '-color-selector');
        },

        /**
         * Show the color picker palette
         * @method _onColorPickerBtnClick
         * @param {Object} event Event object for the click event
         * @private
         **/
        _onColorPickerBtnClick: function _onColorPickerBtnClick(event) {
            if (this.colorPickerBtnView.getButtonState() === MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
                return;
            }
            this.stopReading();
            var shape = this.selectedShapeGroup.children['shape'];
            this._disableAllHelpElements();
            this.eventManager.trigger(eventManagerModel.DISABLE_BUTTON_ON_COLOR_PICKER);

            this.generateColorPicker(shape);
            this.setFocus('color-picker-container');
            this.changeAccMessage('right-panel-canvas-acc-container', 11);
        },

        /**
         * Deletes the current selected shape
         * @method _onTrashBtnClick
         * @param {Object} event Event object for the click event
         * @private
         **/
        _onTrashBtnClick: function _onTrashBtnClick(event) {
            if (this.trashBtnView.getButtonState() === MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
                return;
            }
            this.stopReading();
            var noOfSlicedShapes = this.mainModel.get('noOfSlicedShapes'),
                self = this;
            if (noOfSlicedShapes === 11) {
                noOfSlicedShapes -= 2;
            } else {
                noOfSlicedShapes -= 1;
            }
            this.mainModel.set('noOfSlicedShapes', noOfSlicedShapes);
            this.model.set('selectedShapeGroupName', '');
            this.selectedShapeGroup.remove();
            this.selectedShapeGroup = null;
            this.canvasAcc.updatePaperItems(this.getPaperObjects());
            this.paperScope.view.draw();

            if (noOfSlicedShapes === 0) {
                this.setAccMessage('right-panel-canvas-acc-container', this.getAccMessage('right-panel-canvas-acc-container', 10) + ' ' + this.getAccMessage('empty-activity-text', 0));
            }
            else {
                this.setAccMessage('right-panel-canvas-acc-container', this.getAccMessage('right-panel-canvas-acc-container', 10) + ' ' + this.getAccMessage('right-panel-canvas-acc-container', 0));
            }
            this._setFocusOnCanvas();
            //Timeout is required since the message changes before focus is set
            window.setTimeout(function () {
                if (noOfSlicedShapes === 0) {
                    self.setAccMessage('right-panel-canvas-acc-container', self.getAccMessage('empty-activity-text', 0));
                }
                else {
                    self.setAccMessage('right-panel-canvas-acc-container', self.getAccMessage('right-panel-canvas-acc-container', 0));
                }
            }, 0);
            this._showShapeButtons(false);
        },

        /**
         * Removes all 2D shapes from the canvas
         * @method _onClearBtnClick
         * @param {Object} event Event object for the click event
         * @private
         **/
        _onClearBtnClick: function _onClearBtnClick(event) {
            if (this.clearBtnView.getButtonState() === MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
                return;
            }
            this.stopReading();
            if (this.mainModel.get('isSaveImageButtonEnabled') || this.mainModel.get('showClearPopup')) {
                this._showPopup();
            }
            else {
                this._clearImageCanvas();
            }
        },

        /**
         * Clear the image canvas
         *
         * @method _clearImageCanvas
         * @private
         **/
        _clearImageCanvas: function _clearImageCanvas() {
            if (this.selectedShapeGroup !== null) {
                this.selectedShapeGroup.remove();
                this.selectedShapeGroup = null;
            }
            this.allShapesGroup.removeChildren();
            this.paperScope.view.draw();
            this.model.set('selectedShapeGroupName', '');
            this.model.set('shapeCounter', -1);
            this.mainModel.set('noOfSlicedShapes', 0);
            this.canvasAcc.updatePaperItems(this.getPaperObjects());
            this._showShapeButtons(false);
            this.setFocus('explore-tab-right-part-container');
        },

        /**
         * Resets the right panel
         * @method resetView
         * @public
         **/
        resetView: function resetView() {
            this._selectBackColorElement(this.$('.' + this.staticDataHolder.BACKGROUND_TYPE.WHITE.TYPE_NAME + '-color-selector'));
            this._clearImageCanvas();
        },

        /**
         * Shows the reset popup
         *
         * @method _showPopup
         * @private
         **/
        _showPopup: function () {
            var self = this,
                options, popUpView;
            options = {
                title: this.getMessage('reset-popup', 4),
                accTitle: '',
                text: this.getMessage('reset-popup', 5),
                accText: '',
                manager: self.manager,
                player: self.player,
                path: self.filePath,
                idPrefix: self.idPrefix,
                type: MathInteractives.global.Theme2.PopUpBox.CONFIRM,
                closeCallback: {
                    fnc: function (response) {
                        if (response.isPositive) {
                            self._clearImageCanvas();
                        }
                        else {
                            self.setFocus('clear-button-container');
                        }
                    },
                    scope: self
                },
                buttons: [
                    {
                        id: self.idPrefix + 'ok-btn',
                        text: self.getMessage('reset-popup', 2),
                        response: { isPositive: true, buttonClicked: self.idPrefix + 'ok-btn' }
                    },
                    {
                        id: self.idPrefix + 'cancel-btn',
                        text: self.getMessage('reset-popup', 3),
                        response: { isPositive: false, buttonClicked: self.idPrefix + 'cancel-btn' }
                    }
                ]
            }
            popUpView = MathInteractives.global.Theme2.PopUpBox.createPopup(options);
        },

        /**
         * Saves current canvas drawing as image to gallery
         * @method _onSaveImageBtnClick
         * @param {Object} event Event object for the click event
         * @private
         **/
        _onSaveImageBtnClick: function _onSaveImageBtnClick(event) {
            if (this.saveImageBtnView.getButtonState() === MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
                return;
            }
            this.stopReading();
            var dataURL = null,
                $canvas = this.$canvas,
                obj = {},
                self = this,
                galleryObject = this.mainModel.get('galleryObject'),
                currentIndex = this.mainModel.get('currentGalleryIndex'),
                newIndex;

            this._deselectShape();
            this.mainModel.set('isSaveImageButtonEnabled', false);
            this._showShapeButtons(false);
            if (this.isShapeScaled && this.lastLogicalHoveredShape !== null) {
                this._antiScaleShape(this.lastLogicalHoveredShape);
            }
            if (currentIndex < mainModelNameSpace.MAX_GALLERY_LENGTH) {
                obj.backType = this.model.get('backgroundType');
                obj.shapeData = this.allShapesGroup.toJSON();
                galleryObject[currentIndex] = obj;
                this.mainModel.set('galleryObject', galleryObject);
                this.eventManager.trigger(eventManagerModel.SAVE_IMAGE);
                newIndex = galleryObject.length || galleryObject.length + 1;
                this.mainModel.set('currentGalleryIndex', newIndex);
                this.mainModel.set('showClearPopup', false);
                this.setAccMessage('right-panel-canvas-acc-container', this.getAccMessage('right-panel-canvas-acc-container', 16, [newIndex]) + ' ' + this.getAccMessage('right-panel-canvas-acc-container', 0));
                this.setFocus('right-panel-canvas-acc-container');
                //Timeout is required since the message changes before focus is set
                window.setTimeout(function () {
                    self.setAccMessage('right-panel-canvas-acc-container', self.getAccMessage('right-panel-canvas-acc-container', 0));
                }, 0);
            }
            else {
                this._createWhoopsPopUp();
                this.mainModel.set('showClearPopup', true);
            }
        },

        /**
         * Switches to Gallery tab
         * @method _onViewGalleryBtnClick
         * @param {Object} event Event object for the click event
         * @private
         **/
        _onViewGalleryBtnClick: function _onViewGalleryBtnClick(event) {
            if (this.viewGalleryBtnView.getButtonState() === MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
                return;
            }
            this.stopReading();
            this.player.switchToTab(2);
        },

        /**
         * Enables or disables the Clear button
         * @method _enableClearButton
         * @param {Boolean} enable True to enable the button or false to disable it
         * @private
         **/
        _enableClearButton: function _enableClearButton(enable) {
            var buttonState = enable ? MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE : MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED;
            this.clearBtnView.setButtonState(buttonState);
        },

        /**
         * Enables or disables the Save Image button
         * @method _enableSaveImageButton
         * @param {Boolean} enable True to enable the button or false to disable it
         * @private
         **/
        _enableSaveImageButton: function _enableSaveImageButton(enable) {
            var buttonState = enable ? MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE : MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED;
            this.saveImageBtnView.setButtonState(buttonState);
        },

        /**
         * Enables or disables the View Gallery button
         * @method _enableViewGalleryButton
         * @param {Boolean} enable True to enable the button or false to disable it
         * @private
         **/
        _enableViewGalleryButton: function _enableViewGalleryButton(enable) {
            var buttonState = enable ? MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE : MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED;
            this.viewGalleryBtnView.setButtonState(buttonState);
        },

        /**
         * Does the following based on number of sliced shapes
         * 1. Hides the empty canvas text if there is at least one shape in canvas otherwise shows it
         * 2. Enables the Clear button if there is at least one shape in canvas otherwise disables it
         * 3. Enables the Save Image button if there is at least one shape in canvas otherwise disables it
         * @method _onShapeCountChange
         * @private
         **/
        _onShapeCountChange: function _onShapeCountChange() {
            var noOfSlicedShapes = this.mainModel.get('noOfSlicedShapes');
            this._showEmptyCanvasText(noOfSlicedShapes <= 0);
            this._enableClearButton(noOfSlicedShapes > 0);
            this.mainModel.set('isSaveImageButtonEnabled', noOfSlicedShapes > 0);
        },

        /**
         * Enables or disables the Save Image button based on Save Image button status
         * @method _onSaveImageButtonStatusChange
         * @private
         **/
        _onSaveImageButtonStatusChange: function _onSaveImageButtonStatusChange() {
            this._enableSaveImageButton(this.mainModel.get('isSaveImageButtonEnabled'));
        },

        /**
         * Enables the View Gallery button and Gallery tab if there is at least one image in gallery otherwise disables it
         * @method _onGalleryObjectsCountChange
         * @private
         **/
        _onGalleryObjectsCountChange: function _onGalleryObjectsCountChange() {
            var galleryImageCount = this.mainModel.get('galleryImageCount');
            this._enableViewGalleryButton(galleryImageCount > 0);
            this.player.enableTab(galleryImageCount > 0, 2);
        },

        /**
         * Enables the Save Image button if there is at least one shape in canvas and gallery images count reaches 0
         * @method _onDeleteGalleryImage
         * @private
         **/
        _onDeleteGalleryImage: function _onDeleteGalleryImage() {
            var galleryImageCount = this.mainModel.get('galleryImageCount'),
                noOfSlicedShapes = this.mainModel.get('noOfSlicedShapes');
            if (galleryImageCount === 0 && noOfSlicedShapes > 0) {
                this.mainModel.set('isSaveImageButtonEnabled', true);
            }
        },

        /**
         * Enables the Save Image button if there is at least one shape in canvas
         * @method _onGalleryClear
         * @private
         **/
        _onGalleryClear: function _onGalleryClear() {
            var noOfSlicedShapes = this.mainModel.get('noOfSlicedShapes');
            if (noOfSlicedShapes > 0) {
                this.mainModel.set('isSaveImageButtonEnabled', true);
            }
        },

        /**
         * Shows or hides the empty canvas text
         * @method _showEmptyCanvasText
         * @param {Boolean} show True to show the empty canvas text or false to hide it
         * @private
         **/
        _showEmptyCanvasText: function _showEmptyCanvasText(show) {
            var $emptyCanvasText = this.$('.right-part-text-container');
            if (!!show) {
                $emptyCanvasText.show();
                this.setAccMessage('right-panel-canvas-acc-container', this.getAccMessage('empty-activity-text', 0));
            } else {
                $emptyCanvasText.hide();
                this.changeAccMessage('right-panel-canvas-acc-container', 0);
            }
        },

        /**
         * Shows or hides the color picker and trash buttons container
         * @method _showShapeButtons
         * @param {Boolean} show True to show the color picker and trash buttons container or false to hide it
         * @private
         **/
        _showShapeButtons: function _showShapeButtons(show, event) {
            var $shapeButtonsContainer = this.$('.color-picker-trash-buttons-container'),
                isAccessible = event ? event.isAccessible : false,
                self = this;
            if (!!show) {
                if (!this.browserCheck.isMobile) {
                    $shapeButtonsContainer.fadeIn(200, function () {
                        if (!isAccessible && self.isMouseDownOnShape && self.model.get('selectedShapeGroupName') !== '') {
                            $shapeButtonsContainer.hide();
                        }
                    });
                }
                else {
                    $shapeButtonsContainer.show();
                }
            } else {
                $shapeButtonsContainer.hide();
            }
        },

        /**
         * Sets the color picker and trash buttons container position based on selected shape position
         * @method _setShapeButtonsPosition
         * @private
         **/
        _setShapeButtonsPosition: function _setShapeButtonsPosition() {
            var dummyGroup = new this.paperScope.Group([this.selectedShapeGroup.children['selection-group'].children['shape-boundary'].clone()]),
                dummyBounds = dummyGroup.bounds,
                $shapeButtonsContainer = this.$('.color-picker-trash-buttons-container'),
                shapeButtonsWidth = this.$('.color-picker-button-container').outerWidth(true), //$shapeButtonsContainer.width(),
                shapeButtonsHeight = this.$('.color-picker-button-container').outerHeight(true) + this.$('.trash-button-container').outerHeight(true), //$shapeButtonsContainer.height(),
                canvasOffset = 5,
                offset = 20,
                left = 0,
                top = dummyBounds.top + (dummyBounds.height - shapeButtonsHeight) / 2,
                visibleHeight;

            if (dummyBounds.right + (offset + shapeButtonsWidth) < this.staticDataHolder.CANVAS_AREA.WIDTH) {
                left = dummyBounds.right + offset;
            }
            else if (dummyBounds.left - (shapeButtonsWidth + offset) > this.staticDataHolder.CANVAS_AREA.X) {
                left = dummyBounds.left - (shapeButtonsWidth + offset);
            }
            if (dummyBounds.y < this.staticDataHolder.CANVAS_AREA.Y) {
                visibleHeight = dummyBounds.height - (this.staticDataHolder.CANVAS_AREA.Y - dummyBounds.y);
                top = this.staticDataHolder.CANVAS_AREA.Y + (visibleHeight - shapeButtonsHeight) / 2;
            }
            else if (dummyBounds.bottom > this.staticDataHolder.CANVAS_AREA.Y + this.staticDataHolder.CANVAS_AREA.HEIGHT) {
                visibleHeight = dummyBounds.height - (dummyBounds.bottom - (this.staticDataHolder.CANVAS_AREA.Y + this.staticDataHolder.CANVAS_AREA.HEIGHT));
                top = dummyBounds.top + (visibleHeight - shapeButtonsHeight) / 2;
            }
            if (top < this.staticDataHolder.CANVAS_AREA.Y) {
                top = this.staticDataHolder.CANVAS_AREA.Y + canvasOffset;
            }
            else if (top + shapeButtonsHeight > this.staticDataHolder.CANVAS_AREA.Y + this.staticDataHolder.CANVAS_AREA.HEIGHT) {
                top = this.staticDataHolder.CANVAS_AREA.HEIGHT - canvasOffset - shapeButtonsHeight;
            }
            $shapeButtonsContainer.css({
                left: left + 'px',
                top: top + 'px'
            });
            dummyGroup.remove();
        },

        /**
         * Sets the canvas cursor type
         * @method _setCursor
         * @param {String} strCursorValue One of cursor type from static constant CURSOR_TYPE
         * @private
         **/
        _setCursor: function _setCursor(strCursorValue) {
            if (strCursorValue !== this.staticDataHolder.CURSOR_TYPE.DEFAULT && strCursorValue !== this.staticDataHolder.CURSOR_TYPE.POINTER) {
                strCursorValue = "url('" + this.getImagePath(strCursorValue) + "'), move";
            }
            this.$canvas.css({
                'cursor': strCursorValue
            });
        },

        /**
         * Returns the color for newly sliced shape from the shuffled colors array
         * @method _generateShapeColor
         * @return Color from the available colors
         * @private
         **/
        _generateShapeColor: function _generateShapeColor() {
            var shapeColorsToUse = this.model.get('shapeColorsToUse'),
                shapeColorIndex = this.model.get('shapeColorIndex');

            shapeColorIndex = (shapeColorIndex + 1) % shapeColorsToUse.length;
            this.model.set('shapeColorIndex', shapeColorIndex);
            return shapeColorsToUse[shapeColorIndex];
        },

        /**
         * Draws rectangle of canvas size
         * @method _drawCanvasRect
         * @private
         **/
        _drawCanvasRect: function _drawCanvasRect() {
            var self = this;
            if (this.canvasRect !== null) {
                this.canvasRect.remove();
            }
            this.canvasRect = new this.paperScope.Path.Rectangle({
                from: [this.staticDataHolder.CANVAS_AREA.X, this.staticDataHolder.CANVAS_AREA.Y],
                to: [this.staticDataHolder.CANVAS_AREA.WIDTH, this.staticDataHolder.CANVAS_AREA.HEIGHT]
            });
            this.canvasRect.sendToBack();
            this.canvasRect.off('click');
            this.canvasRect.on('click', function (event) {
                if (self.browserCheck.isMobile || event.event.which === 1) {
                    self._deselectShape();
                    self._showShapeButtons(false);
                    self.isCanvasRectClicked = true;
                }
            });
        },

        /**
         * Sets the shape and color picker background color
         * @method _setShapeColor
         * @private
         **/
        _setShapeColor: function _setShapeColor(event, colorObj) {
            var shape = this.selectedShapeGroup.children['shape'],
                isSaveImageButtonEnabled = this.mainModel.get('isSaveImageButtonEnabled');

            this.$('.color-picker-button-container').css({
                'background-color': colorObj.rgba
            });
            shape.fillColor = new this.paperScope.Color(colorObj.rgb.r, colorObj.rgb.g, colorObj.rgb.b, colorObj.alpha);
            this.paperScope.view.draw();
            if (!isSaveImageButtonEnabled) {
                this.mainModel.set('isSaveImageButtonEnabled', true);
            }

        },

        /**
         * Removes the rotation icons from all shapes group so that they are not present in save state
         * @method _onSaveStateStart
         * @private
         **/
        _onSaveStateStart: function _onSaveStateStart() {
            var selectedShapeGroupName = this.model.get('selectedShapeGroupName');
            if (selectedShapeGroupName !== '') {
                this._deselectShape();
                this._showShapeButtons(false);
                if (this.colorPickerView !== null) {
                    this.colorPickerView._removePopup();
                }
            }
        },

        /**
         * Adds the rotation icons to all shapes group
         * @method _onSaveStateEnd
         * @private
         **/
        _onSaveStateEnd: function _onSaveStateEnd() {
            /*
                var selectedShapeGroupName = this.model.get('selectedShapeGroupName'),
                    selectedShapeGroup;
    
                if (selectedShapeGroupName !== '') {
                    selectedShapeGroup = this.allShapesGroup.children[selectedShapeGroupName];
                    this._selectShape(selectedShapeGroup.children['shape'], selectedShapeGroup);
                    this._setShapeButtonsPosition();
                }
           */
        },

        /**
         * Loads the shapes from gallery image using shape data
         * @method _loadShapesToEdit
         * @private
         **/
        _loadShapesToEdit: function _loadShapesToEdit() {
            var self = this,
                selectedShapeGroupName = this.model.get('selectedShapeGroupName'),
                galleryObject = this.mainModel.get('galleryObject'),
                currentGalleryIndex = this.mainModel.get('currentGalleryIndex'),
                shapeData = galleryObject[currentGalleryIndex].shapeData;

            this.paperScope.activate();
            this.allShapesGroup.remove();
            this.allShapesGroup = new this.paperScope.Group();
            this.allShapesGroup.importJSON(shapeData);

            this.allShapesGroup.children.forEach(function (shapeGroup) {
                self._bindShapeEvents(shapeGroup.children['shape']);
            });
            this._selectBackColorElement(this.$('.' + galleryObject[currentGalleryIndex].backType.TYPE_NAME + '-color-selector'));
            this.paperScope.view.draw();
            if (selectedShapeGroupName !== '') {
                this.model.set('selectedShapeGroupName', '');
                this.selectedShapeGroup.remove();
                this.selectedShapeGroup = null;
            }
            this.model.set('shapeData', this.allShapesGroup);
            this.mainModel.set('noOfSlicedShapes', this.allShapesGroup.children.length);
            this.mainModel.set('isSaveImageButtonEnabled', false);
            this._showShapeButtons(false);
            this.canvasAcc.updatePaperItems(this.getPaperObjects());
        },

        /**
         * Draws 2D sliced shape based on co-ordinates from 3D shape
         * @method _draw2DShape
         * @private
         **/
        _draw2DShape: function _draw2DShape(event) {
            var segments = this.mainModel.get('pathCoordinates'),
                shape,
                shapeColor,
                selectedShapeGroup,
                shapeCounter;

            shapeColor = this._generateShapeColor();
            shape = new this.paperScope.Path({
                name: 'shape',
                segments: segments,
                fillColor: shapeColor,
                closed: true
            });
            shape.strokeColor = new this.paperScope.Color(0, 0, 0, 0);
            shape.position = this.paperScope.view.center;

            this._bindShapeEvents(shape);

            this._deselectShape();
            this._showShapeButtons(false);
            shapeCounter = this.model.get('shapeCounter');
            this.model.set('shapeCounter', ++shapeCounter);
            selectedShapeGroup = new this.paperScope.Group({
                children: [shape],
                name: 'shape-group-' + shapeCounter
            });


            //Not For Accessibility

            if (!event.isTrigger) {
                this.selectedShapeGroup = selectedShapeGroup;
                this._selectShape(shape, this.selectedShapeGroup);
                this._showShapeButtons(true);
                this._setShapeButtonsPosition();
            }
            this.allShapesGroup.addChild(selectedShapeGroup);
            this.canvasAcc.updatePaperItems(this.getPaperObjects());
            this.paperScope.view.draw();
        },

        /**
         * Bind mouse events for tool
         * @method _bindToolEvents
         * @private
         **/
        _bindToolEvents: function _bindToolEvents() {
            var tool = this.paperScope.tool;
            tool.off('mouseup');
            tool.on('mouseup', $.proxy(this._onToolMouseUp, this));
        },

        _onToolMouseUp: function _onToolMouseUp(event) {
            this.eventManager.trigger(eventManagerModel.ENABLE_HOVER, event);

            if (this.isCanvasRectClicked) {
                this.isCanvasRectClicked = false;
                return;
            }
            this.isMouseDownOnShape = false;
            if (!this.isMouseUpOnTranslateOrRotate) {
                this._setCursor(this.staticDataHolder.CURSOR_TYPE.DEFAULT);
            }
            if (this.isSelectedShapeDragging || this.isSelectionEndPointDragging) {
                this._showShapeButtons(true, event);

                this._setShapeButtonsPosition();
                if (this.isSelectionEndPointDragging) {
                    this._hideRotationIcon(this.lastDraggedEndPoint);
                }
            }
            this.isMouseUpOnTranslateOrRotate = this.isSelectedShapeDragging = this.isSelectionEndPointDragging = false;
            this.lastDraggedEndPoint = null;
        },

        /**
         * Bind mouse events for the shape
         * @method _bindShapeEvents
         * @private
         **/
        _bindShapeEvents: function _bindShapeEvents(shape) {
            this._unbindShapeEvents(shape);
            shape.on({
                'mouseenter': $.proxy(this._onShapeMouseEnter, this),
                'mousedown': $.proxy(this._onShapeMouseDown, this),
                'mousedrag': $.proxy(this._onShapeMouseDrag, this),
                'mouseup': $.proxy(this._onShapeMouseUp, this),
                'mouseleave': $.proxy(this._onShapeMouseLeave, this)
            });

        },

        _unbindShapeEvents: function _unbindShapeEvents(shape) {
            shape.off('mouseenter');
            shape.off('mousedown');
            shape.off('mousedrag');
            shape.off('mouseup');
            shape.off('mouseleave');
        },

        _onShapeMouseEnter: function _onShapeMouseEnter(event) {
            if (this.player.getModalPresent() === true) {
                return;
            }
            this.lastLogicalHoveredShape = event.target;
            if (this.isMouseOverShapeButtons) {
                return;
            }
            if (!this.isSelectedShapeDragging) {
                var selectedShapeGroupName = this.selectedShapeGroup === null ? '' : this.selectedShapeGroup.name;
                if (!this.isSelectionEndPointDragging && event.target.name === 'shape' && event.target.parent.name !== selectedShapeGroupName) {
                    this._scaleShape(event.target);
                }
                this._setCursor(this.staticDataHolder.CURSOR_TYPE.OPEN_HAND);
            }
        },

        _onShapeMouseDown: function _onShapeMouseDown(event) {
            if (event.event.which === 3 && event.target.name === 'shape' && this.isShapeScaled) {
                this._antiScaleShape(event.target);
            }
            if (this.browserCheck.isMobile || event.event.which === 1) {

                this.stopReading();
                var selectedShapeGroupName = this.selectedShapeGroup === null ? '' : this.selectedShapeGroup.name;
                this._setCursor(this.staticDataHolder.CURSOR_TYPE.CLOSED_HAND);
                if (event.target.name === 'shape' && event.target.parent.name !== selectedShapeGroupName) {
                    if (this.isShapeScaled) {
                        this._antiScaleShape(event.target);
                    }
                    this._deselectShape(this.selectedShapeGroup);
                    this._selectShape(event.target, event.target.parent);
                }

                event.currSelector = this.$('.right-panel-canvas-container-modal');
                this.eventManager.trigger(eventManagerModel.DISABLE_HOVER, event);

                if (!event.isAccessible) {
                    this._showShapeButtons(false, event);
                }

                this.previousDifference = this.getPointDifference(event.point, this.selectedShapeGroup.position);
                this.isMouseDownOnShape = true;
            }
        },

        _onShapeMouseDrag: function _onShapeMouseDrag(event) {
            if ((this.browserCheck.isMobile || event.event.which === 1) && this.isMouseDownOnShape) {
                var isSaveImageButtonEnabled = this.mainModel.get('isSaveImageButtonEnabled');
                this._showShapeButtons(false);
                this.selectedShapeGroup.position = this.getPointDifference(event.point, this.previousDifference);
                this.handleShapeOnBoundary(this.selectedShapeGroup, 5);
                this._setCursor(this.staticDataHolder.CURSOR_TYPE.CLOSED_HAND);
                this.isSelectedShapeDragging = true;
                if (!isSaveImageButtonEnabled) {
                    this.mainModel.set('isSaveImageButtonEnabled', true);
                }
                event.preventDefault();
            }
        },

        _onShapeMouseUp: function _onShapeMouseUp(event) {
            if ((this.browserCheck.isMobile || event.event.which === 1) && this.isMouseDownOnShape) {
                this._setCursor(this.staticDataHolder.CURSOR_TYPE.OPEN_HAND);
                //if (this.isMouseDownOnShape) {
                this._showShapeButtons(true);
                this._setShapeButtonsPosition();
                //}
                if (this.isShapeScaled) {
                    this._antiScaleShape(event.target);
                }
                this.isMouseUpOnTranslateOrRotate = true;
                this.isSelectedShapeDragging = false;
                this.isMouseDownOnShape = false;
            }
        },

        _onShapeMouseLeave: function _onShapeMouseLeave(event) {
            if (this.player.getModalPresent() === true) {
                return;
            }
            this.lastLogicalHoveredShape = null;
            if (this.isMouseOverShapeButtons) {
                return;
            }
            var selectedShapeGroupName = this.selectedShapeGroup === null ? '' : this.selectedShapeGroup.name;
            this._setCursor(this.staticDataHolder.CURSOR_TYPE.DEFAULT);
            if (!this.isSelectedShapeDragging && !this.isSelectionEndPointDragging && event.target.name === 'shape' && event.target.parent.name !== selectedShapeGroupName) {
                if (this.isShapeScaled) {
                    this._antiScaleShape(event.target);
                }
            }
        },

        /**
         * Scales the shape big 
         * @method _scaleShape
         * @param {Object} shape Shape to scale
         * @private
         **/
        _scaleShape: function _scaleShape(shape) {
            shape.scale(this.staticDataHolder.SHAPE_HOVER_SCALE);
            shape.strokeWidth = 2;
            shape.strokeColor = this.model.get('backgroundType') === this.staticDataHolder.BACKGROUND_TYPE.WHITE ? this.staticDataHolder.BACKGROUND_TYPE.GRAY.TYPE_COLOR : this.staticDataHolder.BACKGROUND_TYPE.WHITE.TYPE_COLOR;
            this.isShapeScaled = true;
        },

        /**
         * Scales the shape small
         * @method _antiScaleShape
         * @param {Object} shape Shape to scale
         * @private
         **/
        _antiScaleShape: function _antiScaleShape(shape) {
            shape.scale(1 / this.staticDataHolder.SHAPE_HOVER_SCALE);
            shape.strokeWidth = 1;
            shape.strokeColor = new this.paperScope.Color(0, 0, 0, 0);
            this.isShapeScaled = false;
        },

        /**
         * Bind mouse events for the translate icon
         * @method _bindTranslateIconEvents
         * @private
         **/
        _bindTranslateIconEvents: function _bindTranslateIconEvents(translateIcon) {
            this._unbindTranslateIconEvents(translateIcon);
            translateIcon.on({
                'mouseenter': $.proxy(this._onShapeMouseEnter, this),
                'mousedown': $.proxy(this._onShapeMouseDown, this),
                'mousedrag': $.proxy(this._onShapeMouseDrag, this),
                'mouseup': $.proxy(this._onShapeMouseUp, this),
                'mouseleave': $.proxy(this._onShapeMouseLeave, this)
            });
        },

        _unbindTranslateIconEvents: function _unbindTranslateIconEvents(translateIcon) {
            translateIcon.off('mouseenter');
            translateIcon.off('mousedown');
            translateIcon.off('mousedrag');
            translateIcon.off('mouseup');
            translateIcon.off('mouseleave');
        },
        /**
         * Layers the shape appropriately so that any deselected shape is not covered completely by another shape
         * @method _checkLayering
         * @private
         **/
        _checkLayering: function _checkLayering() {
            var self = this,
                isSaveImageButtonEnabled = this.mainModel.get('isSaveImageButtonEnabled'),
                shape = this.selectedShapeGroup.children['shape'],
                anotherShape,
                shapeGroupsToBring = [];

            if (shape.fillColor.alpha < 0.75) {
                return;
            }
            this.allShapesGroup.children.forEach(function (shapeGroup) {
                if (self.selectedShapeGroup.name !== shapeGroup.name) {
                    shape = self.selectedShapeGroup.children['shape'];
                    anotherShape = shapeGroup.children['shape'];
                    if (self.checkIntersections(shape, anotherShape) && Math.abs(shape.area) > Math.abs(anotherShape.area) && shape.contains(anotherShape.position)) {
                        shapeGroupsToBring.push(shapeGroup);
                    }
                }
            });
            shapeGroupsToBring.forEach(function (shapeGroup) {
                shapeGroup.bringToFront();
            });
            if (shapeGroupsToBring.length > 0 && !isSaveImageButtonEnabled) {
                this.mainModel.set('isSaveImageButtonEnabled', true);
            }
            this.paperScope.view.draw();
        },

        checkIntersections: function checkIntersections(shape1, shape2) {
            var intersections = shape1.getIntersections(shape2),
                noOfIntersections = intersections.length,
                max = shape1.area;

            return !noOfIntersections;
            /*
            if ((noOfIntersections === 0) ||
               (Math.round((shape2.unite(shape1)).area) <= Math.round(Math.abs(max)))) {
                return true;
            }

            return false;
            */
        },

        /**
         * Deselects the selected shape
         * @method _deselectShape
         * @private
         **/
        _deselectShape: function _deselectShape() {
            if (this.selectedShapeGroup !== null) {
                this._checkLayering();
                this.selectedShapeGroup.removeChildren(1);
                this.selectedShapeGroup = null;
            }
            this.paperScope.view.draw();
            this.model.set('selectedShapeGroupName', '');
        },

        /**
         * Selects the selected shape given shape and its group
         * @method _selectShape
         * @param {Object} shape Paper.js shape object
         * @param {Object} parentGroup Paper.js group of shape
         * @private
         **/
        _selectShape: function _selectShape(shape, parentGroup) {
            var isSaveImageButtonEnabled = this.mainModel.get('isSaveImageButtonEnabled'),
                selectionGroup,
                selectionPointsGroup,
                shapeBoundary,
                translateIcon;

            translateIcon = this._createTranslateIcon();

            shapeBoundary = this._drawShapeBoundary(shape);
            selectionPointsGroup = this._drawShapeSelectionEndPoints(shape);
            translateIcon.position = shapeBoundary.position;
            selectionGroup = new this.paperScope.Group({
                children: [translateIcon, shapeBoundary, selectionPointsGroup],
                name: 'selection-group'
            });

            parentGroup.addChild(selectionGroup);
            this.selectedShapeGroup = parentGroup;
            this.selectedShapeGroup.bringToFront();
            this.paperScope.view.draw();
            this.$('.color-picker-button-container').css({
                'background-color': shape.fillColor.toCSS()
            });
            this.paperScope.view.draw();

            if (!isSaveImageButtonEnabled) {
                this.mainModel.set('isSaveImageButtonEnabled', true);
            }
            this.model.set('selectedShapeGroupName', this.selectedShapeGroup.name);
        },

        /**
         * Draws the rectangular selection boundary around shape
         * @method _drawShapeBoundary
         * @param {Object} shape Paper.js shape object for which boundary is to be drawn
         * @return {Object} Paper.js object of shape boundary
         * @private
         **/
        _drawShapeBoundary: function _drawShapeBoundary(shape) {
            var dummyGroup = new this.paperScope.Group([shape.clone()]),
                shapeBoundary = new this.paperScope.Path.Rectangle({
                    name: 'shape-boundary',
                    point: dummyGroup.bounds.point,
                    size: dummyGroup.bounds.size,
                    strokeColor: '#999695',
                    strokeWidth: 2,
                    dashArray: [0.4, 5],
                    strokeCap: 'round',
                });
            dummyGroup.remove();
            return shapeBoundary;
        },

        _handleShapeDeselectEvent: function _handleShapeDeselectEvent(event) {
            this._deselectShape();
            this._showShapeButtons(false);
        },

        /**
         * Draws the circular end points on shape boundary corners
         * @method _drawShapeSelectionEndPoints
         * @param {Object} shape Paper.js shape object for which selection end points is to be drawn
         * @return {Object} Paper.js object of selection end points group
         * @private
         **/
        _drawShapeSelectionEndPoints: function _drawShapeSelectionEndPoints(shape) {
            var dummyGroup = new this.paperScope.Group([shape.clone()]),
                selectionPointsGroup = new this.paperScope.Group({
                    name: 'selection-points-group'
                }),
                endPointsGroup = new this.paperScope.Group({
                    name: 'end-points-group'
                }),
                selectionEndPoints = [],
                gradientColor = this.staticDataHolder.GRADIENT_COLOR,
                rotationIconGroup;

            for (var i = 0; i < 4; i++) {
                selectionEndPoints[i] = new this.paperScope.Path.Circle({
                    name: 'end-point-' + i,
                    radius: 8,
                    strokeWidth: 2,
                    strokeColor: '#FFFFFF',
                    center: new this.paperScope.Point(0, 0),
                    shadowColor: new this.paperScope.Color(0, 0, 0),
                    shadowBlur: 3,
                    shadowOffset: new this.paperScope.Point(3, 3)
                });
                selectionEndPoints[i].shadowColor.alpha = 0.33;
                this._changeHoverState(gradientColor[0], gradientColor[1], selectionEndPoints[i]);
            }

            selectionEndPoints[0].position = dummyGroup.bounds.topRight;
            selectionEndPoints[1].position = dummyGroup.bounds.bottomRight;
            selectionEndPoints[2].position = dummyGroup.bounds.bottomLeft;
            selectionEndPoints[3].position = dummyGroup.bounds.topLeft;
            endPointsGroup.addChildren(selectionEndPoints);
            rotationIconGroup = this._createRotationIcons(endPointsGroup);
            selectionPointsGroup.addChildren([endPointsGroup, rotationIconGroup]);

            if (this.browserCheck.isMobile === true) {
                var touchSelectionEndPoints = [],
                    touchEndPointsGroup = new this.paperScope.Group({
                        name: 'touch-end-points-group'
                    });
                for (var i = 0; i < 4; i++) {
                    touchSelectionEndPoints[i] = new this.paperScope.Path.Circle({
                        name: 'touch-end-point-' + i,
                        radius: 20,
                        center: selectionEndPoints[i].position,
                        fillColor: '#FFFFFF'
                    });
                }
                touchEndPointsGroup.addChildren(touchSelectionEndPoints);
                selectionPointsGroup.addChild(touchEndPointsGroup);
                touchEndPointsGroup.opacity = 0;
                this._bindSelectionEndPointEvents(touchEndPointsGroup);

            }
            else {
                this._bindSelectionEndPointEvents(endPointsGroup);
            }
            endPointsGroup.bringToFront();

            dummyGroup.remove();
            return selectionPointsGroup;
        },

        _createTranslateIcon: function _createTranslateIcon() {
            var translateIcon = new this.paperScope.Raster({
                name: 'translate-icon',
                source: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA+ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxNS0wMi0yM1QxNDoxMTo1NyswNTozMCIgeG1wOk1vZGlmeURhdGU9IjIwMTUtMDItMjNUMTQ6MTI6MzUrMDU6MzAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTUtMDItMjNUMTQ6MTI6MzUrMDU6MzAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkVBN0M2RTIxQkIzNzExRTRCODEzRjdBNTFEODRBRUFBIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkVBN0M2RTIyQkIzNzExRTRCODEzRjdBNTFEODRBRUFBIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RUE3QzZFMUZCQjM3MTFFNEI4MTNGN0E1MUQ4NEFFQUEiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RUE3QzZFMjBCQjM3MTFFNEI4MTNGN0E1MUQ4NEFFQUEiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5FnqOiAAAGbElEQVR42sRZW0gcZxTe2dmbl3g33lJj1uyiG6IkijUqlDyI9EVcpX0pFaG6brIIPvRB+qQPgUKeSmnS5k3EazTkoUL6YLWgLUlbihqk8VIpYr00rnfd62y/Y2ZkMp1Zdd3oD4fZ/zLzf3Mu3zn/LBMZGakKY9NBPCe5YXd3N+i85rSIhA2ioqKuoFXOz89PozuF8b/D8cbqcDwE4MzXr1+vHhwctE9OTt7H0G2MFYXj2UwYTGwuKCio7Ovru5uamnqFBjwez358fPxdXpMvzlOD5pKSEivAOQRwB46o00Wsr69/g5+W02ryNACzi4qKqjo6OuwAl/W/aNHpIsMBMlSA2cXFxTUA95kcuHCCDAVgDHzO2t7eXn/p0iXzkbzzBuRDHqThLABa7t27Vw5wpiBrAhKQhidPnlTTvSfdLBQenGpoaBgcGhq6EhEREb2xseHUaDRsZmZmjrBgf39/Z29vb3MHDRHtjo2NTRgZGXmFqaWzopmraWlpH3IcF1hZWZnT6/WXX79+/bVardbwNLN38+bNL0DaswkJCVnoc263m/N6vY9AO4F3rUFqs0tLSw/5334AtWFzD4AePA99P/zOi5/PnE6nYPLAScEdByCpNwKyJjPnE56RlJSkY1lWK/Ztv9+v4kFxCtmHxSUd8wuhAsymaDWbzbHd3d0/oD+qFGgGg0ENrZHGDkAyDKMKoAVJjWxcXFyjw+HIwe/nfMb5Q15F8EEZuVpaWvr5wsLCK9qopaXlPsbSFNaqoUG7y+XaDfANQbKFKHdgjiWcUsG4paurq5PWbm9vr6NfBymSWytHM+bCwkJrb2+vXeC5vLy8dFzilTQC8yI+1KxYqxRAQayjR2QfRGd0dHRcMDKXAjTduHGjksBlZGRkH/oBGr9WWM+In4FNSFP+Q2qAiaFF8j1O5G/ixvl8Pu44GUfsgybkVmtnZ2cj0pdRvGh1dXWTHBpmKAO/TSBa80AbMxhzkyBSvWKfA0A15l3Qqg0bzsHfzLiSj7F8UUsvrZZLi6iCHFirEqoggQdNyK1W5FZbenp6tlTNALC0tra2Cq4jzgggKPTUwMO7JNB2alZWVg6GDkn15cuXL7B+DS97ERTk29ra2gEILcid0l0AUc7l5+ffku5FHEog8XMSIH8nh9Wh2GxeXFycCxzduBPOKa7nyEkVGoBtAtenQpCw5EPQnPE4meeEc4rrGXJUhUYpFBeDECT74+Pjzx8/ftyrdAPM4YOZ3EKW4IU0cODocHivxEwuWkO/cZ/rMDI4zsff6wu219OnTweIG8VB8nNdXZ0KTs3U1NR8LL1pYGCgH3l1LSYmRo/iAAG674MfakBDcfC1Zbyxtq2trVl8D4Kte2Ji4h8qJGCdGID2InD8y8vLO7m5uckVFRW3jEbjtbdCG8BR9QwAy1fo/iolapaitL+/v1fqE0SqRK5E4JBMSAbkPbhGI66pRNR0DhHWI3A2hTme4I2QLLoHchFyraenp0u6D+itG3MlRP4CUYtphkzyS21t7UFHrEnSLO9Ps5I3/o58GNpkxT5FnAhts9D2v3B4v0yqy8RLxYrHcK7psdlsI4RBXFRIc7EU5EcEjMwUpLhl8AIqceYguoHZCaBSIFDpJfhtAO7Q1dTUNCpXjskVC4cgyW/Ky8s/GBsbmye+DhbecG6vEHlkLnCgh3+WbNHb3Nz8I4rY/OHh4TFo7luMjcmVY0rVDD14tL6+3mkymX6bmZmhamZFqbxHFAe0Wq1OFMW76DPQCCMt//mvES6Y+VlZWVkAdeUQ+lOh1oNTADfHpzRFSoNJ1ZTeRLlbn5iYqENaZIV8LANyGiD/wtV32orarXDYSqV9CCAFAvGdULQSQJRqO2/iIYrWarBmVQak712U/GrQgK2xsdE0PT29AVAMcaJYgxTFyO1JycnJTcSRKK10APo9AI2exanO8uDBg9tVVVWVQnDA3yLEmQt9A059X8LE2/QZBBrV4qoGyFmAXH7X52InMsQigSBBuwAtaoQTneTEGEPgKC1aLJaLGIs98W4KZfxRIptx5Boi3CNkCLmS/igJFSB7HJBkfh7cLQhzlgCPBElVC81Jc+tZAgwKktdcqdLJ7rhy2m/Ub+Vuq9VaTcFCid9ut//EJ37uXD8B00d0/tT2fmtr6ycpKSkX7ty580gpt57HN2pxu8x/KvkzXH9D/CfAAG20D/7LQbYhAAAAAElFTkSuQmCC'
            });
            this._bindTranslateIconEvents(translateIcon);
            return translateIcon;
        },

        /*  It sets the hover color to the Circle
        *
        * @method _changeHoverState 
        * @param color1 {String} color code
        * @param color2 {String} color code
        * @param context {Object} object of circle
        * @private
        */
        _changeHoverState: function (color1, color2, context) {

            context.fillColor = {
                gradient: {
                    stops: [color1, color2]
                },
                origin: context.bounds.bottomRight,
                destination: context.bounds.topLeft
            };
        },

        /**
         * Creates the roation icons for each end point
         * @method _createRotationIcons
         * @param {Object} endPointsGroup Selection end points group
         * @return {Object} Paper.js object of roation icons group 
         * @private
         **/
        _createRotationIcons: function _createRotationIcons(endPointsGroup) {
            var rotationIcons = [],
                rotationIconGroup = new this.paperScope.Group({
                    name: 'rotation-icon-group'
                });

            this.rasterCircle = new this.paperScope.Raster({
                source: this.rasterCircleSource
            });
            this.rasterSymbol = new this.paperScope.Symbol(this.rasterCircle);

            for (var i = 0; i < 4; i++) {
                rotationIcons[i] = this.rasterSymbol.place();
                rotationIcons[i].name = 'rotation-icon-' + i;
                rotationIcons[i].rotate(i * 90);
                rotationIcons[i].opacity = 0;
                rotationIcons[i].guide = true;
            }
            rotationIcons[0].position = endPointsGroup.children[0].bounds.topRight;
            rotationIcons[1].position = endPointsGroup.children[1].bounds.bottomRight
            rotationIcons[2].position = endPointsGroup.children[2].bounds.bottomLeft;
            rotationIcons[3].position = endPointsGroup.children[3].bounds.topLeft;
            rotationIconGroup.addChildren(rotationIcons);

            this.rasterCircle.remove();
            return rotationIconGroup;
        },

        /**
         * Removes the roation icons for each end point
         * @method _removeRotationIcons
         * @param {Object} rotationIconGroup rotation icons group
         * @private
         **/
        _removeRotationIcons: function _removeRotationIcons(rotationIconGroup) {
            if (rotationIconGroup !== null) {
                rotationIconGroup.removeChildren();
                rotationIconGroup = null;
            }
            this.paperScope.view.draw();
        },

        /**
         * Shows roation icon for corresponding end point
         * @method _showRotationIcon
         * @param {Object} endPoint Selection end point
         * @private
         **/
        _showRotationIcon: function _showRotationIcon(endPoint) {
            //   endPoint.parent.parent.children['rotation-icon-group'].children[endPoint.index].opacity = 1;
            endPoint.parent.parent.getItems({ 'name': 'rotation-icon-group' })[0].children[endPoint.index].opacity = 1;
        },

        /**
         * Hides roation icon for corresponding end point
         * @method _hideRotationIcon
         * @param {Object} endPoint Selection end point
         * @private
         **/
        _hideRotationIcon: function _hideRotationIcon(endPoint) {
            //endPoint.parent.parent.children['rotation-icon-group'].children[endPoint.index].opacity = 0;
            endPoint.parent.parent.getItems({ 'name': 'rotation-icon-group' })[0].children[endPoint.index].opacity = 0;
        },

        /**
         * Bind mouse events for the selection end points
         * @method _bindSelectionEndPointEvents
         * @private
         **/
        _bindSelectionEndPointEvents: function _bindSelectionEndPointEvents(selectionEndPointsGroup) {
            this._unbindSelectionEndPointEvents(selectionEndPointsGroup);
            selectionEndPointsGroup.on({
                'mouseenter': $.proxy(this._onSelectionEndPointMouseEnter, this),
                'mousedown': $.proxy(this._onSelectionEndPointMouseDown, this),
                'mousedrag': $.proxy(this._onSelectionEndPointMouseDrag, this),
                'mouseup': $.proxy(this._onSelectionEndPointMouseUp, this),
                'mouseleave': $.proxy(this._onSelectionEndPointMouseLeave, this)
            });
        },

        _unbindSelectionEndPointEvents: function _unbindSelectionEndPointEvents(selectionEndPointsGroup) {
            selectionEndPointsGroup.off('mouseenter');
            selectionEndPointsGroup.off('mousedown');
            selectionEndPointsGroup.off('mousedrag');
            selectionEndPointsGroup.off('mouseup');
            selectionEndPointsGroup.off('mouseleave');
        },
        _onSelectionEndPointMouseEnter: function _onSelectionEndPointMouseEnter(event) {
            if (this.player.getModalPresent() === true || this.isSelectedShapeDragging || this.isSelectionEndPointDragging) {
                return;
            }
            var endPoint = this.browserCheck.isMobile === true ? event.target.parent.parent.getItems({ 'name': 'end-points-group' })[0].children[event.target.index] : event.target,
                gradientColor = this.staticDataHolder.GRADIENT_COLOR;

            this._changeHoverState(gradientColor[1], gradientColor[0], endPoint);
            this._setCursor(this.staticDataHolder.CURSOR_TYPE.OPEN_HAND);
            this._showRotationIcon(endPoint);
        },

        _onSelectionEndPointMouseDown: function _onSelectionEndPointMouseDown(event) {
            if (this.browserCheck.isMobile || event.event.which === 1) {

                event.currSelector = this.$('.right-panel-canvas-container-modal');
                this.eventManager.trigger(eventManagerModel.DISABLE_HOVER, event);

                this.stopReading();
                this._setCursor(this.staticDataHolder.CURSOR_TYPE.CLOSED_HAND);
                this._showShapeButtons(false);
                var endPoint = event.target.parent.children[event.target.index];
                this._showRotationIcon(endPoint);

            }
        },

        _onSelectionEndPointMouseDrag: function _onSelectionEndPointMouseDrag(event) {
            if (this.browserCheck.isMobile || event.event.which === 1) {

                var endPoint = this.browserCheck.isMobile === true ? event.target.parent.parent.getItems({ 'name': 'end-points-group' })[0].children[event.target.index] : event.target,
                    rotationPoint = this.selectedShapeGroup.position,
                    angle = event.angleOfRotation || this.getRotationAngle(endPoint.position, rotationPoint, event.point),
                    isSaveImageButtonEnabled = this.mainModel.get('isSaveImageButtonEnabled');
                this._showShapeButtons(false);
                this.selectedShapeGroup.rotate(angle, rotationPoint);
                //if (this.isShapeOutOfBounds(this.selectedShapeGroup, -10)) {
                //    this.selectedShapeGroup.rotate(-angle, rotationPoint);
                //}
                this._setCursor(this.staticDataHolder.CURSOR_TYPE.CLOSED_HAND);
                this.isSelectionEndPointDragging = true;
                this.lastDraggedEndPoint = endPoint;
                if (!isSaveImageButtonEnabled) {
                    this.mainModel.set('isSaveImageButtonEnabled', true);
                }
                event.preventDefault();
            }
        },

        _onSelectionEndPointMouseUp: function _onSelectionEndPointMouseUp(event) {
            if (this.browserCheck.isMobile || event.event.which === 1) {

                this._setCursor(this.staticDataHolder.CURSOR_TYPE.OPEN_HAND);
                this._showShapeButtons(true);
                if (this.isSelectionEndPointDragging) {
                    this._setShapeButtonsPosition();
                }
                this.isMouseUpOnTranslateOrRotate = true;
                this.isSelectionEndPointDragging = false;
                this.lastDraggedEndPoint = null;
                var endPoint = event.target.parent.parent.getItems({ 'name': 'end-points-group' })[0].children[event.target.index];
                this._hideRotationIcon(endPoint);

            }
        },

        _onSelectionEndPointMouseLeave: function _onSelectionEndPointMouseLeave(event) {
            if (this.player.getModalPresent() === true || this.isSelectedShapeDragging || this.isSelectionEndPointDragging) {
                return;
            }
            var endPoint = this.browserCheck.isMobile === true ? event.target.parent.parent.getItems({ 'name': 'end-points-group' })[0].children[event.target.index] : event.target,
                gradientColor = this.staticDataHolder.GRADIENT_COLOR;

            this._changeHoverState(gradientColor[0], gradientColor[1], endPoint);
            this._setCursor(this.staticDataHolder.CURSOR_TYPE.DEFAULT);
            this._hideRotationIcon(endPoint);
        },

        /**
         * Returns the angle with which a component is to be rotated
         *
         * @method getRotationAngle
         * @param {Object} movingPoint The point with which the component is rotated
         * @param {Object} fixedPoint The point around which the component is rotated
         * @param {Object} newPoint The new event point where the movingpoint currently lies
         * @return {Number} Angle in degree
         * @public
         **/
        getRotationAngle: function getRotationAngle(movingPoint, fixedPoint, newPoint) {
            var dx1 = movingPoint.x - fixedPoint.x,
                dx2 = newPoint.x - fixedPoint.x,
                dy1 = movingPoint.y - fixedPoint.y,
                dy2 = newPoint.y - fixedPoint.y,
                angle = Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1);

            angle = angle * 180 / Math.PI;
            return angle;
        },

        /**
         * Calculates x and y difference between point1 and point2
         *     
         * @method getPointDifference
         * @param point1 {Object} point 1
         * @param point2 {Object} point 2
         * @return {Object} Point object as {x: <diffX> , y: <diffY>}
         * @public
         **/
        getPointDifference: function getPointDifference(point1, point2) {
            return { x: (point1.x - point2.x), y: (point1.y - point2.y) };
        },

        /**
        * Checks whether the shape goes beyond any bound or not
        * @method isShapeOutOfBounds
        * @param {Object} shape Paper.js Shape object
        * @param {Number} offset Offset to consider for each bound
        * @return {Boolean} True if the shape goes beyond any bound otherwise false
        * @public
        **/
        isShapeOutOfBounds: function isShapeOutOfBounds(shape, offset) {
            if (offset === undefined || offset === null) {
                offset = 0;
            }
            var minX = this.staticDataHolder.CANVAS_AREA.X + offset,
                minY = this.staticDataHolder.CANVAS_AREA.Y + offset,
                maxX = this.staticDataHolder.CANVAS_AREA.X + this.staticDataHolder.CANVAS_AREA.WIDTH - offset,
                maxY = this.staticDataHolder.CANVAS_AREA.Y + this.staticDataHolder.CANVAS_AREA.HEIGHT - offset,
                dummyGroup = new this.paperScope.Group([shape.clone()]),
                dummyBounds = dummyGroup.bounds,
                isShapeOutOfBounds = dummyBounds.x < minX || dummyBounds.y < minY || dummyBounds.right > maxX || dummyBounds.bottom > maxY;

            dummyGroup.remove();
            return isShapeOutOfBounds;
        },

        handleShapeOnBoundary: function handleShapeOnBoundary(shape, offset) {
            if (offset === undefined || offset === null) {
                offset = 0;
            }
            var validPoint = true,
                minX = this.staticDataHolder.CANVAS_AREA.X + offset,
                minY = this.staticDataHolder.CANVAS_AREA.Y + offset,
                maxX = this.staticDataHolder.CANVAS_AREA.X + this.staticDataHolder.CANVAS_AREA.WIDTH - offset,
                maxY = this.staticDataHolder.CANVAS_AREA.Y + this.staticDataHolder.CANVAS_AREA.HEIGHT - offset,
                diffX = 0,
                diffY = 0,
                boundaryId,
                dummyGroup = new this.paperScope.Group([shape.clone()]),
                dummyBounds = dummyGroup.bounds;

            if (shape.position.x < minX) {
                diffX = minX - shape.position.x;
                validPoint = false;
                boundaryId = 13;
            }
            else if (shape.position.x > maxX) {
                diffX = maxX - shape.position.x;
                validPoint = false;
                boundaryId = 12;
            }
            if (shape.position.y < minY) {
                diffY = minY - shape.position.y;
                validPoint = false;
                boundaryId = 14;
            }
            else if (shape.position.y > maxY) {
                diffY = maxY - shape.position.y;
                validPoint = false;
                boundaryId = 15;
            }
            shape.translate(diffX, diffY);
            dummyGroup.remove();

            this.boundaryCheck = validPoint;
            if (!validPoint) {
                this.changeAccMessage('right-panel-canvas-acc-container', 6, [this.getAccMessage('right-panel-canvas-acc-container', boundaryId)]);
                this._setFocusOnCanvas();
            }

            return validPoint;
        },

        /**
         * generates color picker
         * @method generateColorPicker
         * @public
         */
        generateColorPicker: function generateColorPicker(shape) {
            var
            shapeLeft = shape.bounds.left,
            canvasLeft = this.player.$('.explore-tab-right-part-container').position().left,
            colorPickerWidth = this.staticDataHolder.COLOR_PICKER.WIDTH,
            fixedOffset = this.staticDataHolder.COLOR_PICKER_OFFSET,
            position = {
                left: canvasLeft + shapeLeft - colorPickerWidth - fixedOffset,
                top: this.staticDataHolder.COLOR_PICKER_FIXED_TOP
            },
            option = {
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                filePath: this.filePath,
                eventManager: this.eventManager,
                color: shape.fillColor.toCSS(),
                position: position
            };

            this.colorPickerView = MathInteractives.Common.Interactivities.ShapeSlicer.Views.ColorPicker.createColorPicker(option);
            this.colorPickerView.off(colorPickerClassName.EVENTS.COLOR_CHANGE, $.proxy(this._setShapeColor))
                                .off(colorPickerClassName.EVENTS.ALPHA_CHANGE, $.proxy(this._setShapeColor))
                                .off(colorPickerClassName.EVENTS.ENABLE_HELP, $.proxy(this._enableAllHelpElements))
                                .off(colorPickerClassName.EVENTS.CLOSE_COLOR_PICKER, $.proxy(this._colorPickerClosed))
                                .on(colorPickerClassName.EVENTS.COLOR_CHANGE, $.proxy(this._setShapeColor, this))
                                .on(colorPickerClassName.EVENTS.ALPHA_CHANGE, $.proxy(this._setShapeColor, this))
                                .on(colorPickerClassName.EVENTS.ENABLE_HELP, $.proxy(this._enableAllHelpElements, this))
                                .on(colorPickerClassName.EVENTS.CLOSE_COLOR_PICKER, $.proxy(this._colorPickerClosed, this));

        },

        /**
         * Shows whoops pop-up when number of images in gallery exceeds the limit
         * @method _createWhoopsPopUp
         * @private
         */
        _createWhoopsPopUp: function _createWhoopsPopUp() {
            var popupOptions = {
                manager: this.manager,
                path: this.filePath,
                player: this.player,
                idPrefix: this.idPrefix,
                title: this.getMessage('whoops-popup', 0),
                accTitle: this.getAccMessage('whoops-popup', 0),
                text: this.getMessage('whoops-popup', 1),
                accText: this.getAccMessage('whoops-popup', 1),
                type: MathInteractives.global.Theme2.PopUpBox.CONFIRM,
                buttons: [{
                    id: 'view-button',
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    text: this.getMessage('popup-button-text', 2),
                    response: {
                        isPositive: true,
                        buttonClicked: 'view-button'
                    }
                }, {
                    id: 'cancel-button',
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    width: 148,
                    text: this.getMessage('popup-button-text', 1),
                    response: {
                        isPositive: false,
                        buttonClicked: 'cancel-button'
                    }
                }],
                closeCallback: {
                    fnc: function (response) {
                        if (response.isPositive) {
                            this.goToGalleryTab();
                            this.setFocus('gallery-tab-direction-text-container-direction-text-text');
                        }
                        else {
                            this.setFocus('view-gallery-button-container');
                        }
                    },
                    scope: this
                }
            };
            this.whoopsPopup = MathInteractives.global.Theme2.PopUpBox.createPopup(popupOptions);
            this.updateFocusRect('theme2-pop-up-text');
            this.setFocus('theme2-pop-up-title-text');
        },

        destroy: function destroy() {
            this.staticDataHolder = null;
            this.browserCheck = null;
            this.utils = null;
            this.mainModel = null;
            this.colorPickerBtnView = null;
            this.trashBtnView = null;
            this.clearBtnView = null;
            this.saveImageBtnView = null;
            this.viewGalleryBtnView = null;
            this.$canvas = null;
            this.paperScope = null;
            this.allShapesGroup = null;
            this.selectedShapeGroup = null;
            this.rasterCircleSource = null;
            this.rasterCircle = null;
            this.rasterSymbol = null;
            this.canvasRect = null;
            this.isCanvasRectClicked = null;
            this.isMouseDownOnShape = null;
            this.isMouseUpOnTranslateOrRotate = null;
            this.isSelectedShapeDragging = null;
            this.isSelectionEndPointDragging = null;
            this.isShapeScaled = null;
            this.isMouseOverShapeButtons = null;
            this.lastLogicalHoveredShape = null;
            this.lastDraggedEndPoint = null;
            this.previousDifference = null;
            this.whoopsPopup = null;
            this.eventManager = null;
        },

        /**
        * Disables all help elements
        *
        * @method _disableAllHelpElements
        * @private
        **/
        _disableAllHelpElements: function () {
            var player = this.player;
            player.enableHelpElement('shape-buttons-panel', 0, false);
            player.enableHelpElement('reset-button-container', 0, false);
            player.enableHelpElement('rotate-about-y-axis-button-container', 0, false);
            player.enableHelpElement('left-canvas-container', 0, false);
            player.enableHelpElement('right-panel-canvas-container', 0, false);
            player.enableHelpElement('save-image-button-container', 0, false);
            player.enableHelpElement('clear-button-container', 0, false);
            player.enableHelpElement('view-gallery-button-container', 0, false);
            player.enableHelpElement('background-color-selector-container', 0, false);
            player.enableHelpElement('color-picker-button-container', 0, false);
            player.enableHelpElement('trash-button-container', 0, false);
            player.enableHelpElement('explore-tab-direction-text-direction-text-buttonholder', 0, false);
        },
        /**
        * Enables help elements
        *
        * @method _enableAllHelpElements
        * @private
        **/
        _enableAllHelpElements: function () {
            var player = this.player;
            player.enableHelpElement('shape-buttons-panel', 0, true);
            player.enableHelpElement('reset-button-container', 0, true);
            player.enableHelpElement('rotate-about-y-axis-button-container', 0, true);
            player.enableHelpElement('left-canvas-container', 0, true);
            player.enableHelpElement('right-panel-canvas-container', 0, true);
            player.enableHelpElement('save-image-button-container', 0, true);
            player.enableHelpElement('clear-button-container', 0, true);
            player.enableHelpElement('view-gallery-button-container', 0, true);
            player.enableHelpElement('background-color-selector-container', 0, true);
            player.enableHelpElement('color-picker-button-container', 0, true);
            player.enableHelpElement('trash-button-container', 0, true);
            player.enableHelpElement('explore-tab-direction-text-direction-text-buttonholder', 0, true);
        },

        _colorPickerClosed: function _colorPickerClosed(event) {
            this.eventManager.trigger(eventManagerModel.ENABLE_BUTTON_ON_COLOR_PICKER);
            this.colorPickerView = null;
            this.changeAccMessage('right-panel-canvas-acc-container', 11, [this.canvasAcc.getCurrentPaperItemIndex() + 1]);
            this.setFocus('right-panel-canvas-acc-container');
        },
        /**
         * go to Gallery tab
         * @method goToGalleryTab
         * @public
         */
        goToGalleryTab: function () {
            this.player.switchToTab(2);
        },



        /*------ canvas accessibility ----*/
        /**
        * Loads the canvas
        *
        * @method _loadCanvasForAcc
        * @private
        */
        _loadCanvasForAcc: function _loadCanvasForAcc() {
            var self = this;
            this._initAccessibility();
            this._bindAccessibilityListeners();
        },

        /**
        * Initializes accessibility
        *
        * @method _initAccessibility
        * @private
        */
        _initAccessibility: function _initAccessibility() {
            if (this.canvasAcc) {
                this.canvasAcc.unbind();
                this.canvasAcc.model.destroy();
            }
            var canvasAccOption = {
                canvasHolderID: this.idPrefix + 'right-panel-canvas-acc-container',
                paperItems: [],
                paperScope: this.paperScope,
                manager: this.manager,
                player: this.player
            };

            this.canvasAcc = MathInteractives.global.CanvasAcc.intializeCanvasAcc(canvasAccOption);
            this.canvasAcc.updatePaperItems(this.getPaperObjects());
        },

        /**
        * Binds Keys on Canvas
        *
        * @method _bindAccessibilityListeners
        * @private
        */
        _bindAccessibilityListeners: function _bindAccessibilityListeners() {
            var self = this,
                keyEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS,
                keyUpEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEYUP_EVENTS,
                canvasEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_EVENTS,
                $canvasHolder = this.$('#' + this.idPrefix + 'right-panel-canvas-acc-container');

            this._bindSpaceForAccessibility();
            // Handle tab
            $canvasHolder.off(keyEvents.TAB).on(keyEvents.TAB, function (event, data) {
                if (self.mainModel.get('noOfSlicedShapes') > 0) {
                    self._tabKeyPressed(event, data);
                    $canvasHolder.off('keyup.shapeButtons').on('keyup.shapeButtons', $.proxy(self._handleKeyUpEvent, self));
                }
            });

            // Handle focus out
            $canvasHolder.off(canvasEvents.FOCUS_OUT).on(canvasEvents.FOCUS_OUT, function (event, data) {
                self._focusOut(event, data);
                $canvasHolder.off('keyup.shapeButtons');
            });

            $canvasHolder.off(keyEvents.ARROW).on(keyEvents.ARROW, function (event, data) {
                if (self.mainModel.get('noOfSlicedShapes') > 0) {
                    self._arrowKeyPressed(event, data);
                    $canvasHolder.off(keyUpEvents.ARROW_KEYUP).on(keyUpEvents.ARROW_KEYUP, function (event, data) {
                        if (self.mainModel.get('noOfSlicedShapes') > 0) {
                            self._handleOnArrowKeyUp(event, data);
                            $canvasHolder.off(keyUpEvents.ARROW_KEYUP);
                        }
                    });
                }
            });

            $canvasHolder.off(keyEvents.ROTATE_CLOCKWISE).on(keyEvents.ROTATE_CLOCKWISE, function (event, data) {
                if (self.mainModel.get('noOfSlicedShapes') > 0) {
                    self._rotateShape(event, data, true);
                    self._bindRotationUp();
                }

            });
            $canvasHolder.off(keyEvents.ROTATE_ANTI_CLOCKWISE).on(keyEvents.ROTATE_ANTI_CLOCKWISE, function (event, data) {
                if (self.mainModel.get('noOfSlicedShapes') > 0) {
                    self._rotateShape(event, data, false);
                    self._bindRotationUp();
                }

            });

        },

        _handleKeyUpEvent: function _handleKeyUpEvent(event) {
            if (this.mainModel.get('noOfSlicedShapes') > 0) {
                var keyCodes = this.staticDataHolder.KEY_CODES,
                    $canvas = this.$('#' + this.idPrefix + 'right-panel-canvas-acc-container');

                switch (event.keyCode) {
                    case keyCodes.C:
                        this._onColorPickerBtnClick(event);
                        break;

                    case keyCodes.D:
                        this._onTrashBtnClick(event);
                        $canvas.off('keyup.shapeButtons');
                        break;

                    default: break;
                }
            }
        },
        /**
        * Binds Rotation Up
        *
        * @method _bindRotationUp
        * @private
        */
        _bindRotationUp: function () {
            var self = this,
                   keyUpEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEYUP_EVENTS,
                   $canvasHolder = this.$('#' + this.idPrefix + 'right-panel-canvas-acc-container');

            $canvasHolder.off(keyUpEvents.ROTATION_KEYUP).on(keyUpEvents.ROTATION_KEYUP, function (event, data) {
                self._handleOnRotationKeyUp(event, data);
                $canvasHolder.off(keyUpEvents.ROTATION_KEYUP);
            });
        },

        /**
        * Unbinds Space Key
        *
        * @method _unbindSpaceForAccessibility
        * @private
        */
        _unbindSpaceForAccessibility: function _unbindSpaceForAccessibility() {
            var keyEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS,
                 $canvasHolder = this.$('#' + this.idPrefix + 'right-panel-canvas-acc-container');

            $canvasHolder.off(keyEvents.SPACE);
        },

        /**
        * Binds Space Key
        *
        * @method _bindSpaceForAccessibility
        * @private
        */
        _bindSpaceForAccessibility: function _bindSpaceForAccessibility() {
            var keyEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS,
                 $canvasHolder = this.$('#' + this.idPrefix + 'right-panel-canvas-acc-container'),
                self = this;

            $canvasHolder.on(keyEvents.SPACE, function (event, data) {
                self._spaceKeyPressed(event, data);
            });

        },

        /**
        * Gives focus effect to end point on tab
        *
        * @method _tabKeyPressed
        * @param {Object} event Event object
        * @param {Object} data Data object
        * @private
        */
        _tabKeyPressed: function _tabKeyPressed(event, data) {

            var self = this;
            if (this.isFirstTab) {
                this.isFirstTab = false;
                this.isFocusOnCanvas = true;
            }

            if (this.previousItem !== null) {
                event.fromTabKey = true;
                self.paperScope.tool.trigger('mouseup', event);
            }

            var self = this;
            this.previousItem = data.item;
            var eventObj = self._createEvent(event, data);
            eventObj.target = this.previousItem;
            eventObj.isAccessible = true;

            data.item.trigger('mousedown', eventObj);
            this._showShapeButtons(true, eventObj);
            this._setShapeButtonsPosition();
            this.changeAccMessage('right-panel-canvas-acc-container', 11, [this.canvasAcc.getCurrentPaperItemIndex() + 1]);
        },
        /**
        * Creates event object
        *
        * @method _createEvent
        * @param {Object} event existing event
        * @param {Object} data 
        * @return {Object} Event Object
        * @private
        */
        _createEvent: function _createEvent(event, data) {
            event.point = this.previousItem.position;
            event.event = { which: 1 };
            event.isAccessible = true;
            return event;
        },

        /**
        * Handles Rotation
        *
        * @method _rotateShape
        * @param {Object} event Event object
        * @param {Object} data Data object
        * @param {Boolean} Clock Wise Rotation
        * @private
        */
        _rotateShape: function _rotateClockWise(event, data, isRotationClockwise) {

            var self = this,
                endPointsGroup,
                angle = this.staticDataHolder.ROTATE_ANGLE;

            event.target = data.item.parent.getItems({ 'name': 'end-points-group' })[0];
            event = this._createEvent(event, data);
            this.setAccMessage('right-panel-canvas-acc-container', '');
            if (isRotationClockwise) {
                event.angleOfRotation = angle;
            }
            else {
                event.angleOfRotation = -angle;
            }
            event.target.trigger('mousedrag', event)
        },


        /**
        * Handles Space
        * 
        * @method _spaceKeyPressed
        * @param {Object} event Event object
        * @param {Object} data Data object
        * @private
        */
        _spaceKeyPressed: function _spaceKeyPressed(event, data) {
            this._unbindSpaceForAccessibility();
        },

        /**
        * Removes focus effect
        *
        * @method _focusOut
        * @param {Object} event Event object
        * @param {Object} data Data object
        * @private
        */
        _focusOut: function _focusOut(event, data) {

            this.isFirstTab = true;
            this.isFocusOnCanvas = false;

            if (this.previousItem !== null) {
                event.fromTabKey = true;
                this.paperScope.tool.trigger('mouseup', event);
            }
            this.changeAccMessage('right-panel-canvas-acc-container', 0);
            this.eventManager.trigger(eventManagerModel.DESELECT_SHAPE);
            this._bindSpaceForAccessibility();

        },

        /**
        * Moves endpoint on arrow key movement
        *
        * @method _arrowKeyPressed
        * @param {Object} event Event object
        * @param {Object} data Data object
        * @private
        */
        _arrowKeyPressed: function _arrowKeyPressed(event, data) {

            var self = this;
            event.point = {
                x: data.point.x + data.directionX * 5,
                y: data.point.y + data.directionY * 5
            };
            event.event = { which: data.event.which };
            event.target = data.item;
            event.isAccessible = true;
            this.setAccMessage('right-panel-canvas-acc-container', '');
            data.item.trigger('mousedrag', event);
            this.paperScope.view.draw();
        },

        /**
        * Handles Arrow Key Up
        *
        * @method _handleOnArrowKeyUp
        * @param {Object} event Event object
        * @param {Object} data Data object
        * @private
        */
        _handleOnArrowKeyUp: function (event, data) {
            var msgId = data.keyCode - this.staticDataHolder.ARROW_KEY_DELTA,
                self = this;
            event.target = data.item;
            event.isAccessible = true;
            this.paperScope.tool.trigger('mouseup', event);

            if (this.boundaryCheck) {
                this.changeAccMessage('right-panel-canvas-acc-container', 1, [this.getAccMessage('right-panel-canvas-acc-container', msgId)]);
            }
            window.setTimeout($.proxy(self._setFocusOnCanvas, self), 100);
            this._selectPreviousItem(event, data);
        },

        /**
        * Selects previous Item
        *
        * @method _selectPreviousItem
        * @param {Object} event Event object
        * @param {Object} data Data object
        * @private
        */
        _selectPreviousItem: function (event, data) {
            if (this.previousItem && this.isFocusOnCanvas) {
                var self = this;
                event.target = this.previousItem;
                event.isAccessible = true;
                this.previousItem.trigger('mousedown', self._createEvent(event, data));
            }
        },

        /**
        * Handles rotation key up
        *
        * @method _handleOnRotationKeyUp
        * @param {Object} event Event object
        * @param {Object} data Data object
        * @private
        */
        _handleOnRotationKeyUp: function (event, data) {
            var id = null,
                self = this;
            event.target = data.item;
            event.isAccessible = true;
            this.paperScope.tool.trigger('mouseup', event);
            if (data.keyCode === MathInteractives.global.CanvasAcc.KEYS.ROTATE_CLOCKWISE) {
                id = 8;
            }
            else if (data.keyCode === MathInteractives.global.CanvasAcc.KEYS.ROTATE_ANTI_CLOCKWISE) {
                id = 9;
            }

            this.changeAccMessage('right-panel-canvas-acc-container', 7, [this.getAccMessage('right-panel-canvas-acc-container', id)]);
            window.setTimeout($.proxy(self._setFocusOnCanvas, self), 100);
            this._selectPreviousItem(event, data);
        },

        /**
        * Sets Focus on Canvas
        *
        * @method _setFocusOnCanvas
        * @public
        */
        _setFocusOnCanvas: function () {
            if (this.isFocusOnCanvas) {
                this.canvasAcc.setSelfFocus();
            }
        },

        getPaperObjects: function getPaperObjects() {

            var shapeArr = [];

            this.allShapesGroup.children.forEach(function (shapeGroup) {
                shapeArr.push(shapeGroup.children['shape']);
            });
            return shapeArr.reverse();
        }

    }, {
        CURSOR_TYPE: {
            DEFAULT: 'default',
            POINTER: 'pointer',
            OPEN_HAND: 'open-hand',
            CLOSED_HAND: 'closed-hand'
        },

        BACKGROUND_TYPE: {
            WHITE: {
                TYPE_NAME: 'white',
                TYPE_COLOR: '#ffffff'
            },
            GRAY: {
                TYPE_NAME: 'gray',
                TYPE_COLOR: '#2c2c2c'
            }
        },

        SHAPE_COLOR: ['#ff980d', '#00aeef', '#a13922', '#edc900', '#4c1787', '#db490e', '#8dc740', '#da4398', '#46bd9d', '#af853b'],

        CANVAS_AREA: {
            X: 0,
            Y: 0,
            WIDTH: 414,
            HEIGHT: 412
        },

        COLOR_PICKER: {
            WIDTH: 291,
            HEIGHT: 329
        },

        COLOR_PICKER_OFFSET: 20,

        COLOR_PICKER_FIXED_TOP: 155,

        SHAPE_HOVER_SCALE: 1.05,

        GRADIENT_COLOR: ['#0b0d0c', '#515050'],

        ROTATE_ANGLE: 5,

        KEY_CODES: {
            'C': 67,
            'D': 68
        },

        ARROW_KEY_DELTA: 35
    });
})();
