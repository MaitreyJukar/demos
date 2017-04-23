function Canvas(params) {
    this.setDefaultValues();
    this.init(params);
    this.attachListeners();
    this.sorted = false;
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
    this.downDelta = this.getDownDelta(event, this.activePath);
    this.bringToTop(this.activePath);
    this.dispatchEvents("mousedown");
    this.activePath.lastCorrectPath = {
        x: this.activePath.x,
        y: this.activePath.y
    }
};

Canvas.prototype.mousemove = function(event) {
    var i, compare, arePathsIntersecting = false;
    if (this.dragEnabled) {
        this.activePath.x = event.pageX - this.canvas.offsetLeft - this.downDelta.x;
        this.activePath.y = event.pageY - this.canvas.offsetTop - this.downDelta.y;

        arePathsIntersecting = this.arePathsIntersecting();
        if (arePathsIntersecting) {

            compare = function compare(a, b) {
                if (a.x < b.x) {
                    return -1;
                }
                if (a.x > b.x) {
                    return 1;
                }
                return 0;
            }
            this.stackingOrder.sort(compare);
            this.activePath.y = 200;
            this.activePath.lastCorrectPath = {
                x: this.activePath.x,
                y: this.activePath.y
            }
        }
        this.draw();
    }
    this.dispatchEvents("mousemove");
};



Canvas.prototype.mouseup = function(event) {
    this.dragEnabled = false;
    this.dispatchEvents("mouseup");
    this.activePath.x = this.activePath.lastCorrectPath.x;
    this.activePath.y = this.activePath.lastCorrectPath.y;
    delete this.activePath.lastCorrectPath;
    this.drawFinal();
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
    return x < path.x + path.width + this.canvas.offsetLeft && x > path.x +
        this.canvas.offsetLeft && y < path.y + path.height + this.canvas.offsetTop &&
        y > path.y + this.canvas.offsetTop;
};

Canvas.prototype.getDownDelta = function(event) {
    if (this.activePath) {
        return {
            "x": event.pageX - this.canvas.offsetLeft - this.activePath.x,
            "y": event.pageY - this.canvas.offsetTop - this.activePath.y
        }
    }
};

/***************** DRAWING METHODS ************************/

Canvas.prototype.redraw = function() {
    this.draw();
    if (this.needsUpdate) {
        window.requestAnimationFrame(this.redraw, 10);
    }
};
Canvas.prototype.drawFinal = function() {
    var i = 0,
        increamentLeft = false;
    if (!this.sorted) {
        for (; i < this.stackingOrder.length; i++) {
            this.stackingOrder[i].x = i * 20;
            this.stackingOrder[i].y = 200;
        }
    } else {
        for (; i < this.stackingOrder.length; i++) {
            if (this.stackingOrder[i].name === this.activePath.name) {
                if (this.stackingOrder[i].x - this.stackingOrder[i - 1].x > 30) {
                    this.stackingOrder[i].x = this.stackingOrder[i + 1].x - 20;
                    increamentLeft = true;
                } else {
                    this.stackingOrder[i].x = this.stackingOrder[i - 1].x;
                    increamentLeft = true;
                }
            }
            if (increamentLeft === true) {
                this.stackingOrder[i].x += 20;
            }
        }
    }
    this.draw();
}
Canvas.prototype.draw = function() {
    this.clear();
    var i = 0,
        path;
    for (; i < this.stackingOrder.length; i++) {
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
    this.draw();
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
};

Canvas.prototype.clearCanvas = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
};

Canvas.prototype.bringToTop = function(path) {
    if (path) {
        this.stackingOrder.splice(this.stackingOrder.indexOf(path), 1);
        this.stackingOrder.push(path);
    }
};

Canvas.prototype.intersectRect = function(r1, r2) {
    return !(r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top);
}

Canvas.prototype.arePathsIntersecting = function() {
    var i = 0,
        r1, r2;
    r1 = {
        "left": this.activePath.x,
        "top": this.activePath.y,
        "right": this.activePath.x + this.activePath.width,
        "bottom": this.activePath.y + this.activePath.height
    };
    for (; i < this.stackingOrder.length; i++) {
        if (this.activePath.name !== this.stackingOrder[i].name) {
            r2 = {
                "left": this.stackingOrder[i].x,
                "top": this.stackingOrder[i].y,
                "right": this.stackingOrder[i].x + this.stackingOrder[i].width,
                "bottom": this.stackingOrder[i].y + this.stackingOrder[i].height
            };
            if (this.intersectRect(r1, r2)) {
                return true;
            }
        }
    }
    return false;
}
