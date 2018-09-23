(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Interactivities.TrignometricGraphing.templates = MathInteractives.Common.Interactivities.TrignometricGraphing.templates || {};
templates['exploreTrigGraph'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "﻿<div>\r\n  <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "graphing-tab-activity-acc-container\" class=\"graphing-tab-activity-acc-container\"></div>\r\n  <div class=\"graphing-tab-activity-area\">\r\n  <div class=\"show-points-box\">\r\n  <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "show-points-label\" class=\"show-points-label\"></div>\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "show-points-select\" class=\"show-points-select\">\r\n    </div>\r\n  </div>\r\n\r\n  <div class=\"equation-container-box\">\r\n\r\n  <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "equation-container\" class=\"equation-container\">\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "output-value\" class=\"output-value\"></div>\r\n  </div>\r\n  </div>\r\n\r\n  <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "dummy-drag-help\" class=\"dummy-drag-help\"></div>\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "rotate-animation-acc-container\" class=\"rotate-animation-acc-container\"></div>\r\n\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "rotate-animation-container\" class=\"rotate-animation-container animation-canvas-container\">\r\n    <canvas id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "rotate-animation-canvas\"  width=\"450\" height=\"320\" class=\"rotate-animation-canvas transformation-animation-canvas\"></canvas>\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "circle-labels\" class=\"circle-labels\"></div>\r\n  </div>\r\n\r\n  <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "radius-container\" class=\"radius-container slider-containers\">\r\n    <div class=\"slider-text-label radius-slider-text-container\">\r\n      <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "radius-slider-text\" class=\"radius-slider-text\"></div>\r\n      <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "radius-slider-value\" class=\"radius-slider-value\"></div>\r\n    </div>\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "radius-slider-container\" class=\"radius-slider-container\">\r\n      <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "radius-slider\" class=\"radius-slider\">\r\n\r\n      </div>\r\n    </div>\r\n  </div>\r\n\r\n  <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "slider-divider\" class=\"slider-divider\"></div>\r\n  <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "distance-container\" class=\"distance-container slider-containers\">\r\n    <div class=\"slider-text-label distance-slider-text-container\">\r\n      <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "distance-slider-text\" class=\"distance-slider-text\"></div>\r\n      <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "distance-slider-value\" class=\"distance-slider-value\"></div>\r\n    </div>\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "distance-slider-container\" class=\"distance-slider-container\">\r\n      <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "distance-slider\" class=\"distance-slider\">\r\n\r\n      </div>\r\n    </div>\r\n  </div>\r\n\r\n  </div>\r\n</div>";
  return buffer;
  });
})();