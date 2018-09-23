(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Components.templates = MathInteractives.Common.Components.templates || {};
templates['hintFeedback'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "﻿<div>\r\n  <div class=\"hintfeedback-header\">\r\n    <div class=\"hintfeedback-button-panel\"></div>\r\n  </div>\r\n  <div class=\"hintfeedback-content\">\r\n    <div id =\"";
  if (helper = helpers['container-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['container-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-acc-panel\" class=\"feedback-acc-panel\"></div>\r\n    <div id =\"";
  if (helper = helpers['container-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['container-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-scroll-panel\" class=\"feedback-scroll-panel\">\r\n      <div id=\"";
  if (helper = helpers['container-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['container-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-text-panel\" class=\"inner-text-panel\"></div>\r\n    </div>\r\n  </div>\r\n</div>";
  return buffer;
  });
})();