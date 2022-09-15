import {SnapshotStash} from "../src/game/renderer/SnapshotStash";
import {Snapshot} from "../src/game/renderer/Snapshot";
import * as assert from 'assert'
import {ExtrapolationStrategy} from "../src/game/renderer/strategies/ExtrapolationStrategy";
import {Time} from "../src/util/Time";
import {ArrayUtils} from "Root/util/ArrayUtils";

describe('Snapshot stash', ()=>{
    it('Properly receive snapshots capped by capacity', ()=>{
        let ss = new SnapshotStash(3,300);
        let s1 = new Snapshot(null, 50);
        let s2 = new Snapshot(null, 150);
        let s3 = new Snapshot(null, 250);
        let s4 = new Snapshot(null, 350);

        ss.stashSnapshot(s1);
        ss.stashSnapshot(s2);
        ss.stashSnapshot(s3);
        ss.stashSnapshot(s4);

        assert.strictEqual(ss.snapshots.length, 3, 'Max capacity works');
        assert.strictEqual(ss.snapshots[0], s4, 'Wrong snapshot order!');
        assert.strictEqual(ss.snapshots[1], s3, 'Wrong snapshot order!');
        assert.strictEqual(ss.snapshots[2], s2, 'Wrong snapshot order!');
    });
    it('Cleaning expired snapshots', ()=>{
        let ss = new SnapshotStash(3,300);
        let s1 = new Snapshot(null, 50);
        let s2 = new Snapshot(null, 150);
        let s3 = new Snapshot(null, 250);

        ss.stashSnapshot(s1);
        ss.stashSnapshot(s2);
        ss.stashSnapshot(s3);

        ss.clearExpired(500);

        assert.strictEqual(ss.snapshots.length, 1, 'Incorrect number of snapshots remains!');
        assert.strictEqual(ss.snapshots[0], s3, 'Incorrect snapshot remained!');
    });
    it('Returns boundary snapshots for time t', ()=>{
        let ss = new SnapshotStash(3,300);
        let s1 = new Snapshot(null, 50);
        let s2 = new Snapshot(null, 150);
        let s3 = new Snapshot(null, 250);

        ss.stashSnapshot(s1);
        ss.stashSnapshot(s2);
        ss.stashSnapshot(s3);

        let b;
        b = ss.getBounds(0); // b = boundary (snapshots)
        assert.ok(!b[0], 'Left interval is mismatched!');
        assert.strictEqual(b[1], s1, 'Right interval mismatched!');

        b = ss.getBounds(50); // b = boundary (snapshots)
        assert.strictEqual(b[0], s1, 'Left interval is mismatched!');
        assert.strictEqual(b[1], s2, 'Right interval mismatched!');

        b = ss.getBounds(100); // b = boundary (snapshots)
        assert.strictEqual(b[0], s1, 'Left interval is mismatched!');
        assert.strictEqual(b[1], s2, 'Right interval mismatched!');

        b = ss.getBounds(200); // b = boundary (snapshots)
        assert.strictEqual(b[0], s2, 'Left interval is mismatched!');
        assert.strictEqual(b[1], s3, 'Right interval mismatched!');

        b = ss.getBounds(300); // b = boundary (snapshots)
        assert.strictEqual(b[0], s3, 'Left interval is mismatched!');
        assert.ok(!b[1], 'Right interval mismatched!');
    })
});

describe('Array utils', ()=>{
    it('removeObject works as intended', ()=>{
        let array = [];
        let o1 = {a:0,b:1};
        let o2 = {a:0,b:2};
        let o3 = {c:0,d:3};
        array.push(o1);
        array.push(o2);
        array.push(o3);

        ArrayUtils.removeObject(array, o2);

        assert.notStrictEqual(array.indexOf(o1), -1, 'Object that should be present is not!');
        assert.strictEqual(array.indexOf(o2), -1, 'Deleted object was not deleted successfully!');
        assert.notStrictEqual(array.indexOf(o3), -1, 'Object that should be present is not!');
    })
});

describe('Extrapolation strategy', ()=>{
    let snapshotStash = new SnapshotStash();
    let renderStrategy = new ExtrapolationStrategy(snapshotStash);
    let snapshot1 = new Snapshot({avatars: [{position: {x:0, y:0}}]}, 100);
    let snapshot2 = new Snapshot({avatars: [{position: {x:10, y:10}}]}, 200);

    renderStrategy.configureSnapshotStash();

    beforeEach(()=>{snapshotStash.clear()});

    it('Correctly decide when to extrapolate, fallback, give up', ()=>{
        assert.strictEqual(renderStrategy.canSmooth(), false, 'Render strategy thinks it can smooth when it cannot!');
        assert.strictEqual(renderStrategy.canFallback(), false, 'Render strategy thinks it can fallback when it cannot!');

        snapshotStash.stashSnapshot(snapshot1);
        assert.strictEqual(renderStrategy.canSmooth(), false, 'Render strategy thinks it can smooth when it cannot!');
        assert.strictEqual(renderStrategy.canFallback(), true, 'Render strategy thinks it cannot fallback when it can!');

        snapshotStash.stashSnapshot(snapshot2);
        assert.strictEqual(renderStrategy.canSmooth(), true, 'Render strategy thinks it cannot smooth when it can!');
    });

    it('Correctly extrapolate', ()=>{
        snapshotStash.stashSnapshot(snapshot1);
        snapshotStash.stashSnapshot(snapshot2);

        let timeToExtrapolateTo = 210;
        let expectedX = 11; // (100 = 0; 200 = 10) => 210 = 21
        let expectedY = 11; // (gg100 = 0; 200 = 10) => 210 = 21

        Time.serverNow = ()=>{return timeToExtrapolateTo};
        renderStrategy.prepare();

        let extrapolatedX = renderStrategy.getField((snapshot)=>{return snapshot.data.avatars[0].position.x});
        let extrapolatedY = renderStrategy.getField((snapshot)=>{return snapshot.data.avatars[0].position.y});
        assert.strictEqual(extrapolatedX, expectedX, 'Wrong extrapolation for X coordinate!');
        assert.strictEqual(extrapolatedY, expectedY, 'Wrong extrapolation for Y coordinate!');
    });
});