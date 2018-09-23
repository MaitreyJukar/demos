(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Views.Cone) {
        return;
    }
    var eventManagerModel = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer.EVENT_MANAGER_MODEL,
        className = null;
    /*
	*
	*   [[D E S C R I P T I O N]]
	*	
	* @class Cone
	* @namespace MathInteractives.Interactivities.ShapeSlicer.Views
    * @extends  MathInteractives.Common.Interactivities.ShapeSlicer.Views.Base
	* @constructor
	*/
    MathInteractives.Common.Interactivities.ShapeSlicer.Views.Cone = MathInteractives.Common.Player.Views.Base.extend({

        scene: null,

        frontScene: null,

        camera: null,

        mouseVector: null,

        projector: null,

        ray: null,

        controls: null,

        cone: null,

        coneSphereGroup: null,

        coneEllipseGroup: null,

        parent: null,

        selectedSphereGroup: null,

        ellipseLines: null,

        crossSection: null,

        outlineMesh: null,

        name: null,

        eventManager: null,

        initialize: function (options) {
            this.parent = options.parent;
            this.name = options.name;
            this.eventManager = options.eventManager;
            className = MathInteractives.Common.Interactivities.ShapeSlicer.Views.Cone;
            this.parent.initializeThreeJS(this);
            this.render();
            this.attachEventListeners();
        },

        render: function render() {
            this._createCone();

        },
        attachEventListeners: function attachEventListeners() {
            var self = this;

            this.model.on('change:pointsArr', $.proxy(self._createCrossSectionForCone, self));
            this.eventManager.on(eventManagerModel.CREATE_CROSSSECTION, $.proxy(self._createCrossSectionForCone), self);

        },

        _createCone: function _createCone() {

            this.cone = this._generateCone();
            this.scene.add(this.cone);
            this._addEllipseToCone();
            this._addDummyConeLines();

        },

        _generateCone: function _generateCone() {


            var material, cone,
                radiusTop = 0,
                radiusBottom = this.model.get('radius'),
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

            //Depthwrite to handle transparency of all the objects,if not given it wont make transparent to all objects only with highest z will be transparent

            cone = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments, segments, false), material);

            cone.position.y += height / 4;

            return cone;

        },

        _addDummyConeLines: function _addDummyConeLines() {

            var numberOfLines = this.model.get('numberOfDummyLines'),
            line,
            toVector,
            conePosition = this.cone.position,
            from = {
                x: conePosition.x,
                y: conePosition.y + this.cone.geometry.height / 2,
                z: conePosition.z
            }, to,
            halfPoints = numberOfLines / 2,
            fromVector = new THREE.Vector3(from.x, from.y, from.z),
            coneEllipse = this.coneEllipseGroup.children[3],
            coneEllipsePosition = coneEllipse.position, angle,
            ellipseRadius = coneEllipse.geometry.boundingSphere.radius,
            initialY = coneEllipsePosition.y,
            initialZ = coneEllipsePosition.z,
            step = (ellipseRadius * 2) / halfPoints,
            zFactor = 360 / numberOfLines;

            this.ellipseLines = [];

            for (var i = 0; i <= halfPoints; i += 10) {
                angle = this.parent.angleToRadians(i * zFactor);
                to = {
                    x: (Math.cos(angle) * ellipseRadius),
                    y: initialY,
                    z: initialZ - (Math.sin(angle) * ellipseRadius)
                };
                toVector = new THREE.Vector3(to.x, to.y, to.z);
                line = new THREE.Line3(fromVector, toVector);
                this.ellipseLines.push(line);
            }

            for (var i = 0; i < halfPoints; i += 10) {
                angle = this.parent.angleToRadians((halfPoints - i) * zFactor);
                to = {
                    x: (Math.cos(angle) * ellipseRadius),
                    y: initialY,
                    z: initialZ + (Math.sin(angle) * ellipseRadius)
                };
                toVector = new THREE.Vector3(to.x, to.y, to.z);
                line = new THREE.Line3(fromVector, toVector);
                this.ellipseLines.push(line);

            }



        },

        _createCrossSectionForCone: function _createCrossSectionForCone() {

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
                    coneSphereGroup = this.coneSphereGroup,
                    firstPoint, secondPoint, thirdPoint,
                    pointsArrLength = pointsArr.length;

            if (this.crossSection) {
                this.scene.remove(this.crossSection);
                this.crossSection = null;
                this.frontScene.remove(this.outlineMesh);
                this.outlineMesh = null;
            }

            if (pointsArrLength === maxPoints) {

                firstPoint = coneSphereGroup.getObjectByName(pointsArr[0]);
                secondPoint = coneSphereGroup.getObjectByName(pointsArr[1]);
                thirdPoint = coneSphereGroup.getObjectByName(pointsArr[2]);
                var plane = null,
                   collinearResult = this._checkNonCollinearPoints(pointsArr);

                if (collinearResult.result === true) {
                    plane = new THREE.Plane();  //Cut using Plane forms curved shape
                    geometry = new THREE.Geometry();
                    plane.setFromCoplanarPoints(firstPoint.position, secondPoint.position, thirdPoint.position)

                    this.parent.filterPoints(this.ellipseLines, plane, geometry);
                    
                    var geometryVerticesLength = geometry.vertices.length;

                    for (var i = 0; i < geometryVerticesLength - 2 ; i++) {
                        geometry.faces.push(new THREE.Face3(i + 1, i + 2, 0));
                    }
                    this.model.set('pointChecker', true);
                }
                else {           //Draw a trinagle as points lie on same line
                    var pointsIndices = collinearResult.points;
                    if (pointsIndices.length !== 0) {
                        geometry = new THREE.Geometry();
                        firstPoint = coneSphereGroup.getObjectByName('sphere-6-position-0');
                        secondPoint = coneSphereGroup.getObjectByName('sphere-' + pointsIndices[0] + '-position-100');
                        thirdPoint = coneSphereGroup.getObjectByName('sphere-' + pointsIndices[1] + '-position-100');
                        geometry.vertices.push(firstPoint.position);
                        geometry.vertices.push(secondPoint.position);
                        geometry.vertices.push(thirdPoint.position);
                        geometry.vertices.push(firstPoint.position);
                        geometry.faces.push(new THREE.Face3(3, 1, 2));
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

            if (indexOfZero === -1) {
                if (uniqueArrLength === 3) {
                    if (indexOfHundred !== -1) {
                        uniquePositionArr = _.uniq(positionArr);
                        uniquePositionArrLength = uniquePositionArr.length;
                        if (uniquePositionArrLength === 1) {
                            collinearResult.errorType = 1;
                            return collinearResult;
                        }
                    }
                    //Draw Curve
                    collinearResult.result = true;
                    return collinearResult;
                }

                //Draw Triangle 
                collinearResult.points = [uniqueArr[0], uniqueArr[1]];
            }
            else {
                if (uniqueArrLength === 3) {
                    //Draw Triangle
                    collinearResult.points = [sphereIndicesArr[(indexOfZero + 1) % 3], sphereIndicesArr[(indexOfZero + 2) % 3]];
                }
            }

            return collinearResult;

        },

        _addEllipseToCone: function _addEllipseToCone() {

            var position = className.ELLIPSE_POSITION,
                radius, positionLength = position.length,
            cone = this.cone, sphereOfCone,
            conePosition = cone.position,
            radiusOfCone = cone.geometry.radiusBottom,
            ellipse = [],
            height = cone.geometry.height,
            positionOffset, heightOffset, drawLine = false;

            this.coneSphereGroup = new THREE.Object3D();
            this.coneEllipseGroup = new THREE.Object3D();
            this.selectedSphereGroup = new THREE.Object3D();

            //For Top Sphere
            sphereOfCone = this.parent.generateClickableSphere();
            sphereOfCone.position.set(conePosition.x, conePosition.y + height / 2, conePosition.z);
            sphereOfCone.name = 'sphere-6-position-0';
            this.coneSphereGroup.add(sphereOfCone);//add a mesh with geometry to it

            for (var i = 0; i < positionLength; i++) {

                positionOffset = (((50 - position[i]) * (height)) / 100);
                heightOffset = (((position[i]) * (height)) / 100);
                radius = this._getRadiusForCrossSectionInCone(radiusOfCone, height, heightOffset);

                ellipse[i] = this.parent.drawCurve(radius, radius);
                ellipse[i].rotation.x = this.parent.angleToRadians(90);

                ellipse[i].position.set(conePosition.x, conePosition.y + positionOffset, conePosition.z);

                this.coneEllipseGroup.add(ellipse[i]);

                if (i === (positionLength - 1)) {
                    drawLine = true;
                }

                this._addSpheresToCone(ellipse[i], drawLine, position[i]);
            }

            this.scene.add(this.coneEllipseGroup);
            this.scene.add(this.coneSphereGroup);
            this.frontScene.add(this.selectedSphereGroup);
        },

        _addSpheresToCone: function _addSpheresToCone(ellipse, drawLine, ellipsePosition) {

            var to, from,
            sphereOfCone = [],
            self = this,
            ellipseRadius = ellipse.geometry.boundingSphere.radius,
            numberOfClickableSpheres = this.model.get('numberOfClickableSpheres'),
            conePosition, zFactor = Math.sqrt(3) / 2, line,
            ellipsePos = ellipse.position,
             spherePosition = [
              {
                  x: ellipsePos.x - ellipseRadius / 2,
                  y: ellipsePos.y,
                  z: ellipsePos.z + zFactor * ellipseRadius
              },
              {
                  x: ellipsePos.x - ellipseRadius,
                  y: ellipsePos.y,
                  z: ellipsePos.z
              },
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
            }];

            for (var i = 0; i < numberOfClickableSpheres; i++) {
                sphereOfCone[i] = this.parent.generateClickableSphere();
                sphereOfCone[i].position.set(spherePosition[i].x, spherePosition[i].y, spherePosition[i].z);
                sphereOfCone[i].name = 'sphere-' + i + '-position-' + ellipsePosition;

                this.coneSphereGroup.add(sphereOfCone[i]);//add a mesh with geometry to it


                if (drawLine === true) {
                    conePosition = this.cone.position;
                    from = {
                        x: conePosition.x,
                        y: conePosition.y + this.cone.geometry.height / 2,
                        z: conePosition.z
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


        _getRadiusForCrossSectionInCone: function _getRadiusForCrossSectionInCone(radius, height, heightOffset) {
            var constant = (radius) / height,
                newRadius = (constant * heightOffset);

            return newRadius;
        },

        getSphereGroup: function getSphereGroup() {
            return this.coneSphereGroup;
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
            this.cone = null;
            this.coneSphereGroup = null;
            this.coneEllipseGroup = null;
            this.ellipseLines = null;
            this.eventManager = null;
        }
    }, {

        ELLIPSE_POSITION: [25, 50, 75, 100],

    });
})();