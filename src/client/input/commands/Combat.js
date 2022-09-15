import * as combatRPCs from "RPC/procedures/CombatRPC";

export function StartPrimaryFire(inputManager, game, inputForwarder) {
    inputForwarder.send(combatRPCs.makePrimaryFire(true))
}
export function StopPrimaryFire(inputManager, game, inputForwarder) {
    inputForwarder.send(combatRPCs.makePrimaryFire(false))
}