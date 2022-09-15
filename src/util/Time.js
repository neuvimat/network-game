/**
 * <p><b>Mostly client</b> side utility object for accessing time. formatTime and formatDate are still safe to use
 * server side.</p>
 * @namespace
 */
export const Time = {
    localStart: 0,
    serverDelta: 0,

    /**
     * @return {number} <p>the current time in ms since 1970...</p>
     */
    localNow() {
        return Date.now();
    },

    /**
     * @return {number} elapsed time in ms since the game started
     */
    gameNow() {
        /// #if SERVER
        console.warn('This method may not work properly server side! Use the appropriate method on Game object instead!');
        /// #endif
        return Date.now() - this.localStart;
    },

    /**
     * <p><b>Client side</b></p>
     * @return {number} <p>current time in ms since 1970... on the server. Approximated by ping messages by latency and
     * time difference between local now and server now.</p>
     */
    serverNow() {
        /// #if SERVER
        console.warn('You are using serverNow(), which is a client side helper method! Use localNow() instead when on server to get serverNow()!');
        return Date.now();
        /// #endif
        return Date.now() - this.serverDelta;
    },

    /**
     * @param {number} time
     * @return {string} minutes:seconds:milliseconds, all numbers padded up to two zeros
     */
    formatTime(time) {
        return this.formatDate(new Date(time));
    },

    /**
     * <p>Similar to {@link formatTime}, but works with a {@link Date} object rather than {@link Number} represing
     * elapsed ms since 1970...</p>
     * @param {Date} date
     * @return {string} minutes:seconds:milliseconds, all numbers padded up to two zeros
     */
    formatDate(date) {
        return ('' + date.getMinutes()).padStart(2, '0') + ':' + ('' + date.getSeconds()).padStart(2, '0') + ':' + ('' + date.getMilliseconds()).padStart(2, '0')
    },
};