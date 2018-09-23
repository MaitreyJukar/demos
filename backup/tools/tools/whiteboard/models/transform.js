 (function(MathUtilities) {
     "use strict";
     var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
     WhiteboardTool.Models.Transform = Backbone.Model.extend({}, {
         /**
          * Convert given canvas point to graph point.
          * @method toCanvasCo
          * @param graphCo {object} MathUtilities.Tools.MathUtilities.Tools.WhiteboardTool.Models.Point
          * @return point {object} MathUtilities.Tools.MathUtilities.Tools.WhiteboardTool.Models.Point
          * @private
          */

         "toCanvasCo": function(graphCo) {
             if (!WhiteboardTool.Models.Transform.gridGraph || !graphCo) {
                 return void 0;
             }
             var gridGraph = WhiteboardTool.Models.Transform.gridGraph,
                 canvasCo = gridGraph.convertToCanvasCoordinate([graphCo.x, graphCo.y]),
                 currentOrigin = WhiteboardTool.Models.Transform.CURRENT_ORIGIN.canvasCo,
                 transformModel = WhiteboardTool.Models.Transform,
                 codes = WhiteboardTool.Models.Sketchpad.Retrieve_Codes;

             if (transformModel.retrieveCode === codes.GraphCoodEqualRation) {
                 canvasCo = [currentOrigin.x + graphCo.x, currentOrigin.y - graphCo.y];
             } else {
                 canvasCo = gridGraph.convertToCanvasCoordinate([graphCo.x, graphCo.y]);
             }

             return new WhiteboardTool.Models.Point(canvasCo[0], canvasCo[1]);
         },
         /**
          * Convert given graph point to canvas point.
          * @method toGraphCo
          * @param canvasCo {object} MathUtilities.Tools.WhiteboardTool.Models.Point
          * @return point {object} MathUtilities.Tools.WhiteboardTool.Models.Point
          * @private
          */
         "toGraphCo": function(canvasCo) {
             if (!WhiteboardTool.Models.Transform.gridGraph || !canvasCo) {
                 return void 0;
             }
             var gridGraph = WhiteboardTool.Models.Transform.gridGraph,
                 graphCo = null,
                 transformModel = WhiteboardTool.Models.Transform,
                 codes = WhiteboardTool.Models.Sketchpad.Retrieve_Codes;

             if (transformModel.retrieveCode === codes.GraphCoodEqualRation) {
                 //use double tranform technique,
                 //first given co-ordinate is converted into canvas-co-ordinate with 1:1 conversian,
                 //then again to graph co-ordinate
                 canvasCo = this.toCanvasCo(canvasCo);
             }
             graphCo = gridGraph.convertToGraphCoordinate([canvasCo.x, canvasCo.y]);

             return new WhiteboardTool.Models.Point(graphCo[0], graphCo[1]);
         },


         "toGraphSize": function(canvasSize) {
             if (!WhiteboardTool.Models.Transform.gridGraph || !canvasSize) {
                 return void 0;
             }
             var gridGraph = WhiteboardTool.Models.Transform.gridGraph,
                 graphSize = null;

             graphSize = gridGraph._getGridDistance([canvasSize.x, canvasSize.y]);

             return new WhiteboardTool.Models.Point(graphSize[0], graphSize[1]);
         },

         "toCanvasSize": function(gridSize) {
             if (!WhiteboardTool.Models.Transform.gridGraph || !gridSize) {
                 return void 0;
             }
             var gridGraph = WhiteboardTool.Models.Transform.gridGraph,
                 canvasSize = null;

             canvasSize = gridGraph._getCanvasDistance([gridSize.x, gridSize.y]);

             return new WhiteboardTool.Models.Point(canvasSize[0], canvasSize[1]);
         },

         "CURRENT_ORIGIN": {
             "canvasCo": null,
             "graphCo": null
         },
         "DEFAULT_ORIGIN": {
             "canvasCo": null,
             "graphCo": null
         },

         "gridGraph": null,

         "retrieveCode": ""
     });
 })(window.MathUtilities);
