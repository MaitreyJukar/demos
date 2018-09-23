 (function(MathUtilities) {
     "use strict";
     var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
     /*******************************************************************/
     /*                        Background Image                         */
     /*******************************************************************/
     WhiteboardTool.Models.BackgroundImage = WhiteboardTool.Models.BasePolygon.extend({
         "initialize": function() {
             WhiteboardTool.Models.BackgroundImage.__super__.initialize.apply(this, arguments);
             var renderData = this.getData();
             renderData.imageData = null;
         },

         "setDefaults": function() {
             WhiteboardTool.Models.BackgroundImage.__super__.setDefaults.apply(this, arguments);
             this.setOptions({
                 "nType": WhiteboardTool.Views.ShapeType.BackgroundImage,
                 "menuType": 5,
                 "bElementLocked": true,
                 "bAllowSelectionBound": false,
                 "bAllowRotate": false,
                 "bAllowResize": false
             });
             var renderData = this.getData();
             renderData.imageData = null;
         },

         "setOptions": function(options) {
             WhiteboardTool.Models.BackgroundImage.__super__.setOptions.apply(this, arguments);

             var renderData = this.getData();
             if (options && options.imageData) {
                 renderData.imageData = options.imageData;
             }
         }
     });


 }(window.MathUtilities));
