(function (MathUtilities) {


    /* Initialize MathUtilities Data */
    MathUtilities.Tools.MatrixTool = {};

    /**
    * Packages all the models used in the MatrixTool module.
    * @module Models
    * @namespace MathUtilities.Tools.MatrixTool
    **/
    MathUtilities.Tools.MatrixTool.Models = {};

    /**
    * Packages all the views used in the MatrixTool module.
    * @module Views
    * @namespace MathUtilities.Tools.MatrixTool
    **/
    MathUtilities.Tools.MatrixTool.Views = {};

    MathUtilities.Tools.MatrixTool.MatrixToolHolder = {};

    MathUtilities.Tools.MatrixTool.MatrixToolHolder.Models = {};

    MathUtilities.Tools.MatrixTool.MatrixToolHolder.Views = {};


    MathUtilities.Tools.MatrixTool.Models.Application = Backbone.Model.extend(null, {
        init: function init() {

            $('body').append(MathUtilities.Tools.MatrixTool.templates.matrixToolHolder().trim());

            var matrixToolModel = null,
                matrixToolView = null;

            matrixToolModel = new MathUtilities.Tools.MatrixTool.MatrixToolHolder.Models.MatrixToolHolder();
            matrixToolView = new MathUtilities.Tools.MatrixTool.MatrixToolHolder.Views.MatrixToolHolder({
                model: matrixToolModel,
                el: '#matrixToolHolder'
            });
        }
    });
} (window.MathUtilities));
