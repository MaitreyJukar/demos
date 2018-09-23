 (function(MathUtilities) {
     "use strict";
     var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
     //background image view start **********************************************
     WhiteboardTool.Views.BackgroundImage = WhiteboardTool.Views.BasePolygon.extend({
         "initModel": function() {
             this.model = new WhiteboardTool.Models.BackgroundImage();
         },

         "draw": function() {
             this.trigger("activate-layer", WhiteboardTool.Models.Sketchpad.LAYERS_NAME.BACKGROUND);
             var curState = {},
                 boundingBox = this.model.getBoundingBox();
             this.clearIntermediatePath();
             this._intermediatePath = new WhiteboardTool.Views.PaperScope.Raster({
                 "source": this.model.getData().imageData,
                 "position": [boundingBox.x, boundingBox.y]
             });

             curState = this.model.getCloneData();
             curState.id = this.getId();
             this._saveCurrentState(curState);
         },

         "translate": function(delta, bDraw) {
             var boundingBox = this.model.getBoundingBox() || this._intermediatePath.bounds;
             boundingBox = boundingBox.clone();
             boundingBox.x += delta.x;
             boundingBox.y += delta.y;
             this.model.setBoundingBox(boundingBox);
             if (bDraw) {
                 this.draw();
             }
         },
         "updatePathZindex": function() {
             this.trigger("activate-layer", WhiteboardTool.Models.Sketchpad.LAYERS_NAME.BACKGROUND);
             WhiteboardTool.Views.BackgroundImage.__super__.updatePathZindex.apply(this, arguments);

         }
     });

     //background image view end **********************************************

 }(window.MathUtilities));
