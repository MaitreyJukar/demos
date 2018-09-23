(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Components.templates = MathInteractives.Common.Components.templates || {};
templates['binTileArray'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\r\n	<div id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + escapeExpression(((stack1 = (depth1 && depth1.prefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-bin-tile-number-"
    + escapeExpression(((stack1 = (depth0 && depth0.className)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" class=\"bin-tile-number-"
    + escapeExpression(((stack1 = (depth0 && depth0.className)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " bin-tiles\" data-tiletype=\""
    + escapeExpression(((stack1 = (depth1 && depth1.tileType)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-tilevalue=\""
    + escapeExpression(((stack1 = (depth0 && depth0.value)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></div>\r\n";
  return buffer;
  }

function program3(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\r\n	";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.frequencyTile1), {hash:{},inverse:self.noop,fn:self.programWithDepth(4, program4, data, depth0, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n";
  return buffer;
  }
function program4(depth0,data,depth1,depth2) {
  
  var buffer = "", stack1;
  buffer += "\r\n		<div id=\""
    + escapeExpression(((stack1 = (depth2 && depth2.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + escapeExpression(((stack1 = (depth1 && depth1.prefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-bin-tile-"
    + escapeExpression(((stack1 = (depth1 && depth1.tileOneText)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" class=\"bin-tile-"
    + escapeExpression(((stack1 = (depth1 && depth1.tileOneText)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + " bin-tile-"
    + escapeExpression(((stack1 = (depth1 && depth1.tileOneText)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " bin-tiles\" data-tiletype=\""
    + escapeExpression(((stack1 = (depth2 && depth2.tileType)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-tilevalue=\""
    + escapeExpression(((stack1 = (depth1 && depth1.tileOneText)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></div>\r\n	";
  return buffer;
  }

function program6(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\r\n	";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.frequencyTile2), {hash:{},inverse:self.noop,fn:self.programWithDepth(7, program7, data, depth0, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n";
  return buffer;
  }
function program7(depth0,data,depth1,depth2) {
  
  var buffer = "", stack1;
  buffer += "\r\n		<div id=\""
    + escapeExpression(((stack1 = (depth2 && depth2.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + escapeExpression(((stack1 = (depth1 && depth1.prefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-bin-tile-"
    + escapeExpression(((stack1 = (depth1 && depth1.tileTwoText)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" class=\"bin-tile-"
    + escapeExpression(((stack1 = (depth1 && depth1.tileTwoText)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + " bin-tile-"
    + escapeExpression(((stack1 = (depth1 && depth1.tileTwoText)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " bin-tiles\" data-tiletype=\""
    + escapeExpression(((stack1 = (depth2 && depth2.tileType)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-tilevalue=\""
    + escapeExpression(((stack1 = (depth1 && depth1.tileTwoText)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></div>\r\n	";
  return buffer;
  }

  stack1 = helpers.each.call(depth0, (depth0 && depth0.tileArray), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.tileOneText), {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.tileTwoText), {hash:{},inverse:self.noop,fn:self.programWithDepth(6, program6, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  });
})();