import {E_Toolbox} from "Root/editor/E_Toolbox";
import {HTMLInputMapper, IDs} from "Root/util/HTMLInputMapper";
import {Map as WMap} from "Game/map/Map";
import {_GeneralState} from "Client/states/_GeneralState";

/**
 * Special version of state. It does not extend {@link _GeneralState} because there is only one state needed for the
 * editor application and as such does not require some of the things the regular state has to implemented because
 * it does not need to be compliant to {@link StateManager} needs.
 */
export class EditorState {
    /**
     *
     * @param {Map} map
     * @param {EditorRenderer} renderer
     * @param {InputManager} input
     */
    constructor(map, renderer, input) {
        this.map = map;
        this.toolbox = new E_Toolbox();
        this.selection = null;
        this.renderer = renderer;
        this.input = input;
        this.grid = 10;
        this.e = {
            canvasWrapper: undefined,
            propertiesWrapper: undefined,
            sbZoom: undefined,
            sbCamX: undefined,
            sbCamY: undefined,
        };
        EditorState.map = this.map;
    }

    onLoad() {
        this.e.canvasWrapper = document.getElementById('canvasWrapper');
        this.e.propertiesWrapper = document.getElementById('propertiesWrapper');
        this.e.sbZoom = document.getElementById('sb-zoom');
        this.e.sbCamX = document.getElementById('sb-cx');
        this.e.sbCamY = document.getElementById('sb-cy');

        document.getElementById('tb-tSelect').addEventListener('click', (e) => {
            let prev = document.querySelector('[data-tool-selected]');
            if (prev) {
                prev.removeAttribute('data-tool-selected')
            }
            this.toolbox.selectTool('select', this.input, this, this.renderer, e);
            e.target.setAttribute('data-tool-selected', '');
        });
        document.getElementById('tb-tAddVertex').addEventListener('click', (e) => {
            let prev = document.querySelector('[data-tool-selected]');
            if (prev) {
                prev.removeAttribute('data-tool-selected')
            }
            this.toolbox.selectTool('addVertex', this.input, this, this.renderer, e);
            e.target.setAttribute('data-tool-selected', '');
        });
        document.getElementById('tb-tErasePoly').addEventListener('click', (e) => {
            this.toolbox.selectTool('erasePoly', this.input, this, this.renderer, e);
        });
        document.getElementById('tb-tTriangulate').addEventListener('click', (e) => {
            this.toolbox.selectTool('triangulate', this.input, this, this.renderer, e);
        });
        document.getElementById('tb-tToWall').addEventListener('click', (e) => {
            this.toolbox.selectTool('toWall', this.input, this, this.renderer, e);
        });
        document.getElementById('tb-tToSpawnArea').addEventListener('click', (e) => {
            this.toolbox.selectTool('toSpawnArea', this.input, this, this.renderer, e);
        });
        document.getElementById('tb-tAutogen').addEventListener('click', (e) => {
            this.toolbox.selectTool('autogen', this.input, this, this.renderer, e);
        });
        document.getElementById('tb-tAutogenBack').addEventListener('click', (e) => {
            this.toolbox.selectTool('autogenBack', this.input, this, this.renderer, e);
        });
        document.getElementById('tb-save').addEventListener('click', (e) => {
            let json = JSON.stringify(this.map);
            let a = document.createElement('a');
            let encoded = encodeURIComponent(json);
            a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encoded);
            a.setAttribute('download', 'untitledMap.json');
            a.click();
        });
        document.getElementById('tb-load').addEventListener('click', (e) => {
            document.getElementById('file').click();
        });
        document.getElementById('tb-help').addEventListener('click', (e) => {
            this.showHelp();
        });
        document.getElementById('file').addEventListener('input', (e) => {
            let files = e.target.files; // FileList object
            if (files.length !== 1) {
                alert("I dunno how but you managed to fuck up the number of uploaded files!");
                return;
            }
            // Below is weird but cool syntax for for i loops, copied from tutorial, left for science, yes I know it cold be replace with for of
            for (let i = 0, f; f = files[i]; i++) {
                if (!f.type.match('application/json')) {
                    alert('Upload a .json file, fam!');
                }
                let reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        let mapJSON = JSON.parse(e.target.result);
                        let map = WMap.editorMakeFromJSON(mapJSON);
                        console.log(map);
                        this.map = map;
                        this.renderer.map = map;
                    }
                    catch (e) {
                        alert('There was an error! Look in console.');
                        console.error(e);
                    }
                };
                reader.readAsText(f);
            }
        });

        document.getElementById('modal-content-buttons-k').addEventListener('click', ()=>{
            this.hideHelp();
        });

        HTMLInputMapper.listenForValue(IDs.EditorCameraX, (v) => {this.e.sbCamX.innerText = v});
        HTMLInputMapper.listenForValue(IDs.EditorCameraY, (v) => {this.e.sbCamY.innerText = v});
        HTMLInputMapper.listenForValue(IDs.EditorZoom, (v) => {this.e.sbZoom.innerText = v});
    }

    /**
     * Shortcut for calling this.toolbox.toolClick, used from outside to reduce 'dotting'
     * @param {InputManager} input
     * @param {EditorState} editorState
     * @param {EditorRenderer} renderer
     * @param {MouseEvent} [e]
     */
    tool(input, editorState, renderer, e) {
        this.toolbox.toolClick(input, editorState, renderer, e);
    }

    /**
     * Shortcut for calling this.toolbox.toolUp, used from outside to reduce 'dotting'
     * @param {InputManager} input
     * @param {EditorState} editorState
     * @param {EditorRenderer} renderer
     * @param {MouseEvent} [e]
     */
    toolUp(input, editorState, renderer, e) {
        this.toolbox.toolUp(input, editorState, renderer, e);
    }

    /**
     * Deselect current selection
     */
    deselect() {
        if (this.selection) {
            if (this.selection instanceof Array) {
                for (let s of this.selection) {
                    s.selected = false;
                }
            }
            else {
                this.selection.selected = false;
            }
        }
        this.selection = null;
    }

    /**
     * Add obj to current selection
     * @param {object | array} obj - selected object should have 'code' property for identification
     */
    addToSelection(obj) {
        if (this.selection) {
            if (this.isMultiSelect()) {
                if (obj instanceof Array) {
                    for (let s of obj) {
                        if (!s.selected) {
                            s.selected = true;
                            this.selection.push(s);
                        }
                    }
                }
                else {
                    obj.selected = true;
                    this.selection.push(obj);
                }
            }
            else {
                let ms = [this.selection];
                this.selection = ms;
                this.addToSelection(obj);
            }
        }
        else {
            this.select(obj);
        }
    }

    /**
     * Replace current selection with obj
     * @param {object | array} obj
     */
    select(obj) {
        this.deselect();
        if (obj instanceof Array) {
            for (let s of obj) {
                if (!s.code) {
                    alert('Selected object does not have a "code" property!');
                    console.error('Selected object does not have a "code" property!');
                }
                s.selected = true;
            }
        }
        else {
            if (!obj.code) {
                alert('Selected object does not have a "code" property!');
                console.error('Selected object does not have a "code" property!');
            }
            obj.selected = true;
        }
        this.selection = obj;
    }

    /**
     * Return amount of current multi selection
     * @return {boolean|number} false if nothing or a single object is selected or number if selections is an array
     */
    numMultiSelect() {
        if (this.selection) {
            if (this.selection instanceof Array) {
                return this.selection.length;
            }
        }
        return false;
    }

    /**
     * @return {boolean} true if more than one object is selected
     */
    isMultiSelect() {
        if (this.selection) {
            if (this.selection instanceof Array) {
                return true;
            }
        }
        return false;
    }

    /**
     * @return {array.<*>} iterable object of current selection
     */
    selectionIter() {
        if (this.isMultiSelect()) {
            return this.selection;
        }
        else if (this.selection) {
            return [this.selection];
        }
        else return [];
    }

    /**
     * Shortcut for getting code of current selection
     * @return {null|string} null if there is no current selection or if current selection is composed of more objects,
     * else string
     */
    sCode() {
        if (this.selection && !(this.selection instanceof Array)) {
            return this.selection.code;
        }
        return null;
    }

    /**
     * Delete current selection
     * @param obj
     */
    deleteSelection(obj) {
        if (!obj) {
            if (this.selection) {
                if (this.numMultiSelect() > 0) {
                    for (let s of this.selection) {
                        this.deleteSelection(s);
                        this.selection = null;
                    }
                }
                else {
                    this.deleteSelection(this.selection);
                    this.selection = null;
                }
            }
        }
        else {
            obj.remove(this);
        }
    }

    /**
     * Show modal window with help
     */
    showHelp() {
        document.getElementById('modal').style.display = 'flex';
    }

    /**
     * Hide modal window with help
     */
    hideHelp() {
        document.getElementById('modal').style.display = 'none';
    }
}