import {Entity, ETYPE} from "Game/prefabs/Entity";
import {C_Health} from "Game/components/C_Health";
import {C_SimpleMovement} from "Game/components/C_SimpleMovement";
import {C_Shooter} from "Game/components/C_Shooter";
import {MathUtils} from "Root/util/MathUtils";
import {C_Collider} from "Game/components/C_Collider";
import {Game} from "Game/Game";
import {TUNING} from "Root/TUNING";
import {TAG} from "Game/Tags";
import {PREFABS} from "Game/Prefabs";
import {W_Pistol} from "Game/weapons/W_Pistol";

/**
 * <p>Entity representing a player. It receives commands via RPCHandler. RPCHandler knows which player sent what command
 * and based on that manipulates the player's avatar.</p>
 * @class Avatar
 * @extends Entity
 */
export class Avatar extends Entity {
    constructor(player) {
        super();
        this.addTag(TAG.AVATAR);

        this.player = player;

        this.addComponent(new C_SimpleMovement(TUNING.PLAYER_SPEED, TUNING.PLAYER_SPRINT_MULT, TUNING.PLAYER_WALK_MULT));
        this.addComponent(new C_Health(TUNING.PLAYER_HEALTH));
        this.addComponent(new C_Shooter(25, 10));

        this.setUpCollision(Game.pSystem.createCircle(0,0,TUNING.PLAYER_WIDTH), true, (other,info)=>{this.onCollide(other, info)});

        this.schedules = [];
    }

    update(delta) {
        if (this.components.health.isAlive()) {
            for(let c in this.components) {
                this.components[c].update(delta);
            }
        }
        let contained = Game.map.containWithinBorders(this.x,this.y, 24);
        this.x = contained[0];
        this.y = contained[1];
    }

    respawn() {
        this.collision.activate();
        this.components.health.restore();
        let sp = Game.map.getRandomSpawnPoint();
        this.x = sp[0];
        this.y = sp[1];
        if (!this.components.shooter.hasWeapon('pistol')) {
            this.components.shooter.equipWeapon(new W_Pistol());
        }
        this.cleanSchedules();
    }

    postUpdate() {

    }

    onCollide(other, collisionInfo) {
        if (other.hasTag(TAG.WALL)) {
            this.x -= collisionInfo.overlap * collisionInfo.overlap_x;
            this.y -= collisionInfo.overlap * collisionInfo.overlap_y;
        }
    }

    init() {
        this.components.shooter.equipWeapon(new W_Pistol());
    }

    remove() {
        super.remove();
        this.cleanSchedules();
    }

    cleanSchedules() {
        for (let s of this.schedules) {
            s.enabled = false;
        }
        this.schedules = [];
    }
}

Avatar.prototype.eType = ETYPE.AVATAR;
Avatar.prototype.code = PREFABS.AVATAR = 'avatar';