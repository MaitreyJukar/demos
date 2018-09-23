(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Views.Sphere) {
        return;
    }
    var eventManagerModel = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer.EVENT_MANAGER_MODEL,
        className = null;

    /*
	*
	*   [[D E S C R I P T I O N]]
	*	
	* @class Sphere
	* @namespace MathInteractives.Interactivities.ShapeSlicer.Views
    * @extends  MathInteractives.Common.Interactivities.ShapeSlicer.Views.Base
	* @constructor
	*/
    MathInteractives.Common.Interactivities.ShapeSlicer.Views.Sphere = MathInteractives.Common.Player.Views.Base.extend({

        scene: null,

        frontScene: null,

        camera: null,

        mouseVector: null,

        projector: null,

        ray: null,

        controls: null,

        sphere: null,

        sphereCircleGroup: null,

        sphereVerticalCircleGroup: null,

        sphereHorizontalCircleGroup: null,

        sphereSphereGroup: null,

        selectedSphereGroup: null,

        parent: null,

        crossSection: null,

        outlineMesh: null,

        name: null,

        eventManager: null,

        initialize: function (options) {
            this.parent = options.parent;
            this.name = options.name;
            this.eventManager = options.eventManager;
            className = MathInteractives.Common.Interactivities.ShapeSlicer.Views.Sphere;
            this.parent.initializeThreeJS(this);
            this.render();
            this.attachEventListeners();
        },

        render: function render() {
            this._createSphere();

        },

        _createSphere: function _createSphere() {

            this.sphere = this._generateSphere();
            this.scene.add(this.sphere);

            this._addVerticalCirclesToSphere();
            this._addHorizontalCirclesToSphere();

        },

        attachEventListeners: function attachEventListeners() {
            var self = this;

            this.model.on('change:pointsArr', $.proxy(self._createCrossSectionForSphere, self));
            this.eventManager.on(eventManagerModel.CREATE_CROSSSECTION, $.proxy(self._createCrossSectionForSphere), self);
        },

        _generateSphere: function _generateSphere() {

            var material,
                sphere,
                geometry,
                materialDetails = this.parent.getMaterialDetails(),
                meshMaterial = {
                    color: materialDetails.COLOR,
                    wireframe: false,
                    transparent: true,
                    opacity: materialDetails.OPACITY,
                    depthWrite: false
                },
                segments = this.model.get('segments'),
                radiusOfSphere = this.model.get('radius');

            geometry = new THREE.SphereGeometry(radiusOfSphere, segments, segments);
            material = new THREE.MeshBasicMaterial(meshMaterial);
            sphere = new THREE.Mesh(geometry, material);

            return sphere;
        },

        _addVerticalCirclesToSphere: function _addVerticalCirclesToSphere() {

            var radius = this.model.get('radius'),
                self = this,
                segments = this.model.get('segments'),
                outlineDetails = this.parent.getOutlineDetails(),
                material = new THREE.LineBasicMaterial({ color: outlineDetails.COLOR }),
                geometry = new THREE.CircleGeometry(radius, segments), newCircle,
                numberOfVerticalCircles = this.model.get('numberOfVerticalCircles'),
                anglePerDivision = 180 / numberOfVerticalCircles,
                circle = new THREE.Line(geometry, material);

            // Remove center vertex
            geometry.vertices.shift();

            this.sphereVerticalCircleGroup = new THREE.Object3D();

            for (var i = 0; i < numberOfVerticalCircles; i++) {
                newCircle = circle.clone();
                newCircle.rotateOnAxis(new THREE.Vector3(0.0, 1.0, 0.0), this.parent.angleToRadians(anglePerDivision * i));
                this.sphereVerticalCircleGroup.add(newCircle);
            }

            this.scene.add(this.sphereVerticalCircleGroup);
        },

        _addHorizontalCirclesToSphere: function _addHorizontalCirclesToSphere() {

            var position = className.CIRCLE_POSITION,
                radius,
                sphere = this.sphere, spherePosition = sphere.position,
                radiusOfSphere = this.model.get('radius'), ellipse = [],
                self = this, sphereOfSphere,
                 numberOfHorizontalCircles = this.model.get('numberOfHorizontalCircles'),
                positionOffset, heightOffset;

            this.sphereHorizontalCircleGroup = new THREE.Object3D();
            this.sphereSphereGroup = new THREE.Object3D();
            this.selectedSphereGroup = new THREE.Object3D();

            //For Top Sphere
            sphereOfSphere = this.parent.generateClickableSphere();
            sphereOfSphere.position.set(spherePosition.x, spherePosition.y + radiusOfSphere, spherePosition.z);
            sphereOfSphere.name = 'sphere-6-position-0';
            this.sphereSphereGroup.add(sphereOfSphere);//add a mesh with geometry to it

            for (var i = 0; i < numberOfHorizontalCircles; i++) {

                positionOffset = (((50 - position[i]) * (2 * radiusOfSphere)) / 100);
                radius = this._getRadiusForCrossSectionInSphere(radiusOfSphere, positionOffset);

                ellipse[i] = this.parent.drawCurve(radius, radius);
                ellipse[i].rotation.x = this.parent.angleToRadians(90);

                ellipse[i].position.set(spherePosition.x, spherePosition.y + (positionOffset), spherePosition.z);

                this.sphereHorizontalCircleGroup.add(ellipse[i]);

                this._addSpheresToSphere(ellipse[i], position[i]);
            }

            //For Bottom Sphere
            sphereOfSphere = this.parent.generateClickableSphere();
            sphereOfSphere.position.set(spherePosition.x, spherePosition.y - radiusOfSphere, spherePosition.z);
            sphereOfSphere.name = 'sphere-6-position-100';
            this.sphereSphereGroup.add(sphereOfSphere);//add a mesh with geometry to it

            this.scene.add(this.sphereHorizontalCircleGroup);
            this.scene.add(this.sphereSphereGroup);
            this.frontScene.add(this.selectedSphereGroup);
        },

        /**
        * Returns the CrossSection Radius in a Sphere
        *
        * @method _getRadiusForCrossSectionInSphere
        * @param radius {Number} Radius of Sphere
        * @param heightOffset {Number} Height Offset of CrossSection from center of Sphere
        * @private
        */
        _getRadiusForCrossSectionInSphere: function _getRadiusForCrossSectionInSphere(radius, heightOffset) {
            return Math.sqrt(Math.pow(radius, 2) - Math.pow(heightOffset, 2));
        },


        _addSpheresToSphere: function _addSpheresToSphere(crosssection, pos) {

            var to, from,
                sphereOfSphere = [],
                self = this,
                crossSectionRadius = crosssection.geometry.boundingSphere.radius,
                conePosition, zFactor = Math.sqrt(3) / 2,
                crosssectionPos = crosssection.position,
                numberOfClickableSpheres = this.model.get('numberOfClickableSpheres'),
                 spherePosition = [{
                     x: crosssectionPos.x - crossSectionRadius,
                     y: crosssectionPos.y,
                     z: crosssectionPos.z
                 },
                {
                    x: crosssectionPos.x - crossSectionRadius / 2,
                    y: crosssectionPos.y,
                    z: crosssectionPos.z - zFactor * crossSectionRadius
                },
                {
                    x: crosssectionPos.x + crossSectionRadius / 2,
                    y: crosssectionPos.y,
                    z: crosssectionPos.z - zFactor * crossSectionRadius
                },
                {
                    x: crosssectionPos.x + crossSectionRadius,
                    y: crosssectionPos.y,
                    z: crosssectionPos.z
                },
                {
                    x: crosssectionPos.x + crossSectionRadius / 2,
                    y: crosssectionPos.y,
                    z: crosssectionPos.z + zFactor * crossSectionRadius
                },
                 {
                     x: crosssectionPos.x - crossSectionRadius / 2,
                     y: crosssectionPos.y,
                     z: crosssectionPos.z + zFactor * crossSectionRadius
                 }];

            for (var i = 0; i < numberOfClickableSpheres; i++) {
                sphereOfSphere[i] = this.parent.generateClickableSphere();
                sphereOfSphere[i].position.set(spherePosition[i].x, spherePosition[i].y, spherePosition[i].z);
                sphereOfSphere[i].name = 'sphere-' + i + '-position-' + pos;

                this.sphereSphereGroup.add(sphereOfSphere[i]);//add a mesh with geometry to it
            }

        },

        _createCrossSectionForSphere: function _createCrossSectionForSphere() {

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
                     geometry,
                    sphereSphereGroup = this.sphereSphereGroup,
                    firstPoint, secondPoint, thirdPoint,
                    pointsArrLength = pointsArr.length;

            if (this.crossSection) {
                this.scene.remove(this.crossSection);
                this.crossSection = null;
                this.frontScene.remove(this.outlineMesh);
                this.outlineMesh = null;
            }

            if (pointsArrLength === maxPoints) {

                firstPoint = sphereSphereGroup.getObjectByName(pointsArr[0]);
                secondPoint = sphereSphereGroup.getObjectByName(pointsArr[1]);
                thirdPoint = sphereSphereGroup.getObjectByName(pointsArr[2]);
                var plane = new THREE.Plane();

                var p1 = firstPoint.position,
                    p2 = secondPoint.position,
                    p3 = thirdPoint.position,
                    p1minusp2 = (p1.clone()).subVectors(p1, p2),
                    p1minusp3 = (p1.clone()).subVectors(p1, p3),
                    p2minusp3 = (p2.clone()).subVectors(p2, p3), a, b, c, center, radius, focalPoint, planeNormal,
                    segments = this.model.get('segments'),
                        denom = (2 * ((p1minusp2.clone()).crossVectors(p1minusp2, p2minusp3)).lengthSq());

                plane.setFromCoplanarPoints(p1, p2, p3)
                a = ((p2minusp3.lengthSq()) * (p1minusp2.dot(p1minusp3))) / denom;
                b = ((p1minusp3.lengthSq()) * ((p1minusp2.negate()).dot(p2minusp3))) / denom;
                c = ((p1minusp2.lengthSq()) * ((p1minusp3.negate()).dot((p2minusp3.negate())))) / denom;

                center = (p1.clone().multiplyScalar(a)).add((p2.clone().multiplyScalar(b)).add((p3.clone().multiplyScalar(c))));
                radius = center.distanceTo(p1);

                geometry = new THREE.CircleGeometry(radius, segments);
                geometry.faces.length = segments - 1;
                geometry.vertices.shift();

                this.crossSection = new THREE.Mesh(geometry, material);

                this.outlineMesh = new THREE.Line(geometry, outlineMaterial);

                planeNormal = plane.normal;
                focalPoint = new THREE.Vector3(
                        this.crossSection.position.x + planeNormal.x,
                        this.crossSection.position.y + planeNormal.y,
                        this.crossSection.position.z + planeNormal.z
                );

                //    this.crossSection.up = new THREE.Vector3(0, 0, 1);//Z axis up
                this.crossSection.lookAt(focalPoint);
                this.crossSection.position.set(center.x, center.y, center.z);
                this.model.set('pointChecker', true);

                this.outlineMesh.lookAt(focalPoint);
                this.outlineMesh.position.set(center.x, center.y, center.z);
                this.scene.add(this.crossSection);
                this.frontScene.add(this.outlineMesh);
            } else {
                this.model.set('pointChecker', false);
            }


        },

        getSphereGroup: function getSphereGroup() {
            return this.sphereSphereGroup;
        },

        getSelectedSphereGroup: function getSphereGroup() {
            return this.selectedSphereGroup;
        },

        getLines: function getLines() {
            return [];
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
            this.sphere = null;
            this.sphereSphereGroup = null;
            this.sphereCircleGroup = null;
            this.sphereVerticalCircleGroup = null;
            this.sphereHorizontalCircleGroup = null;
            this.eventManager = null;
        }
    }, {
        CIRCLE_POSITION: [16.67, 33.33, 50, 66.67, 83.33]
    });
})();