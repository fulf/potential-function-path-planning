appState = JSON.parse(`{
	"obstacles":[
		{
			"points":[
				{"x":146,"y":171},
				{"x":123,"y":348},
				{"x":282,"y":279}
			]
		},
		{
			"points":[
				{"x":572,"y":291},
				{"x":510,"y":409},
				{"x":632,"y":471},
				{"x":679,"y":419},
				{"x":615,"y":292},
				{"x":671,"y":315},
				{"x":605,"y":266}
			]
		},
		{
			"points":[
				{"x":415,"y":131},
				{"x":407,"y":236},
				{"x":484,"y":280},
				{"x":579,"y":194},
				{"x":570,"y":102}
			]
		},
		{
			"points":[
				{"x":303,"y":318},
				{"x":498,"y":366},
				{"x":375,"y":390}
			]
		}
	],
	"startPoint":{"x":123,"y":101},
	"finishPoint":{"x":684,"y":367}
}`);

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
  //if (key=="path") return undefined;
  //else return value;

  return (key == "path") ? undefined : value;
}