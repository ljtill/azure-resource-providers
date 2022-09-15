import { listDirectories, listFiles, logger, testFilePath } from "../utils.ts";

/**
 * @param dirPath
 * @returns
 */
export function listSchemasFiles(dirPath: string): string[] {
  testFilePath(dirPath);

  const filePaths: string[] = [];
  const apiVersions = listDirectories(`${dirPath}`);

  for (const _apiVersion of apiVersions) {
    // Filter versions which match standard pattern
    const regEx = "[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]";

    if (_apiVersion.match(regEx)) {
      // Retrieve list of namespaces
      const namespaces = listFiles(`${dirPath}/${_apiVersion}`);

      namespaces.forEach((namespace) => {
        // Include only Microsoft Resource Providers
        if (namespace.includes("Microsoft.")) {
          filePaths.push(`${dirPath}/${_apiVersion}/${namespace}`);
        }
      });
    }
  }

  return filePaths;
}

/**
 * @param dirPath
 * @returns
 */
export function listSpecsFiles(dirPath: string): string[] {
  testFilePath(dirPath);

  // TODO: Implement

  return [];
}

/**
 * @returns
 */
export function getSchemasPath(): string {
  let dirPath = "";

  // Check runtime environment
  if (Deno.env.get("USER") === "runner") {
    // GitHub Actions
    dirPath = "../schemas/schemas";
  } else {
    // Local
    // TODO: Implement env var override
    dirPath = "../../github-azure/azure-resource-manager-schemas/schemas";
  }

  return dirPath;
}

/**
 * @returns
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
