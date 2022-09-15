import {Entity, ETYPE} from "Game/prefabs/Entity";
import {Game} from "Game/Game";
import {PREFABS} from "Game/Prefabs";
import {TUNING} from "Root/TUNING";
import {W_Shotgun} from "Game/weapons/W_Shotgun";
import {Pickup} from "Game/prefabs/Pickup";
import {AvatarAmmoChanged} from "Game/eventSystem/events/AvatarEvents";

/**
 * Equips W_Shotgun or replenishes its ammo if picker already has the weapon.
 * @extends Pickup
 */
export class PickupShotgun extends Pickup {
    constructor() {
        super(24);
        this.image = 'shotgun';
    }

    onTouch(other) {
        if (other.code === PREFABS.AVATAR) {
            let weapon = other.components.shooter.weapon;
            if (weapon.code !== 'shotgun') {
                this.takePickup(other.entity);
                other.components.shooter.equipWeapon(new W_Shotgun());
            }
            else if (weapon.currentAmmo !== TUNING.SHOTGUN_CAPACITY) {
                this.takePickup(other.entity);
                let oldAmmo = weapon.currentAmmo;
                weapon.currentAmmo = TUNING.SHOTGUN_CAPACITY;
                Game.es.fireEvent(new AvatarAmmoChanged(other, weapon, TUNING.SHOTGUN_CAPACITY, TUNING.SHOTGUN_CAPACITY, oldAmmo));
            }
        }
    }
}

PickupShotgun.prototype.eType = ETYPE.PROJECTILE; // Due to the new physics system, this is a bit redundant, so recycle
// projectile
PickupShotgun.prototype.code = PREFABS.PICKUP_SHOTGUN = 'pickup_shotgun';