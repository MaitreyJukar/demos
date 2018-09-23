(function() {
  var template = Handlebars.template, templates = MathUtilities.Components.ToolHolder.Templates = MathUtilities.Components.ToolHolder.Templates || {};
templates['toolContainer'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"math-tool-container-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"tool-holder-tool-container\">\r\n</div>";
  return buffer;
  });
})();