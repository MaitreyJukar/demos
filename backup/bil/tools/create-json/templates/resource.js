(function() {
  var template = Handlebars.template, templates = JSONCreator.Templates = JSONCreator.Templates || {};
templates['resource'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"added-resource-holder container\">\r\n    <h4>Resource</h4>\r\n    <div class=\"control-wrapper\">\r\n        <label class=\"resource-type-label\" for=\"res-type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" title=\""
    + alias4(((helper = (helper = helpers.typeTitle || (depth0 != null ? depth0.typeTitle : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"typeTitle","hash":{},"data":data}) : helper)))
    + "\">Type: </label>\r\n        <select class=\"resource-type form-control\" name=\"type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" id=\"res-type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">\r\n            <option value=\"common\">Common</option>\r\n            <option value=\"lang\">Language specific</option>\r\n        </select>\r\n    </div>\r\n    <div class=\"control-wrapper form-group\">\r\n        <label class=\"resource-label\" for=\"res-id-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" title=\""
    + alias4(((helper = (helper = helpers.idTitle || (depth0 != null ? depth0.idTitle : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"idTitle","hash":{},"data":data}) : helper)))
    + "\">Resource ID: </label>\r\n        <input class=\"resource-id form-control\" id=\"res-id-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" name=\"id-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.resourceID || (depth0 != null ? depth0.resourceID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"resourceID","hash":{},"data":data}) : helper)))
    + "\" placeholder=\""
    + alias4(((helper = (helper = helpers.idPlaceholder || (depth0 != null ? depth0.idPlaceholder : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"idPlaceholder","hash":{},"data":data}) : helper)))
    + "\" />\r\n    </div>\r\n    <div class=\"control-wrapper form-group\">\r\n        <label class=\"resource-label\" for=\"res-name-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" title=\""
    + alias4(((helper = (helper = helpers.urlTitle || (depth0 != null ? depth0.urlTitle : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"urlTitle","hash":{},"data":data}) : helper)))
    + "\">Resource File Name: </label>\r\n        <input class=\"resource-name form-control\" id=\"res-name-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" name=\"name-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.resourceURL || (depth0 != null ? depth0.resourceURL : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"resourceURL","hash":{},"data":data}) : helper)))
    + "\" placeholder=\""
    + alias4(((helper = (helper = helpers.urlPlaceholder || (depth0 != null ? depth0.urlPlaceholder : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"urlPlaceholder","hash":{},"data":data}) : helper)))
    + "\" />\r\n    </div>\r\n    <button class=\"delete-media btn btn-success\">Delete</button>\r\n</div>";
},"useData":true});
})();