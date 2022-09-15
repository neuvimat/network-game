import {Entity, ETYPE} from "Game/prefabs/Entity";
import {Game} from "Game/Game";
import {PickupTaken} from "Game/eventSystem/events/WorldEvents";

/**
 * Generic pickup prefab. Extend this class and override the onTouch method. Everything else is already taken care of.
 * Do not forget the helper method takePickup(taker)!
 * @class Pickup
 */
export class Pickup extends Entity {
    /**
     * @param radius pickup pick up radius
     */
    constructor(radius) {
        super();
        this.setUpCollision(Game.pSystem.createCircle(0, 0, radius), true, (other, info) => {this.onTouch(other, info)});
    }

    /**
     * @param other - collider body for the 3rd party collisions library. Use the 'entity' property to access the game object this collider represents
     * @param info - collision info from the 3rd party collision library
     */
    onTouch(other, info) {
        this.takePickup(other.entity);
    }

    /**
     * <p>Utility method, disables collisions to prevent simultaneous pickup by multiple entities on the same tick and
     * fires appropriate event</p>
     * @param {Entity} taker <b>entity</b> that represents the taker
     */
    takePickup(taker) {
        this.collision.deactivate();
        Game.es.fireEvent(new PickupTaken(taker, this));
        Game.inst.removeEntity(this);
    }
}

Pickup.prototype.code = 'pickup'
Pickup.prototype.eType = ETYPE.PROJECTILE;