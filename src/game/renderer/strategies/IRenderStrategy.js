import {Snapshot} from "Game/renderer/Snapshot";

/**
 * <p>Return a numeric value that can be used to extrapolate/interpolate between, or false (boolean) to indicate an error
 * while accessing a property has occurred. It is up to the RenderStrategy to react to this exceptional state.</p>
 * <p>Think of returning false (boolean) as throwing an exception to the render strategy.</p>
 * @callback accessFn
 * @param snapshot {Snapshot}
 * @return {false|number}
 */

/**
 * <p>Render strategy is a helper class that provides{@link GameRenderer} with values depending on the strategy's
 * behavior. The renderer asks the strategy for a modified numeric values calculated from snapshots by the strategy.
 * Renderer then uses these values to render objects on canvas.</p>
 * <p>The renderer can use this for any numeric values stored in the snapshots, but most of the cases it will be
 * utilized to get in-between snapshots positions.</p>
 * @class IRenderStrategy
 */
export class IRenderStrategy {
    /**
     * @param {SnapshotStash} snapshotStash
     * @constructor
     */
    constructor(snapshotStash) {
        this.snapshotStash = snapshotStash;
    }

    /**
     * <p>Allow our render strategy to do some preparations before actual draw calls are requested. Might be left empty
     * if the strategy does not need to prepare anything. Generally used to perform one-time only frame dependant set
     * up. Such as detecting which snapshots are relevant for the strategy or configuring some parameters.</p>
     */
    prepare() {
        console.error("Render strategy has not implemented prepare()")
    }

    /**
     * <p>Get a value for a field in a snapshot.</p>
     * @param {accessFn} accessFn a function that returns a a field that we require from the render strategy. <b>Even
     * if you checked the field existence with shouldDraw(), provide your own checks for undefined values! Return false
     * if a value cannot be accessed (render strategies will handle the false as a sort of exception) or return a
     * fallback value</b>
     * @see accessFn
     * @return {Number|false} <p>Calculated number based off of render strategy</p>
     */
    getField(accessFn) {
        console.error("Render strategy has not implemented getField()")
    }

    /**
     * <p><b>If the game renderer gets false from this, it completely skips drawing the entity. Consider this
     * as a sort of possible optimization carried out for certain strategies, such as interpolation strategy.</b></p>
     * <p>Let the renderer check beforehand if all the values it might need are present in all snapshots it will need
     * to use to extract them. Before accessing any fields by getField(), make sure to first consult the strategy
     * if we can access the fields (i.e. if they exists)! Or you can provide your own checks and fallback values
     * in getField().</p>
     * <p><b>Note: even if an entity passes this shouldDraw test, it does not automatically mean that it is save to get
     * fields from this entity. Always make sure to handle possibilities when data for the entity is missing from
     * one of the snapshots by providing proper checks in {@link getField} and returning false if the data cannot be
     * accessed!</b></p>
     * @see getField
     * @param {accessFn} existentialCheckFn
     * @return {Boolean} whether the value we wish to look for is present in all snapshots relevant for the strategy
     */
    shouldDraw(existentialCheckFn) {
        console.error("Render strategy has not implemented shouldDraw()")
    }

    /**
     * <p>Return the snapshot that is the most relevant to the strategy. The game renderer will only iterate through
     * entities present in the primary snapshot! Meaning only entities in the primary snapshot will ever be considered
     * for rendering.</p>
     * @return {Snapshot} <p>the relevant snapshot that will be used to iterate through in the game renderer. Make sure
     * that all the entities that should be checked whether they can be rendered are contained in the snapshot.</p>
     * <p><b>Can return undefined/null. In such case the GameRenderer will completely skip rendering for the current
     * frame.</p>
     */
    getPrimarySnapshot() {
        console.error("Render strategy has not implemented getPrimarySnapshot()")
    }

    /**
     * <p>Alter the snapshot stash passed in in the constructor to suit the strategy needs.</p>
     */
    configureSnapshotStash() {
        console.error("Render strategy has not implemented configureSnapshotStash()")
    }
}