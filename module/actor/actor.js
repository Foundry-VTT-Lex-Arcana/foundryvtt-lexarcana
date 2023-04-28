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
            case LexArcana.ActorType.npc:
                return this._prepareNPCData(this.system);
            case LexArcana.ActorType.creature:
                return this._prepareCreatureData(this.system);
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
     * Prepare NPC type specific data
     */
    _prepareNPCData(actorData)
    {
        const data = actorData;
    }

    /* -------------------------------------------- */

    /**
     * Prepare Creature type-specific data
     * @param actorData
     * @private
     */
    _prepareCreatureData(actorData)
    {

    }

    /* -------------------------------------------- */
    /*                  Accessors                   */
    /* -------------------------------------------- */
	getPeritiaScore(_peritiaId)
	{
		const baseValue = Number(this.system.peritiae[_peritiaId].value);
		let province = null;
		for (let i of this.items)
		{
			switch (i.type)
			{
				case 'province':
				{
					province = i;
					break;
				}
			}
		}
		const provinceValue = province !== null ? province.system.peritiaeModifiers[_peritiaId].value : 0;
		return baseValue + provinceValue;
	}

    getSpecialty(peritiaId, speName)
    {
        const peritia = this.system.peritiae[peritiaId];
        return LexArcanaUtils.ObjectToArray(peritia.specialties).find(item => item.name===speName);
    }
    getSpecialties(peritiaId)
    {
        let specialties = this.system.peritiae?.[peritiaId]?.specialties ?? [];
        return LexArcanaUtils.ObjectToArray(specialties);
    }
	getSpecialtyScore(_peritiaId, _specialtyId)
	{
        const specialty = this.getSpecialty(_peritiaId, _specialtyId);
        return this.getPeritiaScore(_peritiaId)+Number(specialty.modifier);
	}          
	// --------------------------------------------
    getAbilities(diceClass)
    {
        let abilities = this.system[diceClass] ?? [];
        return LexArcanaUtils.ObjectToArray(abilities);
    }

    /* -------------------------------------------- */
    /*                  Manipulators                */
    /* -------------------------------------------- */
    async setVirtuteDefaultRoll(virtuteId, newExpression)
    {
        await super.update({[`system.virtutes.${virtuteId}.defaultRoll`]: newExpression });
    }
    async setPeritiaDefaultRoll(peritiaId, newExpression)
    {
        await super.update({[`system.peritiae.${peritiaId}.defaultRoll`]: newExpression });
    }
    async addPeritiaSpecialty(peritiaId, name, modifier)
    {
        const currentSpecialties = duplicate(this.getSpecialties(peritiaId));
        await super.update({[`system.peritiae.${peritiaId}.specialties`]: [...currentSpecialties, { 'name':name, 'defaultRoll': '', 'modifier': modifier }] });
    }
    async removePeritiaSpecialty(peritiaId, key)
    {
        const currentSpecialties = duplicate(this.getSpecialties(peritiaId)).filter(item => item.name!==key);
        await super.update({[`system.peritiae.${peritiaId}.specialties`]: [...currentSpecialties] });
    }
    async setPeritiaSpecialtyDefaultRoll(peritiaId, key, newExpression)
    {
        const currentSpecialties = duplicate(this.getSpecialties(peritiaId));
        const idx = currentSpecialties.findIndex(item => item.name===key);
        if(currentSpecialties[idx]!==undefined)
        {
            currentSpecialties[idx].defaultRoll = newExpression;
            await super.update({[`system.peritiae.${peritiaId}.specialties`]: [...currentSpecialties] });
        }
    }

	// -----------------------------------------------------------------

    async addNPCAbility(_diceClass, _name)
    {
        const currentAbilities = duplicate(this.getAbilities(_diceClass));
        await super.update({[`system.${_diceClass}`]: [...currentAbilities, _name] });
    }
    async removeNPCAbility(_diceClass, _abilityid)
    {
        const currentSpecialties = duplicate(this.getAbilities(_diceClass)).filter((element, index) => element!==_abilityid);
        await super.update({[`system.${_diceClass}`]: [...currentSpecialties] });
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

	rollDeBello(_hasFateRoll, _specialtyName = '')
	{
		let score = this.getSpecialtyScore('deBello', _specialtyName);
        return LexArcanaDice.RollFlat(min(3, parseInt(score/6)+1), score, LexArcanaDice.EXPRESSIONTYPE.BALANCED, _hasFateRoll, _info);
	}

	combatTurn()
	{
		let targetObject = Array.from(game.user.targets)[0];
		let selfRoll = this.actor.rollDeBello(this.system.fateRoll, '');
		let otherRoll = targetObject.rollDeBello(this.system.fateRoll, '');
		const message =
		{
			speaker: {actor: this.id },
			content: '<div class="CombatAction"><h1>Combat</h1>',
			blind: false
		};
		message.content += '<p>Combat diff : ('+selfRoll.result+'-'+otherRoll.result+') = '+(selfRoll.result-otherRoll.result)+'</p>';
		message.content += '</div>';
		ChatMessage.Create(message);
	}
}
