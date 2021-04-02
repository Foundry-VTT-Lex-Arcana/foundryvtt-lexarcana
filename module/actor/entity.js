import {LexArcana} from '../config.js';
import {LexArcanaDice} from '../dice.js';

/**
 * Extend the base Actor class to implement additional system-specific logic.
 */
export default class LexArcanaActor extends Actor
{
    /* -------------------------------------------- */

    /** @override */
    prepareBaseData()
    {
        switch (this.data.type)
        {
            case LexArcana.ActorType.custos:
                return this._prepareCustosData(this.data);
            case LexArcana.ActorType.friendly:
                return this._prepareFriendlyTypeData(this.data);
            case LexArcana.ActorType.antagonist:
                return this._prepareAntagonistTypeData(this.data);
            case LexArcana.ActorType.fantasticalCreature:
                return this._preparefantasticalCreatureTypeData(this.data);
        }
    }

    /* -------------------------------------------- */
    /*  Data Preparation Helpers                    */

    /* -------------------------------------------- */

    /**
     * Prepare Character type specific data
     */
    _prepareCustosData(actorData)
    {
        const data = actorData.data;
    }

    /* -------------------------------------------- */

    /**
     * Prepare Friendly type specific data
     */
    _prepareFriendlyTypeData(actorData)
    {
        const data = actorData.data;
    }

    /* -------------------------------------------- */

    /**
     * Prepare Antagonist type-specific data
     * @param actorData
     * @private
     */
    _prepareAntagonistTypeData(actorData)
    {

    }

    /* -------------------------------------------- */

    /**
     * Prepare fantasticalCreature type-specific data
     * @param actorData
     * @private
     */
    _preparefantasticalCreatureTypeData(actorData)
    {

    }

    /* -------------------------------------------- */
    /*              	Manipulators                */
    /* -------------------------------------------- */
    async addPeritiaSpecialty(peritiaId, name, modifier)
    {
        const currentSpecialties = duplicate(this.data.data.peritiae?.[peritiaId]?.specialties ?? []);
        await super.update({[`data.peritiae.${peritiaId}.specialties`]: [...currentSpecialties, { "name":name, "defaultRoll": "", "modifier": modifier }] });
    }
    async removePeritiaSpecialty(peritiaId, key)
    {
        let currentSpecialties = duplicate(this.data.data.peritiae?.[peritiaId]?.specialties ?? []);
        currentSpecialties = currentSpecialties.filter(item => item.name!==key);
        await super.update({[`data.peritiae.${peritiaId}.specialties`]: [...currentSpecialties] });
    }
    async changePeritiaDefaultRoll(peritiaId, newExpression)
    {
        await super.update({[`data.peritiae.${peritiaId}.defaultRoll`]: newExpression });
    }
    async changePeritiaSpecialtyDefaultRoll(peritiaId, key, newExpression)
    {
        let currentSpecialties = duplicate(this.data.data.peritiae?.[peritiaId]?.specialties ?? []);
        const idx = currentSpecialties.findIndex(item => item.name===key);
        if(currentSpecialties[idx]!==undefined)
        {
            const idx = currentSpecialties.findIndex(item => item.name===key);
            currentSpecialties[idx].defaultRoll = newExpression;
            await super.update({[`data.peritiae.${peritiaId}.specialties`]: [...currentSpecialties] });
        }
    }

    /* -------------------------------------------- */
    /*	Roll Dices
     */

    /* -------------------------------------------- */

    roll(expression)
    {
        let rollMode = game.settings.get('core', 'rollMode');
        let message = {speaker: {actor: this.id }, content: expression, blind: rollMode === 'blindroll' };
        if(expression.match("^(([1-9][0-9]*)?d([34568]|(?:10)|(?:12)|(?:20)))(\\+(([1-9][0-9]*)?d([34568]|(?:10)|(?:12)|(?:20))))*"))
        {
            message.roll = (new Roll(expression)).evaluate();
            message.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
            message.sound = CONFIG.sounds.dice;
        }
        else
        {
            message.content = expression+" "+game.i18n.localize("LexArcana.InvalidRoll");
        }
        return ChatMessage.create(message);
    }

    rollPeritiaSpecialty(peritiaid, key, numDice)
    {
        const peritia = this.data.data.peritiae[peritiaid];
        let idx = peritia.specialties.findIndex(item => item.name===key);
        const specialty = peritia.specialties[idx];
        const totalFaces = peritia.value+parseInt(specialty.modifier);
        return this.roll(LexArcanaDice.ComputeExpression(numDice, totalFaces));
    }

    rollND(numFaces, numDice)
    {
        return this.roll(LexArcanaDice.ComputeExpression(numDice, numFaces));
    }
}
