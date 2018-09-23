/* globals $, window */

(function(MathUtilities) {
    'use strict';
    if (MathUtilities.Components.EquationEngine.Models.Productions) {
        return;
    }
    MathUtilities.Components.EquationEngine.Models.Productions = Backbone.Model.extend({}, {
        "_terminalProductions": null,
        "_nonTerminalProductions": null,
        "productionTable": null,
        "productionRules": null,
        "_seperatedTokens": null,
        "treeGenerationRules": null,
        "_nonTerminalRules": null,
        "_operatorsInPrecedenceOrder": null,
        "_terminalRules": null,

        "init": function() {
            var Productions = MathUtilities.Components.EquationEngine.Models.Productions;
            if (Productions.productionRules === null) {
                Productions._populateProductionData();
            }
        },

        "getMaximumParameters": function(functionName) {
            switch (functionName) {
                case '^':
                case '\\log_':
                case '\\sqrt':
                case '\\min':
                case '\\max':
                case '\\mod':
                case '\\nCr':
                case '\\nPr':
                case '\\ncr':
                case '\\npr':
                case '\\frac':
                    return 2;

                case '+':
                case '-':
                case '\\cdot':
                case '.':
                    return Infinity;

                case '\\mixedfrac':
                    return 3;

                case '!':
                case '\\%':
                case '\\sin':
                case '\\cos':
                case '\\tan':
                case '\\csc':
                case '\\sec':
                case '\\cot':
                case '\\sinh':
                case '\\cosh':
                case '\\tanh':
                case '\\arcsin':
                case '\\arccos':
                case '\\arctan':
                case '\\log':
                case '\\ln':
                case '\\ceil':
                case '\\floor':
                case '\\round':
                case '\\abs':
                case '\\exp':
                case 'do':
                case '\\sgn':
                case '\\trunc':
                case '\\customFunc':
                    return 1;

                case '\\sum':
                case '\\prod':
                    return 4;
            }
        },

        "_populateProductionData": function() {
            var Productions = MathUtilities.Components.EquationEngine.Models.Productions,
                terminalProductionsCounter = 0,
                terminalProductionsLength,
                currentRule,
                operatorCounter,
                operatorCount,
                totalOperatorCombinations,
                currentNonTerminalProduction,
                currentProduction,
                currentOperatorCombinationCounter,
                currentTerminalProduction,
                terminalMappingName,
                currentRuleNonTerminalPart;
            Productions._terminalProductions = ['\\frac', '(', '[', 'var', 'const', 'digit',
                '\\theta', '{', '\\sin', '\\cos', '\\tan', '\\csc', '\\sec', '\\cot',
                '\\arcsin', '\\arccos', '\\arctan', '\\arccsc', '\\arcsec', '\\arccot',
                '\\sinh', '\\cosh', '\\tanh', '\\csch', '\\sech', '\\coth', '\\log_',
                '\\ln', '\\log', '\\sqrt', '\\ceil', '\\floor', '\\round', '\\abs',
                '\\min', '\\max', '\\mod', '\\nPr', '\\nCr', '\\npr', '\\ncr', '\\exp',
                '\\sum', '\\prod', '\\sgn', '\\trunc', '\\mixedfrac', '\\customFunc'
            ];
            Productions._terminalRules = ['node.\\frac', 'node.do', 'node.do',
                'terminal.var', 'terminal.const', 'terminal.digit', 'terminal.\\theta',
                'node.do', 'node.\\sin', 'node.\\cos', 'node.\\tan', 'node.\\csc',
                'node.\\sec', 'node.\\cot', 'node.\\arcsin', 'node.\\arccos',
                'node.\\arctan', 'node.\\arccsc', 'node.\\arcsec', 'node.\\arccot',
                'node.\\sinh', 'node.\\cosh', 'node.\\tanh', 'node.\\csch', 'node.\\sech',
                'node.\\coth', 'node.\\log_', 'node.\\ln', 'node.\\log', 'node.\\sqrt',
                'node.\\ceil', 'node.\\floor', 'node.\\round', 'node.\\abs', 'node.\\min',
                'node.\\max', 'node.\\mod', 'node.\\nPr', 'node.\\nCr', 'node.\\npr',
                'node.\\ncr', 'node.\\exp', 'node.\\sum terminal.const',
                'node.\\prod terminal.const', 'node.\\sgn', 'node.\\trunc',
                'node.\\mixedfrac', 'node.\\customFunc'
            ];

            Productions._seperatedTokens = {
                "\\frac": ['\\frac', '{', '$%^&', '}', '{', '$%^&', '}'],
                "(": ['(', '$%^&', ')'],
                "[": ['[', '$%^&', ']'],
                "var": ['var'],
                "const": ['const'],
                "digit": ['digit'],
                "\\theta": ['\\theta'],
                "{": ['{', '$%^&', '}'],
                "\\sin": ['\\sin', '(', '$%^&', ')'],
                "\\cos": ['\\cos', '(', '$%^&', ')'],
                "\\tan": ['\\tan', '(', '$%^&', ')'],
                "\\csc": ['\\csc', '(', '$%^&', ')'],
                "\\sec": ['\\sec', '(', '$%^&', ')'],
                "\\cot": ['\\cot', '(', '$%^&', ')'],
                "\\arcsin": ['\\arcsin', '(', '$%^&', ')'],
                "\\arccos": ['\\arccos', '(', '$%^&', ')'],
                "\\arctan": ['\\arctan', '(', '$%^&', ')'],
                "\\arccsc": ['\\arccsc', '(', '$%^&', ')'],
                "\\arcsec": ['\\arcsec', '(', '$%^&', ')'],
                "\\arccot": ['\\arccot', '(', '$%^&', ')'],
                "\\sinh": ['\\sinh', '(', '$%^&', ')'],
                "\\cosh": ['\\cosh', '(', '$%^&', ')'],
                "\\tanh": ['\\tanh', '(', '$%^&', ')'],
                "\\csch": ['\\csch', '(', '$%^&', ')'],
                "\\sech": ['\\sech', '(', '$%^&', ')'],
                "\\coth": ['\\coth', '(', '$%^&', ')'],
                "\\customFunc": ['\\customFunc', '(', '$%^&', ')'],
                "\\log_": ['\\log_', '{', '$%^&', '}', '(', '$%^&', ')'],
                "\\ln": ['\\ln', '(', '$%^&', ')'],
                "\\log": ['\\log', '(', '$%^&', ')'],
                "\\sqrt": ['\\sqrt', '[', '$%^&', ']', '{', '$%^&', '}'],
                "\\ceil": ['\\ceil', '(', '$%^&', ')'],
                "\\floor": ['\\floor', '(', '$%^&', ')'],
                "\\sgn": ['\\sgn', '(', '$%^&', ')'],
                "\\trunc": ['\\trunc', '(', '$%^&', ')'],
                "\\round": ['\\round', '(', '$%^&', ')'],
                "\\abs": ['\\abs', '(', '$%^&', ')'],
                "\\min": ['\\min', '(', '$%^&', ',', '$%^&', ')'],
                "\\max": ['\\max', '(', '$%^&', ',', '$%^&', ')'],
                "\\mod": ['\\mod', '(', '$%^&', ',', '$%^&', ')'],
                "\\nPr": ['\\nPr', '(', '$%^&', ',', '$%^&', ')'],
                "\\nCr": ['\\nCr', '(', '$%^&', ',', '$%^&', ')'],
                "\\npr": ['\\npr', '(', '$%^&', ',', '$%^&', ')'],
                "\\ncr": ['\\ncr', '(', '$%^&', ',', '$%^&', ')'],
                "\\exp": ['\\exp', '(', '$%^&', ')'],
                "\\mixedfrac": ['\\mixedfrac', '{', '$%^&', '}', '{', '$%^&', '}', '{', '$%^&', '}'],
                "\\sum": ['\\sum', '{', 'const', '}', '{', '$%^&', '}', '{', '$%^&', '}', '{', '$%^&', '}'],
                "\\prod": ['\\prod', '{', 'const', '}', '{', '$%^&', '}', '{', '$%^&', '}', '{', '$%^&', '}']
            };

            /*
             * -ve operator is not accounted since we will not expect it in parsing
             * the tokens will be preprocessed to remove negative signs
             *
             */
            Productions._operatorsInPrecedenceOrder = ['+', '\\cdot', '^', '!', '\\%'];
            Productions._nonTerminalRules = ['node.+', 'node.\\cdot', 'node.^', 'node.!', 'node.\\%'];
            Productions.productionTable = {
                "$%^&": {}
            };
            terminalProductionsLength = Productions._terminalProductions.length;
            for (; terminalProductionsCounter < terminalProductionsLength; terminalProductionsCounter++) {
                Productions.productionTable['$%^&'][Productions._terminalProductions[terminalProductionsCounter]] = [];
            }
            Productions.treeGenerationRules = [];

            Productions.productionRules = [];
            operatorCounter = 0;
            operatorCount = Productions._operatorsInPrecedenceOrder.length;
            terminalProductionsCounter = 0;
            terminalProductionsLength = Productions._terminalProductions.length;

            totalOperatorCombinations = Math.pow(2, operatorCount) - 1;

            for (; terminalProductionsCounter < terminalProductionsLength; terminalProductionsCounter++) {

                currentTerminalProduction = Productions._terminalProductions[terminalProductionsCounter];
                terminalMappingName = Productions._seperatedTokens[currentTerminalProduction][0];

                for (currentOperatorCombinationCounter = 0; currentOperatorCombinationCounter < totalOperatorCombinations; currentOperatorCombinationCounter++) {

                    currentNonTerminalProduction = [];
                    currentRuleNonTerminalPart = '';
                    currentRule = '';

                    for (operatorCounter = 0; operatorCounter < operatorCount; operatorCounter++) {

                        if ((currentOperatorCombinationCounter & Math.pow(2, operatorCounter)) > 0) {
                            if (Productions._operatorsInPrecedenceOrder[operatorCounter] === '!' || Productions._operatorsInPrecedenceOrder[operatorCounter] === '\\%') {
                                currentNonTerminalProduction.unshift('(' + Productions._operatorsInPrecedenceOrder[operatorCounter] + ')+');
                            } else {
                                currentNonTerminalProduction.unshift('(' + Productions._operatorsInPrecedenceOrder[operatorCounter] + ',$%^&)+');
                            }
                            currentRuleNonTerminalPart = currentRuleNonTerminalPart + 'node.' + Productions._operatorsInPrecedenceOrder[operatorCounter] + ' ';

                        }

                    }

                    currentProduction = Productions._seperatedTokens[currentTerminalProduction].concat.apply(Productions._seperatedTokens[currentTerminalProduction], [currentNonTerminalProduction]);
                    currentRule = currentRuleNonTerminalPart + Productions._terminalRules[terminalProductionsCounter];
                    Productions.treeGenerationRules.push(currentRule);
                    Productions.productionRules.push(currentProduction);
                    Productions.productionTable['$%^&'][terminalMappingName].push(Productions.productionRules.length - 1);

                    if (currentTerminalProduction === '{' || currentTerminalProduction === '[') {
                        //dont generate rules after {E} they are not valid
                        break;
                    }
                }

                /*
                 * create rules that will facilitate creation of trees with operator precedence
                 *
                 * here we will create rules like
                 *
                 * {terminal Nodes} {all higher precedence operators} E ({current operator},E)+
                 *
                 */

            }
            Productions._getProductionTableAsString();
        },

        "_getProductionTableAsString": function() {
            var Productions = MathUtilities.Components.EquationEngine.Models.Productions,
                productionTableString = '',
                productionRulesCounter = 0,
                productionRulesLength = Productions.productionRules.length;
            for (; productionRulesCounter < productionRulesLength; productionRulesCounter++) {
                productionTableString += productionRulesCounter + ' : ' + Productions.productionRules[productionRulesCounter].join('') + '   >>    ' + Productions.treeGenerationRules[productionRulesCounter] + '\n';
            }
            $('#rules').text(productionTableString);
        }
    });
}(window.MathUtilities));
