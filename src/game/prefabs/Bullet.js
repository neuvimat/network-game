import {Entity, ETYPE} from "Game/prefabs/Entity";
import {C_Locomotion} from "Game/components/C_Locomotion";
import {Game} from "Game/Game";
import {TAG} from "Game/Tags";
import {PREFABS} from "Game/Prefabs";
import {TUNING} from "Root/TUNING";
import {AvatarScoredKill} from "Game/eventSystem/events/AvatarEvents";

/**
 * Basic configurable bullet. Use the constructor to setup the bullet to your liking.
 */
export class Bullet extends Entity {
    /**
     * @param {Entity} shooter
     * @param {number[]} direction directional vector, its length should be 1, index0 = x, index1 = y
     * @param {number} speed speed in game units/ms
     * @param {number} damage
     * @param {number} collisionSize
     * @param {number} spread random spread in degrees
     */
    constructor(shooter, direction, speed, damage, collisionSize, spread) {
        super();
        this.addTag(TAG.PROJECTILE);
        this.shooter = shooter;

        this.addComponent(new C_Locomotion(speed, direction, spread));
        this.damage = damage;

        this.setUpCollision(Game.pSystem.createCircle(0,0,collisionSize), true, (other,info)=>{this.onCollide(other,info)});
        this.collision.ignoreList.push(shooter);
    }

    postUpdate(delta) {
        if (!Game.map.isWithinBorders(this.x, this.y)) {
            Game.inst.removeEntity(this);
        }
    }
    
    onCollide(other, info) {
        if (other.hasTag(TAG.AVATAR)) {
            this.collision.deactivate();
            other.components.health.hurt(this.damage);
            if (!other.components.health.isAlive()) {
                if (other.player) {
                    this.shooter.player.kills++;
                    Game.es.fireEvent(new AvatarScoredKill(this.shooter));
                }
            }
            Game.inst.removeEntity(this);
        }
        if (other.hasTag(TAG.WALL)) {
            this.collision.deactivate();
            Game.inst.removeEntity(this);
        }
    }
}

Bullet.prototype.eType = ETYPE.PROJECTILE;
Bullet.prototype.code = PREFABS.BULLET = 'bullet_pistol';