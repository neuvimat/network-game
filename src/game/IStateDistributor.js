// One implementation is src/client/LocalStateDistributor
// Other is src/network/WebsocketServer. That is more robust as it also handles players joining and leaving

/**
 * <p>Generic interface that all StateDistributors have to implement.</p>
 * <p>State distributor's job is to somehow pass messages concerning a Game's state to players. It is up to the
 * specific implementation of the distributor to figure out how.</p>
 * @interface
 */
export class IStateDistributor {
    /**
     * Immediately send a message to all players.
     * @param {NetworkMessage} message
     */
    broadcast(message) {
    }

    /**
     * Queue a message to all players.
     * @param {NetworkMessage} message
     */
    queueBroadcast(message) {
    }

    /**
     * Immediately send a message to specified player.
     * @param id id of connection to send a message to
     * @param {NetworkMessage} message
     */
    unicast(id, message) {
    }

    /**
     * Queue a unicast message to specified player.
     * @param id id of connection to send a message to
     * @param {NetworkMessage} message
     */
    queueUnicast(id, message) {
    }

    /**
     * Send all queued messages to players
     */
    transmitQueue() {

    }

    /**
     * @return {boolean} true if there is someone who is receiving messages from this distributor
     */
    hasSubscribers() {

    }
}