import {Bullet} from "Game/prefabs/Bullet";
import {ShotFired} from "Game/eventSystem/events/AvatarEvents";
import {Game} from "Game/Game";
import {TUNING} from "Root/TUNING";
import {W_Pistol} from "Game/weapons/W_Pistol";
import {Weapon} from "Game/weapons/Weapon";

/**
 * <p>Weapon with limited ammo. Shoots in arcs with high spread.</p>
 * <p>When depleted, auto equips {@link W_Pistol}</p>
 * @extends Weapon
 */
export class W_Shotgun extends Weapon {
    constructor(owner) {
        super();
        this.owner = owner;
        this.lastMovement = null;
        this.lastAttack = 0;
        this.currentAmmo = TUNING.SHOTGUN_CAPACITY;
    }

    pullTrigger() {
        if (this.canShoot()) {
            this.currentAmmo--;
            this.shoot();
            this.lastAttack = Game.now();
            if (this.currentAmmo === 0) {
                this.owner.components.shooter.equipWeapon(new W_Pistol());
            }
        }
    }

    releaseTrigger() {

    }

    think() {

    }

    shoot() {
        for (let i = 0; i < TUNING.SHOTGUN_PELLETS_LOW_SPREAD; i++) {
            let b = Game.inst.createEntity(new Bullet(this.owner, this.lastMovement.slice(), TUNING.SHOTGUN_BULLET_SPEED, TUNING.SHOTGUN_DAMAGE, TUNING.SHOTGUN_BULLET_WIDTH, TUNING.SHOTGUN_SPREAD_LOW));
            b.x = this.owner.x;
            b.y = this.owner.y;
        }
        for (let i = 0; i < TUNING.SHOTGUN_PELLETS_HIGH_SPREAD; i++) {
            let b = Game.inst.createEntity(new Bullet(this.owner, this.lastMovement.slice(), TUNING.SHOTGUN_BULLET_SPEED, TUNING.SHOTGUN_DAMAGE, TUNING.SHOTGUN_BULLET_WIDTH, TUNING.SHOTGUN_SPREAD));
            b.x = this.owner.x;
            b.y = this.owner.y;
        }
        Game.es.fireEvent(new ShotFired(this.owner, this, [this.owner.x, this.owner.y]));
    }


    canShoot() {
        return this.lastAttack + TUNING.SHOTGUN_FIRERATE <= Game.now() && this.currentAmmo > 0;
    }

    getStatus() {
        return 'Shotgun ' + this.currentAmmo + '/' + TUNING.SHOTGUN_CAPACITY;
    }
}
W_Shotgun.prototype.code = 'shotgun';