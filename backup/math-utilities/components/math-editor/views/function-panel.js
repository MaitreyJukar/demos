/* globals _, $, window  */

(function(MathUtilities) {
    'use strict';
    var TouchAndTypeNamespace = null;

    /**
     * A customized Backbone.View that holds the logic behind the presentation of Keyboard-functions.
     * @class FunctionPanelView
     * @constructor
     * @namespace Components.MathEditor.Keyboard.Views
     * @module MathEditor
     * @submodule Keyboard
     * @extends Backbone.View
     */
    MathUtilities.Components.MathEditor.Keyboard.Views.FunctionPanel = Backbone.View.extend({

        /**
         * @property _keyMatrixSet
         * @type Object
         * @default null
         */
        "_keyMatrixSet": null,

        /**
         * Instantiates KeyMatrixModel model and KeyMatrixView view.
         * @method initialize
         */
        "initialize": function() {

            var model = this.model,
                self = this,
                keyMatrixSet = this._keyMatrixSet = [],
                jsonData = model.get('jsonData'),
                matrixCount = model.get('matrixCount'),
                keyMatrixModel = null,
                newKeyMatrix = null,
                cnt,
                $el = null;

            TouchAndTypeNamespace = MathUtilities.Components.Utils.TouchSimulator;

            $el = this.$el.html(MathUtilities.Components.MathEditor.templates.header().trim());
            $('.function-panel .tabHeader').each(function() {
                //Here, this pointing to tabheader elements and self pointing to FunctionPanel Class
                $(this).on('mouseup', self.changeTab);

                $(this).hover(function(event) {
                    if (!$(this).hasClass('tabHeader-Selected')) {
                        $(this).addClass('key-Hover function-Hover');
                    }
                }, function(event) {
                    $(this).removeClass('key-Hover function-Hover');
                });

                $(this).on('mousedown', function(event) {
                    $(this).removeClass('key-Hover function-Hover')
                        .addClass('key-Active function-Active');
                });
                $(this).on('mouseup mouseleave', function(event) {
                    $(this).removeClass('key-Active function-Active key-Hover function-Hover');
                });

                $(this).on('contextmenu', function(event) {
                    event.preventDefault();
                    $(this).trigger('mouseup');

                });

                TouchAndTypeNamespace.enableTouch($(this), {
                    "specificEvents": TouchAndTypeNamespace.SPECIFIC_EVENTS.UP_DOWN
                });

            });

            for (cnt = 0; cnt < matrixCount; cnt++) {

                keyMatrixModel = new MathUtilities.Components.MathEditor.Keyboard.Models.KeyMatrix();

                $el.append(MathUtilities.Components.MathEditor.templates.functionPanel({
                    "_boxId": cnt + 1
                }).trim());

                keyMatrixModel.parseData(jsonData['box' + (cnt + 1)]);
                newKeyMatrix = new MathUtilities.Components.MathEditor.Keyboard.Views.KeyMatrix({
                    "model": keyMatrixModel,
                    "el": this.$('.box' + [cnt + 1])
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
        "onClick": function() {
            // arguments[0]: keyCode, arguments[1]: ignoreText, arguments[2]: enterClicked, arguments[3]:id
            this.trigger('click', arguments[0], arguments[1], arguments[2], arguments[3]);
        },

        /**
         * Inserts html of function panel changes into DOM and binds event for the key set.
         * @method render
         * @chainable
         * @return {Object}
         */
        "render": function() {
            var looper = 0;

            for (; looper < this._keyMatrixSet.length; looper++) {
                this._keyMatrixSet[looper].on('click', _.bind(this.onClick, this))
                    .on('moreClick', _.bind(this.onMoreClick, this));
            }
            this.$el.addClass('panel hidePanel');
            $('.function-panel .box2, .function-panel .keyMatrix').hide();
            $('.function-panel .box1').show();
            $('.tabHeader').first().addClass('tabHeader-Selected');
            $('.function-panel .key').removeClass('keyDecor').addClass('functionkeys');
            return this;
        },

        /**
         * Handles the function to be called, on function - tab change.
         * @method changeTab
         * @private
         */
        "changeTab": function(event) {
            if (event.which === 2 || event.which === 3) { // 2 and 3 detects scroll button click and right mouse button click resp.
                return;
            }
            var $target, currDiv,
                keyCode,
                FunctionPanel = MathUtilities.Components.MathEditor.Keyboard.Views.FunctionPanel;

            $target = event.type === 'keyup' ? $(event.currentTarget.parentElement) : $(event.currentTarget);
            if ($target.attr('data-mousedown')) {
                $target.attr('data-mousedown', false);
                currDiv = event.delegateTarget;
                keyCode = $(currDiv).attr('data-keycode');
                if ($(currDiv).hasClass('tabHeader-Selected')) {
                    return;
                }
                $('.functionHeader').removeClass('tabHeader-Selected');
                $('.function-panel .tabHeader').each(function() {
                    $(this).on('touchstart', function() {
                        $(this).addClass('key-Hover function-Hover');
                    });

                    $(this).on('touchend', function() {
                        $(this).removeClass('key-Hover function-Hover');
                    });

                    $(this).on('touchcancel', function() {
                        $(this).removeClass('key-Hover function-Hover');
                    });
                });

                $(currDiv).off('touchstart')
                    .off('touchend')
                    .addClass('tabHeader-Selected');

                switch (keyCode) {
                    case 'common':
                        FunctionPanel.curSubPanelIndex = 1;
                        FunctionPanel.showCommonFunctionKeys();
                        break;

                    case 'trig':
                        FunctionPanel.curSubPanelIndex = 2;
                        FunctionPanel.showTrigFunctionKeys();
                        break;

                    case 'others':
                        FunctionPanel.curSubPanelIndex = 3;
                        FunctionPanel.showOthersFunctionKeys();
                        break;

                    case 'atoz':
                        FunctionPanel.curSubPanelIndex = 4;
                        FunctionPanel.showAtozFunctionKeys();
                        break;

                    case 'numbers':
                        FunctionPanel.curSubPanelIndex = 0;
                        FunctionPanel.showNumberKeys();
                        break;
                }
            }
        },

        "onMoreClick": function() {
            this.trigger('moreClick', arguments[0]);
        }
    }, {

        //index in this array: [number, commoon, trig, other, AtoZ]
        "curSubPanelIndex": 1,

        /**
         * Shows common tab in keyboard-functions.
         * @method showCommonFunctionKeys
         * @static
         */
        "showCommonFunctionKeys": function() {
            if ($('.function-panel .box2').css('display') === "none") {
                $('.function-panel .box1').show();
                $('.function-panel .box2').hide();
            }
            $('.function-panel .box3, .function-panel .box4, .function-panel .box5').hide();
            MathUtilities.Components.MathEditor.Keyboard.Views.FunctionPanel.hideNumberKeys();
        },

        /**
         * Hides numbers tab in keyboard-functions.
         * @method hideNumberKeys
         * @static
         */
        "hideNumberKeys": function() {
            if (!($("#keyboardHolder").hasClass("extra-large") || $("#keyboardHolder").hasClass("large"))) {
                $(".number-panel").hide();
            }
        },

        /**
         * Shows trig tab in keyboard-functions.
         * @method showTrigFunctionKeys
         * @static
         */
        "showTrigFunctionKeys": function() {
            $('.function-panel .box1, .function-panel .box2, .function-panel .box4, .function-panel .box5').hide();
            $('.function-panel .box3').show();
            MathUtilities.Components.MathEditor.Keyboard.Views.FunctionPanel.hideNumberKeys();
        },

        /**
         * Shows others tab in keyboard-functions.
         * @method showOthersFunctionKeys
         * @static
         */
        "showOthersFunctionKeys": function() {
            $('.function-panel .box1, .function-panel .box2, .function-panel .box3, .function-panel .box5').hide();
            $('.function-panel .box4').show();
            MathUtilities.Components.MathEditor.Keyboard.Views.FunctionPanel.hideNumberKeys();
        },

        /**
         * Shows atoz tab in keyboard-functions.
         * @method showAtozFunctionKeys
         * @static
         */
        "showAtozFunctionKeys": function() {
            $('.function-panel .box1, .function-panel .box2, .function-panel .box3, .function-panel .box4').hide();
            $('.function-panel .box5').show();
            MathUtilities.Components.MathEditor.Keyboard.Views.FunctionPanel.hideNumberKeys();
        },

        /**
         * Shows numbers tab in keyboard-functions.
         * @method showNumberKeys
         * @static
         */
        "showNumberKeys": function() {
            $('.function-panel .box1, .function-panel .box2, .function-panel .box3, .function-panel .box4, .function-panel .box5').hide();
            $('.number-panel').show();
        }
    });
}(window.MathUtilities));
