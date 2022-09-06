import { logger } from "../utils.ts";

interface ResourceProvider {
  resourceProvider: string;
  resourceTypes: ResourceType[];
}

interface ResourceType {
  name: string;
  apiVersions: string[];
}

// TODO: Support schemas and specifications in both functions

export function listResourceProviders(filePaths: string[]): ResourceProvider[] {
  const providers: ResourceProvider[] = [];

  // Iterate over file paths
  for (const _filePath of filePaths) {
    // Retrieve resource provider name from file path
    let providerName = _filePath.split("/").pop();

    if (typeof providerName === "string") {
      // Remove file extension
      providerName = providerName.replace(".json", "");

      // Check if resource provider already exists in list
      if (
        !providers.find((provider) => {
          return provider.resourceProvider === providerName;
        })
      ) {
        // Ensure only Microsoft.* resource providers are included
        if (providerName.includes("Microsoft.")) {
          const resourceTypes = listResourceTypes(filePaths, providerName);

          // Create resource provider
          providers.push({
            resourceProvider: providerName,
            resourceTypes: resourceTypes,
          });
        }
      }
    }
  }

  return providers.sort((a, b) =>
    (a.resourceProvider > b.resourceProvider) ? 1 : -1
  );
}

function listResourceTypes(
  filePaths: string[],
  resourceProvider: string,
): ResourceType[] {
  const types: ResourceType[] = [];

  // Filter files by resource provider name
  filePaths = filePaths.filter((filePath: string): boolean => {
    return filePath.includes(resourceProvider);
  });

  // Iterate over resource provider file paths
  for (const filePath of filePaths) {
    const apiVersion = filePath.split("/").reverse()[1];
    const resourceDefinitions = parseResourceDefinitions(filePath);

    // Iterate over resource definitions
    for (const resourceDefinition of resourceDefinitions) {
      if (typeof resourceDefinition === "string") {
        // Check if resource type already exists
        if (
          types.find((type) => {
            return type.name === resourceDefinition;
          })
        ) {
          // Retrieve resource type index
          const type = types.findIndex((type) => {
            return type.name === resourceDefinition;
          });

          // Append version to api version list
          types[type].apiVersions.push(apiVersion);
        } else {
          // Create resource type
          types.push({
            name: resourceDefinition,
            apiVersions: [apiVersion],
          });
        }
      }
    }
  }

  return types.sort((a, b) => (a.name > b.name) ? 1 : -1);
}

function parseResourceDefinitions(filePath: string): string[] {
  let resourceDefinitions;
  const decoder = new TextDecoder("utf-8");

  try {
    // logger.debug("Reading file: " + filePath);
    const fileContent = decoder.decode(Deno.readFileSync(filePath));

    // logger.debug("Parsing json file: " + filePath);
    const jsonObject = JSON.parse(fileContent);

    resourceDefinitions = Object.keys(jsonObject.resourceDefinitions);
  } catch (err) {
    logger.warning(`Application terminated`);
    throw err;
  }

  return resourceDefinitions;
}
