(function () {
    'use strict';

    /**
    * View for new EmptyModal
    *
    * @class EmptyModal
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Theme2.Views
    **/
    MathInteractives.Common.Components.Theme2.Views.EmptyModal = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Tooltip view for the close button
        * @property closeTooltipView
        * @type Object
        * @default null
        **/
        closeTooltipView: null,

        /**
        * Manager object
        * @property manager
        * @type Object
        * @default null
        **/
        manager: null,

        /**
        * Id prefix of the interactivity in which the control is used
        * @property idPrefix
        * @type String
        * @default null
        **/
        idPrefix: null,

        /**
        * Container of the empty-modal
        * @property emptyModalContainer
        * @type Object
        * @default null
        **/
        $emptyModalContainer: null,

        /**
        * Accessibility id of the dialog container
        * @property dialogAccId
        * @type String
        * @default null
        **/
        dialogAccId: null,

        /**
        * EmptyModal events and their corresponding handlers
        * @property events
        * @type Object
        **/
        events: {
            'click .empty-modal-close-button': '_closeButtonClickHandler'
        },

        /**
        * initialises the view and properties
        * @method initialize
        * @public
        **/
        initialize: function initialize() {
            var model = this.model;
            this.player = model.get('player');
            this.idPrefix = model.get('idPrefix');
            this.manager = model.get('manager');
            this.filePath = model.get('filePath');
            this.$emptyModalContainer = this.player.$el;
            this.dialogAccId = model.get('emptyModalId').replace(this.idPrefix, '');
            this.loadScreen('empty-modal-screen');
            this._render();
            this._attachEvents();
        },

        /**
        * Attaches touch events to close button
        * @method _attachEvents
        * @private
        **/
        _attachEvents: function _attachEvents() {
            var self = this,
            model = this.model,
            emptyModalId = model.get('emptyModalId');
            /*if ($.support.touch) {
                var $closeButton = this.$('#' + emptyModalId + '-close-button');
                // MathInteractives.Common.Utilities.Models.Utils.addTouchAndHoldHandler(this, $closeButton, 600, this._onCloseTouchStart, this._onCloseTouchEnd);
            }*/

            this.$('#' + emptyModalId + '-acc-elem').off('keydown').on('keydown', function (event) {
                var TAB_KEY_CODE = 9;
                if (event.keyCode === TAB_KEY_CODE && event.shiftKey === false) {
                    self.setFocus(self.model.get('bodyElemAccId'));
                    event.preventDefault();
                }
            });

            this.$el.off('keydown').on('keydown', '#' + this.idPrefix + model.get('bodyElemAccId') + '-acc-elem', function (event) {
                var TAB_KEY_CODE = 9;
                if (event.keyCode === TAB_KEY_CODE && event.shiftKey === true) {
                    self.setFocus(self.dialogAccId);
                    event.preventDefault();
                }
            });
        },

        /**
        * Renders the empty-modal view
        * @method _render
        * @private
        **/
        _render: function _render() {
            var dialogAccObj = null,
                closeButtonAccObj = null,
                model = this.model,
                emptyModalId = model.get('emptyModalId');

            this.$emptyModalContainer.append(MathInteractives.Common.Components.templates.theme2EmptyModal({
                'emptyModalId': emptyModalId
            }).trim());
            this.$el = this.player.$el.find('#' + emptyModalId + '-modal');
            this.el = this.$el.get(0);

            dialogAccObj = {
                'elementId': this.dialogAccId,
                'tabIndex': 10,
                'acc': this.model.get('dialogAccText')
            };
            this.createAccDiv(dialogAccObj);

            if (this.model.get('closeButtonVisible')) {
                var closeTooltipProps = {
                    path: this.filePath,
                    manager: this.manager,
                    _player: this.player,
                    idPrefix: this.idPrefix,
                    id: this.idPrefix + 'close-tooltip',
                    elementEl: emptyModalId + '-close-button',
                    text: this.getMessage('empty-modal-close-button-tooltip-text', 0),
                    type: model.get('closeButtonTooltipType'),
                    arrowType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE
                };
                this.$('#' + emptyModalId + '-close-button').html('X');
                this.closeTooltipView = MathInteractives.global.Theme2.Tooltip.generateTooltip(closeTooltipProps);

                closeButtonAccObj = {
                    'elementId': this.dialogAccId + '-close-button',
                    'tabIndex': 4895,
                    'acc': this.getAccMessage('empty-modal-close-button-tooltip-text', 0),
                    'role': 'button'
                };
                this.createAccDiv(closeButtonAccObj);
            }
            else {
                this.$('#' + emptyModalId + '-close-button').remove();
            }
            this.showEmptyModel();
        },

        /**
        * Sets the view width-height and position in the middle-center of the container tab
        * @method adjustBounds
        * @public
        **/
        adjustBounds: function adjustBounds() {
            var containerWidth = this.$emptyModalContainer.width(),
                containerHeight = this.$emptyModalContainer.height(),
                $dialog = this.$('#' + this.model.get('emptyModalId')),
                left = parseInt((containerWidth - $dialog.width()) / 2),
                top = parseInt((containerHeight - $dialog.height()) / 2);
            $dialog.css('left', left).css('top', top);
            this.updateFocusRect(this.dialogAccId);
        },

        /**
        * Sets the empty-modal's body element
        * @method setBody
        * @param {Object} emptyModalBody Empty-modal body DOM element
        * @public
        **/
        setBody: function setBody(emptyModalBody) {
            this.$('#' + this.model.get('emptyModalId') + '-body').html(emptyModalBody);
            this.adjustBounds();
            this.focusDialogBox();
        },

        /**
        * Gets the empty-modal's body element
        * @method getBody
        * @return {Object} Empty-modal body DOM element
        * @public
        **/
        getBody: function getBody() {
            return this.$('#' + this.model.get('emptyModalId') + '-body');
        },

        /**
        * Sets the empty-modal's action panel element
        * @method setActionPanel
        * @param {Object} emptyModalActionPanel Empty-modal action panel DOM element
        * @return {Object} jquery object of action panel
        * @public
        **/
        setActionPanel: function setActionPanel(emptyModalActionPanel) {
            return this.$('#' + this.model.get('emptyModalId') + '-action-panel').html(emptyModalActionPanel);
        },

        /**
        * Gets the empty-modal's action panel element
        * @method getActionPanel
        * @return {Object} Empty-modal action panel DOM element
        * @public
        **/
        getActionPanel: function getActionPanel() {
            return this.$('#' + this.model.get('emptyModalId') + '-action-panel');
        },

        /**
        * Sets the focus to dialog container
        * @method focusDialogBox
        * @public
        **/
        focusDialogBox: function focusDialogBox() {
            this.setFocus(this.dialogAccId);
        },

        /**
        * Displays the modal box
        * @method showEmptyModel
        * @public
        **/
        showEmptyModel: function showEmptyModel() {
            this.player.setModalPresent(true);
            this.$el.show();
            this.adjustBounds();
            this.focusDialogBox();
        },

        /**
        * Hides the modal box
        * @method hideEmptyModel
        * @public
        **/
        hideEmptyModel: function hideEmptyModel() {
            this.player.setModalPresent(false);
            this.$el.hide();
        },

        /**
        * Removes the modal box on click of a close button
        * @method _closeButtonClickHandler
        * @param {Object} event Event object
        * @private
        **/
        _closeButtonClickHandler: function _closeButtonClickHandler(event) {
            this.trigger(MathInteractives.global.Theme2.EmptyModal.EVENTS.EMPTY_MODAL_CLOSED);
            this.$('#' + this.closeTooltipView.elementEl).trigger('mouseleave.tooltip');
            this.destroyEmptyModel();
        },

        /**
        * Shows the close button's tooltip
        * @method _onCloseTouchStart
        * @param {Object} event Event object
        * @private
        **/
        /*_onCloseTouchStart: function _onCloseTouchStart(event) {
            this.closeTooltipView.showTooltip();
        },*/

        /**
        * Hides the close button's tooltip
        * @method _onCloseTouchEnd
        * @param {Object} event Event object
        * @private
        **/
        /*_onCloseTouchEnd: function _onCloseTouchEnd(event) {
            this.closeTooltipView.hideTooltip();
        },*/

        /**
        * Removes the modal box
        * @method destroyEmptyModel
        * @public
        **/
        destroyEmptyModel: function destroyEmptyModel() {
            this.player.setModalPresent(false);
            this.remove();
        }

    }, {

        /**
        * Constant signifying empty modal close event
        * @property EVENTS
        * @static
        **/
        EVENTS: {
            EMPTY_MODAL_CLOSED: 'EMPTY_MODAL_CLOSED'
        },

        /**
        * Initializes the empty-modal model with the specified properties, creates the empty-modal view based on
        * the empty-modal model and returns the empty-modal view
        * @method createEmptyModal
        * @param emptyModalProps {Object} Empty-modal properties
        * @return Newly created empty-modal view if the properties are passed or null otherwise
        * @static
        **/
        createEmptyModal: function createEmptyModal(emptyModalProps) {
            var emptyModalModel = null,
                emptyModalView = null;
            if (emptyModalProps) {
                emptyModalModel = new MathInteractives.Common.Components.Theme2.Models.EmptyModal(emptyModalProps);
                emptyModalView = new MathInteractives.Common.Components.Theme2.Views.EmptyModal({ el: '#' + emptyModalProps.emptyModalId + '-modal', model: emptyModalModel });
            }
            return emptyModalView;
        }
    });
    MathInteractives.global.Theme2.EmptyModal = MathInteractives.Common.Components.Theme2.Views.EmptyModal;
})(window.MathInteractives);
