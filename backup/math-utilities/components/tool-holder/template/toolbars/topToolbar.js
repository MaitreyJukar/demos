(function() {
  var template = Handlebars.template, templates = MathUtilities.Components.ToolHolder.Templates = MathUtilities.Components.ToolHolder.Templates || {};
templates['topToolbar'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"math-tool-top-toolbar-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"toolbar-holder math-tool-top-toolbar\">\r\n  <div id=\"math-tool-toolbar-top-container-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"top-toolbar-container\">\r\n    <div id=\"math-tool-title-container-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"tool-title-container\">\r\n      <div id=\"math-tool-title-icon-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"tool-icon\"></div>\r\n      <div id=\"math-tool-title-text-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\r\n        <div id=\"math-title-text-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"tool-text\"></div>\r\n      </div>\r\n    </div>\r\n    <div id=\"math-tool-top-button-container-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"top-toolbar-button-container\">\r\n      <div id=\"math-tool-btn-help-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"top-toolbar-btn header-btn math-tool-btn-help\" data-toolid=\"";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"></div>\r\n    </div>\r\n  </div>\r\n</div>\r\n";
  return buffer;
  });
})();