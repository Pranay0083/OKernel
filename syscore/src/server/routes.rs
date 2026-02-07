use axum::{Json, extract::State};
use serde::{Deserialize, Serialize};
use crate::docker::manager::{ContainerManager, Language};

#[derive(Deserialize)]
pub struct ExecuteRequest {
    pub language: String,
    pub code: String,
}

#[derive(Serialize)]
pub struct ExecuteResponse {
    pub status: String,
    pub output: String,
}

pub async fn execute_handler(
    State(manager): State<ContainerManager>,
    Json(payload): Json<ExecuteRequest>,
) -> Json<ExecuteResponse> {
    let lang = match payload.language.as_str() {
        "python" => Language::Python,
        "cpp" | "c++" => Language::Cpp,
        _ => return Json(ExecuteResponse {
            status: "error".to_string(),
            output: "Unsupported language".to_string(),
        }),
    };

    match manager.execute(lang, payload.code).await {
        Ok(result) => Json(ExecuteResponse {
            status: "success".to_string(),
            output: result,
        }),
        Err(e) => Json(ExecuteResponse {
            status: "error".to_string(),
            output: e,
        }),
    }
}
