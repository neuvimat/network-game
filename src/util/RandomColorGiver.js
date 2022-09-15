// Uncomment the test. line belows to let PhpStorm show the color preview
// let test = [];
// test.push('#5eb36c');
// test.push('#b36069');
// test.push('#002653');
// test.push('#6a14b3');
// test.push('#573920');
// test.push('#601927');

// CSS valid color representation
let colors = ['red', 'gray', 'wheat', 'tan', 'deeppink', 'orangered', 'blue', 'olive', '#5eb36c', '#b36069', '#002653',
    '#6a14b3', '#573920', '#601927'];
let currentColors = colors.slice();

/**
 * <p>Returns one from multitude of random colors. If all colros were given out, duplicates are handed out.</p>
 * @return {string} color represented in a way that is accepted as CSS color. (name, hex, rgb, ...)
 */
export function getRandomColor() {
    // If we have unique colors ready, give out one of them
    if (currentColors.length > 0) {
        let r = Math.floor(Math.random() * currentColors.length);
        let c = currentColors[r];
        currentColors.splice(r, 1);
        return c;
    }
    // We have no more unique colors, assign any duplicate (we could be smarter and yet again cherry pick to reduce
    // duplicates, but w/e)
    else {
        let r = Math.floor(Math.random() * colors.length);
        return colors[r];
    }
}

export function addColorToPool(color) {
    currentColors.push(color);
}