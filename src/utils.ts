import fs from "fs"
import path from "path"
import { execSync } from 'child_process'
import { Manifest } from "./manifest"
import { LogLevel } from "./enums"

export function writeJsonFile(filePath: string, manifest: Manifest): void {
    const parsedContent = JSON.stringify(manifest, null, 4)

    if (!fs.existsSync(path.dirname(filePath))) {
        try {
            fs.mkdirSync(path.dirname(filePath), null)
        } catch (err) {
            log("Error creating directory: " + filePath, LogLevel.Error)
            if (err instanceof Error) {
                log(err.message, LogLevel.Error)
            }
        }
    }

    try {
        fs.writeFileSync(filePath, parsedContent)
    } catch (err) {
        log("Error writing file: " + filePath, LogLevel.Error)
        if (err instanceof Error) {
            log(err.message, LogLevel.Error)
        }
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
    })

    return filePaths
}

export function getCommitId(dirPath: string): string {
    const command = "git rev-parse --short HEAD"
    return execSync(command, {
        cwd: dirPath,
    }).toString().trim()
}

export function log(message: string, level: LogLevel): void {
    switch (level) {
        case LogLevel.Debug:
            console.debug("[debug] " + message)
            break;
        case LogLevel.Info:
            console.info("[info] " + message)
            break;
        case LogLevel.Warn:
            console.warn("[warn] " + message)
            break;
        case LogLevel.Error:
            console.error("[error] " + message)
            break;
        default:
            break;
    }
}
