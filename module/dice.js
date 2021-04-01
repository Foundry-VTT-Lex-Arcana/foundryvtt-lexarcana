export const LexArcanaDice = {};

/* -------------------------------------------- */
/*	Roll Dices
*/

/* -------------------------------------------- */

LexArcanaDice.ComputeExpression = function(numDice, maxFaces)
{
	const validDices = [20, 12, 10, 8, 6, 5, 4, 3, 2];
	let dices = [];
	let current = 0;
	let currentMaxFaces = maxFaces;
	let expression = "";
	for(let current = 0;current<numDice;++current)
	{
		let filterFaces = currentMaxFaces/(numDice-current);
		let nextFace = validDices.find(value => value<=filterFaces);
		if(nextFace<(currentMaxFaces+1))
		{
		currentMaxFaces -= nextFace;
		expression += (expression!==""?"+":"")+"1d"+nextFace;
		}
	}
	return expression;
}
