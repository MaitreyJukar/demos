(function() {
  var template = Handlebars.template, templates = MathUtilities.Components.Manager.templates = MathUtilities.Components.Manager.templates || {};
templates['elementAcc'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "﻿<div id=\"";
  if (stack1 = helpers.accId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.accId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "-acc-elem\" class=\"acc-read-elem\" role=\"";
  if (stack1 = helpers.role) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.role; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" ignore=\"true\">"
    + escapeExpression(((stack1 = ((stack1 = depth0.message),stack1 == null || stack1 === false ? stack1 : stack1.acc)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</div>";
  return buffer;
  });
})();