(function () {
    var customItemsApp,
        customLearnosityItems,
        origInit,
        origReady,
        dispatchCustomEvent = function (evtName, elem) {
            var evt;
            elem = elem || document.body;

            if (typeof window.CustomEvent === "function") {
                evt = new CustomEvent(evtName);
            } else {
                // fix for IE
                evt = window.parent.document.createEvent("CustomEvent");
                evt.initEvent(evtName, false, false);
            }
            elem.dispatchEvent(evt);
        };
    var exeWrapper = {};
    window.LoadState = {
        itemsApp: false,
        learnosityReady: false,
        DOMReady: false,
        exeWrapper: exeWrapper,
        recentlyExecuted: false
    };
    window.BIL = {
        CustomJS: {}
    };

    var _bind = Function.prototype.apply.bind(Function.prototype.bind);
    Object.defineProperty(Function.prototype, 'bind', {
        value: function (obj) {
            var boundFunction = _bind(this, arguments);
            boundFunction.___boundObject = obj;
            return boundFunction;
        }
    });

    var onready = function () {
        window.LoadState.learnosityReady = true;
        dispatchCustomEvent("learnosityloaded");
        if (onready === origready) {
            return;
        }
        return origready.apply(null, arguments);
    };

    var customInit = function () {
        if (arguments.length > 1 && arguments[1].readyListener) {
            origready = arguments[1].readyListener;
            arguments[1].readyListener = onready;
        }
        if (customInit === origInit) {
            return;
        }
        return origInit.apply(customLearnosityItems, arguments);
    };

    var customExecute = function () {
        if (LoadState.DOMReady && exeWrapper.origExecute && !window.LoadState.recentlyExecuted) {
            window.LoadState.recentlyExecuted = true;
            return exeWrapper.origExecute.apply(this, arguments);
        }
    };

    Object.defineProperty(window, "itemsApp", {
        get: function () {
            return customItemsApp;
        },
        set: function (value) {
            window.LoadState.itemsApp = true;
            dispatchCustomEvent("itemsappinit");
            customItemsApp = value;
            return customItemsApp;
        }
    });

    Object.defineProperty(window, "LearnosityItems", {
        get: function () {
            return customLearnosityItems;
        },
        set: function (value) {
            if (value.init) {
                if (value.init != customInit) {
                    origInit = value.init;
                }
                value.init = customInit;
            }
            customLearnosityItems = value;
            return customLearnosityItems;
        }
    });

    Object.defineProperty(window, "execute", {
        get: function () {
            return customExecute;
        },
        set: function (value) {
            exeWrapper.origExecute = value;
            return customExecute;
        }
    });
    console.clear();

    var elementsFromPoint = function (x, y) {
        var parents = [];
        var parent = void 0;
        if (x >= 0 && y >= 0) {
            do {
                if (parent !== document.elementFromPoint(x, y)) {
                    parent = document.elementFromPoint(x, y);
                    parents.push(parent);
                    parent.style.pointerEvents = 'none';
                } else {
                    parent = false;
                }
            } while (parent);
            parents.forEach(function (parent) {
                return parent.style.pointerEvents = 'all';
            });
        }
        return parents;
    }

    if (!document.elementsFromPoint && !document.msElementsFromPoint) {
        document.elementsFromPoint = elementsFromPoint;
    }
})();