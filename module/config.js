// Namespace Configuration Values
export const System = {};
export const LexArcana = {};

/* -------------------------------------------- */
System.Code = "LexArcana";
System.Name = "Lex Arcana";
System.Path = "systems/" + System.Code;

/* -------------------------------------------- */

LexArcana.ActorType =
    {
        custos: "custos",
        friendly: "friendly",
        antagonist: "antagonist",
        fantasticalCreature: "fantasticalCreature"
    };

LexArcana.ItemType =
    {
        meleeWeapon: "meleeWeapon",
        rangedWeapon: "rangedWeapon",
        armor: "armor",
        shield: "shield"
    };

/**
 * The set of Peritiae Scores used within the system
 * @type {Object}
 */
 LexArcana.Peritiae = {
    "deBello": "LexArcana.PeritiaDeBello",
    "deNatura": "LexArcana.PeritiaDeNatura",
    "deSocietate": "LexArcana.PeritiaDeSocietate",
    "deMagia": "LexArcana.PeritiaDeMagia",
    "deScientia": "LexArcana.PeritiaDeScientia",
    "deCorpore": "LexArcana.PeritiaDeCorpore",
};

LexArcana.Name = "LexArcana.Name";
LexArcana.Attributes = "LexArcana.Attributes";
LexArcana.Biography = "LexArcana.Biography";
LexArcana.HitPoints = "LexArcana.HitPoints";
LexArcana.Pietas = "LexArcana.Pietas";
LexArcana.Inventory = "LexArcana.Inventory";
LexArcana.Rituals = "LexArcana.Rituals";
LexArcana.Features = "LexArcana.Features";
LexArcana.ItemName = "LexArcana.ItemName";
LexArcana.Encumbrance = "LexArcana.Encumbrance";
LexArcana.Protection = "LexArcana.Protection";
LexArcana.Damage = "LexArcana.Damage";
LexArcana.Range = "LexArcana.Range";
LexArcana.Difficulty = "LexArcana.Difficulty";
LexArcana.Feat = "LexArcana.Feat";
LexArcana.Parry = "LexArcana.Parry";
