function Canvas(params) {
    this.setDefaultValues();
    this.init(params);
    this.attachListeners();
}

Canvas.protoype.setDefaultValues = function(params) {
    this.dragEnabled = false;
    this.paths = [];
    this.listeners = {};
}

Canvas.protoype.init = function(params) {
    this.canvas = params.canvas;
    this.ctx = params.ctx;
    this.height = params.height;
    this.width = params.width;
}

/*********** EVENTS LISTENER AND HANDLERS *****************/

Canvas.protoype.attachListeners = function() {
    this.canvas.onmousedown = this.mousedown;
    this.canvas.onmousemove = this.mousemove;
    this.canvas.onmouseup = this.mouseup;
}

Canvas.protoype.mousedown = function(event) {
    this.dragEnabled = true;
    this.dispatchEvents("mousedown");
}

Canvas.prototype.mousemove = function() {
    this.dispatchEvents("mousemove");
}

Canvas.prototype.mouseup = function(event) {
    this.dragEnabled = false;
    this.dispatchEvents("mouseup");
}

Canvas.protoype.addListener = function(type, callback, ctx, params, identifier) {
    if (this.listeners[type] == null) {
        this.listeners[type] = [];
    }
    this.listeners.type.push({
        "callback": callback,
        "ctx": ctx,
        "params": params,
        "identifier": identifier
    });
}

Canvas.protoype.detachListener = function(type, identifier) {
    if (this.listeners[type]) {
        //find listener from identifier and splice from array
    }
}

Canvas.protoype.dispatchEvents = function(type) {
    if (this.listeners[type]) {
        this.listeners[type].forEach(function callback(listener, index, array) {
            listener.callback.apply(listener.ctx, listener.params);
        }, this);
    }
}

/***************** DRAWING METHODS ************************/

Canvas.protoype.redraw = function() {
    this.draw();
    if (this.needsUpdate) {
        window.requestAnimationFrame(this.redraw, 10);
    }
}

Canvas.protoype.draw = function() {

}

Canvas.protoype.drawRectangle = function(path) {
    this.ctx.beginPath();
    this.ctx.rect(path.x, path.y, path.width, path.height);
    this.ctx.closePath();
    this.ctx.fill();
}
