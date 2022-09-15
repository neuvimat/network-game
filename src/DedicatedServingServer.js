// This is the entry point

// Allow source maps for node.js (does not create a clickable link to source file, but better than working link
// to a bundled file...)
import 'source-map-support/register'

import createHttpServer from './HttpServer'
import {ServerGameRunner} from './ServerGameRunner'
import {GLOBALS} from "Root/GLOBALS";

console.log('============== Starting server: list of features');
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
console.log('============== Regular debug below:');

function randomString(length) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

GLOBALS.adminToken = randomString(12);
console.log('Admin token is: ' + GLOBALS.adminToken);
let server = createHttpServer();  // Create the actual http server
let serverGameSimulation = new ServerGameRunner(server);
// Don't start the game right away. Websocket will alert the gameloop once a player joins and it will start the game
// serverGameSimulation.start();