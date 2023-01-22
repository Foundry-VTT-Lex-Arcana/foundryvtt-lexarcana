/**
 * The Lex Arcana game system for Foundry Virtual Tabletop
 * A system for playing the fifth edition of the worlds most popular roleplaying game.
 * Author: pierre.plans@gmail.com, Lysoun, Milo115b
 * Software License: MIT LICENSE
 * Repository:
 * Issue Tracker:
 */

// Import Modules
import {System} from './module/config.js';
import {LexArcana} from './module/config.js';
import {registerSystemSettings} from './module/settings.js';
import {preloadHandlebarsTemplates} from './module/templates.js';
import {_getInitiativeFormula} from './module/combat.js';
import {getBarAttribute} from './module/canvas.js';

// Import Entities
import LexArcanaActor from './module/actor/actor.js';
import LexArcanaItem from './module/item/item.js';

// Import Applications
import LexArcanaCustosActorSheet from './module/actor/sheets/custos.js';
import LexArcanaNPCActorSheet from './module/actor/sheets/npc.js';
import LexArcanaCreatureActorSheet from './module/actor/sheets/creature.js';
import LexArcanaItemSheet from './module/item/sheets/base.js';
import LexArcanaProvinceSheet from './module/item/sheets/provinceSheet.js';
import LexArcanaRitualSheet from './module/item/sheets/ritualSheet.js';

// Import Helpers
import * as chat from './module/chat.js';
import * as dice from './module/dice.js';
import * as macros from './module/macros.js';
import * as migrations from './module/migration.js';

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once('init', function ()
{
    console.log(`${System.Code} | Initializing the ${System.Name} Game System\n`);

    // Create a namespace within the game global
    game.lexArcana = {
        applications:
            {
                LexArcanaCustosActorSheet,
                LexArcanaNPCActorSheet,
                LexArcanaCreatureActorSheet,
                LexArcanaItemSheet,
                LexArcanaProvinceSheet
            },
        canvas: {},
        config: LexArcana,
        dice: dice,
        entities:
            {
                LexArcanaActor,
                LexArcanaItem
            },
        macros: macros,
        migrations: migrations
    };

    // Record Configuration Values
    CONFIG.LexArcana = LexArcana;
    CONFIG.Actor.documentClass = LexArcanaActor;
    CONFIG.Item.documentClass = LexArcanaItem;
    CONFIG.time.roundTime = 6;

    // Register System Settings
    registerSystemSettings();

    // Patch Core Functions
    CONFIG.Combat.initiative.formula = '1d20';
    Combat.prototype._getInitiativeFormula = _getInitiativeFormula;

    // Register sheet application classes
    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet(System.Code,
        LexArcanaCustosActorSheet,
        {
            types: [LexArcana.ActorType.custos],
            makeDefault: true,
            label: 'LexArcana.SheetClassCustos'
        });
    Actors.registerSheet(System.Code,
        LexArcanaNPCActorSheet,
        {
            types: [LexArcana.ActorType.npc],
            makeDefault: true,
            label: 'LexArcana.SheetClassNPC'
        });
    Actors.registerSheet(System.Code,
        LexArcanaCreatureActorSheet,
        {
            types: [LexArcana.ActorType.creature],
            makeDefault: true,
            label: 'LexArcana.SheetClassCreature'
        });
    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet(System.Code,
        LexArcanaItemSheet,
        {
            types: [
				LexArcana.ItemType.meleeWeapon
				, LexArcana.ItemType.rangedWeapon
				, LexArcana.ItemType.armor
				, LexArcana.ItemType.shield
			],
            makeDefault: true,
            label: 'LexArcana.SheetClassItem'
        });
    Items.registerSheet(System.Code,
        LexArcanaProvinceSheet,
        {
            types: [LexArcana.ItemType.province],
            makeDefault: true,
            label: 'LexArcana.SheetClassProvince'
        });
	Items.registerSheet(System.Code,
		LexArcanaRitualSheet,
		{
			types: [LexArcana.ItemType.indigamentum, LexArcana.ItemType.ritual, LexArcana.ItemType.talent],
			makeDefault: true,
			label: 'LexArcana.SheetClassRitual'
		});

	// handle bars helpers
	// if equal
	Handlebars.registerHelper('ife', function (v1, v2, options) {
		if (v1 === v2) return options.fn(this);
		else return options.inverse(this);
	});
	// if not equal
	Handlebars.registerHelper('ifne', function (v1, v2, options) {
		if (v1 !== v2) return options.fn(this);
		else return options.inverse(this);
	});

    // Preload Handlebars Templates
    preloadHandlebarsTemplates();
    // Slowing down pings
    CONFIG.Canvas.pings.styles.pulse.duration = 2000
    CONFIG.Canvas.pings.styles.alert.duration = 2000
    CONFIG.Canvas.pings.styles.arrow.duration = 2000
});


/* -------------------------------------------- */
/*  Foundry VTT Setup                           */
/* -------------------------------------------- */

/**
 * This function runs after game data has been requested and loaded from the servers, so entities exist
 */
 Hooks.once('setup', function() {

    // Localize CONFIG objects once up-front
    const toLocalize = ['Virtutes', 'Peritia'];
  
    // Localize and sort CONFIG objects
    for ( let o of toLocalize )
    {
      CONFIG.LexArcana[o] = Object.entries(CONFIG.LexArcana[o]).reduce((obj, e) => {
        obj[e[0]] = game.i18n.localize(e[1]);
        return obj;
      }, {});
    }
  });

  Hooks.on("renderPause", () => {
    $("#pause img").attr("class", "fa-spin pause-image");
    $("#pause figcaption").attr("class", "pause-lex");
  });


/* -------------------------------------------- */

/**
 * Once the entire VTT framework is initialized, check to see if we should perform a data migration
 */
Hooks.once('ready', function ()
{
    // Determine whether a system migration is required and feasible
    if (!game.user.isGM) return;
    const currentVersion = game.settings.get(System.Code, 'systemMigrationVersion');
    const NEEDS_MIGRATION_VERSION = "0.0.0";
    const COMPATIBLE_MIGRATION_VERSION = 0.80;
    const needsMigration = currentVersion && isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion);
    if (!needsMigration) return;

    // Perform the migration
    if (currentVersion && isNewerVersion(COMPATIBLE_MIGRATION_VERSION, currentVersion))
    {
        const warning = `Your LexArcana system data is from too old a Foundry version and cannot be reliably migrated to the latest version. The process will be attempted, but errors may occur.`;
        ui.notifications.error(warning, {permanent: true});
    }
    migrations.migrateWorld();
});

/* -------------------------------------------- */
/*  Canvas Initialization                       */
/* -------------------------------------------- */

Hooks.on('canvasInit', function ()
{
    // Extend Token Resource Bars
    Token.prototype.getBarAttribute = getBarAttribute;
});

/* -------------------------------------------- */
/*  Other Hooks                                 */
/* -------------------------------------------- */
