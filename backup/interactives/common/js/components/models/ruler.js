(function () {
    'use strict';
    /**
    * Holds the business logic and data of the view
    * @class Ruler 
    * @extends MathInteractives.Common.Components.Models.BaseInteractive
    * @submodule MathInteractives.Common.Components.Models
    * @namespace MathInteractives.Common.Components
    * @constructor
    */
    MathInteractives.Common.Components.Models.Ruler = Backbone.Model.extend({
        /*
        * Defaults initializes default parameters to textual data & canvasView to null.
        */
        defaults: {

            /**
            * Player object
            * @property player
            * @type Object
            * @default null
            **/
            player: null,

            /**
            * Manager object
            * @property manager
            * @type Object
            * @default null
            **/
            manager: null,

            /**
            * File-path object
            * @property filePath
            * @type Object
            * @default null
            **/
            filePath: null,

            /**
           * Id prefix of the interactivity
           * @property idPrefix
           * @type String
           * @default null
           **/
            idPrefix: null,

            /**
            * Id of the container in which the ruler is to be placed
            * @property containerId
            * @type String
            * @default null
            **/
            containerId: null,

            /**
            * Ruler height passed by user
            * @property rulerHeight
            * @type Object
            * @default null
            **/
            rulerHeight: null,

            /**
            * Ruler width passed by user
            * @property rulerWidth
            * @type Object
            * @default null
            **/
            rulerWidth: null,

            /**
            * Whether the ruler should rotate or not
            * @property rotateByDefault
            * @type Object
            * @default true
            **/
            rotateByDefault: true,

            /**
            * Font color passed by user
            * @property  fontColor
            * @type Object
            * @default null
            **/
            fontColor: null,

            fontSize: 10,

            /**
            * Background color of ruler passed by user
            * @property  backgroundColor
            * @type Object
            * @default null
            **/
            backgroundColor: null,

            lineLength: null,
            allowmmScale: false,
            tickInterVal: 1

        },

        initialize: function () {

        },
        getRulerHeight: function () {
            return this.get('rulerHeight') + 'px';
        },
        getRulerWidth: function () {
            return this.get('rulerWidth') + 'px';
        },
        getIdPrefix: function () {
            return this.get('idPrefix');
        },
        getLineLength: function () {
            return this.get('lineLength');
        },
        getBackgroundColor: function () {
            return this.get('backgroundColor');
        },
        getFontColor: function () {
            return this.get('fontColor');
        },
        getFontSize: function () {
            return this.get('fontSize') + 'px';
        },
        getAllowmmScale: function () {
            return this.get('allowmmScale');
        },
        getTickInterVal: function () {
            return this.get('tickInterVal');
        }

    });


})(window.MathInteractives);