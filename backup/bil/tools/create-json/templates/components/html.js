(function() {
  var template = Handlebars.template, templates = JSONCreator.Templates = JSONCreator.Templates || {};
templates['html'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"html-template\">\r\n    <div class=\"control-wrapper form-group\">\r\n        <label class=\"label css-class-label\" for=\"css-class-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">CSS Class: </label>\r\n        <input type=\"text\" class=\"css-class form-control\" id=\"css-class-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.cssClass || (depth0 != null ? depth0.cssClass : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"cssClass","hash":{},"data":data}) : helper)))
    + "\" />\r\n    </div>\r\n    <div class=\"control-wrapper\">\r\n        <label class=\"label css-class-label d-inline-b va-middle\" for=\"inner-html-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">HTML: </label>\r\n        <textarea class=\"inner-html d-inline-b va-middle\" id=\"inner-html-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.innerHTML || (depth0 != null ? depth0.innerHTML : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"innerHTML","hash":{},"data":data}) : helper)))
    + "</textarea>\r\n    </div>\r\n</div>";
},"useData":true});
})();