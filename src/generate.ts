import * as utils from './utils'
import {
    Manifest,
    Scope,
    writeManifestFile
} from "./manifest"
import {
    Schema,
    getSchemasPath,
    listSchemaFilePaths,
    parseSchemaFile,
    validateSchemaApiVersion,
    validateSchemaNamespace
} from './schema'

utils.writeInfo("Starting process")

/**
 * Parse Schemas
 */

utils.writeInfo("Parsing schemas")

const schemasPath = getSchemasPath()

const schemas: Schema[] = []
listSchemaFilePaths(schemasPath).forEach(element => {
    if (!validateSchemaApiVersion(element) || !validateSchemaNamespace(element)) {
        return
    }

    try {
        schemas.push(parseSchemaFile(element))
    } catch (err) {
        utils.writeWarn("Failed parsing schema file:" + element)
        if (err instanceof Error) {
            utils.writeError(err.message)
            process.exit(1)
        }
    }
})

/**
 * Generate Manifests
 */

utils.writeInfo("Generating manifests")

const providerNamespaces = schemas.map(item => item.title)
    .filter((value, index, self) => { return self.indexOf(value) === index })
    .sort()

providerNamespaces.forEach(element => {
    const manifestObject = new Manifest(element)
    const providerSchemas = schemas.filter(item => item.title === element)

    providerSchemas.forEach(schema => {
        if (schema.tenant_resourceDefinitions) {
            const definitions = schema.tenant_resourceDefinitions
            Object.keys(definitions).forEach(key => {
                const apiVersion = definitions[key].properties.apiVersion.enum[0]
                const scope = key.includes("_") ? Scope.ManagementGroup : Scope.Tenant

                manifestObject.getResourceType(key)?.addApiVersion(apiVersion)
                    ?? manifestObject.addResourceType(key, scope, apiVersion)
            })
        }

        if (schema.managementGroup_resourceDefinitions) {
            const definitions = schema.managementGroup_resourceDefinitions
            Object.keys(definitions).forEach(key => {
                const apiVersion = definitions[key].properties.apiVersion.enum[0]
                const scope = key.includes("_") ? Scope.Subscription : Scope.ManagementGroup

                manifestObject.getResourceType(key)?.addApiVersion(apiVersion)
                    ?? manifestObject.addResourceType(key, scope, apiVersion)
            })
        }

        if (schema.subscription_resourceDefinitions) {
            const definitions = schema.subscription_resourceDefinitions
            Object.keys(definitions).forEach(key => {
                const apiVersion = definitions[key].properties.apiVersion.enum[0]
                const scope = key.includes("_") ? Scope.ResourceGroup : Scope.Subscription

                manifestObject.getResourceType(key)?.addApiVersion(apiVersion)
                    ?? manifestObject.addResourceType(key, scope, apiVersion)
            })
        }

        if (schema.resourceDefinitions) {
            const definitions = schema.resourceDefinitions
            Object.keys(definitions).forEach(key => {
                const apiVersion = definitions[key].properties.apiVersion.enum[0]
                const scope = key.includes("_") ? Scope.Resource : Scope.ResourceGroup

                manifestObject.getResourceType(key)?.addApiVersion(apiVersion)
                    ?? manifestObject.addResourceType(key, scope, apiVersion)
            })
        }

        if (schema.extension_resourceDefinitions) {
            const definitions = schema.extension_resourceDefinitions
            Object.keys(definitions).forEach(key => {
                const apiVersion = definitions[key].properties.apiVersion.enum[0]
                const scope = key.includes("_") ? Scope.Extension : Scope.Resource

                manifestObject.getResourceType(key)?.addApiVersion(apiVersion)
                    ?? manifestObject.addResourceType(key, scope, apiVersion)
            })
        }

        if (schema.definitions) {
            // NOTE: Unsupported data structure
        }
    })

    manifestObject.sortResourceTypes()

    writeManifestFile("./gen/" + element.toLowerCase() + "/manifest.json", manifestObject)
})

utils.writeInfo("Completed process")
