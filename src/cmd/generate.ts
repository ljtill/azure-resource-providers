import * as files from '../core/files'
import * as resources from '../core/resources'

function generateSchemasFile(repoDirPath: string, outFilePath: string): void {
    const schemaFilePaths = files.listSchemaFiles(repoDirPath)
    const resourceProviders = resources.listResourceProviders(schemaFilePaths)

    files.writeJsonFile(outFilePath, resourceProviders)
}

function generateSpecificationsFile(repoDirPath: string, outFilePath: string): void {
    // TODO: Implementation
}

function main(argv: string[]): void {

    // TODO: Implement as command line argument
    const dirPath = "../../github-azure/azure-resource-manager-schemas/schemas"

    // Args
    // - generate specs
    // - generate schemas

    switch (argv[2]) {
        case 'schemas':
            // TODO: console.log(`[debug] Initiating schemas generation`)
            // TODO: testRepoPath('./github-azure/azure-rest-api-specs')
            generateSchemasFile(dirPath, "./schemas.json")
            break;
        case 'specs':
            // TODO: console.log(`[debug] Initiating specs generation`)
            // TODO: testRepoPath('./github-azure/azure-resource-manager-schemas')
            generateSpecificationsFile(dirPath, "./specs.json")
            break;
        default:
            console.error("Invalid argument")
    }

    process.exit(0)
}

main(process.argv)