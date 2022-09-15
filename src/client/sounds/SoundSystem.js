import {SoundDef} from "./SoundDef";
import {SoundPool} from "./SoundPool";

/**
 * <p>Singleton. Handles requests for playing sounds. Register all the sounds you might want to play first by addSound
 * method before actually issuing requests to play them.</p>
 * @type {{globalVolume: number, soundPools: Map<String, SoundPool>}}
 */
export const SoundSystem = {
    globalVolume: 0.25,
    soundPools: new Map(),

    /**
     * Issues a request to play a sound with specified id.
     * @param soundId id of the sound registered in the system
     */
    play(soundId) {
        let s = this.soundPools.get(soundId);
        if (s) {
            s.play();
        }
        else {
            console.error('SoundSystem was asked to play a sound that it has not record of!', soundId);
        }
    },

    /**
     * Register a sound to this sound system. Sound system can only play registered sounds!
     * @param {string} id register the sound under this id
     * @param {string} src path to the audio file
     * @param {array} pitch array of two Numbers, low and high boundary of random pitch
     * @param {array} volume array of two Numbers, low and high boundary of random volume
     * @param {number} maxInstances play maximum of this number of this sound simultaneously
     * @param {number} clipping if more instances of this sound should play than maxInstances allows, clip the earliest sound
     *     and replay it if its playback progressed past this time mark [in seconds!] 0 = clip anytime, -1 = never clip
     * @param {boolean} loop
     */
    addSound(id, src, pitch, volume, maxInstances, clipping, loop = false) {
        let soundDef = new SoundDef(id, pitch, volume, src, maxInstances, clipping, loop);
        this.soundPools.set(id, new SoundPool(soundDef));
    },
};