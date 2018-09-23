(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Player.templates = MathInteractives.Common.Player.templates || {};
templates['screenShotModal'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div id=\"save-screen-shot-modal\" class=\"modal fade\">\r\n  <div class=\"modal-dialog bootstrapped\">\r\n    <form class=\"modal-content form-horizontal\">\r\n      <div class=\"modal-header\">\r\n        <button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span></button>\r\n        <h4 class=\"modal-title\">Name:</h4>\r\n      </div>\r\n      <div class=\"modal-body\">\r\n        <div class=\"control-group\">\r\n          <p><input type=\"text\" name=\"saveStateName\" /><span class=\"help-inline\">* Required</span></p>\r\n        </div>\r\n      </div>\r\n      <div class=\"modal-footer\">\r\n        <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>\r\n        <button type=\"submit\" class=\"btn btn-primary\">Save</button>\r\n      </div>\r\n    </form><!-- /.modal-content -->\r\n  </div><!-- /.modal-dialog -->\r\n</div><!-- /.modal -->\r\n<div id=\"scrollable\"></div>\r\n";
  });
})();