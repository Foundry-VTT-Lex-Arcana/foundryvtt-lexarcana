import LexArcanaItem from "../../item/item.js";
import {LexArcana} from '../../config.js';
import {System} from '../../config.js';
import { LexArcanaDice } from "../../dice.js";

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
                '.inventory .inventory-list'
            ],
            tabs: [{navSelector: '.tabs', contentSelector: '.sheet-body', initial: 'description'}]
        });
    }

    /** @override */
    getData()
    {
        // Basic data
        const data = {
            owner: this.document.isOwner,
            limited: this.document.limited,
            options: this.options,
            editable: this.isEditable,
            cssClass: this.document.isOwner ? 'editable' : 'locked',
            isCharacter: !this.document.data.data.attributes.npc,
            isNPC: this.document.data.data.attributes.npc,
            isGM: game.user.isGM,
            config: CONFIG.LexArcana
        };
        // The Actor and its Items
        data.actor = duplicate(this.actor.data);
        data.data = data.actor.data;

        // Ability Scores
        for ( let [k, v] of Object.entries(data.actor.data.virtutes))
        {
            v.label = CONFIG.LexArcana.Virtutes[k];
        }
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
     * @param {String}peritiaeId     The peritiae id (e.g. 'deBello')
     */
    addPeritiaeSpecialty(peritiaeId)
    {
      const label = CONFIG.LexArcana.Peritia[peritiaeId];
      const htmlContent = `
        <div class='form grid-layout2'>
            <div class='grid-layout2-area1'>${game.i18n.format('LexArcana.InputLabelName')}:&nbsp;<input type='text' name='specialty-label'/></div>
            <div class='grid-layout2-area2'>${game.i18n.format('LexArcana.InputLabelModifier')}:&nbsp;<input type='text' name='specialty-modifier'/></div>
        </div>`;
      (new Dialog({
        title: game.i18n.format('LexArcana.AddPeritiaeSpecialtyPromptTitle', {peritiaName: game.i18n.format(game.i18n.localize(label))}),
        content: htmlContent,
        buttons: {
          add: {
            label: game.i18n.localize('LexArcana.ActionAdd'),
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
    /*  Event Listeners and Handlers                */
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
        html.find('.dialog-roll').click(this._onRollDialog.bind(this));
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
        let defaultRollExpression = defaultRollElement.querySelector('.default-roll-expression').value;
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
     * Handle click on dialog specialty or peritia
     * @param {Event} event   The triggering click event
     * @private
     */
    _onRollDialog(event)
    {
        event.preventDefault();
        const dataSet = event.currentTarget.dataset;
        let config = {};
		function createToolTip(numDice, numFaces)
		{
			return '<span class="tooltipText scroller">' +
					'<p>Balanced '+LexArcanaDice.ComputeExpression(numDice, numFaces, LexArcanaDice.EXPRESSIONTYPE.BALANCED).expression+'</p>' +
					'<p>Unbalanced '+LexArcanaDice.ComputeExpression(numDice, numFaces, LexArcanaDice.EXPRESSIONTYPE.UNBALANCED).expression+'</p>'+
					'</span>';
		}
        if(dataSet.virtuteid!==undefined)
        {
            const virtute = this.actor.data.data.virtutes[dataSet.virtuteid];
            config.title = game.i18n.format(game.i18n.localize(CONFIG.LexArcana.Virtutes[dataSet.virtuteid]));
            config.defaultRoll = virtute.defaultRoll===undefined?'1d3+1d4':virtute.defaultRoll;
            config.defaultRollInputName = 'virtute-default-roll';
            config.buttonBuilder = function(caller, numDice)
            {
                return {
                    icon: `<span class="roll${numDice}d-icon tooltip">` + createToolTip(numDice, virtute.value)+ `</span>`,
                    callback: html => {
                        const expressionType = html.find('input[name="expression-type"]')[0].checked?LexArcanaDice.EXPRESSIONTYPE.BALANCED:LexArcanaDice.EXPRESSIONTYPE.UNBALANCED;
                        caller.actor.rollND(virtute.value, numDice, expressionType, config.title);
                    }
                };
            };
            config.customRoll = function(caller, html)
            {
                const expression = html.find('input[name="'+config.defaultRollInputName+'"]')[0].value;
                caller.actor.setVirtuteDefaultRoll(dataSet.virtuteid, expression);
                caller.actor.roll(expression, true, config.title);
            };
        }
        else if(dataSet.specialtyid!==undefined)
        {
            const peritiaNameLoc = game.i18n.format(game.i18n.localize(CONFIG.LexArcana.Peritia[dataSet.peritiaid]));
            const specialty = this.actor.getSpecialty(dataSet.peritiaid, dataSet.specialtyid);
            config.defaultRoll = specialty.defaultRoll===undefined?"1d3+1d4":specialty.defaultRoll;
            config.defaultRollInputName = 'specialty-default-roll';
            config.title = peritiaNameLoc+" :: "+specialty.name;
            config.buttonBuilder = function(caller, numDice)
            {
				const specialty = caller.actor.getSpecialty(dataSet.peritiaid, dataSet.specialtyid);
				const totalFaces = caller.actor.data.data.peritiae[dataSet.peritiaid].value+parseInt(specialty.modifier);
                return {
                    icon: `<span class="roll${numDice}d-icon tooltip">` + createToolTip(numDice, totalFaces) + `</span>`,
                    callback: html => {
                        const expressionType = html.find('input[name="expression-type"]')[0].checked?LexArcanaDice.EXPRESSIONTYPE.BALANCED:LexArcanaDice.EXPRESSIONTYPE.UNBALANCED;
                        caller.actor.rollPeritiaSpecialty(dataSet.peritiaid, dataSet.specialtyid, numDice, expressionType, config.title);
                    }
                };
            };
            config.customRoll = function(caller, html)
            {
                const expression = html.find('input[name="'+config.defaultRollInputName+'"]')[0].value;
                caller.actor.setPeritiaSpecialtyDefaultRoll(dataSet.peritiaid, dataSet.specialtyid, expression);
                caller.actor.roll(expression, true, config.title);
            };
        }
        else
        {
            const peritiaNameLoc = game.i18n.format(game.i18n.localize(CONFIG.LexArcana.Peritia[dataSet.peritiaid]));
            const peritia = this.actor.data.data.peritiae[dataSet.peritiaid];
            config.defaultRoll = peritia.defaultRoll;
            config.defaultRollInputName = 'peritia-default-roll';
            config.title = peritiaNameLoc;
            config.buttonBuilder = function(caller, numDice)
            {
                return {
                    icon: `<span class="roll${numDice}d-icon tooltip">` + createToolTip(numDice, peritia.value) + `</span>`,
                    callback: html => {
                        const expressionType = html.find('input[name="expression-type"]')[0].checked?LexArcanaDice.EXPRESSIONTYPE.BALANCED:LexArcanaDice.EXPRESSIONTYPE.UNBALANCED;
                        caller.actor.rollND(peritia.value, numDice, expressionType, config.title);
                    }
                };
            };
            config.customRoll = function(caller, html)
            {
                const expression = html.find('input[name="'+config.defaultRollInputName+'"]')[0].value;
                caller.actor.setPeritiaDefaultRoll(dataSet.peritiaid, expression);
                caller.actor.roll(expression, true, config.title);
            };
        }
        const expressionTypePrompt = game.i18n.localize('LexArcana.DiceExpressionBalancedPrompt');
        const htmlContent = `<div>
                                ${expressionTypePrompt}: <input type='checkbox' name='expression-type'/>
                            </div>
                            <div>
                                <input type='text' name="${config.defaultRollInputName}" value="${config.defaultRoll}"/>
                            </div>`;
        let buttonSet = {
            customroll: {
                icon: `<i class='rollcustom-icon'></i>`,
                callback: html => { config.customRoll(this, html); }
            },
            roll1d: config.buttonBuilder(this, 1),
            roll2d: config.buttonBuilder(this, 2),
            roll3d: config.buttonBuilder(this, 3)
        };
        if(dataSet.specialtyid!==undefined)
        {
            buttonSet['delete'] = {
                icon: `<span class='delete-icon'></span>`,
                callback: () => {
                    Dialog.confirm({
                        title: game.i18n.localize('LexArcana.ConfirmPromptTitle'),
                        yes: () => this.actor.removePeritiaSpecialty(dataSet.peritiaid, dataSet.specialtyid),
                        no: () => { mainDialog.render(true); },
                        defaultYes: false
                       });
                }
            };
        }
        let mainDialog = new Dialog({
          title: config.title,
          content: htmlContent,
          buttons: buttonSet
        });
        mainDialog.render(true);
    }
}