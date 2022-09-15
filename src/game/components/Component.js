/**
 * <p>Components act as reusable packages of data and methods that extend/add functionality to entities.</p>
 * <p>As an {@link Entity#update} method is called on an {@link Entity}, the Entity will then call
 * {@link Component#update} to all its underlying components (unless a specific Entity specified otherwise).</p>
 * <p>Generally speaking, most of the methods tied to an {@link Entity} lifecycle are present in components as well.
 * Exception being the {@link Component#cleanup} method that replaces {@link Entity#remove}, as components
 * intentionally cannot be removed at runtime to prevent unexpected behavior. The name change is intentional to not
 * raise wrong expectation that the 'remove' method would cause the component to be removed.</p>
 * <p><b>Every component needs to have a 'code' property set to properly function. Use this 'code' property to access
 * components within Entities!</b> It is recommended to use a Component.prototype.code to specify a code for a
 * Component.</p>
 * @namespace Components
 */

/**
 * <p>Basic Component interface. Any other Component should extend this to have all the methods that the Game calls
 * in its iteration process. There is no issue with not overriding any of the methods that it contains.</p>
 * <p>For more information about the Component philosophy, take a look at the {@link Components}.</p>
 * @see {@link Components}
 * @class Component
 */
export class Component {
    constructor() {
        this.parent = null;
    }

    /**
     * <p>Once per frame. Processed at the beginning of a frame.</p>
     * @param {number} delta simulate the entity as if this much time has passed
     */
    update(delta) {

    }

    /**
     * <p>Called after the entity's constructor finished and as such it is safe to assume all the components that the
     * entity has are now attached to it. At this time it is safe to setup references to other components should they
     * need it.</p>
     */
    init() {

    }

    /**
     * <p>Called right before the parent entity is removed.</p>
     * <p>Use this method to cleanup after the component.</p>
     */
    cleanup() {

    }

    /**
     * <p>Called after all 'regular' updates are finished.</p>
     * <p>Use this if something is needed to be processed after update.</p>
     */
    postUpdate() {

    }
}
Component.prototype.code = 'component';