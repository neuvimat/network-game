# Network-game
This project is a small online game with main focus to demonstrate the difference between extrapolation and interpolation and its effects on user experience in networked environments that require real time synchronization.

This repository was created for my bachelor's thesis: [Distributed state synchronization (DSpace)](https://dspace.cvut.cz/handle/10467/87656), [thesis text (available only in Czech)](https://dspace.cvut.cz/bitstream/handle/10467/87656/F3-BP-2020-Neuvirt-Matyas-synchronizace_distribuovaneho_stavu.pdf?sequence=-1&isAllowed=y).

Online demo link: work in progress.

## Overview

The game is simple isometric top down 2D shooter game. The graphics are just simple colored shapes. The game spawns different power-ups (healing, different weapons). The player with the most frags wins. The game features a multiple map rotation. If no players are present, the server 'freezes' to conserve resources.

The game also allows to play the game in a single player session, reusing the multiplayer Node.js code running on utilizing websockets to be run locally in the browser.

Because the local session reuses the same code as the dedicated server, the code is tailored to and processed by [Webpack](https://webpack.js.org/) and [ifdef-loader](https://www.npmjs.com/package/ifdef-loader) to allow reuse between the web browser and Node.js environment. Mainly unifying the import/export module system across the source code, which is later minified and bundled for both browsers and Node.js.

The project also features an accessible map editor that allows storing the developed maps in .json. These maps then can be placed in the server's map folder to add them to the rotation (requires restart).

# Developer info and running the project

## Useful commands
`npm run build` - builds the required .js bundles   
`npm run start` - starts the server at port 3000  
`npm run test` - runs tests (the is very few of them)  
`npm run watchFront` - makes webpack watch files relevant for front end  
`npm run watchBack`- makes webpack watch files relevant for back end  
`npm run jsdoc` - creates documentation and places it into `docs` folder
## Running the game
Note that port 3000 needs to be clear for the game to run.
To run the project from cloned repository, run the following commands:
```
npm i
npm run build  
npm run start
```
This starts a web server running on port 3000. To access the game, enter `localhost:3000` into web browser's address
 bar.
 
**Note: requires Node.js, version 12.x.x or higher. (should run on older versions if you provide Array.prototype.flat() polyfill)**

If you wish to deploy the minimal version of the game (i.e. only files required to run the game, no source code) you need to:
1. build the source files 
    ```
    npm run build
    ```
2. copy `bin`, `dist`, `maps` and `views` folder onto the server. All these folders need to be on the same level
3. copy package.json above the level of `bin` folder and get all the external node modules by running
    ```
   npm i
    ```
4. run Node.js and as a target specify the DedicatedServingServer.js in `bin` folder, example:
   ```
   node bin/DedicatedServingServer.js
   ```

## Project structure
Both Node.js server and browser based client run from bundled .js files. Server bundles are located in `bin` folder, client bundles are located in the `dist/js` folder.

`bin` - server executable(s) are placed here  
`dist` - everything within this folder is accessible to web browser client  
`docs` - by JSDoc generated documentation (missing by default, needs to be generated)  
`maps` - maps readable by the game stored as .json  
`psd` - source photoshop files  
`routes` - express routers  
`src` - discussed in more detail below  
`test` - mocha test folder  
`views` - all client html files reside here as .twig, when needed by router, they get processed and sent to client  

## src folder structure
    ├── src                            
        ├── client                      # client specific features
        │   ├── input                       # input handling (mouse, keyboard)
        │   │   ├── commands                    # command bundles
        │   │   ├── forwarders                  # specific implementations of client-server command forwarders
        │   │   └── states                      # different input state configs (game/main menu/...)
        │   ├── sounds                      # sound system specific classes
        │   └── states                      # states of the client (main menu/game)
        ├── editor                      # editor specific classess
        ├── game                        # mostly server features
        │   ├── components                      # functionalities (components) utilized by entities
        │   ├── eventSystem                     # event system utilized by game and helper classes  
        │   ├── map                             # game map features and classes
        │   ├── models                          # data models, replacement for inline object literals for readability. Heavily underused
        │   ├── observers                       # utility class(es) that listen to Game sim changes and propagate them to clients via StateDistributors
        │   ├── prefabs                         # entity definitions (prefabs)
        │   ├── renderer                        # instructions on how to render renderSnapshots (technically could be in client folder)
        │   ├── scheduler                       # manager handling delayed tasks
        │   └── weapon                          # classes representing equipable weapons
        ├── network                     # helper classes for networking
        ├── rpc                         # client-server input handling
        │   └── procedures                  # data objects representing specific actions by clients
        └── util                        # all kinds of utilites
        
## Documentation
Generate documentation by running:
```
npm run jsdoc
```
This creates a `docs` folder on project level. Navigate inside and open `index.html`.
        
## Entry points
To get to know the code, start by looking over these files and inside classes they utilize:  
Server: `DedicatedServingServer.js` in `src`  
Client: `Client.js` in `src`  
Editor: `Editor.js` in `src`  

## Other interesting parts
Given the topic of this bachelor thesis project, some highly relevant classes to look at:  
`GameRenderer.js` in `src/game/rendrer/`  
`IRenderStrategy.js` and its specializations in `src/game/rendrer/staregies`

## ifdef-loader webpack plugin
[This plugin](https://www.npmjs.com/package/ifdef-loader) allows webpack to omit or insert certain parts of code
 depending on variables provided inside webpack configuration. Uses simple directives. Minimal exmaple:
```
/// #if DEBUG

// printed only if DEBUG variable inside webpack config exists and evaluates to true
console.log("Running DEBUG build.")
 
/// #endif
```

In rare cases both Client and Server use same class to operate, however some changes inside the class may be necessary
 depending on where the code is ran. By using the plugin there is no need to create separate implementations.
 
Example from `src/game/map/Map.js`:  
Server version imports file system. Client version omits this, as file system is not present in a browser, and instead
always returns a basic dummy map.

In rare cases some `console.log`s are embedded inside directives to not clutter production builds.

## Planned features
### Configuration loader
Load server configuration from .json file inside `/bin` folder for convenience. Right now any configuration takes place
inside source code.
