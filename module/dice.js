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

	static ComputeExpression = function(numDice, maxFaces, expressionType = LexArcanaDice.EXPRESSIONTYPE.BALANCED)
	{
		switch(expressionType)
		{
			case LexArcanaDice.EXPRESSIONTYPE.UNBALANCED: return LexArcanaDice.#ComputeUnbalanced(numDice, maxFaces); break;
			case LexArcanaDice.EXPRESSIONTYPE.BALANCED:
			default: return LexArcanaDice.#ComputeBalanced(numDice, maxFaces); break;
		}
	}

	static #RollExpression = function(_expression, _difficultyThreshold = 6, _hasFateRoll = false, _totalFaces = null, _info = '')
	{
		const rollMode = game.settings.get('core', 'rollMode');
		const message =
		{
			speaker: {actor: this.id },
			content: '<div class="LexArcanaRoll"><h1>'+_info+'</h1>',
			blind: rollMode === 'blindroll'
		};
		// accept expressions as 1d8, 2d4+1d12, 1d5, 1d6, 1d10, 1d20 etc.
		const diceFormulaRegExp = '^(([1-9][0-9]*)?d([34568]|(?:10)|(?:12)|(?:20)))(\\+(([1-9][0-9]*)?d([34568]|(?:10)|(?:12)|(?:20))))*';
		if(!_expression.match(diceFormulaRegExp))
		{
			message.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
			message.sound = CONFIG.sounds.dice;
			message.content += '<p class="error">'+game.i18n.localize('LexArcana.InvalidRoll')+'</p>';
			message.content += '</div>';
			return {result: computedTotal, diceHasFated: diceHasFated, message: message};
		}
		let diceHasFated = false;
		let computedTotal = 0;

		let totalFaces = _totalFaces;
		if(totalFaces === null)
		{
			totalFaces = 0;
			let roll = new Roll(_expression);
			let rollEval = roll.evaluate({async: false});
			if(rollEval.dice.length===0)
			{
				message.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
				message.sound = CONFIG.sounds.dice;
				message.content += '<p class="error">'+game.i18n.localize('LexArcana.InvalidRoll')+'</p>';
				message.content += '</div>';
				return {result: computedTotal, diceHasFated: diceHasFated, message: message};
			}
			rollEval.dice.forEach((die) => totalFaces+=die.faces);
		}

		let previousHasFated = false;
		let previousTotal = 0;
		do
		{
			let roll = new Roll(_expression);
			let evaluatedRoll = roll.evaluate({async: false});
			diceHasFated = evaluatedRoll.total===totalFaces && _hasFateRoll;
			if(diceHasFated)
			{
				message.content+='<div class="fateroll">';
				message.content+='<p class="important">'+game.i18n.localize(CONFIG.LexArcana.FateRoll)+'!</p>';
			}
			computedTotal = evaluatedRoll.total + previousTotal;
			if(previousHasFated && !diceHasFated)
			{
				message.content+='<span>Result: '+computedTotal+' ('+previousTotal+'+'+evaluatedRoll.total+')</span>&nbsp;';
			}
			else if(!previousHasFated)
			{
				message.content+='<span>Result: '+computedTotal+'</span>&nbsp;';
			}
			let expressionResult = '';
			evaluatedRoll.dice.forEach((die) => expressionResult+=die.total+' ');
			message.content+='<span class="details"> -> '+_expression+' ( '+expressionResult+')</span>';

			message.content+='<hr/>';
			previousTotal = computedTotal;
			message.roll = evaluatedRoll; // always set the last roll
			// post-process
			if(diceHasFated)
			{
				message.content+='</div>';
				previousHasFated = true;
			}
		}while(diceHasFated);

		message.content += '<div>';
		if(computedTotal>_difficultyThreshold)
		{
			let difference = computedTotal-_difficultyThreshold;
			switch(parseInt(difference/3))
			{
				case 0: message.content += '<span class="DoS1">'+game.i18n.localize(CONFIG.LexArcana.DoSMarginalSuccess)+'</span>'; break;
				case 1: message.content += '<span class="DoS2">'+game.i18n.localize(CONFIG.LexArcana.DoSCompleteSuccess)+'</span>'; break;
				case 2:
				default: message.content += '<span class="DoS3">'+game.i18n.localize(CONFIG.LexArcana.DoSExceptionalSuccess)+'</span>'; break;
			}
		}
		else
		{
			message.content += '<span class="failure">FAILURE!</span>';
		}
		message.content+='&nbsp;<span class="details">'+game.i18n.localize(CONFIG.LexArcana.RollDetailsThreshold)+' "'+_difficultyThreshold+'"</span>';
		message.content += '</div>';

		message.content += '</div>';
		message.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
		message.sound = CONFIG.sounds.dice;
		return {result: computedTotal, diceHasFated: diceHasFated, message: message};
	}

	static #CreateChatMessage = function(_message)
	{
		return ChatMessage.create(_message);
	}

	static #ComputedRoll = function(_numDice, _maxFaces, _expressionType = LexArcanaDice.EXPRESSIONTYPE.BALANCED, _difficultyThreshold = 6, _hasFateRoll = false, _info='')
	{
		let dice = LexArcanaDice.ComputeExpression(_numDice, _maxFaces, _expressionType);
		return LexArcanaDice.#RollExpression(dice.expression, _difficultyThreshold, _hasFateRoll, dice.totalFaces, _info);
	}

	static Roll(_numDice, _maxFaces, _expressionType = LexArcanaDice.EXPRESSIONTYPE.BALANCED, _difficultyThreshold = 6, _hasFateRoll = false, _info='')
	{
		let res = LexArcanaDice.#ComputedRoll(_numDice, _maxFaces, _expressionType, _difficultyThreshold, _hasFateRoll, _info);
		LexArcanaDice.#CreateChatMessage(res.message);
	}

	static RollExpression(_expression, _difficultyThreshold = 6, _hasFateRoll = false, _info='')
	{
		let res = LexArcanaDice.#RollExpression(_expression, _difficultyThreshold, _hasFateRoll, null, _info);
		LexArcanaDice.#CreateChatMessage(res.message);
	}
};
