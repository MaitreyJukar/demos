
(function () {
    'use strict';

    /**
    * View for rendering button and its related events
    *
    * @class Button
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.ContextMenu = Backbone.View.extend({

        /**
        * Stores manager reference
        * @type Object
        * @default null
        * @property _manager
        **/
        _manager: null,
        /**
        * Stores caller view reference
        * @type Object
        * @default null
        * @property _callerView
        **/
        _callerView: null,

        /**
        * Stores context menu element reference
        * @type Object
        * @default null
        * @property _$contextElement
        **/
        _$contextElement: null,

        /**
        * Calls render and attach events
        * @method initialize
        **/
        initialize: function initialize() {
            this._manager = this.model.getManager();
            this.render();

        },

        /**
        * Renders context menu holder and binds events
        * @method render
        **/
        render: function render() {
            //*** remove and add holder
            this.$el.find('.contextMenuHolder').remove();
            this.$el.append('<div class="contextMenuHolder" style=""></div>');

            /*bind keyup of every element on which context menu is to be created*/
            var elements = this.model.getElements();
            for (var i = 0; i < elements.length; i++) {
                elements[i].off('keyup.contextmenu').on('keyup.contextmenu', $.proxy(this._elementKeyup, this));
            }

            //this.$el.find('.contextMenuHolder').off('focusout.contextmenu').on('focusout.contextmenu', $.proxy(this._focusLostonMenuHolder, this));
            //this.$el.off('click.contextmenu').on('click.contextmenu', $.proxy(this._playerClick, this));
        },

        /**
        * public method to add/remove context menu items from context menu
        * @public
        * @param {array} elementIds
        * @param {boolean} ignore
        * @return {array} ignored elements ids
        * @method editContextMenu
        **/
        editContextMenu: function editContextMenu(elementIds, ignore) {
            return this.model.editIgnoreIds(elementIds, ignore);
        },
        /**
        * public method to enable/disable context menu on elements
        * @param {array} elements
        * @param {boolean} ignore
        * @public
        * @method enableDisableContextMenu
        **/
        enableDisableContextMenu: function enableDisableContextMenu(elements, enable) {
            if (elements.length === 0) return;
            if (enable === true) {
                for (var i = 0; i < elements.length; i++) {
                    elements[i].off('keyup.contextmenu').on('keyup.contextmenu', $.proxy(this._elementKeyup, this));
                    this.model.addRefToElementsArray(elements[i]);
                }
            } else {
                for (var i = 0; i < elements.length; i++) {
                    elements[i].off('keyup.contextmenu');
                    this.model.removeRefFromElementsArray(elements[i]);
                }
            }
        },

        /**
        * focuslost on menu holder
        * @private
        * @param {Object} event focus lost event
        * @param {Object} ui
        * @method _focusLostonMenuHolder
        **/
        _focusLostonMenuHolder: function _focusLostonMenuHolder(event, ui) {
            //setTimeout(function () {
            // if active element dont have class contextmenu case to do
            //console.log(document.activeElement);
            //}, 50);
        },
        /**
        * click on player
        * @private
        * @param {Object} event player click event
        * @param {Object} ui
        * @method _playerClick
        **/
        _playerClick: function _playerClick(event, ui) {
            this._hideContextMenu(event, ui);
        },

        /**
        * focusin on context menu item
        * @private
        * @param {Object} event Focus in event
        * @param {Object} ui
        * @method _focusinContextMenuItem
        **/
        _focusinContextMenuItem: function _focusinContextMenuItem(event, ui) {
            //$(event.currentTarget).siblings().removeClass('menufocussed');
            $(event.currentTarget).addClass('menufocussed');
        },
        /**
        * focusout on context menu item
        * @private
        * @param {Object} event Focus out event
        * @param {Object} ui
        * @method _focusinContextMenuItem
        **/
        _focusoutContextMenuItem: function _focusoutContextMenuItem(event, ui) {
            $(event.currentTarget).removeClass('menufocussed');
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
                    //console.log('scroll bar visible');
                    this.$el.find('.contextMenuHolder').css('width', this.$el.find('.contextMenuHolder').width() + 17); //add 17 px to accomodate scrollbar
                }
                contextMenuHeight = this.$el.find('.contextMenuHolder').height() + (2 * MathInteractives.global.ContextMenu.WRAPPER_PADDING) + (2 * MathInteractives.global.ContextMenu.PLAYER_PADDING);
                contextMenuWidth = this.$el.find('.contextMenuHolder').width() + (2 * MathInteractives.global.ContextMenu.WRAPPER_PADDING) + (2 * MathInteractives.global.ContextMenu.PLAYER_PADDING);


                if (left + contextMenuWidth > this.$el.width()) { //contextmenu is overflowing out of player div
                    left = left - contextMenuWidth;
                }
                if (top + contextMenuHeight > this.$el.height()) { //contextmenu is overflowing out of player div
                    top = top - contextMenuHeight;
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

        },

        /**
        * hide and empty context menu div
        * @private
        * @param {Object} event Hide empty context menu event
        * @param {Object} ui
        * @method _hideEmptyContextMenuDiv
        **/
        _hideEmptyContextMenuDiv: function _hideEmptyContextMenuDiv(event, ui) {
            this.$el.find('.contextMenuHolder').empty().hide();
            this.$el.find('.contextMenuHolder.childContextMenuHolder').remove();
        },

        /**
        * hide context menu on escape
        * @private
        * @param {Object} event Hide context menu event
        * @param {Object} ui
        * @method _hideContextMenu
        **/
        _hideContextMenu: function _hideContextMenu(event, ui) {
            this._hideEmptyContextMenuDiv(event, ui);
            this._$contextElement.trigger(MathInteractives.global.ContextMenu.CONTEXTMENU_HIDE, [event, ui]);
            this._$contextElement = null;
        },

        /**
        * hide context menu on escape
        * @private
        * @param {Object} event Hide child context menu event
        * @param {Object} ui
        * @method _hideContextMenu
        **/
        _hideChildContextMenu: function _hideChildContextMenu(event, ui) {
            var parentId = $(event.currentTarget).parents('.contextMenuHolder').attr('parent');
            //parent = $('#' + parentId);
            $(event.currentTarget).parents('.contextMenuHolder').remove();
            if (parentId) {
                this._manager.setFocus(parentId);
            }
        },

        /**
        * context menu item selected on space or enter
        * @private
        * @param {Object} event Context menu item selected event
        * @param {Object} ui
        * @method _contextMenuItemSelected
        **/
        _contextMenuItemSelected: function _contextMenuItemSelected(event, ui) {
            this._hideEmptyContextMenuDiv(event, ui);
            this._$contextElement.trigger(MathInteractives.global.ContextMenu.CONTEXTMENU_SELECT, [event, ui]);
            this._$contextElement = null;
        },

        /**
        * display nested context menu
        * @private
        * @param {Object} event Show nested menu event
        * @param {Object} ui
        * @method _contextMenuItemSelected
        **/
        _showNestedMenu: function _showNestedMenu(event, ui) {
            var currentTarget = $(event.currentTarget);
            //$(currentTarget'')
            if (!this.model.get('nestedMenuData')[currentTarget.attr('id')]) return;
            $.proxy(this._openChildContextMenu, this)(event, ui);
        },
        /**
        * open children context menu
        * @private
        * @param {Object} event Open child context menu event
        * @param {Object} ui
        * @method _openChildContextMenu
        **/
        _openChildContextMenu: function _openChildContextMenu(event, ui) {
            var currentTarget = $(event.currentTarget),
                i = 0, childMenuItem, isInArray, idString,
                ignoreIds = this.model.getIgnoreIds(),
                childMenuHolder = $('<div class="contextMenuHolder childContextMenuHolder" parent=' + currentTarget.attr('id') + '></div>'),
                top = -(this.$el.offset().top) + $(event.currentTarget).offset().top - 5 - 1, // top for contextmenu holder 5px padding as 1px border
                left = -(this.$el.offset().left) + $(event.currentTarget).offset().left + currentTarget.parents('.contextMenuHolder').width() + 5; // left for contextmenu holder 5 as 5px padding in contextMenuHolder;
            this.$el.append(childMenuHolder);
            childMenuHolder.css({ 'top': top, 'left': left }).show();

            for (; i < this.model.get('nestedMenuData')[currentTarget.attr('id')]['menuCount']; i++) {
                isInArray = $.inArray(currentTarget.attr('id') + "-" + i, ignoreIds);
                if (isInArray === -1) {
                    idString = currentTarget.attr('id') + "-" + i;
                    childMenuItem = $('<div id="' + idString + '" class="ContextMenuItem positionParentDiv childContextMenuItem"></div>');
                    childMenuHolder.append(childMenuItem);

                    if (this.model.isParentToChildMenu(idString) === true) {
                        childMenuItem.addClass('notAnElement'); //that means this element has an child menu associated with itself
                    }
                }
            }
            // what if all elements hidden // code for that
            this._manager.loadScreen(currentTarget.attr('id'), this.model.getInteractivityPrefix());

            this.$el.find('.contextMenuHolder .ContextMenuItem.childContextMenuItem ')
                .off('keyup.contextmenu focusin.contextmenu focusout.contextmenu keydown.contextmenu')
                .on('keyup.contextmenu', $.proxy(this._contextMenuItemKeyup, this))
                .on('focusout.contextmenu', $.proxy(this._focusoutContextMenuItem, this))
                .on('focusin.contextmenu', $.proxy(this._focusinContextMenuItem, this))
                .on('keydown.contextmenu', $.proxy(this._contextMenuItemKeydown, this));

            this._manager.setFocus(childMenuHolder.children().first().attr('id'));
        },

        /**
        * called on context menu items keyup
        * @private
        * @param {Object} event Context menu item key up event
        * @param {Object} ui
        * @method _contextMenuItemKeyup
        **/
        _contextMenuItemKeyup: function _contextMenuItemKeyup(event, ui) {
            //var keyCode = ;
            switch (event.keyCode) {
                case 13:
                case 32:
                    //space n enter
                    if ($(event.currentTarget).hasClass('notAnElement')) {
                        return;
                    }
                    $.proxy(this._contextMenuItemSelected, this)(event, ui);
                    break;
                case 27:
                    //escape
                    $.proxy(this._hideContextMenu, this)(event, ui);
                    break;
                case 39:
                    //right arrow key
                    $.proxy(this._showNestedMenu, this)(event, ui);
                    break;
                case 37:
                    //left arrow key
                    if ($(event.currentTarget).hasClass('childContextMenuItem')) {
                        $.proxy(this._hideChildContextMenu, this)(event, ui);
                    }
                    break;
                    //case 9:
                    //tab
                    //event.preventDefault();
                    //event.stopPropagation();
                    //event.stopImmediatePropagation();
                    //this._hideContextMenu(event, ui);
                    break;
                default:
                    event.preventDefault();
                    event.stopPropagation();
                    break;
            }

        },

        /**
        * called on context menu items keydown
        * @private
        * @param {Object} event Context Menu key down event
        * @param {Object} ui
        * @method _contextMenuItemKeydown
        **/
        _contextMenuItemKeydown: function _contextMenuItemKeydown(event, ui) {
            var currentTarget = $(event.currentTarget),
                lastIndex = currentTarget.attr('id').toString().lastIndexOf('-'),
                idSelector, nextElementPos = 1,
                prefix = currentTarget.attr('id').toString().substring(0, lastIndex),
                postfix = currentTarget.attr('id').toString().substring(lastIndex + 1);
            switch (event.keyCode) {
                case 9:
                    //tab
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    this._hideContextMenu(event, ui);
                    break;
                case 38:
                    //up arrow key
                    event.preventDefault(); //prevent scrolling of page

                    do {
                        idSelector = prefix + '-' + (parseInt(parseInt(postfix) - nextElementPos));
                        nextElementPos++;
                    } while (this.model.isIgnored(idSelector));

                    if ($('#' + idSelector).length === 1) {
                        this._manager.setFocus(idSelector);
                    } else {
                        this._manager.setFocus(currentTarget.parents('.contextMenuHolder').find('.ContextMenuItem').last().attr('id'));
                    }
                    break;
                case 40:
                    event.preventDefault(); //prevent scrolling of page
                    //down arrow key
                    do {
                        idSelector = prefix + '-' + (parseInt(parseInt(postfix) + nextElementPos));
                        nextElementPos++;
                    } while (this.model.isIgnored(idSelector));

                    if ($('#' + idSelector).length === 1) {
                        this._manager.setFocus(idSelector);
                    } else {
                        this._manager.setFocus(currentTarget.parents('.contextMenuHolder').find('.ContextMenuItem').first().attr('id'));
                    }
                    break;
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

                var contextMenuView = new MathInteractives.Common.Components.Views.ContextMenu({ el: options['el'], model: contextMenuModel });
                contextMenuView._callerView = options['thisView'];
                return contextMenuView;
            }
        }
    });


    MathInteractives.global.ContextMenu = MathInteractives.Common.Components.Views.ContextMenu;
})();
