(function () {
    var viewNameSpace = MathInteractives.Common.Interactivities.ExponentAccordion.Views;
    'use strict';

    /**
    * View for rendering button and its related events
    *
    * @class Button
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    **/
    viewNameSpace.DerivedContextMenu = MathInteractives.Common.Components.Views.ContextMenu.extend({

        initialize: function initialize() {
            viewNameSpace.DerivedContextMenu.__super__.initialize.apply(this, arguments);
        },

        /**
        * keyup on elements on which context menu is to be shown
        * @private
        * @param {Object} event Key Up event
        * @param {Object} ui
        * @method _elementKeyup
        **/
        _elementKeyup: function _elementKeyup(event, ui) {
            if (event.keyCode !== 219) return; // keyCode for '[' key
            var prefix = this.model.getInteractivityPrefix(),
                itemCount = this.model.getContextMenuCount(),
                screenId = this.model.getScreenID(),
                top = -(this.$el.offset().top) + $(event.currentTarget).offset().top + ($(event.currentTarget).height() / 2), // top for contextmenu holder
                left = -(this.$el.offset().left) + $(event.currentTarget).offset().left + ($(event.currentTarget).width() / 2), // left for contextmenu holder
                ignoreIds = this.model.getIgnoreIds(),
                isInArray = null, maxItemCount = this.model.get('maxItemCount'),
                idString, contextMenuItem, avgHeight, contextMenuWidth, contextMenuHeight,
                firstMenuItem = null; //needed for setfocus on first element after contextmenu opened

            this._$contextElement = $(event.currentTarget);

            if (typeof (screenId) === 'undefined' || screenId.trim().length === 0) {
                screenId = 'ContextMenu'; // if no screenId then screenId = 'ContextMenu'
            }
            this.$el.find('.contextMenuHolder').empty().append('<div class="contextWrapper"></div>');
            for (var i = 0; i < itemCount; i++) {
                isInArray = $.inArray(prefix + screenId + '-' + i, ignoreIds); //check if element is not ignored then append
                if (isInArray === -1) {
                    if (firstMenuItem === null) firstMenuItem = prefix + screenId + '-' + i;
                    idString = prefix + screenId + '-' + i;
                    contextMenuItem = $('<div id=' + idString + ' class="ContextMenuItem"></div>')
                    this.$el.find('.contextMenuHolder .contextWrapper').append(contextMenuItem);

                    if (this.model.isParentToChildMenu(idString) === true) {
                        contextMenuItem.addClass('notAnElement'); //that means this element has an child menu associated with itself
                    }
                }
            }

            if (firstMenuItem === null) {//there is no elements present in context menu all ignored
                //decide dont show for the time being
            } else {

                this.$el.find('.contextMenuHolder').show().css({ 'left': 0, 'top': 0 });
                this._manager.loadScreen(screenId, prefix);



                if (maxItemCount > 0) {
                    avgHeight = this.$el.find('.contextMenuHolder .ContextMenuItem').first().height();
                    avgHeight += 5; // for 5px bottom padding for each contextMenuItem
                    //adjust height of contextMenu to show scroll bar
                    this.$el.find('.contextMenuHolder').css({ 'height': (avgHeight * (maxItemCount)) });
                }

                if (this.$el.find('.contextMenuHolder').height() < this.$el.find('.contextWrapper').height()) {
                    this.$el.find('.contextMenuHolder').css('width', this.$el.find('.contextMenuHolder').width() + 17); //add 17 px to accomodate scrollbar
                }
                contextMenuHeight = this.$el.find('.contextMenuHolder').height() + (2 * MathInteractives.global.ContextMenu.WRAPPER_PADDING) + (2 * MathInteractives.global.ContextMenu.PLAYER_PADDING);
                contextMenuWidth = this.$el.find('.contextMenuHolder').width() + (2 * MathInteractives.global.ContextMenu.WRAPPER_PADDING) + (2 * MathInteractives.global.ContextMenu.PLAYER_PADDING);

                //contextmenu is overflowing out of player div

                if (top + contextMenuHeight > this.$el.height()) { //contextmenu is overflowing out of player div
                    top = top - contextMenuHeight;
                }

                if(left < this.$el.offset().left) { //context menu going out of the interactive on the left side.
                    left = this.$el.offset().left + 10; // 10 is additional padding given to the element.
                }
                else if(left + contextMenuWidth > this.$el.width()) {
                    left = this.$el.width() - contextMenuWidth - 10; //// 10 is additional padding given to the element.
                }

                this.$el.find('.contextMenuHolder').css({ 'left': left, 'top': top });
                this.$el.find('.contextMenuHolder .ContextMenuItem')
                .off('keyup.contextmenu focusin.contextmenu focusout.contextmenu keydown.contextmenu')
                .on('keyup.contextmenu', $.proxy(this._contextMenuItemKeyup, this))
                .on('focusout.contextmenu', $.proxy(this._focusoutContextMenuItem, this))
                .on('focusin.contextmenu', $.proxy(this._focusinContextMenuItem, this))
                .on('keydown.contextmenu', $.proxy(this._contextMenuItemKeydown, this));

                //this._manager.setFocus(firstMenuItem);
                this._manager.setFocus(this.$el.find('.contextMenuHolder .ContextMenuItem').first().attr('id'));

                this._$contextElement.trigger(MathInteractives.global.ContextMenu.CONTEXTMENU_OPEN, [event, ui]);
            }
        }

    }, {

        /**
        * Scrollbar width
        * @type number
        * @static
        * @property SCROLLBAR_WIDTH
        **/
        SCROLLBAR_WIDTH: 17,

        /**
        * Wrapper Padding
        * @type number
        * @static
        * @property WRAPPER_PADDING
        **/
        WRAPPER_PADDING: 5,

        /**
        * Player padding
        * @type number
        * @static
        * @property PLAYER_PADDING
        **/
        PLAYER_PADDING: 8,

        /**
        * Fired when context menu is displayed
        * @type string
        * @static
        * @event CONTEXTMENU_OPEN
        **/
        CONTEXTMENU_OPEN: 'context-menu-displayed',

        /**
        * Fired when context menu is hidden/removed
        * @type string
        * @static
        * @event CONTEXTMENU_HIDE
        **/
        CONTEXTMENU_HIDE: 'context-menu-hidden',

        /**
        * Fired when space or enter is pressed on context menu item
        * @type string
        * @static
        * @event CONTEXTMENU_SELECT
        **/
        CONTEXTMENU_SELECT: 'context-menu-selected',


        /*
        * to generate context menu
        * @method initContextMenu
        * @param {object} options
        */
        initContextMenu: function (options) {
            /*
            options = {
            'el' : $(), player div (mandatory)
            'prefix' : 'text', interactivity prefix this.player.getPrefix(); (mandatory)
            'elements' : [], array of element references $() on which context menu is to be created (mandatory)
            'contextMenuCount': 0, integer specifyping context menu item elements (mandatory)
            'positionOffset': { element : {top: , left : } }, (optional) (not yet implemented)
            'screenId' : 'contextmenu screen' , JSON screen to be loaded when context menu is shown (optional) (default 'contextmenu')
            'manager' : managerobject, get('manager') (mandatory)
            'thisView' : viewObject, this (mandatory)
            }

            */
            if (options) {
                var contextMenuModel = new MathInteractives.Common.Components.Models.ContextMenu(options);
                contextMenuModel.setInteractivityPrefix(options['prefix']);
                contextMenuModel.setElements(options['elements']);
                contextMenuModel.setContextMenuCount(options['contextMenuCount']);
                contextMenuModel.setScreenID(options['screenId']);
                contextMenuModel.setManager(options['manager']);

                contextMenuModel.setNestedMenuData({});
                if (options['nestedMenuData']) {
                    contextMenuModel.setNestedMenuData(options['nestedMenuData']);
                }

                var contextMenuView = new viewNameSpace.DerivedContextMenu({ el: options['el'], model: contextMenuModel });
                contextMenuView._callerView = options['thisView'];
                return contextMenuView;
            }
        }
    });
})();
