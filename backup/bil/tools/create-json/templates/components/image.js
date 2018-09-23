(function() {
  var template = Handlebars.template, templates = JSONCreator.Templates = JSONCreator.Templates || {};
templates['image'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"image-template\">\r\n    <div class=\"control-wrapper form-group\">\r\n        <label class=\"label container-css-label\" for=\"image-file-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Image File: </label>\r\n        <div class=\"media-wrapper\">\r\n            <div class=\"file-data\">\r\n                <button class=\"btn btn-primary\">\r\n                    <span class=\"fa fa-2x fa-cloud-upload\"></span>\r\n                    <span class=\"fa fa-2x fa-image\"></span>\r\n                    <span class=\"image-data-text data-text\"></span>\r\n                </button>\r\n            </div>\r\n            <input type=\"file\" class=\"container-image-file form-control\" id=\"image-file-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" />\r\n        </div>\r\n    </div>\r\n    <div class=\"control-wrapper form-group\">\r\n        <label class=\"image-id-label\" for=\"image-res-type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Type: </label>\r\n        <select class=\"image-resource-type form-control\" name=\"type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" id=\"image-res-type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">\r\n            <option value=\"common\">Common</option>\r\n            <option value=\"lang\">Language specific</option>\r\n        </select>\r\n    </div>\r\n    <div class=\"control-wrapper form-group\">\r\n        <label class=\"label container-css-label\" for=\"css-class-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">CSS Class: </label>\r\n        <input type=\"text\" class=\"container-css-class form-control\" id=\"css-class-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.containerCssClass || (depth0 != null ? depth0.containerCssClass : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"containerCssClass","hash":{},"data":data}) : helper)))
    + "\" />\r\n    </div>\r\n    <div class=\"control-wrapper form-group\">\r\n        <label class=\"label alt-text-label\" for=\"alt-txt-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Alt Text: </label>\r\n        <input type=\"text\" class=\"alt-text-class form-control\" id=\"alt-txt-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.altText || (depth0 != null ? depth0.altText : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"altText","hash":{},"data":data}) : helper)))
    + "\" />\r\n    </div>\r\n</div>";
},"useData":true});
})();