import {ArrayUtils} from "Root/util/ArrayUtils";
import {E_Vertex} from "Root/editor/E_Vertex";

/**
 * Representation of polygon. Holds information of vertices making this polygon.
 * @see {@link E_Vertex}
 */
export class E_Polygon {
    /**
     * @param {array} verts array of two-dimensional arrays containing x and y coordinates
     */
    constructor(verts) {
        this.verts = [];
        if (verts) {
            for (let v of verts) {
                this.addVertex(v[0], v[1]);
            }
        }
        this.id = E_Polygon.id++;
    }

    /**
     * Inserts a new E_Vertex to this polygon
     * @param {number} x
     * @param {number} y
     * @return {E_Vertex}
     */
    addVertex(x, y) {
        let v = new E_Vertex(x, y, this);
        this.verts.push(v);
        return v;
    }

    /**
     * Swaps vertices on indexes v1 and v2
     * @param {number} v1 index of vert to swap
     * @param {number} v2 index of vert to swap
     */
    swap(v1, v2) {
        // Use that sweet syntax baby oh yeah!
        [this.verts[v1], this.verts[v2]] = [this.verts[v2], this.verts[v1]];
    }

    /**
     * Remove vertex by reference
     * @param {E_Vertex} vertex
     * @return {boolean} true if vertex was found and deleted
     */
    removeVertex(vertex) {
        return ArrayUtils.removeObject(this.verts, vertex);
    }

    /**
     * Remove this polygon from provided state
     * @param {EditorState} state
     * @return {boolean} true if found and deleted
     */
    remove(state) {
        if (!ArrayUtils.removeObject(state.map.walls, this)) {
            return ArrayUtils.removeObject(state.map.spawnAreas, this);
        }
        return true;
    }

    /**
     * Remove vertex by id
     * @param {number} id
     * @return {boolean} true if found and deleted
     */
    removeVertexById(id) {
        for (let v of this.verts) {
            if (v.id === id) {
                return ArrayUtils.removeObject(this.verts, v);
            }
        }
        return false;
    }

    /**
     * Remove all vertices
     */
    clearVertices() {
        this.verts = [];
    }

    /**
     * Return array of [number, number] for each vertex this polygon contains.
     * @return {array.<array<number, number>>}
     */
    toJSON() {
        return this.verts.map(v => [v.x,v.y]);
    }
}

E_Polygon.id = 0;
E_Polygon.prototype.code = 'polygon';