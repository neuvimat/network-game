import {AvatarDied, AvatarHealthChange, AvatarRespawned} from "Game/eventSystem/events/AvatarEvents";
import {Game} from "Game/Game";
import {Component} from "Game/components/Component";
import {ScheduleTask} from "Game/scheduler/ScheduleTask";

/**
 * <p>{@link Avatar} specific component representing its health.</p>
 * <p><b>Note</b>: currently this component is hardcoded to work specifically with {@link Avatar}. Since there are no
 * other entities that use this component, there was no need for generalizing.</p>
 * @augments Component
 * @class C_Health
 */
export class C_Health extends Component {
    constructor(max) {
        super();
        this.parent = null;
        this.max = max;
        this.current = max;
    }

    /**
     * <p>Fully heal</p>
     */
    restore() {
        this.delta(this.max - this.current);
    }

    /**
     * <p>Utility method that relies on {@link C_Health#delta}.</p>
     * <p>Cannot heal over maximum health. Negative values are automatically converted to positive.</p>
     * @param amount
     */
    heal(amount) {
        this.delta(Math.abs(amount));
    }

    /**
     * <p>Utility method that relies on {@link C_Health#delta}.</p>
     * <p>Both negative or positive values are converted so it deals damage.</p>
     * @param amount
     */
    hurt(amount) {
        this.delta(-Math.abs(amount));
    }

    /**
     * <p>Apply health change. If health reaches exactly zero or less, the {@link Entity} is considered dead.</p>
     * @param amount
     * @return {number} hp left after change
     */
    delta(amount) {
        let old = this.current;
        this.current += amount;
        if (this.current <= 0) {
            this.current = 0;
            this.died();
        }
        else if (this.current > this.max) {
            this.current = this.max;
        }
        this._fireHealthChangedEvent(old);
        return this.current;
    }

    /**
     * @return {boolean} true if health is above zero
     */
    isAlive() {
        return this.current > 0;
    }

    /**
     * @return {boolean} true if health is not at its maximum
     */
    isInjured() {
        return this.current < this.max;
    }

    /**
     * <p>Process the {@link Avatar}'s death.</p>
     * <p>Contents of this method are ripe for refactoring. Its contents should be moved somewhere else. The perfect way
     * would be to react to a simple EntityDied event and check within the event if the Entity was Avatar and then do
     * stuff. This would generalize the component for other entities to utilize.</p>
     * @see {@link Entity}
     * @see {@link Avatar}
     */
    died() {
        this.parent.player.deaths++;
        Game.es.fireEvent(new AvatarDied(this.parent));
        this.parent.collision.deactivate();

        // Create a new schedule task
        let task = new ScheduleTask(Game.inst.now() + 3000,
            () => {
                Game.es.fireEvent(new AvatarRespawned(this.parent));
                this.parent.respawn();
            }
        );
        // Add the task to the parent for safekeeping and possible revoking
        this.parent.schedules.push(task);
        // Register the task to the scheduler
        Game.scheduler.queueScheduleTask(task);
    }

    /**
     * <p>This is a method by itself because previously it was planned to be used multiple times across this component,
     * instead all the other methods were remapped to use the delta() method, which fires the event automatically,
     * but I don't feel like in-lining it, even when it it used only once in {@link C_Health#delta}</p>
     * @param old
     * @private
     */
    _fireHealthChangedEvent(old) {
        Game.es.fireEvent(new AvatarHealthChange(this.parent, old, this.current))
    }
}

C_Health.prototype.code = 'health';