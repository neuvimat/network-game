import * as MovementCommands from '../commands/Movement'
import * as CombatCommands from '../commands/Combat'
import * as UICommands from '../commands/UI'
import {ToggleCommand} from "Client/input/commands/ToggleCommand";
import {IInputState} from "Client/input/states/IInputState";
import {WebsocketInputForwarder} from "Client/input/forwarders/WebsocketInputForwarder";

// Prepare relevant commands for this state
let MoveUp = new ToggleCommand(MovementCommands.MoveUp, MovementCommands.StopUp);
let MoveLeft = new ToggleCommand(MovementCommands.MoveLeft, MovementCommands.StopLeft);
let MoveRight = new ToggleCommand(MovementCommands.MoveRight, MovementCommands.StopRight);
let MoveDown = new ToggleCommand(MovementCommands.MoveDown, MovementCommands.StopDown);
let Sprint = new ToggleCommand(MovementCommands.StartSprint, MovementCommands.StopSprint);
let Walk = new ToggleCommand(MovementCommands.StartWalk, MovementCommands.StopWalk);
let Fire = new ToggleCommand(CombatCommands.StartPrimaryFire, CombatCommands.StopPrimaryFire);
let ToggleScoreboard = new ToggleCommand(UICommands.ShowScoreboard, UICommands.HideScoreboard);
let ToggleMenu = new ToggleCommand(UICommands.ToggleMenu, ()=>{});

// the distinction between up and down is most likely unnecessary and could be merged together
// unless one key for activation and other for deactivation is desired, which is unlikely
let commandDownMap = {
    KeyW: MoveUp,
    KeyA: MoveLeft,
    KeyS: MoveDown,
    KeyD: MoveRight,
    ShiftLeft: Sprint,
    Space: Walk,
    KeyK: Fire,
    Tab: ToggleScoreboard,
    KeyM: ToggleMenu,
};
let commandUpMap = {
    KeyW: MoveUp,
    KeyA: MoveLeft,
    KeyS: MoveDown,
    KeyD: MoveRight,
    ShiftLeft: Sprint,
    Space: Walk,
    KeyK: Fire,
    Tab: ToggleScoreboard,
    KeyM: ToggleMenu,
};

// 0 - left, 1 - middle/wheel, 2 - right
let commandDownMouseMap = {
    0: Fire,
};

// 0 - left, 1 - middle/wheel, 2 - right
let commandUpMouseMap = {
    0: Fire,
};

/**
 * <p>Active during {@link GameState}.</p>
 * <p>Processes commands such as movement, firing, sprinting, opening a game menu, ...</p>
 * @implements IInputState
 */
export class GameInputState extends IInputState{
    constructor() {
        super();

    }

    retrieveUpInput(key) {
        return commandUpMap[key];
    }

    retrieveDownInput(key) {
        return commandDownMap[key];
    }

    retrieveMouseDownInput(mouseButton) {
        return commandDownMouseMap[mouseButton];
    }

    retrieveMouseUpInput(mouseButton) {
        return commandUpMouseMap[mouseButton];
    }

    retrieveWheelInput() {
        return null;
    }

    enterState(inputManager, prevState) {

    }

    exitState(inputManager, newState) {

    }

    /**
     * <p>If the click is not valid, the event </p>
     * @param e event
     * @return {boolean}
     */
    isLeftClickValid(e) {
        if (!(event.target.tagName === 'INPUT' || event.target.tagName === 'BUTTON')) {
            return true;
        }
    }
}