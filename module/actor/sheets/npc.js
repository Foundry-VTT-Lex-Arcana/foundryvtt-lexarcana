import LexArcanaActorSheet from "./base.js";
import { LexArcana } from '../../config.js';
import {LexArcanaDice} from '../../dice.js';

/**
 * An Actor sheet for player character type actors.
 * Extends the base LexArcanaActorSheet class.
 * @type {LexArcanaActorSheet}
 */
export default class LexArcanaNPCActorSheet extends LexArcanaActorSheet
{
	/**
	 * Define default rendering options for the NPC sheet
	 * @return {Object}
	 */
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
			{
				classes: ['LexArcana', 'sheet', 'actor', LexArcana.ActorType.npc],
				width: 720,
				height: 680
			});
	}

	/** @override */
	getData()
	{
		// Basic data
		const data = super.getData();
		data.items = [];
		data.specialAbilities = [];
		for (let i of data.actor.items)
		{
			switch (i.type)
			{
				case 'meleeWeapon':
				case 'rangedWeapon':
				case 'armor':
				case 'shield':
				{
					data.items.push(i);
					break;
				}
				case 'specialAbility':
				{
					data.specialAbilities.push(i);
					break;
				}
				default:
				{
					break;
				}
			}
		}
		return data;
	}

	/* -------------------------------------------- */

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
		if (!this.options.editable) return;

        html.find('.add-ability').click(this._onAddAbility.bind(this));
        html.find('.delete-ability').click(this._onDeleteAbility.bind(this));
		
		html.find('a.edit-special-ability').click(this._onEditClick.bind(this));
		html.find('a.delete-special-ability').click(this._onDeleteClick.bind(this));

		// inventory
		html.find('a.damage-roll').click(this._onDamageRollClick.bind(this));
		html.find('a.armor-roll').click(this._onArmorRollClick.bind(this));
		html.find('a.item-equip').click(this._onEquipClick.bind(this));
		html.find('a.item-edit').click(this._onEditClick.bind(this));
		html.find('a.item-delete').click(this._onDeleteClick.bind(this));
	}

	/* -------------------------------------------- */
	/*                  Events                     */
	/* -------------------------------------------- */

	async _onDamageRollClick(event, data)
	{
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		const item = this.actor.items.get(dataset.id);
		LexArcanaDice.Roll(1, item.system.damage, LexArcanaDice.EXPRESSIONTYPE.BALANCED, 6, this.hasFateRoll(), item.name);
		//this.actor.combatTurn();
		return;
	}

	async _onArmorRollClick(event, data)
	{
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		const item = this.actor.items.get(dataset.id);
		LexArcanaDice.Roll(1, item.system.protection, LexArcanaDice.EXPRESSIONTYPE.BALANCED, this.hasFateRoll(), item.name);
		return;
	}

	async _onEquipClick(event, data)
	{
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		const item = this.actor.items.get(dataset.id);
		item.update({ 'system.active': !item.system.active });
		return;
	}

    /**
     * Handle click on edit items buttons
     * @param {Event} event   The triggering click event
     * @private
     */
	async _onEditClick(event, data)
	{
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		const item = this.actor.items.get(dataset.id);
		item.sheet.render(true);
		return;
	}

    /**
     * Handle click on delete items buttons
     * @param {Event} event   The triggering click event
     * @private
     */
	async _onDeleteClick(event, data)
	{
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		Dialog.confirm({
			title: game.i18n.localize("LexArcana.Confirm"),
			content: game.i18n.localize("LexArcana.ConfirmItemDeletion"),
			yes: () => this.actor.deleteEmbeddedDocuments("Item", [dataset.id]),
			no: () => {},
			defaultYes: false
		   });
		return;
	}

    /**
     * Handle click on add ability buttons
     * @param {Event} event   The triggering click event
     * @private
     */
    _onAddAbility(event)
    {
        event.preventDefault();
        const dataSet = event.currentTarget.dataset;
        return this.addAbility(dataSet.diceclass);
    }

    /**
     * Handle click on delete ability buttons
     * @param {Event} event   The triggering click event
     * @private
     */
	_onDeleteAbility(event)
     {
        event.preventDefault();
        const dataSet = event.currentTarget.dataset;
        Dialog.confirm({
		    title: game.i18n.localize("LexArcana.Confirm"),
			content: game.i18n.localize("LexArcana.ConfirmSpecialityDeletion"),
			yes: () => this.actor.removeNPCAbility(dataSet.diceclass, dataSet.abilityid),
			no: () => {},
			defaultYes: false
		});
        return 
     }

	 /**
	  * Handle click on dialog abilities
	  * @param {Event} event   The triggering click event
	  * @private
	  */
	 _onRollDialog(event)
	 {
		 event.preventDefault();
		 const dataSet = event.currentTarget.dataset;
		 let diceClass = dataSet.diceclass;
		 let hasFateRoll = this.hasFateRoll();
		 let numDice = 1;
		 switch(diceClass)
		 {
			case "twoDice": numDice+=1; break; 
			case "threeDice": numDice+=2; break;
			case "oneDice":
			default:
			break;
		 }
		 let numFaces = numDice * this.actor.system.diceValue;
		 function retrieveRollInputFromHTML(_html, _defaultRollInputName)
		 {
			 return {
					 expressionType: LexArcanaDice.EXPRESSIONTYPE.BALANCED
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
					 '</span></span>';
			 }
			 return {disable: disableButton, content: contentButton};
		 }
		 function buttonBuilder(_caller)
		 {
			 let button = createButtonWithToolTip(numDice, numFaces);
			 if(button.disable)
			 {
				 return { icon: button.content };
			 }
			 else
				 return {
					 icon: button.content,
					 callback: html => {
						let inputs = retrieveRollInputFromHTML(html, '');
						 _caller.actor.rollND(numDice, numFaces, hasFateRoll, inputs.difficultyThreshold, inputs.expressionType, diceClass);
					 }
				 };
		 }
		 const expressionTypePrompt = game.i18n.localize('LexArcana.DiceExpressionBalancedPrompt');
		 const htmlContent = `
							 <div>
								 <span>${game.i18n.localize(CONFIG.LexArcana.RollDifficultyThreshold)}</span>&nbsp;<input type='text' name="difficulty-threshold" value="6"/>
							 </div>`;
		 
		 let mainDialog = new Dialog({
		   title: diceClass,
		   content: htmlContent,
		   buttons: { roll: buttonBuilder(this)}
		 });
		 mainDialog.render(true);
	 }

	 /* -------------------------------------------- */
	 /*                  Dialogs                     */
	 /* -------------------------------------------- */
   
	 /**
	  * Prompt for adding an ability
	  * @param {String}diceClass     The class of dice (e.g. 'oneDice')
	  */
	 addAbility(_diceClass)
	 {
	   const htmlContent = `
		<div class='form grid-layout2'>
		<input type='text' name='ability-label'/></div>
		</div>`;
	   (new Dialog({
		 title: game.i18n.format('LexArcana.AddAbilityPromptTitle', {peritiaName: game.i18n.format(game.i18n.localize(_diceClass))}),
		 content: htmlContent,
		 buttons: {
		   add: {
			 label: game.i18n.localize('LexArcana.ActionAdd'),
			 callback: html =>
			 {
				 let name = html.find('input[name="ability-label"]')[0].value;
				 this.actor.addNPCAbility(_diceClass, name);
			 }
		   }
		 }
	   })).render(true);
	 }

	/* -------------------------------------------- */

	/* -------------------------------------------- */
	/*  Events
	/* -------------------------------------------- */
	

	/* -------------------------------------------- */

	/* -------------------------------------------- */
	/*  Overrides
	/* -------------------------------------------- */
	async _onDropItem(event, data)
	{
		const item = await Item.implementation.fromDropData(data);
		let prohibitedItemTypes = [ "province", "indigamentum", "talent", "ritual"];
		if(prohibitedItemTypes.includes(item.type))
		{
			return false;
		}
		return super._onDropItem(event, data);
	}
}
