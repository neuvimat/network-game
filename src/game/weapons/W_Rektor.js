import {Bullet} from "Game/prefabs/Bullet";
import {ShotFired} from "Game/eventSystem/events/AvatarEvents";
import {Game} from "Game/Game";
import {TUNING} from "Root/TUNING";
import {MathUtils} from "Root/util/MathUtils";
import {Weapon} from "Game/weapons/Weapon";

/**
 * <p>Fun little weapon that is currently not available to players by conventional means.</p>
 * <p>Fires in devastating 60 degree arc. One shots enemies.</p>
 * @extends Weapon
 */
export class W_Rektor extends Weapon {
    constructor(owner) {
        super();
        this.owner = owner;
        this.lastMovement = null;
        this.lastAttack = 0;
    }

    pullTrigger() {
        if (this.canShoot()) {
            this.shoot();
            this.lastAttack = Game.now();
        }
    }

    releaseTrigger() {

    }

    think() {

    }

    shoot() {
        for (let i = -30; i <= 30; i+=3) {
            let currentAngle = MathUtils.angleFromDirection(this.lastMovement.slice());
            let b = Game.inst.createEntity(new Bullet(this.owner, MathUtils.directionVectorFromAngle(currentAngle + i/180*Math.PI), 2, 100, TUNING.SHOTGUN_BULLET_WIDTH, 3));
            b.x = this.owner.x;
            b.y = this.owner.y;
        }
        Game.es.fireEvent(new ShotFired(this.owner, this, [this.owner.x, this.owner.y]));
    }

    canShoot() {
        return this.lastAttack + 500 < Game.now()
    }

    getStatus() {
        return '#Shrektor &infin;/&infin;';
    }
}
W_Rektor.prototype.code = 'rektor';