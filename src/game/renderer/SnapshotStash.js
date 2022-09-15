import {Snapshot} from "./Snapshot";

/**
 * Helper class that stores snapshots. It has support for handling snapshots that come in unexpected order.
 * Has some basic configurable eviction policy of too old snapshots and some nice utility methods to get
 * only relevant snapshots
 */
export class SnapshotStash {
    constructor(maxSnapshots, maxAge) {
        this.snapshots = [];
        this.maxSnapshotCapacity = maxSnapshots;
        this.maxSnapshotAge = maxAge;
    }

    stashSnapshot(snapshot) {
        if (this.maxSnapshotAge !== -1) this.clearExpired();

        // Find the spot where to put the snapshot (newest (highest timestamp) to be at index 0)
        let pos = 0;
        for (let s of this.snapshots) {
            if (s.time < snapshot.time) {
                break;
            }
            pos++;
        }
        this.snapshots.splice(pos, 0, snapshot);
        if (this.snapshots.length > this.maxSnapshotCapacity) {
            this.snapshots.pop();
        }
    }

    /**
     * Forget all snapshots that are too old
     * @param now
     */
    clearExpired(now) {
        let i = this.snapshots.length-1;
        while (i >= 0 && this.snapshots[i].time < now - this.maxSnapshotAge) {
            i--;
        }
        this.snapshots = this.snapshots.slice(0, i+1);
    }

    /**
     * Get two surrounding snapshots of time t
     * @param t timestamp for which to find boundary snapshots
     * @return {*[]}
     */
    getBounds(t) {
        if (this.snapshots.length === 0) {
            return [undefined, undefined]
        }
        // We start from the newest (highest timestamp)
        for (let i = 0; i < this.snapshots.length; i++) {
            if (this.snapshots[i].time <= t) {
                // Also handles the case of [snapshot, undefined]
                return [this.snapshots[i], this.snapshots[i-1]]
            }
        }
        return [undefined, this.snapshots[this.snapshots.length-1]]
    }

    /**
     * Get the first (newest) snapshot
     * @return {null|Snapshot}
     */
    getHead() {
        return this.snapshots[0]
    }

    /**
     * Get the last (oldest) stored snapshot
     * @return {null|Snapshot}
     */
    getTail() {
        return this.snapshots[this.snapshots.length-1]
    }

    toString() {
        let str = '';
        let ctr = 0;
        for (let s of this.snapshots) {
            str += ctr + ': ' + s.time + '\n';
        }
        return str;
    }

    getLength() {
        return this.snapshots.length;
    }

    /**
     * Get first x snapshots
     * @param amount
     * @returns {Snapshot[]}
     */
    getFrontSnapshots(amount) {
        return this.snapshots.slice(0, amount)
    }

    clear() {
        this.snapshots = [];
    }
}