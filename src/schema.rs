use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tracing::{info, warn, error, debug};

/// Represents a schema for a provider namespace
#[derive(Debug, Deserialize, Serialize)]
pub struct Schema {
    pub id: String,
    pub schema: String,
    pub title: String,
    pub description: Option<String>,
    pub tenant_resourceDefinitions: Option<Definition>,
    pub managementGroup_resourceDefinitions: Option<Definition>,
    pub subscription_resourceDefinitions: Option<Definition>,
    pub resourceDefinitions: Option<Definition>,
    pub extension_resourceDefinitions: Option<Definition>,
    pub definitions: Option<Definition>,
}

/// Represents a definition in the schema
#[derive(Debug, Deserialize, Serialize)]
pub struct Definition {
    pub properties: Option<DefinitionObject>,
}

/// Represents an object in the definition
#[derive(Debug, Deserialize, Serialize)]
pub struct DefinitionObject {
    pub type_: Option<String>,
    pub properties: Option<serde_json::Value>,
    pub required: Option<Vec<String>>,
    pub description: Option<String>,
}

/// Gets the path to the schemas directory based on the environment
pub fn get_schemas_path() -> String {
    if let Ok(user) = std::env::var("USER") {
        match user.as_str() {
            "runner" => return "../schemas/schemas".to_string(),
            "vscode" => return "../resource-manager-schemas/schemas".to_string(),
            _ => (),
        }
    }
    error("Unsupported environment");
    std::process::exit(1);
}

/// Lists all schema file paths in the given directory
pub fn list_schema_file_paths(dir_path: &str) -> Vec<String> {
    let mut file_paths = Vec::new();
    if let Ok(entries) = fs::read_dir(dir_path) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_dir() {
                    file_paths.extend(list_schema_file_paths(path.to_str().unwrap()));
                } else {
                    file_paths.push(path.to_str().unwrap().to_string());
                }
            }
        }
    }
    file_paths
}

/// Parses the schema file at the given file path
pub fn parse_schema_file(file_path: &str) -> Schema {
    let content = fs::read_to_string(file_path).expect("Failed to read schema file");
    serde_json::from_str(&content).expect("Failed to parse schema file")
}

/// Validates the API version in the schema file path
pub fn validate_schema_api_version(file_path: &str) -> bool {
    let api_version = file_path.split('/').rev().nth(1).unwrap_or("");
    api_version.chars().all(|c| c.is_digit(10) || c == '-')
}

/// Validates the namespace in the schema file path
pub fn validate_schema_namespace(file_path: &str) -> bool {
    let namespace = file_path.split('/').rev().next().unwrap_or("");
    namespace.starts_with("Microsoft.")
}
