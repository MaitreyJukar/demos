(function() {
  var template = Handlebars.template, templates = JSONCreator.Templates = JSONCreator.Templates || {};
templates['layout'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"layout-wrapper\">\r\n    <h4 class=\"layout-title\">\r\n        <span>Layout</span>\r\n        <button class=\"delete-layout btn btn-danger btn-inline\">\r\n            <span class=\"fa fa-trash\"></span>\r\n        </button>\r\n        <button class=\"exp-col-layout btn btn-primary btn-inline\" data-toggle=\"collapse\" data-target=\"#layout-details-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">\r\n            <span class=\"fa fa-chevron-down\"></span>\r\n            <span class=\"fa fa-chevron-up\"></span>\r\n        </button>\r\n    </h4>\r\n    <div class=\"layout-details collapse show\" id=\"layout-details-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">\r\n        <div class=\"control-wrapper form-check\">\r\n            <input class=\"form-check-input layout-type single\" type=\"radio\" name=\"radio-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" value=\"single\" id=\"single-radio-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">\r\n            <label class=\"form-check-label layout-label single-label\" for=\"single-radio-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Single</label>\r\n        </div>\r\n        <div class=\"control-wrapper form-check\">\r\n            <input class=\"form-check-input layout-type multi\" type=\"radio\" name=\"radio-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" value=\"multi\" id=\"multi-radio-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">\r\n            <label class=\"form-check-label layout-label multi-label\" for=\"multi-radio-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Multi</label>\r\n        </div>\r\n        <div class=\"row multi-component-container-wrapper\">\r\n            <div class=\"col-md-6\">\r\n                <div class=\"control-wrapper form-group\">\r\n                    <label class=\"left-width-label\" for=\"left-width-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Width: </label>\r\n                    <input type=\"text\" class=\"left-width form-control\" value=\""
    + alias4(((helper = (helper = helpers._lwidth || (depth0 != null ? depth0._lwidth : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"_lwidth","hash":{},"data":data}) : helper)))
    + "\" id=\"left-width-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" />\r\n                </div>\r\n                <div class=\"left-component-container\"></div>\r\n                <button class=\"add-new-component l-comp btn btn-success\" data-layout-type=\"left-component\">Add Another Component</button>\r\n            </div>\r\n            <div class=\"col-md-6\">\r\n                <div class=\"control-wrapper form-group\">\r\n                    <label class=\"right-width-label\" for=\"right-width-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\">Width: </label>\r\n                    <input type=\"text\" class=\"right-width form-control\" value=\""
    + alias4(((helper = (helper = helpers._rwidth || (depth0 != null ? depth0._rwidth : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"_rwidth","hash":{},"data":data}) : helper)))
    + "\" id=\"right-width-"
    + alias4(((helper = (helper = helpers.modelID || (depth0 != null ? depth0.modelID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"modelID","hash":{},"data":data}) : helper)))
    + "\" />\r\n                </div>\r\n                <div class=\"right-component-container\"></div>\r\n                <button class=\"add-new-component r-comp btn btn-success\" data-layout-type=\"right-component\">Add Another Component</button>\r\n            </div>\r\n        </div>\r\n        <div class=\"row component-container-wrapper\">\r\n            <div class=\"col-md-12\">\r\n                <div class=\"component-container\"></div>\r\n                <button class=\"add-new-component sing-comp btn btn-success\" data-layout-type=\"sing-component\">Add Another Component</button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>";
},"useData":true});
})();