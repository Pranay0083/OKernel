
pub struct PythonProfiler;

impl PythonProfiler {
    pub fn wrap_command(code: &str) -> Vec<String> {
        // In real impl, we wraps with py-spy or similar
        // For now, just run python
        // Use the custom runner script inside the container
        vec!["python3".to_string(), "/runner.py".to_string(), code.to_string()]
    }
}
