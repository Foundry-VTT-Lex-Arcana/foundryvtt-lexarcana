/**
 * The Lex Arcana game system for Foundry Virtual Tabletop
 * A system for playing the fifth edition of the worlds most popular roleplaying game.
 * Author: pierre.plans@gmail.com, Lysoun, Milo115b
 * Software License: BEER-WARE LICENCE
 * Repository:
 * Issue Tracker:
 */

// Import Modules
import {System} from "./module/config.js";
import {LexArcana} from "./module/config.js";
import {registerSystemSettings} from "./module/settings.js";
import {preloadHandlebarsTemplates} from "./module/templates.js";
import {_getInitiativeFormula} from "./module/combat.js";
import {getBarAttribute} from "./module/canvas.js";

// Import Entities
import LexArcanaActor from "./module/actor/entity.js";
import LexArcanaItem from "./module/item/entity.js";

// Import Applications
import LexArcanaCustosActorSheet from "./module/actor/sheets/custos.js";
import LexArcanaFriendlyActorSheet from "./module/actor/sheets/friendly.js";
import LexArcanaAntagonistActorSheet from "./module/actor/sheets/antagonist.js";
import LexArcanaFantasticalCreatureActorSheet from "./module/actor/sheets/fantasticalCreature.js";
import LexArcanaItemSheet from "./module/item/sheet.js";

// Import Helpers
import * as chat from "./module/chat.js";
import * as dice from "./module/dice.js";
import * as macros from "./module/macros.js";
import * as migrations from "./module/migration.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", function ()
{
    console.log(`${System.Code} | Initializing the ${System.Name} Game System\n`);

    // Create a namespace within the game global
    game.lexArcana = {
        applications:
            {
                LexArcanaCustosActorSheet,
                LexArcanaFriendlyActorSheet,
                LexArcanaAntagonistActorSheet,
                LexArcanaFantasticalCreatureActorSheet,
                LexArcanaItemSheet
            },
        canvas: {},
        config: LexArcana,
        dice: dice,
        entities:
            {
                LexArcanaActor,
                LexArcanaItem,
            },
        macros: macros,
        migrations: migrations
    };

    // Record Configuration Values
    CONFIG.LexArcana = LexArcana;
    CONFIG.Actor.entityClass = LexArcanaActor;
    CONFIG.Item.entityClass = LexArcanaItem;
    CONFIG.time.roundTime = 6;

    // Register System Settings
    registerSystemSettings();

    // Patch Core Functions
    CONFIG.Combat.initiative.formula = "1d20";
    Combat.prototype._getInitiativeFormula = _getInitiativeFormula;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet(System.Code,
        LexArcanaCustosActorSheet,
        {
            types: [LexArcana.ActorType.custos],
            makeDefault: true,
            label: "LexArcana.SheetClassCustos"
        });
    Actors.registerSheet(System.Code,
        LexArcanaFriendlyActorSheet,
        {
            types: [LexArcana.ActorType.friendly],
            makeDefault: true,
            label: "LexArcana.SheetClassFriendly"
        });
    Actors.registerSheet(System.Code,
        LexArcanaAntagonistActorSheet,
        {
            types: [LexArcana.ActorType.antagonist],
            makeDefault: true,
            label: "LexArcana.SheetClassAntagonist"
        });
    Actors.registerSheet(System.Code,
        LexArcanaFantasticalCreatureActorSheet,
        {
            types: [LexArcana.ActorType.fantasticalCreature],
            makeDefault: true,
            label: "LexArcana.SheetClassFantasticalCreature"
        });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet(System.Code,
        LexArcanaItemSheet,
        {
            makeDefault: true,
            label: "LexArcana.SheetClassItem"
        });

    // Preload Handlebars Templates
    preloadHandlebarsTemplates();
});


/* -------------------------------------------- */
/*  Foundry VTT Setup                           */
/* -------------------------------------------- */

/* -------------------------------------------- */

/**
 * Once the entire VTT framework is initialized, check to see if we should perform a data migration
 */
Hooks.once("ready", function ()
{
    // Determine whether a system migration is required and feasible
    if (!game.user.isGM) return;
    const currentVersion = game.settings.get(System.Code, "systemMigrationVersion");
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

Hooks.on("canvasInit", function ()
{
    // Extend Token Resource Bars
    Token.prototype.getBarAttribute = getBarAttribute;
});

/* -------------------------------------------- */
/*  Other Hooks                                 */
/* -------------------------------------------- */
