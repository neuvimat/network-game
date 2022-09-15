/**
 * <p>List of commands that are recognized by the game.</p>
 * @enum {Number}
 * @readonly
 */
export const COMMANDS_ID = {
    UP: 1,
    LEFT: 2,
    DOWN: 3,
    RIGHT: 4,
    WALK: 5,
    SPRINT: 6,
    FIRE: 7,
    ALTFIRE: 8,
    SLOT1: 9,
    SLOT2: 10,
    SLOT3: 11,
    USE: 12,
};

/**
 * <p>Main input processor. This is the place where we actually listen for events.</p>
 * <p>All caught events are then passed into currently active {@link IInputState}. The input state then returns a
 * {@link IInputState~UserCommand} on which the manager calls appropriate methods. Id addition, the manager tracks
 * mouse position and store its coordinates in mouseX and mouseY properties.</p>
 * <p>Handled events are:
 * <ul>
 *     <li>mousemove - updates position stored in this.mouseX and this.mouseY</li>
 *     <li>keydown - calls {@link IInputState~UserCommand#on} on returned command</li>
 *     <li>keyup - calls {@link IInputState~UserCommand#off} on returned command</li>
 *     <li>mousedown - calls {@link IInputState~UserCommand#on} on returned command</li>
 *     <li>mouseup - calls {@link IInputState~UserCommand#off} on returned command</li>
 *     <li>wheel - calls {@link IInputState~UserCommand#on} on returned command - this means you do not have to
 *     implement the 'off' callback unless this the command responds only to 'wheel' event</li>
 * </ul>
 * </p>
 */
export class InputManager {
    /**
     * @param {StateManager} stateManager
     * @constructor
     */
    constructor(stateManager) {
        this._inputForwarder = null;
        this._hookEvents();
        this.mouseX = 0;
        this.mouseY = 0;
        this.stateManager = stateManager;
        this._inputState = null;
        this._isActive = true;
    }

    /**
     * <p>Set the new current state. Triggers {@link IInputState#exitState} on the currently active state and
     * {@link IInputState#enterState} on the newly activated state.</p>
     * @param {IInputState} state
     */
    setState(state) {
        if (this._inputState) {
            this._inputState.exitState(this, state);
        }
        this._inputState = state;
        this._inputState.enterState(this, state);
    }

    /**
     * <p>Setup all the event listeners and callback methods.</p>
     * @private
     */
    _hookEvents() {
        window.addEventListener('mousemove', (e) => {this._handleMouseMove(e)});
        window.addEventListener('keydown', (e) => {this._handleKeyDown(e)});
        window.addEventListener('keyup', (e) => {this._handleKeyUp(e)});
        window.addEventListener('mousedown', (e) => {this._handleMouseDown(e)});
        window.addEventListener('mouseup', (e) => {this._handleMouseUp(e)});
        window.addEventListener('wheel', (e) => {this._handleWheel(e)});
    }

    /**
     *
     * @param {MouseEvent} e
     * @private
     */
    _handleMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }

    /**
     *
     * @param {MouseEvent} event
     * @private
     */
    _handleMouseDown(event) {
        if (this.shouldHandle()) {
            let command = this._inputState.retrieveMouseDownInput(event.button);
            if (command != null) {
                // If we left click on a canvas, we want to shoot and prevent default just to be sure,
                // if we do not left click on canvas, we do not want to shoot and certainly not prevent default
                if (event.button === 0 && this._inputState.isLeftClickValid(event)) {
                    event.preventDefault();
                    command.on(this, undefined, this._inputForwarder, this.stateManager, event);
                }
                else {
                    // do nothing, we are clicking on buttons/ui/something else obstructing the screen
                }
            }
            else {

            }
        }
        else {

        }
    }

    /**
     *
     * @param {MouseEvent} event
     * @private
     */
    _handleMouseUp(event) {
        if (this.shouldHandle()) {
            let command = this._inputState.retrieveMouseUpInput(event.button);
            if (command != null) {
                event.preventDefault();
                command.off(this, undefined, this._inputForwarder, this.stateManager, event);
            }
            else {
            }
        }
    }

    /**
     *
     * @param {KeyboardEvent} event
     * @private
     */
    _handleKeyDown(event) {
        if (this.shouldHandle()) {
            let command = this._inputState.retrieveDownInput(event.code);
            if (command != null) {
                event.preventDefault();
                command.on(this, undefined, this._inputForwarder, this.stateManager, event);
            }
            else {
            }
        }
    }

    /**
     *
     * @param {KeyboardEvent} event
     * @private
     */
    _handleKeyUp(event) {
        if (this.shouldHandle()) {
            let command = this._inputState.retrieveUpInput(event.code);
            if (command != null) {
                event.preventDefault();
                command.off(this, undefined, this._inputForwarder, this.stateManager, event);
            }
        }
    }

    /**
     * @param {WheelEvent} event
     * @private
     */
    _handleWheel(event) {
        if (this.shouldHandle()) {
            let command = this._inputState.retrieveWheelInput();
            if (command != null) {
                command.on(this, undefined, this._inputForwarder, this.stateManager, event);
            }
        }
    }

    /**
     * @return {boolean} true if the input manager itself is active and there is currently and active state
     */
    shouldHandle() {
        return this._isActive && this._inputState != null;
    }

    /**
     * <p>Activate the input manager. If the input manager is active and there is currently an {@link IInputState} set,
     * the manager will handle the any input it is capable of handling (the list from overall class description).</p>
     */
    activate() {
        this._isActive = true;
    }

    /**
     * <p>Deactivate this input manager. It will not handle any input, i.e. all the user actions will have their natural
     * consequences, i.e. no events are prevented from their default behavior..</p>
     */
    deactivate() {
        this._isActive = false;
    }
}