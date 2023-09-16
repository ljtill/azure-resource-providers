import fs from 'fs'
import path from 'path'
import * as utils from './utils'

export enum Scope {
    Tenant = 'tenant',
    ManagementGroup = 'managementGroup',
    Subscription = 'subscription',
    ResourceGroup = 'resourceGroup',
    Resource = "resource",
    Extension = 'extensionResource',
}

export class Manifest {
    public providerNamespace: string
    public resourceTypes: ResourceType[]

    constructor(namespace: string) {
        this.providerNamespace = namespace
        this.resourceTypes = []
    }

    public getResourceType(name: string): ResourceType | undefined {
        return this.resourceTypes.find((item) => item.name.toLowerCase() === name.toLowerCase())
    }
    public addResourceType(name: string, scope: Scope, apiVersion: string): ResourceType[] {
        this.resourceTypes.push(new ResourceType(name, scope, apiVersion))
        return this.resourceTypes
    }
    public sortResourceTypes(): ResourceType[] {
        this.resourceTypes.forEach((item) => item.sortApiVersions())
        this.resourceTypes.sort((a, b) => a.name.localeCompare(b.name))
        return this.resourceTypes
    }
}
class ResourceType {
    public name: string
    public scope: Scope
    public apiVersions: ApiVersion

    constructor(name: string, scope: Scope, apiVersion: string) {
        this.name = name
        this.scope = scope
        this.apiVersions = new ApiVersion()

        this.addApiVersion(apiVersion)
    }

    public addApiVersion(apiVersion: string): ApiVersion {
        if (apiVersion.includes("preview")) {
            this.apiVersions.preview.find((item) => item === apiVersion)
                ?? this.apiVersions.preview.push(apiVersion)
        } else {
            this.apiVersions.stable.find((item) => item === apiVersion)
                ?? this.apiVersions.stable.push(apiVersion)
        }

        return this.apiVersions
    }
    public sortApiVersions(): ApiVersion {
        this.apiVersions.stable.sort()
        this.apiVersions.preview.sort()
        return this.apiVersions
    }
}
class ApiVersion {
    public stable: string[]
    public preview: string[]

    constructor() {
        this.stable = []
        this.preview = []
    }
}

/**
 * Filesystem
 */

export function writeManifestFile(filePath: string, manifest: Manifest): void {
    const parsedContent = JSON.stringify(manifest, null, 4)

    if (!fs.existsSync(path.dirname(filePath))) {
        try {
            fs.mkdirSync(path.dirname(filePath), { recursive: true })
        } catch (err) {
            utils.writeWarn("Error creating directory: " + filePath)
            if (err instanceof Error) {
                utils.writeError(err.message)
                process.exit(1)
            }
        }
    }

    try {
        fs.writeFileSync(filePath, parsedContent)
    } catch (err) {
        utils.writeWarn("Failed writing file: " + filePath)
        if (err instanceof Error) {
            utils.writeError(err.message)
            process.exit(1)
        }
    }
}
