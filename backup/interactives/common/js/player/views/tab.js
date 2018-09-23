
(function () {
    if (MathInteractives.Common.Player.Views.Tab) {
        return;
    }
    'use strict';

    /**
    * A customized Backbone.View that holds the logic behind the presentation of Tab.
    * @class TabView
    * @constructor
    * @namespace MathInteractives.Common.Player.Views
    * @module Common
    * @submodule Player
    * @extends Backbone.View
    */

    MathInteractives.Common.Player.Views.Tab = Backbone.View.extend({

        /**
        * Holds the model of path for preloading files
        *
        * @property _path
        * @type Object
        * @default null
        */
        _path: null,

        /**
        * Holds the index of the tab
        *
        * @property _tabNumber
        * @type Number
        * @default null
        */
        _tabNumber: null,

        /**
        * Holds the player view 
        *
        * @property player
        * @type Object
        * @default null
        */
        player: null,

        /*
        * Holds Player theme value
        * @property playerTheme
        * @type Number
        * @default null
        */
        playerTheme: null,

        /**
        * Initialization
        * @method initialize
        */
        initialize: function () {
            var self = this,
                id = this.model.get('id');

            this._tabNumber = parseInt(id.slice(id.search('player-tab-') + 11), 10);

            this.player = this.model.get('playerView');
            this._path = this.player.getPath();
            this.playerTheme = this.player.getPlayerThemeType();
            Backbone.listenTo(this.model, 'change:active', $.proxy(this._changeActivityAreaState, this));
            Backbone.listenTo(this.model, 'change:enable', $.proxy(this._enableDisableTab, this));
            Backbone.listenTo(this.model, this.model.ATTACH_EVENTS, $.proxy(this._attachEvents, this));
            self.render();
        },


        /**
        * Inserts css changes into DOM.
        * @method render
        * @chainable
        * @return {Object}
        */
        render: function () {

            this.$el.addClass('tabs tabs' + this._tabNumber)
                .attr({
                    'id': this.model.get('id')
                });

            var isAccessible = this.player.model.get('isAccessible'), Player = MathInteractives.Common.Player.Views.Player;

            if (isAccessible) {
                this.$el.addClass('math-utilities-manager-access');
            }

            if (this.playerTheme === Player.THEMES.THEME_1) {
                this._generateThreeSplice();
            }

            this._attachEvents(true);
            this._setDisabledSteps();
            return this;
        },



        /**
        * Set Min-width of Text div for IE Screenshot issue.
        * 
        * @method setMinWidthOfTextDiv
        */
        setMinWidthOfTextDiv: function setMinWidthOfTextDiv() {
            var $tab_mid = this.$('.tab-mid');
            $tab_mid.css('min-width', $tab_mid.width());
        },

        /**
        * Inserts 3 divs in main tab div for 3 splices
        * 
        * @method _generateThreeSplice
        */
        _generateThreeSplice: function _generateThreeSplice() {
            var $tab = this.$el,
                isStep = this.model.get('isStep');
            $('<div/>').addClass('tab-left').appendTo($tab);
            $('<div/>').addClass('tab-mid').appendTo($tab).html(this.model.get('text'));
            $('<div/>').addClass('tab-right').appendTo($tab);

            this.$('.tab-left, .tab-right').css({
                'background-image': 'url("' + this._path.getImagePath('player-lr') + '")'
            });
            this.$('.tab-mid').css({
                'background-image': 'url("' + this._path.getImagePath('player-m') + '")'
            });

            if (isStep) {
                var lastTabIndex = this.model.get('lastTabIndex'),
                    zIndex = lastTabIndex - this._tabNumber + 1;        // zIndex to keep triangular part over next step and + 1 to keep all steps above activity area container

                this.$('.tab-left').addClass('step-left')

                this.$('.tab-mid').addClass('step-mid');

                // Add number circle to step
                $('<div/>').addClass('step-circle').css({
                    'background-image': 'url("' + this._path.getImagePath('player-lr') + '")'
                }).html(this._tabNumber + 1).appendTo(this.$('.tab-mid'))

                this.$('.tab-right').addClass('step-right');

                // Use different image for right side of last step
                if (this._tabNumber === lastTabIndex) {
                    this.$('.tab-right').addClass('last-step');
                }

                $tab.css({ 'z-index': zIndex, 'border': 'none' });

                // Shift Steps backward behind previous
                if (this._tabNumber > 0) {
                    $tab.css({ 'margin-left': '-14px' });
                }
            }
        },

        /**
        * Insert single div 
        * 
        * @method _generateSingleSpliceTab
        */
        _generateSingleSpliceTab: function _generateSingleSpliceTab() {

            //Adding Text
            this.$el.html(this.model.get('text'));
        },

        /*
        * Attch tab events
        * @method _attachEvents
        * @param {bool} attach attach event when send true
        */
        _attachEvents: function (attach) {
            this.$el.off('click.playerTab click.playerSelectedTab mouseover.playerTab mouseout.playerTab');
            var self = this;
            this.touchStartTimer = null;
            if (attach) {

                this.$el.off('mouseover.playerTab').on('mouseover.playerTab', function () {
                    if (!self.model.get('enable')) {
                        return;
                    }
                    self._addClass('tab-hover');
                });

                this.$el.off('mouseleave.playerTab').on('mouseleave.playerTab', function () {
                    if (!self.model.get('enable')) {
                        return;
                    }
                    self._removeClass('tab-hover');
                });

                this.$el.off('click.playerTab').on('click.playerTab', $.proxy(this._clickHandler, this));
                MathInteractives.Common.Utilities.Models.Utils.EnableTouch($(this.$el), {
                    specificEvents: MathInteractives.Common.Utilities.Models.Utils.SPECIFIC_EVENTS.HOVER
                });

            }
            else {
                this.$el.on('click.playerSelectedTab', $.proxy(this._selectedClickHandler, this));
            }
        },

        /*
        * click handler for the current view, calls the parent function
        * @method _clickhandler
        */
        _clickHandler: function (event) {
            if (!this.model.get('enable')) {
                return;
            }
            this.player.tabClicked(this);
        },

        /*
        * click handler for the current view if tab is selected, calls the parent function
        * @method _selectedClickHandler
        */
        _selectedClickHandler: function (event) {
            this.player.selectedTabClicked(this);
        },

        /*
        * Change the state of the activity area linked to the tab. Update role attribute for acc text read by jaws.
        * @method _changeActivityAreaState
        */
        _changeActivityAreaState: function () {
            var activityArea = this.model.get('activityAreaModel');
            var isActive = this.model.get('active');
            var $el = this.$el;
            activityArea.set('show', isActive);
            //if active then setting it as currentTabView to the player model
            if (isActive === true) {
                this.player.model.set('currentTabView', this);
                this.player.model.set('currentActiveTab', parseInt(this.model.get('id').substr(this.model.get('id').length - 1, 1), 10));
                this._removeClass('tab-hover');
                this._addClass('tab-active');
                $el.find('.acc-read-elem').removeAttr('role');
                $el.addClass('tab-selected');
            }
            else if (isActive === false) {
                this._removeClass('tab-active tab-hover');
                $el.find('.acc-read-elem').attr('role', 'button');
                $el.removeClass('tab-selected');
            }
        },

        /*
        * Enable/ Disable tab on the basis of model p roperty change
        * @methos _enableDisableTab
        **/
        _enableDisableTab: function () {
            var isEnable = this.model.get('enable');
            if (isEnable) {
                this.$el.removeClass('step-disabled tab-disabled');
            }
            else {
                this.$el.addClass('tab-disabled');
            }
            this._attachEvents(isEnable);
        },

        /*
        * Sets initial enabled and disabled steps
        * 
        * @methos _setDisabledSteps
        **/
        _setDisabledSteps: function _setDisabledSteps() {
            var id = this.model.get('id'),
                currentStepNumber = this._tabNumber,
                initialEnabledIndices = this.model.get('enabledTabs'),
                isEnabled = false;
            if (initialEnabledIndices.length > 0) {
                var len = initialEnabledIndices.length;
                for (var i = 0; i < len; i++) {
                    if (initialEnabledIndices[i] === currentStepNumber) {
                        isEnabled = true;
                    }
                }
                if (!isEnabled) {
                    this.model.set('enable', false);
                    if (!this.$el.hasClass('tab-disabled')) {
                        this.$el.addClass('tab-disabled');
                    }
                }
            }
        },


        /*Adds class to el elements
        * @method _addClass
        * @param className {String} classnames
        */
        _addClass: function _addClass(className) {
            var Player = MathInteractives.Common.Player.Views.Player;
            switch (this.playerTheme) {
                case Player.THEMES.THEME_1:
                    {
                        this.$('.tab-right,.tab-left,.tab-mid').addClass(className);
                        break;
                    };
                case Player.THEMES.THEME_2:
                    {
                        this.$el.addClass(className);
                        break;
                    };
            }


        },

        /*Removes class to el elements
        * @method _removeClass
        * @param className {String} classnames
        */
        _removeClass: function _removeClass(className) {

            var Player = MathInteractives.Common.Player.Views.Player;
            switch (this.playerTheme) {
                case Player.THEMES.THEME_1:
                    {
                        this.$('.tab-right,.tab-left,.tab-mid').removeClass(className);
                        break;
                    };
                case Player.THEMES.THEME_2:
                    {
                        this.$el.removeClass(className);
                        break;
                    };
            }

        }
    }, {


});

})();