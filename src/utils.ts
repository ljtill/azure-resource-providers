import * as mod from "https://deno.land/std@0.154.0/log/mod.ts";

// Logging

export const logger = await getLogger();

/**
 * Setup logger
 * @returns mod.Logger
 */
export async function getLogger(): Promise<mod.Logger> {
  await mod.setup({
    handlers: {
      console: new mod.handlers.ConsoleHandler("DEBUG", {
        formatter: "{levelName} {msg}",
      }),
    },
    loggers: {
      default: {
        level: "DEBUG",
        handlers: ["console"],
      },
    },
  });

  return mod.getLogger();
}
