import {LexArcana} from '../../config.js';
import {System} from '../../config.js';
import LexArcanaItemSheet from '../sheet.js';

/**
 * Override and extend the core LexArcanaItemSheet implementation to handle specific item types
 * @extends {LexArcanaItemSheet}
 */
export default class LexArcanaRitualSheet extends LexArcanaItemSheet
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
		let isOwner = this.document.isOwner;
		const data = super.getData();
		data.owner = isOwner;
		data.isGM = game.user.isGM;
		data.limited = this.document.limited;
		data.options = this.options;
		data.editable = this.isEditable;
		data.cssClass = isOwner ? 'editable' : 'locked';
		data.config = CONFIG.LexArcana;
		// The Actor and its Items
		data.object = duplicate(this.object.data);
		data.data = data.object.data;

		// Return data to the sheet
		return data;
	}

	/** @override */
	activateListeners(html)
	{
		super.activateListeners(html);
		html.find('a.discipline-add').click(function()
		{
			const id = this.dataset.itemId;
			let item = game.items.get(id);
			let disciplines = item.data.data.disciplines===undefined?[]:item.data.data.disciplines;
			disciplines.push({});
			item.update({ 'data.disciplines': disciplines });
		});
		html.find('a.discipline-delete').click(function()
		{
			const id = this.dataset.itemId;
			let item = game.items.get(id);
			let disciplines = item.data.data.disciplines===undefined?[]:item.data.data.disciplines;
			disciplines.splice(this.dataset.disciplineId, 1);
			item.update({ 'data.disciplines': disciplines });
		});
	}
}