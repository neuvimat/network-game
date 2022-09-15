/**
 * Utilities for browser based functions
 * @namespace
 */
export const BrowserUtils = {
    /**
     * <p>If the browser allows, make the supplied element fullscreen.</p>
     * @param {HTMLElement} elem
     * @see {@link fullscreenDocument}
     */
    fullscreenElement(elem) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        }
        else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
        }
        else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            elem.webkitRequestFullscreen();
        }
        else if (elem.msRequestFullscreen) { /* IE/Edge */
            elem.msRequestFullscreen();
        }
    },

    /**
     * <p>If browser allows, rather than just fullscreening a specific element, make the browser itself enter a
     * fullscreen mode.</p>
     * @see {@link fullscreenElement}
     */
    fullscreenDocument() {
        let elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        }
        else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
        }
        else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            elem.webkitRequestFullscreen();
        }
        else if (elem.msRequestFullscreen) { /* IE/Edge */
            elem.msRequestFullscreen();
        }
    },

    /**
     * <p>Make the browser exit fullscreen.</p>
     */
    cancelFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        }
        else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        }
        else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
    },

    /**
     * <p>Add 'hidden' attribute to an element.</p>
     * <p><b>Note: to fix the issue of 'hidden' attribute not actually hiding elements that have a specific display type
     * not working, a CSS workaround has been applied. The issue should not persist.</b></p>
     * @param {HTMLElement} e
     * @return {HTMLElement} e
     */
    hide(e) {
        e.setAttribute('hidden', '');
        return e;
    },

    /**
     * <p>Remove 'hidden' attribute from an element.</p>
     * <p><b>Note: to fix the issue of 'hidden' attribute not actually hiding elements that have a specific display type
     * not working, a CSS workaround has been applied. The issue should not persist.</b></p>
     * @param {HTMLElement} e
     * @return {HTMLElement} e
     */
    show(e) {
        e.removeAttribute('hidden');
        return e;
    },

    /**
     * <p>Add 'hidden' attribute to an element if it does not have one, remove 'hidden' attribute if it does have it.</p>
     * <p><b>Note: to fix the issue of 'hidden' attribute not actually hiding elements that have a specific display type
     * not working, a CSS workaround has been applied. The issue should not persist.</b></p>
     * @param {HTMLElement} e
     * @return {HTMLElement} e
     */
    toggle(e) {
        if (e.hasAttribute('hidden')) e.removeEventListener('hidden');
        else e.setAttribute('hidden', '');
        return e;
    },
};