import * as utils from '../utils'
import * as resource from '../resource'

function generateAllFile(): void {
    // TODO: Implementation

    // Output Path
    // - Default unless provided via command line argument
    // ./lib/schema.json
    // ./lib/specifications.json
}

function listSpecificationFiles(): string[] {
    return []
}

function generateSpecificationsFile(repoFilePath: string): void {
    // TODO: Implementation

    // Output Path
    // - Default unless provided via command line argument
    // ./lib/specs.json
}

function listSchemaFiles(repoFilePath: string): string[] {
    let schemaFilePaths: string[] = []

    // TODO: Debug mode
    // console.log(`[debug] ${baseFilePath}`)

    const apiVersions = utils.listDirectories(`${repoFilePath}`).map(dirent => dirent.name)
    apiVersions.forEach((apiVersion) => {

        // Filter by API Versions which match 0000-00-00 and 0000-00-00-preview
        const expression = "[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]"
        if (apiVersion.match(expression)) {

            const namespaces = utils.listFiles(`${repoFilePath}/${apiVersion}`).map(dirent => dirent.name)
            namespaces.forEach((namespace) => {

                if (namespace.includes("Microsoft.")) {

                    // TODO: Debug mode
                    // console.log(`[debug] ${baseFilePath}/${apiVersion}/${namespace}`)

                    schemaFilePaths.push(`${repoFilePath}/${apiVersion}/${namespace}`)
                }

            })
        }

    })

    return schemaFilePaths
}

function generateSchemasFile(repoFilePath: string): void {
    const schemaFilePaths = listSchemaFiles(repoFilePath)

    const resourceProviders = resource.listResourceProviders(schemaFilePaths)
    utils.writeJsonFile('./schema.json', resourceProviders)

    // Output Path
    // - Default unless provided via command line argument
    // ./lib/schema.json
}

function main(): void {

    // Args
    // - generate specs
    // - generate schemas
    // - generate all

    // TODO: Implement as command line argument
    const filePath = "../../github-azure/azure-resource-manager-schemas/schemas"

    // Repository path
    // ./github-azure/azure-rest-api-specs
    // ./specification
    // ./github-azure/azure-resource-manager-schemas
    // ./schemas

    // TODO: Parse command arguments
    // generateSpecificationsFile(filePath)
    generateSchemasFile(filePath)

    process.exit(0)
}

main()
