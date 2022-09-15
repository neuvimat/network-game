import {Component} from "Game/components/Component";

/**
 * <p>Component designed to be friendly to handle user input. Allows 8 directional movement, supports walking and
 * sprinting.</p>
 */
export class C_SimpleMovement extends Component {
    constructor(speed, sprintMult = 2, walkMult = 0.4) {
        super();
        this.parent = null;

        this.dirX = 1; // We face the right by default
        this.dirY = 0;

        this.velocityX = 0;
        this.velocityY = 0;

        this.speed = speed;
        this.sprintMult = sprintMult;
        this.walkMult = walkMult;

        this.isSprinting = false;
        this.isWalking = false;
        this.currentMult = 1;

        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
    }

    update(delta) {
        this.updateDirections();
        if (this.isSprinting) this.currentMult = this.sprintMult;
        else if (this.isWalking) this.currentMult = this.walkMult;
        else this.currentMult = 1;
        this.velocityX = this.currentMult * this.speed * this.dirX;
        this.velocityY = this.currentMult * this.speed * this.dirY;
        this.parent.x += this.velocityX * delta;
        this.parent.y += this.velocityY * delta;
    }

    /**
     * <p>Start/stop sprinting. If Entity is currently both walking and sprinting, sprint takes precedence.</p>
     * @param sprint
     */
    sprint(sprint) {
        this.isSprinting = sprint;
    }

    /**
     * <p>Start/stop walking. If Entity is currently both walking and sprinting, sprint takes precedence.</p>
     * @param walk
     */
    walk(walk) {
        this.isWalking = walk;
    }

    // todo - vektorove veliciny jako pole,too much changes at too many places, postponed
    /**
     * <p>Based on input, alter current movement direction.</p>
     */
    updateDirections() {
        // adding + or - before boolean converts it to a number
        this.dirX = (-this.left + +this.right); // if both left and right keys are triggered, returns 0
        this.dirY = (-this.up + +this.down); // Higher Y actually means more down, since 0,0 is top left
        if (this.dirX*this.dirX + this.dirY*this.dirY > 1) {
            this.dirY *= 0.707;
            this.dirX *= 0.707;
        }
    }

    /**
     * <p>Get current velocity (direction * current speed).</p>
     * @return {{x: number, y: number}}
     */
    getVelocity() {
        return {
            x: this.velocityX,
            y: this.velocityY,
        }
    }

    /**
     * <p>Get current direction.</p>
     * @return {{x: (number | *), y: (number | *)}}
     */
    getDirection() {
        return {
            x: this.dirX,
            y: this.dirY,
        }
    }

}

C_SimpleMovement.prototype.code = 'simpleMovement';