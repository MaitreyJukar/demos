(function() {
  var template = Handlebars.template, templates = JSONCreator.Templates = JSONCreator.Templates || {};
templates['component'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"component-wrapper container\">\r\n    <h5 class=\"component-title\">\r\n        <span>Component</span>\r\n        <button class=\"delete-compo btn btn-danger btn-inline\">\r\n            <span class=\"fa fa-trash\"></span>\r\n        </button>\r\n        <button class=\"exp-col-component btn btn-primary btn-inline\" data-toggle=\"collapse\" data-target=\"#component-details-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">\r\n            <span class=\"fa fa-chevron-down\"></span>\r\n            <span class=\"fa fa-chevron-up\"></span>\r\n        </button>\r\n    </h5>\r\n    <div class=\"component-details collapse show\" id=\"component-details-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">\r\n        <div class=\"control-wrapper\">\r\n            <label class=\"component-type-label\" for=\"type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Type: </label>\r\n            <select class=\"component-type form-control\" name=\"component-type\" id=\"type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">\r\n                <option value=\"learnosity\">Learnosity</option>\r\n                <option value=\"desmos\">Desmos</option>\r\n                <option value=\"html\">HTML</option>\r\n                <option value=\"grid\">Algebra Tiles</option>\r\n                <option value=\"controls\">Question Controls</option>\r\n                <option value=\"image\">Image</option>\r\n            </select>\r\n        </div>\r\n        <div class=\"component-data\"></div>\r\n    </div>\r\n</div>";
},"useData":true});
})();