import { logger } from "../utils.ts";
import { Schema, Definition, ProviderSchema, ResourceType } from "./schema.ts";

export function listResourceProviders(filePaths: string[]): ProviderSchema[] {
  const providers: ProviderSchema[] = [];

  // Iterate over file paths
  for (const _filePath of filePaths) {
    // Retrieve resource provider name from file path
    const schema = parseResourceProviderSchema(_filePath);

    // Check if resource provider already exists in list
    if (checkResourceProviderExists(providers, schema.title)) {
      // Ensure only Microsoft.* resource providers are included
      if (schema.title.includes("Microsoft.")) {
        const resourceTypes = listResourceTypes(filePaths, schema.title);

        // Create resource provider
        providers.push({
          providerNamespace: schema.title,
          resourceTypes: resourceTypes,
        });
      }
    } else {
      const providerIndex = providers.findIndex((provider) => {
        return provider.providerNamespace == schema.title;
      });

      const resourceTypes = listResourceTypes()

      providers[providerIndex].resourceTypes =

    }
  }

  return providers.sort((a, b) =>
    (a.providerNamespace > b.providerNamespace) ? 1 : -1
  );
}

function listResourceTypes(filePath: string): ResourceType[] {
  const types: ResourceType[] = [];

    // Retrieve the api version from the file path
    const apiVersion = filePath.split("/").reverse()[1];

    // Iterate over resource definitions within the file
    const resourceDefinitions = parseResourceDefinitions(filePath);

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

  // Sort api versions
  for (const type of types) {
    type.apiVersions.stable = type.apiVersions.stable.sort();
    type.apiVersions.preview = type.apiVersions.preview.sort();
  }

  // Sort resource types by name
  // return types.sort((a, b) => (a.name > b.name) ? 1 : -1);
  return types
}

function checkResourceProviderExists(
  providers: ProviderSchema[],
  providerName: string,
): boolean {
  providers.find((provider) => {
    return provider.providerNamespace === providerName;
  });

  return false;
}

function parseResourceProviderSchema(filePath: string): Schema {
  let schema = {} as Schema;
  const decoder = new TextDecoder("utf-8");

  try {
    const fileContent = decoder.decode(Deno.readFileSync(filePath));
    schema = JSON.parse(fileContent);
  } catch (err) {
    logger.warning(`Application terminated`);
    throw err;
  }

  return schema;
}

function listResourceDefinitionNames(definitions: Definition[]): string[] {
  return Object.keys(definitions)
}

function parseResourceDefinitions(filePath: string): Definition[] {
  let resourceDefinitions = {} as Definition[];
  const decoder = new TextDecoder("utf-8");

  try {
    const fileContent = decoder.decode(Deno.readFileSync(filePath));
    resourceDefinitions = JSON.parse(fileContent);
  } catch (err) {
    logger.warning(`Application terminated`);
    throw err;
  }

  return resourceDefinitions;
}
