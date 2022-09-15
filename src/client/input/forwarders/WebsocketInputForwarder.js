/**
 * <p>Sends/forwards all RPCs that user issues through a websocket that sends the RPC as JSON strings.</p>
 * @implements IInputForwarder
 */
import {IInputForwarder} from "Client/input/forwarders/IInputForwarder";

export class WebsocketInputForwarder extends IInputForwarder{
    constructor(wsConnection) {
        super();
        this.wsConnection = wsConnection;
    }

    forwardRPC(rpc) {
        this.wsConnection.send(JSON.stringify(rpc));
    }

    send(rpc) {
        this.wsConnection.send(JSON.stringify(rpc));
    }
}