import {_GeneralState} from "Client/states/_GeneralState";
import {STATES} from "Client/states/StateManager";

/**
 * Currently unused
 */
export class OptionsState extends _GeneralState{
    constructor(stateManager) {
        super(stateManager, STATES.OPTIONS_STATE);
        window.addEventListener('load', ()=>{
        })
    }

    init() {

    }

    enterState(prevState) {

    }

    exitState() {

    }

    canChangeState() {
        return true;
    }
}