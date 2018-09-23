(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Interactivities.ConicExplorer.templates = MathInteractives.Common.Interactivities.ConicExplorer.templates || {};
templates['equationHolder'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "﻿<div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "graph-formula\" class=\"graph-formula\">\r\n  <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "graph-normal-formula\">\r\n  <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "graph-first-equation\" class=\"graph-first-equation\">\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "graph-first-numerator\" class=\"graph-first-numerator\">\r\n    <sup>2</sup>\r\n    </div>\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "graph-bar\" class=\"graph-bar\"></div>\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "graph-first-denominator\" class=\"graph-first-denominator\">\r\n  <sup>2</sup>\r\n    </div>\r\n  </div>\r\n  <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "graph-plus\" class=\"graph-plus\"> &minus; </div>\r\n  <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "graph-second-equation\" class=\"graph-second-equation\">\r\n\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "graph-second-numerator\" class=\"graph-second-numerator\">\r\n\r\n  <sup>2</sup>\r\n    </div>\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "graph-bar\" class=\"graph-bar\"></div>\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "graph-second-denominator\" class=\"graph-second-denominator\">\r\n   <sup>2</sup>\r\n    </div>\r\n  </div>\r\n  <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "graph-equal-to-row\" class=\"graph-equal-to\">=</div>\r\n  <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "graph-one-row\" class=\"graph-one\">1</div>\r\n  </div>\r\n  <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "degenerated-formula\" class=\"degenerated-formula\">\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "degenerated-x\" class=\"degenerated-x\"></div>\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "degenerated-equal-to-row\" class=\"degenerated-equal-to-row\">=</div>\r\n    <div id=\"";
  if (stack1 = helpers.idPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.idPrefix; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "degenerated-y\" class=\"degenerated-y\"></div>\r\n  </div>\r\n  </div>\r\n</div>\r\n";
  return buffer;
  });
})();