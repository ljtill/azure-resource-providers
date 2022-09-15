import {
  getSchemasPath,
  getSpecsPath,
  listSchemasFiles,
  listSpecsFiles,
} from "./core/files.ts";
import { parseResourceProviders } from "./core/resources.ts";
import { logger, writeJsonFile } from "./utils.ts";

function generateSchemasFile(filePath: string): void {
  const dirPath = getSchemasPath();

  try {
    const filePaths = listSchemasFiles(dirPath);
    if (filePaths.length > 0) {
      writeJsonFile(filePath, parseResourceProviders(filePaths));
    }
  } catch (err) {
    logger.error(err);
    Deno.exit(1);
  }
}

function generateSpecsFile(filePath: string): void {
  const dirPath = getSpecsPath();

  try {
    const filePaths = listSpecsFiles(dirPath);
    if (filePaths.length > 0) {
      writeJsonFile(filePath, parseResourceProviders(filePaths));
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
      logger.warning("Not implemented");
      // logger.info("Generating specifications file");
      // generateSpecsFile("./specs.json");
      break;
    default:
      logger.error("Invalid command argument");
  }

  Deno.exit(0);
}

main(Deno.args);
