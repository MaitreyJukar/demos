
(function () {
    'use strict';

    if (MathInteractives.Common.Components.Theme2.Views.ToggleButton) {
        return;
    }

    /**
    * View for rendering ToggleButton and its related events
    *
    * @class ToggleButton
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Theme2.Views
    **/
    MathInteractives.Common.Components.Theme2.Views.ToggleButton = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Holds the interactivity player reference
        *
        * @property player
        * @type Object
        * @default null
        */
        player: null,

        /**
        * Holds the interactivity id prefix
        *
        * @property idPrefix
        * @type String
        * @default null
        */
        idPrefix: null,
        /**
        * Holds the interactivity baseClass
        *
        * @property baseclass
        * @type String
        * @default null
        */
        baseClass: null,
        /**
        * Holds the interactivity manager reference
        *
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,

        /**
        * ToggleButton tooltip Backbone.js view
        *
        * @property btnTooltipView
        * @type Object
        * @default null
        */
        btnTooltipView: null,

        /**
        * Holds the model of path for preloading files
        *
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,
        /**
        * Holds the text of ToggleButton
        *
        * @property text
        * @type Object
        * @default null
        */
        text: null,

        /**
        * Specifies type of button to be generated
        *
        * @property _btnType
        * @type Object
        * @default null
        */
        _btnType: null,

        /**
        * Stores margin of ToggleButton
        *
        * @property margin
        * @type Number
        * @default null
        */
        margin: null,

        /**
        * Stores width of ToggleButton
        *
        * @property width
        * @type Number
        * @default null
        */
        width: null,
        /**
        * Stores handleWidth of ToggleButton
        *
        * @property handleWidth
        * @type Number
        * @default null
        */
        handleWidth: null,

        /**
        * Stores custom event name of ToggleButton
        *
        * @property customEvent
        * @type string
        * @default changeState
        */
        customEvent: "changeState",

        /**
        * Get data from model & set in view, Calls render and _attachEvents
        *
        * @namespace MathInteractives.Common.Components.Views
        * @class ToggleButton
        * @constructor
        */
        initialize: function initialize() {
            var onText, offText, handleWidth;
            this.player = this.model.get('player');
            this.baseClass = this.model.get('baseClass');
            this.idPrefix = this.model.get('idPrefix');
            this.manager = this.model.get('manager');
            this.filePath = this.model.get('path');
            this.margin = this.model.get('margin');
            this.width = this.model.get('width');
            handleWidth = this.model.get('handleWidth');
            if (handleWidth < this.width) {
                this.handleWidth = handleWidth;
            }
            else {
                this.handleWidth = this.Width;
            }
            this.render();
            this._attachEvents();

        },

        /**
        * Renders button text
        *
        * @method render
        * @public
        **/
        render: function render() {
            this._generateButton();
        },

        /*
        * Generating a Toggle Button
        *
        * @method _generateButton
        * @private
        */
        _generateButton: function () {
            var $firstChild,
                $midChild,
                $thirdChild, $containmentParent,
                model = this.model,
                height = model.get('height'),
                handleHeight = model.get('handleHeight'),
                marginCal,
                onText = null,
                text = null,
                offText = null,
                hoverClass = model.get('hoverClass'),
                _btnType = model.get('type'),
                cssCustomClass = model.get('cssCustomClass'),
                toggleImagePath = model.get('toggleImagePath'),
                handleImagePath = model.get('handleImagePath'),
                toggleBackground = model.get('toggleBackground'),
                handleBackground = model.get('handleBackground'),
                toggleBoxShadowColor = model.get('toggleBoxShadowColor'),
                tabIndex = model.get('tabIndex'),
                $el = this.$el,
                width = this.width,
                handleWidth = this.handleWidth,
                margin = this.margin,
                template = MathInteractives.Common.Components.templates.theme2ToggleSlider({ idPrefix: this.$el.attr('id') }).trim();

            if ((model.get('text') === null) || (model.get('text') === undefined)) {
                onText = this.manager.getMessage('toggle-button-txt', 0);
                offText = this.manager.getMessage('toggle-button-txt', 1);
            }
            else {
                text = model.get('text');
                onText = text[0];
                offText = text[1];
            }

            this.text = [onText, offText];
            this.model.set('text', this.text);

            if (handleHeight < height) {
                handleHeight = handleHeight;
            }
            else {
                handleHeight = height;
            }




            marginCal = (height - handleHeight) / 2; //marginCal is used for giving the margin top to the handle of toggle button



            $el.append(template);

            this.$('.on-text').text(onText);
            this.$('.off-text').text(offText);


            if (_btnType === MathInteractives.Common.Components.Theme2.Views.ToggleButton.TYPE.CUSTOM) {
                $el.addClass('toggle-button-general-container')
                    .addClass(cssCustomClass);
                if (toggleBackground === null) {

                    $el.css({
                        background: 'url(' + toggleImagePath + ')'
                    });

                }
                else {
                    $el.css({
                        background: toggleBackground
                    });

                }
                if (handleBackground === null) {

                    $el.find('.handle').css({
                        background: 'url(' + handleImagePath + ')'
                    });
                }
                else {
                    $el.find('.handle').addClass(handleBackground);
                }

                $el.css({
                    width: width + 'px',
                    height: height + 'px',
                    cursor: 'pointer',
                    'box-shadow': 'inset 2px 3px' + toggleBoxShadowColor
                });
                //we have to minuse the margin of both sides that why we multiply the margin * 2
                $el.find('.toggle-button-containment').css({
                    'margin-left': margin + 'px',
                    'margin-right': margin + 'px',
                    width: width - margin * 2 + 'px',
                    height: height + 'px'
                });

                //we have to minuse the margin of both sides that why we multiply the margin * 2
                $el.find('.on-text').css({
                    width: ((width - handleWidth) - margin * 2) + 'px',
                    height: height + 'px',
                    'line-height': (height + margin) + 'px'
                });
                //we have to minuse the margin of both sides that why we multiply the margin * 2
                $el.find('.off-text').css({
                    width: ((width - handleWidth) - margin * 2) + 'px',
                    height: height + 'px',
                    'line-height': (height + margin) + 'px'
                });

                $el.find('.handle').css({
                    width: handleWidth + 'px',
                    height: handleHeight + 'px',
                    'margin-top': marginCal + 'px'
                });

            }
            else {
                $el.addClass('toggle-button-' + _btnType.category + '-container');
                if (toggleImagePath !== null) {
                    $el.css({
                        background: 'url(' + toggleImagePath + ')'
                    });
                }
                else if (toggleBackground !== null) {
                    $el.css({
                        background: toggleBackground
                    });

                }
                if (handleImagePath !== null) {

                    $el.find('.handle').css({
                        background: 'url(' + handleImagePath + ')'
                    });
                }
                else if (handleBackground !== null) {
                    $el.find('.handle').css({
                        background: handleBackground
                    });
                }

            }
            $el.find('.off-text').hide();
            var containerId = this.$el.attr('id'),
                object = {
                    "elementId": containerId + '-toggle-button-containment',
                    "tabIndex": tabIndex,
                    "acc": ''
                };

            this.manager.createAccDiv(object);

        },

        /**
        * Attaches mouse and drag and touch events to Toggle Button
        *
        * @method _attachEvents
        * @private
        **/
        _attachEvents: function _attachEvents() {
            var $el = this.$el, that = this, btnState, padding = 10, //padding is constant value for restrict the handle for dropping till the specific position
            text1Width = this.player.getTextHeightWidth(that.text[0]),
            text2Width = this.player.getTextHeightWidth(that.text[1]),
            width = this.width,
            handleWidth = this.handleWidth,
            margin = this.margin,
            ViewClass = MathInteractives.Common.Components.Theme2.Views.ToggleButton,
            isDraggable = this.model.get('isDraggable');

            $el.off('click.togglebtn').on('click.togglebtn', $.proxy(this._clicked, this));

            if (isDraggable === true) {
                MathInteractives.Common.Utilities.Models.Utils.EnableTouch(this.$('.handle'));
                $el.find('.handle').draggable({
                    start: function (event, ui) {
                        that._dragStart();

                    },
                    drag: function (event, ui) {

                        if (ui.position.left + (handleWidth / 2) <= (width / 2)) {
                            that._dropHandle('.on-text', '.off-text', ViewClass.TOGGLEBUTTON_STATE_OFF);
                        }

                        else if (ui.position.left + (handleWidth / 2) >= (width / 2)) {
                            that._dropHandle('.off-text', '.on-text', ViewClass.TOGGLEBUTTON_STATE_ON);
                        }
                        //that._draggedHandleStart(); // TODO: verify if this method call is actually not required.
                    },
                    stop: function (event, ui) {
                        that._dragStop();
                        btnState = that.getButtonState();
                        if (btnState === ViewClass.TOGGLEBUTTON_STATE_ON) {
                            that._dropHandle('.off-text', '.on-text', ViewClass.TOGGLEBUTTON_STATE_ON);
                            $el.find('.handle').css(
                            "left", ((width - handleWidth) - margin * 2) + "px"
                            );
                            that.trigger(ViewClass.ACTION_COMPLETE_EVENT, btnState);
                        }
                        else if (btnState === ViewClass.TOGGLEBUTTON_STATE_OFF) {
                            that._dropHandle('.on-text', '.off-text', ViewClass.TOGGLEBUTTON_STATE_OFF);
                            $el.find('.handle').css(
                            "left", "0px"
                            );
                            that.trigger(ViewClass.ACTION_COMPLETE_EVENT, btnState);
                        }

                    },
                    containment: $el.find('.toggle-button-containment'),
                    axis: 'x',
                    scroll: false

                });
            }
            $el.find('.handle').off('mouseover.togglebtn').on('mouseover.togglebtn', $.proxy(this._mouseEnterHandle, this));
            $el.find('.handle').off('mouseout.togglebtn').on('mouseout.togglebtn', $.proxy(this._mouseLeaveHandle, this));
        },
        /**
        * it set hover to the handle by using adding class
        * Its call when mouse enter on the handle
        *
        * @method _mouseEnterHandle
        * @private
        **/

        _mouseEnterHandle: function () {
            var hoverClass = this.model.get('hoverClass'),
            $el = this.$el;

            $el.find('.handle').addClass(hoverClass);
        },
        /**
        * it remove hover to the handle by using removing the class
        * Its call when mouse enter on the handle
        *
        * @method _mouseLeaveHandle
        * @private
        **/

        _mouseLeaveHandle: function () {
            var hoverClass = this.model.get('hoverClass'),
            $el = this.$el;
            $el.find('.handle').removeClass(hoverClass);
        },

        /**
        * it set off the click event of Toggle Button
        * Its call when draggable start function is called
        *
        * @method _dragStart
        * @private
        **/

        _dragStart: function () {
            this.$el.off('click.togglebtn');
        },

        /**
        * it set on the click event of Toggle Button
        * Its call when draggable stop function is called.
        *
        * @method _dragStop
        * @private
        **/

        _dragStop: function () {
            this.$el.off('click.togglebtn').on('click.togglebtn', $.proxy(this._clicked, this));
        },


        /**
        * Sets the droppable container as per the state of Toggle Button
        * Its call when dragging is start
        *
        * @method _draggedHandleStart
        * @private
        * @param [event] {Object} drag event object
        **/
        _draggedHandleStart: function (event) {
            var btnState = this.getButtonState(), that = this, state = MathInteractives.Common.Components.Theme2.Views.ToggleButton, $el = this.$el;
            if ((btnState === state.TOGGLEBUTTON_STATE_DISABLED)) {
                $el.css('cursor', 'default');
                return;
            }
            else if (btnState === state.TOGGLEBUTTON_STATE_ON) {

                $el.find('.on-text').droppable({
                    accept: '.handle',
                    drop: function (event, ui) {
                        that._dropHandle('.off-text', '.on-text', state.TOGGLEBUTTON_STATE_ON);
                    }
                });
            }
            else if (btnState === state.TOGGLEBUTTON_STATE_OFF) {
                $el.find('.off-text').droppable({
                    accept: '.handle',
                    drop: function (event, ui) {
                        that._dropHandle('.on-text', '.off-text', state.TOGGLEBUTTON_STATE_OFF);
                    }
                });
            }
        },

        /**
        * Its hide the div and show the another div according to state of button
        * Its call when handle drop on the container
        *
        * @method _dropHandle
        * @private
        * @param hideClass {String} class to be hide
        * @param showClass {String} class to be show
        * @param state {String} toggle button's state
        **/
        _dropHandle: function (hideClass, showClass, state) {
            var $el = this.$el;
            $el.find(hideClass).hide();
            $el.find(showClass).show();
            this.setButtonState(state, true);
        },

        /**
        * animate the handler based on the Toggle Button state
        * Its call when clicked is fired on the Toggle Button
        *
        * @method _clicked
        * @private
        * @param event {Object} jquery click event object
        * @param [time] {Number} time within which animation will complete
        **/
        _clicked: function (event, time) {
            var btnState = this.getButtonState(), that = this, move = this.width - this.handleWidth - (this.margin * 2), $el = this.$el,
                prevState = this.model.get('prevState'),
            ViewClass = MathInteractives.Common.Components.Theme2.Views.ToggleButton;
            if (typeof (time) === 'undefined' || time === null) {
                time = 200;
            }
            if ((btnState === ViewClass.TOGGLEBUTTON_STATE_DISABLED)) {
                that._enableDraggable('disable');
                $el.off('click.togglebtn');
                $el.find('.handle').off('mouseover.togglebtn');
                $el.find('.handle').off('mouseout.togglebtn');
                $el.css({ 'cursor': 'default' });
            }
            else if ((btnState === ViewClass.TOGGLEBUTTON_STATE_ENABLED)) {
                $el.css({ 'cursor': 'pointer' });
                this._enableDraggable('enable');
                $el.find('.handle').on('mouseover.togglebtn', $.proxy(this._mouseEnterHandle, this));
                $el.find('.handle').on('mouseout.togglebtn', $.proxy(this._mouseLeaveHandle, this));
                this.setButtonState(prevState, true);
            }
            else if (btnState === ViewClass.TOGGLEBUTTON_STATE_ON) {
                $el.off('click.togglebtn');
                that._enableDraggable('disable');
                $el.find('.on-text').hide();
                $el.find('.handle').css("left", move + "px");
                var hoverClass = this.model.get('hoverClass'),
                    $el = this.$el;
                $el.find('.handle').removeClass(hoverClass);
                $el.find('.handle').animate({
                    "left": "0px"
                }, time).promise().done(function () {
                    $el.find('.off-text').show();
                    that.setButtonState(ViewClass.TOGGLEBUTTON_STATE_OFF, true);
                    that._enableDraggable('enable');
                    $el.on('click.togglebtn', $.proxy(that._clicked, that));
                    that.trigger(ViewClass.ACTION_COMPLETE_EVENT, ViewClass.TOGGLEBUTTON_STATE_OFF);
                });
            }
            else if (btnState === ViewClass.TOGGLEBUTTON_STATE_OFF) {
                move = move + "px";
                $el.off('click.togglebtn');
                that._enableDraggable('disable');
                $el.find('.off-text').hide();
                var hoverClass = this.model.get('hoverClass'),
                    $el = this.$el;
                $el.find('.handle').removeClass(hoverClass);
                $el.find('.handle').animate({
                    "left": move
                }, time).promise().done(function () {
                    $el.find('.on-text').show();
                    that.setButtonState(ViewClass.TOGGLEBUTTON_STATE_ON, true);
                    that._enableDraggable('enable');
                    $el.on('click.togglebtn', $.proxy(that._clicked, that));
                    that.trigger(ViewClass.ACTION_COMPLETE_EVENT, ViewClass.TOGGLEBUTTON_STATE_ON);
                });
            }
        },
        /**
        * Enable and disable dragging of handle
        *
        * @method enableDraggable
        * @private
        * @param [state] {String} State to be set
        **/
        _enableDraggable: function _enableDraggable(state) {
            var $el = this.$el, isDraggable = this.model.get('isDraggable');
            if (isDraggable === true) {
                $el.find('.handle').draggable(state);
            }
        },

        /**
        * Sets the state of button as 'on', 'off' or 'disabled'
        *
        * @method setButtonState
        * @public
        * @param [state] {String} State to be set
        **/
        setButtonState: function setButtonState(state, isTriggered) {
            var model = this.model,
                prevState = model.get('prevState'),
                btnState = MathInteractives.Common.Components.Theme2.Views.ToggleButton,
                newClass = null,
                currentState = null,
                disabledClass = 'disabled',
                onClass = 'on',
                offClass = 'off',
                $el = this.$el,
                manager = this.manager,
                modelState = this.getButtonState();

            // If model state should not enable and If same state come to change the event, just ignore it
            if (modelState !== btnState.TOGGLEBUTTON_STATE_ENABLED
                && state === prevState) {
                return;
            }

            $el.removeClass(onClass)
                .removeClass(offClass)
                .removeClass(disabledClass);
            switch (state) {
                case btnState.TOGGLEBUTTON_STATE_ON:
                    currentState = btnState.TOGGLEBUTTON_STATE_ON;
                    $el.addClass(onClass);
                    break;
                case btnState.TOGGLEBUTTON_STATE_OFF:
                    currentState = btnState.TOGGLEBUTTON_STATE_OFF;
                    $el.addClass(offClass);
                    break;
                case btnState.TOGGLEBUTTON_STATE_DISABLED:
                    currentState = btnState.TOGGLEBUTTON_STATE_DISABLED;
                    $el.addClass(disabledClass);
                    if (manager) {
                        this.enableTab(this.$('.toggle-button-containment').attr('id').replace(this.idPrefix, ''), false);
                    }
                    break;
                case btnState.TOGGLEBUTTON_STATE_ENABLED:
                    currentState = btnState.TOGGLEBUTTON_STATE_ENABLED;
                    if (manager) {
                        this.enableTab(this.$('.toggle-button-containment').attr('id').replace(this.idPrefix, ''), true);
                    }
                    break;
            }

            this.model.currentState = currentState;
            if (state === btnState.TOGGLEBUTTON_STATE_ON
            || state === btnState.TOGGLEBUTTON_STATE_OFF) {
                this.model.set('prevState', state);
            }
            if (isTriggered === true) {
                this.trigger(this.customEvent, [this.getButtonState()]);
            }
        },

        /**
        * Returns state of the Toggle Button
        *
        * @method getButtonState
        * @public
        * @return {String} currentState of toggle button
        **/
        getButtonState: function getButtonState() {
            return this.model.currentState;
        },


        /**
        * Shows the Toggle Button
        *
        * @method showButtonDiv
        * @public
        **/
        showButtonDiv: function showButton() {
            this.$el.show();
        },

        /**
        * Hides the Toggle Button
        *
        * @method hideButton
        * @public
        **/
        hideButton: function hideButton() {
            this.$el.hide();
        },

        /**
        * Changes text on the button
        *
        * @method changeText
        * @public
        * @param text {Object} array of text to be set to toggle button(on and off text)
        **/
        changeText: function changeText(text) {
            //this.$el.html(text);
            this.$('.on-text').text(text[0]);
            this.$('.off-text').text(text[1]);
            this.text = text;
            this.model.set('text', text);
        },

        /**
        * Changes Toggle button baseclass
        *
        * @method changeBaseClass
        * @public
        * @param className {String} New class name
        **/
        changeBaseClass: function changeBaseClass(className) {
            this.model.set('baseClass', className);
        },

        /**
        * Returns base class of the button
        *
        * @method getBaseClass
        * @public
        * @return {String} currently apply base class to toggle button
        **/
        getBaseClass: function getBaseClass() {
            var baseClass = this.model.get('baseClass');
            return baseClass;
        },
        /**
        * change the state for toggle button
        *
        * @method changeStateOfToggleButton
        * @public
        * @param state {String} state to be change
        **/
        changeStateOfToggleButton: function getBaseClass(state) {
            var $el = this.$el,
            model = this.model,
            prevState = model.get('prevState'),
            btnState = MathInteractives.Common.Components.Theme2.Views.ToggleButton;
            switch (state) {
                case btnState.TOGGLEBUTTON_STATE_ON:
                    this.setButtonState(btnState.TOGGLEBUTTON_STATE_OFF, false);
                    model.set('prevState', btnState.TOGGLEBUTTON_STATE_OFF);
                    break;
                case btnState.TOGGLEBUTTON_STATE_OFF:
                    this.setButtonState(btnState.TOGGLEBUTTON_STATE_ON, false);
                    model.set('prevState', btnState.TOGGLEBUTTON_STATE_ON);
                    break;
                case btnState.TOGGLEBUTTON_STATE_DISABLED:
                    this.setButtonState(btnState.TOGGLEBUTTON_STATE_DISABLED, true);
                    break;
                case btnState.TOGGLEBUTTON_STATE_ENABLED:
                    $el.on('click.togglebtn', $.proxy(this._clicked, this));
                    this.setButtonState(btnState.TOGGLEBUTTON_STATE_ENABLED, true);
                    break;
            }
            this.$el.trigger("click.togglebtn", 0);
            //this.trigger(this.customEvent, [this.getButtonState()]);
        }

    },
     {
         /**
         * On State string
         *
         * @property TOGGLEBUTTON_STATE_ON
         * @type String
         * @static
         **/
         TOGGLEBUTTON_STATE_ON: 'on',

         /**
         * Off State string
         *
         * @property TOGGLEBUTTON_STATE_OFF
         * @type String
         * @static
         **/
         TOGGLEBUTTON_STATE_OFF: 'off',

         /**
         * Disabled State string
         *
         * @property TOGGLEBUTTON_STATE_DISABLED
         * @type String
         * @static
         **/
         TOGGLEBUTTON_STATE_DISABLED: 'disabled',
         /**
        * Enabled State string
        *
        * @property TOGGLEBUTTON_STATE_ENABLED
        * @type String
        * @static
        **/
         TOGGLEBUTTON_STATE_ENABLED: 'enabled',

         /**
         * Event triggered at drag stop of handle and at the end of click animation.
         *
         * @event ACTION_COMPLETE_EVENT
         */
         ACTION_COMPLETE_EVENT: 'action-completed',

         /**
         * Type of button string
         *
         * @property TYPE
         * @type Object
         * @static
         **/
         TYPE: {
             CUSTOM: { id: 'custom', category: 'custom' },
             GENERAL: { id: 'general', category: 'general', class: "toggle-button-general-container" },
             GREEN: { id: 'green', category: 'green', class: "toggle-button-green-container" },
             VIOLET: { id: 'violet', category: 'violet', class: "toggle-button-violet-container" }
         },

         /*
         * to generate ToggleButton as per the given requirement
         *
         * @method generateToggleButton
         * @static
         * @param buttonProps {object} user specified properties to generate toggle button
         * @return {Object} backbone.js object of toggle button view
         */
         generateToggleButton: function (buttonProps) {
             var btnID, buttonModel, buttonView;
             if (buttonProps) {
                 btnID = '#' + buttonProps.id;
                 buttonModel = new MathInteractives.Common.Components.Theme2.Models.ToggleButton(buttonProps);
                 buttonView = new MathInteractives.Common.Components.Theme2.Views.ToggleButton({ el: btnID, model: buttonModel });

                 return buttonView;
             }
         }
     });

    MathInteractives.global.Theme2.ToggleButton = MathInteractives.Common.Components.Theme2.Views.ToggleButton;
})();
