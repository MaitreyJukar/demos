(function () {
    'use strict';

    MathUtilities.Components.ToolHolder.Models.BottomToolbarButton = Backbone.Model.extend({
        MENU_ITEM: {
            download: {
                isVisible: true,
                isDisabled: false,
                isPressed: false
            },
            openNew: {
                isVisible: true,
                isDisabled: false,
                isPressed: false
            },
            snapShot: {
                isVisible: true,
                isDisabled: false,
                isPressed: false
            },
            print: {
                isVisible: true,
                isDisabled: false,
                isPressed: false
            }
        },

        initialize: function () {
        },

        _defaultButtonStateProp: {
            isVisible: true,
            isDisabled: false,
            isPressed: false
        },

        _defaultCSS: null,

        setButtonState: function (buttonState) {
            if (buttonState) {
                var keys = Object.keys(buttonState),
                length = keys.length,
                index = 0;

                for (; index < length; index++) {
                    this.MENU_ITEM[keys[index]].isVisible = buttonState.isVisible;
                    this.MENU_ITEM[keys[index]].isDisabled = buttonState.isDisable;
                    this.MENU_ITEM[keys[index]].isPressed = buttonState.isPressed;
                }
            }
        },

        getState: function (buttons) {
            return this.MENU_ITEM;
        }
    });

})(); 