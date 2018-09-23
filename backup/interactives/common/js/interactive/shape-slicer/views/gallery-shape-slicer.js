(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Views.GalleryShapeSlicer) {
        return;
    }
    var eventManagerModel = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer.EVENT_MANAGER_MODEL,
        mainModelNameSpace = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer,
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
    MathInteractives.Common.Interactivities.ShapeSlicer.Views.GalleryShapeSlicer = MathInteractives.Common.Player.Views.Base.extend({

        /**
         * Holds gallery-carousel
         * @property _galleryCarousel
         * @default null
         * @type Object
         */
        _galleryCarousel: null,

        /**
         * [[Description]]
         * @attribute galleryCanvasViews
         * @type Object
         * @default null
         */
        galleryCanvasViews: null,

        /**
         * [[Description]]
         * @attribute eventManager
         * @type Object
         * @default null
         */
        eventManager: null,

        /**
         * Initialises GalleryShapeSlicer
         * @method initialize
         */
        initialize: function () {
            var self = this;
            this.initializeDefaultProperties();
            this.eventManager = this.model.get('eventManager');
            this.eventManager.off(eventManagerModel.SAVE_IMAGE, this.updateGallery).on(eventManagerModel.SAVE_IMAGE, this.updateGallery, this);
            this.eventManager.off(eventManagerModel.EDIT_IMAGE, this._editImage).on(eventManagerModel.EDIT_IMAGE, this._editImage, this);
            this.eventManager.on(eventManagerModel.UNLOAD_INTERACTIVE, this.onUnloadInteractive, this);
            this.loadScreen('gallery-screen');
            this.galleryCanvasViews = [];
            this.render();
            this.bindEvents();
            this.player.bindTabChange(function (event) {
                self.model.set('currentTab', 2);
                self._disableAllSlots();
                self.eventManager.trigger(eventManagerModel.TAB_CHANGED, 2);
                if (event.isLetsGoClicked !== true) {
                    self.setFocus('gallery-tab-direction-text-container-direction-text-text');
                }
            }, this, 2);
        },

        /**
         * Renders the view of explore tab
         *
         * @method render
         * @private
         **/
        render: function render() {
            this._preloadImagePath();
            this._setBackground();
            this._initializeDirectionText();
            this._createGalleryCarousel();
            this.createCanvasViews();
            this.arrangeGallery(0, true);
            this._generateBackButton();
            this.loadScreen('gallery-acc-text-screen');
            this.loadScreen('carousel-acc-text-screen');
            this._disableAllSlots();
            this.setCorauselButtonState();
        },

        /**
         * [[Description]]
         * @attribute events
         * @type Object
         * @default {
         */
        events: {
            'click .gallery-tab-back-button.clickEnabled': 'goToExploreTab'
        },

        /**
         * Binds events
         * @method bindEvents
         * @public
         */
        bindEvents: function () {
            var self = this,
                index;

            this.$('.stepper-block').off('mousedown.galleryImage').on('mousedown.galleryImage', function (event) {
                if ($(this).hasClass('click-enable') && (event.which === 1 || event.which === 0 || event.isTrigger)) {
                    var $this = $(this);
                    $this.one('mouseup.galleryImage', function () {
                        self.stopReading();
                        index = 2 * $this.parent().index() + $this.index();
                        self.player.enableHelpElement('in-out-cards-0-wrapper', 0, false);
                        self.player.enableHelpElement('gallery-tab-back-button', 0, false);
                        self.player.enableHelpElement('gallery-tab-direction-text-container-direction-text-buttonholder', 0, false);
                        self.generateEditModal(index);
                        self.unloadScreen('gallery-popup-buttons');
                        self.loadScreen('gallery-popup-buttons');
                        self.setAccMessage('edit-image-container', self.getAccMessage('edit-image-container', 0, [index + 1]));
                        self.setFocus('edit-image-container');
                    });
                    $(document).one('mouseup.galleryImage', function () {
                        $this.off('mouseup.galleryImage');
                    });
                }
            });
            this._bindEventOnCards();
        },


        /**
         * Binds event on cards
         * @method _bindEventOnCards
         * @private
         */
        _bindEventOnCards: function _bindEventOnCards() {
            var $cards = this.$('.stepper-block.click-enable'),
                utils = MathInteractives.Common.Utilities.Models.Utils,
                self = this;

            $cards.off('mouseenter.addhover').on('mouseenter.addhover', $.proxy(self._addHoverEffect, self)).off('mouseleave.removehover').on('mouseleave.removehover', $.proxy(self._removeHoverEffect, self)).off('mousedown.adddown').on('mousedown.adddown', $.proxy(self._addDownEffect, self));
            utils.DisableTouch($cards);
            utils.EnableTouch($cards, 3, 0);
            $(document).off('mouseup.removedown').on('mouseup.removedown', $.proxy(self._removeDownEffect, self));
        },

        /**
         * add hover effect
         * @method _addHoverEffect
         * @private
         * @param {[[Type]]} event [[Description]]
         */
        _addHoverEffect: function _addHoverEffect(event) {
            $(event.currentTarget).removeClass('down').addClass('hover');
        },
        /**
         * Removes hover effect
         * @method _removeHoverEffect
         * @private
         * @param {[[Type]]} event [[Description]]
         */
        _removeHoverEffect: function _removeHoverEffect(event) {
            $(event.currentTarget).removeClass('hover');
        },
        /**
         * add down effect
         * @method _addDownEffect
         * @private
         * @param {[[Type]]} event [[Description]]
         */
        _addDownEffect: function _addDownEffect(event) {
            $(event.currentTarget).removeClass('hover').addClass('down');
        },
        /**
         * Removes down effect
         * @method _removeDownEffect
         * @private
         * @param {[[Type]]} event [[Description]]
         */
        _removeDownEffect: function _removeDownEffect(event) {
            $('.stepper-block.click-enable.down').removeClass('down');
        },

        /**
         * Initializes direction text
         * @method _initializeDirectionText
         * @private
         */
        _initializeDirectionText: function _initializeDirectionText() {
            var idPrefix = this.idPrefix,
                directionProperties = {
                    containerId: idPrefix + 'gallery-tab-direction-text-container',
                    idPrefix: idPrefix,
                    player: this.player,
                    manager: this.manager,
                    path: this.filePath,
                    text: this.getMessage('gallery-tab-direction-text-text', 0),
                    accText: this.getMessage('gallery-tab-direction-text-text', 0),
                    showButton: true,
                    buttonType: MathInteractives.global.Theme2.Button.TYPE.FA_ICONTEXT,
                    containmentBGcolor: 'rgba(0, 0, 0,0)',
                    iconData: {
                        'faClass': this.getFontAwesomeClass('fixed-delete'),
                        'fontColor': '#2D3A3A',
                        'height': 20,
                        'width': 26
                    },
                    buttonText: this.getMessage('gallery-tab-direction-text-text', 1),
                    buttonHeight: 38,
                    btnTextColor: '#000000',
                    clickCallback: {
                        fnc: this._onClearAllClick,
                        scope: this
                    },
                    textColor: '#ffffff',
                    tabIndex: 1000,
                    buttonTabIndex: 2000,
                    btnBaseClass: 'shape-slicer-white-button-base',
                    ttsBaseClass: 'shape-slicer-tts-button'

                };
            this._directionTextView = MathInteractives.global.Theme2.DirectionText.generateDirectionText(directionProperties);
        },

        /**
         * generates back button
         * @method _generateBackButton
         * @private
         */
        _generateBackButton: function () {
            this.backBtnView = MathInteractives.global.Theme2.ButtonExtended.generateButton({
                'player': this.player,
                'manager': this.manager,
                'path': this.filePath,
                'idPrefix': this.idPrefix,
                'data': {
                    'id': this.idPrefix + 'gallery-tab-back-button',
                    'type': MathInteractives.global.Theme2.Button.TYPE.BACK_ICONTEXT,
                    'baseClass': 'shape-slicer-white-button-base'
                }
            });
        },

        /**
         * Preloads image path.
         *
         * @method _preloadImagePath
         * @private
         **/
        _preloadImagePath: function () {
            this.spriteImagePath = this.getImagePath('sprites');
        },

        /**
         * Sets the background.
         *
         * @method _setBackground
         * @private
         **/

        _setBackground: function () {
            this.$el.css({
                'background-image': 'url("' + this.spriteImagePath + '")'
            });
        },

        /**
         * Destroys
         * @method destroy
         * @public
         */
        destroy: function destroy() {
            delete this._directionTextView,
            delete this._galleryCarousel,
            delete this.backBtnView,
            delete this.eventManager,
            delete this.filePath,
            delete this.idPrefix,
            delete this.manager,
            delete this.galleryCanvasViews;
        },

        /**
         * Creates gallery carousel
         * @method _createGalleryCarousel
         * @private
         */
        _createGalleryCarousel: function _createGalleryCarousel() {
            var containerId = this.$('#' + this.idPrefix + 'gallery-carousel-container'),
                carouselObject = {
                    player: this.player,
                    containerId: containerId,
                    imagePath: '',
                    defaultBlocks: viewClass.GALLAREY_COLUMN_LENGTH,
                    isBockWithImage: false,
                    stepperIndex: 0,
                    challenge2Data: false,
                    leftButtonOption: {
                        type: MathInteractives.global.Theme2.Button.TYPE.FA_ICON,
                        tooltipText: this.getMessage('carousel-previous-button-text', 0),
                        tooltipType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE,
                        icon: {
                            faClass: this.getFontAwesomeClass('back-circle'),
                            'height': 50,
                            'width': 50,
                            fontSize: 50,
                        },
                        height: 50,
                        width: 44,
                        baseClass: 'carousel-arrow-button-container',
                        borderRadius: 25,
                        colorType: '#ffffff'
                    },
                    rightButtonOption: {
                        type: MathInteractives.global.Theme2.Button.TYPE.FA_ICON,
                        tooltipText: this.getMessage('carousel-next-button-text', 0),
                        tooltipType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE,
                        icon: {
                            faClass: this.getFontAwesomeClass('next-circle'),
                            'height': 50,
                            'width': 44,
                            fontSize: 50,
                        },
                        height: 50,
                        width: 50,
                        baseClass: 'carousel-arrow-button-container',
                        borderRadius: 25,
                        colorType: '#ffffff'
                    }, //skip if left and right both buttons have same base class
                    isNavigationWithImage: false,
                    animateStep: 4,
                    animationDuration: 350

                },
                carouselNameSpace = MathInteractives.Common.Components.Theme2.Views.Carousel;

            this._galleryCarousel = carouselNameSpace.generateCarousel(carouselObject);
            this._galleryCarousel.setNavigationalArrowStates();
            this._bindSpaceOnGallery();
            this._generateCarouselAccScreen();
            this._galleryCarousel.on(carouselNameSpace.Events.NAVIGATION_BUTTON_CLICKED, $.proxy(this._onCarouselButtonClick, this));
            this._galleryCarousel.on(carouselNameSpace.Events.ANIMATION_COMPLETE, $.proxy(this._onButtonAnimationComplete, this));
        },

        _bindSpaceOnGallery: function _bindSpaceOnGallery() {
            var self = this;
            this.$('.in-out-cards-wrapper').off('keyup.enableGallery').on('keyup.enableGallery', function (event) {
                if (event.keyCode === 32 && $(event.target).parent().attr('id') === this.id) {
                    self._enableDisableGalleryPage(true);
                }
            });
        },

        _generateCarouselAccScreen: function _generateCarouselAccScreen() {

            var carouselButtonScreen = {
                id: 'carousel-acc-text-screen',
                name: 'carousel-acc-text-screen'
            },
              tabIndex = null,
              elementObj = null,
              galleryLength = viewClass.GALLAREY_COLUMN_LENGTH,
              elements = [];


            for (var i = 0; i < galleryLength; i++) {
                tabIndex = 1200 + (i + 1) * 20;
                elementObj = {
                    accId: 'stepper-0-block-0-' + i + '-container',
                    id: 'stepper-0-block-0-' + i + '-container',
                    type: 'text',
                    tabIndex: tabIndex,
                    messages: [{
                        id: 0,
                        isAccTextSame: false,
                        message: {
                            acc: this.getAccMessage('image-text', 0, [(i * 2 + 1)])
                        }
                    }]
                }
                elements.push(elementObj);

                elementObj = {
                    accId: 'stepper-0-block-1-' + i + '-container',
                    id: 'stepper-0-block-1-' + i + '-container',
                    type: 'text',
                    tabIndex: tabIndex + 10,
                    messages: [{
                        id: 0,
                        isAccTextSame: false,
                        message: {
                            acc: this.getAccMessage('image-text', 0, [(i * 2 + 2)])
                        }
                    }]
                }
                elements.push(elementObj);
            }

            carouselButtonScreen.elements = elements;

            this.manager.model.parse([carouselButtonScreen]);

        },

        /**
         * Creates canvas views
         * @method createCanvasViews
         * @public
         */
        createCanvasViews: function () {
            var $stepperBlocks = this.$('.stepper-block'),
                index = 0,
                options,
                canvasView;
            for (index = 0; index < $stepperBlocks.length; index++) {
                options = {
                    model: this.model,
                    contanierId: $stepperBlocks[index].id
                }
                canvasView = MathInteractives.Common.Interactivities.ShapeSlicer.Views.GalleryCanvas.createGalleryCanvasView(options);
                this.galleryCanvasViews.push(canvasView);
            }
        },

        /**
         * On carousel button click
         * @method _onCarouselButtonClick
         * @private
         */
        _onCarouselButtonClick: function (event) {
            this._galleryCarousel.setNavigationButtonState(1, false);
            this._galleryCarousel.setNavigationButtonState(0, false);
        },

        _onButtonAnimationComplete: function (event) {
            this.setCorauselButtonState();
            this.setFocus('in-out-cards-0-wrapper');
            /*
            var position = this._galleryCarousel.getFirstVisibleBlock();

            if ($(event.target).hasClass('left-arrow-button-holder') || $(event.target).parents('.left-arrow-button-holder').length > 0) {
                this.setFocus('stepper-0-block-1-' + (position + 3) + '-container');
            }
            else {
                this.setFocus('stepper-0-block-0-' + position + '-container');
            }
            */

        },

        /**
         * Sets corausel button state
         * @method setCorauselButtonState
         * @public
         */
        setCorauselButtonState: function () {
            var firstColumn = this._galleryCarousel.getFirstVisibleBlock(),
                galleryObject = this.model.get('galleryObject'),
                targetClass = null;
            this.model.set('galleryFirstVisibleColumn', firstColumn);
            //this._enableDisableGalleryPage();

            this._galleryCarousel.setNavigationButtonState(1, !(Math.ceil(galleryObject.length / 2) - firstColumn <= 4));
            this._galleryCarousel.setNavigationButtonState(0, !!firstColumn);

            targetClass = '.dot-' + (firstColumn / 4 + 1);

            this.$('.gallery-dot').removeClass('active');
            this.$(targetClass).addClass('active');

            this._setAccTextOfGallery();
        },
        /**
         * update gallery
         * @method updateGallery
         * @public
         */
        updateGallery: function () {
            var currentIndex = this.model.get('currentGalleryIndex'),
                $galleryImages = this.$('.stepper-block'),
                galleryObject = this.model.get('galleryObject'),
                cssClass = null,
                self = this,
                start = null,
                galleryLength = null,
                end = null,
                images = null,

                firsColumn;

            cssClass = galleryObject[currentIndex].backType.TYPE_NAME;
            firsColumn = this.getLatestFirstVisibleColumn(currentIndex);
            this.setFirstVisibleColumn(firsColumn);
            this.galleryCanvasViews[currentIndex].loadShapes(currentIndex);
            $($galleryImages[currentIndex]).removeClass('white gray').addClass('click-enable').addClass(cssClass)
            this._bindEventOnCards();
            this.setCorauselButtonState();
            //this._enableDisableGalleryPage();
        },

        _setAccTextOfGallery: function _setAccTextOfGallery() {

            var galleryFirstVisibleColumn = this.model.get('galleryFirstVisibleColumn'),
                start = galleryFirstVisibleColumn * 2,
                galleryLength = this.$('.click-enable').length,
                images = (galleryLength - start) >= 8 ? 8 : galleryLength % 8,
                end = start + images;

            start += 1;

            switch (images) {
                case 1:
                    this.setAccMessage('in-out-cards-0-wrapper', this.getAccMessage('in-out-cards-0-wrapper', 0, [this.getAccMessage('in-out-cards-0-wrapper', 1, [start])]));
                    break;
                case 2:
                    this.setAccMessage('in-out-cards-0-wrapper', this.getAccMessage('in-out-cards-0-wrapper', 0, [this.getAccMessage('in-out-cards-0-wrapper', 2, [start, end])]));
                    break;
                default:
                    this.setAccMessage('in-out-cards-0-wrapper', this.getAccMessage('in-out-cards-0-wrapper', 0, [this.getAccMessage('in-out-cards-0-wrapper', 3, [start, end])]));
                    break;
            }

        },


        _enableDisableGalleryPage: function _enableDisableGalleryPage(focus) {

            var galleryFirstVisibleColumn = this.model.get('galleryFirstVisibleColumn'),
                start = galleryFirstVisibleColumn * 2,
                galleryLength = this.$('.click-enable').length,
                $slots = this.$('.stepper-block'),
                totalSlots = $slots.length,
                images = (galleryLength - start) >= 8 ? 8 : galleryLength % 8,
                end = start + images,
                currentIndex = totalSlots;

            while (currentIndex--) {
                this.enableTab($($slots[currentIndex]).attr('id').replace(this.idPrefix, ''), (currentIndex >= start && currentIndex < end));
            }

            this._bindImageEvents(start, end, focus);

        },

        _bindImageEvents: function _bindImageEvents(start, end, focus) {
            var $slots = this.$('.stepper-block'),
                self = this,
                $visibleSlots = this.$('.click-enable'),
                $firstElem = $($slots[start]),
                $lastElem = $($slots[end - 1]);

            $firstElem.off('keydown.disableFirstGallery').on('keydown.disableFirstGallery', function (event) {
                if (event.keyCode === 9 && event.shiftKey === true) {
                    self._bindDocumentUpOnGallery($firstElem, $lastElem, $visibleSlots);
                }
            });

            $lastElem.off('keydown.disableLastGallery').on('keydown.disableLastGallery', function (event) {
                if (event.keyCode === 9 && event.shiftKey === false) {
                    self._bindDocumentUpOnGallery($firstElem, $lastElem, $visibleSlots);
                }
            });

            $visibleSlots.off('keydown.escapeGallery').on('keydown.escapeGallery', function (event) {
                if (event.keyCode === 27) {
                    self._bindDocumentUpOnGallery($firstElem, $lastElem, $visibleSlots);
                    self.setFocus('in-out-cards-0-wrapper');
                }
            });

            if (focus) {
                this.setFocus($($slots[start]).attr('id').replace(this.idPrefix, ''));
            }
        },

        _bindDocumentUpOnGallery: function _bindDocumentUpOnGallery($firstElem, $lastElem, $visibleSlots) {

            var self = this;

            $(document).off('keyup.disableGallery').on('keyup.disableGallery', function (event) {
                self._disableAllSlots();
                $lastElem.off('keydown.disableLastGallery');
                $firstElem.off('keydown.disableFirstGallery');
                $visibleSlots.off('keydown.escapeGallery');
                $(document).off('keyup.disableGallery');
            });

        },

        _disableAllSlots: function _disableAllSlots() {
            var $slots = this.$('.stepper-block'),
                currentIndex = $slots.length;

            while (currentIndex--) {
                this.enableTab($($slots[currentIndex]).attr('id').replace(this.idPrefix, ''), false);
            }
        },

        /**
         * generates edit modal
         * @method generateEditModal
         * @public
         * @param {[[Type]]} index [[Description]]
         */
        generateEditModal: function (index) {
            var self = this,
                option = {
                    model: this.model,
                    index: index,
                    eventManager: this.eventManager
                };
            this.editModal = MathInteractives.Common.Interactivities.ShapeSlicer.Views.EditPopup.createEditModal(option);
            this.eventManager.off(eventManagerModel.DELETE_IMAGE, self._deleteImage).on(eventManagerModel.DELETE_IMAGE, self._deleteImage, this);
            this.eventManager.off(eventManagerModel.SET_FOCUS, self._setFocus).on(eventManagerModel.SET_FOCUS, self._setFocus, this);
        },

        /**
         * arrange galleryc
         * @method arrangeGallery
         * @public
         */
        arrangeGallery: function (indexTodelete, animate) {

            var galleryObject = this.model.get('galleryObject'),
                $galleryImages = this.$('.stepper-block'),
                index,
                cssClass = null,
                indexTodelete = indexTodelete || 0,
                galleryFirstVisibleColumn = this.model.get('galleryFirstVisibleColumn');
            if (this._galleryCarousel && animate) {
                this._galleryCarousel.setFirstVisibleBlock(galleryFirstVisibleColumn, true);
                this.setCorauselButtonState();
            }

            this.$('.stepper-block').removeAttr('style').removeClass('click-enable white gray');
            for (; indexTodelete < this.galleryCanvasViews.length; indexTodelete++) {
                this.galleryCanvasViews[indexTodelete].removeShapes();
            }
            if (galleryObject.length > 0) {
                for (index = 0; index < galleryObject.length; index++) {
                    cssClass = galleryObject[index].backType.TYPE_NAME;
                    this.galleryCanvasViews[index].loadShapes(index);
                    $($galleryImages[index]).addClass('click-enable').addClass(cssClass);
                }

            } else {
                for (index = 0; index < $galleryImages.length; index++) {
                    this.enableTab($($galleryImages[index]).attr('id').replace(self.idPrefix, ''), false);
                }
                this.goToExploreTab();
                this.setFocus('explore-tab-activity-area');
            }
            this._bindEventOnCards();
        },

        /**
         * Deletes the image
         * @method _deleteImage
         * @private
         * @param {[[Type]]} index [[Description]]
         */
        _deleteImage: function (index) {
            var visibleFirstColumn = this._galleryCarousel.getFirstVisibleBlock(),
                galleryObject = this.model.get('galleryObject'),
                firstColumn;

            firstColumn = (Math.ceil(galleryObject.length / 2) - visibleFirstColumn > 0) ? visibleFirstColumn : ((visibleFirstColumn - 4) == 0 ? 0 : visibleFirstColumn - 4);

            this.model.set('galleryFirstVisibleColumn', firstColumn);

            this.arrangeGallery(index, galleryObject.length % 8 === 0);
            this._enableDisableGalleryPage();
            this._setAccTextOfGallery();

        },

        _setFocus: function _setFocus(index) {

            var stepperBlock = $(this.$('.stepper-block')[index]);

            if (index >= 0) {
                this.setFocus(stepperBlock.attr('id').replace(this.idPrefix, ''));
            }
        },

        /**
         * On clear all click
         * @method _onClearAllClick
         * @private
         */
        _onClearAllClick: function () {
            this.stopReading();
            this._generateClearAllPopup();
        },
        /**
         * generates clear all popup
         * @method _generateClearAllPopup
         * @private
         */
        _generateClearAllPopup: function () {
            var popupOptions = {
                manager: this.manager,
                path: this.filePath,
                player: this.player,
                idPrefix: this.idPrefix,
                title: this.getMessage('clear-all-popup', 0),
                accTitle: this.getMessage('clear-all-popup', 0),
                text: this.getMessage('clear-all-popup', 1),
                accText: this.getMessage('clear-all-popup', 1),
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
                            this._clearAllImages();
                        }
                        else {
                            this.setFocus('gallery-tab-direction-text-container-direction-text-buttonholder');
                        }
                    },
                    scope: this
                }
            };
            this.editPopup = MathInteractives.global.Theme2.PopUpBox.createPopup(popupOptions);
        },

        /**
         * Clears all images
         * @method _clearAllImages
         * @private
         */
        _clearAllImages: function () {
            var emptyArray = [];
            this.model.set('galleryObject', emptyArray);
            this.model.set('currentGalleryIndex', 0);
            this.model.set('galleryFirstVisibleColumn', 0);
            this.arrangeGallery();
            //this._enableDisableGalleryPage();
            this._galleryCarousel.setFirstVisibleBlock(0);
            this.setCorauselButtonState();
            this.eventManager.trigger(eventManagerModel.CLEAR_ALL_IMAGES);
            this.goToExploreTab();
            this.setFocus('explore-tab-activity-area');
        },

        /**
         * Gets latest first visible column
         * @method getLatestFirstVisibleColumn
         * @public
         * @param {[[Type]]} currentIndex [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        getLatestFirstVisibleColumn: function (currentIndex) {
            var firstColumn;
            if (currentIndex < 8) {
                firstColumn = 0;
            } else if (currentIndex >= 8 && currentIndex < 16) {
                firstColumn = 4;
            } else {
                firstColumn = 8;
            }
            return firstColumn;
        },

        /**
         * Sets first visible column
         * @method setFirstVisibleColumn
         * @public
         * @param {[[Type]]} firstColumn [[Description]]
         */
        setFirstVisibleColumn: function (firstColumn) {
            this.model.set('galleryFirstVisibleColumn', firstColumn);
            this._galleryCarousel.setFirstVisibleBlock(firstColumn);
            //this._enableDisableGalleryPage();
        },

        _editImage: function _editImage() {

            this.goToExploreTab();
            this.setFocus('right-panel-canvas-acc-container');
        },

        /**
          * go to explore tab
          * @method goToExploreTab
          * @public
          */
        goToExploreTab: function () {
            this.player.switchToTab(1);

        },

        /**
         * On unload interactive
         * @method onUnloadInteractive
         * @public
         */
        onUnloadInteractive: function onUnloadInteractive() {
            this.destroy();
            this.unbind();
            this.remove();
        }
    }, {
        /**
         * [[Description]]
         * @attribute GALLAREY_COLUMN_LENGTH
         * @type Number
         * @default 12
         */
        GALLAREY_COLUMN_LENGTH: 12
    });
    viewClass = MathInteractives.Common.Interactivities.ShapeSlicer.Views.GalleryShapeSlicer;
})();