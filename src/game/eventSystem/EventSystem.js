import {ArrayUtils} from "Root/util/ArrayUtils";

/**
 * Listener for events dispatched by {@link EventSystem}
 * @callback EventSystem~Listener
 * @param {EventSystem~Event} event
 */

/**
 * Event <b>MUST</b> have a 'code' property and any number of other properties relevant to that specific event
 * @typedef EventSystem~Event
 * @property {string} code unique identificator of the event.
 */

/**
 * <p>Generic and simple event system.</p>
 * <p>Each event has its string id. For each event there is an array of listeners (callbacks) that get triggered
 * when an event with that specific id is fired.</p>
 * <p>For easier use of events, every event should be represented by its own class that should have a 'code' property
 * in its prototype.</p>
 * <p>This way to listen to a specific event, use the {@link EventSystem#addListener} and pass in
 * *YourEventClass*.prototype.code and your listener.</p>
 * <p>To fire an event, call {@link EventSystem#addListener} and pass in an instance of that event. The method will read
 * the instance's code and trigger appropriate listeners.</p>
 */
export class EventSystem {
    constructor() {
        /**
         *
         * @type {object.<string, EventSystem~Listener[]>}
         */
        this.events = {};
    }

    /**
     * Fire an event. The method reads the 'code' property of passed in event instance and fires all listeners
     * registered to that code.
     * @param {EventSystem~Event} event instance of event to fire
     */
    fireEvent(event) {
        if (this.events[event.code]) {
            for (let l of this.events[event.code]) {
                l(event);
            }
        }
    };

    /**
     * Add a new listener to specific event code
     * @param {string} eventCode
     * @param {EventSystem~Listener} listener
     */
    addListener(eventCode, listener) {
        if (!this.events[eventCode]) {
            this.events[eventCode] = [];
        }
        this.events[eventCode].push(listener);
    }

    /**
     * Remove specific listener for specific event
     * @param {string} eventCode
     * @param {EventSystem~Listener} listener
     * @return {boolean} true if the listener was found and removed
     */
    removeListener(eventCode, listener) {
        if (this.events[eventCode]) {
            return ArrayUtils.removeObject(this.events[eventCode], listener)
        }
        return false;
    }
}

EventSystem.idGiver = 0;
/**
 * <p>Generates a unique event id for an event. Each event needs to have a 'code' property, that is unique to that
 * event type. Unless you wish to provide your own descriptive codes and make sure they are unique, use this utility
 * method.</p>
 * @return {string}
 */
EventSystem.generateId = function () {
    return 'event' + (EventSystem.idGiver++);
};