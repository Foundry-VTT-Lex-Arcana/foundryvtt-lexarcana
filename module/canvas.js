/* -------------------------------------------- */

/**
 * Hijack Token health bar rendering to include temporary and temp-max health in the bar display
 * TODO: This should probably be replaced with a formal Token class extension
 */
const _TokenGetBarAttribute = Token.prototype.getBarAttribute;
export const getBarAttribute = function (...args)
{
    return _TokenGetBarAttribute.bind(this)(...args);
};