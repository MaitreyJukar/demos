
(function () {
    if (MathInteractives.Common.Player.Views.ActivityArea) {
        return;
    }
    'use strict';
    /**
    * A customized Backbone.View that holds the logic behind the presentation of Activity Area.
    * @class ActivityAreaView
    * @constructor
    * @namespace MathInteractives.Common.Player.Views
    * @module Common
    * @submodule Player
    * @extends Backbone.View
    */


    MathInteractives.Common.Player.Views.ActivityArea = Backbone.View.extend({
        /**
        * Holds the model of path for preloading files
        *
        * @property _path
        * @type Object
        * @default null
        */
        _path: null,

        /**
        * Initialization
        * @method initialize
        */
        initialize: function () {
            this._path = this.model.get('path');
            Backbone.listenTo(this.model, 'change:show', $.proxy(this._showActivityArea, this));
            this.render();
        },

        /**
        * Inserts css changes into DOM.
        * @method render
        * @chainable
        * @return {Object}
        */
        render: function () {

            var templateName = this.model.get('templateName'),
            moduleName = this.model.get('moduleName'),
            uiClass = this.model.get('uiClass');
            this.$el.addClass('activity-area ' + uiClass)
            .attr({ 'id': this.model.get('id') });

            var showShadow = this.model.get('shadow');
            if (typeof showShadow !== 'undefined' && showShadow === true) {
                var topLeft = $('<div>', {
                    'class': 'top-left-shadow-image'
                }).css({
                    'background-image': 'url("' + this._path.getImagePath('corner-shadows') + '")',
                    'background-position': '0px -42px'
                }),
                topMiddle = $('<div>', {
                    'class': 'top-middle-shadow-image'
                }).css({
                    'background-image': 'url("' + this._path.getImagePath('top-shadow') + '")'
                }),
                topRight = $('<div>', {
                    'class': 'top-right-shadow-image'
                }).css({
                    'background-image': 'url("' + this._path.getImagePath('corner-shadows') + '")',
                    'background-position': '0px -63px'
                }),
                middleLeft = $('<div>', {
                    'class': 'middle-left-shadow-image'
                }).css({
                    'background-image': 'url("' + this._path.getImagePath('left-shadow') + '")'
                }),
                middleRight = $('<div>', {
                    'class': 'middle-right-shadow-image'
                }).css({
                    'background-image': 'url("' + this._path.getImagePath('right-shadow') + '")'
                }),
                bottomLeft = $('<div>', {
                    'class': 'bottom-left-shadow-image'
                }).css({
                    'background-image': 'url("' + this._path.getImagePath('corner-shadows') + '")',
                    'background-position': '0px 0px'
                }),
                bottomRight = $('<div>', {
                    'class': 'bottom-right-shadow-image'
                }).css({
                    'background-image': 'url("' + this._path.getImagePath('corner-shadows') + '")',
                    'background-position': '0px -21px'
                }),
                bottomMiddle = $('<div>', {
                    'class': 'bottom-middle-shadow-image'
                }).css({
                    'background-image': 'url("' + this._path.getImagePath('bottom-shadow') + '")'
                });

                this.$el.append(topLeft, topMiddle, topRight, middleLeft, middleRight, bottomLeft, bottomMiddle, bottomRight);
            }
            return this;
        },

        /* Show the activity area if model property is set to true
        * @method _showActivityArea
        */
        _showActivityArea: function () {
            var showActivityArea = this.model.get('show');
            if (showActivityArea === true) {
                this.$el.show();
                this.$el.removeAttr('data-html2canvas-ignore');
            }
            else {
                this.$el.hide();
                this.$el.attr('data-html2canvas-ignore', 'true');
            }
        }


    }, {


    });

})();