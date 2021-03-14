import {System} from "./config.js";

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
        System.Path + "/templates/actors/parts/actor-attributes",
        System.Path + "/templates/actors/parts/actor-inventory.html",
        System.Path + "/templates/actors/parts/actor-rituals.html"

        // Item Sheet Partials
    ]);
};
