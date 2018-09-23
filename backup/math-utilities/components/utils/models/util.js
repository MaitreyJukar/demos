/* globals MathUtilities, $ */

(function() {
    'use strict';
    if (typeof MathUtilities.Components.Utils === "undefined") {
        MathUtilities.Components.Utils = {};

        MathUtilities.Components.Utils.Models = {};
    }
    MathUtilities.Components.Utils.Models.Utils = (function() {
        return {
            "fontAwesomeIcons": {
                'expand': 'fa fa-expand'
            },
            "getCloneOf": function(obj) {
                var attr,
                    copy,
                    i;
                if (!obj) {
                    return obj;
                }

                if (obj.clone) {
                    return obj.clone();
                }

                if (obj === null || typeof obj !== "object") {
                    return obj;
                }
                copy = obj.constructor();
                for (attr in obj) {
                    if (obj.hasOwnProperty(attr)) {
                        if (obj[attr] instanceof Array) {
                            copy[attr] = [];
                            for (i = 0; i < obj[attr].length; i++) {
                                copy[attr].push(obj[attr][i]);
                            }
                        } else {
                            copy[attr] = obj[attr];
                        }
                    }
                }
                return copy;
            },
            "replaceWords": function() {
                var i, string = arguments[0];
                for (i = 1; i < arguments.length; i++) {
                    string = string.replace('%@$%', arguments[i]); //'%@$%' special char string used for localization 
                }
                return string;
            },
            "convertToSerializable": function(source, cloneExecutedArray) {
                var value, arrExceptions = ['function'],
                    type,
                    dest = null,
                    objectIndex,
                    prop = null;
                if (typeof cloneExecutedArray === 'undefined') {
                    cloneExecutedArray = [];
                }
                objectIndex = cloneExecutedArray.indexOf(source);
                if (objectIndex !== -1) {
                    return cloneExecutedArray[objectIndex];
                }
                cloneExecutedArray.push(source);

                if (Object.prototype.toString.call(source) === '[object Array]') {
                    dest = [];
                } else {
                    dest = {};
                }
                for (prop in source) {
                    if (prop === void 0 || prop === null) {
                        continue;
                    }
                    value = source[prop];
                    if (value === void 0 || value === null) {
                        continue;
                    }
                    type = typeof value;

                    if (arrExceptions.indexOf(type) > -1) {
                        continue;
                    }
                    if (type === 'object') {
                        value = this.convertToSerializable(value, cloneExecutedArray);
                    }
                    dest[prop] = value;
                }
                return dest;
            },

            "getFontAwesomeClass": function(icon) {
                return this.fontAwesomeIcons[icon];
            },


            "isEqual": function(firstElem, secondElem) {
                //Compare two object by values,
                var _isEqual, getType, compareObjects, compareArray, _isNotEqual;

                //return type of element
                //if object is array then return 'Array' as string
                getType = function(val) {
                    if (val === null) {
                        return 'null';
                    }
                    //Check type of val
                    var type = typeof val,
                        getClass = function(objectType) {
                            //returns class of object as Array, Object,String
                            return Object.prototype.toString.call(objectType).match(/^\[object\s(.*)\]$/)[1];
                        };
                    if (type === 'undefined') {
                        return 'undefined';
                    }

                    //if type is object,it can be array,object,string object
                    if (type === 'object') {
                        type = getClass(val).toLowerCase();
                    }
                    if (type === 'number') {
                        if (val.toString().indexOf('.') > 0) {
                            return 'float';
                        }
                        return 'integer';
                    }
                    return type;
                };

                compareObjects = function(sourceObj, destObj) {
                    if (sourceObj === destObj) {
                        return true;
                    }
                    var elem = null;
                    for (elem in sourceObj) {
                        if (destObj.hasOwnProperty(elem)) {
                            if (_isNotEqual(sourceObj[elem], destObj[elem]) === true) {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }

                    for (elem in destObj) {
                        if (sourceObj.hasOwnProperty(elem) === false) {
                            return false;
                        }
                    }
                    return true;
                };
                compareArray = function(sourceArr, destArr) {
                    if (sourceArr === destArr) {
                        return true;
                    }
                    var sourceLen = sourceArr.length,
                        destLen = destArr.length,
                        elemCounter = 0;

                    if (sourceLen !== destLen) {
                        return false;
                    }
                    for (; elemCounter < sourceLen; elemCounter++) {
                        if (_isNotEqual(sourceArr[elemCounter], destArr[elemCounter]) === true) {
                            return false;
                        }
                    }
                    return true;
                };

                _isNotEqual = function(firstElem, secondElem) {
                    return !_isEqual(firstElem, secondElem);
                };

                //Depending upon type of element call appropriate comparing function
                //its recrursive function
                _isEqual = function(firstElem, secondElem) {
                    if (firstElem !== secondElem) {
                        var type1 = getType(firstElem),
                            type2 = getType(secondElem);

                        if (type1 === type2) {
                            switch (type1) {
                                case 'array':
                                    return compareArray(firstElem, secondElem);
                                case 'object':
                                    return compareObjects(firstElem, secondElem);
                                case 'date':
                                    return firstElem.getTime() === secondElem.getTime();
                                case 'regexp':
                                case 'function':
                                    return firstElem.toString() === secondElem.toString();
                                default:
                                    return firstElem === secondElem;
                            }
                        }
                        return false;
                    }
                    return true;
                };

                return _isEqual(firstElem, secondElem);

            }
        }
    })()
})();


$.fn.getTextWidth = function(bDebug) {
    if (bDebug) {
        $('body').append($(this));
    }
    var html_org = $(this).html(),
        width,
        htmlCalc = $('<span class="width-height-span">' + html_org + '</span>', {
            'style': 'float:initial;  min-height: initial;margin-left: initial;line-height:normal;'
        })
    $(this).html(htmlCalc);

    width = $(this).find('span:first').width();
    $(this).html(html_org);
    if (bDebug) {
        $(this).detach();
    }
    return width;
};
