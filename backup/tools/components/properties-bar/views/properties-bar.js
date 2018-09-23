/* globals $, window */

(function(MathUtilities) {
    'use strict';

    /* Initialize MathUtilities Data */
    MathUtilities.Components.PropertiesBar = {};

    /**
     * Packages all the views used in the LimitTextBox module.
     * @module Views
     * @namespace MathUtilites.Components.LimitTextBox
     **/
    MathUtilities.Components.PropertiesBar.Views = {};


    MathUtilities.Components.PropertiesBar.Views.MenuBar = Backbone.View.extend({

        "_$menuContainer": null,

        "initialize": function initialize() {
            var $menuContainer = $('<div></div>').attr('id', 'math-utilities-properties-menu-container'),
                $expandCollapse = $('<div></div>').attr('id', 'math-utilities-properties-collapse-button');
            this._$menuContainer = $menuContainer;
            this.$el.addClass('math-utilities-properties-tool-bar').append($expandCollapse).append($menuContainer);
        },

        "_collapseButtonActive": function _collapseButtonActive(event) {
            $(event.target).addClass('math-utilities-properties-collapse-button-active');
        },

        "_collapseButtonNormal": function _collapseButtonNormal(event) {
            $(event.currentTarget).removeClass('math-utilities-properties-collapse-button-active math-utilities-properties-collapse-button-hover');
        },

        "_collapseButtonHover": function _collapseButtonHover(event) {
            $(event.target).addClass('math-utilities-properties-collapse-button-hover');

        },

        "events": {
            'click #math-utilities-properties-collapse-button': 'hide',
            'mousedown #math-utilities-properties-collapse-button': '_collapseButtonActive',
            'mouseenter #math-utilities-properties-collapse-button': '_collapseButtonHover',
            'mouseup #math-utilities-properties-collapse-button': '_collapseButtonNormal',
            'mouseleave #math-utilities-properties-collapse-button': '_collapseButtonNormal'
        },

        "isVisible": function isVisible() {
            return this.$el.is(':visible');
        },

        "hide": function hide(options) {
            this.$el.hide();
            if (typeof options !== 'undefined' && options.supressEvent !== true) {
                this.trigger('properties-bar-hidden');
            }
        },

        "show": function show(menuItems, templateScope, curShape) {
            var menuCounter,
                menuLength = null,
                currentMenu,
                templateString = '';
            if (typeof menuItems !== 'undefined') {
                menuLength = menuItems.length;
                for (menuCounter = 0; menuCounter < menuLength; menuCounter++) {
                    currentMenu = menuItems[menuCounter];
                    templateString += templateScope[currentMenu]().trim();
                }
                this._$menuContainer.html('').html(templateString);
                this.trigger('properties-bar-shown', curShape);
            }
            this.$el.show();
        }

    }, {});
}(window.MathUtilities));
