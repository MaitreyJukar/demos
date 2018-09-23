(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Interactivities.TrignometricGraphing.templates = MathInteractives.Common.Interactivities.TrignometricGraphing.templates || {};
templates['surdsFormat'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "\r\n\r\n    ";
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n    <mn>";
  if (stack1 = helpers.radiusNormal) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radiusNormal); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>.</mo><mn>";
  if (stack1 = helpers.radiusDecimal) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radiusDecimal); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#183;</mo>\r\n    ";
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n    <mn>";
  if (stack1 = helpers.radiusNormal) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radiusNormal); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#183;</mo>\r\n    ";
  return buffer;
  }

function program7(depth0,data) {
  
  
  return "\r\n      \r\n      ";
  }

function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n      <mn>";
  if (stack1 = helpers.distanceNormal) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.distanceNormal); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>.</mo><mn>";
  if (stack1 = helpers.distanceDecimal) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.distanceDecimal); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#183;</mo>\r\n      ";
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n      <mn>";
  if (stack1 = helpers.distanceNormal) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.distanceNormal); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#183;</mo>\r\n      ";
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n        <mn>";
  if (stack1 = helpers.angleNormal) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.angleNormal); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn>\r\n      ";
  return buffer;
  }

function program15(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n        <mo>"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.angleType)),stack1 == null || stack1 === false ? stack1 : stack1.angleOperator)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</mo><mi mathvariant=\"normal\">&#960;</mi>\r\n      ";
  return buffer;
  }

function program17(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n        <mfrac><mrow><mn>";
  if (stack1 = helpers.angleNormal) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.angleNormal); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mrow><mn>";
  if (stack1 = helpers.angleDenominator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.angleDenominator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mfrac>\r\n      ";
  return buffer;
  }

function program19(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type1), {hash:{},inverse:self.noop,fn:self.program(20, program20, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type2), {hash:{},inverse:self.noop,fn:self.program(22, program22, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type3), {hash:{},inverse:self.noop,fn:self.program(24, program24, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type4), {hash:{},inverse:self.noop,fn:self.program(26, program26, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type5), {hash:{},inverse:self.noop,fn:self.program(28, program28, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type6), {hash:{},inverse:self.noop,fn:self.program(30, program30, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n    \r\n     ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type7), {hash:{},inverse:self.noop,fn:self.program(32, program32, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n  \r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type8), {hash:{},inverse:self.noop,fn:self.program(34, program34, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n    \r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type9), {hash:{},inverse:self.noop,fn:self.program(36, program36, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type10), {hash:{},inverse:self.noop,fn:self.program(38, program38, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type11), {hash:{},inverse:self.noop,fn:self.program(40, program40, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type12), {hash:{},inverse:self.noop,fn:self.program(42, program42, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type13), {hash:{},inverse:self.noop,fn:self.program(44, program44, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type14), {hash:{},inverse:self.noop,fn:self.program(46, program46, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type15), {hash:{},inverse:self.noop,fn:self.program(48, program48, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type16), {hash:{},inverse:self.noop,fn:self.program(50, program50, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  return buffer;
  }
function program20(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " <!-- sqrt(sqrt(x)+sqrt(x)))/y-->    \r\n    <mfrac><mrow><mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><msqrt><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></msqrt></mrow><mn>";
  if (stack1 = helpers.val3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mfrac>\r\n    ";
  return buffer;
  }

function program22(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " <!-- sqrt(x+sqrt(x)))/y-->\r\n    <mfrac><mrow><mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></msqrt></mrow><mn>";
  if (stack1 = helpers.val3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mfrac>\r\n    ";
  return buffer;
  }

function program24(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "   <!-- sqrt(sqrt(x)+x))/y-->\r\n    <mfrac><mrow><mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><msqrt><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></mrow><mn>";
  if (stack1 = helpers.val3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mfrac>\r\n    ";
  return buffer;
  }

function program26(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- sqrt(x+x))/y-->\r\n    <mfrac><mrow><mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></mrow><mn>";
  if (stack1 = helpers.val3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mfrac>\r\n    ";
  return buffer;
  }

function program28(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- sqrt(x+sqrt(x+x))/y-->\r\n          <mfrac><mrow><mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mrow><mn>";
  if (stack1 = helpers.val3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mfrac><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val4) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val4); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></msqrt></msqrt>\r\n    ";
  return buffer;
  }

function program30(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- x/y-->\r\n      <mfrac><mrow><mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mrow><mn>";
  if (stack1 = helpers.val3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mfrac>\r\n    ";
  return buffer;
  }

function program32(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- sqrt(x)/y-->    <!-- Tan value 0.5774 & 1.7321 -->\r\n      <mfrac><mrow><mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></mrow><mn>";
  if (stack1 = helpers.val3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mfrac>\r\n    ";
  return buffer;
  }

function program34(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " <!-- x/sqrt(y)-->\r\n      <mfrac><mrow><mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mrow><mrow><mn>";
  if (stack1 = helpers.val3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><msqrt><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></mrow></mfrac>\r\n    ";
  return buffer;
  }

function program36(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- sqrt(x)/sqrt(y)-->\r\n      <mfrac><mrow><mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></mrow><msqrt><mn>";
  if (stack1 = helpers.val3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></mfrac>\r\n    ";
  return buffer;
  }

function program38(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- x -->\r\n      <mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn>\r\n    ";
  return buffer;
  }

function program40(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- sqrt(x+sqrt(x+sqrt(x)))/y-->\r\n        <mfrac><mrow><mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mrow><mn>";
  if (stack1 = helpers.val3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mfrac><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>";
  if (stack1 = helpers.operator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><msqrt><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>";
  if (stack1 = helpers.operator1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><msqrt><mn>";
  if (stack1 = helpers.val4) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val4); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></msqrt></msqrt>\r\n    ";
  return buffer;
  }

function program42(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- Tan value 0.1989 && 5.0273 -->\r\n        <mfrac><mrow><mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mrow><mn>";
  if (stack1 = helpers.val3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mfrac><mfenced><mrow><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>";
  if (stack1 = helpers.operator1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><msqrt><mn>";
  if (stack1 = helpers.val4) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val4); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></msqrt><mo>";
  if (stack1 = helpers.operator2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><msqrt><mn>";
  if (stack1 = helpers.val5) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val5); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo></msqrt><mo>";
  if (stack1 = helpers.operator3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.val6) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val6); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mrow></mfenced>\r\n    ";
  return buffer;
  }

function program44(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- Tan value 0.2679 && 3.7321-->\r\n      <mfrac><mrow><mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><mfenced><mrow><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></mrow></mfenced></mrow><mn>";
  if (stack1 = helpers.val3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mfrac>\r\n    ";
  return buffer;
  }

function program46(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- Tan value 0.4142 && 2.4142 -->\r\n      <mfrac><mrow><mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><mfenced><mrow><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mrow></mfenced></mrow><mn>";
  if (stack1 = helpers.val3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mfrac>\r\n    ";
  return buffer;
  }

function program48(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " <!-- Tan value 0.6682 && 1.4966 -->\r\n        <mfrac><mrow><mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mrow><mn>";
  if (stack1 = helpers.val3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mfrac><mo>&#160;</mo><mfenced><mrow><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></msqrt><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><mn>";
  if (stack1 = helpers.val4) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val4); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mrow></mfenced><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val5) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val5); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><mn>";
  if (stack1 = helpers.val6) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val6); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn>\r\n    ";
  return buffer;
  }

function program50(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- ∞ -->\r\n    <mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><mn>";
  if (stack1 = helpers.Infinity) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.Infinity); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn>\r\n    ";
  return buffer;
  }

function program52(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type1), {hash:{},inverse:self.noop,fn:self.program(53, program53, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type2), {hash:{},inverse:self.noop,fn:self.program(55, program55, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type3), {hash:{},inverse:self.noop,fn:self.program(57, program57, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type4), {hash:{},inverse:self.noop,fn:self.program(59, program59, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type5), {hash:{},inverse:self.noop,fn:self.program(61, program61, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type6), {hash:{},inverse:self.noop,fn:self.program(63, program63, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n    \r\n     ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type7), {hash:{},inverse:self.noop,fn:self.program(65, program65, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n  \r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type8), {hash:{},inverse:self.noop,fn:self.program(67, program67, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n    \r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type9), {hash:{},inverse:self.noop,fn:self.program(69, program69, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type10), {hash:{},inverse:self.noop,fn:self.program(38, program38, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type11), {hash:{},inverse:self.noop,fn:self.program(71, program71, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n  \r\n   ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type12), {hash:{},inverse:self.noop,fn:self.program(73, program73, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type13), {hash:{},inverse:self.noop,fn:self.program(78, program78, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type14), {hash:{},inverse:self.noop,fn:self.program(83, program83, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type15), {hash:{},inverse:self.noop,fn:self.program(88, program88, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.surdType)),stack1 == null || stack1 === false ? stack1 : stack1.Type16), {hash:{},inverse:self.noop,fn:self.program(93, program93, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  return buffer;
  }
function program53(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " <!-- sqrt(sqrt(x)+sqrt(x)))/y-->    \r\n      <mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><msqrt><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></msqrt>\r\n    ";
  return buffer;
  }

function program55(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " <!-- sqrt(x+sqrt(x)))/y-->\r\n    <mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></msqrt>\r\n    ";
  return buffer;
  }

function program57(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "   <!-- sqrt(sqrt(x)+x))/y-->\r\n    <mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><msqrt><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt>\r\n    ";
  return buffer;
  }

function program59(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- sqrt(x+x))/y-->\r\n    <mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt>\r\n    ";
  return buffer;
  }

function program61(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- sqrt(x+sqrt(x+x))/y-->\r\n        <mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val4) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val4); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></msqrt></msqrt>\r\n    ";
  return buffer;
  }

function program63(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- x/y-->\r\n      <mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn>\r\n    ";
  return buffer;
  }

function program65(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- sqrt(x)/y-->\r\n      <mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt>\r\n    ";
  return buffer;
  }

function program67(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " <!-- x/sqrt(y)-->\r\n      <mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn>\r\n    ";
  return buffer;
  }

function program69(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- sqrt(x)/sqrt(y)-->\r\n      <mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt>\r\n    ";
  return buffer;
  }

function program71(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- sqrt(x+sqrt(x+sqrt(x)))-->\r\n        <mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>";
  if (stack1 = helpers.operator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><msqrt><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>";
  if (stack1 = helpers.operator1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><msqrt><mn>";
  if (stack1 = helpers.val4) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val4); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></msqrt></msqrt>\r\n    ";
  return buffer;
  }

function program73(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- Tan value 0.1989 & 0.6682 && 1.4966 && 5.0273 -->\r\n    ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.fenced), {hash:{},inverse:self.program(76, program76, data),fn:self.program(74, program74, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    ";
  return buffer;
  }
function program74(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n       <mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mfenced><mrow><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>";
  if (stack1 = helpers.operator1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><msqrt><mn>";
  if (stack1 = helpers.val4) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val4); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></msqrt><mo>";
  if (stack1 = helpers.operator2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><msqrt><mn>";
  if (stack1 = helpers.val5) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val5); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo></msqrt><mo>";
  if (stack1 = helpers.operator3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.val6) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val6); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mrow></mfenced>\r\n     ";
  return buffer;
  }

function program76(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n        <mrow><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>";
  if (stack1 = helpers.operator1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><msqrt><mn>";
  if (stack1 = helpers.val4) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val4); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></msqrt><mo>";
  if (stack1 = helpers.operator2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><msqrt><mn>";
  if (stack1 = helpers.val5) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val5); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo></msqrt><mo>";
  if (stack1 = helpers.operator3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.val6) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val6); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mrow>\r\n      ";
  return buffer;
  }

function program78(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- Tan value 0.2679 && 3.7321-->\r\n      ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.fenced), {hash:{},inverse:self.program(81, program81, data),fn:self.program(79, program79, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    ";
  return buffer;
  }
function program79(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n        <mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><mfenced><mrow><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></mrow></mfenced>\r\n      ";
  return buffer;
  }

function program81(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n        <mrow><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></mrow>\r\n      ";
  return buffer;
  }

function program83(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- Tan value 0.4142 && 2.4142 -->\r\n     ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.fenced), {hash:{},inverse:self.program(86, program86, data),fn:self.program(84, program84, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    ";
  return buffer;
  }
function program84(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n        <mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><mfenced><mrow><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mrow></mfenced>\r\n     ";
  return buffer;
  }

function program86(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n        <mrow><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mrow>\r\n      ";
  return buffer;
  }

function program88(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " <!-- Tan value 0.6682 && 1.4966 -->\r\n      ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.fenced), {hash:{},inverse:self.program(91, program91, data),fn:self.program(89, program89, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    ";
  return buffer;
  }
function program89(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n        <mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><mn>";
  if (stack1 = helpers.radius) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.radius); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><mfenced><mrow><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></msqrt><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><mn>";
  if (stack1 = helpers.val4) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val4); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mrow></mfenced><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val5) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val5); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><mn>";
  if (stack1 = helpers.val6) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val6); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn>\r\n      ";
  return buffer;
  }

function program91(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n        <mrow><msqrt><mn>";
  if (stack1 = helpers.val1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator1) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator1); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt></msqrt><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator2) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator2); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><mn>";
  if (stack1 = helpers.val4) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val4); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></mrow><mo>&#160;</mo><msqrt><mn>";
  if (stack1 = helpers.val5) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val5); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn></msqrt><mo>&#160;</mo><mo>";
  if (stack1 = helpers.operator3) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.operator3); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><mn>";
  if (stack1 = helpers.val6) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.val6); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn>\r\n      ";
  return buffer;
  }

function program93(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "  <!-- ∞ -->\r\n      <mo>";
  if (stack1 = helpers.mainOperator) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.mainOperator); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mo><mo>&#160;</mo><mn>";
  if (stack1 = helpers.Infinity) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.Infinity); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</mn>\r\n    ";
  return buffer;
  }

  buffer += "﻿<div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.idPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "surd-format\" class=\"surd-format\">\r\n  <math>\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.radiusValType)),stack1 == null || stack1 === false ? stack1 : stack1.Type1), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.radiusValType)),stack1 == null || stack1 === false ? stack1 : stack1.Type2), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.radiusValType)),stack1 == null || stack1 === false ? stack1 : stack1.Type3), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n    \r\n    <mi>";
  if (stack2 = helpers.trignometricType) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = (depth0 && depth0.trignometricType); stack2 = typeof stack2 === functionType ? stack2.call(depth0, {hash:{},data:data}) : stack2; }
  buffer += escapeExpression(stack2)
    + "</mi>\r\n    \r\n    <mfenced><mrow>\r\n\r\n      ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.distanceValType)),stack1 == null || stack1 === false ? stack1 : stack1.Type1), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n      ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.distanceValType)),stack1 == null || stack1 === false ? stack1 : stack1.Type2), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n      ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.distanceValType)),stack1 == null || stack1 === false ? stack1 : stack1.Type3), {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n      \r\n\r\n      ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.angleType)),stack1 == null || stack1 === false ? stack1 : stack1.Type1), {hash:{},inverse:self.noop,fn:self.program(13, program13, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n      ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.angleType)),stack1 == null || stack1 === false ? stack1 : stack1.Type2), {hash:{},inverse:self.noop,fn:self.program(15, program15, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n      ";
  stack2 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.angleType)),stack1 == null || stack1 === false ? stack1 : stack1.Type3), {hash:{},inverse:self.noop,fn:self.program(17, program17, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n    </mrow></mfenced>\r\n    \r\n    <mo>=</mo>\r\n\r\n    ";
  stack2 = helpers['if'].call(depth0, (depth0 && depth0.denominatorPresent), {hash:{},inverse:self.program(52, program52, data),fn:self.program(19, program19, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\r\n\r\n  </math>\r\n</div>";
  return buffer;
  });
})();