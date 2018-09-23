(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Player.templates = MathInteractives.Common.Player.templates || {};
templates['definitionBox'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "﻿<div class=\"hint-box-container\">\r\n  <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "hint-box-header\" class=\"hint-box-header\">\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "hint-box-title\" class=\"hint-box-title\">\r\n      ";
  if (stack1 = helpers.definitionBoxTitle) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.definitionBoxTitle; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </div>\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "hint-box-header-buttons\" class=\"hint-box-header-buttons\">\r\n      <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "hint-box-tts-container\" class=\"hint-box-tts-container\"></div>\r\n      <!--<div id=\"hint-box-pause-container\" class=\"hint-box-pause-container pause-tts-container\">\r\n      <div id=\"hint-box-pause-tts\" class=\"pause-tts\"></div>\r\n    </div>\r\n    <div id=\"hint-box-tts-container\" class=\"tts-container\">\r\n      <div class=\"hint-box-audio-button-holder tts\"></div>\r\n    </div>-->\r\n      <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "hint-box-close-button\" class=\"hint-box-close-button\"></div>\r\n    </div>\r\n  </div>\r\n  <div class=\"hint-box-text-container\">\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "hint-box-content\" class=\"hint-box-content\">\r\n      ";
  if (stack1 = helpers.definitionBoxContent) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.definitionBoxContent; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </div>\r\n  </div>\r\n</div>";
  return buffer;
  });
})();