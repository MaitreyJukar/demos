(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Components.templates = MathInteractives.Common.Components.templates || {};
templates['baseTilePro'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return " \r\n    <div class=\"acc-div acc-read-elem math-utilities-manager-access\"></div>\r\n    ";
  }

  buffer += "﻿<div class=\"base-inner ";
  if (helper = helpers.level) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.level); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\r\n    ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.isAccessible), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    <div class=\"base-container ";
  if (helper = helpers['base-class']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['base-class']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " ";
  if (helper = helpers.level) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.level); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " \" data-tiletype=\"";
  if (helper = helpers.baseTileType) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.baseTileType); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\r\n        <div class=\"base-value\">";
  if (helper = helpers.base) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.base); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>\r\n        <div class=\"box\">\r\n            <div class=\"inside-divs\"></div>\r\n            <div class=\"inside-divs\"></div>\r\n            <div class=\"inside-divs\"></div>\r\n            <div class=\"inside-divs\"></div>\r\n            <div class=\"inside-divs\"></div>\r\n            <div class=\"inside-divs\"></div>\r\n        </div>\r\n    </div>\r\n</div>";
  return buffer;
  });
})();