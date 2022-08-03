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
        switch (this.type)
        {
            case LexArcana.ActorType.custos:
                return this._prepareCustosData(this.system);
            case LexArcana.ActorType.friendly:
                return this._prepareFriendlyTypeData(this.system);
            case LexArcana.ActorType.antagonist:
                return this._prepareAntagonistTypeData(this.system);
            case LexArcana.ActorType.fantasticalCreature:
                return this._preparefantasticalCreatureTypeData(this.system);
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
        const data = actorData;
    }

    /* -------------------------------------------- */

    /**
     * Prepare Friendly type specific data
     */
    _prepareFriendlyTypeData(actorData)
    {
        const data = actorData;
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
	getSpecialtyScore(_peritiaid, _specialtyId)
	{
        const specialty = this.getSpecialty(_peritiaid, _specialtyId);
        return this.data.data.peritiae[_peritiaid].value+parseInt(specialty.modifier);
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
	
	rollCustom(expression, _hasFateRoll, _difficultyThreshold = 6, info='')
	{
        LexArcanaDice.RollExpression(expression, _difficultyThreshold, _hasFateRoll, info);
    }

    rollND(_numDice, _numFaces, _hasFateRoll, _difficultyThreshold = 6, _expressionType = LexArcanaDice.EXPRESSIONTYPE.BALANCED, _info='')
    {
        LexArcanaDice.Roll(_numDice, _numFaces, _expressionType, _difficultyThreshold, _hasFateRoll, _info);
    }
}
