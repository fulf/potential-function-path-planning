appState = JSON.parse(`{"obstacles":[{"points":[{"x":146,"y":171},{"x":123,"y":348},{"x":282,"y":279}]},{"points":[{"x":415,"y":131},{"x":407,"y":236},{"x":484,"y":280},{"x":579,"y":194},{"x":570,"y":102}]},{"points":[{"x":303,"y":318},{"x":498,"y":366},{"x":375,"y":390}]},{"points":[{"x":537,"y":275},{"x":577,"y":358},{"x":544,"y":427},{"x":689,"y":411},{"x":642,"y":332}]}],"startPoint":{"x":202.53260151950167,"y":120.25993263423031},"finishPoint":{"x":674,"y":466}}`);

function saveState() {
    appStateSave.value = JSON.stringify(appState, stateParser);
}

function loadState() {
    try {
        appState = JSON.parse(appStateSave.value);
        drawCanvas();
    } catch (e) {
        console.error(e);
    }
}

function stateParser(key, value) {
    return (key == "path") ? undefined : value;
}