/* globals window, geomFunctions  */
(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Models.DgtInterior = MathUtilities.Tools.Dgt.Models.DgtShape.extend({
        "initialize": function() {
            var OPACITY = 0.5;
            MathUtilities.Tools.Dgt.Models.DgtInterior.__super__.initialize.apply(this, arguments);
            this.division = 'interior';

            this.equation.setLatex('BLIND');

            this.id = MathUtilities.Tools.Dgt.Models.DgtEngine.getIdForEntity(this);
            this.equation.setExtraThickness(false);

            this.equation.setInEqualityOpacity(OPACITY);
        },

        "init": function(species, engine) {
            var DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;
            this.engine = engine;
            this.species = species;
            switch (species) {
                case 'circleInterior':
                case 'arcSegmentInterior':
                case 'arcSectorInterior':
                    this.equation.setAutonomous(true);
                    this.equation.setSpecie('curve');
                    this.equation.setIsFilled(true);
                    break;

                case 'ellipseInterior':

                    this.equation.setSpecie('plot');
                    this.equation.setIsFilled(true);
                    this.equation.setPostProcessFunctionCode(true);
                    break;
                case 'polygonInterior':
                    this.equation.setSpecie('polygon');

                    this.isAMaturedRelation = false;
                    this.equation.setIsFilled(true);
                    break;
            }
            this.functionCode = MathUtilities.Tools.Dgt.Models.DgtShape.getShapeFunctionCode(this.species);

            this.equation.setFunctionCode(this.functionCode.functionCode);

            if (species === 'ellipseInterior') {
                if (this.functionCode.functionCodeA) {
                    this.equation.setFunctionCodeA(this.functionCode.functionCodeA);
                }
                if (this.functionCode.functionCodeB) {
                    this.equation.setFunctionCodeB(this.functionCode.functionCodeB);
                }
                if (this.functionCode.functionCodeC) {
                    this.equation.setFunctionCodeC(this.functionCode.functionCodeC);
                }
            }
            DgtEngine.entityCount.interiors++;
            this.setSerialNumber();
            this.equation.depthLevel = this.serialNumber;
            this.equation.setParamVariableOrder(this.equation.getSpecie() === 'plot' && this.species !== 'line' ? 2 : 1);

            this.equation.setFunctionVariable('y');
            this.equation.setParamVariable('x');
        }
    });
})(window.MathUtilities);
