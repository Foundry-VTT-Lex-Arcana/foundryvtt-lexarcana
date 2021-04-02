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
    async AddPeritiaSpecialty(peritiaId, name, modifier)
    {
        const currentSpecialties = duplicate(this.data.data.peritiae?.[peritiaId]?.specialties ?? []);
        await super.update({[`data.peritiae.${peritiaId}.specialties`]: [...currentSpecialties, { "name":name, "defaultRoll": "", "modifier": modifier }] });
    }
    async RemovePeritiaSpecialty(peritiaId, key)
    {
        let currentSpecialties = duplicate(this.data.data.peritiae?.[peritiaId]?.specialties ?? []);
        currentSpecialties = currentSpecialties.filter(item => item.name!==key);
        await super.update({[`data.peritiae.${peritiaId}.specialties`]: [...currentSpecialties] });
    }
    async ChangePeritiaDefaultRoll(peritiaId, newExpression)
    {
        await super.update({[`data.peritiae.${peritiaId}.defaultRoll`]: newExpression });
    }
    async ChangePeritiaSpecialtyDefaultRoll(peritiaId, key, newExpression)
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
        let rollInstance = new Roll(expression);
        let rollMode = game.settings.get('core', 'rollMode');
        let blind = rollMode === 'blindroll';
        return ChatMessage.create({
          speaker: {
            actor: this.id,
          },
          content: "We rolled",
          roll: rollInstance.evaluate(),
          type: CONST.CHAT_MESSAGE_TYPES.ROLL,
          sound: CONFIG.sounds.dice,
          blind,
        });
    }

    RollPeritiaSpecialty(peritiaid, key, numDice)
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
