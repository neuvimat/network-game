import {Entity, ETYPE} from "Game/prefabs/Entity";
import {Game} from "Game/Game";
import {PREFABS} from "Game/Prefabs";
import {TUNING} from "Root/TUNING";
import {W_SMG} from "Game/weapons/W_SMG";
import {Pickup} from "Game/prefabs/Pickup";
import {AvatarAmmoChanged} from "Game/eventSystem/events/AvatarEvents";

/**
 * Equips W_SMG1 or replenishes its ammo if picker already has the weapon.
 * @extends Pickup
 */
export class PickupSMG1 extends Pickup {
    constructor() {
        super(24);
        this.image = 'smg1';
    }

    onTouch(other) {
        if (other.code === PREFABS.AVATAR) {
            let weapon = other.components.shooter.weapon;
            if (weapon.code !== 'smg1') {
                this.takePickup(other.entity);
                other.components.shooter.equipWeapon(new W_SMG());
            }
            else if (weapon.currentAmmo !== TUNING.SMG1_CAPACITY) {
                this.takePickup(other.entity);
                weapon.currentAmmo = TUNING.SMG1_CAPACITY;
                let oldAmmo = weapon.currentAmmo;
                Game.es.fireEvent(new AvatarAmmoChanged(other, weapon, TUNING.SMG1_CAPACITY, TUNING.SMG1_CAPACITY, oldAmmo));
            }
        }
    }
}

PickupSMG1.prototype.eType = ETYPE.PROJECTILE; // Due to the new physics system, this is a bit redundant, so recycle
                                                 // projectile
PickupSMG1.prototype.code = PREFABS.PICKUP_SMG1 = 'pickup_smg1';