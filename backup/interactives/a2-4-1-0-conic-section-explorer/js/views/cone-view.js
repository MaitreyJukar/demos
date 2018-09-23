(function () {
    'use strict';

    var cango3DWrapperClass = MathInteractives.Common.Components.Theme2.Models;

    /**
    * Drawing cone, plane and intersection between cone and plane
    * @class ConeView
    * @construtor
    * @extends Backbone.View
    * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views
    */
    MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Reference to model of cango 3d wrapper
        *
        * @property cango3dWrapper
        * @type Backbone.Model
        * @default null
        */
        cango3dWrapper: null,

        /**
        * Its holds the canvas width
        *
        * @property canvasWidth
        * @type Object
        * @default null
        */
        canvasWidth: null,

        /**
        * Its holds the canvas height
        *
        * @property canvasHeight
        * @type Object
        * @default null
        */
        canvasHeight: null,

        /**
        * Its holds the id of cone
        *
        * @property movedConeID
        * @type Object
        * @default 'movedCone'
        */
        movedConeID: 'movedCone',

        /**
        * Its holds the id of cube
        *
        * @property movedCubeID
        * @type Object
        * @default 'movedCube'
        */
        movedCubeID: 'movedCube',

        /**
        * Its holds the id of cone group
        *
        * @property coneGrpID
        * @type Object
        * @default 'coneGroup'
        */
        coneGrpID: 'coneGroup',

        /**
        * Its holds the id of plane
        *
        * @property planeID
        * @type Object
        * @default 'plane'
        */
        planeID: 'plane',

        /**
        * Its holds the id of plane wrapper
        *
        * @property planeWrapperID
        * @type Object
        * @default 'plane'
        */
        planeWrapperID: 'planeWrapper',

        /**
        * Its holds the id of conic section 
        *
        * @property conicSectionID
        * @type Object
        * @default 'conicSection'
        */
        conicSectionID: 'conicSection',

        /**
        * Its holds the mouse point 
        *
        * @property grabMousePt
        * @type Object
        * @default null
        */
        grabMousePt: null,

        /**
        * Reference to view of plane slope spinner
        *
        * @property planeSlopSpinner
        * @type Backbone.View
        * @default null
        */
        planeSlopSpinner: null,

        /**
        * Reference to view of plane offset spinner
        *
        * @property planeOffsetSpinner
        * @type Backbone.View
        * @default null
        */
        planeOffsetSpinner: null,

        /**
        * Reference to view of cone height spinner
        *
        * @property coneHeightSpinner
        * @type Backbone.View
        * @default null
        */
        coneHeightSpinner: null,

        /**
        * Reference to view of cone slope spinner
        *
        * @property coneSlopSpinner
        * @type Backbone.View
        * @default null
        */
        coneSlopSpinner: null,

        /**
        * Its hold the conic section is present or not
        *
        * @property isConicSectionPresent
        * @type Boolean
        * @default false
        */
        isConicSectionPresent: false,

        /**
        * Its hold the timestamp of set interval 
        *
        * @property timerId
        * @type Object
        * @default null
        */
        timerId: null,

        /**
        * Its hold the timestamp of set interval for animation
        *
        * @property animationTimerId
        * @type Object
        * @default null
        */
        animationTimerId: null,

        /**
        * Reference to view of rotate about x axis button
        *
        * @property rotateAboutXAxisBtnView
        * @type Backbone.View
        * @default null
        */
        rotateAboutXAxisBtnView: null,

        /**
        * Reference to view of rotate about y axis button
        *
        * @property rotateAboutYAxisBtnView
        * @type Backbone.View
        * @default null
        */
        rotateAboutYAxisBtnView: null,

        /**
        * Reference to view of rotate about z axis button
        *
        * @property rotateAboutZAxisBtnView
        * @type Backbone.View
        * @default null
        */
        rotateAboutZAxisBtnView: null,

        /**
        * Reference to view of reset graph button
        *
        * @property resetGraphBtnView
        * @type Backbone.View
        * @default null
        */
        resetGraphBtnView: null,

        /**
        * Its hold the sprite path
        *
        * @property spritePath
        * @type Object
        * @default null
        */
        spritePath: null,

        /**
        * Its hold the refernce of canvas
        *
        * @property canvasElem
        * @type Object
        * @default null
        */
        canvasElem: null,
        /**
        * Stores a boolean whether the cone is rotating
        *
        * @property isConeRotating
        * @type Boolean
        * @default false
        */
        isConeRotating: false,
        /**
        * Stores the number of times drag event has been fired
        *
        * @property dragCount
        * @type Number
        * @default 0
        */
        dragCount: 0,

        /**
        * Its hold the rotating button acc text
        *
        * @property rotatingAccButtonText
        * @type Object
        * @default null
        */
        rotatingAccButtonText: null,

        /**
        * Its hold the rotating angle of cone
        *
        * @property rotatingAngle
        * @type Object
        * @default 0
        */
        rotatingAngle: 0,
        /*
       * Stores the most recent keyup event.
       * @property _lastArrowKeyUpEvent
       * @default null
       * @type Object
       */
        _lastArrowKeyUpEvent: null,
        /*
        * Stores the item on which the most recent keyup event was fired.
        * @property _lastArrowKeyUpItem
        * @default null
        * @type Object
        */
        _lastArrowKeyUpItem: null,
        /*
        * Stores the number of times keydown has been fired before the next keydown.
        * @property _previousArrowKeyDownCount
        * @default 0
        * @type Number
        */
        _previousArrowKeyDownCount: 0,
        /*
        * Stores the number of times keydown has been fired.
        * @property _currentArrowKeyDownCount
        * @default 0
        * @type Number
        */
        _currentArrowKeyDownCount: 0,
        /*
        * Stores the window interval for triggering keyup.
        * @property _keyUpInterval
        * @default null
        * @type Number
        */
        _keyUpInterval: null,

        /*
        * Stores a boolean whether the cone has been reset.
        * @property resetCone
        * @default true
        * @type Boolean
        */
        resetCone: true,
        /*
        * Stores a boolean whether reset button has been clicked once.
        * @property firstReset
        * @default true
        * @type Boolean
        */
        firstReset: true,

        /*
        * Stores a boolean whether browser is Safari.
        * @property isSafari
        * @default null
        * @type Boolean
        */
        isSafari: null,
        /*
        * Stores animation offset.
        * @property animationInterval
        * @default 30
        * @type Number
        */
        animationInterval: 30,
        /*
        * Stores the initial angle before first animation.
        * @property initialAnimationAngle
        * @default 300
        * @type Number
        */
        initialAnimationAngle: 300,
        /**
        * Initializes the model properties.
        * @method initialize
        */
        initialize: function () {
            var self = this;
            this.initializeDefaultProperties();
            this._setBrowserChecks();
            this._setAreas();
            this.listenTo(this.player, MathInteractives.Common.Player.Views.Player.Events.SECOND_STEP_INTERACTIVE_LOAD_COMPLETE, this._secondStepLoadComplete);
            this.listenTo(this.model, MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab.EVENTS.ANIMATION_START_OF_CONIC_SECTION, this._disableAllButtons);
            this.listenTo(this.model, MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab.EVENTS.ANIMATION_END_OF_CONIC_SECTION, this._enableAllButtons);
            this.spritePath = this.filePath.getImagePath('sprite-image');
            this.$('.plane-data-container').off('keyup').on('keyup', $.proxy(this._keyUpOnPlaneDataContainer, this))
                                            .on('focusin', function (event) {
                                                if (self.$(event.target).parent().hasClass('plane-data-container')) {
                                                    self._disableTabIndexForPlaneSpinner();
                                                }
                                            });
            this.$('.cone-data-container').off('keyup').on('keyup', $.proxy(this._keyUpOnConeDataContainer, this))
                                           .off('focusin').on('focusin', function (event) {
                                               if (self.$(event.target).parent().hasClass('cone-data-container')) {
                                                   self._disableTabIndexForPlaneSpinner();
                                                   self._disableTabIndexForConeSpinner();
                                               }
                                           });
            this.listenTo(this.model, MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab.EVENTS.GRAPH_CONTAINER_FOCUS_OUT, $.proxy(this._disableTabIndexForConeSpinner, this));
        },
        /**
        * Sets browser check boolean for Safari and sets initial animation values for Safari on iPad.
        * @method initialize
        */
        _setBrowserChecks: function () {
            this.isSafari = MathInteractives.Common.Utilities.Models.BrowserCheck.isSafari;
            if (this.isSafari && this.isMobile) {
                this.animationInterval = 20;
                this.initialAnimationAngle = 290;
            }
        },

        /**
        * creates the DOM required for the screen
        * @method _setAreas
        * @private
        */
        _setAreas: function _setAreas() {
            $(MathInteractives.Interactivities.ConicSectionExplorer.templates['conicSection']({ 'idPrefix': this.idPrefix }).trim()).appendTo(this.$el);
        },

        /**
        * Initializes the 3D objects.
        * @method initialize3DObject
        */
        initialize3DObject: function () {
            var idPrefix = this.idPrefix,
                canvasElem = this.$('#' + idPrefix + 'activity-canvas');
            this.canvasHeight = canvasElem[0].height;
            this.canvasWidth = canvasElem[0].width;
            this.cango3dWrapper = new cango3DWrapperClass.Cango3DWrapper({ canvasId: idPrefix + 'activity-canvas' });
        },

        /**
        * Binds events to listeners
        * @property events
        **/
        events: {
            'click .conic-reset-button.clickEnabled': '_onResetConicBtnClick',
            'mouseenter .activity-canvas': '_onCanvasMouseenter',
            'mouseleave .activity-canvas': '_onCanvasMouseleave',
            'mouseup .activity-canvas': '_onCanvasMouseUp'
        },

        /**
        * Render the view
        * @method render
        */
        render: function () {
            this._createSpinners();
        },

        /**
        * Create the spinners for cone and plane
        * @method _createSpinners
        */
        _createSpinners: function _createSpinners() {
            var model = this.model,
                defaultMsg = null,
                coneHeight = model.get('coneHeight'),
                coneSlop = model.get('coneSlop'),
                planeOffset = model.get('planeOffset'),
                planeSlop = model.get('planeSlop'),
                namespace = MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView,
                spinnerNamespace = MathInteractives.global.Theme2.CustomSpinner,
                spinnerAccPlaceholder = [spinnerNamespace.CURR_VAL],
            planeSpinnerButtonWidth = namespace.PLANE_SPINNER_BUTTON_WIDTH,
            planeSpinnerButtonHeight = namespace.PLANE_SPINNER_BUTTON_HEIGHT,
            planeSpinnerInputHeight = namespace.PLANE_SPINNER_INPUT_HEIGHT,
            coneSpinnerButtonWidth = namespace.CONE_SPINNER_BUTTON_WIDTH,
            coneSpinnerButtonHeight = namespace.CONE_SPINNER_BUTTON_HEIGHT,
            coneSpinnerInputHeight = namespace.CONE_SPINNER_INPUT_HEIGHT,
            spinnerInputBoxColor = namespace.SPINNER_INPUT_BOX_COLOR,
            buttonFontSize = namespace.FONT_AWESOME_FONT_SIZE,
            options = null;
            defaultMsg = this.getAccMessage('spinner-text', 2);
            //options for plane slope spinner
            options = {
                spinId: this.idPrefix + 'plane-slop-custom-spinner-container',
                path: this.filePath,
                manager: this.manager,
                idPrefix: this.idPrefix,
                player: this.player,
                isEditable: false,
                minValue: -40,
                maxValue: 40,
                value: planeSlop,
                inputPrecision: 1,
                step: 0.1,
                textBoxStyle: {
                    backgroundColor: spinnerInputBoxColor
                },
                alignType: spinnerNamespace.VERTICAL_ALIGN,
                inputType: MathInteractives.Common.Components.Theme2.Views.InputBox.INPUT_TYPE_CUSTOM,
                buttonBaseClass: 'plane-slope-button',
                inputCustomClass: 'plane-slope-input',
                buttonWidth: planeSpinnerButtonWidth,
                buttonHeight: planeSpinnerButtonHeight,
                inputBoxWidth: planeSpinnerButtonWidth,
                inputBoxHeight: planeSpinnerInputHeight,
                upBtnFontAwesomeClass: 'sort-up',
                downBtnFontAwesomeClass: 'sort-down',
                buttonFontSize: 24,
                tabIndex: 630,
                upArrowAccText: this.getAccMessage('spinner-text', 0),
                downArrowAccText: this.getAccMessage('spinner-text', 1),
                defaultAccText: defaultMsg,
                onIncreaseAccText: defaultMsg,
                onDecreaseAccText: defaultMsg,
                minLimitAccText: defaultMsg,
                maxLimitAccText: defaultMsg,
                onIncreasePlaceHolders: spinnerAccPlaceholder,
                onDecreasePlaceHolders: spinnerAccPlaceholder,
                defaultPlaceHolders: spinnerAccPlaceholder,
                minLimitPlaceHolders: [spinnerNamespace.MIN_VAL],
                maxLimitPlaceHolders: [spinnerNamespace.MAX_VAL]
            };
            this.planeSlopSpinner = this._renderCustomSpinner(options, this._planeSlopValueChanged);

            defaultMsg = this.getAccMessage('spinner-text', 5);
            options.spinId = this.idPrefix + 'plane-offset-custom-spinner-container';
            options.value = planeOffset;
            options.step = 0.1;
            options.minValue = -5;
            options.maxValue = 5;
            options.buttonBaseClass = 'plane-offset-button';
            options.inputCustomClass = 'plane-offset-input';
            options.tabIndex = 660;
            options.upArrowAccText = this.getAccMessage('spinner-text', 3);
            options.downArrowAccText = this.getAccMessage('spinner-text', 4);
            options.defaultAccText = defaultMsg;
            options.onIncreaseAccText = defaultMsg;
            options.onDecreaseAccText = defaultMsg;
            options.minLimitAccText = defaultMsg;
            options.maxLimitAccText = defaultMsg;
            this.planeOffsetSpinner = this._renderCustomSpinner(options, this._planeOffsetValueChanged);

            defaultMsg = this.getAccMessage('spinner-text', 8);
            options.spinId = this.idPrefix + 'cone-height-custom-spinner-container';
            options.minValue = 1;
            options.maxValue = 10;
            options.step = 1;
            options.value = coneHeight;
            options.buttonBaseClass = 'cone-height-button';
            options.inputCustomClass = 'cone-height-input';
            options.buttonWidth = coneSpinnerButtonWidth;
            options.buttonHeight = coneSpinnerButtonHeight;
            options.inputBoxWidth = coneSpinnerButtonWidth;
            options.inputBoxHeight = coneSpinnerInputHeight;
            options.tabIndex = 730;
            options.upArrowAccText = this.getAccMessage('spinner-text', 6);
            options.downArrowAccText = this.getAccMessage('spinner-text', 7);
            options.defaultAccText = defaultMsg;
            options.onIncreaseAccText = defaultMsg;
            options.onDecreaseAccText = defaultMsg;
            options.minLimitAccText = defaultMsg;
            options.maxLimitAccText = defaultMsg;
            this.coneHeightSpinner = this._renderCustomSpinner(options, this._coneHeightValueChanged);

            defaultMsg = this.getAccMessage('spinner-text', 11);
            options.spinId = this.idPrefix + 'cone-slop-custom-spinner-container';
            options.minValue = 0.1;
            options.value = coneSlop;
            options.step = 0.1;
            options.buttonBaseClass = 'cone-slop-button';
            options.inputCustomClass = 'cone-slop-input';
            options.tabIndex = 760;
            options.upArrowAccText = this.getAccMessage('spinner-text', 9);
            options.downArrowAccText = this.getAccMessage('spinner-text', 10);
            options.defaultAccText = defaultMsg;
            options.onIncreaseAccText = defaultMsg;
            options.onDecreaseAccText = defaultMsg;
            options.minLimitAccText = defaultMsg;
            options.maxLimitAccText = defaultMsg;
            this.coneSlopSpinner = this._renderCustomSpinner(options, this._coneSlopValueChanged);
        },

        /**
        * Render the spinner
        * @method _renderCustomSpinner
        */
        _renderCustomSpinner: function (options, valueChangeCallback) {
            var self = this,
               spinnerView = MathInteractives.global.Theme2.CustomSpinnerExtended.generateCustomSpinner(options);
            self.listenTo(spinnerView, MathInteractives.global.Theme2.CustomSpinner.VALUE_CHANGED, valueChangeCallback);
            return spinnerView;
        },

        /**
        * Call back for the second step interactivity load complete
        * @method _secondStepLoadComplete
        */
        _secondStepLoadComplete: function () {
            var model = this.model,
                self = this;
            this._generateGraphButtons();
            this.loadScreen('button-screen');
            this.render();

            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(this.$('.conic-rotate-about-x-axis-button'));
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(this.$('.conic-rotate-about-y-axis-button'));
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(this.$('.conic-rotate-about-z-axis-button'));
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(this.$('.rotate-button'));
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(this.$('.canvas-container'));
            this.$('.conic-rotate-about-x-axis-button').off('mousedown.rotate-x-button').on('mousedown.rotate-x-button', $.proxy(this._onRotateAboutXAxisMD, this))
                                                       .off('keydown.rotate-x-button').on('keydown.rotate-x-button', $.proxy(this._onRotateAboutXAxisMD, this));

            this.$('.conic-rotate-about-y-axis-button').off('mousedown.rotate-y-button').on('mousedown.rotate-y-button', $.proxy(this._onRotateAboutYAxisMD, this))
                                                        .off('keydown.rotate-y-button').on('keydown.rotate-y-button', $.proxy(this._onRotateAboutYAxisMD, this));

            this.$('.conic-rotate-about-z-axis-button').off('mousedown.rotate-z-button').on('mousedown.rotate-z-button', $.proxy(this._onRotateAboutZAxisMD, this))
                                                       .off('keydown.rotate-z-button').on('keydown.rotate-z-button', $.proxy(this._onRotateAboutZAxisMD, this));

            this.$('.rotate-button').off('mouseup.rotate-button').on('mouseup.rotate-button', $.proxy(this._onRotateMU, this))
                                    .off('keydown.rotate-button').on('keydown.rotate-button', function (event) {
                                        if (event.keyCode === 32 || event.keyCode === 13) {
                                            console.log('keydown triggerd');
                                            self._handleArrowUpTrigger(event);
                                        }
                                    })
                                     .off('keyup.rotate-button').on('keyup.rotate-button', function (event) {
                                         console.log('key up');
                                         if (event.keyCode === 32 || event.keyCode === 13) {
                                             event.preventDefault();
                                             self._lastArrowKeyUpEvent = event;
                                         }
                                     });
            this.$('.canvas-container').off('focusout.canvas-focusout').on('focusout.canvas-focusout', function (event) {
                if (self.$(event.target).parent().hasClass('canvas-container')) {
                    self.changeAccMessage('canvas-container', 0);
                }
            });
            //this.model.trigger(MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab.EVENTS.ANIMATION_START_OF_CONIC_SECTION);
            this._renderCone();
            this.changeAccMessage('plane-data-container', 0, [model.get('planeSlop'), model.get('planeOffset')]);
            this.changeAccMessage('cone-data-container', 0, [model.get('coneHeight'), model.get('coneSlop')]);
        },

        /**
        * Draw plane when slop value change
        * @method _planeSlopValueChanged
        */
        _planeSlopValueChanged: function _planeSlopValueChanged() {
            var planeSlop = parseFloat(this.planeSlopSpinner.model.get('value')),
                model = this.model;
            this.changeAccMessage('plane-data-container', 0, [planeSlop, model.get('planeOffset')]);
            model.set('planeSlop', planeSlop);
            model.set('showPopupOnTryAnother', true);
            this._initializeCone();
            this._resetLast3DPosition();
        },

        /**
        * Draw plane when offset value change
        * @method _planeOffsetValueChanged
        */
        _planeOffsetValueChanged: function _planeOffsetValueChanged() {
            var planeOffset = parseFloat(this.planeOffsetSpinner.model.get('value')),
                model = this.model;
            this.changeAccMessage('plane-data-container', 0, [model.get('planeSlop'), planeOffset]);
            model.set('planeOffset', planeOffset);
            model.set('showPopupOnTryAnother', true);
            this._initializeCone();
            this._resetLast3DPosition();
        },

        /**
        * Draw whole cone when its height change
        * @method _coneHeightValueChanged
        */
        _coneHeightValueChanged: function _coneHeightValueChanged() {
            var coneHeight = parseFloat(this.coneHeightSpinner.model.get('value')),
                model = this.model,
                heightFactor = model.get('heightFactor'),
                slant = model.get('coneSlop'),
                radius = (coneHeight * heightFactor / 2) / slant,
                planeOffset = null;
            this.planeOffsetSpinner.setMinMaxValue(parseFloat(-(coneHeight / 2).toFixed(1)), parseFloat((coneHeight / 2).toFixed(1)));
            planeOffset = parseFloat(this.planeOffsetSpinner.model.get('value'));
            this.changeAccMessage('cone-data-container', 0, [coneHeight, model.get('coneSlop')]);
            this.changeAccMessage('plane-data-container', 0, [model.get('planeSlop'), planeOffset]);
            model.set('planeOffset', planeOffset);
            model.set('coneRadius', radius);
            model.set('coneHeight', coneHeight);
            model.set('showPopupOnTryAnother', true);

            this._initializeCone();
            this._resetLast3DPosition();
        },

        /**
        * Draw whole cone when its slop change
        * @method _coneSlopValueChanged
        */
        _coneSlopValueChanged: function () {
            var slant = parseFloat(this.coneSlopSpinner.model.get('value')),
                model = this.model,
                coneHeight = model.get("coneHeight"),
                heightFactor = model.get('heightFactor'),
                radius = (coneHeight * heightFactor / 2) / slant;
            this.changeAccMessage('cone-data-container', 0, [model.get('coneHeight'), slant]);
            model.set('coneRadius', radius);
            model.set('coneSlop', slant);
            model.set('showPopupOnTryAnother', true);
            this._initializeCone();
            this._resetLast3DPosition();
        },

        /**
        * Render the cone when second step load complete
        * @method _renderCone
        * @private
        */
        _renderCone: function () {
            var startAngle = this.initialAnimationAngle;

            this.initialize3DObject();

            // Set the origin to the center of canvas.
            this.cango3dWrapper.setWorldCoordinates(-this.canvasWidth / 2, -this.canvasHeight / 2, this.canvasWidth);

            // Set cone to 300 deg and animate to its flat view.
            this.resetConeView(startAngle, false, true);
            this.animateCone();
        },

        /**
        * Reset the cone view
        * @method resetConeView
        */
        resetConeView: function (startAngle, changeValueOfSpinner, isAnimating, fromResetButton) {
            var model = this.model,
                coneHeight = null;

            if (changeValueOfSpinner === true) {
                coneHeight = model.get('coneHeight');
                this.planeSlopSpinner.setSpinBoxValue(model.get('planeSlop'));
                this.planeOffsetSpinner.setSpinBoxValue(model.get('planeOffset'));
                this.coneHeightSpinner.setSpinBoxValue(coneHeight);
                this.coneSlopSpinner.setSpinBoxValue(model.get('coneSlop'));
                this.planeOffsetSpinner.setMinMaxValue(parseFloat(-(coneHeight / 2).toFixed(1)), parseFloat((coneHeight / 2).toFixed(1)));
            }

            this.resetCone = true;

            this.cango3dWrapper.clearCanvas();

            this.cango3dWrapper.deleteGroup(this.movedCubeID);
            this.cango3dWrapper.deleteGroup(this.movedConeID);
            this.cango3dWrapper.deleteGroup(this.planeWrapperID);

            // Create moved cube group
            this.cango3dWrapper.createGroup3D(this.movedCubeID);
            // Create moved cone group
            this.cango3dWrapper.createGroup3D(this.movedConeID);
            // Create plane wrapper group
            this.cango3dWrapper.createGroup3D(this.planeWrapperID);


            // Create the cone and plane
            this._initializeCone();

            this._initializeCube();
            this.cango3dWrapper.rotate(this.movedCubeID, 1, 0, 0, startAngle, false);
            // Rotate the moved cone group for the flat view.
            this.cango3dWrapper.rotate(this.movedConeID, 1, 0, 0, startAngle, false);

            this.cango3dWrapper.rotate(this.planeWrapperID, 1, 0, 0, startAngle, false);
            if (!isAnimating) {
                this.cango3dWrapper.clearCanvas();
                this._initializeCube();
                this._initializeCone();
                this._resetLast3DPosition();
                this._enableObjectDragging();
            }
            if (this.isSafari && this.firstReset && fromResetButton) {
                var self = this;
                window.setTimeout(function () {
                    self.resetConeView(270);
                }, 100);
            }
            this.resetGraphBtnView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
        },
        /**
        * Resets the last 3D-position of the object
        * @method _resetLast3DPosition
        */
        _resetLast3DPosition: function () {
            if (this.resetCone) {
                this.cango3dWrapper.rotate(this.movedConeID, 1, 0, 0, 270, true);
                this.cango3dWrapper.rotate(this.planeWrapperID, 1, 0, 0, 270, true);
            }
            this.resetCone = false;
            this.cango3dWrapper.renderObj([this.movedCubeID, this.movedConeID, this.planeWrapperID]);
        },

        /**
        * Animate the cone
        * @method animateCone
        */
        animateCone: function () {
            var angle = 0,
                self = this,
                count = this.animationInterval;
            this.animationInterval = 30;
            this._disableObjectDragging();
            // Trigger animation start event
            this.model.trigger(MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab.EVENTS.ANIMATION_START_OF_CONIC_SECTION);

            var rotateTimer = function () {
                window.clearInterval(self.animationTimerId);
                self.animationTimerId = window.setInterval(function () {
                    //self.cango3dWrapper.rotate(self.movedCubeID, 1, 0, 0, -3, true);
                    self.cango3dWrapper.rotate(self.movedConeID, 1, 0, 0, -3, true);
                    self.cango3dWrapper.rotate(self.planeWrapperID, 1, 0, 0, -3, true);
                    self.cango3dWrapper.renderObj([self.movedCubeID, self.movedConeID, self.planeWrapperID]);
                    angle += 3;
                    if (angle > count) {
                        window.clearInterval(self.animationTimerId);
                        self._enableObjectDragging();
                        // Trigger animation end event
                        self.model.trigger(MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab.EVENTS.ANIMATION_END_OF_CONIC_SECTION);
                    }
                }, 100);
            }
            setTimeout(rotateTimer, 10);

        },

        /**
        * Initialize the wrapper cube of cone of canvas size
        * @method _initializeCube
        * @private
        */
        _initializeCube: function () {
            var cubeID = 'wrapperCube';
            this.cango3dWrapper.createGroup3D(cubeID);

            var z1 = this.canvasHeight / 2,
                z2 = -this.canvasHeight / 2;

            var topCorners = [this.cango3dWrapper.toWorldCoordinates3D(0, 0, z1),
                   this.cango3dWrapper.toWorldCoordinates3D(this.canvasWidth, 0, z1),
                   this.cango3dWrapper.toWorldCoordinates3D(this.canvasWidth, this.canvasHeight, z1),
                   this.cango3dWrapper.toWorldCoordinates3D(0, this.canvasHeight, z1)];

            var bottomCorners = [this.cango3dWrapper.toWorldCoordinates3D(0, 0, z2),
                       this.cango3dWrapper.toWorldCoordinates3D(this.canvasWidth, 0, z2),
                       this.cango3dWrapper.toWorldCoordinates3D(this.canvasWidth, this.canvasHeight, z2),
                       this.cango3dWrapper.toWorldCoordinates3D(0, this.canvasHeight, z2)];

            var faces = [topCorners, bottomCorners];
            var faceIndex = 0;
            for (var j = 0; j < 2; j++) {
                var corners = faces[j];
                var sq = ["M"];
                for (var i = 0; i < 4; i++) {
                    sq[sq.length] = corners[i].x;
                    sq[sq.length] = corners[i].y;
                    sq[sq.length] = corners[i].z;
                    if (i == 0) {
                        sq[sq.length] = "L";
                    }
                }
                sq[sq.length] = "Z";
                var faceId = 'face' + faceIndex;
                faceIndex++;
                this.cango3dWrapper.create3DPath(faceId, sq, 'rgba(255,255,255,0)');
                this.cango3dWrapper.addObjToGroup(faceId, cubeID);
            }
            for (var j = 0; j < 4; j++) {
                var sq = ["M"];
                var index = j;

                sq[sq.length] = topCorners[index].x;
                sq[sq.length] = topCorners[index].y;
                sq[sq.length] = topCorners[index].z;

                sq[sq.length] = "L";
                sq[sq.length] = bottomCorners[index].x;
                sq[sq.length] = bottomCorners[index].y;
                sq[sq.length] = bottomCorners[index].z;

                index = (index + 1) % 4;
                sq[sq.length] = "L";
                sq[sq.length] = bottomCorners[index].x;
                sq[sq.length] = bottomCorners[index].y;
                sq[sq.length] = bottomCorners[index].z;

                sq[sq.length] = "L";
                sq[sq.length] = topCorners[index].x;
                sq[sq.length] = topCorners[index].y;
                sq[sq.length] = topCorners[index].z;

                sq[sq.length] = "Z";
                var faceId = 'face' + faceIndex;
                faceIndex++;
                this.cango3dWrapper.create3DPath(faceId, sq, 'rgba(255,255,255,0)');
                this.cango3dWrapper.addObjToGroup(faceId, cubeID);
            }
            this.cango3dWrapper.addObjToGroup(cubeID, this.movedCubeID);
        },

        /**
        * Initialize the cone
        * @method _initializeCone
        * @private
        */
        _initializeCone: function () {
            this.cango3dWrapper.deleteObjFromGroup(this.coneGrpID, this.movedConeID);
            var coneId = this._createCone();

            // Create the cone group which has cone object as child
            this.cango3dWrapper.createGroup3D(this.coneGrpID);
            this.cango3dWrapper.addObjToGroup(coneId, this.coneGrpID);

            // Add cone group in the moved cone group
            this.cango3dWrapper.addObjToGroup(this.coneGrpID, this.movedConeID);

            this._createPlane();
        },

        /**
        * Create the double cone
        * @method _createCone
        * @private
        */
        _createCone: function () {
            var Cango3DWrapper = cango3DWrapperClass.Cango3DWrapper,
                model = this.model,
                heightFactor = model.get('heightFactor'),
                radius = model.get("coneRadius"),
                height = model.get('coneHeight'),
                namespace = MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView,
                coneColor = namespace.CONE_COLOR,
                coneThickness = namespace.CONE_THICKNESS,
                coneLinesColor = namespace.CONE_LINES_COLOR,
                coneFillColor = namespace.CONE_FILL_COLOR,
                coneFillThickness = namespace.CONE_FILL_THICKNESS,
                degInc = 1,
                lineDegDelta = 30;

            height = height * heightFactor;

            var sq = Cango3DWrapper.getCircleShapeCmds(radius * 2),
                topCircle = 'topCircle',
                bottomCircle = 'bottomCircle',
                lineGrp = 'lines',
                cone = 'cone';

            this.cango3dWrapper.create3DPath(topCircle, sq, coneColor, coneThickness);
            this.cango3dWrapper.create3DPath(bottomCircle, sq, coneColor, coneThickness);

            this.cango3dWrapper.translate(topCircle, 0, 0, height / 2, false);
            this.cango3dWrapper.translate(bottomCircle, 0, 0, -height / 2, false);

            this.cango3dWrapper.createGroup3D(lineGrp);

            // Create lines of top circles.
            for (var deg = 0; deg <= 360; deg += degInc) {
                var lineCo = ['M', radius * Math.cos(deg * Math.PI / 180), radius * Math.sin(deg * Math.PI / 180), height / 2, 'L', 0, 0, 0];
                var lineId = 'topLine' + deg;
                if (deg % lineDegDelta) {
                    //Draw Fill
                    this.cango3dWrapper.create3DPath(lineId, lineCo, coneFillColor, coneFillThickness);
                }
                else {
                    //Draw Line
                    this.cango3dWrapper.create3DPath(lineId, lineCo, coneLinesColor, coneThickness);
                }
                this.cango3dWrapper.addObjToGroup(lineId, lineGrp);
            }

            // Create lines of bottom circles.
            for (var deg = 0; deg <= 360; deg += degInc) {
                var lineCo = ['M', radius * Math.cos(deg * Math.PI / 180), radius * Math.sin(deg * Math.PI / 180), -height / 2, 'L', 0, 0, 0];
                var lineId = 'bottomLine' + deg;
                if (deg % lineDegDelta) {
                    //Draw Fill
                    this.cango3dWrapper.create3DPath(lineId, lineCo, coneFillColor, coneFillThickness);
                }
                else {
                    //Draw Line
                    this.cango3dWrapper.create3DPath(lineId, lineCo, coneLinesColor, coneThickness);
                }
                this.cango3dWrapper.addObjToGroup(lineId, lineGrp);
            }

            this.cango3dWrapper.createGroup3D(cone);
            this.cango3dWrapper.addObjToGroup(topCircle, cone);
            this.cango3dWrapper.addObjToGroup(bottomCircle, cone);
            this.cango3dWrapper.addObjToGroup(lineGrp, cone);

            return cone;
        },

        /**
        * Cone grab callback
        * @method grabCone
        * @param mousePos{object} Current mouse position
        * @param context3D{object} Context of object
        */
        grabCone: function (mousePos, context3D) {
            this.stopReading();
            this.model.set('cursor', 'closed-hand');
            this.grabMousePt = mousePos;
        },

        /**
        * Cone drag callback
        * @method dragCone
        * @param mousePos{object} Current mouse position
        * @param context3D{object} Context of object
        */
        dragCone: function (mousePos, context3D) {
            // To prevent continue render of canvas on each drag to prevent sluggishness, mostly occur in IE9
            if (this.dragCount % 5 === 0) {
                var CangoWrapper = cango3DWrapperClass.Cango3DWrapper;
                this.model.set('cursor', 'closed-hand');
                this.resetGraphBtnView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                // This drag function rotates an object around its drawing origin
                // assume a lever from drawing origin to drag point z=diameter is moved by csr
                var dragPt = { x: this.grabMousePt.x - context3D.grabOfs.x, y: this.grabMousePt.y - context3D.grabOfs.y, z: 200 },
                    csrPt = { x: mousePos.x - context3D.grabOfs.x, y: mousePos.y - context3D.grabOfs.y, z: 200 },
                    u, theta;

                this.grabMousePt = mousePos;
                // axis to rotate lever is the normal to plane defined by the 3 points
                u = CangoWrapper.calculateNormal(context3D.dwgOrg, dragPt, csrPt);
                // calc angle between dragPt and csrPt (amount of rotation needed about axis 'u')
                theta = CangoWrapper.calculateIncAngle(context3D.dwgOrg, dragPt, csrPt);    // degrees
                // apply this drag rotation to 'cube' Group3D
                //this.cango3dWrapper.rotate(this.movedCubeID, u.x, u.y, u.z, theta, true);
                this.cango3dWrapper.rotate(this.movedConeID, u.x, u.y, u.z, theta, true);
                this.cango3dWrapper.rotate(this.planeWrapperID, u.x, u.y, u.z, theta, true);
                //this.resetCone = false;

                this.cango3dWrapper.renderObj([this.movedCubeID, this.movedConeID, this.planeWrapperID]);
            }
            this.dragCount++;
        },

        /**
        * Create plane that cuts cone
        * @method _createPlane
        * @private
        */
        _createPlane: function () {
            this.cango3dWrapper.deleteObjFromGroup(this.planeID, this.planeWrapperID);
            var model = this.model,
                bound = model.get('coneRadius'),
                slop = model.get('planeSlop'),
                offset = model.get('planeOffset'),
                heightFactor = model.get('heightFactor'),
                coneHeight = model.get('coneHeight'),
                namespace = MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView,
                planeColor = namespace.PLANE_COLOR,
                planeStrokeColor = namespace.PLANE_STROKECOLOR,
                planeThickness = namespace.PLANE_THICKNESS;

            offset = offset * heightFactor;
            coneHeight = coneHeight * heightFactor;

            var point1 = [1, 1, 1],
                point2 = [1, -1, 1],
                point3 = [-1, -1, -1],
                point4 = [-1, 1, -1];
            var corners = [point1, point2, point3, point4];

            var index = 0, count = 4;
            while (index < count) {
                corners[index][0] = corners[index][0] * bound;
                corners[index][1] = corners[index][1] * bound;
                corners[index][2] = corners[index][2] * bound;
                index++;
            }

            index = 0;
            while (index < count) {
                var zOffset = (corners[index][0] * slop) + offset;
                if (Math.abs(zOffset * 2) > this.canvasHeight && Math.abs(slop) >= 1) {
                    // if either bound goes out of the canvas then make it to the highest range,
                    // and consequently change the value of x (z=mx+c).
                    corners[index][2] = (this.canvasHeight / 2) * (zOffset / Math.abs(zOffset));
                    corners[index][0] = (corners[index][2] - offset) / slop;
                }
                else {
                    corners[index][2] = zOffset;
                }
                index++;
            }

            var sq = ["M"];
            for (index = 0; index < count; index++) {
                sq[sq.length] = corners[index][0];
                sq[sq.length] = corners[index][1];
                sq[sq.length] = corners[index][2];

                if (index == 0) {
                    sq[sq.length] = "L";
                }
            }
            sq[sq.length] = "Z";

            var planeOutlinID = 'planeOutline',
                planeFillID = 'palneFill';

            this.cango3dWrapper.createGroup3D(this.planeID);

            this.cango3dWrapper.create3DPath(planeOutlinID, sq, planeStrokeColor, planeThickness);
            this.cango3dWrapper.create3DShape(planeFillID, sq, planeColor, planeColor);

            this.cango3dWrapper.addObjToGroup(planeOutlinID, this.planeID);
            this.cango3dWrapper.addObjToGroup(planeFillID, this.planeID);

            this.cango3dWrapper.addObjToGroup(this.planeID, this.planeWrapperID);

            this._findConicSection();
        },

        /**
        * Compute the intersection points between cone and plane
        * @method _findConicSection
        * @private
        */
        _findConicSection: function () {
            // Create intersection of plane and cone
            this.cango3dWrapper.createGroup3D(this.conicSectionID);

            var slant = this.model.get('coneSlop'),
                slop = this.model.get('planeSlop'),
                offset = this.model.get('planeOffset'),
                heightFactor = this.model.get('heightFactor');

            offset = offset * heightFactor;

            if (Math.abs(slop) < slant) {
                if (offset === 0) {
                    this._drawPoint();
                }
                else {
                    this._calculateEllipsePoints(slant, slop, offset);
                }
            }
            else if (Math.abs(slop) === slant) {
                if (offset === 0) {
                    this._calculateLinePoints(slop);
                }
                else {
                    this._calculateParabolaPoints(slant, slop, offset);
                }
            }
            else if (Math.abs(slop) > slant) {
                this._calculateHyperbolaPoints(slant, slop, offset);
            }

            if (this.isConicSectionPresent) {
                this.cango3dWrapper.addObjToGroup(this.conicSectionID, this.planeID);
                this.isConicSectionPresent = false;
            }
            this.cango3dWrapper.renderObj([this.movedCubeID, this.movedConeID, this.planeWrapperID]);
        },

        /**
        * Compute coordinates to draw th ellipse
        * @method _calculateEllipsePoints
        * @param slant{Number} Slop of Cone
        * @param slop{Number} Slop of Plane
        * @param offset{Number} Height of Plane
        * @private
        */
        _calculateEllipsePoints: function (slant, slop, offset) {
            var minorAxis = ((-Math.abs(offset)) / Math.sqrt(((slant * slant) - (slop * slop)))),
                count = 150,
                incrementFactor = (((-minorAxis) - minorAxis) / (count - 1)),
                a = ((slop * slop) - (slant * slant)),
                b = (2 * slop * offset),
                index = 0,
                y, c, disc, x1, x2, z1, z2,
                heightFactor = this.model.get('heightFactor'),
                equationConstants = {};

            var coordinates1 = [], coordinates2 = [];

            while (index < count) {
                y = (minorAxis + (index * incrementFactor));
                c = ((offset * offset) - (((slant * slant) * y) * y));
                disc = ((b * b) - (4 * a * c));
                if (disc < 0) {
                    disc = 0;
                }
                disc = Math.sqrt(disc);
                x1 = ((-b - disc) / (2 * a));
                x2 = ((-b + disc) / (2 * a));
                z1 = ((slop * x1) + offset);
                z2 = ((slop * x2) + offset);

                coordinates1[coordinates1.length] = x1;
                coordinates1[coordinates1.length] = y;
                coordinates1[coordinates1.length] = z1;

                coordinates2[coordinates2.length] = x2;
                coordinates2[coordinates2.length] = y;
                coordinates2[coordinates2.length] = z2;

                index++;
            }
            // Equation of ellipse: Ax2 + Bx + Cy2 + E=0
            // console.log("A:" + a + " B:" + b + " C:" + (-(slant*slant)) + " E:" + (offset * offset));

            var leftSectionID = "ellipseLeftSection",
                rightSectionID = "ellipseRightSection";

            var curves = this._makeRangeBound(coordinates1);
            for (var i = 0; i < curves.length; i++) {
                this._drawConicSection(curves[i], leftSectionID + (i + 1));
            }
            curves = this._makeRangeBound(coordinates2);
            for (var i = 0; i < curves.length; i++) {
                this._drawConicSection(curves[i], rightSectionID + (i + 1));
            }

            offset = offset / heightFactor;
            equationConstants.A = a;
            equationConstants.B = (2 * slop * offset);
            equationConstants.C = (-(slant * slant));
            equationConstants.D = 0;
            equationConstants.E = (offset * offset);
            equationConstants.fill = false;
            if (slop === 0) {
                equationConstants.type = 'circle';
            } else {
                equationConstants.type = 'ellipse';
            }

            this.model.set('equationConstants', equationConstants);
        },

        /**
        * Compute coordinates to draw the parabola
        * @method _calculateParabolaPoints
        * @param slant{Number} Slop of Cone
        * @param slop{Number} Slop of Plane
        * @param offset{Number} Height of Plane
        * @private
        */
        _calculateParabolaPoints: function (slant, slop, offset) {
            var coneHeight = this.model.get('coneHeight'),
                heightFactor = this.model.get('heightFactor'),
                radius = this.model.get('coneRadius'),
                equationConstants = {};

            coneHeight = (coneHeight * heightFactor) / 2;

            var y, x, z,
                   count = 150,
                   incrementFactor = (radius - (-radius)) / (count - 1),
                   a = (slant * slant) / (2 * slop * offset),
                   c = -(offset * offset) / (2 * slop * offset),
                   index = 0;
            var coordinates = [];

            while (index < count) {
                y = (-radius) + (index * incrementFactor);
                x = (a * y * y) + c;
                z = (slop * x) + offset;

                if (z <= coneHeight && z >= -coneHeight) {
                    coordinates[coordinates.length] = x;
                    coordinates[coordinates.length] = y;
                    coordinates[coordinates.length] = z;
                    //console.log("Parabola x:" + x + " y:" + y + " z:" + z);
                }
                index++;
            }
            var parabolaID = "parabola";

            // Equation of parabola: x-ay2+c=0
            // console.log("a:" + a + " c:" + c);
            this._drawConicSection(coordinates, parabolaID);

            offset = offset / heightFactor;
            equationConstants.A = 0;
            equationConstants.B = 1;
            equationConstants.C = -(slant * slant) / (2 * slop * offset);
            equationConstants.D = 0;
            equationConstants.E = (offset * offset) / (2 * slop * offset);
            equationConstants.fill = false;
            equationConstants.type = 'parabola';
            this.model.set('equationConstants', equationConstants);
        },

        /**
        * Compute coordinates to draw the hyperbola
        * @method _calculateHyperbolaPoints
        * @param slant{Number} Slop of Cone
        * @param slop{Number} Slop of Plane
        * @param offset{Number} Height of Plane
        * @private
        */
        _calculateHyperbolaPoints: function (slant, slop, offset) {
            var coneHeight = this.model.get('coneHeight'),
               heightFactor = this.model.get('heightFactor'),
               radius = this.model.get('coneRadius'),
               heightFactor = this.model.get('heightFactor'),
            equationConstants = {};

            coneHeight = (coneHeight * heightFactor) / 2;

            var count = 150,
                    incrementFactor = (radius - (-radius)) / (count - 1),
                    a = ((slop * slop) - (slant * slant)),
                    b = 2 * slop * offset,
                    index = 0,
                    y, c, disc, x1, x2, z1, z2, temp;

            var coordinates1 = [], coordinates2 = [];

            while (index < count) {
                y = -radius + (index * incrementFactor);
                c = (offset * offset) - (slant * slant * y * y);
                disc = (b * b) - (4 * a * c);
                if (disc < 0) {
                    disc = 0;
                }
                disc = Math.sqrt(disc);
                x1 = (-b - disc) / (2 * a);
                x2 = (-b + disc) / (2 * a);
                z1 = (slop * x1) + offset;
                z2 = (slop * x2) + offset;

                if (z2 < z1) {
                    temp = x2;
                    x2 = x1;
                    x1 = temp;

                    temp = z2;
                    z2 = z1;
                    z1 = temp;
                }
                if (z1 <= coneHeight && z1 >= -coneHeight) {
                    coordinates1[coordinates1.length] = x1;
                    coordinates1[coordinates1.length] = y;
                    coordinates1[coordinates1.length] = z1;
                    //console.log("Half1: x:" + x1 + " y:" + y + " z:" + z1);
                }
                if (z2 <= coneHeight && z2 >= -coneHeight) {
                    coordinates2[coordinates2.length] = x2;
                    coordinates2[coordinates2.length] = y;
                    coordinates2[coordinates2.length] = z2;
                    //console.log("Half2: x:" + x2 + " y:" + y + " z:" + z2);
                }
                index++;
            }
            // Equation of hyperbola: Ax2 + Bx + Cy2 + E=0
            // console.log("A:" + a + " B:" + b + " C:" + (-(slant*slant)) + " E:" + (offset * offset));

            var hyperbolaSection1ID = 'hyperbolaSection1',
                hyperbolaSection2ID = 'hyperbolaSection2';
            this._drawConicSection(coordinates1, hyperbolaSection1ID);
            this._drawConicSection(coordinates2, hyperbolaSection2ID);

            offset = offset / heightFactor;
            equationConstants.A = a;
            equationConstants.B = 2 * slop * offset;//b;
            equationConstants.C = (-(slant * slant));
            equationConstants.D = 0;
            equationConstants.E = (offset * offset);
            equationConstants.fill = false;
            equationConstants.type = 'hyperbola';
            this.model.set('equationConstants', equationConstants);
        },

        /**
        * Compute coordinates to draw the line
        * @method _calculateLinePoints
        * @param slop{Number} Slop of Plane
        * @private
        */
        _calculateLinePoints: function (slop) {
            var coordinates = [],
                radius = this.model.get('coneRadius'),
                a1 = -radius,
                a2 = radius,
                equationConstants = {};

            coordinates[coordinates.length] = a1;
            coordinates[coordinates.length] = 0;
            coordinates[coordinates.length] = (slop * a1);

            coordinates[coordinates.length] = a2;
            coordinates[coordinates.length] = 0;
            coordinates[coordinates.length] = (slop * a2);

            var lineId = "lineConicSection"
            this._drawConicSection(coordinates, lineId);

            equationConstants.A = 0;
            equationConstants.B = 0;
            equationConstants.C = 0;
            equationConstants.D = 1;
            equationConstants.E = 0;
            equationConstants.fill = false;
            equationConstants.type = 'line';
            this.model.set('equationConstants', equationConstants);
        },

        /**
        * Draw point
        * @method _drawPoint
        * @param slop{Number} Slop of Plane
        * @private
        */
        _drawPoint: function (slop) {
            var Cango3DWrapper = cango3DWrapperClass.Cango3DWrapper,
                sq = Cango3DWrapper.getCircleShapeCmds(2.5),
                 equationConstants = {};

            var pointId = "point";
            this._drawConicSection(sq, pointId);

            equationConstants.A = 1;
            equationConstants.B = 0;
            equationConstants.C = 1;
            equationConstants.D = 0;
            equationConstants.E = -0.0001;
            equationConstants.fill = true;
            equationConstants.type = 'point';
            this.model.set('equationConstants', equationConstants);
        },

        /**
        * Draw the conic section from the coordinates
        * @method _drawConicSection
        * @param coordinates{Array} Contains x, y, z points
        * @param sectionId{string} Section ID
        * @private
        */
        _drawConicSection: function (coordinates, sectionId) {
            var model = this.model,
                namespace = MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView,
                intersectionColor = namespace.INTERSECTION_COLOR,
                intersectionThickness = namespace.INTERSECTION_THICKNESS;
            if (coordinates.length / 3 > 1) {
                var sq = ["M"];
                sq = sq.concat(coordinates.splice(0, 3));
                sq[sq.length] = "L";
                sq = sq.concat(coordinates);

                this.cango3dWrapper.create3DPath(sectionId, sq, intersectionColor, intersectionThickness);
                this.cango3dWrapper.addObjToGroup(sectionId, this.conicSectionID);

                this.isConicSectionPresent = true;
            }
        },

        /**
        * Make the coordinates range bound in z perseptive.
        * @method _makeRangeBound
        * @param coordinates{Array} Contains x, y, z points
        * @private
        */
        _makeRangeBound: function (coordinates) {
            var index = 0,
                length = coordinates.length,
                curves = [],
                curve = [],
                height = this.model.get('coneHeight'),
                heightFactor = this.model.get('heightFactor');

            height = height * heightFactor;

            while (index < length) {
                var z = coordinates[index + 2],
                    coneHeight = (height / 2);
                if (z > coneHeight || z < -coneHeight) {
                    if (curve.length / 3 > 1) {
                        curves[curves.length] = curve;
                    }
                    curve = [];
                }
                else {
                    curve[curve.length] = coordinates[index];
                    curve[curve.length] = coordinates[index + 1];
                    curve[curve.length] = coordinates[index + 2];
                }
                index += 3;
            }
            if (curve.length / 3 > 1) {
                curves[curves.length] = curve;
            }
            return curves;
        },

        /**
        * Create the graph buttons
        * @method _generateGraphButtons
        * @private
        */
        _generateGraphButtons: function _generateGraphButtons() {
            var btnOptions = {},
                globalBtn = MathInteractives.global.Theme2.Button,
                namespace = MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab,
                 height = namespace.GRAPH_BUTTON_HEIGHT,
                 width = namespace.GRAPH_BUTTON_WIDTH,
                 fontSize = namespace.GRAPH_BUTTON_FONT_SIZE,
                 fontColor = namespace.GRAPH_BUTTON_FONT_COLOR;
            // Generate Reset buttom
            btnOptions = {
                'player': this.player,
                'manager': this.manager,
                'path': this.filePath,
                'idPrefix': this.idPrefix,
                'data': {
                    type: globalBtn.TYPE.FA_ICON,
                    height: 38,
                    width: 43,
                    tooltipText: this.getMessage('reset-tooltip', 0),
                    tooltipType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.RIGHT_MIDDLE,
                    id: this.idPrefix + 'conic-reset-button',
                    icon: {
                        'faClass': this.filePath.getFontAwesomeClass('reset'),
                        'height': height,
                        'width': width,
                        'fontSize': fontSize,
                        'fontColor': fontColor
                    },
                    baseClass: ''
                }
            };
            this.resetGraphBtnView = globalBtn.generateButton(btnOptions);

            btnOptions = {
                'player': this.player,
                'manager': this.manager,
                'path': this.filePath,
                'idPrefix': this.idPrefix,
                'data': {
                    'id': this.idPrefix + 'conic-rotate-about-x-axis-button',
                    'type': globalBtn.TYPE.ICON,
                    'height': height,
                    'width': width,
                    'baseClass': 'rotate-button',
                    'tooltipText': this.getMessage('rotate-about-x-axis', 0),
                    'tooltipType': MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.RIGHT_MIDDLE,
                    'icon': { 'iconPath': this.spritePath, 'height': height, 'width': width }
                }
            }
            this.rotateAboutXAxisBtnView = globalBtn.generateButton(btnOptions);

            btnOptions.data.id = this.idPrefix + 'conic-rotate-about-y-axis-button';
            btnOptions.data.tooltipText = this.getMessage('rotate-about-y-axis', 0);

            this.rotateAboutYAxisBtnView = globalBtn.generateButton(btnOptions);

            btnOptions.data.id = this.idPrefix + 'conic-rotate-about-z-axis-button';
            btnOptions.data.tooltipText = this.getMessage('rotate-about-z-axis', 0);

            this.rotateAboutZAxisBtnView = globalBtn.generateButton(btnOptions);
        },

        /**
        * It reset the conic section 
        * Its call when reset button is clicked
        *
        * @method _onResetConicBtnClick
        * @private 
        */
        _onResetConicBtnClick: function _onResetConicBtnClick() {
            this.stopReading();
            var startAngle = 270;
            this.resetConeView(startAngle, false, false, true);
            this.setFocus('canvas-container');
            this.firstReset = false;
        },

        /**
        * It rotate the conic section about z axis
        * Its call when mouse down is fired on rotateAboutZAxis button
        *
        * @method _onRotateAboutZAxisMD
        * @private 
        */
        _onRotateAboutZAxisMD: function _onRotateAboutZAxisMD(evt) {
            if ((this.rotateAboutZAxisBtnView.getButtonState() === MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE) && (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile || [32, 1, 13].indexOf(evt.which) > -1)) {
                this.stopReading();
                this.rotatingAccButtonText = this.getAccMessage('canvas-container', 4);
                this._startRotating(evt, 0, 0, 1, MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView.CONIC_SECTION_ROTATING_ANGLE, true);
            }
        },

        /**
        * It rotate the conic section about x axis
        * Its call when mouse down is fired on rotateAboutXAxis button
        *
        * @method _onRotateAboutXAxisMD
        * @private 
        */
        _onRotateAboutXAxisMD: function _onRotateAboutXAxisMD(evt) {
            if ((this.rotateAboutXAxisBtnView.getButtonState() === MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE) && (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile || [32, 1, 13].indexOf(evt.which) > -1)) {
                this.stopReading();
                this.rotatingAccButtonText = this.getAccMessage('canvas-container', 2);
                this._startRotating(evt, -1, 0, 0, MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView.CONIC_SECTION_ROTATING_ANGLE, true);
            }

        },

        /**
        * It rotate the conic section about y axis
        * Its call when mouse down is fired on rotateAboutYAxis button
        *
        * @method _onRotateAboutYAxisMD
        * @private 
        */
        _onRotateAboutYAxisMD: function _onRotateAboutZAxisMD(evt) {
            if ((this.rotateAboutYAxisBtnView.getButtonState() === MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE) && (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile || [32, 1, 13].indexOf(evt.which) > -1)) {
                this.stopReading();
                this.rotatingAccButtonText = this.getAccMessage('canvas-container', 3);
                this._startRotating(evt, 0, 1, 0, MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView.CONIC_SECTION_ROTATING_ANGLE, true);
            }

        },

        /**
        * It stop rotatation of conic section
        * Its call when mouse up fired on all roatate buttons
        *
        * @method _onRotateMU
        * @private 
        */
        _onRotateMU: function _onRotateMU(evt) {
            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile || [32, 1, 13].indexOf(evt.which) > -1) {
                this._stopRotating(evt);
                this.changeAccMessage('canvas-container', 1, [this.rotatingAccButtonText, this.rotatingAngle]);
                this.rotatingAngle = 0;
                this.setFocus('canvas-container');
            }
        },


        /**
        * Start rotating the cone
        * @method _startRotating
        * @param evt{Object} Event
        * @param x{Number} X offset of unit vector
        * @param y{Number} Y offset of unit vector
        * @param z{Number} Z offset of unit vector
        * @param angle{Number} Angle value
        * @param check{Boolean} Is transform applied
        * @private 
        */
        _startRotating: function _startRotating(evt, x, y, z, angle, check) {
            var self = this,
                rotateTimer;
            this.resetGraphBtnView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);

            $(document).off('mouseup.document-click' + self.idPrefix).on('mouseup.document-click' + self.idPrefix, $.proxy(this._stopRotating, this));
            window.clearInterval(self.timerId);
            //self.cango3dWrapper.rotate(this.movedCubeID, x, y, z, angle, true);
            self.cango3dWrapper.rotate(this.movedConeID, x, y, z, angle, true);
            self.cango3dWrapper.rotate(this.planeWrapperID, x, y, z, angle, true);

            self.cango3dWrapper.renderObj([this.movedCubeID, this.movedConeID, this.planeWrapperID]);
            self.rotatingAngle += 5;
            this.isConeRotating = true;
            rotateTimer = function () {
                if (self.isConeRotating) {
                    window.clearInterval(self.timerId);
                    self.timerId = window.setInterval(function () {
                        //self.cango3dWrapper.rotate(self.movedCubeID, x, y, z, angle, true);
                        self.cango3dWrapper.rotate(self.movedConeID, x, y, z, angle, true);
                        self.cango3dWrapper.rotate(self.planeWrapperID, x, y, z, angle, true);

                        self.cango3dWrapper.renderObj([self.movedCubeID, self.movedConeID, self.planeWrapperID]);
                    }, 100);
                }
            }

            window.setTimeout(rotateTimer, 500);
        },

        /**
        *  It clears the interval 
        *  It call when mouse up is fired on the rotating button
        *    
        * @method _stopRotating
        * @private
        **/
        _stopRotating: function _stopRotating(evt) {
            var self = this;
            this.isConeRotating = false;

            window.clearInterval(self.timerId);
            $(document).off('mouseup.document-click');
        },

        /**
        *  It set the cursor to the canvas
        *  It call when mouse enter on the canvas
        *    
        * @method _onCanvasMouseenter
        * @private
        **/
        _onCanvasMouseenter: function _onCanvasMouseenter() {
            this.model.set('cursor', 'open-hand');
        },

        /**
        *  It set the cursor to the canvas
        *  It call when mouse leave from the canvas
        *    
        * @method _onCanvasMouseleave
        * @private
        **/
        _onCanvasMouseleave: function _onCanvasMouseleave() {
            this.model.set('cursor', 'default');
        },

        /**
        *  It set the cursor to the canvas
        *  It call when mouse up on the canvas
        *    
        * @method _onCanvasMouseUp
        * @private
        **/
        _onCanvasMouseUp: function _onCanvasMouseUp() {
            this.model.set('cursor', 'open-hand');
        },

        /* 
     * JAWS handles arrow keys differently. When any arrow key is held down, keydown and keyup events are fired simultaneously.
     * To overcome this, this function checks whether another keydown has occured within a set timer before the keyup is fired.
     * If another keydown has been fired, the keyup event won't be triggered.
     * 
     * @method _handleArrowUpTrigger
     * @private
     */
        _handleArrowUpTrigger: function _handleArrowUpTrigger(event) {
            var self = this,
                keyupTimer = 300;

            self._previousArrowKeyDownCount = self._currentArrowKeyDownCount;
            self._currentArrowKeyDownCount++;
            if (self._previousArrowKeyDownCount === 0) {
                if (self._keyUpInterval) {
                    window.clearInterval(self._keyUpInterval);
                }
                self._keyUpInterval = window.setInterval(function () {
                    if (self._previousArrowKeyDownCount === self._currentArrowKeyDownCount) {
                        console.log('actual key up');
                        window.clearInterval(self._keyUpInterval);
                        self._keyUpInterval = null;
                        self._previousArrowKeyDownCount = 0;
                        self._currentArrowKeyDownCount = 0;
                        self._onRotateMU(self._lastArrowKeyUpEvent);
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


        /**
        *  It disable All the buttons
        *    
        * @method _disableAllButtons
        * @private
        **/
        _disableAllButtons: function _disableAllButtons() {
            var state = MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED;
            //this._disableObjectDragging();
            this.resetGraphBtnView.setButtonState(state);
            this.rotateAboutXAxisBtnView.setButtonState(state);
            this.rotateAboutYAxisBtnView.setButtonState(state);
            this.rotateAboutZAxisBtnView.setButtonState(state);
            this.planeSlopSpinner.disableSpinBox();
            this.planeOffsetSpinner.disableSpinBox();
            this.coneHeightSpinner.disableSpinBox();
            this.coneSlopSpinner.disableSpinBox();
        },

        /**
        *  It eanble All the buttons
        *    
        * @method _enableAllButtons
        * @private
        **/
        _enableAllButtons: function _enableAllButtons() {
            var state = MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE,
                self = this;
            this.resetGraphBtnView.setButtonState(state);
            this.rotateAboutXAxisBtnView.setButtonState(state);
            this.rotateAboutYAxisBtnView.setButtonState(state);
            this.rotateAboutZAxisBtnView.setButtonState(state);
            this.planeSlopSpinner.enableSpinBox();
            this.planeOffsetSpinner.enableSpinBox();
            this.coneHeightSpinner.enableSpinBox();
            this.coneSlopSpinner.enableSpinBox();
            this._disableTabIndexForConeSpinner();
            this._disableTabIndexForPlaneSpinner();

            this.resetConeView(270);
            this._enableObjectDragging();

        },
        /**
        *  It eanble tabindex of rotate and refresh buttons 
        *    
        * @method _keyUpOnPlaneDataContainer
        * @private
        **/
        _keyUpOnPlaneDataContainer: function _keyUpOnPlaneDataContainer(event) {
            event.stopPropagation();
            var keyCode = event.keyCode;
            if ((keyCode === 32 || keyCode === 13) && this.$(event.target).parent().hasClass('plane-data-container')) {
                this._enableTabIndexForPlaneSpinner();
                this.setFocus('plane-slop-custom-spinner-container-text');

            }
        },
        /**
        *  It eanble tabindex of rotate and refresh buttons 
        *    
        * @method _keyUpOnConeDataContainer
        * @private
        **/
        _keyUpOnConeDataContainer: function _keyUpOnConeDataContainer(event) {
            var keyCode = event.keyCode;
            if ((keyCode === 32 || keyCode === 13) && this.$(event.target).parent().hasClass('cone-data-container')) {
                this._enableTabIndexForConeSpinner();
                this.setFocus('cone-height-custom-spinner-container-text');
            }
        },
        /**
        *  It disable tabindex of plane spinner buttons
        *    
        * @method _disableTabIndexForPlaneSpinner
        * @private
        **/
        _disableTabIndexForPlaneSpinner: function _disableTabIndexForPlaneSpinner(event) {
            this.enableTab('plane-slop-custom-spinner-container-up-arrow', false);
            this.enableTab('plane-slop-custom-spinner-container-text', false);
            this.enableTab('plane-slop-custom-spinner-container-down-arrow', false);
            this.enableTab('plane-offset-custom-spinner-container-up-arrow', false);
            this.enableTab('plane-offset-custom-spinner-container-text', false);
            this.enableTab('plane-offset-custom-spinner-container-down-arrow', false);

        },
        /**
        *  It disable tabindex of cone spinner buttons
        *    
        * @method _disableTabIndexForConeSpinner
        * @private
        **/
        _disableTabIndexForConeSpinner: function _disableTabIndexForConeSpinner(event) {
            this.enableTab('cone-height-custom-spinner-container-up-arrow', false);
            this.enableTab('cone-height-custom-spinner-container-text', false);
            this.enableTab('cone-height-custom-spinner-container-down-arrow', false);
            this.enableTab('cone-slop-custom-spinner-container-up-arrow', false);
            this.enableTab('cone-slop-custom-spinner-container-text', false);
            this.enableTab('cone-slop-custom-spinner-container-down-arrow', false);

        },
        /**
        *  It eanble tabindex of plane spinner buttons
        *    
        * @method _enableTabIndexForPlaneSpinner
        * @private
        **/
        _enableTabIndexForPlaneSpinner: function _enableTabIndexForPlaneSpinner(event) {
            this._enableTabIndexOfSpinner(this.planeSlopSpinner, 'plane-slop-custom-spinner-container-up-arrow', 'plane-slop-custom-spinner-container-text', 'plane-slop-custom-spinner-container-down-arrow');
            this._enableTabIndexOfSpinner(this.planeOffsetSpinner, 'plane-offset-custom-spinner-container-up-arrow', 'plane-offset-custom-spinner-container-text', 'plane-offset-custom-spinner-container-down-arrow');
        },
        /**
        *  It eanble tabindex of cone spinner buttons
        *    
        * @method _enableTabIndexForConeSpinner
        * @private
        **/
        _enableTabIndexForConeSpinner: function _enableTabIndexForConeSpinner(event) {
            this._enableTabIndexOfSpinner(this.coneHeightSpinner, 'cone-height-custom-spinner-container-up-arrow', 'cone-height-custom-spinner-container-text', 'cone-height-custom-spinner-container-down-arrow');
            this._enableTabIndexOfSpinner(this.coneSlopSpinner, 'cone-slop-custom-spinner-container-up-arrow', 'cone-slop-custom-spinner-container-text', 'cone-slop-custom-spinner-container-down-arrow');
        },
        /**
        *  It check state and enable tabindex of spinner
        *    
        * @method _enableTabIndexOfSpinner
        * @private
        **/
        _enableTabIndexOfSpinner: function _enableTabIndexOfSpinner(spinnerView, upArrowAccId, textAccId, downArrowAccId) {
            var state = MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE;
            if (spinnerView.getUpButtonState() === state) {
                this.enableTab(upArrowAccId, true);
            }
            if (spinnerView.getDownButtonState() === state) {
                this.enableTab(downArrowAccId, true);
            }
            this.enableTab(textAccId);
        },

        _enableObjectDragging: function () {
            var self = this;
            //this._disableObjectDragging();
            this.cango3dWrapper.enableDrag(this.movedCubeID,
                function (mousePos) {
                    self.grabCone(mousePos, this);
                },
                function (mousePos) {
                    self.dragCone(mousePos, this);
                },
                function () {
                    self.dragCount = 0;
                }
            );

            this.cango3dWrapper.enableDrag(this.movedConeID,
                function (mousePos) {
                    self.grabCone(mousePos, this);
                },
                function (mousePos) {
                    self.dragCone(mousePos, this);
                },
                function () {
                    self.dragCount = 0;
                }
            );
        },

        _disableObjectDragging: function () {
            this.cango3dWrapper.disableDrag(this.movedCubeID);
            this.cango3dWrapper.disableDrag(this.movedConeID);
        }
    }, {

        /**
       * it holds the rotating angle for conic section
       *
       * @property CONIC_SECTION_ROTATING_ANGLE
       * @public
       * @static
       * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView
       * @default 5
       */
        CONIC_SECTION_ROTATING_ANGLE: 5,

        /**
       * it holds the plane spinner button width
       *
       * @property PLANE_SPINNER_BUTTON_WIDTH
       * @public
       * @static
       * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView
       * @default 53
       */
        PLANE_SPINNER_BUTTON_WIDTH: 60,

        /**
       * it holds the plane spinner button height
       *
       * @property PLANE_SPINNER_BUTTON_HEIGHT
       * @public
       * @static
       * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView
       * @default 22
       */
        PLANE_SPINNER_BUTTON_HEIGHT: 22,

        /**
       * it holds the  plane spinner input box height
       *
       * @property PLANE_SPINNER_INPUT_HEIGHT
       * @public
       * @static
       * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView
       * @default 40
       */
        PLANE_SPINNER_INPUT_HEIGHT: 40,

        /**
       * it holds the  cone spinner button width
       *
       * @property CONE_SPINNER_BUTTON_WIDTH
       * @public
       * @static
       * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView
       * @default 45
       */
        CONE_SPINNER_BUTTON_WIDTH: 45,

        /**
       * it holds the cone spinner button height
       *
       * @property CONE_SPINNER_BUTTON_HEIGHT
       * @public
       * @static
       * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView
       * @default 22
       */
        CONE_SPINNER_BUTTON_HEIGHT: 22,

        /**
       * it holds the cone spinner input box height
       *
       * @property CONE_SPINNER_INPUT_HEIGHT
       * @public
       * @static
       * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView
       * @default 40
       */
        CONE_SPINNER_INPUT_HEIGHT: 40,

        /**
       * it holds the spinner textbox (input box) color
       *
       * @property SPINNER_INPUT_BOX_COLOR
       * @public
       * @static
       * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView
       * @default '#DCDBDB'
       */
        SPINNER_INPUT_BOX_COLOR: '#DCDBDB',

        /**
       * it holds the cone color
       *
       * @property CONE_COLOR
       * @public
       * @static
       * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView
       * @default '#ffffff'
       */
        CONE_COLOR: '#FFFFFF',

        /**
       * it holds the cone lines color
       *
       * @property CONE_LINES_COLOR
       * @public
       * @static
       * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView
       * @default '#FFFFFF'
       */
        CONE_LINES_COLOR: '#FFFFFF',

        /**
       * it holds the cone fill color
       *
       * @property CONE_FILL_COLOR
       * @public
       * @static
       * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView
       * @default 'rgba(150,150,150,0.2)'
       */
        CONE_FILL_COLOR: 'rgba(150,150,150,0.2)',

        /**
       * it holds the thickness of the lines used for cone fill color
       *
       * @property CONE_FILL_THICKNESS
       * @public
       * @static
       * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView
       * @default 3
       */
        CONE_FILL_THICKNESS: 3,

        /**
       * it holds the cone thickness
       *
       * @property CONE_THICKNESS
       * @public
       * @static
       * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView
       * @default 3
       */
        CONE_THICKNESS: 3,

        /**
       * it holds the plane color
       *
       * @property PLANE_COLOR
       * @public
       * @static
       * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView
       * @default 'RGBA(165,212,0,0.20)'
       */
        PLANE_COLOR: 'RGBA(165,212,0,0.20)',

        /**
       * it holds the plane stroke color
       *
       * @property PLANE_STROKECOLOR
       * @public
       * @static
       * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView
       * @default 'RGB(165,212,0)'
       */
        PLANE_STROKECOLOR: 'RGB(165,212,0)',

        /**
       * it holds the plane thickness
       *
       * @property PLANE_THICKNESS
       * @public
       * @static
       * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView
       * @default 3
       */
        PLANE_THICKNESS: 3,

        /**
       * it holds the intersection path color
       *
       * @property INTERSECTION_COLOR
       * @public
       * @static
       * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView
       * @default 'RGB(165,212,0)'
       */
        INTERSECTION_COLOR: 'RGB(165,212,0)',

        /**
       * it holds the intersection line thickness
       *
       * @property INTERSECTION_THICKNESS
       * @public
       * @static
       * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView
       * @default 3
       */
        INTERSECTION_THICKNESS: 3,

        /**
       * it holds the font awesome font size
       *
       * @property FONT_AWESOME_FONT_SIZE
       * @public
       * @static
       * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView
       * @default 24
       */
        FONT_AWESOME_FONT_SIZE: 24

    });

})();