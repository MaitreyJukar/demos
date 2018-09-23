(function(MathUtilities) {
    "use strict";
    var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                         Data Structure                          */
    /*******************************************************************/
    /**
     * Represents a rectangle.
     * @method MathUtilities.Tools.ConstructionTool.Models.Rect
     * @param {Object} rectObject rectangle properties.
     */
    ConstructionTool.Models.Rect = function(rectObject) {
        this.x = 0;
        this.y = 0;
        this.topLeft = 0;
        this.topRight = 0;
        this.bottomLeft = 0;
        this.bottomRight = 0;
        this.width = 0;
        this.height = 0;

        this.setData = function(rectData) {
            if (typeof rectData === "undefined" || rectData === null) {
                return;
            }

            if (typeof rectData.x !== "undefined") {
                this.x = rectData.x;
            }
            if (typeof rectData.y !== "undefined") {
                this.y = rectData.y;
            }
            if (typeof rectData.width !== "undefined") {
                this.width = rectData.width;
            }
            if (typeof rectData.height !== "undefined") {
                this.height = rectData.height;
            }
            if (typeof rectData.topLeft !== "undefined") {
                this.topLeft = rectData.topLeft;
            }
            if (typeof rectData.topRight !== "undefined") {
                this.topRight = rectData.topRight;
            }
            if (typeof rectData.bottomLeft !== "undefined") {
                this.bottomLeft = rectData.bottomLeft;
            }
            if (typeof rectData.bottomRight !== "undefined") {
                this.bottomRight = rectData.bottomRight;
            }
        };

        this.getData = function() {
            return this;
        };

        this.clone = function() {
            var rect = new ConstructionTool.Models.Rect();

            rect.x = this.x;
            rect.y = this.y;
            rect.width = this.width;
            rect.height = this.height;
            rect.bottomLeft = this.bottomLeft;
            rect.bottomRight = this.bottomRight;
            rect.topLeft = this.topLeft;
            rect.topright = this.topright;

            return rect;
        };
        this.setData(rectObject);
    };

    ConstructionTool.Models.Point = function() {
        this.x = 0;
        this.y = 0;

        this.setData = function() {
            var args = arguments[0];
            if (typeof args === 'undefined' || args === null || args.length === 0) {
                return;
            }

            if (typeof args[0] === "object") {
                if (typeof args[0].x !== "undefined") {
                    this.x = args[0].x;
                }
                if (typeof args[0].y !== "undefined") {
                    this.y = args[0].y;
                }
            } else {
                this.x = args[0];
                this.y = args[1];
            }
        };

        this.getData = function() {
            return this;
        };

        this.clone = function() {
            var rect = new ConstructionTool.Models.Point();

            rect.x = this.x;
            rect.y = this.y;

            return rect;
        };
        this.setData(arguments);
    };
}(window.MathUtilities));
