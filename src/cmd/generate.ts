import * as files from '../core/files'
import * as resources from '../core/resources'

function generateAllFile(): void {
    // TODO: Implementation

    // Output Path
    // - Default unless provided via command line argument
    // ./lib/schema.json
    // ./lib/specifications.json
}

function generateSpecificationsFile(repoFilePath: string): void {
    // TODO: Implementation

    // Output Path
    // - Default unless provided via command line argument
    // ./lib/specs.json
}

function generateSchemasFile(repoFilePath: string): void {
    // TODO: Arguments

    const schemaFilePaths = files.listSchemaFiles(repoFilePath)

    const resourceProviders = resources.listResourceProviders(schemaFilePaths)
    files.writeJsonFile('./schema.json', resourceProviders)
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