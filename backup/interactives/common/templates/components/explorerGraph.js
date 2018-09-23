(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Components.templates = MathInteractives.Common.Components.templates || {};
templates['explorerGraph'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "﻿<div class=\"explore-graph-acc-container\"></div>\r\n<div class=\"canvas-holder\">\r\n  <canvas class=\"canvas-element\" height=\"";
  if (helper = helpers.height) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.height); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" width=\"";
  if (helper = helpers.width) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.width); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"></canvas>\r\n  <div class=\"canvas-tooltip\"></div>\r\n</div>\r\n";
  return buffer;
  });
})();