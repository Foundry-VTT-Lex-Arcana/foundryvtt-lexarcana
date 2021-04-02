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
                this.actor.AddPeritiaSpecialty(peritiaeId, name, modifier);
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
        
        html.find('.rollable-1d').click(this._onRoll1D.bind(this));
        html.find('.rollable-2d').click(this._onRoll2D.bind(this));
        html.find('.rollable-3d').click(this._onRoll3D.bind(this));

        html.find('.add-peritiae-specialty').click(this._onAddSpecialty.bind(this));
        html.find('.dialog-specialty').contextmenu(this._onDialogSpecialty.bind(this));
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
     * Handle default roll peritia
     * @param {Event} event   The triggering click event
     * @private
     */
     _onRoll1D(event, numDice)
    {
        event.preventDefault();
        return this.actor.rollND(parseInt(event.currentTarget.dataset.roll), 1);
    }
    _onRoll2D(event, numDice)
    {
        event.preventDefault();
        return this.actor.rollND(parseInt(event.currentTarget.dataset.roll), 2);
    }
    _onRoll3D(event, numDice)
    {
        event.preventDefault();
        return this.actor.rollND(parseInt(event.currentTarget.dataset.roll), 3);
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
        const peritia = this.actor.data.data.peritiae[dataSet.peritiaid];
        const idx = peritia.specialties.findIndex(spe => spe.name === dataSet.specialtyid);
        const name = peritia.specialties[idx].name;
        const htmlContent = `<input type="text" name="specialty-default-roll" value="${peritia.specialties[idx].defaultRoll}"/>`;
        (new Dialog({
          title: game.i18n.format(game.i18n.localize(label))+" :: "+name,
          content: htmlContent,
          buttons:
          {
            custom: {
                icon: `<i class="default-roll-input-toggle"></i>`,
                callback: html =>
                {
                    const expression = html.find('input[name="specialty-default-roll"]')[0].value;
                    this.actor.ChangePeritiaSpecialtyDefaultRoll(dataSet.peritiaid, dataSet.specialtyid, expression);
                    this.actor.roll(expression);
                }
            },
            roll1d: {
                icon: `<span class="rollable-1d"></span>`,
                callback: () => { this.actor.rollND(event.currentTarget.dataset, 1); }
            },
            roll2d: {
                icon: `<span class="rollable-2d"></span>`,
                callback: () => { this.actor.RollPeritiaSpecialty(dataSet.peritiaid, dataSet.specialtyid, 2); }
            },
            roll3d: {
                icon: `<span class="rollable-3d"></span>`,
                callback: () => { this.actor.RollPeritiaSpecialty(dataSet.peritiaid, dataSet.specialtyid, 3); }
            },
            delete: {
                label: "X",
                callback: () => { this.actor.RemovePeritiaSpecialty(dataSet.peritiaid, dataSet.specialtyid); }
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
        (new Dialog({
          title: game.i18n.format(game.i18n.localize(label)),
          content: htmlContent,
          buttons: {
            custom: {
                icon: `<i class="default-roll-input-toggle"></i>`,
                callback: html =>
                {
                    const expression = html.find('input[name="peritia-default-roll"]')[0].value;
                    this.actor.ChangePeritiaDefaultRoll(dataSet.peritiaid, expression);
                    this.actor.roll(expression);
                }
            },
            roll1d: {
                icon: `<i class="rollable-1d"></i>`,
                callback: () => { this.actor.rollND(peritia.value, 1); }
            },
            roll2d: {
                icon: `<i class="rollable-2d"></i>`,
                callback: () => { this.actor.rollND(peritia.value, 2); }
            },
            roll3d: {
                icon: `<i class="rollable-3d"></i>`,
                callback: () => { this.actor.rollND(peritia.value, 3); }
            }
          }
        })).render(true);
    }
}