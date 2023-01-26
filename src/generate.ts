import fs from "fs";
import * as utils from './utils'
import { Logger } from "./logger"
import { Manifest, Scope } from "./manifest"
import { Definition, Schema, validateApiVersion, validateNamespace } from './schema'

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

            // Handle data inconsistency
            schema.title = schema.title.toLowerCase()

            schemas.push(schema)
        } catch (err) {
            logger.error("Error parsing schema file:" + element)
            if (err instanceof Error) {
                logger.error(err.message)
            }
        }
    })

    /**
     * Generate Manifest
     */
    const manifest = new Manifest()
    manifest.metadata.commitId = utils.getCommitId(dirPath)

    schemas.forEach(element => {
        const provider = manifest.getResourceProvider(element.title) ?? manifest.addResourceProvider(element.title)

        if (element.resourceDefinitions) {
            Object.keys(element.resourceDefinitions).forEach(item => {
                let resource = provider.getResourceType(item)
                if (typeof resource === "undefined") {
                    if (item.includes("_")) {
                        resource = provider.addResourceType(item, Scope.Resource)
                    } else {
                        resource = provider.addResourceType(item, Scope.ResourceGroup)
                    }
                }

                const definitions = element.resourceDefinitions as Definition
                const apiVersion = definitions[item].properties.apiVersion.enum[0]

                resource.addApiVersion(apiVersion)
            })
        }
        if (element.subscription_resourceDefinitions) {
            Object.keys(element.subscription_resourceDefinitions).forEach(item => {
                let resource = provider.getResourceType(item)
                if (typeof resource === "undefined") {
                    if (item.includes("_")) {
                        resource = provider.addResourceType(item, Scope.ResourceGroup)
                    } else {
                        resource = provider.addResourceType(item, Scope.Subscription)
                    }
                }

                const definitions = element.subscription_resourceDefinitions as Definition
                const apiVersion = definitions[item].properties.apiVersion.enum[0]

                resource.addApiVersion(apiVersion)
            })
        }
        if (element.managementGroup_resourceDefinitions) {
            Object.keys(element.managementGroup_resourceDefinitions).forEach(item => {
                let resource = provider.getResourceType(item)
                if (typeof resource === "undefined") {
                    if (item.includes("_")) {
                        resource = provider.addResourceType(item, Scope.Subscription)
                    } else {
                        resource = provider.addResourceType(item, Scope.ManagementGroup)
                    }
                }

                const definitions = element.managementGroup_resourceDefinitions as Definition
                const apiVersion = definitions[item].properties.apiVersion.enum[0]

                resource.addApiVersion(apiVersion)
            })
        }
        if (element.tenant_resourceDefinitions) {
            Object.keys(element.tenant_resourceDefinitions).forEach(item => {
                let resource = provider.getResourceType(item)
                if (typeof resource === "undefined") {
                    if (item.includes("_")) {
                        resource = provider.addResourceType(item, Scope.ManagementGroup)
                    } else {
                        resource = provider.addResourceType(item, Scope.Tenant)
                    }
                }

                const definitions = element.tenant_resourceDefinitions as Definition
                const apiVersion = definitions[item].properties.apiVersion.enum[0]

                resource.addApiVersion(apiVersion)
            })
        }
    });

    manifest.sortResourceProvider()

    utils.writeJsonFile("./gen/manifest.json", manifest)
}

generate()
