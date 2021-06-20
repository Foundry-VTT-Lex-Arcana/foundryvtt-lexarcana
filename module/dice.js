import { LexArcana } from "./config.js";

export class LexArcanaDice {
	static EXPRESSIONTYPE = { BALANCED: 0, UNBALANCED: 1 };
	static #ComputeBalanced = function(numDice, maxFaces)
	{
		const validDices = [20, 12, 10, 8, 6, 5, 4, 3];
		let currentMaxFaces = maxFaces;
		let computedExpression = "";
		for(let current = 0;current<numDice;++current)
		{
			const filterFaces = currentMaxFaces/(numDice-current);
			const nextFace = validDices.find(value => value<=filterFaces);
			if(nextFace<(currentMaxFaces+1))
			{
				currentMaxFaces -= nextFace;
				computedExpression += (computedExpression!==''?'+':'')+'1d'+nextFace;
			}
		}
		return {expression: computedExpression, totalFaces: (maxFaces-currentMaxFaces)};
	}
	static #ComputeUnbalanced = function(numDice, maxFaces)
	{
		const validDices = [20, 12, 10, 8, 6, 5, 4, 3];
		let diceFaces = [];
		let sumDiceFaces = 0;
		let computedExpression = '';
		if(maxFaces<3*numDice)
		{
			--numDice;
		}
		for(let i = 0;i<numDice;++i)
		{
			diceFaces[i] = 3;
			sumDiceFaces += diceFaces[i];
		}
		let i = 0;
		let nMaxIterations = 12;
		while(sumDiceFaces<maxFaces && --nMaxIterations>0)
		{
			const filterFaces = (maxFaces-sumDiceFaces)+diceFaces[i];
			sumDiceFaces -= diceFaces[i];
			diceFaces[i] = validDices.find(value => value<=filterFaces);
			sumDiceFaces += diceFaces[i];
			i = (i+1)%numDice;
		}
		for(i = 0;i<numDice;++i)
		{
			computedExpression += (computedExpression!==''?'+':'')+'1d'+diceFaces[i];
		}
		return {expression: computedExpression, totalFaces: (maxFaces-(maxFaces-sumDiceFaces))};
	}
	static Compute(numDice, maxFaces, expressionType = LexArcanaDice.EXPRESSIONTYPE.BALANCED)
	{
		switch(expressionType)
		{
			case LexArcanaDice.EXPRESSIONTYPE.UNBALANCED: return LexArcanaDice.#ComputeUnbalanced(numDice, maxFaces); break;
			case LexArcanaDice.EXPRESSIONTYPE.BALANCED:
			default: return LexArcanaDice.#ComputeBalanced(numDice, maxFaces); break;
		}
	}

	static SingleRoll(_numDice, _maxFaces, _expressionType = LexArcanaDice.EXPRESSIONTYPE.BALANCED, _previousResult=null, _info='')
	{
		let dice = LexArcanaDice.Compute(_numDice, _maxFaces, _expressionType);

	    const rollMode = game.settings.get('core', 'rollMode');
	    const message =
	    {
			speaker: {actor: this.id },
			content: '<div class="LexArcanaRoll"><p>'+_info+' '+dice.expression+'</p>',
			blind: rollMode === 'blindroll'
	    };
	    // accept expressions as 1d8, 2d4+1d12, 1d5, 1d6, 1d10, 1d20 etc.
	    const diceFormulaRegExp = '^(([1-9][0-9]*)?d([34568]|(?:10)|(?:12)|(?:20)))(\\+(([1-9][0-9]*)?d([34568]|(?:10)|(?:12)|(?:20))))*';
		let diceHasFated = false;
		let computedTotal = 0;
	    if(dice.expression.match(diceFormulaRegExp))
	    {
			message.roll = (new Roll(dice.expression)).evaluate({async: false});
			diceHasFated = message.roll.total===dice.totalFaces;
			computedTotal = message.roll.total;
			if(_previousResult!==null && _previousResult.hasFated)
			{
				computedTotal += _previousResult.result;
				if(diceHasFated)
				{
					message.content+='<p class="fateroll">'+game.i18n.localize(CONFIG.LexArcana.FateRoll)+'</p>';
				}
				message.content+='<p class="fateroll">'+computedTotal+' ('+_previousResult.result+'+'+message.roll.total+')</p>';
			}
			else if(diceHasFated)
			{
				message.content+='<p class="fateroll">'+game.i18n.localize(CONFIG.LexArcana.FateRoll)+'</p>';
				message.content+='<p class="fateroll">'+message.roll.total+'</p>';
			}
			else
			{
				message.content+='<p>'+message.roll.total+'</p>';
			}
			message.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
			message.sound = CONFIG.sounds.dice;
	    }
	    else
	    {
		message.content += game.i18n.localize('LexArcana.InvalidRoll');
	    }
		message.content += '</div>';
	    return {result: computedTotal, hasFated: diceHasFated, message: ChatMessage.create(message)};
	}

	static Roll(_numDice, _maxFaces, _expressionType = LexArcanaDice.EXPRESSIONTYPE.BALANCED, _hasFateRoll = false, _info='')
	{
		if(!_hasFateRoll)
			return this.SingleRoll(_numDice, _maxFaces, _expressionType, null, _info);
		let totalResult = 0;
		let result = null;
		do
		{
			result = this.SingleRoll(_numDice, _maxFaces, _expressionType, result, _info);
			totalResult += result.result;

		}while(result.hasFated);
		return;
	}
};
