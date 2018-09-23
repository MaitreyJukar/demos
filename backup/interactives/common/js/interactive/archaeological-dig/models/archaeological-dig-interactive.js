(function () {
    'use strict';
    var archaeologicalDigClass = null;
    //defining namespace
    if (typeof MathInteractives.Interactivities.ArchaeologicalDig === 'undefined') {
        MathInteractives.Common.Interactivities.ArchaeologicalDig = {};
        MathInteractives.Common.Interactivities.ArchaeologicalDig.Views = {};
        MathInteractives.Common.Interactivities.ArchaeologicalDig.Models = {};
    }

    /**
    * Properties required for populating archaeological dig releted data.
    *
    * @class ArchaeologicalDig
    * @construtor
    * @extends MathInteractives.Common.Player.Models.Base
    * @namespace MathInteractives.Interactivities.ArchaeologicalDig.Models
    */
    MathInteractives.Common.Interactivities.ArchaeologicalDig.Models.ArchaeologicalDig = MathInteractives.Common.Player.Models.Base.extend({

        defaults: {
            /**
            * Holds currently open tag
            * 
            * @attribute currentTab
            * @type integer
            * @defaults 1
            */
            currentTab: 1,
            /**
            * current state of game
            * 
            * @attribute state
            * @type string
            * @defaults null
            */
            state: null,
            /**
            * Holds current artifact to find
            * 
            * @attribute currentArtifact
            * @type string
            * @defaults null
            */
            currentArtifact: null,
            /**
            * Holds current artifact index
            * 
            * @attribute nextArtifactIndex
            * @type integer
            * @defaults null
            */
            nextArtifactIndex: null,
            /**
            * Holds artifacts parts details
            * 
            * @attribute artifactParts
            * @type array
            * @defaults []
            */
            artifactParts: [],
            /**
            * Holds junks details
            * 
            * @attribute junks
            * @type array
            * @defaults []
            */
            junks: [],
            /**
            * Holds villain details
            * 
            * @attribute villain
            * @type object
            * @defaults {}
            */
            villain: {},
            /**
            * Holds steper value and digable details
            * 
            * @attribute steperStatus
            * @type object
            * @defaults {}
            */
            steperStatus: {},
            /**
            * Holds currently found element by player
            * 
            * @attribute currentelementFound
            * @type string
            * @defaults null
            */
            currentElementFound: null,
            /**
            * Holds count of junk
            * 
            * @attribute availableJunksForVillain
            * @type integer
            * @defaults null
            */
            availableJunksForVillain: null,
            /**
            * Holds upperLimit for loop and it's depends on type attribute
            * 
            * @attribute upperLimit
            * @type integer
            * @defaults null
            */
            upperLimit: null,
            /**
            * Holds available empty places
            * 
            * @attribute emptyPlacesAvailable
            * @type array
            * @defaults []
            */
            emptyPlacesAvailable: [],
            /**
            * Holds found empty place 
            * 
            * @attribute emptyPlacesFound
            * @type array
            * @defaults []
            */
            emptyPlacesFound: [],
            /**
            * Holds help screen data
            * 
            * @attribute helpElements
            * @type array
            * @defaults []
            */
            helpElements: [],
            /**
            * Holds type of interactivity
            * 
            * @attribute interacivityType
            * @type integer
            * @defaults null
            */
            interacivityType: null
        },
        /**
        * Holds index for picking junk from junk array
        * 
        * @property junkPickUpIndex
        * @type integer
        * @defaults 0
        */
        junkPickUpIndex: 0,
        /**
        * Holds all found places index
        * 
        * @property allFoundPlaces
        * @type array
        * @defaults []
        */
        allFoundPlaces: [],
        /**
        * This property is used(become true) when in rehiding artifact junk is place on villain place. 
        * 
        * @property hasvillainPlaceUsed
        * @type boolean
        * @defaults false
        */
        hasvillainPlaceUsed: false,

        /**
        * Initialize model
        * @method initialize
        * @public
        */
        initialize: function initialize() {
            var interacivityType = this.get('interacivityType');
            this._attachEvents();
            if (interacivityType === null || interacivityType !== this.get('type')) {
                this.setUpNewGame('initialize');
                this.set('interacivityType', this.get('type'));
            }
            else {
                this._populateAllFoundPlaces();
            }
        },
        /**
        * This method populate allFoundPlaces array with all found places after savedState resume
        *
        * @method _populateAllFoundPlaces
        * @private
        */
        _populateAllFoundPlaces: function _populateAllFoundPlaces() {
            var artifactParts = this.get('artifactParts'),
            junks = this.get('junks'),
            emptyPlacesFound = this.get('emptyPlacesFound');

            if (this.allFoundPlaces.length > 0) {
                this.allFoundPlaces = [];
            }
            for (var i = 0; i < 3; i++) {
                if (artifactParts[i].isFound === true) {
                    this.allFoundPlaces.push(artifactParts[i].x + '_' + artifactParts[i].y);
                }
            }
            for (var i = 0; i < 5; i++) {
                for (var j = 0; j < junks[i].positionDetails.length; j++) {
                    if (junks[i].positionDetails[j].isFound === true) {
                        this.allFoundPlaces.push(junks[i].positionDetails[j].x + '_' + junks[i].positionDetails[j].y);
                    }
                }
            }
            for (var i = 0; i < emptyPlacesFound.length; i++) {
                this.allFoundPlaces.push(emptyPlacesFound[i]);
            }     
        },
        /**
        * Getter function for 'state' property
        * @method getState
        * @return {Object} The saved state of the interactivity
        */
        getState: function getState() {
            return this.get('state');
        },
        /**
        * Setter function for 'state' property
        * @method setState
        * @param value {Object} The to be saved state of the interactivity.
        */
        setState: function setState(value) {
            this.set('state', value);
        },
        /**
        * Getter function for 'upperLimit' property
        * @method getUpperLimit
        * @return {integer} 
        */
        getUpperLimit: function getSgetUpperLimittate() {
            return this.get('upperLimit');
        },
        /**
        * Setter function for 'upperLimit' property
        * @method setUpperLimit
        * @param value {integer} 
        */
        setUpperLimit: function setUpperLimit(value) {
            this.set('upperLimit', value);
        },
        /**
        * Getter function for 'emptyPlacesAvailable' property
        * @method getEmptyPlacesAvailable
        * @return {Array} 
        */
        getEmptyPlacesAvailable: function getEmptyPlacesAvailable() {
            return this.get('emptyPlacesAvailable');
        },
        /**
        * Setter function for 'emptyPlacesAvailable' property
        * @method setEmptyPlacesAvailable
        * @param value {Array} 
        */
        setEmptyPlacesAvailable: function setEmptyPlacesAvailable(value) {
            this.set('emptyPlacesAvailable', value);
        },
        /**
        * Getter function for 'emptyPlacesFound' property
        * @method getEmptyPlacesFound
        * @return {Array} 
        */
        getEmptyPlacesFound: function getEmptyPlacesFound() {
            return this.get('emptyPlacesFound');
        },
        /**
        * Setter function for 'emptyPlacesFound' property
        * @method setEmptyPlacesFound
        * @param value {Array} 
        */
        setEmptyPlacesFound: function setEmptyPlacesFound(value) {
            this.set('emptyPlacesFound', value);
        },
        /**
        * attache Events model
        * @method _attachEvents
        * @private
        */
        _attachEvents: function () {
            this.on('artifactPartFound', this._artifactPartFoundHandler);
            this.on('junkFound', this._junkFoundHandler);
            this.on('villainFound', this._villainFoundHandler);
            this.on('emptyPalceFound', this._emptyPlaceFoundHandler);
        },
        /**
        * Prepare new value form start for new game 
        * @method setUpNewGameValue
        * @public
        */
        setUpNewGame: function setUpNewGame(callFrom) {
            if (callFrom === 'tryAnother') {
                this.set('currentArtifact', null);
            }
            this._setUpperLimit();
            this.initializeJsonStructure(callFrom);
            this._initializeEmptyPalceArray();
            this._placeCharacters();
            for (var i = 0; i < 3; i++) {
                console.log('artifacts(' + this.get('artifactParts')[i].x + ',' + this.get('artifactParts')[i].y + ')');
            }
            console.log('villain(' + this.get('villain').x + ',' + this.get('villain').y + ')');
        },
        /**
        * Setter function for 'upperLimit'property
        * @method _setUpperLimit 
        * @private       
        */
        _setUpperLimit: function () {
            if (this.get('type') == 1) {
                this.setUpperLimit(5)
            }
            else if (this.get('type') == 2) {
                this.setUpperLimit(6);
            }
        },
        /**
        * Initialize emptyPlaces with all empty palce values
        * @method _initializeEmptyPalceArray
        * @private
        */
        _initializeEmptyPalceArray: function () {
            var upperLimit = this.getUpperLimit(),
                emptyPlaceTempArray = [],
                tempPosition = null;

            for (var i = 0; i <= upperLimit; i++) {
                for (var j = 0; j <= upperLimit; j++) {
                    tempPosition = i + '_' + j;
                    emptyPlaceTempArray.push(tempPosition);
                }
            }
            this.setEmptyPlacesAvailable(emptyPlaceTempArray);
        },
        /**
        * Palces each character(Artifact,Junk,villain) on random position in matrix
        * @method placeCharacters
        * @private
        */
        _placeCharacters: function () {
            this._placeArtifacts();
            this.placeVillain();
        },
        /**
        * Palces artifact passed to random palce
        * @method _placeArtifacts
        * @private
        */
        _placeArtifacts: function () {
            var artifacts = this.get('artifactParts');

            for (var i = 0; i < 3; i++) {
                var coordinate = this._getEmptyPlace();
                artifacts[i].x = parseInt(coordinate[0]);
                artifacts[i].y = parseInt(coordinate[1]);
                this._setJunksParameter(artifacts[i].x, artifacts[i].y);
            }
        },
        /**
        * get one empty place from array and remove it from array
        * @method _getEmptyPlace
        * @private
        * @return coordinate{array}
        */
        _getEmptyPlace: function () {
            var emptyPlacesAvailable = this.getEmptyPlacesAvailable(),
                index = null,
                coordinates = null;

            if (emptyPlacesAvailable.length > 0) {
                index = Math.floor(Math.random() * emptyPlacesAvailable.length);
                coordinates = emptyPlacesAvailable.splice(index, 1)[0].split('_');
            }
            else {
                coordinates = 'full';
            }
            return coordinates;
        },
        /**
        * set x and y for placing junk and call place junk method
        * @method _setJunksParameter
        * @param x,y {integer}
        * @private
        */
        _setJunksParameter: function (x, y) {
            var upperLimit = this.getUpperLimit(),
                param = {};
            if ((y + 1) <= upperLimit) {
                param.x = x;
                param.y = y + 1;
                param.emptyPosition = x + '_' + (y + 1);
                this._placeJunk(param); //place junk at top
            }
            if ((x + 1) <= upperLimit) {
                param.x = x + 1;
                param.y = y;
                param.emptyPosition = (x + 1) + '_' + y;
                this._placeJunk(param); //place junk at right
            }
            if ((y - 1) >= 0) {
                param.x = x;
                param.y = y - 1;
                param.emptyPosition = x + '_' + (y - 1);
                this._placeJunk(param); //place junk at bottom
            }
            if ((x - 1) >= 0) {
                param.x = x - 1;
                param.y = y;
                param.emptyPosition = (x - 1) + '_' + y;
                this._placeJunk(param); //place junk at left
            }
        },
        /**
        * place junk at secified position
        * @method _placeJunk
        * @param param {object}
        * @private
        */
        _placeJunk: function (param) {
            var junks = this.get('junks'),
                randomIndex,
                index = null,
                object = {},
                isAvailable = false,
                emptyPlacesAvailable = this.getEmptyPlacesAvailable(),
                villain = this.get('villain');


            index = $.inArray(param.emptyPosition, emptyPlacesAvailable);
            if (index > -1) {
                emptyPlacesAvailable.splice(index, 1);
                isAvailable = true;
            }
            else if (param.x === villain.x && param.y === villain.y) {
                isAvailable = true;
                this.hasvillainPlaceUsed = true;
            }

            if (isAvailable) {
                object.x = param.x;
                object.y = param.y;
                object.isFound = false;

                junks[this.junkPickUpIndex].positionDetails.push(object);
                console.log('junk-' + junks[this.junkPickUpIndex].id + '(' + param.x + ',' + param.y + ')');
                if (this.junkPickUpIndex === 4) {
                    this.junkPickUpIndex = 0;
                }
                else {
                    this.junkPickUpIndex++;
                }
            }
        },
        /**
        * update Available Junks of Player
        * @method _updateAvailableJunksForVillain
        * @private
        */
        _updateAvailableJunksForVillain: function (action) {
            var count = this.get('availableJunksForVillain');
            if (action === '+') {
                count++;
            }
            else {
                count--;
            }
            this.set('availableJunksForVillain', count);
        },
        /**
        * Palces villain to random palce
        * @method placeVillain
        * @public
        */
        placeVillain: function placeVillain() {
            var villain = this.get('villain'),
                coordinate = null,
                tempX, tempY = null,
                emptyPlacesAvailable = this.getEmptyPlacesAvailable();

            coordinate = this._getEmptyPlace();

            if (coordinate === 'full') {
                this._NoEmptyPalceConditionHandler('villain');
            }
            else {
                tempX = villain.x;
                tempY = villain.y;

                villain.x = parseInt(coordinate[0]);
                villain.y = parseInt(coordinate[1]);
                villain.villainStateType = null;

                if ((tempX !== null && tempY !== null) && (this.hasvillainPlaceUsed === false)) {
                    emptyPlacesAvailable.push(tempX + '_' + tempY);
                    this.setEmptyPlacesAvailable(emptyPlacesAvailable);
                }
            }
            this.hasvillainPlaceUsed = false;
            console.log('villain(' + villain.x + ',' + villain.y + ')');
        },
        /**
        * Rehides artifacts taken by villan
        * @method rehideArtifactsParts
        * @public
        */
        rehideArtifactsParts: function rehideArtifactsParts(artifactsToReplace) {
            var artifactParts = this.get('artifactParts'),
                coordinate = null,
                tempX, tempY = null,
                emptyPlacesAvailable = this.getEmptyPlacesAvailable(),
                index = null;


            for (var i = 0; i < artifactsToReplace.length - 1; i++) {
                coordinate = this._getFeasibleEmptyPlace();

                if (coordinate === 'full') {
                    this._NoEmptyPalceConditionHandler('artifactsParts', artifactsToReplace);
                    return true;
                }
                else {
                    tempX = artifactParts[artifactsToReplace[i]].x;
                    tempY = artifactParts[artifactsToReplace[i]].y;

                    artifactParts[artifactsToReplace[i]].x = parseInt(coordinate[0]);
                    artifactParts[artifactsToReplace[i]].y = parseInt(coordinate[1]);
                    artifactParts[artifactsToReplace[i]].isFound = false;
                    console.log('new values of artifact-' + artifactParts[artifactsToReplace[i]].id + '(' + artifactParts[artifactsToReplace[i]].x + ',' + artifactParts[artifactsToReplace[i]].y + ')');

                    emptyPlacesAvailable.push(tempX + '_' + tempY);
                    index = this.allFoundPlaces.indexOf(tempX + '_' + tempY);
                    if (index > -1) {
                        this.allFoundPlaces.splice(index, 1);
                    }
                    this.setEmptyPlacesAvailable(emptyPlacesAvailable);
                    this._setJunksParameter(artifactParts[artifactsToReplace[i]].x, artifactParts[artifactsToReplace[i]].y);
                }
            }
            return false;
        },
        /**
        * This method checks each coordinates all four side and choose one coordinate which has maximum side available for 
        * hinding junks and return that coordinate.
        * @method _getFeasibleEmptyPlace
        * @private
        */
        _getFeasibleEmptyPlace: function _getFeasibleEmptyPlace() {
            var emptyPlacesAvailable = this.getEmptyPlacesAvailable(),
                coordinate = null,
                fourSided = [],
                threeSided = [],
                towSided = [],
                oneSided = [],
                zeroSided = [],
                count = null,
                index = null,
                tempArray = [];

            if (emptyPlacesAvailable.length === 0) {
                coordinate = 'full';
                return coordinate;
            }
            for (var i = 0; i < emptyPlacesAvailable.length; i++) {
                count = this._getSidesCount(emptyPlacesAvailable[i]);

                switch (count) {
                    case 4: { fourSided.push(emptyPlacesAvailable[i]); break; }
                    case 3: { threeSided.push(emptyPlacesAvailable[i]); break; }
                    case 2: { towSided.push(emptyPlacesAvailable[i]); break; }
                    case 1: { oneSided.push(emptyPlacesAvailable[i]); break; }
                    case 0: { zeroSided.push(emptyPlacesAvailable[i]); break; }
                }
            }

            tempArray = zeroSided;
            if (fourSided.length > 0) {
                tempArray = fourSided;
            }
            else if (threeSided.length > 0) {
                tempArray = threeSided;
            }
            else if (towSided.length > 0) {
                tempArray = towSided;
            }
            else if (oneSided.length > 0) {
                tempArray = oneSided;
            }
            index = Math.floor(Math.random() * tempArray.length);
            coordinate = tempArray.splice(index, 1)[0];

            index = emptyPlacesAvailable.indexOf(coordinate);
            coordinate = emptyPlacesAvailable.splice(index, 1)[0].split('_');
            return coordinate;
        },
        /**
        * This method check all four side of passed coordinates whether they are digged or not, and returns count 
        * which indicates how much side are undiged.
        * @method _getSidesCount
        * @private
        * param point{string}
        */
        _getSidesCount: function _getSidesCount(point) {
            var x = null,
                y = null,
                tempPosition = null,
                indexInAllFound = null,
                indexInJunks = null,
                count = 0,
                upperLimit = this.getUpperLimit(),
                junks = this.get('junks'),
                junksPositions = [];

            x = parseInt(point.split('_')[0]);
            y = parseInt(point.split('_')[1]);


            for (var i = 0; i < junks.length; i++) {
                for (var j = 0; j < junks[i].positionDetails.length; j++) {
                    junksPositions.push(junks[i].positionDetails[j].x + '_' + junks[i].positionDetails[j].y);
                }
            }

            if ((y + 1) <= upperLimit) {
                tempPosition = x + '_' + (y + 1);
                indexInAllFound = this.allFoundPlaces.indexOf(tempPosition);
                indexInJunks = junksPositions.indexOf(tempPosition)
                if (indexInAllFound === -1 || indexInJunks > -1) {
                    count++;
                }
            } //check top 
            if ((x + 1) <= upperLimit) {
                tempPosition = (x + 1) + '_' + y;
                indexInAllFound = this.allFoundPlaces.indexOf(tempPosition);
                indexInJunks = junksPositions.indexOf(tempPosition)
                if (indexInAllFound === -1 || indexInJunks > -1) {
                    count++;
                }
            } //check right
            if ((y - 1) >= 0) {
                tempPosition = x + '_' + (y - 1);
                indexInAllFound = this.allFoundPlaces.indexOf(tempPosition);
                indexInJunks = junksPositions.indexOf(tempPosition)
                if (indexInAllFound === -1 || indexInJunks > -1) {
                    count++;
                }
            } //check bottom
            if ((x - 1) >= 0) {
                tempPosition = (x - 1) + '_' + y;
                indexInAllFound = this.allFoundPlaces.indexOf(tempPosition);
                indexInJunks = junksPositions.indexOf(tempPosition)
                if (indexInAllFound === -1 || indexInJunks > -1) {
                    count++;
                }
            } //check left
            return count;
        },
        /**
        * This handler called when there is no empty palce to rehide elements, It shuffles position whithin available character
        * @method _NoEmptyPalceConditionHandler
        * @private
        * param callFrom{string},artifactsToReplace{array}
        */
        _NoEmptyPalceConditionHandler: function _NoEmptyPalceConditionHandler(callFrom, artifactsToReplace) {
            var villain = this.get('villain'),
                artifactParts = this.get('artifactParts'),
                tempArtifactpart_1 = null,
                tempArtifactpart_2 = null,
                undigArtifactsParts = [],
                tempObject = {};

            switch (callFrom) {
                case 'villain':
                    {
                        villain.villainStateType = null;
                        return;
                        break;
                    }
                case 'artifactsParts':
                    {
                        if ((artifactsToReplace.length - 1) === 1) {
                            tempArtifactpart_1 = artifactParts[artifactsToReplace[0]];
                        }
                        else if ((artifactsToReplace.length - 1) === 2) {
                            tempArtifactpart_1 = artifactParts[artifactsToReplace[0]];
                            tempArtifactpart_2 = artifactParts[artifactsToReplace[1]];
                        }
                        break;
                    }
            }
            if (tempArtifactpart_2 === null) {
                tempObject.x = villain.x;
                tempObject.y = villain.y;
                villain.x = tempArtifactpart_1.x;
                villain.y = tempArtifactpart_1.y;
                tempArtifactpart_1.x = tempObject.x;
                tempArtifactpart_1.y = tempObject.y;
                villain.villainStateType = null;
                tempArtifactpart_1.isFound = false;
                console.log('(no empty place replacement) ' + tempArtifactpart_1.id + '(' + tempArtifactpart_1.x + ',' + tempArtifactpart_1.y + ')');
                console.log('(no empty place replacement) villain(' + villain.x + ',' + villain.y + ')');
            }
            else if (tempArtifactpart_2 !== null) {
                tempObject.x = villain.x;
                tempObject.y = villain.y;
                villain.x = tempArtifactpart_1.x;
                villain.y = tempArtifactpart_1.y;
                tempArtifactpart_1.x = tempArtifactpart_2.x;
                tempArtifactpart_1.y = tempArtifactpart_2.y;
                tempArtifactpart_2.x = tempObject.x;
                tempArtifactpart_2.y = tempObject.y;
                villain.villainStateType = null;
                tempArtifactpart_1.isFound = false;
                tempArtifactpart_2.isFound = false;
                console.log('(no empty place replacement) ' + tempArtifactpart_1.id + '(' + tempArtifactpart_1.x + ',' + tempArtifactpart_1.y + ')');
                console.log('(no empty place replacement) ' + tempArtifactpart_2.id + '(' + tempArtifactpart_2.x + ',' + tempArtifactpart_2.y + ')');
                console.log('(no empty place replacement) villain(' + villain.x + ',' + villain.y + ')');
            }
        },

        /**
        * Set isFound to true of found Artifact Part
        * @method _artifactPartFoundHandler
        * @private
        * @param artifactPart{object},isSaveStateCall{boolean}
        */
        _artifactPartFoundHandler: function (artifactPart, isSaveStateCall) {
            if (!isSaveStateCall) {
                artifactPart.isFound = true;
                this.trigger('display-Artifact-Part', artifactPart);
                this.allFoundPlaces.push(artifactPart.x + '_' + artifactPart.y);
            }
        },

        /**
        * Set isFound to true of found junk
        * @method _junkFoundHandler
        * @private
        * @param junk{object},index{integer},isSaveStateCall{boolean}
        */
        _junkFoundHandler: function (junk, index, isSaveStateCall) {
            if (!isSaveStateCall) {
                junk.positionDetails[index].isFound = true;
                this.trigger('display-Junk', junk, index);
                this.allFoundPlaces.push(junk.positionDetails[index].x + '_' + junk.positionDetails[index].y);
                this._updateAvailableJunksForVillain('+');

            }
        },

        /**
        * Sets villan State by checking count of paying items
        * @method _villainFoundHandler
        * @private
        * @param villain{object}
        */
        _villainFoundHandler: function (villain) {
            var artifactParts = this.get('artifactParts'),
                availableJunksForVillain = this.get('availableJunksForVillain'),
                collectedArtifacts = 0;

            for (var i = 0; i < 3; i++) {
                if (artifactParts[i].isFound === true) { collectedArtifacts++ }
            }
            if ((collectedArtifacts + availableJunksForVillain) >= 1) {
                villain.villainStateType = 'payUp';
            }
            else {
                villain.villainStateType = 'warrning';
            }
        },

        /**
        * Add index element to found empty place array
        * @method _emptyPlaceFoundHandler
        * @private
        * @param index{integer},emptyArray{array},isSaveStateCall{boolean}
        */
        _emptyPlaceFoundHandler: function (index, emptyArray, isSaveStateCall) {
            if (!isSaveStateCall) {
                var emptyPlaceFound = this.getEmptyPlacesFound(),
                    foundPlace = emptyArray.splice(index, 1)[0];
                emptyPlaceFound.push(foundPlace);
                this.allFoundPlaces.push(foundPlace);
                this.trigger('display-Empty-Place');
            }
        },

        /**
        * intialize structure of json with random values(artifact)
        * @method initializeJsonData
        * @public
        */
        initializeJsonStructure: function initializeJsonStructure(callFrom) {
            var index = 0,
                range = 3, //need to be increase when all artifacts will be given
                tempArray = [],
                object = {},
                newIndexOfArtifactObject = this.get('nextArtifactIndex');

            //set STATE attibute to normal
            if (this.get('currentArtifact') === null || callFrom === 'initialize') {
                this.setState(null);

                if (callFrom === 'tryAnother') {
                    if (newIndexOfArtifactObject === 3) {
                        index = 0;
                    }
                    else {
                        index = newIndexOfArtifactObject;
                    }
                }
                else {
                    index = Math.floor(Math.random() * range);
                }
                //set index and get CURRENT ARTIFACT on thtat position
                this.set('currentArtifact', archaeologicalDigClass.CURRENT_ARTIFACT[index].id);
                this.set('nextArtifactIndex', (index + 1));


                //use same index of arrtifact and set selected ARTIFACT'S PARTS
                for (var i = 0; i < 3; i++) {
                    object = {};
                    object.id = archaeologicalDigClass.ARTIFACT_PARTS[index][i].name;
                    object.x = null;
                    object.y = null;
                    object.isFound = false;
                    tempArray.push(object);
                }
                this.set('artifactParts', tempArray);

                //initialize JUNK json attribute
                tempArray = [];
                for (var i = 0; i < 5; i++) {
                    object = {};
                    object.id = archaeologicalDigClass.JUNKS[i].id;
                    object.positionDetails = [];
                    tempArray.push(object);
                }
                this.set('junks', tempArray);

                //initialize villain objecct to default value
                object = {};
                object.x = null;
                object.y = null;
                object.villainStateType = null;
                this.set('villain', object);

                //initialize availableJunksForVillain property
                this.set('availableJunksForVillain', 0);

                //initialize steperStatus objecct to default value
                object = {};
                object.x = 0;
                object.y = 0;
                object.isDigEnable = true;
                this.set('steperStatus', object);

                //set CURRENTELEMENTFOUND to null
                this.set('currentElementFound', null);

                this.set('emptyPlacesAvailable', []);
                this.set('emptyPlacesFound', []);
            }
        },

        /**
        * Called on clicking the Save button, it returns the stringified model.
        * @method getCurrentStateData
        * @return The stringified model object withour player, manager, path and similar properties not needed for
        save-resume functionality.
        */
        getCurrentStateData: function getCurrentStateData() {
            //var savedSate = JSON.stringify(this.toJSON(), this.getJSONAttributes);
            //return savedSate;
            var result = JSON.stringify(this, this.getJSONAttributes);
            return result;
        },

        /**
        * Replacer function for stringify method call of the model. Returns undefined for properties to be ignored.
        * @method getJSONAttributes
        * @param key {String} The model object's properties' name
        * @param value {Object} The value of the property.
        * @private
        */
        getJSONAttributes: function getJSONAttributes(key, value) {
            var result = value;
            switch (key) {
                case 'path':
                case 'manager':
                case 'player':
                case 'idPrefix':
                case 'jsonData':
                case 'helpElements':
                    result = undefined;
                    break;
            }
            return result;
        }
    },
    {
        CURRENT_ARTIFACT: [{ 'id': 'duck' },
                           { 'id': 'jester' },
                           { 'id': 'brush'}],

        ARTIFACT_PARTS: [[{ 'name': 'body' }, { 'name': 'sceptre' }, { 'name': 'crown'}],
                         [{ 'name': 'box' }, { 'name': 'jack' }, { 'name': 'crank'}],
                         [{ 'name': 'handle' }, { 'name': 'brush-head' }, { 'name': 'jewel'}]],

        JUNKS: [{ 'id': 'battery' },
                { 'id': 'tin' },
                { 'id': 'pin' },
                { 'id': 'bolt' },
                { 'id': 'cassete'}]
    }),
    archaeologicalDigClass = MathInteractives.Common.Interactivities.ArchaeologicalDig.Models.ArchaeologicalDig;
})();