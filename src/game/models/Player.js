/**
 * Data container for player object
 */
export class Player {
    constructor(id, nick) {
        this.id = id;
        this.nick = nick;
        this.avatar = null;
        this.color = null;
        this.kills = 0;
        this.deaths = 0;
        this.active = false;
    }
}