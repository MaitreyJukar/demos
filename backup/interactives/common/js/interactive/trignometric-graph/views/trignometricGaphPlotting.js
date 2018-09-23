(function () {
    'use strict';
    var className = null,
        GraphingModel = null,
        MappingModel = null,
        MappingView = null;
    /**
    * Class for creating GridGraph
    * @class ExploreTrignometricGraphPlotting
    * @module ExploreTrignometricGraphPlotting
    * @namespace MathInteractives.Interactivities.TrignometricGraphing.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */

    MathInteractives.Common.Interactivities.TrignometricGraphing.Views.ExploreTrignometricGraphPlotting = MathInteractives.Common.Player.Views.Base.extend({
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
        * Manager object 
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,

        /**
        * Reference to player object
        * @property player
        * @type Object
        * @default null
        */
        player: null,

        /**
        * Used to store the current paperScope.
        * @property paperScope
        * @type String
        * @default null
        * @private
        */
        paperScope: null,
        xAxis: null,
        yAxis: null,
        gridGraphView: null,
        plotterView: null,
        graphEquationObj: null,

        positivePointsEquationObj: null,
        negativePointsEquationObj: null,

        labelsArray: null,
        verticalTicksGroup: null,
        yLabelsArray: null,
        horizontalTicksGroup: null,
        currentAngleEquationObjects: null,
        initialLimits: null,

        asymtotesGroup: [],
        posAsymtotesAngle: [],
        negAsymtotesAngle: [],
        jscrollPaneApi: null,


        initialize: function () {
            var model = this.model;
            this.filePath = model.get('path');
            this.manager = model.get('manager');
            this.player = model.get('player');
            this.idPrefix = this.player.getIDPrefix();
            this.setPaperScope();
            this.currentAngleEquationObjects = {
                vertical: null,
                horizontal: null,
                point: null
            }
            this.render();
        },

        setPaperScope: function setPaperScope() {
            this.paperScope = new paper.PaperScope();

            this.paperScope.setup(this.idPrefix + 'graph-canvas');
            if (this.model.get('trignometricFunction') === 'tan') {
                this.$el.find('#' + this.idPrefix + 'graph-canvas').attr({ 'width': '1027', 'height': '406' }).css({ 'width': '1027px', 'height': '406px' });
            }
            return;
        },

        render: function () {
            this.paperScope.activate();
            this.createAndRenderGridGraph();
            this.initializeCustomAxis();
            this.renderYAxisLabels();
            this.initializeXAxisLabels();
            this.bindModelChangeHandlers();
            if (this.model.get('trignometricFunction') === 'tan') {
                this.jscrollPaneApi = this.$el.find('.sin-cos-graph-canvas-container').jScrollPane({ showArrows: true }).data('jsp');
                this.jscrollPaneApi.scrollTo(290);
            }
            this.refreshGridGraph();
        },

        createAndRenderGridGraph: function createAndRenderGridGraph() {
            
            this.initializeGridGraphView();
            this.initializePlotterView();
            if (this.model.get('trignometricFunction') === 'tan') {
                this.findAsymtotesPoint();
            }
            this.initialLimits = this.gridGraphView.getLimits();
            this.createEquationObjects();
            this.addEquationObjectsToPlotter();
        },

        initializeGridGraphView: function initializeGridGraphView() {
            var gridGraphView = null;

            gridGraphView = new MathUtilities.Components.Graph.Views.GridGraph({
                option: this.model.get('gridGraphOptions'),
                el: this.model.get('gridGraphEl')
            });
            gridGraphView.setDefaultZoomBehaviour(false);
            gridGraphView.setDefaultPanBehaviour(false);
            gridGraphView.stopDoubleClickZoom();

            this.gridGraphView = gridGraphView;
            return;
        },

        initializePlotterView: function initializePlotterView() {
            var plotterView = new MathUtilities.Components.Graph.Views.plotterView({
                graphView: this.gridGraphView
            });
            this.plotterView = plotterView;
            return;
        },


        createEquationObjects: function createEquationObjects() {
            var trignometricFunction = this.model.get('trignometricFunction'),
                currentAngleIndicatorLatexObject = this.getCurrentAngleIndicatorLatex(),
                positivePointsEquationObj = new MathUtilities.Components.EquationEngine.Models.EquationData(),
                negativePointsEquationObj = new MathUtilities.Components.EquationEngine.Models.EquationData(),
                graphEquationObj = new MathUtilities.Components.EquationEngine.Models.EquationData();

            if (trignometricFunction === 'tan') {
                this.createAsymtotesGroup();
            }

            this.currentAngleEquationObjects.vertical = new MathUtilities.Components.EquationEngine.Models.EquationData();

            this.currentAngleEquationObjects.horizontal = new MathUtilities.Components.EquationEngine.Models.EquationData();

            this.currentAngleEquationObjects.point = new MathUtilities.Components.EquationEngine.Models.EquationData();
            this.currentAngleEquationObjects.point.setBlind(true);
            this.currentAngleEquationObjects.point.setSpecie('point');
            this.currentAngleEquationObjects.point.changeThickness(GraphingModel.BUBBLE_CIRCLE_RADIUS * 0.6);
            this.currentAngleEquationObjects.point.changeColor(GraphingModel.RADIUS_LINE_COLOR);


            this.currentAngleEquationObjects.vertical.setLatex(currentAngleIndicatorLatexObject.vertical);
            this.currentAngleEquationObjects.vertical.changeThickness(GraphingModel.IMPOSED_CIRCLE_WIDTH);
            this.currentAngleEquationObjects.vertical.changeColor(GraphingModel.RADIUS_LINE_COLOR);

            this.currentAngleEquationObjects.horizontal.setLatex(this.getCurrentAngleIndicatorLatex(0, 0.001).horizontal);
            this.currentAngleEquationObjects.horizontal.changeColor(GraphingModel.IMPOSED_CIRCLE_COLOR);
            this.currentAngleEquationObjects.horizontal.changeThickness(GraphingModel.IMPOSED_CIRCLE_WIDTH);


            graphEquationObj.setLatex(this.getEquation(trignometricFunction), true);

            graphEquationObj.changeColor(GraphingModel.RADIUS_LINE_COLOR);
            graphEquationObj.changeThickness(GraphingModel.IMPOSED_CIRCLE_WIDTH);

            positivePointsEquationObj.setBlind(true);
            positivePointsEquationObj.setSpecie('point');
            positivePointsEquationObj.changeColor(GraphingModel.BUBBLE_CIRCLE_COLOR);
            positivePointsEquationObj.changeThickness(GraphingModel.BUBBLE_CIRCLE_RADIUS * 0.6);

            negativePointsEquationObj.setBlind(true);
            negativePointsEquationObj.setSpecie('point');
            negativePointsEquationObj.changeColor(GraphingModel.BUBBLE_CIRCLE_COLOR);
            negativePointsEquationObj.changeThickness(GraphingModel.BUBBLE_CIRCLE_RADIUS * 0.6);

            this.positivePointsEquationObj = positivePointsEquationObj;
            this.negativePointsEquationObj = negativePointsEquationObj;
            this.graphEquationObj = graphEquationObj;
        },

        addEquationObjectsToPlotter: function addEquationObjectsToPlotter() {
            this.plotterView.addEquation(this.graphEquationObj);
            this.plotterView.addEquation(this.currentAngleEquationObjects.vertical);
            this.plotterView.addEquation(this.currentAngleEquationObjects.horizontal);
            return;
        },

        updateColors: function updateColors() {
            var trignometricFunction = this.model.get('trignometricFunction'),
                verticalEqnObject = this.currentAngleEquationObjects.vertical,
                pointEqnObject = this.currentAngleEquationObjects.point,
                pointsGroup = null;

            switch (trignometricFunction) {
                case 'sin':
                    pointEqnObject.changeColor(GraphingModel.SINE_LINE_DRAG_COLOR);
                    verticalEqnObject.changeColor(GraphingModel.SINE_LINE_DRAG_COLOR);
                    break;
                case 'cos':
                    verticalEqnObject.changeColor(GraphingModel.COS_LINE_DRAG_COLOR);
                    pointEqnObject.changeColor(GraphingModel.COS_LINE_DRAG_COLOR);
                    break;
                case 'tan':
                    verticalEqnObject.changeColor(GraphingModel.TAN_LINE_DRAG_COLOR);
                    pointEqnObject.changeColor(GraphingModel.TAN_LINE_DRAG_COLOR);
                    break;
            }
        },

        resetEquation: function resetEquation() {
            if (this.model.get('noOfPoints') > 0) {

                var currentAngle = this.model.get('currentAngle'),
                    trignometricFunction = this.model.get('trignometricFunction'),
                    equation = this.getEquation(trignometricFunction, 0, 0.00001);
                this.graphEquationObj.setLatex(equation, false);

                this.currentAngleEquationObjects.horizontal.setLatex(this.getCurrentAngleIndicatorLatex(0, 0.001).horizontal);
                //this.currentAngleEquationObjects.horizontal.setLatex(equation);

                this.addPointsEquationTopPlotter(this.negativePointsEquationObj, []);
                this.addPointsEquationTopPlotter(this.positivePointsEquationObj, []);
                this.addPointsEquationTopPlotter(this.currentAngleEquationObjects.point, []);

                this.model.set('currentAngle', 0);
                if (this.model.get('trignometricFunction') === 'tan') {
                    this.findAsymtotesPoint();
                    this.jscrollPaneApi.scrollTo(290);
                }
                this.updateEquation();

            }
        },



        showPointsChange: function onShowPointsChange() {
            this.renderGraphLabelsAndHorizontalTicks();
            this.resetEquation();
        },

        updateEquation: function updateEquation(updateLables) {

            if (this.model.get('trignometricFunction') !== 'tan') {
                this.adjustAxis();
            }
            if (this.model.get('trignometricFunction') !== 'tan') {
                this.adjustCustomAxis();
                this.updateXAxisLabelsAndTicks();
                this.updateYAxisLabelsAndTicks();
            }
            this.updateFunctionGraph();
        },


        createAsymtotesGroup: function createAsymtotesGroup() {

            var cnt, positiveAsymtotes, negativeAsymtotes, posAnglesLen = this.posAsymtotesAngle.length,
                negAnglesLen = this.negAsymtotesAngle.length;

            for (cnt = 0; cnt < posAnglesLen; cnt++) {
                positiveAsymtotes = new MathUtilities.Components.EquationEngine.Models.EquationData();
                positiveAsymtotes.setLatex('x=' + this.posAsymtotesAngle[cnt]);
                positiveAsymtotes.changeThickness(GraphingModel.ASYMTOTES_LINE_WIDTH);
                positiveAsymtotes.changeColor('#7D7D7D');
                this.asymtotesGroup.push(positiveAsymtotes);
            }

            for (cnt = 0; cnt < negAnglesLen; cnt++) {
                negativeAsymtotes = new MathUtilities.Components.EquationEngine.Models.EquationData();
                negativeAsymtotes.setLatex('x=' + this.negAsymtotesAngle[cnt]);
                negativeAsymtotes.changeThickness(GraphingModel.ASYMTOTES_LINE_WIDTH);
                negativeAsymtotes.changeColor('#7D7D7D');
                this.asymtotesGroup.push(negativeAsymtotes);
            }
        },


        findAsymtotesPoint: function findAsymtotesPoint() {

            this.posAsymtotesAngle = [];
            this.negAsymtotesAngle = [];

            var baseAsymtotesAngle = 90 / this.model.get('distanceSliderData'), angle = 0, asymtotesGroupLen = this.asymtotesGroup.length;
            angle = baseAsymtotesAngle;

            while (angle < 360) {

                if (Math.abs((angle * this.model.get('distanceSliderData')) % 180) !== 0) {
                    this.posAsymtotesAngle.push(angle * Math.PI / 180);
                }
                angle = angle + baseAsymtotesAngle;
            }
            angle = -baseAsymtotesAngle;
            while (angle > -360) {
                if (Math.abs((angle * this.model.get('distanceSliderData')) % 180) !== 0) {
                    this.negAsymtotesAngle.push(angle * Math.PI / 180);
                }
                angle = angle - baseAsymtotesAngle;
            }

            for (var cnt = 0; cnt < asymtotesGroupLen; cnt++) {
                this.plotterView.removeEquation(this.asymtotesGroup[cnt]);
            }
            this.asymtotesGroup = [];
            this.createAsymtotesGroup();

            asymtotesGroupLen = this.asymtotesGroup.length;
            for (var cnt = 0; cnt < asymtotesGroupLen; cnt++) {
                this.plotterView.addEquation(this.asymtotesGroup[cnt]);
                this.asymtotesGroup[cnt].dashedGraph();
                this.asymtotesGroup[cnt].hideGraph();
            }

        },

        drawAsymtotesLines: function () {

            var cnt = 0, loop = true, currentAngle = this.model.get('currentAngle'), posAsymtotesAngleLen = this.posAsymtotesAngle.length,
                asymtotesGroupLen = 0;
            if (currentAngle % 1 === 0) {

                if (currentAngle > 0) {
                    while (loop) {
                        if (currentAngle >= (this.posAsymtotesAngle[cnt] * 180 / Math.PI)) {
                            this.asymtotesGroup[cnt].showGraph();
                            cnt++;
                        }
                        else {
                            loop = false;
                        }
                    }
                }
                else {
                    while (loop) {
                        if (currentAngle <= (this.negAsymtotesAngle[cnt] * 180 / Math.PI)) {
                            this.asymtotesGroup[posAsymtotesAngleLen + cnt].showGraph();
                            cnt++;
                        }
                        else {
                            loop = false;
                        }
                    }
                }
            }

            asymtotesGroupLen = this.asymtotesGroup.length;
            for (var i = 0; i < asymtotesGroupLen; i++) {
                this.asymtotesGroup[i].trigger('plot-equation');
                this.asymtotesGroup[i].dashedGraph();
            }
        },

        updateFunctionGraph: function updateFunctionGraph() {
            var currentAngle = this.model.get('currentAngle'),
                horizontal = this.currentAngleEquationObjects.horizontal,
                angleInRadians = currentAngle * Math.PI / 180,
                noOfPoints = this.model.get('noOfPoints'),
                stepAngle = 360 / noOfPoints,
                stepAngleInRadians = stepAngle * Math.PI / 180,
                noOfKeyPoints = Math.floor(currentAngle / stepAngle) >= 0 ? Math.floor(currentAngle / stepAngle) : Math.abs(Math.ceil(currentAngle / stepAngle)),
                currentAngleIndicatorLatexObject = null,
                range = null,
                pointsGroup = null,
                pointEquation = this.currentAngleEquationObjects.point,
                verticalEquation = this.currentAngleEquationObjects.vertical,
                trignometricFunction = this.model.get('trignometricFunction'),
                frequency = this.model.get('distanceSliderData'),
                amplitude = this.model.get('radiusSliderData'),
                yValue = amplitude * Math[trignometricFunction](frequency * angleInRadians);


            if (this.model.get('trignometricFunction') === 'tan') {

                this.drawAsymtotesLines();
                // Below check is added to prevent value for angle's like Math.tan(270) which 
                // is much higher but not infinite
                if (Math.abs(yValue) > 5000) {
                    verticalEquation.hideGraph();
                    this.refreshGridGraph();
                    return;
                }
                verticalEquation.showGraph();
                this.jscrollPaneApi.scrollTo((currentAngle + 360) * className.SCROLL_ADJUST_INDEX);
            }

            this.updateEquationGraphs(currentAngle);
            this.addPointsEquationTopPlotter(pointEquation, [[angleInRadians, yValue]]);
            pointsGroup = this.currentAngleEquationObjects.point.getPointsGroup();

            if (currentAngle > 0) {
                this.updatePointsEquation(true, noOfKeyPoints);
            }
            else {
                this.updatePointsEquation(false, noOfKeyPoints);
            }

            /*--------------color updation----------------*/
            if (this.model.get('shouldUpdateColors') === true) {
                this.updateColors();
                if (pointsGroup.children.length > 0) {
                    pointsGroup.children[0].fillColor = {
                        gradient: {
                            stops: className[this.model.get('trignometricFunction').toUpperCase() + '_GRADIENT']
                        },
                        origin: pointsGroup.children[0].bounds.topCenter,
                        destination: pointsGroup.children[0].bounds.bottomCenter
                    };
                }

            } else {
                verticalEquation.changeColor(GraphingModel.RADIUS_LINE_COLOR);
                if (pointsGroup.children.length > 0) {
                    pointsGroup.children[0].fillColor = GraphingModel.RADIUS_LINE_COLOR
                }

            }



            range = horizontal.getRange();
            if (range.max.value < angleInRadians) {
                range.max.value = angleInRadians;
            }
            if (range.min.value > angleInRadians) {
                range.min.value = angleInRadians;
            }

            horizontal.setRange(range);
            horizontal.trigger('plot-equation');

            if (currentAngleIndicatorLatexObject === null) {
                currentAngleIndicatorLatexObject = this.getCurrentAngleIndicatorLatex();
            }

            verticalEquation.normalGraph();
            verticalEquation.setLatex(currentAngleIndicatorLatexObject.vertical);


            if (pointsGroup) {
                pointsGroup.bringToFront();

            }
            this.refreshGridGraph();

            return;
        },

        getEquation: function getEquation(functionType, _xMin, _xMax) {
            var amplitude = this.model.get('radiusSliderData'),
                frequency = this.model.get('distanceSliderData'),
                currentAngle = this.model.get('currentAngle'),
                xMin = null, xMax = null, angleInRadians = null;
            if (typeof (_xMin) === 'undefined' && typeof (_xMax) === 'undefined') {
                angleInRadians = currentAngle * Math.PI / 180;
                if (angleInRadians > 0) {
                    xMax = angleInRadians;
                    xMin = 0;
                }
                else {
                    xMax = 0;
                    xMin = angleInRadians;
                }
            }
            else {
                xMax = _xMax;
                xMin = _xMin;
            }
            return amplitude + '\\' + functionType + frequency + 'x\\{' + xMin + '\\le x \\le ' + xMax + '\\}';
        },

        getCurrentAngleIndicatorLatex: function getCurrentAngleIndicatorLatex(_xMin, _xMax) {
            var latexObject = null,
                verticalEquationLatex = null,
                horizontalEquationLatex = null,
                trignometricFunction = this.model.get('trignometricFunction'),
                frequency = this.model.get('distanceSliderData'),
                amplitude = this.model.get('radiusSliderData'),
                currentAngle = this.model.get('currentAngle'),
                verticalFunctionType = 'x=',
                horizontalFunctionType = 'y=0',
                yMin = null, yMax = null, xMin = null, xMax = null, length = null, angleInRadians = currentAngle * Math.PI / 180;

            length = Math[trignometricFunction](frequency * angleInRadians);

            if (currentAngle < 180) {
                if (length < 0) {
                    yMax = 0;
                    yMin = -Math.abs(length) * amplitude;
                    yMin = Math.abs(yMin) < 0.001 ? -0.001 : yMin;
                }
                else {
                    yMax = Math.abs(length) * amplitude;
                    yMax = Math.abs(yMax) < 0.001 ? 0.001 : yMax;
                    yMin = 0;

                }

            }
            else {
                if (length < 0) {
                    yMax = 0;
                    yMin = -Math.abs(length) * amplitude;
                    yMin = Math.abs(yMin) < 0.001 ? -0.001 : yMin;
                }
                else {
                    yMax = Math.abs(length) * amplitude;
                    yMax = Math.abs(yMax) < 0.001 ? 0.001 : yMax;
                    yMin = 0;
                }

            }


            if (typeof (_xMin) === 'undefined' || typeof (_xMax) === 'undefined') {
                if (currentAngle < 0) {
                    xMax = 0;
                    xMin = angleInRadians
                }
                else {
                    xMax = angleInRadians;
                    xMin = 0;
                }
            }
            else {
                xMax = _xMax;
                xMin = _xMin;
            }
            verticalEquationLatex = verticalFunctionType + angleInRadians + '\\{' + yMin + '\\le y \\le ' + yMax + '\\}';
            horizontalEquationLatex = horizontalFunctionType + '\\{' + xMin + '\\le x \\le ' + xMax + '\\}';

            latexObject = {
                vertical: verticalEquationLatex,
                horizontal: horizontalEquationLatex
            }
            return latexObject;
        },

        adjustAxis: function adjustAxis() {
            var OFFSET = className.GRAPH_LABEL_OFFSET;
            var amplitude = this.model.get('radiusSliderData'),
                frequency = this.model.get('distanceSliderData'),
                currentAngle = this.model.get('currentAngle'),
                limits = this.initialLimits,
                xMin = null,
                xMax = null,
                newLimits = null,
                angleInRadians = null,
                newXLower = null,
                newXUpper = null;

            angleInRadians = currentAngle * Math.PI / 180;

            if (angleInRadians > 0) {
                xMax = angleInRadians;
                xMin = 0;
            }
            else {
                xMax = 0;
                xMin = angleInRadians;
            }

            newXLower = limits.xLower + angleInRadians;
            newXUpper = limits.xUpper + angleInRadians;
            newLimits = {
                xLower: newXLower,
                xUpper: newXUpper,
                yLower: limits.yLower,
                yUpper: limits.yUpper
            }
            if (newLimits.xUpper > OFFSET && newLimits.xLower < -OFFSET) {
                this.gridGraphView.setLimits(newLimits.xLower, newLimits.xUpper, newLimits.yLower, newLimits.yUpper);
                this.gridGraphView._graphTypeSelector();
            } else {
                //SNAP Y AXIS TO LEFT OR -RIGHT
                if (newLimits.xUpper > OFFSET && newLimits.xLower > -OFFSET) { //SNAP  Y AXIS TO LEFT
                    this.gridGraphView.setLimits(-OFFSET, 2 * Math.PI + OFFSET, newLimits.yLower, newLimits.yUpper);
                    this.gridGraphView._graphTypeSelector();
                }
                else {//SNAP  Y AXIS TO RIGHT
                    this.gridGraphView.setLimits(-2 * Math.PI - OFFSET, OFFSET, newLimits.yLower, newLimits.yUpper);
                    this.gridGraphView._graphTypeSelector();

                }
            }
            return;
        },

        adjustCustomAxis: function adjustCustomAxis() {
            var centerCordinates = this.gridGraphView.convertToCanvasCoordinate([0, 0]);
            this.yAxis.position = centerCordinates;
        },

        updateXAxisLabelsAndTicks: function updateXAxisLabelsAndTicks() {
            var paperScope = this.gridGraphView._paperScope,
                PI = Math.PI,
                noOfPoints = this.model.get('noOfPoints'),
                stepAngle = 360 / noOfPoints,
                stepAngleInRadians = stepAngle * Math.PI / 180,
                $canvasContainer = this.$('.' + className.CANVAS_CONTAINER_SELECOR),
                noOfIterations = noOfPoints / 2,
                index = null,
                gridGraphView = this.gridGraphView,
                position = null,
                fraction = null,
                $fractionContainer = null,
                angle = null,
                arrayCounter = 0,
                labelsArray = this.labelsArray,
                labelsArrayLength = labelsArray ? labelsArray.length : 0,
                $currentFraction = null;

            for (index = -noOfPoints; index <= noOfPoints || arrayCounter < labelsArrayLength; index++) {
                if (index === 0) {
                    continue;
                }
                $currentFraction = labelsArray[arrayCounter]
                position = gridGraphView.convertToCanvasCoordinate([index * stepAngleInRadians, 0]);
                $currentFraction.css({
                    top: position[1] + className.GRAPH_ANGLE_LABEL_OFFSET,
                    left: position[0] - $currentFraction.width() / 2
                });
                this.verticalTicksGroup.children[arrayCounter].position = position;
                arrayCounter++;
            }
        },

        updateYAxisLabelsAndTicks: function updateYAxisLabelsAndTicks() {
            var paperScope = this.gridGraphView._paperScope,
                maxRadius = this.model.get('radiusMaxValue'),
                index = null,
                arrayCounter = 0,
                yLabelsArray = this.yLabelsArray,
                labelsArrayLength = yLabelsArray.length,
                gridGraphView = this.gridGraphView,
                position = null,
                horizontalTick = null,
                horizontalTickLength = className.HORIZONTAL_TICK_LENGTH,
                horizontalTicksGroup = this.horizontalTicksGroup,
                horizontalTicksGroupChildren = horizontalTicksGroup.children,
                horizontalTicksGroupLength = horizontalTicksGroupChildren.length,
                horizontalTicksGroupCounter = 0,
                $fractionContainer = null;
            paperScope.activate();

            for (index = maxRadius; index >= -maxRadius || arrayCounter < labelsArrayLength; index--) {
                position = gridGraphView.convertToCanvasCoordinate([0, index]);
                $fractionContainer = yLabelsArray[arrayCounter];
                if (index === 0) {
                    $fractionContainer.css({
                        top: position[1] - $fractionContainer.height() + 5,
                        left: position[0] - $fractionContainer.width() - 10,
                        'text-align': 'right'
                    });
                }
                else {
                    $fractionContainer.css({
                        top: position[1] - $fractionContainer.height() / 2,
                        left: position[0] - (2 * horizontalTickLength) - 10,
                        'text-align': 'right'
                    });

                    horizontalTick = horizontalTicksGroupChildren[horizontalTicksGroupCounter];
                    horizontalTick.position = position;
                    horizontalTicksGroupCounter++
                }
                arrayCounter++;
            }
        },

        bindModelChangeHandlers: function bindModelChangeHandlers() {
            this.model.on('change:radiusSliderData', $.proxy(this.resetEquation, this));
            this.model.on('change:distanceSliderData', $.proxy(this.resetEquation, this));
            this.model.on('change:trignometricFunction', $.proxy(this.resetEquation, this));
            this.model.on('change:noOfPoints', $.proxy(this.showPointsChange, this));
            this.model.on('change:currentAngle', $.proxy(this.updateEquation, this));
            this.model.on('change:yLimits', $.proxy(this.changeYaxisLimit, this));
        },


        changeYaxisLimit: function changeYaxisLimit() {
            this.gridGraphView._paperScope.activate();
            var newLimit = this.model.get('yLimits') + 0.5;
            this.gridGraphView.setLimits(this.initialLimits.xLower, this.initialLimits.xUpper, -newLimit, newLimit);
            this.renderGraphLabelsAndHorizontalTicks();
            this.renderYAxisLabels();
            this.refreshGridGraph();
        },


        initializeCustomAxis: function initializeCustomAxis() {
            var paperScope = this.gridGraphView._paperScope,
                canvasSize = this.gridGraphView._canvasSize,
                xAxis = new paperScope.Path.Line({
                    from: [0, canvasSize.height / 2],
                    to: [canvasSize.width, canvasSize.height / 2],
                    strokeColor: className.GRAPH_AXIS_COLOR,
                    strokeWidth: className.GRAPH_AXIS_THICKNESS
                }),
                yAxis = new paperScope.Path.Line({
                    from: [canvasSize.width / 2, 0],
                    to: [canvasSize.width / 2, canvasSize.height],
                    strokeColor: className.GRAPH_AXIS_COLOR,
                    strokeWidth: className.GRAPH_AXIS_THICKNESS
                });

            this.xAxis = xAxis;
            this.yAxis = yAxis;

            var newLimit = this.model.get('yLimits') + 0.5;
            this.gridGraphView.setLimits(this.initialLimits.xLower, this.initialLimits.xUpper, -newLimit, newLimit);
            return;
        },

        renderGraphLabelsAndHorizontalTicks: function renderGraphLabelsAndHorizontalTicks() {
            this.labelsArray = [];
            this.$('.' + className.GRAPH_FRACTION_SELECTOR).remove();

            var paperScope = this.gridGraphView._paperScope,
                PI = Math.PI,
                noOfPoints = this.model.get('noOfPoints'),
                stepAngle = 360 / noOfPoints,
                stepAngleInRadians = stepAngle * Math.PI / 180,
                $canvasContainer = this.$('.' + className.CANVAS_CONTAINER_SELECOR),
                noOfIterations = noOfPoints / 2,
                index = null,
                gridGraphView = this.gridGraphView,
                position = null,
                fraction = null,
                verticalTick = null,
                verticalTickSymbol = null,
                verticalTicksGroup = null,
                $fractionContainer = null;
            paperScope.activate();

            if (this.verticalTicksGroup) {
                this.verticalTicksGroup.remove()
            }
            verticalTicksGroup = new paperScope.Group();

            verticalTick = MappingView.SHOW_VERTICAL_TICK_AT(paperScope, 0, 0);
            verticalTickSymbol = new paperScope.Symbol(verticalTick);
            verticalTick.remove();



            for (index = -noOfPoints; index <= noOfPoints; index++) {
                if (index === 0) {
                    continue;
                }
                position = gridGraphView.convertToCanvasCoordinate([index * stepAngleInRadians, 0]);
                fraction = MappingView.GET_ANGLE_IN_RADIANS(index * stepAngle, true);
                $fractionContainer = MappingView.GET_FRACTION_DIV_STRUCTURE(fraction.numerator, fraction.denominator);
                if ($fractionContainer.hasClass('empty-denominator')) {
                    $fractionContainer.removeClass('empty-denominator').addClass('no-separator');
                }
                $canvasContainer.append($fractionContainer.addClass(className.GRAPH_FRACTION_SELECTOR));
                $fractionContainer.css({
                    top: position[1] + className.GRAPH_ANGLE_LABEL_OFFSET,
                    left: position[0] - $fractionContainer.width() / 2
                });
                this.labelsArray.push($fractionContainer);

                verticalTick = verticalTickSymbol.place();
                verticalTick.position = position;
                verticalTicksGroup.addChild(verticalTick);
            }

            this.verticalTicksGroup = verticalTicksGroup;
        },


        initializeXAxisLabels: function initializeXAxisLabels() {

            var $canvasContainer = this.$('.' + className.CANVAS_CONTAINER_SELECOR), arrayAngle = [],
                cnt = 0, $fractionContainer = null, verticalTick = null, verticalTickSymbol = null,
                verticalTicksGroup = null;


            if (this.verticalTicksGroup) {
                this.verticalTicksGroup.remove()
            }
            verticalTicksGroup = new this.paperScope.Group();

            verticalTick = MappingView.SHOW_VERTICAL_TICK_AT(this.paperScope, 0, 0);
            verticalTickSymbol = new this.paperScope.Symbol(verticalTick);
            verticalTick.remove();

            arrayAngle = [-360, -180, 180, 360];

            while (cnt < arrayAngle.length) {
                var position = this.gridGraphView.convertToCanvasCoordinate([arrayAngle[cnt] * Math.PI / 180, 0]),
                fraction = MappingView.GET_ANGLE_IN_RADIANS(arrayAngle[cnt], true);
                $fractionContainer = MappingView.GET_FRACTION_DIV_STRUCTURE(fraction.numerator, fraction.denominator);
                if ($fractionContainer.hasClass('empty-denominator')) {
                    $fractionContainer.removeClass('empty-denominator').addClass('no-separator');
                }
                $canvasContainer.append($fractionContainer.addClass(className.GRAPH_FRACTION_SELECTOR));
                $fractionContainer.css({
                    top: position[1] + className.GRAPH_ANGLE_LABEL_OFFSET,
                    left: position[0] - $fractionContainer.width() / 2
                });
                verticalTick = verticalTickSymbol.place();
                verticalTick.position = position;
                verticalTicksGroup.addChild(verticalTick);
                cnt++;
            }
            this.verticalTicksGroup = verticalTicksGroup;
        },

        renderYAxisLabels: function renderYAxisLabels() {
            this.yLabelsArray = [];
            this.$('.y-axis-labels').remove();

            var paperScope = this.gridGraphView._paperScope,
                maxRadius = Math.floor(this.model.get('yLimits')),
                $canvasContainer = this.$('.' + className.CANVAS_CONTAINER_SELECOR),
                index = null,
                gridGraphView = this.gridGraphView,
                position = null,
                fraction = null,
                horizontalTick = null,
                horizontalTickLength = className.HORIZONTAL_TICK_LENGTH,
                horizontalTickSymbol = null,
                horizontalTicksGroup = null,
                $fractionContainer = null;
            paperScope.activate();

            if (this.horizontalTicksGroup) {
                this.horizontalTicksGroup.remove()
            }
            horizontalTicksGroup = new paperScope.Group();

            horizontalTick = MappingView.SHOW_HORIZONTAL_TICK_AT(paperScope, 0, 0, horizontalTickLength);
            horizontalTickSymbol = new paperScope.Symbol(horizontalTick);
            horizontalTick.remove();

            for (index = maxRadius; index >= -maxRadius; index--) {
                position = gridGraphView.convertToCanvasCoordinate([0, index]);
                $fractionContainer = MappingView.GET_FRACTION_DIV_STRUCTURE(index, '');
                $canvasContainer.append($fractionContainer.addClass('y-axis-labels'));
                if (index === 0) {
                    $fractionContainer.css({
                        top: position[1] - $fractionContainer.height() + 5,
                        left: position[0] - $fractionContainer.width() - 10,
                        'text-align': 'right'
                    });
                }
                else {
                    $fractionContainer.css({
                        top: position[1] - $fractionContainer.height() / 2,
                        left: position[0] - (2 * horizontalTickLength) - 10,
                        'text-align': 'right'
                    });

                    horizontalTick = horizontalTickSymbol.place();
                    horizontalTick.position = position;
                    horizontalTicksGroup.addChild(horizontalTick);
                }
                this.yLabelsArray.push($fractionContainer);
            }
            this.horizontalTicksGroup = horizontalTicksGroup;
        },

        updatePointsEquation: function updatePointsEquation(isCurrentAnglePositive, noOfKeyPoints) {
            var eqnObjToRetain = null,
                eqnObjToUpdate = null,
                multiplier = null,
                points = null,
                keyPointsArray = null;

            if (isCurrentAnglePositive === true) {
                eqnObjToRetain = this.negativePointsEquationObj;
                eqnObjToUpdate = this.positivePointsEquationObj;
                multiplier = 1;
            } else {
                eqnObjToRetain = this.positivePointsEquationObj;
                eqnObjToUpdate = this.negativePointsEquationObj;
                multiplier = -1;
            }

            points = eqnObjToRetain.getPoints();
            if (points) {
                this.addPointsEquationTopPlotter(eqnObjToRetain, points);
            }
            points = eqnObjToUpdate.getPoints();

            if (points && points.length > noOfKeyPoints) {
                this.addPointsEquationTopPlotter(eqnObjToUpdate, points);
            }
            else {
                keyPointsArray = this.getKeypointsArray(multiplier, noOfKeyPoints);
                this.addPointsEquationTopPlotter(eqnObjToUpdate, keyPointsArray);
            }
        },


        addPointsEquationTopPlotter: function addPointsEquationTopPlotter(eqnObj, points) {
            eqnObj.setPoints(points);
            this.plotterView.addPlot(eqnObj);
            return;
        },

        getKeypointsArray: function getKeypointsArray(multiplier, noOfKeyPoints) {
            var trignometricFunction = this.model.get('trignometricFunction'),
                frequency = this.model.get('distanceSliderData'),
                amplitude = this.model.get('radiusSliderData'),
                noOfPoints = this.model.get('noOfPoints'),
                stepAngle = 360 / noOfPoints,
                stepAngleInRadians = stepAngle * Math.PI / 180,
                keyPointsArray = [],
                keyAngle = null,
                gridPointX = null,
                gridPointY = null,
                applyModulus = false,
                points = null;
            if (trignometricFunction === 'cos') {
                applyModulus = true;
            }

            for (var index = 0; index <= noOfKeyPoints; index++) {
                keyAngle = index * stepAngleInRadians;
                gridPointX = keyAngle;
                gridPointY = amplitude * Math[trignometricFunction](frequency * keyAngle);
                keyPointsArray.push([multiplier * gridPointX, applyModulus ? gridPointY : multiplier * gridPointY]);
            }
            return keyPointsArray;
        },

        updateEquationGraphs: function updateEquationGraphs(currentAngle) {
            var trignometricFunction = this.model.get('trignometricFunction'),
                angleInRadians = currentAngle * Math.PI / 180,
                graphEquationObj = this.graphEquationObj,
                range = graphEquationObj.getRange(),
                equation = null;

            if (range.max.value < angleInRadians) {
                range.max.value = angleInRadians;
            }

            if (range.min.value > angleInRadians) {
                range.min.value = angleInRadians;
            }

            graphEquationObj.setRange(range);
            graphEquationObj.trigger('plot-equation');

            return;
        },

        refreshGridGraph: function refreshGridGraph() {
            this.gridGraphView._paperScope.view.draw();
            return;
        }

    },
{
    CANVAS_CONTAINER_SELECOR: 'sin-cos-graph-canvas-box',
    GRAPH_FRACTION_SELECTOR: 'graph-fraction',
    GRAPH_BACKGROUND_COLOR: '#222222',
    GRAPH_BACKGROUND_ALPHA: 0.4,
    GRAPH_AXIS_COLOR: '#ffffff',
    GRAPH_LABEL_OFFSET: 0.20,
    GRAPH_LABEL_OFFSET_TAN: Math.PI + 0.5,
    GRAPH_ANGLE_LABEL_OFFSET: 15,
    GRAPH_AXIS_THICKNESS: 3,
    HORIZONTAL_TICK_LENGTH: 18,

    SCROLL_ADJUST_INDEX: 0.80555,

    SIN_GRADIENT: ['#A21E63', '#3C0321'],
    COS_GRADIENT: ['#329fc3', '#02375c'],
    TAN_GRADIENT: ['#FFFFFF', '#878787']
});

    className = MathInteractives.Common.Interactivities.TrignometricGraphing.Views.ExploreTrignometricGraphPlotting;
    GraphingModel = MathInteractives.Common.Interactivities.TrignometricGraphing.Models.ExploreTrignometricGraphing;
    MappingView = MathInteractives.Common.Interactivities.TrignometricGraphing.Views.ExploreTrignometricMapping;
    MappingModel = MathInteractives.Common.Interactivities.TrignometricGraphing.Views.ExploreTrignometricMapping;
})();