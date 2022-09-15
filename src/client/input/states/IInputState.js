/**
 * Interface that every UserCommand has to implement
 * @interface IInputState~UserCommand
 */

/**
 * @function
 * @name IInputState~UserCommand#on
 * @param {InputManager} inputManager
 * @param {Game} game currently unused since the client does not run the game simulation, and it should be used anyway
 * because the commands should return... commands... and those should just get passed to the game via input forwarder,
 * but the hell is suppoed to refactor 20+ commands and remove this field in all the lambdas
 * @param {IInputForwarder} inputForwarder
 * @param {StateManager} stateManager
 * @param {*} event classic html event such as mousedown, keydown, ... that leads to this' command activation
 */

/**
 * @function
 * @name IInputState~UserCommand#off
 * @param {InputManager} inputManager, this._inputForwarder, this.stateManager, event
 * @param {Game} game currently unused since the client does not run the game simulation, and it should be used anyway
 * because the commands should return... commands... and those should just get passed to the game via input forwarder,
 * but the hell is suppoed to refactor 20+ commands and remove this field in all the lambdas
 * @param {IInputForwarder} inputForwarder
 * @param {StateManager} stateManager
 * @param {*} event classic html event such as mousedown, keydown, ... that lead to this commands activation
 */

/**
 * <p>Input state interface.</p>
 * <p>When {@link InputManager} handles user input (key presses, mouse clicks) it asks currently active InputState
 * how to respond to such input. The InputState then returns a {@link IInputState~UserCommand} on which the
 * {@link InputManager} calls {@link IInputState~UserCommand#on} or {@link IInputState~UserCommand#off}</p>
 * @interface
 */
export class IInputState {
    constructor() {

    }

    /**
     * @param {String} key 'key' property of keyDown event
     * @return {IInputState~UserCommand} command to process when a key is stopped being pressed
     */
    retrieveUpInput(key) {
        console.error('Unimplemented method!');
        return undefined;
    }

    /**
     * @param {String} key 'key' property of keyDown event
     * @return {IInputState~UserCommand} command to process when a key starts being pressed
     */
    retrieveDownInput(key) {
        console.error('Unimplemented method!');
        return undefined;
    }

    /**
     * @param {String} mouseButton '0' for LMB, '1' for MMB, '2' for RMB
     * @return {IInputState~UserCommand} command to process when a mouse button is pressed
     */
    retrieveMouseDownInput(mouseButton) {
        console.error('Unimplemented method!');
        return undefined;
    }

    /**
     * @param {String} mouseButton '0' for LMB, '1' for MMB, '2' for RMB
     * @return {IInputState~UserCommand} command to process when a mouse button is stopped being pressed
     */
    retrieveMouseUpInput(mouseButton) {
        console.error('Unimplemented method!');
        return undefined;
    }

    /**
     * @return {IInputState~UserCommand}
     */
    retrieveWheelInput() {
        console.error('Unimplemented method!');
        return undefined;
    }

    /**
     * <p>Invoked when InputManager activates this state.</p>
     * @param {InputManager} context
     * @param {IInputState} prevState
     */
    enterState(context, prevState) {

    }

    /**
     * <p>Invoked when InputManager deactivates this state.</p>
     * @param {InputManager} context
     * @param {IInputState} newState
     */
    exitState(context, newState) {

    }

    /**
     * <p>We do not always need/want to process a left click. Return true if the manager should bother with processing
     * left mouse button press.</p>
     * <p>If the {@link InputManager} should not process the click (i.e. this method returns false), it let's the
     * click do what it would normally do, i.e. it does not prevent default, so clicking on buttons, links will still
     * work as usual.</p>
     * <p>We might not want to burden commands with handling clicking on unexpected elements. Instead we let
     * the actual state handle it.</p>
     * <p>Example: in {@link GameInputState} we do not want to process LMB (shoot a weapon) if we click on UI
     * buttons.</p>
     * @param {MouseEvent} e
     * @return {boolean} true if {@link InputManager} should process the left click
     */
    isLeftClickValid(e) {
        return true;
    }
}