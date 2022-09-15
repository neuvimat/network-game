/**
 * <p>Batch of useful utility methods centered around dealings with Objects</p>
 * @namespace
 */
export const OUtils = {
    /**
     *
     * @param {Object} target object that has some values set
     * @param {Object} source object that holds the defaults. Any missing properties in the target object will be
     * filled in with the values from the source object
     */
    defaults(target, source) {
        for (let k in source) {
            if (target[k] === undefined) {
                target[k] = source[k];
            }
        }
    }
};