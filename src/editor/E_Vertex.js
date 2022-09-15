import {ArrayUtils} from "Root/util/ArrayUtils";

/**
 * Helper class that hold x, and y coordinate, has an id and knows of which {@link E_Polygon} it is part of.
 */
export class E_Vertex {
    constructor(x,y, polygon) {
        this.x = x;
        this.y = y;
        this.polygon = polygon;
        this.id = E_Vertex.idGiver++;
    }

    /**
     * Remove this vertex from polygon. If state is provided, removes the the polygon this vertex was part of if the
     * polygon does not have any more vertices.
     * @param {EditorState} state
     */
    remove(state) {
        this.polygon.removeVertex(this);
        if (state && this.polygon.verts.length === 0) {
            if (!ArrayUtils.removeObject(state.map.walls, this.polygon)) {
                ArrayUtils.removeObject(state.map.spawnAreas, this.polygon);
            }
        }
    }
}
E_Vertex.idGiver = 0;
E_Vertex.prototype.code = 'vertex';