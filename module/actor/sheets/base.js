import LexArcanaItem from "../../item/entity.js";
import {LexArcana} from '../../config.js';
import {System} from '../../config.js';

/**
 * Extend the basic ActorSheet class to suppose system-specific logic and functionality.
 * This sheet is an Abstract layer which is not used.
 * @extends {ActorSheet}
 */
export default class LexArcanaActorSheet extends ActorSheet
{
    constructor(...args)
    {
        super(...args);

        /**
         * Track the set of item filters which are applied
         * @type {Set}
         */
        this._filters = {
            inventory: new Set()
        };
    }

    /* -------------------------------------------- */

    /** @override */
    static get defaultOptions()
    {
        return mergeObject(super.defaultOptions, {
            scrollY: [
                ".inventory .inventory-list"
            ],
            tabs: [{navSelector: ".tabs", contentSelector: ".sheet-body", initial: "description"}]
        });
    }

    /* -------------------------------------------- */

    /** @override */
    get template()
    {
        if (!game.user.isGM && this.actor.limited) return System.Path + "/templates/actors/limited-sheet.html";
        return System.Path + `/templates/actors/${this.actor.data.type}-sheet.html`;
    }
}