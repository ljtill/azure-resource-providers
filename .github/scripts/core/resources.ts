import { logger } from "../utils.ts";

interface ProviderSchema {
  providerNamespace: string;
  resourceTypes: ResourceType[];
}

interface ResourceType {
  name: string;
  apiVersions: ApiVersions;
}

interface ApiVersions {
  stable: string[];
  preview: string[];
}

// TODO: Support schemas and specifications in both functions

export function listResourceProviders(filePaths: string[]): ProviderSchema[] {
  const providers: ProviderSchema[] = [];

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
          return provider.providerNamespace === providerName;
        })
      ) {
        // Ensure only Microsoft.* resource providers are included
        if (providerName.includes("Microsoft.")) {
          const resourceTypes = listResourceTypes(filePaths, providerName);

          // Create resource provider
          providers.push({
            providerNamespace: providerName,
            resourceTypes: resourceTypes,
          });
        }
      }
    }
  }

  return providers.sort((a, b) =>
    (a.providerNamespace > b.providerNamespace) ? 1 : -1
  );
}

function listResourceTypes(
  filePaths: string[],
  resourceProvider: string,
): ResourceType[] {
  const types: ResourceType[] = [];

  // Filter paths by resource provider name
  filePaths = filePaths.filter((filePath: string): boolean => {
    return filePath.includes(resourceProvider);
  });

  // Iterate over resource provider file paths
  for (const filePath of filePaths) {
    // Retrieve the api version from the file path
    const apiVersion = filePath.split("/").reverse()[1];

    // Iterate over resource definitions within the file
    for (const resourceDefinition of parseResourceDefinitions(filePath)) {
      // Check if resource type already exists
      if (
        types.find((type) => {
          return type.name === resourceDefinition;
        })
      ) {
        // Retrieve resource type index
        const typeIndex = types.findIndex((type) => {
          return type.name === resourceDefinition;
        });

        // Append version to api version lists
        if (apiVersion.includes("-preview")) {
          types[typeIndex].apiVersions.preview.push(apiVersion);
        } else {
          types[typeIndex].apiVersions.stable.push(apiVersion);
        }
      } else {
        // Create resource type
        if (apiVersion.includes("-preview")) {
          types.push({
            name: resourceDefinition,
            apiVersions: {
              stable: [],
              preview: [apiVersion],
            },
          });
        } else {
          types.push({
            name: resourceDefinition,
            apiVersions: {
              stable: [apiVersion],
              preview: [],
            },
          });
        }
      }
    }
  }

  // Sort api versions
  // for (const type of types) {
  //   type.apiVersions = type.apiVersions.sort();
  // }

  // Sort resource types by name
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
