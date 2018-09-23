(function () {
    'use strict';

    //var eaNamespace = MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion;

    MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion.Tile = Backbone.Model.extend({
        base: 0,
        exponent: 0,
        parenthesisState: 0, //1- start, 2 - negative parenthesis start, 4,5 - end
        pareExponent : 1,
        operator: '*',
        getJSON: function (isDenominator,isFirstItem, isChildBaseFirst, isLastItem) {
            var jsonFormat = "", operator;

            if ((this.parenthesisState & 1 == 1 ) || (this.parenthesisState & 2) == 2)
            {
                jsonFormat += "{";
                jsonFormat += MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion.Tile.getTileJSON("null",
                    this.pareExponent, isDenominator, "PARENTHESIS", (this.parenthesisState == 2 || this.parenthesisState == 6  ? "-1" : "1"), (isFirstItem ? "null" : "\"*\"") );
                jsonFormat += ",\"tileArray\":["
            }

            if(isChildBaseFirst) {
                operator = null;
            }
            else if(isFirstItem) {
                operator = null;
            }
            else {
                operator = "\"*\"";
            }

            jsonFormat += "{" + MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion.Tile.getTileJSON(this.base,
                this.exponent, isDenominator, "BASE_EXPONENT", "null", operator) + "}";

            if (this.parenthesisState > 2) {
                jsonFormat += "]}";
            }
            if (!isLastItem)
                jsonFormat += ",";



            return jsonFormat;
        },
    },
    {
        getTileJSON: function (baseTxt, exponentTxt, isDenominator, typeTxt, coefficient, operatorTxt) {
            var tileJSON = "";
            tileJSON += "\"base\": " + baseTxt;
            tileJSON += ",\"exponent\": " + exponentTxt;
            tileJSON += ",\"type\": \"" + typeTxt + "\"";
            tileJSON += ",\"coefficient\":" + coefficient;
            tileJSON += ",\"operator\":" + operatorTxt;
            tileJSON += ",\"strDroppables\":\"*\"";
            tileJSON += ",\"bDenominator\":" + (isDenominator ? "true" : "false");
            return tileJSON;
        }
    });

    MathInteractives.Common.Interactivities.ExponentAccordion.Models.RandomExpression = Backbone.Model.extend({
        numTiles: [],
        denoTiles: [],
        accordionLevel: null,
        getExpression: function (isFraction, maxUniqueBasesAllowed, isAbsoluteBase, isNegBaseAllowed, isNegExpAllowed, isParenthesisAllowed, isNegParenthesisAllowed, isRaiseToPower, accordionLevel) {
            var negatePareInNum = false,
                 utilClass = MathInteractives.Common.Utilities.Models.Utils;
            this.accordionLevel = accordionLevel;
            this.numTiles = [];
            this.denoTiles = [];

            if (isNegParenthesisAllowed && MathInteractives.Common.Utilities.Models.Utils.getRandomIntegerNumber(0, 1) == 1)
                negatePareInNum = true;

            //generate base tiles
            this.generateUniqueBasesAndBaseTiles(maxUniqueBasesAllowed, isAbsoluteBase, isNegBaseAllowed, !isFraction);
            this.numTiles = this.generateExpAndAssignToTiles(this.numTiles, isNegExpAllowed);


            //generate tiles for denominator
            if (isFraction)
            {
                this.denoTiles = this.generateExpAndAssignToTiles(this.denoTiles, isNegExpAllowed);
            }

            if(accordionLevel === 5) {
                this.makeSameBase(!isFraction);
            }

            if (isParenthesisAllowed) {
                this.numTiles = this.assignParenthesis(this.numTiles, negatePareInNum, isNegExpAllowed);
                if (isFraction) {
                    this.denoTiles = this.assignParenthesis(this.denoTiles, (isNegParenthesisAllowed & !negatePareInNum), isNegExpAllowed);
                }
            }

            return this.writeJSON(isRaiseToPower);
        },

        //Generates Base tile values, creates bases tiles for numerator and denominator ( if not multiplication only view )
        generateUniqueBasesAndBaseTiles: function (maxUniqueBasesAllowed, isAbsoluteBase, isNegBaseAllowed, isMultiplicationOnly)
        {
            var bases = [], i = 0,
                utilClass = MathInteractives.Common.Utilities.Models.Utils;

            if(isAbsoluteBase) {
                maxUniqueBasesAllowed -= 1;
            }
            //based on max bases allowed generate the base tile values
            for (i = 0; i < maxUniqueBasesAllowed; i++)
            {
                bases.push(utilClass.getRandomIntegerNumber(2, 9));
            }

            if (isNegBaseAllowed)
            {
                if (bases.length == 1)
                    bases.push(bases[0] * -1);
                else //randomly negate few bases
                {
                    for (i = 0; i < bases.length; i++) {
                        if (utilClass.getRandomIntegerNumber(0, 3) == 1) {
                            bases[i] = bases[i] * -1;
                        }
                    }
                }
            }

            this.compInNum = utilClass.getRandomIntegerNumber(0, 1);

            //generate numerator tiles
            this.numTiles = this.generateBaseTiles(this.numTiles, bases, isMultiplicationOnly, false);

            //generate denominator tiles
            if (!isMultiplicationOnly) {
                this.denoTiles = this.generateBaseTiles(this.denoTiles, bases, isMultiplicationOnly, true);
            }
        },

        makeSameBase : function makeSameBase (isMultiplication) {
            var utilClass = MathInteractives.Common.Utilities.Models.Utils,
                decider = utilClass.getRandomIntegerNumber(0,3);

            if(utilClass.getRandomIntegerNumber(0,2) === 1) {
                if(isMultiplication) {
                    this.numTiles[0].base = this.numTiles[1].base;
                    this.numTiles[0].exponent = this.numTiles[1].exponent * -1;
                }
                else {
                    if( decider === 0) {
                        this.denoTiles[0].base = this.numTiles[0].base;
                        this.denoTiles[0].exponent = this.numTiles[0].exponent;
                    }
                    else if (decider === 1){
                        this.numTiles[0].base = this.numTiles[1].base;
                        this.numTiles[0].exponent = this.numTiles[1].exponent * -1;
                    }
                    else {
                        this.denoTiles[0].base = this.denoTiles[1].base;
                        this.denoTiles[0].exponent = this.denoTiles[1].exponent * -1;
                    }
                }
            }
            this.numTiles = utilClass.shuffleArray(this.numTiles);
            this.denoTiles = utilClass.shuffleArray(this.denoTiles);
        },


        //Randomly generates the no. of tiles, creates tiles, shuffles and assign value to created tiles from baseTileValues
        generateBaseTiles: function(tiles, baseTileValues, isMultiplicationOnly, toCheckNumLen)
        {
            var i = 0, noOfTiles = 0,
                utilClass = MathInteractives.Common.Utilities.Models.Utils,
                j = utilClass.getRandomIntegerNumber(0, baseTileValues.length) % baseTileValues.length,
                level = this.accordionLevel,
                compInNum = this.compInNum,
                factorCounter = 0,
                compositeCounter = 0,
                iterCounter = 0;

            if(level > 3 ) {
                baseTileValues.splice(4, 0, -6);
                baseTileValues.splice(10, 0, -8);
            }
            noOfTiles = this.getNumberOfTilesNeeded(isMultiplicationOnly, toCheckNumLen);
            for (i = 0; i < noOfTiles; i++) {
                if (j % 2 === 0) {
                    baseTileValues = utilClass.shuffleArray(baseTileValues);
                }
                if(level > 3 ) {
                    if(isMultiplicationOnly && compositeCounter < 2) {
                        while(true) {
                            if(this.isCompositeNumber(baseTileValues[j])) {
                                compositeCounter++;
                                iterCounter = 0;
                                break;
                            }
                            else {
                                j = (j+1) % baseTileValues.length;
                                if(iterCounter === 8) {
                                    baseTileValues[j] = -6;
                                    iterCounter = 0;
                                    break;
                                }
                            }
                        }
                    }
                    else if(toCheckNumLen === false) { //in numerator
                        if(compInNum === 1) { // 2 composite in num
                            if(compositeCounter < 2) {
                                while(true) {
                                    if(this.isCompositeNumber(baseTileValues[j])) {
                                        compositeCounter++;
                                        iterCounter = 0;
                                        break;
                                    }
                                    else {
                                        j = (j+1) % baseTileValues.length;
                                        if(iterCounter === 8) {
                                            baseTileValues[j] = -6;
                                            iterCounter = 0;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        else { // 1 composite and one factor in num
                            if(compositeCounter < 1) {
                                while(true) {
                                    if(this.isCompositeNumber(baseTileValues[j])) {
                                        compositeCounter++;
                                        iterCounter = 0;
                                        break;
                                    }
                                    else {
                                        j = (j+1) % baseTileValues.length;
                                        if(iterCounter === 8) {
                                            baseTileValues[j] = -6;
                                            iterCounter = 0;
                                            break;
                                        }
                                    }
                                }
                            }
                            else if(factorCounter < 1){
                                this.factor = utilClass.getRandomIntegerNumber(2,3);
                                baseTileValues[j] = this.factor;
                            }
                        }
                    }
                    else if(toCheckNumLen === true){ //in denominator
                        if(compInNum === 0) { // 2 comp in deno
                            if(compositeCounter < 2) {
                                while(true) {
                                    if(this.isCompositeNumber(baseTileValues[j])) {
                                        compositeCounter++;
                                        iterCounter = 0;
                                        break;
                                    }
                                    else {
                                        j = (j+1) % baseTileValues.length;
                                        if(iterCounter === 8) {
                                            baseTileValues[j] = -6;
                                            iterCounter = 0;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        else { // 1 composite and one factor in den
                            if(compositeCounter < 1) {
                                while(true) {
                                    if(this.isCompositeNumber(baseTileValues[j])) {
                                        compositeCounter++;
                                        iterCounter = 0;
                                        break;
                                    }
                                    else {
                                        j = (j+1) % baseTileValues.length;
                                        if(iterCounter === 8) {
                                            baseTileValues[j] = -6;
                                            iterCounter = 0;
                                            break;
                                        }
                                    }
                                }
                            }
                            else if(factorCounter < 1){
                                this.factor = utilClass.getRandomIntegerNumber(2,3);
                                baseTileValues[j] = this.factor;
                            }
                        }
                    }
                }
                tiles[i] = new MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion.Tile();
                tiles[i].base = baseTileValues[j];
                j = (j+1) % baseTileValues.length;
            }
            return tiles;
        },

        isCompositeNumber: function isCompositeNumber (base) {
            if(base % 2 === 0 || base % 3 === 0) {
                if(Math.abs(base) / 2 !== 1 && Math.abs(base) / 3 !== 1) {
                    return true;
                }
            }
            return false;
        },

        getNumberOfTilesNeeded: function (isMultiplicationOnly, toCheckNumLen) {
            if(toCheckNumLen) {
                if(this.numTiles.length == 2) {
                    return 3;
                }
            }
            var utilClass = MathInteractives.Common.Utilities.Models.Utils;

            return (this.accordionLevel === 1) ? utilClass.getRandomIntegerNumber(2,3) : (isMultiplicationOnly) ? 3 : utilClass.getRandomIntegerNumber(2,3);
        },

        //randomly generate exponent value for created base tiles. Hardcoded -1 exponent if 0 exponent generated randomly
        generateExpAndAssignToTiles: function (tiles, isNegExpAllowed) {
            var i = 0;
            for (i = 0; i < tiles.length; i++) {
                tiles[i].exponent = MathInteractives.Common.Utilities.Models.Utils.getRandomIntegerNumber((isNegExpAllowed ? -9 : 1), 9);
                if (tiles[i].exponent == 0)
                    tiles[i].exponent = -1;
            }
            return tiles;
        },

        //Randomly assign parenthesis to a tile based on criteria (only 2 parenthesis allowed)
        assignParenthesis: function (tiles, isNegativeAllowed, isNegExpAllowed) {
            var noOfTilesInPare = 2, i = 0, j = 0, pareCtr = 0;
            for (i = 0; i < tiles.length; i++) {
                if (MathInteractives.Common.Utilities.Models.Utils.getRandomIntegerNumber(0, 1) == 1)
                {
                    if (pareCtr == 2)
                        break;

                    pareCtr++;
                    //start parenthesis
                    tiles[i].parenthesisState = (isNegativeAllowed && pareCtr == 1) ? 2 : 1;
                    tiles[i].operator = null;

                    if(this.accordionLevel === 5) {
                        tiles[i].pareExponent = isNegExpAllowed ? MathInteractives.Common.Utilities.Models.Utils.getRandomIntegerNumber(-3, 3) :
                                                                    MathInteractives.Common.Utilities.Models.Utils.getRandomIntegerNumber(1, 3);
                        if (tiles[i].pareExponent == 0)
                            tiles[i].pareExponent = MathInteractives.Common.Utilities.Models.Utils.getRandomIntegerNumber(-3, -1);
                    }
                    else {
                        tiles[i].pareExponent = 1;
                    }

                    if(tiles.length - i == 1) {
                        tiles[i].parenthesisState += 4;
                        noOfTilesInPare = 0;
                    }

                    for (j = i; j < noOfTilesInPare; j++)
                    {
                        //close parenthesis
                        if (MathInteractives.Common.Utilities.Models.Utils.getRandomIntegerNumber(0, 1) == 1) {
                            tiles[j].parenthesisState += 4;
                            i = j;
                            break;
                        }
                    }

                    if(tiles[i].parenthesisState <= 2)
                        tiles[i].parenthesisState += 4;
                }
            }
            return tiles;
        },

        writeJSON: function (isRaiseToPower)
        {
            var i = 0,
                startChildJSON = "{\"tileArray\":[",
                jsonString = startChildJSON,
                isFraction = this.denoTiles.length > 0, //start of equation view
                randomExponent;

            //if raise fraction to power add an additional parenthesis item start of parenthesis item
            if (isRaiseToPower)
                jsonString += startChildJSON;

            //start of fraction item
            if (isFraction)
            {
                jsonString += startChildJSON;
            }

            for (i = 0; i < this.numTiles.length; i++)
            {
                jsonString += this.numTiles[i].getJSON(false, i == 0, this.numTiles[i].operator == null, (i == this.numTiles.length - 1 && !isFraction));
            }
            for (i = 0; i < this.denoTiles.length; i++) {
                jsonString += this.denoTiles[i].getJSON(true, i == 0, this.denoTiles[i].operator == null, (i == this.denoTiles.length - 1));
            }
            i == 0
            //end of fraction item
            if (isFraction) {
                jsonString += "]," + MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion.Tile.getTileJSON("null",
                                "null", false, "FRACTION", "null", "null") + "}";
            }

            //end of raised to parenthesis item
            if (isRaiseToPower) {
                randomExponent = MathInteractives.Common.Utilities.Models.Utils.getRandomIntegerNumber(-3, 3);
                randomExponent = randomExponent === 0 ? 2 : randomExponent;
                jsonString += "]," + MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion.Tile.getTileJSON("null",
                                randomExponent, false, "BIG_PARENTHESIS", "null", "null") + "}";
            }

            //end of equation view
            jsonString += "]," + MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion.Tile.getTileJSON("null",
                                "null", false, "EQUATION_COMPONENT", "null", "null") + "}";

            return jsonString;

        }
    });

})();


