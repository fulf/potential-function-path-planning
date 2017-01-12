$('#setStart').click(function () {
    state = "setStart";
    finishObstacle();
});

$('#setFinish').click(function () {
    state = "setFinish";
    finishObstacle();
});

$('#setObstacle').click(function () {
    state = "setObstacle";
});

$('#run').click(function () {
    if (state != "paused")
        oldAppState = JSON.stringify(appState);
    state = "runningSimulation";
    startSimulation();
});

$('#pause').click(function () {
    state = "paused";
    clearInterval(simulation);
});

$('#stop').click(function () {
    state = "idle";
    clearInterval(simulation);
    appState = JSON.parse(oldAppState);
    drawCanvas();
});

function startSimulation() {
    obstacleEdges = [];

    for (o in appState.obstacles) {
        obs = appState.obstacles[o];
        for (let k=0; k<obs.points.length; ++k) {
            obstacleEdges.push([
                appState.obstacles[o].points[k % obs.points.length],
                appState.obstacles[o].points[(k + 1) % obs.points.length]
            ]);
        }
    }

    for (let i = 0; i < hTiles; ++i) {
        forces[i] = [];
        for (let j = 0; j < vTiles; ++j) {
            forces[i][j] = 0;
            middleTilePoint = {
                x: (i * tileWidth) + tileWidth / 2,
                y: (j * tileHeight) + tileHeight / 2
            };

            for (let e in obstacleEdges) {
                if (distToSegment(middleTilePoint, obstacleEdges[e][0], obstacleEdges[e][1]) < (tileHeight + tileWidth) / 2) {
                    forces[i][j] = 1;
                }
            }
        }
    }

    simulation = setInterval(simulate, 1000 / 30);
}

function simulate() {
    FA = 5;
    FR = 125;
    repulsion = {
        x: 0,
        y: 0
    };

    for (let i = 0; i < hTiles; ++i) {
        for (let j = 0; j < vTiles; ++j) {
            middleTilePoint = {
                x: (i * tileWidth) + tileWidth / 2,
                y: (j * tileHeight) + tileHeight / 2
            };
            if(forces[i][j]) {
                setDrawingColor("purple");
                context.fillRect(middleTilePoint.x, middleTilePoint.y, tileHeight, tileWidth);
            }

            distanceToMiddle = getDistanceBetweenPoints(appState.startPoint, middleTilePoint);
            repulsion.x += forces[i][j] * FR * (middleTilePoint.x - appState.startPoint.x) / Math.pow(distanceToMiddle, 3);
            repulsion.y += forces[i][j] * FR * (middleTilePoint.y - appState.startPoint.y) / Math.pow(distanceToMiddle, 3);
        }
    }

    distanceToFinish = getDistanceBetweenPoints(appState.startPoint, appState.finishPoint);
    attractionForce = {
        x: FA * (appState.finishPoint.x - appState.startPoint.x) / distanceToFinish,
        y: FA * (appState.finishPoint.y - appState.startPoint.y) / distanceToFinish
    };

    force = {
        x: attractionForce.x - repulsion.x,
        y: attractionForce.y - repulsion.y
    };

    appState.startPoint.x += force.x;
    appState.startPoint.y += force.y;
    drawCanvas();

    if(appState.startPoint.x <= appState.finishPoint.x + 3 && appState.startPoint.x >= appState.finishPoint.x - 3){
        if(appState.startPoint.y <= appState.finishPoint.y + 3 && appState.startPoint.y >= appState.finishPoint.y - 3) {
            clearInterval(simulation);
        }
    }
}

$('#saveState').click(saveState);
$('#loadState').click(loadState);

context.lineWidth = 2;
context.strokeStyle = 'black';

$("#canvas").mousedown(function (e) {
    clicks++;
    if (clicks === 1) {
        timer = setTimeout(function () {
            handleSingleClick(e);
            clicks = 0;
        }, DELAY);
    } else {
        clearTimeout(timer);
        handleDoubleClick(e);
        clicks = 0;
    }
})
$("#canvas").mousemove(function (e) {
    if (movingObstacle) {
        dragStopPoint = getMouseCoordinates(e);
        selected.points.forEach(function (point) {
            point.x += dragStopPoint.x - dragStartPoint.x;
            point.y += dragStopPoint.y - dragStartPoint.y;
        })
        dragStartPoint = getMouseCoordinates(e);
        drawCanvas();
    }
})
$("#canvas").dblclick(function (e) {
    e.preventDefault();
});
$(document).keydown(function (e) {
    if (e.which == 8 || e.which == 46)
        for (i in appState.obstacles)
            if (selected == appState.obstacles[i]) {
                finishObstacle();
                appState.obstacles.splice(i, 1);
                drawCanvas();
                return;
            }
});

function handleSingleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    switch (state) {
        case "setStart":
            appState.startPoint = getMouseCoordinates(e);
            break;
        case "setFinish":
            appState.finishPoint = getMouseCoordinates(e);
            break;
        case "setObstacle":
            if (selected)
                if (movingObstacle)
                    finishObstacle();
                else
                    addPointToObstacle(selected, e);
            else {
                intersectedObstacle = intersectsObstacle(e);

                if (intersectedObstacle) {
                    selected = intersectedObstacle;
                    dragStartPoint = getMouseCoordinates(e);
                    movingObstacle = true;
                }
                else {
                    selected = appState.obstacles[appState.obstacles.push(new Obstacle([getMouseCoordinates(e)])) - 1]
                    movingObstacle = false;
                }
            }
            break;
    }

    drawCanvas();
}

function handleDoubleClick(e) {
    if (state == "setObstacle") {
        finishObstacle();
    }
}