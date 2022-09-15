import { logger } from "../utils.ts";
import { testFilePath } from "./files.ts";

export type Spec = {
  swagger: string;
  // TODO: Implement
};

export function parseSpecFile(fileContent: string): Spec {
  try {
    return JSON.parse(fileContent) as Spec;
  } catch (err) {
    logger.warning(`Application terminated`);
    throw err;
  }
}

/**
 * Lists all spec files within the repository path
 * @param dirPath
 * @returns string[]
 */
export function listSpecsFiles(dirPath: string): string[] {
  testFilePath(dirPath);

  // TODO: Implement

  return [];
}

/**
 * Provides specs repository directory path
 * @returns string
 */
export function getSpecsPath(): string {
  let dirPath = "";

  // Check runtime environment
  if (Deno.env.get("USER") === "runner") {
    // GitHub Actions
    dirPath = "../schemas/schemas";
  } else {
    // Local
    // TODO: Implement env var override
    dirPath = "../../github-azure/azure-rest-api-specs/specification";
  }

  return dirPath;
}
