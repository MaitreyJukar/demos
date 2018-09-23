(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    /*******************************************************************/
    /*                         Data Structure                          */
    /*******************************************************************/
    WhiteboardTool.Models.Rect = function(rectDataObj) {
        this.x = 0;
        this.y = 0;
        this.topLeft = 0;
        this.topRight = 0;
        this.bottomLeft = 0;
        this.bottomRight = 0;
        this.width = 0;
        this.height = 0;


        this.setData = function(rectData) {
            if (!rectData) {
                return;
            }

            if (rectData.x) {
                this.x = rectData.x;
            }
            if (rectData.y) {
                this.y = rectData.y;
            }
            if (rectData.width) {
                this.width = rectData.width;
            }
            if (rectData.height) {
                this.height = rectData.height;
            }
            if (rectData.topLeft) {
                this.topLeft = rectData.topLeft;
            }
            if (rectData.topRight) {
                this.topRight = rectData.topRight;
            }
            if (rectData.bottomLeft) {
                this.bottomLeft = rectData.bottomLeft;
            }
            if (rectData.bottomRight) {
                this.bottomRight = rectData.bottomRight;
            }
        };

        this.getData = function() {
            return this;
        };

        this.clone = function() {
            var rect = new WhiteboardTool.Models.Rect();

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

        this.setData(rectDataObj);
    };


    WhiteboardTool.Models.Point = function() {
        this.x = 0;
        this.y = 0;


        this.setData = function() {
            var args = arguments[0];
            if (!args || args && args.length === 0) {
                return;
            }

            if (typeof args[0] === "object") {
                if (args[0].x) {
                    this.x = args[0].x;
                }
                if (args[0].y) {
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
            var rect = new WhiteboardTool.Models.Point();

            rect.x = this.x;
            rect.y = this.y;

            return rect;
        };

        this.setData(arguments);
    };
})(window.MathUtilities);
