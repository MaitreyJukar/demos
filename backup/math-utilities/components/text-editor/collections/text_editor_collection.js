/*globals $, Backbone, MathUtilities */
(function(TinyMCEEditor) {
    "use strict";

    if (TinyMCEEditor.Collection) {
        return;
    }
    TinyMCEEditor.RteCollection = null;
    TinyMCEEditor.isInitialized = false;
    TinyMCEEditor.Collection = Backbone.Collection.extend({ // Instance properties/methods
        "model": TinyMCEEditor,

        "getEditorModel": function getEditors(id) {
            return this.find(function(model) {
                return model.get("parentId") === id;
            });
        },
        //Returns editor instance
        "getTinyMce": function getTinyMce(id) {
            return this.getEditorModel(id).getTinyMce();
        },

        //Editor editor instance
        "removeTinyMce": function(id) {
            return this.getTinyMce(id).destroy();
        },

        //Returns editor body
        "getTinyMceBody": function(id) {
            return this.getTinyMce(id).getBody();
        },

        "getRteTargetElement": function(id) {
            return this.getTinyMce(id).getElement();
        },

        "rgbToHex": function(colorVal) {
            if (!colorVal || colorVal === 'transparent' || colorVal === 'initial' || colorVal === 'none') {
                return 'transparent';
            }
            //regex to split the three digits in rgb function sample input rgb(10, 20, 30)
            var parts = colorVal.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/),
                color, i = 1;

            delete(parts[0]);
            for (; i <= 3; ++i) {
                parts[i] = parseInt(parts[i], 10).toString(16);
                if (parts[i].length === 1) {
                    parts[i] = '0' + parts[i];
                }
            }
            color = '#' + parts.join('');
            return color;
        },

        "getRteContent": function(id, preventTextTrim, addDimensions) {
            //get clean text and return
            var editorModel = this.getEditorModel(id),
                dimensions = addDimensions ? editorModel.getEditorDimensions(id) : null,
                content = this.getTinyMce(id).getContent({
                    "format": "raw"
                }),
                tinyBody = $(this.getTinyMceBody(id)),
                colorString = tinyBody[0].style.backgroundColor;

            if (dimensions) {
               dimensions.backgroundColor = colorString ? this.rgbToHex(colorString) : "transparent";
            }

            content = TinyMCEEditor.DataCleaner.getText(content, preventTextTrim, editorModel.get("Config").Config, dimensions);
            return content.trim();
        },

        "getRtePlainText": function(id) {
            return this.getTinyMce(id).getContent({
                "format": "text"
            }).trim();
        },

        "getRteAccOnlyText": function(id) {
            var editor = this.getTinyMce(id),
                content = $(editor.getBody()).html();

            return TinyMCEEditor.DataCleaner.returnOnlyText(content);
        },

        "setRteContent": function(id, content) {
            if (content !== null && content !== void 0) { // content could be "" or 0.
                this.getEditorModel(id).setContent(content);
            }
        },

        "isRteDirty": function(id) {
            return this.getTinyMce(id).isDirty();
        },

        "isRtePresent": function(id) {
            return this.getEditorModel(id) !== void 0;
        },

        "setFocusToRte": function(id) {
            this.getTinyMce(id).focus();
        }
    });
})(MathUtilities.Components.TinyMCEEditor);
