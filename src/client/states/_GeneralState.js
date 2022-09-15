/**
 * Generic UI and logic state used on clients. Utilized by the {@link StateManager}
 * @class _GeneralState
 */
export class _GeneralState {
    constructor(stateManager, stateId) {
        this.stateManager = stateManager;
        this.id = stateId;
    }

    /**
     * Basic initialization. It is purposefully split from constructor to allow later inits once all resources are
     * loaded. (However the state manager just triggers this right away, so the purpose is kinda killed, but other
     * state managers might work differently.)
     */
    init() {
        console.error('State did not implement init()');
    }

    /**
     * Triggered whenever this state becomes active.
     * @param {_GeneralState} prevState
     */
    enterState(prevState) {
        console.error('State did not implement enterState(prevState)');
    }

    /**
     * Triggered whenever this state becomes inactive
     * @param newState
     */
    exitState(newState) {
        console.error('State did not implement exitState(newState)');
    }

    /**
     * Utility method to hide HTMLElement. Superseded by {@link BrowserUtils#hide}
     * @param {HTMLElement} e
     * @protected
     * @deprecated
     */
    _hide(e) {
        e.setAttribute('hidden', '')
    }

    /**
     * Utility method to hide HTMLElement. Superseded by {@link BrowserUtils#show}
     * @param {HTMLElement} e
     * @protected
     * @deprecated
     */
    _show(e) {
        e.removeAttribute('hidden')
    }

    /**
     * Utility method to hide HTMLElement. Superseded by {@link BrowserUtils#toggle}
     * @param {HTMLElement} e
     * @protected
     * @deprecated
     */
    _toggle(e) {
        if (e.hasAttribute('hidden')) e.removeAttribute('hidden');
        else e.setAttribute('hidden', '');
    }
}