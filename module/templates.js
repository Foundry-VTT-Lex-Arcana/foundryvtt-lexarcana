import {System} from './config.js';

/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function ()
{
    return loadTemplates([

        // Shared Partials

        // Actor Sheet Partials
<<<<<<< HEAD
        System.Path + "/templates/actors/parts/actor-abilities.html",
        System.Path + "/templates/actors/parts/actor-inventory.html",
        System.Path + "/templates/actors/parts/actor-rituals.html"
=======
        System.Path + '/templates/actors/parts/actor-abilities.html',
        System.Path + '/templates/actors/parts/actor-inventory.html',
        System.Path + '/templates/actors/parts/actor-rituals.html'
>>>>>>> dev

        // Item Sheet Partials
    ]);
};
