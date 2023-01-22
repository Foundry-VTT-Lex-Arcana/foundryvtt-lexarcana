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
}
