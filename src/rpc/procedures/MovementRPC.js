import {RPCHandler} from "RPC/RPCHandler";
import {COMMANDS_ID} from "Client/input/InputManager";

export function makeMoveUp(start) {
    return RPCHandler.wrap({command: RPCHandler.sign(COMMANDS_ID.UP, start)});
}
export function makeMoveDown(start) {
    return RPCHandler.wrap({command: RPCHandler.sign(COMMANDS_ID.DOWN, start)});
}
export function makeMoveLeft(start) {
    return RPCHandler.wrap({command: RPCHandler.sign(COMMANDS_ID.LEFT, start)});
}
export function makeMoveRight(start) {
    return RPCHandler.wrap({command: RPCHandler.sign(COMMANDS_ID.RIGHT, start)});
}
export function makeSprint(start) {
    return RPCHandler.wrap({command: RPCHandler.sign(COMMANDS_ID.SPRINT, start)});
}
export function makeWalk(start) {
    return RPCHandler.wrap({command: RPCHandler.sign(COMMANDS_ID.WALK, start)});
}