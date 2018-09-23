(function () {
    'use strict';
    /**
    * Handles rolling animation of the ball.
    * @class Animation
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @constructor
    */
    MathInteractives.Interactivities.MiniGolf.Views.Animation = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Paperscope of the canvas. Paperscope will be supplied by initializer.
        * @property paperScope
        * @default null
        * @type Object
        */
        paperScope: null,

        animatingBall: null,

        courseBounds: null,

        lastIncidentPoint: null,

        newDirectionPoint: null,

        lineUtility: null,

        distance: null,

        hole: null,

        ballIndex: null,

        stopDistance: null,

        falseAngleFound: null,

        ballSpeed: null,

        vectorTexture: null,

        vector: null,

        ballTextureBase64URL: null,

        ballTextureRaster: null,

        collisionPoints: null,

        gradientLine: null,

        textureGroup: null,

        timeElapsed : null,

        canvasView : null,

        angleTolerance : null,

        skipBallAnimation : null,

        isSaveStateLoaded : false,
        /** 
        * Initializes function of ball view.
        * @method initialize
        * @constructor
        */
        initialize: function () {
            this.angleTolerance = MathInteractives.Interactivities.MiniGolf.Views.Animation.CONSTANTS.ANGLE_TOLERANCE;
            this.initializeDefaultProperties();
            this.lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility;
            this.stopDistance = MathInteractives.Interactivities.MiniGolf.Views.Animation.CONSTANTS.ANIMATION_STOP_DISTANCE;
            this.falseAngleFound = false;
            this.ballSpeed = MathInteractives.Interactivities.MiniGolf.Views.Animation.CONSTANTS.INITIAL_SPEED;
            this.timeElapsed = 0;
            this.canvasView = this.options.canvasView;
            this.listenTo(this.model,'change:invalidPathIndex',$.proxy(this._resetOnInteraction,this));
            this.listenTo(this,MathInteractives.Interactivities.MiniGolf.Views.Animation.EVENTS.READY,this._loadSaveState);
        },

        _resetOnInteraction : function() {
            var invalidPathIndex = this.model.get('invalidPathIndex');
            if(invalidPathIndex === null && this.isSaveStateLoaded === true){
                if(this.canvasView.arrow){
                    this.canvasView.arrow.removeChildren();
                }
                this.reset();
            }
            this.isSaveStateLoaded = true;
        },                          

        setPaperScope: function (canvasPaperScope) {
            this.paperScope = canvasPaperScope;
            this._renderBoundry();
            this._renderDummyHole();
            this._loadRaster();
            this._renderGradientLine();            
        },

        _loadRaster: function () {
            var self = this,
                paperScope = this.paperScope,
                imagesLoaded = 0,
                base64 = this.getJson("baseURL");
            this.ballBase64URL = base64.ballBase64URL;
            this.ballTextureBase64URL = base64.ballTextureBase64URL;
            this.ballTextureRaster = new paperScope.Raster({
                source: this.ballTextureBase64URL
            });
            this.ballInnerRaster = new paperScope.Raster({
                source: this.ballBase64URL
            });
            this.ballTextureRaster.onLoad = function (event) {
                imagesLoaded++;
                if (imagesLoaded === 2) {
                    self._clipBall();
                }
            }
            this.ballInnerRaster.onLoad = function (event) {
                imagesLoaded++;
                if (imagesLoaded === 2) {
                    self._clipBall();
                }
            }
        },

        _clipBall: function () {

            this.paperScope.activate();
            var initialBallPosition = new this.paperScope.Point(0, 0),
                ballRadius = 10,
                paperScope = this.paperScope;

            var outer = new paperScope.Path.Circle(initialBallPosition, ballRadius);
            outer.fillColor = '#396f30';
            outer.translate(2, 2);

            var shadowClipperGroup = new paperScope.Group(this.courseBounds.clone(), outer);
            shadowClipperGroup.clipped = true;

            var mask = new paperScope.Path.Circle(initialBallPosition, ballRadius);
            var ball = new paperScope.Path.Circle(initialBallPosition, ballRadius);
            ball.fillColor = 'white';
            ball.opacity = 1;


            var ballGroup = new paperScope.Group(outer, ball, this.ballInnerRaster);
            this.animatingBall = ballGroup;

            this.textureGroup = new paperScope.Group(mask, this.ballTextureRaster);
            this.textureGroup.clipped = true;  

            this.animatingBall.opacity = 0 ;
            this.textureGroup.opacity = 0;

            this.trigger(MathInteractives.Interactivities.MiniGolf.Views.Animation.EVENTS.READY);
        },

        _renderBoundry: function () {
            var scope = this.paperScope,
                model = this.model,
                boundry = model.get('courseBoundaries'),
                path = new scope.Path();

            for (var i = 0 ; i < boundry.length; i++) {
                path.add(new scope.Point(boundry[i]));
            }
            path.closed = true;
            this.courseBounds = path;                
        },

        _renderGradientLine : function() {              
            var path = new this.paperScope.Path();
            path.add(0, 0);
            path.add(0, 0);
            path.strokeWidth = 3;
            path.shadowColor = new this.paperScope.Color(0, 0, 0);
            path.shadowBlur = 0; 
            path.shadowOffset = new this.paperScope.Point(0, 0);
            this.gradientLine = path;              
        },

        _predeterminePoints: function () {
            var balls = this.model.get('balls'),
                collisionPoints = [],
                boundry = this.courseBounds;
            for (var i = 0; i < balls.length - 1 ; i++) {
                var nextIndex = i + 1,
                    currentBall = balls[i],
                    currentBallPosition = currentBall.get('position'),
                    previousBall = i > 0 ? balls[i - 1] : null,
                    startPt = balls[i].get('position'),
                    endPt = balls[nextIndex].get('position'),
                    dummyLine = this.dummyLine(startPt, endPt),
                    obstacleCollisionPtList,
                    boundryCollisionPtList,                    
                    filteredPoint,
                    reflectedPoint,
                    prevAngle = currentBall.get('prevBallAngle'),
                    nextAngle = currentBall.get('nextBallAngle'),
                    result ;
                result = this._recursive(dummyLine,currentBall,previousBall,i);
                dummyLine.remove();
                collisionPoints = collisionPoints.concat(result);
                if(result[result.length - 1].ballIndex < 0 ) {                  
                    this.collisionPoints = collisionPoints;
                    this.stopDistance = this.lineUtility.GetDistBetweenPointFs(
                        result[result.length-2].point,result[result.length-1].point);
                    this.stopDistance = this.stopDistance > 3 ? this.stopDistance - 3 : 1;
                    return;
                }             
            }
            collisionPoints.push({ point: balls[balls.length - 1].get('position'), ballIndex: balls.length - 1 });
            this.collisionPoints = collisionPoints;
        },

        _recursive : function(dummyLine,currentBall,previousBall,index){
            var prevAngle = currentBall.get('prevBallAngle'),
                nextAngle = currentBall.get('nextBallAngle'),
                currentBallPosition = currentBall.get('position'),
                isAngleInCorrect = this._verifyAngle(prevAngle,nextAngle,this.angleTolerance),
                result,
                pointsList = [];
            pointsList.push({point : currentBallPosition , ballIndex : index});
            if(index === 0){
                result = this._checkForRiver(dummyLine);
                if(result){
                    pointsList.push(result);
                    pointsList.push(result);
                    return pointsList;    
                }                
            }
            if((isAngleInCorrect || this._falseAngleOnBoundry(index))  && index > 0 && previousBall) {
                var normal = this._getSnappedBallNormal(currentBall),
                    lineSegments = dummyLine.segments;
                lineSegments[0].point = normal.incidentPt;
                lineSegments[1].point = normal.normalPt;
                var stopDistance = MathInteractives.Interactivities.MiniGolf.Views.Animation.CONSTANTS.ANIMATION_STOP_DISTANCE,
                    reflectedPoint  = this._getReflectionPoint(previousBall.get('position'),dummyLine);
                reflectedPoint = this.lineUtility.GetvarOnLineUsingDistance(normal.incidentPt,reflectedPoint,stopDistance,0,true);
                lineSegments[1].point = reflectedPoint;
                result = this._handleInCorrectPath(dummyLine,currentBallPosition,1);
                if(result.length > 0 ){
                    reflectedPoint = result[0].point;                    
                }
                pointsList.push({ point : reflectedPoint , ballIndex : -1});
            }
            else {                
                result = this._handleInCorrectPath(dummyLine,currentBallPosition,1);
                if(result.length > 0){
                    if(result[1]){
                        result[1].ballIndex = -1;                        
                    }
                    result[0].ballIndex = result.length === 1 ? -1 : result[0].ballIndex;                    
                    pointsList = pointsList.concat(result[0] ? [result[0]] : []);
                    pointsList = pointsList.concat(result[1] ? [result[1]] : []);                    
                }
                // In case of multiple reflection , uncomment following lines.
                // pointsList = (result.length > 0) ? pointsList.concat(result) : pointsList;
            }            
            return pointsList;
        },

        _checkForRiver : function(dummyLine) {
            var result = this._reflectionByObstacle(dummyLine);
            if(result && result.obstacle && result.obstacle.type) {
                switch(result.obstacle.type){
                    case 'left-river' : 
                    case 'right-river' :
                        result = { point : result.point , ballIndex : -1};
                        return result;
                }                
            }            
            return null;
        },

        _getSnappedBallNormal : function(currentBall) {
            var snapPoint = currentBall.get('snapPoint'),
                mirrorPoint = currentBall.get('mirrorPoint');
            if(this._isNullOrUndefined(snapPoint) || this._isNullOrUndefined(mirrorPoint)) {
                this.log('normal for ball is not found');
                return null;   
            }
            return {incidentPt : snapPoint , normalPt : mirrorPoint};
        },

        _handleInCorrectPath : function(dummyLine,currentPoint,count) {
            if(count < 0){
                this.log('counter exhausted');
                return [];   
            }
            var boundryIntersectionList = this._reflectionByBoundry(dummyLine),
                obstacleIntersectionList = this._reflectionByObstacle(dummyLine),
                lineSegments = dummyLine.segments,
                collisionPointsList = [],
                concatedList = [];
            concatedList = boundryIntersectionList ? concatedList.concat(boundryIntersectionList) : concatedList;
            concatedList = obstacleIntersectionList ? concatedList.concat(obstacleIntersectionList) : concatedList;

            var nearestObject = this._getNearesetPointFromList(lineSegments[0].point,lineSegments[1].point,concatedList);
            if(this._isNullOrUndefined(nearestObject) || nearestObject.length === 0){
                this.log('nothing found on path');
                return [];   
            }
            var nearestObstacle = nearestObject[0].obstacle,
                normal = this._getNormal( nearestObstacle ? nearestObstacle.reflectionPath : this.courseBounds,nearestObject[0].point),
                referenceLine = this.dummyLine(normal.incidentPt,normal.normalPt),
                stopDistance = MathInteractives.Interactivities.MiniGolf.Views.Animation.CONSTANTS.ANIMATION_STOP_DISTANCE,
                reflectedPoint = this._getReflectionPoint(currentPoint,referenceLine);
            if(nearestObstacle && nearestObstacle.type){
                collisionPointsList.push({point : normal.incidentPt ,ballIndex : -1 , isRiver : true});
                referenceLine.remove();
                return collisionPointsList;
            }
            reflectedPoint = this.lineUtility.GetvarOnLineUsingDistance(normal.incidentPt,reflectedPoint,stopDistance,0,true);
            lineSegments[0].point = normal.incidentPt;
            lineSegments[1].point = reflectedPoint;
            count--;
            collisionPointsList.push({point : normal.incidentPt ,ballIndex : -2 });
            var result = this._handleInCorrectPath(dummyLine,normal.incidentPt,count);           
            // Following lines are blocked to stop multiple reflection.
            collisionPointsList = result.length > 0  ? collisionPointsList.concat(result) : 
            collisionPointsList.concat([{point : reflectedPoint , ballIndex : -1}]);            
            referenceLine.remove();
            return collisionPointsList;
        },

        _getReflectionPoint : function(pointToReflect,referenceLine) {
            var lineSegment = referenceLine.segments,
                reflectedPoint = this.lineUtility.ReflectvarToTheLine(pointToReflect,lineSegment[0].point,lineSegment[1].point);            
            return reflectedPoint;
        },

        _reflectionByBoundry : function(dummyLine) {
            return dummyLine.getIntersections(this.courseBounds);
        },     

        _reflectionByObstacle : function(dummyLine) {            
            var canvasView = this.canvasView,
                lineUtility = this.lineUtility,
                getIntersectionMethod = canvasView.getFirstIntersectionWithObstacles;

            // Checks whether getFirstIntersectionWithObstacles method exists or not.
            // If not , it will return for course-1
            if(this._isNullOrUndefined(getIntersectionMethod)){
                return null;   
            }
            var intersectionResult = canvasView.getFirstIntersectionWithObstacles(dummyLine);                
            if(this._isNullOrUndefined(intersectionResult) || intersectionResult.length === 0 ){
                return null;   
            }
            var indexToReturn = -1;
            // Search for the appropriate first intersection point excluding start and end(currently disabled) points of the dummyLine
            for(var i = 0 ; i < intersectionResult.length ; i++ ) {
                if(this._isPointEqual(intersectionResult[i].point , dummyLine.segments[0].point)){
                    continue;   
                }
                indexToReturn = i ;
                break;
            }
            return indexToReturn === -1 ? null : intersectionResult[indexToReturn];
        },

        _getNearesetPointFromList : function (startPoint , endPoint , intersectionPtList) {
            if(this._isNullOrUndefined(intersectionPtList) || intersectionPtList.length === 0){
                return null;   
            }            
            var currentPoint ,
                distance ,
                keysToSort = 0,
                keysLength = 0,
                arrayToSort = [],
                sortedArray = [],
                paperScope = this.paperScope;
            startPoint = new paperScope.Point(startPoint);
            endPoint = new paperScope.Point(endPoint);
            for(var i = 0 ; i < intersectionPtList.length ; i++ ){                              
                currentPoint = intersectionPtList[i].point;
                if(this._isPointEqual(startPoint,currentPoint,0) || this._isPointEqual(endPoint,currentPoint,0)) {
                    continue;
                }
                distance = startPoint.getDistance(new paperScope.Point(currentPoint)); 
                arrayToSort[distance] = intersectionPtList[i];
            }
            keysToSort = Object.keys(arrayToSort);
            keysLength = keysToSort.length;
            keysToSort.sort(function(a,b) {
                return a - b; 
            });

            for (var index = 0; index < keysLength; index++) {
                sortedArray.push(arrayToSort[keysToSort[index]]);
            }
            return sortedArray;
        },

        _renderDummyHole: function () {
            var scope = this.paperScope,                
                model = this.model,
                radius = MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.HOLES['COURSE_' + model.get('levelId')].RADIUS + 0.5,
                holePosition = model.get('holePosition'),
                path = new scope.Path.Circle({
                    center: holePosition,
                    radius: radius,
                    strokeColor: 'red',                     
                    opacity: 0
                });
            if(this.hole){
                this.hole.remove();
                this.hole = null;
            }
            this.hole = path;
        },

        _renderAnimatingBall: function () {
            this.paperScope.project.activeLayer.removeChildren();
            if (!this._isNullOrUndefined(this.animatingBall)) {
                this.animatingBall.detach('frame');
                this.animatingBall.remove();
                this.animatingBall = null;
            }
            var model = this.model,
                self = this,
                paperScope = this.paperScope,
                startballPosition = model.get('rotationHandlePosition');
            this.animatingBall = new paperScope.Path.Circle({
                center: new paperScope.Point(startballPosition),
                radius: 10,
                fillColor: 'green',
                opacity: 1
            });
            this.paperScope.view.draw();            
        },

        /**
        * Shows or hides the animating ball depending on parameter passed/
        *
        * @method hideAnimatingBall
        * @param show {Boolean} Hides the ball if false.
        */
        showHideAnimatingBall: function showHideAnimatingBall(show) {
            if (show === false) {
                this.animatingBall.opacity = 0;
                this.textureGroup.opacity = 0;
                this.paperScope.view.draw();
            }
            else {
                this.animatingBall.opacity = 1;
                this.textureGroup.opacity = 1;
                this.paperScope.view.draw();
            }
        },

        reset: function () {
            this.model.set('invalidPathStartPoint',null);
            this.model.set('invalidPathEndPoint',null);
            this.animatingBall.opacity = 1 ;
            this.textureGroup.opacity = 1;
            this.timeElapsed = 0;            
            this.ballIndex = -1;
            this.falseAngleFound = false;
            this.distance = 0;
            this.stopDistance = MathInteractives.Interactivities.MiniGolf.Views.Animation.CONSTANTS.ANIMATION_STOP_DISTANCE;
            var point = new this.paperScope.Point(0, 0);
            this.gradientLine.segments[0].point = point;
            this.gradientLine.segments[1].point = point;
            this.animatingBall.position = new this.paperScope.Point(-20,-20);
            this.textureGroup.position = new this.paperScope.Point(-20,-20);            
            this.ballSpeed = MathInteractives.Interactivities.MiniGolf.Views.Animation.CONSTANTS.INITIAL_SPEED;
            this._renderDummyHole();
            this.skipBallAnimation = false;
            this.paperScope.view.draw();
        },

        addBallOnLayer : function() {
            this.animatingBall.remove();
            this.textureGroup.remove();
            this.gradientLine.remove();
            this.paperScope.project.activeLayer.addChild(this.gradientLine);
            this.paperScope.project.activeLayer.addChild(this.animatingBall);
            this.paperScope.project.activeLayer.addChild(this.textureGroup);
        },

        removeBallFromLayer : function() {
            //this.animatingBall.remove(); 
            //this.textureGroup.remove();
        },

        launchBall: function () {  
            this.reset();
            this.ballIndex = 0;
            this.paperScope.activate();
            this.addBallOnLayer();            
            this.showHideAnimatingBall();
            this._predeterminePoints();
            var collisionPoints = this.collisionPoints,
                self = this,
                paperScope = this.paperScope,
                startballPosition = collisionPoints[0].point,
                secondBallPosition = collisionPoints[1].point;            
            this.lastIncidentPoint = new paperScope.Point(startballPosition);
            this.newDirectionPoint = new paperScope.Point(secondBallPosition);
            this.animatingBall.position = this.lastIncidentPoint;
            this.trigger(MathInteractives.Interactivities.MiniGolf.Views.Animation.EVENTS.BALL_ANIMATION_STARTED);
            this.vector = this._subtractPoints(this.newDirectionPoint, this.lastIncidentPoint);
            this.vectorTexture = new paperScope.Point({
                angle: this.vector.angle,
                length: 1
            });
            this.animatingBall.onFrame = function (event) {
                self.animateBall4(event);
                self.paperScope.view.draw();
            }
        },

        animateBall4: function (event) {
            var self = this,
                distToTravel = self.lineUtility.GetDistBetweenPointFs(self.lastIncidentPoint, self.newDirectionPoint), // Distance travelled since 
                boundryCollision,
                currentSpeed = self.ballSpeed;
            if (self._isPassingThroughHole() && !self.falseAngleFound) {
                self._ballInHole();
                return;
            }
            if (self.distance >= distToTravel) {
                self._reflectBall();
            }
            self.textureGroup.position = self._moveBallOnLine(self.lastIncidentPoint, self.newDirectionPoint, self.distance * 1.3);
            self.textureGroup.children[0].position = self._moveBallOnLine(self.lastIncidentPoint, self.newDirectionPoint, self.distance);
            self.animatingBall.position = self._moveBallOnLine(self.lastIncidentPoint, self.newDirectionPoint, self.distance);
            self._restartTexture();            
            if (self.falseAngleFound && self.distance >= self.stopDistance) {
                self._falseAnglePathAnimated();
                return;
            }
            if (self.falseAngleFound) {
                self.timeElapsed += 10; // Actual 17 but considering rendering time it is decreased to 10.
                self.gradientLine.segments[1].point = self.animatingBall.position;
                self.gradientLine.strokeColor = {
                    gradient: {
                        stops: ['white', new self.paperScope.Color(255, 255, 255, 0)]
                    },
                    origin: self.gradientLine.segments[0].point,
                    destination: self.gradientLine.segments[1].point
                };                
                currentSpeed = self._getBallSpeed(self.timeElapsed);
            }
            if(self.skipBallAnimation){
                currentSpeed = self.lineUtility.GetDistBetweenPointFs(self.lastIncidentPoint, self.newDirectionPoint) -
                    self.distance;
            }
            self.distance += currentSpeed;
        },

        _getBallSpeed:  function(timeElapsed) {
            if(this.stopDistance > 80 ) {
                return this.ballSpeed;   
            }
            var slopeOftheDSLine = -this.ballSpeed / (this.stopDistance + 5);
            return this.ballSpeed + (Math.round(this.distance) * slopeOftheDSLine);
        },

        _restartTexture: function () {
            var texture = this.ballTextureRaster,
                mask = this.animatingBall;

            if (texture.position.x < mask.bounds.left) {
                texture.position.x = mask.bounds.right;
            }

            else if (texture.position.x > mask.bounds.right) {
                texture.position.x = mask.bounds.left;
            }

            if (texture.position.y < mask.bounds.top) {
                texture.position.y = mask.bounds.bottom;
            }
            else if (texture.position.y > mask.bounds.bottom) {
                texture.position.y = mask.bounds.top;
            }
            this.ballTextureRaster.position = texture.position;
        },

        _checkCollision4: function () {
            var ballPosition = this.animatingBall.position,
                collidedWith = this.collisionPoints;
            for (var i = 0 ; i < collidedWith.length ; i++) {
                if (this._isPointEqual(ballPosition, collidedWith[i], 0)) {
                    return i;
                }
            }
            return null;
        },

        _reflectBall: function () {
            var self = this,
                collidedBallId,
                ListBallModel = self.model.get('balls');           
            self.ballIndex++;
            var index = self.ballIndex;
            if (index && index < self.collisionPoints.length - 1) {
                self.lastIncidentPoint = self.collisionPoints[index].point;
                self.newDirectionPoint = self.collisionPoints[index + 1].point;
                self.vector = self._subtractPoints(self.newDirectionPoint, self.lastIncidentPoint);
                self.vectorTexture = new self.paperScope.Point({
                    angle: self.vector.angle,
                    length: 1
                });
                self.distance = 2;
                if (self.collisionPoints[index + 1].ballIndex === -1) {
                    self.falseAngleFound = true;
                    self.gradientLine.segments[0].point = self.lastIncidentPoint;
                    self.gradientLine.segments[1].point = self.lastIncidentPoint;
                }
                self.trigger(MathInteractives.Interactivities.MiniGolf.Views.Animation.EVENTS.BALL_REFLECTED);
                self.log('play sound on ball reflection');
                //self.play('ball-reflects-boundary');
            }
            else {                    
                this.log('something went wrong');                
            }            
        },

        _falseAngleOnBoundry: function (collidedBallId) {
            var self = this,
                ListBallModel = self.model.get('balls');
            var currentBallModel = ListBallModel[collidedBallId],
                prevAngle = currentBallModel.get('prevBallAngle'),
                nextAngle = currentBallModel.get('nextBallAngle');
            // If prevAngle and nextAngle are not same , find the actual correction reflection point and animate ball till fixed distance on the                 //   correct path.
            if (this._verifyAngle(prevAngle,nextAngle,self.angleTolerance) && collidedBallId > 0) {
                var ptToReflect = ListBallModel[collidedBallId - 1].get('position');
                var normal = { incidentPt : currentBallModel.get('snapPoint') , normalPt : currentBallModel.get('mirrorPoint') };
                var reflectedPoint = self.lineUtility.ReflectvarToTheLine(ptToReflect, normal.incidentPt, normal.normalPt);
                if(Number(prevAngle.toFixed(0)) === 0){
                    reflectedPoint = normal.normalPt;  
                }
                return { point: reflectedPoint, ballIndex: -1 };
            }
            else if (prevAngle && Number(prevAngle.toFixed(0)) != 0 && collidedBallId > 0 && collidedBallId < ListBallModel.length - 1) {
                var prevBallPoint = ListBallModel[collidedBallId - 1].get('position'),
                    currBallPoint = currentBallModel.get('position'),
                    nextBallPoint = ListBallModel[collidedBallId + 1].get('position'),
                    angleAtCurrPoint = this.lineUtility.AngleBetweenLineAndPointF(prevBallPoint, nextBallPoint, currBallPoint);
                // When both the angles are of same value but at the same side with respect to the mirror line . Which is to be avoided.
                if (Number(angleAtCurrPoint.toFixed(0)) === 0) {
                    var ptToReflect = ListBallModel[collidedBallId - 1].get('position');
                    var normal = self._getNormal(self.courseBounds, currentBallModel.get('position'));
                    var reflectedPoint = self.lineUtility.ReflectvarToTheLine(ptToReflect, normal.incidentPt, normal.normalPt);
                    return { point: reflectedPoint, ballIndex: -1 };
                }
            }
            return null;
        },

        _verifyAngle : function(prevAngle,nextAngle,tolerance) {
            var flag = true;
            tolerance = this._isNullOrUndefined(tolerance) ? 0 : Math.abs(tolerance);
            if(!this._isNullOrUndefined(prevAngle) && !this._isNullOrUndefined(nextAngle)){
                prevAngle = Number(prevAngle.toFixed(0));
                nextAngle = Number(nextAngle.toFixed(0));
                if(nextAngle >= prevAngle  - tolerance && nextAngle <= prevAngle + tolerance){
                    flag = false;
                }
            } 
            return flag;
        },

        _ballInHole: function () {
            var self = this;
            self.animatingBall.detach('frame');
            this.removeBallFromLayer();
            self.trigger(MathInteractives.Interactivities.MiniGolf.Views.Animation.EVENTS.BALL_IN_HOLE);
            self.trigger(MathInteractives.Interactivities.MiniGolf.Views.Animation.EVENTS.BALL_ANIMATION_ENDED);
        },

        _falseAnglePathAnimated: function () {
            var self = this;
            self.animatingBall.detach('frame');
            var collisionPoints = self.collisionPoints,
                index = self.ballIndex,
                isFalseAngle = false;
            for (var i = index ; i >= 0 ; i--) {
                if (!this._isNullOrUndefined(collisionPoints[i]) && collisionPoints[i].ballIndex >= 0) {
                    self.ballIndex = i;
                    var balls = self.model.get('balls'),
                        invalidBall = balls[self.ballIndex];
                    isFalseAngle = this._verifyAngle(invalidBall.get('prevBallAngle'),invalidBall.get('nextBallAngle'),this.angleTolerance);
                    break;
                }
            }
            self.gradientLine.segments[1].point = self.animatingBall.position;
            self.gradientLine.strokeColor = {
                gradient: {
                    stops: ['white', new self.paperScope.Color(255, 255, 255, 0)]
                },
                origin: self.gradientLine.segments[0].point,
                destination: self.gradientLine.segments[1].point
            };
            this.removeBallFromLayer();
            self.trigger(MathInteractives.Interactivities.MiniGolf.Views.Animation.EVENTS.INCORRECT_REFLECTION_ANGLE,
                         {ballIndex : i , isFalseAngle : isFalseAngle});
            self.trigger(MathInteractives.Interactivities.MiniGolf.Views.Animation.EVENTS.BALL_ANIMATION_ENDED);
            var segments = this.gradientLine.segments,
                point0 = segments[0].point,
                point1 = segments[1].point;
            this.model.set('invalidPathStartPoint',{ x : point0.x , y : point0.y});
            this.model.set('invalidPathEndPoint',{ x : point1.x , y : point1.y});
        },

        _isPointEqual: function (point1, point2, precision) {
            precision = precision ? precision : 0;
            var pt1 = this._setNumberPrecision(point1, precision);
            var pt2 = this._setNumberPrecision(point2, precision);
            return (pt1.x === pt2.x && pt1.y === pt2.y);
        },

        _setNumberPrecision: function (point, precision) {
            var x = Math.round(100 * point.x) / 100,
                y = Math.round(100 * point.y) / 100;
            return new this.paperScope.Point(Number(x.toFixed(precision)), Number(y.toFixed(precision)));
        },

        _isPassingThroughHole: function () {
            var hole = this.hole,
                ball = this.animatingBall.children[1];
            var lastPoint = this.collisionPoints[this.collisionPoints.length - 1].point;
            if((hole.getIntersections(ball).length > 0 || 
                this.lineUtility.GetDistBetweenPointFs(hole.position,this.animatingBall.position) < 8)
               && (this._isPointEqual(lastPoint,this.animatingBall.position,0) ||
                   this.lineUtility.GetDistBetweenPointFs(lastPoint,this.animatingBall.position) < 5) ){
                return true;   
            }
            return false;    
        },

        _moveBallOnLine: function (startPoint, endPoint, distance) {
            var newBallPosition = this.lineUtility.GetvarOnLineUsingDistance(startPoint, endPoint, distance, 0, true);
            return newBallPosition;
        },

        _getNormal: function (bounds, nearestPoint) {
            var offsetLength = bounds._getOffset(bounds.getLocationOf(nearestPoint)),
                tangentPoint = bounds.getNormalAt(offsetLength);
            tangentPoint.length = 100;
            return { incidentPt: nearestPoint, normalPt: this._addPoints(nearestPoint, tangentPoint) };
        },

        skipAnimation : function() {
            this.skipBallAnimation = true;
        },

        dummyLine: function (startPt, endPt) {
            var paperScope = this.paperScope,
                line = new paperScope.Path();
            line.add(startPt);
            line.add(endPt);
            line.strokeColor = 'red';
            return line;
        },

        dummyCircle: function (center, color) {
            return;
            var dummy = new this.paperScope.Path.Circle({
                center: center,
                strokeColor: color ? color : 'red',
                radius: 1
            });
            return dummy;
        },

        _addPoints: function (point1, point2) {
            return (point1 && point2) ? new this.paperScope.Point(point1.x + point2.x, point1.y + point2.y) : 'NaN';
        },

        _subtractPoints: function (point1, point2) {
            return (point1 && point2) ? new this.paperScope.Point(point1.x - point2.x, point1.y - point2.y) : 'NaN';
        },

        _isNullOrUndefined: function (object) {
            return (object === null || typeof object === 'undefined');
        },

        changeBallLayer : function(destinationScope) {
            if(destinationScope) {
                this.animatingBall.remove();
                this.textureGroup.remove();
                this.gradientLine.remove();
                destinationScope.project.activeLayer.addChild(this.gradientLine);
                destinationScope.project.activeLayer.addChild(this.animatingBall);
                destinationScope.project.activeLayer.addChild(this.textureGroup);
            }
        },

        _loadSaveState : function _loadSaveState(){
            var model = this.model,
                self = this,
                gradientLine = this.gradientLine,
                startPoint = model.get('invalidPathStartPoint'),
                endPoint = model.get('invalidPathEndPoint');
            if(this._isNullOrUndefined(startPoint) || this._isNullOrUndefined(endPoint)){
                return;
            }
            if(this._isNullOrUndefined(gradientLine)){
                this._renderGradientLine();
                gradientLine = this.gradientLine;
            }   
            this.paperScope.activate();
            gradientLine.segments[0].point = startPoint;
            gradientLine.segments[1].point = endPoint;
            gradientLine.strokeColor = {
                gradient: {
                    stops: ['white', new this.paperScope.Color(255, 255, 255, 0)]
                },
                origin: gradientLine.segments[0].point,
                destination: gradientLine.segments[1].point
            };

            setTimeout(function(){
                self.animatingBall.position = gradientLine.segments[1].point;
                self._restartTexture();
                self.showHideAnimatingBall(true);
                self.animatingBall.bringToFront();
                self.canvasView.paperScope.view.draw();
                self.canvasView.paperScope2.view.draw();
            },100);
        }
    },
                                                                                                                 {
        EVENTS: {

            /**
            * Fired when the ball is reflected from the surface.
            *
            * Triggered in the function {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/render:method"}}{{/crossLink}}.
            * @event BALL_REFLECTED
            */
            BALL_REFLECTED: 'ball-reflcted',

            /**
            * Fired when ball collides with the surface.
            *
            * Triggered in the function {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/_ballDragged:method"}}{{/crossLink}}.
            * @event BALL_COLLIDED
            */
            BALL_COLLIDED: 'ball-colloided',

            /**
            * Fired when ball reaches to the destination.
            *
            * Triggered in the function {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/_ballDragFinished:method"}}{{/crossLink}}.
            * @event BALL_IN_HOLE
            */
            BALL_IN_HOLE: 'ball-is-in-hole',

            /**
            * Fired when ball rolling animation starts.
            *
            * Triggered in the function {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/_stickySliderDragged:method"}}{{/crossLink}}.
            * @event BALL_ANIMATION_STARTED
            */
            BALL_ANIMATION_STARTED: 'ball-animation-started',

            /**
            * Fired when ball rolling animation ends.
            *
            * Triggered in the function {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/_stickySliderDragFinished:method"}}{{/crossLink}}.
            * @event BALL_ANIMATION_ENDED
            */
            BALL_ANIMATION_ENDED: 'ball-animation-ended',


            INCORRECT_REFLECTION_ANGLE: 'incorrect-reflection-angle',


            READY : 'animation-canvas-ready'
        },
        CONSTANTS: {
            INITIAL_SPEED  : 4,
            STOP_ANIMATION_DURATION : 925,
            DE_ACCELERATION : -0.008,
            ANIMATION_STOP_DISTANCE: 80,
            ANGLE_TOLERANCE: 0
        }
    });
})();
