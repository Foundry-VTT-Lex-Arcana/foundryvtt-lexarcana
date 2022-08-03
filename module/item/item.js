import {LexArcana} from '../config.js';
import {System} from '../config.js';

/**
 * Override and extend the basic :class:`Item` implementation
 */
export default class LexArcanaItem extends Item
{

    /* -------------------------------------------- */
    /*  Item Properties                             */
    /* -------------------------------------------- */

    /* -------------------------------------------- */

    /**
     * Does the Item implement an attack roll as part of its usage
     * @type {boolean}
     */
    get isWeapon()
    {
        return this.Type === LexArcana.ItemType.meleeWeapon || this.Type === LexArcana.ItemType.rangedWeapon;
    }

    /* -------------------------------------------- */

    /**
     * Is this item a versatile weapon
     * @type {boolean}
     */
    get isVersatile()
    {
        return !!(this.isWeapon() && ["versatile"].includes(this.data.data.feat));
    }

    /* -------------------------------------------- */
    /*	Data Preparation														*/

    /* -------------------------------------------- */

    /**
     * Augment the basic Item data model with additional dynamic data.
     */
    prepareData()
    {
        super.prepareData();

        // Get the Item's data
        const itemData = this.data;
        const data = itemData.data;

        // Activated Items
        if (data.hasOwnProperty("range"))
        {
        }

        // Item Actions
        if (data.hasOwnProperty("actionType"))
        {
        }
    }
}
