import * as fs from 'fs'

export function listSpecificationFiles(): string[] {
    return []
}

export function listSchemaFiles(repoFilePath: string): string[] {
    let schemaFilePaths: string[] = []

    // TODO: Debug mode
    // console.log(`[debug] ${baseFilePath}`)

    const apiVersions = listDirectories(`${repoFilePath}`).map(dirent => dirent.name)
    apiVersions.forEach((apiVersion) => {

        // Filter by API Versions which match 0000-00-00 and 0000-00-00-preview
        const expression = "[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]"
        if (apiVersion.match(expression)) {

            const namespaces = listFiles(`${repoFilePath}/${apiVersion}`).map(dirent => dirent.name)
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

export function listDirectories(filePath: string): fs.Dirent[] {
    return fs.readdirSync(filePath, { withFileTypes: true }).filter(dirent => dirent.isDirectory())
}

export function listFiles(filePath: string): fs.Dirent[] {
    return fs.readdirSync(filePath, { withFileTypes: true }).filter(dirent => dirent.isFile())
}

export function testFilePath(filePath: string): void {
    try {
        fs.realpathSync(filePath)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

export function writeJsonFile(filePath: string, content: any): void {
    try {
        fs.writeFileSync('schema.json', JSON.stringify((content), null, 2))
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}