import {GameState} from "./GameState";
import {MenuState} from "Client/states/MenuState";
import {OptionsState} from "Client/states/OptionsState";
import {GLOBALS} from "Root/GLOBALS";
import {MenuInputState} from "Client/input/states/MenuInputState";
import {GameInputState} from "Client/input/states/GameInputState";

/**
 * @enum {number}
 */
export const STATES = {
    MENU_STATE: 0,
    GAME_STATE: 1,
    OPTIONS_STATE: 2,
    LOCAL_GAME_STATE: 3,
};

/**
 * Manager for client side states. Each state handles both UI and logic for a specific part of the application.
 */
export class StateManager {
    /**
     *
     * @param inputManager
     */
    constructor(inputManager) {
        this._inputManager = inputManager;
        // Prepare the states we will use
        this.gameState = new GameState(this, this._inputManager); // pass in inputManager, because it changes from within the state based on local/network play
        this.menuState = new MenuState(this);


        // Don't forget to init all our states
        this.gameState.init();
        this.menuState.init();

        this.activeState = null;
    }

    /**
     * Request to change from current state to a different state. If the current state allows the change, trigger it,
     * otherwise this method will return false
     * @param {STATES} state
     * @return {boolean} true if request is granted else false
     */
    requestStateChange(state) {
        let _state;
        let _input;
        if (this.activeState == null || this.activeState.canChangeState()) {
            switch (state) {
                case STATES.MENU_STATE:
                    _state = this.menuState;
                    _input = new MenuInputState();
                    break;
                case STATES.GAME_STATE:
                    _state = this.gameState;
                    // To not create almost exact copy of gamestate for local/online play, we use this bool
                    // The state than changes some things inside it's enterState method
                    this.gameState.isLocal = false;
                    _input = new GameInputState(false);
                    break;
                case STATES.LOCAL_GAME_STATE:
                    _state = this.gameState;
                    // To not create almost exact copy of gamestate for local/online play, we use this bool
                    // The state than changes some things inside it's enterState method
                    this.gameState.isLocal = true;
                    _input = new GameInputState(true);
                    break;
                default:
                    console.error('Requesting unknown state! Ignoring...');
                    return false;
            }
            this._setState(_state);
            this._inputManager.setState(_input);
            return true;
        }
        return false;
    }

    /**
     * Swap the current state to a different once. Trigger previous state's exitState method and new one's enter state
     * method.
     * @param {_GeneralState} state
     * @private
     */
    _setState(state) {
        let prevState = this.activeState;
        if (prevState) {
            prevState.exitState(state);
        }
        this.activeState = state;
        this.activeState.enterState(prevState);
    }
}