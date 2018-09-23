(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Components.templates = MathInteractives.Common.Components.templates || {};
templates['mathematicalOperators'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n	";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.operator)),stack1 == null || stack1 === false ? stack1 : stack1.hide), {hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n";
  return buffer;
  }
function program2(depth0,data) {
  
  
  return "\r\n	<div class='hide-operator equation-common'></div>\r\n	";
  }

function program4(depth0,data) {
  
  
  return "\r\n	<div class='multiplication-operator equation-common'></div>\r\n	";
  }

function program6(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " \r\n	";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.operator)),stack1 == null || stack1 === false ? stack1 : stack1.addition), {hash:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n";
  return buffer;
  }
function program7(depth0,data) {
  
  
  return "\r\n		<div class='addition-operator equation-common'>&nbsp;&#43;&nbsp;</div>\r\n	";
  }

function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " \r\n		";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.operator)),stack1 == null || stack1 === false ? stack1 : stack1.equals), {hash:{},inverse:self.program(12, program12, data),fn:self.program(10, program10, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n	";
  return buffer;
  }
function program10(depth0,data) {
  
  
  return "\r\n			<div class='equal-to-sign equation-common'>&nbsp;=&nbsp;</div>\r\n		";
  }

function program12(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n			";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.operator)),stack1 == null || stack1 === false ? stack1 : stack1.division), {hash:{},inverse:self.program(15, program15, data),fn:self.program(13, program13, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n		";
  return buffer;
  }
function program13(depth0,data) {
  
  
  return "\r\n				<div class='division-operator equation-common'></div>\r\n			";
  }

function program15(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n				";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.operator)),stack1 == null || stack1 === false ? stack1 : stack1.subtraction), {hash:{},inverse:self.program(18, program18, data),fn:self.program(16, program16, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n			";
  return buffer;
  }
function program16(depth0,data) {
  
  
  return "\r\n					<div class='subtraction-operator equation-common'></div>\r\n				";
  }

function program18(depth0,data) {
  
  
  return "\r\n					<div class='no-operator equation-common'></div>\r\n				";
  }

  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.operator)),stack1 == null || stack1 === false ? stack1 : stack1.multiplication), {hash:{},inverse:self.program(6, program6, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  });
})();