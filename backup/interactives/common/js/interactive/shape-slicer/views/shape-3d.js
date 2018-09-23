(function (MathInteractives) {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Views.Shape3D) {
        return;
    }
    var className = null,
        eventManagerModel = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer.EVENT_MANAGER_MODEL,
        mainModelNameSpace = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer;
    /*
	*
	*   [[D E S C R I P T I O N]]
	*	
	* @class Shape3D
	* @namespace MathInteractives.Interactivities.ShapeSlicer.Views
    * @extends MathInteractives.Common.Player.Views.Base
	* @constructor
	*/
    MathInteractives.Common.Interactivities.ShapeSlicer.Views.Shape3D = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Stores reference for Threejs Renderer
        * 
        * @property renderer 
        * @type Object
        * @default null
        **/
        renderer: null,

        /**
        * Stores the shape view reference
        * 
        * @property shapeViewArr 
        * @type Array
        * @default null
        **/
        shapeViewArr: null,

        /**
        * Stores the Canvas Height
        * 
        * @property canvasHeight 
        * @type Number
        * @default null
        **/
        canvasHeight: null,

        /**
        * Stores the Canvas Width
        * 
        * @property canvasWidth 
        * @type Number
        * @default null
        **/
        canvasWidth: null,

        /**
       * Boolean to check if click needs to be allowed 
       * 
       * @property allowClick 
       * @type Boolean
       * @default true
       **/
        allowClick: true,

        /**
       * Boolean to check if hover needs to be showed 
       * 
       * @property showHover 
       * @type Boolean
       * @default true
       **/
        showHover: true,

        /**
        * Counter to maintain the number of mouse move
        * 
        * @property mouseMoveCount 
        * @type Number
        * @default 0
        **/
        mouseMoveCount: 0,

        /**
        * Stores the canvas reference
        * 
        * @property $canvas 
        * @type Object
        * @default null
        **/
        $canvas: null,

        /**
        * Instance of the eventMangaer Model for maintaining events
        * 
        * @property eventManager 
        * @type Object
        * @default null
        **/
        eventManager: null,

        /**
        * Stores the request animation frame rendered last
        * 
        * @property lastAnimationFrame 
        * @type Object
        * @default null
        **/
        lastAnimationFrame: null,

        /**
       * Boolean to check if mouse down on canvas
       * 
       * @property mouseDownOnCanvas 
       * @type Boolean
       * @default false
       **/
        mouseDownOnCanvas: false,

        /**
       * Boolean to check if mouse down on sphere
       * 
       * @property mouseDownOnSphere 
       * @type Boolean
       * @default false
       **/
        mouseDownOnSphere: false,

        /**
        * Stores the explore view reference
        * 
        * @property parent 
        * @type Object
        * @default null
        **/
        parent: null,

        isFirstSpace: true,

        canvasAcc: null,

        /**
        * Initialises Shape3D View
        * @method initialize
        */
        initialize: function () {
            var self = this,
                $canvas = null,
                canvasSize = null;
            this.shapeViewArr = [];
            this.parent = this.options.parent;
            this.initializeDefaultProperties();
            className = MathInteractives.Common.Interactivities.ShapeSlicer.Views.Shape3D;
            this.eventManager = this.model.get('eventManager');
            this._render();
            this.attachEventListeners();
            this.eventManager.on(eventManagerModel.TAB_CHANGED, $.proxy(self._handleTabChange), self);


            //To Fix Ipad Screenshot issue - Reassign style height and width based on the DPI
            canvasSize = className.CANVAS_SIZE;
            $canvas = this.$canvas;
            $canvas[0].style.width = canvasSize.WIDTH + 'px';
            $canvas[0].style.height = canvasSize.HEIGHT + 'px';
        },

        /**
         * Renders the view of 3D Shape
         *
         * @method _render
         * @private
         **/
        _render: function _render() {

            this._setCanvas();
            this._initializeShapeViews();
            this._loadCanvasForAcc();
            this._showHideCanvas();
            this._initializeRenderer();
            this._animate();
        },

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
                canvasEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_EVENTS,
                $canvasHolder = this.$('#' + this.idPrefix + 'canvas-acc-container');

            this._bindSpaceForAccessibility();
            // Handle tab
            $canvasHolder.off(keyEvents.TAB).on(keyEvents.TAB, function (event, data) {
                self.onMouseMoveOnSphere(event, data.item);
            });

            // Handle focus out
            $canvasHolder.off(canvasEvents.FOCUS_OUT).on(canvasEvents.FOCUS_OUT, function (event, data) {
                self._focusOut(event, data);
            });

        },

        _focusOut: function _focusOut(event, data) {

            var shapeNumber = this.model.get('shapeNumber'),
                shapeView = this.shapeViewArr[shapeNumber],
                sphereGroup = shapeView.getSphereGroup(),
                childModel = shapeView.model,
                selectedPoints = childModel.get('pointsArr'),
                sphereColor = className.SPHERE_COLOR,
                lastHoveredPoint = childModel.get('lastHoveredPoint'),
                prevObject = null;

            if (lastHoveredPoint) {
                prevObject = sphereGroup.getObjectByName(lastHoveredPoint);
                //If it is not a selected point
                if (selectedPoints.indexOf(lastHoveredPoint) === -1) {
                    prevObject.material.color.setHex(sphereColor.DESELECTED);
                }
                else {
                    prevObject.material.color.setHex(sphereColor.SELECTED);
                }
                childModel.set('lastHoveredPoint', null);
            }
            this.setAccMessage('canvas-acc-container', this.getAccMessage('shape-button-container-' + shapeNumber, 0, [this.getAccMessage('shape-button-common-text', 2)]));
            this.canvasAcc.updatePaperItems(this.getPaperObjects());
            this._renderScene();

        },

        /**
       * Binds Space Key
       *
       * @method _bindSpaceForAccessibility
       * @private
       */
        _bindSpaceForAccessibility: function _bindSpaceForAccessibility() {
            var keyEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS,
                 $canvasHolder = this.$('#' + this.idPrefix + 'canvas-acc-container'),
                self = this;

            $canvasHolder.on(keyEvents.SPACE, function (event, data) {
                self._spaceKeyPressed(event, data);
            });

        },

        _spaceKeyPressed: function _spaceKeyPressed(event, data) {
            this.onMouseUpOnSphere(event, data.item);
            event.isAfterMouseUp = true;
            this.onMouseMoveOnSphere(event, data.item);
            this._renderScene();
        },


        _unbindAccessibilityListeners: function _unbindAccessibilityListeners() {
            var keyEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS,
             canvasEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_EVENTS,
                 $canvasHolder = this.$('#' + this.idPrefix + 'canvas-acc-container');

            $canvasHolder.off(keyEvents.SPACE);
            $canvasHolder.off(keyEvents.TAB);
            $canvasHolder.off(keyEvents.FOCUS_OUT);
        },


        reOrderSpheres: function reOrderSpheres(sphereGroup, orderArray) {

            var orderedSpheres = [],
                orderArrayLength = orderArray.length;

            for (var i = 0; i < orderArrayLength; i++) {
                orderedSpheres.push(sphereGroup.getObjectByName('sphere-' + orderArray[i][0] + '-position-' + orderArray[i][1]));
            }

            return orderedSpheres;
        },

        /**
         * Binds Events on The 3D canvas
         *
         * @method attachEventListeners
         * @private
         **/
        attachEventListeners: function attachEventListeners() {

            var self = this,
                $canvas = this.$canvas,
                browserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck,
                    utils = MathInteractives.Common.Utilities.Models.Utils;

            this.model.off('change:noOfSlicedShapes', this.setSliceButtonState, this)
                      .on('change:noOfSlicedShapes', this.setSliceButtonState, this);

            this.model.on('change:shapeNumber', $.proxy(self._showHideCanvas), self);
            this.eventManager.on(eventManagerModel.SHAPE_SLICED, $.proxy(self.shapeSliceHandler), self);

            if (browserCheck.isMobile !== true && Detector.webgl) {
                $canvas.on('mousemove.sphereEffect', $.proxy(self.onMouseMoveOnSphere, self));
            }

            //Remove translateZ property for ipads to fix browser crash issue
            if (browserCheck.isIOS) {
                this.$canvas.removeClass('common-browser')
            }

            $canvas.on('mouseup.sphereEffect', $.proxy(self.onMouseUpOnSphere, self));
            $canvas.off('mouseenter.canvas3D').on('mouseenter.canvas3D', $.proxy(self.onMouseEnterOnCanvas, self));
            $canvas.off('mouseleave.canvas3D').on('mouseleave.canvas3D', $.proxy(self.onMouseLeaveOnCanvas, self));
            utils.EnableTouch($canvas, { specificEvents: utils.SPECIFIC_EVENTS.MOUSEMOVE });
        },

        /**
         * Handler for Tab Change
         *
         * @method _handleTabChange
         * @param tabNumber{Number} Tab Number
         * @private
         **/
        _handleTabChange: function _handleTabChange(tabNumber) {
            var shapeNumber = this.model.get('shapeNumber');
            this.shapeViewArr[shapeNumber].controls.handleResize();
        },

        /**
         * Initializes the ThreeJS Renderer
         *
         * @method _initializeRenderer
         * @private
         **/
        _initializeRenderer: function _initializeRenderer() {
            if (Detector.webgl) {
                this.renderer = new THREE.WebGLRenderer({ canvas: this.$canvas[0], antialias: true, preserveDrawingBuffer: true });
            } else {
                this.renderer = new THREE.CanvasRenderer({ canvas: this.$canvas[0], antialias: false });
            }

            this.renderer.autoClear = false;
            this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        },

        /**
        * Initializes the ThreeJS Camera and Scene for Each View
        *
        * @method initializeThreeJS
        * @param shapeView{Object} Shape View to be initialized
        * @public
        **/
        initializeThreeJS: function initializeThreeJS(shapeView) {

            shapeView.scene = new THREE.Scene();
            shapeView.frontScene = new THREE.Scene();    // This Scene is used for giving borders as the borders are not visible
            shapeView.camera = new THREE.PerspectiveCamera(75, this.canvasWidth / this.canvasHeight, 0.1, 10000);
            shapeView.camera.position.z = 350;


            /* Draw X, Y, and Z axes
            shapeView.xAxis = this.buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1000, 0, 0), '#FF0000', true);
            shapeView.yAxis = this.buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1000, 0), '#00ff00', true);
            shapeView.zAxis = this.buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1000), '#0000ff', true);
            shapeView.scene.add(shapeView.xAxis);
            shapeView.scene.add(shapeView.yAxis);
            shapeView.scene.add(shapeView.zAxis);
            */

            this._initializeMouseInteraction(shapeView);
            this._initializeControls(shapeView);
            this.setShapeCameraValuesFromModel(shapeView);
        },

        /**
        * Initializes the Camera Value for Each Shape
        *
        * @method setShapeCameraValuesFromModel
        * @param shapeView{Object} Shape View whose values need to be set
        * @public
        **/
        setShapeCameraValuesFromModel: function setShapeCameraValuesFromModel(shapeView) {
            var model = shapeView.model,
                cameraQuaternionValue = model.get('cameraQuaternion'),
                cameraPos = model.get('cameraPos'),
                cameraUp = model.get('cameraUp'),
                tempQ = null;

            tempQ = new THREE.Quaternion();
            tempQ.set(cameraQuaternionValue.x, cameraQuaternionValue.y, cameraQuaternionValue.z, cameraQuaternionValue.w);
            shapeView.controls.object.rotation.setFromQuaternion(tempQ);
            shapeView.controls.object.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
            shapeView.controls.object.up.set(cameraUp.x, cameraUp.y, cameraUp.z);
        },

        buildAxis: function buildAxis(src, dst, colorHex, dashed) {
            var geom = new THREE.Geometry(),
                mat;

            if (dashed) {
                mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
            } else {
                mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
            }

            geom.vertices.push(src.clone());
            geom.vertices.push(dst.clone());
            geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

            var axis = new THREE.Line(geom, mat, THREE.LinePieces);

            return axis;

        },

        /**
        * Adds Canvas to the dom according to the interactive
        *
        * @method _setCanvas
        * @private
        **/
        _setCanvas: function _setCanvas() {

            this.$canvas = this.$('.activity-canvas-wrapper canvas');

            var browserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck,
                newWidth = this.$canvas[0].width,
                newHeight = this.$canvas[0].height,
                    canvasSize = className.CANVAS_SIZE;

            if (browserCheck.isIOS) {

                var ratio = window.devicePixelRatio;
                newWidth /= ratio;
                newHeight /= ratio;

                this.$canvas[0].width = newWidth;
                this.$canvas[0].height = newHeight;
            }

            this.canvasWidth = canvasSize.WIDTH;
            this.canvasHeight = canvasSize.HEIGHT;

        },

        /**
        * Initializes the Shape Views
        *
        * @method _initializeShapeViews
        * @private
        **/
        _initializeShapeViews: function _initializeShapeViews() {

            var interactivityType = this.model.get('interacivityType'),
                numberOfShapes = this.model.get('numberOfShapes'), nameOfShape,
                model, view, shapeNames = className.SHAPE_NAMES[interactivityType],
                namespace = MathInteractives.Common.Interactivities.ShapeSlicer,
                shapeCollection = this.model.get('shapeCollection'),
                saveStateLoad = this.model.get('saveStateLoad'),
                canvas = this.$canvas,
                eventManager = this.eventManager;

            for (var i = 0; i < numberOfShapes; i++) {
                nameOfShape = shapeNames[i];
                model = saveStateLoad ? new namespace.Models[nameOfShape](shapeCollection.models[i].attributes) : new namespace.Models[nameOfShape]();

                view = new namespace.Views[nameOfShape]({
                    model: model,
                    el: canvas,
                    parent: this,
                    name: nameOfShape,
                    eventManager: this.eventManager
                });
                shapeCollection.remove(shapeCollection.at(i));
                shapeCollection.add(model, { at: i });
                this.shapeViewArr.push(view);
                if (saveStateLoad) {
                    this.setPointSelection(view);
                }
                model.on('change:isResetButtonEnable', function (data) {
                    eventManager.trigger(eventManagerModel.SET_RESET_BUTTON_STATE, data.changedAttributes().isResetButtonEnable);
                })
            }
            this.disableClicksOnPanning();
            this.hideToolTipOnMouseDown(view);
        },

        /**
        * Draws Lines from one point to another
        *
        * @method drawLines
        * @param from{Object} Starting point of Line
        * @param to{Object} Ending point of Line
        * @public
        **/
        drawLines: function drawLines(from, to) {

            var fromVector = new THREE.Vector3(from.x, from.y, from.z),
                toVector = new THREE.Vector3(to.x, to.y, to.z),
                ellipseLineDetails = this.getOutlineDetails(),
                 material = new THREE.LineBasicMaterial({
                     color: ellipseLineDetails.COLOR
                 }),
                geometry = new THREE.Geometry(),
                line;

            geometry.vertices.push(fromVector, toVector);

            line = new THREE.Line(geometry, material);
            return line;
        },

        /**
       * Changes Canvas Based on the Shape Selected
       *
       * @method _showHideCanvas
       * @param data{Object} Data objec which stores the shape number of previous shape
       * @private
       **/
        _showHideCanvas: function _showHideCanvas(data) {
            var shapeNumber = this.model.get('shapeNumber'),
                currShapeView = this.shapeViewArr[shapeNumber],
                eventManager = this.eventManager;

            //this.$('.activity-canvas-wrapper').hide();
            // this.$('.activity-canvas-wrapper-' + shapeNumber).show();
            if (data) {
                this.shapeViewArr[data.previousAttributes().shapeNumber].controls.noRotate = true;
            }
            this.eventManager.trigger(eventManagerModel.ENABLE_TRY_ANOTHER);
            this.eventManager.trigger(eventManagerModel.DESELECT_SHAPE);
            currShapeView.controls.noRotate = false;
            this.scene = currShapeView.scene;
            this.camera = currShapeView.camera;
            this.frontScene = currShapeView.frontScene;
            currShapeView.controls.handleResize();
            eventManager.trigger(eventManagerModel.SET_RESET_BUTTON_STATE, currShapeView.model.get('isResetButtonEnable'));
            this.setSliceButtonState();

            this.parent._loadAccText();
            this.$('.temp-focus-div').focus();
            this.setFocus('shape-button-container-' + shapeNumber);

            this.canvasAcc.updatePaperItems(this.getPaperObjects());

            if (this.renderer) {
                this._renderScene();
            }

        },

        getPaperObjects: function getPaperObjects() {

            var shapeNumber = this.model.get('shapeNumber'),
                shapeView = this.shapeViewArr[shapeNumber],
                sphereGroup = shapeView.getSphereGroup();

            return sphereGroup.children;
        },

        /**
        * Initializes the ThreeJS Mouse Operations
        *
        * @method _initializeMouseInteraction
        * @param shapeView{Object} Shape View on which mouse interaction needs to be intialized
        * @private
        **/
        _initializeMouseInteraction: function _initializeMouseInteraction(shapeView) {

            shapeView.mouseVector = new THREE.Vector3();
            shapeView.projector = new THREE.Projector();
            shapeView.ray = new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));
        },

        /**
       * Initializes the ThreeJS Trackball Controls
       *
       * @method _initializeControls
       * @param shapeView{Object} Shape View on which controls needs to be intialized 
       * @private
       **/
        _initializeControls: function _initializeControls(shapeView) {

            shapeView.controls = new THREE.CustomTrackball(shapeView.camera, this.$canvas[0]);
            // new THREE.OrbitControls(shapeView.camera, this.renderer .domElement); remove OrbitControls and add trackballControls
            shapeView.controls.rotateSpeed = 0.5;
            shapeView.controls.zoomSpeed = 0.2;
            shapeView.controls.panSpeed = 0.5;

            shapeView.controls.noZoom = true;
            shapeView.controls.noPan = true;
            shapeView.controls.noRotate = true;

            shapeView.controls.staticMoving = true;
            shapeView.controls.dynamicDampingFactor = 0.3;

            if (!Detector.webgl) {
                shapeView.controls.skipCount = 20;
            }
        },

        /**
      * Converts angle from degree to radians
      *
      * @method angleToRadians
      * @param angle{Number} Angle in degree
      * @public
      **/
        angleToRadians: function angleToRadians(angle) {

            return angle * (Math.PI / 180);

            //      return THREE.Math.degToRad(angle)
        },

        /**
     * Returns a 3D sphere
     *
     * @method generateClickableSphere
     * @param radius{Number} Radius of sphere
     * @public
     **/
        generateClickableSphere: function generateClickableSphere(radius) {

            var material,
                sphere,
                geometry, sphereColor = className.SPHERE_COLOR,
                radiusOfSphere = radius || this.model.get('clickableSphereRadius');

            geometry = new THREE.SphereGeometry(radiusOfSphere, 16, 16);

            material = new THREE.MeshBasicMaterial({
                color: sphereColor.DESELECTED
            });

            sphere = new THREE.Mesh(geometry, material);

            return sphere;
        },

        /**
        * Draws a curve with 2 Radius
        *
        * @method drawCurve
        * @param radius{Number} Radius of Curve
        * @param smallRadius{Number} Small Radius of Curve
        * @public
        **/
        drawCurve: function drawCurve(radius, smallRadius) {


            var curve = new THREE.EllipseCurve(
                    0, 0,            // ax, aY
                    radius || 50, smallRadius || 30,           // xRadius, yRadius
                    0, 2 * Math.PI,  // aStartAngle, aEndAngle
                    true             // aClockwise
                ),
               path = new THREE.Path(curve.getPoints(50)),
             geometry = path.createPointsGeometry(50),
             outlineDetails = this.getOutlineDetails(),
             material = new THREE.LineBasicMaterial({ color: outlineDetails.COLOR }),
             ellipse = new THREE.Line(geometry, material);

            return ellipse;
        },

        /**
        * Draws a polygon with number of sides and circumradius
        *
        * @method drawPolygon
        * @param sides{Number} Number of sides in polygon
         * @param radius{Number} Circum radius of polygon
        * @public
        **/
        drawPolygon: function drawPolygon(sides, radius) {


            var geometry = this._polygonGeometry(sides, radius),
                outlineDetails = this.getOutlineDetails(),
                material = new THREE.LineBasicMaterial({ color: outlineDetails.COLOR }),
                polygon = new THREE.Line(geometry, material);

            return polygon;
        },

        /**
       * Returns a polygon Geometry
       *
       * @method _polygonGeometry
       * @param sides{Number} Number of sides in polygon
        * @param radius{Number} Circum radius of polygon
       * @private
       **/
        _polygonGeometry: function _polygonGeometry(sides, radius) {
            var geo = new THREE.Geometry();

            // generate vertices
            for (var pt = 0 ; pt < sides; pt++) {
                // Add 90 degrees so we start at +Y axis, rotate counterclockwise around
                var angle = (Math.PI / 2) + (pt / sides) * 2 * Math.PI;

                var x = radius * Math.cos(angle);
                var y = radius * Math.sin(angle);

                // Save the vertex location
                geo.vertices.push(new THREE.Vector3(x, y, 0.0));
            }

            geo.vertices.push(geo.vertices[0]);

            // generate faces
            for (var face = 0 ; face < sides - 2; face++) {
                // this makes a triangle fan, from the first +Y point around
                geo.faces.push(new THREE.Face3(0, face + 1, face + 2));
            }
            // done: return it.
            return geo;
        },


        /*
          * Returns a deep copy of an array or an object, i.e. duplicate with no value stored as a reference.
          * @method returnDeepCopy
          * @public
          * @param {Mixed} object Array/Object which is to be duplicated.
          * @return {Object} Deep copy of the array/object passed.
          */
        returnDeepCopy: function returnDeepCopy(object) {
            if (typeof object === typeof Object.prototype) {
                if ($.isArray(object)) {
                    var obj = {};
                    obj.array = object;
                    return $.extend(true, {}, obj).array;
                }
                else {
                    return $.extend(true, {}, object);
                }
            }
            else {
                return object;
            }
        },

        /*
          * Sorts an array of points
          * @method sortPoints
          * @public
          * @param points{Object} Array which needs to be sorted
          * @return {Object} Sorted Array
          */
        sortPoints: function sortPoints(points) {

            if (points.length !== 0) {
                return points.slice().sort(function (a, b) { return (a - b); });
            }
            return [];
        },

        /*
          * Sorts an array of points
          * @method countInstances
          * @public
          * @param number{Number} Index of the element
          * @param array{Object} Array in which instances needs to be counted
          * @param count{Number} Recursive Count of the instance
          * @return count{Number} Count of Instance
          */
        countInstances: function countInstances(number, array, count) {

            var _array = array.slice(), index;

            count = count || 0;
            index = _array.indexOf(number);

            if (index !== -1) {
                _array.splice(index, 1);
                count++;
                count = countInstances(number, _array, count);
            }

            return count;

        },

        /*
         * Handler for Mouse enter event on Canvas
         * @method onMouseEnterOnCanvas
         * @private
         */
        onMouseEnterOnCanvas: function onMouseEnterOnCanvas(event) {
            this._setCursor(className.CURSOR_TYPE.OPEN_HAND);
        },

        /*
         * Handler for Mouse leave event on Canvas
         * @method onMouseLeaveOnCanvas
         * @private
         */
        onMouseLeaveOnCanvas: function onMouseLeaveOnCanvas(event) {
            this._setCursor(className.CURSOR_TYPE.DEFAULT);
        },


        /*
         * Handler for Mouse Up event on Sphere
         * @method onMouseUpOnSphere
         * @private
         */
        onMouseUpOnSphere: function onMouseUpOnSphere(event, object) {

            var browserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;

            if (object || (this.allowClick && (event.which === 1 || browserCheck.isMobile === true))) {
                this.stopReading();
                var mouse = { x: 0, y: 0, z: 1 },
                    shapeNumber = this.model.get('shapeNumber'),
                    shapeView = this.shapeViewArr[shapeNumber],
                    sphereGroup = shapeView.getSphereGroup(),
                    selectedSphereGroup = shapeView.getSelectedSphereGroup(),
                    childModel = shapeView.model,
                    canvasOffset = this.$canvas.offset(),
                    self = this,
                    sphereColor = className.SPHERE_COLOR,
                    intersects = null;

                //stop any other event listener from recieving this event
                event.preventDefault();

                self._animate();

                if (!object) {
                    intersects = this._getIntersects(sphereGroup, event);
                }

                //the ray will return an array with length of 1 or greater if the mouse click
                //does touch the sphere object
                if (object || intersects.length) {
                    this.eventManager.trigger(eventManagerModel.ENABLE_TRY_ANOTHER);
                    this.eventManager.trigger(eventManagerModel.DESELECT_SHAPE);
                    object = object || intersects[0].object;
                    var nameOfPoint = object.name,
                       arr = childModel.get('pointsArr').slice(),
                       scaleFactor = this.model.get('clickableSphereScaleFactor'),
                       arrLength = arr.length,
                       newPoint = null,
                       indexOfPoint = arr.indexOf(nameOfPoint);

                    if (indexOfPoint === -1) {
                        newPoint = object.clone();
                        newPoint.material.color.setHex(sphereColor.SELECTED);
                        selectedSphereGroup.add(newPoint);
                        //object.material.color.setHex(sphereColor.SELECTED);
                        //object.scale.set(scaleFactor, scaleFactor, scaleFactor);
                        if (arrLength === this.model.get('maxPoints')) {
                            selectedSphereGroup.remove(selectedSphereGroup.getObjectByName(arr[0]));
                            var removedObject = sphereGroup.getObjectByName(arr[0]);
                            removedObject.material.color.setHex(sphereColor.DESELECTED);
                            //removedObject.scale.set(1, 1, 1);
                            arr.shift();
                        }
                        arr.push(nameOfPoint);
                        childModel.set('pointsArr', arr);

                        if (childModel.get('pointChecker')) {
                            this.changeAccMessage('canvas-acc-container', 5);
                            this.canvasAcc.setSelfFocus();
                        }
                        else if (arr.length !== this.model.get('maxPoints')) {
                            this.changeAccMessage('canvas-acc-container', 3);
                            this.canvasAcc.setSelfFocus();
                        }
                    }
                    else {
                        object.material.color.setHex(sphereColor.DESELECTED);
                        selectedSphereGroup.remove(selectedSphereGroup.getObjectByName(object.name));
                        //object.scale.set(1, 1, 1);
                        arr = _.without(arr, nameOfPoint);
                        //     arr = arr.splice(indexOfPoint, 1);     Not used as it takes more time to execute
                        childModel.set('pointsArr', arr);
                        this.changeAccMessage('canvas-acc-container', 4);
                        this.canvasAcc.setSelfFocus();
                    }
                    childModel.set('lastHoveredPoint', null);
                    this.setSliceButtonState();
                }
            }
        },

        /*
         * Handler for Mouse Move event on Sphere
         * @method onMouseMoveOnSphere
         * @private
         */
        onMouseMoveOnSphere: function onMouseMoveOnSphere(event, object) {
            var mouse = { x: 0, y: 0, z: 1 },
                shapeNumber = this.model.get('shapeNumber'),
                shapeView = this.shapeViewArr[shapeNumber],
                sphereGroup = shapeView.getSphereGroup(),
                childModel = shapeView.model,
                canvasOffset = this.$canvas.offset(),
                self = this,
                intersects = null,
                selectedPoints = childModel.get('pointsArr'),
                sphereColor = className.SPHERE_COLOR,
                lastHoveredPoint = childModel.get('lastHoveredPoint'),
                object = object || null,
                nameOfPoint = null,
                scaleFactor = null,
                prevObject = null;

            //stop any other event listener from recieving this event
            event.preventDefault();

            if (!object) {
                intersects = this._getIntersects(sphereGroup.clone(), event);
            }

            self.mouseDownOnSphere = false;
            //the ray will return an array with length of 1 or greater if the mouse click
            //does touch the sphere object
            if (object || this.showHover && intersects.length) {
                this.$canvas.css('cursor', 'pointer');
                self.mouseDownOnSphere = true;
                object = object || intersects[0].object;
                nameOfPoint = object.name;
                scaleFactor = this.model.get('clickableSphereScaleFactor');

                if (nameOfPoint !== lastHoveredPoint) {
                    //Remove hover state of previous object
                    if (lastHoveredPoint) {
                        prevObject = sphereGroup.getObjectByName(lastHoveredPoint);
                        //If it is not a selected point
                        if (selectedPoints.indexOf(lastHoveredPoint) === -1) {
                            prevObject.material.color.setHex(sphereColor.DESELECTED);
                        }
                        else {
                            prevObject.material.color.setHex(sphereColor.SELECTED);
                        }
                        childModel.set('lastHoveredPoint', null);
                    }
                    if (selectedPoints.indexOf(nameOfPoint) === -1) {
                        object.material.color.setHex(sphereColor.DESELECTED_HOVER);
                        if (!event.isAfterMouseUp) {
                            this.changeAccMessage('canvas-acc-container', 1);
                        }
                    }
                    else {
                        object.material.color.setHex(sphereColor.SELECTED_HOVER);
                        if (!event.isAfterMouseUp) {
                            this.changeAccMessage('canvas-acc-container', 2);
                        }
                    }
                    childModel.set('lastHoveredPoint', nameOfPoint);
                    this._renderScene();
                }
            }
            else {
                if (self.mouseDownOnCanvas) {
                    this._setCursor(className.CURSOR_TYPE.CLOSED_HAND);
                }
                else {
                    this._setCursor(className.CURSOR_TYPE.OPEN_HAND);
                }

                if (lastHoveredPoint) {
                    object = sphereGroup.getObjectByName(lastHoveredPoint);
                    //Remove hover state of previous object
                    //If it is not a selected point
                    if (selectedPoints.indexOf(lastHoveredPoint) === -1) {
                        object.material.color.setHex(sphereColor.DESELECTED);
                    }
                    else {
                        object.material.color.setHex(sphereColor.SELECTED);
                    }
                    childModel.set('lastHoveredPoint', null);
                    this._renderScene();
                }
            }
            this._renderScene();
        },

        /**
        * Resets the point selection of the shapes
        *
        * @method resetPointSelection
        * @public
        **/
        resetPointSelection: function resetPointSelection(shapeView) {
            var shapeNumber = this.model.get('shapeNumber'),
                arr = shapeView.model.get('pointsArr').slice(),
                arrLength = arr.length, removedObject,
                sphereColor = className.SPHERE_COLOR,
                selectedSphereGroup = shapeView.getSelectedSphereGroup(),
                sphereGroup = shapeView.getSphereGroup();
            for (var i = 0; i < arrLength; i++) {
                removedObject = sphereGroup.getObjectByName(arr[i]);
                selectedSphereGroup.remove(selectedSphereGroup.getObjectByName(arr[i]));
                removedObject.material.color.setHex(sphereColor.DESELECTED);
                //removedObject.scale.set(1, 1, 1);
            }
            arr.length = 0;
            shapeView.model.set('pointsArr', arr);
        },

        /**
       * Sets the point selection of the shapes
       *
       * @method resetPointSelection
       * @public
       **/
        setPointSelection: function setPointSelection(shapeView) {
            var arr = shapeView.model.get('pointsArr').slice(),
                arrLength = arr.length, object,
                sphereColor = className.SPHERE_COLOR,
                scaleFactor = this.model.get('clickableSphereScaleFactor'),
                sphereGroup = shapeView.getSphereGroup();

            for (var i = 0; i < arrLength; i++) {
                object = sphereGroup.getObjectByName(arr[i]);
                object.material.color.setHex(sphereColor.SELECTED);
                //object.scale.set(scaleFactor, scaleFactor, scaleFactor);
            }
            this.eventManager.trigger(eventManagerModel.CREATE_CROSSSECTION);
        },

        /**
        * Returns the intersection point of projected ray
        *
        * @method _getIntersects
        * @param sphereGroup{Object} 3D Sphere Group
        * @private
        **/
        _getIntersects: function _getIntersects(sphereGroup, event) {
            var mouse = { x: 0, y: 0, z: 1 },
                shapeNumber = this.model.get('shapeNumber'),
                shapeView = this.shapeViewArr[shapeNumber],
                canvasOffset = this.$canvas.offset();

            //this where begin to transform the mouse cordinates to three,js cordinates
            mouse.x = ((event.pageX - canvasOffset.left) / this.canvasWidth) * 2 - 1;
            mouse.y = -((event.pageY - canvasOffset.top) / this.canvasHeight) * 2 + 1;
            //this vector caries the mouse click cordinates
            shapeView.mouseVector.set(mouse.x, mouse.y, mouse.z);

            //the final step of the transformation process, basically this method call
            //creates a point in 3d space where the mouse click occurd
            shapeView.projector.unprojectVector(shapeView.mouseVector, shapeView.camera);
            shapeView.mouseVector.sub(shapeView.camera.position);
            shapeView.mouseVector.normalize();

            shapeView.ray.set(shapeView.camera.position, shapeView.mouseVector);

            return shapeView.ray.intersectObjects(sphereGroup.children, false);
        },

        /**
       * Binds Events on Canvas for Panning
       *
       * @method disableClicksOnPanning
       * @private
       **/
        disableClicksOnPanning: function disableClicksOnPanning() {
            var self = this,
                $canvas = this.$canvas,
                mouseDownEvent = null;

            $canvas.on('mousedown.checkPanning', function (event) {
                mouseDownEvent = event;
                event.currSelector = self.$('.left-canvas-container-modal');
                self.eventManager.trigger(eventManagerModel.DISABLE_HOVER, event);
                self.stopReading();
                self.model.set('requestAnimation', true);
                self._animate();
                if (self.mouseDownOnSphere === false) {
                    self._setCursor(className.CURSOR_TYPE.CLOSED_HAND);
                }
                //set reset button status in model;
                var shapeView = self.shapeViewArr[self.model.get('shapeNumber')];

                self.mouseDownOnCanvas = true;
                $canvas.on('mousemove.checkPanning touchmove.checkPanning', function (event) {
                    if (event.type === 'mousemove' || self._isActualMouseMove(mouseDownEvent, event)) {
                        self.mouseMoveCount++;

                        if (self.mouseMoveCount < 2) {
                            shapeView.model.set('isResetButtonEnable', true);
                            self.eventManager.trigger(eventManagerModel.ENABLE_TRY_ANOTHER);
                            self.eventManager.trigger(eventManagerModel.DESELECT_SHAPE);
                        }

                        if (self.mouseMoveCount >= 5) {
                            self.allowClick = false;
                            self.showHover = false;
                            self.mouseMoveCount = 0;
                            $canvas.off('mousemove.checkPanning touchmove.checkPanning');
                        }
                    }
                });
                $(document).one('mouseup.checkPanning', function (event) {
                    self.eventManager.trigger(eventManagerModel.ENABLE_HOVER, event);
                    self.showHover = true;
                    self.allowClick = true;
                    self.mouseMoveCount = 0;
                    $canvas.off('mousemove.checkPanning touchmove.checkPanning');
                    self.model.set('requestAnimation', false);
                    self.mouseDownOnCanvas = false;
                    self._setCursor(className.CURSOR_TYPE.OPEN_HAND);
                });
            });
        },

        _isActualMouseMove: function _isActualMouseMove(event1, event2) {
            var tolerance = 1,
                point1 = this._getPointOnScreen(event1),
                point2 = this._getPointOnScreen(event2);
            return (Math.abs(Math.round(point1.pageX) - Math.round(point2.pageX)) > tolerance ||
                Math.abs(Math.round(point1.pageY) - Math.round(point2.pageY)) > tolerance);
        },

        _getPointOnScreen: function _getPointOnScreen(event) {
            switch (event.type) {
                case 'touchmove':
                    return event.originalEvent.touches[0];

                default:
                    return event;
            }
        },

        /**
        * Hides the tool tip 
        *
        * @method hideToolTipOnMouseDown
        * @private
        **/
        hideToolTipOnMouseDown: function (shapeView) {
            var self = this,
                $canvas = this.$canvas;

            $canvas.off('mousedown.toolTipHide').on('mousedown.toolTipHide', function () {
                self.eventManager.trigger(eventManagerModel.CLICK_ON_3D_CANVAS);
            });
        },

        /**
       * Renders the ThreeJS Scenes  
       *
       * @method _renderScene
       * @private
       **/
        _renderScene: function _renderScene() {
            //shapeView.camera.lookAt(shapeView.scene.position);

            this.renderer.clear();
            this.renderer.clear(false, true, false);    //Clears only Depth
            this.renderer.render(this.scene, this.camera);
            this.renderer.render(this.frontScene, this.camera);
            this._updateModelValues();
        },

        /**
      * Request Animation Frame Handler 
      *
      * @method _animate
      * @private
      **/
        _animate: function _animate() {
            var self = this,
                shapeView = this.shapeViewArr[this.model.get('shapeNumber')],
                activityLoaded = this.model.get('activityLoaded');

            if (this.model.get('requestAnimation') && activityLoaded) {//&& $(document).find(this.renderer.domElement).length > 0) {
                this.lastAnimationFrame = window.requestAnimationFrame($.proxy(self._animate, self));
            }
            shapeView.controls.update();
            this._renderScene();

        },


        /**
      * Update the Camera Rotation on Panning
      *
      * @method _updateModelValues
      * @private
      **/
        _updateModelValues: function _updateModelValues() {
            var shapeView = this.shapeViewArr[this.model.get('shapeNumber')],
                shapeModel = shapeView.model,
                camera = shapeView.camera,
                cameraRotation = camera.rotation,
                cameraPosition = camera.position,
                cameraUp = camera.up,
                quaternion = cameraRotation._quaternion;

            if (this.model.get('saveStateLoad') === false) {
                shapeModel.set('cameraQuaternion', { w: quaternion.w, x: quaternion.x, y: quaternion.y, z: quaternion.z });
                shapeModel.set('cameraPos', { x: cameraPosition.x, y: cameraPosition.y, z: cameraPosition.z });
                shapeModel.set('cameraUp', { x: cameraUp.x, y: cameraUp.y, z: cameraUp.z });
            }
        },

        /**
        * Handles the shape button click
        *
        * @method shapeSliceHandler
        * @private
        **/
        shapeSliceHandler: function shapeSliceHandler(event) {
            var shapeNumber = this.model.get('shapeNumber'),
                shapeView = this.shapeViewArr[shapeNumber];
            this.find2DCoordinates(event);
            this.resetPointSelection(shapeView);
            this.setSliceButtonState();
            this._renderScene();
        },

        /**
        * Calculates the 2D Coordinates from 3D Coordinates
        *
        * @method find2DCoordinates
        * @private
        **/
        find2DCoordinates: function find2DCoordinates(event) {

            var shapeNumber = this.model.get('shapeNumber'),
                shapeView = this.shapeViewArr[shapeNumber],
                crossSection = shapeView.crossSection,
                crossSectionGeometry,
                crossSectionGeometryVertices,
                crossSectionGeometryVerticesLength,
                obj,
                pathCoordinates = [],
                numberOfPoints = null,
                pointsArr = shapeView.model.get('pointsArr'),
                sphereGroup = shapeView.getSphereGroup(),
                firstPoint = sphereGroup.getObjectByName(pointsArr[0]),
                secondPoint = sphereGroup.getObjectByName(pointsArr[1]),
                thirdPoint = sphereGroup.getObjectByName(pointsArr[2]),
                plane = new THREE.Plane(),
                planeNormal,
                p1 = firstPoint.position,
                p2 = secondPoint.position,
                p3 = thirdPoint.position;

            // Check if not a sphere
            // Cross section in the sphere is drawn by using the lookAt function
            // lookAt function changes rotates the cross section but does not append the position of the vertices
            if (shapeView.name !== className.SHAPE_NAMES[1][className.SPHERE_INDEX]) {
                plane.setFromCoplanarPoints(p1, p2, p3);
            }
            else {
                crossSectionGeometry = crossSection.geometry;
                crossSectionGeometryVertices = crossSectionGeometry.vertices;
                crossSectionGeometryVerticesLength = crossSectionGeometryVertices.length;

                plane.setFromCoplanarPoints(
                    crossSectionGeometryVertices[0],
                    crossSectionGeometryVertices[crossSectionGeometryVerticesLength / 3],
                    crossSectionGeometryVertices[2 * crossSectionGeometryVerticesLength / 3]
                );
            }

            planeNormal = plane.normal;

            crossSectionGeometry = this.map3dTo2d(crossSection.geometry, planeNormal);
            crossSectionGeometryVertices = crossSectionGeometry.vertices;
            crossSectionGeometryVerticesLength = crossSectionGeometryVertices.length;

            this.map3dTo2d(crossSectionGeometry, planeNormal);

            var pointsToChoose = this.getPointsToChoose(crossSectionGeometryVertices);

            pathCoordinates.push(this._toScreenXY(crossSectionGeometryVertices[0], pointsToChoose));
            pathCoordinates.push(this._toScreenXY(crossSectionGeometryVertices[1], pointsToChoose));

            for (var i = 2; i < crossSectionGeometryVerticesLength; i++) {
                obj = this._toScreenXY(crossSectionGeometryVertices[i], pointsToChoose);
                numberOfPoints = pathCoordinates.length;
                if (this.areCollinear(pathCoordinates[numberOfPoints - 2], pathCoordinates[numberOfPoints - 1], obj)) {
                    pathCoordinates.pop();
                    numberOfPoints = pathCoordinates.length;
                }
                if ((i === crossSectionGeometryVerticesLength - 1) && (this.areCollinear(pathCoordinates[numberOfPoints - 1], obj, pathCoordinates[0]))) {
                    if (this.areCollinear(pathCoordinates[numberOfPoints - 1], pathCoordinates[0], pathCoordinates[1])) {
                        pathCoordinates.shift();
                    }
                }
                else {
                    pathCoordinates.push(obj);
                }
            }

            this.model.set('pathCoordinates', pathCoordinates);
            crossSectionGeometry.dispose();

            this.eventManager.trigger(eventManagerModel.DRAW_SLICED_SHAPE, event);
        },

        /**
        * Mapping of 3D to 2D coordinates
        *
        * @method map3dTo2d
        * @private
        **/
        map3dTo2d: function map3dTo2d(crossSectionGeom, normal) {

            var zAxis = new THREE.Vector3(0, 0, 1),
                rotAxis = new THREE.Vector3(),
                rotAngle = null,
                rotMatrix = null,
                scalingMatrix = this.createScalingMatrix(),
                geom = null;

            rotAxis = rotAxis.crossVectors(zAxis, normal);
            rotAxis.normalize();

            rotAngle = Math.acos(zAxis.clone().dot(normal));

            rotMatrix = this.createRotMatrixFromAxisAngle(rotAxis, rotAngle);

            geom = crossSectionGeom.clone();
            geom.applyMatrix(rotMatrix);
            geom.applyMatrix(scalingMatrix);

            return geom;
        },

        /**
       * Creates a Rotation Matrix from given angle and axis
       *
       * @method createRotMatrixFromAxisAngle
       * @private
       **/
        createRotMatrixFromAxisAngle: function createRotMatrixFromAxisAngle(axis, angle) {
            var cos = Math.cos(-angle),
                sin = Math.sin(-angle),
                t = 1 - cos;

            return new THREE.Matrix4(
                t * axis.x * axis.x + cos, t * axis.x * axis.y - sin * axis.z, t * axis.x * axis.z + sin * axis.y, 0,
                t * axis.x * axis.y + sin * axis.z, t * axis.y * axis.y + cos, t * axis.y * axis.z - sin * axis.x, 0,
                t * axis.x * axis.z - sin * axis.y, t * axis.y * axis.z + sin * axis.x, t * axis.z * axis.z + cos, 0,
                0, 0, 0, 1
            );
        },

        /**
      * Creates a Scaling Matrix 
      *
      * @method createScalingMatrix
      * @private
      **/
        createScalingMatrix: function createScalingMatrix() {
            var scaleFactor = className.SCALE_FACTOR_3D_TO_2D;
            return new THREE.Matrix4(
                scaleFactor, 0, 0, 0,
                0, scaleFactor, 0, 0,
                0, 0, scaleFactor, 0,
                0, 0, 0, 1
            );
        },

        /**
        * Coverts the points to Screnn X and Y Coordinate
        *
        * @method _toScreenXY
        * @private
        **/
        _toScreenXY: function _toScreenXY(position, pointsToChoose) {
            return [position[pointsToChoose[0]], position[pointsToChoose[1]]];
        },


        /**
        * Calculates the axis based on points
        *
        * @method getPointsToChoose
        * @private
        **/
        getPointsToChoose: function getPointsToChoose(points) {
            var axis = [],
                totalPoints = points.length,
                count = 0,
                axisDiff = 2,
                currentPoint = null,
                nextPoint = null,
                xDiff = false,
                yDiff = false,
                zDiff = false;

            for (; count < totalPoints; count++) {
                currentPoint = points[count];
                nextPoint = points[(count + 1) % totalPoints];
                if (axisDiff !== 0 && !xDiff && Math.round(currentPoint.x) !== Math.round(nextPoint.x)) {
                    xDiff = true;
                    axisDiff--;
                    axis.push('x');
                }
                if (axisDiff !== 0 && !yDiff && Math.round(currentPoint.y) !== Math.round(nextPoint.y)) {
                    yDiff = true;
                    axisDiff--;
                    axis.push('y');
                }
                if (axisDiff !== 0 && !zDiff && Math.round(currentPoint.z) !== Math.round(nextPoint.z)) {
                    zDiff = true;
                    axisDiff--;
                    axis.push('z');
                }
                if (axisDiff === 0) {
                    return axis;
                }
            }
        },

        /**
       * Checks if three points are collinear
       *
       * @method areCollinear
       * @private
       **/
        areCollinear: function areCollinear(pt1, pt2, pt3) {
            var tolerance = 0.01;

            return Math.abs((pt1[1] - pt2[1]) * (pt1[0] - pt3[0]) - (pt1[1] - pt3[1]) * (pt1[0] - pt2[0])) <= tolerance;
        },

        /**
     * Returns the Material Object
     *
     * @method getMaterialDetails
     * @public
     **/
        getMaterialDetails: function getMaterialDetails() {
            return className.MATERIAL;
        },

        /**
  * Returns the Outline Object
  *
  * @method getOutlineDetails
  * @public
  **/
        getOutlineDetails: function getOutlineDetails() {
            return className.OUTLINE;
        },

        /**
  * Returns the Crosssection Object
  *
  * @method getCrosssectionDetails
  * @public
  **/
        getCrosssectionDetails: function getCrosssectionDetails() {
            return className.CROSSSECTION_DETAILS;
        },

        /**
        * Enables the Slice button if at least 3 points are selected in 3D shape and number sliced shapes are less than 
        * 10 otherwise disables it.
        * @method setSliceButtonState
        * @return {Boolean} Slice button's newly set state
        * @public
        **/
        setSliceButtonState: function setSliceButtonState() {
            var shapeNumber = this.model.get('shapeNumber'),
                shapeView = this.shapeViewArr[shapeNumber],
                noOfSlicedShapes = this.model.get('noOfSlicedShapes'),
                pointChecker = shapeView.model.get('pointChecker'),//checks whether the points are 3 and non-collinear and do not lie on a face
                isSliceShapeButtonEnabled = noOfSlicedShapes < mainModelNameSpace.MAX_SLICE_SHAPES && pointChecker;

            this.model.set('isSliceShapeButtonEnabled', isSliceShapeButtonEnabled);

            if (pointChecker === false) {
                this.canvasAcc.model.set('disableSelfFocusOnSpace', true);
            }

            return isSliceShapeButtonEnabled;
        },

        /**
        * Sets the canvas cursor type
        * @method _setCursor
        * @param {String} strCursorValue One of cursor type from static constant CURSOR_TYPE
        * @private
        **/
        _setCursor: function _setCursor(strCursorValue) {
            if (!this.parent.isRotationDown) {
                if (strCursorValue !== className.CURSOR_TYPE.DEFAULT && strCursorValue !== className.CURSOR_TYPE.POINTER) {
                    strCursorValue = "url('" + this.getImagePath(strCursorValue) + "'), move";
                }
                this.$canvas.css('cursor', strCursorValue);
            }
        },
        /**
        * Generates the cross-section and filters all 3D-points by removing all those that are collinear
        * @method filterPoints
        * @param {Array} lines Lines with which the plane is to be checked for intersections
        * @param {Object} plane An instance of THREE.Plane for by the 3 selected points
        * @param {Object} geometry An instance of THREE.Geometry storing the geometry of the cross-section
        * @public
        **/
        filterPoints: function filterPoints(lines, plane, geometry) {
            var totalLines = lines.length,
                intersection = null,
                geometryVerticesLength;

            for (var i = 0; i < totalLines ; i++) {

                intersection = plane.intersectLine(lines[i]);
                if (intersection) {
                    geometryVerticesLength = geometry.vertices.length;

                    if ((geometryVerticesLength >= 2) &&
                        (this.check3DCollinearity(geometry.vertices[geometryVerticesLength - 2], geometry.vertices[geometryVerticesLength - 1], intersection))) {
                        geometry.vertices.pop();
                        geometryVerticesLength = geometry.vertices.length;
                    }
                    if (i === totalLines - 1) {
                        if (this.check3DCollinearity(geometry.vertices[geometryVerticesLength - 1], intersection, geometry.vertices[0])) {
                            geometry.vertices.shift();
                        }
                    }
                    geometry.vertices.push(intersection);
                }
            }
            geometry.vertices.push(geometry.vertices[0]);
        },
        /**
        * Returns true if the co-ordinate values of 3 points is the same with a certain tolerance
        * @method isSame
        * @param {Number} pt1 Co-ordinate value of x, y or z of first point
        * @param {Number} pt2 Co-ordinate value of x, y or z of second point
        * @param {Number} pt3 Co-ordinate value of x, y or z of third point
        * @public
        **/
        isSame: function isSame(pt1, pt2, pt3) {
            var sameTolerance = 0.000000001;
            return Math.abs(pt1 - pt2) <= sameTolerance &&
                   Math.abs(pt2 - pt3) <= sameTolerance &&
                   Math.abs(pt3 - pt1) <= sameTolerance;
        },
        /**
        * Returns true if 3 points in 2D space are collinear
        * @method check2DCollinearity
        * @param {Number} x12 Difference between x-value of first point and second point
        * @param {Number} y12 Difference between y-value of first point and second point
        * @param {Number} x13 Difference between x-value of first point and third point
        * @param {Number} y13 Difference between y-value of first point and third point
        * @public
        **/
        check2DCollinearity: function check2DCollinearity(x12, y12, x13, y13) {
            var tolerance = 0.0001;
            return Math.abs(y12 * x13 - y13 * x12) <= tolerance;
        },
        /**
        * Returns true if 3 points in 3D space are collinear
        * @method check3DCollinearity
        * @param {Object} pt1 Co-ordinate values of x, y and z of first point
        * @param {Object} pt2 Co-ordinate values of x, y and z of second point
        * @param {Object} pt3 Co-ordinate values of x, y and z of third point
        * @public
        **/
        check3DCollinearity: function check3DCollinearity(pt1, pt2, pt3) {

            var sameX = this.isSame(pt1.x, pt2.x, pt3.x),
                sameY = this.isSame(pt1.y, pt2.y, pt3.y),
                sameZ = this.isSame(pt1.z, pt2.z, pt3.z),
                count = Number(sameX) + Number(sameY) + Number(sameZ);

            if (count > 1) {
                return true;
            }

            var tolerance = 0.0001,
                x12 = pt2.x - pt1.x,
                x13 = pt3.x - pt1.x,
                y12 = pt2.y - pt1.y,
                y13 = pt3.y - pt1.y,
                z12 = pt2.z - pt1.z,
                z13 = pt3.z - pt1.z;

            if (count) {
                if (sameX) {
                    return this.check2DCollinearity(y12, z12, y13, z13);
                }
                if (sameY) {
                    return this.check2DCollinearity(z12, x12, z13, x13);
                }
                return this.check2DCollinearity(x12, y12, x13, y13);
            }
            else {
                var xRatio = x12 / x13,
                    yRatio = y12 / y13,
                    zRatio = z12 / z13;
                return Math.abs(xRatio - yRatio) <= tolerance && Math.abs(zRatio - xRatio) <= tolerance && Math.abs(yRatio - zRatio) <= tolerance;
            }
        },
        /**
        * Disposes the Objects of the Scene
        * @method disposeObjects
        * @public
        **/
        disposeObjects: function disposeObjects(scene) {
            scene.children.forEach(function (obj, idx) {
                if (obj.children) {
                    disposeObjects(obj);
                }
                if (obj.geometry) {
                    obj.geometry.dispose();
                }
                if (obj.material) {
                    obj.material.dispose();
                }
                if (obj.dispose) {
                    obj.dispose();
                }
                if (scene instanceof THREE.Scene) {
                    scene.remove(obj);
                }
            });
        }
    }, {

        SHAPE_NAMES: {
            1: ['Cube', 'Tetrahedron', 'Prism', 'Cone', 'Sphere', 'Cylinder'],
            2: ['Cube', 'TriangularPrism', 'Pyramid']
        },

        SPHERE_INDEX: 4,

        MATERIAL: {
            COLOR: '#818284',
            OPACITY: 0.5
        },

        CROSSSECTION_DETAILS: {
            COLOR: '#36c6f4',
            OPACITY: 0.5
        },

        OUTLINE: {
            COLOR: '#FFFFFF'
        },

        SCALE_FACTOR_3D_TO_2D: 0.7,

        SPHERE_COLOR: {
            SELECTED: 0x36c6f4,
            DESELECTED: 0xffffff,
            SELECTED_HOVER: 0x84e1ff,
            DESELECTED_HOVER: 0x91eae3
        },

        CURSOR_TYPE: {
            DEFAULT: 'default',
            POINTER: 'pointer',
            OPEN_HAND: 'open-hand',
            CLOSED_HAND: 'closed-hand'
        },

        CANVAS_SIZE: {
            WIDTH: 432,
            HEIGHT: 353
        }
    });
})(window.MathInteractives);