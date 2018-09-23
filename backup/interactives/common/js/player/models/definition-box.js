(function () {
    'use strict';

    /**
    * Holds Definition Box related data
    *
    * @class DefinitionBox
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Player.Models
    */
    MathInteractives.Common.Player.Models.DefinitionBox = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                * Text to be displayed as title of definition box
                * 
                * @property title
                * @type String
                * @defaults Title
                */
                title: 'Title',

                /**
                * Text to be read on accessibility
                * 
                * @property accTitle
                * @type String
                * @defaults null
                */
                accTitle: null,

                /**
                * Text to be displayed in the body of definition box
                * 
                * @property content
                * @type String
                * @defaults 'Default content'
                */
                content: 'Default content',

                /**
                * Text to be read on accessibility
                * 
                * @property accContent
                * @type String
                * @defaults null
                */
                accContent: null,

                /**
                * Path to audio file **
                */
                audioFilePath: 'path to audio file',
                /**
                * Element on which definition box is called.
                * 
                * @property eventTarget
                * @type Object
                */
                eventTarget: null,

                /**
                * A call back function on box close
                * 
                * @property closeCallback
                * @type {Object}
                */
                closeCallback: null
            }
        }
    }, {
    });
})()