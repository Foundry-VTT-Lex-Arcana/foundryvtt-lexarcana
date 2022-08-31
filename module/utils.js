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
				//_item.data.data.class!==''
				_item.system.class!==''
				&& (
						_item.type === 'meleeWeapon'
					|| _item.type === 'rangedWeapon'
					|| _item.type === 'shield'
					|| _item.type === 'armor'
				)
			)
			{
				itemClasses.push(_item.system.class);
			}
		});
		return itemClasses.unique();
	}
};