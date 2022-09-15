import {Component} from "Game/components/Component";

/**
 * <p>Simple locomotion component with direction and speed. Designed to be sort of 'fire and forget'.</p>
 * <p>Receives a direction and speed and moves the entity each tick. Very simple.</p>
 * <p>Any complex movement patterns, such as jittering, etc. must be done via a different Component or from outside,
 * i.e. by the parent {@link Entity}.</p>
 * @extends Component
 */
export class C_Locomotion extends Component {
    constructor(speed = 1, direction = [0,0], spread = 0) {
        super();
        this.parent = null;
        this.speed = speed;
        this.direction = direction;
        this.makeSpread(spread);
    }

    update(delta) {
        this.parent.x += this.direction[0] * this.speed * delta;
        this.parent.y += this.direction[1] * this.speed * delta;
    }

    /**
     * <p>Alter direction by random amount of degrees.</p>
     * @param spread random uniform spread in degrees
     */
    makeSpread(spread) {
        if (spread) {
            let deg = Math.atan2(this.direction[1], this.direction[0]);
            deg += (Math.random()*spread*2 - spread) / 180 * Math.PI;
            this.direction[0] = Math.cos(deg);
            this.direction[1] = Math.sin(deg);
        }
    }
}

C_Locomotion.prototype.code = 'locomotion';