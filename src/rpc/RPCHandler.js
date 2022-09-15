import {COMMANDS_ID} from "Client/input/InputManager";

/**
 * <p>Dedicated message handler for incoming RPC commands sent by clients. Main purpose is to reduce clutter inside
 * {@link WebsocketServer}</p>
 */
export class RPCHandler {
    constructor(game) {
        /**         * @type {Game}         */
        this.game = game;
    }

    /**
     * <p>Handle an RPC</p>
     * @typedef {Object} RPC
     * @property {string} command
     * @param {Player} player issuer of the RPC
     * @param {RPC} rpc issued command
     */
    handle(player, rpc) {
        // (nothing prepended)   means key down - i.e. we start a command
        // -                     means key up   - i.e. we stop  a command
        switch (rpc.command) {
            case COMMANDS_ID.UP:
                player.avatar.components.simpleMovement.up = true;
                break;
            case -COMMANDS_ID.UP:
                player.avatar.components.simpleMovement.up = false;
                break;

            case COMMANDS_ID.LEFT:
                player.avatar.components.simpleMovement.left = true;
                break;
            case -COMMANDS_ID.LEFT:
                player.avatar.components.simpleMovement.left = false;
                break;

            case COMMANDS_ID.DOWN:
                player.avatar.components.simpleMovement.down = true;
                break;
            case -COMMANDS_ID.DOWN:
                player.avatar.components.simpleMovement.down = false;
                break;

            case COMMANDS_ID.RIGHT:
                player.avatar.components.simpleMovement.right = true;
                break;
            case -COMMANDS_ID.RIGHT:
                player.avatar.components.simpleMovement.right = false;
                break;

            case COMMANDS_ID.WALK:
                player.avatar.components.simpleMovement.walk(true);
                break;
            case -COMMANDS_ID.WALK:
                player.avatar.components.simpleMovement.walk(false);
                break;

            case COMMANDS_ID.SPRINT:
                player.avatar.components.simpleMovement.sprint(true);
                break;
            case -COMMANDS_ID.SPRINT:
                player.avatar.components.simpleMovement.sprint(false);
                break;

            case COMMANDS_ID.FIRE:
                player.avatar.components.shooter.shootStart();
                break;
            case -COMMANDS_ID.FIRE:
                player.avatar.components.shooter.shootEnd();
                break;

            default:
                console.log('Unknown rpc: ' + rpc.command);
                break;
        }
    }
}

/**
 * Wrap the command into rpc 'packet'
 * @param rpc to wrap
 * @returns {{type: string, payload: *}}
 */
RPCHandler.wrap = function (rpc) {
    return {type: 'rpc', payload: rpc};
};

/**
 * Convert boolean to a string saying either 'on' or 'off'
 * @param {boolean} start
 * @returns {string}
 */
RPCHandler.state = function (start) {
    if (start) return 'on';
    else return 'off';
};

/**
 * <p>Prepend '-' in front of the command id if the command should be toggled off (key up)</p>
 * @param id command id
 * @param {boolean} enable is the command message saying its on or off?
 * @returns {number}
 */
RPCHandler.sign = function (id, enable) {
    if (enable) return Math.abs(id);
    else return -1 * Math.abs(id);
};