(function() {
  var template = Handlebars.template, templates = MathInteractives.Interactivities.MiniGolf.templates = MathInteractives.Interactivities.MiniGolf.templates || {};
templates['customPopup'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\r\n    <!--create cont for image-->\r\n    <div id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "course-"
    + escapeExpression(((stack1 = (depth1 && depth1.courseNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-custom-popup-image-"
    + escapeExpression(((stack1 = (depth0 && depth0.imageNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-cont\" class=\"course-"
    + escapeExpression(((stack1 = (depth1 && depth1.courseNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-custom-popup-image-"
    + escapeExpression(((stack1 = (depth0 && depth0.imageNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-cont text-image-cont\">\r\n      <div id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "course-"
    + escapeExpression(((stack1 = (depth1 && depth1.courseNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-custom-popup-image-"
    + escapeExpression(((stack1 = (depth0 && depth0.imageNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" class=\"course-"
    + escapeExpression(((stack1 = (depth1 && depth1.courseNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-custom-popup-image-"
    + escapeExpression(((stack1 = (depth0 && depth0.imageNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " image-cont\">\r\n        ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.textDiv), {hash:{},inverse:self.noop,fn:self.programWithDepth(2, program2, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n      </div>\r\n      <div id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "course-"
    + escapeExpression(((stack1 = (depth1 && depth1.courseNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-custom-popup-image-"
    + escapeExpression(((stack1 = (depth0 && depth0.imageNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-description\" class=\"course-"
    + escapeExpression(((stack1 = (depth1 && depth1.courseNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-custom-popup-image-"
    + escapeExpression(((stack1 = (depth0 && depth0.imageNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-description image-description\">\r\n        <div id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "course-"
    + escapeExpression(((stack1 = (depth1 && depth1.courseNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-custom-popup-image-"
    + escapeExpression(((stack1 = (depth0 && depth0.imageNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-description-text-cont\" class=\"course-"
    + escapeExpression(((stack1 = (depth1 && depth1.courseNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-custom-popup-image-"
    + escapeExpression(((stack1 = (depth0 && depth0.imageNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-description-text-cont description-text-cont\">\r\n          <div id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "course-"
    + escapeExpression(((stack1 = (depth1 && depth1.courseNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-custom-popup-image-"
    + escapeExpression(((stack1 = (depth0 && depth0.imageNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-description-number\" class=\"course-"
    + escapeExpression(((stack1 = (depth1 && depth1.courseNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-custom-popup-image-"
    + escapeExpression(((stack1 = (depth0 && depth0.imageNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-description-number image-description-number one-time-popup-text-container\">"
    + escapeExpression(((stack1 = (depth0 && depth0.imageNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ".\r\n          </div>\r\n          <div id=\""
    + escapeExpression(((stack1 = (depth1 && depth1.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "course-"
    + escapeExpression(((stack1 = (depth1 && depth1.courseNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-custom-popup-image-"
    + escapeExpression(((stack1 = (depth0 && depth0.imageNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-description-text\" class=\"course-"
    + escapeExpression(((stack1 = (depth1 && depth1.courseNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-custom-popup-image-"
    + escapeExpression(((stack1 = (depth0 && depth0.imageNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-description-text image-description-text one-time-popup-text-container\">\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    ";
  return buffer;
  }
function program2(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "\r\n        <div id=\""
    + escapeExpression(((stack1 = (depth2 && depth2.idPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "course-"
    + escapeExpression(((stack1 = (depth2 && depth2.courseNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-image-"
    + escapeExpression(((stack1 = (depth0 && depth0.imageNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-button-text-container\" class=\"course-"
    + escapeExpression(((stack1 = (depth2 && depth2.courseNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-image-"
    + escapeExpression(((stack1 = (depth0 && depth0.imageNumber)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-button-text-container button-text-container\">\r\n        </div>\r\n        ";
  return buffer;
  }

  buffer += "<div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "course-";
  if (helper = helpers.courseNumber) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.courseNumber); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-custom-popup-container\" class=\"course-";
  if (helper = helpers.courseNumber) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.courseNumber); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-custom-popup-container course-custom-popup-container\">\r\n  <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "course-";
  if (helper = helpers.courseNumber) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.courseNumber); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-custom-popup-title-container\" class=\"course-";
  if (helper = helpers.courseNumber) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.courseNumber); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-custom-popup-title-container course-custom-popup-title-container\">\r\n    <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "course-";
  if (helper = helpers.courseNumber) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.courseNumber); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-custom-popup-title\" class=\"course-";
  if (helper = helpers.courseNumber) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.courseNumber); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-custom-popup-title course-custom-popup-title\"></div>\r\n\r\n  </div>\r\n  <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "course-";
  if (helper = helpers.courseNumber) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.courseNumber); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-custom-popup-image-container\" class=\"course-";
  if (helper = helpers.courseNumber) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.courseNumber); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-custom-popup-image-container course-custom-popup-image-container\">\r\n\r\n    ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.imageCount), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n  </div>\r\n  <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "course-";
  if (helper = helpers.courseNumber) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.courseNumber); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-got-it-button-contanier\" class=\"course-";
  if (helper = helpers.courseNumber) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.courseNumber); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-got-it-button-contanier got-it-button-cont\">\r\n    <div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "course-";
  if (helper = helpers.courseNumber) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.courseNumber); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-got-it-button\" class=\"course-";
  if (helper = helpers.courseNumber) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.courseNumber); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "-got-it-button got-it-button\"></div>\r\n  </div>\r\n</div>\r\n";
  return buffer;
  });
})();