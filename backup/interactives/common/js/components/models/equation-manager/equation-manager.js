(function (MathInteractives) {
    'use strict';

    var modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * EquationManager holds the data for the EquationManager View
    *
    * @class EquationManager
    * @module EquationManager
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Player.Models.Base
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    */
    modelClassNameSpace.EquationManager = MathInteractives.Common.Player.Models.Base.extend({
        defaults: {

            allowedOperation: 4095,

            /**
            * Used for validations at EquationManager level.
            */
            allowManagerLevelOperations: 8191,

            maxPrimeLimit: 9,

            /**
            * Array of lesson codes
            *
            * @attribute tutorialLessons
            * @type Object
            * @default null
            */
            tutorialLessons: null,

            /**
            * Boolean indicating the mode of equation manager in tutorial view.
            * False indicates that the tutorial animation has ended and the equation manager can now accept mouse
            * events.
            *
            * @attribute tutorialMode
            * @type Boolean
            * @default true
            */
            tutorialMode: true,

            /**
            * The current tutorial lesson number.
            *
            * @attribute currentTutorialLessonNumber
            * @type Number
            * @default 0
            */
            currentTutorialLessonNumber: 0,

            mode: null,

           /**
           * Size of draggable parenthesis helper
           *
           * @attribute buildModeParenthesisSize
           * @type Obkect
           * @default null
           */
            buildModeParenthesisSize : null,

            /**
            * Stack holding the Latex representation of the equation at each step.
            * Every time a command is executed a latex string is pushed and on every undo
            * a latex string is popped
            *
            * @attribute equationLatexStack
            * @type Array
            * @default []
            */
            equationLatexStack: [],

            numOfTilesInNumDen: null,

            currentAccView: null
        }
    }, {
        MODES: {
            BuildMode: 0,
            SolveMode: 1
        },

        OPERATION: {
            REPOSITION_TILE: 1,
            CLICK_EXP: 2,
            MARQUEE_SELECT_AND_COMBINE: 4,
            COMBINE_SAME_BASE: 8,
            ZERO_EXP: 16,
            DIVIDE_EQUAL_TERMS_HAVING_BASE_EXP_1_BASE_EXP_ANY: 32,
            DIVIDE_SIMILAR_TERMS_WITH_SAME_EXP: 64,
            PRIME_TO_COMPOSITE_EXP_ANY: 128,
            COMPOSITE_TO_PRIME: 256,
            BREAK_BASE: 512
        }
    });
})(window.MathInteractives);
