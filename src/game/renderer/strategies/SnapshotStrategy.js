import {Snapshot} from "Game/renderer/Snapshot";
import {IRenderStrategy} from "Game/renderer/strategies/IRenderStrategy";

/**
 * Simplest form of render strategy that just copies values as they are from the newest snapshot
 * @extends IRenderStrategy
 */
export class SnapshotStrategy extends IRenderStrategy {
    constructor(snapshotStash) {
        super(snapshotStash);
        this.lastRenderedSnapshot = Snapshot.empty();
    }

    prepare() {

    }

    getField(accessFn) {
        return accessFn(this.lastRenderedSnapshot) || 0;
    }

    getPrimarySnapshot() {
        let snapshot = this.snapshotStash.getHead();
        if (this.lastRenderedSnapshot != snapshot) {
            this.lastRenderedSnapshot = snapshot;
            return snapshot;
        }
        console.log('Would render the same, skip');
        return null;
    }

    shouldDraw(existentialCheckFn) {
        return true;
        // We can safely return true actually. We ask for should draw for entities that can be considered for rendering.
        // In case of snapshot renderer, every entity that is considered as such means that it was iterated through,
        // meaning getField will always be able to access it.
        // return existentialCheckFn(this.lastRenderedSnapshot);
    }

    configureSnapshotStash() {
        this.snapshotStash.maxSnapshotCapacity = 1;
    }
}