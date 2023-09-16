export enum Scope {
    Tenant = 'tenant',
    ManagementGroup = 'managementGroup',
    Subscription = 'subscription',
    ResourceGroup = 'resourceGroup',
    Resource = "resource",
    Extension = 'extensionResource',
}

export enum LogLevel {
    Debug,
    Info,
    Warn,
    Error
}
