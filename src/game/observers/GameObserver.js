import {
    AvatarAmmoChanged,
    AvatarDied,
    AvatarHealthChange, AvatarScoredKill,
    ShotFired,
    WeaponEquipped
} from "Game/eventSystem/events/AvatarEvents";
import {NetworkMessages} from "Net/NetworkMessages";
import {
    GameRoundEnd,
    GameStart,
    PlayerDisconnected,
    PlayerJoined,
    PlayerRejoined
} from "Game/eventSystem/events/WorldEvents";
import {TUNING} from "Root/TUNING";

// We have to import this, even if we do not use it, in order to help PHPStorm quick doc function to direct us to
// the correct Game class. Perhaps there is some other native Game class?
import {Game} from "Game/Game";

/**
 * Class than hooks into {@link Game}'s event system and listens for all events that are relevant to clients. When such
 * event is triggered, it tells the {@link IStateDistributor} to relay this message to clients. Also sends cues to the
 * {@link IGameRunner} when the game round ends. The GameRunner instance can then use this cue to do all necessary steps
 * to restart itself.
 */
export class GameObserver {
    /**
     *
     * @param {Game} game
     * @param {IStateDistributor} stateDistributor
     * @param {IGameRunner} gameRunner
     */
    constructor(game, stateDistributor, gameRunner) {
        this.game = game;
        this.stateDistributor = stateDistributor;
        this.gameRunner = gameRunner;
    }

    startObserving() {
        this._attachGameListeners();
    }

    _attachGameListeners() {
        this.game.eventSystem.addListener(AvatarHealthChange.prototype.code,
            /**          * @param  {AvatarHealthChange} e             */
            (e) => {
                this.stateDistributor.queueUnicast(e.avatar.player.id, NetworkMessages.playerInfo.make(e.newHealth));
            });
        this.game.eventSystem.addListener(ShotFired.prototype.code,
            /**             * @param {ShotFired} e             */
            (e) => {
                this.stateDistributor.queueBroadcast(NetworkMessages.playSound.make(e.weapon.code + '_shot'));
                this.stateDistributor.queueUnicast(e.shooter.player.id, NetworkMessages.updateAmmo.make(e.weapon.getStatus()));
            });
        this.game.eventSystem.addListener(WeaponEquipped.prototype.code,
            (e) => {
                this.stateDistributor.queueUnicast(e.shooter.player.id, NetworkMessages.updateAmmo.make(e.weapon.getStatus()));
            });
        this.game.eventSystem.addListener(AvatarAmmoChanged.prototype.code,
            (e) => {
                this.stateDistributor.queueUnicast(e.shooter.player.id, NetworkMessages.updateAmmo.make(e.weapon.getStatus()));
            });

        this.game.eventSystem.addListener(GameRoundEnd.prototype.code, () => {
            console.log('Game ended!');
            this.stateDistributor.broadcast(NetworkMessages.gameRoundEnd.make(TUNING.GAME_ROUND_LINGER, this.game.getWinner()));
            setTimeout(() => {
                this.gameRunner.resetLoopAndGame();
                console.log('Game reset.');
                // If there is someone still connected, start the game right away, else the game will start
                // automatically once someone joins
                if (this.stateDistributor.hasSubscribers()) {
                    console.log('Game starting right away!');
                    this.gameRunner.start();
                }
            }, TUNING.GAME_ROUND_LINGER * 1000)
        });

        this.game.eventSystem.addListener(GameStart.prototype.code, () => {
            this.stateDistributor.broadcast(NetworkMessages.gameRoundStart.make(TUNING.GAME_ROUND_LENGTH));
            this.stateDistributor.queueBroadcast(NetworkMessages.scoreFullUpdate.make(this.game.getScoreData()));
            this.stateDistributor.queueBroadcast(NetworkMessages.map.make(this.game.map.walls, this.game.map.name));
        });

        this.game.eventSystem.addListener(PlayerJoined.prototype.code, (e) => {
            this.stateDistributor.queueBroadcast(NetworkMessages.scoreNewRow.make(e.player.id, [e.player.id, e.player.kills, e.player.deaths]));
        });
        this.game.eventSystem.addListener(PlayerDisconnected.prototype.code, (e) => {
            this.stateDistributor.queueBroadcast(NetworkMessages.scoreRemoveRow.make(e.player.id));
        });
        this.game.eventSystem.addListener(PlayerRejoined.prototype.code, (e) => {
            this.stateDistributor.queueBroadcast(NetworkMessages.scoreNewRow.make(e.player.id, [e.player.id, e.player.kills, e.player.deaths]));
        });
        this.game.eventSystem.addListener(AvatarDied.prototype.code, (e) => {
            this.stateDistributor.queueBroadcast(NetworkMessages.scoreUpdateRow.make(e.avatar.player.id, 2, e.avatar.player.deaths));
        });
        this.game.eventSystem.addListener(AvatarScoredKill.prototype.code, (e) => {
            this.stateDistributor.queueBroadcast(NetworkMessages.scoreUpdateRow.make(e.avatar.player.id, 1, e.avatar.player.kills));
        });
    }
}