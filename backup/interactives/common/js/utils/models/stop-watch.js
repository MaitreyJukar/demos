(function () {
    'use strict';
    var StopWatch = Backbone.Model.extend({
        defaults: {
            /**
            * Holds start offset for starting stop watch
            *          
            * @attribute _nStartOffset
            * @type Number
            * @default null
            */
            _nStartOffset: null,
            /**
            * Holds start time of stop watch
            *          
            * @attribute _nStartMilliSeconds
            * @type Number
            * @default 0
            */
            _nStartMilliSeconds: 0,
            /**
            * Holds elapse time of stop watch
            *          
            * @attribute nElapsedMilliseconds
            * @type Number
            * @default 0
            */
            nElapsedMilliseconds: 0
        },
        /**        
        * @namespace MathInteractives.Common.Utilities.Models
        * @class StopWatch 
        * @constructor
        */
        initialize: function () {
            var nOffset = 0;
            this.set('_nStartOffset', 0);
        },

        /**
        * Start the timer and sets _nStartMilliSeconds attribute 
        *
        * @method start
        * @public       
        **/
        start: function () {
            this.set('_nStartMilliSeconds', new Date().getTime());
        },

        /**
        * Stop the timer and sets _nElapsedMilliseconds attribute 
        *
        * @method stop
        * @public       
        **/
        stop: function () {
            this.set('_nElapsedMilliseconds', new Date().getTime() - this.get('_nStartMilliSeconds') + this.get('_nStartOffset'));
        }
    });

    /**
    * Holds the start and stop method for stop watch
    * @class StopWatch
    * @module Utilities
    * @extends Backbone.Model.extend
    * @namespace MathInteractives.Common.Utilities.Models
    * @constructor
    */
    MathInteractives.Common.Utilities.Models.StopWatch = StopWatch;
} ());