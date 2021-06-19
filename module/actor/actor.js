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

    rollPeritiaSpecialty(_peritiaid, _key, _numDice, _expressionType = LexArcanaDice.EXPRESSIONTYPE.BALANCED, _info='')
    {
        const specialty = this.getSpecialty(_peritiaid, _key);
        const totalFaces = this.data.data.peritiae[_peritiaid].value+parseInt(specialty.modifier);
        LexArcanaDice.Roll(_numDice, totalFaces, _expressionType, true, _info);
    }

    rollND(_numFaces, _numDice, _expressionType = LexArcanaDice.EXPRESSIONTYPE.BALANCED, _info='')
    {
        LexArcanaDice.Roll(_numDice, _numFaces, _expressionType, true, _info);
    }
}
