(function() {
  var template = Handlebars.template, templates = MathUtilities.Components.Manager.templates = MathUtilities.Components.Manager.templates || {};
templates['elementNoAcc'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, functionType="function";


  buffer += "﻿<span class=\"localised-text\">";
  stack2 = ((stack1 = ((stack1 = depth0.message),stack1 == null || stack1 === false ? stack1 : stack1.loc)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1);
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "</span>\r\n";
  return buffer;
  });
})();