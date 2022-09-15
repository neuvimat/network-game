import * as combatRPCs from "RPC/procedures/CombatRPC";
import {GLOBALS} from "Root/GLOBALS";

export function ShowScoreboard(inputManager, game, inputForwarder) {
    GLOBALS.stateManager.gameState.showScoreboard(true);
}
export function HideScoreboard(inputManager, game, inputForwarder) {
    GLOBALS.stateManager.gameState.showScoreboard(false);
}

export function ToggleMenu(inputManager, game, inputForwarder) {
    GLOBALS.stateManager.gameState.toggleMenu();
}