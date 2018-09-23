(function () {
    'use strict'
    MathInteractives.Common.Components.Models.CounterLabel = MathInteractives.Common.Player.Models.Base.extend({
        defaults: {
            /**
            * The id of the div in which the counter label has to be placed
            * @property id
            * @type String
            */
            id: null,
            /**
            * Holds the interactivity id prefix
            * @property idPrefix
            * @default null
            * @private
            */
            idPrefix: null,
            /**
            * Holds the interactivity manager reference
            * @property manager
            * @default null
            * @private
            */
            manager: null,
            /**
            * The width of the counter label
            * @property counterLabelWidth
            * @public
            * @default null
            */
            counterLabelWidth: null,
            /**
            * The height of the counter label
            * @property counterLabelHeight
            * @public
            * @default null
            */
            counterLabelHeight: null,
            /**
            * The text of the counter label
            * @property counterLabelText
            * @public
            * @default null
            */
            counterLabelText: null
        },
        /**
        * Initializes the dimensions and text of the counter label
        * @method initialize
        * @constructor
        * @private
        */
        initialize: function () {
            this.initializeWidth();
            this.initializeHeight();
            this.initializeText();
        },
        /**
        * Initializes the width of the counterlabel
        * @method initializeWidth
        * @public
        */
        initializeWidth: function initializeWidth() {
            var currentNamespace = MathInteractives.Common.Components.Models.CounterLabel;
            if (this.get('counterLabelWidth') === null || this.get('counterLabelWidth') === undefined) {
                this.set({ 'counterLabelWidth': currentNamespace.COUNTER_LABEL_WIDTH });
            }
        },
        /**
        * Initializes the height of the counterlabel
        * @method initializeHeight
        * @public
        */
        initializeHeight: function initializeHeight() {
            var currentNamespace = MathInteractives.Common.Components.Models.CounterLabel;
            if (this.get('counterLabelHeight') === null || this.get('counterLabelHeight') === undefined) {
                this.set({ 'counterLabelHeight': currentNamespace.COUNTER_LABEL_HEIGHT });
            }
        },
        /**
        * Initializes the text of the counterlabel
        * @method initializeText
        * @public
        */
        initializeText: function initializeText() {
            if (this.get('counterLabelText') === null || this.get('counterLabelText') === undefined) {
                this.set({ 'counterLabelText': '' });
            }
        }
    }, {
        /**
        * The default width of the counter label
        * @property COUNTER_LABEL_WIDTH
        * @static
        */
        COUNTER_LABEL_WIDTH: 58,
        /**
        * The default height of the counter label
        * @property COUNTER_LABEL_HEIGHT
        * @static
        */
        COUNTER_LABEL_HEIGHT: 23
    });
})();