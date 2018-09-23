(function() {
  var template = Handlebars.template, templates = JSONCreator.Templates = JSONCreator.Templates || {};
templates['learnosity'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"learnosity-holder\">\r\n    <div class=\"control-wrapper form-group\">\r\n        <label class=\"data-ref-label\" for=\"ref-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Learnosity ID: </label>\r\n        <input type=\"text\" class=\"data-ref form-control\" id=\"ref-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" />\r\n    </div>\r\n</div>";
},"useData":true});
})();