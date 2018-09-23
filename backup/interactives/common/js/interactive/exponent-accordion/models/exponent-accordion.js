(function () {
    'use strict';

    var equationManagerModelNameSpace = MathInteractives.Common.Components.Models.EquationManager,
        tileItemType = MathInteractives.Common.Components.Models.EquationManager.TileItem.SolveTileType;

    /**
    * Properties required for populating ExponentAccordion releted data.
    *
    * @class ExponentAccordion
    * @construtor
    * @extends MathInteractives.Common.Player.Models.Base
    * @namespace MathInteractives.Interactivities.ExponentAccordion.Models
    */
    MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion = MathInteractives.Common.Player.Models.BaseInteractive.extend({
        defaults: {

            /**
            * Stores the data for the equation
            * SolveTileType:
            * BASE_EXPONENT - 1
            * PARENTHESIS - 2
            * FRACTION - 3
            * @attribute equationData
            * @type Object
            * @default null
            **/
            equationData: null,

            equationDataSolveMode: null,

            /**
            * Stores a string indicating the current view to being displayed: formation view or workspace view.
            *
            * @attribute currentView
            * @type String
            * @default null
            **/
            currentView: null,

            exploreView: null,

            previousView: null,

            /**
            * clear entire interactivity data
            *
            * @attribute clearAllData
            * @type boolean
            * @default false
            **/
            clearAllData: false,

            tryAnotherBtnStatus: false,

            dataTabTryAnotherClick: false,
            /**
            * Stores a boolean indicating which mode the user is using: fraction ON or OFF
            *
            * @attribute fractionMode
            * @type Boolean
            * @default null
            **/
            fractionMode: null,

            /**
            * Stores a boolean indicating which mode the user is using: Raised to power ON or OFF
            *
            * @attribute raisedToPower
            * @type Boolean
            * @default null
            **/
            raisedToPower: null,

            /**
            * Integer denoting which level of exponent accordion is being run
            *
            * @attribute accordionLevel
            * @type Number
            * @default null
            **/
            accordionLevel: null,

            accordionLevelCopy: null,

            /**
            * Stores No of base values allowed on Accordion level basis
            *
            * @attribute noOfUniqueBaseValAllowed
            * @type Number
            * @default 1
            **/
            noOfBasesAllowed: 1,

            isAbsolute: false,

            allowedOperation: null,

            allowedTutorialOperation: null,

            maxPrimeLimit: 9,

            numOfTilesInNumDen: 8,

            isBinBaseNegated: null,

            isBinExpNegated: null,

            accordionEquationData: null,

            accordionDataSavedState: null,

            currentEquationDataIndex: null,

            accordionMaxTupleCount: null,

            accordionRowsToDelete: 0,

            solveModeDivisionMode: true,

            buildModeDivisionMode: true,

            manualTileDrop: false,

            userSelectedMode: null,

            tileDropped: false,

            randomExprButtonClick: false,

            stepCount: null,

            pureAndSimpleShown: null,

            noOfRowsRendered: 0,

            allowedCases: null,

            isAccordionEqnDataChanged: false,

            viewDataBtnClick: false,

            expolreBtnClick: false,

            backButtonClick: false,

            /**
            * Array of lesson codes
            *
            * @attribute tutorialLessons
            * @type Object
            * @default null
            */
            tutorialLessons: null,

            /**
            * The current tutorial lesson number.
            *
            * @attribute currentTutorialLessonNumber
            * @type Number
            * @default -1
            */
            currentTutorialLessonNumber: -1,

            /**
            * The current tutorial lesson's step number.
            *
            * @attribute currentTutorialLessonStepNumber
            * @type Number
            * @default 0
            */
            currentTutorialLessonStepNumber: 0,

            /**
            * Stores a string indicating the current view to be displayed in tutorial mode: formation view or workspace
            *
            * @attribute tutorialView
            * @type String
            * @default null
            **/
            tutorialView: null,

            tutorialDataSelectorView: null,

            tutorialSelectScreenIndex: -1,

            /**
            * Stores array of help elements
            *
            * @attribute helpElements
            * @type Object
            * @default blank
            **/
            helpElements: [],

            /**
            * Stores the data for the equation in tutorial mode.
            * SolveTileType:
            * BASE_EXPONENT - 1
            * PARENTHESIS - 2
            * FRACTION - 3
            * @attribute tutorialEquationData
            * @type Object
            * @default null
            **/
            tutorialEquationData: {},

            currentTab: 1,

            dataPreviousTab: 1
        },

        /**
        * Initialises EXPONENT Accordion Model
        *
        * @method initialize
        **/
        initialize: function () {
            var baseClass = MathInteractives.Common.Interactivities.ExponentAccordion;

            if(this.get('accordionLevelCopy') === null) {
                this.set('accordionLevelCopy', this.get('accordionLevel'));
            }
            if(this.get('accordionLevel') !== this.get('accordionLevelCopy')) {
                this._setDefaults(baseClass);
                return;
            }

            if (this.get('currentView') === null) {
                this.set('currentView', baseClass.Models.ExponentAccordion.CURRENT_VIEW.TUTORIAL);
                this.set('previousView', baseClass.Models.ExponentAccordion.CURRENT_VIEW.TUTORIAL);
            }

            if (this.get('fractionMode') === null) {
                this.set('fractionMode', true);
            }

            if (this.get('raisedToPower') === null) {
                this.set('raisedToPower', false);
            }

            if (this.get('isBinBaseNegated') === null) {
                this.set('isBinBaseNegated', [1, 1, 1, 1, 1, 1, 1, 1]);
            }

            if (this.get('isBinExpNegated') === null) {
                this.set('isBinExpNegated', [1, 1, 1, 1, 1, 1, 1, 1, 1]);
            }

            if (this.get('accordionDataSavedState') === null) {
                this.set('accordionDataSavedState', [])
            }
            else {
                this.getAccordionDataFromSaveState(true);
            }

            if (this.get('accordionEquationData') === null) {
                this.set('accordionEquationData', [])
            }

            if (this.get('currentEquationDataIndex') === null) {
                this.set('currentEquationDataIndex', -1)
            }

            if (this.get('stepCount') === null) {
                this.set('stepCount', 0);
            }

            if (this.get('pureAndSimpleShown') === null) {
                this.set('pureAndSimpleShown', false);
            }

        },

        _setDefaults: function _setDefaults (baseClass) {
            this.set({
                'accordionLevelCopy' : this.get('accordionLevel'),
                'currentView': baseClass.Models.ExponentAccordion.CURRENT_VIEW.TUTORIAL,
                'previousView': baseClass.Models.ExponentAccordion.CURRENT_VIEW.TUTORIAL,
                'fractionMode': true,
                'raisedToPower': false,
                'isBinBaseNegated': [1, 1, 1, 1, 1, 1, 1, 1],
                'isBinExpNegated': [1, 1, 1, 1, 1, 1, 1, 1, 1],
                'accordionDataSavedState': [],
                'accordionEquationData': [],
                'currentEquationDataIndex': -1,
                'stepCount': 0,
                'pureAndSimpleShown': false,
                'equationData': null,
                'equationDataSolveMode': null,
                'clearAllData': false,
                'tryAnotherBtnStatus': false,
                'dataTabTryAnotherClick': false,
                'accordionRowsToDelete': 0,
                'solveModeDivisionMode': true,
                'buildModeDivisionMode': true,
                'manualTileDrop': false,
                'userSelectedMode': null,
                'tileDropped': false,
                'randomExprButtonClick': false,
                'noOfRowsRendered': 0,
                'isAccordionEqnDataChanged': false,
                'viewDataBtnClick': false,
                'expolreBtnClick': false,
                'backButtonClick': false,
                'currentTutorialLessonNumber': -1,
                'currentTutorialLessonStepNumber': 0,
                'tutorialView': null,
                'tutorialDataSelectorView': null,
                'tutorialSelectScreenIndex': -1,
                'helpElements': [],
                'tutorialEquationData': {},
                'currentTab': 1,
                'dataPreviousTab': 1
            });
        },

        getAccordionDataFromSaveState: function getAccordionDataFromSaveState(enable) {
            var accordionData, dummyArray,
                index, j, currentExprObj, currentSteps;

            if (enable) {
                accordionData = this.get('accordionDataSavedState');
            }
            else {
                accordionData = this.get('accordionEquationData');
            }
            dummyArray = $.extend(true, [], accordionData);

            for (index = 0; index < accordionData.length; index++) {
                currentExprObj = dummyArray[index];
                if (enable) {
                    currentExprObj.header = currentExprObj.header.replace(/!@/g, '<');
                }
                else {
                    currentExprObj.header = currentExprObj.header.replace(/</g, '!@');
                }
                currentSteps = currentExprObj.steps;
                for (j = 0; j < currentSteps.length; j++) {
                    if (enable) {
                        currentSteps[j].htmlString = currentSteps[j].htmlString.replace(/!@/g, '<');
                    }
                    else {
                        currentSteps[j].htmlString = currentSteps[j].htmlString.replace(/</g, '!@');
                    }
                }
            }
            this.set('accordionDataSavedState', dummyArray);
            if (enable) {
                this.set('accordionEquationData', dummyArray);
            }
        },

        /**
        * Called on clicking the Save button, it returns the stringified model.
        *
        * @method getCurrentStateData
        * @return The stringified model object without player, manager, path and similar properties not needed for
        save-resume functionality.
        */
        getCurrentStateData: function getCurrentStateData() {
            this.trigger(MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion.EVENTS.UPDATE_EQUATION_DATA);
            var result = JSON.stringify(this, this.getJSONAttributes);
            return result;
        },

        /**
        * Replacer function for stringify method call of the model. Returns undefined for properties to be ignored.
        *
        * @method getJSONAttributes
        * @param key {String} The model object's properties' name
        * @param value {Object} The value of the property.
        * @private
        */
        getJSONAttributes: function getJSONAttributes(key, value) {
            var result = value;
            switch (key) {
                case 'path':
                case 'filePath':
                case 'manager':
                case 'player':
                case 'idPrefix':
                case 'rectTerm':
                case 'rectBase':
                case 'rectExponent':
                case 'jsonData':
                case 'helpElements':
                case 'tutorialLessons':
                case 'accordionEquationData':
                    result = undefined;
                    break;
            }
            return result;
        }
    },
    {
        CURRENT_VIEW: {
            TUTORIAL: 'tutorial',
            EXPLORE: 'explore',
            DATA: 'data'
        },

        EXPLORE_VIEW: {
            FORMATION: 'formation',
            WORKSPACE: 'workspace'
        },

        TUTORIAL_VIEW: {
            TUTORIAL_MAIN: 'tutorial-main',
            TUTORIAL_SUB_SELECT: 'tutorial-sub-select',
            TUTORIAL_SCREEN: 'tutorial-screen'
        },

        IS_NEGATIVE_BASES_ALLOWED: 1,
        IS_NEGATIVE_EXPONENTS_ALLOWED: 2,
        IS_PARENTHESIS_ALLOWED: 4,
        IS_NEGATIVE_PARENTHESIS_ALLOWED: 8,
        IS_RAISED_TO_POWER_ALLOWED: 16,
        IS_DIVISION_ALLOWED: 32,

        NUMBER_OF_PARENTHESIS: {
            NUMERATOR: 2,
            DENOMINATOR: 2,
            NEGATIVE: 1
        },

        EVENTS: {
            UPDATE_EQUATION_DATA: 'update-equation-data'
        }
    });
})();


