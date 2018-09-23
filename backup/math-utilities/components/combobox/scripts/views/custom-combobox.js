(function() {
    'use strict';

    MathUtilities.Components.Combobox.Views = {};
    /**
     *
     * @class CustomCombobox
     * @constructor
     * @extends MathUtilities.Player.Views.Base
     * @namespace MathUtilities.Components.Views
     **/
    MathUtilities.Components.Combobox.Views.CustomCombobox = Backbone.View.extend({
        /* 
         * Element into which all the Select/Option tags are to be made as custom.
         * @property contextElement
         * @type Object
         * @defaults null
         */
        "contextElement": null,
        /*
         * holds height of the main container passed during setContextElement
         */
        "containerHt": null,
        /* 
         * manager object
         * @property _manager
         * @type Object
         * @defaults null
         */
        "_manager": null,

        /**
         * @property screenID for combobox (for different calls in one interactive)
         * @type string
         * @defaults 'combobox'
         */
        "_screenID": 'combobox',

        /** holds data related to options inside all comboboxes
         * @property items
         * @type object
         * @defaults object
         */
        "items": {},
        /**
         * @property groups
         * @type object
         * @defaults object
         */
        "groups": {},
        /**
         * @property openComboBoxes
         * @type object
         * @defaults object
         */
        "openComboBoxes": {},
        /**
         * @property selectedIndex
         * @type object
         * @defaults object
         */
        "selectedIndex": {},
        /** collection of models related to each combobox
         * @property comboCollection
         * @type object
         * @defaults null
         */
        "comboCollection": null,
        /**
         * @property highlightedIndex
         * @type int
         * @defaults -1
         */
        "highlightedIndex": -1,
        /**
         * @property ignoreBlur
         * @type bollean
         * @defaults false
         */
        "ignoreBlur": false,
        /**
         * @property touchOnCombo
         * @type boolean
         * @defaults false
         */
        "touchOnCombo": false,
        /** duration for showing hint
         * @property hintDelay
         * @type int
         * @defaults 600
         */
        "hintDelay": 600,
        /** whether to enable disabled item selection
         * @property disabledItemsSelectionEnabled
         * @type boolean
         * @defaults false
         */
        "disabledItemsSelectionEnabled": false,

        "initialize": function initialize() {

            this.hintElement = $('<span class="combo-hint math-utilities-tools"></span>');
            $('body').append(this.hintElement);
            this.tempDiv = $('<div>', {
                "id": 'CustomComboTempFocusDiv'
            });
            $('body').append(this.tempDiv);
            var self = this;
            this.defaultEventPrevented = false;
            window.addEventListener('mousedown', function() {
                self.defaultEventPrevented = false;
            });
            window.addEventListener('touchstart', function() {
                self.defaultEventPrevented = false;
            });
        },

        /**
         * Setter function for property contextElement
         * @method setContextElement
         * @param element {Object} Jquery element to be set as context element within which combo-boxes are to be replaced
         */
        "setContextElement": function(element, containerHt) {
            if (typeof containerHt !== 'undefined') {
                this.containerHt = containerHt;
            }
            this.contextElement = element;
        },

        /**
         * Getter function for property contextElement
         * @method getContextElement
         * @return {Object} Jquery element set as context element within which combo-boxes are replaced
         */
        "getContextElement": function() {
            return this.contextElement;
        },

        /**
        * Public method called to parse through DOM within set context and replace all select elements with custom
        combo boxes.
        * @method parseDOM
        */
        "parseDOM": function() {
            if (this.contextElement) {
                this._replaceAllComboBoxes();
            }
        },

        /**
         * Searches for all select tags within the set context and calls _replaceComboBox for each
         * @method _replaceAllComboBoxes
         * @private
         */
        "_replaceAllComboBoxes": function() {
            var self = this;
            $(this.contextElement.find('select')).each(function() {
                self._replaceComboBox(this.id);
            });
        },

        /**
         * Removes the select tag with specified id from DOM and stores all its data
         * @method _replaceComboBox
         * @param id {String} The ID of the select tag to be replaced with the custom combo box
         * @private
         */
        "_replaceComboBox": function(id) {
            var self = this,
                timeId = null,
                docScrollTop, docScrollLeft,
                enterFn = function(event) {
                    docScrollTop = window.scrollY || 0;
                    docScrollLeft = window.scrollX || 0;
                    leaveFn();
                    if ($(this).hasClass('customComboDisabled')) {
                        return;
                    }
                    var htmlString, id = $(this).attr('id'),
                        $defaultText = $('#' + id + '-default-text');
                    htmlString = $('#' + id + '-selected-item').html();
                    if ($defaultText.css('display') !== 'none') {
                        htmlString = $defaultText.html();
                    }
                    htmlString = htmlString.replace(/&nbsp;/g, '');

                    timeId = setTimeout(function() {
                        self.showHint(htmlString, id);
                    }, self.hintDelay);
                    self.setPos(event.clientX + docScrollLeft + 15, event.clientY + docScrollTop + 15);
                },

                leaveFn = function() {
                    self.hideHint();
                    clearTimeout(timeId);
                },

                isTouchDevice = this.isTouchDevice();

            $('#' + id).each(function() { // each function used to change this context
                var $this = $(this),
                    $element,
                    cssPosition,
                    optionData,
                    data,
                    optGroupData,
                    optGroupChildren,
                    optGroupChild,
                    length2,
                    linear,
                    selectChildrenArray,
                    length,
                    i,
                    j,
                    $div = $('<div>');
                cssPosition = $this.css('position');
                // clone this to $div
                $div.attr('name', $this.attr('name'))
                    .attr('class', $this.attr('class'))
                    .attr('style', $this.attr('style'))
                    .addClass('customCombo')
                    .css('position', cssPosition)
                    .attr('id', this.id)
                    .insertAfter('#' + this.id);


                if (cssPosition !== 'absolute' && cssPosition !== 'relative') {
                    $div.css('position', 'relative');
                }

                //bind hover events for displaying hint
                if (!isTouchDevice) {
                    $div.on('mousemove', enterFn)
                        .on('mouseleave', leaveFn)
                        .on('click', leaveFn);
                }

                data = [];
                linear = [];
                selectChildrenArray = $this.find('option');
                length = selectChildrenArray.length;

                self.selectedIndex[this.id] = length === 0 ? -1 : 0;

                for (i = 0; i < length; i++) {
                    $element = $(selectChildrenArray[i]);
                    if ($element.is('option')) {

                        optionData = {};
                        optionData.value = $element.attr('value');
                        optionData.text = $element.html();
                        if (self._manager !== null) {
                            optionData.acc = self._manager.getAccMessage(id, i);
                        }
                        optionData.enabled = $element.attr('disabled') !== 'disabled';
                        optionData.isOptGroupChild = false;

                        data.push(optionData);
                        linear.push(optionData);
                        if ($element.attr('selected') === 'selected') {
                            self.selectedIndex[this.id] = linear.length - 1;
                        }
                    } else if ($element.is('optgroup')) {
                        optGroupData = {};
                        optGroupData.label = $element.attr('label');
                        optGroupData.data = [];
                        optGroupChildren = $element.children();
                        length2 = optGroupChildren.length;
                        for (j = 0; j < length2; j++) {
                            optGroupChild = $(optGroupChildren[j]);
                            if (optGroupChild.is('option')) {

                                optionData = {};
                                optionData.value = optGroupChild.attr('value');
                                optionData.text = optGroupChild.html();
                                if (self._manager !== null) {
                                    optionData.acc = self._manager.getAccMessage(id, i);
                                }
                                optionData.enabled = optGroupChild.attr('disabled') !== 'disabled';
                                optionData.isOptGroupChild = true;

                                linear.push(optionData);

                                if (optGroupChild.attr('selected') === 'selected') {
                                    self.selectedIndex[this.id] = linear.length - 1;
                                }
                                optGroupData.data.push(optionData);
                            }
                        }
                        data.push(optGroupData);
                    }
                }
                $(this).remove();

                self._addComboBox(this.id, data, linear);
                self._adjustWidth(this.id);

            });
        },

        /**
        * Creates and places the custom combo box DIVs in the DOM
        * @method _addComboBox
        * @param containerID {String} The ID of the select tag being replaced
        * @param dataArray {Array} An array of Objects containing data about the select tag's children (options & optGroups)
        * @param linearData {Array} An array of Objects containing data about the select tag's options in the sequence
        in which they appear (no optGroup data)
        * @private
        */
        "_addComboBox": function(containerID, dataArray, linearData) {

            //get select tag data
            this.items[containerID] = {
                "data": dataArray,
                "linear": linearData
            };

            var combo = this.getContextElement().find('#' + containerID)[0],
                $combo = $(combo),
                comboHolder = document.createElement('div'),
                objSetterGetters,
                selectedItem,
                option,
                $option,
                imagePath,
                defaultTextEle,
                $defaultTextEle,
                selectedItemIndex,
                defaultText,
                self = this;

            $combo.data('customDisabled', false);

            /* ----------------------- Add custom properties to comboBox div ----------------------- */
            objSetterGetters = this.getSetterGetterFunctions();
            try {
                Object.defineProperty(combo, 'selectedIndex', {
                    "get": objSetterGetters.getSelectedIndex,
                    "set": objSetterGetters.setSelectedIndex
                });
                Object.defineProperty(combo, 'selectedValue', {
                    "get": objSetterGetters.getSelectedValue,
                    "set": objSetterGetters.setSelectedValue
                });
                Object.defineProperty(combo, 'arrOptions', {
                    "get": objSetterGetters.getarrOptions,
                    "set": objSetterGetters.setarrOptions
                });
                Object.defineProperty(combo, 'disabled', {
                    "get": objSetterGetters.getDisabled,
                    "set": objSetterGetters.setDisabled
                });
                Object.defineProperty(combo, 'group', {
                    "get": objSetterGetters.getGroupName,
                    "set": objSetterGetters.setGroupName
                });
            } catch (e) {
                //Since object.defineProperty is not supported on dom objects in iOS 4.3.5
                combo.__defineGetter__('selectedIndex', objSetterGetters.getSelectedIndex);
                combo.__defineSetter__('selectedIndex', objSetterGetters.setSelectedIndex);

                combo.__defineGetter__('selectedValue', objSetterGetters.getSelectedValue);
                combo.__defineSetter__('selectedValue', objSetterGetters.setSelectedValue);

                combo.__defineGetter__('arrOptions', objSetterGetters.getarrOptions);
                combo.__defineSetter__('arrOptions', objSetterGetters.setarrOptions);

                combo.__defineGetter__('disabled', objSetterGetters.getDisabled);
                combo.__defineSetter__('disabled', objSetterGetters.setDisabled);

                combo.__defineGetter__('group', objSetterGetters.getGroupName);
                combo.__defineSetter__('group', objSetterGetters.setGroupName);
            }
            /* ----------------- End of 'Add custom properties to comboBox div' ----------------- */


            $combo.on('enableDisableCombo', function() {
                    var disable = $(this).data('customDisabled');
                    self.enableDisableCombobox(this.id, disable);
                    // call enable or disable
                })
                .on('comboGroupChange', function() {
                    self._adjustWidth(this.id);
                });

            comboHolder.id = containerID + '-combo-holder';

            //adding tabindex of parent to this container..needs to be changed later
            $(comboHolder).addClass('customComboHolder');

            selectedItem = document.createElement('div');

            selectedItem.id = containerID + '-selected-item';
            $(selectedItem).addClass('customComboSelectedItem typography-label').css('line-height', parseInt($combo.height() - 2, 10) + 'px');

            option = document.createElement('div');
            $option = $(option);
            imagePath = this.comboCollection[$(combo).attr('id')].get('imagePath');
            $option.addClass('customComboButton').addClass('customComboButtonImage');
            if (imagePath !== null && typeof imagePath !== 'undefined' && imagePath.trim().length !== 0) {
                $option.css('background-image', 'url(' + this.comboCollection[$combo.attr('id')].get('imagePath') + ')');
            }

            combo.appendChild(comboHolder);

            comboHolder.appendChild(selectedItem);
            comboHolder.appendChild(option);

            $(comboHolder).css('height', $(combo).height() - 2); //2px padding bottom top

            selectedItemIndex = this.comboCollection[$(combo).attr('id')].get('selectedItem');
            defaultText = this.comboCollection[$(combo).attr('id')].get('defaultText');

            if ((selectedItemIndex === null || typeof selectedItemIndex === 'undefined') && (defaultText === null || typeof defaultText === 'undefined')) {
                selectedItemIndex = 0;
            }

            $combo.on('click', $.proxy(this._openDropDown, this))
                .on('keydown', $.proxy(this.onKeyDown, this))
                .on('mousedown', function() {
                    $('#' + this.id + '-combo-holder > .customComboButton')
                        .removeClass('customComboButtonImage')
                        .removeClass('customComboButtonImageHover').addClass('customComboButtonImageActive');
                })
                .on('mouseover', function() {
                    $('#' + this.id + '-combo-holder > .customComboButton')
                        .removeClass('customComboButtonImage')
                        .removeClass('customComboButtonImageActive').addClass('customComboButtonImageHover');
                })
                .on('mouseup', function() {
                    $('#' + this.id + '-combo-holder > .customComboButton')
                        .removeClass('customComboButtonImage')
                        .removeClass('customComboButtonImageActive').addClass('customComboButtonImageHover');
                })
                .on('mouseout', function() {
                    $('#' + this.id + '-combo-holder > .customComboButton')
                        .removeClass('customComboButtonImageHover')
                        .removeClass('customComboButtonImageActive').addClass('customComboButtonImage');
                })
                .on('touchend', function() {
                    var strThisId = this.id,
                        setter = setTimeout(function() {
                            $('#' + strThisId + '-combo-holder > .customComboButton')
                                .removeClass('customComboButtonImageHover')
                                .removeClass('customComboButtonImageActive').addClass('customComboButtonImage');
                            clearTimeout(setter);
                        }, 50);
                });

            defaultTextEle = document.createElement('div');
            defaultTextEle.id = containerID + '-default-text';
            $defaultTextEle = $(defaultTextEle);
            $defaultTextEle.addClass('customComboDefaultText typography-label').append(defaultText)
                .css({
                    'width': $combo.width() - $option.width()
                });
            $combo.append(defaultTextEle);
            $(selectedItem).css({
                'width': $combo.width() - $option.width()
            });

            if (selectedItemIndex !== null && typeof selectedItemIndex !== 'undefined' && selectedItemIndex >= 0) {
                $combo.prop('selectedIndex', selectedItemIndex);
                $defaultTextEle.empty().hide();
            } else {
                $defaultTextEle.show();
                this.selectedIndex[combo.id] = -1;
            }
        },

        /**
         * Enables or disables the combo box of specified ID
         * @method enableDisableCombobox
         * @param id {String} The id of the combo box to be enabled/disabled
         * @param disable {Boolean} True to enable combo-box. False to disable.
         */
        "enableDisableCombobox": function(id, disable) {
            var currentId = '#' + id;
            if (disable) {
                this.getContextElement().find(currentId).addClass('customComboDisabled');
                this.getContextElement().find(currentId + '-combo-holder').addClass('customComboHolderDisabled');
                this.getContextElement().find(currentId + '-combo-holder > .customComboButton').addClass('customComboButtonImageDisabled');
            } else {
                this.getContextElement().find(currentId).removeClass('customComboDisabled');
                this.getContextElement().find(currentId + '-combo-holder').removeClass('customComboHolderDisabled');
                this.getContextElement().find(currentId + '-combo-holder > .customComboButton').removeClass('customComboButtonImageDisabled');
            }
        },

        /* Increase width of combobox based on the longest string in the combo 
        options incase width is not explicitly specified */
        /**
        * Adjusts the width of the combobox based on the longest string in the combo options, if width is not
        specified explicitly
        * @method _adjustWidth
        * @param id {String} The id of select tag / custom combobox
        * @private
        */
        "_adjustWidth": function(id) {
            //check if width was specified by user or auto adjusted according to content
            if (!document.getElementById(id).style.width || this.items[id].widthAdjusted === true) {
                var maxWidth = 0,
                    div = document.createElement('div'),
                    $div = $(div),
                    length = this.items[id].linear.length,
                    textString,
                    idElement,
                    groupName,
                    otherComboBox, j,
                    width,
                    comboBox,
                    divWidth,
                    i;
                $div.addClass('customComboSelectedItem');

                $('body').append(div);

                for (i = 0; i < length; i++) {
                    comboBox = this.items[id].linear[i];
                    textString = comboBox.isOptGroupChild ? MathUtilities.Components.Combobox.Views.CustomCombobox.LEFT_OFFSET_FOR_OPTGROUP_ITEM : '';
                    textString += comboBox.text;
                    div.innerHTML = textString;
                    $div.css('font-family', this.getContextElement().find('#' + id).css('font-family'));
                    divWidth = $div.getTextWidth();
                    if (divWidth > maxWidth) {
                        maxWidth = divWidth;
                    }
                }
                $div.addClass('customComboGroup');
                for (i = 0; i < this.items[id].data.length; i++) {
                    if (this.items[id].data[i].label !== null) {
                        textString = this.items[id].data[i].label;
                        div.innerHTML = textString;
                        divWidth = $div.getTextWidth();
                        if (divWidth > maxWidth) {
                            maxWidth = divWidth;
                        }
                    }
                }
                $div.remove();
                if (maxWidth !== 0) {
                    //width of button
                    maxWidth += 34;

                    idElement = this.getContextElement().find('#' + id);
                    groupName = idElement.prop('group');
                    if (this.groups[groupName]) {
                        for (j = 0; j < this.groups[groupName].length; j++) {
                            otherComboBox = this.getContextElement().find("#" + this.groups[groupName][j]);
                            width = parseInt(otherComboBox.css('width'), 10);
                            if (width > maxWidth) {
                                maxWidth = width;
                            } else {
                                otherComboBox.css('width', maxWidth);
                                this.items[this.groups[groupName][j]].widthAdjusted = true;
                            }
                        }
                    }
                    idElement.css('width', maxWidth);
                }
                this.items[id].widthAdjusted = true;
            } else {
                this.items[id].widthAdjusted = false;
            }
            this.$('.customComboButton').css({
                "width": '15%'
            });
            this.$('.customComboSelectedItem').css({
                "width": '85%'
            });
        },

        /**
         * Returns an object of getter & setter functions for custom properties added to the combo box items
         * @method getSetterGetterFunctions
         * @return {Object} A group of getter, setter functions for custom added properties bundled in an object
         * @private
         */
        "getSetterGetterFunctions": function() {
            var self = this,
                mathInteractiveElement = this.getContextElement().parents('.de-mathematics-interactive').find('.player'),
                objSetterGetters = {};
            objSetterGetters.setSelectedIndex = function(value) {
                if (value === -1) { //reset customCombo to default state
                    var $this = $(this),
                        selectedIndex,
                        len,
                        i,
                        defaultText = self.comboCollection[$(this).attr('id')].get('defaultText');
                    $this.data('customSelectedIndex', -1);
                    self.comboCollection[$this[0].id].setSelectedItem(null);
                    self.selectedIndex[$this.attr('id')] = -1;
                    $this.val('');
                    if (defaultText !== null && typeof defaultText !== 'undefined') {
                        $this.find('.customComboDefaultText').append(defaultText).show();
                    }
                    $this.find('.customComboSelectedItem').text('');
                    return $this.data('customSelectedIndex', -1);
                }
                value = parseInt(value, 10);
                $this = $(this);
                selectedIndex = $this.data('customSelectedIndex');
                len = self.items[this.id].linear.length;

                if (len === 0) {
                    $this.data('customSelectedIndex', -1);
                    return $this.data('customSelectedIndex', -1);
                }
                if (value.toString() === 'NaN') {
                    value = 0;
                }
                if (parseInt(value, 10) < 0) {
                    value = 0;
                } else if (parseInt(value, 10) > len - 1) {
                    value = len - 1;
                }

                if (!self.disabledItemsSelectionEnabled &&
                    self.items[this.id].linear[value].enabled === false) {
                    len = 0;
                    if (value > selectedIndex) {
                        for (i = value + 1; i < len; i++) {
                            if (self.items[this.id].linear[i].enabled === true) {
                                this.selectedIndex = i;
                                break;
                            }
                        }
                    } else if (value < selectedIndex) {
                        for (i = value - 1; i >= 0; i--) {
                            if (self.items[this.id].linear[i].enabled === true) {
                                this.selectedIndex = i;
                                break;
                            }
                        }
                    }
                    return;
                }

                if (self.items[this.id].linear[value].enabled === false) {
                    mathInteractiveElement.find('#' + this.id + '-selected-item').addClass('customComboItemDisabled');
                } else {
                    mathInteractiveElement.find('#' + this.id + '-selected-item').removeClass('customComboItemDisabled');
                }
                $this.data('customSelectedIndex', value);
                self.setSelectedIndex(this.id, value);
                return value;
            };
            objSetterGetters.getSelectedIndex = function() {
                return $(this).data('customSelectedIndex');
            };
            objSetterGetters.setSelectedValue = function(value) {
                var len = self.items[this.id].linear.length,
                    i;
                for (i = 0; i < len; i++) {
                    if (self.items[this.id].linear[i].value === value) {
                        this.selectedIndex = i;
                    }
                }
                return $(this).val();
            };
            objSetterGetters.getSelectedValue = function() {
                return $(this).val();
            };
            objSetterGetters.getarrOptions = function() {
                var arr = [],
                    obj,
                    len = CustomComboBox.oItems[this.id].linear.length, //CustomComboBox ???
                    i;

                for (i = 0; i < len; i++) {
                    obj = {};
                    obj.enabled = self.items[this.id].linear[i].enabled;
                    arr.push(obj);
                }
                return arr;
            };
            objSetterGetters.setarrOptions = function(value) {};
            objSetterGetters.getDisabled = function() {
                return $(this).data('customDisabled');
            };
            objSetterGetters.setDisabled = function(value) {
                $(this).data('customDisabled', value).trigger('enableDisableCombo');
            };
            objSetterGetters.getGroupName = function() {
                return $(this).data('customGroup');
            };
            objSetterGetters.setGroupName = function(value) {
                if (value) {
                    if (!self.groups[value]) {
                        self.groups[value] = [];
                    }
                    if (self.groups[value].indexOf(this.id) === -1) {
                        self.groups[value].push(this.id);
                    }
                }
                var previousGroupData = $(this).data('customGroup');
                if (previousGroupData !== value) {
                    if (previousGroupData) {
                        self.groups[previousGroupData]
                            .splice(self.groups[previousGroupData].indexOf(this.id), 1);
                    }
                    $(this).data('customGroup', value).trigger('comboGroupChange');
                }
            };
            return objSetterGetters;
        },

        /*
         * @method _openDropDown
         * @private
         */
        "_openDropDown": function(event) {
            var self = this,
                containerHt,
                contextHt,
                offset,
                enterFn,
                timeId,
                leaveFn,
                dropDown,
                $dropDown,
                itemObject,
                $itemObject,
                height,
                dropDownChildren,
                lineHeight,
                idString,
                comboList,
                comboBoxHighlightedItem,
                nextItem,
                hackDiv,
                $comboList,
                count = 0,
                i,
                j,
                curComboItem,
                dropDownObject,
                currentTarget = event.currentTarget,
                $currentTarget = $(currentTarget),
                mathInteractiveElement = this.getContextElement(),
                currentTargetOffset = $currentTarget.offset(),
                newLeft = currentTargetOffset.left - mathInteractiveElement.offset().left,
                newTop = currentTargetOffset.top - mathInteractiveElement.offset().top + $currentTarget.height() - 4;

            // Check to see if long tap occured, then let this event go...
            if (this.defaultEventPrevented) {
                return;
            }

            if ($currentTarget.hasClass('customComboDisabled')) {
                return;
            }
            dropDownObject = null;
            if (this.openComboBoxes[currentTarget.id]) {
                dropDownObject = this.openComboBoxes[currentTarget.id];
            } else if ($currentTarget.hasClass('customComboDropDown')) {
                dropDownObject = currentTarget;
            }

            if (dropDownObject !== null) {
                $(dropDownObject).remove();
                this.closeOpenComboBoxes();
                return;
            }

            if (this.items[currentTarget.id].dropDown) {
                dropDown = this.items[currentTarget.id].dropDown;
            } else {
                dropDown = document.createElement('div');
                this.items[currentTarget.id].dropDown = dropDown;
            }
            $dropDown = $(dropDown);
            $dropDown.html("");
            containerHt = this.containerHt;

            $currentTarget.off('mousedown', $.proxy(this.closeCombobox, this))
                .on('mousedown', $.proxy(this.closeCombobox, this))
                .off('touchstart', $.proxy(this.onTouchStart, this))
                .on('touchstart', $.proxy(this.onTouchStart, this));

            $(document).off('mousedown', $.proxy(this.closeCombobox, this))
                .on('mousedown', $.proxy(this.closeCombobox, this))
                .off('mousewheel DOMMouseScroll', $.proxy(this.closeCombobox, this))
                .on('mousewheel DOMMouseScroll', $.proxy(this.closeCombobox, this))
                .off('touchstart', $.proxy(this.onTouchStart, this))
                .on('touchstart', $.proxy(this.onTouchStart, this));

            offset = $currentTarget.offset();
            $dropDown.css({
                    "top": newTop,
                    "left": newLeft,
                    "min-width": $currentTarget.width(),
                    "color": $currentTarget.css("color"),
                    "font-size": $currentTarget.css("font-size")
                })
                .off('mousedown', $.proxy(this.closeCombobox, this)).on('mousedown', $.proxy(this.closeCombobox, this))
                .off('mousewheel DOMMouseScroll').on('mousewheel DOMMouseScroll', function(event) {
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                })
                .off('touchstart', $.proxy(this.onTouchStart, this)).on('touchstart', $.proxy(this.onTouchStart, this))
                .off('click', $.proxy(this._openDropDown, this)).on('click', $.proxy(this._openDropDown, this));
            $dropDown.removeClass().addClass('customComboDropDown');
            timeId = null;
            // Mouse hover and leave functions.
            enterFn = function(event) {
                var htmlString, id = $(this).attr('id');
                htmlString = mathInteractiveElement.find('#' + id + '-selected-item').html();
                if ($('#' + id + '-default-text').css('display') !== 'none') {
                    htmlString = this.getContextElement().find('#' + id + '-default-text').html();
                }
                htmlString = htmlString.replace(/&nbsp;/g, '');

                timeId = setTimeout(function() {
                    self.showHint(htmlString, id);
                }, self.hintDelay);

                self.setPos(event.clientX + 15, event.clientY + 25);
            };

            leaveFn = function() {
                self.hideHint();
                clearTimeout(timeId);
            };

            this.openComboBoxes[currentTarget.id] = dropDown;

            count = 0;

            curComboItem = this.items[currentTarget.id];
            for (i = 0; i < curComboItem.data.length; i++) {

                if (curComboItem.data[i].label != null) {
                    itemObject = document.createElement('div');
                    $itemObject = $(itemObject);
                    itemObject.innerHTML = this.items[currentTarget.id].data[i].label + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;';
                    $itemObject.addClass('customComboItem typography-label').addClass('customComboGroup');
                    dropDown.appendChild(itemObject);
                    for (j = 0; j < this.items[event.currentTarget.id].data[i].data.length; j++) {
                        itemObject = document.createElement('div');
                        $itemObject = $(itemObject);
                        itemObject.id = currentTarget.id + '-comboItemX' + count;
                        if (this.items[currentTarget.id].data[i].data[j].enabled === false) {
                            $itemObject.addClass('customComboItemDisabled');
                        } else {
                            this._bindListenersOnItem($itemObject);
                        }

                        if (count === this.selectedIndex[event.currentTarget.id]) {
                            $itemObject.addClass('customComboItemSelected');
                            this.highlightedIndex = count;
                        }
                        itemObject.innerHTML = MathUtilities.Components.Combobox.Views.CustomCombobox.LEFT_OFFSET_FOR_OPTGROUP_ITEM +
                            this.items[currentTarget.id].data[i].data[j].text + "  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                        $itemObject.addClass('customComboItem typography-label');
                        dropDown.appendChild(itemObject);
                        count++;
                    }
                } else {
                    itemObject = document.createElement('div');
                    $itemObject = $(itemObject);
                    itemObject.id = currentTarget.id + '-comboItemX' + count;
                    itemObject.innerHTML = curComboItem.data[i].text;
                    if (curComboItem.data[i].renderTpl) {
                        itemObject.innerHTML = itemObject.innerHTML + curComboItem.data[i].renderTpl;
                    }
                    $itemObject.addClass('customComboItem typography-label');
                    if (curComboItem.data[i].enabled === false) {
                        $itemObject.addClass('customComboItemDisabled');
                    } else {
                        this._bindListenersOnItem($itemObject);
                    }

                    if (count === this.selectedIndex[currentTarget.id]) {
                        $itemObject.addClass('customComboItemSelected');
                        this.highlightedIndex = count;
                    }
                    dropDown.appendChild(itemObject);
                    count++;
                }
            }

            dropDownChildren = $dropDown.children();
            lineHeight = MathUtilities.Components.Combobox.Views.CustomCombobox.DEFAULT_LINE_HEIGHT;
            if (typeof this.singleElemHeight !== 'undefined') {
                lineHeight = this.singleElemHeight;
            }
            height = lineHeight * dropDownChildren.length > MathUtilities.Components.Combobox.Views.CustomCombobox.MAX_DROP_DOWN_HEIGHT ?
                MathUtilities.Components.Combobox.Views.CustomCombobox.MAX_DROP_DOWN_HEIGHT :
                lineHeight * dropDownChildren.length;
            contextHt = mathInteractiveElement.position().top + newTop + height;

            $dropDown.css('height', height + $dropDown.children().length * 2 + 2); // 1px padding for each element + 1 px for parent (top + bottom)
            mathInteractiveElement.append($(dropDown));
            if ($.support.touch === false) {
                hackDiv = document.getElementById(currentTarget.id + "-hack");
                if (hackDiv) {
                    hackDiv.focus();
                }
            }

            idString = currentTarget.id;
            comboBoxHighlightedItem = document.getElementById(idString + '-comboItemX' + this.highlightedIndex);
            if (this.openComboBoxes[idString] && comboBoxHighlightedItem &&
                comboBoxHighlightedItem.offsetTop >= this.openComboBoxes[idString].scrollTop + parseInt($(this.openComboBoxes[idString]).css('height'), 10)) {
                nextItem = mathInteractiveElement.find('#' + idString + '-comboItemX' + this.highlightedIndex);
                this.openComboBoxes[idString].scrollTop = nextItem[0].offsetTop + nextItem.height();
            }
            $currentTarget.trigger(MathUtilities.Components.ComboboxController.DROPDOWN_OPEN);
            this.trigger(MathUtilities.Components.ComboboxController.DROPDOWN_OPEN, [$currentTarget.attr('id')]);

            $comboList = $(this.openComboBoxes[idString]);
            if ($comboList.position().top + $comboList.height() > $(this.contextElement).height() || contextHt >= containerHt) {
                this.trigger('open-drop-down-above', $dropDown);
            } else {
                $dropDown.removeClass('drop-down-above');
            }
        },

        /**
         * Binds mouseover, click, touchstart, touchend event handlers to passed item.
         * @method _bindListenersOnItem
         * @param item {Object} Jquery object of combo box item (select option)
         * @private
         */
        "_bindListenersOnItem": function(item) {
            item.off('mouseover touchstart', $.proxy(this.onComboItemOver, this))
                .on('mouseover touchstart', $.proxy(this.onComboItemOver, this))
                .off('click', $.proxy(this.onComboItemClick, this))
                .on('click', $.proxy(this.onComboItemClick, this))
                .off('touchend', $.proxy(this.onComboItemTouchEnd, this))
                .on('touchend', $.proxy(this.onComboItemTouchEnd, this));
        },

        //  Event Handlers
        //Add "comboBox press arrow keys to change selection" message on first focus
        /*
         *
         * @method onComboBoxFocus
         * @param event {Object} The focus event object
         * @private
         */
        "onComboBoxFocus": function(event) {
            var combo = $(event.currentTarget);
            combo.off('focus', $.proxy(this.onComboBoxBlur, this)).on('blur', $.proxy(this.onComboBoxBlur, this));

        },

        /*
         *
         * @method onComboBoxBlur
         * @param event {Object} The blur event object
         * @private
         */
        "onComboBoxBlur": function(event) {
            if (this.ignoreBlur) {
                this.ignoreBlur = false;
                return;
            }
            this.ignoreBlur = false;
            $(event.currentTarget).off('blur', $.proxy(this.onComboBoxFocus, this))
                .on('focus', $.proxy(this.onComboBoxFocus, this));
        },

        /**
         * Method to help navigate within & choose options using keyboard keys
         * @method onKeyDown
         * @param event {Object} Keydown event object
         * @private
         */
        "onKeyDown": function(event) {
            var height,
                lineHeight,
                targetID = event.currentTarget.id,
                len = this.items[targetID].linear.length,
                index,
                key = event ? event.which : event.keyCode,
                $combo = this.getContextElement().find('#' + targetID),
                mathInteractiveElement = this.getContextElement().parents('.de-mathematics-interactive').find('.player'),
                oldSelectedIndex = $combo.prop('selectedIndex'),
                selectedItem,
                highlightedItemId,
                accText,
                self = this,
                idPrefix,
                selectedIndex,
                comboSetFocus,
                comboItem,
                nextHighlight,
                absoluteIndex,
                paramText,
                nextItem;

            //dont set focus on Tab key
            if ($combo.hasClass('customComboDisabled')) {
                return;
            }
            switch (key) {
                case 9:
                    //Tab
                case 27:
                    //ESC
                    this.closeOpenComboBoxes();
                    break;
                case 33:
                    //page up
                    event.preventDefault();
                    if (this.openComboBoxes[targetID]) {
                        height = parseInt($(this.openComboBoxes[targetID]).css('height'), 10);
                        lineHeight = parseInt($(this.openComboBoxes[targetID]).css('lineHeight'), 10);
                        this.openComboBoxes[targetID].scrollTop -= parseInt($(this.openComboBoxes[targetID])
                            .css('height'), 10);
                    } else {
                        lineHeight = MathUtilities.Components.Combobox.Views.CustomCombobox.DEFAULT_LINE_HEIGHT;
                        height = len * lineHeight > MathUtilities.Components.Combobox.Views.CustomCombobox.MAX_DROP_DOWN_HEIGHT ?
                            MathUtilities.Components.Combobox.Views.CustomCombobox.MAX_DROP_DOWN_HEIGHT : len * lineHeight;
                    }
                    index = parseInt(height / lineHeight, 10);
                    if (isNaN(oldSelectedIndex - index)) return;
                    $combo.prop('selectedIndex', oldSelectedIndex - index);
                    break;
                case 34:
                    //page down
                    event.preventDefault();
                    if (this.openComboBoxes[targetID]) {
                        height = parseInt($(this.openComboBoxes[targetID]).css('height'), 10);
                        lineHeight = parseInt($(this.openComboBoxes[targetID]).css('lineHeight'), 10);
                        this.openComboBoxes[targetID].scrollTop += parseInt(
                            $(this.openComboBoxes[targetID]).css('height'), 10);
                    } else {
                        lineHeight = MathUtilities.Components.Combobox.Views.CustomCombobox.DEFAULT_LINE_HEIGHT;
                        height = len * lineHeight > MathUtilities.Components.Combobox.Views.CustomCombobox.MAX_DROP_DOWN_HEIGHT ?
                            MathUtilities.Components.Combobox.Views.CustomCombobox.MAX_DROP_DOWN_HEIGHT : len * lineHeight;
                    }

                    index = parseInt(height / lineHeight, 10);

                    $combo.prop('selectedIndex', oldSelectedIndex + index);
                    break;
                case 35:
                    //end
                    event.preventDefault();
                    if (this.openComboBoxes[targetID]) {
                        this.openComboBoxes[targetID].scrollTop = this.openComboBoxes[targetID].scrollHeight;
                    }
                    $combo.prop('selectedIndex', len - 1);
                    break;
                case 36:
                    //home
                    event.preventDefault();
                    if (this.openComboBoxes[targetID]) {
                        this.openComboBoxes[targetID].scrollTop = 0;
                    }
                    $combo.prop('selectedIndex', 0);
                    break;
                case 13:
                case 32:
                    //Enter key
                    //Space
                    event.preventDefault();
                    return; //do not open combobox on space and enter
                case 37:
                case 189:
                    //left
                    break;
                case 38:
                case 219:
                    //up
                    event.preventDefault();
                    if (mathInteractiveElement.find('.customComboDropDown').length === 0) {
                        index = this.highlightedIndex === -1 ?
                            oldSelectedIndex : this.highlightedIndex;
                        index = index - 1;
                        if (index === -1) {
                            index = 0;
                        }
                        if (!isNaN(index)) {
                            this.getContextElement().find('#' + targetID).prop('selectedIndex', index);
                        }
                        comboItem = document.getElementById(targetID + '-comboItemX' + index);
                        if (index >= 0 && this.openComboBoxes[targetID] &&
                            this.openComboBoxes[targetID].scrollTop - MathUtilities.Components.Combobox.Views.CustomCombobox.DEFAULT_LINE_HEIGHT <
                            comboItem.offsetTop) {
                            comboItem.scrollIntoView();
                        }
                    } else {
                        selectedItem = mathInteractiveElement.find('.customComboItemSelected');
                        highlightedItemId = selectedItem.attr('id');
                        if (typeof highlightedItemId === 'undefined' || highlightedItemId === null) {
                            nextHighlight = 0;
                        } else {
                            nextHighlight = parseInt(highlightedItemId.split('X')[1], 10);
                        }
                        nextHighlight--;
                        if (nextHighlight <= -1) {
                            return false;
                        }
                        $combo[0].selectedIndex = nextHighlight;
                        this.highlightedIndex = nextHighlight;
                        selectedItem.removeClass('customComboItemSelected');
                        nextItem = mathInteractiveElement.find('#' + targetID + '-comboItemX' + nextHighlight);
                        nextItem.addClass('customComboItemSelected');

                        if (nextItem[0].offsetTop < this.openComboBoxes[targetID].scrollTop) {
                            this.openComboBoxes[targetID].scrollTop = nextItem[0].offsetTop;
                        };
                    }
                    break;
                case 39:
                case 187:
                    //right
                    break;
                case 40:
                case 222:
                    //down
                    event.preventDefault();
                    if (mathInteractiveElement.find('.customComboDropDown').length === 0) {
                        index = this.highlightedIndex === -1 ?
                            oldSelectedIndex : this.highlightedIndex;
                        $combo.prop('selectedIndex', index + 1);
                        comboItem = document.getElementById(targetID + '-comboItemX' + this.highlightedIndex);
                        if (this.openComboBoxes[targetID] &&
                            comboItem.offsetTop > this.openComboBoxes[targetID].scrollTop + parseInt($(this.openComboBoxes[targetID]).css('height'), 10)) {
                            comboItem.scrollIntoView();
                        }
                    } else {
                        selectedItem = mathInteractiveElement.find('.customComboItemSelected');
                        highlightedItemId = selectedItem.attr('id');
                        if (typeof highlightedItemId === 'undefined' || highlightedItemId === null) {
                            nextHighlight = -1;
                        } else {
                            nextHighlight = parseInt(highlightedItemId.split('X')[1], 10);
                        }
                        nextHighlight++;
                        nextItem = $('#' + targetID + '-comboItemX' + nextHighlight);
                        if (nextHighlight >= mathInteractiveElement.find('.customComboItem').length) {
                            return false;
                        }
                        $combo[0].selectedIndex = nextHighlight;
                        selectedItem.removeClass('customComboItemSelected');
                        this.highlightedIndex = nextHighlight;
                        nextItem.addClass('customComboItemSelected');

                        if (nextItem[0].offsetTop + 15 >
                            this.openComboBoxes[targetID].scrollTop + parseInt($(this.openComboBoxes[targetID]).css('height'), 10)) {
                            this.openComboBoxes[targetID].scrollTop = nextItem[0].offsetTop + nextItem.height();
                        };
                    }
                    break;
            }

            if (this._manager) {
                self = this;
                comboSetFocus = function comboSetFocus() {
                    $combo.find('.acc-read-elem').blur();
                    if ($combo[0].selectedIndex >= 0) {
                        accText = self.items[targetID].linear[self.getAbsoluteIndex($combo[0].id, $combo[0].selectedIndex)].acc;
                    }
                    self._manager.setAccMessage($combo[0].id, accText);

                    $combo.find('.acc-read-elem').focus();
                };
                if (key !== 9) { //if key is tab key then dont set focus
                    comboSetFocus();
                } else {
                    idPrefix = this.comboCollection[$combo[0].id].get('idPrefix');
                    selectedIndex = $combo[0].selectedIndex;
                    if (idPrefix) {
                        accText = this._manager.getAccMessage(idPrefix + 'commonCustomComboText', 0);
                    } else {
                        accText = this._manager.getAccMessage('commonCustomComboText', 0);
                    }

                    if (!selectedIndex && selectedIndex !== 0) {
                        selectedIndex = -1;
                    }

                    absoluteIndex = this.getAbsoluteIndex($combo[0].id, selectedIndex);
                    if (absoluteIndex === -1 || absoluteIndex === null || typeof absoluteIndex === 'undefined') {
                        paramText = this._manager.getAccMessage($combo[0].id, selectedIndex);
                    } else {
                        paramText = this.items[$combo[0].id].linear[absoluteIndex].acc;
                    }
                    this._manager.setAccMessage($combo[0].id, accText, [paramText]);
                }
            }

        },

        /**
         * Event handler for mouse click event on combobox item (select option)
         * @method onComboItemClick
         * @param event {Object} Mouse click event object
         * @private
         */
        "onComboItemClick": function(event) {
            var targetID = event.currentTarget.id,
                accText,
                $combo,
                containerID = targetID.substring(0, targetID.lastIndexOf('-'));

            targetID = targetID.substring(targetID.lastIndexOf('X') + 1, targetID.length);
            $combo = this.getContextElement().find('#' + containerID);
            $combo.prop('selectedIndex', parseInt(targetID, 10));

            if (this._manager) {
                if ($combo[0].selectedIndex >= 0) {
                    accText = this.items[$combo[0].id].linear[this.getAbsoluteIndex($combo[0].id, $combo[0].selectedIndex)].acc;
                }
                this._manager.setAccMessage($combo[0].id, accText);
            }
        },

        /**
         * Event handler for touch end event on combobox item (select option)
         * @method onComboItemTouchEnd
         * @param event {Object} Touch end event object
         * @private
         */
        "onComboItemTouchEnd": function(event) {
            var targetID = event.currentTarget.id,
                containerID = targetID.substring(0, targetID.lastIndexOf('-'));
            this.getContextElement().find('#' + containerID + '-comboItemX' + this.highlightedIndex).removeClass('customComboItemSelected');
        },

        /**
         * Event handler for mouse-over, touch-start event on combobox item (select option)
         * @method onComboItemOver
         * @param event {Object} Mouse-over/Touch-start event object
         * @private
         */
        "onComboItemOver": function(event) {
            var targetID = event.currentTarget.id,
                containerID = targetID.substring(0, targetID.lastIndexOf("-"));
            $('#' + containerID + '-comboItemX' + this.highlightedIndex).removeClass('customComboItemSelected');
            $(event.currentTarget).addClass('customComboItemSelected');
            targetID = targetID.substring(targetID.lastIndexOf('X') + 1, targetID.length);
            this.highlightedIndex = parseInt(targetID, 10);
        },


        /**
         * Event handler for touch-start event on combobox
         * @method onTouchStart
         * @param event {Object} Touch-start event object
         * @private
         */
        "onTouchStart": function(event) {
            if (this.touchOnCombo) {
                this.touchOnCombo = false;
                return;
            }
            if (event.currentTarget !== document) {
                this.touchOnCombo = true;
            }
        },

        /*
         * Closes combo boxes
         * @method closeCombobox
         * @param event {Object} The event object causing the close of combobox
         */
        "closeCombobox": function(event) {
            var currentTarget = event.currentTarget;
            if (currentTarget !== document) {
                event.stopPropagation();
                event.stopImmediatePropagation();
                event.preventDefault();

                //If the comboBox on which it is mousedown is different from the one which is open
                // , we go ahead and close the open combo box
                if (this.openComboBoxes[currentTarget.id] ||
                    $(currentTarget).hasClass('customComboDropDown')) {
                    return;
                }
            }
            this.closeOpenComboBoxes();
        },

        /*
         * Closes open combo boxes
         * @method closeOpenComboBoxes
         */
        "closeOpenComboBoxes": function() {
            var iterableElement;
            this.touchOnCombo = false;
            this.highlightedIndex = -1;
            for (iterableElement in this.openComboBoxes) {
                $(this.openComboBoxes[iterableElement]).remove();
                delete this.openComboBoxes[iterableElement];

                $("#" + iterableElement).off('mousedown').on('mousedown', function() {
                    $('#' + this.id + '-combo-holder > .customComboButton')
                        .removeClass('customComboButtonImage')
                        .removeClass('customComboButtonImageHover').addClass('customComboButtonImageActive');
                });

            }
        },

        /**
         * Displays the hint (Useful in case the option text is longer than the width of the combo box
         * @method showHint
         * @param hintText {String} The text to be displayed as hint
         * @private
         */
        "showHint": function(hintText, comboId) {
            if (hintText.trim().length === 0) {
                return;
            }
            if (this.comboCollection[comboId].get('isHintEnabled') === true) {
                this.hintElement.html(hintText);
                this.hintElement.show();
            }
        },

        /*
         * Setter function for property 'defaultEventPrevented'
         * @method preventDefault
         * @param prevent {Boolean} True if one wants to prevent default event handlers
         */
        "preventDefault": function(prevent) {
            this.defaultEventPrevented = prevent;
        },

        /**
         * Hides the hint
         * @method hideHint
         * @private
         */
        "hideHint": function() {
            this.hintElement.hide();
        },

        /**
         * Sets the position of hint
         * @method setPos
         * @param x {Number} The 'left' css value in px
         * @param y {Number} The 'top' css value in px
         * @private
         */
        "setPos": function(x, y) {
            this.hintElement.css("left", x + "px");
            this.hintElement.css("top", y + "px");
        },

        /*
         * Method to check if the device is a touch device
         * @method isTouchDevice
         * @return Truthy value if device supports touch
         */
        "isTouchDevice": function() {
            return 'ontouchstart' in window || navigator.msMaxTouchPoints;
        },


        /*
         *Public functions
         */
        /**
         * Remove an item inside the combo box. Item may be an option or a whole optGroup
         * @method removeItem
         * @param passedId {String} The id of the container in which item to be deleted belongs
         * @param index {Number} The data index of the item
         * @param parentOptGroupIndex {Number} The data index of parent optGroup in case the item belongs to a optGroup
         * @param isOptGroup {Boolean} True if one wants to remove a whole optGroup
         */
        "removeItem": function(passedId, index, parentOptGroupIndex, isOptGroup) {
            var absIndex, selectedValueDeleted = true,
                i;
            if (!isOptGroup) {
                if (parentOptGroupIndex !== null) {
                    this.items[passedId].data[parentOptGroupIndex].data.splice(index, 1);
                } else {
                    this.items[passedId].data.splice(index, 1);
                }
                absIndex = this.getAbsoluteIndex(passedId, index, parentOptGroupIndex);
                this.items[passedId].linear.splice(absIndex, 1);
            } else {
                absIndex = this.getAbsoluteIndex(passedId, 0, index);
                this.items[passedId].linear.splice(absIndex, this.items[passedId].data[index].length);
                this.items[passedId].data.splice(index, 1);
            }

            for (i = 0; i < this.items[passedId].linear.length; i++) {
                if (this.items[passedId].linear[i].value === $('#' + passedId).val()) {
                    selectedValueDeleted = false;
                }
            }
            if (selectedValueDeleted) {
                $('#' + passedId).prop('selectedIndex', 0);
            }
            this._adjustWidth(passedId);
        },

        /** 
         * Remove all the options for the combobox, with the id that is passed to it
         * @method removeAllOptionsForComboWithId
         * @param passedId {String} Id of the combox box.
         * @return true if it succesfully removes the options, false if it fails.
         */
        "removeAllOptionsForComboWithId": function(passedId) {
            var comboBox = this.items[passedId];
            //Check if combo exist with the id passed.
            if (comboBox) {
                comboBox.data.splice(0);
                comboBox.linear.splice(0);
            }
        },

        /** 
         * get json data related to selected index of combobox (linear data)
         * @method getComboSelectedData
         * @param id {String} Id of the combox box.
         * @return {object} data of selected index
         */
        "getComboSelectedData": function getComboSelectedData(id) {
            var comboBox = this.items[id],
                absIndex;
            //Check if combo exist with the id passed.
            if (comboBox) {
                absIndex = this.getAbsoluteIndex(id, $('#' + id)[0].selectedIndex);
                return comboBox.linear[absIndex];
            }
        },

        /**
         * Appends list of options to a combox box with specified ID.
         * @method addOptionsToComboWithId
         * @public
         * @param id {String} ID of the combox.
         * @param options {Object} Options to be added into Combo box
         * @return
         */
        "addOptionsToComboWithId": function(id, options) {
            var comboBox = this.items[id];
            //check if combo exist with the id passed.
            if (comboBox && options) {
                comboBox.data = options.data;
                comboBox.linear = options.linear;
            }
        },

        //add item dynamically.parentOptGroupIndex should be null if not required. 
        //Pass a object of option tag in the option parameter
        /**
         * Remove an item inside the combo box. Item may be an option or a whole optGroup
         * @method removeItem
         * @param passedId {String} The id of the container in which the item to be deleted belonged
         * @param index {Number} The data index of the item
         * @param parentOptGroupIndex {Number} The data index of parent optGroup in case the item belongs to a optGroup
         * @param isOptGroup {Boolean} True if one wants to remove a whole optGroup
         */
        "addItem": function(passedId, index, parentOptGroupIndex, option) {
            var dataObj,
                obj = {},
                objChild,
                optionObj = $(option),
                absIndex, j, childrenArray, length;

            if (optionObj.is('option')) {
                dataObj = {};
                dataObj.value = optionObj.attr('value');
                dataObj.text = optionObj.html();
                dataObj.acc = optionObj.attr('acc');
                dataObj.enabled = optionObj.attr('disabled') !== 'disabled';
                dataObj.isOptGroupChild = false;
                if (parentOptGroupIndex !== null) {
                    this.items[passedId].data[parentOptGroupIndex].data.splice(index, 0, dataObj);
                } else {
                    this.items[passedId].data.splice(index, 0, dataObj);
                }
                absIndex = this.getAbsoluteIndex(passedId, index, parentOptGroupIndex);
                this.items[passedId].linear.splice(absIndex, 0, dataObj);
                if (absIndex <= this.selectedIndex[passedId] || this.selectedIndex[passedId] === -1) {
                    this.selectedIndex[passedId] += 1;
                }
                if (optionObj.attr('selected') === 'selected') {
                    this.selectedIndex[passedId] = absIndex;
                }
            } else if (optionObj.is('optgroup')) {
                obj.label = optionObj.attr('label');
                obj.data = [];
                absIndex = this.getAbsoluteIndex(passedId, index, parentOptGroupIndex);
                childrenArray = optionObj.children();
                length = childrenArray.length;
                for (j = 0; j < length; j++) {
                    objChild = $(childrenArray[j]);
                    dataObj = {};
                    dataObj.value = objChild.attr('value');
                    dataObj.text = objChild.html();
                    dataObj.acc = objChild.attr('acc');
                    dataObj.enabled = objChild.attr('disabled') !== 'disabled';
                    dataObj.isOptGroupChild = true;
                    this.items[passedId].linear.splice(absIndex + j, 0, dataObj);
                    //needs to be reviewed where element had come from..currently it has been blindly
                    // replaced with optionObj

                    if (objChild.attr('selected') === 'selected') {
                        this.selectedIndex[this.id] = absIndex + j;
                    }
                    obj.data.push(dataObj);
                }
                this.items[passedId].data.splice(index, 0, obj);
            }
        },

        //returns absolute index ignoring the optgroup
        /**
         * Returns absolute index ignoring the optgroup
         * @method getAbsoluteIndex
         * @param passedId {String} The id of the combobox
         * @param itemIndex {Number} The index of the item/option in it's group
         * @param groupIndex {Number} The index of the item's/option's group
         * @return {Number} The absolute index of the item
         */
        "getAbsoluteIndex": function(passedId, itemIndex, groupIndex) {
            var i, j, count = 0;
            if (groupIndex === null || typeof groupIndex === 'undefined') {
                return itemIndex;
            }
            for (i = 0; i < this.items[passedId].data.length; i++) {
                if (this.items[passedId].data[i].label !== null) {
                    for (j = 0; j < this.items[passedId].data[i].data.length; j++) {
                        if (groupIndex === i && itemIndex === j) {
                            return count;
                        }
                        count++;
                    }
                } else {
                    if (i === itemIndex) {
                        return count;
                    }
                    count++;
                }
            }
        },

        //private
        /*
         * @method updateGroup
         * @param passedId {String} The id of the group
         * @private
         */
        "updateGroup": function(passedId) {
            if (this.groups[passedId] && this.groups[passedId][0]) {
                this._adjustWidth(this.groups[passedId][0]);
            }
        },

        //Custom function to disabled a comboitem
        /*
         * Enables/Disables the combo box item/option
         * @method enableDisableComboItem
         * @param passedId {String} The id of the combo box
         * @param enable {Boolean} True if one wants to enable the item.
         * @param index {Number} The data index of the item inside the combo box
         * @param value {String} The value of the option
         */
        "enableDisableComboItem": function(passedId, enable, index, value) {
            var i, j, k, count = 0;
            if (index === null) {
                for (k = 0; k < this.items[passedId].linear.length; k++) {
                    if (this.items[passedId].linear[k].value === value) {
                        index = k;
                    }
                }
            }
            if (this.selectedIndex[passedId] === index) {
                $('#' + passedId + '-selected-item').addClass('customComboItemDisabled');
            } else {
                $('#' + passedId + '-selected-item').removeClass('customComboItemDisabled');
            }

            for (i = 0; i < this.items[passedId].data.length; i++) {
                if (this.items[passedId].data[i].label !== null && typeof this.items[passedId].data[i].label !== 'undefined') {
                    for (j = 0; j < this.items[passedId].data[i].data.length; j++) {
                        if (count === index) {
                            this.items[passedId].linear[count].enabled = enable;
                            count = -1;
                            break;
                        }
                        count++;
                    }
                    if (count === -1) {
                        break;
                    }
                } else {
                    if (count === index) {
                        this.items[passedId].linear[count].enabled = enable;
                        break;
                    }
                    count++;
                }
            }
        },

        /*
         * Enable/Disable all items of a combo box
         * @method enableDisableAllComboItems
         * @param passedId {String} The id of the combo box container
         * @param enable {Boolean} True if one wants to enable. Else false.
         */
        "enableDisableAllComboItems": function(passedId, enable) {
            var i, j, count = 0,
                itemsLength2,
                itemsLength = this.items[passedId].data.length;
            for (i = 0; i < itemsLength; i++) {
                if (this.items[passedId].data[i].label !== null) {
                    itemsLength2 = this.items[passedId].data[i].data.length;
                    for (j = 0; j < itemsLength2; j++) {
                        this.items[passedId].linear[count].enabled = enable;
                        count++;
                    }
                } else {
                    this.items[passedId].linear[count].enabled = enable;
                    count++;
                }
            }
        },

        "getTabIndex": function(accId) {
            return void 0;
        },

        "setTabIndex": function(element, tabIndex) {
            return void 0;
        },

        /**
         * Returns the text of option at specified index in combo box of specified id
         * @method getOptionTextAt
         * @param containerID {String} The id of the combo box
         * @param index {Number} The linear index of the option whose text is to be retrieved
         * @return {String} The text of the option at specified index in combo box of specified id
         */
        "getOptionTextAt": function(containerID, index) {
            return void 0;
        },

        //Called from Manager.SetFocus
        "setFocus": function(id) {
            return void 0;
        },

        /*
        Private functions
        * */
        /**
         *
         * @param containerID --> id of the container in which the comboBox was created
         * @param index --> selectedIndex
         */
        //called when the prop("selectedIndex") is changed
        "setSelectedIndex": function(containerID, index, isSupressEvent) {
            if (this.openComboBoxes[containerID]) {
                if (this.highlightedIndex !== -1) {
                    $('#' + containerID + "-comboItemX" + this.highlightedIndex)
                        .removeClass('customComboItemSelected');
                }
                $('#' + containerID + "-comboItemX" + index).addClass('customComboItemSelected');
                this.highlightedIndex = index;
            }
            var prevIndex = this.selectedIndex[containerID],
                idPrefix,
                accText,
                selectedIndex,
                absoluteIndex,
                paramText,
                selectedItem;

            this.selectedIndex[containerID] = index;
            $('#' + containerID + "-default-text").empty().hide();
            $('#' + containerID).val(this.items[containerID]
                .linear[this.selectedIndex[containerID]].value);
            if (prevIndex !== this.selectedIndex[containerID]) {
                if (isSupressEvent !== true) {
                    $('#' + containerID).trigger('change');
                }
                this.comboCollection[containerID].setSelectedItem(this.selectedIndex[containerID]);
            }

            selectedItem = document.getElementById(containerID + "-selected-item");
            //we insert inner html over here incase the combo is not localized which
            // will result in returning from the Manager.ChangeMessage method
            selectedItem.innerHTML = this.items[containerID]
                .linear[this.selectedIndex[containerID]].text;

            idPrefix = this.comboCollection[containerID].get('idPrefix');
            if (this._manager !== null) {
                if (idPrefix) {
                    accText = this._manager.getAccMessage(idPrefix + 'commonCustomComboText', 0);
                } else {
                    accText = this._manager.getAccMessage('commonCustomComboText', 0);
                }
            }
            selectedIndex = $('#' + containerID)[0].selectedIndex;

            if (!selectedIndex && selectedIndex !== 0) {
                selectedIndex = -1;
            }
            absoluteIndex = this.getAbsoluteIndex(containerID, selectedIndex);
            if (absoluteIndex === -1 || absoluteIndex === null || typeof absoluteIndex === 'undefined') {
                paramText = this._manager !== null ? this._manager.getAccMessage(containerID, selectedIndex) : '';
            } else {
                paramText = this.items[containerID]
                    .linear[absoluteIndex].acc;
            }
            if (this._manager !== null) {
                this._manager.setAccMessage(containerID, accText, [paramText]);
            }
        },

        //called from manager.mLoadCOmbo
        "mLoadCombo": function(element) {
            return void 0;
        },

        /*
         * Appends a DIV to the body and then removes it. A temporary fix to refresh DOM
         * @method refreshDom
         */
        "refreshDom": function() {
            return void 0;
        },

        /*
         * function to retrieve data from comboBox created while parseDOM
         * @method getSaveData
         */
        "getSaveData": function() {
            var saveData = [],
                i;
            for (i = 0; i < Object.keys(this.comboCollection).length; i++) {
                saveData.push(this.comboCollection[Object.keys(this.comboCollection)[i]].produceSavedData());
            };
            return saveData;
        }

    }, {
        "MAX_DROP_DOWN_HEIGHT": 250,
        "DEFAULT_LINE_HEIGHT": 25,
        "DROPDOWN_OPEN": 'custom_combo_dropdown_opened',
        "LEFT_OFFSET_FOR_OPTGROUP_ITEM": '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
        "generateCustomComboboxController": function(options) {
            var comboCollection = options.comboCollection,
                i,
                idPrefix,
                accText,
                selectedIndex,
                absoluteIndex,
                paramText,
                obj,
                controller,
                comboBoxModel;

            if (!comboCollection) {
                comboCollection = {};
            }
            for (i = 0; i < options['elementData'].length; i++) {
                obj = {
                    "idPrefix": options['idPrefix']
                };
                comboBoxModel = new MathUtilities.Components.Combobox.Models.CustomCombobox($.extend(options['elementData'][i], obj));
                comboCollection[options['elementData'][i]['elementID']] = comboBoxModel;
            }

            controller = new MathUtilities.Components.Combobox.Views.CustomCombobox({
                "$el": options['el']
            });
            if (typeof options.singleElemHeight !== 'undefined') {
                controller.singleElemHeight = options.singleElemHeight;
            }
            controller.comboCollection = comboCollection;
            controller.setContextElement(options["el"], options['containerHt']);
            if (typeof options['manager'] !== 'undefined') {
                controller._manager = options['manager'];
            }

            if (options['screenId']) {
                controller._screenID = options['screenId'];
            }
            if (controller._manager !== null) {
                controller._manager.unloadScreen('custom-combo-screen', options['idPrefix']);
                controller._manager.loadScreen('custom-combo-screen', options['idPrefix']);
                controller._manager.loadScreen(controller._screenID, options['idPrefix']);
            }
            controller.parseDOM();
            if (controller._manager !== null) {
                controller._manager.unloadScreen(controller._screenID, options['idPrefix']);
                controller._manager.loadScreen(controller._screenID, options['idPrefix']);
            }
            for (i = 0; i < options["elementData"].length; i++) { //select default item
                if (options["elementData"][i]['selectedIndex'] !== null && typeof options["elementData"][i]['selectedIndex'] !== 'undefined') {
                    options["el"].find('#' + options["elementData"][i]['elementID'])[0].selectedIndex = options["elementData"][i]['selectedIndex'];
                }
                idPrefix = controller.comboCollection[options["elementData"][i]['elementID']].get('idPrefix');

                if (controller._manager !== null) {
                    if (idPrefix) {
                        accText = controller._manager.getAccMessage(controller.comboCollection[options["elementData"][i]['elementID']].get('idPrefix') + 'commonCustomComboText', 0);
                    } else {
                        accText = controller._manager.getAccMessage('commonCustomComboText', 0);
                    }
                }
                selectedIndex = $('#' + options["elementData"][i]['elementID'])[0].selectedIndex;

                if (!selectedIndex && selectedIndex !== 0) {
                    selectedIndex = -1;
                }
                absoluteIndex = controller.getAbsoluteIndex(options["elementData"][i]['elementID'], selectedIndex);
                if (absoluteIndex === -1 || absoluteIndex === null || typeof absoluteIndex === 'undefined') {
                    paramText = controller._manager !== null ? controller._manager.getAccMessage(options["elementData"][i]['elementID'], selectedIndex) : '';
                } else {
                    paramText = controller.items[options["elementData"][i]['elementID']]
                        .linear[absoluteIndex].acc;
                }

                if (controller._manager !== null) {
                    controller._manager.setAccMessage(options["elementData"][i]['elementID'], accText, [paramText]);
                }
            }
            return controller;
        }
    });

    MathUtilities.Components.ComboboxController = MathUtilities.Components.Combobox.Views.CustomCombobox;

})();
