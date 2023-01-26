export class Manifest {
    public $schema: string
    public metadata: Metadata
    public entities: ResourceProvider[]

    constructor() {
        this.$schema = ""
        this.metadata = new Metadata()
        this.entities = []
    }

    public addResourceProvider(namespace: string): ResourceProvider {
        const provider = new ResourceProvider(namespace)
        this.entities.push(provider)

        return provider
    }

    public getResourceProvider(namespace: string): ResourceProvider | undefined {
        return this.entities.find(element => element.providerNamespace === namespace)
    }

    public sortResourceProvider(): void {
        this.entities.sort((a, b) => a.providerNamespace.localeCompare(b.providerNamespace))
        this.entities.forEach(element => {
            element.sortResourceType()
        })
    }
}

class Metadata {
    public commitId: string

    constructor() {
        this.commitId = ""
    }
}

class ResourceProvider {
    public providerNamespace: string
    public resourceTypes: ResourceType[]

    constructor(namespace: string) {
        this.providerNamespace = namespace
        this.resourceTypes = []
    }

    public addResourceType(name: string, scope: Scope): ResourceType {
        const resource = new ResourceType(name, scope)
        this.resourceTypes.push(resource)

        return resource
    }

    public getResourceType(name: string): ResourceType | undefined {
        return this.resourceTypes.find(element => element.name === name)
    }

    public sortResourceType(): void {
        this.resourceTypes.sort((a, b) => a.name.localeCompare(b.name))
        this.resourceTypes.forEach(element => {
            element.sortApiVersion()
        })
    }
}

class ResourceType {
    public name: string
    public scope: Scope
    public apiVersions: ApiVersion

    constructor(name: string, scope: Scope) {
        this.name = name
        this.scope = scope
        this.apiVersions = new ApiVersion()
    }

    public addApiVersion(apiVersion: string): void {
        if (apiVersion.endsWith("-preview")) {
            this.apiVersions.preview.push(apiVersion)
        } else {
            this.apiVersions.stable.push(apiVersion)
        }
    }

    public getApiVersion(): string[] {
        return this.apiVersions.stable.concat(this.apiVersions.preview)
    }

    public sortApiVersion(): void {
        this.apiVersions.stable.sort((a, b) => a.localeCompare(b))
        this.apiVersions.preview.sort((a, b) => a.localeCompare(b))
    }
}

class ApiVersion {
    public stable: string[]
    public preview: string[]

    public constructor() {
        this.stable = []
        this.preview = []
    }
}

export enum Scope {
    Tenant = 'tenant',
    ManagementGroup = 'managementGroup',
    Subscription = 'subscription',
    ResourceGroup = 'resourceGroup',
    Resource = "resource",
    Extension = 'extension',
}
