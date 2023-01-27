import { Scope } from './enums'

export class Manifest {
    public $schema: string
    public metadata: Metadata
    public providerNamespace: string
    public resourceTypes: ResourceType[]

    constructor(namespace: string) {
        this.$schema = "https://schema.ljtill.com/schemas/manifest.json#"
        this.metadata = new Metadata()
        this.providerNamespace = namespace
        this.resourceTypes = []
    }

    public getResourceType(name: string): ResourceType | undefined {
        return this.resourceTypes.find((item) => item.name === name)
    }
    public addResourceType(name: string, scope: Scope, apiVersion: string): ResourceType[] {
        this.resourceTypes.push(new ResourceType(name, scope, apiVersion))
        return this.resourceTypes
    }
    public updateResourceType(name: string, apiVersion: string): ResourceType[] {
        this.resourceTypes.find((item) => item.name === name)?.addApiVersion(apiVersion)
        return this.resourceTypes
    }
    public sortResourceTypes(): ResourceType[] {
        this.resourceTypes.forEach((item) => item.sortApiVersions())
        this.resourceTypes.sort((a, b) => a.name.localeCompare(b.name))
        return this.resourceTypes
    }
}

class Metadata { }

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
            this.apiVersions.preview.push(apiVersion)
        } else {
            this.apiVersions.stable.push(apiVersion)
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
