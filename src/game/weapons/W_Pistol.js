import {Bullet} from "Game/prefabs/Bullet";
import {ShotFired} from "Game/eventSystem/events/AvatarEvents";
import {Game} from "Game/Game";
import {TUNING} from "Root/TUNING";
import {Weapon} from "Game/weapons/Weapon";

/**
 * <p>Basic weapon with infinite ammo. Shoots as fast as player can pull the trigger. Yes, it is highly exploitable with
 * auto-clickers, but w/e.</p>
 * @extends Weapon
 */

export class W_Pistol extends Weapon {
    constructor() {
        super();
    }

    pullTrigger() {
        this.shoot();
    }

    releaseTrigger() {

    }

    think() {

    }

    shoot() {
        let b = Game.inst.createEntity(new Bullet(this.owner, this.lastMovement.slice(), TUNING.PISTOL_BULLET_SPEED, TUNING.PISTOL_DAMAGE, TUNING.PISTOL_BULLET_WIDTH, TUNING.PISTOL_SPREAD));
        b.x = this.owner.x;
        b.y = this.owner.y;
        Game.es.fireEvent(new ShotFired(this.owner, this, [this.owner.x, this.owner.y]));
    }

    getStatus() {
        return 'Pistol &infin;/&infin;';
    }

    canShoot() {
        return true;
    }
}
W_Pistol.prototype.code = 'pistol';