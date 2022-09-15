/**
 * NOT IMPLEMENTED PROPERLY, IGNORE FOR NOW
 * There is some code already and I did not feel like deleting it because of that and it might come in handy later
 * It would be nice to remove this from the project for better readability, but w/e
 */
export class NetVarStash {
    constructor() {
        this.registeredNetVars = {};
        this.dirtyNetVars = {};
    }

    announceDirty(netVar) {
        this.dirtyNetVars[netVar.id] = netVar.value;
    }

    registerNetVar(netVar) {
        this.registeredNetVars[netVar.id] = netVar;
    }

    forgetNetVar() {

    }

    checkOutAndClean() {
        let temp = this.checkOut();
        this.clean();
    }

    checkOut() {
        let temp = [];
        for (let dirt in this.dirtyNetVars) {
            temp.push({id: this.dirtyNetVars[dirt].id, value: this.dirtyNetVars[dirt]});
        }
        return temp;
    }

    clean() {
        this.dirtyNetVars = {};
    }
}
// todo: netvars, find out elegant way for automatic pairing of netvats on client and host