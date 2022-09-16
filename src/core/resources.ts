import { logger } from "../utils.ts";
import {
  Definition,
  getScope,
  listResourceDefinitionScopes,
  parseSchemaFile,
  Schema,
  Scope,
} from "./schemas.ts";
import { getFileContent } from "./files.ts";

type ResourceProvider = {
  providerNamespace: string;
  resourceTypes: ResourceType[];
};
type ResourceType = {
  name: string;
  scope: Scope;
  apiVersions: ApiVersions;
};
type ApiVersions = {
  stable: string[];
  preview: string[];
};

/**
 * Parses all resource providers
 *
 * @param filePaths
 * @returns ResourceProviders[]
 */
export function parseResourceProviders(
  filePaths: string[],
): ResourceProvider[] {
  const providers: ResourceProvider[] = [];

  // Iterate over file paths
  filePaths.forEach((filePath) => {
    logger.debug(`(parseResourceProviders) Processing file ${filePath}`);

    // Parse resource provider schema from file path
    // TODO: Handle schema and spec file
    const fileContent = getFileContent(filePath);
    const schema = parseSchemaFile(fileContent);

    if (checkResourceProviders(providers, schema)) {
      // Update resource provider
      providers.map((provider) => {
        provider.providerNamespace === schema.title
          ? updateResourceProvider(provider, parseResourceTypes(schema))
          : provider;
      });
    } else {
      // Create resource provider
      providers.push(addResourceProvider(schema, parseResourceTypes(schema)));
    }
  });

  return sortResourceProviders(providers);
}

function addResourceProvider(
  schema: Schema,
  resourceTypes: ResourceType[],
): ResourceProvider {
  logger.debug(
    `(addResourceProvider) Creating resource provider ${schema.title} `,
  );

  return {
    providerNamespace: schema.title,
    resourceTypes: resourceTypes,
  };
}

function updateResourceProvider(
  resourceProvider: ResourceProvider,
  resourceTypes: ResourceType[],
): ResourceProvider {
  logger.debug(
    `(updateResourceProvider) Updating resource provider ${resourceProvider.providerNamespace} `,
  );

  // Iterate over 'new' resource types
  resourceTypes.forEach((resourceType) => {
    if (
      // Check if resource type exists on the resource provider
      resourceProvider.resourceTypes.find((item) => {
        return item.name === resourceType.name &&
          item.scope === resourceType.scope;
      })
    ) {
      // Append resource type
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

function checkResourceProviders(
  providers: ResourceProvider[],
  schema: Schema,
): boolean {
  // Check if Resource Provider already exists in array
  if (
    providers.find((provider) => {
      return provider.providerNamespace === schema.title;
    })
  ) {
    return true;
  }

  return false;
}

function sortResourceProviders(
  providers: ResourceProvider[],
): ResourceProvider[] {
  // Iterate over each resource provider and sort the properties
  providers.forEach((provider) => {
    // Sort resource types by name & scope
    provider.resourceTypes.sort((
      a,
      b,
    ) => (a.name.localeCompare(b.name) || a.scope.localeCompare(b.scope)));

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
 *
 * @param schema
 * @returns ResourceType[]
 */
export function parseResourceTypes(schema: Schema): ResourceType[] {
  const resourceTypes = [] as ResourceType[];

  // List all resource definition scopes which are defined
  const definitionScopes = listResourceDefinitionScopes(schema);

  // Iterate over all resource scopes
  definitionScopes.forEach((definitionScope) => {
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

      if (!apiVersion.includes("-preview")) {
        // Stable
        resourceTypes.push({
          name: definitionKey,
          scope: getScope(definitionScope, definitionKey),
          apiVersions: {
            stable: [
              apiVersion,
            ],
            preview: [],
          },
        });
      } else {
        // Preview
        resourceTypes.push({
          name: definitionKey,
          scope: getScope(definitionScope, definitionKey),
          apiVersions: {
            stable: [],
            preview: [
              apiVersion,
            ],
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
  // Stable
  if (stableApiVersion[0] !== undefined) {
    // Check if the api version already exists
    if (!resourceType.apiVersions.stable.includes(stableApiVersion[0])) {
      resourceType.apiVersions.stable = resourceType.apiVersions.stable.concat(
        stableApiVersion,
      );
    }
  }

  // Preview
  if (previewApiVersion[0] !== undefined) {
    // Check if the api version already exists
    if (!resourceType.apiVersions.preview.includes(previewApiVersion[0])) {
      resourceType.apiVersions.preview = resourceType.apiVersions.preview
        .concat(
          previewApiVersion,
        );
    }
  }

  return resourceType;
}
