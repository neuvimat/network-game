import {RPCHandler} from "RPC/RPCHandler";
import {COMMANDS_ID} from "Client/input/InputManager";

export function makePrimaryFire(start) {
    return RPCHandler.wrap({command: RPCHandler.sign(COMMANDS_ID.FIRE, start)});
}