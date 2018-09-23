(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Views.TriangularPrism) {
        return;
    }
    var eventManagerModel = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer.EVENT_MANAGER_MODEL,
        className = null;
    /*
	*
	*   [[D E S C R I P T I O N]]
	*	
	* @class TriangularPrism
	* @namespace MathInteractives.Interactivities.ShapeSlicer.Views
    * @extends  MathInteractives.Common.Interactivities.ShapeSlicer.Views.Base
	* @constructor
	*/
    MathInteractives.Common.Interactivities.ShapeSlicer.Views.TriangularPrism = MathInteractives.Common.Player.Views.Base.extend({

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

        triangularPrism: null,

        triangularPrismSphereGroup: null,

        triangularPrismLinesGroup: null,

        selectedSphereGroup: null,

        triangularLines: null,

        eventManager: null,

        initialize: function (options) {
            this.parent = options.parent;
            this.name = options.name;
            this.eventManager = options.eventManager;
            className = MathInteractives.Common.Interactivities.ShapeSlicer.Views.TriangularPrism;
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

            this.triangularPrism = this._generatePrism();
            this.scene.add(this.triangularPrism);
            this._addLinesToPrism();
            this._addDummyPrismLines();

        },

        _generatePrismGeometry: function _generatePrismGeometry() {

            THREE.IsoscelesRightTriangularPrismGeometry = function (equalSide, otherSide, height) {

                THREE.Geometry.call(this);
                this.equalSide = equalSide;
                this.otherSide = otherSide;
                this.height = height;
                this.radialSegments = 3;
                this.heightSegments = 3;

                var x,
                y,
                vertices = [],
                uvs = [];

                var heightHalf = height / 2;

                for (y = 0; y <= this.heightSegments; y++) {

                    var verticesRow = [];
                    var uvsRow = [];
                    var oneThirdOtherSide = this.otherSide / 6;
                    var halfThirdSide = this.otherSide / 2;
                    var v = y / this.heightSegments;

                    // Do all 3 seperately

                    var u = 0 / 3;

                    var vertex = new THREE.Vector3();
                    vertex.x = 0;
                    vertex.y = -v * height + heightHalf;
                    vertex.z = oneThirdOtherSide * 2;

                    this.vertices.push(vertex);

                    verticesRow.push(this.vertices.length - 1);
                    uvsRow.push(new THREE.Vector2(u, 1 - v));

                    u = 1 / 3;

                    var vertex = new THREE.Vector3();
                    vertex.x = halfThirdSide;
                    vertex.y = -v * height + heightHalf;
                    vertex.z = -oneThirdOtherSide;

                    this.vertices.push(vertex);

                    verticesRow.push(this.vertices.length - 1);
                    uvsRow.push(new THREE.Vector2(u, 1 - v));

                    u = 2 / 3;

                    var vertex = new THREE.Vector3();
                    vertex.x = -halfThirdSide;
                    vertex.y = -v * height + heightHalf;
                    vertex.z = -oneThirdOtherSide;

                    this.vertices.push(vertex);

                    verticesRow.push(this.vertices.length - 1);
                    uvsRow.push(new THREE.Vector2(u, 1 - v));

                    u = 3 / 3;

                    var vertex = new THREE.Vector3();
                    vertex.x = 0;
                    vertex.y = -v * height + heightHalf;
                    vertex.z = oneThirdOtherSide * 2;

                    this.vertices.push(vertex);

                    verticesRow.push(this.vertices.length - 1);
                    uvsRow.push(new THREE.Vector2(u, 1 - v));

                    vertices.push(verticesRow);
                    uvs.push(uvsRow);

                }

                var tanTheta = 0;
                var na,
                nb;

                for (x = 0; x < this.radialSegments; x++) {


                    na = this.vertices[vertices[0][x]].clone();
                    nb = this.vertices[vertices[0][x + 1]].clone();

                    na.setY(Math.sqrt(na.x * na.x + na.z * na.z) * tanTheta).normalize();
                    nb.setY(Math.sqrt(nb.x * nb.x + nb.z * nb.z) * tanTheta).normalize();

                    for (y = 0; y < this.heightSegments; y++) {

                        var v1 = vertices[y][x];
                        var v2 = vertices[y + 1][x];
                        var v3 = vertices[y + 1][x + 1];
                        var v4 = vertices[y][x + 1];

                        var n1 = na.clone();
                        var n2 = na.clone();
                        var n3 = nb.clone();
                        var n4 = nb.clone();

                        var uv1 = uvs[y][x].clone();
                        var uv2 = uvs[y + 1][x].clone();
                        var uv3 = uvs[y + 1][x + 1].clone();
                        var uv4 = uvs[y][x + 1].clone();

                        this.faces.push(new THREE.Face4(v1, v2, v3, v4, [n1, n2, n3, n4]));
                        this.faceVertexUvs[0].push([uv1, uv2, uv3, uv4]);

                    }

                }

                // top cap


                this.vertices.push(new THREE.Vector3(0, heightHalf, 0));

                for (x = 0; x < this.radialSegments; x++) {

                    var v1 = vertices[0][x];
                    var v2 = vertices[0][x + 1];
                    var v3 = this.vertices.length - 1;

                    var n1 = new THREE.Vector3(0, 1, 0);
                    var n2 = new THREE.Vector3(0, 1, 0);
                    var n3 = new THREE.Vector3(0, 1, 0);

                    var uv1 = uvs[0][x].clone();
                    var uv2 = uvs[0][x + 1].clone();
                    var uv3 = new THREE.Vector2(uv2.u, 0);

                    this.faces.push(new THREE.Face3(v1, v2, v3, [n1, n2, n3]));
                    this.faceVertexUvs[0].push([uv1, uv2, uv3]);

                }

                // bottom cap


                this.vertices.push(new THREE.Vector3(0, -heightHalf, 0));

                for (x = 0; x < this.radialSegments; x++) {

                    var v1 = vertices[y][x + 1];
                    var v2 = vertices[y][x];
                    var v3 = this.vertices.length - 1;

                    var n1 = new THREE.Vector3(0, -1, 0);
                    var n2 = new THREE.Vector3(0, -1, 0);
                    var n3 = new THREE.Vector3(0, -1, 0);

                    var uv1 = uvs[y][x + 1].clone();
                    var uv2 = uvs[y][x].clone();
                    var uv3 = new THREE.Vector2(uv2.u, 1);

                    this.faces.push(new THREE.Face3(v1, v2, v3, [n1, n2, n3]));
                    this.faceVertexUvs[0].push([uv1, uv2, uv3]);

                }

                this.computeCentroids();
                this.computeFaceNormals();

            }

            THREE.IsoscelesRightTriangularPrismGeometry.prototype = Object.create(THREE.Geometry.prototype);
            THREE.IsoscelesRightTriangularPrismGeometry.prototype.constructor = THREE.IsoscelesRightTriangularPrismGeometry;

        },

        _generatePrism: function _generatePrism() {


            var material, triangularPrism,
                height = this.model.get('height'),
                side = this.model.get('side'),
                otherSide = this.model.get('otherSide'),
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

            this._generatePrismGeometry();

            triangularPrism = new THREE.Mesh(new THREE.IsoscelesRightTriangularPrismGeometry(side, otherSide, height), material);

            return triangularPrism;

        },

        _addLinesToPrism: function _addLinesToPrism() {


            var numberOfClickableSpheres = this.model.get('numberOfClickableSpheres'),
                triangularPrism = this.triangularPrism, sphereOfTriangularPrism,
                triangularPrismGeometry = triangularPrism.geometry,
                triangularPrismVertices = triangularPrismGeometry.vertices,
                height = this.model.get('height'),
                side = this.model.get('side'),
                otherSide = this.model.get('otherSide'),
                indexValue = className.INDEX_VALUE,
                line, triangularPrismLinesGroupChildren, triangularPrismLinesGroupChildrenLength,
                vertices, firstPoint, secondPoint, vector = new THREE.Vector3(),
                newPoint = new THREE.Vector3(),
                center = triangularPrism.position,
                oneThirdOtherSide = otherSide / 6,
                halfThirdSide = otherSide / 2,
                triangularPrismVertices = [{
                    x: 0,
                    y: center.y + height / 2,
                    z: center.z + (oneThirdOtherSide * 2)
                }, {
                    x: center.x + halfThirdSide,
                    y: center.y + height / 2,
                    z: center.z - oneThirdOtherSide
                }, {
                    x: center.x - halfThirdSide,
                    y: center.y + height / 2,
                    z: center.z - oneThirdOtherSide
                },
                {
                    x: 0,
                    y: center.y - height / 2,
                    z: center.z + (oneThirdOtherSide * 2)
                }, {
                    x: center.x + halfThirdSide,
                    y: center.y - height / 2,
                    z: center.z - oneThirdOtherSide
                }, {
                    x: center.x - halfThirdSide,
                    y: center.y - height / 2,
                    z: center.z - oneThirdOtherSide
                }],
               triangularPrismVerticesLength = triangularPrismVertices.length / 2,
               to = null,
               to1 = null,
               to2 = null,
               from = null;

            this.triangularPrismSphereGroup = new THREE.Object3D();
            this.triangularPrismLinesGroup = new THREE.Object3D();
            this.selectedSphereGroup = new THREE.Object3D();

            for (var i = 0; i < triangularPrismVerticesLength; i++) {

                from = triangularPrismVertices[i];
                to = triangularPrismVertices[(i + 1) % triangularPrismVerticesLength];

                this.triangularPrismLinesGroup.add(this.parent.drawLines(from, to));

                sphereOfTriangularPrism = this.parent.generateClickableSphere();
                sphereOfTriangularPrism.position.set(from.x, from.y, from.z);
                sphereOfTriangularPrism.name = 'sphere-0-position-' + i;
                this.triangularPrismSphereGroup.add(sphereOfTriangularPrism);

                to1 = triangularPrismVertices[(i + 3)];
                this.triangularPrismLinesGroup.add(this.parent.drawLines(from, to1));

                sphereOfTriangularPrism = this.parent.generateClickableSphere();
                sphereOfTriangularPrism.position.set(to1.x, to1.y, to1.z);
                sphereOfTriangularPrism.name = 'sphere-0-position-' + (i + 3);
                this.triangularPrismSphereGroup.add(sphereOfTriangularPrism);

                if (i !== 2) {
                    to2 = triangularPrismVertices[(i + 4)];
                }
                else {
                    to2 = triangularPrismVertices[(i + 1)];
                }

                this.triangularPrismLinesGroup.add(this.parent.drawLines(to1, to2));
            }


            triangularPrismLinesGroupChildren = this.triangularPrismLinesGroup.children;
            triangularPrismLinesGroupChildrenLength = triangularPrismLinesGroupChildren.length;

            for (var i = 0; i < triangularPrismLinesGroupChildrenLength; i++) {

                vertices = triangularPrismLinesGroupChildren[i].geometry.vertices;
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

                    sphereOfTriangularPrism = this.parent.generateClickableSphere();
                    sphereOfTriangularPrism.position.set(from.x, from.y, from.z);
                    sphereOfTriangularPrism.name = 'sphere-' + (j + indexValue) + '-position-' + (i + 1);

                    this.triangularPrismSphereGroup.add(sphereOfTriangularPrism);
                }
            }

            this.triangularPrismSphereGroup.children = this.parent.reOrderSpheres(this.triangularPrismSphereGroup, className.ORDERED_SPHERES);
            this.scene.add(this.triangularPrismSphereGroup);
            this.scene.add(this.triangularPrismLinesGroup);
            this.frontScene.add(this.selectedSphereGroup);
        },

        _addDummyPrismLines: function _addDummyPrismLines() {

            var numberOfLines = this.model.get('numberOfDummyLines'),
                line, triangularPrismSphereGroup = this.triangularPrismSphereGroup, fromVector, toVector,
                from, height = this.model.get('height'),
                vector = new THREE.Vector3(),
                newPoint = new THREE.Vector3(), firstPoint, secondPoint;

            this.triangularLines = [];

            for (var i = 0; i < 3; i++) {

                firstPoint = triangularPrismSphereGroup.getObjectByName('sphere-0-position-' + i).position;
                secondPoint = triangularPrismSphereGroup.getObjectByName('sphere-0-position-' + (i + 1) % 3).position;

                vector = vector.subVectors(firstPoint, secondPoint);
                vector.divideScalar(numberOfLines);
                newPoint = firstPoint.clone();
                for (var j = 0; j < numberOfLines; j++) {
                    if (j !== 0) {
                        newPoint = newPoint.subVectors(newPoint, vector);
                    }

                    from = {
                        x: newPoint.x,
                        y: newPoint.y,
                        z: newPoint.z
                    };

                    fromVector = new THREE.Vector3(from.x, from.y, from.z);
                    toVector = new THREE.Vector3(from.x, from.y - height, from.z);
                    line = new THREE.Line3(fromVector, toVector);
                    this.triangularLines.push(line);
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
                triangularPrismSphereGroup = this.triangularPrismSphereGroup,
                firstPoint, secondPoint, thirdPoint, fourthPoint,
                pointsArrLength = pointsArr.length;

            if (this.crossSection) {
                this.scene.remove(this.crossSection);
                this.crossSection = null;
                this.frontScene.remove(this.outlineMesh);
                this.outlineMesh = null;
            }

            if (pointsArrLength === maxPoints) {
                firstPoint = triangularPrismSphereGroup.getObjectByName(pointsArr[0]);
                secondPoint = triangularPrismSphereGroup.getObjectByName(pointsArr[1]);
                thirdPoint = triangularPrismSphereGroup.getObjectByName(pointsArr[2]);
                var plane = null,
                 collinearResult = this._checkNonCollinearPoints(pointsArr);

                if (collinearResult.result === true) {      //Cut using Plane forms curved shape
                    geometry = new THREE.Geometry();
                    plane = new THREE.Plane();
                    plane.setFromCoplanarPoints(firstPoint.position, secondPoint.position, thirdPoint.position)

                    this.parent.filterPoints(this.triangularLines, plane, geometry);

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
                        firstPoint = triangularPrismSphereGroup.getObjectByName('sphere-' + pointsIndices[0] + '-position-' + pointsIndices[1]);
                        secondPoint = triangularPrismSphereGroup.getObjectByName('sphere-' + pointsIndices[2] + '-position-' + pointsIndices[3]);
                        thirdPoint = triangularPrismSphereGroup.getObjectByName('sphere-' + pointsIndices[4] + '-position-' + pointsIndices[5]);
                        fourthPoint = triangularPrismSphereGroup.getObjectByName('sphere-' + pointsIndices[6] + '-position-' + pointsIndices[7]);

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

                    //Rectangle
                    if (this._isRectangle(noOfCorners, uniqueArr, sphereIndicesArr, positionArr, collinearResult)) {
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

                    //Rectangle
                    if (this._isRectangle(noOfCorners, uniqueArr, sphereIndicesArr, positionArr, collinearResult)) {
                        return collinearResult;
                    }


                    //Intersection
                    collinearResult.result = true;
                    return collinearResult;

                case 3:
                    //Same Face
                    if (this._isSameFace(noOfCorners, uniqueArr, sphereIndicesArr, positionArr)) {
                        //Same Side Face
                        collinearResult.errorType = 1;
                        return collinearResult;
                    }

                    collinearResult.result = true;
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
                    face1Arr = verTexToFace[positionArr[0]];
                    face2Arr = verTexToFace[positionArr[1]];
                    face3Arr = verTexToFace[positionArr[2]];

                    return (_.intersection(face1Arr, face2Arr, face3Arr).length > 0);
            }
        },

        _isRectangle: function _isRectangle(noOfCorners, uniqueArr, sphereIndicesArr, positionArr, collinearResult) {

            var points = [],
                sphereIndex1, sphereIndex2, sphereIndex3,
                positionIndex1, positionIndex2, positionIndex3,
                index2, lineDataPosition, index1,
                lineData = className.VERTEX_TO_LINE,
                lineToVertex = className.LINE_TO_VERTEX,
                faceToLine = className.FACE_TO_LINE,
                lineToFace = className.LINE_TO_FACE,
                oppositeLines = className.OPPOSITE_LINES,
                lineArr1, lineArr2, lineArr3, orderOfIndex = [], isCollinear = false,
                intersectionLine, lineCorners;

            lineArr1 = sphereIndicesArr[0] === 0 ? lineData[positionArr[0]] : [positionArr[0]];
            lineArr2 = sphereIndicesArr[1] === 0 ? lineData[positionArr[1]] : [positionArr[1]];
            lineArr3 = sphereIndicesArr[2] === 0 ? lineData[positionArr[2]] : [positionArr[2]];

            index2 = _.intersection(lineArr1, lineArr2).length > 0 ? [lineArr1, lineArr2, 2] :
            (_.intersection(lineArr1, lineArr3).length > 0 ? [lineArr1, lineArr3, 1] :
            (_.intersection(lineArr2, lineArr3).length > 0 ? [lineArr2, lineArr3, 0] : []))


            if (index2.length > 0) {
                intersectionLine = _.intersection(index2[0], index2[1]);
                if (faceToLine[4].indexOf(intersectionLine[0]) === -1 && faceToLine[5].indexOf(intersectionLine[0]) === -1) {  //If does not lie on  base top and bottom
                    lineCorners = lineToVertex[intersectionLine[0]];
                    points.push(0, lineCorners[0]);
                    points.push(0, lineCorners[1]);


                    if (faceToLine[4].indexOf(positionArr[index2[2]]) !== -1) {
                        //Third point Lies on Top 
                        points.push(sphereIndicesArr[index2[2]], oppositeLines[positionArr[index2[2]]]);
                        points.push(sphereIndicesArr[index2[2]], positionArr[index2[2]]);
                    }
                    else if (faceToLine[5].indexOf(positionArr[index2[2]]) !== -1) {
                        //Third point Lies on Bottom 
                        points.push(sphereIndicesArr[index2[2]], positionArr[index2[2]]);
                        points.push(sphereIndicesArr[index2[2]], oppositeLines[positionArr[index2[2]]]);
                    }

                    collinearResult.points = points;
                    return true;
                }
                else {
                    // Line Lies on Base or Top
                    return false;
                }
            }
            else {

                if (sphereIndicesArr[0] !== 0 && sphereIndicesArr[0] === sphereIndicesArr[1] && oppositeLines[positionArr[0]] === positionArr[1]) {
                    //Points are Collinear To each other

                    orderOfIndex.push(0, 1, 2);
                    isCollinear = true;
                }
                if (!isCollinear && sphereIndicesArr[1] !== 0 && sphereIndicesArr[1] === sphereIndicesArr[2] && oppositeLines[positionArr[1]] === positionArr[2]) {
                    //Points are Collinear To each other

                    orderOfIndex.push(1, 2, 0);
                    isCollinear = true;
                }
                if (!isCollinear && sphereIndicesArr[2] !== 0 && sphereIndicesArr[0] === sphereIndicesArr[2] && oppositeLines[positionArr[0]] === positionArr[2]) {
                    //Points are Collinear To each other
                    orderOfIndex.push(2, 0, 1);
                    isCollinear = true;
                }

                if (isCollinear === true) {
                    return this._getFourthPoint(orderOfIndex, sphereIndicesArr, positionArr, collinearResult);
                }
                else {
                    return false;
                }

            }

        },
        _getFourthPoint: function _getFourthPoint(orderOfIndex, sphereIndicesArr, positionArr, collinearResult) {

            var verticalLines = className.VERTICAL_LINES,
            oppositeLines = className.OPPOSITE_LINES,
                lineToVertex = className.LINE_TO_VERTEX,
                vertexToFace = className.VERTEX_TO_FACE,
                lineToFace = className.LINE_TO_FACE,
                cornerPtsArr = [], isCornerLine = false,
                points = [];


            points.push(sphereIndicesArr[orderOfIndex[0]], positionArr[orderOfIndex[0]]);
            points.push(sphereIndicesArr[orderOfIndex[1]], positionArr[orderOfIndex[1]]);

            if (sphereIndicesArr[orderOfIndex[2]] === 0) {
                cornerPtsArr.push(positionArr[orderOfIndex[2]]);
                cornerPtsArr.push((positionArr[orderOfIndex[2]] + 3) % 6);
                isCornerLine = true;
            }
            else if (verticalLines.indexOf(positionArr[orderOfIndex[2]]) > -1) {
                //Third Point is a corner or lies on vertical lines
                //Select the corner Points of the Line as the other two Points

                cornerPtsArr = lineToVertex[positionArr[orderOfIndex[2]]];
                isCornerLine = true;
            }


            if (isCornerLine) {
                //Order the spheres
                //Check if 1 of the corner points found above lies on the same face as that of the second point
                //if yes then push that corner 1st and then the other one
                //else push it in the opposite order

                if (_.intersection(vertexToFace[cornerPtsArr[0]], lineToFace[positionArr[orderOfIndex[1]]]).length > 0) {
                    points.push(0, cornerPtsArr[0]);
                    points.push(0, cornerPtsArr[1]);
                }
                else {
                    points.push(0, cornerPtsArr[1]);
                    points.push(0, cornerPtsArr[0]);
                }
            }
            else {

                if (_.intersection(lineToFace[positionArr[orderOfIndex[2]]], lineToFace[positionArr[orderOfIndex[1]]]).length > 0) {
                    points.push(sphereIndicesArr[orderOfIndex[2]], positionArr[orderOfIndex[2]]);
                    points.push(sphereIndicesArr[orderOfIndex[2]], oppositeLines[positionArr[orderOfIndex[2]]]);
                }
                else {
                    points.push(sphereIndicesArr[orderOfIndex[2]], oppositeLines[positionArr[orderOfIndex[2]]]);
                    points.push(sphereIndicesArr[orderOfIndex[2]], positionArr[orderOfIndex[2]]);
                }

            }

            collinearResult.points = points;
            return true;
        },

        getSphereGroup: function getSphereGroup() {
            return this.triangularPrismSphereGroup;
        },

        getSelectedSphereGroup: function getSphereGroup() {
            return this.selectedSphereGroup;
        },

        getLines: function getLines() {
            return this.triangularLines;
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
            this.triangularPrism = null;
            this.triangularPrismSphereGroup = null;
            this.triangularPrismLinesGroup = null;
            this.triangularLines = null;
            this.eventManager = null;
        }


    }, {
        INDEX_VALUE: 10,

        VERTEX_TO_LINE: {
            '0': [1, 2, 7],
            '1': [1, 4, 5],
            '2': [4, 7, 8],
            '3': [2, 3, 9],
            '4': [3, 5, 6],
            '5': [6, 8, 9]
        },
        LINE_TO_VERTEX: {
            '1': [0, 1],
            '2': [0, 3],
            '3': [3, 4],
            '4': [1, 2],
            '5': [1, 4],
            '6': [4, 5],
            '7': [0, 2],
            '8': [2, 5],
            '9': [3, 5]
        },
        VERTEX_TO_FACE: {
            '0': [1, 3, 4],
            '1': [2, 3, 4],
            '2': [1, 2, 4],
            '3': [1, 3, 5],
            '4': [2, 3, 5],
            '5': [1, 2, 5]
        },
        FACE_TO_VERTEX: {
            '1': [0, 2, 3, 5],
            '2': [1, 2, 4, 5],
            '3': [0, 1, 3, 4],
            '4': [0, 1, 2],
            '5': [3, 4, 5],
        },
        FACE_TO_LINE: {
            '1': [2, 7, 8, 9],
            '2': [4, 5, 6, 8],
            '3': [1, 2, 3, 5],
            '4': [1, 4, 7],
            '5': [3, 6, 9],
        },
        LINE_TO_FACE: {
            '1': [3, 4],
            '2': [1, 3],
            '3': [3, 5],
            '4': [2, 4],
            '5': [2, 3],
            '6': [2, 5],
            '7': [1, 4],
            '8': [1, 2],
            '9': [1, 5]
        },

        OPPOSITE_LINES: {
            '1': 3,
            '3': 1,
            '4': 6,
            '6': 4,
            '7': 9,
            '9': 7
        },

        VERTICAL_LINES: [2, 5, 8],

        ORDERED_SPHERES: [[0, 0], [13, 7], [12, 7], [11, 7], [0, 2], [13, 4], [12, 4], [11, 4], [0, 1], [13, 1], [12, 1], [11, 1],
                        [11, 2], [11, 8], [11, 5],
                         [12, 2], [12, 8], [12, 5],
                         [13, 2], [13, 8], [13, 5],
                         [0, 3], [13, 9], [12, 9], [11, 9], [0, 5], [13, 6], [12, 6], [11, 6], [0, 4], [13, 3], [12, 3], [11, 3]]
    });
})();