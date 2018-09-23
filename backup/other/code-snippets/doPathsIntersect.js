doPathsIntersect = function(path1, path2) {
    var intersection = false;
    if (path1 instanceof paper.Path && path2 instanceof paper.Path) {
        return path1.getIntersections(path2).length > 0;
    }
    if (path1 instanceof paper.Group) {
        for (var i = 0; i < path1.children.length; i++) {
            intersection = intersection || doPathsIntersect(path1.children[i], path2);
            if (intersection) {
                return true;
            }
        }
    } else if (path2 instanceof paper.Group) {
        return doPathsIntersect(path2, path1)
    }
    return intersection;
}
