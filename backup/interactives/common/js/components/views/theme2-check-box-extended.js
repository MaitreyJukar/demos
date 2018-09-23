(function () {
    'use strict';

    /**
    * View for rendering checkbox and its related events
    *
    * @class CheckBox
    * @constructor
    * @extends MathInteractives.Common.Components.Theme2.Views.CheckBoxExtended
    * @namespace MathInteractives.Common.Components.Theme2.Views
    * @type Object
    **/
    MathInteractives.Common.Components.Theme2.Views.CheckBoxExtended = MathInteractives.Common.Components.Theme2.Views.CheckBox.extend({

        /**
        * Initialize the properties and attach events
        * @method initialize
        * @public
        **/
        initialize: function initialize() {
            this.constructor.__super__.initialize.apply(this, arguments);

        },

        /**
        * Renders the checkbox view
        * @method _render
        * @return null
        * @private
        **/
        _render: function _render() {
            var model = this.model;
            this.$el.append(MathInteractives.Common.Components.templates.theme2CheckBox({
                'containerId': this.model.get('containerId')
            }).trim());
            this._renderIcon();
            if (model.get('isLabelRemoved') === true) {
                this.$('.check-box-label-container').remove();
            }
            else {
                this._renderLabel();
            }
            this._enableCheckBox(model, model.get('enabled'));
            this._showHideCheckBox(model, model.get('visible'));
            if (model.get('isAccOn') !== false) {
                this.setAccessibility();
            }
            return null;
        },

        /**
        * select the checkbox on space keydown event
        * @method selectBySpace
        * @param {Object} event Event object
        * @public
        **/
        selectBySpace: function selectBySpace(event) {
            var keycode = (event.keyCode) ? event.keyCode : event.which,
                model = this.model,
                dummyDivId = model.get('dummyDivId'),
                containerId = model.get('containerId'),
                focusAfterSelection = model.get('focusAfterSelection'),
                focusDelay = model.get('focusDelay'),
                elementId = containerId.replace(this.idPrefix, '');

            if (keycode === 32) {
                this._checkBoxClicked();

                if (focusAfterSelection === null) {
                    if (dummyDivId !== null) {
                        this.setFocus(dummyDivId);
                    }
                    else {
                        $('#' + model.get('containerId') + 'temp-focus-div').focus();
                    }
                    this.setFocus('checkbox-container10-check-box-container');
                    this.setFocus(elementId, focusDelay);
                }
                else {
                    this.setFocus(focusAfterSelection, focusDelay);
                }
            }
        },


        /**
        * Handles Accessibility : Creates acc div, sets acc message, binds acc events.
        * @method setAccessibility
        * @public
        **/
        setAccessibility: function setAccessibility() {
            this.loadScreen('checkbox-acc-screen');

            var model = this.model, $tempFocusDiv, dummyDivId = model.get('dummyDivId'),
                accText = model.get('accText'),
                containerId = model.get('containerId'),
                elementId = containerId.replace(this.idPrefix, ''),
                offsetParams = model.get('offsetParams');

            if (this.isChecked() === true) {
                accText = accText + ' ' + this.getAccMessage('checkbox-acc-text', 1);
            }
            else {
                accText = accText + ' ' + this.getAccMessage('checkbox-acc-text', 0);
            }

            // Create Acc div for checkbox container
            this.createAccDiv({
                'elementId': elementId,
                'tabIndex': model.get('tabIndex'),
                'acc': accText,
                'offsetTop':offsetParams.offsetTop,
                'offsetLeft':offsetParams.offsetLeft
            });

            if (typeof dummyDivId !== 'undefined' && dummyDivId !== null) {
                $tempFocusDiv = $('<div>', {
                    id: model.get('containerId') + 'temp-focus-div',
                    style: 'position: absolute; height: 1px; width: 1px; top: 1px; left: 1px;',
                    tabindex: -1
                });
                $(this.$el.parent()).prepend($tempFocusDiv);
            }
            this.$('#' + containerId + '-acc-elem').on('keydown', $.proxy(this.selectBySpace, this));
        }
    }, {

        /**
        * Initializes the checkbox model with the specified properties, creates the checkbox view based on
        * the checkbox model and returns the checkbox view
        * @method createCheckBox
        * @param checkBoxProps {Object} Checkbox properties
        * @return Newly created checkbox view if the properties are passed or null otherwise
        * @public
        * @static
        **/
        createCheckBox: function (checkBoxProps) {
            var containerId = '',
                checkBoxModel = null,
                checkBoxView = null;
            if (checkBoxProps) {
                containerId = '#' + checkBoxProps.containerId;
                checkBoxModel = new MathInteractives.Common.Components.Theme2.Models.CheckBox(checkBoxProps);
                checkBoxView = new MathInteractives.Common.Components.Theme2.Views.CheckBoxExtended({ el: containerId, model: checkBoxModel });
            }
            return checkBoxView;
        }
    });
    MathInteractives.global.Theme2.CheckBoxExtended = MathInteractives.Common.Components.Theme2.Views.CheckBoxExtended;
})(window.MathInteractives);
