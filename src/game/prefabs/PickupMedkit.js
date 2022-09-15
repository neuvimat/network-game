import {Entity, ETYPE} from "Game/prefabs/Entity";
import {Game} from "Game/Game";
import {PREFABS} from "Game/Prefabs";
import {TUNING} from "Root/TUNING";
import {PickupTaken} from "Game/eventSystem/events/WorldEvents";
import {Pickup} from "Game/prefabs/Pickup";

/**
 * Healing pickup.
 * @extends Pickup
 */
export class PickupMedkit extends Pickup {
    constructor() {
        super(24);
        this.image = 'medkit';
    }

    onTouch(other) {
        if (other.code === PREFABS.AVATAR) {
            if (other.components.health.isInjured()) {
                this.takePickup(other.entity);
                other.components.health.heal(TUNING.MEDKIT_HEAL);
            }
        }
    }
}

PickupMedkit.prototype.eType = ETYPE.PROJECTILE; // Due to the new physics system, this is a bit redundant, so recycle
                                                 // projectile
PickupMedkit.prototype.code = PREFABS.PICKUP_MEDKIT = 'pickup_medkit';