(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Views.EditPopup) {
        return;
    }
    var eventManagerModel = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer.EVENT_MANAGER_MODEL,
        mainModelNameSpace = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer,
        isMobile = MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile,
        viewClass;
    /*
     *
     *   [[D E S C R I P T I O N]]
     *
     * @class GalleryShapeSlicer
     * @namespace MathInteractives.Interactivities.ShapeSlicer.Views
     * @extends MathInteractives.Common.Player.Views.Base
     * @constructor
     */

    MathInteractives.Common.Interactivities.ShapeSlicer.Views.EditPopup = MathInteractives.Common.Player.Views.Base.extend({/**
         * Index of image for which popup is shown
         * @attribute index
         * @type Object
         * @default null
         */
        index: null,

        /**
         * Event manager
         * @attribute eventManager
         * @type Object
         * @default null
         */
        eventManager: null,
        /**
         * Paper.js scope object
         * @property paperScope
         * @type Object
         * @default null
         * @public
         **/
        paperScope: null,

        /**
         * Initialises GalleryShapeSlicer
         * @method initialize
         */
        initialize: function (options) {
            this.initializeDefaultProperties();
            this.index = options.index;
            this.eventManager = options.eventManager;
            this.player.off(MathInteractives.global.PlayerModel.BEFORE_TAB_SWITCH_EVENT).once(MathInteractives.global.PlayerModel.BEFORE_TAB_SWITCH_EVENT, this.closeModal, this);
            //this.eventManager.off(eventManagerModel.TAB_CHANGED, this.closeModal).on(eventManagerModel.TAB_CHANGED, this.closeModal, this);
            this.render();
        },

        /**
         * Renders the view of explore tab
         *
         * @method render
         * @private
         **/
        render: function render() {
            this.generateEditPopup();
            this.bindEvents();
        },

        /**
         * Binds events
         * @method bindEvents
         * @public
         */
        bindEvents: function () {
            var self = this,
                $modal = this.$('.edit-pop-up-modal'),
                $popupContainer = this.$('.edit-popup-container');

            this.$('.gallery-close-button, .edit-button, .delete-button').off('.popup-buttons');

            this.$('.gallery-close-button').on('click.popup-buttons', function (event) {
                self.eventManager.trigger(eventManagerModel.SET_FOCUS, self.index);
                self.closeModal();
            });
            this.$('.edit-button').on('click.popup-buttons', function (event) {
                self._onEditClick();
            });
            this.$('.delete-button').on('click.popup-buttons', function (event) {
                self._onDeleteClick();
            });

            if (isMobile) {
                $popupContainer.off('click.container-click', '.edit-image-container, .gallery-close-button, .edit-button, .delete-button')
                .on('click.container-click', '.edit-image-container, .gallery-close-button, .edit-button, .delete-button', function (event) {
                    self._onContainerClick(event);
                });
                $modal.off('click.modal-click').on('click.modal-click', function (event) {
                    self._onModalClick();
                });
            } else {
                $popupContainer.off('mousedown.container-click', '.edit-image-container, .gallery-close-button, .edit-button, .delete-button')
                .on('mousedown.container-click', '.edit-image-container, .gallery-close-button, .edit-button, .delete-button', function (event) {
                    self._onContainerClick(event);
                });
                $modal.off('mousedown.modal-click').on('mousedown.modal-click', function (event) {
                    if (event.which === 1) {
                        self._onModalClick();
                    }
                });
            }
        },

        /**
         * generates edit popup
         * @method generateEditPopup
         * @public
         */
        generateEditPopup: function () {
            var options = {
                idPrefix: this.idPrefix
            };

            this.$el.append(MathInteractives.Common.Interactivities.ShapeSlicer.templates.editPopup(options).trim());
            var $player = this.player.$el;
            //append el to DOM
            $player.append(this.el);
            this._setPaperScope();
            this.generateButtons();
            this._setBackGround();
            this.handleEditPopupAcc();
        },

        /**
         * Set up the paper-scope.
         * @method _setupPaperScope
         * @private
         */
        _setPaperScope: function () {
            this.paperScope = new paper.PaperScope();
            this.paperScope.setup(this.idPrefix + 'edit-popup-canvas');
            this.paperScope.activate();
        },

        /**
         * Sets back ground
         * @method _setBackGround
         * @private
         */
        _setBackGround: function () {
            var currentIndex = this.index,
                $imageContainer = this.$('#' + this.idPrefix + 'edit-image-container'),
                galleryObject = this.model.get('galleryObject'),
                backGroundUrl = null,
                cssClass = null;
            cssClass = galleryObject[currentIndex].backType.TYPE_NAME;
            this._loadShapes(currentIndex);
            $imageContainer.addClass(cssClass);
        },

        /**
         * Loads shapes
         * @method _loadShapes
         * @private
         * @param {Number} currentIndex Index of image selected
         */
        _loadShapes: function (currentIndex) {
            this.paperScope.activate();
            var self = this,
                galleryObject = this.model.get('galleryObject'),
                currentGalleryIndex =
                currentIndex,
                shapeData = galleryObject[currentGalleryIndex].shapeData,
                position;
            if (this.allShapesGroup) {
                this.allShapesGroup.remove();
            }
            this.allShapesGroup = new this.paperScope.Group();
            this.allShapesGroup.importJSON(shapeData);
            position = this.allShapesGroup.position;
            position.x = position.x * viewClass.SCALE_FACTOR;
            position.y = position.y * viewClass.SCALE_FACTOR;
            this.allShapesGroup.scale(viewClass.SCALE_FACTOR);

            this.paperScope.view.draw();
        },

        /**
         * generates buttons
         * @method generateButtons
         * @public
         */
        generateButtons: function () {
            this.closeBtnView = MathInteractives.global.Theme2.ButtonExtended.generateButton({
                'player': this.player,
                'manager': this.manager,
                'path': this.filePath,
                'idPrefix': this.idPrefix,
                'data': {
                    'id': this.idPrefix + 'gallery-close-button',
                    'type': MathInteractives.global.Theme2.Button.TYPE.FA_ICONTEXT,
                    'text': this.getMessage('gallery-modal-text', 0),
                    'icon': {
                        'faClass': this.getFontAwesomeClass('close'),
                        'fontSize': 20,
                        'fontColor': '#2D3A3A',
                        'height': 23,
                        'width': 14
                    },
                    'baseClass': 'edit-popup-button shape-slicer-white-button-base'
                }
            });
            this.editBtnView = MathInteractives.global.Theme2.ButtonExtended.generateButton({
                'player': this.player,
                'manager': this.manager,
                'path': this.filePath,
                'idPrefix': this.idPrefix,
                'data': {
                    'id': this.idPrefix + 'edit-button',
                    'type': MathInteractives.global.Theme2.Button.TYPE.FA_ICONTEXT,
                    'text': this.getMessage('gallery-modal-text', 1),
                    'icon': {
                        'faClass': this.getFontAwesomeClass('fixed-edit-pencil'),
                        'fontColor': '#2D3A3A',
                        'height': 24,
                        'width': 15
                    },
                    'baseClass': 'edit-popup-button shape-slicer-white-button-base'
                }
            });
            this.deleteBtnView = MathInteractives.global.Theme2.ButtonExtended.generateButton({
                'player': this.player,
                'manager': this.manager,
                'path': this.filePath,
                'idPrefix': this.idPrefix,
                'data': {
                    'id': this.idPrefix + 'delete-button',
                    'type': MathInteractives.global.Theme2.Button.TYPE.FA_ICONTEXT,
                    'text': this.getMessage('gallery-modal-text', 2),
                    'icon': {
                        'faClass': this.getFontAwesomeClass('fixed-delete'),
                        'fontColor': '#2D3A3A',
                        'height': 24,
                        'width': 14
                    },
                    'baseClass': 'edit-popup-button shape-slicer-white-button-base'
                }
            });
        },

        /**
         * On delete click
         * @method _onDeleteClick
         * @private
         */
        _onDeleteClick: function () {
            //  this._generateDeletePopup();
            this._deleteCurrentImage();
        },

        /**
         * Deletes the current image
         * @method _deleteCurrentImage
         * @private
         */
        _deleteCurrentImage: function () {
            var currentIndex = this.index,
                galleryObject = this.model.get('galleryObject'),
                galleryObjectLength = galleryObject.length,
                newIndex;

            //TO DO: Change the number of shapes from model or static wherever it is stored
            if (galleryObjectLength === mainModelNameSpace.MAX_GALLERY_LENGTH) {
                this.model.set('isSaveImageButtonEnabled', true);
            }

            galleryObject.splice(currentIndex, 1);
            this.model.set('galleryObject', galleryObject);
            newIndex = galleryObject.length;
            this.model.set('currentGalleryIndex', newIndex);
            this.eventManager.trigger(eventManagerModel.DELETE_IMAGE, currentIndex);

            if (galleryObjectLength - 1 === currentIndex) {
                this.eventManager.trigger(eventManagerModel.SET_FOCUS, (this.index - 1));
            }
            else {
                this.eventManager.trigger(eventManagerModel.SET_FOCUS, this.index);
            }

            this.closeModal();
       

        },

        /**
         * On edit click
         * @method _onEditClick
         * @private
         */
        _onEditClick: function () {
            var saveBtnState = this.model.get('isSaveImageButtonEnabled');
            if (saveBtnState === true) {
                this._generateEditPopup();
            } else {
                this._onEdit();
            }
        },

        /**
         * On edit
         * @method _onEdit
         * @private
         */
        _onEdit: function () {
            var currentIndex = this.index;
            this.model.set('currentGalleryIndex', currentIndex);
            this.eventManager.trigger(eventManagerModel.EDIT_IMAGE);
            this.closeModal();
        },

        /**
         * generates edit popup
         * @method _generateEditPopup
         * @private
         */
        _generateEditPopup: function () {
            var popupOptions = {
                manager: this.manager,
                path: this.filePath,
                player: this.player,
                idPrefix: this.idPrefix,
                title: this.getMessage('edit-image-popup', 0),
                accTitle: this.getMessage('edit-popup-title', 0),
                text: this.getMessage('edit-image-popup', 1),
                accText: this.getMessage('edit-image-popup', 1),
                type: MathInteractives.global.Theme2.PopUpBox.CONFIRM,
                buttons: [{
                    id: 'ok-button',
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    text: this.getMessage('popup-button-text', 0),
                    response: {
                        isPositive: true,
                        buttonClicked: 'ok-button'
                    }
                }, {
                    id: 'cancel-button',
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    text: this.getMessage('popup-button-text', 1),
                    response: {
                        isPositive: false,
                        buttonClicked: 'cancel-button'
                    }
                }],
                closeCallback: {
                    fnc: function (response) {
                        if (response.isPositive) {
                            this._onEdit();
                        }
                        else {
                            this.setFocus('edit-button');
                        }
                    },
                    scope: this
                }
            };
            this.editPopup = MathInteractives.global.Theme2.PopUpBox.createPopup(popupOptions);
        },

        /**
         * generates delete popup
         * @method _generateDeletePopup
         * @private
         */
        _generateDeletePopup: function () {
            var popupOptions = {
                manager: this.manager,
                path: this.filePath,
                player: this.player,
                idPrefix: this.idPrefix,
                title: this.getMessage('delete-image-popup', 0),
                accTitle: this.getMessage('delete-image-popup', 0),
                text: this.getMessage('delete-image-popup', 1),
                accText: this.getMessage('delete-image-popup', 1),
                type: MathInteractives.global.Theme2.PopUpBox.CONFIRM,
                buttons: [{
                    id: 'ok-button',
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    text: this.getMessage('popup-button-text', 0),
                    response: {
                        isPositive: true,
                        buttonClicked: 'ok-button'
                    }
                }, {
                    id: 'cancel-button',
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    text: this.getMessage('popup-button-text', 1),
                    response: {
                        isPositive: false,
                        buttonClicked: 'cancel-button'
                    }
                }],
                closeCallback: {
                    fnc: function (response) {
                        if (response.isPositive) {
                            this._deleteCurrentImage();
                        }
                    },
                    scope: this
                }
            };
            this.editPopup = MathInteractives.global.Theme2.PopUpBox.createPopup(popupOptions);
        },

        /**
         * On modal click
         * @method _onModalClick
         * @private
         * @param {Object} event Event object
         */
        _onModalClick: function (event) {
            this.closeModal();
        },

        /**
         * Destroys variables and clears memory
         * @method destroy
         * @public
         */
        destroy: function () {
            delete this.index;
            delete this.eventManager;
            delete this.paperScope;
            //delete this.player;
            delete this.manager;
            delete this.filePath;
            delete this.idPrefix;
            delete this.allShapesGroup;
            delete this.closeBtnView;
            delete this.deleteBtnView;
            delete this.editBtnView;
        },
        /**
         * Closes modal
         * @method closeModal
         * @public
         */
        closeModal: function () {
            //this.emptyModalView.remove();
            this.player.off(MathInteractives.global.PlayerModel.BEFORE_TAB_SWITCH_EVENT, this.closeModal);
            this.unbindEditPopupAcc();
            this.player.enableHelpElement('in-out-cards-0-wrapper', 0, true);
            this.player.enableHelpElement('gallery-tab-back-button', 0, true);
            this.player.enableHelpElement('gallery-tab-direction-text-container-direction-text-buttonholder', 0, true);

            this.destroy();
            this.remove();
            this.unbind();
            delete this;
        },
        /**
         * On container click
         * @method _onContainerClick
         * @private
         * @param {Object} event Event object
         */
        _onContainerClick: function (event) {
            event.stopPropagation();
        },

        handleEditPopupAcc: function handleEditPopupAcc() {
            var $btnSave = this.player.$('.custom-btn-type-save');
            if ($btnSave.length === 0) {
                this.player.$('.custom-btn-type-help').on('keydown.editPopup', $.proxy(this._setFocusToLastBtn, this));
            } else {
                $btnSave.on('keydown.editPopup', $.proxy(this._setFocusToLastBtn, this));
            }
            this.player.$('.header-subtitle').on('keydown.editPopup', $.proxy(this._setFocusToFirstBtn, this));
            this.$('.edit-image-container').on('keydown.editPopup', $.proxy(this._setFocusToHeaderSubtitle, this));
            this.$('.delete-button').on('keydown.editPopup', $.proxy(this._setFocusToHeaderBtn, this));
        },

        _setFocusToLastBtn: function _setFocusToLastBtn(event) {
            if (event.keyCode === 9 && event.shiftKey) {
                event.preventDefault();
                this.setFocus('delete-button');
            }
        },

        _setFocusToFirstBtn: function _setFocusToFirstBtn(event) {
            if (event.keyCode === 9 && !event.shiftKey) {
                event.preventDefault();
                this.setFocus('edit-image-container');
            }
        },

        _setFocusToHeaderSubtitle: function _setFocusToHeaderSubtitle(event) {
            if (event.keyCode === 9 && event.shiftKey) {
                event.preventDefault();
                this.setFocus('header-subtitle');
            }
        },

        _setFocusToHeaderBtn: function _setFocusToHeaderBtn(event) {
            if (event.keyCode === 9 && !event.shiftKey) {
                event.preventDefault();
                var $btnSave = this.player.$('.custom-btn-type-save');
                if ($btnSave.length === 0) {
                    this.setFocus('help-btn');
                } else {
                    this.setFocus('save-btn');
                }
            }
        },

        unbindEditPopupAcc: function unbindEditPopupAcc() {
            this.player.$('.custom-btn-type-help,.custom-btn-type-save,.header-subtitle,.delete-button,.edit-image-container').off('.editPopup');
        }
    }, {
        /**
         * Creates edit modal
         * @method createEditModal
         * @public
         * @param {Object} options Holdes properties to be pass to Edit mdal view
         * @returns {Object} Backbone View
         */
        createEditModal: function (options) {
            var model = options.model,
                el = options.el,
                index = options.index,
                editModalView = new MathInteractives.Common.Interactivities.ShapeSlicer.Views.EditPopup({
                    el: el,
                    model: model,
                    index: index,
                    eventManager: options.eventManager
                });

            return editModalView;
        },

        /**
         * Scale factor by which images to be scale
         * @attribute SCALE_FACTOR
         * @type Number
         * @default 0.7
         */
        SCALE_FACTOR: 0.7,
        /**
         * Custom Events
         * @attribute EVENTS
         * @type Object
         * @default {
         */
        EVENTS: {
            DELETE: 'delete',
            EDIT: 'edit',
            CLOSE: 'close'
        }
    });
    viewClass = MathInteractives.Common.Interactivities.ShapeSlicer.Views.EditPopup;
})();
