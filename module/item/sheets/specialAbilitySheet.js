import {LexArcana} from '../../config.js';
import {System} from '../../config.js';
import LexArcanaItemSheet from './base.js';

/**
 * Override and extend the core LexArcanaItemSheet implementation to handle specific item types
 * @extends {LexArcanaItemSheet}
 */
export default class LexArcanaSpecialAbilitySheet extends LexArcanaItemSheet
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
		data.object = duplicate(this.object.system);
		// Return data to the sheet
		return data;
	}

	static toArray(data)
	{
		// force values to be arrays
		// https://github.com/trioderegion/nova/blob/319d39b274d25b35af49896ea83a4115cda35cf6/module/documents/actor.mjs#L127
		/*const forceArray = (path) => {
			const value = data[path];
			if (!!value && typeof value == 'string') {
				data[path] = [value];
			}
		}*/
		return Object.entries(data)
		.map((value, index) => {
		   return value.pop()
		});
	}
}
