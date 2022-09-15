const FLOATINESS_DISTANCE = 0.3; // Allow float for 30% of screen width
const FLOATINESS_DAMP = 0.3; // Once the aim is 30% of screen width away from character the camera has floated 100% away

/**
 * Camera represents a position form a player views the world. For now, the camera is always statick and at the
 * center of the map, but it has the ability to move around. GameRenderer then automatically moves the view
 * to fit the camera position.
 * There is a scrapped 'float' functionality that was supposed to slightly move camera towards the cursor, but
 * as the game design changed to static camera, it became useless
 */
export class Camera {
    constructor(renderer) {
        this._parent = parent;
        this.renderer = renderer;
        this.x = 0;
        this.y = 0;
        this._localX = 0;
        this._localY = 0;
        this.lastX = 0;
        this.lastY = 0;
        this._floating = true;
    }

    enableFloat() {
        this._floating = true;
    }

    disableFloat() {
        this._floating = false;
    }

    setParent(parent) {
        this._parent = parent;
    }

    /**
     * Match camera position with its parent
     */
    update() {
        this.lastX = this.x;
        this.lastY = this.y;
        this.x = this._parent.x;
        this.y = this._parent.y;

        if (this._floating) {
            this._applyFloat();
        }
    }

    /**
     * Obsolete
     * @return {{x: *, y: number}}
     * @private
     */
    _getFloat() {
        return {
            x: this._parent.x,
            y:0,
        }
    }

    /**
     * Obsolte
     * @private
     */
    _applyFloat() {
        let float = this._getFloat();
        this.x += float.x;
        this.y += float.y;
    }
}