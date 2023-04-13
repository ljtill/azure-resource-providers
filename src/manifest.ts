import { Scope } from './enums'

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
