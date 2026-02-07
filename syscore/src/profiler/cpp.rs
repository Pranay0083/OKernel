
pub struct CppProfiler;

impl CppProfiler {
    pub fn wrap_command(code: &str) -> Vec<String> {
        // C++ needs compilation. 
        // We'll run a shell script that compiles then runs
        let script = format!(
            "echo '{}' > main.cpp && g++ main.cpp -o app && ./app",
            code.replace("'", "'\\''") // simplistic escaping
        );
        vec!["sh".to_string(), "-c".to_string(), script]
    }
}
