import fs from 'fs'
import path from 'path'
import * as utils from './utils'

export type Schema = {
    id: string
    $schema: string
    title: string
    description: string
    tenant_resourceDefinitions?: Definition
    managementGroup_resourceDefinitions?: Definition
    subscription_resourceDefinitions?: Definition
    resourceDefinitions?: Definition
    extension_resourceDefinitions?: Definition
    definitions?: Definition
}

export type Definition = {
    [key: string]: DefinitionObject
}

export type DefinitionObject = {
    type?: string
    properties?: any
    required?: string[]
    description?: string
}

/**
 * Filesystem
 */
export function getDirPath(): string {
    if (process.env.USER === "runner") {
        return "../schemas/schemas"
    }

    if (process.env.USER === "vscode") {
        return "../resource-manager-schemas/schemas"
    }

    utils.writeError("Unsupported environment")
    process.exit(1)
}

export function listFilePaths(dirPath: string, filePaths: string[] = []): string[] {
    filePaths = filePaths || []

    fs.readdirSync(dirPath).forEach(element => {
        if (fs.statSync(dirPath + "/" + element).isDirectory()) {
            filePaths = listFilePaths(dirPath + "/" + element, filePaths)
        } else {
            filePaths.push(path.join(dirPath, "/", element))
        }
    })

    return filePaths
}

export function parseFile(filePath: string): Schema {
    const content = fs.readFileSync(filePath).toString()
    return JSON.parse(content) as Schema
}

/**
 * Validation
 */
export function validateApiVersion(filePath: string): boolean {
    const apiVersion = filePath.split("/").reverse()[1]
    if (!apiVersion.match("[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]")) {
        return false
    }

    return true
}

export function validateNamespace(filePath: string): boolean {
    const namespace = filePath.split("/").reverse()[0]
    if (!namespace.match("Microsoft.*")) {
        return false
    }

    return true
}
