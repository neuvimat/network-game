import {AvatarDied, AvatarHealthChange, AvatarRespawned} from "Game/eventSystem/events/AvatarEvents";
import {Game} from "Game/Game";
import {Component} from "Game/components/Component";
import {ArrayUtils} from "Root/util/ArrayUtils";

/**
 * A callback invoked when a collision between this parent {@link Entity} and other {@link Entity} is detected.
 * @callback C_Collider~onCollide
 * @param {Entity} other the {@link Entity} that we collided with
 * @param {Result} info detailed info about the collision that occured
 */

/**
 * @augments Component
 * @deprecated
 * <p>The component itself is <b>not actually deprecated</b>, it is in use, however its usage has changed as a third
 *     party collision detection library was implemented. It is marked as deprecated to discourage its usage directly,
 *     rather than using {@link Entity#setUpCollision}</p>
 * <p>It is now not used as a component tied to an Entity in the 'components' property, but part of the Entity itself
 * under 'collision' property. This change was made due to slight differences to at which state of the
 * {@link Game#doStep} physics needs to be handled.</p>
 * <p>The Component handles physics interaction for its parent Entity.</p>
 * @see {@link Entity}
 */
export class C_Collider extends Component {
    cleanup() {
        Game.pSystem.remove(this.collider);
    }

    constructor() {
        super();
        this.parent = null;
        this.collider = null;
        /**         * @type {C_Collider~onCollide}         */
        this.onCollideFn = null;
        this.ignoreList = [];
    }

    /**
     * <p>Utility method, makes sure no stranded colliders are present in the physics systems if we are replacing a
     * collider.</p>
     * @param collider
     * @param active
     */
    setCollider(collider, active = true) {
        if (this.collider) {
            this.collider.remove(); // this is a method that is part of any pSystem collider;
            this.collider.entity = null; // Clear by us introduced attributes
            this.collider.component = null; // Clear by us introduced attributes
        }
        if (collider) {
            this.collider = collider;
            this.collider.active = active;
            this.collider.entity = this.parent;
            this.collider.component = this;
        }
        else {
            this.collider = null;
        }
    }

    /**
     * <p>Checks if the parent entity is colliding with anything. If it is, {@link C_Collider#onCollideFn} is invoked.
     * </p>
     * @param {Number} delta actually has no use in the context of collision detection
     */
    update(delta) {
        // Unless our collider is active, do not do anything
        if (this.collider.active) {
            let bodies = this.collider.potentials();
            for (const b of bodies) {
                // Check again if we are active, it is possible that onCollideFn with a different entity had disabled
                // us
                // At the same time we do not want to break out of the loop in case, as it may not result in us
                // deactivating
                if (this.collider.active) {
                    if (!b.active || ArrayUtils.isPresent(this.ignoreList, b.entity)) {
                        continue;
                    }
                    if (this.collider.collides(b, Game.cResult)) {
                        this.onCollideFn(b.entity, Game.cResult);
                    }
                    else {

                    }
                }
                else {
                    // We were made inactive during of the collisions that were handled, we no longer need to check
                    // other potentials
                    break;
                }
            }
        }
    }

    /**
     * <p>Move the collider body in the physics system to match the parent's position in the world.</p>
     * <p>Because of the third party collision library, we need to create and maintain a collision body that the
     * third party system uses.</p>
     */
    repositionCollider() {
        if (this.collider) {
            this.collider.x = this.parent.x;
            this.collider.y = this.parent.y;
        }
    }

    /**
     * <p>Allow this collider to collide with other entities.</p>
     * @see {@link Entity}
     */
    activate() {
        if (this.collider) {
            this.collider.active = true;
        }
    }

    /**
     * <p>Disallow this collider to collide with other entities.</p>
     * @see {@link Entity}
     */
    deactivate() {
        if (this.collider) {
            this.collider.active = false;
        }
    }
}

C_Collider.prototype.code = 'collider';