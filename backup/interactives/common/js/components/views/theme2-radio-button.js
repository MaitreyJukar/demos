(function () {
    'use strict';

    /**
    * View for rendering button and its related events
    *
    * @class RadioButton
    * @constructor
    * @namespace  MathInteractives.Common.Components.Theme2.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    **/
    MathInteractives.Common.Components.Theme2.Views.RadioButton = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Holds the interactivity id prefix
        * @property idPrefix
        * @default null
        * @private
        */
        idPrefix: null,

        /**
        * Holds the interactivity manager reference
        * @property manager
        * @default null
        * @private
        */
        manager: null,
        /**
        * Holds the model of path for preloading files
        *
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,
        /**
        * The id of the screen which contains the radio button elements which has to be loaded
        * @property screenID
        * @type String
        */
        screenID: null,
        /**
        * Stores the value of the tabIndex
        * @property tabIndex
        * @type String
        */
        tabIndex: null,

        /**
        * Initialize the properties and render view
        * @method initialize
        * @public
        **/
        initialize: function () {
            this.manager = this.model.get('manager');
            this.filePath = this.model.get('filePath');
            this.screenID = this.model.get('screenID');
            this.idPrefix = this.model.get('idPrefix');
            this.render();
            this.bindTouchEvents();
        },

        /**
        * Displays the radio buttons
        * @method render
        * @type private
        */
        render: function () {
            var radioButtonDataCollection = this.model.get('radioButtonCollection'),
                curModel = null,
                counter = null,
                radioButtonLabel = [];
            for (counter = 0; counter < radioButtonDataCollection.length; counter++) {
                curModel = radioButtonDataCollection.models[counter];
                radioButtonLabel.push({ 'radioID': this.idPrefix + curModel.get('elementID'), 'text': curModel.get('text') });
            }
            this.$el.html(MathInteractives.Common.Components.templates.theme2RadioButton({ 'radioButtonLabel': radioButtonLabel
            }).trim());
            this.setWidthOfGivenLabels();
            this.loadScreen('radio-button-acc-screen');
            //this.$('.image-container').css({ 'background-image': 'url("' + this.filePath.getImagePath('radio-button-states') + '")' });
            //this.setInitialTabIndex();
            this.alignRadioButton(this.model.get('direction'), this.model.get('gapBetweenRadioButtonContainers'));
            this.checkDefaultCheckedRadioButtons();
            this.setInitialStateOfRadioButtons();
            this.createDynamicHackDiv();
            this.setTextForRadioBtnHack();
        },

        /**
        * Method to create hack divs of radio elements
        * @method createDynamicHackDiv
        * @public
        */
        createDynamicHackDiv: function () {
            var radioButtonDataCollection = this.model.get('radioButtonCollection'),
                tabIndex = this.model.get('tabIndex'),
                curModel = null,
                radioBtnHackProp = null,
                counter = null;
            for (counter = 0; counter < radioButtonDataCollection.length; counter++) {
                curModel = radioButtonDataCollection.models[counter];
                radioBtnHackProp = {
                    elementId: curModel.get('elementID'),
                    tabIndex: tabIndex,
                    acc: ''
                };
                this.createAccDiv(radioBtnHackProp);

            }
        },

        /**
        * Method to set text to radio buttons hack div
        * @method setTextForRadioBtnHack
        * @public
        */
        setTextForRadioBtnHack: function () {
            var radioButtonDataCollection = this.model.get('radioButtonCollection'),
                tabIndex = this.model.get('tabIndex'),
                curModel = null,
                radioBtnHackProp = null,
                curChild = null,
                textForAccOfRadioBtn = null,
                curId = null,
                counter = null;

            for (counter = 0; counter < radioButtonDataCollection.length; counter++) {
                curModel = radioButtonDataCollection.models[counter];
                curId = curModel.get('elementID');
                curChild = this.$('#' + this.idPrefix + curId);
                textForAccOfRadioBtn = curModel.get('accText') ? curModel.get('accText') : curModel.get('text');
                textForAccOfRadioBtn += ' ' + this.getAccMessage('radio-button-acc-text', 0) + ' ';
                if ($(curChild).find('.theme2-radio-button-selceted-dot').hasClass('selected-state') === true) {
                    textForAccOfRadioBtn += this.getAccMessage('radio-button-acc-text', 2) + ' ';
                } else {
                    textForAccOfRadioBtn += this.getAccMessage('radio-button-acc-text', 1) + ' ';
                }
                textForAccOfRadioBtn += this.getAccMessage('radio-button-acc-text', 3);
                this.setAccMessage(curId, textForAccOfRadioBtn);
            }
        },

        /**
        * Method to change acc text of a particular radio button
        * @method changeRadioButtonAccText
        * @param{String} accId ID of the radio option whose acc text is to be changed
        * @param{String} message The new acc text
        * @public
        */
        changeRadioButtonAccText: function changeRadioButtonAccText(accId, message) {
            var curChild = this.$('#' + this.idPrefix + accId),
                accText = message,
                radioButtonDataCollection = this.model.get('radioButtonCollection'),
                curModel;

            curModel = radioButtonDataCollection.where({ elementID: accId });
            if (radioButtonDataCollection.where({ elementID: accId }).length > 0) {
                curModel = radioButtonDataCollection.where({ elementID: accId })[0];
                curModel.set('accText', message);
                accText += ' ' + this.getAccMessage('radio-button-acc-text', 0) + ' ';
                if ($(curChild).find('.theme2-radio-button-selceted-dot').hasClass('selected-state') === true) {
                    accText += this.getAccMessage('radio-button-acc-text', 2) + ' ';
                } else {
                    accText += this.getAccMessage('radio-button-acc-text', 1) + ' ';
                }
                accText += this.getAccMessage('radio-button-acc-text', 3);
                this.setAccMessage(accId, accText);
            }
        },

        /**
        * radio events and their corresponding handlers
        * @property events
        * @type Object
        **/
        events: {
            'click .radio-elements': 'radioButtonClicked',
            'mouseenter .radio-elements': 'radioButtonEntered',
            'mouseleave .radio-elements': 'radioButtonLeft',
            'keydown .radio-button-div-container': 'processKeyEvents',
            'focus .radio-button-div-container': 'adjustTabIndex',
            'focusout .radio-button-div-container': 'readjustTabIndex'
        },

        /**
         * Binds touch events
         * @method bindTouchEvents
         * @public
         *
         */
        bindTouchEvents: function bindTouchEvents () {
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(this.$('.radio-elements'));
        },

        /**
        * Selects the radio button that is clicked and deselects any other that was previously clicked
        * @method radioButtonClicked
        * @param{Object} the event properties
        * @private
        */
        radioButtonClicked: function (ev) {
            var accID = null;
            if (this.model.get('enabled')) {
                this.stopReading();
                var $currentTarget = this.$(ev.currentTarget),
                    radioElement = this.getImageContainer($currentTarget),
                    $radioElement = this.$(radioElement).find('.theme2-radio-button-selceted-dot');
                if ($radioElement.hasClass('selected-state') == false) {
                    this.resetRadioButtons();
                    $radioElement.addClass('selected-state');
                    this.addSelectedState($radioElement);
                    //this.resetTabIndices();
                    //accID = this.getAccIDByReplacingIdPrefix(this.$(radioElement).attr('id'));
                    //this.setTabIndex(accID, this.tabIndex);
                    this.triggerOnChangeEvent();
                }
                accID = this.getAccIDByReplacingIdPrefix(this.$(radioElement).attr('id'));
                this.setTextForRadioBtnHack();
                this.setFocus(accID);
            }
        },

        /**
        * Sets all elements other than the one currently focused, with tab index -1
        * @method adjustTabIndex
        * @param{Object} the event properties
        * @public
        */
        adjustTabIndex: function adjustTabIndex(event) {
            if (this.model.get('enabled')) {
                var $currentTarget = this.$(event.currentTarget),
                counter = null,
                radioButtonImages = this.getAllImageContainers();
                for (counter = 0; counter < radioButtonImages.length; counter++) {

                    if ($currentTarget.attr('id') === $(radioButtonImages[counter]).attr('id')) {
                        this.enableTab(this.getAccIDByReplacingIdPrefix($(radioButtonImages[counter]).attr('id')), true);
                    } else {
                        this.enableTab(this.getAccIDByReplacingIdPrefix($(radioButtonImages[counter]).attr('id')), false);
                    }
                }
            }
        },

        /**
        * Resets all elements to their previous tabindex
        * @method readjustTabIndex
        * @public
        */
        readjustTabIndex: function readjustTabIndex() {
            if (this.model.get('enabled')) {
                var curChild = null,
                counter = null,
                radioButtonImages = this.getAllImageContainers();
                for (counter = 0; counter < radioButtonImages.length; counter++) {
                    curChild = radioButtonImages[counter];

                    if ($(curChild).find('.theme2-radio-button-selceted-dot').hasClass('selected-state') === true) {
                        return;
                    }
                }
                for (counter = 0; counter < radioButtonImages.length; counter++) {

                    this.enableTab(this.getAccIDByReplacingIdPrefix($(radioButtonImages[counter]).attr('id')), true);
                }
            }
        },

        /**
        * Add selected state to element
        * @method addSelectedState
        * @param{Object} the radio element to be applied with selected state
        * @public
        */
        addSelectedState: function addSelectedState($radioElement) {
            var backgroundColor = null;
            if (this.model.get('enabled')) {
                backgroundColor = this.model.get('dotBackgroundColor');
            } else {
                backgroundColor = this.model.get('disabledDotBackgroundColor');
            };
            $radioElement.css({
                'background-color': backgroundColor
            });

        },

        /**
        * Darkens the radio button when user's mouse enters
        * @method radioButtonEntered
        * @param{Object} the event properties
        * @private
        */
        radioButtonEntered: function (ev) {
            var $currentTarget = this.$(ev.currentTarget),
                radioElement = this.getImageContainer($currentTarget);
            if (this.$('.de-mathematics-interactive-theme2-radio-button .text-container').hasClass('disable-text') === false) {
                if (this.$($currentTarget).find('.theme2-radio-button-selceted-dot').hasClass('selected-state')) {
                    this.$($currentTarget).find('.theme2-radio-button-selceted-dot').css({
                        'background-color': this.model.get('hoverDotBackgroundColor')
                    });
                }
                if (this.$($currentTarget).hasClass('theme2-radio-button-selceted-dot-container')) {
                    $currentTarget.css({
                        'border-color': this.model.get('hoverDotContainerBorderColor'),
                        'box-shadow': '0 0 4px 0px rgba(0, 0, 0, .3) inset'
                    });

                    this.$($currentTarget.parent()).css({
                        'background-color': this.model.get('hoverEntireContainerBackgroundColor')
                    });
                }
                this.$($currentTarget).addClass('cursor-pointer');
            }
        },

        /**
        * Restores the radio button back to the state before the user's mouse entered
        * @method radioButtonLeft
        * @param{Object} the event properties
        * @private
        */
        radioButtonLeft: function (ev) {
            var $currentTarget = this.$(ev.currentTarget),
                radioElement = this.getImageContainer($currentTarget);
            if (this.$('.de-mathematics-interactive-theme2-radio-button .text-container').hasClass('disable-text') === false) {
                if (this.$(radioElement).find('.theme2-radio-button-selceted-dot').hasClass('selected-state')) {
                    this.$(radioElement).find('.theme2-radio-button-selceted-dot').css({
                        'background-color': this.model.get('dotBackgroundColor')
                    });
                }
                if (this.$($currentTarget).hasClass('theme2-radio-button-selceted-dot-container')) {
                    $currentTarget.css({
                        'border-color': this.model.get('dotContainerBorderColor'),
                        'box-shadow': 'none'
                    });
                    this.$($currentTarget.parent()).css({
                        'background-color': this.model.get('entireContainerBackgroundColor')
                    });
                }
                this.$($currentTarget).removeClass('cursor-pointer');
            }
        },

        /**
        * Gets the radio button element from the dom even if its corresponding label is clicked
        * @method getImageContainer
        * @param{DOM Element} The DOM Element that was clicked
        * @public
        */
        getImageContainer: function (currentTarget) {
            var radioElement = null;
            if (currentTarget.hasClass('text-container')) {
                radioElement = currentTarget.prev();
            } else {
                radioElement = currentTarget.parent();
            }
            return radioElement;
        },

        /**
        * Gets the radio button element from the dom even if its corresponding label is clicked
        * @method getDotContainer
        * @param{DOM Element} The DOM Element that was clicked
        * @public
        */
        getDotContainer: function (currentTarget) {
            var radioElement = null;
            if (currentTarget.hasClass('text-container')) {
                radioElement = currentTarget.prev();
            } else {
                radioElement = $(currentTarget).find('.theme2-radio-button-selceted-dot');
            }
            return radioElement;
        },

        /**
        * Aligns the radio buttons either horizontally or vertically
        * @method alignRadioButton
        * @param{String} The direction either horizontal or vertical
        * @param{Number} The margin-right to be given for each individual radio button container
        * @public
        */
        alignRadioButton: function (direction, gap) {
            var $singleRadioContainer = this.$('.de-mathematics-interactive-theme2-radio-button.single-theme2-radio-container'),
                $textContainer = $singleRadioContainer.find('.text-container');
            if (direction == 'vertical') {
                this.$($singleRadioContainer).removeClass('float-left');
                this.$($textContainer).removeClass('float-left');
            } else {
                this.$($singleRadioContainer).addClass('float-left');
                this.$($textContainer).addClass('float-left');
                if (gap == null) {
                    gap = 10;
                }
                this.$($singleRadioContainer).css({ 'margin-right': gap + 'px' });
            }
        },

        /**
        * Checks the radio buttons that the user has assigned to be by default checked. In case more than one is checked the last one will be checked
        * @method checkDefaultCheckedRadioButtons
        * @type public
        */
        checkDefaultCheckedRadioButtons: function () {
            var radioButtonDataCollection = this.model.get('radioButtonCollection'),
                radioButtonImages = this.getAllImageContainers(),
                curModel = null,
                curChild = null,
                counter = null,
                accID = null;
            for (counter = 0; counter < radioButtonDataCollection.length; counter++) {
                curModel = radioButtonDataCollection.models[counter];
                curChild = radioButtonImages[counter];
                accID = this.getAccIDByReplacingIdPrefix(this.$(curChild).attr('id'));
                if (accID == curModel.get('elementID') && curModel.get('selected') == true) {
                    this.resetRadioButtons();
                    this.$(curChild).find('.theme2-radio-button-selceted-dot').addClass('selected-state');
                    this.enableTab(accID, true);
                    // getting tab index
                    //this.resetTabIndices();
                    //this.setTabIndex(curModel.get('elementID'), this.tabIndex);
                } else {
                    this.enableTab(accID, false);
                }
            }
        },

        /**
        * Sets the initial state of the Radio buttons whether enabled or disabled
        * @method setInitialStateOfRadioButtons
        * @private
        */
        setInitialStateOfRadioButtons: function () {
            if (this.model.get('enabled')) {
                this.enableRadioButtons();
            } else {
                this.disableRadioButtons();
            }
        },

        /**
        * Enables all the Radio buttons
        * @method enableRadioButtons
        * @public
        */
        enableRadioButtons: function () {
            this.model.set({ 'enabled': true });
            this.$('.theme2-radio-button-selceted-dot-container').css('border-color', this.model.get('dotContainerBorderColor'));
            this.$('.de-mathematics-interactive-theme2-radio-button .text-container').removeClass('disable-text');
            this.$('.radio-button-div-container').css({
                'background-color': this.model.get('entireContainerBackgroundColor')
            });
            var radioButtonImages = this.getAllImageContainers(),
                curChild = null,
                counter = null;

            for (counter = 0; counter < radioButtonImages.length; counter++) {
                curChild = radioButtonImages[counter];

                if ($(curChild).find('.theme2-radio-button-selceted-dot').hasClass('selected-state') === true) {
                    $(curChild).find('.theme2-radio-button-selceted-dot').css({
                        'background-color': this.model.get('dotBackgroundColor')
                    });
                    break;
                }
            };
            this.enableTabIndices();
        },

        /**
        * Disables all the Radio buttons
        * @method disableRadioButtons
        * @public
        */
        disableRadioButtons: function () {
            this.model.set({ 'enabled': false });
            var radioButtonImages = this.getAllImageContainers(),
                counter = null,
                curChild = null;
            for (counter = 0; counter < radioButtonImages.length; counter++) {
                curChild = radioButtonImages[counter];

                if ($(curChild).find('.theme2-radio-button-selceted-dot').hasClass('selected-state') === true) {
                    $(curChild).find('.theme2-radio-button-selceted-dot').css({
                        'background-color': this.model.get('disabledDotBackgroundColor')
                    });
                    break;
                }
            }
            this.$('.radio-button-div-container').css({
                'background-color': this.model.get('disabledEntireContainerBackgroundColor')
            });
            this.$('.theme2-radio-button-selceted-dot-container').css('border-color', this.model.get('disabledDotContainerBorderColor'));
            this.$('.de-mathematics-interactive-theme2-radio-button .text-container').addClass('disable-text');
            this.resetTabIndices();
        },

        /**
        * Unchecks all radio buttons
        * @method resetRadioButtons
        * @public
        */
        resetRadioButtons: function () {
            this.$('.de-mathematics-interactive-theme2-radio-button .radio-button-div-container .theme2-radio-button-selceted-dot-container .theme2-radio-button-selceted-dot.selected-state').css({
                'background-color': 'transparent'
            });
            this.$('.de-mathematics-interactive-theme2-radio-button .radio-button-div-container .theme2-radio-button-selceted-dot-container .theme2-radio-button-selceted-dot').removeClass('selected-state');
            this.enableTabIndices();
            this.setTextForRadioBtnHack();
        },

        /**
        * Gets all the image containers
        * @method getAllImageContainers
        * @public
        */
        getAllImageContainers: function () {
            return $(this.$el).find('div.de-mathematics-interactive-theme2-radio-button.radio-button-div-container');
        },

        /**
        * Gets all the text containers
        * @method getAllTextContainers
        * @public
        */
        getAllTextContainers: function () {
            return $(this.$el).find('div.de-mathematics-interactive-theme2-radio-button .text-container');
        },

        /**
        * Selects a radio button according to its id
        * @method selectRadioButton
        * @param{String} the id of the radio button
        * @public
        */
        selectRadioButton: function (radioID) {
            this.stopReading();
            var radioButton = this.$('#' + this.idPrefix + radioID),
                $radioButton = this.$(radioButton).find('.theme2-radio-button-selceted-dot'),
                accID = null;
            if (radioButton != undefined && $radioButton.hasClass('selected-state') == false) {
                this.resetRadioButtons();
                $radioButton.addClass('selected-state');
                this.addSelectedState($radioButton);
                this.resetTabIndices();
                //accID = this.getAccIDByReplacingIdPrefix(this.$(radioButton.curChild).attr('id'));
                this.enableTab(radioID, true);
                this.triggerOnChangeEvent();
                this.setTextForRadioBtnHack();
            }
            this.setFocus(radioID);
        },

        /**
        * Deselects a radio button according to its id
        * @method deselectRadioButton
        * @param{String} the id of the radio button
        * @public
        */
        deselectRadioButton: function (radioID) {
            var radioButton = this.getCurrentRadioButtonAndModel(radioID, true);
            if (radioButton != undefined && radioButton.curChild != null) {
                this.$(radioButton.curChild).find('.theme2-radio-button-selceted-dot').removeClass('selected-state');
                this.readjustTabIndex();
                this.setTextForRadioBtnHack();
            }
        },

        /**
        * Returns the correct RadioButtonAndModel given the id and if it is currently selected or not
        * @method getCurrentRadioButtonAndModel
        * @param{String} the id of the image container
        * @param{Boolean} if the image container is currently selected or not
        * @public
        */
        getCurrentRadioButtonAndModel: function (id, selected) {
            var radioButtonDataCollection = this.model.get('radioButtonCollection'),
                radioButtonImages = this.getAllImageContainers(),
                curModel = null,
                counter = null,
                curChild = null,
                radioBut = {
                    curChild: null, curModel: null
                },
                bIsIdNull = false;
            if (id == null) {
                bIsIdNull = true;
            }
            for (counter = 0; counter < radioButtonDataCollection.length; counter++) {
                curModel = radioButtonDataCollection.models[counter];
                curChild = radioButtonImages[counter];
                if (bIsIdNull) {
                    id = this.$(curChild).attr('id');
                }
                id = this.getAccIDByReplacingIdPrefix(id);
                if (id == curModel.get('elementID') && this.$(curChild).find('.theme2-radio-button-selceted-dot').hasClass('selected-state') == selected) {
                    radioBut.curChild = curChild;
                    radioBut.curModel = curModel;
                    return radioBut;
                }
            }
        },

        /**
        * Returns the value of the radio button that is selected
        * @method getSelectedRadioButtonValue
        * @public
        */
        getSelectedRadioButtonValue: function () {
            var radioButton = this.getCurrentRadioButtonAndModel(null, true);
            if (radioButton != undefined && radioButton.curModel != null) {
                return radioButton.curModel.get('value');
            }
        },

        /**
        * Returns the id of the radio button that is selected
        * @method getSelectedRadioButtonID
        * @public
        */
        getSelectedRadioButtonID: function () {
            var radioButton = this.getCurrentRadioButtonAndModel(null, true);
            if (radioButton != undefined && radioButton.curModel != null) {
                return radioButton.curModel.get('elementID');
            }
        },

        /**
        * Processes KeyEvents
        * @method processKeyEvents
        * @param{Object} The event Object
        * @public
        */
        processKeyEvents: function (event) {
            if (this.model.get('enabled')) {
                switch (event.keyCode) {
                    case $.ui.keyCode.LEFT:
                        this.selectPrevRadioButton(event);
                        event.preventDefault();
                        break;
                    case $.ui.keyCode.RIGHT:
                        this.selectNextRadioButton(event);
                        event.preventDefault();
                        break;
                    case $.ui.keyCode.UP:
                        this.selectPrevRadioButton(event);
                        event.preventDefault();
                        break;
                    case $.ui.keyCode.DOWN:
                        this.selectNextRadioButton(event);
                        event.preventDefault();
                        break;
                    case $.ui.keyCode.SPACE:
                        this.selectRadioButton(this.$(event.currentTarget).attr('id').replace(this.idPrefix, ''));
                        event.preventDefault();
                        break;
                }
            }
        },

        /**
        * Selects the next radio button in the list and cycles back to the first if it has reached the last
        * @method selectNextRadioButton
        * @param{Object} The event Object
        * @public
        */
        selectNextRadioButton: function (event) {
            this.stopReading();
            var radioButtonDataCollection = this.model.get('radioButtonCollection'),
                radioButtonImages = this.getAllImageContainers(),
                isSelected = false,
                counter = null,
                curChild = null;
            for (counter = 0; counter < radioButtonImages.length; counter++) {
                curChild = radioButtonImages[counter];
                if (this.$(curChild).find('.theme2-radio-button-selceted-dot').hasClass('selected-state')) {
                    isSelected = true;
                    break;
                }
            }
            // if nothing is selected
            if (isSelected === false) {
                this.selectAppropriateRadioButton(event.currentTarget, false, 1, radioButtonDataCollection.length - 1, 0);
            } else {
                // else if something is selected
                this.selectAppropriateRadioButton(null, true, 1, radioButtonDataCollection.length - 1, 0);
            }
            this.triggerOnChangeEvent();
        },

        /**
        * Selects the previous radio button in the list and cycles back to the last if it has reached the first
        * @method selectPrevRadioButton
        * @param{Object} The event Object
        * @public
        */
        selectPrevRadioButton: function (event) {
            this.stopReading();
            var radioButtonDataCollection = this.model.get('radioButtonCollection'),
                radioButtonImages = this.getAllImageContainers(),
                isSelected = false,
                counter = null,
                curChild = null;
            for (counter = 0; counter < radioButtonImages.length; counter++) {
                curChild = radioButtonImages[counter];
                if (this.$(curChild).find('.theme2-radio-button-selceted-dot').hasClass('selected-state')) {
                    isSelected = true;
                    break;
                }
            }
            // if nothing is selected
            if (isSelected === false) {
                this.selectAppropriateRadioButton(event.currentTarget, false, -1, 0, radioButtonDataCollection.length - 1);
            } else {
                // something is selected
                this.selectAppropriateRadioButton(null, true, -1, 0, radioButtonDataCollection.length - 1);
            }
            this.triggerOnChangeEvent();
        },

        /**
        * Selects the Appropriate Radio Button according to the passed parameters
        * @method selectAppropriateRadioButton
        * @param{String} The id of the passed element
        * @param{Boolean} If the passed element has selected class or not
        * @param{Number} To go forward pass 1 and back pass -1
        * @param{Number} The boundary condition to be checked (for next pass length - 1 and for prev pass 0)
        * @param{Number} The value to be chosen (for prev pass length - 1 and for next pass 0)
        * @public
        */
        selectAppropriateRadioButton: function (id, selected, increment, flipNo, changeNo) {
            var radioButtonDataCollection = this.model.get('radioButtonCollection'),
                radioButtonImages = this.getAllImageContainers(),
                curModel = null,
                counter = null,
                curChild = null,
                bIsIdNull = false;
            if (id == null) {
                bIsIdNull = true;
            }
            for (counter = 0; counter < radioButtonDataCollection.length; counter++) {
                curModel = radioButtonDataCollection.models[counter];
                curChild = radioButtonImages[counter];
                if (bIsIdNull) {
                    id = curChild;
                }
                if (this.getAccIDByReplacingIdPrefix(this.$(id).attr('id')) === curModel.get('elementID') && this.$(curChild).find('.theme2-radio-button-selceted-dot').hasClass('selected-state') === selected) {

                    this.$(curChild).find('.theme2-radio-button-selceted-dot').removeClass('selected-state');
                    if (counter == flipNo) {
                        curChild = radioButtonImages[changeNo];
                        curModel = radioButtonDataCollection.models[changeNo];
                    } else {
                        curChild = radioButtonImages[counter + increment];
                        curModel = radioButtonDataCollection.models[counter + increment];
                    }
                    this.$(curChild).find('.theme2-radio-button-selceted-dot').addClass('selected-state');
                    this.addSelectedState(this.$(curChild).find('.theme2-radio-button-selceted-dot'));
                    //this.resetTabIndices();
                    //this.setTabIndex(curModel.get('elementID'), this.tabIndex);
                    this.setTextForRadioBtnHack();
                    this.setFocus(curModel.get('elementID'));
                    break;
                }
            }
        },

        /**
        * Sets the tab index of all the elements to -1
        * @method resetTabIndices
        * @public
        */
        resetTabIndices: function () {
            var radioButtonDataCollection = this.model.get('radioButtonCollection'),
                counter = null,
                curModel = null;
            for (counter = 0; counter < radioButtonDataCollection.length; counter++) {
                curModel = radioButtonDataCollection.models[counter];
                this.enableTab(curModel.get('elementID'), false);
            }
        },

        /**
        * enable tab index of all elements
        * @method enableTabIndices
        * @public
        */
        enableTabIndices: function enableTabIndices() {
            var radioButtonDataCollection = this.model.get('radioButtonCollection'),
                radioButtonImages = this.getAllImageContainers(),
                curModel = null,
                counter = null,
                curChild = null;
            for (counter = 0; counter < radioButtonDataCollection.length; counter++) {
                curChild = radioButtonImages[counter];
                curModel = radioButtonDataCollection.models[counter];
                if (this.$(curChild).find('.theme2-radio-button-selceted-dot').hasClass('selected-state')) {
                    this.enableTab(curModel.get('elementID'), true);
                } else {
                    if (typeof this.getSelectedRadioButtonID() !== 'undefined') {
                        this.enableTab(curModel.get('elementID'), false);
                    } else {
                        this.enableTab(curModel.get('elementID'), true);
                    }
                }
            }
        },

        /**
        * Triggers the event radioButtonChanged
        * @method triggerOnChangeEvent
        * @public
        */
        triggerOnChangeEvent: function () {
            this.trigger(MathInteractives.Common.Components.Theme2.Views.RadioButton.SELECTION_CHANGED, this.getSelectedRadioButtonValue());
        },

        /**
        * Sets the width of the labels that have been assigned value
        * @method setWidthOfGivenLabels
        * @public
        */
        setWidthOfGivenLabels: function () {
            var radioButtonDataCollection = this.model.get('radioButtonCollection'),
                curModel = null,
                counter = null,
                radioButtonLabels = this.getAllTextContainers(),
                curChild = null;
            for (counter = 0; counter < radioButtonDataCollection.length; counter++) {
                curModel = radioButtonDataCollection.models[counter];
                curChild = radioButtonLabels[counter];
                if (curModel.get('labelWidth') != null) {
                    this.$(curChild).css({ 'width': curModel.get('labelWidth') + 'px' });
                }
            }
        },

        /**
        * Gets acc id by replacing the id prefix in the id
        * @method getAccIDByReplacingIdPrefix
        * @param{String} The id of the DOM Element
        * @public
        */
        getAccIDByReplacingIdPrefix: function (domElementId) {
            return domElementId.replace(this.idPrefix, '');
        }

    }, {
        /*
        * to generate button as per the given requirement
        * @method generateRadioButton
        * @param {object} radiobuttonProps
        * @static
        */
        generateRadioButton: function (radioButtonProps) {
            var radioBtnID;
            if (radioButtonProps) {
                radioBtnID = '#' + radioButtonProps.id;
                var radioButtonModel = new MathInteractives.Common.Components.Theme2.Models.RadioButton(radioButtonProps);
                var radioButtonView = new MathInteractives.Common.Components.Theme2.Views.RadioButton({ el: radioBtnID, model: radioButtonModel });

                return radioButtonView;
            }
        },

        /**
        * event name for selection changed
        * @property SELECTION_CHANGED
        * @static
        */
        SELECTION_CHANGED: 'selection-changed'
    });

    MathInteractives.global.Theme2.RadioButton = MathInteractives.Common.Components.Theme2.Views.RadioButton;

})();
