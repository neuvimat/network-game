/**
 * Wrapper for user connection socket. Adds some additional data that the game uses, and stores it conveniently along
 * the socket itself.
 */
export class NetworkConnection {
    /**
     *
     * @param socket
     * @param [id]
     * @param [ip]
     */
    constructor(socket, id, ip) {
        this.socket = socket;
        this.id = id; // Currently this will have the same value as the this.player.nickname
        this.messageQueue = []; // Connection specific connection queue
        this.player = null;
        this.admin = false;
        this.ip = ip; // Used for assigning admin privileges based on I.P.
    }
}