import {MathUtils} from "Root/util/MathUtils";
import {SoundSystem} from "./SoundSystem";

/**
 * <p>Wrapper class that handles the actual sound playing. Keeps track of already playing instances, limits the maximum
 * amount of instances of the sound at one instant and if specified clips already playing and restarts them if
 * needed.</p>
 * <p>Each pool handles only one specific sound defined by SoundDef class</p>
 * Utilized by the SoundSystem.</p>
 * @see SoundSystem
 * @see SoundDef
 */
export class SoundPool {
    /**
     *
     * @param soundDef {SoundDef} meta data about the sound this pool handles
     */
    constructor(soundDef) {
        this.soundDef = soundDef;
        this.instances = [];
        this.playing = 0;
        this.pointer = 0;

        for (let i = 0; i < this.soundDef.maxInstances; i++) {
            let e = document.createElement('audio');
            e.src = this.soundDef.src;
            e.addEventListener('ended', () => {this._onAudioEnded();});
            this.instances.push(e);
            if (this.soundDef.loop) {
                e.loop = true;
            }
            // We do not even need to append them to the document!
        }
    }

    /**
     * <p>Play the sound this pool handles. If all instances are playing already, and if clipping policy allows, resets
     * and plays the earliest playing sound. Otherwise ignore the play request.</p>
     */
    play() {
        let sound = this.instances[this.pointer];
        if (this.playing < this.soundDef.maxInstances) {
            this.randomizeSound(sound);
            sound.play();
            this.playing++;
            this._incrementPointer();
        }
        else {
            if (this.soundDef.clipping != -1 && sound.currentTime > this.soundDef.clipping) {
                this.randomizeSound(sound);
                sound.currentTime = 0;
                sound.play();
                this._incrementPointer();
            }
        }
    }

    /**
     * Randomizes the sound volume and pitch (playbackRate) based on the SoundDef
     * @param sound concrete instance of pooled audio element
     */
    randomizeSound(sound) {
        sound.volume = MathUtils.randomFloat(this.soundDef.volume[0], this.soundDef.volume[1]) * SoundSystem.globalVolume;
        sound.playbackRate = MathUtils.randomFloat(this.soundDef.pitch[0], this.soundDef.pitch[1]);
    }

    /**
     * Increment the inner pointer and make sure it loops properly
     * @private
     */
    _incrementPointer() {
        this.pointer++;
        this.pointer %= this.soundDef.maxInstances;
    }

    /**
     * @private
     */
    _onAudioEnded() {
        this.playing -= 1;
    }
}