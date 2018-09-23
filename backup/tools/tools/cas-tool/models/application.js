(function (MathUtilities) {


    /* Initialize MathUtilities Data */
    MathUtilities.Tools.CasTool = {};

    /**
   * Packages all the models used in the CasTool module.
   * @module Models
   * @namespace MathUtilities.Tools.CasTool
   **/
    MathUtilities.Tools.CasTool.Models = {};

    /**
    * Packages all the views used in the CasTool module.
    * @module Views
    * @namespace MathUtilities.Tools.CasTool
    **/
    MathUtilities.Tools.CasTool.Views = {};

    MathUtilities.Tools.CasTool.CasToolHolder = {};

    MathUtilities.Tools.CasTool.CasToolHolder.Models = {};

    MathUtilities.Tools.CasTool.CasToolHolder.Views = {};


    MathUtilities.Tools.CasTool.Models.Application = Backbone.Model.extend(null, {
        init: function init() {

            $('body').append(MathUtilities.Tools.CasTool.templates.casToolHolder().trim());

            var casToolModel = null,
                casToolView = null;

            casToolModel = new MathUtilities.Tools.CasTool.CasToolHolder.Models.CasToolHolder();
            casToolView = new MathUtilities.Tools.CasTool.CasToolHolder.Views.CasToolHolder({
                model: casToolModel,
                el: '#casToolHolder'
            })

            //var inputParams = {
            //    'holderDiv': $('#editorHolder'),
            //    'editorCall': true
            //};
            //MathUtilities.Components.MathEditor.Models.Application.init(inputParams);
        }
    });
}(window.MathUtilities));
