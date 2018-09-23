/* global _, $, window, buttonBuildData */


(function(MathUtilities) {
    'use strict';

    MathUtilities.Components.MenuBar = MathUtilities.Components.MenuBar || {};
    MathUtilities.Components.MenuBar.Models = MathUtilities.Components.MenuBar.Models || {};
    MathUtilities.Components.MenuBar.Views = MathUtilities.Components.MenuBar.Views || {};
    MathUtilities.Components.MenuBar.templates = MathUtilities.Components.MenuBar.templates || {};
    MathUtilities.Components.ImageAsset = MathUtilities.Components.ImageAsset || {};
    MathUtilities.Components.ImageAsset.templates = MathUtilities.Components.ImageAsset.templates || {};

    MathUtilities.Components.MenuBar.Models.Button = Backbone.Model.extend({

        "defaults": {
            "toolId": null,
            "align": null,
            "tooltip": null,
            "popupMenuOptions": null,
            "hideSelection": null,
            "preventOnMoreClick": null,
            "popupMenuTooltip": null
        },

        "initialize": function() {
            this.set({
                "align": "left",
                "tooltip": "",
                "popupMenuOptions": [],
                "hideSelection": false,
                "preventOnMoreClick": false,
                "exploreOnClick": false,
                "popupMenuTooltip": [],
                "popupMenu": []
            });
        },

        "setBtnParameters": function(btnParameters) {
            this.set({
                "toolId": btnParameters.toolId,
                "align": btnParameters.align,
                "tooltip": btnParameters.tooltip,
                "noSubType": btnParameters.noSubType,
                "popupMenuOptions": btnParameters.popupMenuOptions,
                "popupMenuTooltip": btnParameters.popupMenuTooltip,
                "popupMenu": btnParameters.popupMenu,
                "screenId": btnParameters.screenId
            });
            if (btnParameters.hideSelection) {
                this.set('hideSelection', true);
            }
            if (btnParameters.exploreOnClick) {
                this.set('exploreOnClick', true);
            }
            if (btnParameters.preventOnMoreClick) {
                this.set('preventOnMoreClick', true);
            }
        }
    });

    /*******************/

    MathUtilities.Components.MenuBar.Models.Menu = Backbone.Model.extend({
        "defaults": function() {
            return {
                "$toolMenu": null,
                "btnPopupOptionsMap": {},
                "menuPopupView": null,
                "btnPopupOtionsTooltip": {},
                "btnPopupOptions": {},
                "isAccessible": false,
                "accManager": null,
                "screenId": null
            };
        }
    }, {
        "KEY_CODE": {
            "ENTER_KEY": 13,
            "ESCAPE_KEY": 27,
            "SPACE_BAR_KEY": 32,
            "TAB_KEY": 9
        }
    });

    /*******************/

    MathUtilities.Components.MenuBar.Views.Menu = Backbone.View.extend({
        "selectMenuBtnFuncRef": null,
        "callToOpenPopupMenuFuncRef": null,
        "initialize": function() {
            this.render();
            this.selectMenuBtnFuncRef = _.bind(this._selectMenuBtn, this);
            this.callToOpenPopupMenuFuncRef = _.bind(this._callToOpenPopupMenu, this);
            var $menuPopupView = new MathUtilities.Components.MenuBar.Views.PopupMenu({
                "el": this.model.get('$toolMenu'),
                "isAccessible": this.model.get('isAccessible'),
                "accManager": this.model.get('accManager')
            });
            $menuPopupView.getImageAssetView().on("assetImageSelected", _.bind(this._triggerImageSelected, this));
            this.model.set('menuPopupView', $menuPopupView);
            return this;
        },

        "render": function() {
            this.$el.append(MathUtilities.Components.MenuBar.templates.MenuBar().trim());
            this.model.set('$toolMenu', this.$('.tool-menubar'));
        },

        "getImageAssetView": function() {
            return this.model.get('menuPopupView').getImageAssetView();
        },

        "compileMenu": function(buttonList) {
            var loopVar = 0,
                buttonListLength = buttonList.length;
            for (; loopVar < buttonListLength; loopVar++) {
                this.addButton(buttonList[loopVar]);
            }
        },

        "loadMenuScreen": function(screenId) {
            if (!screenId && !this.model.get('screenId')) {
                return;
            }
            var accManager = this.model.get('accManager');
            screenId = screenId || this.model.get('screenId');
            if (accManager !== null) {
                accManager.loadScreen(screenId);
            }
        },

        "addButton": function(buttonData) {
            if (!buttonData) {
                return;
            }
            var loopVar2,
                toolId = buttonData.get('toolId'),
                align = buttonData.get('align'),
                tooltip = buttonData.get('tooltip'),
                popupMenu = buttonData.get('popupMenu'),
                hideSelection = buttonData.get('hideSelection'),
                exploreOnClick = buttonData.get('exploreOnClick'),
                preventOnMoreClick = buttonData.get('preventOnMoreClick'),
                noSubType = buttonData.get('noSubType'),
                $menu = this.model.get('$toolMenu').find('.menubar-' + align + '-container'),
                $newBtnHodler = null,
                $newBtn = null,
                $moreBtn = null,
                curBtnOptions,
                isAccessible = this.model.get('isAccessible'),
                $accBtn = null,
                $btnHighlighter = null;

            $menu.append(MathUtilities.Components.MenuBar.templates.ToolbarButton({
                "id": toolId
            }).trim());
            $newBtnHodler = $menu.find('.menubar-button-holder:last');
            $newBtn = $newBtnHodler.find('.menubar-button');
            $btnHighlighter = $newBtnHodler.find('.button-highlighter');
            $moreBtn = $newBtnHodler.find('.menubar-button-more');
            $accBtn = $newBtnHodler.find('.menubar-acc-elem');

            $newBtnHodler.addClass(toolId).attr('data-tool-id', toolId).attr('id', toolId)
                .on('mouseover', _.bind(this.hoverMenubarButtonTrigger, this))
                .on('mouseleave', _.bind(this.hoverMenubarButtonTrigger, this));

            if (isAccessible === true) {
                $accBtn.on('click', _.bind(this._triggerButtonClick, this)).on('focusin', _.bind(this._onMenuButtonFocus, this));
            }
            $newBtn.on('click', this.selectMenuBtnFuncRef).addClass(toolId);
            $moreBtn.on('click', _.bind(this._onMoreBtnClick, this));

            if (popupMenu && popupMenu.length > 0) {
                for (loopVar2 = 0; loopVar2 < popupMenu.length; loopVar2++) {
                    if (popupMenu[loopVar2].type === 'radio-btn' && popupMenu[loopVar2].selected === true) {

                        $newBtn.attr('selected-radio-btn-' + popupMenu[loopVar2].name, popupMenu[loopVar2].tool);

                    }
                }
            }
            if ('ontouchstart' in window) {
                $newBtn.on('touchstart',
                    function() {
                        if (!$(this).parent().hasClass('selected')) {
                            $(this).parent().addClass('hover');
                        }
                    }).on('touchend',
                    function() {
                        $(this).parent().removeClass('hover');
                    });
            } else {
                $btnHighlighter.on('mouseenter', this.onMenuButtonMouseEnter).on('mouseleave', this.onMenuButtonMouseLeave);

            }

            if ('ontouchstart' in window) {
                $moreBtn.on('touchstart',
                    function() {
                        if (!$(this).parent().hasClass('selected')) {
                            $(this).parent().addClass('hover');
                        }
                    }).on('touchend',
                    function() {
                        $(this).parent().removeClass('hover');
                    });
            }
            if (hideSelection) {
                $newBtn.addClass('hide-selection');
            }
            if (exploreOnClick) {
                $newBtn.addClass('explore-on-click');
            }
            if (preventOnMoreClick) {
                $newBtn.addClass('prevent-on-more-click');
            }

            if (noSubType) {
                $newBtn.addClass('no-sub-type');
            }
            if (tooltip) {
                this.addToolTip($newBtnHodler, tooltip);
            }
            if (typeof popupMenu === 'undefined') {
                $newBtn.attr('data-tool', toolId);
            }
            if (popupMenu && popupMenu.length > 0) {
                curBtnOptions = this.model.get('btnPopupOptions');
                curBtnOptions[toolId] = {};
                curBtnOptions[toolId].optionsList = popupMenu;
                curBtnOptions[toolId].screenId = buttonData.get('screenId');

                this.model.set('btnPopupOptions', curBtnOptions);
                if (noSubType === true) {
                    $newBtn.attr('data-tool', toolId);
                } else {
                    $newBtn.addClass(popupMenu[0].id).attr('data-tool', popupMenu[0].id);
                }
                $newBtn.attr('data-submenu-index', '0');
                $moreBtn.attr('data-options-for', toolId).addClass(toolId)
                    .on('click', this.callToOpenPopupMenuFuncRef);
            } else {
                $moreBtn.remove();
            }
        },

        "_onMoreBtnClick": function(event) {
            var $menuBtn = this.$(event.target).siblings('.menubar-button');
            if ($menuBtn.hasClass('prevent-on-more-click')) {
                $menuBtn.addClass('prevent-click');
            }
        },

        "hoverMenubarButtonTrigger": function(event) {
            var $currentTarget = this.$(event.currentTarget);
            if ($(event.target).parents().is('.popup-menu-container')) { //to prevent hover event trigger when popup button is hovered.
                return;
            }
            if (event.type === 'mouseover') {
                this.trigger('popupMenuButtonhover', $currentTarget.attr('data-tool-id'), 'hover');
            } else {
                this.trigger('popupMenuButtonhover', 'cursor', 'leave');
            }
        },
        "onMenuButtonMouseEnter": function() {
            if (!($(this).hasClass('selected') || $(this).children().hasClass('disabled'))) {
                $(this).addClass('hover');
            }
        },
        "onMenuButtonMouseLeave": function() {
            $(this).removeClass('hover');
        },
        "addSeperator": function(menuPanel) {
            this.$('.menubar-' + menuPanel + '-container').append(MathUtilities.Components.MenuBar.templates.MenuSeperator().trim());
        },
        "disableAllMenuBtns": function() {
            this.$('.tool-menubar').addClass('disabled-menu');
            var $newBtnHodler = this.$('.menubar-button-holder'),
                $newBtn = $newBtnHodler.find('.menubar-button'),
                $btnHighlighter = $newBtnHodler.find('.button-highlighter'),
                $moreBtn = $newBtnHodler.find('.menubar-button-more'),
                $menuAccBtn = $newBtnHodler.find('.menubar-acc-elem'),
                accManager = this.model.get('accManager');
            $newBtn.off('click', this.selectMenuBtnFuncRef);
            $moreBtn.off('click', this.callToOpenPopupMenuFuncRef);
            $btnHighlighter.off('mouseenter', this.onMenuButtonMouseEnter).off('mouseleave', this.onMenuButtonMouseLeave);
            $menuAccBtn.addClass('disabled');

            if (accManager !== null) {
                $.each($menuAccBtn, function(key, value) {
                    accManager.enableTab($(value).attr('id'), false);
                });
            }

        },
        "enableAllMenuBtns": function() {
            this.$('.tool-menubar').removeClass('disabled-menu');
            var $newBtnHodler = this.$('.menubar-button-holder'),
                $newBtn = $newBtnHodler.find('.menubar-button'),
                $btnHighlighters = $newBtnHodler.find('.button-highlighter'),
                $moreBtn = $newBtnHodler.find('.menubar-button-more'),
                $menuAccBtn = $newBtnHodler.find('.menubar-acc-elem'),
                accManager = this.model.get('accManager');

            $newBtn.on('click', this.selectMenuBtnFuncRef);
            $moreBtn.on('click', this.callToOpenPopupMenuFuncRef);
            $btnHighlighters.on('mouseenter', this.onMenuButtonMouseEnter).on('mouseleave', this.onMenuButtonMouseLeave);
            $menuAccBtn.removeClass('disabled');
            if (accManager !== null) {
                $.each($menuAccBtn, function(key, value) {
                    accManager.enableTab($(value).attr('id'), true);
                    accManager.updateFocusRect($(value).attr('id'));
                });
            }
        },

        "disableMenuBarBtn": function(indexArray) {
            var i = 0,
                $button,
                $allButtons = this.$('.menubar-button'),
                accManager = this.model.get('accManager'),
                $accBtn = this.$('.button-highlighter.menubar-acc-elem.disabled'),
                indexArrLength = indexArray.length,
                $allMoreButtons = this.$('.menubar-button-more'),
                $buttonMore;
            if (accManager) {
                $.each($accBtn, function(key, value) {
                    accManager.enableTab($(value).attr('id'), true);
                    accManager.updateFocusRect($(value).attr('id'));
                });
            }

            $allButtons.off('click', this.selectMenuBtnFuncRef).on('click', this.selectMenuBtnFuncRef);
            $allMoreButtons.off('click', this.callToOpenPopupMenuFuncRef).on('click', this.callToOpenPopupMenuFuncRef);
            $allButtons.off('mouseenter', this.onMenuButtonMouseEnter).on('mouseenter', this.onMenuButtonMouseEnter);
            $allButtons.off('mouseleave', this.onMenuButtonMouseLeave).on('mouseleave', this.onMenuButtonMouseLeave);
            $allButtons.removeClass('disabled');
            $allMoreButtons.removeClass('disabled');
            for (; i < indexArrLength; i++) {
                $button = $($allButtons[indexArray[i]]);
                $buttonMore = $button.siblings('.menubar-button-more');

                $buttonMore.off('click', this.callToOpenPopupMenuFuncRef);
                $button.off('click', this.selectMenuBtnFuncRef)
                    .off('mouseenter', this.onMenuButtonMouseEnter)
                    .off('mouseleave', this.onMenuButtonMouseLeave);
                if (!$button.hasClass('disabled')) {
                    $button.addClass('disabled');
                    $buttonMore.addClass('disabled');
                }
                $button.off('click', this.selectMenuBtnFuncRef);
                $button.off('mouseenter', this.onMenuButtonMouseEnter);
                $button.off('mouseleave', this.onMenuButtonMouseLeave);
                $button.addClass('disabled');
                $buttonMore.addClass('disabled');

                $accBtn = $button.parents('.menubar-acc-elem');
                $accBtn.addClass('disabled');
                if (accManager !== null) {
                    accManager.enableTab($accBtn.attr('id'), false);
                }
            }
        },

        "setMenubarState": function(selectedMenuIndex, selectedSubMenuIndices, singleMenuOptionIndices, radioBtnStateArray) {

            var loopVar, $parentMenu, selectedSubMenuIndicesLength, $curBtn, selectedAttributeStr, curSubIndex, newSubMenuName,
                toolBtns = this.$('.menubar-button'),
                btnHighlighters = this.$('.button-highlighter'),
                $popupMenuContainer = this.$('.popup-menu-container'),
                $popupMenu = $popupMenuContainer.find('.popup-menu-holder');


            if (typeof radioBtnStateArray !== 'undefined') {
                for (loopVar = 0; loopVar < radioBtnStateArray.length; loopVar++) {
                    selectedAttributeStr = 'selected-' + radioBtnStateArray[loopVar].btnType + '-' + radioBtnStateArray[loopVar].name;
                    $parentMenu = this.$('[' + selectedAttributeStr + ']');
                    $parentMenu.attr(selectedAttributeStr, radioBtnStateArray[loopVar].setTool);
                }
            }
            if (typeof selectedSubMenuIndices !== 'undefined') {
                selectedSubMenuIndicesLength = selectedSubMenuIndices.length;
                for (loopVar = 0; loopVar < selectedSubMenuIndicesLength; loopVar++) {

                    if ($.inArray(loopVar, singleMenuOptionIndices) < 0) {
                        curSubIndex = selectedSubMenuIndices[loopVar];
                        $curBtn = $(toolBtns[loopVar]);
                        if (!$curBtn.attr('data-tool')) {
                            curSubIndex = 0;
                        }
                        //as image won't be having fixed option list,
                        //& no need to show selected state on current displyed image in image drop-down
                        if ($curBtn.parent().find('.menubar-button-more').attr('data-options-for') !== 'image' && curSubIndex !== -1) {
                            newSubMenuName = this.model.get('btnPopupOptions')[$curBtn.parent().find('.menubar-button-more').attr('data-options-for')].optionsList[curSubIndex].id;
                            if ($popupMenu.find('.popup-menu-button.' + newSubMenuName).attr('data-type') !== 'check-box') {
                                $curBtn.attr('data-submenu-index', curSubIndex)
                                    .removeClass($curBtn.attr('data-tool'))
                                    .attr('data-tool', newSubMenuName)
                                    .addClass(newSubMenuName);
                            }
                        }
                    }
                }
                if (!$(toolBtns[selectedMenuIndex]).hasClass('hideSelection')) {
                    btnHighlighters.removeClass('selected');
                    $(btnHighlighters[selectedMenuIndex]).addClass('selected');
                }
            }
        },

        "selectMenu": function(menuIndex, subMenuIndex) {
            var $menubarButtons,
                $toolMenubar = this.$el,
                $menubarBtnHolders = $toolMenubar.find('.menubar-button-holder');
            $menubarButtons = $($menubarBtnHolders[menuIndex]).find('.menubar-button');
            $menubarButtons.trigger('click', [subMenuIndex, false, true]);
        },

        "_selectMenuBtn": function(event, subMenuIndex, fromPopup) {
            if (this.$(event.target).hasClass('prevent-click')) {
                this.$(event.target).removeClass('prevent-click');
                return;
            }
            var $menuBtn = this.$(event.target),
                $popupMenuHolder = this.$('.popup-menu-container'),
                $menuBtnParent = $menuBtn.parent(),
                $popupMenu = $popupMenuHolder.find('.popup-menu-holder'),
                menuFor = $popupMenu.attr('data-popup-menu-for'),
                menuBtnMaps = this.model.get('btnPopupOptions'),
                loopVar = 0,
                key,
                menuIndex = null,
                $menuPanels = $menuBtnParent.parent().parent(),
                curBtnOptions,
                buttonIndex,
                i;

            if (!$menuBtn.hasClass('hide-selection')) {
                this.$('.menubar-button').parent().removeClass('selected');
                $menuBtnParent.addClass('selected');
            }

            $menuBtnParent.removeClass('hover');

            if (typeof subMenuIndex !== 'number' || $menuBtn.hasClass('no-sub-type')) {
                subMenuIndex = -1;
                for (key in menuBtnMaps) {
                    for (loopVar = 0; loopVar < menuBtnMaps[key].optionsList.length; loopVar++) {
                        if ($menuBtn.hasClass(menuBtnMaps[key].optionsList[loopVar].id)) {
                            subMenuIndex = loopVar;
                            break;
                        }
                    }
                }
            } else {
                curBtnOptions = menuBtnMaps[menuFor].optionsList;
                if (typeof curBtnOptions[subMenuIndex].selected !== 'undefined') {
                    curBtnOptions[subMenuIndex].selected = !curBtnOptions[subMenuIndex].selected;
                }
                for (i = 0; i < curBtnOptions.length; i++) {
                    if (typeof subMenuIndex === 'undefined' && $menuBtn.hasClass(curBtnOptions[i].id)) {
                        subMenuIndex = i;
                    }
                    if (curBtnOptions[subMenuIndex].type !== 'check-box' && typeof curBtnOptions[i].id !== 'undefined') {
                        $menuBtn.removeClass(curBtnOptions[i].id);
                    }
                }
                if (curBtnOptions[subMenuIndex].type !== 'check-box') {
                    $menuBtn.addClass(curBtnOptions[subMenuIndex].id);
                    if (!$menuBtn.hasClass('no-sub-type')) {
                        $menuBtn.attr('data-tool', curBtnOptions[subMenuIndex].id);
                    }
                    $menuBtn.attr('data-submenu-index', subMenuIndex);
                }

            }
            if ($menuPanels.hasClass('menubar-left-container')) {
                menuIndex = $menuBtnParent.parent().index();
            } else {
                buttonIndex = $menuBtnParent.parent().index() + 1;
                menuIndex = this.$('.menubar-left-container .menubar-button-holder').length - 1 + buttonIndex;
            }

            if ($menuBtn.attr('data-allow-open') !== 'allow' && $menuBtn.hasClass('explore-on-click')) {
                $menuBtn.attr('data-allow-open', 'allow');
            } else {
                $menuBtn.attr('data-allow-open', 'no');
            }
            if ($menuBtn.hasClass('explore-on-click') && this.model.exploreClickStarted !== true && fromPopup !== true) {
                this.model.exploreClickStarted = true;

                event.target = $menuBtn.parent().find('.menubar-button-more');
                this._callToOpenPopupMenu(event, true);
            } else {
                this.$el.trigger('menuToolChanged', [menuIndex, subMenuIndex, $menuBtn, event, $menuBtn.attr('data-manager-trigger'),
                    fromPopup
                ]); // fifth parameter is related to accessibility. fromKeyEvent returns true for calls using keys.
            }
            this.model.exploreClickStarted = false;
        },

        "_callToOpenPopupMenu": function(event, triggerredOnExplore) {
            var $curMoreBtn = this.$(event.target),
                optionsFor = $curMoreBtn.attr('data-options-for'),
                btnOptions = this.model.get('btnPopupOptions'),
                optionsList = btnOptions[optionsFor].optionsList,
                disabledOptionsList = btnOptions[optionsFor].disabledOptions,
                screenId = btnOptions[optionsFor].screenId,
                menuPopupView = this.model.get('menuPopupView');

            menuPopupView.displayPopupMenu(optionsFor, optionsList, disabledOptionsList, triggerredOnExplore, screenId);
            this.$('.popup-menu-container').detach().appendTo($curMoreBtn.parents('.menubar-button-holder'));
            menuPopupView.onPopUpOpen();

        },
        "_triggerImageSelected": function(event) {
            this.trigger("imageAssetSelected", event);
        },

        "deselectCheckBox": function(menuOption, checkBoxId) {
            var menuOptionData = this.model.get('btnPopupOptions')[menuOption],
                loopVar, menuOptionDataLength = menuOptionData.optionsList.length,
                curOption;
            this.$('.' + checkBoxId + ' .chk-box').removeClass('selected');

            for (loopVar = 0; loopVar < menuOptionDataLength; loopVar++) {
                curOption = menuOptionData.optionsList[loopVar];
                if (curOption.id === checkBoxId) {
                    curOption.selected = false;
                    break;
                }
            }
        },

        "disablePopupMenuOptions": function(optionsFor, indexesToDisable) {
            var btnOptionsMap = this.model.get('btnPopupOptions');
            btnOptionsMap[optionsFor].disabledOptions = indexesToDisable;
            this.model.set('btnPopupOptions', btnOptionsMap);
        },

        "addToolTip": function($btn, toolTipOption) {
            var options = {
                    "id": $btn.attr("id") + "-tooltip",
                    "text": "",
                    "position": "bottom",
                    "align": "center",
                    "tool-holder": $btn
                },
                tooltipView = null,
                startEvent = "mouseenter",
                endEvent = "mouseleave mousedown";

            if ("ontouchstart" in window) {
                if (MathUtilities.Components.Utils.Models.BrowserCheck.isMobile) {
                    startEvent = "touchstart";
                    endEvent = "touchend";
                } else {
                    //Touch and type device
                    startEvent += " touchstart";
                    endEvent += " touchend";
                }
            }
            if (typeof toolTipOption === 'object') {
                if (toolTipOption.text) {
                    options.text = toolTipOption.text;
                }
                if (toolTipOption.position) {
                    options.position = toolTipOption.position;
                }
                if (toolTipOption.align) {
                    options.align = toolTipOption.align;
                }

            } else {
                options.text = toolTipOption;
            }
            tooltipView = MathUtilities.Components.CustomTooltip.generateTooltip(options);
            $btn.find('.button-highlighter').on(startEvent, _.bind(tooltipView.showTooltip, tooltipView))
                .on(endEvent, _.bind(tooltipView.hideTooltip, tooltipView));
        },

        /**
         * Trigger menu button click,when accessibility is on.
         * @method _triggerButtonClick
         * @private
         */
        "_triggerButtonClick": function(event) {
            if (!this.$(event.target).is('.menubar-acc-elem')) {
                return;
            }
            var $target = this.$(event.target),
                $menuBtnHolder = $target.parents('.menubar-button-holder'),
                $moreBtn = $menuBtnHolder.find('.menubar-button-more'),
                $menuBtn = $menuBtnHolder.find('.menubar-button');

            $menuBtn.attr('data-manager-trigger', true);
            if ($moreBtn.length !== 0) {
                $moreBtn.trigger('click');
            } else {
                $menuBtn.trigger('click');
            }
            $menuBtn.attr('data-manager-trigger', false);
        },

        /**
         * Call when focus is on accessible div.
         * @method _onMenuButtonFocus
         * @private
         */
        "_onMenuButtonFocus": function(event) {
            var popupView = this.model.get('menuPopupView'),
                $target = this.$(event.target);

            if (!$target.parents().is('.popup-menu-container')) {
                popupView._hidePopupMenu();
            }

            this.trigger('menuButtonFocus', event);
        }
    });

    /*******************/

    MathUtilities.Components.MenuBar.Views.PopupMenu = Backbone.View.extend({

        "imageAssetView": null,
        "hidePopupMenuFuncRef": null,
        "clickOutsideMenuPopupFuncRef": null,

        "initialize": function() {
            this._hidePopupMenu();
            this.clickOutsideMenuPopupFuncRef = _.bind(this._clickedOutsideMenuPopup, this);
            this.hidePopupMenuFuncRef = _.bind(this._hidePopupMenu, this);
            this.imageAssetView = new MathUtilities.Components.ImageAssetView({
                "model": new MathUtilities.Components.ImageAssetModel(),
                "element": $("<div />")
            });
            this.isAccessible = this.options.isAccessible;
            this.accManager = this.options.accManager;
            return this;
        },

        "getImageAssetView": function() {
            return this.imageAssetView;
        },

        "_hidePopupMenu": function() {
            var $menuBtn = this.$('.popup-menu-container').parents('.menubar-button-holder').find('.menubar-button');
            if ($menuBtn.attr('data-allow-open') === 'allow') {
                $menuBtn.attr('data-allow-open', 'no');
            }
            this.unloadScreen(this.$('.popup-menu-holder').attr('data-screenId'));
            this.$('.popup-menu-container').hide();
            this.$('.menubar-button-more').off('click touchstart', this.hidePopupMenuFuncRef);
            $(window).off('click touchstart', this.clickOutsideMenuPopupFuncRef);
        },

        "_showPopupMenu": function() {
            this.$('.popup-menu-container').show();
            this.$el.trigger('toop-popup-menu-shown');
            $(window).off('click touchstart', this.clickOutsideMenuPopupFuncRef).on('click touchstart', this.clickOutsideMenuPopupFuncRef);
        },

        "_clickedOutsideMenuPopup": function(event) {
            var $target = this.$(event.target);

            if (!$target.hasClass('menubar-button-more') && !$target.hasClass('popup-menu-container') && !$target.hasClass('popup-menu-button-disabled') &&
                $target.attr('data-allow-open') !== 'allow' && !$target.hasClass('menubar-acc-elem') && !$target.hasClass('disabled') &&
                !($target.hasClass('acc-read-elem') && $target.parent().hasClass('disabled'))) {
                this._hidePopupMenu();
            }
        },

        "displayPopupMenu": function(popupMenuFor, optionsList, disabledOptions, triggerredOnExplore, screenId) {
            var parentMenu,
                dataToolAttr,
                popupHeight,
                hoverOnPopUpButton,
                hoverOutPopUpButton,
                hoverOnPopUpRadioButton,
                hoverOutPopUpRadioButton,
                $buttonContainer,
                checkBoxCount = 0,
                selectedChkBoxes = [],
                buttonPopup, chkBoxPopUp, radioBtnPopUp, selectedRadioBtn,
                POPUP_BTN_WIDTH = 45,
                POPUP_BTN_HEIGHT = 32,
                POPUP_BTN_PADDING = 10,
                POPUP_MAX_BUTTON_IN_ROW = 5,
                POP_UP_CHK_BOX_WIDTH = 100,
                $popupMenuContainer = this.$('.popup-menu-container'),
                $popupMenu = $popupMenuContainer.find('.popup-menu-holder'),
                loopVar = 0,
                $newPopBtn = null,
                popupWidth = $popupMenu.width(),
                rowIndex = 0,
                colIndex = 0,
                addButtonGroup = null;
            $popupMenu.empty()
                .attr('data-popup-menu-for', popupMenuFor).attr('data-screenId', screenId || '');

            parentMenu = this.$('.' + $popupMenu.attr('data-popup-menu-for') + ' .menubar-button');
            dataToolAttr = parentMenu.attr('data-tool');
            $popupMenu.on('keydown', '.menubar-acc-elem', _.bind(this.onAccKeyDown, this));
            hoverOnPopUpButton = function() {
                var $popupButton = $(this).find('.popup-menu-button');
                if (!$popupButton.hasClass('selected')) {
                    $popupButton.addClass('hover');
                }
            };
            hoverOutPopUpButton = function() {
                var $popupButton = $(this).find('.popup-menu-button');
                if (!$popupButton.hasClass('selected')) {
                    $popupButton.removeClass('hover');
                }
            };
            hoverOnPopUpRadioButton = function() {
                var $this = $(this);
                if (!$this.hasClass('selected')) {
                    $this.children().first().addClass('hover');
                }
            };
            hoverOutPopUpRadioButton = function() {
                var $this = $(this);
                if (!$this.hasClass('selected')) {
                    $this.children().first().removeClass('hover');
                }
            };

            buttonPopup = function() {
                /*positioning*/
                if (colIndex >= POPUP_MAX_BUTTON_IN_ROW) {
                    rowIndex++;
                    colIndex = 0;
                }
                colIndex++;

            };
            radioBtnPopUp = function() {
                /*positioning*/
                rowIndex++;
                colIndex = 1;

            };
            chkBoxPopUp = function() {
                checkBoxCount++;
            };

            addButtonGroup = _.bind(function(group, $btn, isAppendTo) {
                var groupId = popupMenuFor + "-" + group,
                    $groupElem = $popupMenu.find('#' + groupId),
                    $clearDiv = null;
                if (!$groupElem.length) {
                    $groupElem = $('<div/>');
                    $groupElem.attr({
                        "id": groupId,
                        "class": "acc-group menubar-acc-elem"
                    });

                    $clearDiv = $('<div/>');
                    $clearDiv.addClass('clear group-clear-elem');
                    $groupElem.append($clearDiv);

                    $popupMenu.append($groupElem);
                    $groupElem.on('click', _.bind(this.onGroupClick, this))
                        .on('focusin', _.bind(this.onGroupFocusIn, this));
                }
                $btn.addClass(groupId + '-elem group-elem')
                    .attr('data-group', groupId);
                if (isAppendTo) {
                    $btn.insertBefore($groupElem.children().last());
                }
            }, this);

            for (loopVar = 0; loopVar < optionsList.length; loopVar++) {
                switch (optionsList[loopVar].type) {
                    case 'check-box':
                        $popupMenu.append(MathUtilities.Components.MenuBar.templates.PopupMenuChkBox({
                            "id": optionsList[loopVar].id,
                            "text": optionsList[loopVar].text,
                            "tool": optionsList[loopVar].id
                        }).trim());
                        if (optionsList[loopVar].selected === true) {
                            selectedChkBoxes.push(optionsList[loopVar].id);
                        }
                        if (typeof optionsList[loopVar].selected === 'undefined') {
                            optionsList[loopVar].selected = false;
                        }
                        chkBoxPopUp();
                        break;
                    case 'text-input':
                        this.imageAssetView.model.set({
                            "id": optionsList[loopVar].id,
                            "text": optionsList[loopVar].text
                        });
                        this.imageAssetView.setElement($popupMenu).render();
                        rowIndex++;
                        popupHeight = "auto";
                        break;
                    case 'radio-btn':
                        radioBtnPopUp();
                        $popupMenu.append(MathUtilities.Components.MenuBar.templates.PopupMenuRadioBtn({
                            "id": optionsList[loopVar].id,
                            "text": optionsList[loopVar].text,
                            "name": optionsList[loopVar].name,
                            "tool": optionsList[loopVar].tool
                        }).trim());
                        break;
                    case 'separator':
                        $popupMenu.append(MathUtilities.Components.MenuBar.templates.MenuSeperator({
                            "seperator-type": optionsList[loopVar].name
                        }));
                        if (optionsList[loopVar].group) {
                            addButtonGroup(optionsList[loopVar].group, $popupMenu.find('.menubar-seperator:last'), optionsList[loopVar].isGroupAppend || true);
                        }
                        continue;
                    default:
                        $popupMenu.append(MathUtilities.Components.MenuBar.templates.PopupMenuButton({
                            "isText": !!optionsList[loopVar].text,
                            "text": optionsList[loopVar].text
                        }));
                        buttonPopup();
                        break;
                }
                $newPopBtn = $popupMenu.find('.popup-menu-button:last');

                $newPopBtn.addClass(optionsList[loopVar].id);
                $buttonContainer = $newPopBtn.parents('.menu-item-container').attr('id', optionsList[loopVar].id + '-pop-up');
                if (optionsList[loopVar].group) {
                    addButtonGroup(optionsList[loopVar].group, $buttonContainer, optionsList[loopVar].isGroupAppend || true);
                }

                if (optionsList[loopVar].toolTip) {
                    this.addToolTip($buttonContainer, optionsList[loopVar].toolTip);
                }
                if ($newPopBtn.attr('data-type') !== 'radio-btn') {
                    $newPopBtn.attr('tool', optionsList[loopVar].id);
                }
                selectedRadioBtn = parentMenu.attr('selected-' + $newPopBtn.attr('data-type') + '-' + $newPopBtn.attr('name'));
                if ($newPopBtn.hasClass(dataToolAttr) || $newPopBtn.hasClass(selectedChkBoxes)) {
                    $newPopBtn.addClass('selected');
                    $newPopBtn.parent().addClass('selected');
                    $newPopBtn.children().addClass('selected');
                    $newPopBtn.parent().find('.select-state').addClass('selected');
                }

                if ($newPopBtn.attr('data-type') === 'radio-btn' && selectedRadioBtn === $newPopBtn.attr('tool')) {
                    $newPopBtn.addClass('selected');
                    $newPopBtn.parent().addClass('selected');
                    $newPopBtn.children().addClass('selected');
                    $newPopBtn.parent().find('.select-state').addClass('select-chked');
                }
                if ($.inArray(loopVar, disabledOptions) > -1) {
                    $buttonContainer.addClass('disabled').children().addClass('disabled').end().addClass('default-cursor');
                } else if ($newPopBtn.attr('data-type') === 'radio-btn') {
                    $buttonContainer.hover(hoverOnPopUpRadioButton, hoverOutPopUpRadioButton)
                        .on('touchstart click', _.bind(this._returnIndexOfSelectedRadioBtn, this))
                        .on('mouseover', _.bind(this.hoverOnPopUpButtonTrigger, this))
                        .on('mouseleave', _.bind(this.hoverOnPopUpButtonTrigger, this));
                } else {
                    $buttonContainer.hover(hoverOnPopUpButton, hoverOutPopUpButton)
                        .on('touchstart click', _.bind(this._returnIndexOfSelectedBtn, this))
                        .on('mouseover', _.bind(this.hoverOnPopUpButtonTrigger, this))
                        .on('mouseleave', _.bind(this.hoverOnPopUpButtonTrigger, this));
                }
            }

            popupWidth = (rowIndex > 0 ? POPUP_MAX_BUTTON_IN_ROW : colIndex) * (POPUP_BTN_WIDTH + POPUP_BTN_PADDING) + POPUP_BTN_PADDING; /*for bottom padding*/
            if (popupWidth < POP_UP_CHK_BOX_WIDTH) {
                popupWidth = POP_UP_CHK_BOX_WIDTH + POPUP_BTN_PADDING + POPUP_BTN_PADDING; /*for bottom padding*/
            }
            if (typeof popupHeight === "undefined") {
                popupHeight = (rowIndex + 1 + checkBoxCount) * (POPUP_BTN_HEIGHT + POPUP_BTN_PADDING) + POPUP_BTN_PADDING; /*for bottom padding*/
            }

            $popupMenuContainer.css({
                "width": popupWidth,
                "height": popupHeight
            });
            $popupMenu.css({
                "width": popupWidth - 2,
                "height": popupHeight
            });

            if (!triggerredOnExplore) {
                parentMenu.trigger('click', Number(parentMenu.attr('data-submenu-index')));
            }
            this._showPopupMenu();
            this.$('.menubar-button-more').off('click', this.hidePopupMenuFuncRef);
            this.$('.menubar-button-more.' + popupMenuFor).on('click', this.hidePopupMenuFuncRef);
        },
        "onGroupFocusIn": function(event) {
            var $target = $(event.target),
                $group = null;

            if ($target.is('.group-elem') || $target.parents().is('.group-elem')) {
                return;
            }
            $group = this.$('.popup-menu-holder .acc-group');
            _.each($group, _.bind(function(key, value) {
                this.enableGroupTab($(key).attr('id'), false);
            }, this));
        },

        "onGroupClick": function(event) {
            if (!$(event.target).hasClass('acc-group')) {
                return;
            }
            var groupId = $(event.delegateTarget).attr('id');

            this.enableGroupTab(groupId, true);
            this.setFocusOnPopupElem(groupId);
        },
        "enableGroupTab": function(groupId, isEnable) {
            var $groupElem = this.$('.' + groupId + '-elem'),
                accManager = this.accManager;

            _.each($groupElem, function(key, value) {
                accManager.enableTab($(key).attr('id'), isEnable);
            });
        },

        "onAccKeyDown": function(event) {
            if (!this.accManager) {
                return;
            }
            var $target = $(event.target).parents('.menu-item-container'),
                KeyCode = MathUtilities.Components.MenuBar.Models.Menu.KEY_CODE,
                curCode = event.keyCode,
                focusId = '';
            if (curCode === KeyCode.ESCAPE_KEY) {
                if ($target.length && $target.attr('data-group')) {
                    focusId = $target.attr('data-group');
                } else {
                    focusId = this.$('.popup-menu-holder').attr('data-popup-menu-for') + '-highlighter';
                }
                this.accManager.setFocus(focusId);
            }
        },

        "setFocusOnPopupElem": function(groupId, delay) {
            var $popupMenu = this.$('.popup-menu-holder'),
                $focusElem = null,
                accManager = this.accManager;
            if (groupId) {
                $focusElem = $popupMenu.find('.' + groupId + '-elem.selected');
            } else {
                $focusElem = $popupMenu.find('.acc-group, .menu-item-container.selected:not(\'.disabled\'), .menu-item-container:not(".disabled"):first');
            }
            if ($focusElem.length) {
                accManager.setFocus($focusElem.first().attr('id'), delay);
            }
        },

        //call after popup is append to dom element,
        // for accessibility
        "onPopUpOpen": function(screenId) {
            var $disabledElem = this.$('.popup-menu-holder').find('.menu-item-container.disabled'),
                accManager = this.accManager;
            this.loadScreen(this.$('.popup-menu-holder').attr('data-screenId'));

            _.each($disabledElem, function(key, value) {
                accManager.enableTab($(key).attr('id'), false);
            });
            this.setFocusOnPopupElem();
        },

        "loadScreen": function(screenId) {
            if (!(screenId && this.accManager && this.isAccessible)) {
                return;
            }
            this.accManager.loadScreen(screenId);
        },

        "unloadScreen": function(screenId) {
            if (!(screenId && this.accManager && this.isAccessible)) {
                return;
            }
            this.accManager.unloadScreen(screenId);
        },


        "hoverOnPopUpButtonTrigger": function(event) {
            var $target = this.$(event.currentTarget).find('.popup-menu-button');
            if (event.type === 'mouseover') {
                this.trigger('popupMenuButtonhover', $target.attr('tool'), 'hover');
            } else {
                this.trigger('popupMenuButtonhover', 'cursor', 'leave');
            }
            return false;
        },
        "_returnIndexOfSelectedRadioBtn": function(event) {
            var $target = this.$(event.currentTarget).find('.popup-menu-button'),
                $popupMenu = this.$('.popup-menu-holder'),
                $name = $target.attr('name'),
                parentMenu, $popupButton,
                fromKeyEvent = (!!event.isTrigger).toString();
            $popupButton = this.$('[name=' + $name + ']');
            parentMenu = this.$('.' + $popupMenu.attr('data-popup-menu-for') + ' .menubar-button');
            if ($popupButton.parent().find('.select-state').hasClass('select-chked')) {
                $popupButton.parent().find('.select-state').removeClass('select-chked');
            }
            $popupButton.removeClass('selected');
            $popupButton.parent().removeClass('selected');
            $target.addClass('selected');
            $target.parent().addClass('selected');
            $target.parent().find('.select-state').addClass('select-chked');
            parentMenu.attr('selected-radio-btn-' + $target.attr('name'), $target.attr('tool'));
            this.$el.trigger('menubarRadioBtnChanged', [$target.attr('name'), $target.attr('tool'), fromKeyEvent]);
        },
        "_returnIndexOfSelectedBtn": function(event) {
            var $target = this.$(event.currentTarget).find('.popup-menu-button'),
                $popupMenu = this.$('.popup-menu-holder');
            if ($target.attr('data-type') !== 'chk-box') {
                this.$('.select-state').removeClass('selected');
                this.$('.popup-menu-button').removeClass('selected');
                this.$('.popup-menu-button').parent().removeClass('selected');
                $target.addClass('selected');
                $target.parent().addClass('selected');
                $target.parent().find('.select-state').addClass('selected');
            } else {
                $target.toggleClass('selected');
                $target.children().toggleClass('selected');
            }

            this.$('.' + $popupMenu.attr('data-popup-menu-for') + ' .menubar-button')
                .attr('data-manager-trigger', !!event.isTrigger)
                .trigger('click', [this.$('.menu-item-container, .menubar-seperator').index($target.parent()), true])
                .attr('data-manager-trigger', false);

            return false; //to stop event propogation of touch
        },
        "addToolTip": function($btn, toolTipOption) {
            var options = {
                    "id": $btn.attr("id") + "-tooltip",
                    "text": "",
                    "position": "bottom",
                    "align": "center",
                    "tool-holder": $btn
                },
                tooltipView = null,
                startEvent = "mouseenter",
                endEvent = "mouseleave mousedown";
            if ("ontouchstart" in window) {
                if (MathUtilities.Components.Utils.Models.BrowserCheck.isMobile) {
                    startEvent = "touchstart";
                    endEvent = "touchend";
                } else {
                    //Touch and type device
                    startEvent += " touchstart";
                    endEvent += " touchend";
                }
            }
            if (typeof toolTipOption === 'object') {
                if (toolTipOption.text) {
                    options.text = toolTipOption.text;
                }
                if (toolTipOption.position) {
                    options.position = toolTipOption.position;
                }
                if (toolTipOption.align) {
                    options.align = toolTipOption.align;
                }

            } else {
                options.text = toolTipOption;
            }
            tooltipView = MathUtilities.Components.CustomTooltip.generateTooltip(options);

            $btn.on(startEvent, _.bind(tooltipView.showTooltip, tooltipView))
                .on(endEvent, _.bind(tooltipView.hideTooltip, tooltipView));
        }
    });

})(window.MathUtilities);
