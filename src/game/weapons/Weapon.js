/**
 * <p>Minimal functioning stub for a weapon that does not shoot.</p>
 * <p>Every weapon in the game should extend this class.</p>
 * <p>Since this is JavaScript, you can feed an instance of this class to {@link Components.C_Shooter#equipWeapon},
 * but shouldn't, in other languages it would be marked as abstract.</p>
 * <p>The aim direction is supplied by {@link Components.C_Shooter}.</p>
 * @class Weapon
 */
export class Weapon {
    constructor() {
        this.owner = null;
        this.lastMovement = [1, 0];
    }

    /**
     * <p>Called once per frame by {@link Components.C_Shooter#update}. Unequipped weapons do not think.</p>
     * <p>Main purpose is to allow automatic weapons to fire periodically when trigger is pulled. Simply add a boolean
     * that is set to true if trigger is pulled. In think method, if said boolean is true, shoot or whatever.</p>
     */
    think() {

    }

    /**
     * @return {boolean} true if weapon can be fired
     */
    canShoot() {
        return true;
    }

    /**
     * <p>Hopefully self-explanatory.</p>
     */
    pullTrigger() {

    }

    /**
     * <p>Hopefully self-explanatory.</p>
     */
    releaseTrigger() {

    }

    /**
     * <p>Asks the weapon to return its status as a string. This string is then used by the client and rendered on his
     * UI below health bar. Usually weapon name and ammo left in the magazine is returned.</p>
     * @return {String}
     */
    getStatus() {
        return 'Someone forgot to implement getStatus() on a weapon.'
    }

    /**
     * <p>Called when weapon is removed. Happens when the owning {@link Entity} is removed or when the weapon is
     * unequipped by picking up other weapon.</p>
     */
    cleanup() {

    }

    /**
     * <p>Called when weapon is equipped. Analogous to {@link Entity#init} or {@link Component#init}. At this stage, the
     * weapon is guaranteed to have an owner set.</p>
     */
    onEquipped() {

    }

    /**
     * <p>Force the weapon to aim in this direction.</p>
     * @param {number[]} dir index 0: x direction, index 1: y direction
     */
    forceAim(dir) {
        this.lastMovement = dir;
    }
}

Weapon.prototype.code = 'weapon';