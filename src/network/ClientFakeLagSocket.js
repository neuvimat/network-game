/**
 * <p>Implements basic methods to be somewhat compliant with regular base socket. Allows listening to events: message,
 * open, close, error, and sending data with fake lag.</p>
 * <p>The inputted lag is appended to both send and receive, i.e.
 * attached delay of 20ms would mean 20ms delay before sending the message and then another 20ms delay upon receiving
 * the message, resulting in additional total delay of 40ms.</p>
 */
export class ClientFakeLagSocket {
    constructor(url, lag) {
        this.ws = new WebSocket(url);
        this.lag = lag;
        this.onListeteners = {message: [], open: [], error: [], close: []};

        this.ws.onmessage = (msg) => {
            setTimeout(() => {
                for (let l of this.onListeteners.message) {
                    l(msg);
                }
            }, this.lag);
        };
        this.ws.onopen = () => {
            setTimeout(() => {
                for (let l of this.onListeteners.open) {
                    l();
                }
            }, this.lag);
        };
        this.ws.onerror = (err) => {
            setTimeout(() => {
                for (let l of this.onListeteners.error) {
                    l(err);
                }
            }, this.lag);
        };
        this.ws.onclose = () => {
            setTimeout(() => {
                for (let l of this.onListeteners.close) {
                    l();
                }
            }, this.lag);
        };
    }

    send(data) {
        setTimeout(() => {
            this.ws.send(data);
        }, this.lag);
    }

    set onmessage(handler) {
        this.on('message', handler);
    }

    set onerror(handler) {
        this.on('error', handler);
    }

    set onclose(handler) {
        this.on('close', handler);
    }

    set onopen(handler) {
        this.on('open', handler);
    }

    on(event, handler) {
        if (this.onListeteners[event] != undefined) {
            this.onListeteners[event].push(handler);
        }
        else {
            console.error('ClientFakeLagSocket does not support ' + event + ' event type! (supported are: message, open, close, error)');
        }
    }

    close(code, reason) {
        this.ws.close(code, reason);
    }

    /**
     * <p>May cause unexpected behavior if changed during runtime, such as changing order of incoming messages.</p>
     * @param {Number} lag
     */
    setLag(lag) {
        this.lag = lag;
    }
}