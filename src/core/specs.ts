import { logger } from "../utils.ts";

export interface Spec {
  swagger: string;
}

export function parseSpecFile(fileContent: string): Spec {
  try {
    return JSON.parse(fileContent) as Spec;
  } catch (err) {
    logger.warning(`Application terminated`);
    throw err;
  }
}
