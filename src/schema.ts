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
    type?: string;
    properties?: unknown;
    required?: string[];
    description?: string;
};

export function validateApiVersion(filePath: string): boolean {
    const apiVersion = filePath.split("/").reverse()[1]
    if (!apiVersion.match("[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]")) {
        return false
    }

    return true
}

export function validateNamespace(filePath: string): boolean {
    const namespace = filePath.split("/").reverse()[0]
    if (!namespace.match("Microsoft.*")) {
        return false
    }

    return true
}
