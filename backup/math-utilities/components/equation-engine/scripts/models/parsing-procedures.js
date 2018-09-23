/* globals window */

(function(MathUtilities) {
    'use strict';

    /**
        @class MathUtilities.Components.EquationEngine.Models.ParsingProcedures

    **/
    MathUtilities.Components.EquationEngine.Models.ParsingProcedures = Backbone.Model.extend({}, {

        "_validOpeningBrackets": ['(', '{', '['],
        "_validClosingBrackets": [')', '}', ']'],
        //we are supporting only + type recursion
        "_recursiveTokenRegEx": /^\((.+)\)\+$/i,
        "_productions": MathUtilities.Components.EquationEngine.Models.Productions,

        /**
        Returns peek value from the predictionStack. Normally, if the element at given index is finite, then it will be returned. If it is infinite (\\cdot,E)+ then the first token of that infinite term, \\cdot will be returned.


        @method peekInPredictionStack
        @private
        @param predictionStack{Array} prediction rule stack
        @param currentIndex{Integer} index of the stack element to peek into
        @return {String} the term at currentIndex, undefined in case of an error
        @static
        **/
        "peekInPredictionStack": function(predictionStack, currentIndex) {
            if (currentIndex > predictionStack.length) {
                return void 0;
            }

            return MathUtilities.Components.EquationEngine.Models.ParsingProcedures._getPeekValue(predictionStack[currentIndex]);


        },

        /**
        Returns the peek value from any prediction stack element.

        Eg.
        A  will return A
        (+,E)+ will return +
        (-,E)+ will return -
        x will return x
        E will return E



        @method _getPeekValue
        @private
        @param peekValue{Integer}
        @return {String} the peek value, undefined otherwise
        @static
        **/

        "_getPeekValue": function(peekValue) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                matches,
                tokens;
            if (peekValue === void 0) {
                return void 0;
            }
            if (EquationEngine.ParsingProcedures._recursiveTokenRegEx.test(peekValue)) {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'peek term is recursive...' + peekValue, []);
                matches = peekValue.match(EquationEngine.ParsingProcedures._recursiveTokenRegEx);
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'matches ' + matches, []);
                tokens = matches[1].split(',');
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'tokens are ' + tokens, []);
                return tokens[0];
            }
            return peekValue;
        },


        /**

        It expands the infinite term in the prediction stack at index expandTermAt.

        @method
        @private
        @param predictionStack{Array}
        @param expandTermAt{Integer}
        @return
        @static
        **/
        "expandRecursiveStack": function(predictionStack, expandTermAt) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                lastTerm,
                matches,
                expandedTerms,
                i;
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Expanding prediction stack ' + predictionStack + ' at index ' + expandTermAt, []);
            lastTerm = predictionStack[expandTermAt];

            matches = lastTerm.match(EquationEngine.ParsingProcedures._recursiveTokenRegEx);

            expandedTerms = matches[1].split(',');
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Expanded terms are ' + expandedTerms, []);
            for (i = expandedTerms.length - 1; i >= 0; i--) {
                predictionStack.splice(expandTermAt, 0, expandedTerms[i]);
            }
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'now prediction stack is ' + predictionStack, []);
        },


        /**
        Checks if any term in the prediction stack is infinite. A infinite term such as const + (+E)+, in this prediction stack (+E)+ can be expanded to create expansions such as const + E + E + E (+E)+

        @method isStackInfinite
        @private
        @param predictionStack{Array}
        @return {Boolean}
        @static
        **/
        "isStackInfinite": function(predictionStack) {
            return MathUtilities.Components.EquationEngine.Models.ParsingProcedures.isTermInfinite(predictionStack[predictionStack.length - 1]);
        },

        /**
        Checks if the term is infinite term which can be expanded eg. (+E)+ can be expanded for one or more times. Such terms will be infinite.

        @method isTermInfinite
        @private
        @param term{String}
        @return
        @static
        **/
        "isTermInfinite": function(term) {
            if (term === void 0) {
                return false;
            }
            var EquationEngine = MathUtilities.Components.EquationEngine.Models;
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'checking for recursive term ' + term + ' result is ' + this._recursiveTokenRegEx.test(term), []);
            return EquationEngine.ParsingProcedures._recursiveTokenRegEx.test(term);
        },

        /**
        This function is used to verify prediction stack with the given lookahead.
        The logic is to check the topmost prediction stack element with lookahead array...

        1. same or lower precedence infinite goal is not being chased in lookahead stack
        2. chasing of same infinite goal is allowed if after a closing delimiter is found in the lookahead array



        @method verifyStackWithLookahead
        @private
        @param predictionStack {Array}
        @param lookAhead {Array}
        @return {Boolean}
        @static
        **/
        "verifyStackWithLookahead": function(predictionStack, lookAhead) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                checkingWith,
                i;
            //TRACE
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '*******************verifying stack ' + predictionStack + ' with lookahead ' + lookAhead, []);
            if (lookAhead === void 0 || lookAhead.length === 0) {
                return true;
            }

            /*
             * >>You cant allow to chase same right sided goals unless there is a delimiter in it
             *
             * if you want to know why try solving a + b \cdot c + d with checking last goal only on the top of stack rather than in the entire stack
             *
             *
             * >>To implement operator precedence you must not allow higher precedence operators stacked over by lower precedence operators eg. \cdot can't be stacked over by +
             *
             */
            for (i = lookAhead.length - 1; i > 0; i--) {
                checkingWith = lookAhead[i];
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, checkingWith + ' <> ' + predictionStack[predictionStack.length - 1], []);

                if (EquationEngine.ParsingProcedures._isClosingBracket(checkingWith)) {
                    //if closing bracket is encountered means we can chase the infinite target
                    return true;
                }
                if (predictionStack[predictionStack.length - 1] === checkingWith ||
                    EquationEngine.ParsingProcedures.getOperatorPrecedenceIndex(EquationEngine.ParsingProcedures._getPeekValue(predictionStack[predictionStack.length - 1])) < EquationEngine.ParsingProcedures.getOperatorPrecedenceIndex(EquationEngine.ParsingProcedures._getPeekValue(checkingWith))) {
                    return false;
                }
            }
            return true;
        },


        /**

        Returns precedence index of the given operator

        @method getOperatorPrecedenceIndex
        @private
        @param operator{String}
        @return {Integer}
        @static
        **/
        "getOperatorPrecedenceIndex": function(operator) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                index = EquationEngine.Productions._operatorsInPrecedenceOrder.indexOf(operator);
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'checking operator precedence index for operator ' + operator + ' index is ' + index, []);
            return index;
        },

        /**
        Check if the token is same by name or by type.

        @method isTokenSame
        @private
        @param token{Object}
        @param tokenTypeOrName{String}
        @return {Boolean}
        @static
        **/
        "isTokenSame": function(token, tokenTypeOrName) {
            return token.value === tokenTypeOrName || token.type === tokenTypeOrName;
        },

        /**
        Simple clone string array.

        @method cloneStringStack
        @private
        @param fromArray{Array}
        @param toArray{Array}
        @return Void
        @static
        **/
        "cloneStringStack": function(fromArray, toArray) {
            var i;
            for (i = 0; i < fromArray.length; i++) {
                toArray[i] = fromArray[i];
            }
        },

        /**
        Function is used to update lookaheads when calling recursiveDescentParser recursively.

        @method pushAllLookAheads
        @private
        @param lookAheadStack{Array}
        @param prediction{Stack}
        @param pointerInPredictionStack{Integer}
        @return {Integer}
        @static
        **/
        "pushAllLookAheads": function(lookAheadStack, predictionStack, pointerInPredictionStack) {
            var count = 0,
                i;
            for (i = predictionStack.length - 1; i >= pointerInPredictionStack; i--) {
                count++;
                lookAheadStack.push(predictionStack[i]);
            }
            return count;
        },


        /**
        This function is used to check if the next token is compatible with the lookAheadStack

        @method checkWithLookAhead
        @private
        @param token{Object}
        @param lookAheadStack {Array}
        @return {Boolean}
        @static
        **/
        "checkWithLookAhead": function(token, lookAheadStack) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                lookAheadPeek,
                isLookAheadRecursive,
                i;
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, '------------------------------------------------------------------------------', []);
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, 'checking token ' + token + ' from Lookahead stack ' + lookAheadStack, []);
            if (lookAheadStack === void 0) {
                return false;
            }

            /*
             * LHS is next token in queue from the INPUT
             * RHS is next predicted possible input
             *
             * LHS is closing delimiter ),} then keep checking till u find a clear match with a non recursive term in RHS, skip all Recursive terms
             * LHS is anything other than closing delimiter and Recursive, then skip closing delimiters and keep checking till you find a clear mismatch with a non recursive term
             *
             */

            for (i = lookAheadStack.length - 1; i >= 0; i--) {

                lookAheadPeek = EquationEngine.ParsingProcedures._getPeekValue(lookAheadStack[i]);

                isLookAheadRecursive = EquationEngine.ParsingProcedures.isTermInfinite(lookAheadStack[i]);

                if (lookAheadPeek === void 0) {
                    break;
                }
                if (EquationEngine.ParsingProcedures._isClosingBracket(token.value)) {
                    if (!isLookAheadRecursive) {
                        return EquationEngine.ParsingProcedures.isTokenSame(token, lookAheadPeek);
                    }
                    continue;
                }
                if (EquationEngine.ParsingProcedures._isClosingBracket(lookAheadPeek)) {
                    return EquationEngine.ParsingProcedures.isTokenSame(token, lookAheadPeek);
                }

                if (isLookAheadRecursive) {
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'checkign with recursive ' + EquationEngine.ParsingProcedures._getPeekValue(lookAheadStack[i]), []);
                    if (EquationEngine.ParsingProcedures.isTokenSame(token, lookAheadPeek)) {
                        return true;
                    }
                    continue;
                }
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, lookAheadStack[i] + ' is not recursive...checking normally now', []);
                return EquationEngine.ParsingProcedures.isTokenSame(token, lookAheadPeek);
            }
            return false;
        },


        /**
        Checks if the passed string matches with terminal Symbol. In this project we have used only 'E' as non terminal symbol.


        @method isNonTerminal
        @private
        @param value{String}
        @return {Boolean}
        @static
        **/
        "isNonTerminal": function(value) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models;
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'checking ' + value, []);
            return value === '$%^&';
        },


        "_isSpecialTerminal": function(type) {
            return type === 'var' || type === 'const' || type === 'digit';
        },

        /**
        Get prediction stack that matches the token.

        @method getPredictionStacksForToken
        @private
        @param token {Object} token object of equation
        @param nodeName {String} node name for the given token
        @param isRange {Boolean} flag denoting whether the token is for equation range or equation itself
        @return {Array}
        @static
        **/
        "getPredictionStacksForToken": function(token, nodeName, isRange) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                nodeObjects,
                validRules,
                tokenValue;
            if (EquationEngine.ParsingProcedures._isSpecialTerminal(token.type)) {
                tokenValue = token.type;
            } else {
                tokenValue = token.value;
            }
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'token value is ' + tokenValue, []);
            if (isRange) {
                nodeObjects = EquationEngine.RangeProductionRules.rangeRulesTable[nodeName];
            } else {
                nodeObjects = EquationEngine.ParsingProcedures._productions.productionTable[nodeName];
            }
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'node objects ' + nodeObjects, []);
            validRules = nodeObjects[tokenValue];
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'valid rules ' + validRules, []);
            return validRules;
        },

        /**
        Records bracket stack for parsing.

        @method recordBracket
        @private
        @param bracketStack {Array}
        @param currentBracket{String}
        @return Void
        @static
        **/
        "recordBracket": function(bracketStack, currentBracket) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                onTop;
            if (!EquationEngine.ParsingProcedures._isValidBracket(currentBracket)) {
                return void 0;
            }
            if (bracketStack.length === 0) {
                bracketStack.push(currentBracket);
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Updating bracket stack ' + bracketStack, []);
                return void 0;
            }
            onTop = bracketStack[bracketStack.length - 1];
            if (EquationEngine.ParsingProcedures._isOppositeBracket(onTop, currentBracket)) {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Opposites found ' + onTop + '<>' + currentBracket, []);
                bracketStack.pop();
            } else {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'pushing in stack ' + currentBracket, []);
                bracketStack.push(currentBracket);
            }

            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Updating bracket stack ' + bracketStack, []);
        },

        /**
        Checks if the bracket is a valid opening or closing bracket.

        @method _isValidBracket
        @private
        @param bracket{String}
        @return {Boolean}
        @static
        **/
        "_isValidBracket": function(bracket) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models;
            return EquationEngine.ParsingProcedures._validOpeningBrackets.indexOf(bracket) !== -1 || EquationEngine.ParsingProcedures._validClosingBrackets.indexOf(bracket) !== -1;
        },



        /**
        Checks if the bracket is an opening bracket.

        @method _isOpeningBracket
        @private
        @param bracket{String}
        @return {Boolean}
        @static
        **/
        "_isOpeningBracket": function(bracket) {
            return MathUtilities.Components.EquationEngine.Models.ParsingProcedures._validOpeningBrackets.indexOf(bracket) !== -1;
        },

        /**
        Checks if the bracket is an closing bracket.

        @method _isClosingBracket
        @private
        @param bracket{String}
        @return {Boolean}
        @static
        **/
        "_isClosingBracket": function(bracket) {
            return MathUtilities.Components.EquationEngine.Models.ParsingProcedures._validClosingBrackets.indexOf(bracket) !== -1;
        },

        /**
        Checks if the toCheckFor is opposite of the bracket toCheckWith. eg { X }; ( X )

        @method _isOppositeBracket
        @private
        @param toCheckFor{String}
        @param toCheckWith{String}
        @return {Boolean}
        @static
        **/
        "_isOppositeBracket": function(toCheckFor, toCheckWith) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                index;
            if (!(EquationEngine.ParsingProcedures._isValidBracket(toCheckFor) &&
                    EquationEngine.ParsingProcedures._isValidBracket(toCheckWith))) {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Wrong bracket Pair ' + toCheckFor + ' <> ' + toCheckWith, []);
                return void 0;
            }
            if (EquationEngine.ParsingProcedures._isOpeningBracket(toCheckFor)) {
                index = EquationEngine.ParsingProcedures._validOpeningBrackets.indexOf(toCheckFor);
                return EquationEngine.ParsingProcedures._validClosingBrackets[index] === toCheckWith;
            }
            index = EquationEngine.ParsingProcedures._validClosingBrackets.indexOf(toCheckFor);
            return EquationEngine.ParsingProcedures._validOpeningBrackets[index] === toCheckWith;
        },
        /**
        Get the stack code for the ongoing parsing.

        @method getStackCode
        @private
        @param bracketsStack{Array}
        @return {Integer}
        @static
        **/
        "getStackCode": function(bracketsStack) {
            return bracketsStack.length;
        }
    });
}(window.MathUtilities));
