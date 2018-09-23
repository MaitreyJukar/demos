/* globals $, _, window */

(function(MathUtilities) {
    'use strict';

    MathUtilities.Tools.UnitConverter = MathUtilities.Tools.UnitConverter || {};
    MathUtilities.Tools.UnitConverter.Views = MathUtilities.Tools.UnitConverter.Views || {};
    MathUtilities.Tools.UnitConverter.Models = MathUtilities.Tools.UnitConverter.Models || {};

    /**
     * Renders the converter and manipulates the view at runtime,
     * 1 corresponds to left and 2 corresponds to right, throughout.
     * 
     * @module MathUtilities.Tools.UnitConverter
     * @class UnitConverter
     * @constructor
     * @extends Backbone.View
     * @namespace MathUtilities.Tools.UnitConverter.Views
     */
    MathUtilities.Tools.UnitConverter.Views.UnitConverter = Backbone.View.extend({

        /**
         * Contains the element represented by this `View`.
         *
         * @property el
         * @type String
         */
        "el": '#main-container',

        /**
         * Contains a jQuery `Object` of the left hand side input box.
         *
         * @property $value1
         * @type Object
         * @default null
         */
        "$value1": null,

        /**
         * Contains a jQuery `Object` of the right hand side input box.
         * 
         * @property $value2
         * @type Object
         * @default null
         */
        "$value2": null,

        /**
         * Contains a jQuery `Object` of the left hand side units drop-down.
         * 
         * @property $unit1
         * @type Object
         * @default null
         */
        "$unit1": null,

        /**
         * Contains a jQuery `Object` of the right hand side units drop-down.
         * 
         * @property $unit2
         * @type Object
         * @default null
         */
        "$unit2": null,

        /**
         * Contains a temporary jQuery `Object` that holds the undo button.
         *
         * @property $undoBtn
         * @type Object
         * @default null
         */
        "$undoBtn": null,

        /**
         * Contains a temporary jQuery `Object` that holds the redo button.
         *
         * @property $redoBtn
         * @type Object
         * @default null
         */
        "$redoBtn": null,

        /**
         * Contains a jQuery `Object` of the categories drop-down.
         * 
         * @property $categoriesDropDown
         * @type Object
         * @default null
         */
        "$categoriesDropDown": null,

        /**
         * Represents Backbone view of the unit and value displayer on the left hand side.
         * 
         * @property unitValueDisplayer1
         * @type Object
         * @default null
         */
        "unitValueDisplayer1": null,

        /**
         * Represents Backbone view of the unit and value displayer on the right hand side.
         * 
         * @property unitValueDisplayer2
         * @type Object
         * @default null
         */
        "unitValueDisplayer2": null,

        /**
         * Contains `Array` of categories with their corresponding unit's `Arrays`.
         * 
         * @property allCategoryUnits
         * @type Array
         * @defaults null
         */
        "allCategoryUnits": null,

        /**
         * Contains Index of the selected category.
         *
         * @property selectedCategoryIndex
         * @type Number
         * @default null
         */
        "selectedCategoryIndex": null,

        /**
         * Controller of the custom combo.
         *
         * @property customComboController
         * @type Object
         * @default null
         */
        "customComboController": null,

        "_bPropogateEvent": true,

        /**
         * @property accManagerView
         * @type Object
         * @default null
         */
        "accManagerView": null,


        /**
         * @property isAccessible
         * @type Boolean
         * @default null
         */
        "isAccessible": false,

        /**
         * Creates an undo-manager's view's object.
         *
         * @property undoManagerView
         * @type Object
         * @default null
         */
        "undoManagerView": null,

        "isMouseDownOnMathquill": false,

        /**
         * Automatically called by backbone.js when UnitConverter View object is instantiated.
         * 
         * @method initialize
         */
        "initialize": function() {
            var inputParams = {
                "holderDiv": null,
                "editorCall": true,
                "idCounter": 2
            };

            this.initAccessibility();
            this.allCategoryUnits = this.model.get('unitsDropDownOptions');
            this.render();

            this._createCustomComboboxes();
            this._cacheDOMElements();
            this.setDefaults();


            // Keeping drop-downs and input boxes disabled at the start
            this._disableDropDowns();
            this._disableInputs();

            MathUtilities.undoManager.registerModule(MathUtilities.Tools.UnitConverter.Models.UnitConverter.MODULE_NAME);

            // Mathquill elements.
            inputParams.holderDiv = $('.value-holder').first();
            MathUtilities.Components.MathEditor.Models.Application.init(inputParams);

            inputParams.holderDiv = $('.value-holder').eq(1);
            inputParams.idCounter = 3;
            MathUtilities.Components.MathEditor.Models.Application.init(inputParams);
            this.$('.outerDiv .mathquill-editable')
                .addClass('number-holders box-sizing-border-box unit-converter-mathquill').hide();


            this.undoManagerView = new MathUtilities.Components.Undo.Views.UndoManager({
                "el": this.el
            });

            this._bindEvents();

            if (this.isAccessible) {
                this._accessibilityOn();
            } else {
                this._accessibilityOff();
            }
        },

        /**
         * Instantiates Accessibility view
         * @method _initAccessibility
         */
        "initAccessibility": function() {
            var managerModel = new MathUtilities.Components.Manager.Models.Manager({
                    "isWrapOn": false,
                    "startTabindex": this.options.startTabindex
                }),
                accData = this.model.get('accJsonData'),
                isTouchSupported = MathUtilities.Components.Utils.Models.BrowserCheck.isMobile,
                isAccessible = this.options.bAllowAccessibility && !isTouchSupported;

            managerModel.parse(accData);

            //this function is called to set rule for parse.
            MathUtilities.Components.EquationEngine.Models.ProductionsAcc.init();

            managerModel.isAccessible = isAccessible;
            this.isAccessible = isAccessible;

            //create object of accessibility view
            this.accManagerView = new MathUtilities.Components.Manager.Views.Manager({
                "el": this.$el,
                "model": managerModel
            });
        },

        /**
         * attach accessibility's different event if its off.
         * @method _accessibilityOff
         * @private
         */
        "_accessibilityOff": function() {
            //load unit-converter screen.
            this.loadScreen('unit-converter');
        },


        /**
         * attach accessibility's different event if its on
         * @method _accessibilityOn
         * @private
         */
        "_accessibilityOn": function() {
            var enableUndoRedo,
                MODULE_NAME = MathUtilities.Tools.UnitConverter.Models.UnitConverter.MODULE_NAME,
                undoManager = MathUtilities.undoManager,
                displayData, isEnable;

            //Set tab index of mathquill textarea and input to -1
            this.$('#value-1, #value-2, #outerDiv-editor-0 textarea, #outerDiv-editor-1 textarea').attr('tabindex', -1);

            //load unit-converter screen.
            this.loadScreen('unit-converter');

            //set default focus at title
            this.setFocus('converter-title', 10);

            //change category drop-down focus in message
            this._changeComboFocusInText('categories-drop-down');

            enableUndoRedo = _.bind(function() {
                //check if undo data available
                this.enableTab('undo-btn', !!undoManager.isUndoAvailable(MODULE_NAME));

                //check if redo data available
                this.enableTab('redo-btn', !!undoManager.isRedoAvailable(MODULE_NAME));
            }, this);

            //initially disable undo-redo btn 
            enableUndoRedo();

            //initially disable unit and value tab index
            this._enableConversionBox(false);


            this.accManagerView.focusIn('categories-drop-down', _.bind(function() {
                isEnable = this.model.dataToDisplay.selectedCategoryIndex === 0;
                this.enableTab('textbox-focus-rect', !isEnable);
                this._enableConversionBox(!isEnable);

                //enable or disable undo-redo btn
                enableUndoRedo();
            }, this));

            this.accManagerView.focusIn('textbox-focus-rect', function() {
                //enable or disable undo-redo btn
                enableUndoRedo();
            });

            /*this condition added for disabling redo after undo perform and text change*/
            this.accManagerView.focusIn('undo-btn', enableUndoRedo);
            this.accManagerView.focusIn('hide-btn', enableUndoRedo);

            this.$('.number-holders')
                .on('keydown', _.bind(function(event) {
                    var $delegateTarget = $(event.delegateTarget);
                    switch (event.keyCode) {
                        case MathUtilities.Tools.UnitConverter.Views.UnitConverter.TAB_KEY: //on tab press set focus to holder
                            this.setFocus($delegateTarget.parents('.value-holder').first().attr('id'));
                            break;
                        case MathUtilities.Tools.UnitConverter.Views.UnitConverter.ENTER_KEY: //on enter set focus to textbox focus rect to read answer
                            this.setFocus('textbox-focus-rect', 50);
                            break;
                        case MathUtilities.Tools.UnitConverter.Views.UnitConverter.ESCAPE_KEY: //on escape set focus to holder
                            this.setFocus($delegateTarget.parents('.value-holder').first().attr('id'));
                            break;
                    }

                }, this));

            //on focus out of combo-box change override combo-box accessible text
            this.$('#categories-drop-down').on('keydown', _.bind(function(event) {
                if (event.keyCode === MathUtilities.Tools.UnitConverter.Views.UnitConverter.TAB_KEY) {
                    this._changeComboFocusInText('categories-drop-down');
                }
            }, this));

            this.$('#unit-1').on('keydown', _.bind(function(event) {
                if (event.keyCode === MathUtilities.Tools.UnitConverter.Views.UnitConverter.TAB_KEY) {
                    this._changeComboFocusInText('unit-1');
                }
            }, this));

            this.$('#unit-2').on('keydown', _.bind(function(event) {
                if (event.keyCode === MathUtilities.Tools.UnitConverter.Views.UnitConverter.TAB_KEY) {
                    this._changeComboFocusInText('unit-2');
                }
            }, this));

        },

        /**
         * Parses the DOM for select and option elements, converts it into Accessible Custom Combo box,
         * with setters/getters to make it pretend like actual Select element.
         *
         * @method createCustomComboboxes
         * @private
         * @return
         */
        "_createCustomComboboxes": function() {
            var BASEPATH = MathUtilities.Tools.UnitConverter.Models.UnitConverter.BASEPATH,
                imagePath = BASEPATH + 'js/math-utilities/components/combobox/images/arrow-up-down.png',
                DROPDOWN_OPEN,
                comboOptions = {
                    "el": this.$el,
                    "manager": this.accManagerView,
                    "screenId": 'combobox',
                    "elementData": [{
                        "elementID": 'categories-drop-down',
                        "selectedItem": 0,
                        "imagePath": imagePath
                    }, {
                        "elementID": 'unit-1',
                        "selectedItem": 0,
                        "imagePath": imagePath
                    }, {
                        "elementID": 'unit-2',
                        "selectedItem": 0,
                        "imagePath": imagePath
                    }]

                };
            this.customComboController = MathUtilities.Components.ComboboxController.generateCustomComboboxController(comboOptions);

            DROPDOWN_OPEN = MathUtilities.Components.ComboboxController.DROPDOWN_OPEN;
            this.customComboController.on(DROPDOWN_OPEN, _.bind(function(param) {
                var dropDownItem = this.$('.customComboDropDown').children(),
                    clone = dropDownItem.clone(),
                    leftShift = 0,
                    tempdiv = '<div id=\'temp-holder\' style=\'width:1000px;\'><div id=\'temp-dropDown\' class=\'customComboDropDown\'></div></div>',
                    width, minWidth, $originalDropDown;

                this.$el.append(tempdiv);
                width = this.$('#temp-dropDown').append(clone).width();

                this.$('#temp-holder').remove();
                $originalDropDown = this.$('.customComboDropDown');
                $originalDropDown.attr('id', param[0]+ '-dropdown');
                minWidth = parseInt($originalDropDown.css('min-width'));
                if (width > minWidth) {
                    if(param[0] === 'unit-2'){
                        leftShift = width - minWidth - 2; // 2 denotes border of associated drop-down
                    }
                    $originalDropDown.css({
                        "width": width,
                        "left": "-=" + leftShift
                    });
                }

            }, this));
        },

        /**
         * Sets the defaults values, such as selecting first index for combo boxes.
         * @method setDefaults
         */
        "setDefaults": function() {
            this.$("#categories-drop-down").prop("selectedIndex", 0);
            this.$("#unit-1, #unit-2").prop("selectedIndex", 0);

            this.valueHolder1 = this.$("#value-1").parent();
            this.valueHolder2 = this.$("#value-2").parent();

            this.valueHolder1.addClass("value-holder");
            this.valueHolder2.addClass("value-holder");

            this.$value1.addClass('ie10Input');
            this.$value2.addClass('ie10Input');
        },

        /**
         * Sets the HTML and renders the View of both components: drop-down menus and input boxes.
         * 
         * @method render
         */
        "render": function() {
            this._renderCategoriesDropDown();
            this._renderValueUnitDisplayers();
        },

        /**
         * Holds the events along with their namespaces and fires on change of dropdown and input box.
         * 
         * @property events
         * @type Object
         */
        "events": {
            "change #unit-1": '_unit1Changed',
            "change #unit-2": '_unit2Changed',
            "change #categories-drop-down": '_categoryChanged',
            "focus .number-holders": '_focusOnValueField'
        },

        /**
         * Renders the categories drop-down menus.
         * 
         * @method _renderCategoriesDropDown
         * @private
         */
        "_renderCategoriesDropDown": function() {
            var categoryDropDownOptions = this.model.get('categoryDropDownOptions'),
                categoryDropDown = new MathUtilities.Tools.UnitConverter.Models.CustomDropDown({
                    "dropDownID": 'categories-drop-down',
                    "cssClasses": 'custom-drop-down',
                    "optionsDetails": categoryDropDownOptions
                }),
                categoryDropDownView = new MathUtilities.Tools.UnitConverter.Views.CustomDropDown({
                    "model": categoryDropDown
                }),
                categoryDropDownHTML = categoryDropDownView.getHTML();

            this.$('#category-list-holder').append(categoryDropDownHTML);
        },

        /**
         * Renders the left and right input boxes and units' drop-downs.
         * 
         * @method _renderValueUnitDisplayers
         * @private
         */
        "_renderValueUnitDisplayers": function() {
            // Generates input box and drop down on left
            var displayer1 = new MathUtilities.Tools.UnitConverter.Models.UnitValueDisplayer({
                    "valueBoxID": 'value-1',
                    "valueBoxClasses": 'number-holders box-sizing-border-box',
                    "unitsDropDownOptions": this.allCategoryUnits[0],
                    "unitsDropDownID": 'unit-1',
                    "unitsDropDownCss": 'custom-drop-down box-sizing-border-box'
                }),
                displayer1HTML, displayer2, displayer2HTML;

            this.unitValueDisplayer1 = new MathUtilities.Tools.UnitConverter.Views.UnitValueDisplayer({
                "model": displayer1
            });
            displayer1HTML = this.unitValueDisplayer1.getHTML();

            this.$('#value-unit-holder-1').append(displayer1HTML);

            // Generates input box and drop down on right
            displayer2 = new MathUtilities.Tools.UnitConverter.Models.UnitValueDisplayer({
                "valueBoxID": 'value-2',
                "valueBoxClasses": 'number-holders box-sizing-border-box',
                "unitsDropDownOptions": this.allCategoryUnits[0],
                "unitsDropDownID": 'unit-2',
                "unitsDropDownCss": 'custom-drop-down box-sizing-border-box'
            });

            this.unitValueDisplayer2 = new MathUtilities.Tools.UnitConverter.Views.UnitValueDisplayer({
                "model": displayer2
            });
            displayer2HTML = this.unitValueDisplayer2.getHTML();

            this.$('#value-unit-holder-2').append(displayer2HTML);

        },

        /**
         * Stores the jquery DOM Object elements.
         * 
         * @method _cacheDOMElements
         * @private
         */
        "_cacheDOMElements": function() {
            this.$value1 = this.$('#value-1');
            this.$value2 = this.$('#value-2');

            this.$unit1 = this.$('#unit-1');
            this.$unit2 = this.$('#unit-2');

            this.$undoBtn = this.$('#undo-btn');
            this.$redoBtn = this.$('#redo-btn');

            this.$categoriesDropDown = this.$('#categories-drop-down');
        },

        /**
         * Removes the references of jquery object to DOM elements.
         * 
         * @method _unCacheDOMElements
         * @private
         */
        "_unCacheDOMElements": function() {
            delete this.$value1;
            delete this.$value2;
            delete this.$unit1;
            delete this.$unit2;
            delete this.$undoBtn;
            delete this.$redoBtn;
            delete this.model;
        },

        /**
         * Binds events to input boxes.
         * 
         * @method _bindEvents
         * @private
         */
        "_bindEvents": function() {
            var currView = this,
                MODULE_NAME = MathUtilities.Tools.UnitConverter.Models.UnitConverter.MODULE_NAME;


            this.$value1.on("blur", function() {
                currView.valueHolder1.removeClass("value-holder-focused");
            });

            this.$value2.on("blur", function() {
                currView.valueHolder2.removeClass("value-holder-focused");
            });


            if (!this._isIE()) {
                this.$value1.on({
                    "input": _.bind(this._updateParsedValue2, this)
                });

                this.$value2.on({
                    "input": _.bind(this._updateParsedValue1, this)
                });
            }
            // we do not directly update incase of IE for keydown, but we check for refresh if delete or backspace is pressed.
            // other browsers are smart enough to handle this on 'onInput'.
            this.$value1.on({
                    "keydown": _.bind(this._refreshValue2, this)
                })
                .on({
                    "keypress": _.bind(this._keyhandler1, this)
                });

            this.$value2.on({
                    "keydown": _.bind(this._refreshValue1, this)
                })
                .on({
                    "keypress": _.bind(this._keyhandler2, this)
                });


            // For nexus
            if (this._isNexus()) {
                this.$value1.on({
                    "keydown": _.bind(this._keyhandlerNexus1, this)
                });

                this.$value2.on({
                    "keydown": _.bind(this._keyhandlerNexus2, this)
                });
            }

            // Undo call on button click.
            this.$undoBtn.on('click', function() {
                if (MathUtilities.undoManager.isUndoAvailable(MODULE_NAME)) {
                    MathUtilities.undoManager.undo(MODULE_NAME);
                }
            });

            // Redo call on button click.
            this.$redoBtn.on('click', function() {
                if (MathUtilities.undoManager.isRedoAvailable(MODULE_NAME)) {
                    MathUtilities.undoManager.redo(MODULE_NAME);
                }
            });

            // Undo call on Ctrl+Z || Command+Z.
            this.undoManagerView.on('undo:actionPerformed', function(event) {
                    if (MathUtilities.undoManager.isUndoAvailable(MODULE_NAME)) {
                        MathUtilities.undoManager.undo(MODULE_NAME);
                    }
                })
                // Redo call on Ctrl+Y || Command+Shift+Z.
                .on('redo:actionPerformed', function(event) {
                    if (MathUtilities.undoManager.isRedoAvailable(MODULE_NAME)) {
                        MathUtilities.undoManager.redo(MODULE_NAME);
                    }
                });

            this.$('.unit-converter-mathquill').on('mousedown', _.bind(this._checkForInputBox, this))
                .find('textarea').on('focus', function(event) {
                    //this.condition is added as after creating mathquill it set focus to textarea after timeout
                    //as at this point mathquill is not visible,so no need to call _checkForInputBox
                    if ($(this).parents('.unit-converter-mathquill').is(':visible')) {
                        currView._checkForInputBox(event);
                    }
                });

            $(this.model).on('updateView', function() {
                currView._displayData(currView.model.dataToDisplay);
            });

            if (this._isTouchDevice()) {
                this.eventManager = new MathUtilities.Components.EventManager();

                this.eventManager.listenTo(this.$unit1[0], MathUtilities.Components.EventManager.prototype.STATES.LONGTAP, this._onComboBoxLongTap, this);
                this.eventManager.listenTo(this.$unit2[0], MathUtilities.Components.EventManager.prototype.STATES.LONGTAP, this._onComboBoxLongTap, this);
                this.eventManager.listenTo(this.$categoriesDropDown[0], MathUtilities.Components.EventManager.prototype.STATES.LONGTAP, this._onComboBoxLongTap, this);

                $(window).on("touchstart", _.bind(function() {
                        this._hideToolTip();
                    }, this))
                    .on("touchend", _.bind(function() {
                        this._hideToolTip();
                    }, this))
                    .on("touchmove", _.bind(function() {
                        this._hideToolTip();
                    }, this));
            } else {
                $(window).on("mousedown", _.bind(function() {
                        this._hideToolTip();
                    }, this))
                    .on("click", _.bind(function() {
                        this._hideToolTip();
                    }, this));

            }

        },

        /**
         * Listener to long tap for touch devices, where we show the tooltip for comboboxes.
         * 
         * @method _onComboBoxLongTap
         * @params {Object} eventObject -- touch object
         * @params {target} target -- current target object
         * @private
         */
        "_onComboBoxLongTap": function(eventObject, target) {
            if (!eventObject) {
                return;
            }
            var strText = "",
                textEle, rect;

            if (this.$unit1[0] === target || this.$unit2[0] === target || this.$categoriesDropDown[0] === target) {
                textEle = $(target).find(".customComboSelectedItem");
                if (textEle && textEle.parent() && !textEle.parent().hasClass("CustomComboHolderDisabled")) {
                    rect = target.getBoundingClientRect();
                    strText = textEle.html().trim();
                    this.customComboController.setPos(rect.left + rect.width + window.scrollX, rect.top + rect.height + window.scrollY);
                    this.customComboController.showHint(strText, target.id);
                    this.customComboController.preventDefault(true);
                }
            }
        },

        /**
         * Hides the tooltip shown on combobox.
         * 
         * @method _hideToolTip
         * @params {Object} eventObject -- touch object
         * @private
         */
        "_hideToolTip": function(eventObject) {
            this.customComboController.hideHint();
        },

        /**
         * Listens keypress event , checks if value of key is valid into current value.
         * @method _keyhandler1
         * @returns {Boolean} Returns true if value can be inserted, else returns false.
         * @private
         */
        "_keyhandler1": function(event) {
            var keyPressFn = _.bind(function() {
                var cursorPos = this.$value1.get(0).selectionStart,
                    charCode = event.which || event.charCode;

                // For Firefox: Detects Ctrl+V key press event, ctrl +  A.
                if (this._isValidCtrlEvents(event)) {
                    return true;
                }

                this._bPropogateEvent = this._keyPressHandler(charCode, event.keyCode, this.$value1, cursorPos);

                _.delay(_.bind(this._updateParsedValue2, this), 10);

                return this._bPropogateEvent;
            }, this);

            return keyPressFn();

        },

        /**
         * Listens keypress event , checks if value of key is valid into current value.
         * @method _keyhandler2
         * @returns {Boolean} Returns true if value can be inserted, else returns false.
         * @private
         */
        "_keyhandler2": function(event) {
            var keyPressFn = _.bind(function() {
                var cursorPos = this.$value2.get(0).selectionStart,
                    charCode = event.which || event.charCode;

                // For Firefox: Detects Ctrl+V key press event.
                if (this._isValidCtrlEvents(event)) {
                    return true;
                }

                this._bPropogateEvent = this._keyPressHandler(charCode, event.keyCode, this.$value2, cursorPos);

                _.delay(_.bind(this._updateParsedValue1, this), 10);

                return this._bPropogateEvent;
            }, this);

            return keyPressFn();

        },

        /**
         * Listens keypress event , checks if value of key is valid into current value.
         * @method _keyhandlerNexus1
         * @returns {Boolean} Returns true if value can be inserted, else returns false.
         * @private
         */
        "_keyhandlerNexus1": function(event) {
            var keyPressFn = _.bind(function() {
                var preVal,
                    char,
                    val = this.$value1.val(),
                    cursorPos = this.$value1.get(0).selectionStart,
                    charCode = event.which || event.charCode;

                // For Firefox: Detects Ctrl+V key press event, ctrl +  A.
                if (this._isValidCtrlEvents(event)) {
                    return true;
                }

                preVal = val.substring(0, cursorPos - 1) + val.substring(cursorPos, val.length);
                char = val.substr(cursorPos - 1, 1);

                this._bPropogateEvent = this._keyDownHandler(char, preVal, this.$value1, cursorPos);

                // To remove Character
                if (!this._bPropogateEvent) {
                    this.$value1.val(preVal);
                }

                if (this._bPropogateEvent || !this._isIE()) {
                    _.delay(_.bind(this._updateParsedValue2, this), 1);
                }

                return this._bPropogateEvent;
            }, this);

            return keyPressFn();

        },

        /**
         * Listens keypress event , checks if value of key is valid into current value.
         * @method _keyhandlerNexus2
         * @returns {Boolean} Returns true if value can be inserted, else returns false.
         * @private
         */
        "_keyhandlerNexus2": function(event) {
            var keyPressFn = _.bind(function() {
                var preVal,
                    char,
                    val = this.$value2.val(),
                    cursorPos = this.$value2.get(0).selectionStart,
                    charCode = event.which || event.charCode;

                // For Firefox: Detects Ctrl+V key press event, ctrl +  A.
                if (this._isValidCtrlEvents(event)) {
                    return true;
                }

                preVal = val.substring(0, cursorPos - 1) + val.substring(cursorPos, val.length);
                char = val.substr(cursorPos - 1, 1);

                this._bPropogateEvent = this._keyDownHandler(char, preVal, this.$value2, cursorPos);

                // To remove Character
                if (!this._bPropogateEvent) {
                    this.$value2.val(preVal);
                }

                if (this._bPropogateEvent || !this._isIE()) {
                    _.delay(_.bind(this._updateParsedValue1, this), 1);
                }

                return this._bPropogateEvent;
            }, this);

            return keyPressFn();

        },

        /**
         * Detects ctrl + KEY events, and returns true if its type of control event.
         * @method _isValidCtrlEvents
         * @params {Object} event object
         * @returns {Bool} true if event is type of ctrl, else returns false.
         * @private
         */
        "_isValidCtrlEvents": function(event) {
            var charCode = event.which || event.charCode;
            //char code
            // 118 : lower case letter 'v'
            // 86 : upper case letter 'V'
            // 97 : lower case letter 'a'
            return event.ctrlKey && (charCode === 118 || charCode === 86 || charCode === 97);
        },

        /**
         * Parses the input value in keydown,up events. Checks for deletion of Exponent in it. And also updates the related textboxes.
         * @method _updateParsedValue1
         * @private
         */
        "_updateParsedValue1": function(event) {

            var timerFn = _.bind(function() {
                if (this._bPropogateEvent) {
                    var objFinalVal = this._getValidParsedInput(this.$value2); //finalValue
                    if (objFinalVal.bExponentChanged) {
                        this.$value2.val(objFinalVal.value);
                    }

                    if (objFinalVal.bValueChange) {
                        this._updateValue1();
                        this._addAttribToElement(this.$value2, objFinalVal.value);
                    }

                }
                this._bPropogateEvent = true;
            }, this);
            timerFn();
        },

        /**
         * Parses the input value in keydown,up events. Checks for deletion of Exponent in it. And also updates the related textboxes.
         * @method _updateParsedValue2
         * @private
         */
        "_updateParsedValue2": function(event) {

            var timerFn = _.bind(function() {
                if (this._bPropogateEvent) {
                    var objFinalVal = this._getValidParsedInput(this.$value1); //finalValue
                    if (objFinalVal.bExponentChanged) {
                        this.$value1.val(objFinalVal.value);
                    }

                    if (objFinalVal.bValueChange) {
                        this._updateValue2();
                        this._addAttribToElement(this.$value1, objFinalVal.value);
                    }
                }
                this._bPropogateEvent = true;
            }, this);

            timerFn();
        },


        /**
         * Refreshes the value one text box, depending on delete,backspace key is pressed.
         * @method _refreshValue1
         * @private
         */
        "_refreshValue1": function(event) {
            if (event.which === MathUtilities.Tools.UnitConverter.Views.UnitConverter.BACKSPACE_KEY ||
                event.which === MathUtilities.Tools.UnitConverter.Views.UnitConverter.DELETE_KEY) {
                _.delay(_.bind(this._updateParsedValue1, this), 0);
            }
        },

        /**
         * Refreshes the value one text box, depending on delete,backspace key is pressed.
         * @method _refreshValue2
         * @private
         */
        "_refreshValue2": function(event) {
            if (event.which === MathUtilities.Tools.UnitConverter.Views.UnitConverter.BACKSPACE_KEY ||
                event.which === MathUtilities.Tools.UnitConverter.Views.UnitConverter.DELETE_KEY) {
                _.delay(_.bind(this._updateParsedValue2, this), 0);
            }
        },

        /**
         * Adds value to a attribute to the element that is passed to it.
         * @method _addAttribToElement
         * @private
         */
        "_addAttribToElement": function(element, finalValue) {
            element.attr("data-value", finalValue);
        },

        "_isIE": function() {
            return navigator.appName === 'Microsoft Internet Explorer';
        },

        "_isNexus": function() {
            return navigator.platform === 'Linux armv7l';
        },

        /**
         * Unbinds events from input boxes, combo boxes, models and buttons. 
         * 
         * @method _unBindEvents
         * @private
         */
        "_unBindEvents": function() {
            this.$value1.off();
            this.$value2.off();
            this.$unit1.off();
            this.$unit2.off();
            this.valueHolder1.off();
            this.valueHolder2.off();
            this.$undoBtn.off();
            this.$redoBtn.off();
            $(this.model).off();
        },

        /**
         * Updates units' drop-downs according to the selected category.
         * 
         * @method _categoryChanged
         * @private
         */
        "_categoryChanged": function() {
            var selectedOptionIndex = this.$categoriesDropDown[0].selectedIndex,
                options = this.allCategoryUnits[selectedOptionIndex],
                newOptionsHTML = null;

            // Clear the data values
            this._resetInputBoxes();

            this.selectedCategoryIndex = selectedOptionIndex;

            // Fetching and appending new options
            newOptionsHTML = this.unitValueDisplayer1.getNewOptionsJSON(options);
            newOptionsHTML.data[0].enabled = false;


            this.customComboController.removeAllOptionsForComboWithId(this.$unit1.attr("id"));
            this.customComboController.removeAllOptionsForComboWithId(this.$unit2.attr("id"));
            this.customComboController.addOptionsToComboWithId(this.$unit1.attr("id"), newOptionsHTML);
            this.customComboController.addOptionsToComboWithId(this.$unit2.attr("id"), newOptionsHTML);

            if (selectedOptionIndex === 0) {
                newOptionsHTML.data[0].enabled = true;
                this.$unit1.prop("selectedIndex", "0");
                this.$unit2.prop("selectedIndex", "0");
            }


            // If 'Select' is selected, everything is disabled, else only input areas are disabled
            if (selectedOptionIndex === 0) {
                this._disableDropDowns();
                this._disableInputs();
                this._setValuesToUndoRedoMgr();
            } else {
                this._enableUnitsDropDowns();
                this._enableElement(this.$value1);
                this._enableElement(this.$value2);
                if (!this.model.bWIP) {
                    this.setDefaultState();
                }
            }


            //change focus in accessibility message of unit's combo-box
            //timeout for overriding unit changed combo-box acctext
            _.delay(_.bind(function() {
                this._changeComboFocusInText('unit-1');
                this._changeComboFocusInText('unit-2');
            }, this), 0);

            this.refreshDom();
        },

        "_setInputValue": function(oInput, mathquillElement) {
            if (oInput.is(':visible')) {
                return oInput.val();
            }
            return $(mathquillElement).mathquill('latex');
        },

        "_setValuesToUndoRedoMgr": function() {

            var $mathquillElements = this.$('.outerDiv').find('.unit-converter-mathquill');

            this.model.changedEvent({
                    "selectedCategoryIndex": this.$categoriesDropDown[0].selectedIndex,
                    "leftInputBoxValue": this._setInputValue(this.$value1, $mathquillElements[0]),
                    "leftDropDownSelectedIndex": this.$unit1.prop("selectedIndex"),
                    "rightInputBoxValue": this._setInputValue(this.$value2, $mathquillElements[1]),
                    "rightDropDownSelectedIndex": this.$unit2.prop("selectedIndex"),
                    "activeElement": document.activeElement
                });
        },

        "setDefaultState": function() {

            var tempDataToDisplay = this.model.dataToDisplay;
            MathUtilities.undoManager.setEnabled(MathUtilities.Tools.UnitConverter.Models.UnitConverter.MODULE_NAME, false);
            this.$value1.attr("isInputable", true);
            this.$value2.attr("isInputable", false);
            this.$unit1.prop("selectedIndex", "1");
            this.$unit2.prop("selectedIndex", "2");

            this.$value1.val('1');
            this._unit1Changed();
            MathUtilities.undoManager.setEnabled(MathUtilities.Tools.UnitConverter.Models.UnitConverter.MODULE_NAME, true);

            this.model.dataToDisplay = tempDataToDisplay;
            this._setValuesToUndoRedoMgr();
        },

        /**
         * Passes the index of left hand side drop-down menu.
         * 
         * @method _unit1Changed
         * @private
         */
        "_unit1Changed": function() {
            this._isValidInput('#value-1');
            this._unitChanged(1);
            this.$value1.attr("data-value", this.$value1.val());
        },

        /**
         * Passes the index of right hand side drop-down menu.
         * 
         * @method _unit2Changed
         * @private
         */
        "_unit2Changed": function() {
            this._isValidInput('#value-2');
            this._unitChanged(2);
            this.$value2.attr("data-value", this.$value2.val());
        },

        /**
         * Enables|Disables input boxes and calls for conversion.
         * 
         * @method _unitChanged
         * @param {Number} [dropDownNum] Index of the drop-down whose option is changed.
         * @private
         */
        "_unitChanged": function(dropDownNum) {
            var unitElement = this['$unit' + dropDownNum],
                selectedUnitIndex,
                $mathquillEditables = this.$('.outerDiv').find('.unit-converter-mathquill');

            // If we have the element found, then go ahead
            if (unitElement.length > 0) {
                selectedUnitIndex = unitElement[0].selectedIndex;
            } else {
                selectedUnitIndex = -1;
            }

            // If a unit is selected, enables the input area and calls for conversion,
            // else disables input box
            if (selectedUnitIndex > 0) {
                // If input area corresponding to currently changed units' drop-down is in disabled state,
                // it is enabled
                if (this['$value' + dropDownNum].val() === '-') {
                    this._enableElement(this['$value' + dropDownNum]);
                    this['$value' + dropDownNum].val('');
                }


                if (this.$value1.attr('isInputable') === 'true') {
                    this._updateValue2();
                } else {
                    this._updateValue1();
                }
            } else {
                this._disableElement(this['$value' + dropDownNum]);
                this['$value' + dropDownNum].val('-');
                $mathquillEditables.eq(dropDownNum - 1).hide();
                this['$value' + dropDownNum].show();
                this.changeSelector('value-' + dropDownNum + '-holder', false, '#value-' + dropDownNum);
            }
        },

        /**
         * Updates value in right hand side 'input box'.
         * 
         * @method _updateValue2
         * @private
         */
        "_updateValue2": function() {
            this._convertAndDisplay('unit-1', 'unit-2', 'value-1', 'value-2');
        },

        /**
         * Updates value in left hand side 'input box'.
         * 
         * @method _updateValue1
         * @private
         */
        "_updateValue1": function() {
            this._convertAndDisplay('unit-2', 'unit-1', 'value-2', 'value-1');
        },

        "_focusOnValueField": function(event) {
            this._checkForInputBox(event);


            //functionality which previously attach in _bindEvents
            // Focus and Normal css affects on the parent div of the input text element.

            var $target = $(event.target),
                currView = this;

            if ($target.is(currView.$value1)) {
                currView.valueHolder1.addClass("value-holder-focused");
                currView.valueHolder2.removeClass("value-holder-focused");

                currView.$value1.attr('isInputable', true);
                currView.$value2.attr('isInputable', false);
            } else if ($target.is(currView.$value2)) {

                currView.valueHolder2.addClass("value-holder-focused");
                currView.valueHolder1.removeClass("value-holder-focused");

                currView.$value1.attr('isInputable', false);
                currView.$value2.attr('isInputable', true);
            }

        },

        /**
         * Checks if the focused input-box contains the result or input, if it contains result
         * then resets both the input-boxes.
         *
         * @method _checkForInputBox
         * @private
         */
        "_checkForInputBox": function(e) {
            var data = null,
                oInput = null;

            if (!this.model.bWIP && e) {
                oInput = $(e.target);
                if (oInput.attr('isInputable') === 'false' || oInput.hasClass('unit-converter-mathquill') ||
                    oInput.parents().hasClass('unit-converter-mathquill')) {
                    this.isMouseDownOnMathquill = false;
                    this._resetInputBoxes(oInput.parents('.value-holder').find('input').attr('id')); 
                    //or condition is added for mathquill element mouse down event,if element is children of mathquill then it return siblings 'input' id
                    data = {
                        "selectedCategoryIndex": this.selectedCategoryIndex,
                        "leftInputBoxValue": this.$value1.val(),
                        "leftDropDownSelectedIndex": this.$unit1.prop('selectedIndex'),
                        "rightInputBoxValue": this.$value2.val(),
                        "rightDropDownSelectedIndex": this.$unit2.prop('selectedIndex'),
                        "activeElement": document.activeElement
                    };
                    this.model.changedEvent(data);

                    this._changeResultText();
                }
            }
            //to close combo-box as for mathquill document-mousedown event doesn't fire
            this.customComboController.closeOpenComboBoxes();
        },

        /**
         * Resets both the input field.
         * 
         * @method _resetValues
         * @private
         */
        "_resetInputBoxes": function(inputId) {
            var $mathquillEditables = this.$('.outerDiv .unit-converter-mathquill');

            if ((inputId === this.$value1.first().attr('id') && inputId !== this.model.dataToDisplay.activeElement.id) ||
                ($mathquillEditables.first().is(':visible'))) {
                this._setInitialValues(this.$value1);
                this.$value1.show();
                this.changeSelector('value-1-holder', false, '#value-1');
                $mathquillEditables.first().hide();

                this.$value1.attr({
                    "data-value": '',
                    "isInputable": true
                });

                this._setInitialValues(this.$value2);
                this.$value2.show();
                this.changeSelector('value-2-holder', false, '#value-2');

                this.$value2.attr({
                    "data-value": '',
                    "isInputable": false
                });

                this.$value1.focus();
            } else if ((inputId === this.$value2.first().attr('id') && inputId !== this.model.dataToDisplay.activeElement.id) ||
                ($mathquillEditables.first().is(':visible'))) {
                this._setInitialValues(this.$value2);
                this.$value2.show();
                this.changeSelector('value-2-holder', false, '#value-2');


                $mathquillEditables.eq(1).hide();

                this.$value2.attr({
                    "data-value": '',
                    "isInputable": true
                });

                this._setInitialValues(this.$value1);
                this.$value1.show();
                this.changeSelector('value-1-holder', false, '#value-1');
                this.$value1.attr({
                    "data-value": '',
                    "isInputable": false
                });

                this.$value2.focus();
            }
        },

        /**
         * Sets the input field's value to it's default value.
         * 
         * @method _setInitialValues
         * @private
         */
        "_setInitialValues": function(oInput) {
            if (oInput.attr('disabled') === 'disabled') {
                oInput.val('-');
            } else {
                oInput.val('');
            }
        },

        /**
         * Converts and displays final answer.
         * 
         * @method _convertAndDisplay
         * @param {String} [fromUnitDropDownID] ID of 'from unit' drop-down.
         * @param {String} [toUnitDropDownID] ID of 'to unit' drop-down.
         * @param {String} [inputDivID] ID of input box containing the value to be converted.
         * @param {String} [outputDivID] ID of text box where answer is to be displayed.
         * @private
         */
        "_convertAndDisplay": function(fromUnitDropDownID, toUnitDropDownID, inputDivID, outputDivID) {
            var fromUnitIndex = this.$('#' + fromUnitDropDownID)[0].selectedIndex,
                toUnitIndex = this.$('#' + toUnitDropDownID)[0].selectedIndex,
                inputValue = this.$('#' + inputDivID).val(),
                answer = null,
                degeneratedResult = null,
                outputNumber = parseInt(outputDivID.substr(6, 1), 10) - 1,
                mathquillElement = this.$('.outerDiv').find('.unit-converter-mathquill')[outputNumber],
                leftDropDown = this.model.dataToDisplay.leftDropDownSelectedIndex,
                rightDropDown = this.model.dataToDisplay.rightDropDownSelectedIndex;

            // Proceed only if both units are mentioned
            if (fromUnitIndex >= 1 && toUnitIndex >= 1) {
                if (inputValue !== '') {

                    answer = (this.model.convert({
                        "categoryIndex": this.selectedCategoryIndex - 1,
                        "fromUnitIndex": fromUnitIndex - 1,
                        "toUnitIndex": toUnitIndex - 1,
                        "valueToConvert": inputValue
                    }));
                }
                $(mathquillElement).hide();


                if (answer) {
                    answer = parseFloat(answer, 10).toString();

                    degeneratedResult = this._degenerateNumber(answer);
                    answer = this._regenerateNumber(degeneratedResult.ans, degeneratedResult.expo, mathquillElement);
                } else {
                    answer = '';
                }
            } else {
                return;
            }

            // Setting the focus again.
            if (!this.isAccessible) {
                if (this.$value1.attr('isInputable') === 'true') {
                    this.$value1.focus();
                } else {
                    this.$value2.focus();
                }
            }
            this.$value1.attr('isInputable', true);
            this.$value2.attr('isInputable', true);

            if (this.$value1[0].id === inputDivID) {
                if (leftDropDown !== fromUnitIndex || rightDropDown !== toUnitIndex) {
                    this.$('#' + inputDivID).val(inputValue);
                }
            } else if (this.$value2[0].id === inputDivID) {
                if (leftDropDown !== toUnitIndex || rightDropDown !== fromUnitIndex) {
                    this.$('#' + inputDivID).val(inputValue);
                }
            }

            this.$('#' + outputDivID).attr('isInputable', false);

            // Shows result
            if ($(mathquillElement).is(':visible')) {
                this.$('#' + outputDivID).hide();
                $(mathquillElement).mathquill('write', '')
                    .mathquill('latex', answer);
                this.$('.outerDiv').find('.unit-converter-mathquill').removeClass('hasCursor');
                this.changeSelector(outputDivID + '-holder', true);

            } else {
                this.$('#' + outputDivID).show()
                    .val(answer);
                this.changeSelector(outputDivID + '-holder', false, '#' + outputDivID);
            }
            this._addAttribToElement(this.$('#' + outputDivID), answer);

            // Registering result for undo-redo functionality.
            if (!this.model.bWIP) {
                this.model.changedEvent({
                    "selectedCategoryIndex": this.selectedCategoryIndex,
                    "leftInputBoxValue": this._setInputValue(this.$value1, mathquillElement),
                    "leftDropDownSelectedIndex": this.$unit1.prop('selectedIndex'),
                    "rightInputBoxValue": this._setInputValue(this.$value2, mathquillElement),
                    "rightDropDownSelectedIndex": this.$unit2.prop('selectedIndex'),
                    "activeElement": document.activeElement
                });
            }

            //change message of text-box rect
            this._changeResultText();
        },

        /**
         * Degenerates the answer into numeric and exponential parts
         * 
         * @method _degenerateNumber
         * @param {String} answer Contains the conversion generated.
         * @private
         * @return {Object} Object contains answer and exponent values.
         */
        "_degenerateNumber": function(answer) {
            var skipNegation = false,
                exponent = 0,
                length = answer.indexOf('.') >= 0 ? 7 : 6; //6 max allow number excluding symbol, 7 for decimal

            if (answer.indexOf('-') === 0) {
                length++;
            }

            if (answer.length > length) {
                if (answer.indexOf('.') >= 0 && answer.indexOf('e') <= 0) {
                    exponent = answer.split('.')[1].length;
                    answer = (parseFloat(answer) * Math.pow(10, exponent)).toString();
                } else if (answer.indexOf('e') > 0) {
                    exponent = parseInt(answer.substr(answer.indexOf('e') + 1, answer.length), 10) - exponent;
                    answer = answer.substr(0, answer.indexOf('e'));
                    skipNegation = true;
                }

                if (answer.indexOf('-') === 0) {
                    answer = parseFloat(answer).toPrecision(5); // if number is positive,use 5 point precision
                } else {
                    answer = parseFloat(answer).toPrecision(6); // if number is negative,use 6 point precision
                }
            }

            if (answer.indexOf('e') > 0) {
                exponent = parseInt(answer.substr(answer.indexOf('e') + 1, answer.length), 10) - exponent;
                answer = answer.substr(0, answer.indexOf('e'));
            } else if (!skipNegation) {
                exponent = -exponent;
            }
            return {
                'ans': answer,
                'expo': exponent
            };
        },

        /**
         * Regenerates the answer from numeric and exponential parts
         * 
         * @method _regenerateNumber
         * @param {String} answer Contains the conversion generated.
         * @param {number} exponent Counter for the exponent.
         * @param {Object} mathquillElement Contains the mathquill's element.
         * @private
         * @return {String} The final answer.   
         */
        "_regenerateNumber": function(answer, exponent, mathquillElement) {
            var length = null;
            if (exponent >= 6 || exponent < -3) { //check for number is greater than equal 10^6 or less than 10^-3
                while (parseInt(answer.split('.')[0], 10) > 9 || parseInt(answer.split('.')[0], 10) < -9) { //integer part should be between 0 to 9 or -1 to -9
                    exponent++;
                    answer = (parseFloat(answer) * Math.pow(10, -1)).toString();
                }

                if (exponent > 999 || exponent < -99) { //if number is greater than 10^999 or less than 10^-99,then number precision is 5
                    length = 3;
                } else if (exponent > 99 || exponent < -9) { //if number is greater than 10^99 or less than 10^-9,then number precision is 6
                    length = 4;
                } else {
                    length = 5; // if above condition's is not specified then number precision is 7
                }
                if (answer.indexOf('-') === 0) {
                    length--;
                }
                answer = parseFloat(answer).toFixed(length);

                answer = parseFloat(answer).toString() + '×10^{' + exponent.toString() + '}';
                $(mathquillElement).show();
            } else {
                answer = (parseFloat(answer) * Math.pow(10, exponent)).toString();
                if (answer.indexOf('.') >= 6) {
                    answer = answer.substr(0, 6); // if decimal point is at place 6 or greater break the number to 6 digit
                } else if (answer === 'Infinity' || answer === '-Infinity') {
                    answer = answer.substr(0, 10); // if answer is infinity or -infinity then answer length is 10
                } else if(answer.indexOf('.') >= 0) {
                    length = 6;
                    if(answer.indexOf('-') === 0){
                        length++;
                    }
                    answer = Number(parseFloat(answer).toFixed(length - answer.indexOf('.')));
                }
            }
            return answer;
        },

        /**
         * Removes trailing zeros from the generated answer.
         *
         * @method _removeTrailingZeros
         * @param {Number} tempAns, answer value which to be truncated
         * @private
         * @return {String} Returns truncated answer.
         */
        "_removeTrailingZeros": function(tempAns) {
            tempAns = 1 + tempAns;
            tempAns /= Math.pow(10, tempAns.length - 1);
            tempAns = tempAns.toString();
            tempAns = tempAns.split(".")[1];
            return tempAns;
        },

        /**
         * Triggers on a paste event and validates the clipboard's text to be pasted. 
         * 
         * @method _onPasteHandler
         * @param {number} pastedText Content to paste.
         * @param {string} selector Input type's jquery selector.
         * @private
         * @return {boolean} Returns true on success.
         */
        "_onPasteHandler": function(pastedText, selector) {
            var regexInput = /^[+-]?\d*?(?:\.\d+)?$/, //match positive or negative whole or decimal number, digit after decimal is compulsory
                val = null,
                cursorPos = null,
                curSelection = this._getSelectionText(),
                $selector = $(selector);

            if (pastedText) {
                val = $selector.val();
                cursorPos = $selector.get(0).selectionStart;

                if (curSelection.length > 0) {
                    val = val.substring(0, cursorPos) + pastedText + val.substr(cursorPos + curSelection.length, val.length);
                } else {
                    // Appends the content to be pasted to the input value at the current cursor position.
                    val = val.substring(0, cursorPos) + pastedText + val.substring(cursorPos, val.length);
                }


                // Returns false if the regular expression test fails.
                if (!regexInput.test(val)) {
                    return false;
                }

                // IE patch, if any thing is pasted, we need to update the other values.
                if (this._isIE()) {
                    if (selector === "#value-1") {
                        _.delay(_.bind(this._updateParsedValue2, this), 0);
                    } else {
                        _.delay(_.bind(this._updateParsedValue1, this), 0);
                    }

                }

                return true;
            }
        },

        /**
         * Validates the input's text on each keypress event. 
         * 
         * @method _keyPressHandler
         * @param {number} charCode, Character code for that keypress event.
         * @param {number} keyCode, Key code for that keypress event.
         * @param {string} selector, Input type's jquery selector.
         * @param {number} cursorPos, Cursor position.
         * @private
         * @return {boolean} Returns true on success.
         */
        "_keyPressHandler": function(charCode, keyCode, selector, cursorPos) {
            var val = null,
                regexInput = /^[+-]?\d*?(?:\.\d+)?$/, //match positive or negative whole or decimal number, digit after decimal is compulsory
                regexdecimal = /^[+-]?\d*\.$/, // check for number with decimal point at end
                curSelection = this._getSelectionText(),
                $selector = $(selector);

            val = $selector.val();

            if (curSelection.length > 0) {
                val = val.substring(0, cursorPos) + String.fromCharCode(charCode) + val.substr(cursorPos + curSelection.length, val.length);
            }
            // For binding the keypress value to the current input's value.
            // For key press event other than backspace press.
            else if (charCode !== MathUtilities.Tools.UnitConverter.Views.UnitConverter.BACKSPACE_KEY) {
                val = val.substring(0, cursorPos) + String.fromCharCode(charCode) + val.substring(cursorPos, val.length);
            }
            // Backspace press event.
            else if (charCode === MathUtilities.Tools.UnitConverter.Views.UnitConverter.BACKSPACE_KEY) {
                val = val.substring(0, cursorPos - 1) + val.substring(cursorPos, val.length);
            }
            // Delete button press event.
            else if (keyCode === MathUtilities.Tools.UnitConverter.Views.UnitConverter.DELETE_KEY) {
                val = val.substring(0, cursorPos) + val.substring(cursorPos + 1, val.length);
            }

            //char code
            // 45: negative(-) sign
            // 43: positive(+) sign
            // 46: decimal(.) sign
            // 48 to 57 : Numbers (0 to 9)
            // 8 : backspace
            // 0 : invalid keypress, like arrow keys

            // Check for selecting entire input data.
            if (($selector.val() === curSelection) && (charCode === 45 || charCode === 43 || charCode === 46)) {
                return true;
            }

            // Checks input box value's with the regex OR the first key down.
            if (regexInput.test(val) || ($selector.val() === '' && (charCode === 45 || charCode === 43 || charCode === 46))) {
                return true;
            }
            // Check for second key press (must not be '+'|'-'|'.' if already present, only numbers)
            if (($selector.val() === '+' || $selector.val() === '-') && (charCode > 48 && charCode < 57)) {
                if (cursorPos === 0) {
                    return false;
                }
                return true;
            }
            // Check for '.' decimal point.
            if ($selector.val().indexOf('.') < 0 && charCode === 46) {
                return true;
            }
            // Check for '+', '-' & number entering before '.' .
            if ((cursorPos <= $selector.val().indexOf('.')) && (charCode !== 8 && charCode !== 0)) {
                if (!regexdecimal.test(val)) {
                    return false;
                }
                return true;
            }
            // Return false for any char other than direction and backspace.
            if (charCode !== 8 && charCode !== 0) {
                return false;
            }
        },

        /**
         * Validates the input's text on each keydown event for nexus. 
         * 
         * @method _keyDownHandler
         * @param {number} Character code for that keypress event.
         * @param {number} Key code for that keypress event.
         * @param {string} Input type's jquery selector.
         * @param {number} Cursor position.
         * @private
         * @return {boolean} Returns true on success.
         */
        "_keyDownHandler": function(char, preVal, selector, cursorPos) {
            var val = $(selector).val(),
                regexInput = /^[+-]?\d*?(?:\.\d+)?$/, //match positive or negative whole or decimal number, digit after decimal is compulsory
                regexdecimal = /^[+-]?\d*\.$/, // check for number with decimal point at end
                regexDigit = /^\d+?$/, // check for digits
                curSelection = this._getSelectionText();

            // Check for selecting entire input data.
            if ((preVal === curSelection) && (char === '+' || char === '-' || char === '.')) {
                return true;
            }

            // Checks input box value's with the regex OR the first key down.
            if (regexInput.test(val) || (preVal === '' && (char === '+' || char === '-' || char === '.'))) {
                return true;
            }
            // Check for second key press (must not be '+'|'-'|'.' if already present, only numbers)
            if ((preVal === '+' || preVal === '-') && regexDigit.test(char)) {
                if (cursorPos === 0) {
                    return false;
                }
                return true;
            }
            // Check for '.' decimal point.
            if (preVal.indexOf('.') < 0 && char === '.') {
                return true;
            }
            // Check for '+', '-' & number entering before '.' .
            if ((cursorPos <= preVal.indexOf('.'))) {
                if (!regexdecimal.test(val)) {
                    return false;
                }
                return true;
            }
            // Return false for any char other than direction and backspace.
            return false;
        },

        /**
         * Prevents entering of invalid inputs like special characters except +, ., - and alphabets. 
         * 
         * @method _isValidInput
         * @param {Object} [selector] JQuery element of the currently selected 'input box'.
         * @private
         */
        "_isValidInput": function(selector) {
            var view = this,
                $selector = $(selector);

            $selector.each(function() {
                // Handles the Paste functionality.
                $selector.get(0).onpaste = function(e) {
                    var pastedText = null;

                    // Copy the clipboard's data ready to be pasted. ONLY for IE
                    if (window.clipboardData && window.clipboardData.getData) {
                        pastedText = window.clipboardData.getData('Text');
                    }
                    // Copy the clipboard's data ready to be pasted. For FireFox and Web-Kit
                    else if (e.clipboardData && e.clipboardData.getData) {
                        pastedText = e.clipboardData.getData('text/plain');
                    }
                    pastedText.trim();

                    //      while pasting text with white-spaces it checks a copy of the clipboard hence
                    //      the copy is trimmed and not the text itself.
                    //      It paste the original text at clipboard with white-spaces at the start and at the
                    //      end but it does not print the text if it contains white-spaces in between.

                    return view._onPasteHandler(pastedText, selector);
                };

                $selector.get(0).oncut = function() {
                    // IE patch, if any thing is pasted, we need to update the other values.
                    if (view._isIE()) {
                        if (selector === "#value-1") {
                            _.delay(_.bind(view._updateParsedValue2, view), 0);
                        } else {
                            _.delay(_.bind(view._updateParsedValue1, view), 0);
                        }

                    }
                    return true;
                };

            });
        },


        "_getValidParsedInput": function(inputElement) {
            var newValue,
                bHasExponent = false,
                bHasChanged = false,
                oldValue = inputElement.attr("data-value"),
                strFinalValue = newValue = inputElement.val();

            bHasExponent = oldValue ? (oldValue.split("e").length > 1) : false;
            if (bHasExponent && newValue.split("e").length <= 1) {
                strFinalValue = oldValue.split("e")[0];
                bHasChanged = true;
            }

            return {
                "value": strFinalValue,
                "bExponentChanged": bHasChanged,
                "bValueChange": (strFinalValue !== oldValue)
            };
        },

        "_getSelectionText": function() {
            var actualValue = "",
                text = "",
                selRange = null,
                range = null;

            if (window.getSelection && !this._isIE()) { // all browsers, except IE
                if (document.activeElement &&
                    (document.activeElement.tagName.toLowerCase() === "textarea" ||
                        document.activeElement.tagName.toLowerCase() === "input")) {
                    actualValue = document.activeElement.value;
                    text = actualValue.substring(document.activeElement.selectionStart,
                        document.activeElement.selectionEnd);
                } else {
                    selRange = window.getSelection();
                    if (selRange) {
                        text = selRange.toString();
                    }
                }
            } else {
                if (document.selection.createRange) { // Internet Explorer
                    range = document.selection.createRange();
                    if (range) {
                        text = range.text;
                    }
                }
            }

            return text;
        },

        /**
         * Disables the right and left 'input boxes'.
         * 
         * @method _disableInputs
         * @private
         */
        "_disableInputs": function() {
            this._disableElement(this.$value1);
            this._disableElement(this.$value2);

            this.$value1.val('-');
            this.$value2.val('-');
        },

        /**
         * Disables the right and left unit drop-downs.
         * 
         * @method _disableDropDowns
         * @private
         */
        "_disableDropDowns": function() {
            this.customComboController.enableDisableCombobox(this.$unit1.attr("id"), true);
            this.customComboController.enableDisableCombobox(this.$unit2.attr("id"), true);
        },

        /**
         * Enables the right and left unit drop-downs.
         * 
         * @method _enableUnitsDropDowns
         * @private
         */
        "_enableUnitsDropDowns": function() {
            this.customComboController.enableDisableCombobox(this.$unit1.attr("id"), false);
            this.customComboController.enableDisableCombobox(this.$unit2.attr("id"), false);
        },

        /**
         * Disables the given element.
         * 
         * @method _disableElement
         * @param {Object} [element] JQuery object of the element to be disabled.
         * @private
         */
        "_disableElement": function(element) {
            element.prop('disabled', 'disabled');
        },

        /**
         * Enables the given element.
         * 
         * @method _enableElement
         * @param {Object} [element] JQuery object of the element to be enabled.
         * @private
         */
        "_enableElement": function(element) {
            element.prop('disabled', false);
        },

        "_isTouchDevice": function() {
            return 'ontouchstart' in window || navigator.msMaxTouchPoints;
        },
        /**
         * Updates the view and displays the latest values according to the data object passed.
         * 
         * @method _displayData
         * @param {Object} [data] Necessary to update the view of the components.
         * @private
         */
        "_displayData": function(data) {
            this.model.bWIP = true;

            if (!data) {
                return;
            }

            var selectedCategoryIndex = parseInt(data.selectedCategoryIndex, 10),
                $mathquillElements = this.$('.outerDiv .unit-converter-mathquill');

            this.$categoriesDropDown.prop('selectedIndex', data.selectedCategoryIndex);

            if (selectedCategoryIndex === 0) {
                this.$unit1.prop('selectedIndex', 0);
                this.$unit2.prop('selectedIndex', 0);
                this._disableDropDowns();
                this._disableInputs();
            } else {
                this._enableUnitsDropDowns();

                this.$unit1.prop('selectedIndex', data.leftDropDownSelectedIndex);
                this.$unit2.prop('selectedIndex', data.rightDropDownSelectedIndex);

                if (data.leftDropDownSelectedIndex !== 0) {
                    this._enableElement(this.$value1);

                    if (data.leftInputBoxValue.indexOf('^') === -1) {
                        $mathquillElements.first().hide();
                        this.$value1.show();
                        this.changeSelector('value-1-holder', false, '#value-1');
                        this.$value1.val(data.leftInputBoxValue);
                    } else {
                        this.$value1.hide();
                        $mathquillElements.first().show();
                        this.changeSelector('value-1-holder', true, '#value-1');
                        $mathquillElements.first().mathquill('write', '')
                            .mathquill('latex', data.leftInputBoxValue);
                    }
                } else {
                    this._disableElement(this.$value1);
                    this.$value1.val('-');
                }

                if (data.rightDropDownSelectedIndex !== 0) {
                    this._enableElement(this.$value2);

                    if (data.rightInputBoxValue.indexOf('^') === -1) {
                        $mathquillElements.eq(1).hide();
                        this.$value2.show();
                        this.changeSelector('value-2-holder', false, '#value-2');

                        this.$value2.val(data.rightInputBoxValue);

                    } else {
                        this.$value2.hide();
                        $mathquillElements.eq(1).show()
                            .mathquill('latex', '')
                            .mathquill('latex', data.rightInputBoxValue);
                        this.changeSelector('value-2-holder', true);
                    }
                } else {
                    this._disableElement(this.$value2);
                    this.$value2.val('-');
                }
            }

            $(data.activeElement).focus();

            this.model.bWIP = false;

            //change message of text-box rect
            this._changeResultText();

            //after undo-redo set focus to text-box rect
            this._undoRedoPerform();

        },

        "refreshDom": function() {
            var ele = document.createElement("div");
            document.body.appendChild(ele);
            document.body.removeChild(ele);
        },

        /**
         * Destroys the view, removes it from DOM and unbinds all the events attached to it.
         * 
         * @method destroy
         */
        "destroy": function() {
            this._unBindEvents();
            this.unbind();
            this._unCacheDOMElements();
            this.remove();
        },
        /**
         *perform operation after undo-redo operation, for accessibility
         *@method _undoRedoPerform
         *@private
         **/
        "_undoRedoPerform": function() {
            if (this.isAccessible) {
                //check if further undo-redo operation available
                var displayData = this.model.dataToDisplay;


                //change focus in acc message of combo-boxes
                this._changeComboFocusInText('categories-drop-down');
                this._changeComboFocusInText('unit-1');
                this._changeComboFocusInText('unit-2');

                //check if any category is selected
                if (displayData.selectedCategoryIndex !== 0) {
                    this.setFocus('textbox-focus-rect');
                } else {
                    this.setFocus('categories-drop-down');
                }

            }

        },
        /**
         *change acc message for combo focus rect
         *@method _changeComboFocusInText
         *@private
         **/

        "_changeComboFocusInText": function(id) {
            var comboController = this.customComboController,
                selectedData = comboController.getComboSelectedData(id),
                accText;
            if (id === 'categories-drop-down') {
                accText = this.getAccMessage('commonCustomComboText', 0, [selectedData.acc, selectedData.acc]);
            } else {
                accText = this.getAccMessage(id, 0, [selectedData.acc]);
            }
            this.accManagerView.setAccMessage(id, accText);

        },
        /**
         *change acc message for text-box focus rect
         *@method _changeResultText
         *@private
         **/

        "_changeResultText": function() {

            var displayData = this.model.dataToDisplay,
                unit1, unit2, value1, value2,
                comboController = this.customComboController,
                firstSelectedData,
                secondSelectedData,
                leftValueEquationData,
                rightValueEquationData,
                leftLatex, rightLatex, leftValue, rightValue;

            //check any category selected
            if (displayData.selectedCategoryIndex === 0) {
                this.changeAccMessage('textbox-focus-rect', 1);
            } else {
                firstSelectedData = comboController.getComboSelectedData('unit-1');
                secondSelectedData = comboController.getComboSelectedData('unit-2');

                if (firstSelectedData && secondSelectedData) {
                    unit1 = firstSelectedData.acc;
                    unit2 = secondSelectedData.acc;

                    leftValue = displayData.leftInputBoxValue;
                    rightValue = displayData.rightInputBoxValue;
                    //get value text
                    if (leftValue !== "") {
                        leftValueEquationData = new MathUtilities.Components.EquationEngine.Models.EquationDataAcc();
                        leftLatex = leftValue.replace('×', '\\cdot');
                        leftLatex = leftLatex.replace('+', '');
                        leftValueEquationData.setLatex(leftLatex, true);
                        MathUtilities.Components.EquationEngine.Models.ParserAcc.parseEquation(leftValueEquationData);

                        value1 = leftValueEquationData.getAccText();
                    }

                    if (rightValue !== "") {
                        rightValueEquationData = new MathUtilities.Components.EquationEngine.Models.EquationDataAcc();
                        rightLatex = rightValue.replace('×', '\\cdot');
                        rightLatex = rightLatex.replace('+', '');
                        rightValueEquationData.setLatex(rightLatex, true);
                        MathUtilities.Components.EquationEngine.Models.ParserAcc.parseEquation(rightValueEquationData);

                        value2 = rightValueEquationData.getAccText();
                    }

                    if (leftValue === "" && rightValue === "") {
                        this.changeAccMessage('textbox-focus-rect', 0);
                        this.changeAccMessage('value-1-holder', 0, [unit1]);
                        this.changeAccMessage('value-2-holder', 0, [unit2]);
                    } else {
                        if (value1 && value2) {
                            if (this.$value1.attr('isinputable') === 'true') {
                                this.changeAccMessage('textbox-focus-rect', 1, [value1, unit1, value2, unit2]);
                            } else {
                                this.changeAccMessage('textbox-focus-rect', 1, [value2, unit2, value1, unit1]);
                            }
                            this.changeAccMessage('value-1-holder', 1, [value1, unit1]);
                            this.changeAccMessage('value-2-holder', 1, [value2, unit2]);
                        } else {

                            this.changeAccMessage('textbox-focus-rect', 2);
                            this.changeAccMessage('value-1-holder', 0, [unit1]);
                            this.changeAccMessage('value-2-holder', 0, [unit2]);
                        }
                    }
                }
            }

        },

        /**
         * Enable or disable tab of element in conversion-box
         * @method _enableConversionBox
         * @param isEnable {String} if true enable else disable.
         **/
        "_enableConversionBox": function(isEnable) {
            var elementId = ['unit-1', 'unit-2', 'value-1-holder', 'value-2-holder'],
                idCounter = 0,
                totalIds = elementId.length;

            for (; idCounter < totalIds; idCounter++) {
                this.enableTab(elementId[idCounter], isEnable);
            }


        },
        /**
         * load screen
         * @method loadScreen
         * @param screenId {String} of required element.
         **/
        "loadScreen": function(screenId) {
            this.accManagerView.loadScreen(screenId);
        },
        /**
         * unload screen
         * @method unloadScreen
         * @param screenId {String} of required element.
         **/
        "unloadScreen": function(screenId) {
            this.accManagerView.unloadScreen(screenId);
        },
        /**
         * Enable or disable tab of element
         * @method enableTab
         * @param elementId {String} of required element.
         * @param isEnable {String} if true enable else disable.
         **/
        "enableTab": function(elementId, isEnable) {
            if (this.isAccessible) {
                this.accManagerView.enableTab(elementId, isEnable);
            }
        },
        /**
         * Sets the focus to element.
         * @method setFocus
         * @param elementId {String} of required element.
         **/
        "setFocus": function(elementId, ndelay) {
            if (this.isAccessible) {
                this.accManagerView.setFocus(elementId, ndelay);
            }
        },

        /**
         * Call change Acc Message method, accessibility manager
         * @method changeAccMessage
         * @param accId {String}  Id of element.
         * @param messageId {String}  Id of message which is to be set
         * @param params {Array} array of replacement text for place holder(%@$%)(optional)
         */
        "changeAccMessage": function(accId, messageId, params) {
            if (this.isAccessible) {
                this.accManagerView.changeAccMessage(accId, messageId, params);
            }
        },
        /**
         * call getAccMessage Method of manager view if accessibility is on else return false
         * @method getAccMessage
         * @param accId {String} of required element.
         * @param messageId {String} Message Id of required message node.
         * @param params {Array} words to be replace.
         * @return {String} Returns null if element or message is not found.
         *         Returns the acc message if element and message node is found.
         **/
        "getAccMessage": function(accId, messageId, params) {
            if (this.isAccessible) {
                return this.accManagerView.getAccMessage(accId, messageId, params);
            }
            return null;
        },
        /**
         * change selector and is mathquill property.
         * @method changeSelector
         **/
        "changeSelector": function(inputField, isMathquill, selector) {
            this.accManagerView.setIsMathquill(inputField, isMathquill);
            if (selector) {
                this.accManagerView.setSelector(inputField, selector);
            }


        }
    }, {
        "ESCAPE_KEY": 27,
        "ENTER_KEY": 13,
        "TAB_KEY": 9,
        "SPACE_BAR_KEY": 32,
        "DELETE_KEY": 46,
        "BACKSPACE_KEY": 8
    });

})(window.MathUtilities);
