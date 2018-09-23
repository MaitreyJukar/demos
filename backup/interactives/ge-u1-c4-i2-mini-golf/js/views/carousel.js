(function () {
    'use strict';
    /**
    * Carousel holds the necessary structure for the carousel.
    * @class Carousel
    * @module MiniGolf
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    MathInteractives.Interactivities.MiniGolf.Views.Carousel = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Unique interactivity id prefix
        * @property idprefix
        * @default null
        * @private
        */
        idPrefix: null,

        /**
        * Model of path for preloading files
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,

        /**
        * Manager object
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,

        /**
        * Reference to player object
        * @property player
        * @type Object
        * @default null
        */
        player: null,

        /**
        * Previous slide button view instance visible in carousel screen.
        * @property prevSlideBtn
        * @type Object
        * @default null
        */
        prevSlideBtn: null,

        /**
        * Next slide button view instance visible in carousel screen.
        * @property nextSlideBtn
        * @type Object
        * @default null
        */
        nextSlideBtn: null,


        /**
        * Initializes function of carousel view.
        * @method initialize
        * @constructor
        */
        initialize: function () {
            this.containerId = this.model.get('containerId');
            var htmlFromTemplate;
            this.initializeDefaultProperties();
            htmlFromTemplate = MathInteractives.Interactivities.MiniGolf.templates.carousel({
                idPrefix: this.idPrefix,
                containerId: this.containerId
            }).trim();
            this.$el.html(htmlFromTemplate);
            this._generateSlides();
            this._addSlideChangeButtons();

            this._getCurrentSlidePosition();
            this.enableCorrectSlideChangeBtns();
            this._onSlidingAnimationEnd();
        },

        /**
        * Generates and stores instances of slide views, one for each slide model stored in the carousel's slideCollection.
        *
        * @method _generateSlides
        * @private
        */
        _generateSlides: function _generateSlides() {
            var slidesCollection = this.model.get('slidesData'),
                numberOfSlides = slidesCollection.length,
                index,
                containerId = this.containerId,
                slideModel,
                slideElId, $slideEl, slideView,
                defaultSlideNumber = this.model.get('defaultSlideNumber') || 0;
            for (index = 0; index < numberOfSlides; index++) {
                slideModel = slidesCollection.models[index];
                slideModel.set({
                    'player': this.player,
                    'manager': this.manager,
                    'idPrefix': this.idPrefix,
                    'filePath': this.filePath,
                    'containerId': containerId
                });

                if (index == defaultSlideNumber) {
                    slideModel.set('isCurrentSlide', true);
                }

                slideElId = this.idPrefix + containerId + '-slide-' + index;
                $slideEl = $('<div>', {
                    'id': slideElId,
                    'class': containerId + '-slide-' + index + ' ' + containerId + '-slide'
                }).appendTo(this.$('.' + containerId + '-slides-holder'));
                // NOTE: slides are appended to DIV with class (containerID + '-slides-holder')

                slideView = new MathInteractives.Interactivities.MiniGolf.Views.Slide({
                    el: '#' + slideElId,
                    model: slidesCollection.models[index]
                }).on(MathInteractives.Interactivities.MiniGolf.Models.Carousel.EVENTS.SLIDE_CLICK_EVENT, $.proxy(this._onSlideClickEvent, this));
            }
            this.loadScreen(this.model.get('screenId'));
        },

        /**
        * Triggered by the custom event {{#crossLink "MathInteractives.Interactivities.MiniGolf.Models.Carousel/SLIDE_CLICK_EVENT:event"}}{{/crossLink}}
        * fired on slide view on clicking on the current slide.
        *
        * @method _onSlideClickEvent
        * @param eventData {Object} The slide number and slide's currentSlide status is passed along with the custom event.
        * @private
        **/
        _onSlideClickEvent: function _onSlideClickEvent(eventData) {
            this.trigger(MathInteractives.Interactivities.MiniGolf.Models.Carousel.EVENTS.CAROUSEL_SLIDE_CLICK_EVENT, eventData);
        },

        /**
        * Add next and previous slide buttons in carousel view
        *
        * @method _addSlideChangeButtons
        * @private
        */
        _addSlideChangeButtons: function _addSlideChangeButtons() {
            var options = {
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                idPrefix: this.idPrefix,
                data: {
                    'id': this.idPrefix + this.containerId + '-prev-slide-btn',
                    'type': MathInteractives.global.Theme2.Button.TYPE.FA_ICON,
                    'height': 60,
                    'width': 40,
                    'icon': {
                        'faClass': this.getFontAwesomeClass('back'),
                        'fontWeight': 'normal',
                        'fontSize': 60,
                        'fontColor': '#F8DA32'
                    },
                    'baseClass': this.containerId + '-prev-slide-btn'
                }
            };
            this.prevSlideBtn = MathInteractives.global.Theme2.Button.generateButton(options);

            options.data.id = this.idPrefix + this.containerId + '-next-slide-btn';
            options.data.icon.faClass = this.getFontAwesomeClass('next');
            options.data.baseClass = this.containerId + '-next-slide-btn';
            this.nextSlideBtn = MathInteractives.global.Theme2.Button.generateButton(options);

            this.prevSlideBtn.$el.on('click', $.proxy(this.onPrevSlideBtnClick, this));
            this.nextSlideBtn.$el.on('click', $.proxy(this.onNextSlideBtnClick, this));
        },

        /**
        * Animates and shows the slide on the left.
        *
        * @method onPrevSlideBtnClick
        * @param [event] {Object} Click event object.
        */
        onPrevSlideBtnClick: function onPrevSlideBtnClick(event) {
            if (this.prevSlideBtn.$el.hasClass('clickEnabled')) {
                this.stopReading();
                event && event.stopPropagation();
                this._onSlidingAnimationStart();
                this._enablePrevSlideBtn(false);
                this._enableNextSlideBtn(false);
                var slidesCollection = this.model.get('slidesData'),
                    numberOfSlides = slidesCollection.length,
                    slideNumberBeforeChange = Number(this.model.get('defaultSlideNumber')),
                    newSlideNumber = slideNumberBeforeChange - 1,
                    $slidesHolder,
                    slideDistance = this.model.get('oneSlideShiftDistance');

                slidesCollection.models[slideNumberBeforeChange].set('isCurrentSlide', false);
                slidesCollection.models[newSlideNumber].set('isCurrentSlide', true);

                var self = this,
                    highlightCurrentSlide = function () {
                        $(this).trigger('slideAnimationEnd');
                    };
                $slidesHolder = this.$('.' + this.containerId + '-slides-holder');

                if (MathInteractives.Common.Utilities.Models.BrowserCheck.isIE && MathInteractives.Common.Utilities.Models.BrowserCheck.browserVersion < 10) {
                    $slidesHolder.css('left', -slideDistance * newSlideNumber);
                    this._onPrevSlideAnimationEnd(newSlideNumber);
                }
                else {
                    this.trigger(MathInteractives.Interactivities.MiniGolf.Models.Carousel.EVENTS.SLIDE_CHANGE_ANIMATION_START);
                    $slidesHolder.removeClass('carausel-right-' + slideNumberBeforeChange)
                    .removeClass('carausel-left-' + slideNumberBeforeChange)
                    .addClass('carausel-left-' + newSlideNumber)
                    .one('webkitAnimationEnd oanimationend msAnimationEnd animationend MSAnimationEnd', highlightCurrentSlide)
                    .off('slideAnimationEnd').on('slideAnimationEnd', $.proxy(this._onPrevSlideAnimationEnd, this, newSlideNumber));
                }
            }
            else if (!this._isAnimating) {
                this.trigger(MathInteractives.Interactivities.MiniGolf.Models.Carousel.EVENTS.ALREADY_AT_END);
            }
        },

        /**
        * Animates and shows the slide on the right.
        *
        * @method onNextSlideBtnClick
        * @param [event] {Object} Click event object.
        */
        onNextSlideBtnClick: function onNextSlideBtnClick(event) {
            if (this.nextSlideBtn.$el.hasClass('clickEnabled')) {
                this.stopReading();
                event && event.stopPropagation();
                this._onSlidingAnimationStart();
                this._enableNextSlideBtn(false);
                this._enablePrevSlideBtn(false);
                var slidesCollection = this.model.get('slidesData'),
                    numberOfSlides = slidesCollection.length,
                    slideNumberBeforeChange = Number(this.model.get('defaultSlideNumber')),
                    newSlideNumber = slideNumberBeforeChange + 1,
                    $slidesHolder, slidesHolderCurrentLeft,
                    slideDistance = this.model.get('oneSlideShiftDistance');

                slidesCollection.models[slideNumberBeforeChange].set('isCurrentSlide', false);
                slidesCollection.models[newSlideNumber].set('isCurrentSlide', true);

                var self = this,
                    highlightCurrentSlide = function () {
                        $(this).trigger('slideAnimationEnd');
                    };

                $slidesHolder = this.$('.' + this.containerId + '-slides-holder');
                if (MathInteractives.Common.Utilities.Models.BrowserCheck.isIE && MathInteractives.Common.Utilities.Models.BrowserCheck.browserVersion < 10) {
                    $slidesHolder.css('left', -slideDistance * newSlideNumber);
                    this._onNextSlideAnimationEnd(newSlideNumber);
                }
                else {
                    this.trigger(MathInteractives.Interactivities.MiniGolf.Models.Carousel.EVENTS.SLIDE_CHANGE_ANIMATION_START);
                    $slidesHolder.removeClass('carausel-right-' + slideNumberBeforeChange)
                    .removeClass('carausel-left-' + slideNumberBeforeChange)
                    .addClass('carausel-right-' + newSlideNumber)
                    .one('webkitAnimationEnd oanimationend msAnimationEnd animationend MSAnimationEnd', highlightCurrentSlide)
                    .off('slideAnimationEnd').on('slideAnimationEnd', $.proxy(this._onNextSlideAnimationEnd, this, newSlideNumber));
                }
            }
            else if (!this._isAnimating) {
                this.trigger(MathInteractives.Interactivities.MiniGolf.Models.Carousel.EVENTS.ALREADY_AT_END);
            }
        },

        /**
        * Disables clicks on slides during animation.
        *
        * @method _onSlidingAnimationStart
        * @private
        */
        _onSlidingAnimationStart: function _onSlidingAnimationStart() {
            this.$('.' + this.containerId + '-slide').removeClass('clickEnabled');
            this._isAnimating = true;
        },

        /**
        * Enables clicks on slides after animation
        *
        * @method _onSlidingAnimationEnd
        * @private
        */
        _onSlidingAnimationEnd: function _onSlidingAnimationEnd() {
            this._isAnimating = false;

            var slidesCollection = this.model.get('slidesData'),
                currentSlideNumber = this.model.get('defaultSlideNumber'),
                currentSlideModel = slidesCollection.models[currentSlideNumber];
            // gives a pointer cursor to the current slide
            currentSlideModel.trigger(MathInteractives.Interactivities.MiniGolf.Models.Carousel.EVENTS.SLIDE_CHANGE_ANIMATION_END);
            // enables click on the slides.
            this.$('.' + this.containerId + '-slide').addClass('clickEnabled');
        },

        /**
        * Called at the end of slide change animation after clicking on previous slide button in method
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Carousel/onPrevSlideBtnClick:method"}}{{/crossLink}}
        *
        * @method _onPrevSlideAnimationEnd
        * @param newSlideNumber {Number} The new slide's number.
        * @param [event] {Object} The event object.
        * @private
        */
        _onPrevSlideAnimationEnd: function _onPrevSlideAnimationEnd(newSlideNumber, event) {
            this.model.set('defaultSlideNumber', newSlideNumber);
            this.enableCorrectSlideChangeBtns();
            this._onSlidingAnimationEnd();
            this.trigger(MathInteractives.Interactivities.MiniGolf.Models.Carousel.EVENTS.SLIDE_CHANGE_ANIMATION_END, {
                prevSlide: true,
                newSlideNumber: newSlideNumber
            });
        },

        /**
        * Called at the end of slide change animation after clicking on next slide button in method
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Carousel/onNextSlideBtnClick:method"}}{{/crossLink}}
        *
        * @method _onNextSlideAnimationEnd
        * @param newSlideNumber {Number} The new slide's number.
        * @param [event] {Object} The event object.
        * @private
        */
        _onNextSlideAnimationEnd: function _onNextSlideAnimationEnd(newSlideNumber, event) {
            this.model.set('defaultSlideNumber', newSlideNumber);
            this.enableCorrectSlideChangeBtns();
            this._onSlidingAnimationEnd();
            this.trigger(MathInteractives.Interactivities.MiniGolf.Models.Carousel.EVENTS.SLIDE_CHANGE_ANIMATION_END, {
                prevSlide: false,
                newSlideNumber: newSlideNumber
            });
        },

        /**
        * Enables/disables the previous slide button on carousel depending on parameter passed.
        *
        * @method _enablePrevSlideBtn
        * @param enable {Boolean} If false, then the button is disabled.
        * @private
        */
        _enablePrevSlideBtn: function _enablePrevSlideBtn(enable) {
            var ButtonClass = MathInteractives.global.Theme2.Button,
                prevSlideBtn = this.prevSlideBtn,
                $buttonEl = prevSlideBtn.$el;

            if (enable === false) {
                this.prevSlideBtn.setButtonState(ButtonClass.BUTTON_STATE_DISABLED);
                $buttonEl.hide();
                if (!this.isMobile) {
                    $buttonEl.css({ 'cursor': 'default' });
                }
            }
            else {
                this.prevSlideBtn.setButtonState(ButtonClass.BUTTON_STATE_ACTIVE);
                $buttonEl.show();
                if (!this.isMobile) {
                    $buttonEl.css({ 'cursor': 'pointer' });
                }
            }
        },

        /**
        * Enables/disables the next slide button on carousel depending on parameter passed.
        *
        * @method _enableNextSlideBtn
        * @param enable {Boolean} If false, then the button is disabled.
        * @private
        */
        _enableNextSlideBtn: function _enableNextSlideBtn(enable) {
            var ButtonClass = MathInteractives.global.Theme2.Button,
                nextSlideBtn = this.nextSlideBtn,
                $buttonEl = nextSlideBtn.$el;

            if (enable === false) {
                $buttonEl.hide();
                this.nextSlideBtn.setButtonState(ButtonClass.BUTTON_STATE_DISABLED);
                if (!this.isMobile) {
                    $buttonEl.css({ 'cursor': 'default' });
                }
            }
            else {
                $buttonEl.show();
                this.nextSlideBtn.setButtonState(ButtonClass.BUTTON_STATE_ACTIVE);
                if (!this.isMobile) {
                    $buttonEl.css({ 'cursor': 'pointer' });
                }
            }
        },

        /**
        * Sets the correct slide number indicated at the bottom of the carousel and enables/disables the correct slide
        * change buttons depending on the current slide number and total number of slides.
        * Called at the start of the interactive and after every slide change animation end.
        *
        * @method enableCorrectSlideChangeBtns
        */
        enableCorrectSlideChangeBtns: function enableCorrectSlideChangeBtns() {
            var currentSlideNumber = Number(this.model.get('defaultSlideNumber')),
                slidesCollection = this.model.get('slidesData'),
                numberOfSlides = slidesCollection.length;
            switch (currentSlideNumber) {
                case 0:
                    this._enablePrevSlideBtn(false);
                    this._enableNextSlideBtn();
                    break;
                case (numberOfSlides - 1):
                    this._enablePrevSlideBtn();
                    this._enableNextSlideBtn(false);
                    break;
                default:
                    this._enablePrevSlideBtn();
                    this._enableNextSlideBtn();
                    break;
            }

            // change slide number indicator at the bottom of carousel
            this.updateSlideNumberIndicator();
        },

        /**
        * Updates the slide number indicator.
        *
        * @method updateSlideNumberIndicator
        *
        */
        updateSlideNumberIndicator: function updateSlideNumberIndicator() {
            var currentSlideNumber = Number(this.model.get('defaultSlideNumber')),
                slidesCollection = this.model.get('slidesData'),
                numberOfSlides = slidesCollection.length;
            this.setMessage(this.containerId + '-slide-number-indicator',
                            this.getMessage(this.containerId + '-slide-number-indicator', 0, [(currentSlideNumber + 1), numberOfSlides]));
        },

        /**
        * When the carousel is generated, it get the default slide position.
        *
        * @method _getCurrentSlidePosition
        * @private
        */
        _getCurrentSlidePosition: function _getCurrentSlidePosition() {
            var defaultSlideNumber = this.model.get('defaultSlideNumber'),
                oneSlideShiftDistance = this.model.get('oneSlideShiftDistance'),
                $slidesHolder = this.$('.' + this.containerId + '-slides-holder'),
                numberOfSlides = this.model.get('slidesData'),
                slidesLength = numberOfSlides.length,
                index;

            for(index = 0; index<slidesLength; index++) {
                $slidesHolder
                .removeClass('carausel-right-' + index)
                .removeClass('carausel-left-' + index);
            }
            $slidesHolder.css('left', -oneSlideShiftDistance * defaultSlideNumber); // for saved state resume!
        },

        /**
        * Changes a slide completely.
        *
        * @method changeASlide
        * @param slideNumber {Number} The to-be-changed slides' index. (Indices start from 0).
        * @param newData {Object} The new slide data
        **/
        changeASlide: function changeASlide(slideNumber, newData) {
            var slidesCollection = this.model.get('slidesData'),
                slideModel = slidesCollection.models[slideNumber];
            slideModel.set({
                'templateModule': newData.template || slideModel.get('templateModule'),
                'templateName': newData.template || slideModel.get('templateName'),
                'data': newData.data || slideModel.get('data')
            });
            slideModel.trigger(MathInteractives.Interactivities.MiniGolf.Models.Carousel.EVENTS.UPDATE_SLIDE);
            this.unloadScreen(this.model.get('screenId'));
            this.loadScreen(this.model.get('screenId'));
            this.updateSlideNumberIndicator();
        },

        /**
        * Updates a slide.
        *
        * @method updateASlideData
        * @param slideNumber {Number} The to-be-updated slides' index. (Indices start from 0).
        * @param newData {Object} The new slide data
        **/
        updateASlideData: function updateASlideData(slideNumber, newData) {
            var slidesCollection = this.model.get('slidesData'),
                slideModel = slidesCollection.models[slideNumber],
                oldData = slideModel.get('data'),
                combinedData = $.extend(true, {}, oldData, newData);
            slideModel.set('data', combinedData);
            slideModel.trigger(MathInteractives.Interactivities.MiniGolf.Models.Carousel.EVENTS.UPDATE_SLIDE);
        },

        /**
        * Updates all slide.
        *
        * @method updateAllSlide
        * @param newData {Object} Array of JSON describing new slides' data.
        **/
        updateAllSlides: function updateAllSlides(newData) {
            var slidesCollection = this.model.get('slidesData'),
                numberOfExisitingSlides = slidesCollection.length,
                numberOfSlidesUpdating = newData.length,
                slideModel, slideModelNewData,
                index;
            for (index = 0; index < numberOfSlidesUpdating; index++) {
                slideModel = slidesCollection.models[index];
                slideModelNewData = newData[index];
                slideModel.set({
                    'templateModule': slideModelNewData.template || slideModel.get('templateModule'),
                    'templateName': slideModelNewData.template || slideModel.get('templateName'),
                    'data': slideModelNewData.data || slideModel.get('data')
                });
                slideModel.trigger(MathInteractives.Interactivities.MiniGolf.Models.Carousel.EVENTS.UPDATE_SLIDE);
            }
            this.loadScreen(this.model.get('screenId'));
            this.updateSlideNumberIndicator();
            this._getCurrentSlidePosition();
            this.enableCorrectSlideChangeBtns();
        },

        /**
        * Updates the default slide number and hence the which is the current slide.
        *
        * @method updateDefaultSlideNumber
        *
        */
        updateDefaultSlideNumber: function updateDefaultSlideNumber() {
            var slideNumberBeforeChange = Number(this.model.get('defaultSlideNumber')),
                newSlideNumber = slideNumberBeforeChange + 1,
                slidesCollection = this.model.get('slidesData');

            slidesCollection.models[slideNumberBeforeChange].set('isCurrentSlide', false);
            slidesCollection.models[newSlideNumber].set('isCurrentSlide', true);
            this.model.set('defaultSlideNumber', newSlideNumber);
        }

    }, {});

    /**
    * Holds the necessary methods for a slide of the carousel.
    * @class Slide
    * @module MiniGolf
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    MathInteractives.Interactivities.MiniGolf.Views.Slide = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Initializes function of carousel view.
        * @method initialize
        * @constructor
        */
        initialize: function () {
            this.initializeDefaultProperties();
            this.render();
            this.model.on(MathInteractives.Interactivities.MiniGolf.Models.Carousel.EVENTS.UPDATE_SLIDE, $.proxy(this._updateSlide, this));
        },
        initializeDefaultProperties:function initializeDefaultProperties(){

            this._superwrapper('initializeDefaultProperties',arguments);
            this.isMobile=MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;
        },
        /**
        * Renders the slide
        *
        * @method render
        */
        render: function render() {
            var template = this.model.get('template'),
                templateData = this.model.get('data'),
                htmlFromTemplate;
            templateData['idPrefix'] = this.idPrefix;
            templateData['containerId'] = this.model.get('containerId');
            htmlFromTemplate = template(templateData).trim();
            this.$el.html(htmlFromTemplate);
            this._highlightCurrentSlide();
            this._attachEvents(false);
            this._attachEvents();
        },

        /**
        * Attaches/detaches events on the slide depending on the boolean parameter passed.
        *
        * @method _attachEvents
        * @param enable {Boolean} If false, dettaches the events
        */
        _attachEvents: function _attachEvents(enable) {
            var model = this.model,
                slideChangeEvent = MathInteractives.Interactivities.MiniGolf.Models.Carousel.EVENTS.SLIDE_CHANGE_ANIMATION_END;
            if (enable === false) {
                this.$el.off('click');
                model.off('change:isCurrentSlide');
                model.off(slideChangeEvent);
            }
            else {
                this.$el.off('click').on('click', $.proxy(this._onSlideElClick, this));
                model.on('change:isCurrentSlide', $.proxy(this._highlightCurrentSlide, this));
                model.on(slideChangeEvent, $.proxy(this.addCursorIfCurrentSlide, this));
            }
        },

        /**
        * Event handler for click on slide view's el; it triggers a custome event {{#crossLink "MathInteractives.Interactivities.MiniGolf.Models.Carousel/SLIDE_CLICK_EVENT:event"}}{{/crossLink}}
        * along with data like slide number clicked and whether the slide was the current slide.
        *
        * @method _onSlideElClick
        * @private
        */
        _onSlideElClick: function _onSlideElClick() {
            if (this.$el.hasClass('clickEnabled')) {
                this.stopReading();
                var modelData, eventData;
                modelData = this.model.get('data');
                eventData = {
                    slideNumber: modelData.slideNumber,
                    isCurrentSlide: this.$el.hasClass('current-slide'),
                    isUnlocked: !!(modelData.unlocked)
                }
                this.trigger(MathInteractives.Interactivities.MiniGolf.Models.Carousel.EVENTS.SLIDE_CLICK_EVENT, eventData);
            }
        },

        /**
        * Adds 'current-slide' CSS class to the slide whose model's property isCurrentSlide is truthy, else removes the class.
        * @method _highlightCurrentSlide
        * @private
        */
        _highlightCurrentSlide: function _highlightCurrentSlide() {
            if (this.model.get('isCurrentSlide')) {
                if (MathInteractives.Common.Utilities.Models.BrowserCheck.isIE) {
                    if (MathInteractives.Common.Utilities.Models.BrowserCheck.browserVersion < 10) {
                        this.$el.addClass('current-slide-ie');
                    }
                }
                this.$el.addClass('current-slide');
            }
            else {
                if (MathInteractives.Common.Utilities.Models.BrowserCheck.isIE) {
                    if (MathInteractives.Common.Utilities.Models.BrowserCheck.browserVersion < 10) {
                        this.$el.removeClass('current-slide-ie');
                    }
                }
                this.$el.removeClass('current-slide').removeClass('pointer-cursor');
            }
        },

        /**
        * Adds a pointer cursor to slide if it's the current slide, if it's unlocked and the device is not a touch
        * device.
        *
        * @method addCursorIfCurrentSlide
        */
        addCursorIfCurrentSlide: function addCursorIfCurrentSlide() {
            if (this.model.get('isCurrentSlide') && !this.isMobile && this.model.get('data').unlocked) {
                this.$el.addClass('pointer-cursor');
            }
        },

        /**
        * Updates a slide by dettaching previous events and re-rednering the slide.
        *
        * @method _updateSlide
        * @private
        */
        _updateSlide: function _updateSlide() {
            this._attachEvents(false);
            this.render();
        }
    });
})();
