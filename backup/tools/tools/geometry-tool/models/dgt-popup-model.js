/* globals window */

(function(MathUtilities) {
    'use strict';

    MathUtilities.Tools.Dgt.Models.DgtPopupModel = Backbone.Model.extend({

        "transformationPopupId": 'param-options-popup',
        "propertiesPopupId": 'properties-popup',
        "parameterPopupId": 'parameter-popup',
        "calculatorPopupId": 'calculator-popup',
        "iteratePopupId": 'iterate-popup',
        "$popup": null,
        "iteratePopupManager": null,
        "interval": null,
        "mappingColumnCounter": 1,
        "idOfIterateDropdownMenuItemToEnable": null,
        "widthIncreased": false,
        "summaryImageVisible": false,
        "summaryOfHiddenImages": null,
        "iteratePopupStructure": null,
        "$transformationPopup": null,
        "$propertiesPopup": null,
        "$parameterPopup": null,
        "$calculatorPopup": null,
        "directive": null,
        "recentVectorMarking": null,
        "recentAngleMarking": null,
        "recentRatioMarking": null,
        "recentDistanceMarking": null,
        "recentMarking": null,
        "lastSelectedVector": null,
        "popupOffset": null,
        "startingTabIndex": null,

        "engine": null,
        "prevMode": null, //previous mode of grid for setting on popup closed
        "isOkClicked": null,
        "bootstrapPopupShown": null,
        "curPopupShown": null,
        "initialize": function(options) {
            this.setEngine(options.engine);
            this.iteratePopupManager = new MathUtilities.Tools.Dgt.Models.IteratePopupManager({
                "engine": this.engine
            });
            this.updateText();
        },
        "setEngine": function(engine) {
            this.engine = engine;
        },
        "updateText": function() {
            if (!this.engine.accManager) {
                return;
            }
            var accManager = this.engine.accManager,
                setText = function(id, obj, path) {
                    obj[path] = accManager.getMessage(id, 0) || '';
                },
                elem = null,
                paramPopupData = this.paramPopupData,
                curElem = null,
                locElem = ['title', 'ok', 'cancel'],
                curObj = null;

            accManager.loadScreen("dgt-popup-model");

            //view object
            for (curObj in paramPopupData) {
                curElem = paramPopupData[curObj];
                for (elem in locElem) {
                    if (curElem.hasOwnProperty(locElem[elem])) {
                        setText("paramPopupData-" + curObj + "-" + locElem[elem], curElem, locElem[elem]);
                    }
                }
            }
        },
        "defaultValuesForOptions": {
            "translate": {
                "translation-distance-polar": '1.0',
                "translation-angle-polar": '90.0',
                "translation-horizontal-distance-cartesian": '1.0',
                "translation-vertical-distance-cartesian": '1.0'
            },
            "rotate": {
                "rotation-angle": '90.0'
            },
            "dilate": {
                "dilate-numerator": '1.0',
                "dilate-denominator": '2.0'
            }
        },
        "paramPopupData": {
            "translate": {
                "title": null,
                "ok": null,
                "defaultValues": {
                    "translation-distance-polar": '1.0',
                    "translation-angle-polar": '90.0',
                    "translation-horizontal-distance-cartesian": '1.0',
                    "translation-vertical-distance-cartesian": '1.0'
                }
            },
            "rotate": {
                "title": null,
                "ok": null,
                "defaultValues": {
                    "rotation-angle": '90.0'
                }
            },
            "dilate": {
                "title": null,
                "ok": null,
                "defaultValues": {
                    "dilate-numerator": '1.0',
                    "dilate-denominator": '2.0'
                }
            },
            "properties": {
                "title": null,
                "ok": null,
                "cancel": null
            },
            "beta-functionality": {
                "title": null,
                "ok": null
            },
            "resetBoard": {
                "title": null,
                "ok": null
            },
            "mathjax-load-error": {
                "title": null,
                "ok": null
            },
            "parameter": {
                "title": null,
                "ok": null,
                "cancel": null
            },
            "calculator": {
                "title": null,
                "ok": null,
                "cancel": null
            },
            "transforming-center-only": {
                "title": null,
                "ok": null
            },
            "small-image-crop": {
                "title": null,
                "ok": null
            },
            "iterate-missing-destination-image": {
                "title": null
            },
            "iterate": {
                "title": null,
                "ok": null
            },
            "iterateToDepth": {
                "title": null,
                "ok": null
            },
            "reflecting-mirror-only": {
                "title": null
            },
            "unsupported-file-error": {
                "title": null,
                "ok": null
            }
        },
        "objectTypeMapping": {
            "noLabelEntities": {
                "tabs": ['object']
            },
            "point": {
                "tabs": ['label']
            },
            "measurement": {
                "tabs": ['label', 'value']
            },
            "shape": {
                "tabs": ['label']
            },
            "interior": {
                "tabs": ['label']
            },
            "angleMark": {
                "tabs": ['label', 'marker']
            },
            "tickMark": {
                "tabs": ['marker']
            },
            "parameter": {
                "tabs": ['label', 'value']
            }
        },
        "valuesForNotation": {
            "angleMark": {
                "showDirection": false,
                "direction": 1,
                "strokeCount": 1,
                "typeOfMarker": 'simple',
                "thickness": 4
            },
            "tickMark": {
                "showDirection": false,
                "direction": 0,
                "strokeCount": 1,
                "typeOfMarker": 'crossbar',
                "thickness": 4
            }
        },
        "defaultValuesForNotation": {
            "angleMark": {
                "showDirection": false,
                "direction": 1,
                "strokeCount": 1,
                "typeOfMarker": 'simple',
                "thickness": 4
            },
            "tickMark": {
                "showDirection": false,
                "direction": 0,
                "strokeCount": 1,
                "typeOfMarker": 'crossbar',
                "thickness": 4
            }
        }
    });
})(window.MathUtilities);
