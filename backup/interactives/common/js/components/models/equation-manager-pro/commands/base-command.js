(function (MathInteractives) {
    'use strict';

    var modelNameSpace = MathInteractives.Common.Components.Models.EquationManagerPro,
        utilityMethods = modelNameSpace.EquationManagerPro.Utils;

    /**
    * BaseCommans
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    * @extends MathInteractives.Common.Components.Models.EquationManager.BaseCommand
    * @type Object
    * @constructor
    */
    modelNameSpace.BaseCommand = MathInteractives.Common.Player.Models.Base.extend({

        /**
        * Initializes the command.
        * This method should be overridden in a subclass.
        *
        * @method initialize
        */
        initialize: function () {

        },

        /**
        * Executes the command.
        * This method should be overridden in a subclass.
        *
        * @method execute
        */
        execute: function () {

        },

        /**
        * Undones the command.
        * This method should be overridden in a subclass.
        *
        * @method undo
        */
        undo: function () {

        }
    }, {


    });
})(window.MathInteractives);
