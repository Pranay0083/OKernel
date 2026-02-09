pub mod python;
pub mod cpp;

use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ProfilingEvent {
    Log { content: String },
    SystemResource { cpu: f32, memory: u64 },
    ProcessStart { pid: u32 },
    ProcessExit { code: i32 },
}

impl ProfilingEvent {
    pub fn from_log(line: &str) -> Self {
        // Basic heuristic parsing for Phase 3
        if line.contains("cpu:") {
            // parse cpu/mem mock
             ProfilingEvent::SystemResource { cpu: 10.0, memory: 1024 }
        } else {
             ProfilingEvent::Log { content: line.to_string() }
        }
    }
}
