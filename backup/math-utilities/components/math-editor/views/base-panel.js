(function (MathUtilities) {
    'use strict';
    /**
    * A customized Backbone.View that holds the logic behind the presentation of Keyboard-alphabets, numbers.
    * @class BasePanelView
    * @constructor
    * @namespace Components.MathEditor.Keyboard.Views
    * @module MathEditor
    * @submodule Keyboard
    * @extends Backbone.View
    */
    MathUtilities.Components.MathEditor.Keyboard.Views.BasePanel = Backbone.View.extend({

        /**
        * @property _keyMatrixSet
        * @type Object
        * @default null
        */
        _keyMatrixSet: null,

        /**
        * Instantiates KeyMatrixModel model and KeyMatrixView view.
        * @method initialize
        */
        initialize: function initialize() {

            var thisModel = this.model,
            keyMatrixSet = this._keyMatrixSet = [],
            $el = this.$el,
            jsonData = thisModel.get('jsonData'),
            matrixCount = thisModel.get('matrixCount'),
            keyMatrixModel = null,
            newKeyMatrix = null,
            cnt = 0;

            for (cnt = 0; cnt < matrixCount; cnt++) {
                keyMatrixModel = new MathUtilities.Components.MathEditor.Keyboard.Models.KeyMatrix();

                $el.append(MathUtilities.Components.MathEditor.templates.numberPanel({
                    _boxId: cnt + 1
                }).trim());

                keyMatrixModel.parseData(jsonData['box' + (cnt + 1)]);

                newKeyMatrix = new MathUtilities.Components.MathEditor.Keyboard.Views.KeyMatrix({
                    model: keyMatrixModel,
                    el: this.$('.box' + [cnt + 1])

                });
                keyMatrixSet.push(newKeyMatrix);
            }
             this.render();
        },

        /**
        * Triggers parent view function on keyboard-key click.
        * @method onClick
        * @private
        */
        onClick: function onClick() {
            var keyCode = arguments[0],
            ignoreText = arguments[1],
            enterClicked = arguments[2],
                id = arguments[3];
            this.trigger('click', keyCode, ignoreText, enterClicked, id);
        },

        /**
        * Inserts html of number panel changes into DOM and binds event for the key set.
        * @method render
        * @chainable
        * @return {Object}
        */
        render: function render() {
            for (var i = 0; i < this._keyMatrixSet.length; i++) {
                this._keyMatrixSet[i].on('click', $.proxy(this.onClick, this));
            }
            this.$el.addClass('panel').addClass('hidePanel');
            return this;
        }
    });
}(window.MathUtilities));
