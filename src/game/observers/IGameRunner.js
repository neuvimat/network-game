/**
 * Specifies the implementing class as a game loop in which {@link Game} simulation runs. This works in conjunction
 * with {@link GameObserver}, that, if used, will send cue to the GameRunner when round starts or ends.
 * @interface
 */
export class IGameRunner {
    /**
     * Reset both the game runner AND the game
     */
    resetLoopAndGame() {

    }

    /**
     * Start the loop
     */
    start() {

    }
}