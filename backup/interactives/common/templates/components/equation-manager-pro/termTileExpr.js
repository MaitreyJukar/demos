(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Components.templates = MathInteractives.Common.Components.templates || {};
templates['termTileExpr'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n	";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.baseNotNull), {hash:{},inverse:self.program(7, program7, data),fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n		";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.isVariable), {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n	";
  return buffer;
  }
function program3(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\r\n			<span class='base-exp-data-tab equation-common'>\r\n                <span class='open-bracket minus-open-bracket'>(</span>\r\n                <span class=\"minus-sign-base equation-common\">&minus;</span>\r\n                <span class='equation-variable'><em>";
  if (helper = helpers.absBase) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.absBase); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</em></span>\r\n                <span class='closed-bracket minus-closed-bracket'>)</span>\r\n            </span>\r\n		";
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\r\n			<span class='base-exp-data-tab equation-common open-bracket-container'>\r\n                <span class='open-bracket minus-open-bracket'>(</span>\r\n                <span class=\"minus-sign-base equation-common\">&minus;</span>\r\n                <span class='base-exp-data-tab equation-common'>";
  if (helper = helpers.absBase) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.absBase); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</span>\r\n                <span class='closed-bracket minus-closed-bracket'>)</span>\r\n            </span>\r\n		";
  return buffer;
  }

function program7(depth0,data) {
  
  
  return "\r\n		<div class='static-empty-tile empty-tile'>\r\n			<div class='box'>\r\n				<div class='inside-divs'></div>\r\n				<div class='inside-divs'></div>\r\n				<div class='inside-divs'></div>\r\n				<div class='inside-divs'></div>\r\n				<div class='inside-divs'></div>\r\n				<div class='inside-divs'></div>\r\n			</div>\r\n		</div>\r\n	";
  }

function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n	";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.baseNotNull), {hash:{},inverse:self.program(7, program7, data),fn:self.program(10, program10, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n";
  return buffer;
  }
function program10(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n		";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.isVariable), {hash:{},inverse:self.program(13, program13, data),fn:self.program(11, program11, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n	";
  return buffer;
  }
function program11(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\r\n			<span class='base-exp-data-tab equation-common equation-variable'><em>";
  if (helper = helpers.base) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.base); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</em></span>\r\n		";
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\r\n			<span class='base-exp-data-tab equation-common'>";
  if (helper = helpers.base) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.base); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\r\n		";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.baseValNegative), {hash:{},inverse:self.program(9, program9, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n";
  return buffer;
  });
})();