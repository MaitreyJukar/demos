(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Player.templates = MathInteractives.Common.Player.templates || {};
templates['player'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "﻿<div class=\"preloader\" align=\"center\">\r\n    <div class=\"progress-box-container\">\r\n        <div class=\"in-progress-text\" style=\"color:white\"></div>\r\n        <div class=\"progress-box\">\r\n            <div class=\"progress-bar-container\">\r\n                <div class=\"progress-bar-whitebg\"></div>\r\n                <div class=\"progress-bar\"></div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<div class=\"player\" texthelpcmd=\"list\" texthelpcmd1=\"bookid:";
  if (stack1 = helpers.bookId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.bookId); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + ";\"  texthelpcmd2=\"pageid:";
  if (stack1 = helpers.pageId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.pageId); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + ";\">\r\n    <div class=\"header-container font-montserrat-regular\">\r\n        <div class=\"header-background\">\r\n            <div class=\"header-left\"></div>\r\n            <div class=\"header-middle\"></div>\r\n            <div class=\"header-right\"></div>\r\n        </div>\r\n\r\n        <div class=\"header-content\">\r\n        </div>\r\n    </div>\r\n    <div class=\"tabs-container\"></div>\r\n    <div class=\"activity-area-container\">\r\n    </div>\r\n    <div id=\"text-dimentions-hack\" style=\"float:initial;  min-height: initial;margin-left: initial;line-height:normal;\"></div>\r\n</div>\r\n";
  return buffer;
  });
})();