/**
* Event manager class, capable of providing custom events, such as long tap, tap, click, etc.
* @submodule EventManager
* @private
*/
MathUtilities.Components.EventManager = (function () {
    /**
    * Keeps key based events inside it.
    * @type Object
    * @property events
    * @private
    */
    this.events = {};
    this.longTapDuration = 600;
    this.tapDistanceThreshold = 2;
    this.timerId = null;
    this._hitPoint = null;
    this._curPoint = null;
    this._bLongTapOccured = false;


    this.listenTo = function (domEle, eventName, listener, scope) {
        this.startListening(domEle);
        this.addListener(domEle, eventName, listener, scope);
    },

    this.startListening = function (domEle) {
        var curObj, iLooper = 0;
        domEle = domEle || window;

        if (this.bTouchDevice) {
            MathUtilities.Components.EventManager.EventDispatcher.addEventListener("touchstart", this.onTouchStart, domEle, this);
            MathUtilities.Components.EventManager.EventDispatcher.addEventListener("touchmove", this.onTouchMove, domEle, this);
            MathUtilities.Components.EventManager.EventDispatcher.addEventListener("touchend", this.onTouchEnd, domEle, this);
        }
        else {
            MathUtilities.Components.EventManager.EventDispatcher.addEventListener("mousedown", this.onTouchStart, domEle, this);
            MathUtilities.Components.EventManager.EventDispatcher.addEventListener("mousemove", this.onTouchMove, domEle, this);
            MathUtilities.Components.EventManager.EventDispatcher.addEventListener("mouseup", this.onTouchEnd, domEle, this);
            MathUtilities.Components.EventManager.EventDispatcher.addEventListener("click", this.onTap, domEle, this);
        }



    }

    this.stopListening = function (domEle) {
        domEle = domEle || window;

        if (this.bTouchDevice) {
            MathUtilities.Components.EventManager.EventDispatcher.removeEventListener("mousedown", this.onTouchStart, domEle, this);
            MathUtilities.Components.EventManager.EventDispatcher.removeEventListener("mousemove", this.onTouchMove, domEle, this);
            MathUtilities.Components.EventManager.EventDispatcher.removeEventListener("mouseup", this.onTouchEnd, domEle, this);
        }
        else {
            MathUtilities.Components.EventManager.EventDispatcher.removeEventListener("touchstart", this.onTouchStart, domEle, this);
            MathUtilities.Components.EventManager.EventDispatcher.removeEventListener("touchmove", this.onTouchMove, domEle, this);
            MathUtilities.Components.EventManager.EventDispatcher.removeEventListener("touchend", this.onTouchEnd, domEle, this);
        }
        MathUtilities.Components.EventManager.EventDispatcher.removeEventListener("click", this.onTap, domEle, this);
    }

    this.onTouchStart = function (eventObject) {
        this._hitPoint = this.getEventPoint(eventObject);
        var self = this,
            closureFn = function () {
                // Check to see if the timer is still running or not.
                if (self.timerId) {
                    self.onLongTap(eventObject);
                }
            }

        this.timerId = setTimeout(closureFn, this.longTapDuration);

        if (this.bTouchDevice)
            this.fireEvent(eventObject.target, this.STATES.TOUCHSTART, null, eventObject);
        else
            this.fireEvent(eventObject.target, this.STATES.MOUSEDOWN);
    }

    this.onTouchMove = function (eventObject) {
        this._curPoint = this.getEventPoint(eventObject);
        this.clearTimers();
        if (this.bTouchDevice)
            this.fireEvent(eventObject.target, this.STATES.TOUCHMOVE, null, eventObject);
        else
            this.fireEvent(eventObject.target, this.STATES.MOUSEMOVE);
    }

    this.onTouchEnd = function (eventObject) {
        this._curPoint = this.getEventPoint(eventObject);
        if (!this._bLongTapOccured) {

            if (this.arePointsEqual(this._hitPoint, this._curPoint)) {
                this.onTap(eventObject);
            }
            else if (this.bTouchDevice)
                this.fireEvent(eventObject.target, this.STATES.TOUCHEND, null, eventObject);
            else
                this.fireEvent(eventObject.target, this.STATES.MOUSEUP);
        }

        // Clean up of timers is must.
        if (this.timerId !== null) {
            this.clearTimers();
        }

        this._bLongTapOccured = false;

    }

    this.onTap = function (eventObject) {
        if (this.bTouchDevice)
            this.fireEvent(eventObject.target, this.STATES.TAP, null, eventObject);
        else
            this.fireEvent(eventObject.target, this.STATES.CLICK);
    }

    this.onLongTap = function (eventObject) {
        if (this.bTouchDevice)
            this.fireEvent(eventObject.target, this.STATES.LONGTAP, null, eventObject);

        this.clearTimers();

        this._bLongTapOccured = true;
    }

    this.clearTimers = function () {
        clearTimeout(this.timerId);
        this.timerId = null;

    }

    this.IsTouchDevice = function () {
        return 'ontouchstart' in window || navigator.msMaxTouchPoints;
    }

    this.arePointsEqual = function (pointA, pointB) {
        if (!pointA || !pointB) {
            return;
        }

        if (Math.abs(pointA.x - pointB.x) <= this.tapDistanceThreshold
            && Math.abs(pointA.y - pointB.y) <= this.tapDistanceThreshold && pointA.x !== -1 && pointB.x !== -1) {
            return true;
        }

        return false;

    }

    this.getEventPoint = function (eventObj) {
        var pointObj = { x: -1, y: -1 }, dummyArr;
        if (this.bTouchDevice && eventObj.changedTouches && eventObj.changedTouches.length) {
            dummyArr = eventObj.changedTouches[eventObj.changedTouches.length - 1];
            pointObj.x = dummyArr.clientX;
            pointObj.y = dummyArr.clientY;

        }
        else {
            pointObj.x = eventObj.clientX;
            pointObj.y = eventObj.clientY;
        }

        return pointObj;
    }
    this.bTouchDevice = this.IsTouchDevice();

})

MathUtilities.Components.EventManager.prototype.STATES = {
    NO_TOUCH: 'no_touch',

    TAPHOLD: 'tap_hold',
    TAP: 'tap',
    CLICK: 'click',
    TOUCHSTART: 'touchstart',
    TOUCHMOVE: 'touchmove',
    TOUCHEND: 'touchend',
    MOUSEDOWN: 'mousedown',
    MOUSEMOVE: 'mousemove',
    MOUSEUP: 'mouseup',
    LONGTAP: 'long_tap',

    DRAGSTART: 'drag_start',
    DRAGGING: 'dragging',
    DRAGEND: 'drag_end',

    PINCHSTART: 'pinch_start',
    PINCHING: 'pinching',
    PINCHEND: 'pinch_end',

    SWIPESTART: 'swipe_start',
    SWIPING: 'swipping',
    SWIPE_END: 'swipe_end'
};


MathUtilities.Components.EventManager.prototype.addListener = function (domEle, eventName, handler, scope) {

    if (!this.events) {
        this.events = {};
    }

    if (!this.events[eventName]) {
        this.events[eventName] = {};
    }

    if (!this.events[eventName].listeners) {
        this.events[eventName].listeners = [];
    }

    var listeners = this.events[eventName].listeners;
    if (listeners.length > 0) {
        var count = listeners.length;
        for (var i = 0; i < count; i++) {
            if (listeners[i].fireFn == handler && listeners[i].scope == scope && listeners[i].domEle == domEle) {
                return false;
            }
        }

    }

    this.events[eventName].listeners.push({
        fireFn: handler,
        scope: scope,
        domEle: domEle
    });

    return true;
}

MathUtilities.Components.EventManager.prototype.removeListener = function (domEle, eventName, handler, scope) {

    if (!this.events[eventName]) {
        return;
    }

    var listeners = this.events[eventName].listeners;
    if (!listeners) {
        return;
    }
    if (listeners.length > 0) {
        var count = listeners.length;
        for (var i = 0; i < count; i++) {
            if (listeners[i].fireFn == handler && listeners[i].scope == scope && listeners[i].domEle == domEle) {
                listeners.splice(i, 1);
                break;
            }
        }
    }
}

MathUtilities.Components.EventManager.prototype.fireEvent = function (domEle, eventName, data, event) {
    if (data === undefined || data === null) {
        data = {};
    }
    if (!this.events[eventName]) {
        return;
    }

    var listeners = this.events[eventName].listeners, tempTarget;
    if (!listeners) {
        return;
    }

    if (listeners.length > 0) {
        var count = listeners.length;
        var args = arguments.length ? Array.prototype.slice.call(arguments, 1) : [];
        for (var i = 0; i < count; i++) {
            if (listeners[i].domEle == domEle || listeners[i].domEle.contains(domEle)) {
                data.eventName = eventName;
                listeners[i].fireFn.apply(listeners[i].scope, [data, listeners[i].domEle, event]);
            }
        }

    }
}