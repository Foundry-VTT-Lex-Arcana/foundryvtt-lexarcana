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
            v.label = CONFIG.LexArcana.Peritia[k];
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

    /* -------------------------------------------- */
    /*                  Dialogs                     */
    /* -------------------------------------------- */
  
    /**
     * Prompt for adding a specialty
     * @param {String}peritiaeId     The peritiae id (e.g. "deBello")
     */
    addPeritiaeSpecialty(peritiaeId)
    {
      const label = CONFIG.LexArcana.Peritia[peritiaeId];
      const htmlContent = `
        <div class="form grid-layout2">
            <div class="grid-layout2-area1">${game.i18n.format("LexArcana.InputLabelName")}:&nbsp;<input type="text" name="specialty-label"/></div>
            <div class="grid-layout2-area2">${game.i18n.format("LexArcana.InputLabelModifier")}:&nbsp;<input type="text" name="specialty-modifier"/></div>
        </div>`;
      (new Dialog({
        title: game.i18n.format("LexArcana.AddPeritiaeSpecialtyPromptTitle", {peritiaName: game.i18n.format(game.i18n.localize(label))}),
        content: htmlContent,
        buttons: {
          add: {
            label: game.i18n.localize("LexArcana.ActionAdd"),
            callback: html =>
            {
                let name = html.find('input[name="specialty-label"]')[0].value;
                let modifier = html.find('input[name="specialty-modifier"]')[0].value;
                this.actor.addPeritiaSpecialty(peritiaeId, name, modifier);
            }
          }
        }
      })).render(true);
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
  
        // hide/show defaultRoll
        html.find('.default-roll-input-toggle').click(this._onDefaultRoll.bind(this));
        html.find('.default-roll-input-toggle').contextmenu(this._onToggleDefaultRoll.bind(this));

        html.find('.add-peritiae-specialty').click(this._onAddSpecialty.bind(this));
        html.find('.dialog-specialty').click(this._onDialogSpecialty.bind(this));
        html.find('.dialog-peritia').click(this._onDialogPeritia.bind(this));
    }

    /* -------------------------------------------- */
  
    /**
     * Handle default roll peritia
     * @param {Event} event   The triggering click event
     * @private
     */
     _onDefaultRoll(event)
    {
        event.preventDefault();
        let defaultRollElement = event.currentTarget.nextElementSibling;
        let defaultRollExpression = defaultRollElement.querySelector(".default-roll-expression").value;
        return this.actor.roll(defaultRollExpression);
    }

    /* -------------------------------------------- */
  
    /**
     * Handle toggling the state of default roll peritia
     * @param {Event} event   The triggering click event
     * @private
     */
     _onToggleDefaultRoll(event)
    {
        event.preventDefault();
        let showHide = event.currentTarget.nextElementSibling;
        showHide.style.visibility = showHide.style.visibility !== 'visible'?'visible':'hidden';
        return;
    }

    /* -------------------------------------------- */
  
    /**
     * Handle click on add Peritiae buttons
     * @param {Event} event   The triggering click event
     * @private
     */
    _onAddSpecialty(event)
    {
        event.preventDefault();
        const dataSet = event.currentTarget.dataset;
        return this.addPeritiaeSpecialty(dataSet.peritiaid);
    }

    /* -------------------------------------------- */
  
    /**
     * Handle click on dialog specialty
     * @param {Event} event   The triggering click event
     * @private
     */
    _onDialogSpecialty(event)
    {
        event.preventDefault();
        const dataSet = event.currentTarget.dataset;
        const label = CONFIG.LexArcana.Peritia[dataSet.peritiaid];
        const specialty = this.actor.getSpecialty(dataSet.peritiaid, dataSet.specialtyid);
        const defaultRoll = specialty.defaultRoll===undefined?"1d3+1d4":specialty.defaultRoll;
        const htmlContent = `<input type="text" name="specialty-default-roll" value="${defaultRoll}"/>`;
        const localizePeritiaSpeName = game.i18n.format(game.i18n.localize(label))+" :: "+specialty.name;
        (new Dialog({
          title: localizePeritiaSpeName,
          content: htmlContent,
          buttons:
          {
            custom: {
                icon: `<i class="default-roll-input-toggle"></i>`,
                callback: html =>
                {
                    const expression = html.find('input[name="specialty-default-roll"]')[0].value;
                    this.actor.changePeritiaSpecialtyDefaultRoll(dataSet.peritiaid, dataSet.specialtyid, expression);
                    this.actor.roll(expression, localizePeritiaSpeName);
                }
            },
            roll1d: {
                icon: `<span class="rollable-1d"></span>`,
                callback: () => { this.actor.rollPeritiaSpecialty(dataSet.peritiaid, dataSet.specialtyid, 1, localizePeritiaSpeName); }
            },
            roll2d: {
                icon: `<span class="rollable-2d"></span>`,
                callback: () => { this.actor.rollPeritiaSpecialty(dataSet.peritiaid, dataSet.specialtyid, 2, localizePeritiaSpeName); }
            },
            roll3d: {
                icon: `<span class="rollable-3d"></span>`,
                callback: () => { this.actor.rollPeritiaSpecialty(dataSet.peritiaid, dataSet.specialtyid, 3, localizePeritiaSpeName); }
            },
            delete: {
                icon: `<span class="delete"></span>`,
                callback: () => { this.actor.removePeritiaSpecialty(dataSet.peritiaid, dataSet.specialtyid); }
            }
          }
        })).render(true);
    }

    /* -------------------------------------------- */
  
    /**
     * Handle click on dialog peritia
     * @param {Event} event   The triggering click event
     * @private
     */
     _onDialogPeritia(event)
    {
        event.preventDefault();
        const dataSet = event.currentTarget.dataset;
        const label = CONFIG.LexArcana.Peritia[dataSet.peritiaid];
        const peritia = this.actor.data.data.peritiae[dataSet.peritiaid];
        const htmlContent = `<input type="text" name="peritia-default-roll" value="${peritia.defaultRoll}"/>`;
        const localizedPeritiaName = game.i18n.format(game.i18n.localize(label));
        (new Dialog({
          title: localizedPeritiaName,
          content: htmlContent,
          buttons: {
            custom: {
                icon: `<i class="default-roll-input-toggle"></i>`,
                callback: html =>
                {
                    const expression = html.find('input[name="peritia-default-roll"]')[0].value;
                    this.actor.changePeritiaDefaultRoll(dataSet.peritiaid, expression);
                    this.actor.roll(expression, localizedPeritiaName);
                }
            },
            roll1d: {
                icon: `<i class="rollable-1d"></i>`,
                callback: () => { this.actor.rollND(peritia.value, 1, localizedPeritiaName); }
            },
            roll2d: {
                icon: `<i class="rollable-2d"></i>`,
                callback: () => { this.actor.rollND(peritia.value, 2, localizedPeritiaName); }
            },
            roll3d: {
                icon: `<i class="rollable-3d"></i>`,
                callback: () => { this.actor.rollND(peritia.value, 3, localizedPeritiaName); }
            }
          }
        })).render(true);
    }
}