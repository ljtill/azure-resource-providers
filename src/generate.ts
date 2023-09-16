import * as utils from './utils'
import * as manifest from "./manifest"
import * as schema from './schema'

utils.writeInfo("Starting process")

/**
 * Parse Schemas
 */
utils.writeInfo("Parsing schemas")

const schemasPath = schema.getDirPath()

const schemas: schema.Schema[] = []
schema.listFilePaths(schemasPath).forEach(element => {
    if (!schema.validateApiVersion(element) || !schema.validateNamespace(element)) {
        return
    }

    try {
        schemas.push(schema.parseFile(element))
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

const providerNamespaces = schemas.map(item => item.title)
    .filter((value, index, self) => { return self.indexOf(value) === index })
    .sort()

providerNamespaces.forEach(element => {
    utils.writeInfo("Generating manifests - " + element)

    const manifestObject = new manifest.Manifest(element)
    const providerSchemas = schemas.filter(item => item.title === element)

    providerSchemas.forEach(schema => {
        if (schema.tenant_resourceDefinitions) {
            const definitions = schema.tenant_resourceDefinitions
            Object.keys(definitions).forEach(key => {
                const apiVersion = definitions[key].properties.apiVersion.enum[0]
                const scope = key.includes("_") ? manifest.Scope.ManagementGroup : manifest.Scope.Tenant

                manifestObject.getResourceType(key)?.addApiVersion(apiVersion)
                    ?? manifestObject.addResourceType(key, scope, apiVersion)
            })
        }

        if (schema.managementGroup_resourceDefinitions) {
            const definitions = schema.managementGroup_resourceDefinitions
            Object.keys(definitions).forEach(key => {
                const apiVersion = definitions[key].properties.apiVersion.enum[0]
                const scope = key.includes("_") ? manifest.Scope.Subscription : manifest.Scope.ManagementGroup

                manifestObject.getResourceType(key)?.addApiVersion(apiVersion)
                    ?? manifestObject.addResourceType(key, scope, apiVersion)
            })
        }

        if (schema.subscription_resourceDefinitions) {
            const definitions = schema.subscription_resourceDefinitions
            Object.keys(definitions).forEach(key => {
                const apiVersion = definitions[key].properties.apiVersion.enum[0]
                const scope = key.includes("_") ? manifest.Scope.ResourceGroup : manifest.Scope.Subscription

                manifestObject.getResourceType(key)?.addApiVersion(apiVersion)
                    ?? manifestObject.addResourceType(key, scope, apiVersion)
            })
        }

        if (schema.resourceDefinitions) {
            const definitions = schema.resourceDefinitions
            Object.keys(definitions).forEach(key => {
                const apiVersion = definitions[key].properties.apiVersion.enum[0]
                const scope = key.includes("_") ? manifest.Scope.Resource : manifest.Scope.ResourceGroup

                manifestObject.getResourceType(key)?.addApiVersion(apiVersion)
                    ?? manifestObject.addResourceType(key, scope, apiVersion)
            })
        }

        if (schema.extension_resourceDefinitions) {
            const definitions = schema.extension_resourceDefinitions
            Object.keys(definitions).forEach(key => {
                const apiVersion = definitions[key].properties.apiVersion.enum[0]
                const scope = key.includes("_") ? manifest.Scope.Extension : manifest.Scope.Resource

                manifestObject.getResourceType(key)?.addApiVersion(apiVersion)
                    ?? manifestObject.addResourceType(key, scope, apiVersion)
            })
        }

        if (schema.definitions) {
            // NOTE: Unsupported data structure
        }
    })

    manifestObject.sortResourceTypes()

    manifest.writeFile("./gen/" + element.toLowerCase() + "/manifest.json", manifestObject)
})

utils.writeInfo("Completed process")
