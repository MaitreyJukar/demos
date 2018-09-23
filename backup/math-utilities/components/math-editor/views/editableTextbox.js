(function() {
  var template = Handlebars.template, templates = MathUtilities.Components.MathEditor.templates = MathUtilities.Components.MathEditor.templates || {};
templates['editableTextbox'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "﻿<div id=\"outerDiv-editor-";
  if (stack1 = helpers._divId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0._divId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"outerDiv\">\r\n  <span class=\"mathquill-editable mathquill-editable-size\" id=\"";
  if (stack1 = helpers._editorId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0._editorId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" >\r\n  </span>\r\n</div>";
  return buffer;
  });
})();