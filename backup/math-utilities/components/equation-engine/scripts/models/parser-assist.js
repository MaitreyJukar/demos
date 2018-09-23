/* globals window */

(function(MathUtilities) {
    'use strict';

    MathUtilities.Components.EquationEngine.Models.ParserAssist = Backbone.Model.extend({}, {

        "getEquationAccessibility": function(equationString) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                equationData,
                strText;
            EquationEngine.Productions.init();
            equationData = new EquationEngine.EquationData();
            equationData.setLatex(equationString, true);

            EquationEngine.Parser.parseEquation(equationData);

            strText = equationData.getAccText();
            equationData = null;
            return strText;
        }

    });
}(window.MathUtilities));
