function Path(params) {
    this.init(params);
}

Path.prototype.init = function(params) {
    this.x = params.x;
    this.y = params.y;
    this.width = params.width;
    this.height = params.height;
};
