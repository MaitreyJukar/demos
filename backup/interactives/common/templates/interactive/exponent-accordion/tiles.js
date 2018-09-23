(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Interactivities.ExponentAccordion.templates = MathInteractives.Common.Interactivities.ExponentAccordion.templates || {};
templates['tiles'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\r\n    <div id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + escapeExpression(((stack1 = (depth1 && depth1.type)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-tile-container-value"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.type)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-tile-containers container-value"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\">\r\n        <div id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + escapeExpression(((stack1 = (depth1 && depth1.type)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-tile-value"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" class=\""
    + escapeExpression(((stack1 = (depth1 && depth1.type)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-draggable-tiles tile-value"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" data-tiletype=\""
    + escapeExpression(((stack1 = (depth1 && depth1.tileType)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-tilevalue=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\"></div>\r\n    </div>\r\n    ";
  return buffer;
  }

  buffer += "<div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "tile-container\" class=\"tiles-container\">\r\n    ";
  options={hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data}
  if (helper = helpers.tiles) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0.tiles); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers.tiles) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n</div>";
  return buffer;
  });
})();