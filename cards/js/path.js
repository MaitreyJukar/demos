function Path(params) {
    this.init(params);
};

Path.prototype.init = function(params) {
    this.name = params.name;
    this.type = params.type || Path.PATH_TYPES.RECT;
    this.x = params.x;
    this.y = params.y;
    this.width = params.width;
    this.height = params.height;
    if (this.type == Path.PATH_TYPES.IMAGE) {
        this.imgSrc = params.imgData.src;
        this.imgX = params.imgData.x;
        this.imgY = params.imgData.y;
        this.imgWidth = params.imgData.width;
        this.imgHeight = params.imgData.height;
    }
};

Path.PATH_TYPES = {
    "RECT": 0,
    "IMAGE": 1
};
