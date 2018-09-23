(function () {
    /**
    * Contains Debugger related options
    *
    * @class Debugger
    * @module Utilities
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Utilities.Models
    */
    MathInteractives.Common.Utilities.Models.Debugger = Backbone.Model.extend({}, {

        /**
        * Sets debug mode on/off
        * 
        * @property DEBUG
        * @static
        * @type Boolean
        * @default true
        */
        DEBUG: true, //false,

        /**
        * Displays log in browser console.
        *
        * @method log
        * @static
        * @param logContent {String} log to be displayed.
        **/
        log: function (logContent) {
            if (this.DEBUG && (typeof console !== 'undefined' && typeof console.log !== 'undefined'))
                console.log('LOG: ' + logContent);
        },

    });
    MathInteractives.Debugger = MathInteractives.Common.Utilities.Models.Debugger;
})();