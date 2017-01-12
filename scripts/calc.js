function getMouseCoordinates(e) {
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);
    return {x: mouseX, y: mouseY};
}

function getDistanceBetweenPoints(a, b) {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

function getObstacleMiddle(o) {
    sumPoint = o.points.reduce((a, b) => {
        return {x: a.x + b.x, y: a.y + b.y}
    });
    numPoints = o.points.length;
    return {
        x: sumPoint.x / numPoints,
        y: sumPoint.y / numPoints
    }
}

function intersectsObstacle(e) {
    x = parseInt(e.clientX - offsetX);
    y = parseInt(e.clientY - offsetY);
    for (i in appState.obstacles) {
        obs = appState.obstacles[i];
        if (obs.points.length > 2) {
            if (context.isPointInPath(obs.path, x, y))
                return obs;
        } else {
            distance = Math.abs((obs.points[1].y - obs.points[0].y) * x - (obs.points[1].x - obs.points[0].x) * y + obs.points[1].x * obs.points[0].y - obs.points[1].y * obs.points[0].x) / Math.sqrt(Math.pow(obs.points[1].y - obs.points[0].y, 2) + Math.pow(obs.points[1].x - obs.points[0].x, 2));
            if (distance < 5)
                return obs;
        }
    }
    return null;
}


function sqr(x) {
    return x * x
}
function dist2(v, w) {
    return sqr(v.x - w.x) + sqr(v.y - w.y)
}
function distToSegmentSquared(p, v, w) {
    var l2 = dist2(v, w);
    if (l2 == 0) return dist2(p, v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return dist2(p, {
        x: v.x + t * (w.x - v.x),
        y: v.y + t * (w.y - v.y)
    });
}
function distToSegment(p, v, w) {
    return Math.sqrt(distToSegmentSquared(p, v, w));
}