import {Time} from "Util/Time";
import {MathUtils} from "Util/MathUtils";
import {Snapshot} from "Game/renderer/Snapshot";
import {IRenderStrategy} from "Game/renderer/strategies/IRenderStrategy";

/**
 * Strategy for extrapolating entity movement. For more details, see chapter 'extrapolation' in the bachelor thesis
 * @extends IRenderStrategy
 */
export class ExtrapolationStrategy extends IRenderStrategy{
    constructor(snapshotStash) {
        super(snapshotStash);
        this.getField = this.getFieldImpossible;

        // Helper variables for efficiency
        this.snapshotTimeDelta = 0;     // Time difference between relevant snapshots
        this.renderDrawStart = 0;       // Keep the time we started the draw process, so entities that the CPU processes
                                        // a few ms later are extrapolated with the same t
        this.relevantSnaphots = null;   // Stash the snapshots we will use out of all we have stored
        this.t = null;                  // The parameter t is the same for everything, calculate it once and store
    }

    prepare() {
        if (this.canSmooth()) {
            this.relevantSnaphots = this.snapshotStash.getFrontSnapshots(2);
            this.snapshotTimeDelta = this.relevantSnaphots[0].time - this.relevantSnaphots[1].time;
            this.renderDrawStart = Time.serverNow();
            this.t = (this.renderDrawStart - this.relevantSnaphots[0].time) / this.snapshotTimeDelta; // Normalize t to
                                                                                                      // a multiple of
                                                                                                      // delta between
                                                                                                      // snapshots
            this.getField = this.getFieldExtrapolate;
        }
        else if (this.canFallback()) {
            this.relevantSnaphots = [this.snapshotStash.getHead()];
            this.getField = this.getFieldFallback;
        }
        else {
            this.relevantSnaphots = [Snapshot.empty()];
            this.getField = this.getFieldImpossible;
        }
    }

    canFallback() {
        return this.snapshotStash.getLength() >= 1;
    }

    canSmooth() {
        return this.snapshotStash.getLength() >= 2;
    }

    getFieldExtrapolate(fieldAccessFn) {
        let a = fieldAccessFn(this.relevantSnaphots[0]);
        if (a === false) {
            console.error('Extrapolation strategy: cannot access field in primary snapshot!');
            return 0; // This should not really happen, but just in case the field cannot be accessed even in primary
                      // snapshot
        }

        let b = fieldAccessFn(this.relevantSnaphots[1]);
        // Check that the entity b, to which the field is attached to, exists in other snapshot
        if (b !== false) {
            return (a - b) + MathUtils.lerp(b, a, this.t); // We have two values, we can extrapolate them
        }
        else {
            return a; // We do not have enough values, return the one known
        }
    }

    getFieldFallback(fieldAccessFn) {
        return fieldAccessFn(this.relevantSnaphots[0]);
    }

    getFieldImpossible(fieldAccessFn) {
        return 0;
    }

    getPrimarySnapshot() {
        return this.snapshotStash.getHead();
    }

    shouldDraw(accessFn) {
        return true;
    }

    configureSnapshotStash() {
        this.snapshotStash.maxSnapshotCapacity = 2;
        this.snapshotStash.maxSnapshotAge = 10000;
    }

}