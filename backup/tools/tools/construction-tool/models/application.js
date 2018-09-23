(function(MathUtilities) {
    'use strict';
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;

    /* Initialize MathUtilities Data */
    ConstructionTool = {};

    /**
     * Packages all the models used in the ConstructionTool module.
     * @module Models
     * @namespace MathUtilities.Tools.ConstructionTool
     **/
    ConstructionTool.Models = {};

    /**
     * Packages all the views used in the ConstructionTool module.
     * @module Views
     * @namespace MathUtilities.Tools.ConstructionTool
     **/
    ConstructionTool.Views = {};

    /**
     * Packages all the collection used in the ConstructionTool module.
     * @module Views
     * @namespace MathUtilities.Tools.ConstructionTool
     **/
    ConstructionTool.Collections = {};

    /**
     * Contain all menu-bar
     * @object
     * @namespace MathUtilities.Tools.ConstructionTool.Views
     */
    ConstructionTool.Views.ToolType = {
        "None": '-1',
        "Select": 1,
        "StraightLiner": 2,
        "Compass": 3,
        "Pencil": 4,
        "Image": 5,
        "Text": 6,
        "Background": 7,
        "CanvasPan": 8,
        "Undo": 9,
        "Redo": 10,
        "ResetAll": 11,
        "Rectangle": 12
    };

    ConstructionTool.Views.ModuleName = 'construction-tool';

    ConstructionTool.Views.DOUBLE_TAP_THRESHOLD = 600;

    ConstructionTool.Views.RulerType = {
        "StraightLiner": 1,
        "Compass": 2
    };

    ConstructionTool.Views.PropertyMenuItems = {
        '-1': ['property-bar-right-menu'],
        "4": ['stroke-color', 'stroke-size'],
        "7": ['background-color'],
        "2": ['stroke-color', 'stroke-size'],
        "3": ['stroke-color', 'stroke-size'],
        "6": ['property-bar-right-menu'],
        "5": ['property-bar-right-menu']
    };

    ConstructionTool.Views.CursorType = {
        "Default": 1,
        "Move": 2,
        "Resize": 3,
        "Pencil": 4,
        "RotationStart": 5,
        "Rotation": 6,
        "RotationEnd": 7,
        "Pointer": 8,
        "ResizeLeft": 9,
        "ResizeRight": 10
    };

    ConstructionTool.Views.UndoRedoActions = {
        "Add": 1,
        "Remove": 2,
        "Translate": 3,
        "Rotate": 4,
        "Resize": 5,
        "Transform": 7,
        "Color": 8,
        "Stroke": 9,
        "ColorAndStroke": 10,
        "BringForward": 11,
        "SendBack": 12,
        "CanvasPan": 13,
        "RulerTransform": 14,
        "Reset": 1
    };

}(window.MathUtilities));
