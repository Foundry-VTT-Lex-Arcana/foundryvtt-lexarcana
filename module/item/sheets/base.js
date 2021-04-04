import {LexArcana} from '../../config.js';
import {System} from '../../config.js';

/**
 * Override and extend the core ItemSheet implementation to handle specific item types
 * @extends {ItemSheet}
 */
export default class LexArcanaItemSheet extends ItemSheet
{
    constructor(...args)
    {
        super(...args);
    }

    /* -------------------------------------------- */

    /** @override */
    static get defaultOptions()
    {
        return mergeObject(super.defaultOptions, {
            width: 560,
            height: 400,
            classes: ['LexArcana', 'sheet', 'item'],
            resizable: true,
            scrollY: ['.tab.details'],
            tabs: [{navSelector: '.tabs', contentSelector: '.sheet-body', initial: 'description'}]
        });
    }

    /* -------------------------------------------- */

    /** @override */
    get template()
    {
        const path = System.Path + '/templates/items/';
        return `${path}/${this.item.data.type}.html`;
    }
}
