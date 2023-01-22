// Namespace Configuration Values
export const System = {};
export const LexArcana = {};

/* -------------------------------------------- */
System.Code = 'LexArcana';
System.Name = 'Lex Arcana';
System.Path = 'systems/' + System.Code;

LexArcana.SheetClassProvince = 'LexArcana.SheetClassProvince';
LexArcana.SheetClassRitual = 'LexArcana.SheetClassRitual';

/* -------------------------------------------- */

LexArcana.ActorType =
    {
        custos: 'custos',
        npc: 'npc',
        creature: 'creature'
    };

LexArcana.ItemType =
    {
        province: 'province',
        meleeWeapon: 'meleeWeapon',
        rangedWeapon: 'rangedWeapon',
        armor: 'armor',
        shield: 'shield',
        indigamentum: 'indigamentum',
        ritual: 'ritual',
        talent: 'talent'
    }; 
/**
 * The set of Virtutes Scores used within the system
 * @type {Object}
 */
LexArcana.VirtutesName = 'LexArcana.VirtutesName';
LexArcana.Virtutes =
{
    'coordinatio':  'LexArcana.Virtutes.Coordinatio',
    'auctoritas':   'LexArcana.Virtutes.Auctoritas',
    'ratio':        'LexArcana.Virtutes.Ratio',
    'vigor':        'LexArcana.Virtutes.Vigor',
    'ingenium':     'LexArcana.Virtutes.Ingenium',
    'sensibilitas': 'LexArcana.Virtutes.Sensibilitas'
};

/**
 * The set of Peritiae Scores used within the system
 * @type {Object}
 */
LexArcana.PeritiaeName = 'LexArcana.PeritiaeName';
LexArcana.Peritia = {
    'deBello':      'LexArcana.Peritia.DeBello',
    'deNatura':     'LexArcana.Peritia.DeNatura',
    'deSocietate':  'LexArcana.Peritia.DeSocietate',
    'deMagia':      'LexArcana.Peritia.DeMagia',
    'deScientia':   'LexArcana.Peritia.DeScientia',
    'deCorpore':    'LexArcana.Peritia.DeCorpore',
};

/**
 * The set of Disciplines Scores used within the system
 * @type {Object}
 */
LexArcana.DisciplinesName = 'LexArcana.DisciplinesName';
LexArcana.Disciplines = {
    'precognition':      		'LexArcana.Disciplines.Precognition',
    'clairvoyance':     		'LexArcana.Disciplines.Clairvoyance',
    'retrocognition':  			'LexArcana.Disciplines.Retrocognition',
	'interpretationOfOmens':	'LexArcana.Disciplines.InterpretationOfOmens',
    'interpretationOfDreams':   'LexArcana.Disciplines.InterpretationOfDreams',
    'favorOfTheGods':    		'LexArcana.Disciplines.FavorOfTheGods',
};

LexArcana.Name                              = 'LexArcana.Name';
LexArcana.NPC                               = 'LexArcana.NPC';
LexArcana.FateRoll                          = 'LexArcana.FateRoll';
LexArcana.DefaultRoll                       = 'LexArcana.DefaultRoll';
LexArcana.Abilities                         = 'LexArcana.Abilities';
LexArcana.AddPeritiaeSpecialty              = 'LexArcana.AddPeritiaeSpecialty';
LexArcana.AddPeritiaeSpecialtyPromptTitle   = 'LexArcana.AddPeritiaeSpecialtyPromptTitle';
LexArcana.InputLabelName                    = 'LexArcana.InputLabelName';
LexArcana.InputLabelModifier                = 'LexArcana.InputLabelModifier';
LexArcana.DiceExpressionBalancedPrompt      = 'LexArcana.DiceExpressionBalancedPrompt';
LexArcana.InvalidRoll                       = 'LexArcana.InvalidRoll';
LexArcana.ActionAdd                         = 'LexArcana.ActionAdd';
LexArcana.ActionCancel                      = 'LexArcana.ActionCancel';
LexArcana.Biography                         = 'LexArcana.Biography';
LexArcana.HitPoints                         = 'LexArcana.HitPoints';
LexArcana.Pietas                            = 'LexArcana.Pietas';
LexArcana.Inventory                         = 'LexArcana.Inventory';
LexArcana.Description                       = 'LexArcana.Description';
LexArcana.Information                       = 'LexArcana.Information';
LexArcana.Features                          = 'LexArcana.Features';
LexArcana.ItemName                          = 'LexArcana.ItemName';
LexArcana.Encumbrance                       = 'LexArcana.Encumbrance';
LexArcana.Protection                        = 'LexArcana.Protection';
LexArcana.Damage                            = 'LexArcana.Damage';
LexArcana.Range                             = 'LexArcana.Range';
LexArcana.Difficulty                        = 'LexArcana.Difficulty';
LexArcana.Feat                              = 'LexArcana.Feat';
LexArcana.Parry                             = 'LexArcana.Parry';

/**
 * Items
 **/
LexArcana.ItemClass							= 'LexArcana.ItemClass';
LexArcana.ItemClassEmpty					= 'LexArcana.ItemClassEmpty';

/**
 * Provinces
 */
LexArcana.LanguagesSpokenLabel              = 'LexArcana.LanguagesSpokenLabel';
LexArcana.ProvincePeritiaeModifiersLabel    = 'LexArcana.ProvincePeritiaeModifiersLabel';

/**
 * Rituals
 **/
LexArcana.Rituals                           = 'LexArcana.Rituals';
LexArcana.IndigamentaSectionTitle			= 'LexArcana.IndigamentaSectionTitle';
LexArcana.RitualsSectionTitle				= 'LexArcana.RitualsSectionTitle';
LexArcana.DifficultyThreshold				= 'LexArcana.DifficultyThreshold';
LexArcana.Duration							= 'LexArcana.Duration';
LexArcana.Short								= 'LexArcana.Short';
LexArcana.Average							= 'LexArcana.Average';
LexArcana.Long								= 'LexArcana.Long';

/**
 * Rolls
 **/
 LexArcana.DoSMarginalSuccess				= 'LexArcana.DoSMarginalSuccess';
 LexArcana.DoSCompleteSuccess				= 'LexArcana.DoSCompleteSuccess';
 LexArcana.DoSExceptionalSuccess			= 'LexArcana.DoSExceptionalSuccess';
 LexArcana.RollBalanced						= 'LexArcana.RollBalanced';
 LexArcana.RollUnbalanced					= 'LexArcana.RollUnbalanced';
 LexArcana.RollDetailsThreshold				= 'LexArcana.RollDetailsThreshold';
 LexArcana.RollCustomInput					= 'LexArcana.RollCustomInput';
 LexArcana.RollDifficultyThreshold			= 'LexArcana.RollDifficultyThreshold';