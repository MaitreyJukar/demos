(function() {
  var template = Handlebars.template, templates = MathUtilities.Components.ToolHolder.Templates = MathUtilities.Components.ToolHolder.Templates || {};
templates['bottomToolbar'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "hide";
  }

  buffer += "<div id=\"math-tool-bottom-toolbar-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"toolbar-holder math-tool-bottom-toolbar\" isVisible=\"true\">\r\n    <div id=\"math-tool-bottom-container\" class=\"bottom-toolbar-container\">\r\n        <div id=\"math-tool-bottom-button-container-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"toolbar-button-container\">\r\n            <div id=\"math-tool-save-btn-container-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"button-holder ";
  stack1 = helpers.unless.call(depth0, (depth0 && depth0.isPreAuthoringEnv), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\r\n                <div id=\"math-tool-btn-save-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"bottom-toolbar-btn footer-btn\" data-toolid=\"";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\r\n                    <div id=\"math-tool-save-btn-icon-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"footer-btn-icon math-tool-save-btn-icon\"></div>\r\n                </div>\r\n                <div id=\"math-tool-btn-seperator1-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"footer-btn-seperator\"></div>\r\n            </div>\r\n            <div id=\"math-tool-open-btn-container-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"button-holder hide\">\r\n                <div id=\"math-tool-btn-open-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"bottom-toolbar-btn footer-btn\" data-toolid=\"";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\r\n                    <div id=\"math-tool-open-btn-icon-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"footer-btn-icon math-tool-open-btn-icon\"></div>\r\n                </div>\r\n                <div id=\"math-tool-btn-seperator2-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"footer-btn-seperator\"></div>\r\n            </div>\r\n            <div id=\"math-tool-screenshot-btn-container-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"button-holder\">\r\n                <div id=\"math-tool-btn-screenshot-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"bottom-toolbar-btn footer-btn\" data-toolid=\"";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\r\n                    <div id=\"math-tool-screenshot-btn-icon-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"footer-btn-icon math-tool-screenshot-btn-icon\"></div>\r\n                </div>\r\n                <div id=\"math-tool-btn-seperator3-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"footer-btn-seperator\"></div>\r\n            </div>\r\n            <div id=\"math-tool-print-btn-container-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"button-holder hide\">\r\n                <div id=\"math-tool-btn-print-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"bottom-toolbar-btn footer-btn\" data-toolid=\"";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\r\n                    <div id=\"math-tool-print-btn-icon-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"footer-btn-icon math-tool-print-btn-icon\"></div>\r\n                </div>\r\n                <div id=\"math-tool-btn-seperator4-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"footer-btn-seperator\"></div>\r\n            </div>\r\n            <div id=\"math-tool-csv-btn-container-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"button-holder\">\r\n                <div id=\"math-tool-btn-csv-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"bottom-toolbar-btn footer-btn\" data-toolid=\"";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\r\n                    <div id=\"math-tool-csv-btn-icon-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"footer-btn-icon math-tool-csv-btn-icon\"></div>\r\n                </div>\r\n                <div id=\"math-tool-btn-seperator4-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"footer-btn-seperator\"></div>\r\n            </div>\r\n            <div id=\"math-tool-zoom-btn-panel-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"zoom-buttons-panel\">\r\n                <div id=\"math-tool-zoomin-btn-container-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"button-holder\">\r\n                    <div id=\"math-tool-btn-zoomin-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"bottom-toolbar-btn footer-btn\" data-toolid=\"";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\r\n                        <div id=\"math-tool-zoomin-btn-icon-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"footer-btn-icon math-tool-zoomin-btn-icon\"></div>\r\n                    </div>\r\n                    <div id=\"math-tool-btn-seperator7-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"footer-btn-seperator\"></div>\r\n                </div>\r\n                <div id=\"math-tool-zoomdefault-btn-container-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"button-holder\">\r\n                    <div id=\"math-tool-btn-zoomdefault-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"bottom-toolbar-btn footer-btn\" data-toolid=\"";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\r\n                        <div id=\"math-tool-zoomdefault-btn-icon-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"footer-btn-icon math-tool-zoomdefault-btn-icon\"></div>\r\n                    </div>\r\n                    <div id=\"math-tool-btn-seperator6-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"footer-btn-seperator\"></div>\r\n                </div>\r\n                <div id=\"math-tool-zoomout-btn-container-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"button-holder\">\r\n                    <div id=\"math-tool-btn-zoomout-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"bottom-toolbar-btn footer-btn\" data-toolid=\"";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\r\n                        <div id=\"math-tool-zoomout-btn-icon-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"footer-btn-icon math-tool-zoomout-btn-icon\"></div>\r\n                    </div>\r\n                    <div id=\"math-tool-btn-seperator5-";
  if (helper = helpers['tool-id']) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0['tool-id']); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"footer-btn-seperator\"></div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n";
  return buffer;
  });
})();