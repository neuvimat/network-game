let counter = 0;

/**
 * <p>Helper class for identifying entities by their code property.</p>
 * <p>Typing 'PREFABS.' causes the IDE to whisper all of registered prefabs. In each prefab file, register the
 * prefab's code as a member of PREFABS. Look for an example in any .js file in 'prefabs' folder and scroll down to
 * the bottom.</p>
 * <p><b>Note: it seems that new version of PHPStorm broke the autocomplete. It is now not capable of whispering
 * all the values that have been set from across the project, defeating the purpose of this object in the first
 * place.</b></p>
 */
export const PREFABS = {

    /**
     * Use this to create an id for the entity. Do not use this, replace this method with a string of your own. This is
     * here just so the template entity does not collide with any existing code
     * @deprecated
     * @return {string}
     */
    registerNew() {
        return 'SCUFFED_ENTITY_' + counter++;
    }
};