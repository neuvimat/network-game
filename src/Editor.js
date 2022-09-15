import {Map as WMap} from "Game/map/Map";
import {EditorRenderer} from "Root/editor/EditorRenderer";
import {InputManager} from "Client/input/InputManager";
import {EditorState} from "Root/editor/EditorState";
import {EditorInputState} from "Root/editor/EditorInputState"; // avoid confusing IDE with regular Map (hash table)

window.addEventListener('load', function () {
    console.log('Editor module init...');

    let map = new WMap();
    map.width = 1920;
    map.height = 1080;
    let input = new InputManager(undefined, undefined, undefined);
    input.setState(new EditorInputState());

    let editorState = new EditorState(map);
    editorState.onLoad();
    editorState.input = input;

    let renderer = new EditorRenderer(input, editorState, editorState.e.canvasWrapper);
    input._inputForwarder = renderer; // HACK
    input.stateManager = editorState; // HACK
    editorState.renderer = renderer;
    console.log('Editor init finished.');

    function onAnimation() {
        renderer.render();
        requestAnimationFrame(onAnimation)
    }

    onAnimation();
});

// Save some headaches
window.onbeforeunload = function (e) {
    e = e || window.event;
    // For IE and Firefox prior to version 4
    if (e) {
        e.returnValue = 'Sure?';
    }
    // For Safari
    return 'Sure?';
};