import {_GeneralState} from "Client/states/_GeneralState";
import {STATES} from "Client/states/StateManager";
import {GLOBALS} from "Root/GLOBALS";
import {HTMLInputMapper, IDs} from "Util/HTMLInputMapper";

/**
 *
 * @extends _GeneralState
 */
export class MenuState extends _GeneralState {
    constructor(stateManager) {
        super(stateManager, STATES.MENU_STATE);
        this.stateManager = stateManager;
        this.e = {
            singleplayer: null,
            multiplayer: null,
            host: null,
            wsUrl: null,
            wrapper: null,
            netImp: null,
            fakeLagEnabled: null,
            fakeLagPing: null,
            fakeLagPing2: null,
            extrapolate: null,
            nickname: null,
            fullscreen: null,
        }
    }

    init() {
        window.addEventListener('load', (e) => {
            // Assign variables
            this.e.singleplayer = document.getElementById('singleplayer');
            this.e.multiplayer = document.getElementById('multiplayer');
            this.e.host = document.getElementById('host');
            this.e.wsUrl = document.getElementById('wsUrl');
            this.e.wrapper = document.getElementById('menu');
            this.e.netImp = document.getElementById('netImp');
            this.e.fakeLagEnabled = document.getElementById('fakeLagEnabled');
            this.e.fakeLagPing = document.getElementById('fakeLagPing');
            this.e.nickname = document.getElementById('nickname');
            this.e.fullscreen = document.getElementById('fullscreen');

            // Setup inputs + values re-renders once input is received
            HTMLInputMapper.mapInputToValue(this.e.fakeLagPing, IDs.FakeLagPing, 50);
            HTMLInputMapper.mapInputToValue(this.e.fakeLagEnabled, IDs.FakeLagEnabled, false, 'input', 'checked');
            HTMLInputMapper.mapInputToValue(this.e.fullscreen, IDs.Fullscreen, true, 'input', 'checked');
            HTMLInputMapper.mapInputToValue(this.e.netImp, IDs.RenderStrategy, 'extrapolation');
            let nickname = 'Guest #' + Math.floor(Math.random()*100000);
            HTMLInputMapper.mapInputToValue(this.e.nickname, IDs.Nickname, nickname);

            this.e.multiplayer.addEventListener('click', () => {
                    this._requestMultiplayer();
                }
            );

            this.e.singleplayer.addEventListener('click', ()=>{
                this._requestSingleplayer();
            })
        })
    }

    _requestMultiplayer() {
        this.stateManager.requestStateChange(STATES.GAME_STATE);
    }

    _requestSingleplayer() {
        this.stateManager.requestStateChange(STATES.LOCAL_GAME_STATE);
    }

    enterState(prevState) {
        this._show(this.e.wrapper);
    }

    exitState(newState) {
        this._hide(this.e.wrapper);
    }

    canChangeState() {
        return true;
    }
}