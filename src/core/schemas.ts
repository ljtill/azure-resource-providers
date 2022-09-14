// deno-lint-ignore-file no-explicit-any

import { logger } from "../utils.ts";

export interface Schema {
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
}
export interface Definition {
  [key: string]: DefinitionObject;
}
interface DefinitionObject {
  type?: string;
  properties?: any;
  required?: string[];
  description?: string;
}

export enum Scope {
  tenant_resourceDefinitions = "tenant",
  managementGroup_resourceDefinitions = "managementGroup",
  subscription_resourceDefinitions = "subscription",
  resourceDefinitions = "resourceGroup",
  extension_resourceDefinitions = "resource",
  // definition = ""
}

export function parseSchemaFile(fileContent: string): Schema {
  try {
    return JSON.parse(fileContent) as Schema;
  } catch (err) {
    logger.warning(`Application terminated`);
    throw err;
  }
}

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
  //  if (schema.definitions !== undefined) {
  //   properties.push("definitions")
  //  }

  return properties;
}

export function getScopeName(scope: string): string {
  if (scope === "tenant_resourceDefinitions") {
    return "tenant";
  }
  if (scope === "managementGroup_resourceDefinitions") {
    return "managementGroup";
  }
  if (scope === "subscription_resourceDefinitions") {
    return "subscription";
  }
  if (scope === "resourceDefinitions") {
    return "resourceGroup";
  }
  if (scope === "extension_resourceDefinitions") {
    return "resource";
  }
  // if(scope === "definitions") {
  //   return ""
  // }

  throw "Unable to determine scope";
}
