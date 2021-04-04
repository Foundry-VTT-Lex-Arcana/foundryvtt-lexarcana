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
        return LexArcanaUtils.ObjectToArray(peritia.specialties).find(item => item.name===speName);
    }
    getSpecialties(peritiaId)
    {
        let specialties = this.data.data.peritiae?.[peritiaId]?.specialties ?? [];
        return LexArcanaUtils.ObjectToArray(specialties);
    }

    /* -------------------------------------------- */
    /*                  Manipulators                */
    /* -------------------------------------------- */
    async setVirtuteDefaultRoll(virtuteId, newExpression)
    {
        await super.update({[`data.virtutes.${virtuteId}.defaultRoll`]: newExpression });
    }
    async setPeritiaDefaultRoll(peritiaId, newExpression)
    {
        await super.update({[`data.peritiae.${peritiaId}.defaultRoll`]: newExpression });
    }
    async addPeritiaSpecialty(peritiaId, name, modifier)
    {
        const currentSpecialties = duplicate(this.getSpecialties(peritiaId));
        await super.update({[`data.peritiae.${peritiaId}.specialties`]: [...currentSpecialties, { 'name':name, 'defaultRoll': '', 'modifier': modifier }] });
    }
    async removePeritiaSpecialty(peritiaId, key)
    {
        const currentSpecialties = duplicate(this.getSpecialties(peritiaId)).filter(item => item.name!==key);
        await super.update({[`data.peritiae.${peritiaId}.specialties`]: [...currentSpecialties] });
    }
    async setPeritiaSpecialtyDefaultRoll(peritiaId, key, newExpression)
    {
        const currentSpecialties = duplicate(this.getSpecialties(peritiaId));
        const idx = currentSpecialties.findIndex(item => item.name===key);
        if(currentSpecialties[idx]!==undefined)
        {
            currentSpecialties[idx].defaultRoll = newExpression;
            await super.update({[`data.peritiae.${peritiaId}.specialties`]: [...currentSpecialties] });
        }
    }

    /* -------------------------------------------- */
    /*                  Roll Dices                  */
    /* -------------------------------------------- */

    roll(expression, info='')
    {
        const rollMode = game.settings.get('core', 'rollMode');
        const message =
        {
            speaker: {actor: this.id },
            content: info+" "+expression,
            blind: rollMode === 'blindroll'
        };
        // accept expressions as 1d8, 2d4+1d12, 1d5, 1d6, 1d10, 1d20 etc.
        const diceFormulaRegExp = '^(([1-9][0-9]*)?d([34568]|(?:10)|(?:12)|(?:20)))(\\+(([1-9][0-9]*)?d([34568]|(?:10)|(?:12)|(?:20))))*';
        if(expression.match(diceFormulaRegExp))
        {
            message.roll = (new Roll(expression)).evaluate();
            message.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
            message.sound = CONFIG.sounds.dice;
        }
        else
        {
            message.content += game.i18n.localize('LexArcana.InvalidRoll');
        }
        return ChatMessage.create(message);
    }

    rollPeritiaSpecialty(peritiaid, key, numDice, expressionType = LexArcanaDice.EXPRESSIONTYPE.BALANCED, info='')
    {
        const specialty = this.getSpecialty(peritiaid, key);
        const totalFaces = this.data.data.peritiae[peritiaid].value+parseInt(specialty.modifier);
        return this.roll(LexArcanaDice.ComputeExpression(numDice, totalFaces, expressionType), info);
    }

    rollND(numFaces, numDice, expressionType = LexArcanaDice.EXPRESSIONTYPE.BALANCED, info='')
    {
        return this.roll(LexArcanaDice.ComputeExpression(numDice, numFaces, expressionType), info);
    }
}
