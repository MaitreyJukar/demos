/* globals _, $, window, geomFunctions   */

(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Models.DgtMeasurement = MathUtilities.Tools.Dgt.Models.DgtDrawable.extend({
        "value": null,
        "equation": null,
        "bannerContent": '',
        "selected": false,
        "species": null,
        "_incinerated": null,
        "_menteeRelations": null,
        "labelingParents": [],
        "_followers": [],
        "_idol": [],

        "initialize": function() {

            MathUtilities.Tools.Dgt.Models.DgtMeasurement.__super__.initialize.apply(this, arguments);
            this.division = 'measurement';

            //...... specie name as per nature of measurement
            this.equation.setParent(this);
            this.labelingParents = [];
            this.equation.setDraggable(true);

            this.onDrag = _.bind(function(newPosition) {
                this.dragging = false;
                this.engine.deselectAll();
                this.engine._select(this);
                this.trigger('relocated', newPosition);
            }, this);

            this.onPreRelocate = _.bind(function() {
                this.dragging = false;
            }, this);
        },

        "init": function(species, engine) {
            var DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                measureCount = DgtEngine.entityCount.measures,
                ALPHABET_COUNT = 26,
                ALPHA_SMALL_A = 97;
            this.species = species;
            this.engine = engine;
            if (!DgtEngine.restoreKind) {
                this.id = DgtEngine.getIdForEntity(this);
                this.equation.getLabelData().text = Math.floor(measureCount / ALPHABET_COUNT) === 0 ?
                    String.fromCharCode(measureCount % ALPHABET_COUNT + ALPHA_SMALL_A) :
                    String.fromCharCode(measureCount % ALPHABET_COUNT + ALPHA_SMALL_A) + Math.floor(measureCount / ALPHABET_COUNT);
                this.properties.labelCount = measureCount;
                MathUtilities.Tools.Dgt.Models.DgtEngine.entityCount.measures++;
            }
            this.setSerialNumber();
            this.equation.depthLevel = this.serialNumber;
            this._setType();
        },

        "forgetMenteeRelation": function(relation) {
            var index = this._menteeRelations.indexOf(relation);
            if (index > -1) {
                this._menteeRelations.splice(index, 1);
            }
        },

        "toString": function() {
            return ' ' + this.id + ':' + this.getDisplayedLabel();
        },

        "_setType": function() {
            var key, measurementTypeMapping = MathUtilities.Tools.Dgt.Models.DgtMeasurement.measurementTypeMapping;

            for (key in measurementTypeMapping) {
                if ($.inArray(this.species, measurementTypeMapping[key]) > -1) {
                    this.type = key;
                }
            }
        },
        "updateCalculationValue": function() {
            var inputRef, objIndex, count;
            inputRef = this.creator.getParams().inputReference.slice();
            objIndex = this.creator.getParams().objectIndexInInputReference;
            for (count in objIndex) {
                inputRef[objIndex[count]] = this.getEntityFromSources(inputRef[objIndex[count]]);
            }
            this.value = this.engine.dgtCalculatorManager.recalculateAnswer({
                "inputReference": inputRef,
                "answer": this.value
            });
        },
        "getEntityFromSources": function(id) {
            var loopVar, curSource;
            if (this.creator) {
                for (loopVar in this.creator.sources) {
                    curSource = this.creator.sources[loopVar];
                    if (curSource.id === id) {
                        return curSource;
                    }
                }
            }
            return this.engine.getEntityFromId(id);

        },
        "renderMeasurement": function(species, engine, directive, parameters) {
            var updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
            if (directive === 'parameter') {

                this.init(species, engine);

                this.setProperties();

                if (parameters.label !== 't' + (this.engine.parameterCount - 1)) {
                    this.properties.labelText = '$' + parameters.label;
                } else {
                    this.properties.labelText = parameters.label;
                }

                this.updateParameterLabelText();

                if (parameters.value === '') {
                    this.value = (1).toFixed(2);
                } else {
                    this.value = Number(parameters.value);
                }

                this.properties.labelType = 'current-label';

                this.engine.acknowledgeEntity(this);

                new MathUtilities.Tools.Dgt.Views.DgtMeasurement({
                    "model": this
                });

            } else if (this.species === 'calculation') {

                this.properties.labelTextOriginal = parameters.latex.slice();
                this.value = parameters.answer;

            } else if (!this._universe) {
                this.updateOriginalLabelText();
            }
            if (!this._universe) {
                if (MathUtilities.Tools.Dgt.Models.DgtEngine.restoreKind) {
                    updateDataObject.modifyAttributes = ['label', 'value'];
                } else {
                    this.trigger('update-banner-label');
                }
            }
            this.update(updateDataObject);


        },

        "getMeasurementValue": function() {
            return '(' + this.value + ')';
        },
        "updateOriginalLabelText": function() {

            var creator = this.creator,
                orderLabel = '',
                labels = [],
                latex, latex2, shape1, shape2, perimeterText, areaText,
                slopeText, radiusText, circumferenceText, lengthText, replaceWord, mText,
                measurementLableMap, pointLineDistanceSelfLabelText, pointLineDistanceParentLabelText,
                label, creationMethod = this.getCreationMethod(),
                labelData,
                NO_OF_POINTS = 4,
                sources = creator.sources,
                MathInput = MathUtilities.Tools.Dgt.Models.MathInput;
            measurementLableMap = MathUtilities.Tools.Dgt.Models.DgtUiModel.measurementLabelMap;
            replaceWord = MathUtilities.Components.Utils.Models.Utils.replaceWords;
            mText = measurementLableMap.m;
            labelData = this.constructOriginalLabel(creator);
            orderLabel = labelData[0];
            labels = labelData[1];
            orderLabel = MathInput.updateMeasurementLabelLatex(orderLabel);
            if (labels[0]) {
                labels[0] = MathInput.updateMeasurementLabelLatex(labels[0]);
            }
            if (labels[1]) {
                labels[1] = MathInput.updateMeasurementLabelLatex(labels[1]);
            }
            switch (this.species) {

                case 'measureCoordinate':
                    label = orderLabel;
                    break;

                case 'measurePointLineDistance':
                    pointLineDistanceSelfLabelText = replaceWord(measurementLableMap.pointLineDistanceSelfLabel, labels[0], labels[1]);
                    if (creator.sources[1].showParentLabel()) {
                        latex = this.getLatexEquivalent(sources[1].species);
                        pointLineDistanceParentLabelText = replaceWord(measurementLableMap.pointLineDistanceParentLabel, labels[0], latex, labels[1]);
                        label = pointLineDistanceParentLabelText;
                    } else {
                        label = pointLineDistanceSelfLabelText;
                    }
                    break;

                case 'measureLength':
                    if (sources[0].showParentLabel()) {
                        label = mText + '\\thinspace{}\\overline{' + orderLabel + '}';
                    } else {
                        label = orderLabel;
                    }
                    break;
                case 'measureCoordinateDistance':
                    label = orderLabel;
                    break;

                case 'measureSlope':
                    slopeText = measurementLableMap.slope;
                    if (sources[0].showParentLabel()) {
                        latex = this.getLatexEquivalent(sources[0].species);
                        label = slopeText + '\\thinspace{}' + latex + '{' + orderLabel + '}';
                    } else {
                        label = slopeText + '\\thinspace{}' + orderLabel;
                    }
                    break;

                case 'measureEquation':
                    if (sources[0].showParentLabel()) {
                        latex = this.getLatexEquivalent(creator.sources[0].species);
                        label = latex + '{' + orderLabel + '}';
                    } else {
                        label = orderLabel;
                    }
                    break;

                case 'measureAngle':

                    if ((creationMethod === 'measureSegmentAngle' || creationMethod === 'measureRayAngle') && (sources[0].getCreationMethod() === 'natural' && sources[1].getCreationMethod() === 'natural')) {
                        shape1 = sources[0].creator.sources;
                        shape2 = sources[1].creator.sources;
                        orderLabel = this.getUniqueLabel(shape1[0], shape1[1], shape2[0], shape2[1]);
                        orderLabel = orderLabel.replace(/-/gi, '');
                        orderLabel = MathInput.updateMeasurementLabelLatex(orderLabel);
                    }

                    label = mText + '\\angle{' + orderLabel + '}';
                    break;

                case 'measureRadius':
                    radiusText = measurementLableMap.radius;
                    if (sources[0].showParentLabel()) {
                        latex = this.getLatexEquivalent(sources[0].species);
                        if (sources[0].species === 'arc') {
                            label = radiusText + '\\thinspace{}' + latex + '{' + orderLabel + '}';
                        } else {
                            label = radiusText + '\\thinspace{}' + latex + orderLabel;
                        }
                    } else {
                        label = radiusText + '\\thinspace{}' + orderLabel;
                    }
                    break;

                case 'measureArea':

                    areaText = measurementLableMap.area;
                    if (creator.sources[0].species === 'polygonInterior' && creator.sources[0].equation.getPoints().length === NO_OF_POINTS) { // NO_OF_POINTS to check if polygon is triangle
                        label = areaText + '\\thinspace{}\\triangle\\thinspace{}' + orderLabel;
                    } else if (sources[0].showParentLabel()) {
                        latex = this.getLatexEquivalent(creator.sources[0].species);
                        label = areaText + '\\thinspace{}' + latex + orderLabel;
                    } else {
                        label = areaText + '\\thinspace{}' + orderLabel;
                    }
                    break;
                case 'measurePerimeter':
                    perimeterText = measurementLableMap.perimeter;
                    if (creator.sources[0].species === 'polygonInterior' && creator.sources[0].equation.getPoints().length === NO_OF_POINTS) { // NO_OF_POINTS to check if polygon is triangle
                        label = perimeterText + '\\thinspace{}\\triangle\\thinspace{}' + orderLabel;
                    } else if (sources[0].showParentLabel()) {
                        latex = this.getLatexEquivalent(creator.sources[0].species);
                        label = perimeterText + '\\thinspace{}' + latex + orderLabel;
                    } else {
                        label = perimeterText + '\\thinspace{}' + orderLabel;
                    }
                    break;


                case 'measureCircumference':
                    circumferenceText = measurementLableMap.circumference;
                    if (sources[0].showParentLabel()) {
                        latex = this.getLatexEquivalent(sources[0].species);
                        label = circumferenceText + '\\thinspace{}' + latex + orderLabel;
                    } else {
                        label = circumferenceText + '\\thinspace{}' + orderLabel;
                    }
                    break;
                case 'measureArcLength':
                    lengthText = measurementLableMap.length;
                    if (creator.sources[0].showParentLabel()) {
                        label = lengthText + '\\thinspace{}\\widehat{' + orderLabel + '}';
                    } else {
                        label = lengthText + '\\thinspace{}' + orderLabel;
                    }
                    break;
                case 'measureArcAngle':
                    if (sources[0].showParentLabel()) {
                        label = mText + '\\thinspace{}\\widehat{' + orderLabel + '}';
                    } else {
                        label = orderLabel;
                    }
                    break;
                case 'calculation':
                    label = this.properties.labelTextOriginal;
                    break;
                case 'measureRatio':
                    if (creator.sources[0].showParentLabel() || this.creator.sources[1].showParentLabel()) {
                        latex = this.getLatexEquivalent(creator.sources[0].species);
                        latex2 = this.getLatexEquivalent(creator.sources[0].species);
                        if (creator.sources[0].showParentLabel() && creator.sources[1].showParentLabel()) {
                            label = '\\frac{' + mText + '\\thinspace{}' + latex + '{' + labels[0] + '}}{' + mText + '\\thinspace{}' + latex2 + '{' + labels[1] + '}}';
                        } else if (creator.sources[0].showParentLabel()) {
                            label = '\\frac{' + mText + '\\thinspace{}' + latex + '{' + labels[0] + '}}{' + mText + '\\thinspace{}' + labels[1] + '}';
                        } else {
                            label = '\\frac{' + mText + '\\thinspace{}' + labels[0] + '}{' + mText + '\\thinspace{}' + latex2 + '{' + labels[1] + '}}';
                        }
                    } else {
                        label = '\\frac{' + mText + '\\thinspace{}' + labels[0] + '}{' + mText + '\\thinspace{}' + labels[1] + '}';
                    }
                    break;


            }
            this.properties.labelTextOriginal = label;
            //Value is removed from next trigger because of JSHint Error.

        },
        "getLatexEquivalent": function(specie) {
            switch (specie) {
                case 'line':
                    return '\\overleftrightarrow';
                case 'segment':
                    return '\\overline';
                case 'ray':
                    return '\\overrightarrow';
                case 'circle':
                case 'circleInterior':
                    return '\\bigodot{}';
                case 'arc':
                    return '\\widehat';
                case 'polygonInterior':
                case 'ellipseInterior':
                    return '';
            }

        },
        "updateCustomLabelText": function() {
            var labelContent;
            MathUtilities.Tools.Dgt.Models.DgtEngine.measurementCustomLabelCount.nonParameterCount++;
            labelContent = 'm' + MathUtilities.Tools.Dgt.Models.DgtEngine.measurementCustomLabelCount.nonParameterCount;
            this.properties.labelText = labelContent;
            this.setProperty('labelText', labelContent);
        },
        "updateParameterLabelText": function() {
            if (this.properties.labelText.trim() === '') {
                var labelContent;
                MathUtilities.Tools.Dgt.Models.DgtEngine.measurementCustomLabelCount.parameterCount++;
                labelContent = 't' + MathUtilities.Tools.Dgt.Models.DgtEngine.measurementCustomLabelCount.parameterCount;
                this.properties.labelText = labelContent;
                this.setProperty('labelText', labelContent);
            }
        },
        "updateMeasureTitleText": function() {
            var titleId, label,
                LABEL_LENGTH_LIMIT = 20;
            if (this.properties.labelText) {
                label = this.deletePrefixedString(this.properties.labelText);
                if (label.length > LABEL_LENGTH_LIMIT) {
                    label = label.slice(0, LABEL_LENGTH_LIMIT) + '...';
                }
                titleId = ' ' + label;
                return titleId;
            }
            if (!this.properties.measurementTitleCount) {
                MathUtilities.Tools.Dgt.Models.DgtEngine.measurementCustomLabelCount.measurementTitleCount++;
                titleId = ' #' + MathUtilities.Tools.Dgt.Models.DgtEngine.measurementCustomLabelCount.measurementTitleCount;
                this.properties.measurementTitleCount = titleId;
            } else {
                titleId = this.properties.measurementTitleCount;
            }
            return titleId;
        },
        "updateParameterTitleText": function() {
            this.updateParameterLabelText();
            return ' ' + this.deletePrefixedString(this.properties.labelText);
        },
        "getDisplayedValueAsString": function() {
            // Here it is checking for string undefined...
            if (this.value === 'undefined') {
                return this.value;
            }
            var val;
            switch (this.species) {
                case 'measureCoordinate':
                    val = this.value.trim() + ')';
                    break;
                case 'measureEquation':
                    val = this.value;
                    break;
                default:
                    val = MathUtilities.Tools.Dgt.Models.DgtEngine.roundOff(this.value, 6).toString();
                    break;
            }
            return val;
        },
        "getDisplayedLabel": function() {
            if (this.properties.labelType === 'original-name') {
                return this.properties.labelTextOriginal;
            }
            if (this.properties.labelText) {
                return this.deletePrefixedString(this.properties.labelText);
            }
            if (this.division === 'measurement') {
                return this.properties.labelTextOriginal;
            }
        },
        //Checks if the measurement is equation or coordinate or not
        "isMeasurementAttribute": function() {
            return this.species === 'measureEquation' || this.species === 'measureCoordinate' || this.species === 'measureIteration';
        },

        "calculateValue": function(updateData) {
            var creator = this.creator,
                sourceData = [],
                precision, i, value, c, m, x1, y1,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                params, loopVar, sortedPoints = [],
                orderOfPoints, orderOfPointsLength, creationMethod = this.getCreationMethod(),
                inputRef, objIndex, count,
                movedParent, newPosition,
                MAX_POSSIBLE_VALUE = 1e5,
                NO_OF_POINTS;

            movedParent = updateData.caller;
            newPosition = updateData.newPosition;
            precision = 2;

            if (creator) {

                for (i = 0; i < creator.getSourceCount(); i++) {
                    sourceData[i] = DgtEngine.getDataOfEntity(creator.getSource(i), movedParent, newPosition);
                }

                params = creator.getParams();

            }

            switch (this.species) {
                case 'measureIteration':
                    if (creator.sources[0]._generations.length > 0) {
                        this.trigger('update-iteration-table', sourceData[0].generateMeasurementObject());
                    }
                    break;
                case 'measureCoordinate':
                    value = ' (' + (params.coordinateSystem === 'cartesian' ? DgtEngine.roundOffArray(sourceData[0], precision) :
                        DgtEngine.roundOffArray(geomFunctions.getPolarCoordinate(sourceData[0][0], sourceData[0][1], true), precision));
                    break;

                case 'measurePointLineDistance':
                    value = Math.abs(sourceData[1].a * sourceData[0][0] + sourceData[1].b * sourceData[0][1] + sourceData[1].c) / Math.sqrt(sourceData[1].a *
                        sourceData[1].a + DgtEngine.roundOff(sourceData[1].b * sourceData[1].b, precision));
                    break;

                case 'measureLength':
                    value = geomFunctions.distance2(sourceData[0].x1, sourceData[0].y1, sourceData[0].x2, sourceData[0].y2);
                    break;

                case 'measureCoordinateDistance':
                    value = geomFunctions.distance2(sourceData[0][0], sourceData[0][1], sourceData[1][0], sourceData[1][1]);
                    break;

                case 'measureSlope':
                    value = -(sourceData[0].a / sourceData[0].b);
                    //adding dumb value check...if it creates problems remove
                    if (!isFinite(value) || Math.abs(value) > MAX_POSSIBLE_VALUE) {
                        value = 'undefined';
                    }
                    break;

                case 'measureEquation':
                    y1 = DgtEngine.roundOff(sourceData[0].y1, precision);
                    x1 = DgtEngine.roundOff(sourceData[0].x1, precision);

                    m = DgtEngine.roundOff(-(sourceData[0].a / sourceData[0].b), precision);
                    c = DgtEngine.roundOff(y1 - m * x1, precision);
                    if (!isFinite(m) || Math.abs(m) > MAX_POSSIBLE_VALUE) {
                        value = 'x = ' + DgtEngine.roundOff(x1, precision);
                    } else if (m === 0) {
                        value = 'y = ' + c;
                    } else {
                        if (c < 0) {
                            value = 'y = ' + m + 'x - ' + Math.abs(c);
                        } else {
                            value = 'y = ' + m + 'x + ' + c;
                        }
                    }


                    break;

                case 'measureAngle':
                    NO_OF_POINTS = 2;
                    if (creationMethod === 'measureAngle') {

                        value = geomFunctions.smallerAngleBetweenPoints(sourceData[0][0], sourceData[0][1], sourceData[1][0], sourceData[1][1], sourceData[2][0], sourceData[2][1], true);
                        //on client demand
                        value = Math.abs(value);
                    } else if (creationMethod === 'measureMarkerAngle') {
                        value = geomFunctions.getArcAngle(sourceData[0]);
                        //on client demand
                        value = Math.abs(value);
                    } else if (creationMethod === 'measureSegmentAngle' || creationMethod === 'measureRayAngle') {

                        orderOfPoints = creator._params.orderOfPointsToFindAngle;
                        orderOfPointsLength = orderOfPoints.length;

                        for (loopVar = 0; loopVar < orderOfPointsLength; loopVar++) {
                            if (sortedPoints.length < NO_OF_POINTS) {
                                if (orderOfPoints[loopVar] === 0) {
                                    sortedPoints.push([sourceData[0].x1, sourceData[0].y1]);
                                } else {
                                    sortedPoints.push([sourceData[0].x2, sourceData[0].y2]);
                                }
                            } else {
                                if (orderOfPoints[loopVar] === 0) {
                                    sortedPoints.push([sourceData[1].x1, sourceData[1].y1]);
                                } else {
                                    sortedPoints.push([sourceData[1].x2, sourceData[1].y2]);
                                }
                            }
                        }

                        value = geomFunctions.smallerAngleBetweenPoints(sortedPoints[0][0], sortedPoints[0][1], sortedPoints[1][0], sortedPoints[1][1], sortedPoints[2][0], sortedPoints[2][1], true);
                        //on client demand
                        value = Math.abs(value);

                    }
                    break;

                case 'measureRadius':
                    value = sourceData[0].r;
                    break;

                case 'measureArea':
                    switch (creator.sources[0].species) {
                        case 'polygonInterior':
                            value = geomFunctions.areaOfIrregularPolygon(creator.sources[0].equation.getPoints());
                            break;
                        case 'arcSegmentInterior':
                            value = geomFunctions.areaOfArcSegment(creator.sources[0].seed);
                            break;
                        case 'ellipseInterior':
                            value = geomFunctions.areaOfEllipse(creator.sources[0].seed.a, creator.sources[0].seed.b);
                            break;
                        default:
                            value = sourceData[0].r * sourceData[0].r * Math.PI;
                            break;
                    }
                    break;
                case 'measureCircumference':
                    value = 2 * sourceData[0].r * Math.PI;
                    break;
                case 'measureArcAngle':
                    value = geomFunctions.getArcAngle(sourceData[0]);
                    value = Math.abs(value);
                    break;
                case 'measureArcLength':
                    value = Math.abs(geomFunctions.getArcAngle(sourceData[0], true)) * sourceData[0].r;
                    break;
                case 'calculation':
                    inputRef = creator.getParams().inputReference.slice();
                    objIndex = creator.getParams().objectIndexInInputReference;
                    for (count in objIndex) {
                        inputRef[objIndex[count]] = this.getEntityFromSources(inputRef[objIndex[count]]);
                    }
                    value = this.engine.dgtCalculatorManager.recalculateAnswer({
                        "inputReference": inputRef,
                        "answer": this.value
                    });
                    break;
                case 'parameter':
                    if (!this.value) {
                        value = this.engine._undergoingOperation.parameters.value;
                    } else {
                        value = this.value;
                    }
                    break;
                case 'measureRatio':
                    value = geomFunctions.distance2(sourceData[0].x1, sourceData[0].y1, sourceData[0].x2, sourceData[0].y2) / geomFunctions.distance2(sourceData[1].x1, sourceData[1].y1, sourceData[1].x2, sourceData[1].y2);
                    break;
                case 'measurePerimeter':
                    /*calculate perimeter*/
                    if (creator.sources[0].species === 'arcSegmentInterior') {
                        value = Math.abs(geomFunctions.getArcAngle(sourceData[0], true) * sourceData[0].r) + geomFunctions.distance2(sourceData[0].x1, sourceData[0].y1, sourceData[0].x3, sourceData[0].y3);
                    } else {
                        value = geomFunctions.calculatePerimeter(sourceData);
                    }
                    break;

            }
            if (isNaN(value) && ['measureEquation', 'measureCoordinate'].indexOf(this.species) === -1) {
                value = 'undefined';
            }

            return value;
        },

        "update": function(updateData) {
            var sourceData = [],
                i,
                updateLabel, updateValue,
                genesis = updateData.genesis,
                movedParent = updateData.caller,
                newPosition = updateData.newPosition,
                dx = updateData.dx,
                dy = updateData.dy,
                relocatedEntities = updateData.relocatedEntities,
                forceDrawing = updateData.forceDrawing,
                modifyAttributes = updateData.modifyAttributes,
                DgtObject = MathUtilities.Tools.Dgt.Models.DgtObject,
                updateDataObject = DgtObject.createUpdateData();

            if (!relocatedEntities) {
                relocatedEntities = [];

                if (!genesis) {
                    relocatedEntities.willUpdate = [];
                    //this means this is a internally generated call/ not called by parent
                    updateDataObject.genesis = this;
                    updateDataObject.forceDrawing = this.TRAVEL_TEST;
                    updateDataObject.willUpdate = relocatedEntities.willUpdate;
                    updateDataObject.modifyAttributes = modifyAttributes;
                    this.update(updateDataObject);
                }
            }
            if (relocatedEntities.indexOf(this) > -1) {
                return void 0;
            }
            relocatedEntities.push(this);

            if (modifyAttributes) {
                updateValue = modifyAttributes.indexOf('value') > -1;
                updateLabel = modifyAttributes.indexOf('label') > -1;
            } else {
                updateValue = true;
                updateLabel = false;
            }

            updateDataObject.genesis = genesis;
            updateDataObject.caller = movedParent;
            updateDataObject.newPosition = newPosition;
            updateDataObject.dx = dx;
            updateDataObject.dy = dy;
            updateDataObject.relocatedEntities = relocatedEntities;
            updateDataObject.forceDrawing = forceDrawing;
            updateDataObject.modifyAttributes = modifyAttributes;

            if (!(forceDrawing & this.TRAVEL_TEST)) {

                if (updateLabel) {
                    this.updateLabelText(null, null, false);
                    this.trigger('update-banner-label');
                }

                if (updateValue || this.species === 'measureIteration') {
                    this.value = this.calculateValue(updateDataObject);
                    this.trigger('update-banner-value', this.properties.precision);
                }
            }

            updateDataObject.caller = this;
            updateDataObject.newPosition = sourceData[0];
            updateDataObject.dx = NaN;
            updateDataObject.dy = NaN;

            for (i = 0; i < this._childrenRelationships.length; i++) {
                if (Boolean(forceDrawing & this.TRAVEL_WARP) ^ Boolean(this._childrenRelationships[i]._universe)) {
                    continue;

                }

                if (Boolean(forceDrawing & this.TRAVEL_WARP) && this._childrenRelationships[i]._universe !== genesis) {
                    //only update the relations that belong the genesis universe
                    continue;
                }
                this._childrenRelationships[i].moveRelatives(updateDataObject);
            }
            for (i = 0; i < this._menteeRelations.length; i++) {
                if (Boolean(forceDrawing & this.TRAVEL_WARP) ^ Boolean(this._menteeRelations[i]._universe)) {
                    continue;

                }

                if (Boolean(forceDrawing & this.TRAVEL_WARP) && this._menteeRelations[i]._universe !== genesis) {
                    //only update the relations that belong the genesis universe
                    continue;
                }
                this._menteeRelations[i].moveRelatives(updateDataObject);
            }
            for (i = 0; i < this._followers.length; i++) {
                if (Boolean(forceDrawing & this.TRAVEL_WARP) && this._followers[i]._universe !== genesis) {
                    //only update the relations that belong the genesis universe
                    continue;
                }
                this._followers[i].update(updateDataObject);
            }
        },
        "updateUnits": function() {
            var unitString;
            switch (this.species) {
                case 'measurePointLineDistance':
                case 'measureLength':
                case 'measureRadius':
                case 'measureCircumference':
                case 'measureArcLength':
                case 'measurePerimeter':
                    unitString = '&nbsp;units';
                    break;
                case 'measureArea':
                    unitString = '&nbsp;units<sup>2</sup>';
                    break;
                case 'measureAngle':
                case 'measureArcAngle':
                    unitString = '&#186;'; // &#186 Degree Symbol
                    break;
                case 'measureCoordinate':
                    if (this.creator.getParams().coordinateSystem === 'polar') {
                        unitString = '&#186;)'; // &#186;) Polar Coordinates Symbol
                    } else {
                        unitString = ')';
                    }
                    break;
                default:
                    unitString = '';
            }
            return unitString;
        },
        "updateCurrentMeasurement": function(newParams) {
            var undoData = {},
                redoData = {},
                i, updateValue,
                updateDataObject;


            updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();

            if (this.species === 'parameter') {
                undoData.calculationData = {
                    "label": this.getDisplayedLabel(),
                    "value": this.value
                };
            } else {
                undoData.calculationData = {
                    "sources": this.creator.sources ? this.creator.sources.slice() : [],
                    "answer": this.value,
                    "latex": this.getDisplayedLabel(),
                    "inputReference": this.creator._params.inputReference.slice(),
                    "noOfSources": this.creator._params.noOfSources,
                    "objectIndexInInputReference": this.creator._params.objectIndexInInputReference
                };
            }
            undoData.id = this.id;
            redoData.calculationData = newParams;
            redoData.id = this.id;
            i = 0;

            if (this.value !== newParams.value) {
                updateValue = true;
            }

            if (this.species === 'parameter') {

                //changed the parameter of updateLabelText from newParams.latex to newParams.label since parameter gets label and value as its parameters...
                this.updateLabelText(newParams.label, true, true);
                this.value = newParams.value;
                if (!MathUtilities.Tools.Dgt.Models.DgtEngine.restoreKind && updateValue) {
                    this.engine.execute('updateCalculation', {
                        "undo": {
                            "actionType": 'previousCalculation',
                            "undoData": undoData
                        },
                        "redo": {
                            "actionType": 'currentCalculation',
                            "redoData": redoData
                        }
                    });
                }
                this.update(updateDataObject);
            } else {
                //for calculation
                if (!MathUtilities.Tools.Dgt.Models.DgtEngine.restoreKind) {
                    this.engine.execute('updateCalculation', {
                        "undo": {
                            "actionType": 'previousCalculation',
                            "undoData": undoData
                        },
                        "redo": {
                            "actionType": 'currentCalculation',
                            "redoData": redoData
                        }
                    });
                }

                this.creator.removeAllSources();

                //Make it mature after adding all sources.
                this.creator._setParamData(newParams);

                while (typeof newParams.sources !== 'undefined' && i < newParams.sources.length) {
                    this.creator.addSpouse(newParams.sources[i]);
                    i++;
                }

                this.properties.labelTextOriginal = newParams.latex;

                updateDataObject.genesis = this;
                updateDataObject.modifyAttributes = ['label', 'value', 'changeParams'];
                this.update(updateDataObject);

            }


        },

        "changeLabelType": function(labelType) {
            this.properties.labelType = labelType;
        },
        "getLabelType": function() {
            return this.properties.labelType;
        },
        "changeMeasurementBindings": function() {
            this.trigger('change-bindings');
        },

        "updateContainmentSize": function() {
            this.trigger('update-containment-size');
        },

        "changeSelectionState": function(event) {

            this.trigger('change-style', event);
        },

        "incinerate": function() {
            if (this._incinerated) {
                return void 0;
            }
            var relation;

            this.trigger('incinerated', this);
            this._incinerated = true;
            this.engine.updateActiveMarkings(this);
            this.trigger('remove-banner');
            this.equation.setPoints([]);
            this.equation.setParent(null);
            this.equation = null;
            this.visible = null;

            if (this.creator) {
                this.creator.incinerate();
            }

            this.creator = null;
            while (this._menteeRelations.length > 0) {
                relation = this._menteeRelations.pop();
                relation.incinerate();
            }
            while (this._childrenRelationships.length > 0) {
                relation = this._childrenRelationships.pop();
                relation.incinerate();
            }
            this.engine.grid.refreshView();

            this._incinerated = true;

        },
        "getData": function() {
            var measureJson = {
                    "id": null,
                    "followers": []
                },
                creator = this.creator;
            measureJson.id = this.id;
            measureJson.species = this.species;
            if (this.species !== 'parameter') {
                measureJson.creator = creator.id;
                measureJson.functionString = this.functionString;
            }
            measureJson.value = this.value;
            if (this.species === 'calculation') {
                measureJson.objectsInInputReference = creator.getParams().objectIndexInInputReference;
            }
            measureJson.division = this.division;
            measureJson.equation = this.equation.getData();
            measureJson.properties = this.properties;
            measureJson.type = this.type;
            measureJson.serialNumber = this.serialNumber;
            return measureJson;
        },
        "setData": function(measureJson, engine) {

            var updateDataObject,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;
            this.engine = engine;
            DgtEngine.restoreKind = DgtEngine.ACTION_SAVE_RESTORE;
            this.init(measureJson.species, engine);
            this.id = measureJson.id;
            this.species = measureJson.species;
            this.type = measureJson.type;
            this.equation.setParent(this);
            this.division = measureJson.division;
            this.value = measureJson.value;
            this.properties = measureJson.properties;
            this.equation.setData(measureJson.equation);
            if (!isNaN(measureJson.serialNumber)) {
                this.serialNumber = measureJson.serialNumber;
                this.equation.depthLevel = measureJson.serialNumber;
            }
            if (measureJson.properties.bannerPosition) {
                this.equation.setPoints([
                    [measureJson.properties.bannerPosition.top, measureJson.properties.bannerPosition.left]
                ]);
            }
            if (measureJson.species === 'parameter') {
                new MathUtilities.Tools.Dgt.Views.DgtMeasurement({
                    "model": this
                });
                this.setProperties();
                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                this.update(updateDataObject);
            }


            DgtEngine.restoreKind = null;
            this.engine.acknowledgeEntity(this);
            if (this.properties.isInActiveMarking) {
                this.engine.updateActiveMarkings(this);
            }
        },


        "setMenteeRelation": function(relation) {
            if (this._menteeRelations.indexOf(relation) === -1) {
                this._menteeRelations.push(relation);
            }

        }
    }, {
        //STATIC

        "previousMeasurement": null,

        "measurementTypeMapping": {
            "distance": ['measurePointLineDistance', 'measureLength', 'measureRadius', 'measureCircumference', 'measureArcLength', 'measurePerimeter'],
            "ratio": ['measureCoordinateDistance', 'parameter', 'calculation', 'measureRatio'],
            "angle": ['measureAngle', 'measureSegmentAngle', 'measureRayAngle', 'measureArcAngle'],
            "coordinate": ['measureCoordinate'],
            "slope": ['measureSlope'],
            "equation": ['measureEquation'],
            "area": ['measureArea'],
            "table": ['measureIteration']
        }

    });

})(window.MathUtilities);
