(function () {
    'use strict';

    /**
    * View for rendering Counter Label
    *
    * @class CounterLabel
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.CounterLabel = MathInteractives.Common.Player.Views.Base.extend({
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
        * Holds the id of the container div inside which the counter label is placed
        * @property id
        * @default null
        * @private
        */
        id: null,
        /**
        * Inserts the counter label inside the container div
        * @method initialize
        * @constructor
        * @private
        */
        initialize: function () {
            this.manager = this.model.get('manager');
            this.idPrefix = this.model.get('idPrefix');
            this.id = this.model.get('id');
            this.$el.html(MathInteractives.Common.Components.templates.counterLabel({ 'counterLabelID': this.id + '-inner-container'
            }).trim());
            this.render();
            this.model.on('change', this.render, this);
        },
        /**
        * Sets the dimensions and text of the counter label
        * @method render
        * @private
        */
        render: function () {
            this.initializeCounterLabelDimensions();
            this.initializeCounterLabelText();
        },
        /**
        * Sets the dimensions of the counter label
        * @method initializeCounterLabelDimensions
        * @private
        */
        initializeCounterLabelDimensions: function initializeCounterLabelDimensions() {
            var counterLabelWidth = this.model.get('counterLabelWidth'),
                counterLabelHeight = this.model.get('counterLabelHeight');
            this.$('.counter-label').css({ 'width': counterLabelWidth + 'px', 'height': counterLabelHeight + 'px' });
        },
        /**
        * Sets the text of the counter label
        * @method initializeCounterLabelText
        * @private
        */
        initializeCounterLabelText: function initializeCounterLabelText() {
            var counterLabelText = this.model.get('counterLabelText');
            if (counterLabelText !== null && counterLabelText !== undefined) {
                this.$('.counter-label').html(counterLabelText);
            }
        },
        /**
        * Sets the width of the counter label
        * @method setCounterLabelWidth
        * @param{Number} new width of the counter label
        * @public
        */
        setCounterLabelWidth: function setCounterLabelWidth(width) {
            this.model.set({ 'counterLabelWidth': width });
        },
        /**
        * Sets the height of the counter label
        * @method setCounterLabelWidth
        * @param{Number} new height of the counter label
        * @public
        */
        setCounterLabelHeight: function setCounterLabelHeight(height) {
            this.model.set({ 'counterLabelHeight': height });
        },
        /**
        * Sets the text of the counter label
        * @method setCounterLabelText
        * @param{String} new text of the counter label
        * @public
        */
        setCounterLabelText: function setCounterLabelText(text) {
            this.model.set({ 'counterLabelText': text });
        },
        /**
        * Sets the background color of the counter label
        * @method setCounterLabelBackgroundColor
        * @param{String} the color
        * @public
        */
        setCounterLabelBackgroundColor: function setCounterLabelBackgroundColor(color) {
            this.$('.counter-label').css({ 'background-color': color });
        },
        /**
        * Sets the padding top of the counter label
        * @method setCounterLabelPaddingTop
        * @param{Number} the padding
        * @public
        */
        setCounterLabelPaddingTop: function setCounterLabelPaddingTop(padding) {
            this.$('.counter-label').css({ 'padding-top': padding + 'px' });
        },
        /**
        * Returns the width of the counter label
        * @method getCounterLabelWidth
        * @public
        */
        getCounterLabelWidth: function getCounterLabelWidth() {
            return this.model.get('counterLabelWidth');
        },
        /**
        * Returns the height of the counter label
        * @method getCounterLabelHeight
        * @public
        */
        getCounterLabelHeight: function getCounterLabelHeight() {
            return this.model.get('counterLabelHeight');
        },
        /**
        * Returns the text of the counter label
        * @method getCounterLabelText
        * @public
        */
        getCounterLabelText: function getCounterLabelText() {
            return this.model.get('counterLabelText');
        }

    }, {
        /**
        * Generates and return view of the counter label
        * @param {Object} the properties of the counter label
        * @static
        */
        generateCounterLabel: function (counterLabelProps) {
            if (counterLabelProps) {
                var counterLabelID = '#' + counterLabelProps.id,
                    counterLabelModel = new MathInteractives.Common.Components.Models.CounterLabel(counterLabelProps),
                    counterLabelView = new MathInteractives.Common.Components.Views.CounterLabel({ 'model': counterLabelModel, 'el': counterLabelID });
                return counterLabelView;
            }
        }

    });
})();