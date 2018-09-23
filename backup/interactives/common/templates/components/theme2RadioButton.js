(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Components.templates = MathInteractives.Common.Components.templates || {};
templates['theme2RadioButton'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper, options;
  buffer += "\r\n";
  options={hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data}
  if (helper = helpers.radioButtonLabel) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0.radioButtonLabel); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers.radioButtonLabel) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\r\n<div class=\"de-mathematics-interactive-theme2-radio-button single-theme2-radio-container\">\r\n    <div id=\"";
  if (helper = helpers.radioID) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.radioID); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"de-mathematics-interactive-theme2-radio-button radio-button-div-container float-left normal\">\r\n	 <div class=\"theme2-radio-button-selceted-dot-container radio-elements\">\r\n		<div class=\"theme2-radio-button-selceted-dot\"></div>\r\n	 </div>\r\n	</div>\r\n    <div class=\"de-mathematics-interactive-radio-button text-container radio-elements typography-body-text\">";
  if (helper = helpers.text) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.text); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>\r\n</div>\r\n";
  return buffer;
  }

  buffer += "﻿";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.radioButtonLabel)),stack1 == null || stack1 === false ? stack1 : stack1.length), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  });
})();