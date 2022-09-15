import {Bullet} from "Game/prefabs/Bullet";
import {ShotFired} from "Game/eventSystem/events/AvatarEvents";
import {Game} from "Game/Game";
import {TUNING} from "Root/TUNING";
import {Weapon} from "Game/weapons/Weapon";
import {W_Pistol} from "Game/weapons/W_Pistol";

/**
 * <p>Rapid firing submachine gun with low spread and limited ammo.</p>
 * <p>When depleted, auto equips {@link W_Pistol}</p>
 * @extends Weapon
 */
export class W_SMG extends Weapon {
    constructor() {
        super();
        this.isFiring = false;
        this.lastAttack = 0;
        this.lastReload = 0; // unused because reloading is currently disabled in favor of restocking ammo by pickups
        this.currentAmmo = TUNING.SMG1_CAPACITY;
    }

    pullTrigger() {
        this.isFiring = true;
    }

    releaseTrigger() {
        this.isFiring = false;
    }

    think() {
        if (this.isFiring) {
            if (this.canShoot()) {
                this.currentAmmo--;
                this.lastAttack = Game.now();
                this.shoot();
                // Automatically drop the weapon if out of ammo
                if (this.currentAmmo === 0) {
                    this.owner.components.shooter.equipWeapon(new W_Pistol());
                }
            }
            // If we cannot shoot because of lack of ammo, trigger auto reload
            else if (this.currentAmmo == 0) {
                // Reloading is disabled, instead the weapon drops after all ammunition is expelled
                // this.reload();
            }
        }
    }

    // Reloading is disabled, instead the weapon drops after all ammunition is expelled
    // reload() {
    //     let t = Date.now();
    //     if (this.currentAmmo < this.maxAmmo && this.lastReload + TUNING.SMG1_RELOAD < t) {
    //         this.lastReload = t;
    //         this.lastAttack = t + TUNING.SMG1_RELOAD;
    //         this.currentAmmo = this.maxAmmo;
    //     }
    // }

    shoot() {
        let b = Game.inst.createEntity(new Bullet(this.owner, this.lastMovement.slice(), TUNING.SMG1_BULLET_SPEED, TUNING.SMG1_DAMAGE, TUNING.SMG1_BULLET_WIDTH, TUNING.SMG1_SPREAD));
        b.x = this.owner.x;
        b.y = this.owner.y;
        Game.es.fireEvent(new ShotFired(this.owner, this, [this.owner.x, this.owner.y]));
    }

    canShoot() {
        return this.lastAttack + TUNING.SMG1_FIRERATE <= Game.now() && this.currentAmmo > 0;
    }

    getStatus() {
        return 'SMG1 ' + this.currentAmmo + '/' + TUNING.SMG1_CAPACITY;
    }
}

W_SMG.prototype.code = 'smg1';