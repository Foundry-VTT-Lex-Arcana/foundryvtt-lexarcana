/* -------------------------------------------- */
/*                  Tools                       */
/* -------------------------------------------- */

Array.prototype.contains = function(v)
{
	for (var i = 0; i < this.length; i++)
	{
	  if (this[i] === v) return true;
	}
	return false;
}
  
Array.prototype.unique = function()
{
	return this.filter((item, i, ar) => ar.indexOf(item) === i);;
}

export class LexArcanaUtils 
{
	static ObjectToArray(obj)
	{
		return Object.values(obj);
	}

	static getItemClasses()
	{
		let itemClasses = new Array();
		let items = Array.from(game.items.values());
		items.forEach(function(_item)
		{
			if(
				_item.data.data.class!==''
				&& (
						_item.data.type === 'meleeWeapon'
					|| _item.data.type === 'rangedWeapon'
					|| _item.data.type === 'shield'
					|| _item.data.type === 'armor'
				)
			)
			{
				itemClasses.push(_item.data.data.class);
			}
		});
		return itemClasses.unique();
	}
};