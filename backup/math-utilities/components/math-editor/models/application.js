/* globals $, window */

(function(MathUtilities) {
    'use strict';

    if (MathUtilities.Components.MathEditor !== void 0 && MathUtilities.Components.MathEditor !== null) {
        return;
    }
    /* Initialize MathUtilities Data */
    MathUtilities.Components.MathEditor = {};

    /**
     * Packages all the models used in the MathEditor module.
     * @module Models
     * @namespace MathUtilites.Components.MathEditor
     **/
    MathUtilities.Components.MathEditor.Models = {};

    /**
     * Packages all the views used in the MathEditor module.
     * @module Views
     * @namespace MathUtilites.Components.MathEditor
     **/
    MathUtilities.Components.MathEditor.Views = {};

    /* Initialize Keyboard Data */
    MathUtilities.Components.MathEditor.Keyboard = {};

    /* Initialize EquationEditor Data */
    MathUtilities.Components.MathEditor.EquationEditor = {};

    /**
     * Packages all the models used in the Keyboard module.
     * @module Models
     * @namespace MathUtilites.Components.MathEditor.Keyboard
     **/
    MathUtilities.Components.MathEditor.Keyboard.Models = {};

    /**
     * Packages all the views used in the manager module.
     * @module Views
     * @namespace MathUtilites.Components.MathEditor.Keyboard
     **/
    MathUtilities.Components.MathEditor.Keyboard.Views = {};

    /**
     * Packages all the collections used in the manager module.
     * @module Collections
     * @namespace MathUtilites.Components.Keyboard
     **/
    MathUtilities.Components.MathEditor.Keyboard.Collections = {};


    /**
     * Packages all the models used in the EquationEditor module.
     * @module Models
     * @namespace MathUtilites.Components.MathEditor.EquationEditor
     **/
    MathUtilities.Components.MathEditor.EquationEditor.Models = {};

    /**
     * Packages all the views used in the EquationEditor module.
     * @module Views
     * @namespace MathUtilites.Components.MathEditor.EquationEditor
     **/
    MathUtilities.Components.MathEditor.EquationEditor.Views = {};

    /**
     * Packages all the collections used in the EquationEditor module.
     * @module Collections
     * @namespace MathUtilites.Components.MathEditor.EquationEditor
     **/
    MathUtilities.Components.MathEditor.EquationEditor.Collections = {};

    /**
     * A customized Backbone.Model that initializes Keyboard and equation editor.
     * @class Application
     * @constructor
     * @namespace Components.MathEditor.Models
     * @module MathEditor
     * @extends Backbone.Model
     */
    MathUtilities.Components.MathEditor.Models.Application = Backbone.Model.extend(null, {
        "init": function (inputParameters) {
            var jsonData = null,
                json = null,
                mathEditorModel = null,
                divKeyboard = null,
                i = 0,
                showKeyBoard = false,
                inputParams = $.extend(true, {}, inputParameters);

            if (inputParams.keyboardObject) {
                showKeyBoard = true;
            }
            inputParams.keyboardObject = MathUtilities.Components.MathEditor.Keyboard.Instance;
            if ((inputParams.keyboardHolder === null || inputParams.keyboardHolder === void 0) &&
                (inputParams.keyboardObject === null || inputParams.keyboardObject === void 0) &&
                inputParams.keyboardCall) {
                inputParams.keyboardHolder = '#math-utilities-keyboard-container';
                if ($(inputParams.keyboardHolder).length === 0) {
                    var holder = '<div id="math-utilities-keyboard-container"></div>';
                    $('body').append($(holder));
                }

            } else if ((inputParams.keyboardHolder === null || inputParams.keyboardHolder === void 0) &&
                !(inputParams.keyboardObject === null || inputParams.keyboardObject === void 0) &&
                inputParams.keyboardCall) {
                inputParams.keyboardHolder = '#math-utilities-keyboard-container';
            }

            if (inputParams.editButtons) {
                inputParams.btnContainer.append(MathUtilities.Components.MathEditor.templates.undoRedo().trim());
            }
            if (inputParams.editorCall) {
                jsonData = equationJson;
                if (inputParams.shortcutArray) {
                    for (; i < inputParams.shortcutArray.length; i++) {
                        equationJson[inputParams.shortcutArray[i]].render = false;
                    }
                }
            }

            if (inputParams.keyboardCall) {
                showKeyBoard = true;
                if (inputParams.keyboardObject === null || inputParams.keyboardObject === void 0) {
                    divKeyboard = MathUtilities.Components.MathEditor.templates.keyboardContainer().trim();
                    $(inputParams.keyboardHolder).addClass('keyboardContainer')
                        .append(divKeyboard);
                }
                json = keyboardJson;
            }

            if (inputParams.expressionData === void 0) {
                inputParams.expressionData = null;
            }

            mathEditorModel = new MathUtilities.Components.MathEditor.Models.MathEditor();
            mathEditorModel.parseData({
                "jsonData": json,
                "equationJsonData": jsonData,
                "editorCall": inputParams.editorCall,
                "keyboardCall": inputParams.keyboardCall,
                "enterClick": inputParams.enterClick,
                "idCounter": inputParams.idCounter,
                "keyboardObject": inputParams.keyboardObject,
                "closeButton": inputParams.closeButton,
                "keyboardHolder": inputParams.keyboardHolder,
                "enterClickFunction": inputParams.enterClickFunction,
                "defaultFocus": inputParams.defaultFocus,
                "isAccessibilityAllow": inputParams.allowAccessibility,
                "basePath": inputParams.basePath,
                "expressionData": inputParams.expressionData,
                "keyboardVisible": inputParams.keyboardVisible,
                "donotBindTab": inputParams.donotBindTab
            });
            new MathUtilities.Components.MathEditor.Views.MathEditor({
                "model": mathEditorModel,
                "el": inputParams.holderDiv
            });

            var instance = MathUtilities.Components.MathEditor.Keyboard.Instance;
            if (instance === null || instance === void 0) {
                MathUtilities.Components.MathEditor.Keyboard.Instance = mathEditorModel.get('keyboardView');
            }
            if (showKeyBoard && inputParams.keyboardVisible !== false) {
                $('#keyboardHolder').show();
                $('.math-utilities-math-editor-keyboard').show();
            }
            return mathEditorModel.get('keyboardView');
        }
    }, {
        "MANAGER_VIEW": null
    });
}(window.MathUtilities));
