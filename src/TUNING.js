/**
 * <p>Large table containing multitude of variables used across the game conveniently stored in one place.</p>
 * <p>You can dynamically change this during runtime. If the dependant classes handle using these values by referencing
 * them all the time, the runtime changes may be immediately visible.</p>
 * @namespace
 */
export const TUNING = {
    // GAME
    GAME_ROUND_LENGTH: 180, // in seconds!
    GAME_ROUND_LINGER: 10, // in seconds! how long before reset triggers and new round starts
    PICKUP_SPAWN_RATE: [3,3,6,12,20,30,60],
    MAX_PICKUPS: 7,

    // PICKUP_SPAWN_RATE: [0],
    // MAX_PICKUPS: 500,

    // Player
    PLAYER_HEALTH: 100,
    PLAYER_WIDTH: 24,
    PLAYER_SPEED: .25 * 1.5,
    PLAYER_SPRINT_MULT: 1.0,
    PLAYER_WALK_MULT: 0.5,

    PISTOL_DAMAGE: 25,
    PISTOL_FIRERATE: 20,
    PISTOL_CAPACITY: 10,
    PISTOL_RELOAD: 1,
    PISTOL_MAX: -1,
    PISTOL_SPREAD: 1,
    PISTOL_BULLET_WIDTH: 12,
    PISTOL_BULLET_SPEED: 1.9,

    SMG1_DAMAGE: 25,
    SMG1_FIRERATE: 75,
    SMG1_CAPACITY: 45,
    SMG1_RELOAD: 1800,
    SMG1_MAX: 120,
    SMG1_SPREAD: 3,
    SMG1_BULLET_WIDTH: 10,
    SMG1_BULLET_SPEED: 2.15,

    SHOTGUN_PELLETS_HIGH_SPREAD: 4, // If changing this value during runtime, do not forget to update total value
    SHOTGUN_PELLETS_LOW_SPREAD: 3,
    SHOTGUN_DAMAGE: 20,
    SHOTGUN_FIRERATE: 850,
    SHOTGUN_CAPACITY: 8,
    SHOTGUN_RELOAD: 1,
    SHOTGUN_MAX: -1,
    SHOTGUN_SPREAD: 15,
    SHOTGUN_SPREAD_LOW: 3,
    SHOTGUN_BULLET_WIDTH: 9,
    SHOTGUN_BULLET_SPEED: 1.8,

    MEDKIT_HEAL: 80,

    SAMPLE_WALLS: [
        [[520, 100], [640, 380], [620, 390], [500, 110]],
        [[-960,0],[-760,0],[-830,100],[-900,160],[-960,180]],
        [[-260,-400],[340,-400],[340,-360],[-260,-360]],
        [[275,-250],[300,-250],[300,-90],[275,-90]],
        [[-60,-115],[220,-115],[220,-90],[-60,-90]],
        [[-260,-280],[-235,-280],[-235,-160],[-260,-160]],
    ],
};