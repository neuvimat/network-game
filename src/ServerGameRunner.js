import {Game} from "Game/Game";
import {WebsocketServer} from "Net/WebsocketServer";
import {NetworkMessages} from "Net/NetworkMessages";
import {TUNING} from "Root/TUNING";
import {ArrayUtils} from "Root/util/ArrayUtils";
import {GameObserver} from "Game/observers/GameObserver";

const TICK_RATE = 1000 / 50;

/**
 * <p>Server entry point. This class contains a gameloop that orders a {@link Game} instance contained within to keep
 * iterating. Besides keeping the actual game simulation running it also observers the events fired by the game, such
 * as shot fired, health changes, ... and propagates them to all clients currently joined to the game. All the client
 * handling and game events forwarding is done via the enclosed {@link WebsocketServer} class.</p>
 * <p>Note: the Game does not contain a gameloop within itself. It's iteration needs to be managed from outside, such
 * as this class does. This allows to use the same Game instance on both Client and Server. Server and Client then have
 * their own implementations of gameloops. Such as fixed timestep for Server (present in this class) and variable for
 * Client.</p>
 * @see {@link Game}
 * @see {@link WebsocketServer}
 * @implements IGameRunner
 */
export class ServerGameRunner {
    constructor(server) {
        let t = Date.now();
        this.game = new Game(true, t, TICK_RATE); // The simulation itself
        this.websocketServer = new WebsocketServer(server, this.game, this); // Server handling websocket
        this.gameObserver = new GameObserver(this.game, this.websocketServer, this); // this observers the game's state and pushes notifications to clients

        this.ticks = 0;
        this.lastIteration = t;
        this.cumulativeDelta = 0;
        this.shouldStop = true;
        this.started = false;
        this.timeoutIter = null; // Keep track of the setTimeout object, so we can cancel it immediately if we need to pause the game
        this.round = 0;
        this.mapRotation = ['vietcong', 'shack', 'mountainSide', 'grasslands', 'claustrophobia', 'industrial', 'stage'];
        this.lastMap = null;

        this.boundIterate = this._iterateGame.bind(this);
    }

    /**
     * Start the gameloop if it is not already running.
     */
    start() {
        if (this.started === false) {
            let t = Date.now();
            this.lastIteration = t;
            console.log('Starting game round ', ++this.round);
            this.shouldStop = false;
            this.started = true;

            this.gameObserver.startObserving(); // This hooks into game eventSystem, which is reset every round
            this.game.start(TUNING.GAME_ROUND_LENGTH, t, this._getRandomMapName());
            this.timeoutIter = setTimeout(this.boundIterate, TICK_RATE);
        }
        else {
            console.error('Trying to start ServerGameloop, but the gameloop is already started! Did you mean to resume() it instead?');
        }
    }

    /**
     * Resume the gameloop if it is in paused state.
     */
    resume() {
        if (this.started === false) {
            console.error('You are trying to resume a Gameloop which did not even start yet!');
        }
        else if (this.shouldStop === false) {
            console.error('Gameloop is running, no need to resume!');
        }
        else {
            this.shouldStop = false;
            this.lastIteration = Date.now(); // Do this otherwise the game loop would try to catch up
            this.boundIterate();
        }
    }

    /**
     * Pause the gameloop if it is in running state.
     */
    pause() {
        if (this.started === true) {
            console.warn('You are pausing the Gameloop. This is as of yet not completely supported and may cause unfortunate timing errors, but these should only be minor.');
            this.shouldStop = true;
            clearTimeout(this.timeoutIter);
        }
        else if (this.shouldStop === true) {
            console.error('Gameloop is already paused!');
        }
        else {
            console.error('You are trying to pause a Gameloop which did not even start yet!');
        }
    }

    /**
     * Resets the gameloop and the Game managed by the gameloop.
     */
    resetLoopAndGame() {
        this.shouldStop = true;
        this.started = false;
        clearTimeout(this.timeoutIter);
        this.game.reset();
    }

    /**
     * <p>The actual method that loops itself to keep the game running.</p>
     * <p>The loop utilizes fixed time step that catches up if it starts falling behind.</p>
     * @private
     */
    _iterateGame() {
        let now = Date.now();
        this.cumulativeDelta += now - this.lastIteration;
        this.lastIteration = now;

        if (this.cumulativeDelta >= TICK_RATE) {
            // In case we fell behind for some reason, try to catch up
            while (this.cumulativeDelta >= TICK_RATE) {
                this.ticks++;
                this.game.doStep(TICK_RATE); // doStep automatically creates snapshot of the newest state
                this.cumulativeDelta -= TICK_RATE;

                let snapshot = this.game.getLatestRenderSnapshot(); // latest snapshot created within doStep
                this.websocketServer.queueBroadcast(NetworkMessages.snapshot.make(snapshot));
                this.websocketServer.transmitQueue();
            }
        }

        if (!this.shouldStop) {
            this.timeoutIter = setTimeout(this.boundIterate, TICK_RATE - this.cumulativeDelta);
        }
    }

    /**
     * <p>Get a random name from the pool. If possible, never chooses the same map name twice in a row. Also saves
     * the name of the selected map name for later use.</p>
     * @return {*} random map name from the pool
     * @private
     */
    _getRandomMapName() {
        let arr;
        if (this.lastMap && this.mapRotation.length > 1) {
            arr = this.mapRotation.slice();
            ArrayUtils.removeObject(arr, this.lastMap);
        }
        else {
            arr = this.mapRotation;
        }
        this.lastMap =  ArrayUtils.randomValue(arr);
        return this.lastMap;
    }
}