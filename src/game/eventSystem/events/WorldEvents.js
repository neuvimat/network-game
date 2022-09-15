import {EventSystem} from "Game/eventSystem/EventSystem";

export class PickupSpawned {
    constructor(pickup) {
        this.pickup = pickup;
    }
}
PickupSpawned.prototype.code = PickupSpawned.name;

export class PickupTaken {
    constructor(taker, pickup) {
        this.taker = taker;
        this.pickup = pickup;
    }
}
PickupTaken.prototype.code = PickupTaken.name;

export class GameRoundEnd {
    constructor() {

    }
}
GameRoundEnd.prototype.code = GameRoundEnd.name;

export class GameStart {
    constructor() {

    }
}
GameStart.prototype.code = GameStart.name;

export class GamePaused {
    constructor(mapName) {
        this.mapName = mapName;
    }
}
GamePaused.prototype.code = GamePaused.name;

export class GameResumed {
    constructor() {

    }
}
GameResumed.prototype.code = GameResumed.name;

export class PlayerJoined {
    constructor(player) {
        this.player = player;
    }
}
PlayerJoined.prototype.code = PlayerJoined.name;

export class PlayerDisconnected {
    constructor(player) {
        this.player = player;
    }
}
PlayerDisconnected.prototype.code = PlayerDisconnected.name;

export class PlayerRejoined {
    constructor(player) {
        this.player = player;
    }
}
PlayerRejoined.prototype.code = PlayerRejoined.name;