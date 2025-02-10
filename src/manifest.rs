use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tracing::{info, warn, error, debug};

/// Represents a manifest for a provider namespace
#[derive(Serialize, Deserialize, Debug)]
pub struct Manifest {
    pub providerNamespace: String,
    pub resourceTypes: Vec<ResourceType>,
}

impl Manifest {
    /// Creates a new manifest with the given provider namespace
    pub fn new(namespace: String) -> Self {
        Manifest {
            providerNamespace: namespace,
            resourceTypes: Vec::new(),
        }
    }

    /// Adds a resource type to the manifest
    pub fn add_resource_type(&mut self, resource_type: ResourceType) {
        self.resourceTypes.push(resource_type);
    }

    /// Sorts the resource types in the manifest
    pub fn sort_resource_types(&mut self) {
        self.resourceTypes.sort_by(|a, b| a.name.cmp(&b.name));
        for resource_type in &mut self.resourceTypes {
            resource_type.sort_api_versions();
        }
    }
}

/// Represents a resource type in the manifest
#[derive(Serialize, Deserialize, Debug)]
pub struct ResourceType {
    pub name: String,
    pub scope: String,
    pub apiVersions: ApiVersion,
}

impl ResourceType {
    /// Creates a new resource type with the given name, scope, and API version
    pub fn new(name: String, scope: String, api_version: String) -> Self {
        let mut resource_type = ResourceType {
            name,
            scope,
            apiVersions: ApiVersion::new(),
        };
        resource_type.add_api_version(api_version);
        resource_type
    }

    /// Adds an API version to the resource type
    pub fn add_api_version(&mut self, api_version: String) {
        if api_version.contains("preview") {
            if !self.apiVersions.preview.contains(&api_version) {
                self.apiVersions.preview.push(api_version);
            }
        } else {
            if !self.apiVersions.stable.contains(&api_version) {
                self.apiVersions.stable.push(api_version);
            }
        }
    }

    /// Sorts the API versions in the resource type
    pub fn sort_api_versions(&mut self) {
        self.apiVersions.stable.sort();
        self.apiVersions.preview.sort();
    }
}

/// Represents the API versions for a resource type
#[derive(Serialize, Deserialize, Debug)]
pub struct ApiVersion {
    pub stable: Vec<String>,
    pub preview: Vec<String>,
}

impl ApiVersion {
    /// Creates a new ApiVersion instance
    pub fn new() -> Self {
        ApiVersion {
            stable: Vec::new(),
            preview: Vec::new(),
        }
    }
}

/// Writes the manifest to a file
pub fn write_manifest_file(file_path: &str, manifest: &Manifest) {
    let parsed_content = serde_json::to_string_pretty(manifest).unwrap();

    if !Path::new(file_path).parent().unwrap().exists() {
        match fs::create_dir_all(Path::new(file_path).parent().unwrap()) {
            Ok(_) => info!("Created directory: {}", file_path),
            Err(err) => {
                warn!("Error creating directory: {}", file_path);
                error!("{}", err.to_string());
                std::process::exit(1);
            }
        }
    }

    match fs::write(file_path, parsed_content) {
        Ok(_) => info!("Successfully wrote file: {}", file_path),
        Err(err) => {
            warn!("Failed writing file: {}", file_path);
            error!("{}", err.to_string());
            std::process::exit(1);
        }
    }
}
