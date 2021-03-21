import LexArcanaActorSheet from "./base.js";
import LexArcanaActor from "../entity.js";
import {LexArcana} from '../../config.js';

/**
 * An Actor sheet for player character type actors.
 * Extends the base LexArcanaActorSheet class.
 * @type {LexArcanaActorSheet}
 */
export default class LexArcanaCustosActorSheet extends LexArcanaActorSheet
{
  /**
   * Define default rendering options for the NPC sheet
   * @return {Object}
   */
  static get defaultOptions()
  {
    return mergeObject(super.defaultOptions,
    {
      classes: ["LexArcana", "sheet", "actor", LexArcana.ActorType.custos],
      width: 720,
      height: 680
    });
  }

  /* -------------------------------------------- */

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
      isCharacter: this.entity.data.type === "custos",
      isNPC: this.entity.data.type !== "custos",
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
  /*  Event Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html)
  {
    super.activateListeners(html);
    if ( !this.options.editable ) return;
    // Rollable sheet actions
    html.find(".rollable").click(this._onSheetAction.bind(this));
  }

  /**
   * Handle mouse click events for character sheet actions
   * @param {MouseEvent} event    The originating click event
   * @private
   */
  _onSheetAction(event)
  {
    event.preventDefault();
    //const dataset = event.currentTarget.dataset;
  }
}
