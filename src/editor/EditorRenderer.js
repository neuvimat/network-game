import {Camera} from "Game/renderer/Camera";
import {MathUtils} from "Root/util/MathUtils";
import {HTMLInputMapper, IDs} from "Root/util/HTMLInputMapper";

const MAP_BOUNDARY_BORDER = 64;
const MAP_BOUNDARY_COLOR = 'magenta';
const V_WIDTH = 12;
const V_COLOR = 'green';
const V_SCOLOR = 'red';

export class EditorRenderer {
    constructor(input, state, container) {
        this.editorState = state;
        this.map = this.editorState.map;
        this._input = input;
        this.camera = null;
        this.scale = 1;
        /**         * @type {HTMLElement}         */
        this.container = container;
        this._setup();
    }

    _setup() {
        this._canvas = document.getElementById('canvas');
        this.ctx = this._canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
        this._zoomLevel = 10;
        this.camera = new Camera();
        window.addEventListener('resize', this._handleResize.bind(this));
        this._handleResize(); // calculate the initial width and height
        this.ctx.save();
    }

    _handleResize(e) {
        let _width = this.container.clientWidth;
        let _height = this.container.clientHeight;

        this.width = _width;
        this.height = _height;

        this._canvas.style.width = this.width + 'px';
        this._canvas.style.height = this.height + 'px';
        this.ctx.canvas.width = _width;
        this.ctx.canvas.height = _height;

        this.render();
    }

    _drawOrigin() {
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(this.getCanvasX(8), this.getCanvasY(0));
        this.ctx.lineTo(this.getCanvasX(-8), this.getCanvasY(0));
        this.ctx.moveTo(this.getCanvasX(0), this.getCanvasY(8));
        this.ctx.lineTo(this.getCanvasX(0), this.getCanvasY(-8));
        this.ctx.closePath();
        this.ctx.stroke();
    }

    _drawWalls() {
        this.ctx.fillStyle = 'rgba(0,0,0,.4)';
        for (let wall of this.map.walls) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.getCanvasX(wall.verts[0].x), this.getCanvasY(wall.verts[0].y));
            for (let i = 1; i < wall.verts.length; i++) {
                this.ctx.lineTo(this.getCanvasX(wall.verts[i].x), this.getCanvasY(wall.verts[i].y));
            }
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }

        for (let wall of this.map.walls) {
            for (let v of wall.verts) {
                if (v.selected) this.ctx.fillStyle = V_SCOLOR;
                else this.ctx.fillStyle = V_COLOR;
                this.ctx.fillRect(
                    this.wX(v.x - V_WIDTH/2/this.scale), this.wY(v.y - V_WIDTH/2/this.scale),
                    V_WIDTH/this.scale, V_WIDTH/this.scale);
            }
        }
    }
    _drawSpawnAreas() {
        this.ctx.fillStyle = 'rgba(0,128,255,.7)';
        for (let as of this.map.spawnAreas) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.getCanvasX(as.verts[0].x), this.getCanvasY(as.verts[0].y));
            for (let i = 1; i < as.verts.length; i++) {
                this.ctx.lineTo(this.getCanvasX(as.verts[i].x), this.getCanvasY(as.verts[i].y));
            }
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }

        for (let as of this.map.spawnAreas) {
            for (let v of as.verts) {
                if (v.selected) this.ctx.fillStyle = V_SCOLOR;
                else this.ctx.fillStyle = V_COLOR;
                this.ctx.fillRect(
                    this.wX(v.x - V_WIDTH/2/this.scale), this.wY(v.y - V_WIDTH/2/this.scale),
                    V_WIDTH/this.scale, V_WIDTH/this.scale);
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.width / this.scale, this.height / this.scale);
        this.ctx.fillStyle = MAP_BOUNDARY_COLOR;
        this._drawMapBoundary();
        this._drawWalls();
        this._drawSpawnAreas();
        this._drawOrigin();
    }

    _drawMapBoundary() {
        // Left wall
        this.ctx.fillRect(
            this.wX(-this.map.width / 2 - MAP_BOUNDARY_BORDER),
            this.wY(-this.map.height / 2 - MAP_BOUNDARY_BORDER),
            MAP_BOUNDARY_BORDER,
            this.map.height + MAP_BOUNDARY_BORDER * 2
        );
        // Right wall
        this.ctx.fillRect(
            this.wX(this.map.width / 2),
            this.wY(-this.map.height / 2 - MAP_BOUNDARY_BORDER),
            MAP_BOUNDARY_BORDER,
            this.map.height + MAP_BOUNDARY_BORDER * 2
        );
        // Top wall
        this.ctx.fillRect(
            this.wX(-this.map.width / 2),
            this.wY(-this.map.height / 2 - MAP_BOUNDARY_BORDER),
            this.map.width,
            MAP_BOUNDARY_BORDER
        );
        // Bottom wall
        this.ctx.fillRect(
            this.wX(-this.map.width / 2),
            this.wY(this.map.height / 2),
            this.map.width,
            MAP_BOUNDARY_BORDER
        );
    }

    /**
     * @typedef {Object} GameRenderer~Position
     * @property x
     * @property y
     */

    /**
     * Returns position relative to camera - camera is centered on the canvas, x:0 means left corner, y:0 means top
     * corner
     * @param x
     * @param y
     * @return {GameRenderer~Position}
     */
    getCanvasPosition(x, y) {
        return {
            x: this.getCanvasX(x),
            y: this.getCanvasY(y),
        }
    }

    getCanvasX(worldX) {
        return worldX - this.camera.x + this.width / 2 / this.scale;
    }

    getCanvasY(worldY) {
        return worldY - this.camera.y + this.height / 2 / this.scale;
    }

    getCursorY() {
        let bcr = this._canvas.getBoundingClientRect();
        return this.camera.y + (this._input.mouseY - bcr.y) / this.scale - this.height / 2 / this.scale;
    }

    getCursorX() {
        let bcr = this._canvas.getBoundingClientRect();
        return this.camera.x + (this._input.mouseX - bcr.x) / this.scale - this.width / 2 / this.scale;
    }

    getCursor() {
        return {
            x: this.camera.x + this._input.mouseX - this.width / 2,
            y: this.camera.y + this._input.mouseY - this.height / 2,
        }
    }

    zoom(amount) {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this._zoomLevel = MathUtils.clamp(this._zoomLevel + amount, 3, 50);
        this.scale = this._zoomLevel / 10;
        this.ctx.scale(this.scale, this.scale);
        HTMLInputMapper.set(IDs.EditorZoom, this.scale);
    }

    moveCameraX(amount) {
        this.camera.x += amount;
        HTMLInputMapper.set(IDs.EditorCameraX, this.camera.x);
    }

    moveCameraY(amount) {
        this.camera.y += amount;
        HTMLInputMapper.set(IDs.EditorCameraY, this.camera.y);
    }

    get cX() {
        return Math.round(this.getCursorX());
    }

    get cY() {
        return Math.round(this.getCursorY());
    }

    wX(x) {
        return this.getCanvasX(x);
    }

    wY(y) {
        return this.getCanvasY(y);
    }
}