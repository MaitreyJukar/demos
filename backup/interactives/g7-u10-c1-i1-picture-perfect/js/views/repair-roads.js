(function () {
    'use strict';

    /**
    * Class for RepairRoad Tab ,  contains properties and methods of Repair Road tab
    *
    * @class RepairRoadTab
    * @module PicturePerfect
    * @namespace MathInteractives.Interactivities.PicturePerfect.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Reference to view of Direction Box
        *
        * @property directionTextView
        * @type Backbone.View
        * @default null
        */
        directionTextView: null,

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
        * Flag for snapping on snapping to path or piece
        *
        * @property accessibilityFlagForSnapping
        * @type Boolean
        * @default false
        */
        accessibilityFlagForSnapping: false,

        /**
        * Reference to view of Start Button
        *
        * @property startButtonView
        * @type Backbone.View
        * @default null
        */
        startButtonView: null,

        /**
        * Reference to view of Next Button
        *
        * @property nextButonView
        * @type Backbone.View
        * @default null
        */
        nextButonView: null,

        /**
        * Stores filepath of the sprite image
        *
        * @property spriteImagePath
        * @type String
        * @default null
        */
        spriteImagePath: null,

        /**
        * Stores filepaths of the animation sprite images
        *
        * @property animationImagePath
        * @type Array
        * @default []
        */
        animationImagePath: [],

        /**
        * Reference to all shape views
        *
        * @property shapeViews
        * @type Array
        * @default []
        */
        shapeViews: [],

        /**
        * Stores a boolean to show try another pop up or not
        *
        * @property showTryAnother
        * @type Boolean
        * @default false
        */
        showTryAnother: false,

        /**
        * Reference to Bounding Box of The View
        *
        * @property boundingBox
        * @type Object
        * @default null
        */
        boundingBox: null,

        /**
        * Reference to Circle Group of The View
        *
        * @property circleGroup
        * @type Object
        * @default null
        */
        circleGroup: null,

        /**
        * Reference to Bounding Box Group of The View
        *
        * @property boundingBoxGroup
        * @type Object
        * @default null
        */
        boundingBoxGroup: null,

        /**
        * Reference to Raster Group of The View
        *
        * @property rasterCircleGroup
        * @type Object
        * @default null
        */
        rasterCircleGroup: null,

        /**
        * Stores a boolean to Check if a shape is dragged or not 
        *
        * @property isMouseDownOnElement
        * @type Boolean
        * @default false
        */
        isMouseDownOnElement: false,

        /**
        * Reference to Tooltip view
        *
        * @property tooltipView
        * @type Backbone.View
        * @default null
        */

        tooltipView: null,

        /**
        * Reference to current snapped shape view
        *
        * @property currentSnappedShapeView
        * @type Backbone.View
        * @default null
        */
        currentSnappedShapeView: null,

        /**
        * Reference to previous Paper Object for Accessibility
        *
        * @property previousItem
        * @type Object
        * @default null
        */
        previousItem: null,

        /**
       * Reference to Model of previous Paper Object for Accessibility
       *
       * @property previousItemModel
       * @type Object
       * @default null
       */
        previousItemModel: null,

        /**
        * Reference to Current Tool 
        *
        * @property currentTool
        * @type Object
        * @default null
        */
        currentTool: null,

        /**
        * Reference to PaperScope
        *
        * @property paperScope
        * @type Object
        * @default null
        */
        paperScope: null,

        /**
        * Boolean for accessibility for direction of rotation
        *
        * @property isRotationClockwise
        * @type Boolean
        * @default true
        */
        isRotationClockwise: true,

        /**
        * Reference to Negative Feedback
        *
        * @property negativeFeedbackRoadRepairedPopup
        * @type Object
        * @default null
        */
        negativeFeedbackRoadRepairedPopup: null,

        /**
        * Boolean for showing negative feedback once
        *
        * @property flagForWrongPath
        * @type Boolean
        * @default true
        */
        flagForWrongPath: true,

        /**
        * Template to be displayed during animation
        *
        * @property $animationScreen
        * @type Object
        * @default null
        */
        $animationScreen: null,

        /**
        * Paper Group parent of all the shapes used for sorting in accessibility 
        *
        * @property masterGroup
        * @type Object
        * @default null
        */
        masterGroup: null,

        /**
        * Reference to Canvas Acc View
        *
        * @property canvasAcc
        * @type Object
        * @default null
        */
        canvasAcc: null,

        /**
        * Boolean for Ordering of Shapes in Accessibility
        *
        * @property orderShapesCalled
        * @type Boolean
        * @default false
        */
        orderShapesCalled: false,

        /**
        * Initializes the repair roads tab
        *
        * @method initialize
        * @constructor 
        */
        initialize: function () {
            this.initializeDefaultProperties();
            var self = this,
                model = this.model;
            this._initializePaperScope();
            this.render();
            if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                model.on('change:cursor', this._changeCursor, this);
            }
            this._setHelpElements();
            this.createTooltip();

            var eventOnCloseBtnClick = MathInteractives.Common.Components.Theme2.Views.Tooltip.EVENTS.TOOLTIP_HIDE_ON_CLOSEBTN_CLICK;
            var eventOnDocumentClick = MathInteractives.Common.Components.Theme2.Views.Tooltip.EVENTS.TOOLTIP_HIDE_ON_DOCUMENT_CLICK;
            this.listenTo(this.tooltipView, eventOnCloseBtnClick, this._changeAnglesColor);
            this.listenTo(this.tooltipView, eventOnDocumentClick, this._changeAnglesColor);
            this.player.bindTabChange(function (data) {
                if (data.isLetsGoClicked !== true) {
                    if (this.model.get('animationComplete')) {
                        this.setFocus('direction-text-container-direction-text-text');
                    }
                    else {
                        this.setFocus('repair-road-activity-area');
                    }
                }
                this.updateFocusRect('direction-text-container-direction-text-text');
            }, this, 1);
            if (this.model.get('activityComplete')) {
                this._showHideNextButton(true);
                this.player.enableHelpElement('activity-canvas', 0, false);
                this.player.enableHelpElement('activity-canvas', 1, false);
            }
        },

        /**
        * Initializes and activates a new paperscope
        *
        * @method _initializePaperScope
        * @private 
        */
        _initializePaperScope: function () {
            this.paperScope = new paper.PaperScope();
            this.paperScope.setup(this.idPrefix + 'activity-canvas');
            this.currentTool = new this.paperScope.Tool();
            this.currentTool.onMouseDrag = function (event) {
                event.preventDefault();
            }
            this.paperScope.activate();
        },

        /**
        * Renders the view of repair roads tab
        *
        * @method render
        * @private 
        */
        render: function () {
            this.loadScreen('repair-roads-screen');
            this.loadScreen('acc-string-screen');
            this._preloadImagePaths();
            this._setBackground();
            this._initializeDirectionText();
            this._renderStartButton();
            this._renderEntirePath();
            this._renderNextButton();
            this._renderBackgroundArea();
            this.model.set('numberOfAngles', {});
            this._initializeShapes();
            if (this.model.get('animationComplete')) {
                this.$('.canvas-container').show();
            }
            else {
                this._setAnimationScreen();
            }
            this.listenToOnce(this, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.SHAPE_CLICKED, function () {
                this.showTryAnother = true;
            });
            this._bindActivityListeners();
            this.bindChangeEvents();
            this._bindActivityCompleteEvent();
            this.loadScreen('button-acc-screen');
            this._loadCanvasForAcc();
        },

        /**
       * Binds Activity Complete and Wrong Activity Complete Listeners
       *
       * @method _bindActivityListeners
       * @private 
       */
        _bindActivityListeners: function () {
            this.listenToOnce(this, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.ACTIVITY_COMPLETE, function () {
                this.showTryAnother = false;
                this._changeBackground();
                this._createRoadRepairedPopup();
                this.canvasAcc.updatePaperItems([]);
                this.player.enableHelpElement('activity-canvas', 0, false);
                this.player.enableHelpElement('activity-canvas', 1, false);
            });
            this.listenToOnce(this, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.ZSHAPE_WRONG_ACTIVITY_COMPLETE, function () {
                this._createNegativeFeedbackRoadRepairedPopup();
            });
        },

        /**
        * Bind the change event of the model attributes
        *
        * @method bindChangeEvents
        * @private 
        */
        bindChangeEvents: function () {
            var self = this;
            this.model.on('change:snappedToX', $.proxy(self.changeSnappedPath, self));
            this.model.on('change:snappedToY', $.proxy(self.changeSnappedPath, self));
            this.model.on('change:snappedToWrongX', $.proxy(self.changeSnappedToWrongPath, self));
            this.model.on('change:snappedToWrongY', $.proxy(self.changeSnappedToWrongPath, self));
            this.model.on('change:roadComplete', $.proxy(self.changeActivityComplete, self));
            this.model.on('change:snappedToPath', $.proxy(self.changeActivityComplete, self));
            this.model.on('change:snappedToWrongPath', $.proxy(self.changeActivityComplete, self));
        },

        /**
        * Renders the view of the direction text box
        *
        * @method _initializeDirectionText
        * @private 
        */
        _initializeDirectionText: function () {

            var directionProperties = {
                containerId: this.idPrefix + 'direction-text-container',
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                text: this.getMessage('direction-text-box-text', 0),
                accText: this.getMessage('direction-text-box-text', 0),
                showButton: true,
                buttonText: this.getMessage('direction-text-box-text', 1),
                btnColorType: MathInteractives.global.Theme2.Button.COLORTYPE.GREEN,
                clickCallback: {
                    fnc: this._onTryAnotherClick,
                    scope: this
                },
                btnBaseClass: 'green-button',
                ttsBaseClass: 'tts-green-button',
                containmentBGcolor: 'rgba(0, 0, 0, 0)',
                textColor: '#FFFFFF',
                tabIndex: 530,
                buttonTabIndex: 1000
            };
            this.directionTextView = MathInteractives.global.Theme2.DirectionText.generateDirectionText(directionProperties);
            this.showHideDirectionText(this.model.get('animationComplete'));
        },

        /**
        * Shows or hides the direction text box
        *
        * @method showHideDirectionText
        * @param show {Boolean} If true, shows the direction text box
        * @private 
        */
        showHideDirectionText: function (show) {
            if (show) {
                this.directionTextView.$el.show();
                this.enableTab('repair-road-activity-area', false);
                this.updateFocusRect('direction-text-container-direction-text-text');
            }
            else {
                this.enableTab('repair-road-activity-area', true);
                this.directionTextView.$el.hide();
            }
        },

        /**
        * Renders the view of the start button
        *
        * @method _renderStartButton
        * @private 
        */
        _renderStartButton: function () {
            var buttonProperties = {
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                data: {
                    id: this.idPrefix + 'start-button-container',
                    text: this.getMessage('button-text', 0),
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    baseClass: 'green-button'
                }
            };
            this.startButtonView = new MathInteractives.global.Theme2.Button.generateButton(buttonProperties);
            this.startButtonView.$el.on('click.start-button', $.proxy(this.onStartClick, this));
            this.showHideStartButton(!this.model.get('animationComplete'));
        },

        /**
        * Shows or hides the start button
        *
        * @method showHideStartButton
        * @param show {Boolean} If true, shows the start button
        * @private 
        */
        showHideStartButton: function (show) {
            if (show) {
                this.startButtonView.showButton();
            }
            else {
                this.startButtonView.hideButton();
            }
        },

        /**
        * Shows or hides the next button
        *
        * @method showHideNextButton
        * @param show {Boolean} If true, shows the start button
        * @private 
        */
        _showHideNextButton: function (show) {
            if (show) {
                var pathDisplayed = this.model.get('pathDisplayed'),
                message,
                modelNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads.ROADTYPES;

                if (pathDisplayed === modelNamespace.RECTANGLESHAPED) {
                    message = this.getMessage('button-text-next', 1);
                    this.nextButtonView.changeText(message);
                    this.changeAccMessage('next-button-container', 0, [message]);
                }
                else if (pathDisplayed === modelNamespace.ZSHAPED) {
                    message = this.getMessage('button-text-next', 0);
                    this.nextButtonView.changeText(message);
                    this.changeAccMessage('next-button-container', 0, [message]);
                }
                this.nextButtonView.showButton();
            }
            else {
                this.nextButtonView.hideButton();
            }
        },

        /**
        * Hides the start button and plays the meteor animation. Called on click of 'Start' button
        *
        * @method onStartClick
        * @private 
        */
        onStartClick: function () {
            this.showHideStartButton(false);
            this._playAnimation();
        },

        /**
        * Renders a pop up for confirming user action
        *
        * @method _onTryAnotherClick
        * @private 
        */
        _onTryAnotherClick: function () {
            MathInteractives.global.SpeechStream.stopReading();
            if (this.showTryAnother) {
                this._showPopup();
            }
            else {
                this._onClikedTryAnotherYes();
            }
        },

        /**
        * Create a pop up for confirming user action
        *
        * @method _showPopup
        * @private 
        */
        _showPopup: function () {
            var data = {
                text: this.getMessage('pop-up-text', 1),
                manager: this.manager,
                player: this.player,
                path: this.filePath,
                idPrefix: this.idPrefix,
                title: this.getMessage('pop-up-text', 0),
                type: MathInteractives.global.Theme2.PopUpBox.CONFIRM,
                buttons: [
                             {
                                 id: 'pop-up-ok',
                                 type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                                 text: this.getMessage('pop-up-text', 2),
                                 clickCallBack: {
                                     fnc: this._onClikedTryAnotherYes,
                                     scope: this
                                 },
                                 response: { isPositive: true, buttonClicked: 'pop-up-ok' }
                             },
                             {
                                 id: 'pop-up-cancel',
                                 type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                                 text: this.getMessage('pop-up-text', 3),
                                 clickCallBack: {
                                     fnc: this._onClikedTryAnotherCancel,
                                     scope: this
                                 },
                                 response: { isPositive: true, buttonClicked: 'pop-up-cancel' }
                             }
                ]
            };
            MathInteractives.global.Theme2.PopUpBox.createPopup(data);
        },

        /**
        * Creates a positive feedback on Road Completion
        *
        * @method _createRoadRepairedPopup   
        * @private 
        */
        _createRoadRepairedPopup: function () {
            if (this.roadRepairedPopup) {
                this.roadRepairedPopup.unbind();
                this.roadRepairedPopup.remove();
                this.roadRepairedPopup.model.destroy();
            }
            this.roadRepairedPopup = MathInteractives.global.Theme2.PopUpBox.createPopup({
                text: this.getMessage('repair-road-feedback-msg', 0),
                manager: this.manager,
                player: this.player,
                path: this.filePath,
                idPrefix: this.idPrefix,
                title: this.getMessage('repair-road-feedback-title', 0),
                bodyTextColorClass: 'repair-road-feedback-msg-text',
                titleTextColorClass: 'repair-road-feedback-title-text',
                buttons: [{
                    id: 'pop-up-ok',
                    text: this.getMessage('feedback-ok-button', 0),
                    baseClass: 'green-button',
                    clickCallBack: {
                        fnc: this._repairRoadPopupClosed,
                        scope: this
                    },
                }],
                backgroundImage: {
                    imageId: 'picture-perfect-image',
                    imageHeight: 424,
                    imageWidth: 479
                },
                backgroundImageBackgroundPosition: '0 -2400px'
            });
            this.roadRepairedPopup.adjustBackgroundImgPos({ top: 159, left: 27 });
            var checkBrowser = MathInteractives.Common.Utilities.Models.BrowserCheck;
            if (checkBrowser.isIOS) {
                this.roadRepairedPopup.$('.theme2-pop-up-tts-container-defaultType').addClass('tts-ios');
                this.roadRepairedPopup.$('.theme2-pop-up-title').addClass('tts-ios-title');
            }
            else {
                this.roadRepairedPopup.$('.theme2-pop-up-tts-container-defaultType').addClass('tts-others');
            }
            this.setFocus('theme2-pop-up-title-text-combined-acc', 250);
            this.tooltipView.hideTooltip();
            this.tooltipView.trigger(MathInteractives.Common.Components.Theme2.Views.Tooltip.EVENTS.TOOLTIP_HIDE_ON_CLOSEBTN_CLICK);
        },

        /**
        * Creates a negative feedback on Z Road Completion but incorrectly snapped
        *
        * @method _createNegativeFeedbackRoadRepairedPopup   
        * @private 
        */
        _createNegativeFeedbackRoadRepairedPopup: function () {
            if (this.negativeFeedbackRoadRepairedPopup) {
                this.negativeFeedbackRoadRepairedPopup.unbind();
                this.negativeFeedbackRoadRepairedPopup.remove();
                this.negativeFeedbackRoadRepairedPopup.model.destroy();
            }
            this.negativeFeedbackRoadRepairedPopup = MathInteractives.global.Theme2.PopUpBox.createPopup({
                text: this.getMessage('negative-repair-road-feedback-msg', 0),
                manager: this.manager,
                player: this.player,
                path: this.filePath,
                idPrefix: this.idPrefix,
                title: this.getMessage('negative-repair-road-feedback-title', 0),
                accTitle: this.getAccMessage('negative-repair-road-feedback-title', 0),
                bodyTextColorClass: 'repair-road-feedback-msg-text',
                titleTextColorClass: 'repair-road-negative-feedback-title-text',
                buttons: [{
                    id: 'pop-up-ok',
                    text: this.getMessage('feedback-ok-button', 0),
                    baseClass: 'green-button',
                    clickCallBack: {
                        fnc: this._negativeRepairRoadPopupClosed,
                        scope: this
                    },
                }],
                backgroundImage: {
                    imageId: 'picture-perfect-image',
                    imageHeight: 424,
                    imageWidth: 479
                },
                backgroundImageBackgroundPosition: '0 -2400px'
            });

            this.negativeFeedbackRoadRepairedPopup.adjustBackgroundImgPos({ top: 159, left: 27 });
            this.negativeFeedbackRoadRepairedPopup.$('.theme2-pop-up-body').addClass('repair-road-negative-feedback-body');
            this.negativeFeedbackRoadRepairedPopup.$('.theme2-pop-up-title').addClass('repair-road-negaitive-feedback-popup-title');
            this.negativeFeedbackRoadRepairedPopup.$('.theme2-pop-up-title-text-combined-acc-defaultType').addClass('repair-road-update-focus-for-negative-feedback');

            var checkBrowser = MathInteractives.Common.Utilities.Models.BrowserCheck;
            if (checkBrowser.isIOS) {
                this.negativeFeedbackRoadRepairedPopup.$('.theme2-pop-up-tts-container-defaultType').addClass('tts-ios repair-road-negaitive-tts');
                this.negativeFeedbackRoadRepairedPopup.$('.theme2-pop-up-title').addClass('tts-ios-title repair-road-negaitive-tts');
            }
            else {
                this.negativeFeedbackRoadRepairedPopup.$('.theme2-pop-up-tts-container-defaultType').addClass('tts-others repair-road-negaitive-tts');
            }
            this.setFocus('theme2-pop-up-title-text-combined-acc', 250);
            this.tooltipView.hideTooltip();
            this.tooltipView.trigger(MathInteractives.Common.Components.Theme2.Views.Tooltip.EVENTS.TOOLTIP_HIDE_ON_CLOSEBTN_CLICK);
        },

        /**
        * On Click Of Ok Button Of PopUp
        *
        * @method _repairRoadPopupClosed   
        * @private 
        */
        _repairRoadPopupClosed: function () {
            this._showHideNextButton(true);

            var pathDisplayed = this.model.get('pathDisplayed'),
                    message,
             modelNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads.ROADTYPES;

            if (pathDisplayed === modelNamespace.RECTANGLESHAPED) {
                message = this.getMessage('button-text-next', 1);
            }
            else if (pathDisplayed === modelNamespace.ZSHAPED) {
                message = this.getMessage('button-text-next', 0);
            }

            this.changeAccMessage('canvas-acc-container', 7, [message]);
            this.setFocus('canvas-acc-container');
        },

        /**
       * On Click Of Ok Button Of Negative PopUp
       *
       * @method _negativeRepairRoadPopupClosed   
       * @private 
       */
        _negativeRepairRoadPopupClosed: function () {
            this.setAccMessage('canvas-acc-container', '');
            this.setFocus('canvas-acc-container');
        },

        /**
        * Render the next button when activity completes
        *
        * @method _renderNextButton  
        * @private
        */
        _renderNextButton: function () {
            var buttonProperties = {
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                data: {
                    id: this.idPrefix + 'next-button-container',
                    text: this.getMessage('button-text-next', 0),
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    baseClass: 'green-button'
                }
            };
            this.nextButtonView = new MathInteractives.global.Theme2.Button.generateButton(buttonProperties);
            this.nextButtonView.$el.on('click.next-button', $.proxy(this._onTryAnotherClick, this));
            this._showHideNextButton(false);
        },

        /**
        * Set various animation screens
        *
        * @method _setAnimationScreen  
        * @private
        */
        _setAnimationScreen: function () {
            this.$animationScreen = $(MathInteractives.Interactivities.PicturePerfect.templates.animation({ idPrefix: this.idPrefix }));
            this.$('.repair-road-activity-area').append(this.$animationScreen);

            var $canvas = this.$('canvas'),
                $meteorScreen1 = this.$('.meteor-animation-screen-1'),
                $meteorScreen2 = this.$('.meteor-animation-screen-2'),
                $meteorScreen3 = this.$('.meteor-animation-screen-3'),
                $redModal = this.$('.red-animation-modal');
            $meteorScreen1.css({
                'background-image': 'url("' + this.animationImagePath[0] + '")'
            });
            $meteorScreen2.css({
                'background-image': 'url("' + this.animationImagePath[1] + '")'
            });
            $meteorScreen3.css({
                'background-image': 'url("' + this.animationImagePath[2] + '")'
            });
        },

        /**
        * Render a new scenario.
        *
        * @method _onClikedTryAnotherYes
        * @private
        */
        _onClikedTryAnotherYes: function () {

            this.showTryAnother = false;
            this.showHideStartButton(true);
            this._showHideNextButton(false);
            this.showHideDirectionText(false);
            this._changePath();
            this.model.set('animationComplete', false);
            this._setAnimationScreen();
            this._changeBackground();
            this._clearCanvas();
            this._clearZombies();
            this.model.set('roadComplete', false);
            this.model.set('activityComplete', false);
            this.model.set('wrongActivityComplete', false);
            this._bindActivityListeners();
            this.paperScope.activate();
            this.model.initializeShapeCollection();
            this._renderEntirePath();
            this._renderBackgroundArea();
            this.model.set('numberOfAngles', {});
            this.model.set('orderOfShapeGroups', []);
            this.model.set('numberOfShapeGroupChildren', {});
            this.model.set('lastSelectedShapeGroup', null);
            this._initializeShapes();
            this.setFocus('repair-road-activity-area');
            this.flagForWrongPath = true;
            this.listenToOnce(this, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.SHAPE_CLICKED, function () {
                this.showTryAnother = true;
            });

            // Set the tooltip dummy div position and arrow type according to the path displayed
            var pathDisplayed = this.model.get('pathDisplayed');
            var modelNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads.ROADTYPES;
            var tooltipClass = MathInteractives.global.Theme2.Tooltip,
                arrowType;
            if (pathDisplayed === modelNamespace.RECTANGLESHAPED) {
                arrowType = tooltipClass.ARROW_TYPE.TOP_MIDDLE;
                this.$('.dummy-tooltip-div').addClass('rect-shape-road');
                this.$('.dummy-tooltip-div').removeClass('z-shape-road');
            }
            else if (pathDisplayed === modelNamespace.ZSHAPED) {
                arrowType = tooltipClass.ARROW_TYPE.BOTTOM_MIDDLE;
                this.$('.dummy-tooltip-div').addClass('z-shape-road');
                this.$('.dummy-tooltip-div').removeClass('rect-shape-road');
            }
            if (this.tooltipView) {
                this.tooltipView.setArrowType(arrowType);
            }

            this.player.enableHelpElement('activity-canvas', 0, true);
            this.player.enableHelpElement('activity-canvas', 1, true);
            //this._loadCanvasForAcc();
            this.canvasAcc.updatePaperItems(this.getPaperObjects());
        },

        /**
        * This function sets the focus rect on try another button.
        *
        * @method _onClikedTryAnotherCancel
        * @private
        */
        _onClikedTryAnotherCancel: function () {
            this.setFocus('direction-text-container-direction-text-buttonholder');
        },

        /**
        * Alternates between the two paths*
        *
        * @method _changePath
        * @private 
        */
        _changePath: function () {
            var modelNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads.ROADTYPES;
            if (this.model.get('pathDisplayed') === modelNamespace.RECTANGLESHAPED) {
                this.model.set('pathDisplayed', modelNamespace.ZSHAPED);
            }
            else {
                this.model.set('pathDisplayed', modelNamespace.RECTANGLESHAPED);
            }
        },

        /**
        * Preloads all required image paths.
        *
        * @method _preloadImagePaths
        * @private 
        */
        _preloadImagePaths: function () {
            this.spriteImagePath = this.getImagePath('picture-perfect-image');
            for (var i = 1; i <= 3; i++) {
                this.animationImagePath.push(this.getImagePath('picture-perfect-animation-' + i));
            }
        },

        /**
        * Sets the background.
        *
        * @method _setBackground
        * @private 
        */
        _setBackground: function () {
            //to do: scenario types store in static part and then compare
            this.$el.css({ 'background-image': 'url("' + this.spriteImagePath + '")' });
            this._changeBackground();
        },

        /**
        * Changes the background based on the scenario.
        *
        * @method _changeBackground
        * @param broken {Boolean} If true, broken path will be displayed
        * @private 
        */
        _changeBackground: function () {
            var modelNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads,
                backgroundClass = modelNamespace.BACKGROUND_CLASSES,
                broken = this.model.get('animationComplete') && (!this.model.get('activityComplete'));
            if (this.model.get('pathDisplayed') === modelNamespace.ROADTYPES.RECTANGLESHAPED) {
                if (broken) {
                    this.$el.removeClass(backgroundClass.RECTANGLE + " " + backgroundClass.BROKEN_ZIGZAG + " " + backgroundClass.ZIGZAG).addClass(backgroundClass.BROKEN_RECTANGLE);
                    this.changeAccMessage('canvas-acc-container', 0, [this.getAccMessage('type-of-path', 1), this.model.get('shapeCollection').length]);
                }
                else {
                    this.$el.removeClass(backgroundClass.BROKEN_ZIGZAG + " " + backgroundClass.ZIGZAG + " " + backgroundClass.BROKEN_RECTANGLE).addClass(backgroundClass.RECTANGLE);
                    this.changeAccMessage('repair-road-activity-area', 0, [this.getAccMessage('type-of-path', 1)]);
                }
            }
            else {
                if (broken) {
                    this.$el.removeClass(backgroundClass.ZIGZAG + " " + backgroundClass.BROKEN_RECTANGLE + " " + backgroundClass.RECTANGLE).addClass(backgroundClass.BROKEN_ZIGZAG);
                    this.changeAccMessage('canvas-acc-container', 0, [this.getAccMessage('type-of-path', 0), this.model.get('shapeCollection').length]);
                }
                else {
                    this.$el.removeClass(backgroundClass.BROKEN_RECTANGLE + " " + backgroundClass.RECTANGLE + " " + backgroundClass.BROKEN_ZIGZAG).addClass(backgroundClass.ZIGZAG);
                    this.changeAccMessage('repair-road-activity-area', 0, [this.getAccMessage('type-of-path', 0)]);
                }
            }
        },

        /**
        * Plays the initial path breaking animation
        *
        * @method _playAnimation
        * @private 
        */
        _playAnimation: function () {

            var $canvas = this.$('canvas'),
                $meteorScreen1 = this.$('.meteor-animation-screen-1'),
                $meteorScreen2 = this.$('.meteor-animation-screen-2'),
                $meteorScreen3 = this.$('.meteor-animation-screen-3'),
                $redModal = this.$('.red-animation-modal');

            this.player.enableHeaderButtons(false);
            var self = this,
                yPosition = -599,
                opacity = 0,
                opacityIncrement = 0.2 / 10,
                imageNo = 1;
            var animationTimer = setInterval(function () {
                switch (imageNo) {
                    case 1:
                        if (yPosition > -4100) {
                            $meteorScreen1.css({
                                'background-position': '0px ' + yPosition + 'px'
                            });
                            $redModal.css({
                                opacity: opacity
                            });
                            yPosition -= 599;
                            opacity += opacityIncrement;
                        }
                        else {
                            imageNo++;
                            $meteorScreen1.css({
                                'background-position': '0px ' + yPosition + 'px'
                            });
                            $meteorScreen2.css({
                                'background-position': '0px -599px'
                            });
                            yPosition = -1198;
                        }
                        break;

                    case 2:
                        if (yPosition > -4100) {
                            $meteorScreen2.css({
                                'background-position': '0px ' + yPosition + 'px'
                            });
                            $redModal.css({
                                opacity: opacity
                            });
                            yPosition -= 599;
                            opacity += opacityIncrement;
                        }
                        else {
                            imageNo++;
                            $meteorScreen2.css({
                                'background-position': '0px ' + yPosition + 'px'
                            });
                            $meteorScreen3.css({
                                'background-position': '0px -599px'
                            });
                            yPosition = -1198;
                        }
                        break;

                    case 3:
                        if (yPosition > -3500) {
                            $meteorScreen3.css({
                                'background-position': '0px ' + yPosition + 'px'
                            });
                            $redModal.css({
                                opacity: opacity
                            });
                            yPosition -= 599;
                            $redModal.fadeOut(400, function () {
                                $redModal.remove();
                            });
                        }
                        else {
                            clearInterval(animationTimer);
                            var directionTextDisplayed = false,
                                canvasDisplayed = false;
                            $meteorScreen3.fadeOut({
                                duration: 1000,
                                step: function (now, fx) {
                                    if (!canvasDisplayed) {
                                        self.model.set('animationComplete', true);
                                        self._changeBackground();
                                        self.$('.canvas-container').fadeIn();
                                        canvasDisplayed = true;
                                    };
                                    // Uncomment if direction text is to be displayed before animation completes
                                    /*
                                    if (now < 0.1 && !directionTextDisplayed) {
                                        self.showHideDirectionText(true);
                                        directionTextDisplayed = true;
                                    };
                                    */
                                },
                                complete: function () {
                                    self.$animationScreen.remove();
                                    self.showHideDirectionText(true);
                                    self.player.enableHeaderButtons(true);
                                    self.setFocus('direction-text-container-direction-text-text');
                                    self.trigger(MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.ANIMATION_COMPLETE);
                                }
                            });
                        }
                        break;

                    default:
                        break;
                }
            }, 50);

        },

        /**
        * Renders the entire path paper object based on the scenario
        *
        * @method _renderEntirePath
        * @private 
        */
        _renderEntirePath: function () {
            if (this.model.get('pathDisplayed') === MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads.ROADTYPES.RECTANGLESHAPED) {
                this._generateRectangularPath();
            }
            else {
                this._generateZigzagPath();
            }
        },

        /**
        * Generates the rectangular path paper object
        *
        * @method _generateRectangularPath
        * @private 
        */
        _generateRectangularPath: function () {
            var viewNamespace = MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab,
                rectCoordinates = this.model.get('rectPathCoordinates'),
                outerRegion = this._generatePath([
                    {
                        x: 0,
                        y: 0
                    }, {
                        x: viewNamespace.CANVAS_SIZE.WIDTH,
                        y: 0
                    }, {
                        x: viewNamespace.CANVAS_SIZE.WIDTH,
                        y: viewNamespace.CANVAS_SIZE.HEIGHT
                    }, {
                        x: 0,
                        y: viewNamespace.CANVAS_SIZE.HEIGHT
                    }
                ]),
                outerPath = this._generatePath(rectCoordinates.outerRectCoordinates),
                innerPath = this._generatePath(rectCoordinates.innerRectCoordinates);
            this.entirePath = new this.paperScope.CompoundPath({
                children: [
                    outerRegion,
                    outerPath,
                    innerPath
                ],
                fillColor: new this.paperScope.Color(0, 0, 1, 0)
            });
        },

        /**
        * Generates a closed path paper object
        *
        * @method _generatePath
        * @param coordinateArray {Array} Stores coordinates of the points of the path
        * @private 
        */
        _generatePath: function (coordinateArray) {
            var path = new this.paperScope.Path();
            for (var i = 0, count = coordinateArray.length; i < count; i++) {
                path.add(new this.paperScope.Point(coordinateArray[i].x, coordinateArray[i].y));
            }
            path.closed = true;
            return path;
        },

        /**
        * Generates the zigzag path paper object
        *
        * @method _generateZigzagPath
        * @private 
        */
        _generateZigzagPath: function () {
            var viewNamespace = MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab,
                zPathCoordinates = this.model.get('zPathCoordinates'),
                outerRegion = this._generatePath([
                    {
                        x: 0,
                        y: 0
                    }, {
                        x: viewNamespace.CANVAS_SIZE.WIDTH,
                        y: 0
                    }, {
                        x: viewNamespace.CANVAS_SIZE.WIDTH,
                        y: viewNamespace.CANVAS_SIZE.HEIGHT
                    }, {
                        x: 0,
                        y: viewNamespace.CANVAS_SIZE.HEIGHT
                    }
                ]),
                zPath = this._generatePath(zPathCoordinates);

            this.entirePath = new this.paperScope.CompoundPath({
                children: [
                    outerRegion,
                    zPath
                ],
                fillColor: new this.paperScope.Color(0, 1, 0, 0)
            });
        },

        /**
        * Renders the background area of the entire canvas
        *
        * @method _renderBackgroundArea
        * @private 
        */
        _renderBackgroundArea: function () {
            var self = this,
                viewNamespace = MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab,
                point = new this.paperScope.Point(0, 0),
                size = new this.paperScope.Size(viewNamespace.CANVAS_SIZE.WIDTH, viewNamespace.CANVAS_SIZE.HEIGHT),
                backgroundArea = new this.paperScope.Path.Rectangle(point, size);
            backgroundArea.fillColor = new this.paperScope.Color(0, 0);
            backgroundArea.on('click', function (event) {
                if ((event.event.which === 1 || event.event.which === 0 ||  MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) && (!self.isMouseDownOnElement)) {
                    self.trigger(viewNamespace.EVENTS.BACKGROUND_CLICKED);
                }
            });
        },

        /**
        * Creates views for each model in collection
        *
        * @method _initializeShapes
        * @private 
        */
        _initializeShapes: function () {

            var shapeView, shapeModel;
            var shapeCollection = this.model.get('shapeCollection'),
                shapeCollectionLength = shapeCollection.length,
                shapeModelsArray = shapeCollection.models,
                shapeViewClass = MathInteractives.Interactivities.PicturePerfect.Views.Shape;
            this._clearAllViews();
            if (this.masterGroup) {
                this.masterGroup.remove();
            }
            this.masterGroup = new this.paperScope.Group();
            for (var i = 0; i < shapeCollectionLength; i++) {
                shapeModel = shapeModelsArray[i];
                shapeView = new shapeViewClass({
                    model: shapeModel,
                    paperScope: this.paperScope,
                    currentTool: this.currentTool,
                    collection: shapeCollection,
                    repairRoadsView: this,
                    entirePath: this.entirePath
                });
                this.shapeViews.push(shapeView);
                this.masterGroup.addChild(shapeModel.get('paperGroupElem'));
            }
            this._initiallyOrderShapes();
            this.paperScope.view.draw();
            this.trigger(MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.SHAPE_GENERATION_COMPLETE);
        },

        /**
        * Clears the entire canvas and hides it's container
        *
        * @method _clearCanvas
        * @private 
        */
        _clearCanvas: function () {
            this.paperScope.project.activeLayer.children = [];
            this.paperScope.view.draw();
            this.$('.canvas-container').hide();
        },

        /**
        * Remove all shape views created
        *
        * @method _clearAllViews
        * @private 
        */
        _clearAllViews: function () {
            var shapeViewsLength = this.shapeViews.length;
            for (var i = 0; i < shapeViewsLength; i++) {
                this.shapeViews[i].remove();
                this.shapeViews[i].unbind();
            }
            this.shapeViews = [];
        },

        /**
        * Deletes all views, models and collection
        *
        * @method _clearZombies
        * @private 
        */
        _clearZombies: function () {
            var shapeCollection = this.model.get('shapeCollection');
            this._clearAllViews();
            shapeCollection.reset();
        },

        /**
        * Set the cursor from the 'cursor' attribute in model to the canvas container
        *
        * @method _changeCursor
        * @private 
        */
        _changeCursor: function () {

            var cursor = this.model.get('cursor'),
            canvasId = "#" + this.idPrefix + 'activity-canvas',
            cursorStr = "";

            switch (cursor) {
                case 0: {
                    cursorStr = 'default';
                    break;
                }
                case 1: {
                    cursorStr = "url('" + this.filePath.getImagePath('open-hand') + "'), move";
                    break;
                }
                case 2: {
                    cursorStr = "url('" + this.filePath.getImagePath('closed-hand') + "'), move";
                    break;
                }
            }
            this.$(canvasId).css({ 'cursor': cursorStr });

        },

        /**
        * Sets up help screen elements.
        *
        * @method _setHelpElements
        * @private
        */
        _setHelpElements: function _setHelpElements() {
            var helpElements = this.model.get('helpElements');

            helpElements.push(
                {
                    elementId: 'start-button-container', helpId: 'start-instruction',
                    msgId: 0,
                    dynamicArrowPosition: true,
                    position: 'top',
                    tooltipWidth: 288
                },
                {
                    elementId: 'activity-canvas', helpId: 'drag-rotate-instruction',
                    fromElementCenter: true, msgId: 0,
                    position: 'bottom'
                },
                {
                    elementId: 'activity-canvas', helpId: 'drag-rotate-instruction',
                    fromElementCenter: true, msgId: 1,
                    position: 'bottom'
                },
                {
                    elementId: 'next-button-container', helpId: 'next-instruction',
                    msgId: 0,
                    dynamicArrowPosition: true,
                    position: 'top'
                }
                );
        },

        /**
        * Create tooltip view
        *
        * @method createTooltip
        * @private 
        */
        createTooltip: function () {
            var tooltipClass = MathInteractives.global.Theme2.Tooltip;
            var arrowType;

            // Set proper class and arrowtype according to the path displayed.
            var pathDisplayed = this.model.get('pathDisplayed');
            if (pathDisplayed === 0) {
                arrowType = tooltipClass.ARROW_TYPE.TOP_MIDDLE;
                this.$('.dummy-tooltip-div').addClass('rect-shape-road');
            }
            else if (pathDisplayed === 1) {
                arrowType = tooltipClass.ARROW_TYPE.BOTTOM_MIDDLE;
                this.$('.dummy-tooltip-div').addClass('z-shape-road');
            }
            var contentWidth = 208;
            var checkBrowser = MathInteractives.Common.Utilities.Models.BrowserCheck;

            if (checkBrowser.isIOS || checkBrowser.isMac) {
                contentWidth = 228;
            }
            var tooltip = tooltipClass.generateTooltip({
                _player: this.player,
                manager: this.manager,
                path: this.filePath,
                idPrefix: this.idPrefix,
                id: 'multiple-tooltip',
                containerHeight: 67,
                containerWidth: contentWidth,
                type: tooltipClass.TYPE.FORM_VALIDATION,
                text: '',
                arrowType: arrowType,
                elementEl: this.idPrefix + 'dummy-tooltip-div',
                tabIndex: -1,
                accText: '',
                closeOnDocumentClick: true,
                showCloseBtn: false,
                filePath: this.filePath,
            });
            this.tooltipView = tooltip;
        },

        /**
        * Show the tooltip by setting its proper height
        *
        * @method showTooltip
        * @private 
        */
        showTooltip: function (mode) {
            var text = "",
                height = 27;
            var shapeNamespace = MathInteractives.Interactivities.PicturePerfect.Views.Shape;

            text = this.getMessage('tooltip-text', mode);
            if (mode === shapeNamespace.ANGLES_TYPE.BOTH) {
                height = 57;
            }
            this.tooltipView.changeText(text, "");
            this.tooltipView.changeContainerHeight(height);

            this.tooltipView.showTooltip();
            this.tooltipView.displayTooltip();
        },

        /**
        * Set low opacity to the angles colors when tooltip is closed
        *
        * @method _changeAnglesColor
        * @private
        */
        _changeAnglesColor: function () {
            if (this.currentSnappedShapeView) {
                var group = this.currentSnappedShapeView.model.get("paperGroupElem"),
                    groupChildren = group.children,
                    length = groupChildren.length,
                    shapeNamespace = MathInteractives.Interactivities.PicturePerfect.Views.Shape;;

                for (var i = 0; i < length; i++) {
                    var shapeGroup = groupChildren[i];

                    if (shapeGroup.children.length > 1) {
                        var angleGroup = shapeGroup.children[shapeNamespace.GROUP_ELEMENT_INDEX.ANGLE_GROUP];
                        if (angleGroup) {
                            var textObj = angleGroup.children;
                            for (var j in textObj) {
                                if (textObj[j].data.isSupplementary || textObj[j].data.isComplementary) {
                                    textObj[j].opacity = 0.5;
                                    textObj[j].data.opacity = 0.5;
                                }
                            }
                        }
                    }
                }
                if (!this.orderShapesCalled) {
                    this._orderShapes();
                }
                else {
                    this.orderShapesCalled = false;
                }
                this.currentSnappedShapeView = null;
            }
        },

        /**
        * Bind the activityComplete event
        *
        * @method _bindActivityCompleteEvent
        * @private
        */
        _bindActivityCompleteEvent: function () {
            var self = this;
            this.model.on('change:activityComplete', $.proxy(self._triggerActivityComplete, self));
            this.model.on('change:wrongActivityComplete', $.proxy(self._triggerWrongActivityComplete, self));
        },

        /**
        * Trigger the activityComplete event
        *
        * @method _bindActivityCompleteEvent
        * @private
        */
        _triggerActivityComplete: function () {
            if (this.model.get('activityComplete')) {
                this.trigger(MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.ACTIVITY_COMPLETE);
            }
        },

        /**
        * Trigger the Wrong ActivityComplete event
        *
        * @method _triggerWrongActivityComplete
        * @private
        */
        _triggerWrongActivityComplete: function () {
            if (this.model.get('wrongActivityComplete')) {
                this.trigger(MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.ZSHAPE_WRONG_ACTIVITY_COMPLETE);
            }
        },

        /**
        * Set the activityComplete attribute
        *
        * @method changeActivityComplete
        * @private
        */
        changeActivityComplete: function () {
            this.model.set('activityComplete', this.model.get('snappedToPath') && this.model.get('roadComplete'));
            this.model.set('wrongActivityComplete', this.model.get('snappedToWrongPath') && this.model.get('roadComplete'));
        },

        /**
        * Set the snappedToPath attribute
        *
        * @method changeSnappedPath
        * @private
        */
        changeSnappedPath: function () {
            this.model.set('snappedToPath', this.model.get('snappedToX') && this.model.get('snappedToY'));
        },

        /**
        * Set the snappedToWrongPath attribute
        *
        * @method changeSnappedToWrongPath
        * @private
        */
        changeSnappedToWrongPath: function () {
            this.model.set('snappedToWrongPath', this.model.get('snappedToWrongX') && this.model.get('snappedToWrongY'));
        },


        /*------ canvas accessibility ----*/
        /**
        * Loads the canvas
        *
        * @method _loadCanvasForAcc
        * @private
        */
        _loadCanvasForAcc: function () {
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
        _initAccessibility: function () {
            if (this.canvasAcc) {
                this.canvasAcc.unbind();
                this.canvasAcc.model.destroy();
            }
            var canvasAccOption = {
                canvasHolderID: this.idPrefix + 'canvas-acc-container',
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
                $canvasHolder = $('#' + this.idPrefix + 'canvas-acc-container');

            this._bindSpaceForAccessibility();
            // Handle tab
            $canvasHolder.off(keyEvents.TAB).on(keyEvents.TAB, function (event, data) {
                self._tabKeyPressed(event, data);
            });

            // Handle focus out
            $canvasHolder.off(canvasEvents.FOCUS_OUT).on(canvasEvents.FOCUS_OUT, function (event, data) {
                self._focusOut(event, data);
            });

            $canvasHolder.off(keyEvents.ARROW).on(keyEvents.ARROW, function (event, data) {
                self._hideToolTipForAccessibility();
                self._arrowKeyPressed(event, data);
                $canvasHolder.off(keyUpEvents.ARROW_KEYUP).on(keyUpEvents.ARROW_KEYUP, function (event, data) {
                    self._handleOnArrowKeyUp(event, data);
                    $canvasHolder.off(keyUpEvents.ARROW_KEYUP);
                });
            });

            $canvasHolder.off(keyEvents.ROTATE_CLOCKWISE).on(keyEvents.ROTATE_CLOCKWISE, function (event, data) {
                self._hideToolTipForAccessibility();
                self._rotateShape(event, data, true);
                self._bindRotationUp();

            });
            $canvasHolder.off(keyEvents.ROTATE_ANTI_CLOCKWISE).on(keyEvents.ROTATE_ANTI_CLOCKWISE, function (event, data) {
                self._hideToolTipForAccessibility();
                self._rotateShape(event, data, false);
                self._bindRotationUp();

            });
        },

        /**
        * Binds Keys on Canvas
        *
        * @method _bindAccessibilityListeners
        * @private
        */
        _bindRotationUp: function () {
            var self = this,
                   keyUpEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEYUP_EVENTS,
                   $canvasHolder = $('#' + this.idPrefix + 'canvas-acc-container');

            $canvasHolder.off(keyUpEvents.ROTATION_KEYUP).on(keyUpEvents.ROTATION_KEYUP, function (event, data) {
                self._handleOnRotationKeyUp(event, data);
                $canvasHolder.off(keyUpEvents.ROTATION_KEYUP);
            });
        },

        /**
        * Hides tool tip for accessibility
        *
        * @method _hideToolTipForAccessibility
        * @private
        */
        _hideToolTipForAccessibility: function () {
            var self = this;
            if (self.tooltipView) {
                self.tooltipView.hideTooltip();
                self.tooltipView.trigger(MathInteractives.Common.Components.Theme2.Views.Tooltip.EVENTS.TOOLTIP_HIDE_ON_CLOSEBTN_CLICK);
            }
        },

        /**
        * Unbinds Space Key
        *
        * @method _unbindSpaceForAccessibility
        * @private
        */
        _unbindSpaceForAccessibility: function _unbindSpaceForAccessibility() {
            var keyEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS,
                 $canvasHolder = $('#' + this.idPrefix + 'canvas-acc-container');

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
                 $canvasHolder = $('#' + this.idPrefix + 'canvas-acc-container'),
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

            this.tooltipView.hideTooltip();
            this.tooltipView.trigger(MathInteractives.Common.Components.Theme2.Views.Tooltip.EVENTS.TOOLTIP_HIDE_ON_CLOSEBTN_CLICK);

            if (this.previousItem !== null) {
                event.fromTabKey = true;
                self.currentTool.trigger('mouseup', event);
            }

            var self = this;
            this.previousItem = data.item;
            var eventObj = self._createEvent(event, data);

            if (data.item.children.length !== 0) {
                data.item.trigger('mousedown', eventObj);
                if (data.item.children.length !== this.model.get('shapeCollection').length) {
                    var anglesArrayToBePassed = self._readAnglesOfShape(data.item),
                     numberOfAngles = anglesArrayToBePassed.length;
                    if (numberOfAngles !== 4) {
                        //For all Pieces except triangle piece
                        self.changeAccMessage('canvas-acc-container', 1, anglesArrayToBePassed);
                    }
                    else {
                        //For a Triangle Piece
                        self.changeAccMessage('canvas-acc-container', 6, anglesArrayToBePassed);
                    }
                }
                else {
                    self.changeAccMessage('canvas-acc-container', 9);
                }
            }
        },

        /**
        * Reads the angle
        *
        * @method _readAnglesOfShape
        * @param {Object} shape Paper group
        * @return {Array} Array of angles to be read
        * @private
        */
        _readAnglesOfShape: function (shape) {
            var self = this;
            var anglesObject = self.model.get('anglesToBeRead'),
             totalNumberOfPieces = (shape).children.length,
                 anglesArrayToBePassed = [];

            if (totalNumberOfPieces === 1) {
                anglesArrayToBePassed.push(self.getAccMessage('type-of-piece', 0));
            }
            else {
                anglesArrayToBePassed.push(self.getAccMessage('type-of-piece', 1));
            }

            var arrxycoordinates = self._getXYCoordinates(anglesObject),
             dummyShape = new this.paperScope.Path(arrxycoordinates),
             centercoordinate;
            centercoordinate = dummyShape.position;
            dummyShape.remove();
            var multiDimensionalAngleArray = self._getAngleArray(arrxycoordinates, centercoordinate);

            for (var i in multiDimensionalAngleArray) {
                var arrayOfAngle = (multiDimensionalAngleArray[i])[2];

                if (arrayOfAngle.length === 1) {
                    anglesArrayToBePassed.push(arrayOfAngle[0]);
                }
                else if (totalNumberOfPieces === 15 && this._hasAllFourCorners(shape)) {
                    anglesArrayToBePassed.push(arrayOfAngle[0], arrayOfAngle[1]);
                }
                else {
                    anglesArrayToBePassed.push(self.getAccMessage('angle-made-of-two-angles', 0, [arrayOfAngle[0], arrayOfAngle[1], (parseInt(arrayOfAngle[0]) + parseInt(arrayOfAngle[1]))]));
                }
            }
            return anglesArrayToBePassed;

        },

        /**
        * Checks if has all four corners
        *
        * @method _hasAllFourCorners
        * @param {Object} shape Paper group
        * @return {Boolean} Returns true if has all four corners
        * @private
        */
        _hasAllFourCorners: function (shape) {
            var symbols = shape.getItems({
                data: 'rectangle-endpoint-symbol'
            });

            var totalSymbols = symbols.length,
                count = 0;

            for (var i = 0; i < totalSymbols; i++) {
                var currentSymbolName = symbols[i].name;

                if (currentSymbolName.indexOf('corner') > -1 && currentSymbolName.indexOf('inner') > -1) {
                    count++;
                }

                if (count === 4) {
                    return true;
                }
            }
            return false;
        },

        /**
        * Returns the x and y coordinates 
        *
        * @method _getXYCoordinates
        * @param {Object} anglesObject angles to be read from repair roads model
        * @return {Array} Array of x and y coordinate
        * @private
        */
        _getXYCoordinates: function (anglesObject) {
            var arrxycoordinates = [],
                self = this;
            for (var i in anglesObject) {
                arrxycoordinates.push(new Array(new self.paperScope.Point(parseInt(i.slice(i.indexOf('x') + 2, i.indexOf('y') - 1)), parseInt(i.slice(i.indexOf('y') + 2, i.length))), anglesObject[i]));
            }
            return arrxycoordinates;
        },

        /**
        * Returns array of angles with the center point
        *
        * @method _getAngleArray
        * @param {Object} arrxycoordinates array of sy coordinate
        * @param {Object} centercoordinate center coordinate
        * @return {Array} Array of sorted angles and coordinate
        * @private
        */
        _getAngleArray: function (arrxycoordinates, centercoordinate) {
            var arrxycoordinatesLength = arrxycoordinates.length,
                arrAngleDeg = [];

            for (var i = 0; i < arrxycoordinatesLength; i++) {
                arrAngleDeg[i] = Math.atan2(arrxycoordinates[i][0].y - centercoordinate.y, arrxycoordinates[i][0].x - centercoordinate.x) * 180 / Math.PI;
            }
            return this._sortAngleAndPoints(arrAngleDeg, arrxycoordinates);
        },

        /**
        * Returns sorted array of coordinates and angles
        *
        * @method _sortAngleAndPoints
        * @param {Object} arrAngleDeg array of angle formed with center point
        * @param {Object} arrxycoordinates array of sy coordinate
        * @return {Array} Array of sorted angles and coordinate
        * @private
        */
        _sortAngleAndPoints: function (arrAngleDeg, arrxycoordinates) {
            var multiDimensionalArray = [],
                arrAngleDegLength = arrAngleDeg.length;
            for (var i = 0; i < arrAngleDegLength; i++) {
                multiDimensionalArray.push(new Array(arrAngleDeg[i], arrxycoordinates[i][0], arrxycoordinates[i][1]));
            }
            multiDimensionalArray.sort(function (a, b) {
                if (a[0] < b[0]) return 1;
                if (a[0] > b[0]) return -1;
                return 0;
            });
            return multiDimensionalArray;
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
                angle;

            event.target = data.item;
            event.event = { which: data.event.which };
            event.isAccessible = true;
            this.setAccMessage('canvas-acc-container', '');
            if (isRotationClockwise) {
                event.rotateAngle = (MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.TRIANGLE_ROTATE_ANGLE);
            }
            else {
                event.rotateAngle = -(MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.TRIANGLE_ROTATE_ANGLE);
            }

            this.trigger(MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.ACCESSIBILITY_ROTATE, event);

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
            var self = this;
            event.fromTabKey = true;
            self.currentTool.trigger('mouseup', event);
            var pathDisplayed = self.model.get('pathDisplayed'),
             modelNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads.ROADTYPES;
            self._hideToolTipForAccessibility();

            if (pathDisplayed === modelNamespace.RECTANGLESHAPED) {
                self.changeAccMessage('canvas-acc-container', 0, [self.getAccMessage('type-of-path', 1), self.model.get('shapeCollection').length]);
            }
            else if (pathDisplayed === modelNamespace.ZSHAPED) {
                self.changeAccMessage('canvas-acc-container', 0, [self.getAccMessage('type-of-path', 0), self.model.get('shapeCollection').length]);
            }

            self.trigger(MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.BACKGROUND_CLICKED);
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
            event.isAccessible = true;
            this.setAccMessage('canvas-acc-container', '');
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

            var self = this,
                id = 0;
            this.accessibilityFlagForSnapping = false;
            this.currentTool.trigger('mouseup', event);
            if (!self.accessibilityFlagForSnapping) {
                if (data.keyCode === MathInteractives.global.CanvasAcc.KEYS.LEFTARROW) {
                    id = 0;
                }
                else if (data.keyCode === MathInteractives.global.CanvasAcc.KEYS.RIGHTARROW) {
                    id = 1;
                }
                else if (data.keyCode === MathInteractives.global.CanvasAcc.KEYS.UPARROW) {
                    id = 2;
                }
                else if (data.keyCode === MathInteractives.global.CanvasAcc.KEYS.DOWNARROW) {
                    id = 3;
                }

                this.changeAccMessage('canvas-acc-container', 2, [this.getAccMessage('type-of-direction', id)]);
                this._setFocusOnCanvas();
            }
            /*
            else {
                this.listenToOnce(this, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.ORDERING_COMPLETE, $.proxy(self._selectPreviousItem, self, event, data));
                return;
            }
            */
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
            if (this.previousItem && this.previousItem.children.length !== 0 && this.isFocusOnCanvas && !this.model.get('activityComplete')) {
                var self = this;
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
            var self = this,
                id = 0;
            this.accessibilityFlagForSnapping = false;
            this.trigger(MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.ACCESSIBILITY_ROTATE_UP, event);
            event.isRotate = true;
            if (!self.accessibilityFlagForSnapping) {
                if (data.keyCode === MathInteractives.global.CanvasAcc.KEYS.ROTATE_CLOCKWISE) {
                    id = 0;
                }
                else if (data.keyCode === MathInteractives.global.CanvasAcc.KEYS.ROTATE_ANTI_CLOCKWISE) {
                    id = 1;
                }

                this.changeAccMessage('canvas-acc-container', 3, [this.getAccMessage('type-of-rotation', id)]);
                this._setFocusOnCanvas();
            }
            /*
            else {
                this.listenToOnce(this, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.ORDERING_COMPLETE, $.proxy(self._selectPreviousItem, self, event, data));
                return;
            }
            */
            this._selectPreviousItem(event, data);
        },

        /**
        * Returns the paper objects according to current step.
        *
        * @method getPaperObjects
        * @return {Array} Array of paper objects
        * @public
        */
        getPaperObjects: function getPaperObjects() {

            var viewArray = this.shapeViews,
                viewArrayLength = viewArray.length,
                model,
                paperObjects = [];
            this.previousItem = null;
            this.previousItemModel = null;
            for (var i = 0; i < viewArrayLength; i++) {
                model = viewArray[i].model;
                if (!model.get('notUsable')) {
                    paperObjects[model.get('slotNumber')] = model.get('paperGroupElem');
                }
            }
            //_compact is used to remove null,blank spaces in array
            return _.compact(paperObjects);
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

        /**
        * Updates Shape Children Count
        *
        * @method _updateShapeChildrenCount
        * @param shapeToBeAdded{Object} Shape to be added
        * @param shapeToBeRemoved{Object} Shape to be removed
        * @private
        */
        _updateShapeChildrenCount: function (shapeToBeAdded, shapeToBeRemoved) {
            if (shapeToBeAdded !== shapeToBeRemoved) {
                var model = this.model,
                shapeOrder = model.get('orderOfShapeGroups'),
                childrenCount = model.get('numberOfShapeGroupChildren'),
                indexOfShapeToBeRemoved = shapeOrder.indexOf(shapeToBeRemoved);
                shapeOrder.splice(indexOfShapeToBeRemoved, 1);
                childrenCount[shapeToBeAdded] += childrenCount[shapeToBeRemoved];
                delete childrenCount[shapeToBeRemoved];
            }
        },

        /**
       * Updates Shape Order
       *
       * @method _updateShapeOrder
       * @private
       */
        _updateShapeOrder: function () {
            var model = this.model,
                shapeOrder = model.get('orderOfShapeGroups'),
                childrenCount = model.get('numberOfShapeGroupChildren'),
                lastSelectedShape = this.model.get('lastSelectedShapeGroup'),
                indexToBeMovedTo = 0;

            for (var shapeIndex = 1, totalShapes = shapeOrder.length; shapeIndex < totalShapes; shapeIndex++) {
                if (childrenCount[shapeOrder[0]] > childrenCount[shapeOrder[shapeIndex]]) {
                    indexToBeMovedTo = shapeIndex;
                }
                else {
                    break;
                }
            }
            if (indexToBeMovedTo !== 0) {
                this.moveArrayElement(shapeOrder, 0, indexToBeMovedTo);
            }
        },

        /**
       * Moves Array Elements
       *
       * @method moveArrayElement
       * @param array{Object} Array on which action is to be performed
       * @param from{Integer} index from
       * @param to{Integer} index to
       * @private
       */
        moveArrayElement: function (array, from, to) {
            return array.splice(to, 0, array.splice(from, 1)[0]);
        },

        /**
        * Updates Shape Order
        *
        * @method _orderShapes
        * @private
        */
        _orderShapes: function () {
            this._updateShapeOrder();
            var model = this.model,
                shapeOrder = model.get('orderOfShapeGroups'),
                childrenCount = model.get('numberOfShapeGroupChildren'),
                currentShape = null,
                lastSelectedShape = this.model.get('lastSelectedShapeGroup'),
                shapeIndex = lastSelectedShape ? shapeOrder.indexOf(lastSelectedShape) : shapeOrder.length - 1;
            for (; shapeIndex >= 0; shapeIndex--) {
                currentShape = this.paperScope.project.getItems({
                    name: shapeOrder[shapeIndex]
                });
                if (currentShape.length > 0) {
                    currentShape[0].bringToFront();
                }
            }
            this.paperScope.view.draw();
        },

        /**
        * Updates Order of First Element
        *
        * @method updateOrderOfFirstElement
        * @private
        */
        updateOrderOfFirstElement: function () {
            var lastSelectedShape = this.model.get('lastSelectedShapeGroup');
            if (lastSelectedShape) {
                var shapeOrder = this.model.get('orderOfShapeGroups'),
                    currentIndex = shapeOrder.indexOf(lastSelectedShape);
                if (currentIndex !== 0) {
                    this.moveArrayElement(shapeOrder, currentIndex, 0);
                }
            }
        },

        /**
        * Orders shapes initially
        *
        * @method _initiallyOrderShapes
        * @private
        */
        _initiallyOrderShapes: function () {
            var model = this.model,
                shapeOrder = model.get('orderOfShapeGroups'),
                currentShape = null,
                shapeIndex = shapeOrder.length - 1;
            for (; shapeIndex >= 0; shapeIndex--) {
                currentShape = this.paperScope.project.getItems({
                    name: shapeOrder[shapeIndex]
                });
                if (currentShape.length > 0) {
                    currentShape[0].bringToFront();
                }
            }
        }

    }, {
        /**
        * Events
        *
        * @property EVENTS
        * @static
        */
        EVENTS: {
            BACKGROUND_CLICKED: 'background-clicked',
            SHAPE_CLICKED: 'shape-clicked',
            SHAPE_SNAPPED: 'shape-snapped',
            SHAPE_ROTATED: 'shape-rotated',
            PATH_SNAPPED: 'path-snapped',
            COMPLETE_PATH_SNAPPED: 'complete-path-snapped',
            ANIMATION_COMPLETE: 'meteor-animation-complete',
            SHAPE_GENERATION_COMPLETE: 'shape-generation-complete',
            ACTIVITY_COMPLETE: 'activity-complete',
            ACCESSIBILITY_ROTATE: 'accessibility-rotate',
            ACCESSIBILITY_ROTATE_UP: 'accessibility-rotate-up',
            ZSHAPE_WRONG_ACTIVITY_COMPLETE: 'zshape-wrong-activity-complete',
            PULSE_ANIMATION_COMPLETE: 'angles-pulse-animation-complete',
            ORDERING_COMPLETE: 'ordering-complete'
        },

        /**
        * Canvas size
        *
        * @property CANVAS_SIZE
        * @static
        */
        CANVAS_SIZE: {
            HEIGHT: 512,
            WIDTH: 928
        },
        /**
    * Angle by which to rotate triangle using <R> and <E> keys
    *
    * @property TRIANGLE_ROTATE_ANGLE
    * @public
    * @static
    * @namespace MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab
    */
        TRIANGLE_ROTATE_ANGLE: 5
    })
})()