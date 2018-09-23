(function (MathUtilities) {
    'use strict';

    /**
    * A customized Backbone.Model that represents Keyboard-functions
    * @class FunctionPanelModel
    * @constructor
    * @namespace Components.MathEditor.Keyboard.Models
    * @module MathEditor
    * @submodule Keyboard
    * @extends Backbone.Model
    */
    MathUtilities.Components.MathEditor.Keyboard.Models.ExpressionPanel = Backbone.Model.extend({
        defaults: {

            /**
            * @property symbolJson
            * @type Object
            * @default null
            */
            symbolJson: null,

            /**
            * @property useSymbols
            * @type bool
            * @default null
            */
            useSymbols: null,

            /**
            * @property showSymbolPanel
            * @type Object
            * @default null
            */
            showSymbolPanel: false,

            /**
            * @property currLatex
            * @type string
            * @default ''
            */
            currLatex: '',

            /**
            * @property passedLatex
            * @type string
            * @default ''
            */
            passedLatex: '',

            /**
            * @property elmHolder
            * @type jqueryElement
            * @default null
            */
            elmHolder: null,

            /**
            * @property showPanel
            * @type bool
            * @default null
            */
            showPanel: true,

            /**
            * @property addCallback
            * @type object
            * @default null
            */
            addCallback: null,

            /**
            * @property cancelCallback
            * @type object
            * @default null
            */
            cancelCallback: null,

            /**
            * @property completeCallback
            * @type object
            * @default null
            */
            completeCallback: null
        },

        /**
        * Sets jsonData property
        * @method parseData
        * @param symbolJson{object} Its JSON data for symbol panel.
        */
        parseData: function parseData(symbolJson) {
            this.set('symbolJson', symbolJson);
        },

        /**
        * Populate the model attributes.
        * @method setExpressionData
        * @param expressionData {object}  Its contains the data related to expression panel.
        * @param expressionData.useSymbols {bool}   Use symbol in expression panel.
        * @param  expressionData.latex {string} The latex of the mathquill equation.
        * @param expressionData.callbacks{object} Contains the callbacks to be called on add or cancel of the mathquill expression.
        * @param expressionData.showSymbolPanel{bool} Show symbol panel initailly.
        */
        setExpressionData: function (expressionData) {
            var useSymbols = expressionData.useSymbols,
                latex = expressionData.latex,
                callbacks = expressionData.callbacks,
                addCallback = null,
                cancelCallback = null,
                completeCallback = null,
                showSymbolPanel = expressionData.showSymbolPanel,
                elmHolder = expressionData.elmHolder;

            if (typeof (useSymbols) !== 'boolean') {
                useSymbols = false;
            }

            if (typeof (showSymbolPanel) !== 'boolean') {
                showSymbolPanel = false;
            }

            if (typeof (latex) !== 'string') {
                latex = '';
            }

            if (typeof (callbacks) === 'object') {
                if (typeof (callbacks.add) === 'function') {
                    addCallback = callbacks.add;
                }
                if (typeof (callbacks.cancel) === 'function') {
                    cancelCallback = callbacks.cancel;
                }
                if (typeof (callbacks.complete) === 'function') {
                    completeCallback = callbacks.complete;
                }
            }

            if (elmHolder instanceof jQuery) {
                // iframe objects are not accessible once the iframe is closed in IE and Edge.
                // this.set() uses _.isEqual internally. This was throwing a js error hence this.set is not used here.
                this.elmHolder = elmHolder;
                this.trigger('elmHodlerChange');
            }
            this.set('useSymbols', useSymbols);
            this.set('passedLatex', latex);
            this.set('addCallback', addCallback);
            this.set('cancelCallback', cancelCallback);
            this.set('completeCallback', completeCallback);
            this.set('currLatex', latex);
            this.set('showSymbolPanel', showSymbolPanel);
        },
        "getElmHolder": function() {
            return this.elmHolder;
        }
    });
}(window.MathUtilities));
