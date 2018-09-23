(function() {
  var template = Handlebars.template, templates = JSONCreator.Templates = JSONCreator.Templates || {};
templates['base'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=container.lambda;

  return "<div class=\"json-creator\">\r\n    <h2>\r\n        <label>Exploration</label>\r\n        <button class=\"exp-col-exploration btn btn-primary btn-inline\" data-toggle=\"collapse\" data-target=\"#exploration-details\">\r\n            <span class=\"fa fa-chevron-down\"></span>\r\n            <span class=\"fa fa-chevron-up\"></span>\r\n        </button>\r\n        <button class=\"exp-col-all btn btn-primary btn-inline\" data-toggle=\"collapse\" data-target=\".collapse:not(#exploration-details)\">Expand/Collapse All</button>\r\n    </h2>\r\n    <div id=\"exploration-details\" class=\"collapse show\">\r\n        <div class=\"control-wrapper form-check\">\r\n            <input class=\"has-custom-css form-check-input\" id=\"has-custom-css\" type=\"checkbox\">\r\n            <label class=\"form-check-label\" for=\"has-custom-css\">\r\n                Has Custom Styles\r\n            </label>\r\n        </div>\r\n        <div class=\"control-wrapper form-group\">\r\n            <label for=\"exp-name\" class=\"exp-name-label\">Name: </label>\r\n            <input type=\"text\" id=\"exp-name\" name=\"exp-name\" class=\"form-control\" value=\""
    + alias4(((helper = (helper = helpers.explorationID || (depth0 != null ? depth0.explorationID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"explorationID","hash":{},"data":data}) : helper)))
    + "\" />\r\n        </div>\r\n        <div class=\"questions-container\">\r\n            <div class=\"added-questions\"></div>\r\n            <button class=\"add-new-question btn btn-success\">Add Another Question</button>\r\n        </div>\r\n        <div class=\"resource-container\">\r\n            <div class=\"container json-wrapper\">\r\n                <h3 id=\"json-res-holder\">Resources - JSONS</h3>\r\n                <div class=\"added-jsons\"></div>\r\n                <button class=\"add-new-json btn btn-success\">Add Another JSON</button>\r\n            </div>\r\n            <div class=\"container img-wrapper\">\r\n                <h3 id=\"json-img-holder\">Resources - Images</h3>\r\n                <div class=\"added-images\"></div>\r\n                <button class=\"add-new-image btn btn-success\">Add Another Image</button>\r\n            </div>\r\n            <div class=\"container audio-wrapper\">\r\n                <h3 id=\"json-aud-holder\">Resources - Audio</h3>\r\n                <div class=\"added-audios\"></div>\r\n                <button class=\"add-new-audio btn btn-success\">Add Another Audio</button>\r\n            </div>\r\n        </div>\r\n        <div class=\"additional-info-container container\">\r\n            <div class=\"control-wrapper form-check\">\r\n                <input class=\"has-tooltip form-check-input\" id=\"has-tooltip\" type=\"checkbox\">\r\n                <label class=\"form-check-label\" for=\"has-tooltip\">\r\n                    Has Tooltip\r\n                </label>\r\n            </div>\r\n            <h3>\r\n                <label>Tooltip Information</label>\r\n                <button class=\"exp-col-tooltip btn btn-primary btn-inline\" data-toggle=\"collapse\" data-target=\"#tooltip-details\">\r\n                    <span class=\"fa fa-chevron-down\"></span>\r\n                    <span class=\"fa fa-chevron-up\"></span>\r\n                </button>\r\n            </h3>\r\n            <div id=\"tooltip-details\" class=\"collapse show\">\r\n                <div class=\"control-wrapper form-group\">\r\n                    <label class=\"add-title-label\" for=\"add-title\">Title: </label>\r\n                    <input type=\"text\" class=\"add-info-title form-control\" id=\"add-title\" value=\""
    + alias4(alias5(((stack1 = (depth0 != null ? depth0.additionalInfo : depth0)) != null ? stack1.title : stack1), depth0))
    + "\" />\r\n                </div>\r\n                <div class=\"control-wrapper form-group\">\r\n                    <label class=\"add-content-label\" for=\"add-content\">Content: </label>\r\n                    <input type=\"text\" class=\"add-info-content form-control\" id=\"add-content\" value=\""
    + alias4(alias5(((stack1 = (depth0 != null ? depth0.additionalInfo : depth0)) != null ? stack1.content : stack1), depth0))
    + "\" />\r\n                </div>\r\n                <div class=\"control-wrapper form-group\">\r\n                    <label class=\"add-position-label\" for=\"add-position\">Position: </label>\r\n                    <select class=\"add-info-position form-control\" name=\"component-type\" id=\"add-position\">\r\n                        <option value=\"top\">Top</option>\r\n                        <option value=\"left\">Left</option>\r\n                        <option value=\"right\">Right</option>\r\n                        <option value=\"bottom\">Bottom</option>\r\n                    </select>\r\n                </div>\r\n                <div class=\"control-wrapper form-check\">\r\n                    <input class=\"has-add-info-img form-check-input\" id=\"has-add-info-img\" type=\"checkbox\">\r\n                    <label class=\"form-check-label\" for=\"has-add-info-img\">Has image in tooltip</label>\r\n                </div>\r\n                <div class=\"control-wrapper form-group img-file-container\">\r\n                    <label class=\"add-img-file-label\" for=\"add-img-file\">Image File: </label>\r\n                    <div class=\"media-wrapper\">\r\n                        <div class=\"file-data\">\r\n                            <button class=\"btn btn-primary\">\r\n                                <span class=\"fa fa-2x fa-cloud-upload\"></span>\r\n                                <span class=\"fa fa-2x fa-image\"></span>\r\n                                <span class=\"image-data-text data-text\"></span>\r\n                            </button>\r\n                        </div>\r\n                        <input type=\"file\" class=\"add-img-file form-control\" id=\"add-img-file\" />\r\n                    </div>\r\n                </div>\r\n                <div class=\"control-wrapper form-group\">\r\n                    <label class=\"tooltip-image-type-label\" for=\"tooltip-image-type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Type: </label>\r\n                    <select class=\"tooltip-image-type form-control\" name=\"tooltip-type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" id=\"tooltip-image-type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">\r\n                        <option value=\"common\">Common</option>\r\n                        <option value=\"lang\">Language specific</option>\r\n                    </select>\r\n                </div>\r\n                <div class=\"control-wrapper form-group\">\r\n                    <label class=\"add-img-alt-label\" for=\"add-img-alt\">Image Alt Text: </label>\r\n                    <input type=\"text\" class=\"add-img-alt form-control\" id=\"add-img-alt\" value=\""
    + alias4(((helper = (helper = helpers.__addImgAltTxt || (depth0 != null ? depth0.__addImgAltTxt : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"__addImgAltTxt","hash":{},"data":data}) : helper)))
    + "\" />\r\n                </div>\r\n                <div class=\"control-wrapper form-group\">\r\n                    <label class=\"post-image-content-label\" for=\"post-image-content\">Post image content: </label>\r\n                    <input type=\"text\" class=\"post-image-content form-control\" id=\"post-image-content\" value=\""
    + alias4(((helper = (helper = helpers.__postImgContent || (depth0 != null ? depth0.__postImgContent : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"__postImgContent","hash":{},"data":data}) : helper)))
    + "\" />\r\n                </div>\r\n                <div class=\"audio-holder\">\r\n                    <div class=\"control-wrapper form-group audio-file-container\">\r\n                        <label class=\"audio-id-label\" for=\"audio-id-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Tooltip Audio: </label>\r\n                        <div class=\"media-wrapper\">\r\n                            <div class=\"file-data\">\r\n                                <button class=\"btn btn-primary\">\r\n                                    <span class=\"fa fa-2x fa-cloud-upload\"></span>\r\n                                    <span class=\"fa fa-2x fa-music\"></span>\r\n                                    <span class=\"audio-data-text data-text\"></span>\r\n                                </button>\r\n                            </div>\r\n                            <input type=\"file\" class=\"audio-id form-control\" id=\"audio-id-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.audioID || (depth0 != null ? depth0.audioID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"audioID","hash":{},"data":data}) : helper)))
    + "\" />\r\n                        </div>\r\n                    </div>\r\n                    <div class=\"control-wrapper form-group\">\r\n                        <audio class=\"audio-tag\" id=\"audio-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" controls=\"true\" />\r\n                    </div>\r\n                    <div class=\"control-wrapper form-group\">\r\n                        <label class=\"audio-id-label\" for=\"tooltip-audio-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Type: </label>\r\n                        <select class=\"audio-type form-control\" name=\"type-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" id=\"tooltip-audio-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">\r\n                            <option value=\"common\">Common</option>\r\n                            <option value=\"lang\">Language specific</option>\r\n                        </select>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>";
},"useData":true});
})();