import {WebsocketInputForwarder} from 'Client/input/forwarders/WebsocketInputForwarder'
import {InputManager} from 'Client/input/InputManager'
import {GameRenderer} from 'Game/renderer/GameRenderer'
import {GLOBALS} from "Root/GLOBALS";
import {STATES, StateManager} from "Client/states/StateManager";
import {Logger} from "Util/Logger";
import {LoggerUI} from "Util/LoggerUI";
import {ImageBank} from "Game/renderer/ImageBank";
import {SoundSystem} from "Client/sounds/SoundSystem";

// Entry point for Client

// Configure some globals, they are mostly unused, but when suddenly a need arises to call upon something, it is so
// annoying to refactor the code to provide the reference where it needs to be
GLOBALS.ws = null;
GLOBALS.inputForwarder = new WebsocketInputForwarder(GLOBALS.ws);
GLOBALS.renderer = new GameRenderer();
GLOBALS.inputManager = new InputManager(undefined); // inputManager needs stateManager and stateManager needs inputManager, once will have to init itself later
GLOBALS.stateManager = new StateManager(GLOBALS.inputManager);
GLOBALS.inputManager.stateManager = GLOBALS.stateManager;

// Init images and sounds
ImageBank.addImagesFromNode('graphics');
SoundSystem.addSound('pistol_shot', './sfx/pistol_fire.wav', [.8, 1.2], [.65, .75], 2, 0.1);
SoundSystem.addSound('smg1_shot', './sfx/smg_fire.wav', [.8, 1.2], [.35, .45], 5, .1);
SoundSystem.addSound('shotgun_shot', './sfx/shotgun_fire.wav', [.9, 1.1], [.65, .75], 3, .4);
SoundSystem.addSound('music', './sfx/music2.mp3', [1,1], [.6,.6], 1, -1, true);

window.addEventListener('load', function () {
    GLOBALS.stateManager.requestStateChange(STATES.MENU_STATE);

    // Autofill relevant websocket url
    let wsUrl = document.getElementById('wsUrl');
    wsUrl.value = window.websocketUrl;

    // Init the Logger singleton
    Logger.init(2);
    // For debug purposes, allow access to the logger via browser console ('this' being window in current context)
    this.logger = Logger;
    let loggerUI = new LoggerUI(Logger, document.getElementById('log')); // Create a new UI for Logger
    loggerUI.init(); // Init the logger into that element (adds some buttons, etc.)

    // Awful, but worth it for testing, should be in input manager somewhere
    window.addEventListener('keydown', (e) => {
        if (e.code == 'KeyP') {
            loggerUI.show();
        }
    })
});


// Print with what settings the code is compiled

/// #if DEBUG
console.log('Running on DEBUG version');
/// #else
console.log('Running on PRODUCTION version');
/// #endif

/// #if CLIENT
console.log('Client features are turned on!');
/// #else
console.log('Client features are disabled!!');
/// #endif

/// #if SERVER
console.log('Server features are turned on!');
/// #else
console.log('Server features are disabled!!');
/// #endif
