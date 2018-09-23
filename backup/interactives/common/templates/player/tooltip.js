(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Player.templates = MathInteractives.Common.Player.templates || {};
templates['tooltip'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "﻿<div class=\"tooltips\" id=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"> \r\n    <div class=\"tooltip-left\"></div> \r\n    <div class=\"tooltip-mid\">";
  if (stack1 = helpers.content) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.content; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\r\n    <div class=\"tooltip-right\"></div>\r\n    <div class=\"tooltip-arrow\"></div>\r\n</div>\r\n";
  return buffer;
  });
})();