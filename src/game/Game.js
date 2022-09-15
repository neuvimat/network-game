import {Player} from "Game/models/Player";
import {Avatar} from "Game/prefabs/Avatar";
import * as RandomColorGiver from 'Game/../util/RandomColorGiver'
import {ArrayUtils} from "Root/util/ArrayUtils";
import {SnapshotStash} from "Game/renderer/SnapshotStash";
import {EventSystem} from "Game/eventSystem/EventSystem";
import Collisions from 'collisions'
import {Wall} from "Game/prefabs/Wall";
import {Scheduler} from "Game/scheduler/Scheduler"; //fixme: dont import this but pass it in constructor
import {Time} from "Root/util/Time";
import {PickupManager} from "Game/prefabs/PickupManager";
import {
    GameStart,
    GameRoundEnd,
    PlayerJoined,
    PlayerDisconnected,
    PlayerRejoined
} from "Game/eventSystem/events/WorldEvents";
import {Map} from "Game/map/Map";
import {PREFABS} from "Game/Prefabs";

/**
 * <p>The whole Game simulation is handled from here. Keep in mind that this class does not have a game loop within
 * itself. You need a separate game loop ({@link IGameRunner}) that will keep calling the 'do step' method. Also note that this class
 * is meant to have one instance only and that once an instance is made, it can be accessed via the static
 * <b>Game.inst</b> property shortcut. It did not start as singleton, but passing reference to the instance to every
 * other entity that might need access to it became cumbersome quickly. There are other static shortcuts tied to
 * Game.</p>
 * <p>Note: the 'start' method might not do what you would expect. It <b>only sets the game into its start state and
 * prepares some variables</b> but does not make it iterating in a loop. As stated above, you need a separate game loop
 * ({@link IGameRunner}) implementation for that.</p>
 */
export class Game {
    constructor(isMaster, startTime, tickrate) {
        if (Game.inst != null) {
            console.error('!!! Trying to setup a new Game instance even though one already exists !!!');
        }
        this.players = {}; // Each player is represented by an avatar, players PERSIST through rounds!
        this.objects = this._getCleanObjects();
        this.tickrate = tickrate;
        this.ticks = 0;
        this.snapshots = new SnapshotStash(20, 99999);
        this.elapsedTimePrecise = 0;
        this.elapsedTimeRegular = 0;
        this.startTime = startTime;
        Time.localStart = startTime; // If we access the time via the Time utility object, make sure it is updated

        this.eventSystem = new EventSystem();
        this.pSystem = new Collisions(); // Physics system, even tho it's more of a collision system rather than physics
        this.scheduler = new Scheduler(this);

        this.roundDuration = 0; // in seconds, initialized from 'start' method

        // DEPRECATED: used to do scheduled tasks at the end of a iteration. Initially used to handle entity deletions,
        // since then superseded by dedicated toDelete array and deleteEntity method and a whole new Scheduler class
        this.postFrameQueue = [];

        /**         * @type {Entity[]}         */
        this.toDelete = [];

        /**         * @type {Map}         */
        this.map = null;

        // Some singleton shortcuts
        Game.inst = this;
        Game.es = this.eventSystem;
        Game.pSystem = this.pSystem;
        Game.cResult = Game.pSystem.createResult();
        Game.scheduler = this.scheduler;
        Game.now = this.now.bind(this);
        Game.afterMs = this.afterMs.bind(this);
        Game.afterSec = this.afterSec.bind(this);
        /**         * @type {Map}         */
        Game.map = this.map;
    }

    /**
     * <p>Sort of a 'factory' method to get clean object structure utilized by the doStep method. It categorizes all
     * entities into its dedicated object groups for easier iterations. However some of its purpose was defeated (since
     * the introduction of third party collision system there is no longer a need for dedicated avatars and projectile
     * groups that were initially made to help collision checks only between relevant objects), it is still handy for
     * generating render snapshots and then on client reading the snapshot and drawing graphics on canvas.</p>
     * @return {{avatars: Array, walls: Array, projectiles: Array, specialLate: Array, specialEarly: Array, special:
     *     Array}}
     * @private
     */
    _getCleanObjects() {
        return {
            avatars: [], // Player controlled characters
            walls: [],
            projectiles: [],  // Basically all entities, but the name is a residue from previous design
            specialLate: [],  // Special entities that are to be processed each tick before anything else
            specialEarly: [], // Special entities that are to be processed each tick after everything else
            special: [], // Special entities that do not think every tick, but only when explicitly scheduled (told) to
        };
    }

    /**
     * Resets/cleans all the entities existing within the game simulation.
     * @see {@link _getCleanObjects}
     * @private
     */
    _resetObjects() {
        this.objects = this._getCleanObjects();
    }

    /**
     * <p>Create a new avatar for every player in the game. The main purpose is to create new avatars after a new round.
     * When new round starts, the game is completely wiped and restarted, however players still remain in the game,
     * but their avatars were wiped during the reset. This method solves that.</p>
     * @private
     */
    _respawnAvatars() {
        for (let p in this.players) {
            let avatar = this.createEntity(new Avatar(this.players[p]));
            let sp = Game.map.getRandomSpawnPoint();
            avatar.x = sp[0];
            avatar.y = sp[1];
            avatar.player = this.players[p];
            this.players[p].avatar = avatar;
            // trigger a health change event that will update the player's UI
            avatar.components.health.heal(1);
        }
    }

    /**
     * <p>Create a new player, spawn an avatar for him and return the Player object.</p>
     * @param {String} id as of now id and nick is the same
     * @param {String} nick as of now nick and id is the same
     * @return {Player} the newly created Player
     * @see {@link Player}
     */
    addPlayer(id, nick) {
        let player = new Player(id, nick); // ID is generated by the websocket, that creates new player after
                                           // establishing connection
        this.players[player.id] = player;
        player.color = RandomColorGiver.getRandomColor();

        let avatar = this.createEntity(new Avatar(player));
        let sp = Game.map.getRandomSpawnPoint();
        avatar.x = sp[0];
        avatar.y = sp[1];
        avatar.player = player;
        player.avatar = avatar;
        player.active = true;
        Game.es.fireEvent(new PlayerJoined(player));
        return player;
    }

    /**
     * <p>Similar to {@link _respawnAvatars}, however respawn avatar for only one player by the specified id. Returns
     * back the player object that had its avatar restored</p>
     * @param id
     * @return {Player} Player that has his avatar restored/respawned
     * @see {@link _respawnAvatars}
     * @see {@link addPlayer}
     * @see {@link Player}
     */
    restorePlayer(id) {
        let player = this.players[id];
        let avatar = this.createEntity(new Avatar(this));
        let sp = Game.map.getRandomSpawnPoint();
        avatar.x = sp[0];
        avatar.y = sp[1];
        avatar.player = player;
        player.avatar = avatar;
        player.active = true;
        Game.es.fireEvent(new PlayerRejoined(player));
        return player;
    }

    /**
     * <p><b>Removes only the player's avatar</b>, marks them as inactive and fires the appropriate event.
     * The {@link Player} object is still present in the game until the round ends. This is intentional as it allows
     * players to reconnect back into the game and keep their score.</p>
     * @param id id of a player who should be removed
     * @return {Player} Player who is has his avatar removed and was marked as inactive
     * @see {@link Player}
     */
    removePlayer(id) {
        let player = this.players[id];
        if (player.avatar.components.health.isAlive()) {
            player.avatar.components.health.died();
        }
        Game.inst.removeEntity(player.avatar);
        player.active = false;
        Game.es.fireEvent(new PlayerDisconnected(player));
        return player;
    }

    /**
     * <p>Truly removes all traces of all players that are marked as inactive.</p>
     * @see {@link Player}
     */
    wipeInactivePlayers() {
        for (let p in this.players) {
            if (this.players[p].active === false) {
                delete this.players[p];
            }
        }
    }

    /**
     * <p>Wipe and reset score of all players</p>
     * @see {@link Player}
     */
    resetPlayerScores() {
        for (let p in this.players) {
            this.players[p].kills = 0;
            this.players[p].deaths = 0;
        }
    }

    /**
     * <p>Set the game to its inital state, i.e. wipe everything.</p>
     */
    reset() {
        this.scheduler.clean(); // cleaN
        this.snapshots.clear(); // cleaR vs cleaN - a little inconsistent naming. Shame!
        this.eventSystem = new EventSystem();
        this.pSystem = new Collisions(); // Hopefully this also garbage collects all colliders and events and so forth
        Game.es = this.eventSystem;  // Update the shortcut
        Game.pSystem = this.pSystem; // Update the shortcut
        this._resetObjects();
        this.wipeInactivePlayers();
        this.resetPlayerScores();
    }

    /**
     * <p>Initialize the game and prepare its state to accommodate iterating through it.</p>
     * @param roundLengthSeconds
     * @param t time to consider as a starting time. Should be the same as the time the overarching game loop started
     * for maximum accuracy
     */
    start(roundLengthSeconds, t, mapName = 'first') {
        console.log('Playing on map "' + mapName + '"');
        this.map = Map.makeFromJSONFile(mapName);
        /**         * @type {Map}         */
        Game.map = this.map;
        this.startTime = t;
        Time.localStart = t; // If somewhere we access the start time via the utility Time object, make sure it is
                             // updated
        this.ticks = 0;
        this.elapsedTimePrecise = 0;
        this.elapsedTimeRegular = 0;
        this.roundDuration = roundLengthSeconds;

        console.log('Initializing game entities!');
        for (let w of this.map.walls) {
            this.createEntity(new Wall(0, 0, w))
        }
        let pm = this.createEntity(new PickupManager());
        pm.spawnPickup();
        console.log('Initializing schedules!');
        this.scheduler.queueTask(this.afterSec(roundLengthSeconds), () => {
            this.eventSystem.fireEvent(new GameRoundEnd());
        });

        console.log('Spawning avatars for lingering players.');
        this._respawnAvatars();
        this.eventSystem.fireEvent(new GameStart());

        console.log('Game started and event fired!');
    }

    /**
     * <p>Pass the game simulation once by the specified amount of time</p>
     * @param delta amount of time to pass within this step
     */
    doStep(delta) {
        this.scheduler.process(this.now());

        for (let p of this.objects.avatars) {
            p.update(delta);
        }
        for (let p of this.objects.projectiles) {
            p.update(delta);
        }

        for (let a of this.objects.avatars) {
            a.postUpdate();
            a.collision.repositionCollider(); // If the entity moved, make sure its physics body matches its new
            // position in the world
        }
        for (let p of this.objects.projectiles) {
            p.postUpdate();
            p.collision.repositionCollider(); // If the entity moved, make sure its physics body matches its new
            // position in the world
        }

        this.pSystem.update(); // Update the collision system as a whole
        for (let p of this.objects.avatars) {
            if (p.collision) {
                p.collision.update(); // Check for collisions, if it is detected, fire the callback specified in parent
                                      // entity of the collision
            }
        }
        for (let p of this.objects.projectiles) {
            if (p.collision) {
                p.collision.update(); // Check for collisions, if it is detected, fire the callback specified in parent
                                      // entity of the collision
            }
        }

        for (let f of this.postFrameQueue) {
            f();
        }
        this.postFrameQueue = [];
        this._deleteMarkedEntities();

        this.ticks++;
        // Should we just add delta each time, we suffer from additive
        // inaccuracy caused by floats, happens with 30 tickrate for example, 50 tickrate is fine
        this.elapsedTimePrecise = this.ticks * this.tickrate;
        this.elapsedTimeRegular += delta;
        this.makeRenderSnapshot();
    }

    /**
     * Actually remove the entities from the game.
     * @private
     */
    _deleteMarkedEntities() {
        for (let e of this.toDelete) {
            // Try to delete the entity from the array
            // It might have happened that the deletion was queued multiple times
            if (ArrayUtils.removeObject(this.objects[e.eType], e)) {
                // The entity can be deleted and already was removed from an array as a side effect of the if
                // Now run the cleanup code
                e.remove();
            }
        }
        this.toDelete = [];
    }

    /**
     * <p>Creates a render snapshot. It is <b>not an actual copy of the game state</b>, but an optimized version used by
     * clients to render the game state onto a canvas.</p>
     */
    makeRenderSnapshot() {
        let snapshot = {
            tick: this.ticks,
            time: this.now(),
            data: {
                avatars: {},
                projectiles: {},
            }
        };
        for (let a of this.objects.avatars) {
            if (!a.components.health.isAlive()) continue;
            snapshot.data.avatars[a.id] = {x: a.x, y: a.y, color: a.player.color, id: a.id};
        }
        for (let p of this.objects.projectiles) {
            if (p.image) {
                snapshot.data.projectiles[p.id] = {x: p.x, y: p.y, image: p.image};
            }
            else {
                snapshot.data.projectiles[p.id] = {x: p.x, y: p.y};
            }
        }
        this.snapshots.stashSnapshot(snapshot)
    }

    /**
     * @return {Snapshot}
     */
    getLatestRenderSnapshot() {
        return this.snapshots.getHead();
    }

    /**
     * <p>Creates a new entity. Since this method accepts already exiting entity that is created by the 'new' keyword,
     * you can think of this more like a 'registerEntity'.</p>
     * <p>Registers the entity to its proper object/entity group and initializes it.</p>
     * @param {Entity} entity
     * @return {Entity} the entity passed in
     */
    createEntity(entity) {
        this.objects[entity.eType].push(entity);
        entity.init();
        entity.initComponents();
        return entity;
    }

    /**
     * <p>Mark an entity for deletion. It will be deleted at the end of the current iteration.</p>
     * @param entity
     */
    removeEntity(entity) {
        this.toDelete.push(entity);
    }

    /**
     * Shorter alias for {@link timeNow}
     * @return {Number}
     */
    now() {
        return this.elapsedTimeRegular + this.startTime;
    }

    /**
     * @return {Number} current time as seen by the game simulation, i.e. at the time the current iteration started.
     * The number returned is similar to Date.now() in the meaning that it represents ms elapsed since 1970
     */
    timeNow() {
        return this.now();
    }

    /**
     * <p>Unlike {@link timeNow} returns time elapsed since the game started, rather the current time in ms since
     * 1970</p>
     * @return {Number}
     */
    timeElapsed() {
        return this.elapsedTimePrecise;
    }

    /**
     * @param delay in milliseconds
     * @return {Number} timestamp t that that is {@link now()} + delay
     */
    afterMs(delay) {
        return this.now() + delay;
    }

    /**
     * @param delay in seconds
     * @return {Number} timestamp t that that is {@link now()} + delay
     */
    afterSec(delay) {
        return this.now() + delay * 1000;
    }

    /**
     * @return {number} milliseconds left till the round should end
     */
    roundTimeLeft() {
        let tLeft = this.startTime + this.roundDuration * 1000 - Date.now();
        return tLeft > 0 ? tLeft : 0;
    }

    /**
     * <p>Get an array representing player scores</p>
     * @return {Array} somewhat compatible with client side {@link TableRenderer}
     */
    getScoreData() {
        let rows = [];
        for (let p in this.players) {
            let plr = this.players[p];
            if (plr.active) {
                rows.push([p, [plr.nick, plr.kills, plr.deaths]])
            }
        }
        return rows;
    }

    /**
     * @return {string} nickname of the player that currently has the most kills. If a tie occurs, the one with less
     * deaths wins. If it is still a tie, the one who joined in first wins.
     */
    getWinner() {
        let max = [-1, 'No one!', -1];// 0: kills 1: name, 2: deaths
        for (let p in this.players) {
            if (this.players[p].kills > max[0] || (this.players[p].kills === max[0] && this.players[p].deaths < max[2])) {
                max[0] = this.players[p].kills;
                max[1] = "'" + this.players[p].nick + "'";
                max[2] = this.players[p].deaths;
            }
        }
        return max[1];
    }
}