import LexArcanaNPCActorSheet from "./npc.js";
import { LexArcana } from '../../config.js';

/**
 * An Actor sheet for player character type actors.
 * Extends the base LexArcanaActorSheet class.
 * @type {LexArcanaActorSheet}
 */
export default class LexArcanaCreatureActorSheet extends LexArcanaNPCActorSheet
{
	/**
	 * Define default rendering options for the NPC sheet
	 * @return {Object}
	 */
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
			{
				classes: ['LexArcana', 'sheet', 'actor', LexArcana.ActorType.creature],
				width: 720,
				height: 680
			});
	}

	/** @override */
	getData()
	{
		// Basic data
		const data = super.getData();
		data.magicalPowers = [];
		for (let i of data.actor.items)
		{
			switch (i.type)
			{
				case 'magicalPower':
				{
					data.magicalPowers.push(i);
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
	/**
	 * Activate event listeners using the prepared sheet HTML
	 * @override
	 * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
	 */
	activateListeners(html)
	{
		super.activateListeners(html);
		if (!this.options.editable) return;

		html.find('a.edit-magical-power').click(this._onEditClick.bind(this));
		html.find('a.delete-magical-power').click(this._onDeleteClick.bind(this));
	}
		
}
