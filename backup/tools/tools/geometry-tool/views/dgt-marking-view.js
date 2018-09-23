/*globals $, window,geomFunctions */
(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Views.DgtMarking = Backbone.View.extend({
        "arrowGroup": null,
        "update": function update() {
            this.removeMarkedPaths();
            var pointOnSegment, arrowPoint2, angle = 30,
                paperScope1 = this.model.engine.dgtUI.model.dgtPaperScope,
                offset, arrowPath, segmentPath,
                dash = 10,
                gap = 4,
                distance = 15,
                arrowPoint1, segDistance, threshold = 0.00001,
                point1 = this.model.creator.sources[0].equation.getPoints()[0],
                point2 = this.model.creator.sources[1].equation.getPoints()[0];
            point1 = this.model.engine.grid._getCanvasPointCoordinates(point1);
            point2 = this.model.engine.grid._getCanvasPointCoordinates(point2);
            segDistance = geomFunctions.distance2(point1[0], point1[1], point2[0], point2[1]);
            if (segDistance < threshold) {
                return;
            }
            offset = distance / segDistance;
            pointOnSegment = geomFunctions.getPointPositionFromOffset(point2[0], point2[1], point1[0], point1[1], offset);

            arrowPoint1 = geomFunctions.rotatePoint(pointOnSegment[0], pointOnSegment[1], point2[0], point2[1], angle, true);
            arrowPoint2 = geomFunctions.rotatePoint(pointOnSegment[0], pointOnSegment[1], point2[0], point2[1], -angle, true);
            this.model.engine.grid.activateNewLayer('customShape');
            if (this.model.engine.debugMarkVector) {
                arrowPath = new paperScope1.Path({
                    "segments": [arrowPoint1, point2, arrowPoint2],
                    "strokeColor": 'black'

                });
                arrowPath.sendToBack();
            }
            segmentPath = new paperScope1.Path({
                "segments": [point1, point2],
                "strokeColor": 'black'

            });
            segmentPath.dashArray = [dash, gap];

            this.arrowGroup = new paperScope1.Group();
            this.arrowGroup.addChild(segmentPath);
            this.arrowGroup.addChild(arrowPath);

            this.arrowGroup.sendToBack();

            this.model.engine.grid.refreshView();
            this.model.engine.grid.activateEarlierLayer();
        },

        "shiftMarkingBy": function(dx, dy) {
            this.arrowGroup.position.x += dx;
            this.arrowGroup.position.y += dy;

        },
        "removeMarkedPaths": function removeMarkedPaths() {
            if (this.arrowGroup) {
                this.arrowGroup.remove();
            }
        }
    });
})(window.MathUtilities);
