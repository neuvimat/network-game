/**
 * <p>Generic InputForwarder.</p>
 * <p>InputForwarder is an abstraction layer for sending commands to game simulation. Commands simply create an RPC and
 * tell input forwarder to deliver the RPC to the game.</p>
 * <p>Make sure that on the other end there is appropriate handler that is compatible with how the specific
 * implementation of InputForwarder works.</p>
 * <p>Basic examples are {@link LocalInputForwarder} or {@link WebsocketInputForwarder}</p>
 * @interface
 */
export class IInputForwarder {
    constructor() {
    }

    /**
     * <p>Forward a RPC.</p>
     * * <p>Alias for {@link send}</p>
     * @param rpc
     */
    forwardRPC(rpc) {
        console.error('forwardRPC is not implemented!');
    }

    /**
     * <p>Forward a RPC.</p>
     * <p>Alias for {@link forwardRPC}</p>
     * <p>Legacy support, so no extensive renaming and refactoring is necessary.</p>
     * @param rpc
     */
    send(rpc) {
        console.error('send is not implemented!');
    }
}