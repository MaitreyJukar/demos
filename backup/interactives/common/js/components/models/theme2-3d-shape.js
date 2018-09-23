(function (MathInteractives) {
    'use strict';
    var ClassName = null;
    /**
    * Class for making objects draggable and droppable
    *
    * @class Shape3D
    * @constructor
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
    * @namespace MathInteractives.Common.Components.Models.Shape3D
    **/
    MathInteractives.Common.Components.Models.Shape3D = MathInteractives.Common.Player.Models.BaseInteractive.extend({
        defaults: {

            /**
           * Reference to Paper Scope
           *
           * @property paperScope
           * @type Object
           * @default null
           */
            paperScope: null,

            /**
            * Player object
            * @property player
            * @type Object
            * @default null
            **/
            player: null,

            /**
            * Manager object
            * @property manager
            * @type Object
            * @default null
            **/
            manager: null,

            /**
            * Stores the Type of the Shape
            * @property type
            * @type Object
            * @default null
            **/
            type: null,

            /**
            * Contains the properties of Shape (Height,Width,Radius,Color,dashedLineData,center,ellipseOpacity)
            * @property properties
            * @type Object
            * @default null
            **/
            properties: null,

            /**
            * Refers to the master Group which contains the Shape Group and Labels Group
            * @property masterGroup
            * @type Object
            * @default null
            **/
            masterGroup: null,

            /**
            * Boolean to show CrossSection
            * @property crossSection
            * @type Boolean
            * @default false
            **/
            crossSection: false,

            /**
            * Contains the Data for Creating Cross Section - position,crossSectionType,strokeColor,strokeWidth,dottedFrom,dottedTo
            * @property crossSectionData
            * @type Object
            * @default null
            **/
            crossSectionData: null,

            /**
            * Boolean to apply Gradient
            * @property applyGradient
            * @type Boolean
            * @default true
            **/
            applyGradient: true,

            /**
           * Gradient Data Object if custom gradient is needed
           * @property gradientData
           * @type Object
           * @default null
           **/
            gradientData: null,

            /**
            * Array of Colors to be applied as Gradient to the Shape
            * @property gradientColor
            * @type Array
            * @default null
            **/
            gradientColor: null,

            /**
            * Array of Stops for the above Colors to be applied as Gradient to the Shape
            * @property gradientStops
            * @type Array
            * @default null
            **/
            gradientStops: null,

            /**
            * Boolean for Cone Shape if Base is On Top of Not
            * @property baseOnTop
            * @type Boolean
            * @default false
            **/
            baseOnTop: false,

            /**
            * Opacity for the Shape
            * @property shapeOpacity
            * @type Number
            * @default 1
            **/
            shapeOpacity: 1,

            /**
            * Boolean if Borders of Shape need to be showed or not
            * @property showBorders
            * @type Boolean
            * @default true
            **/
            showBorders: true,

            /**
            * Boolean if Labels of Shape need to be showed or not
            * @property showLabels
            * @type Boolean
            * @default false
            **/
            showLabels: false,

            /**
           * Contains the Labels Data For the Shape
           * @property labelsData
           * @type Object
           **/
            labelsData: {
                radius: {
                    labelType: null,
                    linePosition: 50,
                    labelPosition: null,
                    lineProperties: {
                        strokeColor: '#FFFFFF'
                    },
                    textProperties: {
                        strokeColor: '#FFFFFF'
                    },
                    customText: null,
                    show: true,
                    centerProperties: {
                        fillColor: '#FFFFFF',
                        radius: 0
                    },
                    showPointText: true

                },
                height: {
                    labelType: null,
                    linePosition: 50,
                    labelPosition: null,
                    labelPositionOffset: null,
                    lineProperties: {
                        strokeColor: '#FFFFFF'
                    },
                    textProperties: {
                        strokeColor: '#FFFFFF'
                    },
                    customText: null,
                    show: true,
                    showPointText: true
                }
            }
        },

        /**
        * Initializes the Shape
        *
        * @method initialize
        * @constructor
        */
        initialize: function () {
            if (this.get('manager') == null) {
                this.set('manager', this.get('player').getManager());
            }

            this._selectAndCreateShape();
        },

        /*************************************START OF PRIVATE FUNCTIONS*********************************************************/

        /**
        * Selects the Shape according to the type and calls function to create it
        *
        * @method _selectAndCreateShape
        * @private
        */
        _selectAndCreateShape: function _selectAndCreateShape() {

            this._removeShape();

            var properties = this.get('properties');
            if (properties.dashedLineData) {
                this.dashedLineData = properties.dashedLineData;
            }
            else if (properties.radius <= 50 || properties.width <= 50) {
                this.dashedLineData = [5, 3];
            }
            else {
                this.dashedLineData = [10, 5];
            }


            switch (this.get('type')) {

                case ClassName.TYPES.SPHERE: {
                    this._createShape(this._generateSphere(), true);
                    break;
                }

                case ClassName.TYPES.ELLIPSE: {
                    break;
                }

                case ClassName.TYPES.CYLINDER: {
                    this._createShape(this._generateCylinder(), false);
                    break;

                }

                case ClassName.TYPES.CONE: {
                    this._createShape(this._generateCone(), false);
                    break;
                }

                case ClassName.TYPES.DOUBLECONE: {
                    this._createShape(this._generateDoubleCone(), true);
                    break;
                }

                default: return;
            }
        },

        /**
        * Creates Shape,sets gradient and draws Labels
        *
        * @method _createShape
        * @param shape {Object} Shape Paper Object
        * @param gradientOnShape {Boolean} Boolean if gradient needs to be applied to child or not
        * @private
        */
        _createShape: function _createShape(shape, gradientOnShape) {

            var paperScope = this.get('paperScope'),
                masterGroup = new paperScope.Group(shape);
            paperScope.activate();

            this.set('masterGroup', masterGroup);

            if (this.getShape()) {
                this._setCrossSection();
                if (gradientOnShape === true) {
                    this.setGradient();
                }
                else {
                    this.setGradient(shape.children[0]);
                }
                if (this.get('showLabels') === true) {
                    this._drawLabels();
                }
            }

        },

        /**
        * Generates Sphere Shape
        *
        * @method _generateSphere
        * @private
        */
        _generateSphere: function _generateSphere() {
            var self = this,
                paperScope = self.get('paperScope'),
                sphere = null;
            paperScope.activate();

            sphere = new paperScope.Group(new paperScope.Path.Circle(self.get('properties')));
            sphere.name = 'sphere-group';
            sphere.data = 'shape';
            return sphere;
        },

        /**
        * Generates Cylinder Shape
        *
        * @method _generateCylinder
        * @private
        */
        _generateCylinder: function _generateCylinder() {

            var self = this,
                paperScope = self.get('paperScope'),
                properties = self.get('properties'),
                height = parseFloat(properties.height.toFixed(3)),
                width = properties.width,
                longRadius = width / 2,
                shortRadius = properties.shortRadius || width / 8,
                ellipseX = properties.center.x,
                ellipseY = properties.center.y - height / 2,
                topEllipse = null, bottomEllipse = null, rectangle = null,
                ellipseProps = {
                    center: [ellipseX, ellipseY],
                    radius: [longRadius, shortRadius],
                    strokeWidth: properties.strokeWidth,
                    strokeColor: properties.strokeColor
                },
                rectProps = {
                    point: [properties.center.x - width / 2, ellipseY],
                    size: [width, height]
                },
                fillCylinder = null, cylinderGroup = null, line1 = null, line2 = null, unitedPath = null;
            paperScope.activate();


            if (width === 0 || height === 0) {
                ellipseProps.radius = [0, 0];
                rectProps.size = [0, 0];
                ellipseProps.strokeColor = '';
                ellipseProps.strokeWidth = 0;
            }

            rectangle = this._drawRectangle(rectProps);

            topEllipse = this._drawEllipse(ellipseProps);
            bottomEllipse = this._drawDottedEllipse(ellipseProps);
            bottomEllipse.position = new paperScope.Point(topEllipse.position.x, topEllipse.position.y + height);

            unitedPath = topEllipse.unite(rectangle);
            fillCylinder = bottomEllipse.children[1].children[1].unite(unitedPath);

            unitedPath.remove();
            rectangle.remove();
            fillCylinder.name = 'united-path';
            topEllipse.name = 'top-ellipse';
            bottomEllipse.name = 'bottom-ellipse';

            cylinderGroup = new paperScope.Group(fillCylinder, topEllipse, bottomEllipse);
            topEllipse.bringToFront();
            bottomEllipse.bringToFront();

            if (this.get('showBorders')) {
                line1 = this._drawLine([ellipseX - longRadius, ellipseY], [ellipseX - longRadius, ellipseY + height]);
                line2 = line1.clone();
                line2.position = new paperScope.Point(line1.position.x + (2 * longRadius), line1.position.y);
                cylinderGroup.addChildren([line1, line2]);
                cylinderGroup.strokeColor = properties.strokeColor;
                cylinderGroup.strokeWidth = properties.strokeWidth;
                bottomEllipse.children[0].children[1].strokeWidth = properties.dottedStrokeWidth || properties.strokeWidth;
            }

            cylinderGroup.position = new paperScope.Point(topEllipse.position.x, Math.round(topEllipse.position.y + height / 2));
            cylinderGroup.name = 'cylinder-group';

            //rectangle.sendToBack();
            cylinderGroup.data = 'shape';
            return cylinderGroup;
        },

        /**
        * Generates Cone Shape
        *
        * @method _generateCone
        * @private
        */
        _generateCone: function _generateCone() {

            var self = this,
                paperScope = self.get('paperScope'),
                properties = self.get('properties'),
                height = properties.height,
                radius = properties.radius,
                longRadius = radius,
                shortRadius = properties.shortRadius || radius / 4,
                baseOnTop = this.get('baseOnTop'),
                ellipseX = properties.center.x,
                ellipseY, ellipse = null, triangle = null,
                ellipseProps, unitedPath = null, ellipseChild = null, coneGroup = null,
                coneTopPoint, ellipseDotted = null;
            paperScope.activate();

            ellipseY = properties.center.y - height / 2;

            ellipseProps = {
                center: [ellipseX, ellipseY],
                radius: [longRadius, shortRadius],
                strokeColor: properties.strokeColor,
                strokeWidth: properties.strokeWidth
            };

            if (height === 0) {
                ellipseProps.radius = [0, 0];
                ellipseProps.strokeColor = '';
                ellipseProps.strokeWidth = 0;
            }

            if (baseOnTop) {
                ellipse = this._drawEllipse(ellipseProps);
                ellipseChild = ellipse;
            }
            else {
                ellipse = this._drawDottedEllipse(ellipseProps);
                ellipseChild = (ellipse.children[1]).children[1];
                ellipseDotted = ellipse.children[0].children[1];
            }

            //  leftPointForTangent = this._getTangentialPointForEllipse(ellipseChild, longRadius, shortRadius, coneTopPoint);
            //   rightPointForTangent = this._getTangentialPointForEllipse(ellipseChild);
            coneTopPoint = new paperScope.Point(ellipseX, ellipseY + height);

            triangle = new paperScope.Path(new paperScope.Point(ellipseX - longRadius, ellipseY), new paperScope.Point(ellipseX + longRadius, ellipseY), coneTopPoint);
            triangle.closed = true;

            if (baseOnTop) {
                unitedPath = triangle.unite(ellipse);
            }
            else {
                unitedPath = triangle.unite(ellipseChild);
                unitedPath.rotate(-180);
                unitedPath.position = new paperScope.Point(ellipse.position.x, ellipse.position.y - height / 2 + shortRadius / 2);
                ellipseChild.strokeColor = properties.strokeColor;
                ellipseChild.strokeWidth = properties.strokeWidth;
            }

            triangle.remove();
            unitedPath.name = 'cone-united-path';
            ellipse.name = 'cone-ellipse';

            coneGroup = new paperScope.Group(unitedPath, ellipse);
            coneGroup.position = new paperScope.Point(properties.center.x, properties.center.y + shortRadius / 2);
            //unitedPath.remove();
            //ellipse.remove();

            if (this.get('showBorders')) {
                coneGroup.strokeColor = properties.strokeColor;
                coneGroup.strokeWidth = properties.strokeWidth;
                if (ellipseDotted) {
                    ellipseDotted.strokeWidth = properties.dottedStrokeWidth || properties.strokeWidth;
                }
            }
            coneGroup.name = 'cone-group';
            coneGroup.data = 'shape';
            return coneGroup;

        },

        /**
        * Generates Double Cone Shape
        *
        * @method _generateDoubleCone
        * @private
        */
        _generateDoubleCone: function _generateDoubleCone() {
            var paperScope = this.get('paperScope'),
                properties = this.get('properties'),
                radius = properties.radius,
                shortRadius = properties.shortRadius || radius / 4,
                topCone = null, bottomCone = null, doubleConeGroup = null;
            paperScope.activate();

            properties.height /= 2;

            topCone = this._generateCone();
            topCone.name = 'bottom-cone';
            this.set('baseOnTop', !this.get('baseOnTop'));
            bottomCone = this._generateCone();
            bottomCone.name = 'top-cone';
            bottomCone.position = new paperScope.Point(topCone.position.x, topCone.position.y - properties.height - (shortRadius));
            doubleConeGroup = new paperScope.Group(topCone, bottomCone);
            doubleConeGroup.position = new paperScope.Point(properties.center.x, properties.center.y);

            if (this.get('showBorders')) {
                doubleConeGroup.strokeColor = properties.strokeColor;
                doubleConeGroup.strokeWidth = properties.strokeWidth;
            }
            doubleConeGroup.name = 'double-cone-group';
            //Reset the values changed
            properties.height *= 2;
            this.set('baseOnTop', !this.get('baseOnTop'));
            doubleConeGroup.data = 'shape';
            return doubleConeGroup;

        },

        /**
        * Sets Text to Labels based on type
        *
        * @method _setLabelTextAndPosition
        * @param line {Object} Line Paper Object on which label needs to be applied
        * @param labelsData {Object} Label Data Object
        * @param props {Object} Properties of Labels
        * @param type {String} Type of Label
        * @param defaultPosition {String} Default Position of Label
        * @private
        */
        _setLabelTextAndPosition: function _setLabelTextAndPosition(line, labelsData, props, type, defaultPosition) {

            var paperScope = this.get('paperScope'),
                labelType = labelsData.labelType || ClassName.LABELS_TYPES.DIMENSION_CONSTANT,
                labelPosition = labelsData.labelPosition || defaultPosition,
                textContent = '',
                positionTopOffset = null,
                positionLeftOffset = null,
                positionBottomOffset = null,
                positionRightOffset = null,
                point = paperScope.Point,
                label,
                textPosition,
                manager = this.get('manager'),
                textWidthAndHeight = null;
            paperScope.activate();

            switch (labelType) {

                case ClassName.LABELS_TYPES.DIMENSION_CONSTANT: {

                    manager.loadScreen('theme2-3d-shape-labels');
                    if (type === ClassName.TYPES_FOR_LABELS.RADIUS) {
                        textContent = manager.getMessage('dimension-constant-labels', 0);
                    }
                    else if (type === ClassName.TYPES_FOR_LABELS.HEIGHT) {
                        textContent = manager.getMessage('dimension-constant-labels', 1);
                    }
                    positionTopOffset = props.positionTopOffset || ClassName.LABELS_OFFSET.DIMENSION_CONSTANT_TOP_DEFAULT;
                    positionLeftOffset = props.positionLeftOffset || ClassName.LABELS_OFFSET.DIMENSION_CONSTANT_LEFT_DEFAULT;
                    positionBottomOffset = props.positionBottomOffset || ClassName.LABELS_OFFSET.DIMENSION_CONSTANT_BOTTOM_DEFAULT;
                    positionRightOffset = props.positionRightOffset || ClassName.LABELS_OFFSET.DIMENSION_CONSTANT_RIGHT_DEFAULT;
                    break;
                }

                case ClassName.LABELS_TYPES.DIMENSION_VALUES: {
                    textContent = line.length;
                    positionTopOffset = props.positionTopOffset || ClassName.LABELS_OFFSET.DIMENSION_VALUES_TOP_DEFAULT;
                    positionLeftOffset = props.positionLeftOffset || ClassName.LABELS_OFFSET.DIMENSION_VALUES_LEFT_DEFAULT;
                    positionBottomOffset = props.positionBottomOffset || ClassName.LABELS_OFFSET.DIMENSION_VALUES_BOTTOM_DEFAULT;
                    positionRightOffset = props.positionRightOffset || ClassName.LABELS_OFFSET.DIMENSION_VALUES_RIGHT_DEFAULT;
                    break;
                }

                case ClassName.LABELS_TYPES.CUSTOM: {
                    textContent = labelsData.customText;
                    positionTopOffset = props.positionTopOffset || ClassName.LABELS_OFFSET.DIMENSION_VALUES_TOP_DEFAULT;
                    positionLeftOffset = props.positionLeftOffset || ClassName.LABELS_OFFSET.DIMENSION_VALUES_LEFT_DEFAULT;
                    positionBottomOffset = props.positionBottomOffset || ClassName.LABELS_OFFSET.DIMENSION_VALUES_BOTTOM_DEFAULT;
                    positionRightOffset = props.positionRightOffset || ClassName.LABELS_OFFSET.DIMENSION_VALUES_RIGHT_DEFAULT;
                    break;
                }

            }
            textWidthAndHeight = this.get('player').getTextHeightWidth(textContent);
            switch (labelPosition) {

                case ClassName.LABELS_POSITION.TOP: {
                    textPosition = new point(line.position.x, line.position.y - (textWidthAndHeight.height / 2) - positionTopOffset);
                    break;
                }

                case ClassName.LABELS_POSITION.LEFT: {
                    textPosition = new point(line.position.x - (textWidthAndHeight.width / 2) - positionLeftOffset, line.position.y);
                    break;
                }

                case ClassName.LABELS_POSITION.BOTTOM: {
                    textPosition = new point(line.position.x, line.position.y + (textWidthAndHeight.height / 2) + positionBottomOffset);
                    break;
                }

                case ClassName.LABELS_POSITION.RIGHT: {
                    textPosition = new point(line.position.x + (textWidthAndHeight.width / 2) + positionRightOffset, line.position.y);
                    break;
                }
            }

            props.point = textPosition;
            if (textContent !== null) {
                props.content = textContent;
            }
            props.justification = props.justification || 'center';
            props.fontFamily = props.fontFamily || 'Montserrat';
            props.fontSize = props.fontSize || 14;
            props.fillColor = props.fillColor || '#FFFFFF';
            props.strokeColor = props.strokeColor || '#FFFFFF';
            label = new paperScope.PointText(props);

            return label;

        },

        //To Do
        /**
       * Calculate the Tangential Point to the Ellipse
       *
       * @method _getTangentialPointForEllipse
       * @private

        _getTangentialPointForEllipse: function _getTangentialPointForEllipse(ellipse, a, b, coneTopPoint) {

            var paperScope = this.get('paperScope'),
                c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)),
                f1 = new paperScope.Point(ellipse.center.x - c, ellipse.center.y),
                f2 = new paperScope.Point(ellipse.center.x + c, ellipse.center.y),
                x0, y0, m1, m2;

        },

         */

        /**
       * Draws The ellipse needed for CrossSection and Base of Cone and Cylinder
       *
       * @method _drawEllipse
       * @param properties {Object} Ellipse Properties
       * @private
       */
        _drawEllipse: function _drawEllipse(properties) {

            var ellipse = null,
                self = this,
                paperScope = self.get('paperScope');
            paperScope.activate();

            ellipse = new paperScope.Path.Ellipse(properties);
            ellipse = this._refineFloatValues(ellipse);

            return ellipse;
        },

        /**
        * Draws The ellipse needed for CrossSection and Base of Cone and Cylinder
        *
        * @method _drawRectangle
        * @param properties {Object} Rectangle Properties
        * @private
        */
        _drawRectangle: function _drawRectangle(properties) {

            var rectangle = null,
                self = this,
                paperScope = self.get('paperScope');
            paperScope.activate();

            rectangle = new paperScope.Path.Rectangle(properties);
            rectangle = this._refineFloatValues(rectangle);

            return rectangle;
        },

        /**
        * Refines float values of coordinates of points in path.
        *
        * @method _initializeDirectionText
        * @param path {Object} paper Path to be refined.
        * @private
        **/
        _refineFloatValues: function _refineFloatValues(path) {
            $.each(path._segments, function () {
                var temp = this._point._x;
                this._point._x = parseFloat(temp.toFixed(1));
                temp = this._point._y;
                this._point._y = parseFloat(temp.toFixed(1));
            });
            return path;
        },

        /**
        * Calls the _setCrossSectionProperties based on the Data
        *
        * @method _setCrossSection
        * @private
        */
        _setCrossSection: function _setCrossSection() {

            if (this.get('crossSection') === true) {
                var crossSectionData = this.get('crossSectionData'),
                    crossSectionDataLength = crossSectionData.length;
                for (var i = 0; i < crossSectionDataLength; i++) {
                    this._setCrossSectionProperties(crossSectionData[i]);
                }
            }
        },

        /**
        * Sets the CrossSecion based on the Data
        *
        * @method _setCrossSectionProperties
        * @param crossSectionData {Object} CrossSection Data
        * @private
        */
        _setCrossSectionProperties: function _setCrossSectionProperties(crossSectionData) {

            var crossSectionPosition = crossSectionData.position;

            if (crossSectionPosition <= 0 || crossSectionPosition >= 100) {
                return;
            }

            var props = this.get('properties'),
                paperScope = this.get('paperScope'),
                properties = null,
                shape = this.getShape(),
                shapeBounds = shape.bounds,
                shapeWidth = shapeBounds.width,
                shortRadiusOfBase = props.shortRadius || shapeWidth / 8,
                positionY = null,
                shiftOffset = null,
                positionOffset = null,
                radius = null,
                shortRadius = null,
                crossSection = null;

            paperScope.activate();


            switch (this.get('type')) {
                case ClassName.TYPES.CYLINDER: {

                    radius = props.width / 2;
                    positionOffset = ((crossSectionPosition * (props.height)) / 100);
                    //Take Top Ellipse's Top
                    positionY = shape.getItems({ name: 'top-ellipse' })[0].bounds.top + positionOffset + shortRadiusOfBase;
                    break;
                    //     heightOffset = Math.abs(shape.position.y - positionY);
                }

                case ClassName.TYPES.CONE: {
                    positionOffset = ((crossSectionPosition * (props.height)) / 100);
                    positionY = shapeBounds.top + positionOffset;
                    //  heightOffset = Math.abs(shape.position.y - positionY);

                    radius = this._getRadiusForCrossSectionInCone(shapeWidth / 2, props.height, positionOffset, (crossSectionData.strokeWidth || 1));
                    break;
                }
                case ClassName.TYPES.SPHERE: {
                    shiftOffset = shortRadiusOfBase / 10;
                    if (crossSectionPosition <= 50) {
                        crossSectionPosition = 50 - crossSectionPosition;
                        positionOffset = ((crossSectionPosition * (props.radius - (shiftOffset)) * 2) / 100);
                        positionY = shapeBounds.center.y - positionOffset;
                    }
                    else {
                        crossSectionPosition = crossSectionPosition - 50;
                        positionOffset = ((crossSectionPosition * (props.radius - (shiftOffset)) * 2) / 100);
                        positionY = shapeBounds.center.y + positionOffset;
                    }

                    //       positionOffset = ((crossSectionPosition * (shapeHeight - (2 * shiftOffset))) / 100);
                    //      positionY = shapeBounds.top + shiftOffset + positionOffset;
                    //      heightOffset = Math.abs(shape.position.y - positionY);

                    radius = this._getRadiusForCrossSectionInSphere(props.radius, positionOffset, (crossSectionData.strokeWidth || 1));

                    //if (crossSectionPosition > 50) {
                    //    positionY -= shiftOffset;
                    //}
                    //else {
                    //    positionY += shiftOffset;
                    //}
                    break;
                }

                case ClassName.TYPES.DOUBLECONE: {
                    if (crossSectionPosition <= 50) {
                        crossSectionPosition = 50 - crossSectionPosition;
                        positionOffset = ((crossSectionPosition * (props.height)) / 100);
                        positionY = shapeBounds.center.y - positionOffset;
                        //    positionY = props.height / 2 - positionY;
                    }
                    else {
                        crossSectionPosition = crossSectionPosition - 50;
                        positionOffset = ((crossSectionPosition * (props.height)) / 100);
                        positionY = shapeBounds.center.y + positionOffset;
                    }

                    //  heightOffset = Math.abs(shape.position.y - positionY);

                    radius = this._getRadiusForCrossSectionInCone(shapeWidth / 2, (props.height) / 2, positionOffset, (crossSectionData.strokeWidth || 1));
                    break;
                }
            }



            shortRadius = (props.shortRadius ? ((radius * shortRadiusOfBase) / (shapeWidth / 2)) : (radius / 4));

            //if (this.get('type') !== ClassName.TYPES.CYLINDER && shortRadius !== 0) {
            //shortRadius -= (2 * (crossSectionData.strokeWidth || 1));
            //}

            properties = {
                center: [shape.position.x, positionY],
                radius: [radius, shortRadius],
                strokeColor: crossSectionData.strokeColor,
                strokeWidth: crossSectionData.strokeWidth || 1,
                fillColor: crossSectionData.fillColor,
                opacity: crossSectionData.opacity
            };

            switch (crossSectionData.crossSectionType) {

                case ClassName.CROSSSECTION_TYPES.FULLSOLID:
                    crossSection = this._drawEllipse(properties);
                    break;

                case ClassName.CROSSSECTION_TYPES.FULLDOTTED:
                    properties.dashArray = this.dashedLineData;
                    crossSection = this._drawEllipse(properties);
                    break;

                case ClassName.CROSSSECTION_TYPES.CLIPPED:
                    crossSection = this._drawDottedEllipse(properties, crossSectionData.dottedFrom, crossSectionData.dottedTo);
                    break;

                case ClassName.CROSSSECTION_TYPES.CUSTOM:
                    properties = crossSectionData.properties;
                    crossSection = this._drawEllipse(properties);
                    break;

                case ClassName.CROSSSECTION_TYPES.HALFDOTTED:
                default:
                    crossSection = this._drawDottedEllipse(properties);
                    break;

            }
            if (crossSection) {
                crossSection.name = 'cross-section-' + crossSectionData.position;
                crossSection.bringToFront();
            }
            else {
                return;
            }

            if (crossSectionData.isShapeCut === true) {
                var clippedShape = null,
                    clipRect = null,
                    excludedShape = null;

                shape.children[0] = this._refineFloatValues(shape.children[0]);


                excludedShape = shape.children[0].exclude(crossSection);
                clipRect = this._drawRectangle({
                    point: [shape.position.x - shapeWidth / 2, positionY],
                    size: [shapeWidth, shape.bounds.bottom - positionY]
                });

                clippedShape = new paperScope.Group(clipRect, excludedShape);
                clippedShape.clipped = true;

                var newUniteGroup = new paperScope.Group(clippedShape, crossSection);
                shape.children[0].remove();
                shape.insertChild(0, newUniteGroup);
                //    shape.children[0] = newUniteGroup;
            }
            else {
                shape.addChild(crossSection);
            }
        },

        /**
        * Draws Dotted Ellipse
        *
        * @method _drawDottedEllipse
        * @param properties {Object} Properties of Ellipse
        * @param from {Point} Starting Point on Ellipse For Dotted to Start
        * @param to {Point} Ending Point on Ellipse For Dotted to End
        * @private
        */
        _drawDottedEllipse: function _drawDottedEllipse(properties, from, to) {

            var ellipse = null,
                dottedEllipse = null,
                props = this.get('properties');

            ellipse = this._drawEllipse(properties);
            dottedEllipse = ellipse.clone();
            from = from || ellipse.bounds.leftCenter;
            to = to || ellipse.bounds.rightCenter;

            dottedEllipse.dashArray = this.dashedLineData;
            dottedEllipse.opacity = properties.opacity || props.ellipseOpacity || 1;
            dottedEllipse.strokeWidth = props.dottedStrokeWidth || ellipse.strokeWidth;

            return this._clipEllipseForCrossSection(from, to, ellipse, dottedEllipse);

        },

        /**
       * Returns the CrossSection Radius in a Sphere
       *
       * @method _getRadiusForCrossSectionInSphere
       * @param radius {Number} Radius of Sphere
       * @param heightOffset {Number} Height Offset of CrossSection from center of Sphere
       * @private
       */
        _getRadiusForCrossSectionInSphere: function _getRadiusForCrossSectionInSphere(radius, heightOffset, strokeWidth) {
            return Math.sqrt(Math.pow((radius - strokeWidth), 2) - Math.pow(heightOffset, 2)) ;
        },

        /**
        * Returns the CrossSection Radius in a Cone
        *
        * @method _getRadiusForCrossSectionInCone
        * @param radius {Number} Radius of Cone
        * @param height {Number} Height of Cone
        * @param heightOffset {Number} Height Offset of CrossSection from center of Cone
        * @private
        */
        _getRadiusForCrossSectionInCone: function _getRadiusForCrossSectionInCone(radius, height, heightOffset, strokeWidth) {
            var constant = (radius - strokeWidth)/ height,
                newRadius = (constant * heightOffset) ;

            return newRadius;
        },

        /**
        * Function for Clipping the CrossSection with type CLIPPED
        *
        * @method _clipEllipseForCrossSection
        * @param from {Point} Starting Point on Ellipse For Clipping
        * @param to {Point} Ending Point on Ellipse For Clipping
        * @param ellipse {Number} Ellipse Paper Object
        * @param dottedEllipse {Number} Dotted Ellipse Paper Object
        * @private
        */
        _clipEllipseForCrossSection: function _clipEllipseForCrossSection(from, to, ellipse, dottedEllipse) {

            var clippedGroup = null,
                paperScope = this.get('paperScope'),
                strokeWidth = this.get('properties').strokeWidth || 2,
                // clippingLine = this._drawLine(from, to),
                // intersections = ellipse.getIntersections(clippingLine),
                ellipseLargeRadius = ellipse.bounds.width / 2,
                upperRectangle = null, lowerRectangle = null,
                upperPath = null, lowerPath = null, upperGroup = null, lowerGroup = null;

            upperRectangle = new paperScope.Rectangle(new paperScope.Point(ellipse.position.x - ellipseLargeRadius - strokeWidth, from.y), new paperScope.Size(2 * (ellipseLargeRadius + strokeWidth), Math.round(ellipse.bounds.top - from.y) - strokeWidth));
            upperPath = new paperScope.Path.Rectangle(upperRectangle);
            //  upperPath.strokeColor = 'red';

            lowerRectangle = new paperScope.Rectangle(new paperScope.Point(ellipse.position.x - ellipseLargeRadius - strokeWidth, from.y), new paperScope.Size(2 * (ellipseLargeRadius + strokeWidth), Math.round(ellipse.bounds.bottom - from.y) + strokeWidth));
            lowerPath = new paperScope.Path.Rectangle(lowerRectangle);
            //   lowerPath.strokeColor = 'black';

            upperGroup = new paperScope.Group(upperPath, dottedEllipse);
            upperGroup.clipped = true;
            upperGroup.name = 'dotted-group';

            lowerGroup = new paperScope.Group(lowerPath, ellipse);
            lowerGroup.clipped = true;
            lowerGroup.name = 'solid-group';

            //upperGroup.sendToBack();
            //lowerGroup.bringToFront();

            clippedGroup = new paperScope.Group(upperGroup, lowerGroup);
            clippedGroup.name = 'clipped-group';

            //upperPath.remove();
            //lowerPath.remove();
            //dottedEllipse.remove();
            //ellipse.remove();
            //upperGroup.remove();
            //lowerGroup.remove();

            return clippedGroup;

        },

        /**
        * Draws Labels
        *
        * @method _drawLabels
        * @private
        */
        _drawLabels: function _drawLabels() {

            var shape = this.getShape(),
                props = this.get('properties'),
                paperScope = this.get('paperScope'),
                labelsData = this.get('labelsData'),
                radiusData = labelsData.radius,
                heightData = labelsData.height,
                shapeBounds = shape.bounds,
                shapeWidth = shapeBounds.width,
                lineProperties,
                textProperties,
                strokeWidth = props.strokeWidth || 2,
                centerPoint,
                centerProperties,
                radiusLine, radiusLineLabel,
                heightLine, heightLineLabel,
                type, labelsGroup = new paperScope.Group(), radiusLabelsGroup, heightLabelsGroup,
                defaultPosition, position,
                height, width, positionOffset,
                positionX, positionY, shortRadius,
                lineFrom, lineTo, offsetForCone = 0;
            paperScope.activate();

            if (radiusData) {
                if (radiusData.show !== false) {
                    position = radiusData.linePosition;

                    if (radiusData.from && radiusData.to) {
                        lineFrom = radiusData.from;
                        lineTo = radiusData.to;
                    }
                    else {
                        height = props.height || (2 * props.radius);        //radius for sphere
                        positionOffset = (((50 - position) * (height)) / 100);

                        if ((this.get('type') === ClassName.TYPES.CONE)) {
                            shortRadius = props.shortRadius || shapeWidth / 8;
                            positionOffset += shortRadius / 2;
                        }

                        positionX = shapeBounds.center.x;
                        positionY = shapeBounds.center.y - positionOffset;
                        lineFrom = [positionX, positionY];
                        lineTo = [positionX + shapeWidth / 2 - strokeWidth, positionY];
                    }

                    lineProperties = radiusData.lineProperties;
                    textProperties = radiusData.textProperties;
                    centerProperties = radiusData.centerProperties;
                    defaultPosition = ClassName.LABELS_POSITION.TOP;
                    type = ClassName.TYPES_FOR_LABELS.RADIUS;

                    radiusLine = this._drawLine(lineFrom, lineTo, lineProperties);
                    radiusLine.name = 'radius-line';

                    radiusLabelsGroup = new paperScope.Group(radiusLine);

                    if (radiusData.showPointText !== false) {
                        radiusLineLabel = this._setLabelTextAndPosition(radiusLine, radiusData, textProperties, type, defaultPosition);
                        radiusLineLabel.name = 'radius-point-text';
                        radiusLabelsGroup.addChild(radiusLineLabel);
                    }

                    if (centerProperties) {
                        centerPoint = new paperScope.Path.Circle(lineFrom, centerProperties.radius);
                        centerPoint.fillColor = centerProperties.fillColor;
                        radiusLabelsGroup.addChild(centerPoint);
                    }

                    radiusLabelsGroup.name = 'radius-labels-group';
                    labelsGroup.addChild(radiusLabelsGroup);
                    radiusLine.bringToFront();
                    if (radiusLineLabel) {
                        radiusLineLabel.bringToFront();
                    }
                }
            }

            if (heightData) {
                if (heightData.show !== false) {
                    position = heightData.linePosition;


                    if (heightData.from && heightData.to) {
                        lineFrom = heightData.from;
                        lineTo = heightData.to;
                    }
                    else {
                        width = props.width || (2 * props.radius);
                        height = props.height || (2 * props.radius);//radius for sphere
                        positionOffset = (((50 - position) * (width)) / 100);

                        if ((this.get('type') === ClassName.TYPES.CONE)) {
                            shortRadius = props.shortRadius || shapeWidth / 8;
                            offsetForCone = shortRadius / 2;
                        }

                        positionX = shapeBounds.center.x - positionOffset;
                        positionY = shapeBounds.center.y - height / 2 - offsetForCone;
                        lineFrom = [positionX, positionY];
                        lineTo = [positionX, positionY + height];
                    }

                    lineProperties = heightData.lineProperties;
                    textProperties = heightData.textProperties;
                    defaultPosition = ClassName.LABELS_POSITION.LEFT;
                    type = ClassName.TYPES_FOR_LABELS.HEIGHT;
                    heightLine = this._drawLine(lineFrom, lineTo, lineProperties);
                    heightLine.name = 'height-line';
                    heightLabelsGroup = new paperScope.Group(heightLine);

                    if (heightData.showPointText !== false) {
                        heightLineLabel = this._setLabelTextAndPosition(heightLine, heightData, textProperties, type, defaultPosition);
                        heightLineLabel.name = 'height-point-text';
                        heightLabelsGroup.addChild(heightLineLabel);
                    }

                    heightLabelsGroup.name = 'height-labels-group';
                    labelsGroup.addChild(heightLabelsGroup);
                    heightLine.bringToFront();
                    if (heightLineLabel) {
                        heightLineLabel.bringToFront();
                    }
                }
            }


            labelsGroup.name = 'labels-group';
            var masterGroup = this.getMasterGroup();
            masterGroup.addChild(labelsGroup);
            paperScope.view.draw();
        },

        /**
        * Draws Line
        *
        * @method _drawLine
        * @param from {Point} Starting Point of Line
        * @param to {Point} Ending Point of Line
        * @param props {Number} Line Properties
        * @private
        */
        _drawLine: function _drawLine(from, to, props) {
            var paperScope = this.get('paperScope'),
                strokeColor,
                strokeWidth,
                line = null;
            paperScope.activate();

            if (props !== undefined) {
                strokeColor = props.strokeColor;
                strokeWidth = props.strokeWidth;
            }
            else {
                strokeColor = this.get('properties').strokeColor;
                strokeWidth = 2;
            }

            line = new paperScope.Path.Line({
                from: from,
                to: to,
                strokeColor: strokeColor,
                strokeWidth: strokeWidth
            });

            return line;
        },

        /**
        *  Removes The Shape from Scope
        *
        * @method _removeShape
        * @private
        */
        _removeShape: function _removeShape() {
            //this._emptyGroup(this.getMasterGroup());
            var masterGroup = this.getMasterGroup();
            if (masterGroup) {
                masterGroup.removeChildren();
                masterGroup.remove();
            }
        },

        //_emptyGroup: function _emptyGroup(grp) {
        //    var child = null;
        //    if (grp) {
        //        for (var x = grp.children.length - 1; x >= 0 ; x--) {
        //            child = grp.children[x];
        //            if (child instanceof this.get('paperScope').Group) {
        //                this._emptyGroup(child);
        //            } else {
        //                child.remove();
        //            }
        //        }
        //    }
        //},

        /*************************************END OF PRIVATE FUNCTIONS*********************************************************/

        /*************************************START OF PUBLIC FUNCTIONS*********************************************************/

        /**
        *  Sets The Gradient of the Shape
        *
        * @method setGradient
        * @param shape {Object} Paper Object Shape
        * @param shapeProperties {Object} Properties of Shape to set gradient
        * @public
        */
        setGradient: function setGradient(shape, shapeProperties) {

            var shape = shape || this.getShape(),
                paperScope = this.get('paperScope'),
                gradientColor = this.get('gradientColor'),
                gradientColorLength = gradientColor.length,
                shapeOpacity = this.get('shapeOpacity'),
                gradientData = this.get('gradientData'),
                gradientStops = this.get('gradientStops'),
                radialGradient = this.get('radialGradient');
            paperScope.activate();

            if (shapeProperties) {
                gradientColor = shapeProperties.gradientColor || gradientColor;
                gradientColorLength = gradientColor.length;
                shapeOpacity = shapeProperties.shapeOpacity || shapeOpacity;
                gradientData = shapeProperties.gradientData || gradientData;
                gradientStops = shapeProperties.gradientStops || gradientStops;
                radialGradient = shapeProperties.radialGradient || radialGradient;
            }

            if (gradientColor != null) {
                if (this.get('applyGradient') === true) {

                    if (gradientData != null) {
                        shape.fillColor = gradientData;
                    }
                    else {

                        var radius = shape.bounds.width / 2,
                            radial = !(radialGradient === null || radialGradient === undefined) ? radialGradient : this.get('type') === ClassName.TYPES.SPHERE,
                            stops = [],
                            destination, origin;

                        if (radial) {
                            origin = new paperScope.Point(shape.position.x + radius / 4, shape.position.y - radius / 4);
                            destination = shape.bounds.leftCenter;
                        }
                        else {
                            origin = shape.bounds.leftCenter;
                            destination = shape.bounds.rightCenter;
                        }

                        for (var i = 0; i < gradientColorLength; i++) {
                            stops.push(new Array(gradientColor[i], gradientStops[i]));
                        }

                        //Default
                        // Fill the path with a radial gradient color with three stops

                        shape.fillColor = {
                            gradient: {
                                stops: stops,
                                radial: radial
                            },
                            origin: origin,
                            destination: destination
                        };
                    }
                }
                else {
                    shape.fillColor = gradientColor[0];
                }

                shape.opacity = shapeOpacity;
            }
            paperScope.view.draw();
        },

        /**
       * Updates the Shape based on the Properties
       *
       * @method updatePropertiesOfShape
       * @param props {Object} Properties of Shape which needs to be set in the model
       * @public
       */
        updatePropertiesOfShape: function updatePropertiesOfShape(props) {
            var properties = this.get('properties');
            this._removeShape();
            this.set('properties', $.extend({}, properties, props));
            this._selectAndCreateShape();
        },

        /**
      * Updates the Labels Data of Shape
      *
      * @method updateLabelsData
      * @param labelsData {Object} Label Data
      * @public
      */
        updateLabelsData: function updateLabelsData(labelsData) {

            var labelsDataOfModel = this.get('labelsData'),
                radiusDataOfModel = labelsDataOfModel.radius,
                heightDataOfModel = labelsDataOfModel.height,
                radiusData,
                heightData;

            if (labelsData) {
                var rData, hData;

                radiusData = labelsData.radius;
                heightData = labelsData.height;

                if (radiusData) {
                    rData = $.extend({}, radiusDataOfModel, radiusData);
                }
                else {
                    rData = radiusDataOfModel;
                }
                if (heightData) {
                    hData = $.extend({}, heightDataOfModel, heightData);
                }
                else {
                    hData = heightDataOfModel;
                }
                this.set('labelsData', new Object({
                    'radius': rData,
                    'height': hData
                }));
            }
            this._removeShape();
            this._selectAndCreateShape();
        },


        /**
        * Adds a CrossSection in the Shape based on the Properties
        *
        * @method addCrossSection
        * @param crossSectionData {Object} CrossSection Data
        * @public
        */
        addCrossSection: function addCrossSection(crossSectionData) {
            this._setCrossSectionProperties(crossSectionData);
        },

        /**
        * Removes the CrossSection at particular Position
        *
        * @method removeCrossSection
        * @param position {Number} CrossSection Position
        * @param child {Number} Optional Parameter if 2 or more  CrossSection exists at a position
        * @public
        */
        removeCrossSection: function removeCrossSection(position, child) {

            var shape = this.getShape(),
                shapeCrossSectionArr = shape.getItems({ 'name': 'cross-section-' + position }),
                paperScope = this.get('paperScope'),
                shapeCrossSectionArrLength = shapeCrossSectionArr.length;
            paperScope.activate();

            if (child) {
                if (shapeCrossSectionArr[child]) {
                    shapeCrossSectionArr[child].remove();
                }
            }
            else {
                for (var i = 0; i < shapeCrossSectionArrLength; i++) {
                    shapeCrossSectionArr[i].remove();
                }
            }
            paperScope.view.draw();

        },

        /**
       * Public Fucntion to Draw Line
       *
       * @method drawLine
       * @param props {Obeject} Properties to Draw Line
       * @public
       */
        drawLine: function drawLine(props) {

            var paperScope = this.get('paperScope'),
                line = null;
            paperScope.activate();

            line = new paperScope.Path.Line(props);
            return line;
        },

        /**
        * Public Fucntion to Remove Shape
        *
        * @method removeShape
        * @public
        */
        removeShape: function removeShape() {
            this._removeShape();
        },


        /****************************************************END OF PUBLIC FUNCTIONS*****************************************/



        /********************************************************GETTER SETTERS*********************************************/

        /**
        * Returns the master Group
        *
        * @method getMasterGroup
        * @public
        */
        getMasterGroup: function getMasterGroup() {
            return this.get('masterGroup');
        },

        /**
        * Returns the Shape
        *
        * @method getShape
        * @public
        */
        getShape: function getShape() {
            var masterGroup = this.getMasterGroup();
            if (masterGroup) {
                return masterGroup.getItems({ data: 'shape' })[0];
            }
        },

        /**
        * Returns the Labels Group
        *
        * @method getLabelsGroup
        * @public
        */
        getLabelsGroup: function getLabelsGroup() {
            var masterGroup = this.getMasterGroup();
            if (masterGroup) {
                return masterGroup.getItems({ name: 'labels-group' })[0];
            }
        },

        /**
        * Returns the Radius Labels Group
        *
        * @method getRadiusLabelGroup
        * @public
        */
        getRadiusLabelGroup: function getRadiusLabelGroup() {
            var labelsGroup = this.getLabelsGroup();
            if (labelsGroup) {
                return labelsGroup.getItems({ name: 'radius-labels-group' })[0];
            }
        },

        /**
        * Returns the Height Label Group
        *
        * @method getHeightLabelGroup
        * @public
        */
        getHeightLabelGroup: function getHeightLabelGroup() {
            var labelsGroup = this.getLabelsGroup();
            if (labelsGroup) {
                return labelsGroup.getItems({ name: 'height-labels-group' })[0];
            }
        },

        /**
        * Returns the CrossSection at a position
        *
        * @method getCrossSection
        * @param position {Number} CrossSection Position
        * @param child {Number} Optional Parameter if 2 or more  CrossSection exists at a position
        * @public
        */
        getCrossSection: function getCrossSection(position, child) {

            var shape = this.getShape(),
                shapeCrossSectionArr = shape.getItems({ 'name': 'cross-section-' + position }),
                shapeCrossSectionArrLength = shapeCrossSectionArr.length;

            if (shapeCrossSectionArrLength !== 0) {
                if (shapeCrossSectionArr[child]) {
                    return shapeCrossSectionArr[child];
                }
                else {
                    if (shapeCrossSectionArrLength === 1) {
                        return shapeCrossSectionArr[0];
                    }
                    else {
                        return shapeCrossSectionArr;
                    }
                }

            }
        }

        /************************************************END OF GETTER SETTERS*********************************************/

    },
    {

        /**
        * Constructor for Model - Returns an instance of Model
        *
        * @method generate3DShapeModel
        * @param props      {ObjecProperties of Model
        *                         @public
        */
        generate3DShapeModel: function generate3DShapeModel(props) {
            return new MathInteractives.Common.Components.Models.Shape3D(props);
        },

        /**
        * Type Of Shape
        *
        * @property TYPES
        * @public
        * @static
        * @namespace MathInteractives.Common.Components.Models.Shape3D
        */
        TYPES: {
            SPHERE: 'sphere',
            CYLINDER: 'cylinder',
            CONE: 'cone',
            DOUBLECONE: 'doublecone',
            ELLIPSE: 'ellipse'
        },

        /**
        * CrossSection Types Of Shape
        *
        * @property CROSSSECTION_TYPES
        * @public
        * @static
        * @namespace MathInteractives.Common.Components.Models.Shape3D
        */
        CROSSSECTION_TYPES: {
            HALFDOTTED: 'halfdotted',
            FULLDOTTED: 'fulldotted',
            FULLSOLID: 'fullsolid',
            CLIPPED: 'clipped',
            CUSTOM: 'custom'
        },

        /**
        * Labels Type
        *
        * @property LABELS_TYPES
        * @public
        * @static
        * @namespace MathInteractives.Common.Components.Models.Shape3D
        */
        LABELS_TYPES: {
            DIMENSION_VALUES: 'dimension-values',
            DIMENSION_CONSTANT: 'dimension-constant',
            CUSTOM: 'custom'
        },

        /**
        * Labels Position
        *
        * @property LABELS_POSITION
        * @public
        * @static
        * @namespace MathInteractives.Common.Components.Models.Shape3D
        */
        LABELS_POSITION: {
            TOP: 'top',
            LEFT: 'left',
            BOTTOM: 'bottom',
            RIGHT: 'right'
        },

        /**
        * Labels Offset
        *
        * @property LABELS_OFFSET
        * @public
        * @static
        * @namespace MathInteractives.Common.Components.Models.Shape3D
        */
        LABELS_OFFSET: {
            DIMENSION_VALUES_BOTTOM_DEFAULT: 8,
            DIMENSION_VALUES_TOP_DEFAULT: -1,
            DIMENSION_VALUES_LEFT_DEFAULT: 5,
            DIMENSION_VALUES_RIGHT_DEFAULT: 5,
            DIMENSION_CONSTANT_TOP_DEFAULT: -1,
            DIMENSION_CONSTANT_LEFT_DEFAULT: 6,
            DIMENSION_CONSTANT_BOTTOM_DEFAULT: 5,
            DIMENSION_CONSTANT_RIGHT_DEFAULT: 5.5
        },


        /**
        * Types Of Labels
        *
        * @property TYPES_FOR_LABELS
        * @public
        * @static
        * @namespace MathInteractives.Common.Components.Models.Shape3D
        */
        TYPES_FOR_LABELS: {
            RADIUS: 'radius',
            HEIGHT: 'height'
        }
    });

    ClassName = MathInteractives.Common.Components.Models.Shape3D;
})(MathInteractives);
