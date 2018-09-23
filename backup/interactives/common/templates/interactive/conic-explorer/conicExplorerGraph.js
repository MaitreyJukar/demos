(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Interactivities.ConicExplorer.templates = MathInteractives.Common.Interactivities.ConicExplorer.templates || {};
templates['conicExplorerGraph'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "﻿<div class=\"conic-graph-acc-container\"></div>\r\n<div class=\"canvas-holder\">\r\n  <canvas class=\"canvas-element\" height=\"";
  if (stack1 = helpers.height) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.height; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" width=\"";
  if (stack1 = helpers.width) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.width; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"></canvas>\r\n</div>";
  return buffer;
  });
})();