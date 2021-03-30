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

    /** @override */
    getData()
    {
      // Basic data
      let isOwner = this.entity.owner;
      const data = {
        owner: isOwner,
        limited: this.entity.limited,
        options: this.options,
        editable: this.isEditable,
        cssClass: isOwner ? "editable" : "locked",
        isCharacter: !this.entity.data.data.attributes.npc,
        isNPC: this.entity.data.data.attributes.npc,
        isGM: game.user.isGM,
        config: CONFIG.LexArcana
      };
      // The Actor and its Items
      data.actor = duplicate(this.actor.data);
      data.data = data.actor.data;
  
      // Ability Scores
      for ( let [k, v] of Object.entries(data.actor.data.peritiae))
      {
        v.label = CONFIG.LexArcana.Peritiae[k];
      }
      // Return data to the sheet
      return data;
    }

    /* -------------------------------------------- */

    /** @override */
    get template()
    {
        if (!game.user.isGM && this.actor.limited) return System.Path + "/templates/actors/limited-sheet.html";
        return System.Path + `/templates/actors/${this.actor.data.type}-sheet.html`;
    }
}