(function () {
    'use strict';

    /**
    * View for Intro Box
    *
    * @class IntroBox
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.CheckBox = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * containerID
        * @property containerId
        * @type string
        * @defaults null
        */
        containerId: null,

        /**
        * player of the interactive
        * @property player
        * @type object
        * @defaults null
        */
        player: null,

        /**
        * manager of the interactive
        * @property manager
        * @type object
        * @defaults null
        */
        manager: null,

        /**
        * filepath of the interactive
        * @property filePath
        * @type string
        * @defaults null
        */
        filePath: null,

        /**
        * idPrefix of the interactive
        * @property idPrefix
        * @type string
        * @defaults null
        */
        idPrefix: null,

        /**
        * currnetState of the checkbox
        * @property currentState
        * @type string
        * @defaults null
        */
        currentState: null,

        /**
        * lable of checkbox
        * @property filePath
        * @type string
        * @defaults null
        */
        lable: null,

        /**
        * Calls initialize
        * @method initialize
        **/
        initialize: function () {
            this.containerId = this.model.get('containerId');
            this.player = this.model.get('player');
            this.manager = this.model.get('manager');
            this.filePath = this.model.get('filePath');
            this.idPrefix = this.model.get('idPrefix');
            this.label = this.model.get('label');
            if (this.model.get('checkUncheck')) {
                this.currentState = MathInteractives.Common.Components.Views.CheckBox.CHECKED_ENABLE
            } else {
                this.currentState = MathInteractives.Common.Components.Views.CheckBox.UNCHECKED_ENABLE
            }
            this.render();
            this._bindTouchEvents();
        },

        /**
        * Renders the checkbox component
        * @method render
        **/
        render: function () {
            var data = { containerID: this.containerId };
            var templateHtml = MathInteractives.Common.Components.templates.checkBox(data);
            this.$el.append(templateHtml.trim());
            this.$el.find('.check-box-inner-icon-common-componenet').css({
                'background-image': 'url("' + this.filePath.getImagePath('check-box-states') + '")'
            });
            this.$el.find('.check-box-inner-label-common-componenet').html(this.label);
            //this.currentState = MathInteractives.Common.Components.Views.InputBox.UNCHECKED_DISABLE;
            this._setCheckBoxState(this.currentState);
        },

        /**
        * bind events on the view
        * @method events
        **/
        events: function () {
            var events = {
                'mouseover': '_mouseover_check_box_outer_common_componenet',
                'mouseout': '_mouseout_check_box_outer_common_componenet',
                'click': '_click_check_box_outer_common_componenet',
                'mouseover .check-box-icon-cover-common-componenet,.check-box-inner-label-common-componenet': '_mouseover_inner_componenets',
                'mouseout .check-box-icon-cover-common-componenet,.check-box-inner-label-common-componenet': '_mouseout_inner_componenets'
            }

            return events;
        },

        _bindTouchEvents: function _bindTouchEvents(){
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(this.$el);
            //TODO: if facing isses: bind event for inner components
        },




        /**
        * Shows hand-cursor if the check-box is enabled
        * @method _mouseover_inner_componenets
        * @private
        */
        _mouseover_inner_componenets: function (event) {
            var currentNamespace = MathInteractives.Common.Components.Views.CheckBox,
                $innerCheckboxContainer = $(event.currentTarget).parent().find('.check-box-inner-icon-common-componenet');
            if ($innerCheckboxContainer.hasClass('check-box-' + currentNamespace.CHECKED_ENABLE) || $innerCheckboxContainer.hasClass('check-box-' + currentNamespace.UNCHECKED_ENABLE)) {
                $(event.currentTarget).addClass('hand-cursor');
            }
        },

        /**
        * Removes hand-cursor when user hovers out
        * @method _mouseover_inner_componenets
        * @private
        */
        _mouseout_inner_componenets: function (event) {
            if ($(event.currentTarget).hasClass('hand-cursor')) {
                $(event.currentTarget).removeClass('hand-cursor');
            }
        },
        /**
        * mouseover event handler
        * @method _mouseover_check_box_outer_common_componenet
        **/
        _mouseover_check_box_outer_common_componenet: function (e) {
            var targetEle = $(e.currentTarget),
                iconEle = targetEle.find('.check-box-inner-icon-common-componenet'),
                staticDataHolder = MathInteractives.Common.Components.Views.CheckBox;

            if (this.currentState === staticDataHolder.UNCHECKED_ENABLE) {
                iconEle.removeAttr('class').addClass('check-box-inner-icon-common-componenet check-box-unchecked-hover');
            }

            if (this.currentState === staticDataHolder.CHECKED_ENABLE) {
                iconEle.removeAttr('class').addClass('check-box-inner-icon-common-componenet check-box-checked-hover');
            }
        },

        /**
        * mouseout event handler
        * @method _mouseout_check_box_outer_common_componenet
        **/
        _mouseout_check_box_outer_common_componenet: function (e) {
            var targetEle = $(e.currentTarget),
                iconEle = targetEle.find('.check-box-inner-icon-common-componenet'),
                staticDataHolder = MathInteractives.Common.Components.Views.CheckBox;

            if (this.currentState === staticDataHolder.UNCHECKED_ENABLE) {
                iconEle.removeAttr('class').addClass('check-box-inner-icon-common-componenet check-box-' + staticDataHolder.UNCHECKED_ENABLE);
            }

            if (this.currentState === staticDataHolder.CHECKED_ENABLE) {
                iconEle.removeAttr('class').addClass('check-box-inner-icon-common-componenet check-box-' + staticDataHolder.CHECKED_ENABLE);
            }

        },

        /**
        * click event handler
        * @method _click_check_box_outer_common_componenet
        **/
        _click_check_box_outer_common_componenet: function (e) {
            var targetEle = $(e.currentTarget),
                iconEle = targetEle.find('.check-box-inner-icon-common-componenet'),
                staticDataHolder = MathInteractives.Common.Components.Views.CheckBox;

            if (this.currentState === staticDataHolder.UNCHECKED_ENABLE) {
                this.currentState = staticDataHolder.CHECKED_ENABLE;
                this._setCheckBoxState(this.currentState);
                this.trigger(this.containerId + staticDataHolder.CHECK_EVENT_NAME, this);
                return;
            }

            if (this.currentState === staticDataHolder.CHECKED_ENABLE) {
                this.currentState = staticDataHolder.UNCHECKED_ENABLE;
                this._setCheckBoxState(this.currentState);
                this.trigger(this.containerId + staticDataHolder.UNCHECK_EVENT_NAME, this);
                return;
            }

        },

        /**
        * set the state of the checkbox
        * @method _setCheckBoxState
        **/
        _setCheckBoxState: function (state) {

            var staticDataHolder = MathInteractives.Common.Components.Views.CheckBox,
                ICONele = this.$el.find('.check-box-inner-icon-common-componenet');

            this.currentState = state;

            switch (state) {

                case staticDataHolder.UNCHECKED_ENABLE:
                    {
                        ICONele.removeAttr('class').addClass('check-box-inner-icon-common-componenet check-box-' + staticDataHolder.UNCHECKED_ENABLE);
                        break;
                    }

                case staticDataHolder.CHECKED_ENABLE:
                    {
                        ICONele.removeAttr('class').addClass('check-box-inner-icon-common-componenet check-box-' + staticDataHolder.CHECKED_ENABLE);
                        break;
                    }

                case staticDataHolder.UNCHECKED_DISABLE:
                    {
                        ICONele.removeAttr('class').addClass('check-box-inner-icon-common-componenet check-box-' + staticDataHolder.UNCHECKED_DISABLE);
                        break;
                    }

                case staticDataHolder.CHECKED_DISABLE:
                    {
                        ICONele.removeAttr('class').addClass('check-box-inner-icon-common-componenet check-box-' + staticDataHolder.CHECKED_DISABLE);
                        break;
                    }

            }
        },

        /*public methods*/

        enableCheckBox: function () {

            var staticDataHolder = MathInteractives.Common.Components.Views.CheckBox,
                self = this;

            self.enableTab(self.model.get('accId'), true);

            if (self.currentState === staticDataHolder.UNCHECKED_DISABLE) {
                self._setCheckBoxState(staticDataHolder.UNCHECKED_ENABLE);
            } else if (self.currentState === staticDataHolder.CHECKED_DISABLE) {
                self._setCheckBoxState(staticDataHolder.CHECKED_ENABLE);
            }

        },
        disableCheckBox: function () {
            var staticDataHolder = MathInteractives.Common.Components.Views.CheckBox,
                self = this;

            self.enableTab(this.model.get('accId'), false);

            if (self.currentState === staticDataHolder.UNCHECKED_ENABLE) {
                self._setCheckBoxState(staticDataHolder.UNCHECKED_DISABLE);
            } else if (self.currentState === staticDataHolder.CHECKED_ENABLE) {
                self._setCheckBoxState(staticDataHolder.CHECKED_DISABLE);
            }
        },
        checkTheCheckBox: function () {
            var staticDataHolder = MathInteractives.Common.Components.Views.CheckBox,
                self = this;

            if (self.currentState === staticDataHolder.UNCHECKED_ENABLE) {
                self._setCheckBoxState(staticDataHolder.CHECKED_ENABLE);
            } else if (self.currentState === staticDataHolder.UNCHECKED_DISABLE) {
                self._setCheckBoxState(staticDataHolder.CHECKED_DISABLE);
            }
        },
        uncheckTheCheckBox: function () {
            var staticDataHolder = MathInteractives.Common.Components.Views.CheckBox,
                self = this;

            if (self.currentState === staticDataHolder.CHECKED_ENABLE) {
                self._setCheckBoxState(staticDataHolder.UNCHECKED_ENABLE);
            } else if (self.currentState === staticDataHolder.CHECKED_DISABLE) {
                self._setCheckBoxState(staticDataHolder.UNCHECKED_DISABLE);
            }
        }

        /*public methods END*/
    }, {

        /*INTERNAL STATES*/

        UNCHECKED_ENABLE: 'unchecked-enable',

        CHECKED_ENABLE: 'checked-enable',

        UNCHECKED_DISABLE: 'unchecked-disable',

        CHECKED_DISABLE: 'checked-disable',

        /*INTERNAL STATES*/

        /*EVETNS*/

        CHECK_EVENT_NAME: 'checkbox-check',

        UNCHECK_EVENT_NAME: 'checkbox-uncheck',

        DISABLE_EVENT_NAME: 'checkbox-disable',

        ENABLE_EVENT_NAME: 'checkbox-enable',

        /*EVENTS*/


        createCheckBox: function (checkBoxOptions) {
            if (checkBoxOptions.containerId === null) {
                console.log('No id specified');
                return;
            }

            var checkBoxModel, checkBoxView, id = '#' + checkBoxOptions.containerId;
            checkBoxModel = new MathInteractives.Common.Components.Models.CheckBox(checkBoxOptions);
            checkBoxView = new MathInteractives.Common.Components.Views.CheckBox({ el: id, model: checkBoxModel });

            return checkBoxView;
        }

    });
    MathInteractives.global.CheckBox = MathInteractives.Common.Components.Views.CheckBox;
})();
