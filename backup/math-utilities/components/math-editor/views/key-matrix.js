/* globals _, $, window  */

(function(MathUtilities) {
    'use strict';
    /**
     * A customized Backbone.View that holds the logic behind the presentation of Keyboard-keys.
     * @class KeyMatrix
     * @constructor
     * @namespace Components.MathEditor.Keyboard.Views
     * @module MathEditor
     * @submodule Keyboard
     * @extends Backbone.View
     */
    MathUtilities.Components.MathEditor.Keyboard.Views.KeyMatrix = Backbone.View.extend({

        /**
         * Gives call to render function
         * @method initialize
         */
        "initialize": function() {
            this.render();
        },

        /**
         * Inserts html of keys into DOM and binds event for the key set.
         * @method render
         * @chainable
         * @return {Object}
         */
        "render": function() {

            var json = this.model.get('jsonData'),
                height,
                width,
                KeyMatrix = MathUtilities.Components.MathEditor.Keyboard.Models.KeyMatrix,
                PADDING = KeyMatrix.PADDING * 2, // padding on both sides
                ORIGINAL_HEIGHT = KeyMatrix.HEIGHT,
                ORIGINAL_WIDTH = KeyMatrix.WIDTH,
                rowCount = Object.keys(json).length,
                keyCount = 0,
                currentKey = null,
                $newButton = null,
                rowNo = 0,
                keyNo,
                A_TO_Z_WIDTH = 33,
                COLSPAN_LENGTH = 3,
                WIDTH_MULTIPLIER = 3;

            for (; rowNo < rowCount; rowNo++) {

                keyCount = Object.keys(json[rowNo]).length;
                height = ORIGINAL_HEIGHT;

                for (keyNo = 0; keyNo < keyCount; keyNo++) {

                    currentKey = json[rowNo][keyNo];
                    if (currentKey === null) {
                        continue;
                    }

                    height = ORIGINAL_HEIGHT;
                    width = ORIGINAL_WIDTH;
                    if (currentKey.class === 'AtoZ') {
                        width = A_TO_Z_WIDTH;
                    }
                    if (currentKey.colspan === COLSPAN_LENGTH) {
                        width = width * WIDTH_MULTIPLIER + PADDING - 1;
                    }

                    KeyMatrix.IDCOUNTER++;

                    this.$el.append(MathUtilities.Components.MathEditor.templates.key({
                        "_keyId": KeyMatrix.IDCOUNTER,
                        "_keyHeight": height,
                        "_keyCode": currentKey.keyCode,
                        "_keyIgnoreText": currentKey.ignore,
                        "_keyText": currentKey.display,
                        "_class": currentKey.class
                    }).trim());


                    $newButton = this.$('#' + KeyMatrix.IDCOUNTER);

                    // keycodes for symbols like arrow, curly braces, round braces
                    if (currentKey.keyCode === '40' && currentKey.ignore !== true ||
                        currentKey.keyCode === '41,37' ||
                        currentKey.keyCode === '125,37' ||
                        currentKey.keyCode === '123') {
                        $newButton.addClass('bracket-align');
                    }
                    $newButton.on('mousedown', _.bind(this.onMouseDown, this))
                        .on('mouseout', _.bind(this.onRollOut, this))
                        .on('mouseup', _.bind(this.onMouseUp, this))
                        .on('touchstart', _.bind(this.onTouchStart, this))
                        .on('touchend', _.bind(this.onTouchEnd, this));

                    if (currentKey.addClass !== void 0) {
                        if (['sup', 'sub', 'inverse', 'newFont square', 'newFont'].indexOf(currentKey.addClass) !== -1) {
                            $newButton.addClass(currentKey.addClass);
                        }
                    }
                    //backspace key
                    if (currentKey.keyCode === '8') {
                        $newButton.addClass('backspace');
                    }
                    $newButton.hover(this.onButtonMouseEnter, this.onButtonMouseOut);

                    if (currentKey.uiClass) {
                        $newButton.addClass(currentKey.uiClass);
                    }
                }
            }
            return this;
        },

        "onButtonMouseEnter": function() {
            var $element = $(this),
                dataClass = $element.attr('data-class');

            $element.addClass(dataClass + '-Hover key-Hover');
        },

        "onButtonMouseOut": function() {
            var $element = $(this),
                dataClass = $element.attr('data-class');

            $element.removeClass(dataClass + '-Hover key-Hover');
        },

        "onRollOut": function(event) {
            clearInterval(this.model.get('interval'));
        },


        /**
         * Action to be performed on virtual keyboard touchstart.
         * @param event{object} jquery touchstart event
         * @method onTouchStart
         * @private
         */
        "onTouchStart": function(event) {
            var $currDiv = $(event.delegateTarget),
                dataClass = $currDiv.attr('data-class'),
                keyCode = $currDiv.attr('data-keycode'),
                ignoreText = $currDiv.attr('data-ignoretext'),
                id = $currDiv.attr('id'),
                TIMER_INTERVAL = 250;

            $currDiv.addClass(dataClass + '-Hover key-Active');
            switch (keyCode) {

                case 'more0':
                    $(document).off("touchmove.keyboard")
                        .on("touchmove.keyboard", _.bind(this.onDocumentTouchUp, $currDiv));
                    break;
                case 'more1':
                    $(document).off("touchmove.keyboard")
                        .on("touchmove.keyboard", _.bind(this.onDocumentTouchUp, $currDiv));
                    break;
                case MathUtilities.Components.MathEditor.EquationEditor.Models.EquationEditor.KEYCODE_ENTER:
                    this.trigger('click', keyCode, ignoreText, true, id);
                    return false;
                default:
                    this.trigger('click', keyCode, ignoreText, false, id);
                    // for backspace
                    if (keyCode === '8') {
                        this.model.set("interval", setInterval(_.bind(function() {
                            this.trigger('click', keyCode, ignoreText, false, id);
                        }, this), TIMER_INTERVAL));
                    }
                    return false;
            }
        },

        "onDocumentTouchUp": function() {
            var $element = $(this),
                dataClass = $element.attr('data-class');

            $element.removeClass(dataClass + '-Active ' + dataClass + '-Hover');
        },

        /**
         * Action to be performed on virtual keyboard touchend.
         * @param event{object} jquery touchend event
         * @method onTouchEnd
         * @private
         */
        "onTouchEnd": function(event) {
            var $currentTarget = $(event.currentTarget),
                dataClass = $currentTarget.attr('data-class'),
                currDiv = event.delegateTarget,
                keyCode = $(currDiv).attr('data-keycode'),
                KeyMatrix = MathUtilities.Components.MathEditor.Keyboard.Views.KeyMatrix;

            clearInterval(this.model.get('interval'));

            $currentTarget.removeClass(dataClass + '-Hover key-Active');

            switch (keyCode) {

                case 'more0':
                    $(document).off("touchend.keyboard")
                        .on("touchend.keyboard", _.bind(this.onDocumentTouchUp, currDiv));
                    KeyMatrix.showNextCommonKeys();
                    this.trigger('moreClick', keyCode);
                    break;
                case 'more1':
                    $(document).off("touchend.keyboard")
                        .on("touchend.keyboard", _.bind(this.onDocumentTouchUp, currDiv));
                    KeyMatrix.showPrevCommonKeys();
                    this.trigger('moreClick', keyCode);
                    break;
            }
        },

        /**
         * Action to be performed on virtual keyboard key mouseUp.
         * @param event{object} jquery mouse up event
         * @method onMouseUp
         * @private
         */
        "onMouseUp": function(event) {
            // ignore scorll or right click
            if (event.which === 2 || event.which === 3) {
                return;
            }
            var $currentTarget = $(event.currentTarget),
                dataClass = $currentTarget.attr('data-class'),
                currDiv = event.delegateTarget,
                keyCode = $(currDiv).attr('data-keycode'),
                KeyMatrix = MathUtilities.Components.MathEditor.Keyboard.Views.KeyMatrix;

            event.preventDefault();
            clearInterval(this.model.get('interval'));
            $currentTarget.removeClass(dataClass + '-Active ' + dataClass + '-Hover key-Active');

            switch (keyCode) {
                case 'more0':
                    $(document).off("mouseup.keyboard")
                        .on("mouseup.keyboard", _.bind(this.onDocumentMouseUp, currDiv));
                    KeyMatrix.showNextCommonKeys();
                    this.trigger('moreClick', keyCode);
                    break;

                case 'more1':
                    $(document).off("mouseup.keyboard")
                        .on("mouseup.keyboard", _.bind(this.onDocumentMouseUp, currDiv));
                    KeyMatrix.showPrevCommonKeys();
                    this.trigger('moreClick', keyCode);
                    break;
            }
        },


        /**
         * Action to be performed on document mouseUp.
         * @method onDocumentMouseUp
         * @private
         */
        "onDocumentMouseUp": function() {
            var $element = $(this),
                dataClass = $element.attr('data-class');

            $element.removeClass(dataClass + '-Active ' + dataClass + '-Hover key-Active');
        },

        /**
         * Action to be performed on virtual keyboard key mouseDown.
         * @param event{object} jquery mouse down event
         * @method onMouseDown
         * @private
         */
        "onMouseDown": function(event) {
            // ignore scorll or right click
            if (event.which === 2 || event.which === 3) {
                return void 0;
            }
            event.preventDefault();
            var $currentTarget = $(event.currentTarget),
                dataClass = $currentTarget.attr('data-class'),
                $currDiv = $(event.delegateTarget),
                keyCode = $currDiv.attr('data-keycode'),
                ignoreText = $currDiv.attr('data-ignoretext'),
                id = $currDiv.attr('id'),
                TIMER_INTERVAL = 250;

            $currentTarget.removeClass(dataClass + '-Hover key-Hover')
                .addClass(dataClass + '-Active key-Active');

            switch (keyCode) {

                case 'more0':
                    $(document).off("mouseup.keyboard")
                        .on("mouseup.keyboard", _.bind(this.onDocumentMouseUp, $currDiv));
                    break;
                case 'more1':
                    $(document).off("mouseup.keyboard")
                        .on("mouseup.keyboard", _.bind(this.onDocumentMouseUp, $currDiv));
                    break;
                case MathUtilities.Components.MathEditor.EquationEditor.Models.EquationEditor.KEYCODE_ENTER:
                    this.trigger('click', keyCode, ignoreText, true, id);
                    return false;
                default:
                    this.trigger('click', keyCode, ignoreText, false, id);
                    // for backspace
                    if (keyCode === '8') {
                        this.model.set("interval", setInterval(_.bind(function() {
                            this.trigger('click', keyCode, ignoreText, false, id);
                        }, this), TIMER_INTERVAL));
                    }
                    return false;
            }
        }
    }, {

        /**
         * Shows number box1 container.
         * @method showNextNumberKeys
         * @static
         */
        "showNextCommonKeys": function() {
            $('.function-panel .box1').hide();
            $('.function-panel .box2').show();
        },

        /**
         * Shows number box2 container.
         * @method showPrevNumberKeys
         * @static
         */
        "showPrevCommonKeys": function() {
            $('.function-panel .box1').show();
            $('.function-panel .box2').hide();
        },

        /**
         * Hide function container.
         * @method showHideFunctionPanel
         * @static
         */
        "showHideFunctionPanel": function() {
            $('.function-panel').toggleClass('hidePanel');
        }
    });
}(window.MathUtilities));
