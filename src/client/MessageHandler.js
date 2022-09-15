import {Logger, LoggerSeverity, LoggerTags} from "Root/util/Logger";
import {Snapshot} from "Game/renderer/Snapshot";
import {HTMLInputMapper, IDs} from "Root/util/HTMLInputMapper";
import {Time} from "Root/util/Time";
import {SoundSystem} from "Client/sounds/SoundSystem";
import {NetworkMessages} from "Net/NetworkMessages";
import {STATES} from "Client/states/StateManager";

/**
 * Client side message handler. Handles incoming messages and reacts to them by altering the {@link GameState} that is
 * attached to it. This is specific implementation to supplement the {@link GameState}. The main purpose of this class
 * is to reduce clutter in websocket.on('message') inside the GameState.
 */
export class MessageHandler {
    /**
     * @param {GameState} gameState
     */
    constructor(gameState) {
        this.gameState = gameState;
    }

    /**
     * Handle a message. Logs and error if the message type is unknown.
     * @param {NetworkMessage} msg - JavaScript object, not JSON string
     * @see {@link NetworkMessage}
     */
    handleMessage(msg) {
        if (msg.type) {
            Logger.logO('Message ' + "'" + msg.type + "'" + ' from server received! ' + msg.payload, {tag: LoggerTags.NETWORK});
            switch (msg.type) {
                case NetworkMessages.bundle.code:
                    for (let m of msg.payload) {
                        this.handleMessage(m);
                    }
                    break;
                case NetworkMessages.snapshot.code:
                    this.gameState.snapshotStash.stashSnapshot(Snapshot.fromPlainObject(msg.payload));
                    Logger.log('Received tick: ' + msg.payload.tick, LoggerSeverity.INFO, LoggerTags.SNAPSHOTS, 5);
                    break;
                case NetworkMessages.pong.code:
                    let t = Date.now();
                    let latency = t - this.gameState.pingSentAt;
                    let serverTime = msg.payload;
                    let serverTimeWLatency = serverTime + latency / 2;
                    let difference = t - serverTimeWLatency;
                    Time.serverDelta = difference;

                    HTMLInputMapper.set(IDs.ServerTimeDifference, difference);
                    HTMLInputMapper.set(IDs.Ping, latency);
                    break;
                case NetworkMessages.welcome.code:
                    this.gameState.startGame(msg);
                    break;
                case NetworkMessages.playSound.code:
                    SoundSystem.play(msg.payload.sound);
                    break;
                case NetworkMessages.playerInfo.code:
                    if (msg.payload.health !== undefined) {
                        this.gameState.e.health.style.width = msg.payload.health + '%';
                    }
                    break;
                case NetworkMessages.epilepsy.code:
                    this.gameState.epilepsy();
                    break;
                // shotFired is currently unused as it was replaced via playSound (which basically was all it did)
                // it can make a comeback if client will react somehow else than just playing a sound
                case NetworkMessages.shotFired.code:
                    SoundSystem.play(msg.payload.weaponCode + '_shot');
                    break;
                case NetworkMessages.gameRoundStart.code:
                    this.gameState.onRoundStart();
                    this.gameState.roundEnd = Date.now() + msg.payload.duration * 1000;
                    break;
                case NetworkMessages.gameRoundEnd.code:
                    this.gameState.startCountdown(Date.now(), msg.payload.nextRoundInSeconds, msg.payload.winner);
                    break;
                case NetworkMessages.sessionEnd.code:
                    alert(msg.payload.msg);
                    this.gameState.stateManager.requestStateChange(STATES.MENU_STATE);
                    break;
                case NetworkMessages.scoreNewRow.code:
                    this.gameState.tableRenderer.addDataRow(msg.payload.rowId, msg.payload.row);
                    break;
                case NetworkMessages.scoreRemoveRow.code:
                    this.gameState.tableRenderer.removeDataRow(msg.payload.rowId);
                    break;
                case NetworkMessages.scoreUpdateRow.code:
                    this.gameState.tableRenderer.updateDataRow(msg.payload.rowId, msg.payload.dataIndex, msg.payload.value);
                    break;
                case NetworkMessages.scoreFullUpdate.code:
                    for (let r of msg.payload.rows) {
                        this.gameState.tableRenderer.addDataRow(r[0], r[1]);
                    }
                    break;
                case NetworkMessages.consoleMsg.code:
                    switch (msg.payload.lvl) {
                        case 0:
                            console.log(msg.payload.msg);
                            break;
                        case 1:
                            console.warn(msg.payload.msg);
                            break;
                        case 2:
                            console.error(msg.payload.msg);
                            break;
                        default:
                            console.error('Server send incorrect level for consoleMsg message! Facepalm. Here is the message as an error.');
                            console.error(msg.payload.msg);
                            break;
                    }
                    break;
                case NetworkMessages.updateAmmo.code:
                    HTMLInputMapper.set(IDs.Weapon, msg.payload.msg);
                    break;
                case NetworkMessages.map.code:
                    this.gameState.renderer.walls = msg.payload.walls;
                    this.gameState.renderer._drawStatic();
                    HTMLInputMapper.set(IDs.MapName, msg.payload.mapName);
                    break;
                default:
                    Logger.log('Unexpected message type received in MessageHandler! (' + msg.type + ')', LoggerSeverity.ERROR, LoggerTags.NETWORK, 0);
                    /// #if DEBUG
                    console.error('Unexpected message type received in MessageHandler!', msg.type, ')');
                    /// #endif
            }
        }
    }
}