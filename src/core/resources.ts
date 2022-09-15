import { getFileContent, logger } from "../utils.ts";
import {
  Definition,
  getScopeName,
  listResourceDefinitionScopes,
  parseSchemaFile,
  Schema,
  Scope,
} from "./schemas.ts";
import { parseSpecFile, Spec } from "./specs.ts";

type ResourceProvider = {
  providerNamespace: string;
  resourceTypes: ResourceType[];
};
type ResourceType = {
  name: string;
  scope: string; // TODO: Enum
  apiVersions: ApiVersions;
};
type ApiVersions = {
  stable: string[];
  preview: string[];
};

/**
 * Parses all resource providers
 * @param filePaths
 * @returns ResourceProviders[]
 */
export function parseResourceProviders(
  filePaths: string[],
): ResourceProvider[] {
  const providers: ResourceProvider[] = [];

  // Iterate over all file paths
  filePaths.forEach((filePath) => {
    // Parse resource provider schema from file path
    // TODO: Handle schema and spec file
    const fileContent = getFileContent(filePath);
    const schema = parseSchemaFile(fileContent);

    // Parse resource types from schema
    const resourceTypes = parseResourceTypes(schema);

    if (
      // Check if resource provider exists
      providers.find((provider) => {
        return provider.providerNamespace === schema.title;
      })
    ) {
      // Append resource provider
      providers.map((provider) => {
        provider.providerNamespace === schema.title
          ? updateResourceProvider(provider, resourceTypes)
          : provider;
      });
    } else {
      // Create resource provider
      providers.push({
        providerNamespace: schema.title,
        resourceTypes: resourceTypes,
      });
    }
  });

  return sortResourceProviders(providers);
}

function updateResourceProvider(
  resourceProvider: ResourceProvider,
  resourceTypes: ResourceType[],
): ResourceProvider {
  // Iterate over 'new' resource types
  resourceTypes.forEach((resourceType) => {
    // Check if resource type exists on the resource provider
    if (
      resourceProvider.resourceTypes.find((item) => {
        return item.name === resourceType.name &&
          item.scope === resourceType.scope;
      })
    ) {
      // Append resource type
      // Add api versions to the resource type
      resourceProvider.resourceTypes.map((item) => {
        item.name == resourceType.name && item.scope === resourceType.scope
          ? updateResourceType(
            item,
            resourceType.apiVersions.stable,
            resourceType.apiVersions.preview,
          )
          : item;
      });
    } else {
      // Create resource type
      resourceProvider.resourceTypes.push(resourceType);
    }
  });

  return resourceProvider;
}

function sortResourceProviders(
  providers: ResourceProvider[],
): ResourceProvider[] {
  // Iterate over each resource provider and sort the properties
  providers.forEach((provider) => {
    // Sort resource types by name & scope
    provider.resourceTypes.sort((a, b) =>
      ((a.name > b.name) ? 1 : -1) || (a.scope > b.scope) ? 1 : -1
    );

    // Sort api versions by age
    provider.resourceTypes.forEach((resourceType) => {
      resourceType.apiVersions.stable.sort((a, b) => (a > b) ? 1 : -1);
      resourceType.apiVersions.preview.sort((a, b) => (a > b) ? 1 : -1);
    });
  });

  // Sort all resource providers by name
  providers.sort((a, b) =>
    (a.providerNamespace > b.providerNamespace) ? 1 : -1
  );

  return providers;
}

/**
 * Parses all resource types for a resource provider for all
 * available scopes, e.g. tenant, subscription etc
 * @returns ResourceType[]
 */
export function parseResourceTypes(schema: Schema): ResourceType[] {
  const resourceTypes = [] as ResourceType[];

  // List all resource definition scopes which are defined
  const definitionScopes = listResourceDefinitionScopes(schema);

  definitionScopes.forEach((definitionScope) => {
    const scopeName = getScopeName(definitionScope);

    // TODO: Comment
    type SchemaKey = keyof typeof schema;
    const definitionScopeKey = definitionScope as SchemaKey;

    // Retrieve all the definitions from a given scope
    const definitionKeys = Object.keys(schema[definitionScopeKey] as string);
    const definitions = schema[definitionScopeKey] as Definition;

    // Iterate over each definition within the scope
    definitionKeys.forEach((definitionKey) => {
      const apiVersion = definitions[definitionKey].properties.apiVersion
        .enum[0] as string;

      if (apiVersion.includes("-preview")) {
        resourceTypes.push({
          name: definitionKey,
          scope: scopeName,
          apiVersions: {
            stable: [],
            preview: [
              apiVersion,
            ],
          },
        });
      } else {
        resourceTypes.push({
          name: definitionKey,
          scope: scopeName,
          apiVersions: {
            stable: [
              apiVersion,
            ],
            preview: [],
          },
        });
      }
    });
  });

  return resourceTypes;
}

function updateResourceType(
  resourceType: ResourceType,
  stableApiVersion: string[],
  previewApiVersion: string[],
): ResourceType {
  resourceType.apiVersions.stable = resourceType.apiVersions.stable.concat(
    stableApiVersion,
  );
  resourceType.apiVersions.preview = resourceType.apiVersions.preview.concat(
    previewApiVersion,
  );

  return resourceType;
}
