import {E_Vertex} from "Root/editor/E_Vertex";
import {E_Polygon} from "Root/editor/E_Polygon";
import {MathUtils} from "Root/util/MathUtils";
import {Map as WMap} from "Game/map/Map";

/**
 * @callback EditorToolInputCallback
 * @param {InputManager} input
 * @param {EditorState} state
 * @param {EditorRenderer} renderer
 * @param {*} [e] HTML input that led to the callback
 */

/**
 * @typedef {object} E_Toolbox~EditorTool
 * @property {boolean} once if true, the tool cannot be active - once selected, it will do its 'onSelect' and that's
 *     it, it will never receive 'click' and 'up' calls and it will not change currently active tool
 * @property {EditorToolInputCallback} onSelect triggered when tool is selected
 * @property {EditorToolInputCallback} click triggered when mouse down on workspace is registered with this tool active
 * @property {EditorToolInputCallback} up triggered only after mouse up is registered and previous mouse down was on
 * workspace
 */

/**
 * Container that holds and manages interactions for all tools available in editor.
 * @class E_Toolbox
 * @see {@link E_Toolbox~EditorTool}
 */
export class E_Toolbox {
    constructor() {
        this.tools = {
            addVertex: addVertex,
            select: select,
            erasePoly: erasePoly,
            triangulate: triangulate,
            toWall: toWall,
            toSpawnArea: toSpawnArea,
        };
        this.activeTool = undefined;
    }

    /**
     * Trigger currently active {@link E_Toolbox~EditorTool} 'click' method.
     * @param {InputManager} input
     * @param {EditorState} editorState
     * @param {EditorRenderer} renderer
     * @param {MouseEvent} [e]
     */
    toolClick(input, editorState, renderer, e) {
        if (this.activeTool) {
            this.activeTool.click(input, editorState, renderer, e);
        }
    }

    /**
     * Trigger currently active {@link E_Toolbox~EditorTool} 'up' method.
     * @param {InputManager} input
     * @param {EditorState} editorState
     * @param {EditorRenderer} renderer
     * @param {MouseEvent} [e]
     */
    toolUp(input, editorState, renderer, e) {
        if (this.activeTool) {
            this.activeTool.up(input, editorState, renderer, e);
        }
    }

    /**
     * Attempt to select a tool that has the specified id. If it exists, mark it as selected and call its 'onSelect'
     * method
     * @see {@link E_Toolbox~EditorTool}
     * @param {string} id
     * @param {InputManager} input
     * @param {EditorState} editorState
     * @param {EditorRenderer} renderer
     * @param {MouseEvent} [e]
     */
    selectTool(id, input, editorState, renderer, e) {
        let tool = this.tools[id];
        if (!tool) {
            alert('Error: no such tool exists! ' + id);
            console.error('Error: no such tool exists!', id);
        }
        tool.onSelect(input, editorState, renderer, e);
        if (!tool.once) {
            this.activeTool = this.tools[id];
        }
    }
}

E_Toolbox.prototype.code = 'toolbox';

/** @type {E_Toolbox~EditorTool} */
const addVertex = {
    once: false,
    onSelect(input, editorState, renderer) {

    },
    click(input, state, renderer) {
        if (state.sCode() === 'polygon') {
            state.select(state.selection.addVertex(renderer.cX, renderer.cY));
        }
        else if (state.sCode() === 'vertex') {
            state.select(state.selection.polygon.addVertex(renderer.cX, renderer.cY));
        }
        else {
            let p = new E_Polygon();
            state.select(p.addVertex(renderer.cX, renderer.cY));
            state.map.walls.push(p);
        }
    },
    up(input, editorState, renderer) {

    }
};
/** @type {E_Toolbox~EditorTool} */
const select = {
    once: false,
    onSelect() {},
    click(input, state, renderer, e) {
        let closest = [Number.MAX_SAFE_INTEGER, null];
        let click = [renderer.cX, renderer.cY];
        for (let w of state.map.walls) {
            for (let v of w.verts) {
                let d = MathUtils.distance(v.x, v.y, click[0], click[1]);
                if (d < closest[0]) {
                    closest[0] = d;
                    closest[1] = v;
                }
            }
        }
        for (let w of state.map.spawnAreas) {
            for (let v of w.verts) {
                let d = MathUtils.distance(v.x, v.y, click[0], click[1]);
                if (d < closest[0]) {
                    closest[0] = d;
                    closest[1] = v;
                }
            }
        }
        if (closest[0] <= 20 / renderer.scale && closest[1]) {
            if (e.shiftKey) {
                state.addToSelection(closest[1]);
            }
            else {
                state.select(closest[1])
            }
        }
        else {
            if (!e.shiftKey) {
                state.deselect();
            }
        }
    },
    up(input, editorState, renderer) {

    }
};
/** @type {E_Toolbox~EditorTool} */
const erasePoly = {
    once: true,
    onSelect(input, state, renderer, e) {
        let polysToDelete = {};
        for (let s of state.selectionIter()) {
            if (s.code === 'vertex') {
                polysToDelete[s.polygon.id] = s.polygon;
            }
        }
        for (let p in polysToDelete) {
            polysToDelete[p].remove(state);
        }
        state.selection = null;
    }
};
/** @type {E_Toolbox~EditorTool} */
const triangulate = {
    once: true,
    onSelect(input, state, renderer, e) {
        let polys = {};
        for (let s of state.selectionIter()) {
            if (s.code === 'vertex') {
                polys[s.polygon.id] = s.polygon;
            }
        }
        for (let p in polys) {
            if (polys[p].verts.length <= 3) {
                alert('Polygon does not have enough vertices!');
                continue;
            }
            polys[p].remove(state);
            let verts = polys[p].verts.map((v) => {return [v.x, v.y]});
            let tris = WMap.triangulate(verts);
            for (let t of tris) {
                state.map.walls.push(new E_Polygon(t));
            }
        }
        state.deselect();
    }
};
/** @type {E_Toolbox~EditorTool} */
const toWall = {
    once: true,
    onSelect(input, state, renderer, e) {
        let polys = getPolysFromSelection(state);
        for (let p in polys) {
            polys[p].remove(state);
            state.map.walls.push(polys[p]);
        }
    }
};


const toSpawnArea = {
    once: true,
    onSelect(input, state, renderer, e) {
        let polys = getPolysFromSelection(state);
        for (let p in polys) {
            polys[p].remove(state);
            state.map.spawnAreas.push(polys[p]);
        }
    }
};

// helper function
function getPolysFromSelection(state) {
    let polys = {};
    for (let s of state.selectionIter()) {
        if (s.code === 'vertex') {
            polys[s.polygon.id] = s.polygon;
        }
    }
    return polys;
}