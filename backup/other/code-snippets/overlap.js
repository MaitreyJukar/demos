var getPositions = function(elem) {
    var pos, width, height;
    pos = $(elem).position();
    width = $(elem).width();
    height = $(elem).height();
    return [
        [pos.left, pos.left + width],
        [pos.top, pos.top + height]
    ];
};

var comparePositions = function(pos1, pos2) {
    var r1, r2;
    r1 = pos1[0] < pos2[0] ? pos1 : pos2;
    r2 = pos1[0] < pos2[0] ? pos2 : pos1;
    return r1[1] > r2[0] || r1[0] === r2[0];
};

var overlaps = function(elem1, elem2) {
    var pos1 = getPositions(elem1),
        pos2 = getPositions(elem2);
    return comparePositions(pos1[0], pos2[0]) && comparePositions(pos1[1], pos2[1]);
};