(function(MathUtilities) {
    'use strict';

    MathUtilities.Tools.WhiteboardTool = MathUtilities.Tools.WhiteboardTool || {};
    MathUtilities.Tools.WhiteboardTool.Models = MathUtilities.Tools.WhiteboardTool.Models || {};
    MathUtilities.Tools.WhiteboardTool.Views = MathUtilities.Tools.WhiteboardTool.Views || {};
    MathUtilities.Tools.WhiteboardTool.Collections = MathUtilities.Tools.WhiteboardTool.Collections || {};
    MathUtilities.Tools.WhiteboardTool.Views.templates = MathUtilities.Tools.WhiteboardTool.Views.templates || {};

    /**
     * A customized Backbone.Collection that represents collection of drawn Shapes
     * @module Sketchpad
     * @class Shapes
     * @constructor
     * @extends Backbone.Collection
     * @namespace Tools.GeometryTool.Collection
     */
    MathUtilities.Tools.WhiteboardTool.Collections.Shapes = Backbone.Collection.extend({});
})(window.MathUtilities);
