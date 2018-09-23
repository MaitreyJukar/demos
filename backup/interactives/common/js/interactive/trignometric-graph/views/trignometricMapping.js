(function () {
    var className = null,
        modelClassName = MathInteractives.Common.Interactivities.TrignometricGraphing.Models.ExploreTrignometricMapping;
    /**
    * Class for Overview Tab ,  contains properties and methods of Overview tab
    * @class Overview
    * @module GraphingSinCos
    * @namespace MathInteractives.Interactivities.GraphingSinCos.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    MathInteractives.Common.Interactivities.TrignometricGraphing.Views.ExploreTrignometricMapping = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Stores filepaths for resources , value set on initialize
        *   
        * @property filePath 
        * @type Object
        * @default null
        **/
        filePath: null,

        /**
        * Stores manager instance for using common level functions , value set on initialize
        *
        * @property manager 
        * @type Object
        * @default null
        **/
        manager: null,

        /**
        * Stores reference to player , value set on initialize
        * 
        * @property player 
        * @type Object
        * @default null
        **/
        player: null,

        /**
        * id-prefix of the interactive , value set on initialize
        * 
        * @property idPrefix 
        * @type String
        * @default null
        **/
        idPrefix: null,

        /**
        * Reference to scope of paper.
        * @property paperScope
        * @type Object
        * @default null
        */
        paperScope: null,

        /**
        * Activity Default Data.
        * @property activityData
        * @type Object
        * @default null
        */
        activityData: null,

        /**
        * The object having paper objects of rotating circle
        * @property rotatingCircle
        * @type Object
        * @default null
        */
        rotatingCircle: null,

        /**
        * Reference to 'staticData' property of the model.
        * @property staticData
        * @type Object
        * @default null
        */
        staticData: null,

        /**
        * Reference to combo-box view for the show points drop-down list.
        * @property comboBoxView
        * @type Object
        * @default null
        */
        comboBoxView: null,

        /**
        * Reference to feedback view for the final feedback after unrolling.
        * @property feedbackView
        * @type Object
        * @default null
        */
        feedbackView: null,

        /**
        * Boolean to check if the circle has crossed over.
        * @property circleCrossedOver
        * @type Boolean
        * @default null
        */
        circleCrossedOver: null,

        /**
        * Reference to direction-text view for the initial instruction.
        * @property directionTextView
        * @type Object
        * @default null
        */
        directionTextView: null,

        // Whether dirextion button will reset or switch to next tab
        directionButtonFunction: "Reset",

        circlePositionForAcc: 0,
        lastCirclePositionForAcc: 0,
        /**
        * View of the sort fish step 1 direction text
        * 
        * @property exploreMappingDirectionText
        * @type Object
        * @default null
        **/
        exploreMappingDirectionText: null,
        canvasAcc: null,
        partiallyMoved: null,
        completelyMoved: false,
        displayedPoints: [],
        isPointsGenerated: false,
        isDraggedToNext: false,
        noOfLabelsPlaced: null,
        noOfLabelsPlacedOnCircle: null,
        mappingFocusRect: null,
        verticalEndingTick: null,
        canvasAccPrevTextData: {},
        wasCircleOnLastValue: false,
        /**
        * if tab switch is occuring for first time
        * 
        * @property firstTabSwitch
        * @type Boolean
        * @default true
        **/
        // firstTabSwitch: true,


        /**
        * Initializes the overview tab
        *
        * @method initialize
        * @public 
        **/
        initialize: function () {
            this.rotatingCircle = {
                circle: null,
                noOfRadius: null,
                radialGroup: null,
                bubbleGroup: null,
                labelDataArray: null,
                dragHandle: null,
                numberLine: null,
                numberLineTicksGroup: null,
                imposedCircle: null,
                remainingCircle: null,
                imposedLine: null,
                startingTick: null,
                $lastLabel: null,
            };
            var model = this.model,
                unwrappingCircleActivity = model.get('unwrappingCircleActivity');

            this.filePath = model.get('path');
            this.manager = model.get('manager');
            this.player = model.get('player');
            this.idPrefix = this.player.getIDPrefix();
            this.activityData = model.get('activityData');
            this.renderTemplate();
            this.setBackgroundImage();

            this.setPaperScope();

            this.initializeDirectionText();
            this.loadScreen('exploreMapping-tab');


            this.tool = new this.paperScope.Tool();
            this.tool.onMouseDrag = function () {
                return;
            };
            if (!unwrappingCircleActivity) {
                this.initializeComboBoxes();
            }



            //this.initializeFeedback();
            this.renderInitialState();


            this.bindTabChangeEventHandler();

            this.displayedPoints[0] = 0;
            this._initAccessibility();
            this._bindAccessibilityListeners();
            this.$('#' + this.idPrefix + 'mapping-tab-canvas-acc-container-acc-elem').on('keydown', $.proxy(this.setDefaultAcc, this));
        },

        /**
        * Renders the common tab-1 template.
        * @method renderTemplate
        */
        renderTemplate: function renderTemplate() {
            var template = MathInteractives.Common.Interactivities.TrignometricGraphing.templates.trignometricMapping(this.model.toJSON()).trim();
            this.$el.append(template);
            return;
        },

        /**
        * Binds an handler for tab-change event
        * @method bindTabChangeEventHandle
        */
        bindTabChangeEventHandler: function bindTabChangeEventHandler() {
            var self = this;
            this.player.bindTabChange(function () {
                //if (self.directionTextView === null && this.model.get('unwrappingCircleActivity') === false) {
                //if (self.directionTextView === null) {
                // self.initializeDirectionText();
                //}
                //this.setFocus('direction-text-holder-direction-text-text');

                if (this.model.get('unwrappingCircleActivity') === false) {
                    this.setFocus('exploreMapping-direction-text-holder-direction-text-text');
                }
                //if (this.firstTabSwitch === true && this.model.get('unwrappingCircleActivity') === true) {
                //    //reposition radius label according to its added height width
                //    var $radiusLabel = this.$('.radius-label-container');
                //    $radiusLabel.css({
                //        'top': $radiusLabel.position().top - $radiusLabel.height() / 2,
                //        'left': $radiusLabel.position().left - $radiusLabel.width() / 2,
                //        'font-style': 'italic'
                //    });
                //    this.firstTabSwitch = false;
                //}

            }, this, 1);
            return;
        },

        /**
        * changes given radian to length (appends r behind any given angle except 0)
        *
        * @method _changeRadianToLength
        * @param angleInRadians {{String}} angle to be changed to length
        * @return {{String}} length in term of PI and r
        * @private
        **/
        _changeRadianToLength: function _changeRadianToLength(angleInRadians) {
            if (angleInRadians !== 0 && angleInRadians !== "0") {
                angleInRadians = angleInRadians + "<span class='font-italic'>r</span>";
            }
            return angleInRadians;
        },

        /**
        * Sets background image of tab-1
        * @method setBackgroundImage
        */
        setBackgroundImage: function setBackgroundImage() {
            $('#' + this.idPrefix + 'activity-area-1').css({
                'background-image': 'url("' + this.filePath.getImagePath('activity-area') + '")'
            });
            return;
        },
        /**
        * Initializes direction text
        * @method initializeDirectionText
        */
        initializeDirectionText: function initializeDirectionText() {
            this.loadScreen('exploreMapping-direction');
            // Unwrapping circle : RESET , others : NEXT
            //if (this.model.get('unwrappingCircleActivity') === true) {
            //    this.directionButtonFunction = "Next"
            //}
            //else {
            //    this.directionButtonFunction = "Reset"
            //}
            var options = {
                text: this.getMessage('exploreMapping-direction-text', 0),
                accText: this.getAccMessage('exploreMapping-direction-text', 0),
                idPrefix: this.idPrefix,
                containerId: this.idPrefix + 'exploreMapping-direction-text-holder',
                manager: this.manager,
                path: this.filePath,
                player: this.player,
                ttsColorType: MathInteractives.global.Theme2.Button.COLORTYPE.TTS_WHITE,
                tabIndex: 550,
                buttonTabIndex: 700,
                textColor: '#ffffff',
                containmentBGcolor: 'rgba(0,0,0,.14)',
                showButton: true,
                buttonText: this.getMessage('exploreMapping-direction-text', 1),
                clickCallback: {
                    fnc: this.renderInitialState,
                    scope: this
                }
                //clickCallback: {
                //    fnc: function () {
                //        if (this.directionButtonFunction === "Reset") {
                //            this.renderInitialState();
                //        }
                //        else if (this.directionButtonFunction === "Next") {
                //            if (this.model.get('unwrappingCircleActivity') === false) {
                //                this.player.switchToTab(2);
                //                this.setFocus('header-subtitle');
                //            }
                //            else {
                //                this.directionTextView.trigger('MathInteractives.Common.Interactivities.TrignometricGraphing.Views.ExploreTrignometricMapping.DIRECTION_TEXT_CLICKED');
                //            }
                //        }
                //    },
                //    scope: this
                //}
            };

            if (this.model.get('unwrappingCircleActivity') === true) {
                options.showButton = false;
                options.btnTextColor = ' #1f0c01';
                options.ttsBaseClass = "custom-btn-tts-yellow";
                options.ttsBaseClass = "custom-btn-tts-yellow";
                options.btnBaseClass = "try-button";
            }

            this.directionTextView = MathInteractives.global.Theme2.DirectionText.generateDirectionText(options);
            return;
        },

        _onNextClick: function _onNextClick() {
            if (this.model.get('unwrappingCircleActivity') === false) {
                this.player.switchToTab(2);
                this.setFocus('header-subtitle');
            }
            else {
                this.trigger('MathInteractives.Common.Interactivities.TrignometricGraphing.Views.ExploreTrignometricMapping.NEXT_BUTTON_CLICKED');
            }
        },

        /**
        * Loads the components like circle, numberline, dragHandle etc
        *
        * @method renderInitialState
        * @public 
        **/
        renderInitialState: function renderInitialState() {
            //if (this.model.get('unwrappingCircleActivity') === false) {
            //    this.directionTextView.changeButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
            //}
            this._enableDisableTryAnotherButton(false);
            this.circleCrossedOver = false;
            this.partiallyMoved = [];
            this.completelyMoved = false;
            this.setNumberOfRadius();
            this.setStaticData();
            this.render();

            this.noOfLabelsPlaced = 0;
            this.noOfLabelsPlacedOnCircle = this.rotatingCircle.noOfRadius;
            this.canvasAccPrevTextData = {};

            this.changeAccMessage('mapping-tab-activity-acc-container', 0);
            this.changeAccMessage('mapping-tab-canvas-acc-container', 0);
            this.lastCirclePositionForAcc = 0;
            //if (this.model.get('unwrappingCircleActivity') === true) {
            // sets css on try another button click
            this.$el.find('#' + this.idPrefix + 'dummy-center-help').css({ left: this.rotatingCircle.dragHandle.position.x - 10 });
            //}
            //else {
            //    this.$el.find('#' + this.idPrefix + 'dummy-center-help').css({ left: this.rotatingCircle.dragHandle.position.x + 14 });
            //}
            MathInteractives.global.SpeechStream.stopReading();
            this.player.enableHelpElement('dummy-center-help', 0, true);
            this.setFocus('mapping-tab-activity-acc-container');
            if (this.model.get('unwrappingCircleActivity') === true) {
                this.setTabIndex('mapping-tab-canvas-acc-container', 610);
            }
            return;
        },

        /**
        * Initializes the combo-box component.
        * @method initializeComboBox
        **/
        initializeComboBoxes: function initializeComboBoxes() {
            var comboOptionsForPoints = {
                'player': this.player,
                'path': this.filePath,
                'idPrefix': this.idPrefix,
                'manager': this.manager,
                'screenId': 'points-combobox-screen',
                'containerId': 'mapping-tab-combobox-holder',
                'defaultOptionType': MathInteractives.Common.Components.Theme2.Models.Combobox.DEFAULT_OPTION_TYPES.DEFAULT_TEXT,
                'options': ['4', '6', '8', '12', '16']
            };


            var comboModel = new MathInteractives.Common.Components.Theme2.Models.Combobox(comboOptionsForPoints);
            var showPointsComboBoxView = new MathInteractives.Common.Components.Theme2.Views.Combobox({ el: '#' + comboOptionsForPoints['idPrefix'] + comboOptionsForPoints['containerId'], model: comboModel });

            showPointsComboBoxView.model.on('change:selectedOptionData', $.proxy(this.onSelectRadius, this));

            //var comboOptionsForAngle = {
            //    'player': this.player,
            //    'path': this.filePath,
            //    'idPrefix': this.idPrefix,
            //    'manager': this.manager,
            //    'screenId': 'angle-combobox-screen',
            //    'containerId': 'mapping-tab-angle-combobox-holder',
            //    'defaultOptionType': MathInteractives.Common.Components.Theme2.Models.Combobox.DEFAULT_OPTION_TYPES.FIRST_OPTION,
            //    'options': [
            //                this.getMessage('mapping-tab-angle-combobox-option-1', 0),
            //                this.getMessage('mapping-tab-angle-combobox-option-0', 0)
            //    ]
            //};


            //var comboModel = new MathInteractives.Common.Components.Theme2.Models.Combobox(comboOptionsForAngle);
            //var selectAngleComboBoxView = new MathInteractives.Common.Components.Theme2.Views.Combobox({ el: '#' + comboOptionsForAngle['idPrefix'] + comboOptionsForAngle['containerId'], model: comboModel });

            //selectAngleComboBoxView.model.on('change:selectedOptionData', $.proxy(this.onSelectAngleUnit, this));

            return;
        },

        /**
        * Initializes the feedback component.
        * @method initializeFeedback
        **/
        //initializeFeedback: function initializeFeedback() {
        //    var feedbackView = null,
        //        self = this,
        //        feedbackProps = {
        //            'player': this.player,
        //            'filePath': this.filePath,
        //            'idPrefix': this.idPrefix,
        //            'manager': this.manager,
        //            'feedbackContainerID': 'feedback-container',
        //            'text': this.getMessage('exploreMapping-feedback-text', 0),
        //            'ttsColorType': MathInteractives.global.Theme2.Button.COLORTYPE.TTS_WHITE,
        //            'accText': this.getAccMessage('exploreMapping-feedback-text', 0),
        //            'tabIndex': 650,
        //            'buttonPropertiesArray': [
        //                                            {
        //                                                text: this.getMessage('exploreMapping-feedback-button-text', 0)
        //                                            }
        //            ],
        //            'buttonAccText': [
        //                         this.getAccMessage('exploreMapping-feedback-button-text', 0)

        //            ],
        //        };
        //    feedbackView = MathInteractives.global.Theme2.Feedback.generateFeedback(feedbackProps);
        //    feedbackView.hideFeedback();
        //    if (this.model.get('unwrappingCircleActivity') === false) {
        //        feedbackView.on(MathInteractives.global.Theme2.Feedback.FEEDBACK_BUTTON_CLICK, function (parameter) {
        //            self.player.switchToTab(2);
        //            self.setFocus('header-subtitle');
        //        });
        //    }
        //    this.feedbackView = feedbackView;
        //    return;
        //},

        /**
        * Handler for dropdown change
        * @method onSelectRadius
        */
        onSelectRadius: function onSelectRadius(model, selectedOptionData) {
            var numberOfRadius = Number(selectedOptionData),
                $canvasContainer = this.$('.mapping-tab-canvas-container');

            this.setTabIndex('mapping-tab-canvas-acc-container', 610);

            this.model.setNoOfRadius(numberOfRadius);
            if (numberOfRadius === 16 && this.model.getAngleUnit() === className.ANGLE_UNITS[0]) {
                $canvasContainer.addClass(className.MAX_POINTS);
            }
            else {
                $canvasContainer.removeClass(className.MAX_POINTS);
            }
            return;
        },


        /**
        * Sets the paperScope 
        *
        * @method setPaperScope
        * @private 
        **/
        setPaperScope: function setPaperScope() {
            this.paperScope = new paper.PaperScope();
            this.paperScope.setup(this.idPrefix + 'mapping-canvas');
            return;
        },

        /**
        * Sets the noOfRadius of the rotating Circle 
        *
        * @method setNumberOfRadius
        * @private 
        **/
        setNumberOfRadius: function setNumberOfRadius() {
            var noOfRadius = this.model.get('noOfRadius');
            this.rotatingCircle.noOfRadius = noOfRadius;
            return;
        },

        /**
        * Sets the static data related to this tab 
        *
        * @method setStaticData
        * @private 
        **/
        setStaticData: function setStaticData() {
            var staticData = this.model.getStaticData();

            staticData.centrePoint = new this.paperScope.Point(staticData.circle_centre_coordinates);

            this.staticData = staticData;
            return;
        },

        /**
        * Renders the view of overview tab
        *
        * @method initialize
        * @public 
        **/
        render: function () {
            this.renderCanvasElements();
            this.renderLabels();
            this.bindEventHandlers();
            //if (this.feedbackView) {
            //    this.feedbackView.hideFeedback();
            //}
            this.generateButtons();
        },

        generateButtons: function () {
            var options = {
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                data: {
                    id: this.idPrefix + 'next-button-container',
                    text: this.getMessage('next-button-text', 0),
                    type: MathInteractives.global.Theme2.Button.TYPE.FA_ICONTEXT,
                    icon: {
                        'faClass': this.filePath.getFontAwesomeClass('next'),
                        'fontSize': 18,
                        'fontColor': '#ffffff',
                        'fontWeight': 'normal',
                        'height': 15,
                        'width': 9
                    },
                    textPosition: 'left',
                    width: 112,
                    baseClass: 'next-button-class'
                }
            }

            if (this.model.get('unwrappingCircleActivity') === true) {
                options = {
                    idPrefix: this.idPrefix,
                    player: this.player,
                    manager: this.manager,
                    path: this.filePath,
                    data: {
                        id: this.idPrefix + 'next-button-container',
                        text: this.getMessage('next-button-text', 0),
                        type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    }
                }
                options.data.baseClass = 'step1-next-button';
                options.data.textColor = '#1f0c01';
            }



            this.nextBtnView = new MathInteractives.global.Theme2.Button.generateButton(options);
            this.nextBtnView.$el.on('click', $.proxy(this._onNextClick, this));
            this.showHideNextButton(false);



            this.loadScreen('mapping-tab-button-screen');
        },

        /**
        * Shows / Hides Next Button
        * @method showHideNextButton
        */
        showHideNextButton: function renderElements(showBtn) {
            if (showBtn === true) {
                this.nextBtnView.$el.show();
            }
            else {
                this.nextBtnView.$el.hide();
            }
        },


        /**
        * Renders canvasElements
        * @method renderCanvasElements
        */
        renderCanvasElements: function renderElements() {
            this.paperScope.activate();
            this.renderCircle();
            this.renderDragHandle();
            this.renderNumberLine();
            this.paperScope.view.draw();

        },

        /**
        * Binds Event Handlers
        * @method bindEventHandlers
        */
        bindEventHandlers: function bindEventHandlers() {

            this.model.off('change:noOfRadius').on('change:noOfRadius', $.proxy(this.renderInitialState, this));
            if (this.rotatingCircle.noOfRadius > 0) {
                this.bindEventForHandCursorOnHandle();
                this.bindDragHandleEvent();
            }
        },

        /**
        * Renders Circle
        * @method renderCircle
        */
        renderCircle: function renderCircle() {
            this.paperScope.activate();
            var paperScope = this.paperScope,
                staticData = this.staticData,
                centrePoint = staticData.centrePoint.clone(),
                rotatingCircle = this.rotatingCircle,
                circle = rotatingCircle.circle,
                radialGroup = rotatingCircle.radialGroup,
                bubbleGroup = rotatingCircle.bubbleGroup,
                intersectionPoint = null,
                bubblePoint = null,
                radialLine = null,
                unwrappingCircleActivity = this.model.get('unwrappingCircleActivity'),
                totalPoints = rotatingCircle.noOfRadius;
            if (rotatingCircle.imposedCircle) {
                rotatingCircle.imposedCircle.remove();
            }

            if (rotatingCircle.remainingCircle) {
                rotatingCircle.remainingCircle.remove();
            }

            if (circle) {
                circle.remove();
            }
            circle = new paperScope.Path.Circle(centrePoint, modelClassName.CIRCLE_RADIUS);

            if (radialGroup) {
                radialGroup.remove();
            }
            radialGroup = new paperScope.Group();

            if (bubbleGroup) {
                bubbleGroup.remove();
            }
            bubbleGroup = new paperScope.Group();

            circle.strokeColor = modelClassName.CIRCLE_COLOR;
            circle.strokeWidth = modelClassName.NUMBERLINE_THICKNESS;
            circle.fillColor = '#252525';
            radialGroup = className.SHOW_RADIUS(paperScope, radialGroup, centrePoint, modelClassName.CIRCLE_RADIUS, rotatingCircle.noOfRadius, '#FFFFFF');

            // bubbleGroup is a paper group having the 
            // corresponding points on circle for each radius.
            // It is used for label positioning logic.

            for (var index = 0; index < totalPoints; index++) {
                radialLine = radialGroup.children[index];
                intersectionPoint = radialLine.lastSegment.point;
                bubblePoint = className.SHOW_BUBBLE(paperScope, intersectionPoint.getX(), intersectionPoint.getY(), 'red', false);
                bubbleGroup.addChild(bubblePoint);
            }
            if (unwrappingCircleActivity) {
                radialGroup.children[1].opacity = 0;
            }
            rotatingCircle.radialGroup = radialGroup;
            rotatingCircle.bubbleGroup = bubbleGroup;
            rotatingCircle.circle = circle;
            return;
        },

        /**
        * Renders dragHandle
        * @method renderDragHandle
        */
        renderDragHandle: function renderDragHandle() {
            var paperScope = this.paperScope,
                centrePoint = this.staticData.centrePoint.clone(),
                dragHandle = this.rotatingCircle.dragHandle;

            if (dragHandle) {
                dragHandle.remove();
            }



            dragHandle = new paperScope.Path.Circle(className.DRAG_HANDLE_DATA);

            dragHandle.shadowOffset = new paperScope.Point([2, 2]),

            this.rotatingCircle.dragHandle = dragHandle;
            if (this.isAccessible()) {
                this.drawFocusRect(dragHandle, 0);
            }

            return;
        },

        drawFocusRect: function drawFocusRect(dragHandle, opacity) {

            if (this.mappingFocusRect) {
                this.mappingFocusRect.remove();
            }
            var strokeColor = modelClassName.FOCUS_RECT_COLOR,
                    strokeWidth = modelClassName.FOCUS_RECT_STROKE_WIDTH,
                    style = {
                        strokeColor: strokeColor,
                        dashArray: [2, 2],
                        strokeWidth: strokeWidth
                    }

            this.mappingFocusRect = new this.paperScope.Path.Rectangle(new this.paperScope.Point(dragHandle.position.x - 11, dragHandle.position.y - 11), dragHandle.bounds.height + 2, dragHandle.bounds.width + 2);
            this.mappingFocusRect.style = style;
            this.mappingFocusRect.opacity = opacity;
            this.mappingFocusRect.insertAbove(this.rotatingCircle.dragHandle);
        },

        /**
        * Renders numberLine
        * @method renderNumberLine
        */
        renderNumberLine: function renderNumberLine() {
            var paperScope = this.paperScope,
                staticData = this.staticData,
                rotatingCircle = this.rotatingCircle,
                numberLine = rotatingCircle.numberLine,
                numberLineTicksGroup = this.rotatingCircle.numberLineTicksGroup,
                $canvasContainer = this.$('.mapping-tab-canvas-container'),
                startingTick = null;

            if (rotatingCircle.imposedLine) {
                rotatingCircle.imposedLine.remove();
            }


            if (numberLine) {
                numberLine.remove();
            }
            numberLine = new paperScope.Path();


            if (numberLineTicksGroup) {
                numberLineTicksGroup.remove();
            }
            numberLineTicksGroup = new paperScope.Group();


            numberLine.strokeColor = modelClassName.NUMBERLINE_COLOR;
            numberLine.strokeWidth = modelClassName.NUMBERLINE_THICKNESS;
            numberLine.add(new paperScope.Point(staticData.numberline_length_coordinates));
            numberLine.add(new paperScope.Point(staticData.numberline_coordinates_final_x, staticData.numberline_coordinates_y));

            startingTick = className.SHOW_VERTICAL_TICK_AT(paperScope, staticData.numberline_coordinates_x, staticData.numberline_coordinates_y);
            endingTick = className.SHOW_VERTICAL_TICK_AT(paperScope, staticData.numberline_coordinates_final_x - Math.floor(modelClassName.NUMBERLINE_THICKNESS / 2), staticData.numberline_coordinates_y);
            this.verticalEndingTick = endingTick;
            rotatingCircle.numberLineTicksGroup = numberLineTicksGroup;
            rotatingCircle.startingTick = startingTick;
            rotatingCircle.numberLine = numberLine;
            return;
        },

        /**
        * Renders labels
        * @method renderLabels
        */
        renderLabels: function renderLabels() {
            this.$('.' + className.FRACTION_CLASS).remove();
            var paperScope = this.paperScope,
                staticData = this.staticData,
                rotatingCircle = this.rotatingCircle,
                radialGroup = rotatingCircle.radialGroup,
                radialGroupChildren = radialGroup.children,
                noOfRadius = rotatingCircle.noOfRadius,
                radialGroupLength = radialGroup.children.length,
                circle = rotatingCircle.circle,
                LABEL_OFFSET = modelClassName.LABEL_OFFSET,
                LABEL_OFFSET_HALF = LABEL_OFFSET / 2,
                currentRadius = null,
                labelPoint = null,
                endPoint = null,
                index = null,
                angle = null,
                labelDataArray = [],
                fraction = null,
                $canvasContainer = this.$('.mapping-tab-canvas-container'),
                $fractionContainer = null,
                labelDataObject = null,
                numberLineX = staticData.numberline_coordinates_x,
                numberLineY = staticData.numberline_coordinates_y,
                totalLength = staticData.circle_circumference + numberLineX,
                unwrappingCircleActivity = this.model.get('unwrappingCircleActivity'),
                hideLabel = true,
                labelTopLeftPoint = {
                    x: totalLength - LABEL_OFFSET_HALF,
                    y: Math.round(numberLineY + LABEL_OFFSET_HALF)
                };
            //Handle 2Pi label
            var isAngleUnitInRadians = this.model.getAngleUnit() === className.ANGLE_UNITS[0] ? false : true;

            if (isAngleUnitInRadians === true) {
                fraction = className.GET_ANGLE_IN_RADIANS(360, true);
                fraction.numerator = unwrappingCircleActivity ? this._changeRadianToLength(fraction.numerator) : fraction.numerator;
                $fractionContainer = className.GET_FRACTION_DIV_STRUCTURE(fraction.numerator, fraction.denominator);
            } else {
                $fractionContainer = className.GET_FRACTION_DIV_STRUCTURE(360, '');
            }

            $canvasContainer.append($fractionContainer);
            $fractionContainer.css({
                'top': labelTopLeftPoint.y,
                'left': labelTopLeftPoint.x
            });

            if (unwrappingCircleActivity) {
                this._showHideLabel($fractionContainer, hideLabel);
            }
            $fractionContainer.removeClass(className.EMPTY_DENOMINATOR_CLASS).addClass(className.NO_SEPARATOR_ClASS);
            this.rotatingCircle.$lastLabel = $fractionContainer;
            if (isAngleUnitInRadians === true) {
                for (index = 0; index < radialGroupLength; index++) {
                    angle = index * 360 / noOfRadius;
                    // Get the div structure
                    fraction = className.GET_ANGLE_IN_RADIANS(angle);
                    fraction.numerator = unwrappingCircleActivity ? this._changeRadianToLength(fraction.numerator) : fraction.numerator;
                    $fractionContainer = className.GET_FRACTION_DIV_STRUCTURE(fraction.numerator, fraction.denominator);
                    $canvasContainer.append($fractionContainer);
                    labelDataObject = {
                        $div: $fractionContainer,
                        isOnCircle: true
                    };
                    labelDataArray.push(labelDataObject);

                    if (unwrappingCircleActivity) {
                        this._showHideLabel($fractionContainer, hideLabel);
                    }

                }
            }
            else {
                for (index = 0; index < radialGroupLength; index++) {
                    // Get the div structure
                    angle = index * 360 / noOfRadius;
                    $fractionContainer = className.GET_FRACTION_DIV_STRUCTURE(angle, '');
                    $canvasContainer.append($fractionContainer);
                    labelDataObject = {
                        $div: $fractionContainer,
                        isOnCircle: true
                    };
                    labelDataArray.push(labelDataObject);
                }
            }

            var $radiusLabelContainer = $('<div>', {
                'id': this.idPrefix + className.RADIUS_LABEL_CLASS,
                'class': className.RADIUS_LABEL_CLASS
            }).html(this.getMessage('radius-label-container', 0));
            if ($('.' + className.RADIUS_LABEL_CLASS).length === 0 && this.model.get('unwrappingCircleActivity') === true) {
                $canvasContainer.append($radiusLabelContainer);
            }

            // remove the reference circle
            this.rotatingCircle.labelDataArray = labelDataArray;
            this.placeLabelsOnCircle();
            return;
        },

        /**
        * Initializes accessibility
        *
        * @method _initAccessibility
        * @private
        */
        _initAccessibility: function () {
            var canvasAccOption = {
                canvasHolderID: this.idPrefix + 'mapping-tab-canvas-acc-container',
                paperItems: [],
                paperScope: this.paperScope,
                manager: this.manager,
                player: this.player
            };

            this.canvasAcc = MathInteractives.global.CanvasAcc.intializeCanvasAcc(canvasAccOption);
            this.canvasAcc.updatePaperItems(this.getPaperObjects());

            //console.log(canvasAccOption.paperItems);
        },

        /**
        * Gets all current paper objects on canvas
        *     
        * @method getPaperObjects
        * return {Array} [paperObj] array of paper objects
        **/
        getPaperObjects: function () {
            var currSegment,
                paperObj = [];
            paperObj.push(this.rotatingCircle.dragHandle);
            //paperObj.push(this.rotatingCircle.bubbleGroup);


            return paperObj;

        },

        /**
        * Sets Acc for Unwrapping a circle interactive
        *     
        * @method setAccOfUnwrapping
        * @param CirclePositionForAcc {Number/String} 
        * 0 : text suggesting to press space button
        * 1 : at start point , 
        * 2 : before line,
        * 3 : on the line,
        * 4 : end of line
        **/
        setAccOfUnwrapping: function setAccOfUnwrapping() {
            if (this.model.get('unwrappingCircleActivity') === true) {
                if (this.circlePositionForAcc === 0) {
                    this.changeAccMessage('mapping-tab-activity-acc-container', this.lastCirclePositionForAcc);
                }
                else {
                    this.changeAccMessage('mapping-tab-activity-acc-container', this.circlePositionForAcc);
                }
                this.changeAccMessage('mapping-tab-canvas-acc-container', this.circlePositionForAcc);
                return;
            }
        },

        setDefaultAcc: function setDefaultAcc(event) {
            var keycode = (event.keycode) ? event.keycode : event.which,
                lineValue = [];

            //Space pressed
            if (keycode === 32) {


                // set canvas text depending on position of circle : Unwrapping interactivity only
                this.isFocusInCanvas = true;
                if (this.lastCirclePositionForAcc !== 0) {
                    this.circlePositionForAcc = this.lastCirclePositionForAcc;
                }
                else {
                    //arriving on canvas for 1st time
                    this.circlePositionForAcc = 1;
                }

                this.mappingFocusRect.opacity = 1;

                if (this.canvasAccPrevTextData && this.canvasAccPrevTextData.id) {
                    this.changeAccMessage('mapping-tab-canvas-acc-container', this.canvasAccPrevTextData.id, this.canvasAccPrevTextData.placeHolders);
                }
                else {
                    this._changeCanvasAccText('mapping-tab-canvas-acc-container', 1);
                    this._enableDisableTryAnotherButton(false);
                }

            }
            if (keycode === 9) {

                //this.drawFocusRect(this.rotatingCircle.dragHandle, 0);
                this.mappingFocusRect.opacity = 0;
                this.paperScope.view.draw();
                this.changeAccMessage('mapping-tab-canvas-acc-container', 0);

                if (this.isFocusInCanvas) {
                    //store current position of circle : Unwrapping interactivity only
                    this.lastCirclePositionForAcc = this.circlePositionForAcc;
                    this.circlePositionForAcc = 0;
                    this.isFocusInCanvas = false;
                }
            }
            this.setAccOfUnwrapping();
        },

        _changeCanvasAccText: function _changeCanvasAccText(elementID, msgID, placeHolders) {
            this.changeAccMessage(elementID, msgID, placeHolders);
            this.canvasAccPrevTextData.id = msgID;
            this.canvasAccPrevTextData.placeHolders = placeHolders
        },

        /**
        * bind listeners to accessibility
        *
        * @method _bindAccessibilityListeners
        * @private
        */
        _bindAccessibilityListeners: function () {
            var keyEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS,
                canvasEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_EVENTS,
                $canvasHolder = $('#' + this.idPrefix + 'mapping-tab-canvas-acc-container'),
                self = this;
            $canvasHolder.off(keyEvents.ARROW).on(keyEvents.ARROW, $.proxy(this.arrowKeyPressed, this));
        },

        arrowKeyPressed: function arrowKeyPressed(event, data) {

            var self = this, item = data.item, eventpoint = data.point, step = 4,
                stepWidth = (modelClassName.CIRCLE_RADIUS * 2 * Math.PI) / 120, newPos, currentAngle,
                selectedPoints = this.model.get('noOfRadius');


            event.target = item;
            event.target.name = item.name;
            event.event = event;
            event.event.which = 1;


            newPos = this.rotatingCircle.dragHandle.position.getX() + data.directionX * stepWidth;

            if (self.rotatingCircle.dragHandle.position.getX() > self.staticData.numberline_coordinates_x) {
                currentAngle = Math.round((self.rotatingCircle.dragHandle.position.getX() - self.staticData.numberline_coordinates_x) * 360 / (modelClassName.CIRCLE_RADIUS * 2 * Math.PI));


            }
            //if (selectedPoints === 16) {

            //    if (self.isPointsGenerated === false) {
            //        for (var i = 0; i < selectedPoints - 1; i++) {
            //            self.displayedPoints.push(self.displayedPoints[i] + (360 / 16));
            //        }
            //        self.displayedPoints.splice(0, 1);
            //        self.isPointsGenerated = true;
            //    }
            //    if (self.isDraggedToNext === true) {
            //        newPos = self.rotatingCircle.dragHandle.position.getX() + 4.5;
            //        self.isDraggedToNext = false;

            //    }

            //    if (self.displayedPoints[0] % 3 === 0) {
            //        self.displayedPoints.splice(0, 1);

            //    }


            //    if ((currentAngle + 4.5) === self.displayedPoints[0]) {

            //        newPos = self.rotatingCircle.dragHandle.position.getX() + 4.5;

            //        self.displayedPoints.splice(0, 1);
            //        self.isDraggedToNext = true;

            //    }
            //}
            event.point = {
                x: newPos

            };


            //this.bindDragHandleEvent(event.point.x);
            this.rotatingCircle.dragHandle.onMouseDrag(false, event.point.x, data);
        },



        /**
        * Changes labels according to the unit
        * @method changeLabels
        */
        changeLabels: function changeLabels() {

            var paperScope = this.paperScope,
                    staticData = this.staticData,
                    rotatingCircle = this.rotatingCircle,
                    radialGroup = rotatingCircle.radialGroup,
                    radialGroupChildren = radialGroup.children,
                    noOfRadius = rotatingCircle.noOfRadius,
                    radialGroupLength = radialGroup.children.length,
                    $canvasContainer = this.$('.mapping-tab-canvas-container'),
                    prevPos = null,
                    index = null,
                    angle = null,
                    labelDataArray = this.rotatingCircle.labelDataArray,
                    fraction = null,
                    $fractionDivStruct = null,
                    hideLabel = true,
                    unwrappingCircleActivity = this.model.get('unwrappingCircleActivity'),
                    labelDataObject = null;

            //Handle 2Pi label

            var isAngleUnitInRadians = this.model.getAngleUnit() === className.ANGLE_UNITS[0] ? false : true;

            if (isAngleUnitInRadians === true) {
                fraction = className.GET_ANGLE_IN_RADIANS(360, true);
                fraction.numerator = unwrappingCircleActivity ? this._changeRadianToLength(fraction.numerator) : fraction.numerator;
                $fractionContainer = className.GET_FRACTION_DIV_STRUCTURE(fraction.numerator, fraction.denominator);
            } else {
                $fractionContainer = className.GET_FRACTION_DIV_STRUCTURE(360, '');
            }

            prevPos = rotatingCircle.$lastLabel.position();

            $fractionContainer.css({
                top: prevPos.top,
                left: prevPos.left
            });


            $fractionContainer.removeClass(className.EMPTY_DENOMINATOR_CLASS).addClass(className.NO_SEPARATOR_ClASS);
            rotatingCircle.$lastLabel.remove();
            $canvasContainer.append($fractionContainer);
            rotatingCircle.$lastLabel = $fractionContainer;
            if (unwrappingCircleActivity) {
                this._setPositionOfLastLabel($fractionContainer);
                this._showHideLabel($fractionContainer, hideLabel);
            }


            if (isAngleUnitInRadians === true) {
                for (index = 0; index < radialGroupLength; index++) {
                    labelDataObject = labelDataArray[index];
                    angle = index * 360 / noOfRadius;
                    // Get the div structure
                    fraction = className.GET_ANGLE_IN_RADIANS(angle);
                    fraction.numerator = unwrappingCircleActivity ? this._changeRadianToLength(fraction.numerator) : fraction.numerator;
                    $fractionDivStruct = className.GET_FRACTION_DIV_STRUCTURE(fraction.numerator, fraction.denominator);

                    if (labelDataObject.isOnCircle === false && fraction.denominator === '') {
                        $fractionDivStruct.removeClass(className.EMPTY_DENOMINATOR_CLASS).addClass(className.NO_SEPARATOR_ClASS);
                    }

                    labelDataObject.$div.remove();
                    $canvasContainer.append($fractionDivStruct);
                    labelDataObject.$div = $fractionDivStruct;

                    if (unwrappingCircleActivity) {
                        this._showHideLabel($fractionDivStruct, hideLabel);
                    }
                }
            }
            else {

                for (index = 0; index < radialGroupLength; index++) {
                    labelDataObject = labelDataArray[index];
                    // Get the div structure
                    angle = index * 360 / noOfRadius;
                    $fractionDivStruct = className.GET_FRACTION_DIV_STRUCTURE(angle, '');

                    labelDataObject.$div.remove();
                    $canvasContainer.append($fractionDivStruct);
                    labelDataObject.$div = $fractionDivStruct;
                }
            }
            this.updateLabels(true);
            return;
        },


        /**
        * set position of last label at his final position
        * @method _setPositionOfLastLabel
        * @param {object} $fractionContainer last label cont div
        */

        _setPositionOfLastLabel: function ($fractionContainer) {
            var staticData = this.staticData,
                numberLineX = staticData.numberline_coordinates_x,
                numberLineY = staticData.numberline_coordinates_y,
                numberLineLength = staticData.numberline_length,
                idPrefix = this.idPrefix,
                lablePaddingX = modelClassName.NUMBERLINE_TO_LABEL_PADDING,
                lablePaddingY = modelClassName.LABEL_OFFSET_FOR_UNWRAPPING / 2,
                $lastlabelCont = this.$('#' + idPrefix + '');
            $fractionContainer.css({
                top: numberLineY + lablePaddingX,
                left: numberLineX + numberLineLength - lablePaddingY

            });


        },

        /**
        * show or hide last given div
        * @param {object} $fractionContainer cont div to hide/show
        * @param {boolean} show or hide given div
        */
        _showHideLabel: function ($fractionContainer, hideLabel) {
            if (hideLabel) {
                $fractionContainer.hide();

            }
            else if (hideLabel === false) {

                $fractionContainer.show();
            }

        },

        /**
        * show all div with of labels at the end 
        * @method _showAllLabels       
        */
        _showAllLabels: function () {
            this.$('.fraction-container.no-separator').show();

        },

        /**
        * Binds Event Handler for dragHandle cursor change
        * @method bindEventForHandCursorOnHandle
        */
        bindEventForHandCursorOnHandle: function bindEventForHandCUrsorOnHandle() {
            var self = this,
                tool = this.tool,
                $canvas = this.$el,
                isHandCursor = false,
                openHandCursorPath = 'url("' + self.filePath.getImagePath('open-hand') + '"), move',
                closedHandCursorPath = 'url("' + self.filePath.getImagePath('closed-hand') + '"), move',
                isRotating = false;
            //$canvas.css({ 'cursor': 'pointer' });

            this.rotatingCircle.dragHandle.onMouseMove = function (event) {
                if (self.circleCrossedOver === true) {
                    return
                }
                $canvas.css({ 'cursor': openHandCursorPath });
            };

            this.rotatingCircle.dragHandle.onMouseDown = function (event) {
                if (event.event.which == 1 || event.event.which == 0) {
                    if (self.circleCrossedOver === true) {
                        return
                    }
                    $canvas.css({ 'cursor': closedHandCursorPath });
                    isRotating = true;
                }
            };

            this.rotatingCircle.dragHandle.onMouseUp = function (event) {

                if (self.circleCrossedOver === true) {
                    return
                }
                $canvas.css({ 'cursor': 'default' });
            };

            this.rotatingCircle.dragHandle.onMouseLeave = function (event) {

                if (self.circleCrossedOver === true) {
                    return
                }
                var fillColor = {
                    gradient: {
                        stops: modelClassName.DRAG_HANDLE_GRADIENT
                    },
                    origin: [modelClassName.CIRCLE_CENTRE_COORDINATES_X, modelClassName.CIRCLE_CENTRE_COORDINATES_Y - modelClassName.DRAG_HANDLE_RADIUS],
                    destination: [modelClassName.CIRCLE_CENTRE_COORDINATES_X, modelClassName.CIRCLE_CENTRE_COORDINATES_Y + modelClassName.DRAG_HANDLE_RADIUS]
                };

                this.fillColor = fillColor;

                if (!isRotating) {
                    $canvas.css({ 'cursor': 'default' });
                    isHandCursor = false;
                }
            };

            this.rotatingCircle.dragHandle.onMouseEnter = function (event) {


                if (self.circleCrossedOver === true || self.player.getModalPresent()) {
                    return
                }
                var fillColor = {
                    gradient: {
                        stops: modelClassName.DRAG_HANDLE_GRADIENT_HOVER
                    },
                    origin: [modelClassName.CIRCLE_CENTRE_COORDINATES_X, modelClassName.CIRCLE_CENTRE_COORDINATES_Y - modelClassName.DRAG_HANDLE_RADIUS],
                    destination: [modelClassName.CIRCLE_CENTRE_COORDINATES_X, modelClassName.CIRCLE_CENTRE_COORDINATES_Y + modelClassName.DRAG_HANDLE_RADIUS]
                };

                this.fillColor = fillColor;
            }

            tool.onMouseUp = function (event) {
                $canvas.css({ 'cursor': 'default' });
                isRotating = false;
            };

            tool.onMouseEnter = function (event) {
                self.paperScope.activate();
            };
        },

        /**
        * Binds Event Handler for dragHandle
        * @method bindDragHandleEvent
        */
        bindDragHandleEvent: function bindDragHandleEvent(eventPointX) {

            var dragHandle = this.rotatingCircle.dragHandle;


            if (dragHandle) {
                var self = this,
                    paperScope = this.paperScope,
                    staticData = this.staticData,
                    rotatingCircle = this.rotatingCircle,
                    imposedCircle = null,
                    remainingCircle = null,
                    circle = rotatingCircle.circle,
                    radialGroup = rotatingCircle.radialGroup,
                    bubbleGroup = rotatingCircle.bubbleGroup,
                    bubbleGroupFirstChildPosition = null,
                    targetPointX = null,
                    dragHandlePosition = null,
                    dragHandlePositionX = null,
                    dragHandlePositionY = null,
                    angleToRotate = null,
                    newCentre = null,
                    numberLineX = staticData.numberline_coordinates_x,
                    numberLineY = staticData.numberline_coordinates_y,
                    numberLineFinalX = staticData.numberline_coordinates_final_x,
                    numberLineMidX = (numberLineX + numberLineFinalX) / 2,
                    imposedLine = null,
                    imposedLength = null,
                    circleStartingPoint = (modelClassName.CIRCLE_CENTRE_COORDINATES_X),
                    imposedLineStyleObject = {
                        segments: [[numberLineX, numberLineY]],
                        strokeWidth: modelClassName.NUMBERLINE_THICKNESS,
                        strokeColor: modelClassName.CIRCLE_COLOR
                    },
                    from = null,
                    through = null,
                    to = null,
                    currentCirclePositionX = null;


                dragHandle.onMouseDrag = function (event, eventPointX, accData) {
                    if (event.event.which == 1 || event.event.which == 0) {
                        MathInteractives.global.SpeechStream.stopReading();
                        paperScope.activate();
                        if (event === false) {
                            targetPointX = eventPointX;
                        }
                        else {
                            targetPointX = event.point.x;
                        }
                        dragHandlePosition = dragHandle.position;
                        dragHandlePositionX = dragHandle.position.getX();
                        dragHandlePositionY = dragHandle.position.getY();
                        angleToRotate = null;

                        currentCirclePositionX = circle.position.getX();
                        //if (self.model.get('unwrappingCircleActivity') === false) {
                        //    self.$el.find('#' + self.idPrefix + 'dummy-center-help').css({ left: dragHandlePositionX });
                        //}
                        // REMOVE THE EQUAL TO SIGN TO STOP THE CIRCLE ON END POINTS
                        if (currentCirclePositionX >= circleStartingPoint && currentCirclePositionX <= numberLineFinalX) {
                            if (targetPointX <= circleStartingPoint) {
                                self.circlePositionForAcc = 1;
                                self.completelyMoved = false;
                            }
                            else if (targetPointX > circleStartingPoint && targetPointX < numberLineX) {
                                self.circlePositionForAcc = 2;
                                self.completelyMoved = false;
                            }
                            else if (targetPointX >= numberLineX && targetPointX < numberLineFinalX) {
                                if (parseInt(Math.round(targetPointX * 10000)) / 10000 === parseInt(Math.round((numberLineX + numberLineFinalX) / 2 * 10000)) / 10000) {
                                    self.circlePositionForAcc = 'pi-r';
                                }
                                else {
                                    self.circlePositionForAcc = 3;
                                    self.completelyMoved = false;
                                }
                            }
                            else if (targetPointX >= numberLineFinalX) {
                                self.circlePositionForAcc = 4;
                                self.showHideNextButton(true);
                                self.completelyMoved = true;
                            }
                            self.setAccOfUnwrapping();

                            if (targetPointX < circleStartingPoint) {
                                targetPointX = circleStartingPoint;
                            }
                            if (targetPointX > numberLineFinalX) {
                                targetPointX = numberLineFinalX;//after numberline
                                //circle.visible = true;
                                //circle.strokeColor = modelClassName.REMAINING_CIRCLE_COLOR;
                                circle.strokeColor = modelClassName.REMAINING_CIRCLE_COLOR;
                                circle.strokeWidth = modelClassName.REMAINING_CIRCLE_WIDTH;
                                if (imposedCircle) {
                                    imposedCircle.remove();
                                }
                                if (remainingCircle) {
                                    remainingCircle.remove();
                                }

                                if (imposedLine) {
                                    imposedLine.removeChildren();
                                    imposedLine.add(new paperScope.Point(numberLineX, numberLineY));
                                    imposedLine.add(new paperScope.Point(numberLineX + staticData.numberline_length, numberLineY));
                                }

                            }
                            if (targetPointX === numberLineFinalX) {
                                rotatingCircle.$lastLabel.show();
                            }
                            //if (self.model.get('unwrappingCircleActivity') === false) {
                            //    if (Math.abs(currentCirclePositionX - circleStartingPoint) < 2 && self.nextBtnView.$el && self.nextBtnView.$el.css('display') !== 'block') {
                            //        self.directionTextView.changeButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
                            //    }
                            //    else {
                            //        self.directionTextView.changeButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                            //    }
                            //}
                            self.changeAccMessage('mapping-tab-activity-acc-container', 1);

                            if (targetPointX < numberLineFinalX) {
                                circle.strokeColor = modelClassName.CIRCLE_COLOR;
                            }
                            angleToRotate = ((targetPointX - dragHandlePositionX) / staticData.circle_circumference) * 360;

                            newCentre = targetPointX > numberLineFinalX ? numberLineFinalX : targetPointX;
                            newCentre = targetPointX < circleStartingPoint ? circleStartingPoint : targetPointX;

                            var $dummyCenterHelp = self.$el.find('#' + self.idPrefix + 'dummy-center-help'),
                            halfWidth = Math.round($dummyCenterHelp.width() / 2);
                            //if (self.model.get('unwrappingCircleActivity') === true) {
                            $dummyCenterHelp.css({ left: newCentre - halfWidth });
                            //}
                            dragHandlePosition.setX(newCentre);
                            circle.position.setX(newCentre);
                            radialGroup.position.setX(newCentre);
                            bubbleGroup.position.setX(newCentre);

                            radialGroup.rotate(angleToRotate);
                            bubbleGroup.rotate(angleToRotate);
                            currentCirclePositionX = circle.position.getX();

                            if (currentCirclePositionX > numberLineX && currentCirclePositionX < numberLineFinalX) {
                                if (imposedLine) {// remove the imposed line if already present.
                                    imposedLine.remove();
                                }

                                imposedLine = new paperScope.Path(imposedLineStyleObject);
                                imposedLength = currentCirclePositionX - numberLineX;
                                imposedLine.add(new paperScope.Point(numberLineX + imposedLength, numberLineY));

                                bubbleGroupFirstChildPosition = bubbleGroup.firstChild.position;


                                if (imposedCircle) {
                                    imposedCircle.remove();
                                }

                                if (remainingCircle) {
                                    remainingCircle.remove();
                                }

                                // logic to calculate the from, through and to paper Point instances
                                // to draw the imposed circle or arc.

                                from = new paperScope.Point(bubbleGroupFirstChildPosition.getX(), bubbleGroupFirstChildPosition.getY());
                                to = new paperScope.Point(numberLineX + imposedLength, numberLineY);
                                //check for from , to being same point , which is a case when circle is at the end
                                if (parseInt(Math.round(from.x * 100000)) / 100000 === parseInt(Math.round(to.x * 100000)) / 100000 &&
                                parseInt(Math.round(from.y * 100000)) / 100000 === parseInt(Math.round(to.y * 100000)) / 100000) {
                                    circle.strokeWidth = modelClassName.REMAINING_CIRCLE_WIDTH;
                                    circle.strokeColor = modelClassName.REMAINING_CIRCLE_COLOR;
                                }
                                else {
                                    through = currentCirclePositionX > numberLineMidX ?
                                             circle.getNearestPoint(new paperScope.Point(numberLineMidX, numberLineY - modelClassName.CIRCLE_RADIUS)) :
                                             circle.getNearestPoint(new paperScope.Point((from.x + to.x) / 2, (from.y + to.y) / 2));

                                    if (to.x === through.x && to.y === through.y) {
                                        //Patch for imposed circle passing through radius issue
                                        through.x = through.x - modelClassName.CIRCLE_RADIUS;
                                        through.y = through.y - modelClassName.CIRCLE_RADIUS;
                                    }

                                    imposedCircle = new paperScope.Path.Arc(from, through, to);
                                    imposedCircle.strokeWidth = modelClassName.REMAINING_CIRCLE_WIDTH;
                                    imposedCircle.strokeColor = modelClassName.REMAINING_CIRCLE_COLOR;

                                    through = currentCirclePositionX <= numberLineMidX ?
                                             circle.getNearestPoint(new paperScope.Point(numberLineMidX, numberLineY - modelClassName.CIRCLE_RADIUS)) :
                                             circle.getNearestPoint(new paperScope.Point((from.x + to.x) / 2, (from.y + to.y) / 2));

                                    remainingCircle = new paperScope.Path.Arc(from, through, to);
                                    remainingCircle.strokeWidth = modelClassName.NUMBERLINE_THICKNESS;
                                    remainingCircle.strokeColor = modelClassName.CIRCLE_COLOR;
                                    // reposition the elements in terms of their z-order.
                                    //circle.visible = false;
                                    circle.strokeWidth = 0;
                                    imposedCircle.bringToFront();
                                    imposedLine.bringToFront();
                                    rotatingCircle.numberLineTicksGroup.bringToFront();
                                    self.verticalEndingTick.bringToFront();
                                }
                            }
                            else {// block executed if the circle is not on the numberline

                                if (targetPointX < numberLineX) {//before numberline
                                    // makes the actual circle green when it reaches before the start point
                                    circle.strokeColor = modelClassName.CIRCLE_COLOR;
                                    circle.strokeWidth = modelClassName.NUMBERLINE_THICKNESS;
                                    if (imposedLine) {
                                        imposedLine.remove();
                                    }
                                    if (imposedCircle) {
                                        imposedCircle.remove();
                                    }
                                    if (remainingCircle) {
                                        remainingCircle.remove();
                                    }

                                }

                                if (targetPointX > numberLineFinalX) {//after numberline
                                    //circle.visible = true;
                                    circle.strokeWidth = modelClassName.REMAINING_CIRCLE_WIDTH;
                                    circle.strokeColor = modelClassName.REMAINING_CIRCLE_COLOR;
                                    if (imposedCircle) {
                                        imposedCircle.remove();
                                    }
                                    if (remainingCircle) {
                                        remainingCircle.remove();
                                    }

                                    if (imposedLine) {
                                        imposedLine.removeChildren();
                                        imposedLine.add(new paperScope.Point(numberLineX, numberLineY));
                                        imposedLine.add(new paperScope.Point(numberLineX + staticData.numberline_length, numberLineY));
                                    }

                                }
                            }

                            rotatingCircle.remainingCircle = remainingCircle;
                            rotatingCircle.imposedCircle = imposedCircle;
                            rotatingCircle.imposedLine = imposedLine;
                            if (self.isAccessible()) {
                                self.drawFocusRect(dragHandle, 1);
                            }

                        }
                        self.updateLabels(false, accData);
                    }
                    }
                }
           // }
            // this.canvasAcc.updatePaperItems(this.getPaperObjects(), false);

            return;
        },

        /**
        * enables/disables try another button
        * @method _enableDisableTryAnotherButton
        * @param enable {Boolean} true/false to enable / disable button respectively
        */
        _enableDisableTryAnotherButton: function _enableDisableTryAnotherButton(enable) {
            if (this.model.get('unwrappingCircleActivity') === false && this.directionTextView !== null) {
                if (enable === true) {
                    this.directionTextView.changeButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                }
                else {
                    this.directionTextView.changeButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
                }
            }
        },

        /**
        * Updates position of labels if the label is on numberline or on circle
        * @method updateLabels
        */
        updateLabels: function updateLabels(isLabelChange, accData) {

            var paperScope = this.paperScope,
                staticData = this.staticData,
                rotatingCircle = this.rotatingCircle,
                labelDataArray = rotatingCircle.labelDataArray,
                labelDataArrayLength = labelDataArray.length,
                radialGroup = rotatingCircle.radialGroup,
                radialGroupChildren = radialGroup.children,
                circle = rotatingCircle.circle,
                numberLineTicksGroup = rotatingCircle.numberLineTicksGroup,
                LABEL_OFFSET = modelClassName.LABEL_OFFSET,
                LABEL_OFFSET_HALF = LABEL_OFFSET / 2,
                currentLabelDataObject = null,
                labelTopLeftPoint = null,
                numberLineX = staticData.numberline_coordinates_x,
                numberLineFinalX = staticData.numberline_coordinates_final_x,
                numberLineY = staticData.numberline_coordinates_y,
                index = null,
                currentCirclePositionX = circle.position.getX(),
                currentCirclePositionY = circle.position.getY(),
                angleBetweenRadiuses = 360 / rotatingCircle.noOfRadius,
                consequtiveRadiusDistance = Math.round(angleBetweenRadiuses / 360 * 2 * Math.PI * modelClassName.CIRCLE_RADIUS),
                noOfLabelsOnLine = Math.ceil((currentCirclePositionX - numberLineX) / consequtiveRadiusDistance),
                noOfLabelsOnCircle = labelDataArrayLength - noOfLabelsOnLine,
                distanceBetweenEndRadiuses = null,
                $currentFractionContainer = null,
                tickLine = null,
                totalLength = null,
                lineValue = [],
                fractionSeperator = null,
                denominatorText = null,
                unwrappingCircleActivity = this.model.get('unwrappingCircleActivity'),
                circleStartingPoint = (modelClassName.CIRCLE_CENTRE_COORDINATES_X),
                isOnCircle = null;
            // logic for updating the booleans of label data depending on whether
            // the label is on numberline or on circle


            // if circle is on the number line, determine the distance from the
            // starting point of numberline and place the labels on the numberline
            // corresponding to the distance.
            if (currentCirclePositionX >= circleStartingPoint && currentCirclePositionX <= numberLineFinalX) {
                //if (this.model.get('unwrappingCircleActivity') === false && currentCirclePositionX === numberLineFinalX) {
                //    this.feedbackView.showFeedback();
                //}
                if (unwrappingCircleActivity && currentCirclePositionX < numberLineFinalX) {
                    rotatingCircle.$lastLabel.hide();
                }

                //Set circle text before reaching number line

                if (currentCirclePositionX < numberLineX && currentCirclePositionX > circleStartingPoint) {
                    this._changeCanvasAccText('mapping-tab-canvas-acc-container', 7);
                    this._enableDisableTryAnotherButton(true);
                }
                if (currentCirclePositionX <= circleStartingPoint || (currentCirclePositionX - circleStartingPoint) <= 0.02) {
                    this._changeCanvasAccText('mapping-tab-canvas-acc-container', 1);
                    this.changeAccMessage('mapping-tab-activity-acc-container', 0)
                    if (this.nextBtnView.$el && this.nextBtnView.$el.css('display') !== 'block') {
                        this._enableDisableTryAnotherButton(false);
                    }
                    else {
                        this._enableDisableTryAnotherButton(true);
                    }
                }
                var wasCircleOnLastValue = this.wasCircleOnLastValue;
                if (0.02 >= (numberLineFinalX - currentCirclePositionX)) {
                    this.wasCircleOnLastValue = true;
                }
                else {
                    this.wasCircleOnLastValue = false;
                }

                this.circleCrossedOver = false;
                numberLineTicksGroup.removeChildren();
                for (index = 0; index < labelDataArrayLength; index++) {
                    isOnCircle = true;
                    currentLabelDataObject = labelDataArray[index];

                    // based on the length covered,
                    // set isOnCircle as false
                    // hide the radius
                    // and place the labels on the numberline
                    if (index < noOfLabelsOnLine) {
                        isOnCircle = false;
                        distanceBetweenEndRadiuses = index * consequtiveRadiusDistance;
                        this.placeLabelsOnLine(currentLabelDataObject, distanceBetweenEndRadiuses);

                        //Lable added to the line
                        if ((noOfLabelsOnLine !== this.noOfLabelsPlaced) && (index === this.noOfLabelsPlaced) && accData && accData.directionX === 1) {
                            var currentElement = this.getRadianValueInString(labelDataArray[index].$div);
                            //console.log("push " + currentElement);
                            this._changeCanvasAccText('mapping-tab-canvas-acc-container', 2, [currentElement]);
                            this.noOfLabelsPlaced = noOfLabelsOnLine;
                            this.noOfLabelsPlacedOnCircle--;

                        }//Label removed from the line
                        else if ((noOfLabelsOnCircle !== this.noOfLabelsPlacedOnCircle) && (index === noOfLabelsOnLine - 1) && accData && accData.directionX === -1) {
                            var currentElement;
                            if (index !== labelDataArray.length - 1) {
                                currentElement = this.getRadianValueInString(labelDataArray[index + 1].$div);
                            }
                            else {
                                var tempDiv = className.GET_FRACTION_DIV_STRUCTURE('2π', '');// Fix for the last point, for the array is out of bounds
                                currentElement = this.getRadianValueInString(tempDiv);
                            }
                            this._changeCanvasAccText('mapping-tab-canvas-acc-container', 3, [currentElement]);
                            this.noOfLabelsPlacedOnCircle = noOfLabelsOnCircle;
                            this.noOfLabelsPlaced--;

                        }// '2 pi' Label removed from the line
                        else if ((wasCircleOnLastValue === true) && (index === noOfLabelsOnLine - 1) && accData && accData.directionX === -1) {
                            var currentElement;
                            if (index === labelDataArray.length - 1) {
                                var tempDiv = className.GET_FRACTION_DIV_STRUCTURE('2π', '');// Fix for the last point, for the array is out of bounds
                                currentElement = this.getRadianValueInString(tempDiv);
                            }
                            this._changeCanvasAccText('mapping-tab-canvas-acc-container', 3, [currentElement]);
                        }
                        else if (index === noOfLabelsOnLine - 1) {
                            if (index === 0) {
                                this._changeCanvasAccText('mapping-tab-canvas-acc-container', 4);
                            }
                            else {
                                var currentElement = this.getRadianValueInString(labelDataArray[index].$div);
                                this._changeCanvasAccText('mapping-tab-canvas-acc-container', 5, [currentElement]);
                            }
                        }
                    }//Label removed from the line where value is 0
                    else if ((noOfLabelsOnCircle !== this.noOfLabelsPlacedOnCircle) && (index === noOfLabelsOnLine) && accData && accData.directionX === -1) {
                        var currentElement = this.getRadianValueInString(labelDataArray[index].$div);
                        console.log("pop " + currentElement);
                        this._changeCanvasAccText('mapping-tab-canvas-acc-container', 3, [currentElement]);
                        this.noOfLabelsPlacedOnCircle = noOfLabelsOnCircle;
                        this.noOfLabelsPlaced--;

                    }

                    currentLabelDataObject.isOnCircle = isOnCircle;
                    //hides radii
                    if (currentCirclePositionX < numberLineFinalX) {
                        radialGroupChildren[index].visible = isOnCircle;
                    }
                    else {
                        radialGroupChildren[index].visible = false;
                    }

                    if (unwrappingCircleActivity) {
                        radialGroupChildren[index].visible = true;
                    }
                }
            }

            else {
                // else if circle's x co-ordinate is beyond the number line
                // set all the labels on line
                if (currentCirclePositionX >= numberLineFinalX && !this.circleCrossedOver) {
                    //to allow the hand cursor on last point of line
                    if (currentCirclePositionX > numberLineFinalX) {
                        this.circleCrossedOver = true;
                    }
                    this.player.enableHelpElement('dummy-center-help', 0, false);

                    for (index = 0; index < labelDataArrayLength; index++) {
                        currentLabelDataObject = labelDataArray[index];
                        distanceBetweenEndRadiuses = index * consequtiveRadiusDistance;

                        isOnCircle = false;
                        this.placeLabelsOnLine(currentLabelDataObject, distanceBetweenEndRadiuses);
                        if (unwrappingCircleActivity && index === labelDataArrayLength - 1) {
                            // To show the last label on number line.
                            rotatingCircle.$lastLabel.show();
                            //this._showAllLabels();
                        }
                        currentLabelDataObject.isOnCircle = isOnCircle;

                        //hide radii after crossing bounds
                        //radialGroupChildren[index].visible = isOnCircle;

                        if (unwrappingCircleActivity) {
                            radialGroupChildren[index].visible = true;
                        }
                        //if (unwrappingCircleActivity) {
                        //    var scope = this.paperScope,
                        //    radialLine = new scope.Path(),
                        //    circleCenterPoint = new scope.Point(currentCirclePositionX, currentCirclePositionY);
                        //    angleBetweenEachRadius = 360 / radialGroup.children.length * index;
                        //    radialLine.strokeColor = radialGroup.children[index].strokeColor;
                        //    radialLine.strokeWidth = radialGroup.children[index].strokeWidth;
                        //    //radialLine.strokeColor = 'green';
                        //    radialLine.add(circleCenterPoint);
                        //    radialLine.add(new scope.Point(currentCirclePositionX + modelClassName.CIRCLE_RADIUS, currentCirclePositionY));
                        //    radialLine.rotate(-(angleBetweenEachRadius - 90), circleCenterPoint);
                        //    //radialGroup.removeChildren(index, index + 1);
                        //    radialGroup.addChild(radialLine);
                        //    radialGroup.removeChildren(0, 1);
                        //    radialGroup.children[1].visible = false;
                        //}
                    }
                    //if (this.model.get('unwrappingCircleActivity') === false) {
                    //    //this.feedbackView.showFeedback();
                    //    this.changeAccMessage('mapping-tab-activity-acc-container', 2);
                    //    this.changeAccMessage('mapping-tab-canvas-acc-container', 3);
                    //}
                    this.completelyMoved = true;
                    this.updateFocusRect(this.idPrefix + 'feedback-text-container')
                }

                // else if circle's x co-ordinate is beyond the number line
                // set all the labels on circle 
                // (if winding of number line is allowed)
                //if (currentCirclePositionX < numberLineFinalX) {

                //    // else set all the labels on circle (if winding of number line is allowed)
                //    for (index = 0; index < labelDataArrayLength; index++) {
                //        currentLabelDataObject = labelDataArray[index];
                //        currentLabelDataObject.isOnCircle = true;
                //    }
                //    numberLineTicksGroup.removeChildren();
                //}
            }

            if (this.model.get('unwrappingCircleActivity') === false && this.completelyMoved === true) {
                //this.feedbackView.showFeedback();
                this._changeCanvasAccText('mapping-tab-canvas-acc-container', 6);
                this.changeAccMessage('mapping-tab-activity-acc-container', 2);
            }
            if (currentCirclePositionX >= numberLineFinalX && isLabelChange === true) {
                this.circleCrossedOver = true;

                this.player.enableHelpElement('dummy-center-help', 0, false);
                for (index = 0; index < labelDataArrayLength; index++) {
                    currentLabelDataObject = labelDataArray[index];
                    distanceBetweenEndRadiuses = index * consequtiveRadiusDistance;
                    isOnCircle = false;
                    this.placeLabelsOnLine(currentLabelDataObject, distanceBetweenEndRadiuses);
                    currentLabelDataObject.isOnCircle = isOnCircle;
                    radialGroupChildren[index].visible = isOnCircle;

                    if (unwrappingCircleActivity) {
                        radialGroupChildren[index].visible = true;
                    }
                }
            } else {
                this.placeLabelsOnCircle();
            }
            this.setAccOfUnwrapping();
            //}
            return;
        },

        /**
         * Returns a string describing radian value in string, to be used in accessibility
         * @method getRadianValueInString
         */
        getRadianValueInString: function getRadianValueInString($radianValueDiv) {
            var radianString = '';
            if ($radianValueDiv) {
                var numerator = $radianValueDiv.find('.numerator-container').text(),
                    numeratorCoefficient = numerator.replace('π', ''),
                    numeratorVariable = numerator.search('π') !== -1 ? this.getAccMessage('mapping-tab-canvas-acc-container', 'pi') : '',
                    denominator = $radianValueDiv.find('.denominator-container').text();

                radianString += numeratorCoefficient;
                radianString += numeratorVariable !== '' ? ' ' + numeratorVariable : '';
                radianString += denominator !== '' ? ' ' + this.getAccMessage('mapping-tab-canvas-acc-container', 'by') + ' ' + denominator : '';

                if (radianString) {
                    radianString.trim();
                }
            }
            return radianString;
        },

        /**
        * Places labels on the circle
        * @method placeLabelsOnCircle
        */
        placeLabelsOnCircle: function placeLabelsOnCircle() {
            var paperScope = this.paperScope,
                    staticData = this.staticData,
                    rotatingCircle = this.rotatingCircle,
                    labelDataArray = rotatingCircle.labelDataArray,
                    labelDataArrayLength = labelDataArray.length,
                    radialGroup = rotatingCircle.radialGroup,
                    radialGroupChildren = radialGroup.children,
                    circle = rotatingCircle.circle,
                    centreOfCircle = circle.bounds.getCenter(),
                    LABEL_OFFSET = modelClassName.LABEL_OFFSET,
                    LABEL_OFFSET_HALF = LABEL_OFFSET / 2,
                    labelCircle = null,
                    labelCircleForEmptyDenominator = null,
                    currentRadius = null,
                    currentLabelDataObject = null,
                    labelTopLeftPoint = null,
                    labelPoint = null,
                    endPoint = null,
                    index = null,
                    denominatorText = null,
                    isDenominatorEmpty = null,
                    quadrant = null,
                    $currentFractionContainer = null,
                    unwrappingCircleActivity = this.model.get('unwrappingCircleActivity'),
                    isOnCircle = null;

            labelCircle = new paperScope.Path.Circle(centreOfCircle, modelClassName.CIRCLE_RADIUS + LABEL_OFFSET);
            labelCircleForEmptyDenominator = new paperScope.Path.Circle(centreOfCircle, modelClassName.CIRCLE_RADIUS + LABEL_OFFSET_HALF * 1.5);

            for (index = 0; index < labelDataArrayLength; index++) {
                currentLabelDataObject = labelDataArray[index];
                if (!currentLabelDataObject.isOnCircle) {//do not update if label is on circle already
                    continue;
                }
                $currentFractionContainer = currentLabelDataObject['$div'];
                denominatorText = $currentFractionContainer.find('.' + className.DENOMINATOR_CLASS).html();
                isDenominatorEmpty = denominatorText === '' ? true : false;


                currentRadius = radialGroupChildren[index];
                currentRadius.visible = true;

                // Get the end point of radius
                endPoint = currentRadius.lastSegment.point;

                // Get the point nearest to the circle from the endpoint
                labelPoint = isDenominatorEmpty ? labelCircleForEmptyDenominator.getNearestPoint(endPoint) : labelCircle.getNearestPoint(endPoint);

                // Get the co-ordinates for the top left poent
                // i.e. the upper left corner of the label div
                labelTopLeftPoint = {
                    x: Math.round(labelPoint.x - LABEL_OFFSET_HALF),
                    y: Math.round(labelPoint.y - LABEL_OFFSET_HALF)
                };

                quadrant = className.GET_QUADRANT(circle, labelPoint.x, labelPoint.y);


                $currentFractionContainer.css({
                    'top': labelTopLeftPoint.y,
                    'left': labelTopLeftPoint.x
                });

                if (isDenominatorEmpty === true) {
                    $currentFractionContainer.addClass(className.EMPTY_DENOMINATOR_CLASS);
                } else {
                    $currentFractionContainer.removeClass(className.EMPTY_DENOMINATOR_CLASS);
                }

                currentLabelDataObject.isOnCircle = true;

                if (unwrappingCircleActivity) {
                    $currentFractionContainer.hide();
                }

            }
            if (radialGroupChildren.length !== 0) {
                if (labelDataArrayLength !== 0) {
                    currentLabelDataObject = labelDataArray[0];
                    $currentFractionContainer = currentLabelDataObject['$div'];
                    denominatorText = $currentFractionContainer.find('.' + className.DENOMINATOR_CLASS).html();
                    isDenominatorEmpty = denominatorText === '' ? true : false;
                }
                else {
                    isDenominatorEmpty = true;
                }
                endPoint = radialGroupChildren[0].lastSegment.point;
                var radialLine = new this.paperScope.Path();
                //var centrePointClone = centreOfCircle.clone();
                var endPointClone = endPoint.clone();
                //radialLine.add(centrePointClone);
                radialLine.add(endPointClone);
                radialLine.rotate(-15, centreOfCircle);
                shiftedPoint = radialLine.lastSegment.point;
                labelPoint = isDenominatorEmpty ? labelCircleForEmptyDenominator.getNearestPoint(shiftedPoint) : labelCircle.getNearestPoint(shiftedPoint);
                //labelTopLeftPoint = {
                //    x: Math.round(labelPoint.x - LABEL_OFFSET_HALF),
                //    y: Math.round(labelPoint.y - LABEL_OFFSET_HALF)
                //};
                labelTopLeftPoint = {
                    x: Math.round(labelPoint.x),
                    y: Math.round(labelPoint.y)
                };
                this.placeRadiusLabelOnCircle(centreOfCircle, labelTopLeftPoint);
            }
            // remove the reference circle

            labelCircle.remove();
            labelCircleForEmptyDenominator.remove();
            //}
            return;
        },

        /**
        * Places radius label on the circle
        * @method placeRadiusLabelOnCircle
        */
        placeRadiusLabelOnCircle: function (centreOfCircle, labelTopLeftPoint) {
            var $radiusLabel = this.$('.radius-label-container'),
            radiusLabelTopLeftPoint = {
                'top': (4 * labelTopLeftPoint.y + 6 * centreOfCircle.y) / 10,
                'left': (4 * labelTopLeftPoint.x + 6 * centreOfCircle.x) / 10,
            }

            $radiusLabel.css({
                'top': radiusLabelTopLeftPoint.top - $radiusLabel.height() / 2,
                'left': radiusLabelTopLeftPoint.left - $radiusLabel.width() / 2
            });
        },
        /**
        * Places labels on the line
        * @method placeLabelsOnLine
        */
        placeLabelsOnLine: function placeLabelsOnLine(currentLabelDataObject, distanceBetweenEndRadiuses) {
            var paperScope = this.paperScope,
                staticData = this.staticData,
                rotatingCircle = this.rotatingCircle,
                numberLineTicksGroup = this.rotatingCircle.numberLineTicksGroup,
                LABEL_OFFSET = modelClassName.LABEL_OFFSET,
                LABEL_OFFSET_HALF = LABEL_OFFSET / 2,
                numberLineX = staticData.numberline_coordinates_x,
                numberLineY = staticData.numberline_coordinates_y,
                totalLength = distanceBetweenEndRadiuses + numberLineX,
                $currentFractionContainer = currentLabelDataObject['$div'],
                denominatorText = $currentFractionContainer.find('.' + className.DENOMINATOR_CLASS).html(),
                unwrappingCircleActivity = this.model.get('unwrappingCircleActivity'),
                hideLabel = false,
                labelTopLeftPoint = {
                    x: totalLength - LABEL_OFFSET_HALF,
                    y: Math.round(numberLineY + LABEL_OFFSET_HALF)
                };

            $currentFractionContainer.css({
                top: labelTopLeftPoint.y,
                left: labelTopLeftPoint.x
            });




            if (unwrappingCircleActivity) {

                this._showHideLabel($currentFractionContainer, hideLabel);
            }

            if (denominatorText === '') {
                $currentFractionContainer.removeClass(className.EMPTY_DENOMINATOR_CLASS).addClass(className.NO_SEPARATOR_ClASS);
            }
            tickLine = className.SHOW_VERTICAL_TICK_AT(paperScope, totalLength, numberLineY);
            numberLineTicksGroup.addChild(tickLine);

            if (rotatingCircle.startingTick) {
                //check prevents the tick from disappearing on roll back.
                if (this.model.get('unwrappingCircleActivity') !== true) {
                    //removes initial tick on placing another tick over it
                    rotatingCircle.startingTick.remove();
                    rotatingCircle.startingTick = null;
                }
            }

        },

        /**
        * switch to second tab.
        * @method toNextTab
        */
        toNextTab: function toNextTab() {
            MathInteractives.global.SpeechStream.stopReading();
            this.player.switchToTab(2);
        }
    }, {

        NEXT_BUTTON_CLICKED: 'next-button-clicked',
        RADIUS_LABEL_CLASS: 'radius-label-container',
        FRACTION_CLASS: 'fraction-container',
        NUMERATOR_CLASS: 'numerator-container',
        FRACTION_SEPARATOR_CLASS: 'fraction-separator',
        DENOMINATOR_CLASS: 'denominator-container',
        EMPTY_DENOMINATOR_CLASS: 'empty-denominator',
        NO_SEPARATOR_ClASS: 'no-separator',
        MAX_POINTS: 'max-points',

        DRAG_HANDLE_DATA: {
            center: [modelClassName.CIRCLE_CENTRE_COORDINATES_X, modelClassName.CIRCLE_CENTRE_COORDINATES_Y],
            radius: modelClassName.DRAG_HANDLE_RADIUS,
            shadowColor: '#000000',
            shadowBlur: 2,
            fillColor: {
                gradient: {
                    stops: modelClassName.DRAG_HANDLE_GRADIENT
                },
                origin: [modelClassName.CIRCLE_CENTRE_COORDINATES_X, modelClassName.CIRCLE_CENTRE_COORDINATES_Y - modelClassName.DRAG_HANDLE_RADIUS],
                destination: [modelClassName.CIRCLE_CENTRE_COORDINATES_X, modelClassName.CIRCLE_CENTRE_COORDINATES_Y + modelClassName.DRAG_HANDLE_RADIUS]
            }
        },
        ANGLE_UNITS: {
            0: 'Degree',
            1: 'Radian'
        },
        SHOW_VERTICAL_TICK_AT: function SHOW_VERTICAL_TICK_AT(scope, x, y, length) {
            scope.activate();
            var height = length ? length : modelClassName.TICK_LENGTH,
                distanceFromLine = height / 2,
                tick_y1 = y + distanceFromLine,
                tick_y2 = y - distanceFromLine,
                tickLine = new scope.Path();

            tickLine.strokeColor = modelClassName.NUMBERLINE_COLOR;
            tickLine.strokeWidth = modelClassName.NUMBERLINE_THICKNESS;
            tickLine.add(new scope.Point(x, tick_y1));
            tickLine.add(new scope.Point(x, tick_y2));
            return tickLine;
        },

        SHOW_HORIZONTAL_TICK_AT: function SHOW_HORIZONTAL_TICK_AT(scope, x, y, length) {
            scope.activate();
            var width = length ? length : modelClassName.TICK_LENGTH,
                distanceFromLine = width / 2,
                tick_x1 = x - distanceFromLine,
                tick_x2 = x + distanceFromLine,
                tickLine = new scope.Path();

            tickLine.strokeColor = modelClassName.NUMBERLINE_COLOR;
            tickLine.strokeWidth = modelClassName.NUMBERLINE_THICKNESS;
            tickLine.add(new scope.Point(tick_x1, y));
            tickLine.add(new scope.Point(tick_x2, y));
            return tickLine;
        },

        SHOW_BUBBLE: function SHOW_BUBBLE(scope, x, y, radius, color, isVisible) {
            scope.activate();
            var radius = radius ? radius : 5,
                bubble = new scope.Path.Circle(new scope.Point(x, y), radius);
            bubble.fillColor = color || 'red';
            bubble.isVisible = typeof (isVisible === 'undefined') ? true : isVisible;
            return bubble;
        },

        GET_FRACTION_DIV_STRUCTURE: function GET_FRACTION_DIV_STRUCTURE(numeratorText, denominatorText) {
            var $fractionContainer = $('<div>', {
                'class': className.FRACTION_CLASS
            }),
                $fractionSeparator = $('<div>', {
                    'class': className.FRACTION_SEPARATOR_CLASS
                }),
                $numeratorContainer = $('<div>', {
                    'class': className.NUMERATOR_CLASS
                }),
                $denominatorContainer = $('<div>', {
                    'class': className.DENOMINATOR_CLASS
                }),
                LABEL_OFFSET = modelClassName.LABEL_OFFSET;

            $numeratorContainer.append(numeratorText.toString());
            $denominatorContainer.append(denominatorText.toString());

            if (denominatorText === '') {
                $fractionContainer.addClass(className.EMPTY_DENOMINATOR_CLASS);
            }
            return $fractionContainer.append($numeratorContainer).append($fractionSeparator).append($denominatorContainer);
        },

        GET_ANGLE_IN_RADIANS: function GET_ANGLE_IN_RADIANS(angleInDegrees, ifIgnore2Pi) {
            if (Math.abs(angleInDegrees) === 360 && !ifIgnore2Pi) {
                angleInDegrees = 0;
            }
            var fraction = {
                numerator: null,
                denominator: null
            },
            isNegative = angleInDegrees < 0 ? true : false;



            switch (Math.abs(angleInDegrees).toString()) {
                case '0':
                    fraction.numerator = '0';
                    fraction.denominator = '';
                    break;

                case '22.5':
                    fraction.numerator = 'π';
                    fraction.denominator = '8';
                    break;

                case '30':
                    fraction.numerator = 'π';
                    fraction.denominator = '6';
                    break;

                case '45':
                    fraction.numerator = 'π';
                    fraction.denominator = '4';
                    break;

                case '60':
                    fraction.numerator = 'π';
                    fraction.denominator = '3';
                    break;

                case '67.5':
                    fraction.numerator = '3π';
                    fraction.denominator = '8';
                    break;

                case '90':
                    fraction.numerator = 'π';
                    fraction.denominator = '2';
                    break;

                case '112.5':
                    fraction.numerator = '5π';
                    fraction.denominator = '8';
                    break;

                case '120':
                    fraction.numerator = '2π';
                    fraction.denominator = '3';
                    break;

                case '135':
                    fraction.numerator = '3π';
                    fraction.denominator = '4';
                    break;

                case '150':
                    fraction.numerator = '5π';
                    fraction.denominator = '6';
                    break;

                case '157.5':
                    fraction.numerator = '7π';
                    fraction.denominator = '8';
                    break;

                case '180':
                    fraction.numerator = 'π';
                    fraction.denominator = '';
                    break;

                case '202.5':
                    fraction.numerator = '9π';
                    fraction.denominator = '8';
                    break;

                case '210':
                    fraction.numerator = '7π';
                    fraction.denominator = '6';
                    break;

                case '225':
                    fraction.numerator = '5π';
                    fraction.denominator = '4';
                    break;

                case '240':
                    fraction.numerator = '4π';
                    fraction.denominator = '3';
                    break;

                case '247.5':
                    fraction.numerator = '11π';
                    fraction.denominator = '8';
                    break;

                case '270':
                    fraction.numerator = '3π';
                    fraction.denominator = '2';
                    break;

                case '292.5':
                    fraction.numerator = '13π';
                    fraction.denominator = '8';
                    break;

                case '300':
                    fraction.numerator = '5π';
                    fraction.denominator = '3';
                    break;

                case '315':
                    fraction.numerator = '7π';
                    fraction.denominator = '4';
                    break;

                case '330':
                    fraction.numerator = '11π';
                    fraction.denominator = '6';
                    break;

                case '337.5':
                    fraction.numerator = '15π';
                    fraction.denominator = '8';
                    break;

                case '360':
                    fraction.numerator = '2π';
                    fraction.denominator = '';
                    break;

                default:
                    fraction.numerator = 'invalid angle';
                    fraction.denominator = 'invalid angle';

            }

            fraction.numerator = isNegative ? '-' + fraction.numerator : fraction.numerator;
            return fraction;
        },

        SHOW_RADIUS: function SHOW_RADIUS(scope, radialGroup, centrePoint, radius, numberOfRadius, strokeColor) {
            scope.activate();
            radialGroup.remove();
            radialGroup = new scope.Group();

            var angleBetweenEachRadius = 360 / numberOfRadius,
                index = null;

            for (index = 0; index < numberOfRadius; index++) {
                var radialLine = new scope.Path();
                var centrePointClone = centrePoint.clone();
                radialLine.strokeColor = strokeColor || 'green';
                radialLine.add(centrePointClone);
                radialLine.add(new scope.Point(centrePoint.x + radius, centrePoint.y));
                radialLine.rotate(-angleBetweenEachRadius * index, centrePointClone);
                radialGroup.addChild(radialLine);
            }
            return radialGroup;
        },

        GET_QUADRANT: function GET_QUADRANT(circle, x, y) {
            var position = circle.position,
                circleX = position.getX(),
                circleY = position.getY(),
                position = circle.position,
                quadrant = null;
            if (x >= circleX) {
                quadrant = y >= circleY ? 4 : 1;
            }
            else {
                quadrant = y >= circleY ? 3 : 2;
            }
            return quadrant;
        }

    });
    className = MathInteractives.Common.Interactivities.TrignometricGraphing.Views.ExploreTrignometricMapping;

})();