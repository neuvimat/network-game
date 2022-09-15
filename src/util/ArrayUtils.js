/**
 * <p>Batch of useful utility methods centered around dealing with Arrays</p>
 * @namespace
 */
export const ArrayUtils = {
    /**
     * <p>Checks that the object is in the array, if it is, removes it, else prints a warning</p>
     * @param array array to remove the object from
     * @param object reference to the object that is to be removed
     * @return {boolean} true if object was present and deleted, false otherwise
     */
    removeObject(array, object) {
        let index = array.indexOf(object);
        if (index !== -1) {
            array.splice(array.indexOf(object), 1);
            return true;
        }
        else {
            console.warn('ArrayUtils: removeObject() - object was not found in the array! Object: ', object, 'Array: ', array)
            return false;
        }
    },

    /**
     * @param {Array} array
     * @param {*} object
     * @return {Boolean} true  if the object is present within the array. <b>Does not make use of equals method, checks
     * for reference if a value is not primitive.</b>
     */
    isPresent(array, object) {
        return array.indexOf(object) !== -1;
    },

    /**
     * <p>Return random value from the array</p>
     * @param {Array} array
     * @return {*}
     */
    randomValue(array) {
        return (array[Math.floor(Math.random() * array.length)])
    }
};