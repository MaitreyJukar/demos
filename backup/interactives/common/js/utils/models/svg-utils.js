(function () {
    'use strict';

    /**
    * Holds the helper function to create svg elements.
    * @class SvgUtils
    * @module Utilities
    * @extends Backbone.Model.extend
    * @namespace MathInteractives.Common.Utilities.Models
    * @constructor
    */

    MathInteractives.Common.Utilities.Models.SvgUtils = Backbone.Model.extend({}, {

        /**
        * Holds the defaults values of attributes for svg elements.
        * @private
        * @Property elementProperty
        * @type Object
        * @default {}
        **/

        elementProperty: {
            id: 'map',
            className: 'className',
            centerX: 50,
            centerY: 50,
            lineX: 90,
            lineY: 50,
            arcX: 40,
            arcY: 40,
            count: 6,
            elemType: 'path'
        },

        /**
        * Holds the defaults values of attributes for svg elements.
        * @private
        * @Property elemDefaultValue
        * @type Object
        * @default {}
        **/

        elemDefaultValue: {
            'fill': 'white',
            'stroke': 'black',
            'strokeWidth': '1',
            'fill-opacity': '1'
        },

        /**
        * Returns the required namespace
        *     
        * @method _getRequiredNameSpace
        * @param name {String} type of namespace required. e.g. 'svg', 'xlink' etc.
        * @return {String} returns required namespace.
        * @private
        **/

        _getRequiredNameSpace: function _getRequiredNameSpace(name) {
            switch (name) {
                case 'svg':
                    return 'http://www.w3.org/2000/svg';
                    break;
                case 'xlink':
                    return 'http://www.w3.org/1999/xlink';
                    break;
                default:
                    return null;
                    break;
            }
        },

        /**
        * Generates an svg element
        *     
        * @method _generateSVGElement
        * @param elemType {String} type of svg element
        * @return {object} returns required svg element
        * @private
        **/

        _generateSVGElement: function _generateSVGElement(elemType) {
            var nameSpaceSVG = this._getRequiredNameSpace('svg');
            return document.createElementNS(nameSpaceSVG, elemType);
        },

        /**
        * Sets the value of an attribute of the svg element.
        *     
        * @method _setSVGAttribute
        * @param elementNS {String} namespace
        * @param element {Object} svg element
        * @param elemProperty {String} property of svg element to be set
        * @param elemValue {String/Number} value of property of svg element to be set
        * @param elemDefaultValue {String/Number} default value of property of svg element to be set.
        * @private
        **/

        _setSVGAttribute: function _setSVGAttribute(elementNS, element, elemProperty, elemValue, elemDefaultValue) {
            var svgNS = this._getRequiredNameSpace(elementNS);
            if (elemValue !== undefined) {
                element.setAttributeNS(svgNS, elemProperty, elemValue);
            }
            else if (elemDefaultValue !== undefined) {
                element.setAttributeNS(svgNS, elemProperty, elemDefaultValue);
            }
        },

        /**
        * Creates and Returns a circle.
        *     
        * @method createCircle
        * @param elemProperty {Object} svg element properties
        * @public
        **/

        createCircle: function createCircle(elemProperty) {
            var elemCircle = this._generateSVGElement('circle'),
                elemDefaultValue = this.elemDefaultValue;
            this._setSVGAttribute('', elemCircle, 'id', elemProperty.id);
            this._setSVGAttribute('', elemCircle, 'cx', elemProperty.cx);
            this._setSVGAttribute('', elemCircle, 'cy', elemProperty.cy);
            this._setSVGAttribute('', elemCircle, 'r', elemProperty.r);
            this._setSVGAttribute('', elemCircle, 'fill', elemProperty.fill, elemDefaultValue['fill']);
            this._setSVGAttribute('', elemCircle, 'stroke', elemProperty.stroke, elemDefaultValue['stroke']);
            this._setSVGAttribute('', elemCircle, 'stroke-width', elemProperty.strokeWidth, elemDefaultValue['strokeWidth']);
            this._setSVGAttribute('', elemCircle, 'class', elemProperty.class);
            this._setSVGAttribute('', elemCircle, 'fill-opacity', elemProperty.fillOpacity, elemDefaultValue['fill-opacity']);
            return elemCircle;
        },

        /**
        * Creates and Returns a Line.
        *     
        * @method createLine
        * @param elemProperty {Object} svg element properties
        * @public
        **/

        createLine: function createLine(elemProperty) {
            var elemLine = this._generateSVGElement('line'),
                elemDefaultValue = this.elemDefaultValue;
            this._setSVGAttribute('', elemLine, 'x1', elemProperty.x1);
            this._setSVGAttribute('', elemLine, 'y1', elemProperty.y1);
            this._setSVGAttribute('', elemLine, 'x2', elemProperty.x2);
            this._setSVGAttribute('', elemLine, 'y2', elemProperty.y2);
            this._setSVGAttribute('', elemLine, 'stroke', elemProperty.stroke, elemDefaultValue['stroke']);
            this._setSVGAttribute('', elemLine, 'stroke-width', elemProperty.strokeWidth, elemDefaultValue['strokeWidth']);
            this._setSVGAttribute('', elemLine, 'id', elemProperty.id);
            this._setSVGAttribute('', elemLine, 'class', elemProperty.class);
            return elemLine;
        },

        /**
        * Creates and Returns a Rectangle.
        *     
        * @method createRect
        * @param elemProperty {Object} svg element properties
        * @public
        **/

        createRect: function createRect(elemProperty) {
            var elemRect = this._generateSVGElement('rect'),
                elemDefaultValue = this.elemDefaultValue;
            this._setSVGAttribute('', elemRect, 'x', elemProperty.x);
            this._setSVGAttribute('', elemRect, 'y', elemProperty.y);
            this._setSVGAttribute('', elemRect, 'width', elemProperty.width);
            this._setSVGAttribute('', elemRect, 'height', elemProperty.height);
            this._setSVGAttribute('', elemRect, 'fill', elemProperty.fill, elemDefaultValue['fill']);
            this._setSVGAttribute('', elemRect, 'stroke', elemProperty.stroke, elemDefaultValue['stroke']);
            this._setSVGAttribute('', elemRect, 'stroke-width', elemProperty.strokeWidth, elemDefaultValue['strokeWidth']);
            this._setSVGAttribute('', elemRect, 'id', elemProperty.id);
            this._setSVGAttribute('', elemRect, 'class', elemProperty.class);
            this._setSVGAttribute('', elemRect, 'fill-opacity', elemProperty.fillOpacity, elemDefaultValue['fill-opacity']);
            return elemRect;
        },

        /**
        * Creates and Returns a sector of a circle.
        *     
        * @method createSector
        * @param elemProperty {Object} svg element properties
        * @public
        **/

        createSector: function createSector(elemProperty) {
            var elemSector = this._generateSVGElement('path'),
                elemDefaultValue = this.elemDefaultValue,
	            attrPath = '',
	            radius = elemProperty.radius,
	            centerX = elemProperty.centerX,
	            centerY = elemProperty.centerY;
            attrPath = 'M' + centerX + ',' + centerY + 'l' + 0 + ',' + -radius + 'a' + radius + ',' + radius + ' 0 ' +
                            elemProperty.largeArcFlag + ',' + elemProperty.sweepFlag + (elemProperty.endX - centerX) + ',' +
				            (elemProperty.endY - centerY + radius) + 'z';

            this._setSVGAttribute('', elemSector, 'd', attrPath);
            this._setSVGAttribute('', elemSector, 'fill', elemProperty.fill, elemDefaultValue['fill']);
            this._setSVGAttribute('', elemSector, 'stroke', elemProperty.stroke, elemDefaultValue['stroke']);
            this._setSVGAttribute('', elemSector, 'stroke-width', elemProperty.strokeWidth, elemDefaultValue['strokeWidth']);
            this._setSVGAttribute('', elemSector, 'id', elemProperty.id);
            this._setSVGAttribute('', elemSector, 'class', elemProperty.class);
            this._setSVGAttribute('', elemSector, 'fill-opacity', elemProperty.fillOpacity, elemDefaultValue['fill-opacity']);
            return elemSector;
        },

        /**
        * Creates and Returns a Pattern containg image.
        *     
        * @method createPattern
        * @param options {Object} svg element properties
        * @public
        **/

        createPattern: function createPattern(options) {
            var elmDefs, elmPattern, elmImage;
            elmDefs = this._generateSVGElement('defs');
            elmPattern = this._generateSVGElement('pattern');
            elmImage = this._generateSVGElement('image');
            this._setSVGAttribute('xlink', elmImage, 'xlink:href', options.imagePath);
            elmPattern.appendChild(elmImage);
            this._setSVGAttribute('', elmImage, 'width', 100);
            this._setSVGAttribute('', elmImage, 'height', 100);
            elmPattern.setAttribute('id', options.id);
            this._setSVGAttribute('', elmImage, 'x', 3);
            this._setSVGAttribute('', elmImage, 'y', 3);
            this._setSVGAttribute('', elmPattern, 'width', 100);
            this._setSVGAttribute('', elmPattern, 'height', 100);
            this._setSVGAttribute('', elmImage, 'patternContentUnits', 'objectBoundingBox');
            elmDefs.appendChild(elmPattern);
            return elmDefs;
        }

    });
} ());
