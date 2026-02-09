use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::env;

#[derive(Serialize, Deserialize, Debug)]
pub struct TraceEvent {
    pub line: i32,
    pub function: String,
    pub locals: Value,
    pub memory_curr: u64,
    pub memory_peak: u64,
    pub stack_depth: i32,
    pub r#type: String, // "Trace"
}

#[derive(Serialize)]
struct SupabasePayload {
    job_id: String,
    trace_data: Value, // Array of TraceEvents
}

pub async fn upload_trace(job_id: &str, trace_events: Vec<Value>) -> Result<String, String> {
    let client = Client::new();
    
    let supabase_url = env::var("VITE_SUPABASE_URL")
        .or_else(|_| env::var("SUPABASE_URL"))
        .map_err(|_| "Supabase URL not configured".to_string())?;
        
    let supabase_key = env::var("VITE_SUPABASE_ANON_KEY")
        .or_else(|_| env::var("SUPABASE_ANON_KEY"))
        .map_err(|_| "Supabase Key not configured".to_string())?;
    
    let url = format!("{}/rest/v1/execution_traces", supabase_url);
    
    let trace_json = serde_json::to_value(trace_events).map_err(|e| e.to_string())?;
    
    let payload = SupabasePayload {
        job_id: job_id.to_string(),
        trace_data: trace_json,
    };
    
    let res = client
        .post(&url)
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=minimal")
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;
        
    if res.status().is_success() {
        Ok(format!("Trace uploaded for job {}", job_id))
    } else {
        Err(format!("Supabase upload failed: {:?}", res.text().await))
    }
}
