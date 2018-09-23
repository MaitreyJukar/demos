(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Components.templates = MathInteractives.Common.Components.templates || {};
templates['panBalanceDraggableTile'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "﻿<div class=\"pan-balance-draggable-tile-wrapper\">\r\n    <div class=\"pan-balance-draggable-tile-top-container\">\r\n        <div class=\"pan-balance-draggable-tile-left-shadow shadow\">\r\n        </div>\r\n        <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-draggable-tile-text-container\" class=\"pan-balance-draggable-tile-text-container\">\r\n            <div class=\"pan-balance-draggable-tile-text-container-left-part\">\r\n            </div>\r\n            <div class=\"pan-balance-draggable-tile-text-container-middle-part\">\r\n                <div class=\"pan-balance-draggable-tile-text\">\r\n                </div>\r\n                <div class=\"pan-balance-draggable-tile-dots\">\r\n                </div>\r\n            </div>\r\n            <div class=\"pan-balance-draggable-tile-text-container-right-part\">\r\n            </div>\r\n        </div>\r\n        <div class=\"pan-balance-draggable-tile-right-shadow shadow\">\r\n        </div>\r\n    </div>\r\n    <div class=\"pan-balance-draggable-tile-bottom-shadow shadow\">\r\n    </div>\r\n</div>\r\n";
  return buffer;
  });
})();