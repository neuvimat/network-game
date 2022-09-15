import {EventSystem} from "Game/eventSystem/EventSystem";
import {PREFABS} from "Game/Prefabs";
import {C_Collider} from "Game/components/C_Collider";

/**
 * @callback Entity~onCollide
 * @param other - collider body, refer to 3rd party collisions library for details
 * @param info - info about the collision, refer to 3rd party collisions library for details
 */

/**
 * @enum {string}
 */
export const ETYPE = {
    AVATAR: 'avatars',
    WALL: 'walls',
    PROJECTILE: 'projectiles',
    SPECIAL_EARLY: 'specialEarly',
    SPECIAL_LATE: 'specialLate',
    SPECIAL: 'special'
};

/**
 * <p>Basic entity that has all the required methods that allow the {@link Game} to operate on it. All other entities
 * should extend this.</p>
 * <p>To create new entity, use the {@link Game#createEntity}, to remove an entity from the game use
 * {@link Game#removeEntity}</p>
 * @class Entity
 */
export class Entity {
    constructor() {
        this.id = Entity.latestId++;
        this.x = 0;
        this.y = 0;
        this.components = {};
        this.tags = {};
        this.collision = null;
        // this.eventSystem = null;
    }

    // es() {
    //     if (this.eventSystem == null) {
    //         this.eventSystem = new EventSystem();
    //     }
    // }

    /**
     * Add a new component to this entity. Automatically assigns the component's parent to this entity.
     * @param {Component} component
     */
    addComponent(component) {
        this.components[component.code] = component;
        component.parent = this;
    }

    /**
     * Once per frame. Default implementation only updates components
     * @param {number} delta
     */
    update(delta) {
        this.updateComponents(delta);
    }

    postUpdate() {
        this.postUpdateComponents();
    }

    /**
     * <p><b>Do not call this directly, use {@link Game#removeEntity} instead!</b></p>
     * <p>Run any cleanup for the entity before it is released from the game. The actual game releasing does not happen
     * from here but from the mentioned {@link Game#removeEntity} method.</p>
     * <p>The name is theoretically a bit confusing as it does not remove the entity, but allows it to clean after
     * itself before deletion. Perhaps the same name treatment as in {@link Components} would be in place.</p>
     */
    remove() {
        this.cleanupComponents();
        if (this.collision) {
            this.collision.cleanup();
        }
    }

    /**
     * <p>Called by {@link Game#createEntity}</p>
     */
    init() {

    }

    /**
     * Utility method, should some entity rearrange its own update but wants to keep updating components
     */
    updateComponents(delta) {
        for (let c in this.components) {
            this.components[c].update(delta);
        }
    }

    /**
     * Utility method, should some entity rearrange its own update but wants to keep updating components
     */
    postUpdateComponents() {
        for (let c in this.components) {
            this.components[c].postUpdate();
        }
    }

    /**
     * Initialize all components. Automatically called by {@link Game} when the {@link Game#createEntity} is called.
     */
    initComponents() {
        for (let c in this.components) {
            this.components[c].init();
        }
    }

    /**
     * <p>Does not actually remove components, but calls their {@link Component#cleanup} method which acts as a cleanup.
     * Called automatically when {@link @Game#removeEntity} is called.</p>
     */
    cleanupComponents() {
        for (let c in this.components) {
            this.components[c].cleanup();
        }
    }

    /**
     * Add a tag to the entity. Tags are important as they allow to easily identify groups of entites.
     * @param {String} tag
     * @see {@link Entity}
     */
    addTag(tag) {
        this.tags[tag] = true;
    }

    /**
     * Removes specified tag from the entity if the tag exists.
     * @param {string} tag
     * @return {boolean} true if tag was present and removed
     */
    removeTag(tag) {
        if (this.tags[tag]) {
            delete this.tags[tag];
            return true;
        }
        return false;
    }

    hasTag(tag) {
        return this.tags[tag];
    }

    hasType(eType) {
        return this.eType === eType;
    }

    getEType() {
        return this.eType;
    }

    getCode() {
        return this.code;
    }

    hasCode(code) {
        return this.code === code;
    }

    // ------------ Collisions
    /**
     * Shortcut that handles all required things for collisions setup in one call
     * @param body
     * @param {boolean} startActive
     * @param {Entity~onCollide} onCollideFn
     */
    setUpCollision(body, startActive, onCollideFn) {
        this.addCollision();
        this.setCollisionBody(body, startActive);
        this.setOnCollide(onCollideFn);
    }

    addCollision() {
        this.collision = new C_Collider();
        this.collision.parent = this;
    }

    setCollisionBody(body, startActive = true) {
        this.collision.setCollider(body, startActive)
    }

    setOnCollide(fn) {
        this.collision.onCollideFn = fn;
    }
}

Entity.latestId = 0;
Entity.prototype.eType = ETYPE.AVATAR;
Entity.prototype.code = PREFABS.ENTITY = PREFABS.registerNew();

// todo: idea, parent and child eventSystems, local and global listening, consuming events, etc
// todo: some nice and unified way of taking care of and cancelling schedules