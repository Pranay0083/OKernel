use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ProcessState {
    Ready,
    Running,
    Completed,
    Waiting,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Process {
    pub id: i32,
    pub name: String,
    pub burst_time: i32,
    pub arrival_time: i32,
    pub priority: i32,
    pub remaining_time: i32,
    pub color: String,
    pub state: ProcessState,

    // Stats
    pub start_time: Option<i32>,
    pub completion_time: Option<i32>,
    pub waiting_time: i32,
    pub turnaround_time: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq)]
pub enum AlgorithmType {
    FCFS,
    SJF,
    SRTF,
    RR,
    PRIORITY,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GanttBlock {
    pub process_id: Option<i32>,
    pub start_time: i32,
    pub end_time: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SimulationState {
    pub current_time: i32,
    pub processes: Vec<Process>,
    pub ready_queue: Vec<i32>, // Process IDs
    pub running_process_id: Option<i32>,
    pub completed_process_ids: Vec<i32>,
    pub gantt_chart: Vec<GanttBlock>,

    // Control State
    pub algorithm: AlgorithmType,
    pub time_quantum: i32,
    pub quantum_remaining: i32, // For RR
    pub is_playing: bool,
    pub speed: i32,
}
