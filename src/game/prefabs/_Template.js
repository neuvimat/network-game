import {Entity, ETYPE} from "Game/prefabs/Entity";
import {C_Health} from "Game/components/C_Health";
import {TUNING} from "Root/TUNING";
import {TAG} from "Game/Tags";
import {PREFABS} from "Game/Prefabs";

/**
 * This is the minimum requirement for a new entity. Copy paste the template for a quick start.
 * @extends Entity
 * @class _Template
 */
export class _Template extends Entity {
    constructor() {
        super();
        this.player = null;
        this.addComponent(new C_Health(TUNING.PLAYER_HEALTH)); // Add custom components
        this.addTag(TAG.AVATAR); // Give the entity some tags
    }

    // When registered by the game (called after constructor once all components are loaded)
    init() {
        super.init();
    }

    // Once per frame
    update(delta) {

    }

    // Once per frame, after update()
    postUpdate() {

    }

    // When the game is about to delete the entity
    remove() {

    }
}

Template.prototype.eType = ETYPE.AVATAR; // Mark the type of the entity
Template.prototype.code = PREFABS.TEMPLATE = PREFABS.registerNew(); // give this unique name