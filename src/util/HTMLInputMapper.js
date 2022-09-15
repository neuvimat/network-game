/**
 * <p>Singleton that provides easily accessible data store for values that are changed by HTML inputs.</p>
 * <p>If multiple HTML inputs change the same value inside the store, they all get updated to reflect the newest set
 * value.</p>
 * <p>You can also trigger a change in the values explicitly. In a way this can be repurposed to regular event
 * system.</p>
 * <p>If you need to change other UI elements (or do anything else) based on the changes of value inside the data
 * store, listen for changes to that value and update the other HTML UI element within the callback.</p>
 * @namespace
 */
export const HTMLInputMapper = {
    /**
     * Return current value stored under the id
     * @param {string|HTMLInputMapper.IDs} id
     * @return {*}
     */
    get(id) {
        if (mappedValues[id] !== undefined) {
            return mappedValues[id];
        }
        else {
            console.warn('Requested mapped value was not found! (' + id + ')');
            return null;
        }
    },

    /**
     * Set a new value under the id
     * @param {string|HTMLInputMapper.IDs} id
     * @param {*} value
     */
    set(id, value) {
        // Change the value in the store
        mappedValues[id] = value;
        // Update all inputs that are tied to the id
        if (mappedMutators[id]) {
            for (let l of mappedMutators[id]) {
                // l.e = element, l.a = attribute that we track (can be simple 'value', but also 'checked' or others)
                l.e[l.a] = mappedValues[id];
            }
        }
        // Trigger listeners
        if (mappedListeners[id]) {
            for (let l of mappedListeners[id]) {
                l(mappedValues[id]);
            }
        }
    },

    /**
     * Cause a specified input to automatically change a value inside the store and trigger all listeners
     * @param {HTMLElement} htmlElement input element that is capable of changing a value in the store
     * @param {string|HTMLInputMapper~IDs} id id of the field in the store
     * @param {*} initialValue set initial value for the field in the store. Only the first call to register under a specific id can set the value
     * @param {string} htmlEvent listen for this HTML event to trigger the change in the store
     * @param {string} htmlAttribute set the store's value to value of this attribute of the element
     */
    mapInputToValue(htmlElement, id, initialValue = 0, htmlEvent = 'input', htmlAttribute = 'value') {
        if (mappedValues[id] == null) {
            mappedValues[id] = initialValue;
        }
        if (mappedMutators[id] == null) {
            mappedMutators[id] = [];
        }
        mappedMutators[id].push({e: htmlElement, a: htmlAttribute});

        if (mappedListeners[id] == null) {
            mappedListeners[id] = [];
        }

        htmlElement[htmlAttribute] = mappedValues[id];
        htmlElement.addEventListener(htmlEvent, (e) => {
            // Change the value in the store
            mappedValues[id] = e.target[htmlAttribute];
            // If we have multiple places where the thing changes, update the other inputs
            for (let l of mappedMutators[id]) {
                if (l != htmlElement) {
                    l.e[l.a] = mappedValues[id];
                }
            }
            // Trigger listeners
            for (let l of mappedListeners[id]) {
                l(mappedValues[id]);
            }
        })
    },

    /**
     * @callback NewInputValue
     * @param {*} newValue
     */

    /**
     * Attach a callback to call every time a value under this id in the store changes
     * @param {string|HTMLInputMapper.IDs} id
     * @param {NewInputValue} handler
     */
    listenForValue(id, handler) {
        if (mappedListeners[id] == null) {
            mappedListeners[id] = [];
        }
        if (mappedMutators[id] == null) {
            mappedMutators[id] = [];
        }
        mappedListeners[id].push(handler);
    },
};

/** @type {object<string, string>} */
const mappedValues = {};
/** @type {object<string, NewInputValue>} */
const mappedListeners = {};
/** @type {object<string, HTMLElement>} */
const mappedMutators = {};

/**
 * @memberOf HTMLInputMapper
 * @enum {string}
 */
export const IDs = {
    PlayerHealth: null,
    PlayerAmmo: null,
    RoundTime: null,
    RespawnTime: null,
    FakeLagEnabled: null,
    FakeLagPing: null,
    Ping: null,
    ServerTimeDifference: null,
    RenderStrategy: null,
    Nickname: null,
    Weapon: null,
    Fullscreen: null,
    MapName: null,
    EditorZoom: null,
    EditorCameraX: null,
    EditorCameraY: null,
};

// To allow manual string input, rather than just only IDs.<id>, make all the values match the keys
// So you can call a method with 'Ping' instead of Ids.Ping
for (let k in IDs) {
    IDs[k] = k;
}

/// #if CLIENT
window.HTMLInputMapper = HTMLInputMapper;
/// #endif