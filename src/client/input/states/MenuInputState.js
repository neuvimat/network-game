import {ToggleCommand} from "Client/input/commands/ToggleCommand";
import {IInputState} from "Client/input/states/IInputState";
import {HTMLInputMapper, IDs} from "Root/util/HTMLInputMapper";

// Just inline the command, don't bother with ToggleCommand instance
let StartGame = {on: (a,b,c,d)=>{
    HTMLInputMapper.set(IDs.Fullscreen, false);
    d.menuState._requestMultiplayer();
    }, off: ()=>{}};

let commandDownMap = {
    Space: StartGame,
};

let commandUpMap = {

};

// 0 - left, 1 - middle/wheel, 2 - right
let commandDownMouseMap = {

};

// 0 - left, 1 - middle/wheel, 2 - right
let commandUpMouseMap = {

};

/**
 * <p>Active during {@link MenuState}.</p>
 * @implements IInputState
 */
export class MenuInputState extends IInputState {
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

    isLeftClickValid(e) {
        return true;
    }
}