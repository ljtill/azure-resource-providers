import * as fs from 'fs'

export function listSpecificationFiles(dirPath: string): string[] {
    let filePaths: string[] = []

    const specs = listDirectories(`${dirPath}`).map(dirent => dirent.name)

    specs.forEach((spec) => {

        console.log(`${spec}`)

        const providers = listDirectories(`${dirPath}/${spec}`).filter((dirent) => {
            return dirent.name.includes("Microsoft.")
        })

        console.log(`${providers.map(dirent => dirent.name)}`)

    })

    return []
}

export function listSchemaFiles(dirPath: string): string[] {
    let filePaths: string[] = []

    // TODO: Debug mode
    // console.log(`[debug] ${baseFilePath}`)

    const apiVersions = listDirectories(`${dirPath}`).map(dirent => dirent.name)

    apiVersions.forEach((apiVersion) => {

        // Filter by API Versions which match 0000-00-00 and 0000-00-00-preview
        const expression = "[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]"
        if (apiVersion.match(expression)) {

            const namespaces = listFiles(`${dirPath}/${apiVersion}`).map(dirent => dirent.name)
            namespaces.forEach((namespace) => {

                if (namespace.includes("Microsoft.")) {

                    // TODO: Debug mode
                    // console.log(`[debug] ${baseFilePath}/${apiVersion}/${namespace}`)

                    filePaths.push(`${dirPath}/${apiVersion}/${namespace}`)
                }
            })
        }
    })

    return filePaths
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
        fs.writeFileSync(filePath, JSON.stringify((content), null, 2))
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}