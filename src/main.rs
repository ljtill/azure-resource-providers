mod manifest;
mod schema;

use manifest::{Manifest, ResourceType, ApiVersion};
use schema::{Schema, Definition, DefinitionObject, get_schemas_path, list_schema_file_paths, parse_schema_file, validate_schema_api_version, validate_schema_namespace};
use tracing::{info, warn, error, debug};

fn main() {
    // Initialize the tracing subscriber for logging
    tracing_subscriber::fmt::init();

    // Log the start of the process
    info!("Starting process");

    // Get the path to the schemas directory
    let schemas_path = get_schemas_path();
    // List all schema file paths in the schemas directory
    let schema_file_paths = list_schema_file_paths(&schemas_path);

    // Iterate over each schema file path
    for file_path in schema_file_paths {
        // Validate the schema file path for API version and namespace
        if !validate_schema_api_version(&file_path) || !validate_schema_namespace(&file_path) {
            continue;
        }

        // Parse the schema file
        let schema = parse_schema_file(&file_path);
        // Create a new manifest for the schema
        let manifest = Manifest::new(schema.title.clone());

        // Add resource definitions to the manifest
        if let Some(definitions) = &schema.resourceDefinitions {
            for (name, definition) in definitions {
                let resource_type = ResourceType::new(name.clone(), schema.title.clone(), schema.id.clone());
                manifest.add_resource_type(resource_type);
            }
        }

        // Sort the resource types in the manifest
        manifest.sort_resource_types();
        // Generate the manifest file path
        let manifest_file_path = format!("gen/{}/manifest.json", schema.title);
        // Write the manifest to the file
        manifest::write_manifest_file(&manifest_file_path, &manifest);
    }

    // Log the completion of the process
    info!("Completed process");
}
