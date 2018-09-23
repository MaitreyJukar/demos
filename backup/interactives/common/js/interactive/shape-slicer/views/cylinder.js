(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Views.Cylinder) {
        return;
    }
    var eventManagerModel = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer.EVENT_MANAGER_MODEL,
        className = null;
    /*
	*
	*   [[D E S C R I P T I O N]]
	*	
	* @class Cylinder
	* @namespace MathInteractives.Interactivities.ShapeSlicer.Views
    * @extends  MathInteractives.Common.Interactivities.ShapeSlicer.Views.Base
	* @constructor
	*/
    MathInteractives.Common.Interactivities.ShapeSlicer.Views.Cylinder = MathInteractives.Common.Player.Views.Base.extend({

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

        cylinder: null,

        cylinderSphereGroup: null,

        cylinderEllipseGroup: null,

        selectedSphereGroup: null,

        ellipseLines: null,

        eventManager: null,

        initialize: function (options) {
            this.parent = options.parent;
            this.name = options.name;
            this.eventManager = options.eventManager;
            className = MathInteractives.Common.Interactivities.ShapeSlicer.Views.Cylinder;
            this.parent.initializeThreeJS(this);
            this.render();
            this.attachEventListeners();
        },

        render: function render() {
            this._createCylinder();

        },

        attachEventListeners: function attachEventListeners() {
            var self = this;

            this.model.on('change:pointsArr', $.proxy(self._createCrossSectionForCylinder, self));
            this.eventManager.on(eventManagerModel.CREATE_CROSSSECTION, $.proxy(self._createCrossSectionForCylinder), self);
        },

        _createCylinder: function _createCylinder() {

            this.cylinder = this._generateCylinder();
            this.scene.add(this.cylinder);
            this._addEllipseToCylinder();
            this._addDummyCylinderLines();

        },

        _generateCylinder: function _generateCylinder() {

            var material, cylinder,
                radius = this.model.get('radius'),
                height = this.model.get('height'),
                materialDetails = this.parent.getMaterialDetails(),
                segments = this.model.get('segments');

            material = new THREE.MeshBasicMaterial({
                color: materialDetails.COLOR,
                wireframe: false,
                transparent: true,
                opacity: materialDetails.OPACITY,
                depthWrite: false
            });

            cylinder = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments, segments, false), material);

            return cylinder;
        },

        _addEllipseToCylinder: function _addEllipseToCylinder() {

            var position = className.ELLIPSE_POSITION,
                 positionLength = position.length,
            cylinder = this.cylinder,
            cylinderPosition = cylinder.position,
            radius = this.model.get('radius'),
            ellipse = [], height = this.model.get('height'),
            positionOffset, drawLine = false;

            this.cylinderSphereGroup = new THREE.Object3D();
            this.cylinderEllipseGroup = new THREE.Object3D();
            this.selectedSphereGroup = new THREE.Object3D();

            for (var i = 0; i < positionLength; i++) {

                positionOffset = (((50 - position[i]) * (height)) / 100);

                ellipse[i] = this.parent.drawCurve(radius, radius);
                ellipse[i].rotation.x = this.parent.angleToRadians(90);

                ellipse[i].position.set(cylinderPosition.x, cylinderPosition.y + positionOffset, cylinderPosition.z);

                this.cylinderEllipseGroup.add(ellipse[i]);

                if (i === (positionLength - 1)) {
                    drawLine = true;
                }

                this._addSpheresToCylinder(ellipse[i], drawLine, position[i]);
            }

            this.scene.add(this.cylinderEllipseGroup);
            this.scene.add(this.cylinderSphereGroup);
            this.frontScene.add(this.selectedSphereGroup);
        },

        _addSpheresToCylinder: function _addSpheresToCylinder(ellipse, drawLine, ellipsePosition) {

            var to, from,
            sphereOfCylinder = [],
            self = this,
            ellipseRadius = ellipse.geometry.boundingSphere.radius,
            height = this.model.get('height'), line,
            numberOfClickableSpheres = this.model.get('numberOfClickableSpheres'),
             zFactor = Math.sqrt(3) / 2,
            ellipsePos = ellipse.position,
            spherePosition = [
            {
                x: ellipsePos.x - ellipseRadius / 2,
                y: ellipsePos.y,
                z: ellipsePos.z - zFactor * ellipseRadius
            },
             {
                 x: ellipsePos.x + ellipseRadius / 2,
                 y: ellipsePos.y,
                 z: ellipsePos.z - zFactor * ellipseRadius
             },
                {
                    x: ellipsePos.x + ellipseRadius,
                    y: ellipsePos.y,
                    z: ellipsePos.z
                },
            {
                x: ellipsePos.x + ellipseRadius / 2,
                y: ellipsePos.y,
                z: ellipsePos.z + zFactor * ellipseRadius
            },
                {
                    x: ellipsePos.x - ellipseRadius / 2,
                    y: ellipsePos.y,
                    z: ellipsePos.z + zFactor * ellipseRadius
                },
            {
                x: ellipsePos.x - ellipseRadius,
                y: ellipsePos.y,
                z: ellipsePos.z
            }];

            for (var i = 0; i < numberOfClickableSpheres; i++) {
                sphereOfCylinder[i] = this.parent.generateClickableSphere();
                sphereOfCylinder[i].position.set(spherePosition[i].x, spherePosition[i].y, spherePosition[i].z);
                sphereOfCylinder[i].name = 'sphere-' + i + '-position-' + ellipsePosition;

                this.cylinderSphereGroup.add(sphereOfCylinder[i]);//add a mesh with geometry to it


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

        _addDummyCylinderLines: function _addDummyCylinderLines() {

            var numberOfLines = this.model.get('numberOfDummyLines'),
            line,
            toVector, height = this.model.get('height'),
            cylinderPosition = this.cylinder.position, to, from,
            halfPoints = numberOfLines / 2, fromVector,
            cylinderEllipseGroupChildren = this.cylinderEllipseGroup.children,
            cylinderEllipseGroupChildrenLength = cylinderEllipseGroupChildren.length,
            cylinderEllipse = cylinderEllipseGroupChildren[cylinderEllipseGroupChildrenLength - 1],
            cylinderEllipsePosition = cylinderEllipse.position,
            cylinderTopEllipse = cylinderEllipseGroupChildren[0],
            cylinderTopEllipsePosition = cylinderTopEllipse.position,
            ellipseRadius = this.model.get('radius'), x, z, angle,
            initialY = cylinderTopEllipsePosition.y,
            initialZ = cylinderTopEllipsePosition.z,
            finalY = cylinderEllipsePosition.y,
            finalZ = cylinderEllipsePosition.z,
            step = (ellipseRadius * 2) / halfPoints,
            zFactor = 360 / numberOfLines;

            this.ellipseLines = [];

            for (var i = 0; i <= halfPoints; i += 10) {
                angle = this.parent.angleToRadians(i * zFactor);
                x = (Math.cos(angle) * ellipseRadius);
                z = (Math.sin(angle) * ellipseRadius);

                from = {
                    x: x,
                    y: initialY,
                    z: initialZ - z
                };
                to = {
                    x: x,
                    y: finalY,
                    z: finalZ - z
                };

                fromVector = new THREE.Vector3(from.x, from.y, from.z);
                toVector = new THREE.Vector3(to.x, to.y, to.z);
                line = new THREE.Line3(fromVector, toVector);
                this.ellipseLines.push(line);
            }

            for (var i = 0; i < halfPoints; i += 10) {
                angle = this.parent.angleToRadians((halfPoints - i) * zFactor);
                x = (Math.cos(angle) * ellipseRadius);
                z = (Math.sin(angle) * ellipseRadius);
                from = {
                    x: x,
                    y: initialY,
                    z: initialZ + z
                };
                to = {
                    x: x,
                    y: finalY,
                    z: finalZ + z
                };
                fromVector = new THREE.Vector3(from.x, from.y, from.z);
                toVector = new THREE.Vector3(to.x, to.y, to.z);
                line = new THREE.Line3(fromVector, toVector);
                this.ellipseLines.push(line);

            }
        },

        _createCrossSectionForCylinder: function _createCrossSectionForCylinder() {

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
                       cylinderSphereGroup = this.cylinderSphereGroup,
                       firstPoint, secondPoint, thirdPoint,
                       pointsArrLength = pointsArr.length;

            if (this.crossSection) {
                this.scene.remove(this.crossSection);
                this.crossSection = null;
                this.frontScene.remove(this.outlineMesh);
                this.outlineMesh = null;
            }

            if (pointsArrLength === maxPoints) {

                firstPoint = cylinderSphereGroup.getObjectByName(pointsArr[0]);
                secondPoint = cylinderSphereGroup.getObjectByName(pointsArr[1]);
                thirdPoint = cylinderSphereGroup.getObjectByName(pointsArr[2]);
                var plane = null,
                collinearResult = this._checkNonCollinearPoints(pointsArr);

                if (collinearResult.result === true) {      //Cut using Plane forms curved shape
                    geometry = new THREE.Geometry();
                    plane = new THREE.Plane();
                    plane.setFromCoplanarPoints(firstPoint.position, secondPoint.position, thirdPoint.position)

                    this.parent.filterPoints(this.ellipseLines, plane, geometry);

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

                        firstPoint = cylinderSphereGroup.getObjectByName('sphere-' + pointsIndices[0] + '-position-0');
                        secondPoint = cylinderSphereGroup.getObjectByName('sphere-' + pointsIndices[0] + '-position-100');
                        thirdPoint = cylinderSphereGroup.getObjectByName('sphere-' + pointsIndices[1] + '-position-100');
                        fourthPoint = cylinderSphereGroup.getObjectByName('sphere-' + pointsIndices[1] + '-position-0');

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
                pointsArrLength = pointsArr.length,
                regexResult, collinearResult = {
                    result: false,
                    points: [],
                    errorType: 0
                },
                uniqueArr, uniqueArrLength, uniquePositionArr, uniquePositionArrLength,
                threePointNotSameLine = true,
                indexOfZero, indexOfHundred,
                sphereIndicesArr = [],
                positionArr = [];

            regexResult = pointsArr[0].match(regex);
            sphereIndicesArr.push(regexResult[0]);
            positionArr.push(regexResult[1]);

            regexResult = pointsArr[1].match(regex);
            sphereIndicesArr.push(regexResult[0]);
            positionArr.push(regexResult[1]);

            regexResult = pointsArr[2].match(regex);
            sphereIndicesArr.push(regexResult[0]);
            positionArr.push(regexResult[1]);

            indexOfZero = positionArr.indexOf('0');
            indexOfHundred = positionArr.indexOf('100');

            uniqueArr = _.uniq(sphereIndicesArr);
            uniqueArrLength = uniqueArr.length;

            if (uniqueArrLength === 1) {
                return collinearResult;
            }
            else if (uniqueArrLength === 2) {
                //Draw Triangle 
                collinearResult.points = [uniqueArr[0], uniqueArr[1]];
            }
            else {
                if (indexOfHundred !== -1 || indexOfZero !== -1) {
                    uniquePositionArr = _.uniq(positionArr);
                    uniquePositionArrLength = uniquePositionArr.length;
                    if (uniquePositionArrLength === 1) {
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
            return this.cylinderSphereGroup;
        },

        getSelectedSphereGroup: function getSphereGroup() {
            return this.selectedSphereGroup;
        },

        getLines: function getLines() {
            return this.ellipseLines;
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
            this.cylinder = null;
            this.cylinderSphereGroup = null;
            this.cylinderEllipseGroup = null;
            this.ellipseLines = null;
            this.eventManager = null;
        }
    }, {
        ELLIPSE_POSITION: [0, 33, 66, 100],
    });
})();