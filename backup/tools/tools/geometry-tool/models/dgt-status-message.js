(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Models.DgtStatusMessage = Backbone.Model.extend({}, { //STATIC
        "instance": null,
        "init": function init() {
            if (!this.instance) {
                this.instance = new MathUtilities.Tools.Dgt.Models.DgtStatusMessage();
            }
        },
        "getStatusString": function getStatusString(module1, hit, param1, param2, param3) {

            var statusString, division1, division2,
                dgtUiModel = MathUtilities.Tools.Dgt.Models.DgtUiModel;
            division1 = MathUtilities.Tools.Dgt.Models.DgtStatusMessage.divisionMap[module1];
            division2 = MathUtilities.Tools.Dgt.Models.DgtStatusMessage.divisionMap[hit.replace('-with-label', '')];
            if (hit.indexOf('-with-label') > -1 && division2) {
                division2 += '-with-label';
            }

            if (param1 && isNaN(param1)) {
                param1 = dgtUiModel.textMapping[param1];

            }
            if (param2) {
                param2 = dgtUiModel.textMapping[param2];

            }
            if (param1 === 'Select' && module1 === 'cursor') {
                if (division2) {
                    division2 += '-deselected';
                } else {
                    hit += '-deselected';
                }
            }
            if (division1) {
                statusString = dgtUiModel.footerTooltip[division1 + '-' + hit];

            } else if (division2) {

                statusString = dgtUiModel.footerTooltip[module1 + '-' + division2];
            } else {
                statusString = dgtUiModel.footerTooltip[module1 + '-' + hit];
            }
            if (typeof param1 === 'undefined' || param1 === null) {
                param1 = dgtUiModel.textMapping[module1];
            }
            if (module1 === 'cursor' && hit === 'grid') {
                if (param1) {
                    param2 = this.getTypeOfSelected();
                    if (param1 !== 1 && typeof param2 !== 'undefined' && param2 !== null) {
                        param2 = dgtUiModel.pluralSpecieTextMapping[param2];

                    } else if (param1 === 1) {
                        param2 = dgtUiModel.textMapping[param2];
                    }
                } else {
                    statusString = dgtUiModel.footerTooltip['cursor' + '-' + 'leave'];
                }
            }
            this.engine.dgtUI.setStatusMessage(MathUtilities.Tools.Dgt.Models.DgtStatusMessage.replaceWords(statusString, param1, param2, param3));
        },
        "setEngine": function setEngine(engine) {
            this.engine = engine;
        },
        "replaceWords": function replaceWords() {
            var i, string = arguments[0];
            for (i = 1; i < arguments.length; i++) {
                if (string !== void 0 && string !== null) {
                    string = string.replace('%@$%', arguments[i]);
                }
            }
            return string;
        },
        "getTypeOfSelected": function getTypeOfSelected() {
            var selected = MathUtilities.Tools.Dgt.Models.DgtStatusMessage.engine.selected,
                count, firstSpecie, firstType, common;
            if (selected.length > 0) {
                common = firstSpecie = selected[0].species;
                if (selected[0].getCreationMethod() === 'axis') {
                    common = this.typeMap.axis;
                }
                firstType = MathUtilities.Tools.Dgt.Models.DgtStatusMessage.typeMap[selected[0].species];

                for (count = 1; count < selected.length; count++) {
                    if (selected[count].species !== firstSpecie || common === 'axis' && selected[count].getCreationMethod() !== 'axis') {
                        common = firstType;
                    } else {
                        continue;
                    }
                    if (MathUtilities.Tools.Dgt.Models.DgtStatusMessage.typeMap[selected[count].species] !== firstType || !firstType) {
                        common = 'object';
                        break;
                    }
                }

                return common;
            }

        },
        "typeMap": {
            'line': 'straightObj',
            'segment': 'straightObj',
            'ray': 'straightObj',
            'circle': 'conics',
            'shapes': 'shape',
            'conics': 'conics',
            'arc': 'conics',
            'ellipse': 'conics',
            'hyperbola': 'conics',
            'parabola': 'conics',
            'polygon': 'shape',
            'iso-triangle': 'shape',
            'equi-triangle': 'shape',
            'square': 'shape',
            'parallelogram': 'shape',
            'rectangle': 'shape',
            'pentagon': 'shape',
            'hexagon': 'shape',
            'polygonInterior': 'shape',
            'point': 'point',
            'iteration': 'iteration',
            'axis': 'axis'
        },
        "divisionMap": {
            'line': 'shape',
            'segment': 'shape',
            'ray': 'shape',
            'circle': 'shape',
            'shapes': 'shape',
            'conics': 'shape',
            'arc': 'shape',
            'axis': 'shape',
            'ellipse': 'shape',
            'hyperbola': 'shape',
            'parabola': 'shape',
            'polygon': 'shape',
            'iso-triangle': 'shape',
            'equi-triangle': 'shape',
            'square': 'shape',
            'parallelogram': 'shape',
            'rectangle': 'shape',
            'pentagon': 'shape',
            'hexagon': 'shape',
            'polygonInterior': 'shape',
            'circleInterior': 'shape',
            'ellipseInterior': 'shape',
            'point': 'point',
            'iteration': 'iteration',
            'iterate': 'shape'
        }


    });
})(window.MathUtilities);
