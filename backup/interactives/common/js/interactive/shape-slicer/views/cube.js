(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Views.Cube) {
        return;
    }
    var eventManagerModel = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer.EVENT_MANAGER_MODEL,
        className = null;
    /*
	*
	*   [[D E S C R I P T I O N]]
	*	
	* @class Cube
	* @namespace MathInteractives.Interactivities.ShapeSlicer.Views
    * @extends  MathInteractives.Common.Interactivities.ShapeSlicer.Views.Base
	* @constructor
	*/
    MathInteractives.Common.Interactivities.ShapeSlicer.Views.Cube = MathInteractives.Common.Player.Views.Base.extend({

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

        cube: null,

        cubeSphereGroup: null,

        cubeLinesGroup: null,

        cubeSquareGroup: null,

        selectedSphereGroup: null,

        squareLines: null,

        eventManager: null,

        initialize: function (options) {
            this.parent = options.parent;
            this.name = options.name;
            this.eventManager = options.eventManager;
            className = MathInteractives.Common.Interactivities.ShapeSlicer.Views.Cube;
            this.parent.initializeThreeJS(this);
            this.render();
            this.attachEventListeners();
        },

        render: function render() {
            this._createCube();
        },

        attachEventListeners: function attachEventListeners() {

            var self = this;

            this.model.on('change:pointsArr', $.proxy(self._createCrossSectionForCube, self));
            this.eventManager.on(eventManagerModel.CREATE_CROSSSECTION, $.proxy(self._createCrossSectionForCube), self);
        },

        _createCube: function _createCube() {

            this.cube = this._generateCube();
            this.scene.add(this.cube);
            this._addLineToCube();
            this._addDummyCubeLines();

        },

        _generateCube: function _generateCube() {


            var material, cube, geometry,
                sideLength = this.model.get('sideLength'),
                materialDetails = this.parent.getMaterialDetails();

            material = new THREE.MeshBasicMaterial({
                color: materialDetails.COLOR,
                wireframe: false,
                transparent: true,
                opacity: materialDetails.OPACITY,
                depthWrite: false
            });


            geometry = new THREE.CubeGeometry(sideLength, sideLength, sideLength);

            cube = new THREE.Mesh(geometry, material);

            return cube;

        },


        _addLineToCube: function _addLineToCube() {

            var numberOfClickableSpheres = this.model.get('numberOfClickableSpheres'),
                cube = this.cube, sphereOfCube, indexValue = 20,
                cubeGeometry = cube.geometry,
                cubeVertices = cubeGeometry.vertices, index1, index2, index3, index4,
                cubeVerticesLength = cubeVertices.length, lineArray = className.FACE_TO_VERTEX[0], lineArrayLength = lineArray.length,
                from, to, line, cubeLinesGroupChildren, cubeLinesGroupChildrenLength,
                vertices, firstPoint, secondPoint, vector = new THREE.Vector3(),
                newPoint = new THREE.Vector3();

            this.cubeSphereGroup = new THREE.Object3D();
            this.cubeLinesGroup = new THREE.Object3D();
            this.selectedSphereGroup = new THREE.Object3D();

            for (var i = 0; i < cubeVerticesLength ; i++) {
                from = cubeVertices[i];

                sphereOfCube = this.parent.generateClickableSphere();
                sphereOfCube.position.set(from.x, from.y, from.z);
                sphereOfCube.name = 'sphere-' + i + '-position-0';

                this.cubeSphereGroup.add(sphereOfCube);
            }

            for (var i = 0; i < lineArrayLength; i++) {
                index1 = lineArray[i];
                index2 = lineArray[(i + 1) % lineArrayLength];
                index3 = index1 + 2;
                index4 = index2 + 2;
                from = cubeVertices[index1];
                to = cubeVertices[index2];
                this.cubeLinesGroup.add(this.parent.drawLines(from, to));

                to = cubeVertices[index3];
                this.cubeLinesGroup.add(this.parent.drawLines(from, to));

                from = cubeVertices[index4];
                this.cubeLinesGroup.add(this.parent.drawLines(to, from));

            }

            cubeLinesGroupChildren = this.cubeLinesGroup.children;
            cubeLinesGroupChildrenLength = cubeLinesGroupChildren.length;

            for (var i = 0; i < cubeLinesGroupChildrenLength; i++) {

                vertices = cubeLinesGroupChildren[i].geometry.vertices;
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

                    sphereOfCube = this.parent.generateClickableSphere();
                    sphereOfCube.position.set(from.x, from.y, from.z);
                    sphereOfCube.name = 'sphere-' + (j + indexValue) + '-position-' + (i + 1);

                    this.cubeSphereGroup.add(sphereOfCube);
                }
            }

            this.cubeSphereGroup.children = this.parent.reOrderSpheres(this.cubeSphereGroup, className.ORDERED_SPHERES);
            this.scene.add(this.cubeSphereGroup);
            this.scene.add(this.cubeLinesGroup);
            this.frontScene.add(this.selectedSphereGroup);
        },

        _addDummyCubeLines: function _addDummyCubeLines() {

            var numberOfLines = this.model.get('numberOfDummyLines'),
            line, sideLength = this.model.get('sideLength'),
            toVector, fromVector,
            cube = this.cube, index1, index2,
            cubeGeometry = cube.geometry,
            cubeVertices = cubeGeometry.vertices,
            lineArray = className.FACE_TO_VERTEX[0], lineArrayLength = lineArray.length,
            vector = new THREE.Vector3(),
            newPoint = new THREE.Vector3(),
             firstPoint, secondPoint;

            this.squareLines = [];

            for (var i = 0; i < lineArrayLength; i++) {
                index1 = lineArray[i];
                index2 = lineArray[(i + 1) % lineArrayLength];
                firstPoint = cubeVertices[index1];
                secondPoint = cubeVertices[index2];
                vector = vector.subVectors(firstPoint, secondPoint);
                vector.divideScalar(numberOfLines);
                newPoint = firstPoint.clone();

                for (var j = 0; j < numberOfLines; j++) {
                    if (j !== 0) {
                        newPoint = newPoint.subVectors(newPoint, vector);
                    }

                    fromVector = new THREE.Vector3(newPoint.x, newPoint.y, newPoint.z);

                    toVector = new THREE.Vector3(newPoint.x, newPoint.y - sideLength, newPoint.z);
                    line = new THREE.Line3(fromVector, toVector);
                    this.squareLines.push(line);
                }

            }
        },

        _createCrossSectionForCube: function _createCrossSectionForCube() {

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
                cubeSphereGroup = this.cubeSphereGroup,
                firstPoint, secondPoint, thirdPoint,
                pointsArrLength = pointsArr.length;

            if (this.crossSection) {
                this.scene.remove(this.crossSection);
                this.crossSection = null;
                this.frontScene.remove(this.outlineMesh);
                this.outlineMesh = null;
            }

            if (pointsArrLength === maxPoints) {

                firstPoint = cubeSphereGroup.getObjectByName(pointsArr[0]);
                secondPoint = cubeSphereGroup.getObjectByName(pointsArr[1]);
                thirdPoint = cubeSphereGroup.getObjectByName(pointsArr[2]);
                var plane = null,
                    collinearResult = this._checkNonCollinearPoints(pointsArr);

                if (collinearResult.result === true) {
                    geometry = new THREE.Geometry();
                    plane = new THREE.Plane();//Cut using Plane 
                    plane.setFromCoplanarPoints(firstPoint.position, secondPoint.position, thirdPoint.position)

                    this.parent.filterPoints(this.squareLines, plane, geometry);

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

                        firstPoint = cubeSphereGroup.getObjectByName('sphere-' + pointsIndices[0] + '-position-' + pointsIndices[1]).position;
                        secondPoint = cubeSphereGroup.getObjectByName('sphere-' + pointsIndices[2] + '-position-' + pointsIndices[3]).position;
                        thirdPoint = cubeSphereGroup.getObjectByName('sphere-' + pointsIndices[4] + '-position-' + pointsIndices[5]).position;
                        fourthPoint = cubeSphereGroup.getObjectByName('sphere-' + pointsIndices[6] + '-position-' + pointsIndices[7]).position;

                        geometry.vertices.push(firstPoint);
                        geometry.vertices.push(secondPoint);
                        geometry.vertices.push(thirdPoint);
                        geometry.vertices.push(fourthPoint);
                        geometry.vertices.push(firstPoint);

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

            noOfCorners = this.parent.countInstances(0, positionArr);

            //Same Line
            if (this._isSameLine(sphereIndicesArr, positionArr)) {
                return collinearResult;
            }

            //Same Face
            if (this._isSameFace(sphereIndicesArr, positionArr)) {
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


        },

        _isSameLine: function _isSameLine(sphereIndicesArr, positionArr) {

            var vertexToLine = className.VERTEX_TO_LINE,
                lineArr1, lineArr2, lineArr3;

            lineArr1 = positionArr[0] === 0 ? vertexToLine[sphereIndicesArr[0]] : [positionArr[0]];
            lineArr2 = positionArr[1] === 0 ? vertexToLine[sphereIndicesArr[1]] : [positionArr[1]];
            lineArr3 = positionArr[2] === 0 ? vertexToLine[sphereIndicesArr[2]] : [positionArr[2]];

            return ((_.intersection(lineArr1, lineArr2, lineArr3)).length === 1);
        },

        _isSameFace: function _isSameFace(sphereIndicesArr, positionArr) {

            var vertexToFace = className.VERTEX_TO_FACE,
                lineToFace = className.LINE_TO_FACE,
                faceArr1, faceArr2, faceArr3;

            faceArr1 = positionArr[0] === 0 ? vertexToFace[sphereIndicesArr[0]] : lineToFace[positionArr[0]];
            faceArr2 = positionArr[1] === 0 ? vertexToFace[sphereIndicesArr[1]] : lineToFace[positionArr[1]];
            faceArr3 = positionArr[2] === 0 ? vertexToFace[sphereIndicesArr[2]] : lineToFace[positionArr[2]];

            return ((_.intersection(faceArr1, faceArr2, faceArr3)).length === 1);
        },

        _isRectangle: function _isRectangle(noOfCorners, uniqueArr, sphereIndicesArr, positionArr, collinearResult) {

            var vertexToLine = className.VERTEX_TO_LINE,
                points = [], cornerPtsArr, sumOfIndex = className.SUM_OF_INDEX,
                lineToVertex = className.LINE_TO_VERTEX,
                line12 = null,
                line23 = null,
                line13 = null,
                oppositeLines = className.OPPOSITE_LINES,
                vertexToFace = className.VERTEX_TO_FACE,
                lineToFace = className.LINE_TO_FACE,
                thirdPointMapping = className.THIRD_POINT_MAPPING,
                thirdPoint = null,
                directionMapping = className.DIRECTION_MAPPING,
                lineArr1 = null,
                lineArr2 = null,
                lineArr3 = null,
                secondPoint = null,
                currLine = null,
                currIndex = null,
                currLineArr = null,
                currObject = null,
                directionObject = null,
                arr1 = null,
                arr2 = null,
                direction1 = null,
                direction2 = null,
                lineDirection = null,
                isValid = false,
                indexOfCorner = null,
                otherPoints = null,
                indexOfOthers = null,
                index1 = null,
                index2 = null;

            //Store lines on which the selected spheres lie
            lineArr1 = positionArr[0] === 0 ? vertexToLine[sphereIndicesArr[0]] : [positionArr[0]];
            lineArr2 = positionArr[1] === 0 ? vertexToLine[sphereIndicesArr[1]] : [positionArr[1]];
            lineArr3 = positionArr[2] === 0 ? vertexToLine[sphereIndicesArr[2]] : [positionArr[2]];

            //Calculate intersection to check if 2 spheres lie on the same line
            line12 = (_.intersection(lineArr1, lineArr2));
            line23 = (_.intersection(lineArr2, lineArr3));
            line13 = (_.intersection(lineArr1, lineArr3));


            //Set parameters based on the intersections obtained in the above function
            //if..elseif is used because all 3 spheres will not lie on the same line
            //Only 1 or less condition can be true

            //currLine stores the line on which 2 spheres lie
            //currIndex stores the index of the 3rd sphere
            //currLineArr stores lines on which the 3rd sphere lies
            //isValid is set only if it enters in either of the 3 conditions
            if (line12.length === 1) {
                currLine = line12;
                currIndex = 2;
                currLineArr = lineArr3;
                isValid = true;
            }
            else if (line23.length === 1) {
                currLine = line23;
                currIndex = 0;
                currLineArr = lineArr1;
                isValid = true;
            }
            else if (line13.length === 1) {
                currLine = line13;
                currIndex = 1;
                currLineArr = lineArr2;
                isValid = true;
            }


            if (isValid) {
                //Stores end vertices positions of the line
                cornerPtsArr = lineToVertex[currLine[0]];

                //Push both end vertices as cross-section end points of the rectangle
                points.push(cornerPtsArr[0], 0);
                points.push(cornerPtsArr[1], 0);

                //Store the second sphere position for further use
                secondPoint = cornerPtsArr[1];

                //Check if third sphere is a corner
                if (positionArr[currIndex] === 0) {

                    //if the 3rd sphere is a corner it can only lie on the opposite line of the line on which the other 2 spheres lie
                    //Store the end vertices positions of that line
                    cornerPtsArr = lineToVertex[oppositeLines[currLine[0]]];

                    //Order the spheres
                    //Check if 1 of the corner points found above lies on the same face as that of the second point
                    //if yes then push that corner 1st and then the other one
                    //else push it in the opposite order
                    if (_.intersection(vertexToFace[cornerPtsArr[0]], vertexToFace[secondPoint]).length > 0) {
                        points.push(cornerPtsArr[0], 0);
                        points.push(cornerPtsArr[1], 0);
                    }
                    else {
                        points.push(cornerPtsArr[1], 0);
                        points.push(cornerPtsArr[0], 0);
                    }
                }

                    //If third point is not a corner
                else {
                    //The third point cannot lie on the same face or the same line
                    //It will lie on 5 possible lines that have been mapped
                    //Store the line on which the last point will lie
                    thirdPoint = thirdPointMapping[currLineArr[0]][currLine[0]];

                    //If the third and the last point lie on the same line choose the 2 vertices of the line
                    if (thirdPoint === currLineArr[0]) {
                        cornerPtsArr = lineToVertex[currLineArr[0]];

                        //Order the spheres
                        //Check if 1 of the corner points found above lies on the same face as that of the second point
                        //if yes then push that corner 1st and then the other one
                        //else push it in the opposite order
                        if (_.intersection(vertexToFace[cornerPtsArr[0]], vertexToFace[secondPoint]).length > 0) {
                            points.push(cornerPtsArr[0], 0);
                            points.push(cornerPtsArr[1], 0);
                        } else {
                            points.push(cornerPtsArr[1], 0);
                            points.push(cornerPtsArr[0], 0);
                        }

                    }
                        // Else if the last point lies on a different line
                        // Choose the sphere that lies on the exact opposite line with the same position index
                    else if (thirdPoint > 0) {
                        //Order the spheres
                        //Check if 1 of the corner points found above lies on the same face as that of the second point
                        //if yes then push that corner 1st and then the other one
                        //else push it in the opposite order
                        if (_.intersection(lineToFace[currLineArr[0]], vertexToFace[secondPoint]).length > 0) {
                            points.push(sphereIndicesArr[currIndex], currLineArr[0]);
                            points.push(sphereIndicesArr[currIndex], thirdPoint);
                        } else {
                            points.push(sphereIndicesArr[currIndex], thirdPoint);
                            points.push(sphereIndicesArr[currIndex], currLineArr[0]);
                        }
                    }
                        // Choose the sphere that lies on the exact opposite line with the opposite position index
                    else {
                        //Order the spheres
                        //Check if 1 of the corner points found above lies on the same face as that of the second point
                        //if yes then push that corner 1st and then the other one
                        //else push it in the opposite order
                        if (_.intersection(lineToFace[currLineArr[0]], vertexToFace[secondPoint]).length > 0) {
                            points.push(sphereIndicesArr[currIndex], currLineArr[0]);
                            points.push(sumOfIndex - sphereIndicesArr[currIndex], Math.abs(thirdPoint));
                        } else {
                            points.push(sumOfIndex - sphereIndicesArr[currIndex], Math.abs(thirdPoint));
                            points.push(sphereIndicesArr[currIndex], currLineArr[0]);
                        }

                    }
                }
                collinearResult.points = points;
                return true;
            }
            else if (noOfCorners === 0) {
                //Stores line on which the 1st sphere lies
                currObject = lineArr1[0];
                //Stores line on which the 2nd sphere lies
                arr1 = lineArr2[0];
                //Stores line on which the 3rd sphere lies
                arr2 = lineArr3[0];

                //For every sphere there will be 2 spheres that form lines parallel to the faces
                //directionObject Stores the lines on which these sphere lie
                directionObject = directionMapping[currObject];
                direction1 = directionObject[arr1];
                direction2 = directionObject[arr2];
                //Check if the 1st sphere is the exact opposite of the 2nd
                if (direction1) {

                    lineDirection = directionMapping[currObject][arr1];

                    if (lineDirection &&
                        (lineDirection === 1 && (sphereIndicesArr[0] === sphereIndicesArr[1])) ||
                        (lineDirection === -1 && (sphereIndicesArr[0] + sphereIndicesArr[1]) === sumOfIndex)) {

                        points.push(sphereIndicesArr[0], currObject);
                        points.push(sphereIndicesArr[1], arr1);
                        this._getFourthPoint(arr2, currObject, arr1, sphereIndicesArr, 2, points);

                        collinearResult.points = points;
                        return true;
                    }
                }
                direction1 = false;

                //Check if the 1st sphere is the exact opposite of the 3rd
                if (direction2) {

                    lineDirection = directionMapping[currObject][arr2];
                    if (lineDirection &&
                        (lineDirection === 1 && (sphereIndicesArr[0] === sphereIndicesArr[2])) ||
                        (lineDirection === -1 && (sphereIndicesArr[0] + sphereIndicesArr[2]) === sumOfIndex)) {

                        points.push(sphereIndicesArr[0], currObject);
                        points.push(sphereIndicesArr[2], arr2);
                        this._getFourthPoint(arr1, currObject, arr2, sphereIndicesArr, 1, points);

                        collinearResult.points = points;
                        return true;
                    }
                }
                direction2 = false;

                //if the other 2 spheres do not lie on the above lines in directionObject
                if (!direction1 && !direction2) {

                    //Check if the other 2 spheres are exactly opposite each other
                    lineDirection = directionMapping[arr1][arr2];
                    if (lineDirection &&
                    (lineDirection === 1 && (sphereIndicesArr[1] === sphereIndicesArr[2])) ||
                    (lineDirection === -1 && (sphereIndicesArr[1] + sphereIndicesArr[2]) === sumOfIndex)) {

                        points.push(sphereIndicesArr[1], arr1);
                        points.push(sphereIndicesArr[2], arr2);
                        this._getFourthPoint(currObject, arr1, arr2, sphereIndicesArr, 0, points);

                        collinearResult.points = points;
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }
            else if (noOfCorners === 1) {
                indexOfCorner = positionArr.indexOf(0);
                otherPoints = _.without(positionArr, 0);
                arr1 = otherPoints[0];
                arr2 = otherPoints[1];
                indexOfOthers = _.difference([0, 1, 2], indexOfCorner);
                index1 = indexOfOthers[0];
                index2 = indexOfOthers[1];
                //For every sphere there will be 2 spheres that form lines parallel to the faces
                //directionObject Stores the lines on which these sphere lie
                directionObject = directionMapping[arr1][arr2];
                if (directionObject &&
                    (directionObject === 1 && (sphereIndicesArr[index1] === sphereIndicesArr[index2])) ||
                    (directionObject === -1 && (sphereIndicesArr[index1] + sphereIndicesArr[index2]) === sumOfIndex)) {

                    points.push(sphereIndicesArr[index1], arr1);
                    points.push(sphereIndicesArr[index2], arr2);
                    this._getFourthPoint(indexOfCorner, arr1, arr2, sphereIndicesArr, null, points, true);

                    collinearResult.points = points;
                    return true;
                }
            }
            return false;
        },

        _getFourthPoint: function _getFourthPoint(currObject, arr1, arr2, sphereIndicesArr, currObjSphereIndex, points, isCorner) {
            //currObject is the 3rd point
            //arr1 is the 1st point that has already been pushed in points array
            //arr2 is the 2nd point that has already been pushed in points array
            var lineToFace = className.LINE_TO_FACE,
                directionMapping = className.DIRECTION_MAPPING,
                thirdPointMapping = className.THIRD_POINT_MAPPING,
                vertexToLine = className.VERTEX_TO_LINE,
                lineToVertex = className.LINE_TO_VERTEX,
                vertexToFace = className.VERTEX_TO_FACE,
                neighbouringLinesCurrObj = null,
                index = null,
                lineDirection = null,
                lineKeys = null,
                fourthLine = null,
                sumOfIndex = className.SUM_OF_INDEX,
                face1 = isCorner ? vertexToFace[sphereIndicesArr[currObject]] : lineToFace[currObject],
                face2 = lineToFace[arr1],
                face3 = lineToFace[arr2],
                chooseCorners = isCorner ? false : thirdPointMapping[currObject][arr1] === thirdPointMapping[currObject][arr2],
                cornerPtsArr = null,
                cornerPoint = null,
                arr1Keys = null,
                arr2Keys = null;

            if (isCorner) {
                lineKeys = vertexToLine[sphereIndicesArr[currObject]];
                arr1Keys = Object.keys(thirdPointMapping[arr1]).map(Number);
                arr2Keys = Object.keys(thirdPointMapping[arr2]).map(Number);
                fourthLine = _.intersection(_.intersection(arr1Keys, arr2Keys), lineKeys);
                cornerPtsArr = lineToVertex[fourthLine];
                //Order the spheres
                //Check if 1 of the corner points found above lies on the same face as that of the second point
                //if yes then push that corner 1st and then the other one
                //else push it in the opposite order
                if (_.intersection(vertexToFace[cornerPtsArr[0]], face3).length > 0) {
                    points.push(cornerPtsArr[0], 0);
                    points.push(cornerPtsArr[1], 0);
                }
                else {
                    points.push(cornerPtsArr[1], 0);
                    points.push(cornerPtsArr[0], 0);
                }
            }
            else if (chooseCorners) {
                cornerPtsArr = lineToVertex[currObject];

                //Order the spheres
                //Check if 1 of the corner points found above lies on the same face as that of the second point
                //if yes then push that corner 1st and then the other one
                //else push it in the opposite order
                if (_.intersection(vertexToFace[cornerPtsArr[0]], face3).length > 0) {
                    points.push(cornerPtsArr[0], 0);
                    points.push(cornerPtsArr[1], 0);
                }
                else {
                    points.push(cornerPtsArr[1], 0);
                    points.push(cornerPtsArr[0], 0);
                }
            }
            else {
                // if the 3rd point lies on the same face as that of the 1st point
                if (_.intersection(face1, face2).length > 0) {

                    neighbouringLinesCurrObj = directionMapping[currObject];
                    lineKeys = Object.keys(neighbouringLinesCurrObj);

                    index = (_.intersection(face3, lineToFace[lineKeys[0]]).length > 0) && (parseInt(lineKeys[0]) !== arr1) ? 0 : 1;
                    fourthLine = parseInt(lineKeys[index]);
                    lineDirection = directionMapping[currObject][fourthLine];
                    //push 4th then push 3rd
                    if (lineDirection === 1) {
                        points.push(sphereIndicesArr[currObjSphereIndex], fourthLine);
                    }
                    else {
                        points.push(sumOfIndex - sphereIndicesArr[currObjSphereIndex], fourthLine);
                    }
                    points.push(sphereIndicesArr[currObjSphereIndex], currObject);
                }
                    // else the 3rd point lies on the same face as that of the 2nd point
                else {

                    neighbouringLinesCurrObj = directionMapping[currObject];
                    lineKeys = Object.keys(neighbouringLinesCurrObj);

                    index = (_.intersection(face2, lineToFace[lineKeys[0]]).length > 0) && (_.intersection(face3, lineToFace[lineKeys[0]]).length !== 2) ? 0 : 1;
                    fourthLine = parseInt(lineKeys[index]);
                    lineDirection = directionMapping[currObject][fourthLine];

                    //push 3rd then push 4th
                    points.push(sphereIndicesArr[currObjSphereIndex], currObject);

                    if (lineDirection === 1) {
                        points.push(sphereIndicesArr[currObjSphereIndex], fourthLine);
                    }
                    else {
                        points.push(sumOfIndex - sphereIndicesArr[currObjSphereIndex], fourthLine);
                    }
                }
            }
        },

        getSphereGroup: function getSphereGroup() {
            return this.cubeSphereGroup;
        },

        getSelectedSphereGroup: function getSphereGroup() {
            return this.selectedSphereGroup;
        },

        getLines: function getLines() {
            return this.squareLines;
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
            this.cube = null;
            this.cubeSphereGroup = null;
            this.cubeLinesGroup = null;
            this.cubeSquareGroup = null;
            this.squareLines = null;
            this.eventManager = null;
        }
    }, {

        VERTEX_TO_FACE: {
            '0': [0, 2, 3],
            '1': [0, 3, 4],
            '2': [2, 3, 5],
            '3': [3, 4, 5],
            '4': [0, 1, 4],
            '5': [0, 1, 2],
            '6': [1, 4, 5],
            '7': [1, 2, 5]
        },
        FACE_TO_VERTEX: {
            '0': [0, 1, 4, 5],
            '1': [4, 5, 6, 7],
            '2': [0, 2, 5, 7],
            '3': [0, 1, 2, 3],
            '4': [1, 3, 4, 6],
            '5': [2, 3, 6, 7],
        },
        FACE_TO_LINE: {
            '0': [1, 4, 7, 10],
            '1': [7, 8, 9, 11],
            '2': [2, 10, 11, 12],
            '3': [1, 2, 3, 5],
            '4': [4, 5, 6, 8],
            '5': [3, 6, 9, 12],
        },
        LINE_TO_FACE: {
            '1': [0, 3],
            '2': [2, 3],
            '3': [3, 5],
            '4': [0, 4],
            '5': [3, 4],
            '6': [4, 5],
            '7': [0, 1],
            '8': [1, 4],
            '9': [1, 5],
            '10': [0, 2],
            '11': [1, 2],
            '12': [2, 5],
        },
        VERTEX_TO_LINE: {
            '0': [1, 2, 10],
            '1': [1, 4, 5],
            '2': [2, 3, 12],
            '3': [3, 5, 6],
            '4': [4, 7, 8],
            '5': [7, 10, 11],
            '6': [6, 8, 9],
            '7': [9, 11, 12]
        },
        LINE_TO_VERTEX: {
            '1': [0, 1],
            '2': [0, 2],
            '3': [2, 3],
            '4': [1, 4],
            '5': [1, 3],
            '6': [3, 6],
            '7': [4, 5],
            '8': [4, 6],
            '9': [6, 7],
            '10': [0, 5],
            '11': [5, 7],
            '12': [2, 7],
        },
        OPPOSITE_LINES: {
            '1': 9,
            '2': 8,
            '3': 7,
            '4': 12,
            '5': 11,
            '6': 10,
            '7': 3,
            '8': 2,
            '9': 1,
            '10': 6,
            '11': 5,
            '12': 4,
        },
        THIRD_POINT_MAPPING: {
            '1': {
                '9': 1,
                '8': 3,
                '11': 3,
                '6': -7,
                '12': -7
            },
            '2': {
                '8': 2,
                '4': 11,
                '6': 11,
                '7': 5,
                '9': 5
            },
            '3': {
                '7': 3,
                '4': -9,
                '10': -9,
                '11': 1,
                '8': 1
            },
            '4': {
                '12': 4,
                '2': 6,
                '11': 6,
                '3': -10,
                '9': -10
            },
            '5': {
                '11': 5,
                '7': 2,
                '9': 2,
                '10': 8,
                '12': 8
            },
            '6': {
                '10': 6,
                '2': 4,
                '11': 4,
                '1': -12,
                '7': -12
            },
            '7': {
                '3': 7,
                '2': 9,
                '5': 9,
                '6': -1,
                '12': -1
            },
            '8': {
                '2': 8,
                '1': 11,
                '3': 11,
                '10': 5,
                '12': 5
            },
            '9': {
                '1': 9,
                '4': -3,
                '10': -3,
                '2': 7,
                '5': 7
            },
            '10': {
                '6': 10,
                '3': -4,
                '9': -4,
                '5': 12,
                '8': 12
            },
            '11': {
                '5': 11,
                '4': 2,
                '6': 2,
                '1': 8,
                '3': 8
            },
            '12': {
                '4': 12,
                '1': -6,
                '7': -6,
                '5': 10,
                '8': 10
            }
        },

        DIRECTION_MAPPING: {
            '1': {
                '3': 1,
                '7': -1
            },
            '2': {
                '5': 1,
                '11': 1
            },
            '3': {
                '1': 1,
                '9': -1
            },
            '4': {
                '6': 1,
                '10': -1
            },
            '5': {
                '2': 1,
                '8': 1
            },
            '6': {
                '4': 1,
                '12': -1
            },
            '7': {
                '1': -1,
                '9': 1
            },
            '8': {
                '5': 1,
                '11': 1
            },
            '9': {
                '3': -1,
                '7': 1
            },
            '10': {
                '4': -1,
                '12': 1
            },
            '11': {
                '2': 1,
                '8': 1
            },
            '12': {
                '6': -1,
                '10': 1
            }
        },
        SUM_OF_INDEX: 44,

        ORDERED_SPHERES: [[5, 0], [23, 7], [22, 7], [21, 7],
                          [4, 0], [23, 4], [22, 4], [21, 4],
                          [1, 0], [23, 1], [22, 1], [21, 1],
                          [0, 0], [23, 10], [22, 10], [21, 10],
                          [21, 11], [21, 8], [21, 5], [21, 2],
                          [22, 11], [22, 8], [22, 5], [22, 2],
                          [23, 11], [23, 8], [23, 5], [23, 2],
                          [7, 0], [23, 9], [22, 9], [21, 9],
                          [6, 0], [23, 6], [22, 6], [21, 6],
                          [3, 0], [23, 3], [22, 3], [21, 3],
                          [2, 0], [23, 12], [22, 12], [21, 12]]


    });
})();