 (function(MathUtilities) {
     "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
     /*******************************************************************/
     /*                            Background                           */
     /*******************************************************************/
     /**
      * A customized Backbone.Model that represents Straight liner shape.
      * @class MathUtilities.Tools.ConstructionTool.Models.Background
      * @constructor
      * @extends MathUtilities.Tools.ConstructionTool.Models.BaseShape
      */
     ConstructionTool.Models.Background = ConstructionTool.Models.BaseShape.extend({
         "setDefaults": function() {
             ConstructionTool.Models.Background.__super__.setDefaults.apply(this, arguments);
             this.setOptions({
                 "shapeType": ConstructionTool.Views.ToolType.Background,
                 "allowSelection": false,
                 "zIndex": 0
             });
         }
     });
 }(window.MathUtilities));
