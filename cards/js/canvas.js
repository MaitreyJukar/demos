function Canvas(params) {
    this.setDefaultValues();
    this.init(params);
    this.attachListeners();
};

Canvas.prototype.setDefaultValues = function(params) {
    this.dragEnabled = false;
    this.paths = {};
    this.listeners = {};
    this.stackingOrder = [];
    this.activePath = null;
};

Canvas.prototype.init = function(params) {
    this.canvas = params.canvas;
    this.ctx = params.ctx;
    this.height = params.height;
    this.width = params.width;
    this.backgroundColor = params.backgroundColor || "#fff";
};

/*********** EVENTS LISTENER AND HANDLERS *****************/

Canvas.prototype.attachListeners = function() {
    this.canvas.onmousedown = this.mousedown.bind(this);
    this.canvas.onmousemove = this.mousemove.bind(this);
    this.canvas.onmouseup = this.mouseup.bind(this);
};

Canvas.prototype.mousedown = function(event) {
    this.activePath = this.getActivePath(event);
    this.dragEnabled = !!this.activePath;
    this.dispatchEvents("mousedown");
};

Canvas.prototype.mousemove = function(event) {
    if (this.dragEnabled) {
        this.activePath.x = event.pageX - this.canvas.offsetLeft;
        this.activePath.y = event.pageY - this.canvas.offsetTop;
        this.draw();
    }
    this.dispatchEvents("mousemove");
};

Canvas.prototype.mouseup = function(event) {
    this.dragEnabled = false;
    this.dispatchEvents("mouseup");
};

Canvas.prototype.addListener = function(type, callback, ctx, params, identifier) {
    if (this.listeners[type] == null) {
        this.listeners[type] = [];
    }
    this.listeners.type.push({
        "callback": callback,
        "ctx": ctx,
        "params": params,
        "identifier": identifier
    });
};

Canvas.prototype.detachListener = function(type, identifier) {
    if (this.listeners[type]) {
        //find listener from identifier and splice from array
    }
};

Canvas.prototype.dispatchEvents = function(type) {
    if (this.listeners[type]) {
        this.listeners[type].forEach(function(listener, index, array) {
            listener.callback.apply(listener.ctx, listener.params);
        }, this);
    }
};


/************** HELPERS *****************/


Canvas.prototype.getActivePath = function(event) {
    var i = this.stackingOrder.length - 1,
        path;
    for (; i >= 0; i--) {
        path = this.stackingOrder[i];
        if (this.isPointInPath(path, event.pageX, event.pageY)) {
            return path;
        }
    }
    return null;
};

Canvas.prototype.isPointInPath = function(path, x, y) {
    return x < path.x + path.width + this.canvas.offsetLeft && x > path.x - path.width +
        this.canvas.offsetLeft && y < path.y + path.height + this.canvas.offsetTop &&
        y > path.y - path.height + this.canvas.offsetTop;
};

/***************** DRAWING METHODS ************************/

Canvas.prototype.redraw = function() {
    this.draw();
    if (this.needsUpdate) {
        window.requestAnimationFrame(this.redraw, 10);
    }
};

Canvas.prototype.draw = function() {
    this.clear();
    var i = this.stackingOrder.length - 1,
        path;
    for (; i >= 0; i--) {
        path = this.stackingOrder[i];
        switch (path.type) {
            case Path.PATH_TYPES.IMAGE:
                this.drawImage(path);
                break

            case Path.PATH_TYPES.RECT:
                this.drawRectangle(path);
                break;
        }
    }
};

Canvas.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this.backgroundColor;
    this.drawRectangle(new Path({
        "x": 0,
        "y": 0,
        "width": this.width,
        "height": this.height,
        "name": 'background'
    }));
};

Canvas.prototype.addRectangle = function(path) {
    this.drawRectangle(path);
    this.paths[path.name] = path;
    this.stackingOrder.push(path);
};

Canvas.prototype.drawRectangle = function(path) {
    this.ctx.beginPath();
    this.ctx.fillStyle = path.fillStyle || "#444";
    this.ctx.strokeStyle = path.strokeStyle || "#000";
    this.ctx.rect(path.x, path.y, path.width, path.height);
    this.ctx.closePath();
    this.ctx.fill();
};

Canvas.prototype.getPath = function(name) {
    return this.paths[name];
};

Canvas.prototype.addImage = function(imagePath) {
    this.drawImage(imagePath);
    this.paths[imagePath.name] = imagePath;
    this.stackingOrder.push(imagePath);
};

Canvas.prototype.drawImage = function(imagePath) {
    this.ctx.drawImage(imagePath.imgSrc, imagePath.imgX, imagePath.imgY, imagePath.imgWidth, imagePath.imgHeight, imagePath.x, imagePath.y, imagePath.width, imagePath.height);
};

Canvas.prototype.removePath = function(name) {
    this.stackingOrder.splice(this.stackingOrder.indexOf(this.paths[name]), 1);
    delete this.paths[name];
};

Canvas.prototype.removeAllPaths = function() {
    this.paths = {};
    this.stackingOrder.length = 0;
}

Canvas.prototype.clearCanvas = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
}
