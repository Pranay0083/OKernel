use crate::vm::fs::MockFileSystem;
use crate::vm::memory::Memory;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VMState {
    pub memory: Memory,
    pub fs: MockFileSystem,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VMMallocRequest {
    pub state: VMState,
    pub size: usize,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VMWriteRequest {
    pub state: VMState,
    pub address: usize,
    pub data: String,
    pub is_string: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FSOperationRequest {
    pub op: String, // "ls", "create", "read", "write"
    pub path: String,
    pub name: Option<String>,
    pub content: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FSOperationResponse {
    pub success: bool,
    pub files: Option<Vec<String>>,
    pub content: Option<String>,
    pub error: Option<String>,
}
