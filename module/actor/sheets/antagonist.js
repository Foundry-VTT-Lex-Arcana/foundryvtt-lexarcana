import LexArcanaActorSheet from "../sheets/base.js";
import {LexArcana} from '../../config.js';

/**
 * An Actor sheet for NPC type characters.
 * Extends the base LexArcanaActorSheet class.
 * @extends {LexArcanaActorSheet}
 */
export default class LexArcanaAntagonistActorSheet extends LexArcanaActorSheet
{
    /** @override */
    static get defaultOptions()
    {
        return mergeObject(super.defaultOptions,
            {
                classes: ["LexArcana", "sheet", "actor", LexArcana.ActorType.antagonist],
                width: 600,
                height: 680
            });
    }
}
