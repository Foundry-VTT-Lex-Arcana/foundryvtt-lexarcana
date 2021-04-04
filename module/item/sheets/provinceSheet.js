import {LexArcana} from '../../config.js';
import {System} from '../../config.js';
import LexArcanaItemSheet from '../sheet.js';

/**
 * Override and extend the core LexArcanaItemSheet implementation to handle specific item types
 * @extends {LexArcanaItemSheet}
 */
export default class LexArcanaProvinceSheet extends LexArcanaItemSheet
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
		tabs: [{navSelector: '.tabs', contentSelector: '.sheet-body', initial: 'information'}]
	    });
	}

	/** @override */
	getData()
	{
		// Basic data
		let isOwner = this.entity.owner;
		const data = super.getData();
		data.owner = isOwner;
		data.isGM = game.user.isGM;
		data.limited = this.entity.limited;
		data.options = this.options;
		data.editable = this.isEditable;
		data.cssClass = isOwner ? 'editable' : 'locked';
		data.config = CONFIG.LexArcana;
		// The Actor and its Items
		data.object = duplicate(this.object.data);
		data.data = data.object.data;

		// Ability Scores
		for ( let [k, v] of Object.entries(data.object.data.peritiaeModifiers))
		{
			v.label = CONFIG.LexArcana.Peritia[k];
		}
		// Return data to the sheet
		return data;
	}
}