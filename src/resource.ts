import * as fs from 'fs'

interface Provider {
    resourceProvider: string
    resourceTypes: Resource[]
}

interface Resource {
    name: string
    apiVersions: string[]
}

export function listResourceProviders(filePaths: string[]): Provider[] {
    let providers: Provider[] = []

    filePaths.forEach((filePath) => {
        // Retrieve string in file path
        let providerName = filePath.split("/").pop()

        // Skip undefined types
        if (typeof providerName === "string") {

            // Remove file type prefix
            providerName = providerName.replace(".json", "")

            // Skip if duplicate entry
            if (!providers.find((provider) => { return provider.resourceProvider === providerName })) {

                // Include only Microsoft.* Namespaces
                if (providerName.includes("Microsoft.")) {

                    // Retrieve resource types for each provider
                    const resourceTypes = listResourceTypes(filePaths, providerName)

                    // Add to providers list
                    providers.push({
                        resourceProvider: providerName,
                        resourceTypes: resourceTypes,
                    })
                }
            }
        }
    })

    // Sort the providers by name
    return providers.sort((a, b) => (a.resourceProvider > b.resourceProvider) ? 1 : -1)
}

function listResourceTypes(filePaths: string[], resourceProvider: string): Resource[] {
    let types: Resource[] = []

    filePaths = filePaths.filter((filePath: string): boolean => {
        // Filter file paths by resource provider
        return filePath.includes(resourceProvider)
    })

    filePaths.forEach((filePath) => {
        // Retrieve string in file path
        const apiVersion = filePath.split("/").reverse()[1]

        // Retrieve file contents
        let fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })

        // Parse json content
        let jsonData = JSON.parse(fileContent)

        // List the resource types
        const resourceDefinitions = Object.keys(jsonData.resourceDefinitions)

        resourceDefinitions.forEach((resourceDefinition) => {

            // Skip undefined types
            if (typeof resourceDefinition === "string") {

                if (types.find((type) => { return type.name === resourceDefinition })) {
                    // Locate existing resource type
                    const type = types.findIndex((type) => { return type.name === resourceDefinition })

                    // Append version to api version list
                    types[type].apiVersions.push(apiVersion)
                } else {

                    // Append new resource type to list
                    types.push({
                        name: resourceDefinition,
                        apiVersions: [ apiVersion ],
                    })

                }
            }
        })
    })

    return types.sort((a, b) => (a.name > b.name) ? 1 : -1)
}
