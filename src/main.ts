import {
  getSchemasPath,
  getSpecificationsPath,
  listSchemasFiles,
  listSpecificationsFiles,
} from "./core/files.ts";
import { listResourceProviders } from "./core/resources.ts";
import { logger, writeJsonFile } from "./utils.ts";

function generateSchemasFile(filePath: string): void {
  const dirPath = getSchemasPath();

  try {
    const filePaths = listSchemasFiles(dirPath);
    if (filePaths.length > 0) {
      writeJsonFile(filePath, listResourceProviders(filePaths));
    }
  } catch (err) {
    logger.error(err);
    Deno.exit(1);
  }
}

function generateSpecificationsFile(filePath: string): void {
  const dirPath = getSpecificationsPath();

  try {
    const filePaths = listSpecificationsFiles(dirPath);
    if (filePaths.length > 0) {
      writeJsonFile(filePath, listResourceProviders(filePaths));
    }
  } catch (err) {
    logger.error(err);
    Deno.exit(1);
  }
}

function main(args: string[]): Promise<void> {
  switch (args[0]) {
    case "schemas":
      logger.info("Generating schemas file");
      generateSchemasFile("./schemas.json");
      break;
    case "specs":
      logger.info("Generating specifications file");
      generateSpecificationsFile("./specs.json");
      break;
    default:
      logger.error("Invalid command argument");
  }

  Deno.exit(0);
}

main(Deno.args);
