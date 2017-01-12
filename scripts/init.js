//Global variables
var DELAY = 200,
    clicks = 0,
    timer = null,
    state = "idle",
    movingObstacle = undefined,
    selected = undefined,
    dragStartPoint = undefined,
    appState = {
        obstacles: [],
        startPoint: null,
        finishPoint: null
    },
    canvas = document.getElementById("canvas"),
    appStateSave = document.getElementById("state"),
    context = canvas.getContext("2d"),
    cw = canvas.width,
    ch = canvas.height,
    offsetX = null,
    offsetY = null,
    hTiles = 250,
    vTiles = hTiles / 2,
    tileWidth = cw / hTiles,
    tileHeight = ch / vTiles,
    forces = [];

window.requestAnimFrame = (function (callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

var Obstacle = function (points) {
    this.points = points || [];
    this.path = undefined;
}

//Get real browser offset
function reOffset() {
    var BB = canvas.getBoundingClientRect();
    offsetX = BB.left;
    offsetY = BB.top;
}
reOffset();

window.onscroll = function (e) {
    reOffset();
}