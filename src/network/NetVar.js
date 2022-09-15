/**
 * NOT IMPLEMENTED PROPERLY, IGNORE FOR NOW
 * There is some code already and I did not feel like deleting it because of that and it might come in handy later
 * It would be nice to remove this from the project for better readability, but w/e
 */
export class NetVar {
    static idTracker = 0;
    /**
     * @type {NetVarStash}
     */
    static stash = null;
    constructor(value) {
        this.id = 'nv' + NetVar.idTracker++;
        this._value = value;
        this.callbacks = [];
        NetVar.stash.registerNetVar(this);
    }

    set value(val) {
        let oldValue = this._value;
        this._value = val;
        NetVar.stash.announceDirty(this);
        for (let c of this.callbacks) {
            c(oldValue, this.value);
        }
    }
    get value() {
        return this._value;
    }

    listenForChange(callback) {
        this.callbacks.push(callback)
    }
}