/* globals window */

(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt = MathUtilities.Tools.Dgt || {};
    MathUtilities.Tools.Dgt.Models = MathUtilities.Tools.Dgt.Models || {};
    MathUtilities.Tools.Dgt.Views = MathUtilities.Tools.Dgt.Views || {};
    MathUtilities.Tools.Dgt.templates = MathUtilities.Tools.Dgt.templates || {};

    MathUtilities.Tools.Dgt.Models.DgtUiModel = Backbone.Model.extend({

        "dgtPopUpView": null,
        "basepath": null,
        "buttonBuildData": null,
        "wasInSnapGridMode": null,
        "lastGridPattern": null,
        "toolButtonsActionMap": null,
        "directiveToIndexMap": null,
        "menubarLastState": null,
        "previousRadioBtnState": null,
        "radioBtnLatestState": null,
        "defaultMenuBarState": null,
        "lastDirective": null,
        "currentRadioButtontype": null,
        "engine": null,
        "propertiesBar": null,
        "defaultOperation": null,
        "dgtPaperScope": null,
        "animationView": null,
        "dgtMenuView": null,
        "data": null,
        "footerTooltipPosition": -35,
        "colorPatternObj": null,
        "colors": null,
        "construct_menu": [{
            "text": null,
            "id": 'connectSegment',
            "data": {}
        }, {
            "text": null,
            "id": 'connectRay',
            "data": {}
        }, {
            "text": null,
            "id": 'connectLine',
            "data": {}
        }, {
            "text": null,
            "id": 'parallel',
            "data": {}
        }, {
            "text": null,
            "id": 'perpendicular',
            "data": {}
        }, {
            "text": null,
            "id": 'perpendicularBisector',
            "data": {}
        }, {
            "text": null,
            "id": 'angleBisector',
            "data": {}
        }, {
            "text": false
        }, {
            "text": null,
            "id": 'connectCircleWithPoints',
            "data": {}
        }, {
            "text": null,
            "id": 'connectcircleWithRadius',
            "data": {}
        }, {
            "text": null,
            "id": 'connectArcOnCircle',
            "data": {}
        }, {
            "text": null,
            "id": 'connectArc',
            "data": {}
        }, {
            "text": false
        }, {
            "text": null,
            "id": 'connectPointOnObject',
            "data": {}
        }, {
            "text": null,
            "id": 'connectMidpoint',
            "data": {}
        }, {
            "text": null,
            "id": 'connectIntersection',
            "data": {}
        }, {
            "text": null,
            "id": 'constructInterior',
            "data": {}
        }],
        "transform_menu": [{
            "text": null,
            "id": 'markCenter',
            "data": {}
        }, {
            "text": null,
            "id": 'markMirror',
            "data": {}
        }, {
            "text": null,
            "id": 'markAngle',
            "data": {}
        }, {
            "text": null,
            "id": 'markRatio',
            "data": {}
        }, {
            "text": null,
            "id": 'markVector',
            "data": {}
        }, {
            "text": null,
            "id": 'markDistance',
            "data": {}
        }, {
            "text": null,
            "id": 'unmarkAll',
            "data": {}
        }, {
            "text": false
        }, {
            "text": null,
            "id": 'rotate',
            "data": {}
        }, {
            "text": null,
            "id": 'translate',
            "data": {}
        }, {
            "text": null,
            "id": 'dilate',
            "data": {}
        }, {
            "text": null,
            "id": 'reflect',
            "data": {}
        }, {
            "text": null,
            "id": 'iterate',
            "data": {}
        }, {
            "text": null,
            "id": 'iterateToDepth',
            "data": {}
        }],
        "measure_menu": [{
            "text": null,
            "id": 'measureAngle',
            "data": {}
        }, {
            "text": null,
            "id": 'measureLength',
            "data": {}
        }, {
            "text": null,
            "id": 'measureSlope',
            "data": {}
        }, {
            "text": null,
            "id": 'measureRadius',
            "data": {}
        }, {
            "text": null,
            "id": 'measureArea',
            "data": {}
        }, {
            "text": null,
            "id": 'measurePerimeter',
            "data": {}
        }, {
            "text": null,
            "id": 'measureEquation',
            "data": {}
        }, {
            "text": null,
            "id": 'measurePointLineDistance',
            "data": {}
        }, {
            "text": null,
            "id": 'measureCoordinate',
            "data": {}
        }, {
            "text": null,
            "id": 'measureCoordinateDistance',
            "data": {}
        }, {
            "text": null,
            "id": 'measureCircumference',
            "data": {}
        }, {
            "text": null,
            "id": 'measureArcAngle',
            "data": {}
        }, {
            "text": null,
            "id": 'measureArcLength',
            "data": {}
        }, {
            "text": null,
            "id": 'measureRatio',
            "data": {}
        }],
        "display_menu": [{
            "text": null,
            "id": 'showHideLabels',
            "data": {}
        }, {
            "text": null,
            "id": 'properties',
            "data": {}
        }],
        "initialize": function(basepath, data) {
            var subIndices, i;
            this.basepath = basepath;
            this.data = data;
            this.defaultOperation = 'cursor';
            this.lastGridPattern = 'squareGrid';
            this.wasInSnapGridMode = false;
            this.buttonBuildData = [{
                "toolId": 'cursor',
                "align": 'left',
                "tooltip": null
            }, {
                "toolId": 'point',
                "align": 'left',
                "tooltip": null
            }, {
                "toolId": 'straightObj',
                "align": 'left',
                "tooltip": null,
                "popupMenuOptions": ['line', 'ray', 'segment'],
                "screenId": 'straightObjPopup',
                "popupMenu": [{
                    "id": 'line',
                    "toolTip": null
                }, {
                    "id": 'ray',
                    "toolTip": null
                }, {
                    "id": 'segment',
                    "toolTip": null
                }]
            }, {
                "toolId": 'shapes',
                "align": 'left',
                "tooltip": null,
                "popupMenuOptions": ['iso-triangle', 'equi-triangle', 'rectangle', 'square', 'parallelogram', 'pentagon', 'hexagon'],
                "screenId": 'shapesPopup',
                "popupMenu": [{
                    "id": 'stroke-shape-for-shapes',
                    "text": null,
                    "tool": 'stroke',
                    "name": 'shape-types',
                    "selected": true,
                    "type": 'radio-btn',
                    "group": 'property'
                }, {
                    "name": 'vertical',
                    "type": 'separator',
                    "group": 'property'
                }, {
                    "id": 'fill-shape-for-shapes',
                    "text": null,
                    "tool": 'fill',
                    "name": 'shape-types',
                    "selected": false,
                    "type": 'radio-btn',
                    "group": 'property'
                }, {
                    "name": 'vertical',
                    "type": 'separator',
                    "group": 'property'
                }, {
                    "id": 'both-shape-for-shapes',
                    "text": null,
                    "tool": 'both',
                    "name": 'shape-types',
                    "selected": false,
                    "type": 'radio-btn',
                    "group": 'property'
                }, {
                    "name": 'horizontal',
                    "type": 'separator'
                }, {
                    "id": 'iso-triangle',
                    "text": null,
                    "group": "section"
                }, {
                    "id": 'equi-triangle',
                    "text": null,
                    "group": "section"
                }, {
                    "id": 'rectangle',
                    "text": null,
                    "group": "section"
                }, {
                    "id": 'square',
                    "text": null,
                    "group": "section"
                }, {
                    "id": 'parallelogram',
                    "text": null,
                    "group": "section"
                }, {
                    "id": 'pentagon',
                    "text": null,
                    "group": "section"
                }, {
                    "id": 'hexagon',
                    "text": null,
                    "group": "section"
                }]

            }, {
                "toolId": 'conics',
                "align": 'left',
                "tooltip": null,
                "popupMenuOptions": ['circle', 'ellipse', 'parabola', 'hyperbola'],
                "screenId": 'conicsPopup',
                "popupMenu": [{
                    "id": 'stroke-shape-for-conics',
                    "text": null,
                    "tool": 'stroke',
                    "name": 'conic-types',
                    "selected": true,
                    "type": 'radio-btn',
                    "group": 'property'
                }, {
                    "name": 'vertical',
                    "type": 'separator',
                    "group": 'property'
                }, {
                    "id": 'fill-shape-for-conics',
                    "text": null,
                    "tool": 'fill',
                    "name": 'conic-types',
                    "selected": false,
                    "type": 'radio-btn',
                    "group": 'property'
                }, {
                    "name": 'vertical',
                    "type": 'separator',
                    "group": 'property'
                }, {
                    "id": 'both-shape-for-conics',
                    "text": null,
                    "tool": 'both',
                    "name": 'conic-types',
                    "selected": false,
                    "type": 'radio-btn',
                    "group": 'property'
                }, {
                    "name": 'horizontal',
                    "type": 'separator'
                }, {
                    "id": 'circle',
                    "text": null,
                    "group": 'section'
                }, {
                    "id": 'ellipse',
                    "text": null,
                    "group": 'section'
                }, {
                    "id": 'parabola',
                    "text": null,
                    "group": 'section'
                }, {
                    "id": 'hyperbola',
                    "text": null,
                    "group": 'section'
                }]
            }, {
                "toolId": 'polygon',
                "align": 'left',
                "tooltip": null,
                "noSubType": true,
                "screenId": 'polygonPopup',
                "popupMenu": [{
                    "id": 'stroke-shape-for-polygon',
                    "text": null,
                    "tool": 'stroke',
                    "name": 'polygon-types',
                    "selected": true,
                    "type": 'radio-btn',
                    "group": "property"
                }, {
                    "name": 'vertical',
                    "type": 'separator',
                    "group": 'property'
                }, {
                    "id": 'fill-shape-for-polygon',
                    "text": null,
                    "tool": 'fill',
                    "name": 'polygon-types',
                    "selected": false,
                    "type": 'radio-btn',
                    "group": "property"
                }, {
                    "name": 'vertical',
                    "type": 'separator',
                    "group": 'property'
                }, {
                    "id": 'both-shape-for-polygon',
                    "text": null,
                    "tool": 'both',
                    "name": 'polygon-types',
                    "selected": false,
                    "type": 'radio-btn',
                    "group": "property"
                }]
            }, {
                "toolId": 'insert-text',
                "align": 'left',
                "tooltip": null,
                "hideSelection": false
            }, {
                "toolId": 'marker',
                "align": 'left',
                "tooltip": null,
                "popupMenuOptions": ['pencil', 'thick-pen'],
                "popupMenu": [{
                    "id": 'pencil',
                    "toolTip": null
                }, {
                    "id": 'thick-pen',
                    "toolTip": null
                }]
            }, {
                "toolId": 'grid',
                "align": 'left',
                "tooltip": null,
                "hideSelection": true,
                "exploreOnClick": true,
                "popupMenuOptions": ['no-grid', 'square-grid', 'polar-grid', 'snap-to-grid'],
                "screenId": 'gridPopup',
                "popupMenu": [{
                    "id": 'no-grid',
                    "toolTip": null
                }, {
                    "id": 'square-grid',
                    "toolTip": null
                }, {
                    "id": 'polar-grid',
                    "toolTip": null
                }, {
                    "id": 'snap-to-grid',
                    "text": null,
                    "type": 'check-box'
                }]
            }, {
                "toolId": 'image',
                "align": 'left',
                "tooltip": null
            }, {
                "toolId": 'lockPanel',
                "align": 'left',
                "tooltip": null,
                "exploreOnClick": true,
                "hideSelection": true,
                "popupMenuOptions": ['hide-shape', 'unhide-shape', 'lock-shape', 'unlock-shape', 'unlockAll-shape'],
                "screenId": 'lockPanelPopup',
                "popupMenu": [{
                    "id": 'hide-shape',
                    "text": null
                }, {
                    "id": 'unhide-shape',
                    "text": null
                }, {

                    "name": 'horizontal',
                    "type": 'separator'
                }, {
                    "id": 'lock-shape',
                    "text": null
                }, {
                    "id": 'unlock-shape',
                    "text": null
                }, {
                    "id": 'unlockAll-shape',
                    "text": null
                }]
            }, {
                "toolId": 'number-menu',
                "align": 'left',
                "tooltip": null,
                "preventOnMoreClick": true,
                "hideSelection": true,
                "popupMenuOptions": ['calculate', 'new-param'],
                "screenId": 'number-menuPopup',
                "popupMenu": [{
                    "id": 'calculate',
                    "toolTip": null
                }, {
                    "id": 'new-param',
                    "toolTip": null
                }]
            }, {
                "toolId": 'edit',
                "align": 'left',
                "tooltip": null,
                "preventOnMoreClick": true,
                "hideSelection": true,
                "popupMenuOptions": ['cut', 'copy', 'paste'],
                "screenId": "editPopup",
                "popupMenu": [{
                    "id": 'cut',
                    "toolTip": null
                }, {
                    "id": 'copy',
                    "toolTip": null
                }, {
                    "id": 'paste',
                    "toolTip": null
                }]
            }, {
                "seperator": 'right'
            }, {
                "toolId": 'undo',
                "align": 'right',
                "hideSelection": true,
                "tooltip": null
            }, {
                "toolId": 'redo',
                "align": 'right',
                "hideSelection": true,
                "tooltip": null
            }, {
                "seperator": 'right'
            }, {
                "toolId": 'refresh',
                "align": 'right',
                "hideSelection": true,
                "tooltip": {
                    "text": null,
                    "align": 'right'
                }
            }];
            this.colors = ["#5d99eb", "#000", "#bf6cea", "#f85580", "no-color"];
            this.colorPatternObj = {
                "stroke": {
                    "on": false
                },
                "fill": {
                    "on": true,
                    "color": this.colors[1],
                    "index": 1
                }
            };
            this.defaultMenuBarState = {
                "selectedMenuIndex": 0,
                "selectedSubMenuIndices": [-1, -1, 0, 6, 6, -1, -1, 0, 0, -1, 0, 0, 0]
            };

            this.previousRadioBtnState = {
                "shape-types": "stroke",
                "conic-types": "stroke",
                "polygon-types": "stroke"
            };
            this.radioBtnLatestState = {
                "shape-types": "stroke",
                "conic-types": "stroke",
                "polygon-types": "stroke"
            };
            this.currentRadioButtontype = 'shape-types';

            this.menubarLastState = {
                "selectedMenuIndex": this.defaultMenuBarState.selectedMenuIndex,
                "selectedSubMenuIndices": []
            };
            this.menubarCurrentState = {
                "selectedMenuIndex": this.defaultMenuBarState.selectedMenuIndex,
                "selectedSubMenuIndices": []
            };
            subIndices = this.defaultMenuBarState.selectedSubMenuIndices;
            for (i = 0; i < subIndices.length; i++) {
                this.menubarLastState.selectedSubMenuIndices.push(subIndices[i]);
                this.menubarCurrentState.selectedSubMenuIndices.push(subIndices[i]);

            }
            this.previousMenubarState = [];
            this.toolButtonsActionMap = {
                "0": {
                    "-1": 'selectCursor'
                },
                "1": {
                    "-1": 'drawPoint'
                },
                "2": {
                    "0": 'drawLine',
                    "1": 'drawRay',
                    "2": 'drawSegment'
                },
                "3": {
                    "6": 'drawIsoscelesTriangle',
                    "7": 'drawEquilateralTriangle',
                    "8": 'drawRectangle',
                    "9": 'drawSquare',
                    "10": 'drawParallelogram',
                    "11": 'drawPentagon',
                    "12": 'drawHexagon'
                },
                "4": {
                    "6": 'drawCircleWithPoints',
                    "7": 'drawEllipse',
                    "8": 'drawParabola',
                    "9": 'drawHyperbola'
                },
                "5": {
                    "-1": 'drawPolygon'
                },
                "6": {
                    "-1": 'addText'
                },
                "7": {
                    "0": 'pencilAnnotation',
                    "1": 'penAnnotation'
                },
                "8": {
                    "0": 'noGrid',
                    "1": 'squareGrid',
                    "2": 'polarGrid',
                    "3": 'snapToGrid'
                },
                "9": {
                    "-1": 'addImage'
                },
                "10": {
                    "0": 'hideObjects',
                    "1": 'showAllHidden',
                    "3": 'lockObject',
                    "4": 'unlock',
                    "5": 'unlockAll'
                },
                "11": {
                    "0": 'calculator',
                    "1": 'parameter'
                },
                "12": {
                    "0": 'cut',
                    "1": 'copy',
                    "2": 'paste'
                },
                "14": {
                    "-1": 'undo'
                },
                "15": {
                    "-1": 'redo'
                },
                "17": {
                    "-1": 'resetBoard'
                }
            };

            this.radioBtnActionMap = {
                "3": 'shape-types',
                "4": 'conic-types',
                "5": 'polygon-types'
            };
            this.keyCodeMap = {
                "NUMBER_0": 48,
                "NUMBER_1": 49,
                "NUMBER_7": 55,
                "NUMBER_9": 57,

                "ALPHABET_A": 65,
                "ALPHABET_B": 66,
                "ALPHABET_C": 67,
                "ALPHABET_D": 68,
                "ALPHABET_E": 69,
                "ALPHABET_F": 70,
                "ALPHABET_G": 71,
                "ALPHABET_H": 72,
                "ALPHABET_I": 73,
                "ALPHABET_J": 74,
                "ALPHABET_K": 75,
                "ALPHABET_L": 76,
                "ALPHABET_M": 77,
                "ALPHABET_P": 80,
                "ALPHABET_R": 82,
                "ALPHABET_S": 83,
                "ALPHABET_T": 84,
                "ALPHABET_V": 86,
                "ALPHABET_X": 88,
                "ALPHABET_Z": 90,

                "NUMPAD_ZERO": 96,
                "NUMPAD_NINE": 105,

                "SPECIAL_KEY_BACKSPACE": 8,
                "SPECIAL_KEY_TAB": 9,
                "SPECIAL_KEY_ENTER": 13,
                "SPECIAL_KEY_ESCAPE": 27,
                "SPECIAL_KEY_DELETE": 46,
                "SPECIAL_KEY_NUMPADPLUS": 107,
                "SPECIAL_KEY_NUMPADMINUS": 109,
                "SPECIAL_KEY_NUMPAD_DIVIDE": 111,
                "SPECIAL_KEY_EQUAL": 187,
                "SPECIAL_KEY_MINUS": 189,
                "SPECIAL_KEY_PERIOD": 190,
                "SPECIAL_KEY_FRWD_SLASH": 191,
                "SPECIAL_KEY_MINUS_MOZ": 173,
                "SPECIAL_KEY_LEFT_ARROW": 37,
                "SPECIAL_KEY_UP_ARROW": 38,
                "SPECIAL_KEY_RIGHT_ARROW": 39,
                "SPECIAL_KEY_DOWN_ARROW": 40,
                "SPECIAL_KEY_EQUAL_MOZ": 61,
                "SPECIAL_KEY_SPACE": 32,
                "SPECIAL_KEY_BACKSLASH": 220,
                "SPECIAL_KEY_CARET_SIGN": 54
            };
            this.menuIndexMap = {
                "SELECT": 0,
                "POINT": 1,
                "LINE": 2,
                "SHAPES": 3,
                "CONICS": 4,
                "POLYGON": 5,
                "TEXT": 6,
                "MARKER": 7,
                "GRID": 8,
                "IMAGE": 9,
                "SHOWALLHIDDEN": 10,
                "NUMBER": 11,
                "EDIT": 12,
                "UNDO": 14,
                "REDO": 15,
                "RESET": 17
            };
            this.directiveToSubMenuIndexMap = {
                "cut": 0,
                "copy": 1,
                "paste": 2,
                "hideObjects": 0,
                "showAllHidden": 1,
                "lockObject": 3,
                "unlock": 4,
                "unlockAll": 5
            };
            this.tooltipData = [{
                "id": 'delete-btn',
                "text": null
            }, {
                "id": 'math-utilities-properties-collapse-button',
                "text": null,
                "align": 'right'
            }, {
                "id": 'math-tool-btn-help-8',
                "text": null
            }, {
                "id": 'math-tool-btn-restore-8',
                "text": null
            }, {
                "id": 'math-tool-btn-hide-8',
                "text": null
            }, {
                "id": 'math-tool-btn-close-8',
                "text": null
            }, {
                "id": 'math-tool-btn-save-8',
                "text": null,
                "position": 'top'
            }, {
                "id": 'math-tool-btn-open-8',
                "text": null,
                "position": 'top'
            }, {
                "id": 'math-tool-btn-screenshot-8',
                "text": null,
                "position": 'top'
            }, {
                "id": 'math-tool-btn-zoomin-8',
                "position": 'top',
                "text": null
            }, {
                "id": 'math-tool-btn-zoomdefault-8',
                "position": 'top',
                "text": null
            }, {
                "id": 'math-tool-btn-zoomout-8',
                "position": 'top',
                "text": null
            }, {
                "id": 'math-tool-btn-print-8',
                "text": null,
                "position": 'top'
            }, {
                "id": 'image-crop-btn',
                "text": null
            }, {
                "id": 'image-crop-yes-btn',
                "text": null
            }, {
                "id": 'image-crop-cancel-btn',
                "text": null
            }];
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
                classObj = ['construct_menu', 'transform_menu', 'measure_menu', 'display_menu', 'tooltipData'],
                staticObj = ['footerTooltip', 'pluralSpecieTextMapping', 'measureSpecie', 'textMapping', 'measurementLabelMap',
                    'propertyPopupMap', 'dropDownListMap', 'popupTitleMapping', 'canvasAccText'
                ],
                curObj = null,
                tooltipObj = null,
                tooltipObjPath = null,
                popupMenuObj = null,
                curPopObj = null;

            accManager.loadScreen("dgt-ui-model");

            //view object
            for (curObj in classObj) {
                for (elem in this[classObj[curObj]]) {
                    setText(classObj[curObj] + "-" + this[classObj[curObj]][elem].id, this[classObj[curObj]][elem], "text");
                }
            }

            //static object
            for (curObj in staticObj) {
                for (elem in MathUtilities.Tools.Dgt.Models.DgtUiModel[staticObj[curObj]]) {
                    setText(staticObj[curObj] + "-" + elem, MathUtilities.Tools.Dgt.Models.DgtUiModel[staticObj[curObj]], elem);
                }
            }

            //buttonBuildData object
            for (curObj in this.buttonBuildData) {
                if (typeof this.buttonBuildData[curObj].tooltip === "object") {
                    if (this.buttonBuildData[curObj].tooltip === null) {
                        tooltipObjPath = 'tooltip';
                        tooltipObj = this.buttonBuildData[curObj];
                    } else {
                        tooltipObjPath = 'text';
                        tooltipObj = this.buttonBuildData[curObj].tooltip;
                    }
                    setText("menubar-" + this.buttonBuildData[curObj].toolId, tooltipObj, tooltipObjPath);
                }

                //set pop-up object
                if (typeof this.buttonBuildData[curObj].popupMenu === "object") {
                    for (curPopObj in this.buttonBuildData[curObj].popupMenu) {
                        popupMenuObj = this.buttonBuildData[curObj].popupMenu[curPopObj];
                        if (popupMenuObj.hasOwnProperty('text') || popupMenuObj.hasOwnProperty('toolTip')) {
                            tooltipObjPath = popupMenuObj.text === null ? 'text' : 'toolTip';
                            setText('menubar-' + popupMenuObj.id, popupMenuObj, tooltipObjPath);
                        }
                    }
                }
            }
        }
    }, { //STATIC
        "fromKeyEvent": null,
        "footerTooltip": {
            "connectSegment-hover": null,
            "connectRay-hover": null,
            "connectLine-hover": null,
            "perpendicularBisector-hover": null,
            "angleBisector-hover": null,
            "connectCircleWithPoints-hover": null,
            "connectcircleWithRadius-hover": null,
            "connectArc-hover": null,
            "connectPointOnObject-hover": null,
            "connectMidpoint-hover": null,
            "connectArcOnCircle-hover": null,
            "connectIntersection-hover": null,
            "constructInterior-hover": null,
            "parallel-hover": null,
            "perpendicular-hover": null,

            "markCenter-hover": null,
            "markMirror-hover": null,
            "markAngle-hover": null,
            "markRatio-hover": null,
            "markVector-hover": null,
            "markDistance-hover": null,
            "rotate-hover": null,
            "translate-hover": null,
            "dilate-hover": null,
            "reflect-hover": null,
            "iterateToDepth-hover": null,
            "iterate-hover": null,
            "measureAngle-hover": null,
            "measureLength-hover": null,
            "measureSlope-hover": null,
            "measureRadius-hover": null,
            "measureArea-hover": null,
            "measurePerimeter-hover": null,
            "measureEquation-hover": null,
            "measurePointLineDistance-hover": null,
            "measureCoordinate-hover": null,
            "measureCoordinateDistance-hover": null,
            "measureCircumference-hover": null,
            "measureArcAngle-hover": null,
            "measureArcLength-hover": null,
            "measureRatio-hover": null,

            "showHideLabels-hover": null,
            "properties-hover": null,
            "hideObjects-hover": null,
            "calculator-measurement": null,

            "cursor-hover": null,
            "point-hover": null,
            "shape-hover": null,
            "straightObj-hover": null,
            "conics-hover": null,
            "text-hover": null,
            "marker-hover": null,
            "pencil-hover": null,
            "thick-pen-hover": null,
            "image-hover": null,
            "lockPanel-hover": null,
            "hide-shape-hover": null,
            "lock-shape-hover": null,
            "unhide-shape-hover": null,
            "unlock-shape-hover": null,
            "grid-hover": null,
            "no-grid-hover": null,
            "square-grid-hover": null,
            "polar-grid-hover": null,
            "snap-to-grid-hover": null,
            "show-all-hidden-hover": null,
            "number-menu-hover": null,
            "calculate-hover": null,
            "new-param-hover": null,
            "edit-hover": null,
            "cut-hover": null,
            "copy-hover": null,
            "paste-hover": null,
            "undo-hover": null,
            "redo-hover": null,
            "refresh-hover": null,
            "color-hover": null,
            "delete-hover": null,
            "stroke-hover": null,
            "fill-hover": null,
            "both-hover": null,

            "cursor-shape": null,
            "cursor-shape-deselected": null,
            "cursor-shape-with-label-deselected": null,
            "cursor-shape-with-label": null,
            "cursor-annotation": null,
            "cursor-annotation-deselected": null,
            "cursor-image": null,
            "cursor-text": null,
            "cursor-image-deselected": null,
            "cursor-text-deselected": null,
            "cursor-point": null,
            "cursor-point-deselected": null,
            "cursor-point-with-label": null,
            "cursor-point-with-label-deselected": null,
            "point-point": null,
            "shape-point": null,
            "point-shape": null,
            "shape-shape": null,
            "cursor-grid": null,
            "point-grid": null,
            "shape-grid": null,
            "text-tool-grid": null,
            "annotation-shape": null,
            "annotation-grid": null,
            "annotation-point": null,
            "cursor-leave": null,
            "crop-hover": null,
            "crop-cancel-hover": null,
            "crop-ok-hover": null,
            "cursor-properties-popup": null,
            "cursor-calculator": null,
            "cursor-label": null,
            "cursor-image-resize": null,
            "cursor-image-rotate": null,
            "cursor-text-rotate": null,
            "cursor-edit-parameter": null,
            "parameter": null
        },
        "canvasAccText": {
            "canvas-enter": null,
            "entity-hovered": null,
            "rotate-handle-hovered": null,
            "resize-handle-hovered": null,
            "point-placed": null,
            "post-relocate": null,
            "point-coordinate": null,
            "entity-selected": null,
            "iterate-entity-hover": null,
            "calculate-entity-hover": null,
            "entity-created": null,
            "measure-hovered": null
        },
        "pluralSpecieTextMapping": { //Localization changes
            "point": null,
            "circle": null,
            "calculation": null,
            "line": null,
            "arc": null,
            "segment": null,
            "ray": null,
            "parabola": null,
            "hyperbola": null,
            "ellipse": null,
            "image": null,
            "text": null,
            "picture": null,
            "drawing": null,
            "annotation": null,
            "iteration": null,
            "interior": null,
            "polygoninterior": null,
            "circleinterior": null,
            "ellipseinterior": null,
            "polygonInterior": null,
            "circleInterior": null,
            "ellipseInterior": null,
            "arcSegmentInterior": null,
            "measureCoordinate": null,
            "measurePointLineDistance": null,
            "measureLength": null,
            "measureCoordinateDistance": null,
            "measureSlope": null,
            "measureIteration": null,
            "table": null,
            "measureEquation": null,
            "measureAngle": null,
            "measureRadius": null,
            "measureArea": null,
            "measureCircumference": null,
            "measureArcAngle": null,
            "measureArcLength": null,
            "measureRatio": null,
            "measurePerimeter": null,
            "parallel": null,
            "perpendicular": null,
            "straightObj": null,
            "perpendicularBisector": null,
            "equation": null,
            "coordinate": null,
            "ratio": null,
            "distance": null,
            "slope": null,
            "angle": null,
            "area": null,
            "parameter": null,
            "intersection": null,
            "object": null,
            "straightobj": null,
            "conics": null,
            "shapes": null,
            "tickMark": null,
            "angleMark": null,
            "iterate": null,
            "axis": null,
            "bisector": null
        },
        "measureSpecie": { //Localization changes
            "coordinate": null,
            "ratio": null,
            "distance": null,
            "slope": null,
            "equation": null,
            "angle": null,
            "area": null,
            "parameter": ' ',
            "calculation": ' ',
            "table": null
        },
        "textMapping": { //Localization changes
            "isvertexof": null,
            "isanindependantobject": null,
            "connects": null,
            "and": null,
            "passesfrom": null,
            "is": null,
            "through": null,
            "passesthrough": null,
            "andpassesthrough": null,
            "isthearcfrom": null,
            "ishavingfocusat": null,
            "of": null,
            "segmentlengthratio": null,
            "from": '  ',
            "to": '  ',
            "angleMark": null,
            "tickMark": null,
            "unmark": null,
            "unmarkCenter": null,
            "unmarkMirror": null,
            "perpendiculardistancefrompoint": null,
            "toextensionof": null,
            "iscenteredat": null,
            "withradiusequalinlengthto": null,
            "isthemidpointof": null,
            "bisectsangle": null,
            "bisects": null,
            "parameter": null,
            "istheintersectionof": null,
            "measurements": null,
            "objects": null,
            "isthetranslation": null,
            "byvector": null,
            "by": null,
            "unitshorizontallyand": null,
            "unitsvertically": null,
            "unitsat": null,
            "degrees": null,
            "istherotationof": null,
            "aboutcenter": null,
            "degreesaboutcenter": null,
            "isthedilationof": null,
            "isthereflectionof": null,
            "acrossmirror": null,
            "natural": null,
            "measureAngle": null,
            "measureRayAngle": null,
            "measureSegmentAngle": null,
            "withPoints": null,
            "withSegments": null,
            "parabolaDirectrix": null,
            "interior": null,
            "multipleObjects": null,
            "midpoint": null,
            "bisector": null,
            "rayBisector": null,
            "segmentBisector": null,
            "lineIntersection": null,
            "lineCircleIntersection": null,
            "circleIntersection": null,
            "translate": null,
            "rotate": null,
            "dilate": null,
            "iteration": null,
            "reflect": null,
            "point": null,
            "circle": null,
            "calculation": null,
            "line": null,
            "arc": null,
            "segment": null,
            "ray": null,
            "parabola": null,
            "directrix": null,
            "hyperbola": null,
            "ellipse": null,
            "image": null,
            "text": null,
            "iso-triangle": null,
            "isoscelesTriangle": null,
            "equilateralTriangle": null,
            "equi-triangle": null,
            "rectangle": null,
            "square": null,
            "parallelogram": null,
            "pentagon": null,
            "hexagon": null,
            "polygonInterior": null,
            "ellipseInterior": null,
            "circleInterior": null,
            "arcSegmentInterior": null,
            "axis": null,


            "measureCoordinate": null,
            "measurePointLineDistance": null,
            "measureLength": null,
            "measureCoordinateDistance": null,
            "measureSlope": null,
            "measureEquation": null,
            "measureIteration": null,
            "measureRadius": null,
            "measureArea": null,
            "measureCircumference": null,
            "measureArcAngle": null,
            "measureArcLength": null,
            "measureRatio": null,
            "measurePerimeter": null,
            "parallel": null,
            "perpendicular": null,
            "perpendicularBisector": null,
            "intersection": null,
            "annotation": null,
            "circleWithPoints": null,
            "circleWithRadius": null,
            "circleWithSegment": null,
            "polygon": null,
            "select": null,
            "deselect": null,
            "measurement": null,
            "noteDataInIterate": null,
            "touchDeviceDataHolderInIterate": null,
            "dataHolderInIterate": null,
            "titleForIterateMappingColumn": null,
            "firstImage": null,
            "preImage": null,
            "straightObj": null,
            "shapes": null,
            "conics": null,
            "questionMark": null,
            "emptyTranslationValue": null,
            "nonNumericTranslationValue": null,
            "canNotDilateZeroValue": null,
            "canNotDilateInfiniteValue": null,
            "numberOfIteration": null,
            "noNewImages": null,
            "textForIterateToDepth": null,
            "iterate": null
        },
        "measurementLabelMap": {
            "m": null,
            "perimeter": null,
            "area": null,
            "circumference": null,
            "length": null,
            "radius": null,
            "distance": null,
            "slope": null,
            "pointLineDistanceSelfLabel": null,
            "pointLineDistanceParentLabel": null
        },
        "propertyPopupMap": {
            "title": null
        },
        "dropDownListMap": {
            "string": ""
        },
        "popupTitleMapping": {
            "label": null,
            "propertiesOf": null,
            "hide": null,
            "editCalculation": null,
            "newParameter": null,
            "newCalculation": null
        },
        "colorHexCodeMapping": {
            "stroke-color-blue": "#5d99eb",
            "stroke-color-black": "#424242",
            "stroke-color-violet": "#bf6cea",
            "stroke-color-red": "#f85580"
        }
    });
})(window.MathUtilities);
