(function() {
  var template = Handlebars.template, templates = JSONCreator.Templates = JSONCreator.Templates || {};
templates['question'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"question-wrapper container\">\r\n    <h3 class=\"question-title\">\r\n        <label>Question</label>\r\n        <button class=\"delete-question btn btn-danger btn-inline\">\r\n            <span class=\"fa fa-trash\"></span>\r\n        </button>\r\n        <button class=\"exp-col-question btn btn-primary btn-inline\" data-toggle=\"collapse\" data-target=\"#question-details-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">\r\n            <span class=\"fa fa-chevron-down\"></span>\r\n            <span class=\"fa fa-chevron-up\"></span>\r\n        </button>\r\n    </h3>\r\n    <div class=\"question-details collapse show\" id=\"question-details-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">\r\n        <div class=\"control-wrapper form-check\">\r\n            <input class=\"validation form-check-input\" id=\"validation-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" type=\"checkbox\">\r\n            <label class=\"form-check-label\" for=\"validation-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Needs validation</label>\r\n        </div>\r\n        <div class=\"container\">\r\n            <h4>\r\n                <label>Audio Details</label>\r\n                <button class=\"clear-audio btn btn-danger btn-inline\">\r\n                    <span class=\"fa fa-eraser\"></span>\r\n                </button>\r\n                <button class=\"exp-col-audio btn btn-primary btn-inline\" data-toggle=\"collapse\" data-target=\"#audio-details-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">\r\n                    <span class=\"fa fa-chevron-down\"></span>\r\n                    <span class=\"fa fa-chevron-up\"></span>\r\n                </button>\r\n            </h4>\r\n            <div class=\"audio-details collapse show\" id=\"audio-details-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">\r\n                <div class=\"control-wrapper form-group\">\r\n                    <label class=\"audio-id-label\" for=\"audio-id-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">File: </label>\r\n                    <div class=\"media-wrapper\">\r\n                        <div class=\"file-data\">\r\n                            <button class=\"btn btn-primary\">\r\n                                <span class=\"fa fa-2x fa-cloud-upload\"></span>\r\n                                <span class=\"fa fa-2x fa-music\"></span>\r\n                                <span class=\"audio-data-text data-text\"></span>\r\n                            </button>\r\n                        </div>\r\n                        <input type=\"file\" class=\"audio-id form-control\" id=\"audio-id-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.audioID || (depth0 != null ? depth0.audioID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"audioID","hash":{},"data":data}) : helper)))
    + "\" />\r\n                    </div>\r\n                </div>\r\n                <div class=\"control-wrapper form-group\">\r\n                    <audio class=\"audio-tag\" id=\"audio-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" controls=\"true\" />\r\n                </div>\r\n                <div class=\"control-wrapper form-group\">\r\n                    <label class=\"audio-id-label\" for=\"res-type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Type: </label>\r\n                    <select class=\"audio-resource-type form-control\" name=\"type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" id=\"res-type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">\r\n                        <option value=\"common\">Common</option>\r\n                        <option value=\"lang\">Language specific</option>\r\n                    </select>\r\n                </div>\r\n                <div class=\"control-wrapper form-group\">\r\n                    <label class=\"caption-label\" for=\"caption-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Caption: </label>\r\n                    <input type=\"text\" class=\"caption form-control\" id=\"caption-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.caption || (depth0 != null ? depth0.caption : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"caption","hash":{},"data":data}) : helper)))
    + "\" />\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <div class=\"layout-container\"></div>\r\n        <button class=\"add-new-layout btn btn-success\">Add Another Layout</button>\r\n    </div>\r\n</div>";
},"useData":true});
})();