import fs from "fs"
import path from "path"
import { execSync } from 'child_process'
import { Logger } from "./logger"
import { Manifest } from "./manifest"

const logger = new Logger()

export function writeJsonFile(filePath: string, manifest: Manifest): void {
    const parsedContent = JSON.stringify(manifest, null, 4)

    if (!fs.existsSync(path.dirname(filePath))) {
        try {
            fs.mkdirSync(path.dirname(filePath), null)
        } catch (err) {
            logger.error("Error creating directory: " + filePath)
            if (err instanceof Error) {
                logger.error(err.message)
            }
        }
    }

    try {
        fs.writeFileSync(filePath, parsedContent)
    } catch (err) {
        logger.error("Error writing file: " + filePath)
        if (err instanceof Error) {
            logger.error(err.message)
        }
        process.abort
    }
}

export function listFiles(dirPath: string, filePaths: string[] = []): string[] {
    filePaths = filePaths || []

    fs.readdirSync(dirPath).forEach(element => {
        if (fs.statSync(dirPath + "/" + element).isDirectory()) {
            filePaths = listFiles(dirPath + "/" + element, filePaths)
        } else {
            filePaths.push(path.join(dirPath, "/", element))
        }
    });

    return filePaths
}

export function getCommitId(dirPath: string): string {
    const command = "git rev-parse --short HEAD"
    return execSync(command, {
        cwd: dirPath,
    }).toString().trim()
}