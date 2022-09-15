import {Bullet} from "Game/prefabs/Bullet";
import {MathUtils} from "Root/util/MathUtils";
import {WeaponEquipped} from "Game/eventSystem/events/AvatarEvents";
import {Game} from "Game/Game";
import {Component} from "Game/components/Component";
import {Weapon} from "Game/weapons/Weapon";

/**
 * <p>Allows an {@link Entity} to equip and use {@link Weapon}s.</p>
 * <p>Since aiming direction is determined by moving direction, the parent {@link Entity} should also have a
 * {@link Components.C_SimpleMovement}. Then this components automatically hooks into the simpleMovement and tracks
 * the movement direction from there. The last movement direction is kept updated and passed into the equipped weapon.
 * It is up to the weapon if it decides to respect that or chooses a different way to handle aim direction. If the
 * parent stopped moving, the last movement direction remains to be the direction before movement stopped.</p>
 * @extends Component
 */
export class C_Shooter extends Component {
    constructor(damage, attackRate) {
        super();
        this.parent = null;
        this.lastMovement = [1, 0]; // used for aiming direction
        this.cSimpleMovement = null;
        /**         * @type {Weapon}         */
        this.weapon = null;
    }

    /**
     * <p>Equip a new weapon. The old weapon is discarded and calls {@link Weapon#cleanup}. The newly equipped weapons
     * calls {@link Weapon#onEquipped}</p>
     * @param {Weapon} weapon
     */
    equipWeapon(weapon) {
        let oldWeapon = this.weapon;
        if (oldWeapon) {
            oldWeapon.cleanup();
        }
        this.weapon = weapon;
        this.weapon.owner = this.parent;
        this.weapon.lastMovement = this.lastMovement;
        this.weapon.onEquipped();
        Game.es.fireEvent(new WeaponEquipped(this.parent, weapon, oldWeapon))
    }

    /**
     * <p>Analogous to pulling the trigger on equipped weapon</p>
     */
    shootStart() {
        if (this.parent.components.health && this.parent.components.health.isAlive() && this.weapon) {
            if (this.weapon) {
                this.weapon.pullTrigger();
            }
        }
    }

    /**
     * <p>Analogous to releasing the trigger on equipped weapon</p>
     */
    shootEnd() {
        if (this.weapon) {
            this.weapon.releaseTrigger();
        }
    }

    /**
     * @return {boolean} true if the shooter can shoot his currently equipped weapon
     */
    canShoot() {
        return this.weapon.canShoot();
    }

    update(delta) {
        if (!(this.cSimpleMovement.dirY === 0 && this.cSimpleMovement.dirX === 0) && this.weapon) {
            this.lastMovement[0] = this.cSimpleMovement.dirX;
            this.lastMovement[1] = this.cSimpleMovement.dirY;
        }
        else {

        }
        this.weapon.think();
    }

    init() {
        this.cSimpleMovement = this.parent.components.simpleMovement;
    }


    cleanup() {
        if (this.weapon) this.weapon.cleanup();
    }

    /**
     * @return {boolean} true if shooter has any weapon equipped
     */
    hasAnyWeapon() {
        return !(this.weapon === null);
    }

    /**
     * @param weaponCode
     * @return {boolean} true if weapon with specified code is currently equipped
     */
    hasWeapon(weaponCode) {
        return (this.weapon && this.weapon.code === weaponCode);
    }
}

C_Shooter.prototype.code = 'shooter';