(function () {
    var viewNameSpace = MathInteractives.Common.Components.Views.EquationManagerPro;
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

        updateContextMenuHeight: function updateContextMenuHeight() {
            var maxItemCount = this.model.get('maxItemCount'),
                $contextMenuHolder = this.$('.contextMenuHolder'),
                currentHeight = $contextMenuHolder.width(),
                currentHeight = $contextMenuHolder.height();
                debugger
        },

        updateMaxItemCount: function updateMaxItemCount(newMaxItemCount) {
            this.model.set('maxItemCount', newMaxItemCount);
        },

        _elementKeyup: function _elementKeyup(){
            this.$el.find('.contextMenuHolder').removeAttr('style');
            viewNameSpace.DerivedContextMenu.__super__._elementKeyup.apply(this, arguments);
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
