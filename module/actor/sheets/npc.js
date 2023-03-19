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
		data.specialAbilities = [];
		for (let i of data.actor.items)
		{
			switch (i.type)
			{
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
		// override
        html.find('.dialog-roll').click(this._onRollDialog.bind(this));
		
		html.find('a.edit-special-ability').click(this._onEditClick.bind(this));
		html.find('a.delete-special-ability').click(this._onDeleteClick.bind(this));
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
		 const htmlContent = `<div>
								 ${expressionTypePrompt}: <input type='checkbox' name='expression-type'/>
							 </div>
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
}
