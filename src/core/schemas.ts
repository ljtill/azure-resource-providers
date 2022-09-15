import { logger } from "../utils.ts";
import { listDirectories, listFiles, testFilePath } from "./files.ts";

export type Schema = {
  id: string;
  $schema: string;
  title: string;
  description: string;
  tenant_resourceDefinitions?: Definition;
  managementGroup_resourceDefinitions?: Definition;
  subscription_resourceDefinitions?: Definition;
  resourceDefinitions?: Definition;
  extension_resourceDefinitions?: Definition;
  definitions?: Definition;
};
export type Definition = {
  [key: string]: DefinitionObject;
};
type DefinitionObject = {
  type?: string;
  properties?: any; // TODO: Remove any type
  required?: string[];
  description?: string;
};

export enum Scope {
  Tenant = "tenant",
  ManagementGroup = "managementGroup",
  Subscription = "subscription",
  ResourceGroup = "resourceGroup",
  Resource = "resource",
}

/**
 * Cast JSON string to Schema object
 *
 * @param fileContent
 * @returns Schema
 */
export function parseSchemaFile(fileContent: string): Schema {
  try {
    return JSON.parse(fileContent) as Schema;
  } catch (err) {
    logger.warning(`Application terminated`);
    throw err;
  }
}

/**
 * List all schema files within the repository path
 *
 * @param dirPath
 * @returns string[]
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
 * Provides schemas repository directory path
 *
 * @returns string
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
 * Provides an array of defined resource definition scopes
 *
 * @param schema
 * @returns
 */
export function listResourceDefinitionScopes(schema: Schema): string[] {
  const properties: string[] = [];

  if (schema.tenant_resourceDefinitions !== undefined) {
    properties.push("tenant_resourceDefinitions");
  }
  if (schema.managementGroup_resourceDefinitions !== undefined) {
    properties.push("managementGroup_resourceDefinitions");
  }
  if (schema.subscription_resourceDefinitions !== undefined) {
    properties.push("subscription_resourceDefinitions");
  }
  if (schema.resourceDefinitions !== undefined) {
    properties.push("resourceDefinitions");
  }
  if (schema.extension_resourceDefinitions !== undefined) {
    properties.push("extension_resourceDefinitions");
  }
  if (schema.definitions !== undefined) {
    // TODO: Not implemented
    // properties.push("definitions");
  }

  return properties;
}

/**
 * Provides the scope name
 *
 * @param scope
 * @returns Scope
 */
export function getScope(scope: string): Scope {
  if (scope === "tenant_resourceDefinitions") {
    return Scope.Tenant;
  }
  if (scope === "managementGroup_resourceDefinitions") {
    return Scope.ManagementGroup;
  }
  if (scope === "subscription_resourceDefinitions") {
    return Scope.Subscription;
  }
  if (scope === "resourceDefinitions") {
    return Scope.ResourceGroup;
  }
  if (scope === "extension_resourceDefinitions") {
    return Scope.Resource;
  }
  if (scope === "definitions") {
    // TODO: Not implemented
    // return "";
  }

  throw "Unable to determine scope";
}
