import LexArcanaActorSheet from "./base.js";
import LexArcanaActor from "../actor.js";
import { LexArcana } from '../../config.js';
import {LexArcanaDice} from '../../dice.js';

/**
 * An Actor sheet for player character type actors.
 * Extends the base LexArcanaActorSheet class.
 * @type {LexArcanaActorSheet}
 */
export default class LexArcanaCustosActorSheet extends LexArcanaActorSheet
{
	/**
	 * Define default rendering options for the NPC sheet
	 * @return {Object}
	 */
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
			{
				classes: ['LexArcana', 'sheet', 'actor', LexArcana.ActorType.custos],
				width: 720,
				height: 680
			});
	}

	/** @override */
	getData()
	{
		// Basic data
		const data = super.getData();
		// Iterate through items, allocating to containers
		data.items = [];
		data.indigamenta = [];
		data.rituals = [];
		for (let i of data.actor.items)
		{
			switch (i.type)
			{
				case 'province':
				{
					data.province = i;
					break;
				}
				case 'meleeWeapon':
				case 'rangedWeapon':
				case 'armor':
				case 'shield':
				{
					data.items.push(i);
					break;
				}
				case 'indigamentum':
				{
					data.indigamenta.push(i);
					break;
				}
				case 'ritual':
				{
					data.rituals.push(i);
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

		html.find('a.item-image').click(this._onImageClick.bind(this));
		html.find('a.item-name').click(this._onNameClick.bind(this));
		html.find('a.item-roll').click(this._onRollClick.bind(this));
		html.find('a.item-delete').click(this._onDeleteClick.bind(this));

		// Drag events for macros.
		if (this.actor.isOwner)
		{
			let handler = (ev) => this._onDragStart(ev);
			// Find all items on the character sheet.
			html.find('li.item').each((i, li) =>
			{
				// Ignore for the header row.
				if (li.classList.contains('item-header')) return;
				// Add draggable attribute and dragstart listener.
				li.setAttribute('draggable', true);
				li.addEventListener('dragstart', handler, false);
			});
		}
	}

	/* -------------------------------------------- */

	/* -------------------------------------------- */
	/*  Events
	/* -------------------------------------------- */
	async _onImageClick(event, data)
	{
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		const item = this.actor.items.get(dataset.id);
		item.update({ 'data.active': !item.data.data.active });
		return;
	}

	async _onNameClick(event, data)
	{
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		const item = this.actor.items.get(dataset.id);
		item.sheet.render(true);
		return;
	}

	async _onRollClick(event, data)
	{
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		const item = this.actor.items.get(dataset.id);
		LexArcanaDice.Roll(1, item.data.data.damage, LexArcanaDice.EXPRESSIONTYPE.BALANCED, true, item.name);
		return;
	}

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

	/* -------------------------------------------- */

	/* -------------------------------------------- */
	/*  Overrides
	/* -------------------------------------------- */
	async _onDropItem(event, data)
	{
		const item = await Item.implementation.fromDropData(data);
		if(item.type==='province')
		{
			// Iterate through items, allocating to containers
			let itemIds = [];
			for (let i of this.actor.items)
			{
				switch (i.type)
				{
					case 'province':
						itemIds.push(i.id);
						break;
					default: break;
				}
			}
			await this.actor.deleteEmbeddedDocuments('Item', itemIds);
		}
		return super._onDropItem(event, data);
	}
}
