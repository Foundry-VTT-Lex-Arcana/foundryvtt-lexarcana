import { LexArcana } from "./config.js";

export class LexArcanaDice {
	static EXPRESSIONTYPE = { BALANCED: 0, UNBALANCED: 1 };
	static VALIDDICES = [20, 12, 10, 8, 6, 5, 4, 3];
	static ComputeNumDices = function(_numDice, _maxFaces)
	{
		let numDices = 0;
		let currentMaxFaces = _maxFaces;
		for(let current = 0;current<_numDice;++current)
		{
			const filterFaces = currentMaxFaces/(_numDice-current);
			const nextFace = this.VALIDDICES.find(value => value<=filterFaces);
			if(nextFace<(currentMaxFaces+1))
			{
				currentMaxFaces -= nextFace;
				++numDices;
			}
		}
		return numDices;
	}
	static #ComputeBalanced = function(_numDice, _maxFaces)
	{
		let currentMaxFaces = _maxFaces;
		let computedExpression = "";
		for(let current = 0;current<_numDice;++current)
		{
			const filterFaces = currentMaxFaces/(_numDice-current);
			const nextFace = this.VALIDDICES.find(value => value<=filterFaces);
			if(nextFace<(currentMaxFaces+1))
			{
				currentMaxFaces -= nextFace;
				computedExpression += (computedExpression!==''?'+':'')+'1d'+nextFace;
			}
		}
		return {expression: computedExpression, totalFaces: (_maxFaces-currentMaxFaces)};
	}
	static #ComputeUnbalanced = function(_numDice, _maxFaces)
	{
		let diceFaces = [];
		let sumDiceFaces = 0;
		let computedExpression = '';
		if(_maxFaces<3*_numDice)
		{
			--_numDice;
		}
		for(let i = 0;i<_numDice;++i)
		{
			diceFaces[i] = 3;
			sumDiceFaces += diceFaces[i];
		}
		let i = 0;
		let nMaxIterations = 12;
		while(sumDiceFaces<_maxFaces && --nMaxIterations>0)
		{
			const filterFaces = (_maxFaces-sumDiceFaces)+diceFaces[i];
			sumDiceFaces -= diceFaces[i];
			diceFaces[i] = this.VALIDDICES.find(value => value<=filterFaces);
			sumDiceFaces += diceFaces[i];
			i = (i+1)%_numDice;
		}
		for(i = 0;i<_numDice;++i)
		{
			computedExpression += (computedExpression!==''?'+':'')+'1d'+diceFaces[i];
		}
		return {expression: computedExpression, totalFaces: (_maxFaces-(_maxFaces-sumDiceFaces))};
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
			message.isRoll = false;
			message.roll = null;
			return {result: 0, diceHasFated: false, message: message, hasError: true};
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
				message.isRoll = false;
				message.roll = null;
				return {result: computedTotal, diceHasFated: diceHasFated, message: message, hasError: true};
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
				console.log ("NOMBRE RESULTADO")
				console.log (game.i18n.localize(CONFIG.LexArcana.ResultName))
				console.log (game.i18n.localize(CONFIG.LexArcana.DoSMarginalSuccess))
				message.content+='<span>'+game.i18n.localize(CONFIG.LexArcana.ResultName)+': '+computedTotal+' ('+previousTotal+'+'+evaluatedRoll.total+')</span>';
			}
			else if(!previousHasFated)
			{
				console.log ("NOMBRE RESULTADO")
				console.log (game.i18n.localize(CONFIG.LexArcana.DoSMarginalSuccess))
				console.log (game.i18n.localize(CONFIG.LexArcana.DoSMarginalSuccess))
				message.content+='<span>'+game.i18n.localize(CONFIG.LexArcana.ResultName)+': '+computedTotal+' <i class="fas fa-dice-d6"></i></span>';
			}
			let expressionResult = '';
			evaluatedRoll.dice.forEach((die) => expressionResult+=die.total+' ');
			message.content+='<span class="details"> -&gt; '+_expression+' ( '+expressionResult+')</span>';

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
		if(_difficultyThreshold>0)
		{
			if(computedTotal>_difficultyThreshold)
			{
				let difference = computedTotal-_difficultyThreshold-1;
				switch((difference-(difference%3))/3)
				{
					case 0: message.content += '<span class="DoS1">'+game.i18n.localize(CONFIG.LexArcana.DoSMarginalSuccess)+'</span>'; break;
					case 1: message.content += '<span class="DoS2">'+game.i18n.localize(CONFIG.LexArcana.DoSCompleteSuccess)+'</span>'; break;
					case 2:
					default: message.content += '<span class="DoS3">'+game.i18n.localize(CONFIG.LexArcana.DoSExceptionalSuccess)+'</span>'; break;
				}
			}
			else
			{
				message.content += '<span class="failure">'+game.i18n.localize(CONFIG.LexArcana.Failure)+'</span>';
			}
		}
		message.content+='<span class="details">'+game.i18n.localize(CONFIG.LexArcana.RollDetailsThreshold)+' "'+_difficultyThreshold+'"</span>';
		message.content += '</div>';

		message.content += '</div>';
		message.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
		message.sound = CONFIG.sounds.dice;
		return {result: computedTotal, diceHasFated: diceHasFated, message: message, hasError: false};
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

	static RollFlat = function(_numDice, _maxFaces, _expressionType = LexArcanaDice.EXPRESSIONTYPE.BALANCED, _hasFateRoll = false, _info='')
	{
		let dice = LexArcanaDice.ComputeExpression(_numDice, _maxFaces, _expressionType);
		return LexArcanaDice.#RollExpression(dice.expression, -1, _hasFateRoll, dice.totalFaces, _info);
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
