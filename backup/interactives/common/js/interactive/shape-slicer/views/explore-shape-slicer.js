(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Views.ExploreShapeSlicer) {
        return;
    }
    var className = null,
        eventManagerModel = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer.EVENT_MANAGER_MODEL,
        mainModelNameSpace = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer;
    /*
     *
     *   [[D E S C R I P T I O N]]
     *
     * @class ExploreShapeSlicer
     * @namespace MathInteractives.Interactivities.ShapeSlicer.Views
     * @extends MathInteractives.Common.Player.Views.Base
     * @constructor
     */
    MathInteractives.Common.Interactivities.ShapeSlicer.Views.ExploreShapeSlicer = MathInteractives.Common.Player.Views.Base.extend({

        shape3DView: null,

        shape2DView: null,

        /**
         * Reference to view of Direction Box
         *
         * @property directionTextView
         * @type Backbone.View
         * @default null
         */
        _directionTextView: null,

        /**
         * Reference to view of Reset button
         *
         * @property _resetButtonView
         * @type Backbone.View
         * @default null
         */
        _resetButtonView: null,
        /**
        * Stores reference for error Tool Tip.
        * 
        * @property errorToolTip 
        * @type Object
        * @default null
        **/
        errorToolTip: null,
        /**
         * Reference to view of Rotate button about x-axis
         *
         * @property _rotateAboutXAxisButtonView
         * @type Backbone.View
         * @default null
         */
        _rotateAboutXAxisButtonView: null,

        /**
         * Reference to view of Rotate button about y-axis
         *
         * @property _rotateAboutYAxisButtonView
         * @type Backbone.View
         * @default null
         */
        _rotateAboutYAxisButtonView: null,

        /**
         * Reference to view of Rotate button about z-axis
         *
         * @property _rotateAboutZAxisButtonView
         * @type Backbone.View
         * @default null
         */
        _rotateAboutZAxisButtonView: null,

        /**
         * Reference to view of Slice button
         *
         * @property _sliceButtonView
         * @type Backbone.View
         * @default null
         */
        _sliceButtonView: null,

        /**
         * stores shape button view
         *
         * @property _shapeButtonsArray
         * @type array
         * @default null        
         */
        _shapeButtonsArray: null,
        /**
        * Holds the reference of the pop up
        *
        * @property popUpView
        * @type Object
        * @default null
        **/
        popUpView: null,

        isRotationDown: null,

        eventManager: null,

        /**
        * Holds the reference of timer on rotate button
        *
        * @property timer
        * @type Object
        * @default null
        **/
        timer: null,

        /*
      * Stores the most recent keyup event.
      * @property _lastSpaceKeyUpEvent
      * @default null
      * @type Object
      */
        _lastSpaceKeyUpEvent: null,

        /*
        * Stores the number of times keydown has been fired before the next keydown.
        * @property _previousSpaceKeyDownCount
        * @default 0
        * @type Number
        */
        _previousSpaceKeyDownCount: 0,
        /*
        * Stores the number of times keydown has been fired.
        * @property _currentSpaceKeyDownCount
        * @default 0
        * @type Number
        */
        _currentSpaceKeyDownCount: 0,
        /*
        * Stores the window interval for triggering keyup.
        * @property _keyUpInterval
        * @default null
        * @type Number
        */
        _keyUpInterval: null,
        /**
         * Initialises ExploreShapeSlicer
         * @method initialize
         */

        initialize: function () {
            var self = this;
            this.initializeDefaultProperties();
            className = MathInteractives.Common.Interactivities.ShapeSlicer.Views.ExploreShapeSlicer;
            this.eventManager = this.model.get('eventManager');
            this.render();
            this._bindEvents();
            this.loadScreen('help-screen');
            this._setHelpElements();
            //    this._initialExploreHelpScreen();
            this.model.updatePreviousSaveState();

            //bind tab change
            this.player.bindTabChange(function (data) {
                self.model.set('currentTab', 1);
                self.updateFocusRect('explore-tab-direction-text-direction-text-text');
                self.eventManager.trigger(eventManagerModel.TAB_CHANGED, 1);
                if (data.isLetsGoClicked !== true) {
                    self.setFocus('explore-tab-direction-text-direction-text-text');
                }
            }, self, 1);
            this.model.set('saveStateLoad', false);

        },

        /**
         * Renders the view of Explore Tab
         *
         * @method render
         * @private
         **/
        render: function render() {
            this._preloadImagePath();
            this._setBackground();
            this.loadScreen('explore-tab-screen');
            this._initializeDirectionText();
            this._createShapeButtons();
            this._initialize3DPanel();
            this._initialize2DPanel();
            this._createButtons();
            this._renderToolTip();

            this.loadScreen('acc-text-screen');
            this.loadScreen('button-acc-screen');
            this._loadAccText();
            this._disableAllButtons();

        },

        /**
        * Binds Custom Events
        *
        * @method _bindEvents
        * @private
        **/
        _bindEvents: function _bindEvents() {
            var self = this,
                shape3DView = this.shape3DView,
                shapeView = null,
                utils = MathInteractives.Common.Utilities.Models.Utils,
                eventManager = this.eventManager,
                PlayerEvents = MathInteractives.Common.Player.Views.Player.Events;

            this.model.on('change:noOfSlicedShapes', this._onSlicedShapesCountChange, this);
            this.model.on('change:isSliceShapeButtonEnabled', this._enableDisableSliceButton, this);
            eventManager.on(eventManagerModel.POINTS_ON_SAME_EDGE, $.proxy(this._showSamePoint, this, 1));
            eventManager.on(eventManagerModel.POINTS_ON_SAME_FACE, $.proxy(this._showSamePoint, this, 2));
            eventManager.on(eventManagerModel.CLICK_ON_3D_CANVAS, this._hideToolTip, this);
            eventManager.on(eventManagerModel.DISABLE_HOVER, this._disableHover, this);
            eventManager.on(eventManagerModel.ENABLE_HOVER, this._enableHover, this);
            eventManager.on(eventManagerModel.DISABLE_BUTTON_ON_COLOR_PICKER, this._disableButtonOnColorPicker, this);
            eventManager.on(eventManagerModel.ENABLE_BUTTON_ON_COLOR_PICKER, this._enableButtonOnColorPicker, this);
            eventManager.off(eventManagerModel.ENABLE_TRY_ANOTHER).on(eventManagerModel.ENABLE_TRY_ANOTHER, this._enableTryAnother, this);
            eventManager.off(eventManagerModel.DISABLE_TRY_ANOTHER).on(eventManagerModel.DISABLE_TRY_ANOTHER, this._disableTryAnother, this);
            eventManager.off(eventManagerModel.SET_RESET_BUTTON_STATE).on(eventManagerModel.SET_RESET_BUTTON_STATE, this._setResetButtonState, this);
            eventManager.off(eventManagerModel.EDIT_IMAGE, this._onEditButtonClicked).on(eventManagerModel.EDIT_IMAGE, this._onEditButtonClicked, this);

            //$(window).off('resize.trackballResize').on('resize.trackballResize', function (event) {
            //    shapeView = shape3DView.shapeViewArr[self.model.get('shapeNumber')];
            //    shapeView.controls.handleResize();
            //});
            this.$('.reset-button-container').off('click.reset').on('click.reset', $.proxy(self._resetButtonClickHandler, self));
            this.$('.slice-button-container').off('click.slice').on('click.slice', $.proxy(self._sliceButtonClickHandler, self));
            this.$('.rotate-button').off('mousedown').on('mousedown', $.proxy(self._rotateBtnMouseDownHandler, self))
                                .off('keydown.rotate-button').on('keydown.rotate-button', function (event) {
                                    if (event.keyCode === 32 || event.keyCode === 13) {
                                        self._handleSpaceUpTrigger(event);
                                    }
                                })
                                     .off('keyup.rotate-button').on('keyup.rotate-button', function (event) {

                                         if (event.keyCode === 32 || event.keyCode === 13) {
                                             event.preventDefault();
                                             self._lastSpaceKeyUpEvent = event;
                                         }
                                     });

            this.errorToolTip.$('#' + this.idPrefix + 'tooltip-display-container-tooltip-text-container')
            .off('keydown.hideToolTip')
            .on('keydown.hideToolTip', function (event, data) {

                if (event.keyCode === 9 && event.shiftKey) {
                    event.preventDefault();
                    self._handleFocusOutOnToolTip(event, true);
                }
            });

            this.errorToolTip.$('.error-tooltip-tts-button')
           .off('keydown.hideToolTip')
           .on('keydown.hideToolTip', function (event, data) {

               if (event.keyCode === 9 && !event.shiftKey) {
                   event.preventDefault();
                   self._handleFocusOutOnToolTip(event, false);
               }
           });

            utils.DisableTouch(this.$('.rotate-button'));
            utils.EnableTouch(this.$('.rotate-button'), 0);
            $(window).off('unload.shapeSlicer').on('unload.shapeSlicer', $.proxy(self._onInteractiveUnload, self));
            this.player.off(PlayerEvents.UNLOAD_INTERACTIVE, $.proxy(self._onInteractiveUnload, self)).on(PlayerEvents.UNLOAD_INTERACTIVE, $.proxy(self._onInteractiveUnload, self));
            this.player.off(PlayerEvents.SCREENSHOT_START, $.proxy(self.onScreenshotStart, self)).on(PlayerEvents.SCREENSHOT_START, $.proxy(self.onScreenshotStart, self));
            this.player.off(PlayerEvents.SCREENSHOT_END, $.proxy(self.onScreenshotEnd, self)).on(PlayerEvents.SCREENSHOT_END, $.proxy(self.onScreenshotEnd, self));
        },

        _handleFocusOutOnToolTip: function _handleFocusOutOnToolTip(event, focusButton) {
            var maxShapes = this.model.get('noOfSlicedShapes') === mainModelNameSpace.MAX_SLICE_SHAPES - 1;

            this.shape3DView.canvasAcc.model.set('disableSelfFocusOnSpace', false);


            if (maxShapes && !focusButton) {
                this.shape3DView.canvasAcc.updatePaperItems(this.shape3DView.getPaperObjects(), false);
                this.shape3DView.canvasAcc.setCurrentPaperItem(this.shape3DView.getPaperObjects()[0], false);
                this.setFocus('right-panel-canvas-acc-container');
            }
            else {
                this.setFocus('canvas-acc-container');
            }

            this._hideToolTip();
        },

        _loadAccText: function _loadAccText() {
            var numberOfShapes = this.model.get('numberOfShapes'),
                shapeNumber = this.model.get('shapeNumber'),
                commonText = this.getAccMessage('shape-button-common-text', 0);

            for (var i = 0; i < numberOfShapes; i++) {
                this.setAccMessage('shape-button-container-' + i, this.getAccMessage('shape-button-container-' + i, 0, [commonText]));
            }

            //Set Selected Text
            this.setAccMessage('shape-button-container-' + shapeNumber, this.getAccMessage('shape-button-container-' + shapeNumber, 0, [this.getAccMessage('shape-button-common-text', 1)]));
            this.setAccMessage('canvas-acc-container', this.getAccMessage('shape-button-container-' + shapeNumber, 0, [this.getAccMessage('shape-button-common-text', 2)]));
        },

        onScreenshotStart: function () {
            var $canvas = this.$('.activity-canvas'),
                $screenshotHack = this.$('.activity-canvas-screenshot-hack');
            this.shape3DView._renderScene();
            $screenshotHack.css({
                'background-image': 'url(' + $canvas[0].toDataURL() + ')'
            });
            $canvas.hide();
            $screenshotHack.show();
        },

        onScreenshotEnd: function () {
            var $canvas = this.$('.activity-canvas'),
                $screenshotHack = this.$('.activity-canvas-screenshot-hack');
            $screenshotHack.css({
                'background-image': ''
            });
            $screenshotHack.hide();
            $canvas.show();
        },

        _onInteractiveUnload: function _onInteractiveUnload() {

            var self = this;
            this.eventManager.trigger(eventManagerModel.UNLOAD_INTERACTIVE);
            this.model.set('activityLoaded', false);
            window.cancelAnimationFrame(this.shape3DView.lastAnimationFrame);

            $.each(this.shape3DView.shapeViewArr, function (index, shapeView) {
                shapeView.parent.disposeObjects(shapeView.scene);
                shapeView.parent.disposeObjects(shapeView.frontScene);
                self._removeDummyLines(shapeView);
                shapeView.destroy();
                shapeView.unbind();
                shapeView.remove();
                shapeView.model.defaults();
                shapeView.model.destroy();
                shapeView = null;
            });

            this._unbindShape2DViewEvents();

            this.shape2DView.destroy();
            this.shape2DView.unbind();
            this.shape2DView.remove();
            this.shape2DView.model.defaults();
            this.shape2DView.model.destroy();
            this.shape2DView = null;

            //this.shape3DView.renderer.domElement.addEventListener('dblclick', null, false); //remove listener to render
            this.shape3DView.shapeViewArr.length = 0;
            this.shape3DView.shapeViewArr = null;
            if (this.shape3DView.renderer.domElement) {
                $(this.shape3DView.renderer.domElement).remove();
            }
            this.shape3DView.renderer = null;
            this.shape3DView.unbind();
            this.shape3DView.remove();
            this.shape3DView = null;


            this.destroy();
            this.unbind();
            this.remove();
            this.model.defaults();
            this.model.destroy();
            //       $(window).off('resize.trackballResize');
            $(window).off('unload.shapeSlicer');
        },

        _unbindShape2DViewEvents: function _unbindShape2DViewEvents() {

            var self = this,
                allShapesGroup = this.shape2DView.allShapesGroup;

            allShapesGroup.children.forEach(function (shapeGroup) {
                self.shape2DView._unbindShapeEvents(shapeGroup.children['shape']);
            });

            this.shape2DView.paperScope.paper.project.activeLayer.removeChildren();
        },

        _removeDummyLines: function _removeDummyLines(shapeView) {
            shapeView.getLines().length = 0;
        },
        _enableHover: function _enableHover(event) {
            this.$('.hover-modal').removeClass('hover-modal-show');
        },

        _disableHover: function _disableHover(event) {
            this.$('.hover-modal').not(event.currSelector).addClass('hover-modal-show');
        },

        _enableButtonOnColorPicker: function _enableButtonOnColorPicker(event) {
            this.$('.buttons-to-be-disabled').removeClass('disabled-modal-buttons');
            this._directionTextView.$('.buttons-to-be-disabled').removeClass('disabled-modal-buttons');
        },

        _disableButtonOnColorPicker: function _disableButtonOnColorPicker(event) {
            this.$('.buttons-to-be-disabled').addClass('disabled-modal-buttons');
            this._directionTextView.$('.buttons-to-be-disabled').addClass('disabled-modal-buttons');
        },
        _enableTryAnother: function _enableTryAnother() {
            this._directionTextView.changeButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
            this.model.set('isTryAnotherButtonEnabled', true);
            this.eventManager.off(eventManagerModel.ENABLE_TRY_ANOTHER);
        },

        _disableTryAnother: function _disableTryAnother() {
            this._directionTextView.changeButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
            this.model.set('isTryAnotherButtonEnabled', false);
            this.eventManager.off(eventManagerModel.DISABLE_TRY_ANOTHER);
        },

        _onEditButtonClicked: function _onEditButtonClicked() {

            var interactivityType = this.model.get('interacivityType'),
                defaultShape = mainModelNameSpace.DEFAULT_SHAPE[interactivityType],
                self = this,
                eve = { currentTarget: self.$('.shape-button-container-' + defaultShape)[0] };

            this._shapeButtonClickHandler(eve);
            this.model.set('shapeNumber', defaultShape);
        },

        /**
         * Initializes 3d panel
         * @method _initialize3DPanel
         * @private
         */
        _initialize3DPanel: function _initialize3DPanel() {

            var self = this;

            this.shape3DView = new MathInteractives.Common.Interactivities.ShapeSlicer.Views.Shape3D({
                model: self.model,
                el: self.$el,
                idPrefix: self.idPrefix,
                parent: this
            });

        },

        /**
         * Initializes 2d panel
         * @method _initialize2DPanel
         * @private
         */
        _initialize2DPanel: function _initialize2DPanel() {
            var shape2DModel = this.model.get('shape2DModel');
            if (shape2DModel === null) {
                shape2DModel = new MathInteractives.Common.Interactivities.ShapeSlicer.Models.Shape2D({
                    player: this.player
                });
            }
            else {
                var options = $.extend(true, shape2DModel, { player: this.player });
                shape2DModel = new MathInteractives.Common.Interactivities.ShapeSlicer.Models.Shape2D(options);
            }
            this.model.set('shape2DModel', shape2DModel);

            this.shape2DView = new MathInteractives.Common.Interactivities.ShapeSlicer.Views.Shape2D({
                mainModel: this.model,
                model: shape2DModel,
                el: this.$('.explore-tab-right-part-container')
            });
        },

        /**
         * Preloads image path.
         *
         * @method _preloadImagePath
         * @private
         **/
        _preloadImagePath: function () {
            var image = new Image(), colorPickerImg = null;
            image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAJBAMAAAD9\
                        fXAdAAAAMFBMVEX3+fzHyMr5+/7Iyc3////7/f/HyMzFxsnDw8b29/nKy8/Mzc7\
                        v7/LR0tTy8vTR09adT6jjAAAANUlEQVQI12PYIXuSj0FF81Y1AwtDYSNDkMJGQQb\
                        VAMMyBvP+Iw4MUoYBDAzJGQ4MDGZWExQADmYLJSOawaMAAAAASUVORK5CYII=';
            this.spriteImagePath = this.getImagePath('sprites');
            colorPickerImg = this.getImagePath('color-picker');

        },

        /**
         * Sets the background.
         *
         * @method _setBackground
         * @private
         **/
        _setBackground: function () {
            this.$el.css({
                'background-image': 'url("' + this.spriteImagePath + '")'
            });
            this.$el.find('.explore-tab-left-part-container').css({
                'background-image': 'url("' + this.spriteImagePath + '")'
            });
        },

        destroy: function destroy() {
            this.shape3DView = null;
            this.shape2DView = null;
            this._directionTextView = null;
            this._resetButtonView = null;
            this.errorToolTip = null;
            this._rotateAboutXAxisButtonView = null;
            this._rotateAboutYAxisButtonView = null;
            this._rotateAboutZAxisButtonView = null;
            this._sliceButtonView = null;
            this._shapeButtonsArray = null;
            this.popUpView = null;
            this.eventManager = null;
        },

        /**
         * Renders the view of the direction text box
         *
         * @method _initializeDirectionText
         * @private
         **/
        _initializeDirectionText: function _initializeDirectionText() {

            var idPrefix = this.idPrefix,
                directionProperties = {
                    containerId: idPrefix + 'explore-tab-direction-text',
                    idPrefix: idPrefix,
                    player: this.player,
                    manager: this.manager,
                    path: this.filePath,
                    text: this.getMessage('explore-tab-direction-text-text', 0),
                    accText: this.getAccMessage('explore-tab-direction-text-text', 0),
                    showButton: true,
                    buttonText: this.getMessage('explore-tab-direction-text-text', 1),
                    //btnColorType: MathInteractives.global.Theme2.Button.COLORTYPE.GREEN,
                    containmentBGcolor: 'rgba(0, 0, 0,0)',
                    buttonHeight: 38,
                    btnTextColor: '#000000',
                    clickCallback: {
                        fnc: this._onTryAnotherClick,
                        scope: this
                    },
                    textColor: '#ffffff',
                    tabIndex: 500,
                    buttonTabIndex: 1000,
                    btnBaseClass: 'shape-slicer-white-button-base',
                    ttsBaseClass: 'shape-slicer-tts-button'

                };
            this._directionTextView = MathInteractives.global.Theme2.DirectionText.generateDirectionText(directionProperties);
            this._directionTextView.tryAnotherView.$el.addClass('buttons-to-be-disabled');
            this._directionTextView.ttsView.$el.addClass('buttons-to-be-disabled');

            if (!this.model.get('isTryAnotherButtonEnabled')) {
                this._directionTextView.changeButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
            }
        },

        /**
         * Try Another button click handler
         *
         * @method _onTryAnotherClick
         * @private
         **/
        _onTryAnotherClick: function _onTryAnotherClick() {
            this.stopReading();
            if (!this.model.compareSavedState(1)) {
                this._showPopup(this.getMessage('reset-popup', 0), this.getMessage('reset-popup', 1));
            }
            else {
                this._resetPositiveClick();
            }
        },
        /**
        * Shows the reset popup
        *
        * @method _showPopup
        * @private
        **/
        _showPopup: function (title, text) {
            var self = this,
                options, popUpView;
            options = {
                title: title,
                accTitle: '',
                text: text,
                accText: '',
                manager: self.manager,
                player: self.player,
                path: self.filePath,
                idPrefix: self.idPrefix,
                type: MathInteractives.global.Theme2.PopUpBox.CONFIRM,
                closeCallback: {
                    fnc: function (response) {
                        if (response.isPositive) {
                            self._resetPositiveClick();
                        }
                        else {
                            self.setFocus('explore-tab-direction-text-direction-text-buttonholder');
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
        * Resets the activity
        *
        * @method _resetPositiveClick
        * @private
        **/
        _resetPositiveClick: function () {

            this._clearAfterResetClick();
            this.eventManager.trigger(eventManagerModel.DISABLE_TRY_ANOTHER);
            this.eventManager.off(eventManagerModel.ENABLE_TRY_ANOTHER).on(eventManagerModel.ENABLE_TRY_ANOTHER, this._enableTryAnother, this);
            this.eventManager.off(eventManagerModel.DISABLE_TRY_ANOTHER).on(eventManagerModel.DISABLE_TRY_ANOTHER, this._disableTryAnother, this);

        },

        _clearAfterResetClick: function _clearAfterResetClick() {
            var eve = { currentTarget: $('#' + this.idPrefix + 'shape-button-container-' + (mainModelNameSpace.DEFAULT_SHAPE[this.model.get('interacivityType')]))[0] },
            galleryObject = this.model.get('galleryObject'),
            newIndex;
            this._resetAllShapeHandler();
            this.shape2DView.resetView();
            this._shapeButtonClickHandler(eve);
            this.model.updatePreviousSaveState();
            newIndex = galleryObject.length;
            this.model.set('currentGalleryIndex', newIndex);
            this.setFocus('explore-tab-activity-area');
        },

        /**
         * Creates buttons
         *
         * @method _createButtons
         * @private
         **/
        _createButtons: function _createButtons() {
            this._createRotatePanelButtons();
            this._createOtherButtons();
        },

        /**
         * Creates Reset and Rotate buttons
         *
         * @method _createRotatePanelButtons
         * @private
         **/
        _createRotatePanelButtons: function _createRotatePanelButtons() {
            var btnOptions = {},
                globalBtn = MathInteractives.global.Theme2.Button,
            //mainModelNameSpace = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer,
                height = mainModelNameSpace.RESET_ROTATE_BUTTON_HEIGHT,
                width = mainModelNameSpace.RESET_ROTATE_BUTTON_WIDTH;

            btnOptions = {
                'player': this.player,
                'manager': this.manager,
                'path': this.filePath,
                'idPrefix': this.idPrefix,
                'data': {
                    type: globalBtn.TYPE.FA_ICON,
                    height: height,
                    width: width,
                    tooltipText: this.getMessage('reset-tooltip', 0),
                    tooltipType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.RIGHT_MIDDLE,
                    id: this.idPrefix + 'reset-button-container',
                    icon: {
                        'faClass': this.filePath.getFontAwesomeClass('fixed-reset'),
                        'height': height,
                        'width': width//,
                        //                        'fontSize': fontSize,
                        //                        'fontColor': fontColor
                    },
                    baseClass: 'shape-slicer-white-button-base'
                }
            };
            this._resetButtonView = globalBtn.generateButton(btnOptions);


            btnOptions = {
                'player': this.player,
                'manager': this.manager,
                'path': this.filePath,
                'idPrefix': this.idPrefix,
                'data': {
                    'id': this.idPrefix + 'rotate-about-x-axis-button-container',
                    'type': globalBtn.TYPE.ICON,
                    'height': height,
                    'width': width,
                    'baseClass': 'shape-slicer-white-button-base',
                    'tooltipText': this.getMessage('rotate-about-x-axis', 0),
                    'tooltipType': MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.RIGHT_MIDDLE,
                    'icon': {
                        'iconPath': this.spriteImagePath,
                        'height': height,
                        'width': width
                    }
                }
            };
            this._rotateAboutXAxisButtonView = globalBtn.generateButton(btnOptions);

            btnOptions.data.id = this.idPrefix + 'rotate-about-y-axis-button-container';
            btnOptions.data.tooltipText = this.getMessage('rotate-about-y-axis', 0);

            this._rotateAboutYAxisButtonView = globalBtn.generateButton(btnOptions);

            btnOptions.data.id = this.idPrefix + 'rotate-about-z-axis-button-container';
            btnOptions.data.tooltipText = this.getMessage('rotate-about-z-axis', 0);

            this._rotateAboutZAxisButtonView = globalBtn.generateButton(btnOptions);
        },

        /**
         * Creates Slice, Clear, Save Image and View Gallery buttons
         *
         * @method _createOtherButtons
         * @private
         **/
        _createOtherButtons: function _createOtherButtons() {
            var globalBtn = MathInteractives.global.Theme2.Button,
                btnOptions = {
                    'player': this.player,
                    'manager': this.manager,
                    'path': this.filePath,
                    'idPrefix': this.idPrefix,
                    'data': {
                        'id': this.idPrefix + 'slice-button-container',
                        'type': globalBtn.TYPE.TEXT,
                        'baseClass': 'shape-slicer-white-button-base',
                        'text': this.getMessage('slice-button-container-text', 0)
                    }
                };

            this._sliceButtonView = globalBtn.generateButton(btnOptions);

        },

        _disableAllButtons: function _disableAllButtons() {

            var currentShapeView = this.shape3DView.shapeViewArr[this.model.get('shapeNumber')],
                noOfSlicedShapes = this.model.get('noOfSlicedShapes'),
                shape2DView = this.shape2DView;

            this._setResetButtonState(currentShapeView.model.get('isResetButtonEnable'));
            this._enableDisableSliceButton();

            //Shape-2D Buttons 

            shape2DView._enableClearButton(noOfSlicedShapes > 0);
            shape2DView._onSaveImageButtonStatusChange();
            shape2DView._onGalleryObjectsCountChange();
        },

        _setResetButtonState: function _setResetButtonState(bool) {
            var globalbutton = MathInteractives.global.Theme2.Button;

            if (bool) {
                this._resetButtonView.setButtonState(globalbutton.BUTTON_STATE_ACTIVE);
            }
            else {
                this._resetButtonView.setButtonState(globalbutton.BUTTON_STATE_DISABLED);
            }

        },
        /**
         * Reset button click handler
         *
         * @method _resetButtonClickHandler
         * @private
         **/
        _resetButtonClickHandler: function _resetButtonClickHandler(event) {
            if ($(event.currentTarget).hasClass('clickEnabled')) {
                var shape3DView = this.shape3DView,
                    shapeView = shape3DView.shapeViewArr[this.model.get('shapeNumber')];

                this.eventManager.trigger(eventManagerModel.DESELECT_SHAPE);
                event.stopPropagation();
                this.stopReading();
                shapeView.controls.reset();
                shapeView.model.setCameraInitialValues();
                shape3DView.setShapeCameraValuesFromModel(shapeView);
                shape3DView._renderScene(shapeView);
                //set reset button status in model;
                shapeView.model.set('isResetButtonEnable', false);
                this.setFocus('canvas-acc-container');
            }
        },
        /**
         * Reset all shape handler
         *
         * @method _resetAllShapeHandler
         * @private
         **/
        _resetAllShapeHandler: function _resetAllShapeHandler() {
            var shape3DView = this.shape3DView,
                shapeViewArr = shape3DView.shapeViewArr;
            $.each(shapeViewArr, function (index, _shapeView) {
                shape3DView.resetPointSelection(_shapeView);
                _shapeView.model.setCameraInitialValues();
                shape3DView.setShapeCameraValuesFromModel(_shapeView);
                shape3DView._renderScene(_shapeView);
                _shapeView.model.set('isResetButtonEnable', false);
            });
        },
        /**
        * Rotate buttons mouse down handler, calls _rotateShape method with appropriate name
        *
        * @method _rotateBtnMouseDownHandler
        * @param event{Object} jquery event
        * @private
        **/
        _rotateBtnMouseDownHandler: function _rotateBtnMouseDownHandler(event) {
            var browserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;

            if (!this.isShapeRotating && $(event.currentTarget).hasClass('clickEnabled') && (event.isTrigger || (event.which === 1 || browserCheck.isMobile === true))) {
                var self = this,
                    rotateTimer = null,
                    regEx = new RegExp('[xyz]'),
                    buttonAxis = null,
                    time = 100,
                    diff = 23,
                    minTime = 0,
                    maxDiff = 60,
                    decrement = 1,
                    currentTarget = $(event.currentTarget),
                      utils = MathInteractives.Common.Utilities.Models.Utils,
                    shapeView = this.shape3DView.shapeViewArr[this.model.get('shapeNumber')];

                self.eventManager.trigger(eventManagerModel.ENABLE_TRY_ANOTHER, event);
                self.eventManager.trigger(eventManagerModel.DESELECT_SHAPE);
                self.model.set('requestAnimation', true);
                self.shape3DView._animate();

                currentTarget.addClass('downState');
                event.stopPropagation();
                this.stopReading();
                this.isRotationDown = true;

                //Bind touchend and touchcancel to fix document scrolling being disabled
                $(document).off('mouseup.document-click' + self.idPrefix + ' touchend.document-click' + self.idPrefix + ' touchcancel.document-click' + self.idPrefix)
                           .on('mouseup.document-click' + self.idPrefix + ' touchend.document-click' + self.idPrefix + ' touchcancel.document-click' + self.idPrefix, $.proxy(self._stopRotating, self));
                //utils.EnableTouch($(document), 0);
                //set reset button status in model;
                shapeView.model.set('isResetButtonEnable', true);

                buttonAxis = currentTarget[0].className.match(regEx);

                if (!event.isTrigger) {
                    this._rotateShape(buttonAxis[0]);
                }
                this.isShapeRotating = true;
                rotateTimer = function () {
                    if (self.isShapeRotating) {
                        self._rotateShape(buttonAxis[0], diff);
                        if (time > minTime) {
                            time -= decrement;
                            if (!Detector.webgl && diff < maxDiff) {
                                diff++;
                            }
                        }
                        if (this.timer) {
                            window.clearTimeout(this.timer);
                        }
                        window.setTimeout(rotateTimer, time);
                    }
                }
                if (this.timer) {
                    window.clearTimeout(this.timer);
                }
                this.timer = window.setTimeout(rotateTimer, 500);
                currentTarget.off('mouseup.rotateStop').on('mouseup.rotateStop', $.proxy(self._rotateBtnMouseUpHandler, self));
            }
        },

        /**
        * Rotate buttons mouse up handler, dispateches document mouseup event
        *
        * @method _rotateBtnMouseUpHandler
        * @param event{Object} jquery event
        * @private
        **/
        _rotateBtnMouseUpHandler: function _rotateBtnMouseUpHandler(event) {
            if ($(event.currentTarget).hasClass('clickEnabled') && !event.isTrigger) {
                var mouseupEvent = null,
                    currentTarget = $(event.currentTarget),
                    shape3DView = this.shape3DView,
                    shapeNumber = this.model.get('shapeNumber'),
                    shapeView = shape3DView.shapeViewArr[shapeNumber];
                shapeView.controls.mouseup(event);
                this._stopRotating(event);

                currentTarget.off('mouseup.rotateStop');
            }
        },

        /* 
        * JAWS handles space key differently. When space key is held down, keydown and keyup events are fired simultaneously.
        * To overcome this, this function checks whether another keydown has occured within a set timer before the keyup is fired.
        * If another keydown has been fired, the keyup event won't be triggered.
        * 
        * @method _handleSpaceUpTrigger
        * @private
        */
        _handleSpaceUpTrigger: function _handleSpaceUpTrigger(event) {
            var self = this,
                regEx, buttonAxis,
                keyupTimer = 300;

            self._previousSpaceKeyDownCount = self._currentSpaceKeyDownCount;
            self._currentSpaceKeyDownCount++;
            if (self._previousSpaceKeyDownCount === 0) {
                if (self._keyUpInterval) {
                    window.clearInterval(self._keyUpInterval);
                }
                self._keyUpInterval = window.setInterval(function () {
                    if (self._previousSpaceKeyDownCount === self._currentSpaceKeyDownCount) {

                        window.clearInterval(self._keyUpInterval);
                        self._keyUpInterval = null;
                        self._previousSpaceKeyDownCount = 0;
                        self._currentSpaceKeyDownCount = 0;
                        self._rotateBtnMouseUpHandler(self._lastSpaceKeyUpEvent);
                        regEx = new RegExp('[xyz]');
                        buttonAxis = (self._lastSpaceKeyUpEvent.currentTarget).className.match(regEx)[0];
                        self.setAccMessage('canvas-acc-container', self.getAccMessage('canvas-acc-container', 6, [buttonAxis]))
                        self.setFocus('canvas-acc-container');
                        self.setAccMessage('canvas-acc-container', self.getAccMessage('shape-button-container-' + self.model.get('shapeNumber'), 0, [self.getAccMessage('shape-button-common-text', 2)]));

                        self._lastSpaceKeyUpEvent = null;
                    }
                    else {
                        if (self._lastSpaceKeyUpEvent) {
                            self._previousSpaceKeyDownCount = self._currentSpaceKeyDownCount;
                        }
                    }
                }, keyupTimer);
            }
        },
        /**
         * Roatate shape about axis passed
         *
         * @method _rotateShape
         * @param axis{String} axis to which shape has to be rotate
         * @private
         **/
        _rotateShape: function _rotateShape(axis, diff) {
            var shape3DView = this.shape3DView,
                shapeView = shape3DView.shapeViewArr[this.model.get('shapeNumber')],
                mousedownEvent = null,
                mousemoveEvent = null,
                mouseupEvent = null,
                domElement = this.$('.activity-canvas-wrapper canvas')[0],
                domElementOffset = $(domElement).offset(),
                canvasDetails = mainModelNameSpace.LEFT_CANVAS,
                downPageX = null,
                downPageY = null,
                movePageX = null,
                movePageY = null,
                browserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;

            this._hideToolTip();

            diff = diff || 23;            

            switch (axis) {
                case 'x': {
                    downPageX = domElementOffset.left + canvasDetails.WIDTH / 2;
                    downPageY = domElementOffset.top + canvasDetails.HEIGHT / 2;

                    movePageX = domElementOffset.left + canvasDetails.WIDTH / 2;
                    movePageY = (domElementOffset.top + canvasDetails.HEIGHT / 2) - diff;
                    break;
                }
                case 'y': {
                    downPageX = domElementOffset.left + canvasDetails.WIDTH / 2;
                    downPageY = domElementOffset.top + canvasDetails.HEIGHT / 2;

                    movePageX = (domElementOffset.left + canvasDetails.WIDTH / 2) + diff;
                    movePageY = domElementOffset.top + canvasDetails.HEIGHT / 2;
                    break;
                }
                case 'z': {
                    downPageX = domElementOffset.left + canvasDetails.WIDTH / 2;
                    downPageY = domElementOffset.top;

                    movePageX = (domElementOffset.left + canvasDetails.WIDTH / 2) - diff;
                    movePageY = domElementOffset.top;
                    break;
                }
            }

            if (browserCheck.isIE || browserCheck.isIE11) {
                mousedownEvent = document.createEvent('CustomEvent');
                mousedownEvent.initCustomEvent('mousedown', true, true, {});

                mousemoveEvent = document.createEvent('CustomEvent');
                mousemoveEvent.initCustomEvent('mousemove', true, true, {});

                mouseupEvent = document.createEvent('CustomEvent');
                mouseupEvent.initCustomEvent('mouseup', true, true, {});
            }
            else {
                mousedownEvent = new CustomEvent('mousedown', { 'eventPhase': 2 });
                mousemoveEvent = new CustomEvent('mousemove', { 'eventPhase': 2 });
                mouseupEvent = new CustomEvent('mouseup', { 'eventPhase': 3 });
            }
            mousedownEvent.button = 0;
            mousemoveEvent.button = 0;
            mousedownEvent.pageX = downPageX;
            mousedownEvent.pageY = downPageY;
            mousemoveEvent.pageX = movePageX;
            mousemoveEvent.pageY = movePageY;
            mouseupEvent.isCustom = true;

            shapeView.controls.mousedown(mousedownEvent);
            shapeView.controls.mousemove(mousemoveEvent);
            shapeView.controls.mouseup(mouseupEvent);
        },

        /**
         * Stops rotating shape
         *
         * @method _stopRotating
         * @param event{Object} jquery event
         * @private
         **/
        _stopRotating: function _stopRotating(event) {

            if (!event.isTrigger && !event.originalEvent.isCustom) {
                var self = this;
                this.isRotationDown = false;
                this.$('.rotate-button').removeClass('downState');
                this.isShapeRotating = false;
                window.clearInterval(self.timerId);

                $(document).off('.document-click' + self.idPrefix);

                self.model.set('requestAnimation', false);
            }
        },


        /**
         * Slice button click handler
         *
         * @method _sliceButtonClickHandler
         * @private
         **/
        _sliceButtonClickHandler: function _sliceButtonClickHandler(event) {
            if ($(event.currentTarget).hasClass('clickEnabled')) {
                this.stopReading();
                var noOfSlicedShapes = this.model.get('noOfSlicedShapes') + 1;

                if (noOfSlicedShapes < mainModelNameSpace.MAX_SLICE_SHAPES) {
                    this.model.set('noOfSlicedShapes', noOfSlicedShapes);
                    this.eventManager.trigger(eventManagerModel.SHAPE_SLICED, event);
                    this.setFocus('explore-tab-right-part-container');
                } else {
                    this.errorToolTip.changeText(this.getMessage('tool-tip-text', 0));
                    this.errorToolTip.showTooltip();
                    this.setTabIndex('tooltip-display-container-tooltip-text-container', 745);
                    this.setTabIndex('tooltip-display-container-tooltip-tts-sound-btn', 747);
                    this.setFocus('tooltip-display-container-tooltip-text-container');
                    this.model.set('isSliceShapeButtonEnabled', false);
                }
            }
        },

        _onSlicedShapesCountChange: function _onSlicedShapesCountChange() {
            var noOfSlicedShapes = this.model.get('noOfSlicedShapes'),
                shape3DView = this.shape3DView,
                shapeNumber = this.model.get('shapeNumber'),
                currShapeView = shape3DView.shapeViewArr[shapeNumber],
                pointChecker = currShapeView.model.get('pointChecker');//checks whether the points are 3 and non-collinear and do not lie on a face
            this.model.set('isSliceShapeButtonEnabled', (pointChecker && noOfSlicedShapes < mainModelNameSpace.MAX_SLICE_SHAPES));
        },

        /**
         * Enables or disables the Slice button
         * @method _enableDisableSliceButton
         * @private
         **/
        _enableDisableSliceButton: function _enableDisableSliceButton() {
            var buttonState = this.model.get('isSliceShapeButtonEnabled') ? MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE : MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED;
            this._sliceButtonView.setButtonState(buttonState);
        },
        /**
        * Generates tooltip to be shown when points are validated
        *
        * @method _renderToolTip
        * @private
        **/
        _renderToolTip: function () {
            var toolTip = MathInteractives.global.Theme2.Tooltip, self = this,
                toolTipPath = MathInteractives.Common.Components.Theme2.Views.Tooltip,
                toolTipProps = {
                    _player: self.player,
                    idPrefix: this.idPrefix,
                    manager: self.manager,
                    filePath: self.filePath,
                    type: toolTipPath.TYPE.FORM_VALIDATION,
                    isTts: true,
                    tabIndex: 635,
                    ttsBaseClass: 'error-tooltip-tts-button',
                    accDivOffset: {
                        offsetTop: -5,
                        offsetLeft: -5
                    }
                };

            toolTipProps.containerWidth = 390;
            toolTipProps.id = self.idPrefix + 'maximum-slice-tooltip';
            toolTipProps.elementEl = self.idPrefix + 'tooltip-display-container';
            toolTipProps.isArrow = false;
            toolTipProps.closeOnDocumentClick = true;
            self.errorToolTip = toolTip.generateTooltip(toolTipProps);
        },

        /**
        * Displays the same point tool tips
        *
        * @method _showSamePoint
        * @param num{Number} Message Id
        * @private
        **/
        _showSamePoint: function (num) {
            var shapeNumber = this.model.get('shapeNumber');

            this.errorToolTip.changeText(this.getMessage('tool-tip-text', num));
            this.setAccMessage('canvas-acc-container', this.getAccMessage('canvas-acc-container', 3) + '. ' + this.getAccMessage('canvas-acc-container', 2));
            this.errorToolTip.showTooltip();
            this.errorToolTip.$el.find('.tts-container').css({ 'margin-top': '5px', 'margin-right': '5px' });
            this.setTabIndex('tooltip-display-container-tooltip-text-container', 635);
            this.setTabIndex('tooltip-display-container-tooltip-tts-sound-btn', 637);
            this.setFocus('tooltip-display-container-tooltip-text-container');
        },
        /**
        * Hidess the tool tip
        *
        * @method _hideToolTip
        * @private
        **/
        _hideToolTip: function () {
            this.errorToolTip.hideTooltip();
            this.stopReading();
        },
        /**
         * Creates shape buttons
         *
         * @method _createShapeButtons
         * @private
         **/
        _createShapeButtons: function _createShapeButtons() {

            this.loadScreen('shape-buttons-screen');

            var model = this.model,
                type = model.get('type'),
                numberOfShapes = model.get('numberOfShapes'),
                idPrefix = this.idPrefix,
                shapeButtonId = 'shape-button-container-',
                globalBtn = MathInteractives.global.Theme2.Button,
                thumbnailSize = className.THUMBNAIL_SIZE,
                buttonWidth = className.BUTTON_WIDTH,
                width = MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile ? buttonWidth.TOUCH : buttonWidth.NON_TOUCH,
                btnOptions = {
                    'player': this.player,
                    'manager': this.manager,
                    'path': this.filePath,
                    'idPrefix': idPrefix,
                    'data': {
                        //'id': this.idPrefix + 'slice-button-container',
                        'type': globalBtn.TYPE.ICONTEXT,
                        'baseClass': 'shape-button-base',
                        height: 44,
                        width: width
                        //'text': this.getMessage('slice-button-container', 0)
                    }
                },
            counter = 0,
            shapeButtonsPanel = this.$el.find('.shape-buttons-panel'),
            shapeArray = mainModelNameSpace.SHAPES[type],
            currentShapeNumber;

            this._shapeButtonsArray = [];
            for (counter = 0; counter < numberOfShapes; counter++) {
                var buttonContainer = this._fetchButtonContainer(counter),
                    shape = shapeArray[counter].toLowerCase(),
                    button = null;

                shapeButtonsPanel.append(buttonContainer);

                btnOptions.data.id = idPrefix + shapeButtonId + (counter);
                btnOptions.data.text = this.getMessage(shape + '-button-label', 0);
                btnOptions.data.icon = {
                    'iconPath': this.spriteImagePath,
                    'width': thumbnailSize[shape.toUpperCase()][0],
                    'height': thumbnailSize[shape.toUpperCase()][1]
                };

                button = globalBtn.generateButton(btnOptions);
                this._shapeButtonsArray.push(button);
                button.$el.find('.custom-btn-icon').addClass(shape + '-shape');
                button.$el.attr('shape-id', counter);

            }

            this._bindEventsOnShapeButtons();

            // cube is selected by default
            currentShapeNumber = this.model.get('shapeNumber');
            this._shapeButtonsArray[currentShapeNumber].$el.find('.custom-btn-icon').addClass('selected');
            this._shapeButtonsArray[currentShapeNumber].$el.find('.custom-btn-text').addClass('selected');
            this._shapeButtonsArray[currentShapeNumber].$el.addClass('selected');
        },

        _fetchButtonContainer: function _fetchButtonContainer(number) {
            var buttonContainer = MathInteractives.Common.Interactivities.ShapeSlicer.templates.shapeButton({
                idPrefix: this.idPrefix,
                number: number
            }).trim();

            return buttonContainer;
        },

        /**
         * Binds events on shape button
         *
         * @method _bindEventsOnShapeButtons
         * @private
         **/
        _bindEventsOnShapeButtons: function _bindEventsOnShapeButtons() {
            var shapeButtons = this._shapeButtonsArray,
                arrLength = shapeButtons.length,
                counter = 0;

            for (counter = 0; counter < arrLength; counter++) {
                shapeButtons[counter].$el.off('click').on('click', $.proxy(this._shapeButtonClickHandler, this));
                //                    shapeButtons[counter].$el.off('click').on('click', this._shapeButtonClicked);
            }
        },

        /**
         * Shape button click handler
         *
         * @method _shapeButtonClickHandler
         * @private
         **/
        _shapeButtonClickHandler: function _shapeButtonClickHandler(event) {
            var newShapeId = event.currentTarget.getAttribute('shape-id'),
                oldShapeId = this.model.get('shapeNumber'),
                buttonShape = this._shapeButtonsArray,
                temp;
            this.stopReading();
            this.model.set('shapeNumber', parseInt(newShapeId));

            temp = buttonShape[oldShapeId];
            temp.$el.find('.custom-btn-icon').removeClass('selected');
            temp.$el.find('.custom-btn-text').removeClass('selected');
            temp.$el.removeClass('selected');

            temp = buttonShape[newShapeId];
            temp.$el.find('.custom-btn-icon').addClass('selected');
            temp.$el.find('.custom-btn-text').addClass('selected');
            temp.$el.addClass('selected');
        },



        saveImageClick: function () {
            MathInteractives.Common.Utilities.Models.ScreenUtils.init();
            MathInteractives.Common.Utilities.Models.ScreenUtils.getScreenShot({
                //container: $('#' + self.model.get('containerId') + ' div:first'),
                container: self.$('.explore-tab-left-part-container'),
                type: MathInteractives.Common.Utilities.Models.ScreenUtils.types.BASE64,
                background: 'transparent',
                useCORS: true,
                complete: function (base64Image) {
                    self.model.trigger('save-image', {
                        base64Image: base64Image
                    });
                    $modal.remove();
                    self.player.setModalPresent(false);
                }
            });
        },
        _angleToRadians: function _angleToRadians(angle) {

            return angle * (Math.PI / 180);

        },
        /**
        * Sets the help text for all elements
        *
        * @method _setHelpElements
        * @private
        **/
        _setHelpElements: function _setHelpElements() {
            var helpElements = this.model.get('helpElements');

            helpElements.push(
            {
                elementId: 'shape-buttons-panel',
                helpId: 'shape-buttons-panel-help-text',
                position: 'top', msgId: 0,
                hideArrowDiv: true
            },
            {
                elementId: 'reset-button-container',
                helpId: 'reset-button-container-help-text',
                position: 'left', msgId: 0
            },
            {
                elementId: 'rotate-about-y-axis-button-container',
                helpId: 'rotate-about-y-axis-button-container-help-text',
                position: 'left', msgId: 0,
                hideArrowDiv: true
            },
            {
                elementId: 'left-canvas-container',
                helpId: 'left-canvas-container-help-text',
                position: 'top', msgId: 0, offset: { x: 2, y: 220 },
                tooltipWidth: 465, hideArrowDiv: true
            },
            {
                elementId: 'right-panel-canvas-container',
                helpId: 'right-panel-canvas-container-help-text',
                position: 'top', msgId: 0, fromElementCenter: true,
                tooltipWidth: 320, hideArrowDiv: true
            },

            {
                elementId: 'background-color-selector-container',
                helpId: 'background-color-selector-container-help-text',
                position: 'bottom', msgId: 0,
                tooltipWidth: 278, offset: { x: 67, y: 0 }, hideArrowDiv: true
            },
            {
                elementId: 'color-picker-button-container',
                helpId: 'color-picker-button-container-help-text',
                position: 'top', msgId: 0
            },
            {
                elementId: 'trash-button-container',
                helpId: 'trash-button-container-help-text',
                position: 'top', msgId: 0
            },
            {
                elementId: 'color-picker-container',
                helpId: 'color-picker-container-help-text',
                position: 'bottom', msgId: 0
            },
            {
                elementId: 'clear-button-container',
                helpId: 'clear-button-container-help-text',
                position: 'top', msgId: 0,
                tooltipWidth: 333
            },
            {
                elementId: 'save-image-button-container',
                helpId: 'save-image-button-container-help-text',
                position: 'top', msgId: 0
            },
            {
                elementId: 'view-gallery-button-container',
                helpId: 'view-gallery-button-container-help-text',
                position: 'top', msgId: 0,
                dynamicArrowPosition: true
            },
            {
                elementId: 'explore-tab-direction-text-direction-text-buttonholder',
                helpId: 'explore-tab-direction-text-direction-text-buttonholder-help-text',
                position: 'bottom', msgId: 0,
                dynamicArrowPosition: true
            },

            {
                elementId: 'in-out-cards-0-wrapper',
                helpId: 'in-out-cards-container-help-text',
                position: 'top', msgId: 0, hideArrowDiv: true,
                fromElementCenter: true
            },
            {
                elementId: 'button-side-bar',
                helpId: 'button-side-bar-help-text',
                position: 'bottom', msgId: 0,
                tooltipWidth: 320,
                tooltipHeight: 180,
                hideArrowDiv: true
            },
             {
                 elementId: 'gallery-tab-back-button',
                 helpId: 'gallery-tab-back-button-help-text',
                 position: 'bottom', msgId: 0,
                 dynamicArrowPosition: true
             },
            {
                elementId: 'gallery-tab-direction-text-container-direction-text-buttonholder',
                helpId: 'gallery-tab-direction-text-container-direction-text-buttonholder-help-text',
                position: 'bottom', msgId: 0,
                dynamicArrowPosition: true
            }
            );
        },
        /**
        * Initialize the explore help screen
        *
        * @method _initialExploreHelpScreen
        * @private
        **/
        _initialExploreHelpScreen: function () {

            this.player.enableHelpElement('clear-button-container', 0, false);
            this.player.enableHelpElement('save-image-button-container', 0, false);
            this.player.enableHelpElement('view-gallery-button-container', 0, false);
        }
    }, {
        THUMBNAIL_SIZE: {
            'SPHERE': [24, 24],
            'CONE': [24, 24],
            'CYLINDER': [23, 24],
            'CUBE': [23, 24],
            'TETRAHEDRON': [26, 24],
            'PRISM': [24, 24],
            'PYRAMID': [27, 22],
            'TRIANGULARPRISM': [20, 26]
        },

        'BUTTON_WIDTH': {
            'TOUCH': 162,
            'NON_TOUCH': 163
        }
    });
    //MathInteractives.Common.Interactivities.ShapeSlicer.Views.ExploreShapeSlicer.loadImages();
})();
