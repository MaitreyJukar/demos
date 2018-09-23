(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Components.templates = MathInteractives.Common.Components.templates || {};
templates['parenthesesTemplate'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\r\n<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"16\" height=\"126\" focusable=\"false\">\r\n  <defs/>\r\n  <g>\r\n    <path stroke=\"none\" fill=\"";
  if (helper = helpers.color) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.color); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" d=\"M16 25.05 L16.05 105.95 Q15.35 112.65 11.2 118.15 6.8 123.9 0 126.35 13.7 117.5 13.9 103.6 L13.85 25.05 16 25.05\"/>\r\n    <path stroke=\"none\" fill=\"";
  if (helper = helpers.color) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.color); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" d=\"M0 0.05 Q6.8 2.5 11.2 8.25 15.35 13.75 16.05 20.45 L16 101.35 13.85 101.35 13.9 22.8 Q13.7 8.9 0 0.05\"/>\r\n  </g>\r\n</svg>  \r\n";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\r\n<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"9\" height=\"54\">\r\n  <defs/>\r\n  <g>\r\n    <path stroke=\"none\" fill=\"";
  if (helper = helpers.color) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.color); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" d=\"M9 14.5 L9 30.4 6.05 30.4 6.1 14.15 Q5.7 4.1 -0.05 0.05 8.2 2.25 9 14.5\"/>\r\n    <path stroke=\"none\" fill=\"";
  if (helper = helpers.color) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.color); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" d=\"M6.05 23.6 L9 23.6 9 39.5 Q8.2 51.75 -0.05 53.95 5.7 49.9 6.1 39.85 L6.05 23.6\"/>\r\n  </g>\r\n</svg>\r\n";
  return buffer;
  }

  buffer += "﻿";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.isBigParentheses), {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  });
})();