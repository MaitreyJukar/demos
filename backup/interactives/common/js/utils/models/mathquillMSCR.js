(function () {
    /**
    * Contains Mathquill MSCR related methods
    *
    * @class MathquillMSCR
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Utilities.Models
    */
    MathInteractives.Common.Utilities.Models.MathquillMSCR = Backbone.Model.extend({}, {

        /**
        * Generates a mathquill editor in the DIV passed as holderDiv in options parameter.
        *
        * @method makeEditorCall
        * @param options {Object} options = { holderDiv: Holder inside which mathquill span is to be added,
            equationJson: equationJson loaded by interactivity }
        * @return  {Object} The keyboard view object returned only if null is passed as keyBoard object
        */
        makeEditorCall: function makeEditorCall(options) {
            return MathUtilities.Components.MathEditor.Models.Application.init(options);
        },

        /**
        * Initialize Equation Engine Productions
        *
        * @method initEquationEngineProductions
        */
        //To be called just once
        initEquationEngineProductions: function initEquationEngineProductions() {
            MathUtilities.Components.EquationEngine.Models.Productions.init();
        },

        /**
        * Creates an equation object and returns it
        *
        * @method getEquationObject
        * @return {Object} The equation object
        */
        //To be called just once
        getEquationObject: function getEquationObject() {
            var eqnObject = new MathUtilities.Components.EquationEngine.Models.EquationData();
            eqnObject.getDirectives().FDFlagMethod = 'graphing';
            return eqnObject;
        },

        /**
        * Returns accessibility text for the equation passed as latex string.
        *
        * @method getEquationAccText
        * @param inputString {String} The latex string of the equation whose accessibility text is required.
        * @return {String} The converted string in human readable form.
        */
        getEquationAccText: function getEquationAccText(inputString) {
            return MathUtilities.Components.EquationEngine.Models.ParserAssist.getEquationAccessibility(inputString);
        },

        //requireDefination
        requireConfigLoadForKeyBoard: function requireConfigLoadForKeyBoard(corePath) {
            requirejs.config(function () {
                // There needs to be a global debug flag that needs to be used in order to load minified or unminified files of keyboard.
                // Currently the unminified files of keyboard are loaded

                var isDebug = true;
                if (isDebug) {
                    return {
                        waitSeconds: 15,
                        paths: {
                            'mathInteractive-equationData': corePath + 'data/math-utilities/components/math-editor/equation',
                            'mathInteractive-keyboardData': corePath + 'data/math-utilities/components/math-editor/keyboard',
                            'mathInteractive-application': corePath + 'js/math-utilities/components/math-editor/models/application',
                            'mathInteractive-mathFunction': corePath + 'js/math-utilities/components/equation-engine/scripts/models/math-functions',
                            'mathInteractive-functionPanel': corePath + 'js/math-utilities/components/math-editor/models/function-panel',
                            'mathInteractive-basePanel': corePath + 'js/math-utilities/components/math-editor/models/base-panel',
                            'mathInteractive-keyMatrix': corePath + 'js/math-utilities/components/math-editor/models/key-matrix',
                            'mathInteractive-expressionPanel': corePath + 'js/math-utilities/components/math-editor/models/expression-panel',
                            'mathInteractive-browserCheck': corePath + 'js/math-utilities/components/utils/models/browser-check',
                            'mathInteractive-expressionPanelView': corePath + 'js/math-utilities/components/math-editor/views/expression-panel',
                            'mathInteractive-functionPanelView': corePath + 'js/math-utilities/components/math-editor/views/function-panel',
                            'mathInteractive-basePanelView': corePath + 'js/math-utilities/components/math-editor/views/base-panel',
                            'mathInteractive-keyMatrixView': corePath + 'js/math-utilities/components/math-editor/views/key-matrix',
                            'mathInteractive-alphabetPanel': corePath + 'templates/core/math-utilities/components/math-editor/alphabetPanel',
                            'mathInteractive-expressionPanelTempalte': corePath + 'templates/core/math-utilities/components/math-editor/expressionPanel',
                            'mathInteractive-closeButton': corePath + 'templates/core/math-utilities/components/math-editor/closeButton',
                            'mathInteractive-editableTextbox': corePath + 'templates/core/math-utilities/components/math-editor/editableTextbox',
                            'mathInteractive-functionPanelTemplate': corePath + 'templates/core/math-utilities/components/math-editor/functionPanel',
                            'mathInteractive-header': corePath + 'templates/core/math-utilities/components/math-editor/header',
                            'mathInteractive-key': corePath + 'templates/core/math-utilities/components/math-editor/key',
                            'mathInteractive-keyboardTemplate': corePath + 'templates/core/math-utilities/components/math-editor/keyboard',
                            'mathInteractive-keyboardHolder': corePath + 'templates/core/math-utilities/components/math-editor/keyboardHolder',
                            'mathInteractive-keyboardTitleHolder': corePath + 'templates/core/math-utilities/components/math-editor/keyboardTitleHolder',
                            'mathInteractive-numberPanel': corePath + 'templates/core/math-utilities/components/math-editor/numberPanel',
                            'mathInteractive-undoRedo': corePath + 'templates/core/math-utilities/components/math-editor/undoRedo',
                            'mathInteractive-keyboardContainer': corePath + 'templates/core/math-utilities/components/math-editor/keyboardContainer',
                            'mathInteractive-sectionFocusRect': corePath + 'templates/core/math-utilities/components/math-editor/sectionFocusRect',
                            'mathInteractive-keyboard': corePath + 'js/math-utilities/components/math-editor/models/keyboard',
                            'mathInteractive-keyboardView': corePath + 'js/math-utilities/components/math-editor/views/keyboard',
                            'mathInteractive-equationEditor': corePath + 'js/math-utilities/components/math-editor/models/equation-editor',
                            'mathInteractive-equationEditorView': corePath + 'js/math-utilities/components/math-editor/views/equation-editor',
                            'mathInteractive-equationParser': corePath + 'js/math-utilities/components/equation-engine/scripts/models/equation-parser',
                            'mathInteractive-mathEditor': corePath + 'js/math-utilities/components/math-editor/models/math-editor',
                            'mathInteractive-mathEditorView': corePath + 'js/math-utilities/components/math-editor/views/math-editor'

                        },

                        shim: {
                            'mathInteractive-functionPanel': ['mathInteractive-application'],
                            'mathInteractive-basePanel': ['mathInteractive-application'],
                            'mathInteractive-keyMatrix': ['mathInteractive-application'],
                            'mathInteractive-expressionPanel': ['mathInteractive-application'],
                            'mathInteractive-browserCheck': ['mathInteractive-application'],
                            'mathInteractive-expressionPanelView': ['mathInteractive-application'],
                            'mathInteractive-functionPanelView': ['mathInteractive-application'],
                            'mathInteractive-basePanelView': ['mathInteractive-application'],
                            'mathInteractive-keyMatrixView': ['mathInteractive-application'],
                            'mathInteractive-alphabetPanel': ['mathInteractive-application'],
                            'mathInteractive-expressionPanelTempalte': ['mathInteractive-application'],
                            'mathInteractive-closeButton': ['mathInteractive-application'],
                            'mathInteractive-editableTextbox': ['mathInteractive-application'],
                            'mathInteractive-functionPanelTemplate': ['mathInteractive-application'],
                            'mathInteractive-header': ['mathInteractive-application'],
                            'mathInteractive-key': ['mathInteractive-application'],
                            'mathInteractive-keyboardTemplate': ['mathInteractive-application'],
                            'mathInteractive-keyboardHolder': ['mathInteractive-application'],
                            'mathInteractive-keyboardTitleHolder': ['mathInteractive-application'],
                            'mathInteractive-numberPanel': ['mathInteractive-application'],
                            'mathInteractive-undoRedo': ['mathInteractive-application'],
                            'mathInteractive-keyboardContainer': ['mathInteractive-application'],
                            'mathInteractive-sectionFocusRect': ['mathInteractive-application'],
                            'mathInteractive-keyboard': ['mathInteractive-application'],
                            'mathInteractive-keyboardView': ['mathInteractive-application'],
                            'mathInteractive-equationEditor': ['mathInteractive-application'],
                            'mathInteractive-equationEditorView': ['mathInteractive-application'],
                            'mathInteractive-equationParser': ['mathInteractive-mathFunction'],
                            'mathInteractive-mathEditor': ['mathInteractive-application'],
                            'mathInteractive-mathEditorView': ['mathInteractive-application'],
                        }
                    }
                }
                else {
                    return {
                        paths: {
                            'keyboardAutoload': 'js/math-utilities/components/math-editor/keyboard-autoload.min'
                        }
                    }

                }
            }());

        }

    });
})();