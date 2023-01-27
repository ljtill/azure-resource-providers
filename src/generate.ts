import fs from "fs";
import * as utils from './utils'
import { Scope } from './enums'
import { Logger } from "./logger"
import { Manifest } from "./manifest"
import {
    Schema,
    validateApiVersion, validateNamespace
} from './schema'

const logger = new Logger()

function generate(): void {
    /**
     * Setup Environment
     */
    let dirPath = ""
    if (process.env.USER === "runner") {
        // GitHub Actions
        dirPath = "../schemas/schemas"
    } else {
        // Local
        dirPath = "../../github-azure/azure-resource-manager-schemas/schemas"
    }

    /**
     * Parse Schemas
     */
    const schemas: Schema[] = []
    const schemasFiles = utils.listFiles(dirPath)

    schemasFiles.forEach(element => {
        if (!validateApiVersion(element) || !validateNamespace(element)) {
            logger.debug("Skipping file: " + element)
            return
        }

        logger.debug("Parsing file: " + element)
        try {
            const content = fs.readFileSync(element).toString()
            const schema = JSON.parse(content) as Schema
            schemas.push(schema)
        } catch (err) {
            logger.error("Error parsing schema file:" + element)
            if (err instanceof Error) {
                logger.error(err.message)
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
        const manifest = new Manifest(element)
        const providerSchemas = schemas.filter(item => item.title === element)

        providerSchemas.forEach(schema => {
            if (schema.tenant_resourceDefinitions) {
                const definitions = schema.tenant_resourceDefinitions
                Object.keys(definitions).forEach(key => {
                    const apiVersion = definitions[key].properties.apiVersion.enum[0]
                    const scope = key.includes("_") ? Scope.ManagementGroup : Scope.Tenant

                    manifest.getResourceType(key)?.addApiVersion(apiVersion)
                        ?? manifest.addResourceType(key, scope, apiVersion)
                })
            }

            if (schema.managementGroup_resourceDefinitions) {
                const definitions = schema.managementGroup_resourceDefinitions
                Object.keys(definitions).forEach(key => {
                    const apiVersion = definitions[key].properties.apiVersion.enum[0]
                    const scope = key.includes("_") ? Scope.Subscription : Scope.ManagementGroup

                    manifest.getResourceType(key)?.addApiVersion(apiVersion)
                        ?? manifest.addResourceType(key, scope, apiVersion)
                })
            }

            if (schema.subscription_resourceDefinitions) {
                const definitions = schema.subscription_resourceDefinitions
                Object.keys(definitions).forEach(key => {
                    const apiVersion = definitions[key].properties.apiVersion.enum[0]
                    const scope = key.includes("_") ? Scope.ResourceGroup : Scope.Subscription

                    manifest.getResourceType(key)?.addApiVersion(apiVersion)
                        ?? manifest.addResourceType(key, scope, apiVersion)
                })
            }

            if (schema.resourceDefinitions) {
                const definitions = schema.resourceDefinitions
                Object.keys(definitions).forEach(key => {
                    const apiVersion = definitions[key].properties.apiVersion.enum[0]
                    const scope = key.includes("_") ? Scope.Resource : Scope.ResourceGroup

                    manifest.getResourceType(key)?.addApiVersion(apiVersion)
                        ?? manifest.addResourceType(key, scope, apiVersion)
                })
            }

            if (schema.extension_resourceDefinitions) {
                const definitions = schema.extension_resourceDefinitions
                Object.keys(definitions).forEach(key => {
                    const apiVersion = definitions[key].properties.apiVersion.enum[0]
                    const scope = key.includes("_") ? Scope.Extension : Scope.Resource

                    manifest.getResourceType(key)?.addApiVersion(apiVersion)
                        ?? manifest.addResourceType(key, scope, apiVersion)
                })
            }

            if (schema.definitions) {
                logger.debug("Skipping definitions: " + schema.title)
                // FIX: Unsupported data structure
                // NOTE: Throws unhandled expection for apiVersion enum
                // const definitions = schema.definitions
                // Object.keys(definitions).forEach(key => {
                //     const apiVersion = definitions[key].properties.apiVersion.enum[0]

                //     manifest.getResourceType(key)?.addApiVersion(apiVersion)
                //         ?? manifest.addResourceType(key, Scope.Extension, apiVersion)
                // })
            }
        })

        manifest.sortResourceTypes()
        utils.writeJsonFile("./gen/" + element.toLowerCase() + "/manifest.json", manifest)
    })
}

generate()
