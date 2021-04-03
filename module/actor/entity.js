import {LexArcana} from '../config.js';
import {LexArcanaDice} from '../dice.js';
import {LexArcanaUtils} from '../utils.js';

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
    /*                  Accessors                   */
    /* -------------------------------------------- */
    getSpecialty(peritiaId, speName)
    {
        const peritia = this.data.data.peritiae[peritiaId];
        let idx = LexArcanaUtils.ObjectToArray(peritia.specialties).findIndex(item => item.name===speName);
        return peritia.specialties[idx];
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
        currentSpecialties = LexArcanaUtils.ObjectToArray(currentSpecialties).filter(item => item.name!==key);
        await super.update({[`data.peritiae.${peritiaId}.specialties`]: [...currentSpecialties] });
    }
    async setPeritiaDefaultRoll(peritiaId, newExpression)
    {
        await super.update({[`data.peritiae.${peritiaId}.defaultRoll`]: newExpression });
    }
    async setPeritiaSpecialtyDefaultRoll(peritiaId, key, newExpression)
    {
        let currentSpecialties = duplicate(this.data.data.peritiae?.[peritiaId]?.specialties ?? []);
        currentSpecialties = LexArcanaUtils.ObjectToArray(currentSpecialties);
        const idx = currentSpecialties.findIndex(item => item.name===key);
        if(currentSpecialties[idx]!==undefined)
        {
            currentSpecialties[idx].defaultRoll = newExpression;
            await super.update({[`data.peritiae.${peritiaId}.specialties`]: [...currentSpecialties] });
        }
    }

    /* -------------------------------------------- */
    /*	Roll Dices
     */

    /* -------------------------------------------- */

    roll(expression, info="")
    {
        let rollMode = game.settings.get('core', 'rollMode');
        let message = {speaker: {actor: this.id }, content: expression, blind: rollMode === 'blindroll' };
        if(expression.match("^(([1-9][0-9]*)?d([34568]|(?:10)|(?:12)|(?:20)))(\\+(([1-9][0-9]*)?d([34568]|(?:10)|(?:12)|(?:20))))*"))
        {
            message.roll = (new Roll(expression)).evaluate();
            message.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
            message.sound = CONFIG.sounds.dice;
            message.content = info;
        }
        else
        {
            message.content = info+" "+expression+" "+game.i18n.localize("LexArcana.InvalidRoll");
        }
        return ChatMessage.create(message);
    }

    rollPeritiaSpecialty(peritiaid, key, numDice, info="")
    {
        const specialty = this.getSpecialty(peritiaid, key);
        const totalFaces = this.data.data.peritiae[peritiaid].value+parseInt(specialty.modifier);
        return this.roll(LexArcanaDice.ComputeExpression(numDice, totalFaces), info);
    }

    rollND(numFaces, numDice, info="")
    {
        return this.roll(LexArcanaDice.ComputeExpression(numDice, numFaces), info);
    }
}
