(function () {
    'use strict';

    /**
    * View for rendering checkbox and its related events
    *
    * @class CheckBox
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Theme2.Views
    * @type Object
    **/
    MathInteractives.Common.Components.Theme2.Views.CheckBox = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Checkbox events and their corresponding handlers
        * @property events
        * @type Object
        **/
        events: {
            'click .check-box-label,.check-box-icon': '_checkBoxClicked'
        },

        /**
        * Initialize the properties and attach events
        * @method initialize
        * @public
        **/
        initialize: function initialize() {
            this.initializeDefaultProperties();
            this._render();

            this._attachEvents();
        },

        /**
        * Toggles the checkbox checked state
        * @method _checkBoxClicked
        * @param {Object} event Event object
        * @private
        **/
        _checkBoxClicked: function _checkBoxClicked(event) {
            var model = this.model;

            if (this.model.get('enabled') === true) {
                var checkedStatus = !this.isChecked();
                this.setChecked(checkedStatus);
            }

        },

        /**
        * Changes the appeance on checkbox mouse-over and mouse-out
        * @method _checkBoxHover
        * @param {Object} event Event object
        * @private
        **/
        _checkBoxHover: function _checkBoxHover(event) {
            if (this.model.get('enabled') === true) {
                this.$('.check-box-icon').addClass(this.model.get('hoverClassName'));
                this.$('.check-box-label').addClass(this.model.get('hoverClassName'));
            }
        },

        /**
        * Changes the appeance on checkbox mouse-over and mouse-out
        * @method _checkBoxHoverEnd
        * @param {Object} event Event object
        * @private
        **/
        _checkBoxHoverEnd: function _checkBoxHoverEnd(event) {
            if (this.model.get('enabled') === true) {
                this.$('.check-box-icon').removeClass(this.model.get('hoverClassName'));
                this.$('.check-box-label').removeClass(this.model.get('hoverClassName'));
            }
        },

        /**
        * Renders the checkbox view
        * @method _render
        * @return null
        * @private
        **/
        _render: function _render() {
            this.$el.append(MathInteractives.Common.Components.templates.theme2CheckBox({
                'containerId': this.model.get('containerId')
            }).trim());
            this._renderIcon();
            this._renderLabel();
            this._enableCheckBox(this.model, this.model.get('enabled'));
            this._showHideCheckBox(this.model, this.model.get('visible'));

            this.loadScreen('checkbox-acc-screen');

            var model = this.model,
                accText = model.get('accText'),
                containerId = model.get('containerId'),
                elementId = containerId.replace(this.idPrefix, '');

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
                'acc': accText
            });

            var $tempFocusDiv = $('<div>', {
                id: this.idPrefix + 'temp-focus-div',
                style: 'position: absolute; height: 1px; width: 1px; top: 1px; left: 1px;'
            });
            this.$el.append($tempFocusDiv);
            this.loadScreen('temp-focus-div-screen');

            this.$('#' + containerId + '-acc-elem').on('keydown', $.proxy(this.selectBySpace, this));
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
            containerId = model.get('containerId'),
            focusAfterSelection = model.get('focusAfterSelection'),
            focusDelay = model.get('focusDelay'),
            elementId = containerId.replace(this.idPrefix, '');

            if (keycode === 32) {
                this._checkBoxClicked();

                //$tempFocusDiv.remove();
                if (focusAfterSelection === null) {
                    this.setFocus('temp-focus-div');
                    this.setFocus(elementId, focusDelay);
                }
                else {
                    this.setFocus(focusAfterSelection, focusDelay);
                }
            }
        },

        /**
        * Renders the icon of the checkbox
        * @method _renderIcon
        * @private
        **/
        _renderIcon: function _renderIcon() {
            var $iconDiv = this.$('.check-box-icon');

            if (typeof this.model.get('baseClassName') !== 'undefined') {
                $iconDiv.addClass(this.model.get('baseClassName'));
            }
            if (this.model.get('checked') === true) {
                $iconDiv.find('.check-icon').addClass(this.model.get('checkedClassName') + '  fa fa-check');
            }
            else {
                $iconDiv.find('.check-icon').removeClass(this.model.get('checkedClassName') + '  fa fa-check');
            }
        },

        /**
        * Renders the text to be displayed along with checkbox
        * @method _renderLabel
        * @private
        **/
        _renderLabel: function _renderLabel() {
            this.$('.check-box-label').html(this.model.get('label'));
        },

        /**
        * Triggers check-box label change event along with new label
        * @method _triggerLabelChange
        * @param {Object} model Model
        * @param {String} label Text label of the checkbox
        * @private
        **/
        _triggerLabelChange: function _triggerLabelChange(model, label) {
            var eventData = {
                id: this.model.get('containerId'),
                label: label
            };
            this.trigger(MathInteractives.Common.Components.Theme2.Models.CheckBox.EVENTS.LABEL_CHANGED, eventData);
            this._renderLabel();
        },

        /**
        * Sets the text to be displayed along with checkbox
        * @method setLabel
        * @param {String} label Text to be displayed along with checkbox
        * @public
        **/
        setLabel: function setLabel(label) {
            if (typeof label === 'undefined' || label === null) {
                label = MathInteractives.Common.Components.Theme2.Models.CheckBox.DEFAULTS.LABEL;
            }
            this.model.set('label', label);
        },

        /**
        * Triggers check-box value change event along with new value
        * @method _triggerValueChange
        * @param {Object} model Model
        * @param {String} value Internal value of the checkbox
        * @private
        **/
        _triggerValueChange: function _triggerValueChange(model, value) {
            var eventData = {
                id: this.model.get('containerId'),
                value: value
            };
            this.trigger(MathInteractives.Common.Components.Theme2.Models.CheckBox.EVENTS.VALUE_CHANGED, eventData);
        },

        /**
        * Sets the internal value of the checkbox
        * @method setValue
        * @param {String} value Internal value of the checkbox
        * @public
        **/
        setValue: function setValue(value) {
            if (typeof value === 'undefined' || value === null) {
                value = MathInteractives.Common.Components.Theme2.Models.CheckBox.DEFAULTS.VALUE;
            }
            this.model.set('value', value);
        },

        /**
        * Gets the internal value of the checkbox
        * @method getValue
        * @return {String} Internal value of the checkbox
        * @public
        **/
        getValue: function getValue() {
            return this.model.get('value');
        },

        /**
        * Triggers check-box check change event along with new check status
        * @method _triggerCheckChange
        * @param {Object} model Model
        * @param {Boolean} checked True if the checkbox is checked or false if it is unchecked
        * @private
        **/
        _triggerCheckChange: function _triggerCheckChange(model, checked) {
            var eventData = {
                id: this.model.get('containerId'),
                checked: checked
            };
            this.trigger(MathInteractives.Common.Components.Theme2.Models.CheckBox.EVENTS.CHECK_CHANGED, eventData);
            this._renderIcon();
        },

        /**
        * Checks or un-checks the checkbox based on parameter
        * @method setChecked
        * @param {Boolean} checked True to check the checkbox or false to un-check it
        * @public
        **/
        setChecked: function setChecked(checked) {
            var model = this.model,
                accText = model.get('accText'),
                containerId = model.get('containerId'),
                elementId = containerId.replace(this.idPrefix, '');

            if (typeof checked === 'undefined' || checked === null) {
                checked = MathInteractives.Common.Components.Theme2.Models.CheckBox.DEFAULTS.CHECKED;
            }
            this.model.set('checked', checked);

            if (checked === true) {
                accText = accText + ' ' + this.getAccMessage('checkbox-acc-text', 1);
            }
            else {
                accText = accText + ' ' + this.getAccMessage('checkbox-acc-text', 0);
            }
            this.setAccMessage(elementId, accText);
        },


        /**
        * Gets the checkbox checked state
        * @method isChecked
        * @return {Boolean} True if the checkbox is checked or false if it is not checked
        * @public
        **/
        isChecked: function isChecked() {
            return this.model.get('checked');
        },

        /**
        * Enables or disables the checkbox based on parameter
        * @method _enableCheckBox
        * @param {Object} model Model
        * @param {Boolean} enabled True if the checkbox is enabled or false if it is disabled
        * @private
        **/
        _enableCheckBox: function _enableCheckBox(model, enabled) {
            if (enabled === true) {
                this.$('.check-box-container').removeClass(model.get('disabledClassName'));
            }
            else {
                this.$('.check-box-container').addClass(model.get('disabledClassName'));
            }
        },

        /**
        * Triggers check-box enable change event along with new enable status
        * @method _triggerEnableChange
        * @param {Object} model Model
        * @param {Boolean} enabled True if the checkbox is enabled or false if it is disabled
        * @private
        **/
        _triggerEnableChange: function _triggerEnableChange(model, enabled) {
            var eventData = {
                id: this.model.get('containerId'),
                enabled: enabled
            };
            this.trigger(MathInteractives.Common.Components.Theme2.Models.CheckBox.EVENTS.ENABLE_CHANGED, eventData);
            this._enableCheckBox(model, enabled);
        },

        /**
        * Enables or disables the checkbox based on parameter
        * @method setEnabled
        * @param {Boolean} enabled True to enabled the checkbox or false to disable it
        * @public
        **/
        setEnabled: function setEnabled(enabled) {
            if (typeof enabled === 'undefined' || enabled === null) {
                enabled = MathInteractives.Common.Components.Theme2.Models.CheckBox.DEFAULTS.ENABLED;
            }
            this.model.set('enabled', enabled);
        },

        /**
        * Gets the checkbox enabled state
        * @method isEnabled
        * @return {Boolean} True if the checkbox is enabled or false if it is disabled
        * @public
        **/
        isEnabled: function isEnabled() {
            return this.model.get('enabled');
        },

        /**
        * Shows or hides the checkbox based on parameter
        * @method _showHideCheckBox
        * @param {Object} model Model
        * @param {Boolean} visible True if the checkbox is visible or false if it is hidden
        * @private
        **/
        _showHideCheckBox: function _showHideCheckBox(model, visible) {
            if (visible === true) {
                this.$el.show();
            }
            else {
                this.$el.hide();
            }
        },

        /**
        * Triggers check-box visible change event along with new visible status
        * @method _triggerVisibleChange
        * @param {Object} model Model
        * @param {Boolean} visible True if the checkbox is visible or false if it is hidden
        * @private
        **/
        _triggerVisibleChange: function _triggerVisibleChange(model, visible) {
            var eventData = {
                id: this.model.get('containerId'),
                visible: visible
            };
            this.trigger(MathInteractives.Common.Components.Theme2.Models.CheckBox.EVENTS.VISIBLE_CHANGED, eventData);
            this._showHideCheckBox(model, visible);
        },

        /**
        * Shows or hides the checkbox based on parameter
        * @method setVisible
        * @param {Boolean} visible True to show the checkbox or false to hide it
        * @public
        **/
        setVisible: function setVisible(visible) {
            if (typeof visible === 'undefined' || visible === null) {
                visible = MathInteractives.Common.Components.Theme2.Models.CheckBox.DEFAULTS.VISIBLE;
            }
            this.model.set('visible', visible);
        },

        /**
        * Gets the checkbox visible state
        * @method isVisible
        * @return {Boolean} True if the checkbox is visible or false if it is hidden
        * @public
        **/
        isVisible: function isVisible() {
            return this.model.get('visible');
        },

        /**
        * Bind events for checkbox elements
        * @method _attachEvents
        * @private
        **/
        _attachEvents: function _attachEvents() {
            var self = this,
                $checkBoxElements = this.$('.check-box-elements'),
                model = this.model;
            //if ($.support.touch) {
                //this.$('.check-box-elements').off('touchstart').on('touchstart', $.proxy(this._checkBoxHover, this));
                //this.$('.check-box-elements').off('touchend').on('touchend', $.proxy(this._checkBoxHoverEnd, this));
            //}
            //else {
            $checkBoxElements.off('mouseenter').on('mouseenter', $.proxy(this._checkBoxHover, this));
            $checkBoxElements.off('mouseleave').on('mouseleave', $.proxy(this._checkBoxHoverEnd, this));
            //}
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch($checkBoxElements);

            model.on('change:label', $.proxy(this._triggerLabelChange, this));
            model.on('change:checked', $.proxy(this._triggerCheckChange, this));
            model.on('change:enabled', $.proxy(this._triggerEnableChange, this));
            model.on('change:visible', $.proxy(this._triggerVisibleChange, this));
            model.on('change:value', $.proxy(this._triggerValueChange, this));
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
                checkBoxView = new MathInteractives.Common.Components.Theme2.Views.CheckBox({ el: containerId, model: checkBoxModel });
            }
            return checkBoxView;
        }
    });
    MathInteractives.global.Theme2.CheckBox = MathInteractives.Common.Components.Theme2.Views.CheckBox;
})(window.MathInteractives);
