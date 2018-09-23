(function () {

    /**
    * Holds the Wrapper methods for Cango3D library
    * @class Cango3DWrapper
    * @extends Backbone.Model.extend
    * @namespace MathInteractives.Common.Components.Theme2.Models
    * @constructor
    */
    MathInteractives.Common.Components.Theme2.Models.Cango3DWrapper = Backbone.Model.extend({

        defaults: {
            /**
            * Canvas Id
            * @property canvasId
            * @type String
            * @default null
            */
            canvasId: null,
        },

        /**
        * Cango3D object for particular canvas
        *
        * @property cangoObj
        * @type Object
        * @default null
        */
        cangoObj: null,

        /**
        * Its holds all the cango objects created on canvas
        *
        * @property canvasObjs
        * @type Object
        * @default null
        */
        canvasObjs: {},

        /**
        * Initialize the cangoObj for particular canvas
        * @method initialize
        */
        initialize: function () {
            this.on("change: canvasId", this.initializeCangoObj);
            if (this.get("canvasId")) {
                this._initializeCangoObj();
            }
        },

        /**
        * Initialize the cangoObj when canvasId changes
        * @method _initializeCangoObj
        */
        _initializeCangoObj: function () {
            this.cangoObj = new Cango3D(this.get('canvasId'));
        },

        /**
        * Set point of origin in canvas (By default origin is at bottom right corner)
        * @method setWorldCoordinates
        * @param lowerX{Number} X point
        * @param lowerY{Number} Y point
        * @param spanX{Number} Width of canvas
        */
        setWorldCoordinates: function (lowerX, lowerY, spanX) {
            if (this.cangoObj) {
                this.cangoObj.setWorldCoords3D(lowerX, lowerY, spanX);
            }
        },

        /**
        * Convert the x, y and z of canvas point in the terms of world coordinates 
        * @method toWorldCoordinates3D
        * @param x{Number} X point
        * @param y{Number} Y point
        * @param z{Number} Width of canvas
        * @return {Object} Point in coordinate system
        */
        toWorldCoordinates3D: function (x, y, z) {
            if (this.cangoObj) {
                return this.cangoObj.toWorldCoords3D(x, y, z);
            }
        },

        /**
        * Creates a cango group with groupId as id
        * @method createGroup3D
        * @param groupId{String} Group Id
        */
        createGroup3D: function (groupId) {
            if (this.cangoObj) {
                var obj = this.cangoObj.createGroup3D();
                obj.id = groupId;
                this.canvasObjs[groupId] = obj;
            }
        },

        /**
        * Add object in to the group
        * @method addObjToGroup
        * @param objId{String} Object Id
        * @param groupId{String} Group Id
        */
        addObjToGroup: function (objId, groupId) {
            var group = this.canvasObjs[groupId];
            var obj = this.canvasObjs[objId];
            if (group && group.type == "GROUP" && obj) {
                group.addObj(obj);
            }
        },

        /**
        * Delete object from the group
        * @method deleteObjFromGroup
        * @param objId{String} Object Id
        * @param groupId{String} Group Id
        */
        deleteObjFromGroup: function (objId, groupId) {
            var group = this.canvasObjs[groupId];
            var obj = this.canvasObjs[objId];

            if (obj && obj.type === "GROUP") {
                var children = obj.children,
                    length = children.length;
                for (var i = 0; i < length; i++) {
                    this.deleteObjFromGroup(children[0].id, objId);
                }
                group.deleteObj(obj);
                delete this.canvasObjs[objId];
            }
            else {
                group.deleteObj(obj);
                delete this.canvasObjs[objId];
            }
        },

        /**
        * Delete group
        * @method deleteGroup
        * @param groupId{String} Group Id
        */
        deleteGroup: function (groupId) {
            var group = this.canvasObjs[groupId];
            if (group && group.type === "GROUP") {
                var children = group.children,
                    length = children.length;
                for (var i = 0; i < length; i++) {
                    this.deleteObjFromGroup(children[0].id, groupId);
                }
            }
            delete this.canvasObjs[groupId];
        },

        /**
        * Create 3D Path
        * @method create3DPath
        * @param pathId{String} Path Id
        * @param data{Array} Draw commands
        * @param color{String} Color string
        * @param lineWidth{Number} Stroke width
        */
        create3DPath: function (pathId, data, color, lineWidth) {
            if (this.cangoObj) {
                var obj = this.cangoObj.compilePath3D(data, color, lineWidth);
                obj.id = pathId;
                this.canvasObjs[pathId] = obj;
            }
        },

        /**
        * Create 3D Shape
        * @method create3DShape
        * @param shapeId{String} Shape Id
        * @param data{Array} Draw commands
        * @param fillColor{String} Front fill color
        * @param backColor{String} Back fill color
        */
        create3DShape: function (shapeId, data, fillColor, backColor) {
            if (this.cangoObj) {
                var obj = this.cangoObj.compileShape3D(data, fillColor, backColor);
                obj.id = shapeId;
                this.canvasObjs[shapeId] = obj;
            }
        },

        /**
        * To enable the drag and drop of particular object
        * @method enableDrag
        * @param objId{String} Object Id
        * @param grabCallback{Object} Grab call back
        * @param dragCallback{Object} Drag call back
        * @param dropCallback{Object} Drop call back
        */
        enableDrag: function (objId, grabCallback, dragCallback, dropCallback) {
            var obj = this.canvasObjs[objId];
            if (obj) {
                obj.enableDrag(grabCallback, dragCallback, dropCallback);
            }
        },

        /**
        * To disable the drag and drop of particular object
        * @method disableDrag
        * @param objId{String} Object Id
        */
        disableDrag: function (objId) {
            var obj = this.canvasObjs[objId];
            if (obj) {
                obj.disableDrag();
            }
        },

        /**
        * Draw the object on canvas
        * @method renderObj
        * @param objIds{Array} Object Id array
        */
        renderObj: function (objIds, withoutFrame) {
            var data = { clear: false },
                objIdsLength = objIds ? objIds.length : 0,
                obj;
            for (var i = 0; i < objIdsLength; i++) {
                obj = this.canvasObjs[objIds[i]];
                if (obj) {
                    if (i !== 0) {
                        obj.data = data;
                    }
                    if (withoutFrame) {
                        this.cangoObj.render(obj);
                    }
                    else {
                        this.cangoObj.renderFrame(obj);
                    }
                }
            }
        },

        /**
        * To translate the object
        * @method translate
        * @param objId{String} Object Id
        * @param x{Number} x offset
        * @param y{Number} y offset
        * @param z{Number} z offset
        * @param isTransform{Boolean} Is transform applied
        */
        translate: function (objId, x, y, z, isTransform) {
            var obj = this.canvasObjs[objId];
            if (obj) {
                if (isTransform) {
                    obj.transform.translate(x, y, z);
                }
                else {
                    obj.translate(x, y, z);
                }
            }
        },

        /**
        * To rotate the object
        * @method rotate
        * @param objId{String} Object Id
        * @param vx{Number} x offset of unit vector
        * @param vy{Number} y offset of unit vector
        * @param vz{Number} z offset of unit vector
        * @param isTransform{Boolean} Is transform applied
        */
        rotate: function (objId, vx, vy, vz, angle, isTransform) {
            var obj = this.canvasObjs[objId];
            if (obj) {
                if (isTransform) {
                    obj.transform.rotate(vx, vy, vz, angle);
                }
                else {
                    obj.rotate(vx, vy, vz, angle);
                }
            }
        },

        /**
        * To clear the whole canvas
        * @method clearCanvas
        */
        clearCanvas: function () {
            if (this.cangoObj) {
                this.cangoObj.clearCanvas();
            }
        },
    },
    {
        /**
        * To calculate the normal between points
        * @method calculateNormal
        * @param p1{Object} First point
        * @param p2{Object} Second point
        * @param p3{Object} Third point
        */
        calculateNormal: function (p1, p2, p3) {
            return calcNormal(p1, p2, p3);
        },

        /**
        * To calculate the inclined angle between points
        * @method calculateIncAngle
        * @param p1{Object} First point
        * @param p2{Object} Second point
        * @param p3{Object} Third point
        */
        calculateIncAngle: function (p1, p2, p3) {
            return calcIncAngle(p1, p2, p3);
        },

        /**
        * To get the draw command of circle
        * @method getCircleShapeCmds
        * @param diameter{Number} Diameter
        */
        getCircleShapeCmds: function (diameter) {
            return shapes3D.circle(diameter)
        }
    });

})();