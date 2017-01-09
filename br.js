window.requestAnimFrame = (function(callback) {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
  function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };
})();

var Obstacle = function(points) {
  this.points = points || [];
  this.path = undefined;
}

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
    canvas=document.getElementById("canvas"),
    appStateSave=document.getElementById("state"),
    context=canvas.getContext("2d"),
    cw=canvas.width,
    ch=canvas.height,
    offsetX = null,
    offsetY = null;

function reOffset(){
  var BB=canvas.getBoundingClientRect();
  offsetX=BB.left;
  offsetY=BB.top;        
}
reOffset();
window.onscroll=function(e){ reOffset(); }

appState = JSON.parse('{"obstacles":[{"points":[{"x":146,"y":171},{"x":123,"y":348},{"x":282,"y":279}]},{"points":[{"x":572,"y":291},{"x":510,"y":409},{"x":632,"y":471},{"x":679,"y":419},{"x":615,"y":292},{"x":671,"y":315},{"x":605,"y":266}]},{"points":[{"x":415,"y":131},{"x":407,"y":236},{"x":484,"y":280},{"x":579,"y":194},{"x":570,"y":102}]},{"points":[{"x":303,"y":318},{"x":498,"y":366}]}],"startPoint":{"x":123,"y":101},"finishPoint":{"x":684,"y":367}}');
drawCanvas();

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

function intersectsObstacle(e) {
  x = parseInt(e.clientX-offsetX);
  y = parseInt(e.clientY-offsetY);
  for (i in appState.obstacles) {
    obs = appState.obstacles[i];
    if(obs.points.length > 2) {
        if(context.isPointInPath(obs.path, x, y))
          return obs;
    } else {
      distance = Math.abs((obs.points[1].y - obs.points[0].y) * x - (obs.points[1].x - obs.points[0].x)*y + obs.points[1].x*obs.points[0].y - obs.points[1].y*obs.points[0].x)/Math.sqrt(Math.pow(obs.points[1].y - obs.points[0].y, 2) + Math.pow(obs.points[1].x - obs.points[0].x, 2));
      if(distance<5)
        return obs;
    }
  }
  return null;
}

function handleDoubleClick(e){
  if(state == "setObstacle"){
    finishObstacle();
  }
}

function finishObstacle() {
  selected=null;
  movingObstacle = undefined;
  cleanObstacles();
  drawCanvas();
}


function saveState(){
  appStateSave.value = JSON.stringify(appState, stateParser);
}

function loadState(){
  try {
    appState = JSON.parse(appStateSave.value);
    drawCanvas();
  } catch(e) {
    console.error(e);
  }
}

function stateParser(key, value) {
    if (key=="path") return undefined;
    else return value;
}

function addPointToObstacle(obstacle, e) {
  obstacle.points.push(getMouseCoordinates(e));
}

function getMouseCoordinates(e) {
  mouseX=parseInt(e.clientX-offsetX);
  mouseY=parseInt(e.clientY-offsetY);
  return {x:mouseX,y:mouseY};
}

function drawCanvas() {
  context.clearRect(0,0,cw,ch);
  if(appState.startPoint)
    drawStart();
  if(appState.finishPoint)
    drawFinish();

  drawObstacles();
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

function setDrawingColor(color) {
  context.strokeStyle = context.fillStyle = color;
}

function getDistanceBetweenPoints(a, b) {
  return Math.sqrt(Math.pow(b.x-a.x,2) + Math.pow(b.y-a.y,2));
}

function getObstacleMiddle(o) {
  sumPoint = o.points.reduce((a, b) => {return {x: a.x+b.x, y:a.y+b.y}});
  numPoints = o.points.length;
  return {
    x: sumPoint.x/numPoints,
    y: sumPoint.y/numPoints
  }
}
