import * as mod from "https://deno.land/std@0.154.0/log/mod.ts";

// Logging

export const logger = await getLogger();

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

// File System

export function listDirectories(filePath: string): string[] {
  const directoryNames: string[] = [];

  for (const _directory of Deno.readDirSync(filePath)) {
    if (_directory.isDirectory) {
      //   logger.debug(`[listDirectories] Directory - ${_directory.name}`);

      directoryNames.push(_directory.name);
    }
  }

  if (directoryNames.length === 0) {
    logger.warning(`Application terminated`);
    throw new Error(`No directories found in ${filePath}`);
  }

  return directoryNames;
}

export function listFiles(filePath: string): string[] {
  const fileNames: string[] = [];

  for (const _file of Deno.readDirSync(filePath)) {
    // logger.debug(`[listFiles] File - ${_file.name}`);

    if (_file.isFile) {
      fileNames.push(_file.name);
    }
  }

  if (fileNames.length === 0) {
    logger.warning(`Application terminated`);
    throw new Error(`No files found in ${filePath}`);
  }

  return fileNames;
}

export function getFileContent(filePath: string): string {
  const decoder = new TextDecoder("utf-8");

  try {
    return decoder.decode(Deno.readFileSync(filePath));
  } catch (err) {
    logger.warning(`Application terminated`);
    throw err;
  }
}

export function testFilePath(filePath: string): void {
  // logger.debug(`[testFilePath] File - "${filePath}"`);

  try {
    Deno.statSync(filePath);
  } catch (err) {
    logger.warning(`Application terminated`);
    throw err;
  }
}

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
