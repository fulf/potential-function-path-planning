function drawStart() {
  setDrawingColor("red");
  context.fillRect(appState.startPoint.x, appState.startPoint.y, 4, 4);
}

function drawFinish() {
  setDrawingColor("green");
  context.fillRect(appState.finishPoint.x, appState.finishPoint.y, 4, 4);
}

function drawObstacles() {
  appState.obstacles.forEach(function(obstacle){
    if(obstacle == selected)
      setDrawingColor("blue");
    else setDrawingColor("black");

    if(obstacle.points.length == 1)
      context.fillRect(obstacle.points[0].x, obstacle.points[0].y, 4, 4);
    else {
      obstacle.path = new Path2D();
      obstacle.path.moveTo(obstacle.points[0].x, obstacle.points[0].y);
      for(index=1; index<obstacle.points.length;index++) {
        obstacle.path.lineTo(obstacle.points[index].x, obstacle.points[index].y);
      }
      obstacle.path.closePath();
      context.stroke(obstacle.path);
    }
  });
}

function drawCanvas() {
  context.clearRect(0,0,cw,ch);
  if(appState.startPoint)
    drawStart();
  if(appState.finishPoint)
    drawFinish();

  drawObstacles();
}

function setDrawingColor(color) {
  context.strokeStyle = context.fillStyle = color;
}

function cleanObstacles() {
  toDelete = [];
  appState.obstacles.forEach(function(obstacle, i){
    if(obstacle.points.length <= 1)
      toDelete.push(i);
  });

  toDelete.forEach(function(index, i){
    appState.obstacles.splice(index-i, 1);
  })
}

function addPointToObstacle(obstacle, e) {
  obstacle.points.push(getMouseCoordinates(e));
}

function finishObstacle() {
  selected=null;
  movingObstacle = undefined;
  cleanObstacles();
  drawCanvas();
}

drawCanvas();