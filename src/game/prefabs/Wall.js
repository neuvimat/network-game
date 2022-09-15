import {Entity, ETYPE} from "Game/prefabs/Entity";
import {Game} from "Game/Game";
import {TAG} from "Game/Tags";
import {PREFABS} from "Game/Prefabs";

/**
 * Special entity that does nothing but stand in one place and collide with other objects.
 */
export class Wall extends Entity {
    constructor(x,y,vertices) {
        super();
        this.addTag(TAG.WALL);

        this.vertices = vertices;

        this.setUpCollision(Game.pSystem.createPolygon(x,y, this.vertices), true, (other)=>{this.onCollide(other)});
    }

    onCollide(other) {

    }
}

Wall.prototype.eType = ETYPE.WALL;
Wall.prototype.code = PREFABS.WALL = 'wall';