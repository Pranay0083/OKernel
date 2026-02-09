
pub struct CppProfiler;

impl CppProfiler {
    pub fn wrap_command(code: &str) -> Vec<String> {
        // Use the Python GDB wrapper script
        // We pass the code as an argument to runner.py
        vec![
            "python3".to_string(), 
            "/runner.py".to_string(), 
            code.to_string()
        ]
    }
}
