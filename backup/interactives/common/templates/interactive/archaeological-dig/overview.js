(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Interactivities.ArchaeologicalDig.templates = MathInteractives.Common.Interactivities.ArchaeologicalDig.templates || {};
templates['overview'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"";
  if (helper = helpers.idPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.idPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "overview-tab\" class=\"overview-tab-main-container\">\r\n\r\n</div>";
  return buffer;
  });
})();