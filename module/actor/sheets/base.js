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
            isCharacter: !this.document.system.attributes.npc,
            isNPC: this.document.system.attributes.npc,
            isGM: game.user.isGM,
            config: CONFIG.LexArcana
        };
        // The Actor and its Items
        data.actor = duplicate(this.object);

        // Ability Scores
        for ( let [k, v] of Object.entries(data.actor.system.virtutes))
        {
            v.label = CONFIG.LexArcana.Virtutes[k];
        }
        for ( let [k, v] of Object.entries(data.actor.system.peritiae))
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
        return System.Path + `/templates/actors/${this.actor.type}-sheet.html`;
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
        html.find('.delete-peritiae-specialty').click(this._onDeleteSpecialty.bind(this));
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

    /**
     * Handle click on delete Peritiae buttons
     * @param {Event} event   The triggering click event
     * @private
     */
     _onDeleteSpecialty(event)
     {
        event.preventDefault();
        const dataSet = event.currentTarget.dataset;
        Dialog.confirm({
		    title: game.i18n.localize("LexArcana.Confirm"),
			content: game.i18n.localize("LexArcana.ConfirmSpecialityDeletion"),
			yes: () => this.actor.removePeritiaSpecialty(dataSet.peritiaid, dataSet.specialtyid),
			no: () => {},
			defaultYes: false
		});
        return 
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
		let hasFateRoll = true;
		function retrieveRollInputFromHTML(_html, _defaultRollInputName)
		{
			return {
					expressionType: _html.find('input[name="expression-type"]')[0].checked?LexArcanaDice.EXPRESSIONTYPE.BALANCED:LexArcanaDice.EXPRESSIONTYPE.UNBALANCED
					, customExpression: _defaultRollInputName!==''?_html.find('input[name="'+_defaultRollInputName+'"]')[0].value:''
					, difficultyThreshold: parseInt(_html.find('input[name="difficulty-threshold"]')[0].value)
			};
		}
		function createButtonWithToolTip(_numDice, _numFaces)
		{
			let contentButton = '';
			let disableButton = false;
			if(_numDice>1 && LexArcanaDice.ComputeNumDices(_numDice, _numFaces)<_numDice)
			{
				contentButton = `<span class="roll${_numDice}d-icon disabled"></span>`;
				disableButton = true;
			}
			else if(_numDice == 1)
			{
				contentButton = `<span class="roll${_numDice}d-icon tooltip"><span class="tooltipText scroller">` +
						'<p>'+LexArcanaDice.ComputeExpression(_numDice, _numFaces, LexArcanaDice.EXPRESSIONTYPE.BALANCED).expression+'</p>'+
						'</span></span>';
			}
			else
			{
				contentButton = `<span class="roll${_numDice}d-icon tooltip"><span class="tooltipText scroller">` +
					'<p>'+game.i18n.localize(CONFIG.LexArcana.RollBalanced)+' '+LexArcanaDice.ComputeExpression(_numDice, _numFaces, LexArcanaDice.EXPRESSIONTYPE.BALANCED).expression+'</p>' +
					'<p>'+game.i18n.localize(CONFIG.LexArcana.RollUnbalanced)+' '+LexArcanaDice.ComputeExpression(_numDice, _numFaces, LexArcanaDice.EXPRESSIONTYPE.UNBALANCED).expression+'</p>'+
					'</span></span>';
			}
			return {disable: disableButton, content: contentButton};
		}
        if(dataSet.virtuteid!==undefined)
        {
            const virtute = this.actor.system.virtutes[dataSet.virtuteid];
            config.title = game.i18n.format(game.i18n.localize(CONFIG.LexArcana.Virtutes[dataSet.virtuteid]));
            config.defaultRoll = virtute.defaultRoll===undefined?'1d6':virtute.defaultRoll;
            config.defaultRollInputName = 'virtute-default-roll';
			config.numFaces = virtute.value;
			config.callbackCustomRoll = function(_actor, _expression) { _actor.setVirtuteDefaultRoll(dataSet.virtuteid, _expression); }
        }
        else if(dataSet.specialtyid!==undefined)
        {
            const peritiaNameLoc = game.i18n.format(game.i18n.localize(CONFIG.LexArcana.Peritia[dataSet.peritiaid]));
            const specialty = this.actor.getSpecialty(dataSet.peritiaid, dataSet.specialtyid);
            config.defaultRoll = specialty.defaultRoll===undefined?"1d6":specialty.defaultRoll;
            config.defaultRollInputName = 'specialty-default-roll';
            config.title = peritiaNameLoc+" :: "+specialty.name;
			config.numFaces = this.actor.getSpecialtyScore(dataSet.peritiaid, dataSet.specialtyid);
			config.callbackCustomRoll = function(_actor, _expression) { _actor.setPeritiaSpecialtyDefaultRoll(dataSet.peritiaid, dataSet.specialtyid, _expression); }
        }
        else
        {
            const peritiaNameLoc = game.i18n.format(game.i18n.localize(CONFIG.LexArcana.Peritia[dataSet.peritiaid]));
            const peritia = this.actor.system.peritiae[dataSet.peritiaid];
            config.defaultRoll = peritia.defaultRoll;
            config.defaultRollInputName = 'peritia-default-roll';
            config.title = peritiaNameLoc;
			config.numFaces = peritia.value;
			config.callbackCustomRoll = function(_actor, _expression) { _actor.setPeritiaDefaultRoll(dataSet.peritiaid, _expression); }
        }
		config.customRoll = function(_caller, _callback, _html)
		{
			let inputs = retrieveRollInputFromHTML(_html, config.defaultRollInputName);
			_callback(_caller.actor, inputs.customExpression);
			_caller.actor.rollCustom(inputs.customExpression, hasFateRoll, inputs.difficultyThreshold, config.title);
		};
		config.buttonBuilder = function(_caller, _numDice)
		{
			let button = createButtonWithToolTip(_numDice, config.numFaces);
			if(button.disable)
			{
				return { icon: button.content };
			}
			else
				return {
					icon: button.content,
					callback: html => {
						if(LexArcanaDice.ComputeNumDices(_numDice, config.numFaces)<_numDice)
						{
							return;
						}
						let inputs = retrieveRollInputFromHTML(html, '');
						_caller.actor.rollND(_numDice, config.numFaces, hasFateRoll, inputs.difficultyThreshold, inputs.expressionType, config.title);
					}
				};
		};
        const expressionTypePrompt = game.i18n.localize('LexArcana.DiceExpressionBalancedPrompt');
        const htmlContent = `<div>
                                ${expressionTypePrompt}: <input type='checkbox' name='expression-type'/>
                            </div>
                            <div>
                                <span>${game.i18n.localize(CONFIG.LexArcana.RollCustomInput)}</span>&nbsp;<input type='text' name="${config.defaultRollInputName}" value="${config.defaultRoll}"/>
                            </div>
                            <div>
								<span>${game.i18n.localize(CONFIG.LexArcana.RollDifficultyThreshold)}</span>&nbsp;<input type='text' name="difficulty-threshold" value="6"/>
                            </div>`;
        let buttonSet = {
            customroll: {
                icon: `<i class='rollcustom-icon'></i>`,
                callback: html => { config.customRoll(this, config.callbackCustomRoll, html); }
            },
            roll1d: config.buttonBuilder(this, 1),
            roll2d: config.buttonBuilder(this, 2),
            roll3d: config.buttonBuilder(this, 3)
        };
        let mainDialog = new Dialog({
          title: config.title,
          content: htmlContent,
          buttons: buttonSet
        });
        mainDialog.render(true);
    }
}