(function() {
  var template = Handlebars.template, templates = MathInteractives.Common.Interactivities.VirusZapper.templates = MathInteractives.Common.Interactivities.VirusZapper.templates || {};
templates['tableQsnDisplay'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "﻿<div class=\"table-row-data-div\">\r\n  <div class=\"hidden-jaws-text\">";
  if (stack1 = helpers.rootAltText) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.rootAltText); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + " ";
  if (stack1 = helpers.qsn) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.qsn); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + " ";
  if (stack1 = helpers.approxAltText) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.approxAltText); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + " ";
  if (stack1 = helpers.ans) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.ans); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\r\n  <span aria-hidden=\"true\" class=\"square-cube-type1\">";
  if (stack1 = helpers.squareCubeType) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.squareCubeType); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\r\n  <img  aria-hidden=\"true\" class=\"base64-symbol-table\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAASCAYAAACNdSR1AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDphNjNiODdjNS0wZWU1LTQwNGUtYTg5YS0xZTNkYTlkYzI1M2MiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6N0E1Q0Y3RkRGNURGMTFFMzgwRTJCMUQ3MDhBQzU0MzIiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N0E1Q0Y3RkNGNURGMTFFMzgwRTJCMUQ3MDhBQzU0MzIiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmE2M2I4N2M1LTBlZTUtNDA0ZS1hODlhLTFlM2RhOWRjMjUzYyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDphNjNiODdjNS0wZWU1LTQwNGUtYTg5YS0xZTNkYTlkYzI1M2MiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz41qxX2AAAA1UlEQVR42mJRUlJiIALMA+JEJgbigDKIIEXxN2IUcwGxFBDfIUYxyFOMQHyLWMUgcJsYxapQmiiTlWEmswAJAaibQOA9HmeATX4AxO+gOB2HMz4A8WuQ4glAvAYqMRGIjZAUgmyWA5kKi5QGII4A4r1AzA7Eq4GYH6pYHqrhNnIM/gXiGCB+AXXjfKg/4CGBHt0voBpAGgOBuBA5jLGlDZBT2qDsdiAOQzaZEUsSZQbiPUDsgCQG8sMnbJECckYUEL9Cct4nfEn0ORDHAvE/mHtBACDAAAn/KchUO58mAAAAAElFTkSuQmCC\"/>\r\n  <span aria-hidden=\"true\" class=\"qsn\">";
  if (stack1 = helpers.qsn) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.qsn); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\r\n  <img aria-hidden=\"true\" class=\"sqrt-symbol\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAARCAYAAABTnsXCAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowODFiNWQ0Zi0zMWRmLTE3NDAtYjJkMi1mYWU1YTQ3ZTE0M2UiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzczMThBNEJFRDYzMTFFM0IzOTJFRDE1RDBFNjc4QzgiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzczMThBNEFFRDYzMTFFM0IzOTJFRDE1RDBFNjc4QzgiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjA4MWI1ZDRmLTMxZGYtMTc0MC1iMmQyLWZhZTVhNDdlMTQzZSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowODFiNWQ0Zi0zMWRmLTE3NDAtYjJkMi1mYWU1YTQ3ZTE0M2UiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6eDH9vAAACcUlEQVR42qyWW4iNURTHz3GO+5E5PBjj0nQeyCiXMi8oXjQl41LCuDQpLyZKyvVBuRUpjCihPEiS5EEuD3IpDJnw5jImxbiMS2YmjcTgt+r/1err+86cc7Lqd/b59t7f3muv/V/rnGQul0uELAP1sBymQAo+wEM4C1ehJ1G69YWdMBS2Q2c6NGEhNMLYUH+lWArvYS+cgN8lOHEQ1ul7O+zqowc77RG4FOFA2CrgGDTBuCId2OwcMGuxD3NiEFyG9W7wE6yF4dAfJsNuaHNzpsET2AQDetl8IByF/a7vnEikstnsedpaN3gBauAu/ND9W9huwXH4DjMhrfudA2t0x990gL9aaxiskpZq3B5XoC7QVhJhvqEdo8EdsMctEmcWmdMwNWKsW46k3LreLsIK+Bl0WCRe0o6Q2BoLvFuLzEm15siQkPrLFBlvX2ADbAsLOhmRoqWk3HxYAjNglBuz0z6W4C2bOqMWyOdERotPhH7wDh7Bg17qRJm0YPYWfsXMq9SVtaZjlGyK3xgR0oQKl53qMHREjHfE9HubBdeVefNME2HB3YDFedLO7n+2MuKr0rQYq1LVtQMm4ZV3olapU+FeMNGeUn+bxgZrzOrLApX2e9BVgAM29xqU6/mjHSaomHUST0bPXSpWE2Ar7IPVMFrp1Roq9c9UzEbGbG4Ob4H7Trjderc9EKavFc9hkdp8FfAANCikgfUoKk3Sjgl6Esx1Yg0OaXvc9NlxBlZCs174XOD9mjYOKcyF2lNYBi+CjuA66iWY6UU4YHYbqnWdd+BPnrktily1d+B/FStv5Uq/8frxs8r4Wv9FmuN+Dv4JMABM+oV89gEX1QAAAABJRU5ErkJggg==\"/>\r\n  <span aria-hidden=\"true\" class=\"table-ans\">";
  if (stack1 = helpers.ans) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.ans); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\r\n  <span aria-hidden=\"true\" class=\"row1-ans\">";
  if (stack1 = helpers.ans) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.ans); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\r\n</div>\r\n\r\n";
  return buffer;
  });
})();