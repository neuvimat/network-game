import * as movementRPCs from 'RPC/procedures/MovementRPC'

export function MoveUp(inputManager, game, inputForwarder) {
    inputForwarder.send(movementRPCs.makeMoveUp(true))
}
export function MoveLeft(inputManager, game, inputForwarder) {
    inputForwarder.send(movementRPCs.makeMoveLeft(true))
}
export function MoveDown(inputManager, game, inputForwarder) {
    inputForwarder.send(movementRPCs.makeMoveDown(true))
}
export function MoveRight(inputManager, game, inputForwarder) {
    inputForwarder.send(movementRPCs.makeMoveRight(true))
}
export function StopUp(inputManager, game, inputForwarder) {
    inputForwarder.send(movementRPCs.makeMoveUp(false))
}
export function StopLeft(inputManager, game, inputForwarder) {
    inputForwarder.send(movementRPCs.makeMoveLeft(false))
}
export function StopDown(inputManager, game, inputForwarder) {
    inputForwarder.send(movementRPCs.makeMoveDown(false))
}
export function StopRight(inputManager, game, inputForwarder) {
    inputForwarder.send(movementRPCs.makeMoveRight(false))
}
export function StartSprint(inputManager, game, inputForwarder) {
    inputForwarder.send(movementRPCs.makeSprint(true))
}
export function StopSprint(inputManager, game, inputForwarder) {
    inputForwarder.send(movementRPCs.makeSprint(false))
}
export function StartWalk(inputManager, game, inputForwarder) {
    inputForwarder.send(movementRPCs.makeWalk(true))
}
export function StopWalk(inputManager, game, inputForwarder) {
    inputForwarder.send(movementRPCs.makeWalk(false))
}