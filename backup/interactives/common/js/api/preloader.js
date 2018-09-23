
// Author: Tanzeel R.A. Kazi

(function (MathInteractives) {
    'use strict';

    if (MathInteractives && MathInteractives.Common && MathInteractives.Common.Preloader) {
        return;
    }
    if (typeof MathInteractives === 'undefined') {
        var MathInteractives = {}

        MathInteractives.Common = {};

        window.MathInteractives = MathInteractives;
    }

    MathInteractives.Common.Preloader = (function () {

        var Preloader = null,
            EventTypes = null,
            EventTypesMap = null,
            FileTypes = null,
            FontStyles = null,
            FontFormat = null,
            loadedURLs = null,
            isOnIE9 = null,
            domainPattern = null,
            currentURL = null,
            currentProtocol = null,
            currentDomain = null,
            currentOrigin = null,
            currentPath = null;

        isOnIE9 = (window.navigator.userAgent.indexOf('MSIE 9.0') > -1);

        domainPattern = /^(?:http[s]{0,1}:\/\/)([^\/?#]+)/;

        Preloader = Backbone.Model.extend(

            // Instance
            {
                defaults: {
                    id: null,

                    _params: null,

                    _resourceList: null,

                    _pathEngine: null,

                    _preloadCount: null,

                    _loadIndex: null,

                    _isPreloading: false,

                    _isPreloadComplete: false,

                    _isWaitingForResourceLoad: false,

                    _isFailed: false,

                    _preloadData: null,

                    _images: null,

                    _jsLoadStack: null,

                    _jsLoadIndex: null,

                    _cssLoadStack: null,

                    _cssLoadIndex: null,

                    _requestLimit: null,

                    _requestCount: null
                },

                initialize: function (params) {

                    var preloader = this,
                        pathEngine = null;

                    params = $.extend(true, {}, Preloader.defaults, params);

                    pathEngine = params.pathEngine || null;

                    preloader.set('id', Preloader._nextPreloaderId);
                    Preloader._nextPreloaderId++;

                    preloader._setParams(params)
                             ._setPathEngine(pathEngine)
                             ._setImages(null)
                             ._setPreloadData(null)
                             .setResourceList(params.resourceList);

                    return;
                },

                _setParams: function _setParams(params) {
                    var preloader = this;

                    preloader.set('_params', params);

                    return preloader;
                },

                getParams: function getParams() {
                    var preloader = this,
                        params = null;

                    params = preloader.get('_params');

                    return params;
                },

                _setPathEngine: function _setPathEngine(pathEngine) {
                    var preloader = this;

                    pathEngine = pathEngine || null;
                    preloader.set('_pathEngine', pathEngine);

                    return preloader;
                },

                getPathEngine: function getPathEngine() {
                    var preloader = this,
                        pathEngine = null;

                    pathEngine = preloader.get('_pathEngine');

                    return pathEngine;
                },

                _setIsPreloading: function _setIsPreloading(isPreloading) {
                    var preloader = this;

                    isPreloading = (isPreloading) ? true : false;
                    preloader.set('_isPreloading', isPreloading);

                    return preloader;
                },

                isPreloading: function isPreloading() {
                    var preloader = this,
                        isPreloading = null;

                    isPreloading = preloader.get('_isPreloading');

                    return isPreloading;
                },

                _setIsPreloadComplete: function _setIsPreloadComplete(isPreloadComplete) {
                    var preloader = this;

                    isPreloadComplete = (isPreloadComplete) ? true : false;
                    preloader.set('_isPreloadComplete', isPreloadComplete);

                    return preloader;
                },

                isPreloadComplete: function isPreloadComplete() {
                    var preloader = this,
                        isPreloadComplete = null;

                    isPreloadComplete = preloader.get('_isPreloadComplete');

                    return isPreloadComplete;
                },

                setResourceList: function setResourceList(resourceList, forceUpdate) {
                    var preloader = this,
                        isSuccess = false;

                    forceUpdate = (forceUpdate) ? true : false;

                    if (!forceUpdate
                        &&
                        (
                            preloader.isPreloading()
                            || preloader.isPreloadComplete()
                            || !(resourceList instanceof Array)
                        )
                        ) {
                        return isSuccess;
                    }

                    preloader.set('_resourceList', resourceList);

                    isSuccess = true;

                    return isSuccess;
                },

                getResourceList: function getResourceList() {
                    var preloader = this,
                        resourceList = null;

                    resourceList = preloader.get('_resourceList');

                    return resourceList;
                },

                getTotalResources: function getTotalResources() {
                    var preloader = this,
                        totalResources = null;

                    totalResources = preloader.getResourceList().length;

                    return totalResources;
                },

                _setPreloadCount: function _setPreloadCount(preloadCount) {
                    var preloader = this;

                    preloader.set('_preloadCount', preloadCount);

                    return preloader;
                },

                getPreloadCount: function getPreloadCount() {
                    var preloader = this,
                        preloadCounter = null;

                    preloadCounter = preloader.get('_preloadCount');

                    return preloadCounter;
                },

                _setLoadIndex: function _setLoadIndex(loadIndex) {
                    var preloader = this;

                    loadIndex = (typeof loadIndex === 'number') ? loadIndex : null;
                    preloader.set('_loadIndex', loadIndex);

                    return preloader;
                },

                getLoadIndex: function getLoadIndex() {
                    var preloader = this,
                        loadIndex = null;

                    loadIndex = preloader.get('_loadIndex');

                    return loadIndex;
                },

                _setIsWaitingForResourceLoad: function _setIsWaitingForResourceLoad(isWaitingForResourceLoad) {
                    var preloader = this;

                    isWaitingForResourceLoad = (isWaitingForResourceLoad) ? true : false;
                    preloader.set('_isWaitingForResourceLoad', isWaitingForResourceLoad);

                    return preloader;
                },

                isWaitingForResourceLoad: function isWaitingForResourceLoad() {
                    var preloader = this,
                        isWaitingForResourceLoad = null;

                    isWaitingForResourceLoad = preloader.get('_isWaitingForResourceLoad');

                    return isWaitingForResourceLoad;
                },

                _setIsFailed: function _setIsFailed(isFailed) {
                    var preloader = this;

                    isFailed = (isFailed) ? true : false;
                    preloader.set('_isFailed', isFailed);

                    return preloader;
                },

                isFailed: function isFailed() {
                    var preloader = this,
                        isFailed = null;

                    isFailed = preloader.get('_isFailed');

                    return isFailed;
                },

                _setPreloadData: function _setPreloadData(preloadData) {
                    var preloader = this;

                    preloadData = preloadData || null;
                    preloader.set('_preloadData', preloadData);

                    return preloader;
                },

                getPreloadData: function getPreloadData() {
                    var preloader = this,
                        preloadData = null;

                    preloadData = preloader.get('_preloadData');

                    return preloadData;
                },

                _setImages: function _setImages(images) {
                    var preloader = this;

                    images = images || {};
                    preloader.set('_images', images);

                    return preloader;
                },

                getImages: function getImages() {
                    var preloader = this,
                        images = null;

                    images = preloader.get('_images');

                    return images;
                },

                getImage: function getImage(imageId) {
                    var preloader = this,
                        images = null,
                        image = null;

                    images = preloader.getImages();
                    if (imageId in images) {
                        image = images[imageId];
                    }

                    return image;
                },

                addImage: function addImage(imageResource) {
                    var preloader = this,
                        images = null;

                    imageResource = imageResource || null;
                    if (imageResource === null) {
                        return preloader;
                    }
                    else if (imageResource.id === null) {
                        return preloader;
                    }

                    imageResource = $.extend(true, {}, imageResource);
                    imageResource.path = imageResource.parsedURL;
                    delete imageResource['basePath'];

                    images = preloader.getImages();
                    images[imageResource.id] = imageResource;

                    return preloader;
                },

                _setJSLoadStack: function _setJSLoadStack(jsLoadStack) {
                    var preloader = this;

                    jsLoadStack = jsLoadStack || null;
                    preloader.set('_jsLoadStack', jsLoadStack);

                    return preloader;
                },

                getJSLoadStack: function getJSLoadStack() {
                    var preloader = this,
                        jsLoadStack = null;

                    jsLoadStack = preloader.get('_jsLoadStack');

                    return jsLoadStack;
                },

                _setJSLoadIndex: function _setJSLoadIndex(jsLoadIndex) {
                    var preloader = this;

                    jsLoadIndex = (typeof jsLoadIndex !== 'number') ? null : jsLoadIndex;
                    preloader.set('_jsLoadIndex', jsLoadIndex);

                    return preloader;
                },

                _getJSLoadIndex: function _getJSLoadIndex() {
                    var preloader = this,
                        jsLoadIndex = null;

                    jsLoadIndex = preloader.get('_jsLoadIndex');

                    return jsLoadIndex;
                },

                _setCSSLoadStack: function _setCSSLoadStack(cssLoadStack) {
                    var preloader = this;

                    cssLoadStack = cssLoadStack || null;
                    preloader.set('_cssLoadStack', cssLoadStack);

                    return preloader;
                },

                getCSSLoadStack: function getCSSLoadStack() {
                    var preloader = this,
                        cssLoadStack = null;

                    cssLoadStack = preloader.get('_cssLoadStack');

                    return cssLoadStack;
                },

                _setCSSLoadIndex: function _setCSSLoadIndex(cssLoadIndex) {
                    var preloader = this;

                    cssLoadIndex = cssLoadIndex || null;
                    preloader.set('_cssLoadIndex', cssLoadIndex);

                    return preloader;
                },

                _getCSSLoadIndex: function _getCSSLoadIndex() {
                    var preloader = this,
                        cssLoadIndex = null;

                    cssLoadIndex = preloader.get('_cssLoadIndex');

                    return cssLoadIndex;
                },

                _setRequestLimit: function _setRequestLimit(requestLimit) {
                    var preloader = this;

                    if (requestLimit === null) {
                        preloader.set('_requestLimit', requestLimit);
                        return preloader;
                    }

                    requestLimit = (typeof requestLimit === 'number') ? requestLimit : null;

                    if (requestLimit === null) {
                        return preloader;
                    }

                    requestLimit = (requestLimit <= 0) ? 0 : requestLimit;

                    preloader.set('_requestLimit', requestLimit);

                    return preloader;
                },

                getRequestLimit: function getRequestLimit() {
                    var preloader = this,
                        requestLimit = null,
                        globalRequestLimit = null;

                    requestLimit = preloader.get('_requestLimit');
                    globalRequestLimit = Preloader.getRequestLimit();

                    if (requestLimit === null
                        || requestLimit > globalRequestLimit) {
                        requestLimit = globalRequestLimit;
                    }

                    return requestLimit;
                },

                _setRequestCount: function _setRequestCount(requestCount) {
                    var preloader = this;

                    requestCount = (typeof requestCount === 'number') ? requestCount : null;
                    if (requestCount === null) {
                        return preloader;
                    }

                    requestCount = (requestCount < 0) ? 0 : requestCount;

                    preloader.set('_requestCount', requestCount);

                    return preloader;
                },

                getRequestCount: function getRequestCount() {
                    var preloader = this,
                        requestCount = null;

                    requestCount = preloader.get('_requestCount');

                    return requestCount;
                },

                requestCountUp: function requestCountUp(resource) {
                    var preloader = this,
                        requestCount = null;

                    requestCount = preloader.getRequestCount();
                    requestCount++;
                    preloader._setRequestCount(requestCount);

                    return preloader;
                },

                requestCountDown: function requestCountDown(resource) {
                    var preloader = this,
                        requestCount = null;

                    requestCount = preloader.getRequestCount();
                    requestCount--;
                    preloader._setRequestCount(requestCount);

                    return preloader;
                },

                _triggerEvent: function _triggerEvent(event) {
                    var preloader = this,
                        eventType = null,
                        preloadCount = null,
                        totalResources = null,
                        progressPercent = null;

                    if (typeof event === 'string') {
                        event = $.Event(event);
                    }

                    eventType = event.type;

                    if (!(eventType in EventTypesMap)) {
                        return preloader;
                    }

                    preloadCount = preloader.getPreloadCount();
                    totalResources = preloader.getTotalResources();
                    progressPercent = (totalResources === 0) ? 100 : ((preloadCount * 100) / totalResources);
                    progressPercent = (Math.round(progressPercent * 100) / 100);

                    event.preloader = preloader;
                    event.progressCount = preloadCount;
                    event.totalResources = totalResources;
                    event.progressPercent = progressPercent;

                    preloader.trigger(eventType, event);

                    return preloader;
                },

                _embedFont: function _embedFont(fontResource, preloadContainer) {
                    var preloader = this,
                        html = '',
                        fontBasePath = null,
                        fontPath = null,
                        fontPaths = null,
                        fontFamily = null,
                        fontFormat = null,
                        fontStyle = null,
                        pathPattern = null,
                        fontContainer = null;

                    pathPattern = /\/(.+?)$/g

                    fontBasePath = fontResource.basePath || null;
                    fontPath = fontResource.path || null;

                    fontFamily = fontResource.fontFamily || null;
                    fontFormat = fontResource.fontFormat || null;

                    fontPaths = fontResource.fontPaths || null;
                    fontPaths = ($.isArray(fontPaths)) ? fontPaths : null;

                    if (fontFamily === null) {
                        fontFamily = pathPattern.exec(fontPath)[1];
                        fontFamily = decodeURIComponent(fontFamily);
                    }

                    fontStyle = fontResource.fontStyle || null;


                    switch (fontStyle) {
                        case FontStyles.BOLD:
                            {
                                fontStyle = 'font-weight: bold;';
                                break;
                            }

                        case FontStyles.ITALIC:
                            {
                                fontStyle = 'font-style: italic;';
                                break;
                            }

                        case FontStyles.FONT_BOLD_ITALIC:
                            {
                                fontStyle = 'font-style: italic; font-weight: bold;';
                                break;
                            }

                        default:
                            {
                                fontStyle = '';
                                break;
                            }
                    }

                    html += '' +
                            '<style data-id="FontFaces">' +
                                '@font-face {' +
                                    'font-family: ' + fontFamily + ';' +
                                    'src: local("' + fontFamily + '")';

                    if (fontPaths === null) {
                        html += '' +
                                    ', url("' + fontPath + '")' +
                                    ((fontFormat) ? ' format("' + fontFormat + '")' : '');
                    }
                    else {
                        fontPaths.forEach(function (font) {
                            var dummyResource = {
                                path: font.path,
                                basePath: font.basePath || fontBasePath || null
                            };

                            fontPath = preloader.getParsedURL(dummyResource);
                            fontPath = preloader.normalizeURL(fontPath);

                            fontFormat = font.fontFormat || null;

                            html += '' +
                                    ', url("' + fontPath + '")' +
                                    ((fontFormat) ? ' format("' + fontFormat + '")' : '');

                            return;
                        });
                    }

                    html += '' +
                                    ';' +
                                    fontStyle +
                                '}' +
                            '</style>' +
                            '<span style="font-family: ' + fontFamily + '; opacity: 0;">&nbsp;</span>' +
                            '';

                    fontContainer = document.createElement('div');
                    fontContainer.setAttribute('data-font', fontFamily);
                    fontContainer.innerHTML = html;

                    preloadContainer.appendChild(fontContainer);

                    return preloader;
                },

                getParsedURL: function getParsedURL(resource) {
                    var preloader = this,
                        parsedURL = null,
                        pathEngine = null,
                        params = null;

                    pathEngine = preloader.getPathEngine();
                    params = preloader.getParams();

                    if (pathEngine === null) {
                        if (resource.basePath) {
                            parsedURL = resource.basePath + '/' + resource.path;
                        }
                        else {
                            if (resource.path) {
                                parsedURL = resource.path;
                            }
                        }
                    }
                    else {
                        parsedURL = pathEngine(resource, params);
                    }

                    parsedURL = preloader.normalizeURL(parsedURL);

                    return parsedURL;
                },

                normalizeURL: function normalizeURL(url) {
                    var preloader = this,
                        normalizedURL = null;

                    normalizedURL = Preloader.normalizeURL(url);

                    return normalizedURL;
                },

                _checkIsDefined: function _checkIsDefined(definitionString) {
                    var preloader = this,
                        isDefined = false,
                        segments = null,
                        context = null,
                        currentContext = null,
                        loopCounter = null,
                        loopLimit = null;

                    definitionString = definitionString || null;

                    if (definitionString === null) {
                        return isDefined;
                    }

                    segments = definitionString.split('.');

                    loopCounter = 0;
                    loopLimit = segments.length;
                    context = window;

                    for (; loopCounter < loopLimit; loopCounter++) {
                        currentContext = segments[loopCounter]
                        if (!(currentContext in context)) {
                            break;
                        }

                        context = context[currentContext];
                    }

                    isDefined = (loopCounter === loopLimit);

                    return isDefined;
                },

                preload: function preload() {
                    var preloader = this;

                    if (preloader.isPreloading()) {
                        return;
                    }

                    preloader._setIsPreloadComplete(false)
                             ._setIsPreloading(true)
                             ._setLoadIndex(null)
                             ._setPreloadCount(0)
                             ._setRequestCount(0)
                             ._setIsWaitingForResourceLoad(false)
                             ._setIsFailed(false)
                             ._setPreloadData({})
                             ._setJSLoadStack([])
                             ._setJSLoadIndex(0)
                             ._setCSSLoadStack([]);

                    preloader._triggerEvent(EventTypes.PRELOAD_START);

                    preloader._loadPackagesStart();

                    return;
                },

                _loadPackagesStart: function _loadPackagesStart() {
                    var preloader = this;

                    preloader._triggerEvent(EventTypes.PRELOAD_PACKAGE_START);

                    preloader._loadPackages();

                    return preloader;
                },

                _loadPackages: function _loadPackages() {

                    var preloader = this,
                        resourceList = null,
                        preloadPackages = [],
                        preloadPackageLoader = null,
                        preloadPackageParams = null;

                    resourceList = preloader.getResourceList();

                    resourceList.forEach(function (resource, index) {
                        var curResource = null;

                        if (resource.type === FileTypes.PRELOAD_PACKAGE) {
                            curResource = $.extend(true, {}, resource);
                            curResource.id = index.toString();
                            curResource.type = FileTypes.JSON;
                            preloadPackages.push(curResource);
                        }

                        return;
                    });

                    if (preloadPackages.length === 0) {
                        preloader._loadPackagesSuccess();
                        return preloader;
                    }

                    preloadPackageParams = $.extend(true, {}, preloader.getParams());
                    preloadPackageParams.resourceList = preloadPackages;

                    preloadPackageLoader = new Preloader(preloadPackageParams);
                    preloadPackageLoader.on(EventTypes.PRELOAD_RESOURCE_PROGRESS, function (event) {
                        var resource = null,
                            triggeredEvent = null;

                        resource = event.resource;
                        resource = $.extend(true, {}, resource);
                        resource.type = FileTypes.PRELOAD_PACKAGE;

                        triggeredEvent = $.Event(EventTypes.PRELOAD_PACKAGE_PROGRESS);
                        triggeredEvent.resource = resource;

                        preloader._triggerEvent(triggeredEvent);
                    });
                    preloadPackageLoader.on(EventTypes.PRELOAD_SUCCESS, function (event) {
                        var preloadData = null,
                            updatedResourceList = [];

                        preloadData = preloadPackageLoader.getPreloadData();

                        resourceList.forEach(function (resource, index) {
                            var additionalResources = null;

                            if (resource.type === FileTypes.PRELOAD_PACKAGE) {

                                additionalResources = preloadData[index.toString()].data;
                                if (additionalResources) {
                                    additionalResources.forEach(function (resource, index) {
                                        updatedResourceList.push(resource);
                                        return;
                                    });
                                }

                                return;
                            }

                            updatedResourceList.push(resource);
                            return;
                        });

                        preloader.setResourceList(updatedResourceList, true);

                        preloader._loadPackages();

                        return;
                    });
                    preloadPackageLoader.on(EventTypes.PRELOAD_ERROR, function () {
                        preloader._loadPackagesError();
                        return;
                    });

                    preloadPackageLoader.preload();

                    return preloader;
                },

                _loadPackagesSuccess: function _loadPackagesSuccess() {
                    var preloader = this;

                    preloader._triggerEvent(EventTypes.PRELOAD_PACKAGE_SUCCESS);
                    preloader._triggerEvent(EventTypes.PRELOAD_PACKAGE_COMPLETE);

                    preloader._preloadStart();

                    return preloader;
                },

                _loadPackagesError: function _loadPackagesError() {
                    var preloader = this;

                    preloader._triggerEvent(EventTypes.PRELOAD_PACKAGE_ERROR);
                    preloader._triggerEvent(EventTypes.PRELOAD_PACKAGE_COMPLETE);

                    preloader._triggerEvent(EventTypes.PRELOAD_COMPLETE);

                    return preloader;
                },

                _preloadStart: function _preloadStart() {
                    var preloader = this;

                    preloader._triggerEvent(EventTypes.PRELOAD_RESOURCE_START);

                    preloader._preloadProgress();

                    return preloader;
                },

                _preloadProgress: function _preloadProgress() {
                    var preloader = this,
                        resourceList = null,
                        loadIndex = null,
                        totalResources = null,
                        waitForLoad = null;

                    if (preloader.isFailed()) {
                        return preloader;
                    }

                    resourceList = preloader.getResourceList();
                    loadIndex = preloader.getLoadIndex();
                    totalResources = preloader.getTotalResources();

                    if (totalResources === 0) {
                        preloader._preloadComplete();
                        return preloader;
                    }

                    if (loadIndex === null) {
                        loadIndex = 0;
                    }
                    else {
                        loadIndex++;
                    }

                    if (loadIndex === totalResources) {
                        return preloader;
                    }

                    preloader._setLoadIndex(loadIndex);

                    waitForLoad = preloader._loadResource(resourceList[loadIndex]);
                    preloader._setIsWaitingForResourceLoad(waitForLoad);

                    if (!waitForLoad) {
                        preloader._preloadProgress();
                    }

                    return preloader;
                },

                _resourceLoadComplete: function _resourceLoadComplete(resource) {
                    var preloader = this,
                        resourceURL = null,
                        resourceData = null,
                        preloadCount = null,
                        totalResources = null,
                        progressPercent = null,
                        event = null;

                    preloader.requestCountDown(resource);

                    if (preloader.isFailed()) {
                        return;
                    }

                    resource = resource || null;

                    resourceURL = resource.parsedURL;
                    resourceData = resource.data;

                    loadedURLs[resourceURL] = resource;

                    preloadCount = preloader.getPreloadCount();
                    preloadCount++;

                    preloader._setPreloadCount(preloadCount);

                    totalResources = preloader.getTotalResources();

                    switch (resource.type) {
                        case FileTypes.IMAGE:
                        case FileTypes.CUR:
                            {
                                preloader.addImage(resource);
                                break;
                            }

                        default:
                            {
                                break;
                            }
                    }

                    event = $.Event(EventTypes.PRELOAD_RESOURCE_PROGRESS);
                    event.resource = resource;
                    event.data = resourceData;

                    preloader._triggerEvent(event);

                    if (preloadCount === totalResources) {
                        // complete
                        preloader._preloadComplete();
                    }
                    else if (preloader.isWaitingForResourceLoad()) {
                        preloader._setIsWaitingForResourceLoad(false);
                        preloader._preloadProgress();
                    }

                    //if (isOnIE9
                    //    && preloadCount + preloader.getCSSLoadStack().length === totalResources) {
                    //    preloader._processCSSOnIE9();
                    //}

                    return;
                },

                _preloadComplete: function _preloadComplete() {
                    var preloader = this,
                        event = null;

                    if (!preloader.isFailed()) {

                        if (preloader.getTotalResources() > 0) {
                            event = EventTypes.PRELOAD_RESOURCE_SUCCESS;
                            preloader._triggerEvent(event);

                            event = EventTypes.PRELOAD_RESOURCE_COMPLETE;
                            preloader._triggerEvent(event);
                        }

                        event = EventTypes.PRELOAD_SUCCESS;
                        preloader._triggerEvent(event);
                    }

                    event = EventTypes.PRELOAD_COMPLETE;
                    preloader._triggerEvent(event);

                    return preloader;
                },

                _preloadError: function _preloadError(errorMsg, resource) {
                    var preloader = this,
                        defaultErrorMsg = null,
                        event = null;

                    defaultErrorMsg = 'An error occured while loading resources.';

                    errorMsg = errorMsg || defaultErrorMsg;
                    resource = resource || null;

                    preloader.requestCountDown(resource);

                    preloader._setIsFailed(true);

                    event = $.Event(EventTypes.PRELOAD_RESOURCE_ERROR);
                    event.error = errorMsg;
                    event.resource = resource;
                    preloader._triggerEvent(event);

                    event = $.Event(EventTypes.PRELOAD_RESOURCE_COMPLETE);
                    event.error = errorMsg;
                    event.resource = resource;
                    preloader._triggerEvent(event);

                    event = $.Event(EventTypes.PRELOAD_ERROR);
                    event.error = errorMsg;
                    event.resource = resource;
                    preloader._triggerEvent(event);

                    event = $.Event(EventTypes.PRELOAD_COMPLETE);
                    event.error = errorMsg;
                    event.resource = resource;
                    preloader._triggerEvent(event);

                    return;
                },

                _loadResource: function _loadResource(resource) {

                    var preloader = this,
                        resourceId = null,
                        resourceUrl = null,
                        resourceType = null,
                        resourceBasePath = null,
                        resourceForceLoad = null,
                        resourceDefines = null,
                        resourceData = null,
                        isLoadedURL = null,
                        requestDomain = null,
                        isCrossDomain = false,
                        waitForLoad = false,
                        $preloadContainer = null,
                        preloadContainer = null,
                        hasLoadEvent = true,
                        resourceTag = null,
                        resourceTagToRemove = null,
                        resourceOnLoad = null,
                        resourceOnError = null,
                        ie9JSResourceOnLoad = null,
                        ajaxRequest = null,
                        ajaxSuccess = null,
                        ajaxError = null,
                        ie9XDomainRequest = null,
                        jsLoadStack = null,
                        scriptTag = null,
                        event = null;

                    resourceId = resource.id || null;
                    resourceUrl = resource.path;
                    resourceType = resource.type;
                    resourceBasePath = resource.basePath || null;
                    resourceForceLoad = resource.forceLoad || false;
                    resourceDefines = resource.defines || null;

                    resourceUrl = preloader.getParsedURL(resource);

                    resource.parsedURL = resourceUrl;

                    domainPattern.lastIndex = 0;
                    requestDomain = domainPattern.exec(resourceUrl);
                    if (requestDomain !== null) {
                        requestDomain = requestDomain[1];
                    }

                    isCrossDomain = (requestDomain !== null && requestDomain !== currentDomain);


                    $preloadContainer = Preloader.getPreloadContainer();
                    preloadContainer = $preloadContainer[0];

                    

                    resourceOnLoad = function () {
                        resource.data = resourceData;

                        if (resourceTagToRemove !== null) {
                            $(resourceTagToRemove).remove();
                        }

                        if (resourceTag !== null) {
                            resourceTag.onload = null;
                            resourceTag.onerror = null;
                        }

                        if (resource.type === FileTypes.IMAGE) {
                            resource.element = this;
                        }

                        preloader._resourceLoadComplete(resource);
                    };

                    resourceOnError = function (errorMsg) {
                        if (resourceTagToRemove !== null) {
                            $(resourceTagToRemove).remove();
                        }

                        //remove the CSS file listing from the stack on error
                        if (resource.type === FileTypes.CSS){
                            delete loadedURLs[resourceUrl];
                        }

                        preloader._preloadError(errorMsg, resource);
                    };

                    ie9JSResourceOnLoad = function () {

                        var jsLoadIndex = preloader._getJSLoadIndex(),
                            i = null,
                            length = jsLoadStack.length,
                            curResource = null;

                        if (scriptTag.readyState === 'loaded') {
                            // Our script has download, but hasn't executed.
                            // It won't execute until we do:

                            resource.loaded = true;
                            for (i = jsLoadIndex; i < length; i++) {
                                curResource = jsLoadStack[i];
                                if (!curResource.loaded) {
                                    break;
                                }

                                preloadContainer.appendChild(curResource.scriptTag);
                            }

                            preloader._setJSLoadIndex(i);
                        }

                        return;
                    };

                    ajaxSuccess = function ajaxSuccess(data) {
                        var preloaderData = preloader.getPreloadData();

                        resourceData = data;

                        resource.data = resourceData;

                        if (resourceId) {
                            preloaderData[resourceId] = resource;
                        }

                        resourceOnLoad();
                        return;
                    };

                    ajaxError = function ajaxError(xhr, textStatus, errorThrown) {
                        resourceOnError(errorThrown);
                        return;
                    };

                    ajaxRequest = function (dataType, successCallback, errorCallback) {

                        successCallback = successCallback || ajaxSuccess;
                        errorCallback = errorCallback || ajaxError;

                        if (isOnIE9 && isCrossDomain) {
                            ie9XDomainRequest(dataType, successCallback, errorCallback);
                            return;
                        }

                        $.ajax({
                            url: resourceUrl,

                            dataType: dataType,

                            crossDomain: isCrossDomain,

                            success: successCallback,

                            error: errorCallback
                        });

                        return;
                    };

                    ie9XDomainRequest = function (dataType, successCallback, errorCallback) {
                        var xDomainRequest = null;

                        if (XDomainRequest) {
                            xDomainRequest = new XDomainRequest();

                            xDomainRequest.open("get", resourceUrl);

                            //Temporary fix: add onprogress event, as onload not gettign called

                            xDomainRequest.onprogress = function () { }

                            xDomainRequest.onload = function () {
                                var data = null;

                                switch (dataType) {
                                    case FileTypes.XML:
                                        {
                                            try {
                                                data = $.parseXML(xDomainRequest.responseText);
                                            }
                                            catch (err) {
                                                errorCallback(xDomainRequest, 'Parse error', err);
                                                return;
                                            }
                                            break;
                                        }

                                    case FileTypes.JSON:
                                        {
                                            try {
                                                data = $.parseJSON(xDomainRequest.responseText);
                                            }
                                            catch (err) {
                                                errorCallback(xDomainRequest, 'Parse error', err);
                                                return;
                                            }

                                            break;
                                        }

                                    default:
                                        {
                                            data = xDomainRequest.responseText;
                                            break;
                                        }
                                }

                                successCallback(data);
                                return;
                            };

                            xDomainRequest.onerror = function () {
                                errorCallback(xDomainRequest, 'Error', 'XDomain request failed');
                                return;
                            };

                            xDomainRequest.send();
                        }

                        return;
                    };

                    preloader.requestCountUp(resource);

                    if (resourceType !== FileTypes.REQUIREJS) {
                        isLoadedURL = (resourceUrl in loadedURLs);
                    }

                    if (!resourceForceLoad
                        && isLoadedURL) {
                        resourceData = loadedURLs[resourceUrl].data;

                        if (resourceId === null) {
                            resourceOnLoad();
                        }
                        else {
                            ajaxSuccess(resourceData);
                        }
                        return waitForLoad;
                    }

                    switch (resourceType) {
                        case FileTypes.JAVASCRIPT:
                            {
                                if (!resourceForceLoad && preloader._checkIsDefined(resourceDefines)) {
                                    resourceOnLoad();
                                    return waitForLoad;
                                }

                                scriptTag = document.createElement('script');

                                resourceTag = scriptTag;
                                resourceTagToRemove = scriptTag;

                                if (isOnIE9) {
                                    // do the thing-a-majig for IE9
                                    scriptTag.onreadystatechange = ie9JSResourceOnLoad;
                                    scriptTag.onload = resourceOnLoad;
                                    scriptTag.onerror = resourceOnError;
                                    scriptTag.src = resourceUrl;
                                    scriptTag.async = false;

                                    jsLoadStack = preloader.getJSLoadStack();
                                    resource.loaded = false;
                                    resource.index = jsLoadStack.length;
                                    resource.scriptTag = scriptTag;
                                    jsLoadStack.push(resource);
                                }
                                else {

                                    scriptTag.onload = resourceOnLoad;
                                    scriptTag.onerror = resourceOnError;
                                    scriptTag.async = false;
                                    scriptTag.src = resourceUrl;

                                    //dont use $(selector).append(scriptTag); it wont fire the onload event
                                    preloadContainer.appendChild(scriptTag);
                                }
                                break;
                            }

                        case FileTypes.REQUIREJS:
                            {
                                var requirePaths = null, path;

                                waitForLoad = true;

                                path = resourceUrl;

                                require([path], resourceOnLoad, resourceOnError);
                                break;
                            }

                        case FileTypes.CSS:
                            {
                                //Adds CSS to the stack before load starts
                                //This Avoid multiple time same CSS file load issue
                                loadedURLs[resourceUrl] = resource;
                                if (isOnIE9 && hasLoadEvent) {
                                    var linkTag = document.createElement('link');
                                    resource.linkTag = linkTag;
                                    resourceTag = linkTag;
                                    document.head.appendChild(linkTag);

                                    preloader.requestCountDown(resource);
                                    linkTag.setAttribute("rel", 'stylesheet');
                                    linkTag.setAttribute("type", 'text/css');
                                    linkTag.onload = resourceOnLoad;
                                    linkTag.onerror = resourceOnError;

                                    linkTag.setAttribute("href", resourceUrl);
                                }
                                else {

                                    var linkTag = document.createElement('link');

                                    resource.linkTag = linkTag;

                                    resourceTag = linkTag;

                                    preloadContainer.appendChild(linkTag);

                                    linkTag.rel = 'stylesheet';
                                    linkTag.type = 'text/css';

                                    linkTag.onload = resourceOnLoad;
                                    linkTag.onerror = resourceOnError;

                                    linkTag.href = resourceUrl;
                                }

                                break;
                            }

                        case FileTypes.IMAGE:
                            {

                                var imageTag = document.createElement('img');

                                resourceTagToRemove = imageTag;

                                imageTag.onload = resourceOnLoad;
                                imageTag.onerror = resourceOnError;

                                imageTag.src = resourceUrl;

                                preloadContainer.appendChild(imageTag);

                                break;
                            }

                        case FileTypes.FONT:
                            {
                                preloader._embedFont(resource, preloadContainer);
                                hasLoadEvent = false;
                                break;
                            }

                        case FileTypes.TEXT:
                            {
                                ajaxRequest('text');
                                break;
                            }

                        case FileTypes.HTML:
                            {
                                ajaxRequest('html');
                                break;
                            }

                        case FileTypes.XML:
                            {
                                ajaxRequest('xml');
                                break;
                            }

                        case FileTypes.JSON:
                        case FileTypes.LOC_JSON:
                            {
                                ajaxRequest('json');
                                break;
                            }

                        case FileTypes.GENERIC:
                            {
                                if (isCrossDomain) {
                                    // use an img tag to preload the resource without triggering any plugins in the browser
                                    var imageTag = document.createElement('img');

                                    preloadContainer.appendChild(imageTag);
                                    resourceTagToRemove = imageTag;

                                    imageTag.onload = resourceOnLoad;
                                    imageTag.onerror = resourceOnError;

                                    imageTag.src = resourceUrl;

                                }
                                else {
                                    // else try to load the data for the generic requests
                                    ajaxRequest(null);
                                }
                                break;
                            }
                        case FileTypes.CUR:    
                        default:
                            {
                                event = $.Event(EventTypes.PRELOAD_RESOURCE_UNKNOWN_TYPE);
                                event.resource = resource;

                                preloader._triggerEvent(event);

                                resourceOnLoad();

                                break;
                            }
                    }

                    if (!hasLoadEvent) {
                        resourceOnLoad();
                    }

                    return waitForLoad;
                },

                _processCSSOnIE9: function _processCSSOnIE9() {

                    var preloader = this,
                        $preloadContainer = null,
                        cssLoadStack = null,
                        cssLoadStackCount = null,
                        cssLoadStackCountLessOne = null,
                        cssCounter = 0,
                        IE9_CSS_LIMIT = null,
                        curStyleTag = null,
                        importString = null,
                        curImportStack = null,
                        generateLoadCallback = null;

                    IE9_CSS_LIMIT = Preloader.Constants.IE9_CSS_LIMIT;

                    $preloadContainer = Preloader.getPreloadContainer();

                    generateLoadCallback = function generateLoadCallback(cssStack, success) {
                        var callback = null;

                        success = success || false;

                        callback = function () {
                            if (success) {
                                cssStack.forEach(function (cssLoadObject) {
                                    cssLoadObject.success();
                                    return;
                                });
                            }
                            else {
                                cssStack.forEach(function (cssLoadObject) {
                                    cssLoadObject.error();
                                    return;
                                });
                            }
                            return;
                        };

                        return callback;
                    };


                    cssLoadStack = preloader.getCSSLoadStack();

                    cssLoadStackCount = cssLoadStack.length;
                    cssLoadStackCountLessOne = (cssLoadStackCount - 1);

                    cssLoadStack.forEach(function (curCSSLoadObject, index) {
                        if (curStyleTag === null) {
                            curStyleTag = document.createElement('style');
                            curStyleTag.setAttribute('type', 'text/css');

                            $preloadContainer.append(curStyleTag);

                            importString = '';
                            curImportStack = [];
                        }

                        importString += '@import url("' + curCSSLoadObject.resource.parsedURL + '");\r\n';
                        curImportStack.push(curCSSLoadObject);

                        if (((index + 1) % IE9_CSS_LIMIT) === 0
                            || index === cssLoadStackCountLessOne) {

                            curImportStack.forEach(function (curImportObject) {
                                preloader.requestCountUp(curImportObject.resource);
                                return;
                            });

                            curStyleTag.onload = generateLoadCallback(curImportStack, true);
                            curStyleTag.onerror = generateLoadCallback(curImportStack, false);

                            curStyleTag.styleSheet.cssText = importString;

                            curStyleTag = null;
                        }

                        return;
                    });

                    return;
                }
            },

            // Static
            {
                _nextPreloaderId: 1,

                defaults: {
                    resourceList: null,

                    PathEngine: null,

                    requestLimit: null,

                    templateId: null
                },

                currentURL: null,

                currentProtocol: null,

                currentDomain: null,

                currentOrigin: null,

                currentPath: null,

                requestLimit: 2,

                _requestCount: 0,

                _preloaders: [],

                _preloaderStackMap: {},

                _$preloadContainer: null,

                _loadedURLs: {},

                isOnIE9: isOnIE9,

                Constants: {
                    IE9_CSS_LIMIT: 30
                },

                FileTypes: {
                    JAVASCRIPT: 'javascript',
                    CSS: 'css',
                    IMAGE: 'image',
                    FONT: 'font',
                    TEXT: 'text',
                    HTML: 'html',
                    XML: 'xml',
                    JSON: 'json',
                    LOC_JSON: 'loc_json',
                    GENERIC: 'generic',
                    PRELOAD_PACKAGE: 'preload_package',
                    CUR:'cur',
                    REQUIREJS: 'requirejs'
                },

                Font: {
                    Style: {
                        BOLD: 'bold',
                        ITALIC: 'italic',
                        BOLD_ITALIC: 'bold_italic'
                    },

                    Format: {
                        TRUE_TYPE: 'truetype',
                        WOFF: 'woff',
                        OPEN_TYPE: 'opentype',
                        EOT: 'embedded-opentype'
                    }
                },

                Event: {
                    Types: {
                        PRELOAD_START: 'preloader.start',
                        PRELOAD_SUCCESS: 'preloader.success',
                        PRELOAD_ERROR: 'preloader.error',
                        PRELOAD_COMPLETE: 'preloader.complete',


                        PRELOAD_PACKAGE_START: 'preloader.package.start',
                        PRELOAD_PACKAGE_PROGRESS: 'preloader.package.progress',
                        PRELOAD_PACKAGE_SUCCESS: 'preloader.package.success',
                        PRELOAD_PACKAGE_ERROR: 'preloader.package.error',
                        PRELOAD_PACKAGE_COMPLETE: 'preloader.package.complete',


                        PRELOAD_RESOURCE_START: 'preloader.resource.start',
                        PRELOAD_RESOURCE_PROGRESS: 'preloader.resource.progress',
                        PRELOAD_RESOURCE_SUCCESS: 'preloader.resource.success',
                        PRELOAD_RESOURCE_ERROR: 'preloader.resource.error',
                        PRELOAD_RESOURCE_COMPLETE: 'preloader.resource.complete',

                        PRELOAD_RESOURCE_UNKNOWN_TYPE: 'preloader.resource.unknown_type'
                    },

                    TypesMap: {}
                },

                getPreloaders: function getPreloaders() {
                    var preloaders = null;
                    preloaders = Preloader._preloaders;
                    return preloaders;
                },

                _getPreloaderStackMap: function _getPreloaderStackMap() {
                    var preloaderStackMap = null;
                    preloaderStackMap = Preloader._preloaderStackMap;
                    return preloaderStackMap;
                },

                getPreloader: function getPreloader(preloaderId) {
                    var preloader = null,
                        preloaders = null,
                        preloaderStackMap = null,
                        preloaderIndex = null;

                    preloaders = Preloader.getPreloaders();
                    preloaderStackMap = Preloader._getPreloaderStackMap();

                    preloaderId = preloaderId || null;
                    if (preloaderId in preloaderStackMap) {
                        preloaderIndex = preloaderStackMap[preloaderId];
                        preloader = preloaders[preloaderIndex];
                    }

                    return preloader;
                },

                _addPreloader: function _addPreloader(preloader) {
                    var isSuccess = false,
                        preloaders = null,
                        preloaderStackMap = null,
                        nextIndex = null;

                    if (!Preloader.isValidInstance(preloader)) {
                        return isSuccess;
                    }

                    preloaders = Preloader.getPreloaders();
                    preloaderStackMap = Preloader._getPreloaderStackMap();
                    nextIndex = preloaders.length;

                    preloaders.push(preloader);
                    preloaderStackMap[preloader.id] = nextIndex;

                    isSuccess = true;

                    return isSuccess;
                },

                _removePreloader: function _removePreloader(preloader) {
                    var isSuccess = false,
                        preloaders = null,
                        preloaderStackMap = null,
                        loopCounter = null,
                        loopLimit = null,
                        currentPreloader = null;

                    preloader = preloader || null;
                    preloaders = Preloader.getPreloaders();
                    preloaderStackMap = Preloader._getPreloaderStackMap();

                    if (typeof preloader === 'number') {
                        preloader = Preloader.getPreloader(preloader);
                    }

                    if (!Preloader.isValidInstance(preloader)) {
                        return isSuccess;
                    }

                    loopCounter = preloaderStackMap[preloader.id];
                    loopLimit = (preloaders.length - 1);

                    for (; loopCounter < loopLimit; loopCounter++) {
                        currentPreloader = preloaders[loopCounter + 1];
                        preloaders[loopCounter] = currentPreloader;
                        preloaderStackMap[currentPreloader.id] = loopCounter;
                    }

                    preloaders.pop();
                    delete preloaderStackMap[preloader.id];

                    isSuccess = true;

                    return isSuccess;
                },

                isValidInstance: function isValidInstance(preloader) {
                    var isValidInstance = null;
                    isValidInstance = (preloader instanceof Preloader);
                    return isValidInstance;
                },

                _setPreloadContainer: function _setPreloadContainer() {
                    var $preloadContainer = null,
                        $body = null,
                        styles = '';

                    $body = $(document.body);
                    $preloadContainer = $('<div></div>');

                    styles += 'position: absolute !important;' +
                              'top: -9999999999px !important;' +
                              'left: -9999999999px !important;' +
                              'width: 1px !important;' +
                              'height: 1px !important;' +
                              'overflow: hidden !important;' +
                              '';

                    $preloadContainer.attr('style', styles);

                    Preloader._$preloadContainer = $preloadContainer;
                    $body.append($preloadContainer);

                    return $preloadContainer;
                },

                getPreloadContainer: function getPreloadContainer() {
                    var $preloadContainer = null;

                    $preloadContainer = Preloader._$preloadContainer;
                    if ($preloadContainer === null) {
                        $preloadContainer = Preloader._setPreloadContainer();
                    }

                    return $preloadContainer;
                },

                normalizeURL: function normalizeURL(url) {
                    var preloader = this,
                        normalizedURL = null,
                        domainMatch = null,
                        urlDomain = null,
                        urlPath = null,
                        urlOrigin = null,
                        urlQuery = null,
                        urlHash = null,
                        urlParts = null,
                        urlPartsPattern = null,
                        pathSegments = null,
                        newPathSegments = null,
                        curPathSegment = null,
                        loopCounter = null,
                        loopLimit = null,
                        loopLimitLastButOne = null,
                        isLastLoop = false;

                    normalizedURL = url;

                    normalizedURL = normalizedURL.replace(/^\/\//, currentProtocol + '//');

                    domainPattern.lastIndex = 0;
                    domainMatch = domainPattern.exec(normalizedURL);

                    if (domainMatch === null) {
                        normalizedURL = normalizedURL.replace(/^([^/]+)/, currentPath + '$1');
                        normalizedURL = normalizedURL.replace(/^\//, '');
                        urlDomain = currentDomain;
                        urlOrigin = currentOrigin;
                    }
                    else {
                        urlOrigin = domainMatch[0];
                        urlDomain = domainMatch[1];
                        normalizedURL = normalizedURL.replace(urlOrigin, '');
                    }

                    urlPartsPattern = /^(.*?)(?:\?(.*?)){0,1}(?:#(.*?)){0,1}$/;
                    urlParts = urlPartsPattern.exec(normalizedURL);

                    normalizedURL = urlParts[1];
                    urlQuery = urlParts[2] || null;
                    urlHash = urlParts[3] || null;

                    pathSegments = normalizedURL.split('/');

                    newPathSegments = [];

                    loopCounter = 0;
                    loopLimit = pathSegments.length;
                    loopLimitLastButOne = (loopLimit - 1);

                    for (; loopCounter < loopLimit; loopCounter++) {
                        curPathSegment = pathSegments[loopCounter];
                        isLastLoop = (loopCounter === loopLimitLastButOne);

                        if (curPathSegment === '.' || curPathSegment === '') {
                            if (!isLastLoop) {
                                continue;
                            }

                            curPathSegment = '';
                        }

                        if (curPathSegment === '..') {
                            if (newPathSegments.length > 0) {
                                newPathSegments.pop();
                            }

                            if (!isLastLoop) {
                                continue;
                            }

                            curPathSegment = '';
                        }

                        newPathSegments.push(curPathSegment);
                    }

                    normalizedURL = newPathSegments.join('/');
                    normalizedURL = normalizedURL +
                                    ((urlQuery === null) ? '' : '?' + urlQuery) +
                                    ((urlHash === null) ? '' : '#' + urlHash) +
                                    '';

                    normalizedURL = urlOrigin + '/' + normalizedURL;

                    return normalizedURL;
                },

                _setRequestCount: function _setRequestCount(requestCount) {
                    requestCount = (typeof requestCount === 'number') ? requestCount : 0;
                    Preloader._requestCount = requestCount;
                    return Preloader;
                },

                getRequestCount: function getRequestCount() {
                    var requestCount = null;
                    requestCount = Preloader._requestCount;
                    return requestCount;
                },

                requestCountUp: function requestCountUp() {
                    var requestCount = null;
                    requestCount = Preloader.getRequestCount();
                    requestCount++;
                    Preloader._setRequestCount(requestCount);
                    return;
                },

                requestCountDown: function requestCountDown() {
                    var requestCount = null;
                    requestCount = Preloader.getRequestCount();
                    requestCount--;
                    Preloader._setRequestCount(requestCount);
                    return;
                },

                isRequestLimitReached: function isRequestLimitReached() {
                    var isRequestLimitReached = null;
                    isRequestLimitReached = (Preloader.getRequestCount() >= Preloader.requestLimit);
                    return isRequestLimitReached;
                }
            }
        );

        EventTypes = Preloader.Event.Types;
        EventTypesMap = Preloader.Event.TypesMap;

        for (var eventType in EventTypes) {
            if (!EventTypes.hasOwnProperty(eventType)) {
                continue;
            }

            EventTypesMap[EventTypes[eventType]] = eventType;
        }


        FileTypes = Preloader.FileTypes;

        FontStyles = Preloader.Font.Style;
        FontFormat = Preloader.Font.Format;

        loadedURLs = Preloader._loadedURLs;

        currentURL = window.location.href;
        currentProtocol = window.location.protocol;

        currentDomain = window.location.host || null;

        if (currentDomain === null) {
            domainPattern.lastIndex = 0;
            currentDomain = domainPattern.exec(currentURL)[1];

            Preloader.currentDomain = currentDomain;
        }

        currentOrigin = window.location.origin || null;

        if (currentOrigin === null) {
            domainPattern.lastIndex = 0;
            currentOrigin = domainPattern.exec(currentURL)[0];

            Preloader.currentOrigin = currentOrigin;
        }

        if (currentPath === null) {
            currentPath = window.location.pathname;
            currentPath = currentPath.replace(/(?:[^/]*$)/g, '');

            Preloader.currentPath = currentPath;
        }

        currentURL = Preloader.normalizeURL(currentURL);
        Preloader.currentURL = currentURL;

        domainPattern.lastIndex = 0;
        currentPath = currentURL.replace(domainPattern, '');
        currentPath = currentPath.replace(/[#?].*$/, '');
        currentPath = currentPath.replace(/(?:[^/]*$)/g, '');

        Preloader.currentPath = currentPath;

        return Preloader;
    })();

    return;
})(window.MathInteractives);
