(function () {
    'use strict';
    /**
    * Holds the business logic and data of the view
    * @class CheckBox
    * @extends Backbone.Model.extend
    * @namespace MathInteractives.Common.Components.Theme2.Models
    * @constructor
    */
    MathInteractives.Common.Components.Theme2.Models.CheckBox = Backbone.Model.extend({

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
            * Id of the container in which the checkbox is to be placed
            * @property containerId
            * @type String
            * @default null
            **/
            containerId: null,

            /**
            * Text to be displayed along with checkbox
            * @property label
            * @type String
            * @default null
            **/
            label: null,

            /**
            * Internal value of the checkbox
            * @property value
            * @type String
            * @default null
            **/
            value: null,

            /**
            * Type of the checkbox
            * @property checkBoxType
            * @type Object
            * @default null
            **/
            checkBoxType: null,

            /**
            * Whether the checkbox is checked or not
            * @property checked
            * @type Boolean
            * @default null
            **/
            checked: null,

            /**
            * Whether the checkbox is enabled or not
            * @property enabled
            * @type Boolean
            * @default null
            **/
            enabled: null,

            /**
            * Whether the checkbox is visible or not
            * @property visible
            * @type Boolean
            * @default null
            **/
            visible: null,

            /**
            * Base class for the checkbox icon when the checkbox is enabled and not checked
            * @property baseClassName
            * @type String
            * @default null
            **/
            baseClassName: null,

            /**
            * Class for the checkbox icon when the checkbox is enabled and checked
            * @property checkedClassName
            * @type String
            * @default null
            **/
            checkedClassName: null,

            /**
            * Class for the checkbox icon when the checkbox is disabled
            * @property disabledClassName
            * @type String
            * @default null
            **/
            disabledClassName: null,

            /**
            * Tab index of checkbox
            * @property tabIndex
            * @type Number
            * @default null
            */
            tabIndex: null,

            /**
            * Accessibility text of checkbox
            * @property accText
            * @type String
            * @default null
            */
            accText: null,
            /**
           * Id of the container to be focused after selecting or deselcting
           * @property focusAfterSelection
           * @type String
           * @default null
           **/
            focusAfterSelection: null,

            /**
           * Id of the container to be focused after selecting or deselcting for JAWS to read updated Acc Text
           * @property dummyDivId
           * @type String
           * @default null
           **/
            dummyDivId : null,

            /**
           * delay for set focus
           * @property focusDelay
           * @type Number
           * @default 0
           **/
            focusDelay: 0,

            /**
            * Class for the checkbox icon when the checkbox gets hover
            * @property hoverClassName
            * @type String
            * @default null
            **/
            hoverClassName: null,

            /**
            * Object to set offset top and offset left of acc div
            * @property offsetParams
            * @type object
            * @default null
            **/
            offsetParams: {
                offsetLeft: null,
                offsetTop:null
            },

            /**
            * Boolean to check if Acc is on or off.
            * @property isAccOn
            * @type boolean
            * @default true
            **/
            isAccOn:true

        },

        /**
        * Initialize the model properties
        * @method initialize
        * @public
        */
        initialize: function initialize() {
            var checkBoxType = this.get('checkBoxType'),
                modelNamespace = MathInteractives.Common.Components.Theme2.Models.CheckBox;
            if (this.get('label') === null) {
                this.set('label', modelNamespace.DEFAULTS.LABEL);
            }
            if (this.get('value') === null) {
                this.set('value', modelNamespace.DEFAULTS.VALUE);
            }
            if (checkBoxType === null) {
                checkBoxType = modelNamespace.CHECKBOX_TYPE.GENERAL;
                this.set('type', checkBoxType);
            }
            else if (checkBoxType === modelNamespace.CHECKBOX_TYPE.CUSTOM) {
                if (this.get('baseClassName') === null) {
                    checkBoxType = modelNamespace.CHECKBOX_TYPE.GENERAL;
                    this.set('type', checkBoxType);
                }
                else {
                    if (this.get('checkedClassName') === null) {
                        this.set('checkedClassName', checkBoxType.checkedClassName);
                    }
                    if (this.get('disabledClassName') === null) {
                        this.set('disabledClassName', checkBoxType.disabledClassName);
                    }
                    if (this.get('hoverClassName') === null) {
                        this.set('hoverClassName', checkBoxType.hoverClassName);
                    }
                }
            }
            if (checkBoxType === modelNamespace.CHECKBOX_TYPE.GENERAL) {
                this.set('baseClassName', checkBoxType.baseClassName);
                this.set('checkedClassName', checkBoxType.checkedClassName);
                this.set('disabledClassName', checkBoxType.disabledClassName);
                this.set('hoverClassName', checkBoxType.hoverClassName);
            }
            if (this.get('checked') === null) {
                this.set('checked', modelNamespace.DEFAULTS.CHECKED);
            }
            if (this.get('enabled') === null) {
                this.set('enabled', modelNamespace.DEFAULTS.ENABLED);
            }
            if (this.get('visible') === null) {
                this.set('visible', modelNamespace.DEFAULTS.VISIBLE);
            }
        }
    },
    {
        /**
        * Default properties for check-box
        * @property DEFAULTS
        * @public
        * @static
        * @namespace MathInteractives.Common.Components.Theme2.Models.CheckBox
        **/
        DEFAULTS: {
            LABEL: '',
            VALUE: '',
            CHECKED: false,
            ENABLED: true,
            VISIBLE: true
        },

        /**
        * Type of check-box
        * @property CHECKBOX_TYPE
        * @public
        * @static
        * @namespace MathInteractives.Common.Components.Theme2.Models.CheckBox
        **/
        CHECKBOX_TYPE: {
            GENERAL: {
                id: 'general-checkbox',
                category: 'general-checkbox',
                baseClassName: 'general-checkbox',
                checkedClassName: 'checked',
                disabledClassName: 'disabled',
                hoverClassName: 'hover'
            },
            CUSTOM: {
                id: 'custom-checkbox',
                category: 'custom-checkbox',
                baseClassName: 'custom-checkbox',
                checkedClassName: 'checked',
                disabledClassName: 'disabled',
                hoverClassName: 'hover'
            }
        },

        /**
        * Events for the check-box
        * @property EVENTS
        * @public
        * @static
        * @namespace MathInteractives.Common.Components.Theme2.Models.CheckBox
        **/
        EVENTS: {
            CHECK_CHANGED: 'check-changed',
            LABEL_CHANGED: 'label-changed',
            VALUE_CHANGED: 'value-changed',
            ENABLE_CHANGED: 'enable-changed',
            VISIBLE_CHANGED: 'visible-changed'
        }

    });
})(window.MathInteractives);
