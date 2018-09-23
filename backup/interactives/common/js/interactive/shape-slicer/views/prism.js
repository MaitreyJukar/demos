(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Views.Prism) {
        return;
    }
    var eventManagerModel = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer.EVENT_MANAGER_MODEL,
        className = null;
    /*
	*
	*   [[D E S C R I P T I O N]]
	*	
	* @class Prism
	* @namespace MathInteractives.Interactivities.ShapeSlicer.Views
    * @extends  MathInteractives.Common.Interactivities.ShapeSlicer.Views.Base
	* @constructor
	*/
    MathInteractives.Common.Interactivities.ShapeSlicer.Views.Prism = MathInteractives.Common.Player.Views.Base.extend({

        scene: null,

        frontScene: null,

        camera: null,

        mouseVector: null,

        projector: null,

        ray: null,

        controls: null,

        parent: null,

        crossSection: null,

        outlineMesh: null,

        name: null,

        prism: null,

        prismSphereGroup: null,

        prismHexagonGroup: null,

        selectedSphereGroup: null,

        hexagonLines: null,

        eventManager: null,

        initialize: function (options) {
            this.parent = options.parent;
            this.name = options.name;
            this.eventManager = options.eventManager;
            className = MathInteractives.Common.Interactivities.ShapeSlicer.Views.Prism;
            this.parent.initializeThreeJS(this);
            this.render();
            this.attachEventListeners();
        },

        render: function render() {
            this._createPrism();
        },

        attachEventListeners: function attachEventListeners() {
            var self = this;

            this.model.on('change:pointsArr', $.proxy(self._createCrossSectionForPrism, self));
            this.eventManager.on(eventManagerModel.CREATE_CROSSSECTION, $.proxy(self._createCrossSectionForPrism), self);
        },

        _createPrism: function _createPrism() {

            this.prism = this._generatePrism();
            this.scene.add(this.prism);
            this._addHexagonToPrism();
            this._addDummyPrismLines();

        },

        _generatePrism: function _generatePrism() {


            var material, prism,
                radius = this.model.get('radius'),
                height = this.model.get('height'),
                materialDetails = this.parent.getMaterialDetails(),
                radiusSegments = this.model.get('radiusSegments'),
                heightSegments = this.model.get('heightSegments');

            material = new THREE.MeshBasicMaterial({
                color: materialDetails.COLOR,
                wireframe: false,
                transparent: true,
                opacity: materialDetails.OPACITY,
                depthWrite: false
            });

            prism = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, radiusSegments, heightSegments, false), material);

            return prism;

        },

        _addHexagonToPrism: function _addHexagonToPrism() {


            var position = className.HEXAGON_POSITION,
                 positionLength = position.length,
            prism = this.prism,
            prismPosition = prism.position,
            radius = this.model.get('radius'),
            hexagon = [], height = this.model.get('height'),
            positionOffset, drawLine = false;

            this.prismSphereGroup = new THREE.Object3D();
            this.prismHexagonGroup = new THREE.Object3D();
            this.selectedSphereGroup = new THREE.Object3D();

            for (var i = 0; i < positionLength; i++) {

                positionOffset = (((50 - position[i]) * (height)) / 100);

                hexagon[i] = this.parent.drawPolygon(this.model.get('numberOfPolygonSides'), radius);
                hexagon[i].rotation.x = this.parent.angleToRadians(90);

                hexagon[i].position.set(prismPosition.x, prismPosition.y + positionOffset, prismPosition.z);

                this.prismHexagonGroup.add(hexagon[i]);

                if (i === (positionLength - 1)) {
                    drawLine = true;
                }

                this._addSpheresToPrism(hexagon[i], drawLine, position[i]);
            }

            this.scene.add(this.prismHexagonGroup);
            this.scene.add(this.prismSphereGroup);
            this.frontScene.add(this.selectedSphereGroup);

        },

        _addSpheresToPrism: function _addSpheresToPrism(hexagon, drawLine, hexagonPosition) {

            var to, from,
                sphereOfPrism = [],
                self = this,
                hexagonRadius = this.model.get('radius'),
                height = this.model.get('height'), line,
                numberOfClickableSpheres = this.model.get('numberOfClickableSpheres'),
                angle = this.parent.angleToRadians(360 / numberOfClickableSpheres),
                sinFactor = Math.sin(angle), fromVector, toVector, line3,
                cosFactor = Math.cos(angle),
                hexagonPos = hexagon.position,
                spherePosition = [{
                    x: hexagonPos.x,
                    y: hexagonPos.y,
                    z: hexagonPos.z - hexagonRadius
                },
                  {
                      x: hexagonPos.x + sinFactor * hexagonRadius,
                      y: hexagonPos.y,
                      z: hexagonPos.z - cosFactor * hexagonRadius
                  },
              {
                  x: hexagonPos.x + sinFactor * hexagonRadius,
                  y: hexagonPos.y,
                  z: hexagonPos.z + cosFactor * hexagonRadius
              },
                {
                    x: hexagonPos.x,
                    y: hexagonPos.y,
                    z: hexagonPos.z + hexagonRadius
                },

             {
                 x: hexagonPos.x - sinFactor * hexagonRadius,
                 y: hexagonPos.y,
                 z: hexagonPos.z + cosFactor * hexagonRadius
             },
            {
                x: hexagonPos.x - sinFactor * hexagonRadius,
                y: hexagonPos.y,
                z: hexagonPos.z - cosFactor * hexagonRadius
            }
                ];

            for (var i = 0; i < numberOfClickableSpheres; i++) {
                sphereOfPrism[i] = this.parent.generateClickableSphere();
                sphereOfPrism[i].position.set(spherePosition[i].x, spherePosition[i].y, spherePosition[i].z);
                sphereOfPrism[i].id = 'sphere-' + i + '-position-' + hexagonPosition;
                sphereOfPrism[i].name = 'sphere-' + i + '-position-' + hexagonPosition + '-face-' + i + '-face-' + ((i - 1 + numberOfClickableSpheres) % numberOfClickableSpheres);

                this.prismSphereGroup.add(sphereOfPrism[i]);//add a mesh with geometry to it


                if (drawLine === true) {
                    from = {
                        x: spherePosition[i].x,
                        y: spherePosition[i].y + height,
                        z: spherePosition[i].z
                    }
                    to = {
                        x: spherePosition[i].x,
                        y: spherePosition[i].y,
                        z: spherePosition[i].z
                    }
                    line = this.parent.drawLines(from, to);
                    this.scene.add(line);
                }
            }

        },

        _addDummyPrismLines: function _addDummyPrismLines() {

            var numberOfLines = this.model.get('numberOfDummyLines'),
            line,
            toVector, to, from, fromVector,
            prismHexagonChildren = this.prismHexagonGroup.children,
            prismHexagonChildrenLength = prismHexagonChildren.length,
            prismHexagon = prismHexagonChildren[prismHexagonChildrenLength - 1],
            prismHexagonPosition = prismHexagon.position,
            prismTopHexagon = prismHexagonChildren[0],
            prismTopHexagonPosition = prismTopHexagon.position, x, z,
            initialY = prismTopHexagonPosition.y,
            initialZ = prismTopHexagonPosition.z, zRadius, theta,
            finalY = prismHexagonPosition.y,
            finalZ = prismHexagonPosition.z,
            vector = new THREE.Vector3(),
            newPoint = new THREE.Vector3(),
            prismSphereGroup = this.prismSphereGroup,
            prismSphereGroupChildren = prismSphereGroup.children,
            prismSphereGroupChildrenLength = prismSphereGroupChildren.length,
            yOffset = this.model.get('offsetForCrossSectionY'),
            topSpheres = [], topSpheresLength,
             height = this.model.get('height'),
            firstPoint, secondPoint;

            for (var i = 0; i < 6; i++) {
                topSpheres.push(prismSphereGroup.getObjectById('sphere-' + i + '-position-0'));
            }

            topSpheresLength = topSpheres.length;

            this.hexagonLines = [];

            for (var i = 0; i < topSpheresLength; i++) {

                firstPoint = topSpheres[i].position;
                secondPoint = topSpheres[(i + 1) % topSpheresLength].position;
                vector = vector.subVectors(firstPoint, secondPoint);
                vector.divideScalar(numberOfLines);
                newPoint = firstPoint.clone();

                for (var j = 0; j < numberOfLines; j++) {
                    if (j !== 0) {
                        newPoint = newPoint.subVectors(newPoint, vector);
                    }

                    //from = {
                    //    x: newPoint.x,
                    //    y: initialY + yOffset,
                    //    z: initialZ - newPoint.z
                    //};

                    from = {
                        x: newPoint.x,
                        y: newPoint.y,
                        z: newPoint.z
                    };
                    to = {
                        x: newPoint.x,
                        y: newPoint.y - height,
                        z: newPoint.z
                    };
                    //to = {
                    //    x: newPoint.x,
                    //    y: finalY - yOffset,
                    //    z: finalZ - newPoint.z
                    //};

                    fromVector = new THREE.Vector3(from.x, from.y, from.z);
                    toVector = new THREE.Vector3(to.x, to.y, to.z);
                    line = new THREE.Line3(fromVector, toVector);
                    this.hexagonLines.push(line);
                }
            }

        },
        _createCrossSectionForPrism: function _createCrossSectionForPrism() {

            var pointsArr = this.model.get('pointsArr'),
                maxPoints = this.parent.model.get('maxPoints'),
                crossSectionDetails = this.parent.getCrosssectionDetails(),
                      material = new THREE.MeshBasicMaterial({
                          color: crossSectionDetails.COLOR,
                          side: THREE.DoubleSide,
                          transparent: true,
                          depthWrite: false,
                          opacity: crossSectionDetails.OPACITY
                      }),
                       outlineMaterial = new THREE.LineBasicMaterial({
                           color: crossSectionDetails.COLOR
                       }),
                       geometry = null,
                       prismSphereGroup = this.prismSphereGroup,
                       firstPoint, secondPoint, thirdPoint,
                       pointsArrLength = pointsArr.length;

            if (this.crossSection) {
                this.scene.remove(this.crossSection);
                this.crossSection = null;
                this.frontScene.remove(this.outlineMesh);
                this.outlineMesh = null;
            }

            if (pointsArrLength === maxPoints) {

                firstPoint = prismSphereGroup.getObjectByName(pointsArr[0]);
                secondPoint = prismSphereGroup.getObjectByName(pointsArr[1]);
                thirdPoint = prismSphereGroup.getObjectByName(pointsArr[2]);
                var plane = null,
                   collinearResult = this._checkNonCollinearPoints(pointsArr);

                if (collinearResult.result === true) {      //Cut using Plane forms curved shape
                    geometry = new THREE.Geometry();
                    plane = new THREE.Plane();
                    plane.setFromCoplanarPoints(firstPoint.position, secondPoint.position, thirdPoint.position)
                    material.opacity = className.CROSSSECTION_DETAILS.OPACITY;
                    
                    this.parent.filterPoints(this.hexagonLines, plane, geometry);
                    var geometryVerticesLength = geometry.vertices.length;

                    for (var i = 0; i < geometryVerticesLength - 2 ; i++) {
                        geometry.faces.push(new THREE.Face3(i + 1, i + 2, 0));
                    }
                    this.model.set('pointChecker', true);
                }
                else {           //Draw a Rectangle as points lie on same line
                    var pointsIndices = collinearResult.points, fourthPoint;
                    if (pointsIndices.length !== 0) {
                        geometry = new THREE.Geometry();

                        firstPoint = prismSphereGroup.getObjectById('sphere-' + pointsIndices[0] + '-position-0');
                        secondPoint = prismSphereGroup.getObjectById('sphere-' + pointsIndices[0] + '-position-100');
                        thirdPoint = prismSphereGroup.getObjectById('sphere-' + pointsIndices[1] + '-position-100');
                        fourthPoint = prismSphereGroup.getObjectById('sphere-' + pointsIndices[1] + '-position-0');

                        geometry.vertices.push(firstPoint.position);
                        geometry.vertices.push(secondPoint.position);
                        geometry.vertices.push(thirdPoint.position);
                        geometry.vertices.push(fourthPoint.position);
                        geometry.vertices.push(firstPoint.position);

                        geometry.faces.push(new THREE.Face3(0, 1, 2));
                        geometry.faces.push(new THREE.Face3(0, 2, 3));
                        this.model.set('pointChecker', true);
                    }
                    else {

                        if (collinearResult.errorType === 0) {
                            //Points are on Same Line
                            this.eventManager.trigger(eventManagerModel.POINTS_ON_SAME_EDGE);
                        }
                        else if (collinearResult.errorType === 1) {
                            //Points are on Same Face
                            this.eventManager.trigger(eventManagerModel.POINTS_ON_SAME_FACE);
                        }
                        this.model.set('pointChecker', false);
                    }
                }
                if (geometry) {
                    this.crossSection = new THREE.Mesh(geometry, material);
                    this.outlineMesh = new THREE.Line(geometry, outlineMaterial);
                    this.scene.add(this.crossSection);
                    this.frontScene.add(this.outlineMesh);
                }
            } else {
                this.model.set('pointChecker', false);
            }
        },

        _checkNonCollinearPoints: function _checkNonCollinearPoints(pointsArr) {

            var regex = /\d+/g,
                regexResult, collinearResult = {
                    result: false,
                    points: [],
                    errorType: 0
                },
                uniqueArr, uniqueArrLength, uniquePositionArr, uniquePositionArrLength,
                indexOfZero, indexOfHundred,
                sphereIndicesArr = [],
                faceArr = [],
                positionArr = [];

            regexResult = pointsArr[0].match(regex);
            sphereIndicesArr.push(regexResult[0]);
            positionArr.push(regexResult[1]);
            faceArr.push(regexResult[2]);
            faceArr.push(regexResult[3]);

            regexResult = pointsArr[1].match(regex);
            sphereIndicesArr.push(regexResult[0]);
            positionArr.push(regexResult[1]);
            faceArr.push(regexResult[2]);
            faceArr.push(regexResult[3]);

            regexResult = pointsArr[2].match(regex);
            sphereIndicesArr.push(regexResult[0]);
            positionArr.push(regexResult[1]);
            faceArr.push(regexResult[2]);
            faceArr.push(regexResult[3]);

            indexOfZero = positionArr.indexOf('0');
            indexOfHundred = positionArr.indexOf('100');

            uniqueArr = _.uniq(sphereIndicesArr);
            uniqueArrLength = uniqueArr.length;

            if (uniqueArrLength === 1) {
                return collinearResult;
            }
            else if (uniqueArrLength === 2) {
                var uniquefaceArr = _.uniq(faceArr),
                    uniquefaceArrLength = uniquefaceArr.length;

                if (uniquefaceArrLength === 3) {
                    //Same Side Face
                    collinearResult.errorType = 1;
                    return collinearResult;
                }
                //Draw Rectangle
                collinearResult.points = [uniqueArr[0], uniqueArr[1]];
            }
            else {
                if (indexOfHundred !== -1 || indexOfZero !== -1) {
                    uniquePositionArr = _.uniq(positionArr);
                    uniquePositionArrLength = uniquePositionArr.length;
                    if (uniquePositionArrLength === 1) {
                        //Same Face Top or Bottom
                        collinearResult.errorType = 1;
                        return collinearResult;
                    }
                }
                //Draw Curve
                collinearResult.result = true;
            }

            return collinearResult;

        },

        getSphereGroup: function getSphereGroup() {
            return this.prismSphereGroup;
        },

        getSelectedSphereGroup: function getSphereGroup() {
            return this.selectedSphereGroup;
        },

        getLines: function getLines() {
            return this.hexagonLines;
        },

        destroy: function destroy() {
            this.scene = null;
            this.frontScene = null;
            this.camera = null;
            this.mouseVector = null;
            this.projector = null;
            this.ray = null;
            this.controls = null;
            this.parent = null;
            this.crossSection = null;
            this.outlineMesh = null;
            this.name = null;
            this.prism = null;
            this.prismSphereGroup = null;
            this.prismHexagonGroup = null;
            this.hexagonLines = null;
            this.eventManager = null;
        }
    }, {
        HEXAGON_POSITION: [0, 33, 66, 100],

        CROSSSECTION_DETAILS: {
            OPACITY: 0.5
        }
    });
})();