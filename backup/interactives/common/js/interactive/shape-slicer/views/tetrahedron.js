(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Views.Tetrahedron) {
        return;
    }
    var eventManagerModel = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer.EVENT_MANAGER_MODEL,
        className = null;
    /*
	*
	*   [[D E S C R I P T I O N]]
	*	
	* @class Tetrahedron
	* @namespace MathInteractives.Interactivities.ShapeSlicer.Views
    * @extends  MathInteractives.Common.Interactivities.ShapeSlicer.Views.Base
	* @constructor
	*/
    MathInteractives.Common.Interactivities.ShapeSlicer.Views.Tetrahedron = MathInteractives.Common.Player.Views.Base.extend({

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

        tetrahedron: null,

        tetrahedronSphereGroup: null,

        selectedSphereGroup: null,

        tetrahedronLines: null,

        eventManager: null,

        initialize: function (options) {
            this.parent = options.parent;
            this.name = options.name;
            this.eventManager = options.eventManager;
            className = MathInteractives.Common.Interactivities.ShapeSlicer.Views.Tetrahedron;
            this.parent.initializeThreeJS(this);
            this.render();
            this.attachEventListeners();
        },

        render: function render() {
            this._createTetrahedron();
        },

        attachEventListeners: function attachEventListeners() {
            var self = this;

            this.model.on('change:pointsArr', $.proxy(self._createCrossSectionForTetrahedron, self));
            this.eventManager.on(eventManagerModel.CREATE_CROSSSECTION, $.proxy(self._createCrossSectionForTetrahedron), self);
        },

        _createTetrahedron: function _createTetrahedron() {

            this.tetrahedron = this._generateTetrahedron();
            this.scene.add(this.tetrahedron);
            this._addLineToTetrahedron();
            this._addDummyTetrahedronLines();
        },

        _generateTetrahedron: function _generateTetrahedron() {


            var material, tetrahedron, geometry, material1, tetrahedron1,
                  sideLength = this.model.get('sideLength'),
                  materialDetails = this.parent.getMaterialDetails();

            material = new THREE.MeshBasicMaterial({
                color: materialDetails.COLOR,
                wireframe: false,
                transparent: true,
                opacity: materialDetails.OPACITY,
                depthWrite: false
            });


            geometry = new THREE.TetrahedronGeometry(sideLength);

            tetrahedron = new THREE.Mesh(geometry, material);

            return tetrahedron;

        },

        _addLineToTetrahedron: function _addLineToTetrahedron() {

            var numberOfClickableSpheres = this.model.get('numberOfClickableSpheres'),
                tetrahedron = this.tetrahedron, sphereOfTetrahedron,
                tetrahedronGeometry = tetrahedron.geometry,
                tetrahedronVertices = tetrahedronGeometry.vertices,
                tetrahedronVerticesLength = tetrahedronVertices.length,
                from, to, line, tetrahedronLinesGroupChildren, tetrahedronLinesGroupChildrenLength,
                vertices, firstPoint, secondPoint, vector = new THREE.Vector3(),
                newPoint = new THREE.Vector3();

            this.tetrahedronSphereGroup = new THREE.Object3D();
            this.tetrahedronLinesGroup = new THREE.Object3D();
            this.selectedSphereGroup = new THREE.Object3D();


            for (var i = 0; i < tetrahedronVerticesLength; i++) {
                sphereOfTetrahedron = this.parent.generateClickableSphere();
                to = tetrahedronVertices[i];
                sphereOfTetrahedron.position.set(to.x, to.y, to.z);
                sphereOfTetrahedron.name = 'sphere-0-position-' + i;
                this.tetrahedronSphereGroup.add(sphereOfTetrahedron);
            }


            for (var i = 0; i < tetrahedronVerticesLength - 1; i++) {
                from = tetrahedronVertices[i];
                for (var j = i + 1; j < tetrahedronVerticesLength; j++) {
                    to = tetrahedronVertices[j];
                    this.tetrahedronLinesGroup.add(this.parent.drawLines(from, to));
                }
            }

            tetrahedronLinesGroupChildren = this.tetrahedronLinesGroup.children;
            tetrahedronLinesGroupChildrenLength = tetrahedronLinesGroupChildren.length;

            for (var i = 0; i < tetrahedronLinesGroupChildrenLength; i++) {

                vertices = tetrahedronLinesGroupChildren[i].geometry.vertices;
                firstPoint = vertices[0];
                secondPoint = vertices[1];
                vector = vector.subVectors(firstPoint, secondPoint);
                vector.divideScalar(numberOfClickableSpheres);
                newPoint = firstPoint.clone();

                for (var j = 1; j < numberOfClickableSpheres; j++) {
                    newPoint = newPoint.subVectors(newPoint, vector);
                    from = {
                        x: newPoint.x,
                        y: newPoint.y,
                        z: newPoint.z
                    };

                    sphereOfTetrahedron = this.parent.generateClickableSphere();
                    sphereOfTetrahedron.position.set(from.x, from.y, from.z);
                    sphereOfTetrahedron.name = 'sphere-' + j + '-position-' + i;

                    this.tetrahedronSphereGroup.add(sphereOfTetrahedron);
                }
            }

            this.tetrahedronSphereGroup.children = this.parent.reOrderSpheres(this.tetrahedronSphereGroup, className.ORDERED_SPHERES);
            this.scene.add(this.tetrahedronSphereGroup);
            this.scene.add(this.tetrahedronLinesGroup);
            this.frontScene.add(this.selectedSphereGroup);
        },

        _addDummyTetrahedronLines: function _addDummyTetrahedronLines() {

            var numberOfLines = this.model.get('numberOfDummyLines'),
                line, tetrahedronSphereGroup = this.tetrahedronSphereGroup, fromVector, toVector,
                sphereTop = tetrahedronSphereGroup.getObjectByName('sphere-0-position-0'),
                sphereTopPosition = sphereTop.position, baseSpheres = [], baseSpheresLength,
                from = {
                    x: sphereTopPosition.x,
                    y: sphereTopPosition.y,
                    z: sphereTopPosition.z
                }, to,
                vector = new THREE.Vector3(),
                newPoint = new THREE.Vector3(), firstPoint, secondPoint;


            for (var i = 1; i < 4; i++) {
                baseSpheres.push(tetrahedronSphereGroup.getObjectByName('sphere-0-position-' + i));
            }

            baseSpheresLength = baseSpheres.length;

            this.tetrahedronLines = [];

            for (var i = 0; i < baseSpheresLength; i++) {

                firstPoint = baseSpheres[i].position;
                secondPoint = baseSpheres[(i + 1) % baseSpheresLength].position;

                vector = vector.subVectors(firstPoint, secondPoint);
                vector.divideScalar(numberOfLines);
                newPoint = firstPoint.clone();

                for (var j = 0; j < numberOfLines; j++) {
                    if (j !== 0) {
                        newPoint = newPoint.subVectors(newPoint, vector);
                    }

                    to = {
                        x: newPoint.x,
                        y: newPoint.y,
                        z: newPoint.z
                    };
                    //       this.scene.add(this.parent.drawLines(from, to));

                    fromVector = new THREE.Vector3(from.x, from.y, from.z);
                    toVector = new THREE.Vector3(to.x, to.y, to.z);
                    line = new THREE.Line3(fromVector, toVector);
                    this.tetrahedronLines.push(line);
                }
            }
        },

        _createCrossSectionForTetrahedron: function _createCrossSectionForTetrahedron() {

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
                tetrahedronSphereGroup = this.tetrahedronSphereGroup,
                firstPoint, secondPoint, thirdPoint,
                pointsArrLength = pointsArr.length;

            if (this.crossSection) {
                this.scene.remove(this.crossSection);
                this.crossSection = null;
                this.frontScene.remove(this.outlineMesh);
                this.outlineMesh = null;
            }

            if (pointsArrLength === maxPoints) {
                firstPoint = tetrahedronSphereGroup.getObjectByName(pointsArr[0]);
                secondPoint = tetrahedronSphereGroup.getObjectByName(pointsArr[1]);
                thirdPoint = tetrahedronSphereGroup.getObjectByName(pointsArr[2]);
                var plane = null,
                    collinearResult = this._checkNonCollinearPoints(pointsArr);

                if (collinearResult.result === true) {      //Cut using Plane forms curved shape
                    geometry = new THREE.Geometry();
                    plane = new THREE.Plane();
                    plane.setFromCoplanarPoints(firstPoint.position, secondPoint.position, thirdPoint.position)

                    this.parent.filterPoints(this.tetrahedronLines, plane, geometry);
                    
                    var geometryVerticesLength = geometry.vertices.length;

                    for (var i = 0; i < geometryVerticesLength - 2 ; i++) {
                        geometry.faces.push(new THREE.Face3(i + 1, i + 2, 0));
                    }
                    this.model.set('pointChecker', true);
                }
                else {
                    var pointsIndices = collinearResult.points;
                    if (pointsIndices.length !== 0) {
                        geometry = new THREE.Geometry();

                        firstPoint = tetrahedronSphereGroup.getObjectByName('sphere-' + pointsIndices[0] + '-position-' + pointsIndices[1]);
                        secondPoint = tetrahedronSphereGroup.getObjectByName('sphere-' + pointsIndices[2] + '-position-' + pointsIndices[3]);
                        thirdPoint = tetrahedronSphereGroup.getObjectByName('sphere-' + pointsIndices[4] + '-position-' + pointsIndices[5]);

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
                regexResult, collinearResult = {
                    result: false,
                    points: [],
                    errorType: 0
                }, noOfCorners,
                uniqueArr, uniqueArrLength, uniquePositionArr, uniquePositionArrLength,
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

            uniqueArr = this.parent.sortPoints(_.uniq(positionArr));
            uniqueArrLength = uniqueArr.length;

            noOfCorners = this.parent.countInstances('0', sphereIndicesArr);

            switch (noOfCorners) {

                case 0:
                    //Same Line
                    if (uniqueArrLength === 1) {
                        return collinearResult;
                    }

                    //Same Face
                    if (this._isSameFace(noOfCorners, uniqueArr, sphereIndicesArr, positionArr)) {
                        //Same Side Face
                        collinearResult.errorType = 1;
                        return collinearResult;
                    }

                    //Triangle
                    if (this._isTriangle(noOfCorners, uniqueArr, sphereIndicesArr, positionArr, collinearResult)) {
                        return collinearResult;
                    }

                    //Intersection
                    collinearResult.result = true;
                    return collinearResult;

                case 1:
                case 2:

                    //Same Line
                    if (this._isSameLine(noOfCorners, sphereIndicesArr, positionArr)) {
                        return collinearResult;
                    }

                    //Same Face
                    if (this._isSameFace(noOfCorners, uniqueArr, sphereIndicesArr, positionArr)) {
                        //Same Side Face
                        collinearResult.errorType = 1;
                        return collinearResult;
                    }

                    //Triangle
                    this._isTriangle(noOfCorners, uniqueArr, sphereIndicesArr, positionArr, collinearResult)
                    return collinearResult;


                case 3:
                    //Same Face
                    collinearResult.errorType = 1;
                    return collinearResult;

            }

        },

        _isTriangle: function _isTriangle(noOfCorners, uniqueArr, sphereIndicesArr, positionArr, collinearResult) {

            var points = [],
                sphereIndex1, sphereIndex2, sphereIndex3,
                positionIndex1, positionIndex2, positionIndex3,
                tetrahedronData = className.TETRAHEDRON_DATA,
                index2, lineDataPosition, index1,
                lineData = tetrahedronData.LINES_ADJOINING_CORNERS,
                cornerData = tetrahedronData.CORNER_NEIGHBOR.slice();

            switch (noOfCorners) {
                case 0:
                    if (uniqueArr.length === 2) {
                        index2 = this.parent.countInstances(uniqueArr[0], positionArr) > 1 ? 0 : 1;
                        index1 = (index2 + 1) % 2;
                        positionIndex3 = uniqueArr[index1];
                        sphereIndex3 = sphereIndicesArr[positionArr.indexOf(positionIndex3)];
                        points.push('0', cornerData[uniqueArr[index2]][0], '0', cornerData[uniqueArr[index2]][1], sphereIndex3, positionIndex3);
                        collinearResult.points = points;
                        return true;
                    }
                    else {
                        return false;
                    }
                case 1:
                    sphereIndex1 = sphereIndicesArr.indexOf('0');
                    positionIndex1 = positionArr[sphereIndex1];

                    index2 = _.difference([0, 1, 2], [sphereIndex1]);
                    lineDataPosition = lineData[positionIndex1];
                    positionIndex2 = positionArr[index2[0]];
                    sphereIndex2 = sphereIndicesArr[index2[0]];
                    positionIndex3 = positionArr[index2[1]];
                    sphereIndex3 = sphereIndicesArr[index2[1]];

                    if (lineDataPosition.indexOf(positionIndex2) > -1) {
                        points.push(sphereIndicesArr[sphereIndex1], positionIndex1);
                        points.push(sphereIndex3, positionIndex3);
                        points.push('0', this._findCorner(positionIndex1, positionIndex2));
                    }
                    else if (lineDataPosition.indexOf(positionIndex3) > -1) {
                        points.push(sphereIndicesArr[sphereIndex1], positionIndex1);
                        points.push(sphereIndex2, positionIndex2);
                        points.push('0', this._findCorner(positionIndex1, positionIndex3));
                    }
                    else {
                        points.push(sphereIndicesArr[0], positionArr[0], sphereIndicesArr[1], positionArr[1], sphereIndicesArr[2], positionArr[2]);
                    }
                    collinearResult.points = points;
                    return true;


                case 2:
                    points.push(sphereIndicesArr[0], positionArr[0], sphereIndicesArr[1], positionArr[1], sphereIndicesArr[2], positionArr[2]);
                    collinearResult.points = points;
                    return true;
            }


        },

        _findCorner: function _findCorner(firstCornerPosition, indexPosition) {

            var tetrahedronData = className.TETRAHEDRON_DATA,
                cornerData = this.parent.returnDeepCopy(tetrahedronData.CORNER_NEIGHBOR),
                cornerArr = cornerData[parseInt(indexPosition)];

            cornerArr.splice(cornerArr.indexOf(parseInt(firstCornerPosition)), 1);

            return cornerArr[0];
        },

        _isSameLine: function _isSameLine(noOfCorners, sphereIndicesArr, positionArr) {

            var tetrahedronData = className.TETRAHEDRON_DATA,
                index1,
                index2, index3,
                lineData = tetrahedronData.LINES_ADJOINING_CORNERS;

            switch (noOfCorners) {

                case 1:
                    index1 = sphereIndicesArr.indexOf('0');
                    index2 = _.difference([0, 1, 2], [index1]);
                    return ((positionArr[index2[0]] === positionArr[index2[1]]) &&
                            (lineData[positionArr[index1]].indexOf(positionArr[index2[0]])) > -1);

                case 2:
                    index1 = sphereIndicesArr.indexOf('0');
                    index2 = sphereIndicesArr.lastIndexOf('0');
                    index3 = _.difference([0, 1, 2], [index1, index2])[0];
                    return _.intersection(lineData[positionArr[index1]], lineData[positionArr[index2]])[0] === positionArr[index3];
            }

        },

        _isSameFace: function _isSameFace(noOfCorners, uniqueArr, sphereIndicesArr, positionArr) {

            var tetrahedronData = className.TETRAHEDRON_DATA,
                faceData = tetrahedronData.FACES, index1, index2, positionIndex1, index3,
                faceDataLength = faceData.length, lineDataPosition, positionIndex2,
                sphereIndex2, positionIndex3, sphereIndex3, dummyArr = ['0', '1', '2', '3', '4', '5'],
                lineData = tetrahedronData.LINES_ADJOINING_CORNERS;


            switch (noOfCorners) {
                case 0:
                    for (var i = 0; i < faceDataLength; i++) {
                        if (_.isEqual(uniqueArr, _.intersection(uniqueArr, faceData[i]))) {
                            return true;
                        }
                    }
                    return false;

                case 1:
                    index1 = sphereIndicesArr.indexOf('0');
                    positionIndex1 = positionArr[index1];

                    index2 = _.difference([0, 1, 2], [index1]);
                    lineDataPosition = lineData[positionIndex1];
                    positionIndex2 = positionArr[index2[0]];
                    sphereIndex2 = sphereIndicesArr[index2[0]];
                    positionIndex3 = positionArr[index2[1]];
                    sphereIndex3 = sphereIndicesArr[index2[1]];

                    if (lineDataPosition.indexOf(positionIndex2) > -1) {
                        index3 = this._findCorner(positionIndex1, positionIndex2);
                        return !(_.difference(dummyArr, _.union(lineData[index3], lineData[positionArr[index1]]))[0] === positionArr[index2[1]]);

                    }
                    else if (lineDataPosition.indexOf(positionIndex3) > -1) {
                        index3 = this._findCorner(positionIndex1, positionIndex3);
                        return !(_.difference(dummyArr, _.union(lineData[index3], lineData[positionArr[index1]]))[0] === positionArr[index2[0]]);
                    }

                    return (positionIndex2 === positionIndex3);
                case 2:
                    index1 = sphereIndicesArr.indexOf('0');
                    index2 = sphereIndicesArr.lastIndexOf('0');
                    index3 = _.difference([0, 1, 2], [index1, index2]);
                    return !(_.difference(dummyArr, _.union(lineData[positionArr[index1]], lineData[positionArr[index2]]))[0] === positionArr[index3]);

            }
        },

        getSphereGroup: function getSphereGroup() {
            return this.tetrahedronSphereGroup;
        },

        getSelectedSphereGroup: function getSphereGroup() {
            return this.selectedSphereGroup;
        },

        getLines: function getLines() {
            return this.tetrahedronLines;
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
            this.tetrahedron = null;
            this.tetrahedronSphereGroup = null;
            this.tetrahedronLines = null;
            this.eventManager = null;
        }

    }, {
        TETRAHEDRON_DATA: {
            CORNERS: [[0, 0], [0, 1], [0, 2], [0, 3]],  //[corner-piece-sphere-index,corner-piece-position]

            LINES_ADJOINING_CORNERS: [['0', '1', '2'], ['0', '3', '4'], ['1', '3', '5'], ['2', '4', '5']],  // Index is Corner position and array stores lines adjoining corners

            FACES: [['0', '2', '4'], ['3', '4', '5'], ['1', '2', '5'], ['0', '1', '3']],     //Faces

            CORNER_NEIGHBOR: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]
        },

        ORDERED_SPHERES: [[0, 1], 
                         [3, 0], [1, 4], [1, 3],
                         [2, 0], [2, 4], [2, 3],
                         [1, 0], [3, 4], [3, 3],
                         [0, 0], [1, 2], [2, 2], [3, 2],
                         [0, 3], [3, 5], [2, 5], [1, 5],
                         [0, 2], [3, 1], [2, 1], [1, 1]]
        });
})();