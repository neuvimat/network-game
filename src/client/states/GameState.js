import {_GeneralState} from "Client/states/_GeneralState";
import {STATES} from "Client/states/StateManager";
import {ClientFakeLagSocket} from "Net/ClientFakeLagSocket";
import {HTMLInputMapper, IDs} from "Util/HTMLInputMapper";
import {Time} from "Root/util/Time";
import {MessageHandler} from "Client/MessageHandler";
import {GameRenderer} from "Game/renderer/GameRenderer";
import {SnapshotStrategy} from "Game/renderer/strategies/SnapshotStrategy";
import {ExtrapolationStrategy} from "Game/renderer/strategies/ExtrapolationStrategy";
import {InterpolationStrategy} from "Game/renderer/strategies/InterpolationStrategy";
import {SnapshotStash} from "Game/renderer/SnapshotStash";
import {MathUtils} from "Root/util/MathUtils";
import {TableRenderer} from "Root/util/TableRenderer";
import {Scheduler} from "Game/scheduler/Scheduler";
import {NetworkMessages} from "Net/NetworkMessages";
import {SoundSystem} from "Client/sounds/SoundSystem";
import {BrowserUtils} from "Root/util/BrowserUtils";
import {LocalInputForwarder} from "Client/input/forwarders/LocalInputForwarder";
import {WebsocketInputForwarder} from "Client/input/forwarders/WebsocketInputForwarder";
import {Game} from "Game/Game";
import {TUNING} from "Root/TUNING";
import {RPCHandler} from "RPC/RPCHandler";
import {GameObserver} from "Game/observers/GameObserver";
import {LocalStateDistributor} from "Client/LocalStateDistributor";

const DESIRED_TIMESTEP_MS = 1000 / 60; // 60 fps

// Not used in the end, a regular simple requestAnimationFrame does the job solidly
const ALLOWED_TIMESTEP_DELAY = 5 * DESIRED_TIMESTEP_MS;
const MAX_ALLOWED_TIMESTEP_DELAY = 10 * DESIRED_TIMESTEP_MS;

const tableHeaders = ['Name', 'Kills', 'Deaths'];

function tableComparator(a, b) {
    return b[1] - a[1];
}

/**
 * Client side state that handles all the necessary things to render the game state sent by the server. The state
 * handles the renderer, state manipulation and storage, communication via websocket (with a little help from
 * {@link MessageHandler}) and sending client's input to the server.
 * @extends {_GeneralState}
 * @implements IGameRunner
 */
export class GameState extends _GeneralState {
    constructor(stateManager, inputManager) {
        super(stateManager, STATES.GAME_STATE);
        this.stateManager = stateManager;
        this.renderer = null; // null, because it get later init during later setup
        this.inputManager = inputManager;
        this.snapshotStash = null; // null, because it gets new instance every round
        this.ws = null; // websocket instance used for online play

        this.isLocal = false; // Gets set from state manager
        this.game = null; // Used only for local play
        this.rpcHandler = null // Used only for local play
        this.gameObserver = null;
        this.lastIteration = 0

        this.playerId = null; // gets populated once connection to game is made
        this.playerColor = null; // gets populated once connection to game is made

        this.alertWebsocketOnClose = true; // Unless we do not expect to, alert when connection is closed

        this._catchUp = false; // In the end unused
        // Iterate function that has 'this' bound to it so we can use it as callback
        // Different method is bound for local and online play
        this._boundIterate = null;
        this.stop = false; // Stop (don't queue next) game loop iteration (requestAnimationFrame)

        this.messageHandler = new MessageHandler(this); // Handles all incoming messages from server
        this.tableRenderer = null; // new instance every round
        this.scheduler = new Scheduler();

        // game UI stuff, could be contained within its own class
        this.roundEnd = 0; // Timestamp for when round should end, used to show round countdown at the top

        this.e = {
            wrapper: undefined,
            status: undefined,
            mapName: undefined,
            ping: undefined,
            serverDelta: undefined,
            health: undefined,
            fakeLagPingGame: undefined,
            countdown: undefined,
            scoreboard: undefined,
            scoreboardContent: undefined,
            banner: undefined,
            weapon: undefined,
            menu: undefined,
            menuPing: undefined,
            menuExit: undefined,
        };

        this.pingSentAt = 0; // Timestamp of last ping message

        // top secret methods
        // todo: use the abstract input forwarder to send messages, will crash the game in local play
        window.epilepsy = () => {
            this.ws.send(JSON.stringify(NetworkMessages.epilepsy.make()));
        };
        window.admin = (secret) => {
            this.ws.send(JSON.stringify(NetworkMessages.adminify.make(secret)));
        };
        window.hax = (id, data, value) => {
            if (id === -1) id = this.playerId; // enter -1 as player id to target self
            this.ws.send(JSON.stringify(NetworkMessages.forceScoreboardUpdate.make(id, data, value)));
        };
        window.tune = (key, value) => {
            this.ws.send(JSON.stringify(NetworkMessages.forceTuningChange.make(key, value)));
        };
        window.tuneX = (arr) => {
            this.ws.send(JSON.stringify(NetworkMessages.forceTuningArrayChanges.make(arr)));
        };
    }

    init() {
        window.addEventListener('load', () => {
            this.e.wrapper = document.getElementById('game');
            this.e.mapName = document.getElementById('map');
            this.e.status = document.getElementById('status');
            this.e.ping = document.getElementById('ping');
            this.e.serverDelta = document.getElementById('serverDelta');
            this.e.health = document.getElementById('health-bar');
            this.e.fakeLagPingGame = document.getElementById('fakeLagPingGame');
            this.e.countdown = document.getElementById('countdown-time');
            this.e.scoreboard = document.querySelector('#scoreboard');
            this.e.scoreboardContent = document.querySelector('#scoreboard-content');
            this.e.banner = document.getElementById('banner');
            this.e.weapon = document.getElementById('weapon');
            this.e.menu = document.getElementById('escMenu');
            this.e.menuPing = document.getElementById('escMenu-ping');
            this.e.menuExit = document.getElementById('escMenu-exit'); // Exit the game back to main menu
            this.e.menuClose = document.getElementById('escMenu-close'); // Just close the menu

            this.e.menuExit.addEventListener('click', () => {
                if (this.isLocal) {
                    this.stateManager.requestStateChange(STATES.MENU_STATE);
                }
                else {
                    // There is a hook on ws.onclose that will request a state change. Since we expect the websocket
                    // to close, temporarily disable onClose warning
                    this.alertWebsocketOnClose = false;
                    this.ws.close();
                }
            });
            this.e.menuPing.addEventListener('click', () => {
                if (this.e.status.hasAttribute('hidden')) {
                    this.e.status.removeAttribute('hidden');
                    this.e.menuPing.innerText = "Hide status";
                }
                else {
                    this.e.status.setAttribute('hidden', '');
                    this.e.menuPing.innerText = "Show status";
                }
            });
            this.e.menuClose.addEventListener('click', () => {
                this._hide(this.e.menu);
            });

            HTMLInputMapper.mapInputToValue(this.e.fakeLagPingGame, IDs.FakeLagPing, 50);
            HTMLInputMapper.listenForValue(IDs.PlayerHealth, (val) => {
                this.e.health.innerHTML = val + '%';
            });
            HTMLInputMapper.listenForValue(IDs.Weapon, (val) => {
                this.e.weapon.innerHTML = val;
            });
            HTMLInputMapper.listenForValue(IDs.Ping, (val) => {
                this.e.ping.innerText = "Latency: " + val + 'ms';
            });
            HTMLInputMapper.listenForValue(IDs.ServerTimeDifference, (val) => {
                this.e.serverDelta.innerText = "Server delta: " + val + 'ms';
            });
            HTMLInputMapper.listenForValue(IDs.MapName, (val) => {
                this.e.mapName.innerText = "Map: " + val;
            });
        });
    }

    /**
     * Simple round start preparation and resets. Mostly resets game UI elements
     */
    onRoundStart() {
        this.tableRenderer = new TableRenderer(tableHeaders, tableComparator);
        this.scheduler = new Scheduler();
        this.e.scoreboardContent.innerHTML = '';
        this.e.banner.innerHTML = '';
        this.tableRenderer.assumeNode(this.e.scoreboardContent);
    }

    localIterateGame() {
        let now = Date.now();
        let delta = now - this.lastIteration;
        while (delta > 0) {
            let time = delta > 50 ? 50 : delta;
            this.game.doStep(time);
            delta -= 50;
        }
        this.lastIteration = now;

        let snapshot = this.game.getLatestRenderSnapshot(); // latest snapshot created within doStep
        this.messageHandler.handleMessage(NetworkMessages.snapshot.make(snapshot));

        if (!this._catchUp) {
            this.renderer.render(); // Renderer handles the canvas
            this.UIUpdate(); // this Game state handles the UI, not the renderer (that handles only the canvas)
        }

        // Always process scheduler, no matter if we have to catch up
        this.scheduler.process(Date.now());

        if (!this.stop) {
            requestAnimationFrame(this._boundIterate);
        }
    }

    networkIterateGame(delta) {
        this.renderer.render(); // Renderer handles the canvas
        this.UIUpdate(); // this Game state handles the UI, not the renderer (that handles only the canvas)

        // Always process scheduler, no matter if we have to catch up
        this.scheduler.process(Date.now());

        if (this.pingSentAt + 2000 < Date.now()) {
            /// #if DEBUG
            console.log('Sending ping');
            /// #endif
            this.pingSentAt = Date.now();
            this.ws.send(JSON.stringify(NetworkMessages.ping.make()));
        }
        if (!this.stop) {
            requestAnimationFrame(this._boundIterate);
        }
    }

    _localEnterState() {
        this.game = new Game();
        this.onRoundStart(); // In online, this gets automatically triggered once connection in ws is established

        // Hide some UI that is not relevant to local play
        this.e.fakeLagPingGame.setAttribute('hidden', ''); // No fake lag in local
        this.e.ping.setAttribute('hidden', ''); // No ping in local
        this.e.serverDelta.setAttribute('hidden', ''); // No server delta in local

        // Start the game, after it starts, it can create new players
        this.game.start(TUNING.GAME_ROUND_LENGTH, Date.now(), null); // start the game
        // Create an RPC handler for the game
        this.rpcHandler = new RPCHandler(this.game);

        // Listen to game changes and UI and do according actions in response to game changes
        this.gameObserver = new GameObserver(this.game, new LocalStateDistributor(this.messageHandler), this);
        this.gameObserver.startObserving();

        // Create our local player
        let localPlayer = this.game.addPlayer('Local player', 'Local player');
        // Create a new input forwarder for local communication. Commands inside inputState will use the forwarder
        // to send commands. The forwarder sends the messages directly to the game
        this.inputManager._inputForwarder = new LocalInputForwarder(this.rpcHandler, localPlayer);

        this._boundIterate = this.localIterateGame.bind(this); // setup the local bound iterate
        this.lastIteration = Date.now(); // Unlike for networkIterateGame, in localIterateGame, we have to track time

        // In online play, a 'welcome' message will be received from server during the connection initialization.
        // The message will be generated inside a webSocketServer. Since in local play nothing like this exists,
        // nudge the message handler into starting the game with a fake message
        this.messageHandler.handleMessage(NetworkMessages.welcome.make("Local player", 'red',
            TUNING.GAME_ROUND_LENGTH, TUNING.SAMPLE_WALLS, 'local default map'));
    }

    _networkEnterState() {
        this._boundIterate = this.networkIterateGame.bind(this);
        let url = document.getElementById('wsUrl').value; // Could be refactored to use HTMLInputMapper...

        // Show some relevant UI elements for online play that might be hidden from local play
        this.e.fakeLagPingGame.removeAttribute('hidden'); // No fake lag in local
        this.e.ping.removeAttribute('hidden'); // No ping in local
        this.e.serverDelta.removeAttribute('hidden'); // No server delta in local

        // Perhaps the code below centered around websocket could be inside its own class?
        // Get fake lag socket or regular socket depending on user choice
        if (HTMLInputMapper.get(IDs.FakeLagEnabled)) {
            this.e.fakeLagPingGame.removeAttribute('hidden');
            this.ws = new ClientFakeLagSocket(url, HTMLInputMapper.get(IDs.FakeLagPing));
            HTMLInputMapper.listenForValue(IDs.FakeLagPing, (val) => {
                this.ws.setLag(val)
            })
        }
        else {
            // Hide the fake input lag value setter if we use regular delay
            this.e.fakeLagPingGame.setAttribute('hidden', '');
            this.ws = new WebSocket(url);
        }
        // Hide the game menu (could be left open if the game was exited via the menu)

        this.ws.onmessage = (message) => {
            let data;
            /// #if DEBUG
            try {
                data = JSON.parse(message.data);
                this.messageHandler.handleMessage(data);
            } catch (e) {
                console.error('An error occurred when paring a JSON message! Message was:');
                console.error(message);
                console.log(e);
            }
            /// #else
            // We expect no errors on production build, kappa
            data = JSON.parse(message.data);
            this.messageHandler.handleMessage(data);
            /// #endif
        };
        this.ws.onopen = () => {
            this.onRoundStart(); // Prepare the UI
            this.ws.send(JSON.stringify(NetworkMessages.joinRequest.make(HTMLInputMapper.get(IDs.Nickname))));
        };
        this.ws.onclose = () => {
            if (this.alertWebsocketOnClose) {
                alert('Host has closed off the connection.');
                this.alertWebsocketOnClose = true;
            }
            this.stateManager.requestStateChange(STATES.MENU_STATE);
        };
        this.ws.onerror = () => {
            alert('Connection to host has been terminated!');
            this.stateManager.requestStateChange(STATES.MENU_STATE);
        };

        // Create a new input forwarder for network communication. Commands inside inputState will use the forwarder
        // to send commands. The forwarder JSONifies the commands and sends them to a server via websocket
        this.inputManager._inputForwarder = new WebsocketInputForwarder(this.ws);
        // The game will start itself once a message is received from server and handled inside messageHandler
    }

    /**
     * Do some extensive preparations and setup
     * @param prevState
     */
    enterState(prevState) {
        // Shared for both
        this._hide(this.e.menu);

        // Once the game starts from the methods below, make sure it does not stop instantly
        this.stop = false;
        // 'Platform' specific
        if (this.isLocal) {
            this._localEnterState();
        }
        else {
            this._networkEnterState();
        }
    }

    exitState(newState) {
        // Cleanup if we had local play
        if (this.isLocal) {
            this.game = null;
            this.rpcHandler = null;
            this.gameObserver = null;
        }
        // Stop current loop (whether it is just rendering if network, or handling its own game instance if local)
        this.stop = true;

        BrowserUtils.cancelFullscreen();
        this._hide(this.e.wrapper);
    }

    canChangeState() {
        return true;
    }

    /**
     * <p>Start the game. Gets called from message handler after it receives the 'welcome' message.</p>
     * <p>Prepares some variables based on welcome message.</p>
     * @param {NetworkMessage} data - data from which to set up the game
     */
    startGame(data) {
        if (HTMLInputMapper.get(IDs.Fullscreen)) {
            BrowserUtils.fullscreenDocument();
        }

        HTMLInputMapper.set(IDs.MapName, data.payload.mapName); // Set the map name initially here, later it gets
                                                                // changed by a 'roundStart' message
        this.playerId = data.payload.id;
        this.playercolor = data.payload.color;
        this.roundEnd = Date.now() + data.payload.duration * 1000;
        this.snapshotStash = new SnapshotStash();
        this._initRenderer(data.payload.walls);
        this._show(this.e.wrapper);
        Time.localStart = Date.now();

        requestAnimationFrame(this._boundIterate);
    }

    /**
     * Prepare the renderer and pass in {@link IRenderStrategy} as request by the user in menu screen.
     * @param {array} walls
     * @private
     */
    _initRenderer(walls) {
        let inputStrategy = HTMLInputMapper.get(IDs.RenderStrategy);
        let strategy = null;

        switch (inputStrategy) {
            case 'snapshot':
                strategy = new SnapshotStrategy(this.snapshotStash);
                break;
            case 'extrapolation':
                strategy = new ExtrapolationStrategy(this.snapshotStash);
                break;
            case 'interpolation':
                strategy = new InterpolationStrategy(this.snapshotStash, 100);
                break;
            default:
                strategy = new SnapshotStrategy(this.snapshotStash);
                console.error('Unknown render strategy chosen! Falling back to snapshot strategy! PS: once Logger is sorted, log there');
        }
        this.renderer = new GameRenderer(this.snapshotStash, strategy);
        this.renderer._setup(walls);
        this.renderer.renderStrategy.configureSnapshotStash();
    }

    /**
     * Epilepsy warning.
     */
    epilepsy() {
        this.renderer.bulletColor = 'black';
        SoundSystem.play('music');
        let colors = ['red', 'pink', 'yellow', 'lime', 'blue'];
        setInterval(() => {
            this.renderer._canvasBack.style.backgroundColor = colors[MathUtils.randomInt(0, colors.length)];
        }, 15)
    }

    showScoreboard(show) {
        if (show) {
            this.e.scoreboard.removeAttribute('hidden');
        }
        else {
            this.e.scoreboard.setAttribute('hidden', '');
        }
    }

    /**
     * Effectively only updates the round countdown. Other UI updates, such as health bar UI, are handled in response
     * to events (messages) from the server and handled from inside {@link MessageHandler}
     * @constructor
     */
    UIUpdate() {
        let timeLeft = this.roundEnd - Date.now();
        let str = '00:00';
        if (timeLeft > 0) {
            str = ('' + Math.floor(timeLeft / 60000)).padStart(2, '0') + ':' + ('' + Math.floor((timeLeft % 60000) / 1000)).padStart(2, '0');
        }
        this.e.countdown.innerHTML = str;
    }

    /**
     * Show the countdown until new round starts. Utilizes the banner.
     * @see {@link setBannerText}
     * @param {number} time pass Date.now() when calling this from the outside pls
     * @param {number} secondsLeft
     * @param {string} winner
     */
    startCountdown(time, secondsLeft, winner) {
        if (secondsLeft >= 0) {
            this.setBannerText('Next round in ' + secondsLeft-- + ' seconds!<br>Btw winner is ' + winner);
            this.scheduler.queueTask(time + 1000, (time) => {
                this.startCountdown(time, secondsLeft, winner);
            })
        }
    }

    /**
     * Set the banner text. Banner is a stripe shown over the game screen.
     * @param {string} text
     */
    setBannerText(text) {
        this.e.banner.innerHTML = text;
    }

    /**
     * Show/hide the game menu
     */
    toggleMenu() {
        this._toggle(this.e.menu);
    }

    /**
     * Implemented method from {@link IGameRunner#resetLoopAndGame}. Just resets the Game.
     */
    resetLoopAndGame() {
        this.game.reset();
    }

    /**
     * Implemented method from {@link IGameRunner#start}. Just starts the Game.
     */
    start() {
        this.gameObserver.startObserving(); // This hooks into game eventSystem, which is reset every round
        this.game.start(TUNING.GAME_ROUND_LENGTH, Date.now(), 'Does not matter, because client cannot handle maps and will always get a default dummy one.');
    }
}