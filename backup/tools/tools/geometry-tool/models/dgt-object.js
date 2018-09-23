/* globals window, geomFunctions  */

(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Models.DgtObject = Backbone.Model.extend({
        "engine": null,
        "id": null,
        "equation": null,
        "properties": null,
        "binaryInvisibility": null,
        "INVALID": 2,
        "USER": 1,
        "HIDECROPPINGSOURCEIMAGE": 4,
        "GUARDIAN": 8,
        "ITERATION_POINTS": 16,
        "ITERATION_DEPTH": 32,
        "HIDEUNUSEDMARKING": 64,
        "SOURCE_AVATAR_HIDDEN": 128,
        "VISIBILITY_UNIVERSE": 256,
        "SYSTEM": 512,
        "ITERATION_OVERLAPPED": 1024,
        //TEST normal force should be mutually exclusive
        "TRAVEL_TEST": 1,
        "TRAVEL_NORMAL": 2,
        "TRAVEL_FORCE": 4,
        "TRAVEL_WARP": 8,

        "initialize": function() {
            var options = arguments[0];
            this._universe = options && options.universe ? options.universe : null;
            this.properties = {};
            this.restlessColor = '#936ad1';
            this._incinerated = false;
        },

        "setEngine": function(engine) {
            this.engine = engine;
        },


        "setProperties": function(inheritProp) {
            var key = this.division === 'measurement' ? this.division : this.species,
                looper, defaultProperties,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;

            if (DgtEngine.restoreKind) {

                this.setProperty('color', this.properties.color);
                this.setProperty('labelText', this.properties.labelText);
                this.setProperty('labelPosition', this.properties.labelPosition);
                this.setProperty('binaryInvisibility', this.properties.binaryInvisibility);
                this.setProperty('labelTextOriginal', this.properties.labelTextOriginal);
                this.setProperty('bannerPosition', this.properties.bannerPosition);
                this.updateLabelVisibility(this.properties.labelVisibility);
                this.setProperty('isInActiveMarking', this.properties.isInActiveMarking);
                this.setProperty('labelType', this.properties.labelType);
                this.setProperty('precision', this.properties.precision);
                this.setProperty('isMarkedAnchor', this.properties.isMarkedAnchor);
                this.setProperty('strokeStyle', this.properties.strokeStyle);
                this.setProperty('locked', this.properties.locked);

            } else {
                defaultProperties = this.engine.defaultProperties[key];
                this.setProperty('binaryInvisibility', defaultProperties.binaryInvisibility);
                if (this._stateOfMind === 'restless') {
                    this.setProperty('color', this.restlessColor);
                } else {
                    this.setProperty('color', defaultProperties.color);
                }
                if (typeof this.properties.labelText !== 'undefined') {
                    this.setProperty('labelText', this.properties.labelText);
                }
                if (typeof this.properties.labelTextOriginal !== 'undefined') {
                    this.setProperty('labelTextOriginal', this.properties.labelTextOriginal);
                }
                if (this.species === 'parameter') {
                    this.properties.labelType = 'current-label';
                } else {
                    this.properties.labelType = defaultProperties.labelType;
                }
                this.properties.labelPosition = {
                    "relativePosition": {}
                };
                this.properties.labelVisibility = defaultProperties.labelVisibility;
                this.properties.isInActiveMarking = defaultProperties.isInActiveMarking;
                this.properties.precision = defaultProperties.precision;
                this.properties.isMarkedAnchor = defaultProperties.isMarkedAnchor;
                this.properties.strokeStyle = defaultProperties.strokeStyle;
                this.properties.locked = defaultProperties.locked;
            }

            if (inheritProp) {
                for (looper in inheritProp) {
                    this.setProperty(looper, inheritProp[looper]);
                }
            }

        },

        "searchZombies": function(previousPath, zombies) {
            var looper, path = previousPath + '>' + this.id;

            for (looper in this._childrenRelationships) {
                if (this._childrenRelationships[looper]._incinerated) {
                    zombies.push(path + this._childrenRelationships[looper].id + '**');
                } else {
                    this._childrenRelationShips[looper].offspring.searchZombies(path, zombies);
                }
            }
        },
        "getCreationMethod": function() {
            return this._creationMethod;
        },
        "deletePrefixedString": function(propertyValue) {
            if (propertyValue) {
                if (propertyValue.substring(0, 1) === '$') {
                    propertyValue = propertyValue.slice(1, propertyValue.length);
                }
                return propertyValue;
            }
        },

        "setSerialNumber": function() {
            var DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;
            if (!DgtEngine.restoreKind || DgtEngine.restoreKind === DgtEngine.ACTION_SAVE_RESTORE &&
                !DgtEngine.serialNumberPresentInData) {
                this.serialNumber = DgtEngine.allEntitiesCount.serialNumber;
                DgtEngine.allEntitiesCount.serialNumber++;
            }
        },
        //......fix the repetitive calls
        "createDescriptionString": function() {
            // Used for object tab description.
            var creationMethod,
                descString = '',
                parents, shape1, shape2,
                elementData, label, str1, str2, i,
                measureStringStart = 'This value measures the ',
                sources, predefinedShape,
                entityName = this.equation.getLabelData().text,
                species = this.species,
                len, creatorAnchor,
                creatorParams, engine = this.engine,
                predefinedShapesDescriptionMap = {
                    "isoscelesTriangle": "an Isosceles triangle.",
                    "equilateralTriangle": "an Equilateral triangle.",
                    "square": "the Square.",
                    "rectangle": "the Rectangle.",
                    "parallelogram": "the Parallelogram.",
                    "pentagon": "the Pentagon.",
                    "hexagon": "the Hexagon."
                };
            if (this.getCreationMethod) {
                creationMethod = this.getCreationMethod();
            }
            if (entityName && entityName.length > 20) { // Maximum length of label..
                entityName = entityName.slice(0, 20) + '...';
            }
            if (!creationMethod) {
                if (species === 'annotation') {
                    descString = 'This drawing is independent: its appearance does not depend on other objects.';
                } else if (species === 'image' && species === 'text') {
                    descString = 'This picture is independent: its appearance does not depend on other objects.';
                } else {
                    if (species === 'point') {
                        len = this._childrenRelationships.length;
                        for (i = 0; i < len; i++) {
                            predefinedShape = predefinedShapesDescriptionMap[this._childrenRelationships[i].species];
                            if (predefinedShape) {
                                break;
                            }
                        }
                        if (predefinedShape) {
                            descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' is vertex of ' + predefinedShape;
                        } else {
                            descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' is an independent object.';
                        }
                    }
                }
            } else {
                sources = this.creator.sources;
                elementData = this.getCreationMethodAndLabel(sources);
                creatorParams = this.creator.getParams();
                creatorAnchor = this.creator.anchor;

                if (creationMethod === 'natural') {
                    switch (species) {
                        case 'segment':
                            descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' connects ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label + ' and ' + elementData[1].sourceCreationMethod + ' ' + elementData[1].label;
                            break;
                        case 'ray':
                            descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' passes from ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label + ' through ' + elementData[1].sourceCreationMethod + ' ' + elementData[1].label;
                            break;
                        case 'line':
                            descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' passes through ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label + ' and ' + elementData[1].sourceCreationMethod + ' ' + elementData[1].label;
                            break;
                        case 'arc':
                            descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' is the arc from ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label + ' through ' + elementData[1].sourceCreationMethod + ' ' + elementData[1].label + ' to ' + elementData[2].sourceCreationMethod + ' ' + elementData[2].label;
                            break;
                        case 'parabola':
                            descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' is having focus at ' + elementData[1].sourceCreationMethod + ' ' + elementData[1].label + ' and passes through ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label;
                            break;
                        case 'hyperbola':
                        case 'ellipse':
                            descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' is having foci at ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label + ' and ' + elementData[1].sourceCreationMethod + ' ' + elementData[1].label + ' and passes through ' + elementData[2].sourceCreationMethod + ' ' + elementData[2].label;
                            break;
                        case 'measureLength':
                        case 'measureCircumference':
                        case 'measureArea':
                        case 'measureRadius':
                        case 'measureArcAngle':
                        case 'measureArcLength':
                            label = this.getStringToDisplay(sources[0]);
                            descString = measureStringStart + species.replace('measure', '').toLowerCase() + ' of ' + label;
                            break;
                        case 'measureCoordinate':
                            label = this.getStringToDisplay(sources[0]);
                            descString = measureStringStart + species.replace('measure', '').toLowerCase() + 's of ' + label;
                            break;
                        case 'measureEquation':
                        case 'measureSlope':
                            label = this.getStringToDisplay(sources[0]);
                            descString = measureStringStart + species.replace('measure', '').toLowerCase() + ' of ' + label;
                            break;

                        case 'measureRatio':
                            str1 = this.getLabel(sources[0]);
                            str2 = this.getLabel(sources[1]);
                            descString = measureStringStart + '  segment length ratio  ' + str1 + '/' + str2;
                            break;
                        case 'measureCoordinateDistance':
                            str1 = sources[0].equation.getLabelData().text;
                            str2 = sources[1].equation.getLabelData().text;
                            descString = measureStringStart + ' ' + species.replace('measure', '').toLowerCase() + ' from ' + str1 + ' to ' + str2;
                            break;
                        case 'measurePointLineDistance':
                            str1 = this.getLabel(sources[0]);
                            str2 = this.getLabel(sources[1]);
                            descString = measureStringStart + ' Perpendicular distance from point ' + str1 + ' to extension of ' + str2;
                            //......Arc on circle.

                            break;
                        case 'measureAngle':
                            label = this.getLabel(sources[0]) + '-' + this.getLabel(sources[1]) + '-' + this.getLabel(sources[2]);
                            descString = measureStringStart + species.replace('measure', '').toLowerCase() + ' ' + label;
                            break;
                        case 'measureRayAngle':
                        case 'measureSegmentAngle':
                            if (sources[0].getCreationMethod() === 'natural' && sources[1].getCreationMethod() === 'natural') {
                                shape1 = sources[0].creator.sources;
                                shape2 = sources[1].creator.sources;
                                label = this.getUniqueLabel(shape1[0], shape1[1], shape2[0], shape2[1]);
                            } else {
                                label = this.getLabel(sources[0]);
                                label += '-' + this.getLabel(sources[1]);
                            }
                            descString = measureStringStart + species.replace('measure', '').toLowerCase() + ' ' + label;
                            break;
                        case 'withPoints':
                            if (species === 'circle') {
                                descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' is centered at ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label + ' and passes through ' + elementData[1].sourceCreationMethod + ' ' + elementData[1].label;
                            } else if (species === 'point') {
                                descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' is vertex of ' + predefinedShapesDescriptionMap[this.creator.species];
                            }
                            break;
                        case 'circleWithRadius':
                            descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' is centered at ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label + ' with radius equal in length to ' + elementData[1].sourceCreationMethod + ' ' + elementData[1].label;
                            break;
                        case 'perpendicular':
                        case 'parallel':
                            parents = sources.slice();
                            parents.push(creatorAnchor);
                            elementData = this.getCreationMethodAndLabel(parents);
                            descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' is ' + creationMethod + ' to ' + elementData[1].sourceCreationMethod + ' ' + elementData[1].label + ' passing through ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label;
                            break;
                        case 'midpoint':
                            elementData = this.getCreationMethodAndLabel(sources);
                            descString = creationMethod.charAt(0).toUpperCase() + creationMethod.substring(1) + ' ' + entityName + ' is the MidPoint of ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label;
                            break;
                        case 'bisector':
                            elementData = this.getCreationMethodAndLabel(sources);
                            descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' bisects angle ' + elementData[0].label + '-' + elementData[1].label + '-' + elementData[2].label;
                            break;
                        case 'rayBisector':
                        case 'segmentBisector':
                            parents = sources[0].creator.sources;
                            if (sources[0].creator.sources[0] === sources[1].creator.sources[0] || sources[0].creator.sources[1] === sources[1].creator.sources[0]) {
                                parents.push(sources[1].creator.sources[1]);
                            } else {
                                parents.push(sources[1].creator.sources[0]);
                            }
                            elementData = this.getCreationMethodAndLabel(parents);
                            descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' bisects angle ' + elementData[0].label + '-' + elementData[1].label + '-' + elementData[2].label;
                            break;
                        case 'perpendicularBisector':
                            elementData = this.getCreationMethodAndLabel(sources);
                            descString = 'Perpendicular Bisector ' + entityName + ' bisects ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label;
                            break;
                        case 'lineIntersection':
                        case 'lineCircleIntersection':
                        case 'circleIntersection':
                            elementData = this.getCreationMethodAndLabel(sources);
                            elementData[0].sourceCreationMethod = elementData[0].sourceCreationMethod.replace('circleWithPoints', 'Circle');
                            elementData[1].sourceCreationMethod = elementData[1].sourceCreationMethod.replace('circleWithPoints', 'Circle');
                            descString = 'Intersection ' + entityName + ' is the intersection of ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label + ' and ' + elementData[1].sourceCreationMethod + ' ' + elementData[1].label;
                            break;
                        case 'translate':
                            elementData = this.getCreationMethodAndLabel(sources);
                            if (creatorParams.coordinateSystem !== 'polar') {
                                if (typeof creatorParams.dx === 'object') {

                                    descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' is the translation of ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label + ' by vector ' + engine.generateLabel(creatorParams.dx, creatorParams.dx.creator.sources[0]) + ' ->' + engine.generateLabel(creatorParams.dx, creatorParams.dx.creator.sources[1]);
                                } else {
                                    descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' is the translation of ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label + ' by ' + creatorParams.dx + ' units horizontally and ' + creatorParams.dy + ' units vertically.';
                                }
                            } else {

                                if (typeof creatorParams.angle === 'object') {
                                    str1 = engine.generateLabel(creatorParams.angle, creatorParams.angle.creator.sources);
                                    if (str1.charAt(0) === 'm') {
                                        str1 = str1.substring(1);
                                    }
                                    str1 = str1.replace('\\angle', 'angle');
                                    descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' is the translation of ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label + ' by ' + creatorParams.r + ' units at ' + str1;
                                } else {
                                    descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' is the translation of ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label + ' by ' + creatorParams.r + ' units at ' + creatorParams.angle + ' degrees.';
                                }
                            }
                            break;
                        case 'rotate':
                            parents = sources.slice();
                            parents.push(creatorAnchor);
                            elementData = this.getCreationMethodAndLabel(parents);


                            if (typeof creatorParams.angle === 'object') {
                                str1 = engine.generateLabel(creatorParams.angle, creatorParams.angle.creator.sources);
                                if (str1.charAt(0) === 'm') {
                                    str1 = str1.substring(1);
                                }
                                str1 = str1.replace('\\angle', 'angle');
                                descString = species.charAt(0).toUpperCase() + species.substring(1) + entityName + ' is the rotation of ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label + ' by ' + str1 + ' about center ' + elementData[1].sourceCreationMethod + ' ' + elementData[1].label;
                            } else {
                                descString = species.charAt(0).toUpperCase() + species.substring(1) + entityName + ' is the rotation of ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label + ' by ' + creatorParams.angle + ' degrees about center ' + elementData[1].sourceCreationMethod + ' ' + elementData[1].label;
                            }
                            break;
                        case 'dilate':
                            parents = sources.slice();
                            parents.push(creatorAnchor);
                            elementData = this.getCreationMethodAndLabel(parents);

                            if (typeof creatorParams.ratio === 'object') {
                                descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' is the dilation of ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label + ' by ' + engine.generateLabel(creatorParams.ratio, creatorParams.ratio.creator.sources[0]) + '/' + engine.generateLabel(creatorParams.ratio, creatorParams.ratio.creator.sources[1]) + ' about center ' + elementData[1].sourceCreationMethod + ' ' + elementData[1].label;
                            } else {
                                descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' is the dilation of ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label + ' by ' + creatorParams.ratio * 100 + '% about center ' + elementData[1].sourceCreationMethod + ' ' + elementData[1].label;
                            }
                            break;
                        case 'reflect':
                            parents = sources.slice();
                            parents.push(creatorAnchor);
                            elementData = this.getCreationMethodAndLabel(parents);

                            descString = species.charAt(0).toUpperCase() + species.substring(1) + ' ' + entityName + ' is the reflection of ' + elementData[0].sourceCreationMethod + ' ' + elementData[0].label + ' across mirror ' + elementData[1].sourceCreationMethod + elementData[1].label;
                            break;
                    }
                }
            }
            return descString;
        },
        "setProperty": function(propertyName, propertyValue) {
            var labelData, DgtObject = MathUtilities.Tools.Dgt.Models.DgtObject,
                $measureView,
                engine = this.engine,
                division = this.division,
                equation = this.equation,
                properties = this.properties,
                restrictions = DgtObject.restrictToProperties[division],
                index;

            if (restrictions && restrictions.indexOf(propertyName) === -1) {
                return;
            }
            switch (propertyName) {
                case 'color':
                    properties.color = propertyValue;
                    if (division === 'measurement') {
                        $measureView = this.$measureView;
                        if ($measureView) {
                            $measureView.css({
                                "color": propertyValue
                            });
                            $measureView.find('.parameter.dgt-measurement-value').css({
                                "color": propertyValue,
                                "border-color": propertyValue
                            });
                        }

                    } else if (division === 'iteration') {
                        this.distributeProperty(propertyName, propertyValue);
                    } else {
                        equation.setColor(propertyValue);
                        equation.trigger('change-color');
                    }
                    break;
                case 'thickness':
                    properties.thickness = propertyValue;
                    equation.thickness = propertyValue;
                    break;
                case 'labelVisibility':
                    labelData = equation.getLabelData();
                    if (labelData.labelObject) {
                        labelData.labelObject.visible = propertyValue;
                        engine.grid.refreshView();
                    }
                    break;
                case 'labelText':
                case 'labelTextOriginal':

                    labelData = equation.getLabelData();
                    if (propertyValue) {
                        if (propertyName === 'labelText') {
                            propertyValue = this.deletePrefixedString(propertyValue);
                            labelData.text = propertyValue;
                            if (labelData.labelObject) {
                                labelData.labelObject.content = propertyValue;
                            }
                        }
                        if (division === 'measurement') {
                            this.trigger('update-banner-label');
                        }
                    }
                    break;
                case 'labelPosition':
                    labelData = equation.getLabelData();
                    labelData.position = propertyValue;
                    break;
                case 'binaryInvisibility':
                    properties.binaryInvisibility = propertyValue;
                    this.trigger('show-hide-measurement');
                    break;
                case 'isInActiveMarking':
                    properties.isInActiveMarking = propertyValue;
                    break;
                case 'bannerPosition':
                    properties.bannerPosition = propertyValue;
                    break;
                case 'labelType':
                    properties.labelType = propertyValue;
                    break;
                case 'precision':
                    properties.precision = propertyValue;
                    break;
                case 'isMarkedAnchor':
                    properties.isMarkedAnchor = propertyValue;
                    break;
                case 'strokeStyle':
                    properties.strokeStyle = propertyValue;
                    this.setStrokeStyle(propertyValue);
                    break;
                case 'locked':
                    properties.locked = propertyValue;
                    if (division === 'measurement') {
                        engine.dgtUI.disableOrEnableDragingOfMeasurementDivs(propertyValue, this);
                    } else if (this.division === 'iteration') {
                        this.distributeProperty(propertyName, propertyValue);
                    }
                    index = this.engine.locked.indexOf(this);
                    if (propertyValue && index === -1) {
                        this.engine.locked.push(this);
                    } 
                    else if(!propertyValue && index > -1) {
                        this.engine.locked.splice(index, 1);
                    }
                    this.engine._updateDrawableColor(this);
                    break;
            }
        },
        "setStrokeStyle": function(style) {
            if (this.division !== 'shape') {
                return;
            }
            var path, count, length, childArray,
                equation = this.equation;
            if (style) {
                equation.dashedGraph();

                //experimental
                equation.setThickness(1);

                path = equation.getPathGroup();
                if (!path) {
                    return;
                }
                childArray = path.children;
                length = childArray.length;

                if (path) {
                    for (count = 0; count < length; count++) {
                        path = childArray[count];
                        if (path.hit === true) {
                            continue;
                        }
                        path.strokeWidth = 1;
                    }
                }

            }
        },
        "changeObjectVisibility": function(bVisible, reason) {
            var child, previousVisibility, inheritVisiblityType = [this.INVALID, this.GUARDIAN],
                looper, mentors, creator = this.creator,
                properties = this.properties,
                engine = this.engine,
                grid = this.engine.grid;
            if (bVisible === false && reason === this.USER) {
                if (!engine.hideUserMap[engine.userId]) {
                    engine.hideUserMap[engine.userId] = [];
                }
                engine.hideUserMap[engine.userId].push(this);
            }
            if (inheritVisiblityType.indexOf(reason) > 1 && bVisible === true) {
                if (creator) {
                    for (looper in creator.sources) {
                        if (inheritVisiblityType.indexOf(creator.sources[looper].properties.binaryInvisibility) > -1) {
                            return;
                        }
                    }
                    mentors = creator.getMentorMarking();
                    for (looper in mentors) {
                        if (inheritVisiblityType.indexOf(mentors.properties.binaryInvisibility) > -1) {
                            return;
                        }
                    }
                    if (creator.anchor && inheritVisiblityType.indexOf(creator.anchor.properties.binaryInvisibility) > -1) {
                        return;
                    }
                }
            }
            //invert flag represents similarity, if similar return
            if (Boolean(properties.binaryInvisibility & reason) !== bVisible) {
                return;
            }
            geomFunctions.traceConsole('Object: Changing visibility of flag ' + reason + ' to ' + bVisible);
            grid.restrainViewRefreshByModule('object_' + this.id + '.changeVisibility');

            previousVisibility = properties.binaryInvisibility;
            if (bVisible) {
                properties.binaryInvisibility = properties.binaryInvisibility & ~reason;
                if (properties.binaryInvisibility === 0 && previousVisibility !== 0) {
                    this.setVisibility(properties.binaryInvisibility, reason);
                }
                if (this._childrenRelationships && [this.ITERATION_DEPTH, this.VISIBILITY_UNIVERSE, this.USER].indexOf(reason) === -1) {
                    for (child = 0; child < this._childrenRelationships.length; child++) {
                        reason = this._childrenRelationships[child].offspring.properties.binaryInvisibility;
                        if (this._childrenRelationships[child].offspring) {
                            this._childrenRelationships[child].offspring.changeObjectVisibility(bVisible, reason);
                        }

                    }
                }

            } else {
                properties.binaryInvisibility = properties.binaryInvisibility | reason;
                if (properties.binaryInvisibility !== 0 && previousVisibility === 0) {
                    this.setVisibility(properties.binaryInvisibility, reason);
                }
            }
            if (reason === this.GUARDIAN || reason === this.INVALID || reason > this.SYSTEM) {
                if (this.species === 'vector' && bVisible === false && this.markView) {
                    this.markView.removeMarkedPaths();
                }
                if (this._menteeRelations) {
                    for (child = 0; child < this._menteeRelations.length; child++) {
                        reason = this._menteeRelations[child].getBinaryMappingOfParent(this);

                        if (this._menteeRelations[child].offspring) {
                            this._menteeRelations[child].offspring.changeObjectVisibility(bVisible, reason);
                        }
                    }
                }
                if (this._childrenRelationships) {
                    for (child = 0; child < this._childrenRelationships.length; child++) {
                        reason = this._childrenRelationships[child].getBinaryMappingOfParent(this);
                        //condition since offspring is not defined at times; since offspring is created on mouse move.
                        if (this._childrenRelationships[child].offspring) {
                            this._childrenRelationships[child].offspring.changeObjectVisibility(bVisible, reason);
                        }
                    }
                }
            }

            grid.freeViewRefreshByModule('object_' + this.id + '.changeVisibility');

            return;


        },
        "setVisibility": function(bVisible, reason) {

            var engine = this.engine,
                division = this.division,
                equation = this.equation,
                index = engine.hiddenObjects.indexOf(this),
                imageIndex,
                visibility = bVisible === 0;

            if (division === 'measurement') {
                this.trigger('show-hide-measurement');
            } else if (division === 'iteration') {
                this.distributeUniverseVisibility(visibility);
            } else if (division === 'notation') {
                this.changeNotationVisibility(visibility);
            } else {
                if (equation) {
                    equation.changeVisibility(visibility);
                }
            }

            if (visibility) {

                if (typeof this.properties.labelVisibility !== 'undefined') {
                    this.setProperty('labelVisibility', this.properties.labelVisibility);
                }
                if (index !== -1) {
                    engine.hiddenObjects.splice(index, 1);
                }
                if (reason === 1) {
                    //preventing lock creation from here...assuming that visibility true will be set by showAllHidden then no need to create prison
                    engine._select(this, null, null, true);
                }

            } else {
                if (typeof this.properties.labelVisibility !== 'undefined') {
                    this.setProperty('labelVisibility', false);
                }
                if (division === 'image' && engine.transform) {
                    engine.transform.removeTransformation();
                    imageIndex = engine.selected.indexOf(this);
                    if (imageIndex > -1) {
                        engine.selected.splice(imageIndex, 1);
                    }
                }
                if (reason === 1) {
                    engine.hiddenObjects.push(this);
                }
            }
            engine.grid.refreshView();
        }
    }, {
        "restrictToProperties": {
            "iteration": ["binaryInvisibility", "color", "locked"]
        },

        "createUpdateData": function() {

            var updateData = {
                "clone": function() {
                    var c = {},
                        looper;
                    for (looper in this) {
                        c[looper] = this[looper];
                    }
                    return c;
                }
            };

            updateData.seed = null;
            updateData.genesis = null;
            updateData.caller = null;
            updateData.newPosition = null;
            updateData.dx = null;
            updateData.dy = null;
            updateData.relocatedEntities = null;
            updateData.noBroadcast = null;
            updateData.forceDrawing = null;
            updateData.modifyAttributes = null;

            return updateData;
        },

        "createRelocateDataObject": function() {

            var saveDataOnRelocateObject = {
                "clone": function() {
                    var c = {},
                        looper;
                    for (looper in this) {
                        c[looper] = this[looper];
                    }
                    return c;
                }
            };

            saveDataOnRelocateObject.equation = null;
            saveDataOnRelocateObject.delX = null;
            saveDataOnRelocateObject.delY = null;
            saveDataOnRelocateObject.position = null;
            saveDataOnRelocateObject.actionName = null;
            saveDataOnRelocateObject.selectionEntity = null;
            saveDataOnRelocateObject.eventName = null;

            return saveDataOnRelocateObject;
        },


        "createPostDragDataObject": function() {

            var postDragDataObject = {
                "clone": function() {
                    var c = {},
                        looper;
                    for (looper in this) {
                        c[looper] = this[looper];
                    }
                    return c;
                }
            };

            postDragDataObject.equation = null;
            postDragDataObject.deltaX = null;
            postDragDataObject.deltaY = null;
            postDragDataObject.position = null;
            postDragDataObject.forceDrawing = null;
            postDragDataObject.eventName = null;

            return postDragDataObject;


        }

    });
})(window.MathUtilities);
