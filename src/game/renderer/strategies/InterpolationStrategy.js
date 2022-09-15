import {Time} from "Util/Time";
import {MathUtils} from "Util/MathUtils";
import {IRenderStrategy} from "Game/renderer/strategies/IRenderStrategy";

const MODE = {
    INTERPOLATE: 0,
    EXTRAPOLATE: 1,
    IMPOSSIBLE: 2,
    FALLBACK: 3,
};

/**
 * Strategy for interpolating entity movement. For more details, see chapter 'interpolation' in the bachelor thesis
 * @extends IRenderStrategy
 */
export class InterpolationStrategy extends IRenderStrategy {
    constructor(snapshotStash, interpolationDelay) {
        super(snapshotStash);
        this.getField = this.getFieldImpossible;
        this.interpolationDelay = interpolationDelay;

        // Helper variables for efficiency
        this.snapshotTimeDelta = 0;     // Time difference between relevant snapshots
        this.renderDrawStart = 0;       // Keep the time we started the draw process, so entities that the CPU processes
                                        // a few ms later are extrapolated with the same t
        this.relevantSnaphots = null;   // Stash the snapshots we will use out of all we have stored
        this.t = null;                  // The parameter t is the same for everything, calculate it once and store
        this.mode = 0; // 1 = interpolate; 0 = fallback to extrapolation
    }

    prepare() {
        this.renderDrawStart = Time.serverNow() - this.interpolationDelay;
        let bounds = this.snapshotStash.getBounds(this.renderDrawStart);
        if (this.canInterpolate(bounds)) {
            this.mode = MODE.INTERPOLATE;
            this.relevantSnaphots = bounds;
            this.snapshotTimeDelta = this.relevantSnaphots[0].time - this.relevantSnaphots[1].time;
            // Normalize t to a multiple of delta between snapshots
            this.t = (this.renderDrawStart - this.relevantSnaphots[1].time) / this.snapshotTimeDelta;
            this.getField = this.getFieldInterpolate;
        }
        else if (this.canExtrapolate()) {
            /// #if DEBUG
            // console.log('INTERPOLATION STRATEGY IS EXTRAPOLATING!');
            /// #endif
            this.mode = MODE.EXTRAPOLATE;
            this.relevantSnaphots = this.snapshotStash.getFrontSnapshots(2);
            this.snapshotTimeDelta = this.relevantSnaphots[0].time - this.relevantSnaphots[1].time;
            this.t = (this.renderDrawStart - this.relevantSnaphots[0].time) / this.snapshotTimeDelta;
            this.getField = this.getFieldExtrapolate;
        }
        // todo: if we have at least one snapshot, we can render that - i.e. use last snapshot render strategy
        else {
            // We do not have enough data to do anything
            this.mode = MODE.IMPOSSIBLE;
            this.getField = this.getFieldImpossible;
        }
    }

    canInterpolate(bounds) {
        return bounds[0] && bounds[1];
    }

    canExtrapolate() {
        return this.snapshotStash.getFrontSnapshots(2).length === 2;
    }

    canFallback() {
        return this.snapshotStash.getLength() >= 1;
    }

    getFieldInterpolate(fieldAccessFn) {
        // We can be 100% sure we will get these values since the nature of interpolation and because the game renderer
        // will never get here if these values cannot be accessed, because the responsible programmer already used the
        // shouldDraw(accessFn) method beforehand to make sure he can get here safely
        let a = fieldAccessFn(this.relevantSnaphots[0]);
        let b = fieldAccessFn(this.relevantSnaphots[1]);

        return MathUtils.lerp(b, a, this.t); // We have two values, we can interpolate them
    }

    getFieldExtrapolate(fieldAccessFn) {
        let a = fieldAccessFn(this.relevantSnaphots[0]);
        if (a === false) {
            console.error('Extrapolation strategy: cannot access field in primary snapshot!');
            return 0; // This should not really happen, but just in case the field cannot be accessed even in primary
                      // snapshot
        }

        let b = fieldAccessFn(this.relevantSnaphots[1]);
        // Check that the entity b, to which the field is attached to, exists in the other snapshot
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
        if (this.mode == MODE.IMPOSSIBLE) {
            return null;
        }
        return this.relevantSnaphots[0];
    }

    shouldDraw(existentialCheckFn) {
        // If we are interpolation (mode == 1) check that the entity exists in both snapshots.
        // If it exists only in first, the entity died sometime between the first and second snapshot
        //      and we do not know when exactly - don't draw the entity at all
        // If it exists only in the second, it is newly created and does not yet exists at time 't'
        if (this.mode === MODE.INTERPOLATE) {
            return existentialCheckFn(this.relevantSnaphots[0]) && existentialCheckFn(this.relevantSnaphots[1]);
        }
        if (this.mode === MODE.EXTRAPOLATE) {
            // Check only if it is present in the newest snapshot. Should it be present only in the newest snapshot,
            // there is still chance it exists in the 'current real present' so we will draw it, but we cannot predict
            // its position, so we will just draw it on the spot. Inside the extrapolate get field we will see if it is
            // actually present in both snapshots. If so, we will predict.
            return true;
        }
            // Here we are in fallback (last snapshot) or impossible mode when we always return 0 for everything. The
            // game renderer automatically should not even try to render but if someone really insists why not tell
        // them they can draw since we will return 0 in getField
        else return true;
    }

    configureSnapshotStash() {
        this.snapshotStash.maxSnapshotCapacity = 10;
        this.snapshotStash.maxSnapshotAge = this.interpolationDelay + 200;
        // Should be enough time to make absolutely sure that the snapshots is not longer needed.
    }
}