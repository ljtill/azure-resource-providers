import * as fs from 'fs';

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