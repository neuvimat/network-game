import {EventSystem} from "Game/eventSystem/EventSystem";

export class AvatarHealthChange {
    constructor(avatar, oldHealth, newHealth) {
        this.avatar = avatar;
        this.oldHealth = oldHealth;
        this.newHealth = newHealth;
    }
}
AvatarHealthChange.prototype.code = EventSystem.generateId();

export class ShotFired {
    constructor(shooter, weapon, shootPos) {
        this.shooter = shooter;
        this.weapon = weapon;
        this.shootPos = shootPos;
    }

    toJSON() {
        return {shooter:this.shooter.id, weapon: this.weapon, shootPos: this.shootPos};
    }
}
ShotFired.prototype.code = EventSystem.generateId();

export class WeaponEquipped {
    constructor(shooter, weapon, prevWeapon) {
        this.shooter = shooter;
        this.weapon = weapon;
        this.prevWeapon = prevWeapon;
    }
}
WeaponEquipped.prototype.code = WeaponEquipped.name;

export class AvatarAmmoChanged {
    constructor(shooter, weapon, currentAmmo, maxAmmo, prevAmmo) {
        this.shooter = shooter;
        this.weapon = weapon;
        this.currentAmmo = currentAmmo;
        this.maxAmmo = maxAmmo;
        this.prevAmmo = prevAmmo;
    }
}
AvatarAmmoChanged.prototype.code = EventSystem.generateId();

export class AvatarScoredKill {
    constructor(avatar) {
        this.avatar = avatar;
    }
}

export class AvatarDied {
    constructor(avatar) {
        this.avatar = avatar;
    }
}
AvatarDied.prototype.code = EventSystem.generateId();

export class AvatarRespawned {
    constructor(avatar) {
        this.avatar = avatar;
    }
}
AvatarRespawned.prototype.code = EventSystem.generateId();