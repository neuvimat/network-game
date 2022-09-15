/**
 * Data holder that represents the RENDER snapshot of a specific game tick
 * As a render snapshot, it holds only limited amount of data and only that data, which is relevant
 * to the {@link GameRenderer}
 */
export class Snapshot {
    constructor(data, time, tick) {
        this.data = data;
        this.time = time;
        this.tick = tick;
    }

    toString() {
        return this.time;
    }

    /**
     * Convert simple object to a instance of snapshot
     * @param object
     * @return {Snapshot}
     */
    static fromPlainObject(object) {
        return new Snapshot(object.data, object.time, object.tick);
    }

    /**
     * Makes sure all required fields by GameRenderer are present, but just empty, otherwise iterating trough snapshot
     * may throw errors because of undefined fields
     * @returns {Snapshot}
     */
    static empty() {
        return new Snapshot({avatars: {}, projectiles: {}}, 0, 0);
    }
}