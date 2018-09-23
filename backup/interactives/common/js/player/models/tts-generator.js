(function () {
    'use strict';

    /**
    * Conatins button data
    *
    * @class TTS
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Player.Models
    */
    MathInteractives.Common.Player.Models.TTS = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                * TTS Container ID
                * 
                * @property id
                * @type String
                * @defaults Empty string
                */
                containerId: '',

                /**
                * stores messages to play
                * 
                * @property messagesToPlay
                * @type String
                * @defaults null
                */
                messagesToPlay: null,
                /**
                * boolean to set focus on complete
                * 
                * @property isSetFocusOnComplete
                * @type boolean
                * @defaults true
                */
                isSetFocusOnComplete: true,
                /**
                * TTS Base Class
                *
                * @property ttsBaseClass
                * @type Object
                * @default null
                */
                ttsBaseClass: null,
                /**
                * TTS button color 
                *
                * @property ttsColor
                * @type Object
                * @default null
                */
                ttsColor: null,
                /**
                * Define the tooltip type for button
                * @property tooltipColorType
                * @type Object
                * @defaults null
                */
                tooltipColorType:null,

                /**
                * stores whether TTS is disabled or not
                * @property isDisabled
                * @type boolean
                * @defaults false
                */
                isDisabled: false

            }

        },

        /**
        * gets the TTS Base Class
        *
        * @method getTTSBaseClass
        * @public
        * @return ttsBaseClass {String} 
        **/
        getTTSBaseClass: function getTTSBaseClass() {
            return this.get('ttsBaseClass');
        },

        /**
        * set TTS Base Class
        *
        * @method setTTSBaseClass
        * @public
        **/
        setTTSBaseClass: function setTTSBaseClass(value) {
            this.set('ttsBaseClass', value);
        },
        /**
        * gets the status on complete
        *
        * @method getFocusStatusOnComplete
        * @public
        * @return isSetFocusOnComplete {boolean} 
        **/
        getFocusStatusOnComplete: function () {
            return this.get('isSetFocusOnComplete');
        },
        /**
        * sets focus on complete 
        *
        * @method setFocusStatusOnComplete
        * @public
        **/
        setFocusStatusOnComplete: function (isSetFocus) {
            this.set('isSetFocusOnComplete', isSetFocus);
        },
        /**
        * gets TTS color
        *
        * @method getTTSColor
        * @public
        * @return ttsColor {String} 
        **/
        getTTSColor: function getTTSColor() {
            return this.get('ttsColor');
        },
        /**
        * sets TTS color
        *
        * @method setTTSColor
        * @public
        **/
        setTTSColor: function setTTSColor(value) {
            this.set('ttsColor', value);
        }


    });
})();