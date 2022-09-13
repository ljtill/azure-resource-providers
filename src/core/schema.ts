// deno-lint-ignore-file no-explicit-any

// Import

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

export type DefinitionObject = {
  type: string;
  properties: any;
  required: string[];
  description: string;
};

// Export

export type ProviderSchema = {
  providerNamespace: string;
  resourceTypes: ResourceType[];
};

export type ResourceType = {
  name: string;
  apiVersions: ApiVersions;
};

type ApiVersions = {
  stable: string[];
  preview: string[];
};
