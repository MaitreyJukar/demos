(function () {
    'use strict';
    /**
    * A customized Backbone.View that encapsulates logic behind the presentation of Switch-mode buttons.
    * @module Calculator
    * @class ModeSwitchButtons
    * @constructor
    * @extends Backbone.View
    * @namespace Tools.Calculator.Views
    */

    MathUtilities.Tools.Calculator.Views.ModeSwitchButtons = Backbone.View.extend({

        /**
        * Specifies namespace for all calculator tool models
        * @property modelNameSpace
        * @type Object
        */
        modelNameSpace: MathUtilities.Tools.Calculator.Models,

        /**
        * Called when an object of this class is created. It calls render method.
        * @method initialize
        * @return
        */
        initialize: function () {
            this.render();

            return;
        },

        /**
        * It injects html of switch-mode buttons into DOM and then binds events on these buttons.
        * @method render
        * @chainable
        * @return {Object} Returns the object which called this method.
        */
        render: function () {
            var jsonData, html;

            jsonData = this.model.get("jsonData");

            html = this._buildSwitchModeButtonsHtml(jsonData);

            // inject into dom
            this.$el.html(html);

            // add events
            this.$el.find(".arrow-button").click({ el: this.$el }, this._toggleOperationMode);
            this.$el.find(".scientific-mode").click({ el: this.$el }, this._changeOperationModeToScientific);
            this.$el.find(".standard-mode").click({ el: this.$el }, this._changeOperationModeToStandard);

            return this;
        },

        /**
        * Toggles calculator operating mode between Scientific and Standard.
        * @method _toggleOperationMode
        * @param {Object} Its the event object.
        * @private
        * @return
        */
        _toggleOperationMode: function (event) {
            var $this = $(this),
                el = event.data.el,
                scientific, standard, outputScreen, scientificPanel;

            if ($this.parent().hasClass("hide-arrow-button")) {
                return;
            }

            //toggle state"
            scientific = el.find(".scientific-mode");
            standard = el.find(".standard-mode");
            outputScreen = $('#output-container span.mathquill-editable');
            scientificPanel = $("#scientific-panel");

            if (scientific.hasClass("enable-scientific-mode")) {
                // switch to standard
                scientific.removeClass("enable-scientific-mode").addClass("disable-scientific-mode");
                standard.removeClass("disable-standard-mode").addClass("enable-standard-mode");
                scientificPanel.hide();

                // change output screen size
                outputScreen.removeClass("mathquill-editable-scientific-size").addClass("mathquill-editable-standard-size");
            }
            else {
                // switch to scientific
                standard.removeClass("enable-standard-mode").addClass("disable-standard-mode");
                scientific.removeClass("disable-scientific-mode").addClass("enable-scientific-mode");
                scientificPanel.show();

                // change output screen size
                outputScreen.removeClass("mathquill-editable-standard-size").addClass("mathquill-editable-scientific-size");
            }

            // arrow buttons.
            el.find(".arrow-button-container.hide-arrow-button").removeClass("hide-arrow-button");
            $this.parent().addClass("hide-arrow-button");

            return;
        },

        /**
        * Changes calculator operating mode to Scientific.
        * @method _changeOperationModeToScientific
        * @param {Object} Its the event object.
        * @private
        * @return
        */
        _changeOperationModeToScientific: function (event) {
            var $this = $(this),
                el = event.data.el,
                outputScreen = $('#output-container span.mathquill-editable'),
                scientificPanel = $("#scientific-panel"),
                standard, arrowToHide, arrowToShow;

            if ($this.hasClass("enable-scientific-mode")) {
                return;
            }

            //Switch to scientific
            standard = el.find(".standard-mode");

            // disable standard
            standard.removeClass("enable-standard-mode").addClass("disable-standard-mode");

            // enable scientific
            $this.removeClass("disable-scientific-mode").addClass("enable-scientific-mode");

            // handle arrow buttons
            arrowToHide = el.find(".arrow-button-container").not(".hide-arrow-button");
            arrowToShow = el.find(".arrow-button-container.hide-arrow-button");
            arrowToShow.removeClass("hide-arrow-button");
            arrowToHide.addClass("hide-arrow-button");

            scientificPanel.show();

            // change output screen size
            outputScreen.removeClass("mathquill-editable-standard-size").addClass("mathquill-editable-scientific-size");

            return;
        },

        /**
        * Changes calculator operation mode to Standard.
        * @method _changeOperationModeToStandard
        * @param {Object} Its the event object.
        * @private
        * @return
        */
        _changeOperationModeToStandard: function (event) {
            var $this = $(this),
                el = event.data.el,
                outputScreen = $('#output-container span.mathquill-editable'),
                scientificPanel = $("#scientific-panel"),
                arrowToHide, arrowToShow, scientific;

            if ($this.hasClass("enable-standard-mode")) {
                return;
            }

            //Switch to standard
            scientific = el.find(".scientific-mode");

            // diable scientific
            scientific.removeClass("enable-scientific-mode").addClass("disable-scientific-mode");

            // enable standard
            $this.removeClass("disable-standard-mode").addClass("enable-standard-mode");

            // handle arrow buttons
            arrowToHide = el.find(".arrow-button-container").not(".hide-arrow-button");
            arrowToShow = el.find(".arrow-button-container.hide-arrow-button");
            arrowToShow.removeClass("hide-arrow-button");
            arrowToHide.addClass("hide-arrow-button");

            scientificPanel.hide();

            // change output screen size
            outputScreen.removeClass("mathquill-editable-scientific-size").addClass("mathquill-editable-standard-size");

            return;
        },

        /**
        * Returns html of switch-mode buttons.
        * @method _buildSwitchModeButtonsHtml
        * @private
        * @param {Object} jsonData JSON data for switch-mode buttons.
        * @return {String} Returns html of switch-mode buttons.
        */
        _buildSwitchModeButtonsHtml: function (jsonData) {

            var html, i, buttonContainerClass, buttonClass, buttonData, numberOfButtons;

            numberOfButtons = jsonData.length;
            html = "";

            for (i = 0; i < numberOfButtons; i++) {
                buttonData = jsonData[i];
                buttonContainerClass = buttonData["button-container-class"];
                buttonClass = buttonData["mode-switch-button-class"];

                html = html + Application.getTemplate("mode-switch-button", { "button-container": buttonContainerClass, "mode-switch-button": buttonClass });
            }

            return html;
        }
    });
})();
