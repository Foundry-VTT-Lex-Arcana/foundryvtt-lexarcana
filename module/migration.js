import {System} from './config.js';

/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise}      A Promise which resolves once the migration is completed
 */
export const migrateWorld = async function ()
{
    ui.notifications.info(`Applying LexArcana System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`, {permanent: true});

    // Migrate World Actors
    for (let a of game.actors.entities)
    {
        try
        {
            const updateData = migrateActorData(a.data);
            if (!isObjectEmpty(updateData))
            {
                console.log(`Migrating Actor entity ${a.name}`);
                await a.update(updateData, {enforceTypes: false});
            }
        } catch (err)
        {
            err.message = `Failed ${System.Code} system migration for Actor ${a.name}: ${err.message}`;
            console.error(err);
        }
    }

    // Migrate World Items
    for (let i of game.items.entities)
    {
        try
        {
            const updateData = migrateItemData(i.data);
            if (!isObjectEmpty(updateData))
            {
                console.log(`Migrating Item entity ${i.name}`);
                await i.update(updateData, {enforceTypes: false});
            }
        } catch (err)
        {
            err.message = `Failed ${System.Code} system migration for Item ${i.name}: ${err.message}`;
            console.error(err);
        }
    }

    // Migrate Actor Override Tokens
    for (let s of game.scenes.entities)
    {
        try
        {
            const updateData = migrateSceneData(s.data);
            if (!isObjectEmpty(updateData))
            {
                console.log(`Migrating Scene entity ${s.name}`);
                await s.update(updateData, {enforceTypes: false});
            }
        } catch (err)
        {
            err.message = `Failed ${System.Code} system migration for Scene ${s.name}: ${err.message}`;
            console.error(err);
        }
    }

    // Migrate World Compendium Packs
    for (let p of game.packs)
    {
        if (p.metadata.package !== "world")
            continue;
        if (!["Actor", "Item", "Scene"].includes(p.metadata.entity))
            continue;
        await migrateCompendium(p);
    }

    // Set the migration as complete
    game.settings.set("${System.Code}", "systemMigrationVersion", game.system.data.version);
    ui.notifications.info(`${System.Code} System Migration to version ${game.system.data.version} completed!`, {permanent: true});
};

/* -------------------------------------------- */

/**
 * Apply migration rules to all Entities within a single Compendium pack
 * @param pack
 * @return {Promise}
 */
export const migrateCompendium = async function (pack)
{
    const entity = pack.metadata.entity;
    if (!["Actor", "Item", "Scene"].includes(entity))
        return;

    // Unlock the pack for editing
    const wasLocked = pack.locked;
    await pack.configure({locked: false});

    // Begin by requesting server-side data model migration and get the migrated content
    await pack.migrate();
    const content = await pack.getContent();

    // Iterate over compendium entries - applying fine-tuned migration functions
    for (let ent of content)
    {
        let updateData = {};
        try
        {
            switch (entity)
            {
                case "Actor":
                    updateData = migrateActorData(ent.data);
                    break;
                case "Item":
                    updateData = migrateItemData(ent.data);
                    break;
                case "Scene":
                    updateData = migrateSceneData(ent.data);
                    break;
            }
            if (isObjectEmpty(updateData))
                continue;

            // Save the entry, if data was changed
            updateData["_id"] = ent._id;
            await pack.updateEntity(updateData);
            console.log(`Migrated ${entity} entity ${ent.name} in Compendium ${pack.collection}`);
        }

            // Handle migration failures
        catch (err)
        {
            err.message = `Failed ${System.Code} system migration for entity ${ent.name} in pack ${pack.collection}: ${err.message}`;
            console.error(err);
        }
    }

    // Apply the original locked status for the pack
    pack.configure({locked: wasLocked});
    console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`);
};

/* -------------------------------------------- */
/*  Entity Type Migration Helpers               */
/* -------------------------------------------- */

/**
 * Migrate a single Actor entity to incorporate latest data model changes
 * Return an Object of updateData to be applied
 * @param {object} actor    The actor data object to update
 * @return {Object}         The updateData to apply
 */
export const migrateActorData = function (actor)
{
    const updateData = {};

    // Actor Data Updates
    updateData = actor.data;
    updateData.peritiae = duplicate(game.Actor.custos.peritiae);

    // Migrate Owned Items
    if (!actor.items) return updateData;
    let hasItemUpdates = false;
    const items = actor.items.map(i =>
    {

        // Migrate the Owned Item
        let itemUpdate = migrateItemData(i);
        // Update the Owned Item
        if (!isObjectEmpty(itemUpdate))
        {
            hasItemUpdates = true;
            return mergeObject(i, itemUpdate, {enforceTypes: false, inplace: false});
        } else return i;
    });
    if (hasItemUpdates)
        updateData.items = items;
    return updateData;
};

/* -------------------------------------------- */


/**
 * Scrub an Actor's system data, removing all keys which are not explicitly defined in the system template
 * @param {Object} actorData    The data object for an Actor
 * @return {Object}             The scrubbed Actor data
 */
function cleanActorData(actorData)
{
    // Scrub system data
    const model = game.system.model.Actor[actorData.type];
    actorData.data = filterObject(actorData.data, model);

    // Scrub system flags
    const allowedFlags = CONFIG.LexArcana.allowedActorFlags.reduce((obj, f) =>
    {
        obj[f] = null;
        return obj;
    }, {});
    if (actorData.flags.LexArcana)
    {
        actorData.flags.LexArcana = filterObject(actorData.flags.LexArcana, allowedFlags);
    }

    // Return the scrubbed data
    return actorData;
}


/* -------------------------------------------- */

/**
 * Migrate a single Item entity to incorporate latest data model changes
 * @param item
 */
export const migrateItemData = function (item)
{
    const updateData = {};
    return updateData;
};

/* -------------------------------------------- */

/**
 * Migrate a single Scene entity to incorporate changes to the data model of it's actor data overrides
 * Return an Object of updateData to be applied
 * @param {Object} scene  The Scene data to Update
 * @return {Object}       The updateData to apply
 */
export const migrateSceneData = function (scene)
{
    const tokens = duplicate(scene.tokens);
    return {
        tokens: tokens.map(t =>
        {
            if (!t.actorId || t.actorLink || !t.actorData.data)
            {
                t.actorData = {};
                return t;
            }
            const token = new Token(t);
            if (!token.actor)
            {
                t.actorId = null;
                t.actorData = {};
            } else if (!t.actorLink)
            {
                const updateData = migrateActorData(token.data.actorData);
                t.actorData = mergeObject(token.data.actorData, updateData);
            }
            return t;
        })
    };
};

/* -------------------------------------------- */

/*  Low level migration utilities
/* -------------------------------------------- */

/**
 * Purge the data model of any inner objects which have been flagged as _deprecated.
 * @param {object} data   The data to clean
 * @private
 */
export function removeDeprecatedObjects(data)
{
    for (let [k, v] of Object.entries(data))
    {
        if (getType(v) === "Object")
        {
            if (v._deprecated === true)
            {
                console.log(`Deleting deprecated object key ${k}`);
                delete data[k];
            } else removeDeprecatedObjects(v);
        }
    }
    return data;
}
