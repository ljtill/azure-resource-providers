import { listDirectories, listFiles, logger, testFilePath } from "../utils.ts";

export function listSchemaFiles(dirPath: string): string[] {
  testFilePath(dirPath);

  const filePaths: string[] = [];
  const apiVersions = listDirectories(`${dirPath}`);

  for (const _apiVersion of apiVersions) {
    // Filter versions which match standard pattern
    const regEx = "[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]";

    if (_apiVersion.match(regEx)) {
      // Retrieve list of namespaces
      const namespaces = listFiles(`${dirPath}/${_apiVersion}`);

      for (const _namespace of namespaces) {
        // TODO: Remove this duplicate check for Microsoft.* RPs
        if (_namespace.includes("Microsoft.")) {
          filePaths.push(`${dirPath}/${_apiVersion}/${_namespace}`);
        }
      }
    }
  }

  return filePaths;
}

export function listSpecificationFiles(dirPath: string): string[] {
  testFilePath(dirPath);

  const filePaths: string[] = [];

  // TODO: Implementation

  //   const specs = listDirectories(`${dirPath}`);
  //   for (const _spec of specs) {
  //     const _providers = listDirectories(`${dirPath}/${_spec}`).filter((item) => {
  //       return item.includes("Microsoft.");
  //     });
  //   }

  return filePaths;
}
