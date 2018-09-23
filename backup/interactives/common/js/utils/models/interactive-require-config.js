(function () {
    'use strict';

    /*
    * Stores the config map for interactive
    */
    var configMap = {
        'popblocks-2': function (corePath) {
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
    };

    /**
    * Contains Require Configs of interactives
    *
    * @class RequireConfig
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Utilities.Models
    */
    MathInteractives.Common.Utilities.Models.RequireConfig = Backbone.Model.extend({}, {
        /**
        * Sets the require configuration of respective interactive
        *
        * @method setConfig
        * @param interactiveFolderName {String} 
        * @param basePath {String} base path of the file
        */
        setConfig: function setConfig(interactiveFolderName, basePath) {
            var currentInteractiveConfig = configMap[interactiveFolderName],
                config = null;
            if (currentInteractiveConfig) {
                config = currentInteractiveConfig(basePath);
            }
            if (config && requirejs) {
                requirejs.config(config);
            }
        }
    });
})();