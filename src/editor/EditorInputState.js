import {IInputState} from "Client/input/states/IInputState";

const SCROLL_SPEED = 50;
const SCROLL_FAST_SPEED = SCROLL_SPEED * 4;

const NUDGE_REG = 5;
const NUDGE_CTRL = 1;
const NUDGE_SHIFT = 25;
const NUDGE_BOTH = 125;

// Prepare relevant commands for this state
let MoveUp = {
    on: (a, b, renderer, c, e) => {
        renderer.moveCameraY(-SCROLL_SPEED + -e.shiftKey * SCROLL_FAST_SPEED);
    },
    off: (a, b, renderer) => {}
};
let MoveDown = {
    on: (a, b, renderer, edtitorState, e) => {
        renderer.moveCameraY(SCROLL_SPEED + e.shiftKey * SCROLL_FAST_SPEED);
    },
    off: (a, b, renderer) => {}
};
let MoveLeft = {
    on: (a, b, renderer, c, e) => {
        renderer.moveCameraX(-SCROLL_SPEED + -e.shiftKey * SCROLL_FAST_SPEED);
    },
    off: (a, b, renderer) => {}
};
let MoveRight = {
    on: (a, b, renderer, c, e) => {
        renderer.moveCameraX(SCROLL_SPEED + e.shiftKey * SCROLL_FAST_SPEED);
    },
    off: (a, b, renderer) => {}
};

function nudge(s, state, e, property, mult) {
    if (s.code === 'vertex') {
        if (e.altKey) {
            s[property] = Math.round(s[property] / state.grid) * state.grid;
            return;
        }

        if (!e.shiftKey && !e.ctrlKey) s[property] += NUDGE_REG * mult;
        else if (!e.shiftKey) s[property] += NUDGE_CTRL * mult;
        else if (!e.ctrlKey) s[property] += NUDGE_SHIFT * mult;
        else s[property] += NUDGE_BOTH * mult;
    }
}
let Nudge = {
    on: (input,b,renderer,state,e)=>{
        let axis = (e.key == 'ArrowLeft' || e.key == 'ArrowRight') ? 'x' : 'y';
        let mult = (e.key == 'ArrowLeft' || e.key == 'ArrowUp') ? -1 : 1;
        for (let s of state.selectionIter()) {
            nudge(s, state, e, axis, mult);
        }
    },
    off: ()=>{}
};

let Deselect = {
    on: function (a,b,c,editorState) {
        editorState.deselect();
    },
    off: function () {

    }
};
let Delete = {
    on: function (a,b,c,editorState) {
        console.log('Deleting selection');
        editorState.deleteSelection();
    },
    off: function () {

    }
};

// Zoom is wheel event, wheel event requires only 'on'
let Zoom = {
    on: (inputManager,b, renderer, editorState, e)=> {
        if (e.target.id === 'canvas') {
            if (e.deltaY > 0) {
                renderer.zoom(-1);
            }
            else {
                renderer.zoom(1);
            }
        }
    },
};

// input,b,renderer,editorState,e
let Click = {
    validClick: false,
    on: function (inputManager,b,renderer, editorState, e) {
        if (e.target.id === 'canvas') {
            this.validClick = true;
            editorState.tool(inputManager, editorState, renderer, e);
        }
    },
    off: function (inputManager,b,renderer, editorState, e) {
        if (this.validClick) {
            this.validClick = false;
            editorState.toolUp(inputManager, editorState, renderer, e);
        }
    },
};

let commandMap = {
    KeyW: MoveUp,
    KeyA: MoveLeft,
    KeyD: MoveRight,
    KeyS: MoveDown,
    ArrowUp: Nudge,
    ArrowDown: Nudge,
    ArrowLeft: Nudge,
    ArrowRight: Nudge,
    Delete: Delete,
    Space: Deselect,
};

// 0 - left, 1 - middle/wheel, 2 - right
let commandMouseMap = {
    0: Click,
};

/**
 * Input state for editor
 * @implements IInputState
 */

export class EditorInputState extends IInputState {
    constructor() {
        super();
    }
    retrieveUpInput(key) {
        return commandMap[key];
    }

    retrieveDownInput(key) {
        return commandMap[key];
    }

    retrieveMouseDownInput(mouseButton) {
        return commandMouseMap[mouseButton];
    }

    retrieveMouseUpInput(mouseButton) {
        return commandMouseMap[mouseButton];
    }

    enterState() {
        super.enterState();
    }

    exitState() {
        super.exitState();
    }

    isLeftClickValid(e) {
        return e.target.id === 'canvas';
    }

    retrieveWheelInput() {
        return Zoom;
    }
}