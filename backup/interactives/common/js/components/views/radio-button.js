(function () {
    'use strict';

    /**
    * View for rendering button and its related events
    *
    * @class RadioButton
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.RadioButton = MathInteractives.Common.Player.Views.Base.extend({
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
                radioButtonLabel = [];
            for (var i = 0; i < radioButtonDataCollection.length; i++) {
                curModel = radioButtonDataCollection.models[i];
                radioButtonLabel.push({ 'radioID': this.idPrefix + curModel.get('elementID'), 'text': curModel.get('text') });
            }
            this.$el.html(MathInteractives.Common.Components.templates.radioButton({ 'radioButtonLabel': radioButtonLabel
            }).trim());
            this.setWidthOfGivenLabels();
            this.loadScreen(this.screenID);
            this.$('.image-container').css({ 'background-image': 'url("' + this.filePath.getImagePath('radio-button-states') + '")' });
            this.setInitialTabIndex();
            this.alignRadioButton(this.model.get('direction'), this.model.get('gapBetweenRadioButtonContainers'));
            this.checkDefaultCheckedRadioButtons();
            this.setInitialStateOfRadioButtons();
        },
        /**
        * Binds all the necessary events with their respective function
        */
        events: {
            'click .radio-elements': 'radioButtonClicked',
            'mouseenter .radio-elements': 'radioButtonEntered',
            'mouseleave .radio-elements': 'radioButtonLeft',
            'keydown .radio-elements': 'processKeyEvents'
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
                var $currentTarget = this.$(ev.currentTarget),
                    radioElement = this.getImageContainer($currentTarget);
                if (this.$(radioElement).hasClass('selected') == false) {
                    this.resetRadioButtons();
                    this.$(radioElement).addClass('selected');
                    this.resetTabIndices();
                    accID = this.getAccIDByReplacingIdPrefix(this.$(radioElement).attr('id'));
                    this.setTabIndex(accID, this.tabIndex);
                    this.triggerOnChangeEvent();
                }
                accID = this.getAccIDByReplacingIdPrefix(this.$(radioElement).attr('id'));
                this.setFocus(accID);
            }
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
            this.$(radioElement).addClass('hover');
            this.$($currentTarget).addClass('cursor-pointer');
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
            this.$(radioElement).removeClass('hover');
            this.$($currentTarget).removeClass('cursor-pointer');
        },
        /**
        * Gets the radio button element from the dom even if its corresponding label is clicked
        * @method getImageContainer
        * @param{DOM Element} The DOM Element that was clicked
        * @private
        */
        getImageContainer: function (currentTarget) {
            var radioElement = null;
            if (currentTarget.hasClass('text-container')) {
                radioElement = currentTarget.prev();
            } else {
                radioElement = currentTarget;
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
            var $singleRadioContainer = this.$('.de-mathematics-interactive-radio-button .single-radio-container');
            if (direction == 'vertical') {
                this.$($singleRadioContainer).removeClass('float-left');
            } else {
                this.$($singleRadioContainer).addClass('float-left');
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
                accID = null;
            for (var i = 0; i < radioButtonDataCollection.length; i++) {
                curModel = radioButtonDataCollection.models[i];
                curChild = radioButtonImages[i];
                accID = this.getAccIDByReplacingIdPrefix(this.$(curChild).attr('id'));
                if (accID == curModel.get('elementID') && curModel.get('selected') == true) {
                    this.resetRadioButtons();
                    this.$(curChild).addClass('selected');
                    // getting tab index
                    this.resetTabIndices();
                    this.setTabIndex(curModel.get('elementID'), this.tabIndex);
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
            this.$('.de-mathematics-interactive-radio-button .image-container').removeClass('disabled');
            this.$('.de-mathematics-interactive-radio-button .text-container').removeClass('disable-text');

            var radioButtonImages = this.getAllImageContainers(),
                accID = null;
            // if nothing is selected
            if (this.$(radioButtonImages).hasClass('selected') == true) {
                var radioButton = this.getCurrentRadioButtonAndModel(null, true);
                if (radioButton != undefined && radioButton.curChild != null) {
                    this.resetTabIndices();
                    accID = this.getAccIDByReplacingIdPrefix(this.$(radioButton.curChild).attr('id'));
                    this.setTabIndex(accID, this.tabIndex);
                }
            } else if (this.DoesAnyElementHaveTabIndex() == false) {
                var eleWithSmallestTabIndex = this.getImageContainerWithSmallestTabIndex();
                accID = this.getAccIDByReplacingIdPrefix(this.$(eleWithSmallestTabIndex).attr('id'));
                this.setTabIndex(accID, this.tabIndex);
            }
        },
        /**
        * Disables all the Radio buttons
        * @method disableRadioButtons
        * @public
        */
        disableRadioButtons: function () {
            this.model.set({ 'enabled': false });
            this.$('.de-mathematics-interactive-radio-button .image-container').addClass('disabled');
            this.$('.de-mathematics-interactive-radio-button .text-container').addClass('disable-text');
            this.resetTabIndices();
        },
        /**
        * Unchecks all radio buttons
        * @method resetRadioButtons
        * @public
        */
        resetRadioButtons: function () {
            this.$('.de-mathematics-interactive-radio-button .image-container').removeClass('selected');
        },
        /**
        * Gets all the image containers
        * @method getAllImageContainers
        * @public
        */
        getAllImageContainers: function () {
            return $(this.$el).find('div.de-mathematics-interactive-radio-button.image-container');
        },
        /**
        * Gets all the text containers
        * @method getAllTextContainers
        * @public
        */
        getAllTextContainers: function () {
            return $(this.$el).find('div.de-mathematics-interactive-radio-button.text-container');
        },
        /**
        * Selects a radio button according to its id
        * @method selectRadioButton
        * @param{String} the id of the radio button
        * @public
        */
        selectRadioButton: function (radioID) {
            var radioButton = this.getCurrentRadioButtonAndModel(radioID, false),
                accID = null;
            if (radioButton != undefined && radioButton.curChild != null && this.$(radioButton.curChild).hasClass('selected') == false) {
                this.resetRadioButtons();
                this.$(radioButton.curChild).addClass('selected');
                this.resetTabIndices();
                accID = this.getAccIDByReplacingIdPrefix(this.$(radioButton.curChild).attr('id'));
                this.setTabIndex(accID, this.tabIndex);
                this.triggerOnChangeEvent();
            }
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
                this.$(radioButton.curChild).removeClass('selected');
                this.resetTabIndices();
            }
        },
        /**
        * Returns the correct RadioButtonAndModel given the id and if it is currently selected or not
        * @method getCurrentRadioButtonAndModel
        * @param{String} the id of the image container
        * @param{Boolean} if the image container is currently selected or not
        */
        getCurrentRadioButtonAndModel: function (id, selected) {
            var radioButtonDataCollection = this.model.get('radioButtonCollection'),
                radioButtonImages = this.getAllImageContainers(),
                curModel = null,
                curChild = null,
                radioBut = {
                    curChild: null, curModel: null
                },
                bIsIdNull = false;
            if (id == null) {
                bIsIdNull = true;
            }
            for (var i = 0; i < radioButtonDataCollection.length; i++) {
                curModel = radioButtonDataCollection.models[i];
                curChild = radioButtonImages[i];
                if (bIsIdNull) {
                    id = this.$(curChild).attr('id');
                }
                id = this.getAccIDByReplacingIdPrefix(id);
                if (id == curModel.get('elementID') && this.$(curChild).hasClass('selected') == selected) {
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
        * @private
        */
        processKeyEvents: function (event) {
            switch (event.keyCode) {
                case $.ui.keyCode.LEFT:
                    console.log("left");
                    this.selectPrevRadioButton(event);
                    event.preventDefault();
                    break;
                case $.ui.keyCode.RIGHT:
                    console.log("right");
                    this.selectNextRadioButton(event);
                    event.preventDefault();
                    break;
                case $.ui.keyCode.UP:
                    console.log("up");
                    this.selectPrevRadioButton(event);
                    event.preventDefault();
                    break;
                case $.ui.keyCode.DOWN:
                    console.log("down");
                    this.selectNextRadioButton(event);
                    event.preventDefault();
                    break;
                case $.ui.keyCode.SPACE:
                    console.log("space");
                    this.selectRadioButton(this.$(event.currentTarget).attr('id'));
                    event.preventDefault();
                    break;
            }
        },
        /**
        * Selects the next radio button in the list and cycles back to the first if it has reached the last
        * @method selectNextRadioButton
        * @param{Object} The event Object
        * @private
        */
        selectNextRadioButton: function (event) {
            var radioButtonDataCollection = this.model.get('radioButtonCollection'),
                radioButtonImages = this.getAllImageContainers();
            // if nothing is selected
            if (this.$(radioButtonImages).hasClass('selected') == false) {
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
        * @private
        */
        selectPrevRadioButton: function (event) {
            var radioButtonDataCollection = this.model.get('radioButtonCollection'),
                radioButtonImages = this.getAllImageContainers();
            // if nothing is selected
            if (this.$(radioButtonImages).hasClass('selected') == false) {
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
                curChild = null,
                bIsIdNull = false;
            if (id == null) {
                bIsIdNull = true;
            }
            for (var i = 0; i < radioButtonDataCollection.length; i++) {
                curModel = radioButtonDataCollection.models[i];
                curChild = radioButtonImages[i];
                if (bIsIdNull) {
                    id = curChild;
                }
                if (this.getAccIDByReplacingIdPrefix(this.$(id).attr('id')) == curModel.get('elementID') && this.$(curChild).hasClass('selected') == selected) {
                    this.$(curChild).removeClass('selected');
                    if (i == flipNo) {
                        curChild = radioButtonImages[changeNo];
                        curModel = radioButtonDataCollection.models[changeNo];
                    } else {
                        curChild = radioButtonImages[i + increment];
                        curModel = radioButtonDataCollection.models[i + increment];
                    }
                    this.$(curChild).addClass('selected');
                    this.resetTabIndices();
                    this.setTabIndex(curModel.get('elementID'), this.tabIndex);
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
                curModel = null;
            for (var i = 0; i < radioButtonDataCollection.length; i++) {
                curModel = radioButtonDataCollection.models[i];
                this.setTabIndex(curModel.get('elementID'), -1)
            }
        },
        /**
        * Resets all elements other than the one with the smallest tabindex to -1 and stores that smallest tabindex
        * @method setInitialTabIndex
        * @public
        */
        setInitialTabIndex: function () {
            var eleWithSmallestTabIndex = this.getImageContainerWithSmallestTabIndex(),
                accID = this.getAccIDByReplacingIdPrefix(this.$(eleWithSmallestTabIndex).attr('id'));
            this.tabIndex = this.getTabIndex(accID);
            this.resetTabIndicesExceptSmallestElement(eleWithSmallestTabIndex);
        },
        /**
        * Gets the Image Container element with the smallest tab index
        * @method getImageContainerWithSmallestTabIndex
        * @public
        */
        getImageContainerWithSmallestTabIndex: function () {
            var radioButtonImages = this.getAllImageContainers(),
                curChild = null,
                accID = this.getAccIDByReplacingIdPrefix(this.$(radioButtonImages[0]).attr('id')),
                tabIn = this.getTabIndex(accID),
                eleWithSmallestTabIndex = radioButtonImages[0];
            for (var i = 1; i < radioButtonImages.length; i++) {
                curChild = radioButtonImages[i];
                accID = this.getAccIDByReplacingIdPrefix(this.$(curChild).attr('id'));
                if (this.getTabIndex(accID) < tabIn) {
                    tabIn = this.getTabIndex(this.getAccIDByReplacingIdPrefix(this.$(curChild).attr('id')));
                    eleWithSmallestTabIndex = curChild;
                }
            }
            return eleWithSmallestTabIndex;
        },
        /**
        * Resets all elements other than the one with the smallest tabindex to -1
        * @method resetTabIndicesExceptSmallestElement
        * @param{DOM ELEMENT} The image container with the smallest tab index
        * @public
        */
        resetTabIndicesExceptSmallestElement: function (eleWithSmallestTabIndex) {
            var radioButtonImages = this.getAllImageContainers(),
                curChild = null,
                accID = null;
            for (var i = 0; i < radioButtonImages.length; i++) {
                curChild = radioButtonImages[i];
                if (curChild != eleWithSmallestTabIndex) {
                    accID = this.getAccIDByReplacingIdPrefix(this.$(curChild).attr('id'));
                    this.setTabIndex(accID, -1);
                }
            }
        },
        /**
        * Triggers the event radioButtonChanged
        * @method triggerOnChangeEvent
        * @private
        */
        triggerOnChangeEvent: function () {
            this.trigger(MathInteractives.Common.Components.Views.RadioButton.SELECTION_CHANGED, this.getSelectedRadioButtonValue());
        },
        /**
        * Sets the width of the labels that have been assigned value
        * @method setWidthOfGivenLabels
        * @private
        */
        setWidthOfGivenLabels: function () {
            var radioButtonDataCollection = this.model.get('radioButtonCollection'),
                curModel = null,
                radioButtonLabels = this.getAllTextContainers(),
                curChild = null;
            for (var i = 0; i < radioButtonDataCollection.length; i++) {
                curModel = radioButtonDataCollection.models[i];
                curChild = radioButtonLabels[i];
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
        },
        /**
        * Checks if any element has tab-index
        * @method DoesAnyElementHaveTabIndex
        * @public
        */
        DoesAnyElementHaveTabIndex: function () {
            var radioButtonImages = this.getAllImageContainers(),
                curChild = null;
            for (var i = 0; i < radioButtonImages.length; i++) {
                curChild = radioButtonImages[i];
                if (this.getTabIndex(this.getAccIDByReplacingIdPrefix(this.$(curChild).attr('id'))) != -1) {
                    return true;
                }
            }
            return false;
        }
    }, {
        /*
        * to generate button as per the given requirement
        * @method generateRadioButton
        * @param {object} radiobuttonProps
        */
        generateRadioButton: function (radioButtonProps) {
            var radioBtnID;
            if (radioButtonProps) {
                radioBtnID = '#' + radioButtonProps.id;
                var radioButtonModel = new MathInteractives.Common.Components.Models.RadioButton(radioButtonProps),
                    radioButtonCollectionData = radioButtonModel.get('radioButtonCollection');
                for (var i = 0; i < radioButtonProps.elementData.length; i++) {
                    radioButtonCollectionData.add(radioButtonProps.elementData[i]);
                }
                var radioButtonView = new MathInteractives.Common.Components.Views.RadioButton({ el: radioBtnID, model: radioButtonModel });

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

})();
