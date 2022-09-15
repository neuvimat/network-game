import ws from 'ws';
import {RPCHandler} from "../rpc/RPCHandler";
import {NetworkConnection} from "Net/NetworkConnection";
import {NetworkMessages} from "Net/NetworkMessages";
import {GLOBALS} from "Root/GLOBALS";
import {TUNING} from "Root/TUNING";
import {IStateDistributor} from "Game/IStateDistributor";

/**
 * <p>This is the websocket server setup. It has all the required hooks (onmessage, onerror, ...) and keeps track of all
 * the connections. Each connection is wrapped in {@link NetworkConnection}. The server either processes incoming
 * messages and updates the game/other users directly or, if a message is an rpc (client action inside a simulation),
 * it will pass it to {@link RPCHandler}</p>
 * <p>When a connection is first opened, it is not eligible to receive broadcasts. First, it has
 * to be 'sanctified'. The client has to send a request to join the game and provide his nickname that, at the current
 * time, also serves as his id. Once he sends it and it gets approved, the connection is 'sanctified' and will
 * receive all the broadcasts.</p>
 * <p>Message can be sent immediately or queued. All queued messages are dispatched to client inside a bundle as
 * one message. Queues are transmitted after each tick.</p>
 * <p>Implements (as much as JS can handle interfaces) the {@link }IStateDistributor}</p>
 * @implements IStateDistributor
 * */
export class WebsocketServer {
    /**
     *
     * @param httpServer
     * @param {Game} game
     * @param {ServerGameRunner} gameloop
     */
    constructor(httpServer, game, gameloop) {
        // Prepare some variables
        this.connections = {}; // All connections to the server
        this.gameSubscribers = new Map(); // Game subscribers, subset of connections, when player first joins, we do
                                          // not send him any updates
        this.game = game;
        this.broadcastQueue = [];
        this.gameloop = gameloop;
        this.rpcHandler = new RPCHandler(game); // Give access to game to RPCHandler as well, so we don't have to pass
                                                // it in all the time

        // Create the actual server
        const wss = new ws.Server({server: httpServer});
        wss.on('connection', (socket, req) => {this._onNewConnection(socket, req)});
    }

    /**
     * Immediately send a message to all sanctified connections.
     * @param {NetworkMessage} message
     */
    broadcast(message) {
        for (let c of this.gameSubscribers.values()) {
            c.socket.send(JSON.stringify(message));
        }
    }

    /**
     * Queue a message to all sanctified connections.
     * @param {NetworkMessage} message
     */
    queueBroadcast(message) {
        this.broadcastQueue.push(message);
    }

    /**
     * Immediately send a message to specified connection via id.
     * @param id id of connection to send a message to
     * @param {NetworkMessage} message
     */
    unicast(id, message) {
        if (this.connections[id]) {
            this.connections[id].socket.send(JSON.stringify(message));
        }
    }

    /**
     * Queue a unicast message to specified connenction via id.
     * @param id id of connection to send a message to
     * @param {NetworkMessage} message
     */
    queueUnicast(id, message) {
        if (this.connections[id]) {
            this.connections[id].messageQueue.push(message);
        }
    }

    /**
     * <p>Same as {@link queueUnicast} but instead of supplying id of a connection, supply the actual
     * {@link NetworkConnection} object itself</p>
     * @param {NetworkConnection} connection
     * @param {NetworkMessage} message
     */
    queueUnicastC(connection, message) {
        connection.messageQueue.push(message);
    }

    /**
     * Send a message immediately to all connections except one identified by id.
     * @param id id of connection to exclude
     * @param {NetworkMessage} message
     */
    broadcastExceptOne(id, message) {
        for (let c of this.gameSubscribers) {
            if (c[0] === id) continue;
            c[1].socket.send(JSON.stringify(message));
        }
    }

    /**
     * <p>Send all messages stored in queues to connections. Each connection receives a bundle with all queued messages
     * queued for it + the messages stored inside broadcast queue.
     * </p>
     */
    transmitQueue() {
        for (let c of this.gameSubscribers.values()) {
            // If there are some messages waiting to be send
            if (this.broadcastQueue.length > 0 || c.messageQueue.length > 0) {
                let msgs = [];
                msgs = msgs.concat(c.messageQueue);
                msgs = msgs.concat(this.broadcastQueue);
                let bundle = NetworkMessages.bundle.make(msgs);
                this.unicast(c.id, bundle);
                if (c.messageQueue.length > 0) {
                    c.messageQueue = [];
                }
            }
        }
        if (this.broadcastQueue.length > 0) {
            this.broadcastQueue = [];
        }
    }

    /**
     * <p>Handles new connection. Attaches handlers to all events that are relevant and wraps the socket provided by
     * websocket implementation into {@link NetworkConnection}.
     * @param socket socket provided by the websocket implementation
     * @param req the incoming request
     * @private
     */
    _onNewConnection(socket, req) {
        let ip = req.connection.remoteAddress;
        let connection = new NetworkConnection(socket, null, ip);
        // For now, the connection exists only in this context. If it is approved (allowed nickname requested), it will
        // get added to a list and can start receiving messages and game updates

        // Hook up events and 'inject'/pass in the connection wrapper (passing it in the callbacks)
        socket.on('message', (msg) => {
            this._onMessage(connection, msg)
        });
        socket.on('close', (code, reason) => {
            this._onCloseConnection(connection, code, reason)
        });
        socket.on('error', (error) => {this._onError(connection, error)})
    }

    /**
     * <p>Handle incoming message received by a connection. If a message is an 'rpc' type, it gets handled separately by
     * an {@link RPCHandler}</p>
     * @param {NetworkConnection} connection connection from which the message was received
     * @param {NetworkMessage} _msg incoming message
     * @private
     */
    _onMessage(connection, _msg) {
        let msg = JSON.parse(_msg);
        switch (msg.type) {
            case NetworkMessages.rpc.code:
                this.rpcHandler.handle(connection.player, msg.payload);
                break;
            case NetworkMessages.ping.code:
                this.unicast(connection.id, NetworkMessages.pong.make(Date.now()));
                break;
            case NetworkMessages.joinRequest.code:
                let result = this._sanitizeNickname(msg.payload.nickname);
                if (result.errors.length > 0) {
                    connection.socket.send(JSON.stringify(NetworkMessages.sessionEnd.make(result.msg)));
                    connection.socket.close();
                }
                else {
                    this._sanctifyConnection(connection, result.sanitized);
                    connection.messageQueue.push(NetworkMessages.scoreFullUpdate.make(this.game.getScoreData()));
                }
                break;
            case NetworkMessages.adminify.code:
                if (msg.payload.secret === GLOBALS.adminToken) {
                    connection.admin = true;
                    connection.socket.send(JSON.stringify(NetworkMessages.consoleMsg.make('Admin privileges granted!', 0)));
                }
                break;
            case NetworkMessages.epilepsy.code:
                if (connection.admin) {
                    this.broadcast(NetworkMessages.epilepsy.make());
                }
                break;
            case NetworkMessages.forceScoreboardUpdate.code:
                if (!connection.admin) return;
                if (this.game.players[msg.payload.rowId] !== undefined) {
                    if (msg.payload.dataIndex === 1) {
                        this.game.players[msg.payload.rowId].kills = msg.payload.value;
                        this.queueBroadcast(NetworkMessages.scoreUpdateRow.make(msg.payload.rowId, 1, msg.payload.value));
                    }
                    else if (msg.payload.dataIndex === 2) {
                        this.game.players[msg.payload.rowId].deaths = msg.payload.value;
                        this.queueBroadcast(NetworkMessages.scoreUpdateRow.make(msg.payload.rowId, 2, msg.payload.value));
                    }
                    else {
                        console.error(connection.id, "can't even cheat properly! SHAME!");
                    }
                }
                break;
            case NetworkMessages.forceTuningChange.code:
                let pl = msg.payload;
                if (!connection.admin) return;
                if (TUNING[pl.key] !== undefined) {
                    TUNING[pl.key] = pl.value;
                }
                break;
            case NetworkMessages.forceTuningArrayChanges.code:
                if (!connection.admin) return;
                for (let c of msg.payload) {
                    if (TUNING[c[0]] !== undefined) {
                        TUNING[c[0]] = c[1];
                    }
                }
                break;
            default:
                console.warn('Unknown message type received in WebsocketServer');
        }
    }

    /**
     * Handle client disconnect
     * @param {NetworkConnection} connection
     * @param code
     * @param reason
     * @private
     */
    _onCloseConnection(connection, code, reason) {
        this.removeConnection(connection);
    }

    /**
     * Remove the connection from all connections pool and if it was sanctified, remove it from there.
     * @param {NetworkConnection} connection
     */
    removeConnection(connection) {
        // There is a chance that the connection was not properly processed and put into the objects from which we would
        // try to remove it. If it was processed, its id will not be null, use that as an indicator.
        if (connection.id !== null) {
            this.game.removePlayer(connection.id);
            this._removeGameSubscriber(connection);
            delete this.connections[connection.id];
        }
    }

    /**
     * <p>Process a nickname provided by client. If it is eligible, the returned object will not contain any errors
     * within its <b>'errors'</b> property. The <b>'msg'</b> property of the returned object is a shortcut that is
     * already cohesive message summing up all the errors that can be send directly to clients. If no errors are
     * present, work with the <b>'sanitazed'</b> property of the returning object. That is a trimmed version of the
     * name that actually is suitable to be used as an id or nickname</p>
     * @param nickname
     * @return {{errors: Array, sanitized: (*|string), msg: string}}
     * @private
     */
    _sanitizeNickname(nickname) {
        let errors = [];
        let trimmed = nickname.trim();
        if (nickname.length > 32) {
            errors.push('Nickname must be 32 or less characters long!')
        }
        if (trimmed.length < 3) {
            errors.push('Nickname must be at least 3 characters long!')
        }
        if (trimmed === '') {
            errors.push('(Trimmed) nickname must not be empty string!')
        }
        if (errors.length === 0 && !this._isNicknameUnique(trimmed)) {
            errors.push('Nickname is already taken!')
        }
        return {errors: errors, sanitized: trimmed, msg: errors.join('\n')};
    }

    /**
     * @param {String} nickname
     * @return {boolean} true if the nickname is unique in the scope of current round of the game.
     * @private
     */
    _isNicknameUnique(nickname) {
        // todo: perhaps create a name index and keep it updated for performance
        for (let connection of this.gameSubscribers.values()) {
            if (connection.id === nickname) return false;
        }
        return true;
    }

    /**
     * Handle any error caused by the connection.
     * @param {NetworkConnection} connection
     * @param error
     * @private
     */
    _onError(connection, error) {
        console.error('An error occured with connection"', connection.id, '"!');
        console.error(error);
    }

    /**
     * <p>Incoming connections are not given any id. They receive it after they are eligible to be sanctified. Their
     * id is based off of the nickname provided by the connection when it is first opened, which is the reason
     * why they are issued an id now.</p>
     * @param {NetworkConnection} connection conenction to sanctify
     * @param id id that the sanctified connection will receive
     * @private
     */
    _sanctifyConnection(connection, id) {
        this.connections[id] = connection;
        connection.id = id;
        this._addGameSubscriber(connection);
        // If player already was in the game and reconnected, restore his player object (respawn avatar, reappear in
        // scoreboard and RESTORE HIS SCORE! booya working reconnect!)
        if (this.game.players[id] !== undefined) {
            this._restorePlayerObject(connection);
        }
        // Else create a new player object for him
        else {
            this._assignPlayerObject(connection);
        }
    }

    /**
     * <p>Make the connection eligible to received broadcasts by placing it into appropriate category (gameSubscribers).
     * </p><p>We do not want to send game updates to connections that are not yet sanctified because they may have no
     * use for them. Such as a new connection that is still wating for approval of its new nickname. For this reason
     * they are two separate objects that track connections. One for all, and second for the 'subscribers' that are
     * approved and ready to receive updates of the game.</p>
     * @param {NetworkConnection} connection
     * @private
     */
    _addGameSubscriber(connection) {
        if (this.gameloop.started === false) {
            this.gameloop.start();
        }
        this.gameSubscribers.set(connection.id, connection);
    }

    /**
     * <p>Make the connection not received any broadcast messages.</p>
     * @param {NetworkConnection} connection
     * @private
     */
    _removeGameSubscriber(connection) {
        this.gameSubscribers.delete(connection.id);
        // console.log('removing subscriber', connection.id, this.gameSubscribers.delete(connection.id));
    }

    /**
     * <p>If a connection with the specified id was already present at one point of the currently running game round,
     * restore the connection by linking it with already existing {@link Player} object in the game, restoring the
     * score the user scored during his stay.</p>
     * @param {NetworkConnection} connection
     * @private
     */
    _restorePlayerObject(connection) {
        console.log('Restoring player object!');
        let player = this.game.restorePlayer(connection.id);
        connection.player = player;
        // Do not queue the message, send it instantly
        this._sendWelcomeMessage(connection, player);
    }

    /**
     * <p>If the id under whicht the connectio is joining is completely new to the current game round, create a new
     * {@link Player} object and link the Player and the NetworkConnection together.</p>
     * @param {NetworkConnection} connection
     * @private
     */
    _assignPlayerObject(connection) {
        console.log('Assigning new player object!');
        let player = this.game.addPlayer(connection.id, connection.id); // ID and nickname is the same for now...
        connection.player = player;
        this._sendWelcomeMessage(connection, player);
    }

    /**
     * <p>Send the initial 'welcome' message that contains necessary data for the game client to start operating</p>
     * @param {NetworkConnection} connection
     * @param {Player} player
     * @private
     */
    _sendWelcomeMessage(connection, player) {
        connection.socket.send(JSON.stringify(NetworkMessages.welcome.make(
            connection.id,
            player.color,
            this.game.roundTimeLeft() / 1000,
            this.game.map.walls,
            this.game.map.name
        )));
    }

    /**
     * @return {boolean} true if there is currently any active game subscribers
     */
    hasSubscribers() {
        return this.gameSubscribers.size > 0
    }
}