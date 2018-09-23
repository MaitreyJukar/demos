(function() {
  var template = Handlebars.template, templates = JSONCreator.Templates = JSONCreator.Templates || {};
templates['desmos'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"desmos-holder\">\r\n    <div class=\"control-wrapper\">\r\n        <label class=\"desmos-type-label\" for=\"desmos-type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Desmos Type: </label>\r\n        <select class=\"desmos-type form-control\" name=\"desmos-type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" id=\"desmos-type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">\r\n            <option value=\"calculator\">Calculator</option>\r\n        </select>\r\n    </div>\r\n    <div class=\"control-wrapper form-group\">\r\n        <label class=\"desmos-url-label\" for=\"desmos-url-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Desmos URL: </label>\r\n        <input type=\"text\" class=\"desmos-url form-control\" id=\"desmos-url-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" />\r\n    </div>\r\n</div>";
},"useData":true});
})();