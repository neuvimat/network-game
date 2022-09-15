/**
 * <p>Called when {@link ToggleCommand} is either turned on or off.</p>
 * @callback ToggleCommand.CommandCallback
 * @param inputManager {InputManager} test doc
 * @param {Game} game
 * @param {IInputForwarder} inputForwarder
 * @param {StateManager} stateManager
 * @param {Event} [event] HTML event that caused this callback
 */

/**
 * <p>Natively in JS, listening to keyDown event periodically fires an event as long as the button is held.</p>
 * <p>ToggleCommand makes sure to not get triggered over and over when a button is being held. It will only trigger
 * once and can be re-triggered again only after the button is released.</p>
 * <p>The command itself gets periodically invoked as the button causing the event is being held, but the ToggleCommand
 * ignores these invocations in the manner described above.</p>
 * <p>When an keyDown event is fired, trigger {@link ToggleCommand.down}. Even if the down is called multiple times
 * in a row, it gets processed only once. Then when a keyUp event is fired, trigger {@link ToggleCommand.up} to reset
 * its state and allow it to re-trigger.</p>
 * @implements {IInputState~UserCommand}
 */
export class ToggleCommand {
    /**
     * @param {ToggleCommand.CommandCallback} onOnFn
     * @param {ToggleCommand.CommandCallback} onOffFn
     */
    constructor(onOnFn, onOffFn) {
        this._on = false;
        /**         * @type {ToggleCommand.CommandCallback}         */
        this.onOn = onOnFn;
        /**         * @type {ToggleCommand.CommandCallback}         */
        this.onOff = onOffFn;
    }

    /**
     * <p>Alias for {@link down}</p>
     * @param {InputManager} inputManager
     * @param {Game} game
     * @param inputForwarder
     * @param {StateManager} stateManager
     * @param [e] HTML event that caused this command to trigger
     */
    on (inputManager, game, inputForwarder, stateManager, e) {
        if (this._on) {

        }
        else {
            this._on = true;
            this.onOn(inputManager, game, inputForwarder, stateManager, e);
        }
    }

    /**
     * <p>Alias for {@link up}</p>
     * @param {InputManager} inputManager
     * @param {Game} game
     * @param inputForwarder
     * @param {StateManager} stateManager
     * @param [e] HTML event that caused this command to trigger
     */
    off (inputManager, game, inputForwarder, stateManager, e) {
        if (!this._on) {

        }
        else {
            this._on = false;
            this.onOff(inputManager, game, inputForwarder, stateManager, e);
        }
    }

    /**
     * <p>Triggered when {@link ToggleCommand.off} or {@link ToggleCommand.up} is invoked.</p>
     * @param {ToggleCommand.CommandCallback} fn
     */
    setOffFn(fn) {
        this.onOff = fn;
    }


    /**
     * <p>Triggered when {@link ToggleCommand.on} or {@link ToggleCommand.down} is invoked.</p>
     * @param {ToggleCommand.CommandCallback} fn
     */
    setOnFn(fn) {
        this.onOn = fn;
    }
}