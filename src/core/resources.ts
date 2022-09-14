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

export function listResourceProviders(
  filePaths: string[],
): ResourceProvider[] {
  const providers: ResourceProvider[] = [];

  /**
   * Iterate over file paths
   */
  for (const _filePath of filePaths) {
    /**
     * Parse resource provider schema from file path
     */
    const fileContent = getFileContent(_filePath);

    // TODO: Handle schema and spec files
    const schema = parseSchemaFile(fileContent);

    /**
     * Ensure only Microsoft.* resource providers are included
     */
    if (!schema.title.includes("Microsoft.")) {
      continue;
    }

    /**
     * Parse resource types from schema
     */
    const resourceTypes = listResourceTypes(schema);

    /**
     * Check if resource provider already exists in array
     */
    if (
      !providers.find((provider) => {
        return provider.providerNamespace === schema.title;
      })
    ) {
      /**
       * Create resource provider
       */
      providers.push({
        providerNamespace: schema.title,
        resourceTypes: resourceTypes,
      });
    } else {
      /**
       * Append resource provider
       */

      const providerIndex = providers.findIndex((provider) => {
        return provider.providerNamespace == schema.title;
      });

      /**
       * Iterate through resource types
       */
      for (const _resourceType of resourceTypes) {
        /**
         * Check if resource type already exists
         */
        if (
          !providers[providerIndex].resourceTypes.find((item) => {
            return item.name === _resourceType.name;
          })
        ) {
          /**
           * Create resource type
           */
          providers[providerIndex].resourceTypes = resourceTypes;
        } else {
          /**
           * Append resource type
           */
          const resourceTypeIndex = providers[providerIndex].resourceTypes
            .findIndex((item) => {
              return item.name === _resourceType.name;
            });

          if (_resourceType.apiVersions.stable[0] !== undefined) {
            providers[providerIndex].resourceTypes[resourceTypeIndex]
              .apiVersions
              .stable.push(_resourceType.apiVersions.stable[0]);
          }

          if (_resourceType.apiVersions.preview[0] !== undefined) {
            providers[providerIndex].resourceTypes[resourceTypeIndex]
              .apiVersions
              .preview
              .push(_resourceType.apiVersions.preview[0]);
          }
        }
      }
    }
  }

  /**
   * Sort resource providers alphabetically
   */
  return providers.sort((a, b) =>
    (a.providerNamespace > b.providerNamespace) ? 1 : -1
  );
}

/**
 * Lists all resource types for a given resource provider schema
 * @returns ResourceType[]
 */
function listResourceTypes(schema: Schema): ResourceType[] {
  const resourceTypes = [] as ResourceType[];

  /**
   * List all resource definition scopes which are defined
   */
  const definitionScopes = listResourceDefinitionScopes(schema);

  definitionScopes.forEach((definitionScope) => {
    // logger.debug(definitionScope);

    const scopeName = getScopeName(definitionScope);

    /**
     * TBD
     */
    type SchemaKey = keyof typeof schema;
    const definitionScopeKey = definitionScope as SchemaKey;

    /**
     * Retrieve all the definitions from a given scope
     */
    const definitionKeys = Object.keys(schema[definitionScopeKey] as string);
    const definitions = schema[definitionScopeKey] as Definition;

    /**
     * Iterate over each definition within the scope
     */
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
            stable: [`${apiVersion}`],
            preview: [],
          },
        });
      }
    });
  });

  return resourceTypes;
}
