(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    /*******************************************************************/
    /*                             Text                                */
    /*******************************************************************/
    WhiteboardTool.Models.Text = WhiteboardTool.Models.Image.extend({
        "initialize": function() {
            var renderData;
            WhiteboardTool.Models.Text.__super__.initialize.apply(this, arguments);
            renderData = this.getData();
            renderData.strText = null;
        },

        "setDefaults": function() {
            var renderData;
            WhiteboardTool.Models.Text.__super__.setDefaults.apply(this, arguments);
            this.setOptions({
                "nType": WhiteboardTool.Views.ShapeType.Text,
                "menuType": 6,
                "bAllowResize": false
            });
            renderData = this.getData();
            renderData.strText = null;
        },

        "setOptions": function(options) {
            var renderData;
            WhiteboardTool.Models.Text.__super__.setOptions.apply(this, arguments);

            renderData = this.getData();
            if (options) {
                if (typeof options.strText !== "undefined") {
                    renderData.strText = options.strText;
                }
                if (options.editorSize) {
                    if (!renderData.editorSize) {
                        renderData.editorSize = {};
                    }
                    if (typeof options.editorSize.height !== "undefined") {
                        renderData.editorSize.height = options.editorSize.height;
                    }
                    if (typeof options.editorSize.width !== "undefined") {
                        renderData.editorSize.width = options.editorSize.width;
                    }
                }
            }
        }

    }, {
        "textToolCounter": 0,
        "textToolView": null
    });

})(window.MathUtilities);
