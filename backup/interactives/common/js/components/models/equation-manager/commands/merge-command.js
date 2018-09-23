(function () {
    'use strict';

    var namespace = MathInteractives.Common.Components.Models.EquationManager,
        modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * Adds a new tile to the workspace
    * @class MergeCommand
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    * @extends MathInteractives.Common.Components.Models.EquationManager.BaseCommand
    * @type Object
    * @constructor
    */
    namespace.MergeCommand = namespace.BaseCommand.extend({

        /**
        * Defaults values for the model attributes
        *
        * @attribute defaults
        * @type Object
        * @default {}
        **/
        defaults: {
            sourceIndex: null,      // Index of the tile where the parens are dragged
            sourceLocation: null,
            destIndex: null,      // Index of the tile where the parens are dropped
            destLocation: null,
            modelRef: null
        },

        /**
        * Initializes the Break exponent command
        *
        * @method initialize
        */
        initialize: function () {
        },

        /**
        * Executes the break exponent command
        *
        * @method execute
        */
        execute: function () {
            var sourceIndex = this.get('sourceIndex'),
                sourceLocation = this.get('sourceLocation'),
                destIndex = this.get('destIndex'),
                destLocation = this.get('destLocation'),
                modelRef = this.get('modelRef'),
                numerator = modelRef.get('numerator'),
                denominator = modelRef.get('denominator'),
                sourceColl = this.get('sourceLocation') === 1 ? numerator : denominator,   // numOrDenArr is numerator if sourceLoc = 1 and is denominator if sourceLoc = 0
                destColl = this.get('sourceLocation') === 1 ? numerator : denominator,   // numOrDenArr is numerator if sourceLoc = 1 and is denominator if sourceLoc = 0
                sourceTile = sourceColl.at(sourceIndex),
                destTile = destColl.at(destIndex),
                innerTiles = sourceTile.get('tileArray').models,
                newDestTile = null;

            destTile.get('tileArray').add(sourceTile);
            sourceColl.remove(sourceTile);
        },

        /**
        * Undoes the command according to the data passed
        *
        * @method undo
        */
        undo: function () {
            throw 'No undo functionality'
        },

    });

})();