function Canvas(params) {
    this.setDefaultValues();
    this.init(params);
    this.attachListeners();
}

Canvas.protoype.setDefaultValues = function(params) {
    this.dragEnabled = false;
    this.paths = [];
    this.listeners = {};
    this.stackingOrder = [];
}

Canvas.protoype.init = function(params) {
    this.canvas = params.canvas;
    this.ctx = params.ctx;
    this.height = params.height;
    this.width = params.width;
    this.backgroundColor = params.backgroundColor || "#fff";
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
        this.listeners[type].forEach(function(listener, index, array) {
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
    this.clear();
    this.stackingOrder.forEach(function(path, index, array) {
        switch (path.type) {
            case Path.PATH_TYPES.IMAGE:
                this.drawImage(path);
                break

            case Path.PATH_TYPES.RECT:
                this.drawRectangle(path);
                break;
        }
    })
}

Canvas.protoype.clear = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this.backgroundColor;
    this.drawRectangle(0, 0, this.width, this.height);
}

Canvas.protoype.drawRectangle = function(path) {
    this.ctx.beginPath();
    this.ctx.fillStyle = path.fillStyle || "#444";
    this.ctx.strokeStyle = path.strokeStyle || "#000";
    this.ctx.rect(path.x, path.y, path.width, path.height);
    this.ctx.closePath();
    this.ctx.fill();
    this.paths.push(path);
    this.stackingOrder.push(path);
}

Canvas.protoype.drawImage = function(imagePath) {
    this.ctx.drawImage(imagePath.imgSrc, imagePath.imgX, imagePath.imgY, imagePath.imgWidth, imagePath.imgHeight, imagePath.x, imagePath.y, imagePath.width, imagePath.height);
    this.paths.push(path);
    this.stackingOrder.push(imagePath);
}

Canvas.protoype.removePath = function(name) {
    // find path by name from paths and stacking order and splice
}
