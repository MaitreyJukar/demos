
MathUtilities.Components.EventManager.EventDispatcher = {}
MathUtilities.Components.EventManager.EventDispatcher.map = {};


MathUtilities.Components.EventManager.EventDispatcher.addEventListener = function (evt, fn, domEle, scope, bCapture) {
    var ED = MathUtilities.Components.EventManager.EventDispatcher;

    // Check if domelements are passed or not
    // If the dom element passed is an array of dom , that happens incase of querySelectors 
    //      then loop through all the dom elements and add the listeners to each of them
    if (domEle && domEle.length) {
        var iLooper = 0,
            len = domEle.length;
        for (; iLooper < len; iLooper++) {
            this.addEventListener(evt, fn, domEle[0], scope, bCapture);
        }

        return;
    }



    if (undefined === bCapture)
        bCapture = false;

    if (undefined === ED.map[evt])
        ED.map[evt] = [];

    var evtMap = ED.map[evt];

    //test if event listener already present.
    for (var i = 0; i < evtMap.length; i++) {
        if (evtMap[i].domEle === domEle && evtMap[i].fn === fn && evtMap[i].scope === scope && evtMap[i].evt === evt) {
            console.warn('EventDispatcher :: addEventListener - Event \'' + evt + '\' already found registered for ' + domEle.id + ' for scope ' + scope.id);
            return;
        }
    }

    //Used closure in place of single function to avoid loop to saerch for target.
    var closure = function () {
        fn.apply(scope, arguments);
    }

    ED.map[evt].push({
        "scope": scope,
        "fn": fn,
        "domEle": domEle,
        "evt": evt,
        "closure": closure
    });

    domEle.addEventListener(evt, closure, bCapture);
}

MathUtilities.Components.EventManager.EventDispatcher.removeEventListener = function (evt, fn, domEle, scope) {
    var ED = MathUtilities.Components.EventManager.EventDispatcher;
    var evtMap = ED.map[evt];
    if(!evtMap)
        return;

    for(var i = 0 ; i < evtMap.length ; )
    {
        if(evtMap[i].domEle === domEle && evtMap[i].fn === fn && evtMap[i].scope === scope)
        {
            evtMap[i].domEle.removeEventListener(evt, evtMap[i].closure);
            evtMap[i].closure = null;
            var ele = evtMap.splice(i,1);
            delete ele;
        }
        else
            i++;
    }
}

MathUtilities.Components.EventManager.EventDispatcher.eventListener = function (e) {
    var ED = MathUtilities.Components.EventManager.EventDispatcher;
    var evtMap = ED.map[e.type].slice(0);

    for (var i = 0; i < evtMap.length; i++) {
        if (evtMap[i].domEle === e.currentTarget) {
            var fn = evtMap[i].fn;
            evtMap[i].fn.apply(evtMap[i].scope, [e]);
        }
    }
}
