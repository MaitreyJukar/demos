
(function () {
    'use strict';

    /**
    * Conatins Pop-up data
    *
    * @class PopUp
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Player.Models
    */
    MathInteractives.Common.Player.Models.PopUp = Backbone.Model.extend({
        defaults: function () {
            return {

                /**
                * Width of the pop-up         
                * @property width
                * @type Number
                * @defaults null
                */
                width: null,

                /**
                * Type of pop-up to be shown                
                * @property type
                * @type {object}
                * @defaults null
                */
                type: MathInteractives.Common.Player.Models.PopUp.TYPE.ALERT,

                /**
                * Title text to be displayed in the pop-up                
                * @property title
                * @type String
                * @defaults null
                */
                title: null,

                /**
                * Title text to be read in accessibility
                * 
                * @property accTitle
                * @type String
                * @defaults null
                */
                accTitle: null,

                /**
                * Icon to be displayed with title text
                * 
                * @property titleIcon
                * @type {object}
                * @defaults null
                */
                titleIcon: null,
                /**
                * Whether pop-up has Close button
                * 
                * @property hasCloseBtn
                * @type Boolean
                * @defaults false
                **/
                hasCloseBtn: false,
                /**
                * Text to be displayed in the pop-up
                * 
                * @property text
                * @type String
                * @defaults null
                */
                text: null,

                /**
                * Text to be read in accessibility
                * 
                * @property accText
                * @type String
                * @defaults null
                */
                accText: null,

                /**
                * Function to be called when pop-up is closed in given scope 
                * @property closeCallback
                * @type {Object}
                * @defaults null
                */
                closeCallback: null,

                /**
                * Stores buttons to be generated as per values specification
                * @property customButtons
                * @type {Object}
                * @defaults []
                */
                buttons: [],

                /**
                * Stores screen id of custom buttons screen which contains cutsom buttons acc text
                * @property customBtnAccScreenId
                * @type {String}
                * @defaults null
                */
                customBtnAccScreenId: null,

                /**
                * Function to be called when pop-up is shown in given scope 
                * @property showCallback
                * @type {Object}
                * @defaults null
                */
                showCallback: null
            }
        }
    }, {

        /**
        * 'TYPE' of pop-up to be shown
        *
        * @static 
        **/
        TYPE: {
            ALERT: {
                id: 'alert',
                //title: 'Alert',
                //accTitle: 'Alert',
                titleIcon: { iconClass: 'alert-symbol', width: 34, height: 29 },
                buttons: [
                    {
                        id: 'pop-up-ok-btn',
                        type: MathInteractives.Common.Components.Views.Button.TYPE.GENERAL,
                        //text: 'OK',
                        response: { isPositive: true, buttonClicked: 'pop-up-ok-btn' }
                    }
                ]
            },
            CONFIRM: {
                id: 'confirm',
                //title: 'Confirm',
                //accTitle: 'Confirm',
                titleIcon: { iconClass: 'alert-symbol', width: 34, height: 29 },
                buttons: [
                    {
                        id: 'pop-up-yes-btn',
                        type: MathInteractives.Common.Components.Views.Button.TYPE.GENERAL,
                        //text: 'YES',
                        response: { isPositive: true, buttonClicked: 'pop-up-yes-btn' }

                    },
                    {
                        id: 'pop-up-no-btn',
                        type: MathInteractives.Common.Components.Views.Button.TYPE.GENERAL,
                        //text: 'NO',
                        response: { isPositive: false, buttonClicked: 'pop-up-no-btn' }
                    }
                ]
            },
            CUSTOM: {
                id: 'custom',
                titleIcon: { iconClass: 'alert-symbol', width: 34, height: 29 }
            }
        }
    });

})();