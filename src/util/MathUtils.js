/**
 * <p>Math utilities</p>
 * @namespace
 */
export const MathUtils = {
    /**
     * <p>Linearly interpolate between two values by value t.
     * @param {number} a
     * @param {number} b
     * @param {number} t
     * @return {number}
     */
    lerp(a,b,t) {
        return a + (b-a) * t;
    },
    /**
     * @param {number} v
     * @param {number} min
     * @param {number} max
     * @return {number} min if v is less than min, max if v is greater than max, else v
     */
    clamp(v, min, max) {
        if (v < min) return min;
        if (v > max) return max;
        return v;
    },

    /**
     * @param a array of two Numbers, x and y coordinate
     * @param b array of two Numbers, x and y coordinate
     * @returns {Array} normalized directional vector between two coordinates a and b
     */
    directionVector(a,b) {
        let c = [b[0] - a[0], b[1] - a[1]];
        let l = Math.sqrt(c[0]*c[0]+c[1]*c[1]);
        c[0] = c[0]/l;
        c[1] = c[1]/l;
        return c;
    },

    /**
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @return {number} squared distance between two coordinates
     */
    distance(x1,y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },

    /**
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @return {number} <b>non-squared</b< distance between two coordinates
     */
    distanceNotSqrt(x1,y1, x2, y2) {
        return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
    },

    /**
     * @param {number} from
     * @param {number} to
     * @return {number} random number from 'from' to 'to', 'from' inclusive, 'to' exclusive
     */
    randomFloat(from, to) {
        return Math.random() * (to-from) + from;
    },

    /**
     * @param {number} from
     * @param {number} to
     * @return {number} random integer from 'from' to 'to', 'from' inclusive, <b>'to' inclusive</b>
     */
    randomInt(from, to) {
        return from + Math.floor(Math.random() * (to-from+1));
    },

    /**
     * <p>0 = right, 90 = down, -90 = top</p>
     * @param rad angle represented in radians
     * @return number[] normalized direction vector
     */
    directionVectorFromAngle(rad) {
        return [Math.cos(rad), Math.sin(rad)];
    },

    /**
     * <p>0 = right, 90 = down, -90 = top</p>
     * @param direction array of two Numbers
     * @return {number}
     */
    angleFromDirection(direction) {
        return Math.atan2(direction[1], direction[0]);
    }
};