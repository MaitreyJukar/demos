function StoreData(){var e=getQueryVariable("tait")!=undefined?getQueryVariable("tait"):"scratchpad";""===e.trim()&&(e="workbookdata");var t=Kepler.Engine.Core.EngineApp.get_engine().getDataToStore();ss.isValue(t)&&(localStorage.removeItem(e),localStorage.setItem(e,t))}function getQueryVariable(e){for(var t=window.location.search.substring(1),a=t.split("&"),r=0;r<a.length;r++){var o=a[r].split("=");if(decodeURIComponent(o[0])==e)return decodeURIComponent(o[1])}}function RestoreData(){var e=getQueryVariable("tait")!=undefined?getQueryVariable("tait"):"scratchpad";""===e.trim()&&(e="workbookdata");var t=localStorage.getItem(e);return t}