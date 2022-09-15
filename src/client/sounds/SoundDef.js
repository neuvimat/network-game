/**
 * Simple data store of meta data for one specific sound type
 */
export class SoundDef {
    /**
     * @param {string} id register the sound under this id
     * @param {string} src path to the audio file
     * @param {array} pitch array of two Numbers, low and high boundary of random pitch
     * @param {array} volume array of two Numbers, low and high boundary of random volume
     * @param {number} maxInstances play maximum of this number of this sound simultaneously
     * @param {number} clipping if more instances of this sound should play than maxInstances allows, clip the earliest sound
     *     and replay it if its playback progressed past this time mark [in seconds!] 0 = clip anytime, -1 = never clip
     * @param {boolean} loop
     */
    constructor(id, pitch, volume, src, maxInstances, clipping, loop) {
        this.id = id;
        this.pitch = pitch;
        this.volume = volume;
        this.src = src;
        this.maxInstances = maxInstances;
        this.clipping = clipping;
        this.loop = loop;
    }
}