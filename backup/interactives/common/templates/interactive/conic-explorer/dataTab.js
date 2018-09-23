(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Interactivities.ConicExplorer.templates = MathInteractives.Common.Interactivities.ConicExplorer.templates || {};
templates['dataTab'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "﻿<div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "your-data-label\" class=\"your-data-label\"></div>\r\n<div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "dummy-view-button-1\" class=\"dummy-view-button-1\"></div>\r\n<div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "record-data-table-container\" class=\"record-data-table-container\"></div>\r\n<div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "horizontal-diagram-container\" class=\"horizontal-diagram-container\">\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "horizontal-equation-container\" class=\"equation-container\">\r\n        <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "horizontal-equation-label\" class=\"horizontal-equation-label\"></div>\r\n        <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "horizontal-equation-text\" class=\"horizontal-equation-text\"></div>\r\n    </div>\r\n    <div class=\"horizontal-separator\"></div>\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "horizontal-diagram-image\" class=\"horizontal-diagram-image\"></div>\r\n</div>\r\n<div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "vertical-separator\" class=\"vertical-separator\"></div>\r\n<div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "vertical-diagram-container\" class=\"vertical-diagram-container\">\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "vertical-equation-container\" class=\"equation-container\">\r\n        <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "vertical-equation-label\" class=\"vertical-equation-label\"></div>\r\n        <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "vertical-equation-text\" class=\"vertical-equation-text\"></div>\r\n    </div>\r\n    <div class=\"horizontal-separator\"></div>\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "vertical-diagram-image\" class=\"vertical-diagram-image\"></div>\r\n</div>\r\n<div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "go-back-btn\" class=\"go-back-btn\"></div>";
  return buffer;
  });
})();