import {Entity, ETYPE} from "Game/prefabs/Entity";
import {PickupSMG1} from "Game/prefabs/PickupSMG1";
import {PREFABS} from "Game/Prefabs";
import {PickupMedkit} from "Game/prefabs/PickupMedkit";
import {PickupShotgun} from "Game/prefabs/PickupShotgun";
import {Game} from "Game/Game";
import {PickupTaken} from "Game/eventSystem/events/WorldEvents";
import {TUNING} from "Root/TUNING";

/**
 * Special entity that periodically spawns pickups for player. Only one should exist in the game at any given time.
 * Spawns with less frequency as more pickups clutter the screen. Limits maximum amount of pickups at one time.
 */
export class PickupManager extends Entity {
    constructor() {
        super();
        this.pickups = 0;
        this.lastSpawn = 0;
        this.nextSpawn = 0;
        /**         * @type {ScheduleTask}         */
        this.lastSchedule = null;
        Game.es.addListener(PickupTaken.prototype.code, (e) => {
            this.pickups--;
            this.updatePickupSpawn();
        });
    }

    /**
     * Delay before next pickup spawn is based on currently active pickups. If a pickup gets taken, update the next
     * spawn time to not wait excessively long for next pickup spawn if many of them get picked in short time span.
     */
    updatePickupSpawn() {
        let newSpawnAt = this.pickNextSpawnDelay() + Game.now();
        if (newSpawnAt < this.nextSpawn) {
            this.lastSchedule.disable();
            this.nextSpawn = newSpawnAt;
            this.lastSchedule = Game.scheduler.queueTask(newSpawnAt, ()=>{
                this.spawnPickup()
            });
        }
    }

    /**
     * Spawn random pickup at random point in the map
     */
    spawnPickup() {
        if (this.pickups < TUNING.MAX_PICKUPS) {
            this.lastSpawn = Game.now();
            this.nextSpawn = Game.now() + this.pickNextSpawnDelay();
            let r = Math.random();
            let e = null;
            if (r < .33) {
                e = Game.inst.createEntity(new PickupSMG1())
            }
            else if (r < .66) {
                e = Game.inst.createEntity(new PickupShotgun())
            }
            else {
                e = Game.inst.createEntity(new PickupMedkit())
            }
            let sp = Game.map.getRandomSpawnPoint();
            e.x = sp[0];
            e.y = sp[1];

            if (this.lastSchedule) {
                // In case we are explicitly told from outside to spawn a pickup now, without disabling the possible
                // lastSchedule a double spawn later may occur
                this.lastSchedule.disable();
            }
            this.lastSchedule = Game.scheduler.queueTask(this.nextSpawn, () => {
                this.spawnPickup()
            });
            this.pickups++;
        }
        else {
            // Do nothing, wait until we should spawn a pickup again
        }
    }

    /**
     * @return {number} seconds till next spawn
     */
    pickNextSpawnDelay() {
        if (this.pickups > TUNING.PICKUP_SPAWN_RATE.length - 1) {
            return TUNING.PICKUP_SPAWN_RATE[TUNING.PICKUP_SPAWN_RATE.length - 1] * 1000
        }
        return TUNING.PICKUP_SPAWN_RATE[this.pickups] * 1000;
    }
}

PickupManager.prototype.eType = ETYPE.SPECIAL;
PickupManager.prototype.code = PREFABS.PICKUP_MANAGER = 'pickup_manager';