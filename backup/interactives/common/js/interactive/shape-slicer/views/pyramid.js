(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Views.Pyramid) {
        return;
    }
    var eventManagerModel = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer.EVENT_MANAGER_MODEL,
        className = null;
    /*
	*
	*   [[D E S C R I P T I O N]]
	*	
	* @class Pyramid
	* @namespace MathInteractives.Interactivities.ShapeSlicer.Views
    * @extends  MathInteractives.Common.Interactivities.ShapeSlicer.Views.Base
	* @constructor
	*/
    MathInteractives.Common.Interactivities.ShapeSlicer.Views.Pyramid = MathInteractives.Common.Player.Views.Base.extend({

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

        pyramid: null,

        pyramidSphereGroup: null,

        selectedSphereGroup: null,

        pyramidLines: null,

        eventManager: null,

        initialize: function (options) {
            this.parent = options.parent;
            this.name = options.name;
            this.eventManager = options.eventManager;
            className = MathInteractives.Common.Interactivities.ShapeSlicer.Views.Pyramid;
            this.parent.initializeThreeJS(this);
            this.render();
            this.attachEventListeners();
        },

        render: function render() {
            this._createPyramid();
        },

        attachEventListeners: function attachEventListeners() {
            var self = this;

            this.model.on('change:pointsArr', $.proxy(self._createCrossSectionForPyramid, self));
            this.eventManager.on(eventManagerModel.CREATE_CROSSSECTION, $.proxy(self._createCrossSectionForPyramid), self);
        },

        _createPyramid: function _createPyramid() {

            this.pyramid = this._generatePyramid();
            this.scene.add(this.pyramid);
            this._addLineToPyramid();
            this._addDummyPyramidLines();

        },

        _generatePyramid: function _generatePyramid() {


            var material, pyramid,
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

            pyramid = new THREE.Mesh(new THREE.CylinderGeometry(0, radius, height, radiusSegments, heightSegments, false), material);

            pyramid.position.y += height / 4;

            return pyramid;

        },

        _addLineToPyramid: function _addLineToPyramid() {

            var numberOfClickableSpheres = this.model.get('numberOfClickableSpheres'),
                pyramid = this.pyramid, sphereOfPyramid,
                pyramidGeometry = pyramid.geometry,
                pyramidVertices = pyramidGeometry.vertices,
                height = this.model.get('height'),
                rootTwo = Math.sqrt(2),
                radius = this.model.get('radius') * rootTwo, to, to1, top, from,
                indexValue = className.INDEX_VALUE,
                line, pyramidLinesGroupChildren, pyramidLinesGroupChildrenLength,
                vertices, firstPoint, secondPoint, vector = new THREE.Vector3(),
                newPoint = new THREE.Vector3(),
                center = pyramid.position,
                pyramidVertices = [{
                    x: center.x,
                    y: center.y + height / 2,
                    z: center.z
                }, {
                    x: center.x - radius / rootTwo,
                    y: center.y - height / 2,
                    z: center.z
                }, {
                    x: center.x,
                    y: center.y - height / 2,
                    z: center.z - radius / rootTwo
                }, {
                    x: center.x + radius / rootTwo,
                    y: center.y - height / 2,
                    z: center.z
                }, {
                    x: center.x,
                    y: center.y - height / 2,
                    z: center.z + radius / rootTwo
                }],
                pyramidVerticesLength = pyramidVertices.length;

            this.pyramidSphereGroup = new THREE.Object3D();
            this.pyramidLinesGroup = new THREE.Object3D();
            this.selectedSphereGroup = new THREE.Object3D();

            top = pyramidVertices[0];

            sphereOfPyramid = this.parent.generateClickableSphere();
            sphereOfPyramid.position.set(top.x, top.y, top.z);
            sphereOfPyramid.name = 'sphere-0-position-0';
            this.pyramidSphereGroup.add(sphereOfPyramid);

            for (var i = 1; i < pyramidVerticesLength; i++) {

                to = pyramidVertices[i];
                this.pyramidLinesGroup.add(this.parent.drawLines(top, to));

                sphereOfPyramid = this.parent.generateClickableSphere();
                sphereOfPyramid.position.set(to.x, to.y, to.z);
                sphereOfPyramid.name = 'sphere-0-position-' + i;
                this.pyramidSphereGroup.add(sphereOfPyramid);

                to1 = pyramidVertices[(i + 1) % pyramidVerticesLength];
                if (i === pyramidVerticesLength - 1) {
                    to1 = pyramidVertices[(i + 2) % pyramidVerticesLength];
                }
                this.pyramidLinesGroup.add(this.parent.drawLines(to, to1));
            }


            pyramidLinesGroupChildren = this.pyramidLinesGroup.children;
            pyramidLinesGroupChildrenLength = pyramidLinesGroupChildren.length;

            for (var i = 0; i < pyramidLinesGroupChildrenLength; i++) {

                vertices = pyramidLinesGroupChildren[i].geometry.vertices;
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

                    sphereOfPyramid = this.parent.generateClickableSphere();
                    sphereOfPyramid.position.set(from.x, from.y, from.z);
                    if (i !== 5 || i !== 7) {
                        sphereOfPyramid.name = 'sphere-' + (j + indexValue) + '-position-' + (i + 1);
                    }
                    else {
                        sphereOfPyramid.name = 'sphere-' + ((3 % j) + indexValue) + '-position-' + (i + 1);
                    }
                    this.pyramidSphereGroup.add(sphereOfPyramid);
                }
            }

            this.pyramidSphereGroup.children = this.parent.reOrderSpheres(this.pyramidSphereGroup, className.ORDERED_SPHERES);
            this.scene.add(this.pyramidSphereGroup);
            this.scene.add(this.pyramidLinesGroup);
            this.frontScene.add(this.selectedSphereGroup);
        },

        _addDummyPyramidLines: function _addDummyPyramidLines() {

            var numberOfLines = this.model.get('numberOfDummyLines'),
                 line, pyramidSphereGroup = this.pyramidSphereGroup, fromVector, toVector,
                 sphereTop = pyramidSphereGroup.getObjectByName('sphere-0-position-0'),
                 sphereTopPosition = sphereTop.position, baseSpheres = [], baseSpheresLength,
                 from = {
                     x: sphereTopPosition.x,
                     y: sphereTopPosition.y,
                     z: sphereTopPosition.z
                 }, to,
                 vector = new THREE.Vector3(),
                 newPoint = new THREE.Vector3(), firstPoint, secondPoint;


            for (var i = 1; i < 5; i++) {
                baseSpheres.push(pyramidSphereGroup.getObjectByName('sphere-0-position-' + i));
            }

            baseSpheresLength = baseSpheres.length;

            this.pyramidLines = [];

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

                    fromVector = new THREE.Vector3(from.x, from.y, from.z);
                    toVector = new THREE.Vector3(to.x, to.y, to.z);
                    line = new THREE.Line3(fromVector, toVector);
                    this.pyramidLines.push(line);
                }
            }

        },

        _createCrossSectionForPyramid: function _createCrossSectionForPyramid() {

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
               geometryVerticesLength = null,
               pyramidSphereGroup = this.pyramidSphereGroup,
               firstPoint, secondPoint, thirdPoint,
               pointsArrLength = pointsArr.length;

            if (this.crossSection) {
                this.scene.remove(this.crossSection);
                this.crossSection = null;
                this.frontScene.remove(this.outlineMesh);
                this.outlineMesh = null;
            }

            if (pointsArrLength === maxPoints) {
                firstPoint = pyramidSphereGroup.getObjectByName(pointsArr[0]);
                secondPoint = pyramidSphereGroup.getObjectByName(pointsArr[1]);
                thirdPoint = pyramidSphereGroup.getObjectByName(pointsArr[2]);
                var plane = null,
                 collinearResult = this._checkNonCollinearPoints(pointsArr);

                if (collinearResult.result === true) {      //Cut using Plane forms curved shape
                    geometry = new THREE.Geometry();
                    plane = new THREE.Plane();
                    plane.setFromCoplanarPoints(firstPoint.position, secondPoint.position, thirdPoint.position)

                    this.parent.filterPoints(this.pyramidLines, plane, geometry);
                    geometryVerticesLength = geometry.vertices.length;

                    for (var i = 0; i < geometryVerticesLength - 2 ; i++) {
                        geometry.faces.push(new THREE.Face3(i + 1, i + 2, 0));
                    }
                    this.model.set('pointChecker', true);
                }
                else {
                    var pointsIndices = collinearResult.points;
                    if (pointsIndices.length !== 0) {
                        geometry = new THREE.Geometry();
                        firstPoint = pyramidSphereGroup.getObjectByName('sphere-' + pointsIndices[0] + '-position-' + pointsIndices[1]);
                        secondPoint = pyramidSphereGroup.getObjectByName('sphere-' + pointsIndices[2] + '-position-' + pointsIndices[3]);
                        thirdPoint = pyramidSphereGroup.getObjectByName('sphere-' + pointsIndices[4] + '-position-' + pointsIndices[5]);

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
            sphereIndicesArr.push(parseInt(regexResult[0]));
            positionArr.push(parseInt(regexResult[1]));

            regexResult = pointsArr[1].match(regex);
            sphereIndicesArr.push(parseInt(regexResult[0]));
            positionArr.push(parseInt(regexResult[1]));

            regexResult = pointsArr[2].match(regex);
            sphereIndicesArr.push(parseInt(regexResult[0]));
            positionArr.push(parseInt(regexResult[1]));

            uniqueArr = this.parent.sortPoints(_.uniq(positionArr));
            uniqueArrLength = uniqueArr.length;

            noOfCorners = this.parent.countInstances(0, sphereIndicesArr);

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
                    if (this._isTriangle(noOfCorners, uniqueArr, sphereIndicesArr, positionArr, collinearResult)) {
                        return collinearResult;
                    }

                    collinearResult.result = true;
                    return collinearResult;

                case 3:
                    //Same Face
                    if (this._isSameFace(noOfCorners, uniqueArr, sphereIndicesArr, positionArr)) {
                        collinearResult.errorType = 1;
                        return collinearResult;
                    }

                    collinearResult.points = [0, positionArr[0], 0, positionArr[1], 0, positionArr[2]];
                    return collinearResult;
            }

        },


        _isSameLine: function _isSameLine(noOfCorners, sphereIndicesArr, positionArr) {

            var index1,
                index2, index3,
                lineData = className.VERTEX_TO_LINE;

            switch (noOfCorners) {

                case 1:
                    index1 = sphereIndicesArr.indexOf(0);
                    index2 = _.difference([0, 1, 2], [index1]);
                    return ((positionArr[index2[0]] === positionArr[index2[1]]) &&
                            (lineData[positionArr[index1]].indexOf(positionArr[index2[0]])) > -1);

                case 2:
                    index1 = sphereIndicesArr.indexOf(0);
                    index2 = sphereIndicesArr.lastIndexOf(0);
                    index3 = _.difference([0, 1, 2], [index1, index2])[0];
                    return _.intersection(lineData[positionArr[index1]], lineData[positionArr[index2]])[0] === positionArr[index3];
            }

        },

        _isSameFace: function _isSameFace(noOfCorners, uniqueArr, sphereIndicesArr, positionArr) {

            var faceData = className.FACE_TO_LINE,
                verTexToFace = className.VERTEX_TO_FACE,
                lineToFace = className.LINE_TO_FACE,
                index1, index2, index3,
                positionIndex1, positionIndex2, positionIndex3,
                face1Arr, face2Arr, face3Arr;


            switch (noOfCorners) {
                case 0:
                    for (var i in faceData) {
                        if (_.isEqual(uniqueArr, _.intersection(uniqueArr, faceData[i]))) {
                            return true;
                        }
                    }
                    return false;

                case 1:
                    index1 = sphereIndicesArr.indexOf(0);
                    positionIndex1 = positionArr[index1];
                    face1Arr = verTexToFace[positionIndex1];

                    index2 = _.difference([0, 1, 2], [index1]);
                    positionIndex2 = positionArr[index2[0]];
                    positionIndex3 = positionArr[index2[1]];
                    face2Arr = lineToFace[positionIndex2];
                    face3Arr = lineToFace[positionIndex3];

                    return (_.intersection(face1Arr, face2Arr, face3Arr).length > 0);

                case 2:
                    index1 = sphereIndicesArr.indexOf(0);
                    positionIndex1 = positionArr[index1];
                    face1Arr = verTexToFace[positionIndex1];

                    index2 = sphereIndicesArr.lastIndexOf(0);
                    positionIndex2 = positionArr[index2];
                    face2Arr = verTexToFace[positionIndex2];

                    index3 = _.difference([0, 1, 2], [index1, index2])[0];
                    positionIndex3 = positionArr[index3];
                    face3Arr = lineToFace[positionIndex3];

                    return (_.intersection(face1Arr, face2Arr, face3Arr).length > 0);

                case 3:
                    positionIndex1 = positionArr[0];
                    face1Arr = verTexToFace[positionIndex1];

                    positionIndex2 = positionArr[1];
                    face2Arr = verTexToFace[positionIndex2];

                    positionIndex3 = positionArr[2];
                    face3Arr = verTexToFace[positionIndex3];

                    return (_.intersection(face1Arr, face2Arr, face3Arr).length > 0);
            }
        },

        _isTriangle: function _isTriangle(noOfCorners, uniqueArr, sphereIndicesArr, positionArr, collinearResult) {

            var points = [],
                sphereIndex1, sphereIndex2, sphereIndex3,
                positionIndex1, positionIndex2, positionIndex3,
                index2, lineDataPosition, index1,
                lineData = className.VERTEX_TO_LINE,
                lineToVertex = className.LINE_TO_VERTEX,
                topCornerIndex = positionArr.indexOf(0),
                  lineArr1, lineArr2, lineArr3,
                    intersectionLine, lineCorners;


            if (topCornerIndex > -1) {
                index2 = _.difference([0, 1, 2], [topCornerIndex]);
                lineArr1 = lineData[positionArr[topCornerIndex]];
                lineArr2 = sphereIndicesArr[index2[0]] === 0 ? lineData[positionArr[index2[0]]] : [positionArr[index2[0]]];
                lineArr3 = sphereIndicesArr[index2[1]] === 0 ? lineData[positionArr[index2[1]]] : [positionArr[index2[1]]];

                intersectionLine = _.intersection(lineArr1, lineArr2);
                points.push(0, 0);
                if (intersectionLine.length > 0) {
                    lineCorners = lineToVertex[intersectionLine[0]];
                    points.push(0, lineCorners[1]);
                }
                else {
                    points.push(sphereIndicesArr[index2[0]], positionArr[index2[0]]);
                }

                intersectionLine = _.intersection(lineArr1, lineArr3);
                if (intersectionLine.length > 0) {
                    lineCorners = lineToVertex[intersectionLine[0]];
                    points.push(0, lineCorners[1]);
                }
                else {
                    points.push(sphereIndicesArr[index2[1]], positionArr[index2[1]]);
                }
            }
            else {
                lineArr1 = sphereIndicesArr[0] === 0 ? lineData[positionArr[0]] : [positionArr[0]];
                lineArr2 = sphereIndicesArr[1] === 0 ? lineData[positionArr[1]] : [positionArr[1]];
                lineArr3 = sphereIndicesArr[2] === 0 ? lineData[positionArr[2]] : [positionArr[2]];


                index2 = _.intersection(lineArr1, lineArr2).length > 0 ? [lineArr1, lineArr2, 2] :
                (_.intersection(lineArr1, lineArr3).length > 0 ? [lineArr1, lineArr3, 1] :
                (_.intersection(lineArr2, lineArr3).length > 0 ? [lineArr2, lineArr3, 0] : []))


                if (index2.length > 0) {
                    intersectionLine = _.intersection(index2[0], index2[1]);
                    if (lineData[0].indexOf(intersectionLine[0]) !== -1) {  //If does not lie on  base
                        lineCorners = lineToVertex[intersectionLine[0]];
                        points.push(0, lineCorners[0]);
                        points.push(0, lineCorners[1]);
                    }
                    else {
                        //  Lies on Base
                        return false;
                    }
                }
                else {
                    // Do not lie on same line
                    return false;
                }

                if (sphereIndicesArr[index2[2]] === 0 || lineData[0].indexOf(positionArr[index2[2]]) === -1) {
                    //Lies on Base or is a corner point
                    points.push(sphereIndicesArr[index2[2]], positionArr[index2[2]]);
                }
                else {
                    lineCorners = lineToVertex[positionArr[index2[2]]];
                    points.push(0, lineCorners[1]);
                }
            }

            collinearResult.points = points;
            return true;


        },

        getSphereGroup: function getSphereGroup() {
            return this.pyramidSphereGroup;
        },

        getSelectedSphereGroup: function getSphereGroup() {
            return this.selectedSphereGroup;
        },

        getLines: function getLines() {
            return this.pyramidLines;
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
            this.pyramid = null;
            this.pyramidSphereGroup = null;
            this.pyramidLines = null;
            this.eventManager = null;
        }
    }, {
        INDEX_VALUE: 10,

        VERTEX_TO_LINE: {
            '0': [1, 3, 5, 7],
            '1': [1, 2, 8],
            '2': [2, 3, 4],
            '3': [4, 5, 6],
            '4': [6, 7, 9]
        },
        LINE_TO_VERTEX: {
            '1': [0, 1],
            '2': [1, 2],
            '3': [0, 2],
            '4': [2, 3],
            '5': [0, 3],
            '6': [3, 4],
            '7': [0, 4],
            '8': [1, 4]
        },
        VERTEX_TO_FACE: {
            '0': [1, 2, 3, 4],
            '1': [1, 2, 5],
            '2': [2, 3, 5],
            '3': [3, 4, 5],
            '4': [1, 4, 5]
        },
        FACE_TO_VERTEX: {
            '1': [0, 1, 4],
            '2': [0, 1, 2],
            '3': [0, 2, 3],
            '4': [0, 3, 4],
            '5': [1, 2, 3, 4],
        },
        FACE_TO_LINE: {
            '1': [1, 7, 8],
            '2': [1, 2, 3],
            '3': [3, 4, 5],
            '4': [5, 6, 7],
            '5': [2, 4, 6, 8],
        },
        LINE_TO_FACE: {
            '1': [1, 2],
            '2': [2, 5],
            '3': [2, 3],
            '4': [3, 5],
            '5': [3, 4],
            '6': [4, 5],
            '7': [1, 4],
            '8': [1, 5]
        },

        ORDERED_SPHERES: [[0, 0],
                         [11, 1], [11, 3], [11, 5], [11, 7],
                        [12, 1], [12, 3], [12, 5], [12, 7],
                         [13, 1], [13, 3], [13, 5], [13, 7],
                      [0, 1], [11, 2], [12, 2], [13, 2], [0, 2], [11, 4], [12, 4], [13, 4], [0, 3], [11, 6], [12, 6], [13, 6], [0, 4], [11, 8], [12, 8], [13, 8]]

    });
})();