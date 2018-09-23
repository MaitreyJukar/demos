(function () {
    'use strict';

    MathUtilities.Components.ToolHolder.Views.TopToolbar = MathUtilities.Components.ToolHolder.Views.BaseToolbar.extend({
        model: null,

        el: '#math-tool-top-toolbar-' + MathUtilities.Components.ToolHolder.Views.ToolHolder.TOOLID,

        buttonView: null,

        MENU_ITEMS: {
            "HELP": "help"
        },

        initialize: function () {
            this.model = new MathUtilities.Components.ToolHolder.Models.TopToolbar({ title: this.options.title });
            this.MenuItemView = MathUtilities.Components.ToolHolder.Views.MenuItem;
        },

        initUI: function () {
            this._generateMenuItems();
            this._bindEvents();
        },

        _generateMenuItems: function () {
            this.menuItems = {};
            this.menuItems["help"] = new this.MenuItemView({ el: '#math-tool-btn-help-' + MathUtilities.Components.ToolHolder.Views.ToolHolder.TOOLID });

            return this.menuItems;
        },



        setButtonState: function (buttonState) {
            var curKey = null;
            if (buttonState) {
                for (curKey in buttonState) {
                    this.menuItems[curKey].setData(buttonState[curKey]);
                }
            }
        },

        getButtonState: function (buttons) {
            return this.menuItems;
        },

        addEvents: function () {
            this._bindEvents();
        },
        getToolbarTemplate: function () {
            return this.model.getHTML();
        },

        /**
        * Binds events on tool holder.
        * @method _bindEvents
        * @private
        */
        _bindEvents: function () {
            $('.top-toolbar-btn').on('click', $.proxy(this._onToolItemClicked, this));
        },

        /**
        * Triggers a topButtonClicked event for every button clicked at the top toolbar.
        * @method _onButtonClickedHandler
        */
        _onToolItemClicked: function (eventObject) {
            var allowBubble = this._handleClick(eventObject);

            if (allowBubble) {
                this.trigger('topToolbarItemClicked', eventObject);
            }
        },

        _handleClick: function (eventObject) {
            var targetEl = eventObject.delegateTarget,
                curItem = this.getMenuItem(targetEl);
            
            if (curItem && !curItem.model.isDisabled) {
                return true;
            }

            return false;
        },

        getMenuItem: function (targetEl) {
            var key = null, curItem;
            for (key in this.menuItems) {
                curItem = this.menuItems[key];
                if (curItem && curItem.el === targetEl) {
                    return curItem;
                }
            }

            return null;
        },

        setState: function (toolbarState) {
            this.model.setVisiblity(toolbarState.isVisible);
            this.model.setTitle(toolbarState.title);
            this.model.setToolIcon(toolbarState.toolIcon);
            this.model.setToolId(toolbarState.toolId);
            this.setButtonState(toolbarState.buttonProperty);
            this._setToolbarStates();
        },

        _setToolbarStates: function () {
            var $element = $('#math-tool-top-toolbar-' + MathUtilities.Components.ToolHolder.Views.ToolHolder.TOOLID);

            $element.addClass('modal-tool-' + this.model.getToolId() + '-title').addClass('modal-drag');

            $('#tool-holder-' + MathUtilities.Components.ToolHolder.Views.ToolHolder.TOOLID + ' .tool-icon').addClass(this.model.getToolIcon());
            $('#tool-holder-' + MathUtilities.Components.ToolHolder.Views.ToolHolder.TOOLID + ' .tool-text').html(this.model.getTitle());

            if (this.getState().isVisible === false) {
                $element.hide();
            }
            else {
                $element.show();
            }
        },

        getState: function () {
            return {
                isVisible: this.model.getVisiblity(),
                title: this.model.getTitle(),
                toolIcon: this.model.getToolIcon(),
                buttonProperty: this.getButtonState(),
                toolId: this.model.getToolId()
            };
        }
    });

})();