/**
 * Bank of all images that the game can render
 * @type {{images: Map<any, any>, centerizePosition(*=, *, *): *, get(*=): *, addExplicit(*=): void, _put(*=): (undefined), addImagesFromNode(*): void}}
 * @namespace
 */
export const ImageBank = {
    images: new Map(),

    /**
     * Get the requested image or missing texture if the requested one is not found
     * @param id image to get
     * @return {any}
     */
    get(id) {
        if (this.images.has(id)) {
            return this.images.get(id);
        }
        else {
            console.error('ImageBank could not find and image with id', id, ', sending missing texture instead!');
            return this.images.get('missing');
        }
    },

    /**
     * Handles the case when node with the same id already exists
     * @param node
     * @private
     */
    _put(node) {
        if (node.id === undefined) {
            console.error('ImageBank refuses to add an image that has not specified id within its HTML node');
            return;
        }
        if (this.images.has(node.id)) {
            console.error('ImageBank already has an entry with id', node.id,'skipping...')
        }
        else {
            this.images.set(node.id, node);
        }
    },

    /**
     * Force adding this img node to the bank
     * @param img html node
     */
    addExplicit(img) {
        if (img.tagName === 'IMG') {
            this._put(img);
        }
        else {
            console.warn('ImageBank: addExplicit - target element is not IMG')
        }
    },

    /**
     * Search the parent HTML node for any <img> and add it to the bank
     * @param nodeId parent HTML node
     */
    addImagesFromNode(nodeId) {
        let imgs = document.querySelectorAll('#' + nodeId + ' img');
        if (imgs.length === 0) {
            console.warn('ImageBank did not find any suitable images from given node!')
        }
        for (let img of imgs) {
            this._put(img);
        }
    },

    /**
     * Alter the vector position base on the imageId to shift the image position so its render pivot is in the center
     * @param imageId
     * @param oldX
     * @param oldY
     */
    centerizePosition(imageId, oldX, oldY) {
        let img = this.images.get(imageId);
        return [oldX - img.width/2, oldY - img.height/2]
    }
};