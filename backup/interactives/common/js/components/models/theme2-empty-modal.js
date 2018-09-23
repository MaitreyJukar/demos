(function () {
    'use strict';

    /**
    * Holds the business logic and data of the view
    * @class EmptyModal
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
    * @namespace MathInteractives.Common.Components.Theme2.Models
    * @constructor
    */
    MathInteractives.Common.Components.Theme2.Models.EmptyModal = Backbone.Model.extend({

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
            * Id of the empty-modal
            * @property emptyModalId
            * @type String
            * @default null
            **/
            emptyModalId: null,

            /**
            * Whether the close button is visible or not
            * @property closeButtonVisible
            * @type Boolean
            * @default null
            **/
            closeButtonVisible: null,

            /**
            * Close button's tooltip type
            * @property closeButtonTooltipType
            * @type Object
            * @default null
            **/
            closeButtonTooltipType: null,

            /**
            * Accessibility id of the element in dialog body which gets focus after dialog container in tab sequence
            * @property bodyElemAccId
            * @type String
            * @default null
            **/
            bodyElemAccId: null,

            /**
            * Accessibility text of the dialog container
            * @property dialogAccText
            * @type String
            * @default null
            **/
            dialogAccText: null
        },

        /**
        * initialises the model and properties
        * @method initialize
        * @public
        **/
        initialize: function initialize() {
            var idPrefix = this.get('idPrefix'),
                emptyModalId = this.get('emptyModalId');
            if (emptyModalId.indexOf(idPrefix) < 0) {
                emptyModalId = idPrefix + emptyModalId;
                this.set('emptyModalId', emptyModalId);
            }
            if (this.get('closeButtonVisible') === null) {
                this.set('closeButtonVisible', false);
            }
            if (this.get('closeButtonTooltipType') === null) {
                this.set('closeButtonTooltipType',MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.GENERAL);
            }
            if (this.get('bodyElemAccId') === null) {
                this.set('bodyElemAccId',emptyModalId.replace(this.idPrefix, '') + '-body');
            }
            if (this.get('dialogAccText') === null) {
                this.set('dialogAccText','');
            }
        }

        
    });
})(window.MathInteractives);