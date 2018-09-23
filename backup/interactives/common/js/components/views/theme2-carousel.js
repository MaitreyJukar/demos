(function () {
    'use strict';
    var theme2CarouselClass = null;

    /*
     *
     *   D E S C R I P T I O N
     *
     * View for rendering Carousel
     *
     * @class Carousel
     * @constructor
     * @extends MathInteractives.Common.Player.Views.Base
     * @namespace MathInteractives.Common.Components.Theme2.Views
     **/
    MathInteractives.Common.Components.Theme2.Views.Carousel = MathInteractives.Common.Player.Views.Base.extend({

        /**
         * stores idSuffix for carousel
         *
         * @property idSuffix
         **/
        idSuffix: null,

        /**
         * stores imagepath for carousel
         *
         * @property imgPath
         **/
        imgPath: null,

        /**
         * stores last column index for carousel
         *
         * @property lastColumnIndex
         **/
        lastColumnIndex: null,
        /**
         * Initialises StepperView
         *
         * @method initialize
         **/
        initialize: function () {
            this.initializeDefaultProperties();
            this.idSuffix = this.model.get('idSuffix');
            this.imgPath = this.model.get('imagePath');
            this.lastColumnIndex = 0;
            this.render();
        },

        events: function events() {
            return {
                'click .left-arrow-button-holder.clickEnabled': '_leftArrowClickHandler',
                'click .right-arrow-button-holder.clickEnabled': '_rightArrowClickHandler'
            }

        },

        render: function () {
            this._renderStepper();
            this._setBackgroundImages();

        },

        /**
         * Adds div structure to stepper component
         *
         * @method _renderStepper
         * @private
         **/
        _renderStepper: function _renderStepper() {

            var stepperHtml = null,
                cardsHolderHtml = null,
                initialCardCount = null,
                defaultBlocks = this.model.get('defaultBlocks'),
                templateData = {
                    idPrefix: this.idPrefix,
                    idSuffix: this.idSuffix,
                    stepperIndex: this.model.get('stepperIndex'),
                    challenge2Data: this.model.get('challenge2Data')
                };
            stepperHtml = MathInteractives.Common.Components.templates.theme2Carousel(templateData).trim();

            this.$el.append(stepperHtml);

            //            if (this.model.get('isNavigationWithImage') === true) {
            //                this._renderNavigationButtonWithImage();
            //            } else {
            //                this._renderNavigationButton();
            //            }

            this._renderNavigationButton();

            while (this.lastColumnIndex < defaultBlocks) {
                this.addColumn();
            }

        },

        /**
         * Adds div structure to stepper component
         *
         * @method _renderStepper
         * @private
         **/
        _setBackgroundImages: function _setBackgroundImages() {

            this.$('.in-title-container, .out-title-container, .guess-title-container').css({
                'background-image': 'url("' + this.imgPath + '")'
            });

        },
        ///**
        //* Adds navigation buttons to stepper component
        //*
        //* @method _renderNavigationButtonWithImage
        //* @private
        //**/
        //_renderNavigationButtonWithImage: function _renderNavigationButtonWithImage() {
        //    var buttonBaseClass = this.model.get('navigationBaseClass'),
        //        buttonBaseClass2 = this.model.get('navigationBaseClass2'),
        //        options = {
        //            path: this.filePath,
        //            player: this.player,
        //            manager: this.manager,
        //            idPrefix: this.idPrefix
        //        };

        //    options.data = {
        //        id: this.idPrefix + this.idSuffix + 'left-arrow-button-' + this.model.get('stepperIndex') + '-holder',
        //        type: MathInteractives.global.Theme2.Button.TYPE.ICON,
        //        baseClass: buttonBaseClass,
        //        width: 24,
        //        height: 70,
        //        icon: {
        //            iconPath: this.imgPath,
        //            width: 24,
        //            height: 70
        //        }
        //    }

        //    this._leftArrowBtnView = MathInteractives.global.Theme2.Button.generateButton(options);

        //    if ((buttonBaseClass2 !== null) || (buttonBaseClass2 !== undefined)) {
        //        buttonBaseClass = buttonBaseClass2;
        //    }
        //    options.data = {
        //        id: this.idPrefix + this.idSuffix + 'right-arrow-button-' + this.model.get('stepperIndex') + '-holder',
        //        type: MathInteractives.global.Theme2.Button.TYPE.ICON,
        //        baseClass: buttonBaseClass,
        //        width: 24,
        //        height: 70,
        //        icon: {
        //            iconPath: this.imgPath,
        //            width: 24,
        //            height: 70
        //        }
        //    }

        //    this._rightArrowBtnView = MathInteractives.global.Theme2.Button.generateButton(options);

        //},

        /**
         * Adds navigation buttons to stepper component
         *
         * @method _renderNavigationButton
         * @private
         **/
        _renderNavigationButton: function _renderNavigationButton() {

            var options = {
                path: this.filePath,
                player: this.player,
                manager: this.manager,
                idPrefix: this.idPrefix
            },
                leftButtonOption = this.model.get('leftButtonOption'),
                rightButtonOption = this.model.get('rightButtonOption');

            options.data = {
                id: this.idPrefix + this.idSuffix + 'left-arrow-button-' + this.model.get('stepperIndex') + '-holder',
                type: leftButtonOption.type,
                baseClass: leftButtonOption.baseClass,
                width: leftButtonOption.width,
                height: leftButtonOption.height,
                icon: leftButtonOption.icon,
                tooltipText: leftButtonOption.tooltipText,
                tooltipType: leftButtonOption.tooltipType,
                imagePath: leftButtonOption.imagePath,
                text: leftButtonOption.text,
                textColor: leftButtonOption.textColor,
                borderRadius: leftButtonOption.borderRadius,
                colorType: leftButtonOption.colorType
            };

            this._leftArrowBtnView = MathInteractives.global.Theme2.Button.generateButton(options);

            options.data = {
                id: this.idPrefix + this.idSuffix + 'right-arrow-button-' + this.model.get('stepperIndex') + '-holder',
                type: rightButtonOption.type,
                baseClass: rightButtonOption.baseClass,
                width: rightButtonOption.width,
                height: rightButtonOption.height,
                icon: rightButtonOption.icon,
                tooltipText: rightButtonOption.tooltipText,
                tooltipType: rightButtonOption.tooltipType,
                imagePath: rightButtonOption.imagePath,
                text: rightButtonOption.text,
                textColor: rightButtonOption.textColor,
                borderRadius: rightButtonOption.borderRadius,
                colorType: rightButtonOption.colorType
            };

            this._rightArrowBtnView = MathInteractives.global.Theme2.Button.generateButton(options);

        },

        /**
         * Adds div structure to stepper component
         *
         * @method addColumn
         * @public
         **/
        addColumn: function addColumn(withAnimation, doNotAnimate) {
            var cardsHolderHtml = null,
                templateData = {
                    idPrefix: this.idPrefix,
                    idSuffix: this.idSuffix,
                    stepperIndex: this.model.get('stepperIndex'),
                    colNumber: this.lastColumnIndex,
                    challenge2Data: this.model.get('challenge2Data')
                };
            cardsHolderHtml = MathInteractives.Common.Components.templates.theme2CarouselColumn(templateData).trim();

            this.$('.in-out-cards-holder').append(cardsHolderHtml);

            if ((this.model.get('isBockWithImage') !== false)) {
                this.$('.stepper-block').css({
                    'background-image': 'url("' + this.imgPath + '")'
                });
                //this.$('.out-card-container').css({ 'background-image': 'url("' + imgPath + '")' });
            }

            this.lastColumnIndex++;
            if (this.model.get('defaultBlocks') < this.lastColumnIndex) {
                this._adjustContainerPositionOnAddition(withAnimation, doNotAnimate);
            }

            this.setNavigationalArrowStates();
        },

        /**
         * modify text in stepper block
         *
         * @method modifyStepperBlockText
         * @public
         **/
        modifyStepperBlockText: function modifyStepperBlockText(rowNumber, columnNumber, text, withAnimation) {
            var stepperIndex = this.model.get('stepperIndex');
            if (this.model.get('defaultBlocks') < this.lastColumnIndex) {
                this._adjustContainerPositionOnAddition(withAnimation, false);
            }
            this.setNavigationalArrowStates();
            this.$('#' + this.idPrefix + this.idSuffix + 'stepper-' + stepperIndex + '-block-' + rowNumber + '-' + columnNumber + '-text').html(text);
        },

        /**
         * Left arrow click handler.
         * slide stepper container one column to the left.
         * @method _leftArrowClickHandler
         * @private
         **/
        _leftArrowClickHandler: function _leftArrowClickHandler(event) {
            var self = this;
            if (this._leftArrowBtnView.getButtonState() === MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
                return;
            }
            this.stopReading();

            var model = this.model,
                animateStep = model.get('animateStep'),
                eventData = null,
                firstVisibleColumn = model.get('firstVisibleColumn');
            //if (firstVisibleColumn === 0) {
            //    return;
            //}

            firstVisibleColumn -= animateStep;
            eventData = {
                stepperIndex: model.get('stepperIndex'),
                firstVisibleColumn: firstVisibleColumn,
                idSuffix: this.model.get('idSuffix')
            };

            this.trigger(theme2CarouselClass.Events.ANIMATION_START);
            self.trigger(theme2CarouselClass.Events.LEFT_ARROW_CLICKED, eventData);
            this.$('.in-out-cards-holder').animate({
                left: '+=' + (model.get('animateStep') * this.$('.stepper-column-container').width())
            }, model.get('animationDuration'), function () {
                self.stepperScrollDirection = 'right';
                self.trigger(theme2CarouselClass.Events.ANIMATION_COMPLETE, event);
                //self.setFocus('');
            });
            model.set('firstVisibleColumn', firstVisibleColumn);
            this.setNavigationalArrowStates();
            self.trigger(theme2CarouselClass.Events.NAVIGATION_BUTTON_CLICKED);
        },

        /**
         * Right arrow click handler.
         * slide stepper container one column to the right.
         * @method _rightArrowClickHandler
         * @private
         **/
        _rightArrowClickHandler: function _rightArrowClickHandler(event) {
            var self = this;
            if (this._rightArrowBtnView.getButtonState() === MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
                return;
            }
            this.stopReading();
            var model = this.model,
                animateStep = model.get('animateStep'),
                eventData = null,
                firstVisibleColumn = model.get('firstVisibleColumn');
            //if (firstVisibleColumn === (this.lastColumnIndex - model.get('defaultBlocks'))) {
            //    return;
            //}

            firstVisibleColumn += animateStep;
            eventData = {
                stepperIndex: model.get('stepperIndex'),
                firstVisibleColumn: firstVisibleColumn,
                idSuffix: this.model.get('idSuffix')
            };

            this.trigger(theme2CarouselClass.Events.ANIMATION_START);
            self.trigger(theme2CarouselClass.Events.RIGHT_ARROW_CLICKED, eventData);
            this.$('.in-out-cards-holder').animate({
                left: '-=' + (model.get('animateStep') * this.$('.stepper-column-container').width())
            }, model.get('animationDuration'), function () {
                self.tableScrollDirection = 'left';
                self.trigger(theme2CarouselClass.Events.ANIMATION_COMPLETE, event);
                //self.setFocus('');
            });
            model.set('firstVisibleColumn', firstVisibleColumn);
            this.setNavigationalArrowStates();
            self.trigger(theme2CarouselClass.Events.NAVIGATION_BUTTON_CLICKED);

        },

        /**
         * Adjusts container position when column added.
         *
         * @method _adjustContainerPositionOnAddition
         * @private
         **/
        _adjustContainerPositionOnAddition: function _adjustContainerPositionOnAddition(withAnimation, doNotAnimate) {

            if (doNotAnimate === true) {
                return;
            }
            var model = this.model,
                currentStartColumnNumber = model.get('firstVisibleColumn'),
                numberOfColumnsToSlide = null,
                currentColumnNumber = this.lastColumnIndex,
                visisbleNumberOfColumns = model.get('defaultBlocks'),
                columnDiff = currentColumnNumber - currentStartColumnNumber,
                columnWidth = this.$('.stepper-column-container').width();
            if (columnDiff > visisbleNumberOfColumns) {
                numberOfColumnsToSlide = columnDiff - visisbleNumberOfColumns;
                if (withAnimation === true) {
                    this._animateBlocksContainer(numberOfColumnsToSlide, 'left');
                } else {
                    this.$('.in-out-cards-holder').css({
                        'left': '-=' + (numberOfColumnsToSlide * columnWidth)
                    });

                }
                model.set('firstVisibleColumn', (currentStartColumnNumber + numberOfColumnsToSlide));

            } else {
                //animCompleteCallback(this);
            }

        },

        /**
         * Animates the blocks container with the slide value as the number of columns.
         * Callback function is executed on animation complete
         * @method _animateBlocksContainer
         * @private
         **/
        _animateBlocksContainer: function _animateBlocksContainer(numberOfColumnsToSlide, slideDirection) {

            var self = this,
                model = self.model,
                columnWidth = self.$('.stepper-column-container').width(),
                animDuration = model.get('animationDuration');
            //this._disableTab();
            //switch (slideDirection) {
            //    case 'left':
            self.trigger(theme2CarouselClass.Events.ANIMATION_START);
            self.$('.in-out-cards-holder').animate({
                left: '-=' + (numberOfColumnsToSlide * columnWidth)
            }, {

                duration: animDuration,
                complete: function () {
                    self.trigger(theme2CarouselClass.Events.ANIMATION_COMPLETE);
                    //self._enableTab();
                    //if (animCompleteCallback) {
                    //    animCompleteCallback(self);

                    //}

                }
            });

            //        break;
            //    case 'right':
            //        this.$packageItemContainer.animate({
            //            left: '+=' + (numberOfColumnsToSlide * modelData.SLIDE_VALUE)
            //        }, {

            //            duration: animDuration,
            //            complete: function () {
            //                self._enableTab();
            //                if (animCompleteCallback) {
            //                    animCompleteCallback(self);
            //                }
            //            }
            //        });

            //        break;
            //}
        },

        /**
         * Handles state of navigation arrows.
         *
         * @method setNavigationalArrowStates
         * @public
         **/
        setNavigationalArrowStates: function setNavigationalArrowStates() {

            var model = this.model,
                currentFirstVisibleColumn = model.get('firstVisibleColumn'),
                lastColumnNumber = (this.lastColumnIndex);
            if (lastColumnNumber <= (currentFirstVisibleColumn + this.model.get('defaultBlocks'))) {
                this._disableButton(this._rightArrowBtnView);
            } else {
                this._enableButton(this._rightArrowBtnView);
            }
            if (currentFirstVisibleColumn <= 0) {
                this._disableButton(this._leftArrowBtnView);
            } else {
                this._enableButton(this._leftArrowBtnView);
            }

        },

        /**
         * Disables all buttons.
         *
         * @method disableAllButtons
         * @public
         **/
        disableAllButtons: function disableAllButtons() {
            this._disableButton(this._leftArrowBtnView);
            this._disableButton(this._rightArrowBtnView);
        },

        /**
         * Sets button state as 'ACTIVE'
         *
         * @method _enableButton
         * @param {Object} [btnView]
         * @private
         **/
        _enableButton: function _enableButton(btnView) {
            if (btnView.getButtonState() === 'disabled') {
                btnView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
            }
        },

        /**
         * Sets button state as 'DISABLED'
         *
         * @method _disableButton
         * @param {Object} [btnView]
         * @private
         **/
        _disableButton: function _disableButton(btnView) {
            btnView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
        },
        /**
         * Left right arrow click handler on space click.
         * it calls the respective handlers.
         * @method _leftRightArrowKeyupHandler
         * @param ev {Object}
         * @private
         **/
        _leftRightArrowKeyupHandler: function _leftRightArrowKeyupHandler(event) {
            event = (event) ? event : window.event;
            var charCode = (event.keyCode) ? event.keyCode : event.which;
            if (charCode === 37) {
                this._leftArrowClickHandler();
            } else if (charCode === 39) {
                this._rightArrowClickHandler();
            }
        },

        /**
         * reset carousel to default state.
         * @method resetCarousel
         *
         * @public
         **/
        resetCarousel: function resetCarousel(event) {
            this.$el.html('');
            this.lastColumnIndex = 0;
            this.model.set('firstVisibleColumn', 0);
            this.render();
        },

        /**
         * Sets navigation button state
         * @method setNavigationButtonState
         * @param 0 for left-button view, 1 for right-button view
         * @param boolean
         * @public
         */
        setNavigationButtonState: function (button, flag) {

            var buttonView = null;

            if (button === 0) {
                buttonView = this._leftArrowBtnView;
            } else if (button === 1) {
                buttonView = this._rightArrowBtnView;
            }

            if (flag === true) {
                this._enableButton(buttonView);
            } else if (flag === false) {
                this._disableButton(buttonView);
            }

        },

        /**
         * Returns first visible block of carousel
         *
         * @method getFirstVisibleBlock
         * @public
         */
        getFirstVisibleBlock: function getFirstVisibleBlock() {
            var firstVisibleBlock = this.model.get('firstVisibleColumn');

            return firstVisibleBlock;
        },

        /**
         * Sets first visible block in model
         *
         * @method setFirstVisibleBlock
         * @param firstVisibleBlock
         * @public
         */
        setFirstVisibleBlock: function setFirstVisibleBlock(firstVisibleBlock, doAnimation) {
            this.setCarouselSliderPosition(firstVisibleBlock, doAnimation);
            this.model.set('firstVisibleColumn', firstVisibleBlock);
            this.setNavigationalArrowStates();
        },

        /**
         * Sets carousel position to given column index
         *
         * @method setCarouselSliderPosition
         * @param columnNumber
         * @public
         */
        setCarouselSliderPosition: function setCarouselSliderPosition(columnNumber, doAnimation) {
            var left = -(columnNumber * this.$('.stepper-column-container').width()),
                model = this.model;
            doAnimation = doAnimation || null;
            if (doAnimation !== null) {
                this.$('.in-out-cards-holder').animate({
                    left: left
                }, model.get('animationDuration'));
            } else {
                this.$('.in-out-cards-holder').css('left', left);
            }
        }
    }, {
        Events: {
            ANIMATION_COMPLETE: 'animation-complete',
            ANIMATION_START: 'animation-start',
            LEFT_ARROW_CLICKED: 'left-arrow-clicked',
            RIGHT_ARROW_CLICKED: 'right-arrow-clicked',
            NAVIGATION_BUTTON_CLICKED: 'navigation-button-clicked'
        },

        /**
         * Generates stepper component
         * @method generateStepper
         * @param stepperObject {Object} Model values to be passed to generate stepper view
         * @return stepperView {Object} Reference to the generated stepper view
         * @public
         */
        generateCarousel: function (carouselObject) {
            if (carouselObject) {

                var carouselView,
                    model,
                    el;

                el = carouselObject.containerId;
                delete carouselObject.containerId;
                model = new MathInteractives.Common.Components.Theme2.Models.Carousel(carouselObject);
                carouselView = new MathInteractives.Common.Components.Theme2.Views.Carousel({
                    model: model,
                    el: el
                });
                return carouselView;

            }
        }
    });
    theme2CarouselClass = MathInteractives.Common.Components.Theme2.Views.Carousel;
})();