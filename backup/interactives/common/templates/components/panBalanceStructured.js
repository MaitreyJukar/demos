(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Components.templates = MathInteractives.Common.Components.templates || {};
templates['panBalanceStructured'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "﻿<div class=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "pan-balance-structured-wrapper pan-balance-structured-wrapper-main\">\r\n\r\n    <div class=\"pan-wrapper left-pan-wrapper\">\r\n        <div class=\"left-tile-container tile-container\">\r\n            <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-left-static-container\" class=\"static-container\"></div>\r\n            <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-left-dynamic-container\" class=\"dynamic-container\">\r\n                <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-left-accessibility-dynamic-wrapper\" class=\"accessibility-dynamic-wrapper\" data-pos=\"left\"></div>\r\n                <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-left-dynamic-wrapper\" class=\"dynamic-wrapper\" data-pos=\"left\"></div>\r\n            </div>\r\n        </div>\r\n        <div class=\"pan left-pan\">\r\n            <div class=\"pan-data typography-label\">\r\n                <span class=\"pan-label\"></span>\r\n            </div>\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"pan-wrapper right-pan-wrapper\">\r\n        <div class=\"right-tile-container tile-container\">\r\n            <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-right-static-container\" class=\"static-container\"></div>\r\n            <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-right-dynamic-container\" class=\"dynamic-container\">\r\n                <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-right-accessibility-dynamic-wrapper\" class=\"accessibility-dynamic-wrapper\" data-pos=\"right\"></div>\r\n                <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-right-dynamic-wrapper\" class=\"dynamic-wrapper\" data-pos=\"right\"></div>\r\n            </div>\r\n        </div>\r\n        <div class=\"pan right-pan\">\r\n            <div class=\"pan-data typography-label\">\r\n                <span class=\"pan-label\"></span>\r\n            </div>\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"dispenser-container\" id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-dispenser-container\">\r\n        <div class=\"dispenser-wrapper\">\r\n            <div class=\"dispenser-row-1\"></div>\r\n            <div class=\"dispenser-row-2\"></div>\r\n        </div>\r\n    </div>\r\n\r\n\r\n    <div class=\"center-rod\"></div>\r\n    <div class=\"base\"></div>\r\n    <div class=\"small-rod left-small-rod\"></div>\r\n    <div class=\"small-rod right-small-rod\"></div>\r\n\r\n    <div class=\"temporary-bins-container\">\r\n        <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-left-accessibility-temporary-bin\" class=\"accessibility-temporary-bin\" data-pos=\"left\"></div>\r\n        <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-left-temporary-bin\" class=\"left-temporary-bin temporary-bin\" data-pos=\"left\"></div>\r\n        <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-right-accessibility-temporary-bin\" class=\"right-accessibility-temporary-bin accessibility-temporary-bin\" data-pos=\"right\"></div>\r\n        <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-right-temporary-bin\" class=\"right-temporary-bin temporary-bin\" data-pos=\"right\"></div>\r\n    </div>\r\n</div>\r\n";
  return buffer;
  });
})();