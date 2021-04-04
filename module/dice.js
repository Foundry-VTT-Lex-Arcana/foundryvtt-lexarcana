import { LexArcana } from "./config.js";

export class LexArcanaDice {
	static EXPRESSIONTYPE = { BALANCED: 0, UNBALANCED: 1 };
	static #ComputeExpressionBalanced = function(numDice, maxFaces)
	{
		const validDices = [20, 12, 10, 8, 6, 5, 4, 3];
		let currentMaxFaces = maxFaces;
		let expression = "";
		for(let current = 0;current<numDice;++current)
		{
			const filterFaces = currentMaxFaces/(numDice-current);
			const nextFace = validDices.find(value => value<=filterFaces);
			if(nextFace<(currentMaxFaces+1))
			{
				currentMaxFaces -= nextFace;
				expression += (expression!==''?'+':'')+'1d'+nextFace;
			}
		}
		return expression;
	}
	static #ComputeExpressionUnbalanced = function(numDice, maxFaces)
	{
		const validDices = [20, 12, 10, 8, 6, 5, 4, 3];
		let diceFaces = [];
		let sumDiceFaces = 0;
		let expression = '';
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
			expression += (expression!==''?'+':'')+'1d'+diceFaces[i];
		}
		return expression;
	}
	static ComputeExpression(numDice, maxFaces, expressionType = LexArcanaDice.EXPRESSIONTYPE.BALANCED)
	{
		switch(expressionType)
		{
			case LexArcanaDice.EXPRESSIONTYPE.UNBALANCED: return LexArcanaDice.#ComputeExpressionUnbalanced(numDice, maxFaces); break;
			case LexArcanaDice.EXPRESSIONTYPE.BALANCED:
			default: return LexArcanaDice.#ComputeExpressionBalanced(numDice, maxFaces); break;
		}
	}
};
