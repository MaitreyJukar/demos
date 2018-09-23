(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Components.templates = MathInteractives.Common.Components.templates || {};
templates['fractionExpr'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, self=this, functionType="function";

function program1(depth0,data) {
  
  
  return "\r\n		<div class='fraction-data-tab equation-common'><div class='numerator numerator-empty equation-common'>1\r\n	";
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n		";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.isFractionParentParenthesis), {hash:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n	";
  return buffer;
  }
function program4(depth0,data) {
  
  
  return " \r\n			<div class='fraction-data-tab adjust-bottom equation-common'><div class='numerator equation-common'>\r\n		";
  }

function program6(depth0,data) {
  
  
  return "\r\n			<div class='fraction-data-tab equation-common'><div class='numerator equation-common'>\r\n		";
  }

function program8(depth0,data) {
  
  
  return "\r\n		<div class='denominator denominator-empty equation-common'>\r\n	";
  }

function program10(depth0,data) {
  
  
  return "\r\n		<div class='denominator equation-common'>\r\n	";
  }

  buffer += "<!--Start of Fraction-->\r\n	<!--Start of Numerator-->\r\n	";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.isNumeratorEmpty), {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n	\r\n	";
  if (helper = helpers.numeratorBody) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.numeratorBody); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n	\r\n	</div> <!--End of Numerator-->\r\n\r\n	<div class='vinicullum'></div>\r\n	\r\n	<!--Start of Denominator-->\r\n	";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.isDenominatorEmpty), {hash:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n	\r\n	";
  if (helper = helpers.denominatorBody) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.denominatorBody); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n	\r\n	</div> <!--End of Denominator-->\r\n</div> <!--End of Fraction-->";
  return buffer;
  });
})();