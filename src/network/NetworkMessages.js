/**
 * @typedef {Object} NetworkMessage
 * @property {string} type code/id of the message
 * @property {*} payload actual passed in data
 */

/**
 * <p>Factory singleton class for creating {@link NetworkMessage}s</p>
 * <p>Use the 'make' method to create an instance of one. In rare cases some other creation methods may exits.</p>
 * <p>Use the 'code' property (id) to react to a specific message in one of the message handlers.</p>
 * @namespace
 */
export const NetworkMessages = {
    gameRoundEnd: {
        code: 'gameRoundEnd',
        /**
         * @param newRoundInSeconds
         * @param {String} winner
         * @return {{type: *, payload: {nextRoundInSeconds: *}}}
         */
        make(newRoundInSeconds, winner) {
            return {
                type: this.code,
                payload: {nextRoundInSeconds: newRoundInSeconds, winner: winner},
            }
        },
    },
    bundle: {
        code: 'bundle',
        /**
         * <p>Create a bundle NetworkMessage from array of messages. Make sure there are <b>NO nested arrays.</b></p>
         * @param {NetworkMessage[]} array
         * @return {NetworkMessage}
         */
        make(array) {
            return {
                type: this.code,
                payload: array,
            }
        },
        /**
         * <p>Create a bundled NetworkMessage via the ...rest operator. You do not need to pass in an array, but
         * separate messages as separate arguments. Make sure <b>to NOT pass in arrays</b>.</p>
         * @param {NetworkMessage} messages
         * @return {NetworkMessage}
         */
        makeRest(...messages) {
            return {
                type: this.code,
                payload: messages
            }
        }
    },
    gameRoundStart: {
        code: 'gameRoundStart',
        /**
         * @param duration
         * @return {{type: *, payload: {duration: *}}}
         */
        make(duration) {
            return {
                type: this.code,
                payload: {duration: duration}
            }
        }
    },
    scoreNewRow: {
        code: 'scoreNewRow',
        make(rowId, row) {
            return {
                type: this.code,
                payload: {rowId: rowId, row: row}
            }
        }
    },
    scoreRemoveRow: {
        code: 'scoreRemoveRow',
        make(rowId) {
            return {
                type: this.code,
                payload: {rowId: rowId}
            }
        }
    },
    scoreUpdateRow: {
        code: 'scoreUpdateRow',
        make(rowId, dataIndex, value) {
            return {
                type: this.code,
                payload: {rowId: rowId, dataIndex: dataIndex, value: value}
            }
        }
    },
    scoreFullUpdate: {
        code: 'scoreFullUpdate',
        make(rows) {
            return {
                type: this.code,
                payload: {rows: rows}
            }
        }
    },
    sessionEnd: {
        code: 'kys',
        make(msg) {
            return {
                type: this.code,
                payload: {msg: msg}
            }
        }
    },
    joinRequest: {
        code: 'joinRequest',
        make(nickname) {
            return {type: this.code, payload: {nickname: nickname}}
        }
    },
    consoleMsg: {
        code: 'consoleMsg',
        make(msg, lvl = 0) {
            return {type: this.code, payload: {msg: msg, lvl: lvl}}
        }
    },
    adminify: {
        code: 'adminify',
        make(secret) {
            return {type: this.code, payload: {secret: secret}}
        }
    },
    forceScoreboardUpdate: {
        code: 'forceScoreboardUpdate',
        make(rowId, dataIndex, value) {
            return {
                type: this.code,
                payload: {rowId: rowId, dataIndex: dataIndex, value: value}
            }
        }
    },
    forceTuningChange: {
        code: 'forceTuningChange',
        make(key, value) {
            return {
                type: this.code,
                payload: {key: key, value: value}
            }
        }
    },
    forceTuningArrayChanges: {
        code: 'forceTuningArrayChanges',
        make(arr) {
            return {
                type: this.code,
                payload: arr
            }
        }
    },
    playSound: {
        code: 'playSound',
        make(soundCode) {
            return {
                type: this.code,
                payload: {sound: soundCode}
            }
        }
    },
    updateAmmo: {
        code: 'updateAmmo',
        make(msg) {
            return {
                type: this.code,
                payload: {msg: msg}
            }
        }
    },
    snapshot: {
        code: 'snapshot',
        make(snapshot) {
            return {
                type: this.code,
                payload: snapshot,
            }
        }
    },
    ping: {
        code: 'ping',
        make() {
            return {
                type: this.code,
            }
        }
    },
    pong: {
        code: 'pong',
        make(time) {
            return {
                type: this.code,
                payload: time,
            }
        }
    },
    epilepsy: {
        code: 'epilepsy',
        make() {
            return {
                type: this.code,
            }
        }
    },
    rpc: {
        code: 'rpc',
        /**
         * <p>Please use a factory method attached to RPCHandler to make an RPC message.</p>
         * <p>The reason for that is because the RPC handler and its factory method was created before NetworkMessages
         * was a thing.</p>
         * @deprecated
         * @param rpc
         * @return {{type: *, payload: *}}
         */
        make(rpc) {
            console.error('You are creting an RPC message via NetworkMessages method!');
            return {
                type: this.code,
                payload: rpc,
            }
        }
    },
    welcome: {
        code: 'welcome',
        make(id, color, duration, walls, mapName) {
            return {
                type: this.code,
                payload: {
                    id: id,
                    color: color,
                    duration: duration,
                    walls: walls,
                    mapName: mapName,
                }
            }
        }
    },
    playerInfo: {
        code: 'playerInfo',
        make(health) {
            return {
                type: this.code,
                payload: {health: health,}
            }
        }
    },
    shotFired: {
        code: 'shotFired',
        make(health) {
            return {
                type: this.code,
                payload: {health: health,}
            }
        }
    },
    map: {
        code: 'map',
        make(walls, map) {
            return {
                type: this.code,
                payload: {walls: walls, mapName: map}
            }
        }
    },
};