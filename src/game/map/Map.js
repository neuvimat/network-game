/// #if SERVER
import * as fs from 'fs'
/// #endif
/// #if CLIENT
import {E_Polygon} from "Root/editor/E_Polygon";
/// #endif

import {TUNING} from "Root/TUNING";
import {MathUtils} from "Root/util/MathUtils";
import * as earcut from 'earcut';

const MAP_PATH = __dirname + '/../maps/';
const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;

/**
 * @typedef {object} MapBorders
 * @property {number} left
 * @property {number} right
 * @property {number} bottom
 * @property {number} top
 */

/**
 * <p>Representation of game world map</p>
 * <p>Note: this class is used both by server and client and has some slight differences depending on the platform</p>
 * <p><b>Note:</b> event tho it is disgusting, client (editor) repurposed some of the properties or method parameters
 * types to better suit the editor. Example: on server, walls are arrays of coordinates, in editor walls is array of
 * E_Polygon instances.</p>
 * @class Map
 */
export class Map {
    constructor() {
        this.name = 'untitled map';
        this.width = 0;
        this.height = 0;
        this.walls = []; // Coordinates of walls, used only as template for generating actual walls entities that have collisions at the start of the game
        this.backgroundColor = '#7f361a'; // Currently unused
        this.spawnAreas = []; // Unprocessed polygons composing map parts where items can be spawned, as walls, just a template
        this._borders = {}; // Calculated borders of a map
        this._SATris = []; // tris calculated from spawnAreas
        this._SAAreaIndices = []; // index of spawnAreas tris by their area, used for random point selection
        this._SATotalArea = 0; // total area of all combined tris made out of spawnAreas
    }

    /**
     * <b>Used on server</b>. Parses the spawn areas and makes them into tris that are better suited for generating
     * random points within them.
     */
    init() {
        this._borders = {left: -this.width / 2, right: this.width / 2, top: -this.height / 2, bottom: this.height / 2};
        for (let a of this.spawnAreas) {
            if (a.length < 3) continue;
            if (a.length !== 3) {
                let f = a.flat();
                let tris = earcut.default(f, [], 2);
                for (let i = 0; i < tris.length; i += 3) {
                    this._SATris.push([a[tris[i]], a[tris[i + 1]], a[tris[i + 2]]]);
                }
            }
            else {
                this._SATris.push(a);
            }
        }
        this._SATotalArea = 0;
        for (let t of this._SATris) {
            this._SATotalArea += Math.abs(this.getTriangleArea(t));
        }
        let totalProcessedArea = 0;
        for (let t of this._SATris) {
            let area = Math.abs(this.getTriangleArea(t));
            this._SAAreaIndices.push(area + totalProcessedArea);
            totalProcessedArea += area;
        }
    }

    /**
     * Get are of specified triangle.
     * @param {array<array<number, number>>} triangle array of 3 [number,number] arrays
     * @return {number}
     */
    getTriangleArea(triangle) {
        /* https://en.wikipedia.org/wiki/Shoelace_formula */
        const [a, b, c] = triangle;
        return 0.5 * (
            (b[0] - a[0]) * (c[1] - a[1]) -
            (c[0] - a[0]) * (b[1] - a[1])
        );
    }

    /**
     * Get random point from the map's spawn areas.
     * @return {number[]}
     */
    getRandomSpawnPoint() {
        let r = this._SATotalArea * Math.random();
        let index = this._SAAreaIndices.findIndex((v) => {return v > r});
        return this.getRandomPointInTriangle(this._SATris[index]);
    }

    /**
     * Get random point inside a triangle
     * @param {array<array<number,number>>} triangle array of 3 [number,number] arrays
     * @return {number[]}
     */
    getRandomPointInTriangle(triangle) {
        let [a, b, c] = triangle;
        let t1 = Math.random();
        let t2 = Math.random();
        if (t1 + t2 > 1) {
            t1 = 1 - t1;
            t2 = 1 - t2;
        }
        let x = ((b[0] - a[0]) * t1 + (c[0] - a[0]) * t2) + a[0];
        let y = ((b[1] - a[1]) * t1 + (c[1] - a[1]) * t2) + a[1];
        return [x, y];
    }

    /**
     * <p><b>DO NOT alter the returned values in any way! You are entrusted with a direct reference to calculated
     * borders for performance reasons (to no keep cloning the object over and over).</b> If you need to alter any
     * values, do not do so in context of the returned object!</p>
     * @return {MapBorders}
     */
    getBorders() {
        return this._borders;
    }

    /**
     * Check if both x and y are inside the map
     * @param {number} x
     * @param {number} y
     * @param {number} shrink consider the map smaller by this number
     * @return {boolean} true if both x and y is within the map borders
     */
    isWithinBorders(x,y,shrink = 0) {
        return x >= this._borders.left + shrink && x <= this._borders.right - shrink &&
               y >= this._borders.top + shrink && y <= this._borders.bottom - shrink;
    }

    /**
     * Alter x and y so it is contained within the map.
     * @param {number} x
     * @param {number} y
     * @param {number} shrink reduce the map size for this calculation by this amount (collision size of object)
     * @return {array<array<number,number>>}
     */
    containWithinBorders(x, y, shrink = 0) {
        return [
            MathUtils.clamp(x, this._borders.left + shrink, this._borders.right - shrink),
            MathUtils.clamp(y, this._borders.top + shrink, this._borders.bottom - shrink)
        ];
    }

    /**
     * <p>Create map from .json file</p>
     * @param {string} name - server: name of the .json file, client: already read .json file
     * @return {Map}
     */
    static makeFromJSONFile(name) {
        try {
            let map;
            /// #if SERVER
            console.log('Looking for map in: ', MAP_PATH + name + '.json');
            let mapJSON = JSON.parse(fs.readFileSync(MAP_PATH + name + '.json', {encoding: 'utf8'}));

            map = new Map();
            map.name = name;
            map.width = mapJSON.width || DEFAULT_WIDTH;
            map.height = mapJSON.height || DEFAULT_HEIGHT;
            map.walls = mapJSON.walls || [];
            if (mapJSON.spawnAreas.length === 0) {
                map.spawnAreas = [[[-map.width / 2, map.height / 2], [map.width / 2, map.height / 2], [map.width / 2, -map.height / 2], [-map.width / 2, -map.height / 2]]];
            }
            else {
                map.spawnAreas = mapJSON.spawnAreas;
            }
            map.backgroundColor = mapJSON.backgroundColor;
            /// #else
            // Since client has no access to a file system or the actual maps (which are .json files in server repo),
            // create a default dummy map
            map = this.createDummyMap();
            /// #endif
            map.init();

            return map;
        }
        catch (e) {
            console.error(e);
            // Error during map creation, return a basic default map (this map has properties of shack.json)
            let map = this.createDummyMap();
            map.init();
            return map;
        }
    }

    static createDummyMap() {
        let map = new Map();
        map.width = DEFAULT_WIDTH;
        map.height = DEFAULT_HEIGHT;
        map.walls = TUNING.SAMPLE_WALLS;
        map.spawnAreas = [[[-map.width / 2, map.height / 2], [map.width / 2, map.height / 2], [map.width / 2, -map.height / 2], [-map.width / 2, -map.height / 2]]];
        map.backgroundColor = '#7f361a';
        return map;
    }

/// #if CLIENT
    /**
     * <p>Client (editor) only. Creates a map from parsed JSON object and converts all the variables to be editor
     * compliant.</p>
     * @param {object} parsedJSON
     * @return {Map}
     */
    static editorMakeFromJSON(parsedJSON) {
        let map = new Map();
        map.width = parsedJSON.width || DEFAULT_WIDTH;
        map.height = parsedJSON.height || DEFAULT_HEIGHT;
        map.walls = parsedJSON.walls || [];
        map.spawnAreas = parsedJSON.spawnAreas || [];
        map._editorConvertToEditorEntities();
        return map;
    }

    /**
     * <p><b>CLient only!</b></p>
     * <p>Convert all the arrays of coordinates to instances of editor classes.</p>
     * @private
     */
    _editorConvertToEditorEntities() {
        if (typeof this.width !== 'number') throw new Error('width is not a number!');
        if (typeof this.height !== 'number') throw new Error('height is not a number!');
        this.walls = this.walls.map((w) => {return new E_Polygon(w)});
        this.spawnAreas = this.spawnAreas.map((w) => {return new E_Polygon(w)});
    }
    /// #endif

    toJSON() {
        return {
            width: this.width,
            height: this.height,
            walls: this.walls,
            spawnAreas: this.spawnAreas,
        }
    }

    /**
     * Triangulate a polygon represented by array of [number,number] arrays
     * @param {array<array<number,number>>} verts
     * @param holes - look at earcut docs to know what holes do
     * @return {array<array<array<number,number>>>}
     */
    static triangulate(verts, holes = []) {
        let triangles = [];
        let f = verts.flat();
        let tris = earcut.default(f, holes, 2);
        for (let i = 0; i < tris.length; i += 3) {
            triangles.push([verts[tris[i]], verts[tris[i + 1]], verts[tris[i + 2]]]);
        }
        return triangles;
    }
}