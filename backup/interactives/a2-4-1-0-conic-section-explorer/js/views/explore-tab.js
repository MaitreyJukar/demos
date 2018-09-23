(function () {
    'use strict';
    /**
    * Explore Tab
    * @class ExploreTab
    * @construtor
    * @extends Backbone.View
    * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views
    */
    MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Reference to view of conic section
        *
        * @property conicSectionView
        * @type Backbone.View
        * @default null
        */
        conicSectionView: null,

        /**
        * Reference to view of Direction Box
        *
        * @property directionTextView
        * @type Backbone.View
        * @default null
        */
        directionTextView: null,

        /**
        * Reference to view of reset graph button
        *
        * @property resetGraphBtnView
        * @type Backbone.View
        * @default null
        */
        resetGraphBtnView: null,

        /**
        * Reference to view of zoom in button
        *
        * @property zoomInBtnView
        * @type Backbone.View
        * @default null
        */
        zoomInBtnView: null,

        /**
        * Reference to view of zoom in button
        *
        * @property zoomInBtnView
        * @type Backbone.View
        * @default null
        */
        zoomOutBtnView: null,

        /**
        * Check if drag start
        * @property dragStart
        * @type Boolean
        * @default false
        */
        dragStart: false,

        /**
        * Initializes the model properties.
        * @method initialize
        */
        initialize: function () {
            var model = this.model,
                self = this;
            // model.off('change:showPopupOnTryAnother').on('change:showPopupOnTryAnother', this._enableStartOverButton, this);
            this.initializeDefaultProperties();

            this._createScreens();
            this.loadScreen('explore-screen');

            this.render();
            this._disableAllButtons();
            this.player.bindTabChange(function (data) {
                if (data.isLetsGoClicked !== true) {
                    this.setFocus('direction-text-container-direction-text-text');
                }
                if (model.get('graphWrapperModel') === null) {
                    this._initializeGridGraph();
                }
            }, this, 1);
            if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                model.off('change:cursor').on('change:cursor', this._setCursor, this);
            }
            this.$el.css({ 'background-image': 'url("' + this.filePath.getImagePath('sprite-image') + '")' });
            //this.listenTo(this.model, MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab.EVENTS.ANIMATION_START_OF_CONIC_SECTION, this._disableAllButtons);
            this.listenTo(this.model, MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab.EVENTS.ANIMATION_END_OF_CONIC_SECTION, this._enableAllButtons);
            this.$('.graph-canvas-container').off('focusin').on('focusin', function () { self.model.trigger(MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab.EVENTS.GRAPH_CONTAINER_FOCUS_OUT); })
                                             .off('focusout.graph-focusout').on('focusout.graph-focusout', function () {
                                                 self._getShapeAccText();
                                             });


        },

        /**
        * Binds events to listeners
        * @property events
        **/
        events: {
            'mouseenter .graph-view-wrapper': '_onCanvasMouseenter',
            'mouseleave .graph-view-wrapper': '_onCanvasMouseleave',
            'click .graph-zoom-in-button.clickEnabled': '_onZoomInBtnClick',
            'click .graph-zoom-out-button.clickEnabled': '_onZoomOutBtnClick',
            'click .graph-reset-button.clickEnabled': '_onResetGraphBtnClick'
        },

        /**
        * Renders the view of repair roads tab
        *
        * @method render
        * @private 
        **/
        render: function () {
            this._initializeDirectionText();
            this._generateGraphButtons();

            this.listenTo(this.model, "change:equationConstants", this._generateEquation);
            this._setHelpElements();
        },

        /**
        * create the Views of the all the three screens.
        * @method _createScreens
        * @private
        */
        _createScreens: function () {
            var viewNamespace = MathInteractives.Interactivities.ConicSectionExplorer.Views;
            this.conicSectionView = new viewNamespace.ConeView({ el: this.$('.conic-section-wrapper'), model: this.model });
        },

        /**
        * Renders the view of the direction text box
        *
        * @method _initializeDirectionText
        * @private 
        **/
        _initializeDirectionText: function () {
            var idPrefix = this.idPrefix,
                directionProperties = {
                    containerId: idPrefix + 'direction-text-container',
                    idPrefix: idPrefix,
                    player: this.player,
                    manager: this.manager,
                    path: this.filePath,
                    text: this.getMessage('direction-text-box-text', 0),
                    accText: this.getMessage('direction-text-box-text', 0),
                    showButton: true,
                    buttonText: this.getMessage('direction-text-box-text', 1),
                    btnColorType: MathInteractives.global.Theme2.Button.COLORTYPE.GREEN,
                    containmentBGcolor: 'rgba(0, 0, 0,0.14)',
                    buttonHeight: 38,
                    btnTextColor: '#ffffff',
                    clickCallback: {
                        fnc: this._onTryAnotherClick,
                        scope: this
                    },
                    textColor: '#ffffff',
                    tabIndex: 500,
                    buttonTabIndex: 1000,
                    btnBaseClass: 'direction-text-start-over',
                    ttsBaseClass: 'direction-text-start-over-tts'

                };
            this.directionTextView = MathInteractives.global.Theme2.DirectionText.generateDirectionText(directionProperties);
            this.model.set('showPopupOnTryAnother', false);
        },

        /**
        * Renders a pop up for confirming user action
        * @method _onTryAnotherClick
        * @private 
        **/
        _onTryAnotherClick: function () {
            this.stopReading();
            var popupOptions = null,
                model = this.model,
                buttonNamespace = MathInteractives.global.Theme2.Button,
                buttonType = buttonNamespace.TYPE.TEXT;
            if (this.directionTextView.tryAnotherView.getButtonState() === buttonNamespace.BUTTON_STATE_ACTIVE) {

                if (model.get('showPopupOnTryAnother') === true) {
                    popupOptions = {
                        manager: this.manager,
                        path: this.filePath,
                        player: this.player,
                        idPrefix: this.idPrefix,
                        title: this.getMessage('try-another-pop-up-title', 0),
                        accTitle: this.getMessage('try-another-pop-up-title', 0),
                        text: this.getMessage('try-another-pop-up-text', 0),
                        accText: this.getMessage('try-another-pop-up-text', 0),
                        type: MathInteractives.global.Theme2.PopUpBox.CONFIRM,
                        buttons: [
                            {
                                id: 'yes-button',
                                type: buttonType,
                                text: this.getMessage('try-another-pop-up-yes-button', 0),
                                response: { isPositive: true, buttonClicked: 'yes-button' }
                            },
                            {
                                id: 'cancel-button',
                                type: buttonType,
                                text: this.getMessage('try-another-pop-up-cancel-button', 0),
                                response: { isPositive: false, buttonClicked: 'cancel-button' }
                            }
                        ],
                        closeCallback: {
                            fnc: function (response) {
                                if (response.isPositive === true) {
                                    this._tryAnotherCallBack()
                                }
                                else {
                                    this.setFocus('direction-text-container-direction-text-buttonholder');
                                }
                            },
                            scope: this
                        }
                    };
                    MathInteractives.global.Theme2.PopUpBox.createPopup(popupOptions);
                }
                else {
                    this._tryAnotherCallBack();
                }
            }
        },

        /*
        *  It render the state after the clicking try another button
        *  It call when try another button is clicked
        
        * @method _onTryAnotherClick
        */
        _tryAnotherCallBack: function _tryAnotherCallBack() {
            var model = this.model,
                startAngle = 300,
                conicSectionView = this.conicSectionView;
            this._disableAllButtons();
            model.resetConeParameters();
            // Set cone to 300 deg and animate to its flat view.
            conicSectionView.resetConeView(startAngle, true, true);
            conicSectionView.animateCone();
            this.changeAccMessage('plane-data-container', 0, [model.get('planeSlop'), model.get('planeOffset')]);
            this.changeAccMessage('cone-data-container', 0, [model.get('coneHeight'), model.get('coneSlop')]);
            model.set('showPopupOnTryAnother', false);
            model.set('currentZoomingFactor', 5);
            this.setFocus('explore-tab-content-container');
            this.resetLimitsOfGraph();
        },

        /*
        *  It renders the equation on the graph 
        *  It call when plane and cone values(height,slope) change
        
        * @method _generateEquation
        */
        _generateEquation: function () {
            var model = this.model,
                accText = null,
                namespace = MathInteractives.Interactivities.ConicSectionExplorer.Views.ConeView,
                equationConstants = model.get('equationConstants'),
                intersectionColor = namespace.INTERSECTION_COLOR,
                intersectionThickness = namespace.INTERSECTION_THICKNESS,
                latex = this._generateEquationLatex(),
                data = { latex: latex, shouldRefresh: true },
                graphWrapperModel = model.get('graphWrapperModel'),
                equationObject = model.get('equationObject'),
                pointEquationObject = model.get('pointEquationObject');


            if (equationObject === null) {
                equationObject = graphWrapperModel.createEquationObject(data);
                graphWrapperModel.changeEqnObjColor(equationObject, { color: intersectionColor })
                                 .changeEqnObjThickness(equationObject, { thickness: intersectionThickness });
            } else {
                graphWrapperModel.removeFillColor(equationObject)
                                 .setLatex(equationObject, data);
            }
            if (equationConstants.fill === true) {
                graphWrapperModel.setFillColor(equationObject, intersectionColor);
            }
            this._getShapeAccText();
            model.set('equationObject', equationObject);
        },

        /**
        * Initializes grid graph with necessary options.
        * @method _initializeGridGraph
        * @private
        */
        _initializeGridGraph: function _initializeGridGraph() {
            var self = this,
                idPrefix = this.idPrefix,
                model = this.model,
                namespace = MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab,
                limits = model.get('limits'),
                graphWrapperEvents = MathInteractives.Common.Components.Theme2.Models.ToolsGraph.EVENTS.GRID_EVENTS,
                dataForGraph = {
                    gridGraphEl: '#' + idPrefix + 'graph-view-wrapper',
                    gridGraphOptions: {
                        isCustomModeOn: false,
                        canvasId: idPrefix + 'graph-canvas',
                        isTooltipForPoint: false
                    },
                    isPlotterRequired: true
                },
                gridStyle = {
                    color: {
                        gridLine: namespace.GRAPH_GRID_LINE_COLOR,
                        axisLine: namespace.GRAPH_AXIS_LINE_COLOR,
                        markerLine: namespace.GRAPH_GRID_LINE_COLOR
                    },
                    size: {
                        gridLine: namespace.GRAPH_GRID_LINE_THICKNESS,
                        axisLine: namespace.GRAPH_AXIS_LINE_THICKNESS,
                        markerLine: namespace.GRAPH_GRID_LINE_THICKNESS
                    }
                },
                markerStyle = {
                    fontColor: namespace.GRAPH_FONT_COLOR,
                    fontSize: namespace.GRAPH_FONT_SIZE,
                    fontFamily: namespace.GRAPH_FONT_FAMILY
                },
                //Creating grid
                graphWrapperModel = new MathInteractives.Common.Components.Theme2.Models.ToolsGraph()
                                    .initializeGridGraphView(dataForGraph)
                                    .setGridGraphStyle({ gridStyle: gridStyle })
                                    .setGridGraphMarkerStyle({ markerStyle: markerStyle, shouldRefresh: true });

            graphWrapperModel.setGridLimits(limits).drawGridGraph()
            .setDefaultZoomBehaviour(false)
            .stopDoubleClickZoom()
            .triggerCustomEventsForGridEvent(graphWrapperEvents.GRID_LAYER_MOUSEDOWN_SENSED)
            .triggerCustomEventsForGridEvent(graphWrapperEvents.GRID_LAYER_MOUSEUP)
            .triggerCustomEventsForGridEvent(graphWrapperEvents.GRID_LAYER_CLICK)
             .triggerCustomEventsForGridEvent(graphWrapperEvents.GRID_LAYER_DOUBLE_CLICK)
            .triggerCustomEventsForGridEvent(graphWrapperEvents.GRID_LAYER_MOUSEDRAG)
            .triggerCustomEventsForGridEvent(graphWrapperEvents.POINT_LAYER_MOUSEUP)
            .triggerCustomEventsForGridEvent(graphWrapperEvents.POINT_LAYER_MOUSEDOWN_SENSED);

            self.listenTo(graphWrapperModel, graphWrapperEvents.GRID_LAYER_MOUSEDOWN_SENSED, self._onDragStart);
            self.listenTo(graphWrapperModel, graphWrapperEvents.GRID_LAYER_MOUSEUP, self._onDragStop);
            self.listenTo(graphWrapperModel, graphWrapperEvents.POINT_LAYER_MOUSEUP, self._onDragStop);
            self.listenTo(graphWrapperModel, graphWrapperEvents.GRID_LAYER_CLICK, self._onDragStop);
            self.listenTo(graphWrapperModel, graphWrapperEvents.POINT_LAYER_MOUSEDOWN_SENSED, self._onDragStart);
            self.listenTo(graphWrapperModel, graphWrapperEvents.GRID_LAYER_DOUBLE_CLICK, function (event) {
                self.model.set('cursor', 'open-hand');
            });
            self.listenTo(graphWrapperModel, graphWrapperEvents.GRID_LAYER_MOUSEDRAG, function (event) {
                self.resetGraphBtnView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
            });
            model.set('graphWrapperModel', graphWrapperModel);
        },

        /**
        * Renders the graph buttons (zoom-in, zoom-out, refresh)
        *
        * @method _generateGraphButtons
        * @private 
        **/
        _generateGraphButtons: function _generateGraphButtons() {
            var btnOptions = {},
                globalBtn = MathInteractives.global.Theme2.Button,
                idPrefix = this.idPrefix,
                filePath = this.filePath,
                namespace = MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab;
            // Generate Zoom in Button
            btnOptions = {
                'player': this.player,
                'manager': this.manager,
                'path': this.filePath,
                'idPrefix': this.idPrefix,
                'data': {
                    type: globalBtn.TYPE.FA_ICON,
                    height: namespace.GRAPH_BUTTON_HEIGHT,
                    width: namespace.GRAPH_BUTTON_WIDTH,
                    tooltipText: this.getMessage('zoom-in-tooltip', 0),
                    tooltipType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.LEFT_MIDDLE,
                    id: idPrefix + 'graph-zoom-in-button',
                    icon: {
                        'faClass': filePath.getFontAwesomeClass('zoom-in'),
                        'height': namespace.GRAPH_BUTTON_HEIGHT,
                        'width': namespace.GRAPH_BUTTON_WIDTH,
                        'fontSize': namespace.GRAPH_BUTTON_FONT_SIZE,
                        'fontColor': namespace.GRAPH_BUTTON_FONT_COLOR
                    },
                    baseClass: 'graph-all-btn'
                }
            };
            this.zoomInBtnView = globalBtn.generateButton(btnOptions);
            //// Generate Zoom Out Button
            btnOptions.data.tooltipText = this.getMessage('zoom-out-tooltip', 0);
            btnOptions.data.id = idPrefix + 'graph-zoom-out-button';
            btnOptions.data.icon.faClass = filePath.getFontAwesomeClass('zoom-out');
            this.zoomOutBtnView = globalBtn.generateButton(btnOptions);

            // Generate Reset buttom
            btnOptions.data.tooltipText = this.getMessage('reset-tooltip', 0);
            btnOptions.data.id = idPrefix + 'graph-reset-button';
            btnOptions.data.icon.faClass = filePath.getFontAwesomeClass('reset');
            this.resetGraphBtnView = globalBtn.generateButton(btnOptions);
        },

        /**
        * It set the new zoom in limits to graph 
        * Its call when zoom in button is clicked
        *
        * @method _onZoomInBtnClick
        * @private 
        */
        _onZoomInBtnClick: function _onZoomInBtnClick() {
            var namespace = MathInteractives.global.Theme2.Button;
            this.stopReading();
            this._setGraphLimits('zoom-in');
            this.zoomOutBtnView.setButtonState(namespace.BUTTON_STATE_ACTIVE);
            this._setResetGraphBtnState();
            if (this.model.get('currentZoomingFactor') <= 0.5) {
                this.zoomInBtnView.setButtonState(namespace.BUTTON_STATE_DISABLED);
            }
            this.changeAccMessage('graph-canvas-container', 6);
            this.setFocus('graph-canvas-container');
        },

        /**
        * It set the new zoom out limits to graph 
        * Its call when zoom out button is clicked
        *
        * @method _onZoomOutBtnClick
        * @private 
        */
        _onZoomOutBtnClick: function _onZoomOutBtnClick() {
            var namespace = MathInteractives.global.Theme2.Button;
            this.stopReading();
            this._setGraphLimits('zoom-out');
            this.zoomInBtnView.setButtonState(namespace.BUTTON_STATE_ACTIVE);
            this._setResetGraphBtnState();
            if (this.model.get('currentZoomingFactor') >= 500) {
                this.zoomOutBtnView.setButtonState(namespace.BUTTON_STATE_DISABLED);
            }
            this.changeAccMessage('graph-canvas-container', 8);
            this.setFocus('graph-canvas-container');
        },

        /**
        * It calculate and set the graph limits
        * Its call when zoom in or zoom out button is clicked
        *
        * @method _setGraphLimits
        * @private 
        */
        _setGraphLimits: function _setGraphLimits(zoomFactor) {
            var self = this,
                model = self.model,
                graphWrapperModel = model.get('graphWrapperModel'),
                ZOOM_FACTOR = this.getNextZoomFactor(zoomFactor),
                limits = graphWrapperModel.getGridLimits(),
                newLimits = $.extend(true, {}, limits),
                Ydistance = limits.yUpper - limits.yLower,
                newYdistance = Ydistance * ZOOM_FACTOR,
                yDifference = newYdistance - Ydistance,
                yDifferenceHalf = yDifference / (2 * ZOOM_FACTOR),
                Xdistance = limits.xUpper - limits.xLower,
                newXdistance = Xdistance * ZOOM_FACTOR,
                xDifference = newXdistance - Xdistance,
                xDifferenceHalf = xDifference / (2 * ZOOM_FACTOR);

            newLimits.xUpper = +(limits.xUpper - xDifferenceHalf).toFixed(10);
            newLimits.xLower = +(limits.xLower + xDifferenceHalf).toFixed(10);
            newLimits.yUpper = +(limits.yUpper - yDifferenceHalf).toFixed(10);
            newLimits.yLower = +(limits.yLower + yDifferenceHalf).toFixed(10);

            graphWrapperModel.setGridLimits(newLimits).drawGridGraph();
        },

        _setResetGraphBtnState: function _setResetGraphBtnState() {
            var namespace = MathInteractives.global.Theme2.Button,
                model = this.model,
                graphWrapperModel = model.get('graphWrapperModel'),
                defaultLimits = model.get('limits'),
                limits = graphWrapperModel.getGridLimits();
            if (_.isEqual(defaultLimits, limits)) {
                this.resetGraphBtnView.setButtonState(namespace.BUTTON_STATE_DISABLED);
            }
            else {
                this.resetGraphBtnView.setButtonState(namespace.BUTTON_STATE_ACTIVE);
            }
        },

        /**
        * It reset the limits of graph 
        * Its call when reset button is clicked
        *
        * @method _onResetGraphBtnClick
        * @private 
        */
        _onResetGraphBtnClick: function _onResetGraphBtnClick() {
            var namespace = MathInteractives.global.Theme2.Button,
                model = this.model;
            this.stopReading();
            this.resetLimitsOfGraph();
            this.resetGraphBtnView.setButtonState(namespace.BUTTON_STATE_DISABLED);
            this.zoomInBtnView.setButtonState(namespace.BUTTON_STATE_ACTIVE);
            this.zoomOutBtnView.setButtonState(namespace.BUTTON_STATE_ACTIVE);
            model.set('currentZoomingFactor', 5);
            this.changeAccMessage('graph-canvas-container', 7);
            this.setFocus('graph-canvas-container');
        },

        /**
        * It set the default limits to graph 
        *
        * @method resetLimitsOfGraph
        * @private 
        */
        resetLimitsOfGraph: function resetLimitsOfGraph() {
            var self = this,
                   model = self.model,
                   defaultLimits = model.get('limits'),
                   graphWrapperModel = model.get('graphWrapperModel');

            graphWrapperModel.setGridLimits(defaultLimits).drawGridGraph();
        },

        /**
        * It find the zoom factor accroding to zoom in or zoom out 
        *
        * @method getNextZoomFactor
        * @param state {string} state is zoom in or zoom out 
        * @private 
        * @return its return the zoom factor 
        */
        getNextZoomFactor: function getNextZoomFactor(state) {
            var model = this.model,
                graphWrapperModel = model.get('graphWrapperModel'),
                zoomingFactors = model.get('zoomingFactors'),
                currentZoomingFactor = model.get('currentZoomingFactor'),
                currentIndex = zoomingFactors.indexOf(currentZoomingFactor),
                nextIndex = currentIndex;

            if (state === 'zoom-in') {
                if (currentIndex > 0) {
                    nextIndex = currentIndex - 1;
                }
            } else {
                if (currentIndex < zoomingFactors.length) {
                    nextIndex = currentIndex + 1;
                }
            }
            model.set('currentZoomingFactor', zoomingFactors[nextIndex]);
            return zoomingFactors[currentIndex] / zoomingFactors[nextIndex];


        },

        /**
        *  It set the cursor to the canvas
        *  It call when cursor value change in the model
        *    
        * @method _setCursor
        * @param model {Object} model object
        * @param strCursorValue {string} cursor type value
        * @private
        **/
        _setCursor: function (model, strCursorValue) {
            if (strCursorValue !== 'default' && strCursorValue !== 'pointer') {
                strCursorValue = "url('" + this.filePath.getImagePath(strCursorValue) + "'), move";
            }
            this.$('canvas').css({ 'cursor': strCursorValue });
        },

        /**
        *  It set the cursor to the canvas
        *  It call when mouse enter on the canvas
        *    
        * @method _onCanvasMouseenter
        * @private
        **/
        _onCanvasMouseenter: function _onCanvasMouseenter() {
            var model = this.model;
            if (this.dragStart === false) {
                model.set('cursor', 'open-hand');
            } else {
                model.set('cursor', 'closed-hand');
            }
        },

        /**
        *  It set the cursor to the canvas
        *  It call when mouse leave from the canvas
        *    
        * @method _onCanvasMouseleave
        * @private
        **/
        _onCanvasMouseleave: function _onCanvasMouseleave() {
            if (this.dragStart === false) {
                this.model.set('cursor', 'default');
            }
        },

        /**
        *  It set the cursor to the canvas
        *  It call when drag start event is fired 
        *    
        * @method _onDragStart
        * @private
        **/
        _onDragStart: function _onDragStart(event) {
            this.stopReading();
            this.dragStart = true;
            this.model.set('cursor', 'closed-hand');
        },

        /**
        *  It set the cursor to the canvas
        *  It call when drag stop event is fired 
        *    
        * @method _onDragStop
        * @private
        **/
        _onDragStop: function _onDragStop(event) {
            this.dragStart = false;
            this.model.set('cursor', 'open-hand');
        },

        /**
        * It find the constant value is negative or not 
        *
        * @method checkNegativeValues
        * @param constant {string} constant is value
        * @param text {string} text is latext
        * @private 
        * @return its return the latex according to constant and text
        */
        checkNegativeValues: function checkNegativeValues(constant, text) {
            var latex = '';
            if (constant < 0) {
                latex += ' - ';
            } else {
                latex += ' + ';
            }
            return latex += Math.abs(constant) + text;
        },

        /**
        * It find the latex for whole equation
        *
        * @method _generateEquationLatex
        * @private 
        * @return its return the latex of whole equation
        */
        _generateEquationLatex: function _generateEquationLatex() {

            var equationConstants = this.model.get('equationConstants'),
                latex = '';
            latex += equationConstants.A + 'x^2';
            latex += this.checkNegativeValues(equationConstants.B, 'x');
            latex += this.checkNegativeValues(equationConstants.C, 'y^2');
            latex += this.checkNegativeValues(equationConstants.D, 'y');
            latex += this.checkNegativeValues(equationConstants.E, '');
            latex += ' = 0 ';

            return latex;
        },

        ///**
        //* It enable or disable the start over button
        //*
        //* @method _enableStartOverButton
        //* @private 
        //*/
        //_enableStartOverButton: function _enableStartOverButton() {
        //    var showPopupOnTryAnother = this.model.get('showPopupOnTryAnother');
        //    if (showPopupOnTryAnother === true) {
        //        this.directionTextView.tryAnotherView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
        //    } else {
        //        this.directionTextView.tryAnotherView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
        //    }

        //},

        /*
        * It set the all help instruction
        * It call when render is called
        * @method _setHelpElements
        */
        _setHelpElements: function _setHelpElements() {
            var helpElements = this.model.get('helpElements');
            if (helpElements.length === 0) {
                helpElements.push(
                { elementId: 'plane-slop-custom-spinner-container', helpId: 'plane-slop-custom-spinner-container-help', msgId: 0, tooltipWidth: '310', position: 'top' },
                { elementId: 'plane-offset-custom-spinner-container', helpId: 'plane-offset-custom-spinner-container-help', msgId: 0, tooltipWidth: '350', position: 'top' },
                { elementId: 'cone-height-custom-spinner-container', helpId: 'cone-height-custom-spinner-container-help', msgId: 0, tooltipWidth: '300', position: 'top' },
                { elementId: 'cone-slop-custom-spinner-container', helpId: 'cone-slop-custom-spinner-container-help', msgId: 0, tooltipWidth: '300', position: 'top' },
                 { elementId: 'conic-rotate-angle-text', helpId: 'conic-rotate-angle-text-help', msgId: 0, position: 'top' },
                { elementId: 'conic-reset-button', helpId: 'conic-reset-button-help', msgId: 0, tooltipWidth: '280', position: 'bottom' },
                 { elementId: 'graph-canvas-container', helpId: 'graph-canvas-container-help', msgId: 0, fromElementCenter: true, hideArrowDiv: true, position: 'top' },
                { elementId: 'graph-reset-button', helpId: 'graph-reset-button-help', msgId: 0, tooltipWidth: '350', hideArrowDiv: true, position: 'left' });
            }
        },

        /**
        * It disable All the buttons
        *    
        * @method _disableAllButtons
        * @private
        **/
        _disableAllButtons: function _disableAllButtons() {
            var state = MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED;
            this.directionTextView.tryAnotherView.setButtonState(state);
            this.resetGraphBtnView.setButtonState(state);
            this.zoomInBtnView.setButtonState(state);
            this.zoomOutBtnView.setButtonState(state);
            this.player.enableAllHeaderButtons(false);
        },

        /**
        *  It eanble All the buttons
        *    
        * @method _enableAllButtons
        * @private
        **/
        _enableAllButtons: function _enableAllButtons() {
            var state = MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE;
            this.directionTextView.tryAnotherView.setButtonState(state);
            //this.resetGraphBtnView.setButtonState(state);
            this._setResetGraphBtnState();
            this.zoomInBtnView.setButtonState(state);
            this.zoomOutBtnView.setButtonState(state);
            this.player.enableAllHeaderButtons(true);
        },

        /**
        * get the which shape is plot in the graph
        *    
        * @method _getShapeAccText
        * @private
        **/
        _getShapeAccText: function _getShapeAccText() {
            var model = this.model,
                accText = null,
                equationConstants = this.model.get('equationConstants');
            switch (equationConstants.type) {
                case 'point': accText = this.getAccMessage('graph-canvas-container', 5);
                    break;
                case 'line': accText = this.getAccMessage('graph-canvas-container', 4);
                    break;
                case 'hyperbola': accText = this.getAccMessage('graph-canvas-container', 3);
                    break;
                case 'parabola': accText = this.getAccMessage('graph-canvas-container', 2);
                    break;
                case 'ellipse': accText = this.getAccMessage('graph-canvas-container', 1);
                    break;
                case 'circle': accText = this.getAccMessage('graph-canvas-container', 9);
                    break;
            }
            if (equationConstants.type === 'ellipse') {
                this.changeAccMessage('graph-canvas-container', 10, [accText]);
            } else {
                this.changeAccMessage('graph-canvas-container', 0, [accText]);
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
            ANIMATION_START_OF_CONIC_SECTION: 'animation-start-of-conic-section',
            ANIMATION_END_OF_CONIC_SECTION: 'animation-end-of-conic-section',
            GRAPH_CONTAINER_FOCUS_OUT: 'graph-container-focus-out'
        },

        /**
        * it holds the grid line color of graph
        *
        * @property GRAPH_GRID_LINE_COLOR
        * @public
        * @static
        * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab
        * @default '#404040'
        */
        GRAPH_GRID_LINE_COLOR: '#404040',

        /**
        * it holds the axis line color of graph
        *
        * @property GRAPH_AXIS_LINE_COLOR
        * @public
        * @static
        * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab
        * @default '#a3ad97'
        */
        GRAPH_AXIS_LINE_COLOR: '#a3ad97',

        /**
        * it holds the grid line thickness of graph
        *
        * @property GRAPH_GRID_LINE_THICKNESS
        * @public
        * @static
        * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab
        * @default 1
        */
        GRAPH_GRID_LINE_THICKNESS: 1,

        /**
        * it holds the axis line thickness of graph
        *
        * @property GRAPH_AXIS_LINE_THICKNESS
        * @public
        * @static
        * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab
        * @default 3
        */
        GRAPH_AXIS_LINE_THICKNESS: 3,

        /**
        * it holds the graph font color
        *
        * @property GRAPH_FONT_COLOR
        * @public
        * @static
        * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab
        * @default '#a3ad97'
        */
        GRAPH_FONT_COLOR: '#a3ad97',

        /**
        * it holds the graph font size
        *
        * @property GRAPH_FONT_SIZE
        * @public
        * @static
        * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab
        * @default 14
        */
        GRAPH_FONT_SIZE: 14,

        /**
        * it holds the graph font family
        *
        * @property GRAPH_FONT_FAMILY
        * @public
        * @static
        * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab
        * @default 'montserrat'
        */
        GRAPH_FONT_FAMILY: 'montserrat',

        /**
        * it holds the graph button height
        *
        * @property GRAPH_BUTTON_HEIGHT
        * @public
        * @static
        * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab
        * @default 38
        */
        GRAPH_BUTTON_HEIGHT: 38,

        /**
        * it holds the graph button width
        *
        * @property GRAPH_BUTTON_WIDTH
        * @public
        * @static
        * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab
        * @default 43
        */
        GRAPH_BUTTON_WIDTH: 43,

        /**
        * it holds the graph button font color
        *
        * @property GRAPH_BUTTON_FONT_COLOR
        * @public
        * @static
        * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab
        * @default '#ffffff'
        */
        GRAPH_BUTTON_FONT_COLOR: '#ffffff',

        /**
        * it holds the graph button font size
        *
        * @property GRAPH_BUTTON_FONT_SIZE
        * @public
        * @static
        * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Views.ExploreTab
        * @default 23
        */
        GRAPH_BUTTON_FONT_SIZE: 23
    });

})();