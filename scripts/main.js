$('#setStart').click(function(){
  state="setStart";
  finishObstacle();
});

$('#setFinish').click(function(){
  state="setFinish";
  finishObstacle();
});

$('#setObstacle').click(function(){
  state="setObstacle";
});

$('#run').click(function(){
  if(state!="paused")
    oldAppState = JSON.stringify(appState);
  state="runningSimulation";
  simulation = setInterval(simulate, 1000/60);
});

$('#pause').click(function(){
  state="paused";
  clearInterval(simulation);
});

$('#stop').click(function(){
  state="idle";
  clearInterval(simulation);
  appState = JSON.parse(oldAppState);
  drawCanvas();
});

function simulate(){
  xForce = 4;
  yForce = 4;

  xDistance = appState.finishPoint.x - appState.startPoint.x;
  yDistance = appState.finishPoint.y - appState.startPoint.y;

  destXDirection = xDistance / Math.abs(Math.max(xDistance, yDistance));
  destYDirection = yDistance / Math.abs(Math.max(xDistance, yDistance));

  middlePoints = [];
  for(i in appState.obstacles) {
    middlePoints.push(getObstacleMiddle(appState.obstacles[i]));
  }

  appState.startPoint.x += destXDirection * xForce;
  appState.startPoint.y += destYDirection * yForce;
  drawCanvas();
}

$('#saveState').click(saveState);
$('#loadState').click(loadState);

context.lineWidth=2;
context.strokeStyle='black';

$("#canvas").mousedown(function(e) {
  clicks++;
  if(clicks === 1) {
    timer = setTimeout(function() {
      handleSingleClick(e);
      clicks = 0;
    }, DELAY);
  } else {
      clearTimeout(timer);
      handleDoubleClick(e);
      clicks = 0;
  }
})
$("#canvas").mousemove(function(e) {
  if(movingObstacle) {
    dragStopPoint = getMouseCoordinates(e);
    selected.points.forEach(function(point){
      point.x +=  dragStopPoint.x - dragStartPoint.x;
      point.y +=  dragStopPoint.y - dragStartPoint.y;
    })
    dragStartPoint = getMouseCoordinates(e);
    drawCanvas();
  }
})
$("#canvas").dblclick(function(e){e.preventDefault();});
$(document).keydown(function(e){
  if(e.which == 8 || e.which == 46)
    for(i in appState.obstacles)
      if(selected == appState.obstacles[i]){
        finishObstacle();
        appState.obstacles.splice(i,1);
        drawCanvas();
        return;
      }
});

function handleSingleClick(e){
  console.log("Single click");
  e.preventDefault();
  e.stopPropagation();
  switch(state) {
    case "setStart":
      appState.startPoint = getMouseCoordinates(e);
      break;
    case "setFinish":
      appState.finishPoint = getMouseCoordinates(e);
      break;
    case "setObstacle":
      if(selected)
        if(movingObstacle)
          finishObstacle();
        else
          addPointToObstacle(selected, e);
      else
      {
        intersectedObstacle = intersectsObstacle(e);

        if(intersectedObstacle)
        {
          selected = intersectedObstacle;
          dragStartPoint = getMouseCoordinates(e);
          movingObstacle = true;
        }
        else
        {
          selected = appState.obstacles[appState.obstacles.push(new Obstacle([getMouseCoordinates(e)]))-1]
          movingObstacle = false;
        }
      }
      break;
  }

  drawCanvas();
}

function handleDoubleClick(e){
  if(state == "setObstacle"){
    finishObstacle();
  }
}