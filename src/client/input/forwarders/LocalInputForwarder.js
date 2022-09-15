import {IInputForwarder} from "Client/input/forwarders/IInputForwarder";

/**
 * <p>Unlike {@link WebsocketInputForwarder}, this one does not pass the RPCs to a websocket that sends them onto a
 * server, but rather sends them directly to the locally running RPCHandler.</p>
 * @implements IInputForwarder
 */
export class LocalInputForwarder extends IInputForwarder{
    /**
     * @param {RPCHandler} rpcHandler pass all user rpcs directly into this handler
     * @param {Player} player represent this player with all commands (in online play, the websocket connects the message's
     * origin connection to a specific game player object and passes it alongside the rpc to a RPCHandler.)
     */
    constructor(rpcHandler, player) {
        super();

        // RPC handler that preferably is attached to a Game instance.
        this.rpcHandler = rpcHandler;
        this.player = player;
    }

    forwardRPC(rpcNetworkMessage) {
        // In online play, the webSocketServer receives a message, sees it is an RPC, extracts the payload and passes
        // it in the handler (and passes in the player that is represented by the connection).
        // Here, in local play and in localForwarder we need to do the job here ourselves
        this.rpcHandler.handle(this.player, rpcNetworkMessage.payload);
    }

    send(rpcNetworkMessage) {
        // In online play, the webSocketServer receives a message, sees it is an RPC, extracts the payload and passes
        // it in the handler (and passes in the player that is represented by the connection).
        // Here, in local play and in localForwarder we need to do the job here ourselves
        this.rpcHandler.handle(this.player, rpcNetworkMessage.payload);
    }
}