import {GLOBALS} from "Root/GLOBALS";
import {Camera} from "Game/renderer/Camera";
import {TUNING} from "Root/TUNING";
import {ImageBank} from "Game/renderer/ImageBank";
import {Logger, LoggerTags} from "Util/Logger";

// Always make the screen render 1920 world width units (at 100% browser zoom, 1px = 1 game unit)
// No matter the screen, always render 1920 game units. Always fit the whole level on the screen at any given moment.
const VIEWPORT_TARGET_WIDTH = 1920; // Desired view distance
const VIEWPORT_RATIO = 0.5625; // height:width; this is 16:9, but swapped to 9:16, because it leaves much nicer number

/**
 * The big boss of rendering that handles how the game should be rendered. Relies on {@link IRenderStrategy} to help
 * it render objects' positions in the world
 */
export class GameRenderer {
    /**
     * @param {SnapshotStash} snapshotStash
     * @param {IRenderStrategy} renderStrategy
     */
    constructor(snapshotStash, renderStrategy) {
        this._input = GLOBALS.inputManager; // some ugly GLOBALS residue, w/e
        /** @type {Camera} */
        this.camera = null;
        this.snapshotStash = snapshotStash;
        this.bulletColor = 'gold';

        this.renderStrategy = renderStrategy;
        /** @type {Snapshot} */
        this.primarySnapshot = null;
        this.scale = 1;
        this.walls = [];
    }

    /**
     * Apply some basic setup
     * @param {array<array<number>>} walls
     * @private
     */
    _setup(walls) {
        this._canvasFore = document.getElementById('canvasForeground');
        this._canvasBack = document.getElementById('canvasBackground');
        this._fore = this._canvasFore.getContext('2d');
        this._back = this._canvasBack.getContext('2d');
        this.width = 0;
        this.height = 0;
        this.camera = new Camera();
        this.walls = walls;
        window.addEventListener('resize', this._handleResize.bind(this));
        this._handleResize(); // calculate the initial width and height

        this._fore.save(); // Save the current scale
        this._back.save(); // Save the current scale
    }

    _handleResize(e) {
        let _width = window.innerWidth;
        let _height = window.innerHeight;

        // Alter and apply width/height so we follow the ratio rule
        let ratio = _height / _width; // should be 0.5625 - 9:16 ratio (makes nicer number than 16:9)
        if (ratio < VIEWPORT_RATIO) // 9:16 ratio (makes nicer number than 16:9)
        {
            // The canvas is wider than it should be compared to height, make it the correct size
            _width = _height / VIEWPORT_RATIO
        }
        else if (ratio > VIEWPORT_RATIO) {
            // The canvas is taller than it should be compared to width, make it the correct size
            _height = _width * VIEWPORT_RATIO;
        }

        this.width = _width;
        this.height = _height;

        this._canvasFore.style.width = this.width + 'px';
        this._canvasFore.style.height = this.height + 'px';
        this._canvasBack.style.width = this.width + 'px';
        this._canvasBack.style.height = this.height + 'px';
        this._fore.canvas.width = _width;
        this._fore.canvas.height = _height;
        this._back.canvas.width = _width;
        this._back.canvas.height = _height;

        this._applyScaling();
        this.fullRedraw();
    }

    _applyScaling() {
        // Restore context before applying new scale
        this._fore.restore();
        this._back.restore();

        this.scale = this.width / VIEWPORT_TARGET_WIDTH;
        /// #if DEBUG
        console.log('Render Scale: ' + this.scale);
        /// #endif
        Logger.logO('Render scale: ' + this.scale, {tag: LoggerTags.RENDER});

        this._fore.scale(this.scale, this.scale);
        this._back.scale(this.scale, this.scale);
    }

    /**
     * Actually only redraws static content, since the dynamic one will get repainted soon anyway because
     * it gets periodically triggered by game loop
     */
    fullRedraw() {
        this._drawStatic();
    }

    /**
     * Draw only static ojects
     * @private
     */
    _drawStatic() {
        this._back.clearRect(0, 0, this.width / this.scale, this.height / this.scale);
        this._back.fillStyle = 'black';
        for (let wall of this.walls) {
            this._back.beginPath();
            this._back.moveTo(this.getCanvasX(wall[0][0]), this.getCanvasY(wall[0][1]));
            for (let i = 1; i < wall.length; i++) {
                this._back.lineTo(this.getCanvasX(wall[i][0]), this.getCanvasY(wall[i][1]));
            }
            this._back.closePath();
            this._back.fill();
        }
    }

    _drawPlayers() {
        for (let a in this.primarySnapshot.data.avatars) {
            // We know that avatar must have x and y coordinate if it exists. As such, we can only check if the avatar
            // exists.
            if (!this.renderStrategy.shouldDraw((snapshot) => {
                return snapshot.data.avatars[a]
            })) {
                continue;
            }
            let x = this.renderStrategy.getField((snapshot) => {
                if (snapshot.data.avatars[a]) {
                    return snapshot.data.avatars[a].x
                }
                return false;
            });
            let y = this.renderStrategy.getField((snapshot) => {
                if (snapshot.data.avatars[a]) {
                    return snapshot.data.avatars[a].y
                }
                return false;
            });
            let pos = this.getCanvasPosition(x, y);

            this._fore.fillStyle = this.primarySnapshot.data.avatars[a].color;
            this._fore.beginPath();
            this._fore.arc(pos.x, pos.y, TUNING.PLAYER_WIDTH, 0, Math.PI * 2);
            this._fore.fill();
            this._fore.closePath();
        }
    }

    _drawProjectiles() {
        this._fore.fillStyle = this.bulletColor;
        for (let p in this.primarySnapshot.data.projectiles) {
            if (!this.renderStrategy.shouldDraw((snapshot) => {
                return snapshot.data.projectiles[p]
            })) {
                continue;
            }
            let x = this.renderStrategy.getField((snapshot) => {
                if (snapshot.data.projectiles[p]) {
                    return snapshot.data.projectiles[p].x
                }
                return false;
            });
            let y = this.renderStrategy.getField((snapshot) => {
                if (snapshot.data.projectiles[p]) {
                    return snapshot.data.projectiles[p].y
                }
                return false;
            });
            let pos = this.getCanvasPosition(x, y);
            // HACK - since having a special category feels excessive now that the physics is handled by a library and
            // because there is a bit of a difference between server and client handling things, pickups are now sent
            // alongside projectiles
            let image = this.primarySnapshot.data.projectiles[p].image;
            if (image) {
                let posCenter = ImageBank.centerizePosition(image, pos.x, pos.y);
                this._fore.drawImage(ImageBank.get(image), posCenter[0], posCenter[1]);
            }
            else {
                this._fore.fillRect(pos.x - TUNING.PISTOL_BULLET_WIDTH / 2, pos.y - TUNING.PISTOL_BULLET_WIDTH / 2, TUNING.PISTOL_BULLET_WIDTH, TUNING.PISTOL_BULLET_WIDTH);
            }
        }
    }

    _drawDebug() {

    }

    /**
     * Render dynamic objects
     */
    render() {
        this.renderStrategy.prepare(); // VERY IMPORTANT step!!!
        this.primarySnapshot = this.renderStrategy.getPrimarySnapshot();

        if (this.primarySnapshot) {
            // If we cannot draw for some reason (e.g. we lagged for far too long and the snapshots expired) we do not
            // want to clear the screen and make it empty, but rather 'pause' the game by not clearing it.
            // That means clearRect ONLY we can draw again, not every frame.
            this._fore.clearRect(0, 0, this.width / this.scale, this.height / this.scale);
            this._drawPlayers();
            this._drawProjectiles();
            this._drawDebug();
        }
        else {
            console.log('No snapshots are available! Skipping frame');
        }
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

    /**
     * Return a position on the canvas based on the world position (factor in camera)
     * @param worldY
     * @return {number}
     */
    getCanvasX(worldX) {
        return worldX - this.camera.x + this.width / 2 / this.scale;
    }

    /**
     * Return a position on the canvas based on the world position (factor in camera)
     * @param worldY
     * @return {number}
     */
    getCanvasY(worldY) {
        return worldY - this.camera.y + this.height / 2 / this.scale;
    }

    getCursorWorld() {
        return {
            x: this.camera.x + this._input.mouseX - this.width / 2,
            y: this.camera.y + this._input.mouseY - this.height / 2,
        }
    }
}

/**
 *
 * @type {GameRenderer}
 */
GameRenderer.inst = null;