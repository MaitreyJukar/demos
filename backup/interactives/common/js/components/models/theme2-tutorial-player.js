(function (MathInteractives) {
    'use strict';

    var nameSpace = MathInteractives.Common.Components.Theme2.Models;

    /**
    * TutorialPlayer holds the data for the tutorial player View
    *
    * @class TutorialPlayer
    * @constructor
    * @type Object
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Theme2.Models
    */
    nameSpace.TutorialPlayer = Backbone.Model.extend({
        defaults: {
            /**
            * Array of reference for tutorial steps
            * 
            * @attribute steps
            * @type Array
            * @default []
            */
            steps: [],

            /**
            * A counter for the tutorial step to be played.
            *
            * @attribute stepsPlayedCounter
            * @type Number
            * @default 0
            */
            stepsPlayedCounter: 0
        },

        /**
        * Increments the 'stepsPlayedCounter' by 1.
        *
        * @method incrementCounter
        * @public
        */
        incrementCounter: function incrementCounter() {
            var currentStepCount = Number(this.get('stepsPlayedCounter'));
            this.set('stepsPlayedCounter', ++currentStepCount);
        },

        /**
        * Set the 'stepsPlayedCounter' by given value.
        * If given value is null or undefinded or -1, increment the counter by 1.
        * 
        * @method setCounter
        * @param {Number} counter Counter which is to be set (0 based)
        * @public
        */
        setCounter: function (counter) {
            if (counter !== null
                && counter !== undefined
                && counter !== -1) {
                this.set('stepsPlayedCounter', counter);
            }
            else {
                this.incrementCounter();
            }
        }
    }, {
        METHOD_ENUM: {
            0: '_simulateMove',
            1: '_simulateClick',
            2: '_simulateDoubleClick',
            3: '_simulateDrag',
            4: '_simulateMouseDown',
            5: '_simulateMouseUp',
            6: '_promptUserToMarquee',
            7: '_promptUserToClick',
            8: '_promptUserToDoubleClick',
            9: '_promptUserToDrag',
            10: '_simulateToggleButtonToggle',
            11: '_simulateTileClick'
        },

        METHOD_ENUM_INVERSE: {
            '_simulateMove': 0,
            '_simulateClick': 1,
            '_simulateDoubleClick': 2,
            '_simulateDrag': 3,
            '_simulateMouseDown': 4,
            '_simulateMouseUp': 5,
            '_promptUserToMarquee': 6,
            '_promptUserToClick': 7,
            '_promptUserToDoubleClick': 8,
            '_promptUserToDrag': 9,
            '_simulateToggleButtonToggle': 10,
            '_simulateTileClick': 11
        },

        EVENTS: {
            /**
            * Fired whenever a step is to be played for the first time. The step data is passed along with the event.
            *
            * Triggered in the function {{#crossLink "MathInteractives.Common.Components.Theme2.Views.TutorialPlayer/playStep:method"}}{{/crossLink}}.
            * @event PARSED_STEP_REQUIRED
            */
            PARSED_STEP_REQUIRED: 'parsedStepRequired',

            /**
            * Fired by the interactive after parsing the step. The parsed step is passed with it.
            *
            * @event STEP_PARSED
            */
            STEP_PARSED: 'stepParsed',

            /**
            * Fired at the start of playing a parsed step. Could be used to disable other components during animation.
            *
            * Triggered in the function {{#crossLink "MathInteractives.Common.Components.Theme2.Views.TutorialPlayer/playParsedStep:method"}}{{/crossLink}}.
            * @event ANIMATION_START
            */
            ANIMATION_START: 'playingTutorialAnimation',

            /**
            * Fired at the end of playing a parsed step. Could be used to enable other components after animation.
            *
            * Triggered in the function {{#crossLink "MathInteractives.Common.Components.Theme2.Views.TutorialPlayer/playParsedStep:method"}}{{/crossLink}}.
            * @event STEP_ANIMATION_END
            */
            STEP_ANIMATION_END: 'completedStep',

            /**
            * To be heard by the interactive, this event is triggered when an element is to be animated for IE 9.
            *
            * Triggered in the function {{#crossLink "MathInteractives.Common.Components.Theme2.Views.TutorialPlayer/_animateElements:method"}}{{/crossLink}}.
            * @event HANDLE_CSS_ANIMATION_FOR_IE9
            */
            HANDLE_CSS_ANIMATION_FOR_IE9: '_handleCssAnimationForIe9',

            /**
            * To be heard by the interactive, this event is triggered when all steps have been played and the tutorial is over.
            *
            * Triggered in the function {{#crossLink "MathInteractives.Common.Components.Theme2.Views.TutorialPlayer/playParsedStep:method"}}{{/crossLink}}.
            * @event ALL_STEPS_COMPLETED
            */
            ALL_STEPS_COMPLETED: 'allStepsComplete',

            /**
            * Triggered at the start of basic methods like _simulateMove, _simulateMouseDown, _simulateMouseUp; it
            * alerts the interactive that a cursor image change might be required.
            *
            * @event CURSOR_CHANGE_REQUIRED
            */
            CURSOR_CHANGE_REQUIRED: 'cursorChangeRequired',

            /**
            * Triggered when all the animation classes have been removed in case of flashShadow animation. 
            * 
            * @event ANIMATION_CLASSES_REMOVED
            */
            ANIMATION_CLASSES_REMOVED:'animationClassesRemoved'
        },

        /**
        * Cursor holds the data for the Cursor View
        *
        * @class Cursor
        * @constructor
        * @type Object
        * @extends Backbone.Model
        * @namespace MathInteractives.Common.Components.Theme2.Models.TutorialPlayer
        */
        Cursor: Backbone.Model.extend({
            defaults: {

                interactionPointOffset: { x: 0, y: 0 },

                position: { x: 0, y: 0 },

                currentCursor: 'default'
            }
        },{})
    }, {});
})(window.MathInteractives);