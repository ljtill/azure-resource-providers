import * as files from '../core/files'
import * as resources from '../core/resources'

function generateSchemasFile(filePath: string): void {
    const repoDirPath = "../../github-azure/azure-resource-manager-schemas/schemas"

    const schemaFilePaths = files.listSchemaFiles(repoDirPath)
    const resourceProviders = resources.listResourceProviders(schemaFilePaths)

    files.writeJsonFile(filePath, resourceProviders)
}

function generateSpecificationsFile(filePath: string): void {
    const dirPath = "../../github-azure/azure-rest-api-specs/specification"

    files.listSpecificationFiles(dirPath)

    files.writeJsonFile(filePath, {})
}

function main(argv: string[]): void {
    switch (argv[2]) {
        case 'schemas':
            // TODO: console.log(`[debug] Initiating schemas generation`)
            // TODO: testRepoPath('./github-azure/azure-rest-api-specs')
            generateSchemasFile("./schemas.json")
            break;
        case 'specs':
            // TODO: console.log(`[debug] Initiating specs generation`)
            // TODO: testRepoPath('./github-azure/azure-resource-manager-schemas')
            generateSpecificationsFile("./specs.json")
            break;
        default:
            console.error("Invalid argument")
    }

    process.exit(0)
}

main(process.argv)