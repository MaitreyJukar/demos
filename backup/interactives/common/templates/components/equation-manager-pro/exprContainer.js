(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Components.templates = MathInteractives.Common.Components.templates || {};
templates['exprContainer'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, self=this, functionType="function";

function program1(depth0,data) {
  
  
  return "\r\n	<div class='left-expression-container equation-common'><div class='left-expression equation-common expression-common'>\r\n";
  }

function program3(depth0,data) {
  
  
  return "\r\n	<div class='right-expression-container equation-common'><div class='right-expression equation-common expression-common'>\r\n";
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.isLHS), {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n	";
  if (helper = helpers.exprBody) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.exprBody); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n</div></div>";
  return buffer;
  });
})();