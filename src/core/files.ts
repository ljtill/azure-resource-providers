import { logger } from "../utils.ts";

/**
 * Return file contents as a string
 *
 * @param filePath
 * @returns
 */
export function getFileContent(filePath: string): string {
  const decoder = new TextDecoder("utf-8");

  try {
    return decoder.decode(Deno.readFileSync(filePath));
  } catch (err) {
    logger.warning(`Application terminated`);
    throw err;
  }
}

/**
 * Writes content 'any' to local file path
 *
 * @param filePath
 * @param content
 */
export function writeJsonFile(filePath: string, content: any): void {
  const encoder = new TextEncoder();

  try {
    Deno.writeFileSync(
      filePath,
      encoder.encode(JSON.stringify(content, null, 2)),
    );
  } catch (err) {
    logger.warning(`Application terminated`);
    throw err;
  }
}

/**
 * Lists all directories within a file path
 *
 * @param filePath
 * @returns string[]
 */
export function listDirectories(filePath: string): string[] {
  const directoryNames: string[] = [];

  for (const _directory of Deno.readDirSync(filePath)) {
    if (_directory.isDirectory) {
      directoryNames.push(_directory.name);
    }
  }

  if (directoryNames.length === 0) {
    logger.warning(`Application terminated`);
    throw new Error(`No directories found in ${filePath}`);
  }

  return directoryNames;
}

/**
 * Lists all files with a file path
 *
 * @param filePath
 * @returns string[]
 */
export function listFiles(filePath: string): string[] {
  const fileNames: string[] = [];

  try {
    for (const _file of Deno.readDirSync(filePath)) {
      if (_file.isFile) {
        fileNames.push(_file.name);
      }
    }
  } catch (err) {
    logger.warning("Application terminated");
    throw err;
  }

  if (fileNames.length === 0) {
    logger.warning(`Application terminated`);
    throw new Error(`No files found in ${filePath}`);
  }

  return fileNames;
}

/**
 * Validates a file path
 *
 * @param filePath
 */
export function testFilePath(filePath: string): void {
  try {
    Deno.statSync(filePath);
  } catch (err) {
    logger.warning(`Application terminated`);
    throw err;
  }
}
