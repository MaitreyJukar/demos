(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Player.templates = MathInteractives.Common.Player.templates || {};
templates['popUp'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "﻿<div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "pop-up-modal\" class=\"pop-up-modal\">\r\n\r\n  <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "pop-up-dialogue\" class=\"pop-up-dialogue\">\r\n\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "pop-up-title-bar\" class=\"pop-up-title-bar\">\r\n      <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "pop-up-title-bar-left\" class=\"pop-up-title-bar-left\">\r\n      </div>\r\n      <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "pop-up-title-bar-mid\" class=\"pop-up-title-bar-mid\">\r\n        <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "pop-up-title\" class=\"pop-up-title\">\r\n          <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "pop-up-title-image\" class=\"pop-up-title-image\"></div>\r\n          <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "pop-up-title-text\" class=\"pop-up-title-text\">";
  if (stack1 = helpers.popupTitle) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.popupTitle; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>\r\n        </div>\r\n\r\n        <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "pop-up-header-btns\" class=\"pop-up-header-btns-cont\">\r\n          <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "pop-up-tts-container\" class=\"pop-up-tts-container tts-container\"></div>\r\n          <div class=\"pop-up-close-btn\" id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "pop-up-close-btn\"></div>\r\n        </div>\r\n      </div>\r\n      <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "pop-up-title-bar-right\" class=\"pop-up-title-bar-right\">\r\n      </div>\r\n    </div>\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "pop-up-body\" class=\"pop-up-body\">\r\n      <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "pop-up-text\" class=\"pop-up-text\">\r\n        ";
  if (stack1 = helpers.popupText) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.popupText; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n      </div>\r\n\r\n      <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "pop-up-btns-container\" class=\"pop-up-btns-container\"></div>\r\n      <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "pop-up-text-ie9-focusout-fix\" class=\"pop-up-text-ie9-focusout-fix\"></div>\r\n    </div>\r\n  </div>\r\n</div>\r\n";
  return buffer;
  });
})();