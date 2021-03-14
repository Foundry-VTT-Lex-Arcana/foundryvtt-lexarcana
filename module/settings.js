import { System } from "./config.js";

export const registerSystemSettings = function()
{
  /**
   * Track the system version upon which point a migration was last applied
   */
  game.settings.register(System.Code, "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });
};
