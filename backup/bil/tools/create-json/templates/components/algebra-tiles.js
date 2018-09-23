(function() {
  var template = Handlebars.template, templates = JSONCreator.Templates = JSONCreator.Templates || {};
templates['algebra-tiles'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"algebra-tiles-template\">\r\n    <h4 title=\"Make sure to\" class=\"control-wrapper\">Tile Details:</h4>\r\n    <div class=\"control-wrapper form-group\">\r\n        <label class=\"alge-type-label\" for=\"alge-type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Types: </label>\r\n        <select class=\"alge-type form-control\" name=\"alge-type\" id=\"alge-type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">\r\n            <option value=\"Inner\">Normal</option>\r\n            <option value=\"Scratchpad\">Scratchpad</option>\r\n        </select>\r\n    </div>\r\n    <div class=\"control-wrapper\">\r\n        <label class=\"x-vert-label\" for=\"x-vert-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Vertical coeff of X:</label>\r\n        <input type=\"text\" class=\"x-vert form-control\" id=\"x-vert-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" />\r\n    </div>\r\n    <div class=\"control-wrapper\">\r\n        <label class=\"x-vert-const-label\" for=\"x-vert-const-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Vertical constant:</label>\r\n        <input type=\"text\" class=\"x-vert-const form-control\" id=\"x-vert-const-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" />\r\n    </div>\r\n    <div class=\"control-wrapper\">\r\n        <label class=\"x-horiz-label\" for=\"x-horiz-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Horizontal coeff of X:</label>\r\n        <input type=\"text\" class=\"x-horiz form-control\" id=\"x-horiz-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" />\r\n    </div>\r\n    <div class=\"control-wrapper\">\r\n        <label class=\"x-horiz-const-label\" for=\"x-horiz-const-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Horizontal constant:</label>\r\n        <input type=\"text\" class=\"x-horiz-const form-control\" id=\"x-horiz-const-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" />\r\n    </div>\r\n    <div class=\"control-wrapper form-check\">\r\n        <input class=\"show-solution form-check-input\" id=\"show-solution-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" type=\"checkbox\">\r\n        <label class=\"form-check-label\" for=\"show-solution-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">\r\n            Show solution directly when question is loaded.\r\n        </label>\r\n    </div>\r\n</div>";
},"useData":true});
})();