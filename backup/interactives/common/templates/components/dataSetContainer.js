(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Components.templates = MathInteractives.Common.Components.templates || {};
templates['dataSetContainer'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\r\n<div id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + escapeExpression(((stack1 = (depth1 && depth1.idSuffix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "data-set-"
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" class=\"data-set-selector data-set data-set-"
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-set-index=\""
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\r\n  <div id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + escapeExpression(((stack1 = (depth1 && depth1.idSuffix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "data-set-image-container-"
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" class=\"data-set-selector data-set-image-container\" data-set-index=\""
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\r\n    <div id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + escapeExpression(((stack1 = (depth1 && depth1.idSuffix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "data-set-image-"
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" class=\"data-set-selector data-set-image data-set-image-"
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-set-index=\""
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></div>\r\n  </div>\r\n  <div id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + escapeExpression(((stack1 = (depth1 && depth1.idSuffix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "data-set-title-container-"
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" class=\"data-set-selector data-set-title-container ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.isUserData), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" data-set-index=\""
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\r\n    <div id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + escapeExpression(((stack1 = (depth1 && depth1.idSuffix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "data-set-title-"
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" class=\"data-set-selector data-set-title\" data-set-index=\""
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">";
  stack1 = ((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.dataSetName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>\r\n  </div>\r\n  ";
  stack1 = helpers['if'].call(depth0, (depth1 && depth1.showNumbers), {hash:{},inverse:self.noop,fn:self.programWithDepth(4, program4, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n  ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.isUserData), {hash:{},inverse:self.noop,fn:self.programWithDepth(6, program6, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "  \r\n</div>\r\n";
  return buffer;
  }
function program2(depth0,data) {
  
  
  return "user-data-set-container";
  }

function program4(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\r\n  <div id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + escapeExpression(((stack1 = (depth1 && depth1.idSuffix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "data-set-number-container-"
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" class=\"data-set-selector data-set-number-container\">\r\n    <div id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + escapeExpression(((stack1 = (depth1 && depth1.idSuffix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "data-set-number-text-"
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" class=\"data-set-selector data-set-number-text\">"
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</div>\r\n  </div>\r\n  ";
  return buffer;
  }

function program6(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "\r\n  <div id=\""
    + escapeExpression(((stack1 = (depth2 && depth2.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + escapeExpression(((stack1 = (depth2 && depth2.idSuffix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "data-set-delete-btn-container-"
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" class=\"data-set-selector data-set-delete-btn-container\" data-set-index=\""
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\r\n    <div id=\""
    + escapeExpression(((stack1 = (depth2 && depth2.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + escapeExpression(((stack1 = (depth2 && depth2.idSuffix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "data-set-delete-btn-"
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" class=\"data-set-selector data-set-delete-btn\" data-set-index=\""
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\r\n      <div id=\""
    + escapeExpression(((stack1 = (depth2 && depth2.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + escapeExpression(((stack1 = (depth2 && depth2.idSuffix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "data-set-delete-btn-icon-"
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" class=\"data-set-selector data-set-delete-btn-icon\" data-set-index=\""
    + escapeExpression(((stack1 = (data == null || data === false ? data : data.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></div>\r\n    </div>\r\n  </div>\r\n  ";
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\r\n<div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1);
  if (helper = helpers.idSuffix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idSuffix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "add-your-own\" class=\"data-set-selector add-your-own\">\r\n  <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1);
  if (helper = helpers.idSuffix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idSuffix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "add-your-own-text-container\" class=\"data-set-selector add-your-own-text-container\">\r\n    <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1);
  if (helper = helpers.idSuffix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idSuffix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "add-your-own-text\" class=\"data-set-selector add-your-own-text\">\r\n      ";
  if (helper = helpers.addBtnText) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.addBtnText); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\r\n      <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1);
  if (helper = helpers.idSuffix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idSuffix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "add-your-own-btn-container\" class=\"data-set-selector add-your-own-btn-container\">\r\n        <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1);
  if (helper = helpers.idSuffix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idSuffix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "add-your-own-btn\" class=\"data-set-selector add-your-own-btn\"></div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n";
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.emptyDataSets), {hash:{},inverse:self.noop,fn:self.programWithDepth(11, program11, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n";
  return buffer;
  }
function program11(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\r\n<div id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + escapeExpression(((stack1 = (depth1 && depth1.idSuffix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "empty-data-set-"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" class=\"data-set-selector empty-data-set-"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + " empty-data-set\">\r\n</div>\r\n";
  return buffer;
  }

  buffer += "﻿<div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1);
  if (helper = helpers.idSuffix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idSuffix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "delete-dataset-tooltip-container\" class=\"data-set-selector delete-dataset-tooltip\"></div>\r\n";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.models), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.userDataFree), {hash:{},inverse:self.noop,fn:self.program(8, program8, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.showEmptyDataSets), {hash:{},inverse:self.noop,fn:self.program(10, program10, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  });
})();