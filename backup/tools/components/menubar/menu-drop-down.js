/* globals $, window */

(function(MathUtilities) {
    'use strict';

    MathUtilities.Components.MenuBar.dropDown = MathUtilities.Components.MenuBar.dropDown || {};
    MathUtilities.Components.MenuBar.dropDown.Model = MathUtilities.Components.MenuBar.dropDown.Model || {};
    MathUtilities.Components.MenuBar.dropDown.View = MathUtilities.Components.MenuBar.dropDown.View || {};
    MathUtilities.Components.MenuBar.dropDown.Model = Backbone.Model.extend({
        "defaults": {
            "menuList": null,
            "menuListData": []
        },
        "setData": function setData(menuList, menuListData) {
            this.set('menuList', menuList);
            this.set('menuListData', menuListData);
        }
    });
    MathUtilities.Components.MenuBar.dropDown.View = Backbone.View.extend({
        "initialize": function initialize(model, tool) {
            if (tool === 'dgt') {
                this.render(tool);
            } else {
                this.render();
            }
        },
        "render": function render() {
            var $menu;
            $menu = MathUtilities.Components.MenuBar.templates.DropDownMenu({
                'drop-down-class': this.model.get('menuList') + '-drop-down',
                'menu-item': this.model.get('menuListData')
            }).trim();
            $('.' + this.model.get('menuList')).append($menu);
            $('.' + this.model.get('menuList') + '-drop-down').hide();
            $('.drop-down-item').on('mouseover', this.changeToHoverState);
            $('.drop-down-item').on('mouseleave', this.changeToNormalState);
            if (arguments[0] === 'dgt') {
                $('.drop-down-item').on('mouseover', $.proxy(this.changeStatus, this));
                $('.drop-down-item').on('mouseleave', $.proxy(this.changeStatus, this));
            }

        },

        "enableDropDownItems": function disableDropDownItems(itemsToBeEnabled) {
            var enableItems = $('.tool-menubar-drop-down').find('.enabled'),
                self = this,
                i, currentItem;
            for (i = 0; i < enableItems.length; i++) {
                $(enableItems[i]).removeClass('enabled');
                $(enableItems[i]).off('click', self._onDropDownItemClick);
            }
            for (i = 0; i < itemsToBeEnabled.length; i++) {
                currentItem = $('#' + itemsToBeEnabled[i]);

                if (!currentItem.hasClass('enabled')) {
                    currentItem.addClass('enabled');
                    currentItem.on('click', self._onDropDownItemClick);
                }
            }

        },
        "_onDropDownItemClick": function _onDropDownItemClick(event) {
            event = null;
            $(this).parents('.tool-menubar-drop-down').trigger('dropDownItemClicked', $(this).attr('id'));

        },

        "changeToHoverState": function changeToHoverState() {
            $(this).addClass('hover');
        },

        "changeToNormalState": function changeToNormalState() {
            $(this).removeClass('hover');
        },
        "changeStatus": function changeStatus(event) {
            if (event.type === 'mouseover') {
                this.trigger('change-status', event.target.id, 'hover');
            } else {
                this.trigger('change-status', 'cursor', 'leave');
            }

        }

    });

})(window.MathUtilities);
