import {IStateDistributor} from "Game/IStateDistributor";

/**
 * <p>Local version of StateDistributor. Sends all messages directly into MessageHandler, skipping JSONifiying messages,
 * sending them through websocket, reconstructing them back into JS objects on client machine in client websocket, which
 * then sends the message to the message handler.</p>
 * <p><b>Note: do not forget to explicitly transmit all queues from the outside (e.g. from GameRunner)</b></p>
 * @implements IStateDistributor
 */
export class LocalStateDistributor {
    /**     * @param {MessageHandler} messageHandler     */
    constructor(messageHandler) {
        this.messageHandler = messageHandler;
    }

    /**
     * Immediately send a message to all sanctified connections.
     * @param {NetworkMessage} message
     */
    broadcast(message) {
        this.messageHandler.handleMessage(message)
    }

    /**
     * Queue a message to all sanctified connections.
     * @param {NetworkMessage} message
     */
    queueBroadcast(message) {
        this.messageHandler.handleMessage(message)
    }

    /**
     * Immediately send a message to specified connection via id.
     * @param id id of connection to send a message to
     * @param {NetworkMessage} message
     */
    unicast(id, message) {
        this.messageHandler.handleMessage(message)
    }

    /**
     * Queue a unicast message to specified connenction via id.
     * @param id id of connection to send a message to
     * @param {NetworkMessage} message
     */
    queueUnicast(id, message) {
        this.messageHandler.handleMessage(message)
    }

    /**
     * In context of localStateDistributor, this has no meaning, as all messages (even if we call the queue method
     * variant) are immediately sent to the local client.
     */
    transmitQueue() {

    }

    /**
     * Always returns true. If the Game runs locally and uses LocalStateDistributor, it logically means that there
     * is a local player connected to the game.
     * @return {boolean}
     */
    hasSubscribers() {
        return true;
    }
}