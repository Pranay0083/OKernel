use crate::simulation::algos::get_scheduler;
use crate::simulation::types::{AlgorithmType, ProcessState, SimulationState};

pub fn next_tick(state: SimulationState) -> SimulationState {
    let current_time = state.current_time;
    let mut processes = state.processes;
    let mut ready_queue = state.ready_queue;
    let mut running_process_id = state.running_process_id;
    let mut completed_process_ids = state.completed_process_ids;
    let mut gantt_chart = state.gantt_chart;
    let algorithm = state.algorithm;
    let time_quantum = state.time_quantum;
    let mut quantum_remaining = state.quantum_remaining;

    // 1. ARRIVAL CHECK
    let mut newly_ready_processes = Vec::new();
    for p in processes.iter_mut() {
        if p.state == ProcessState::Waiting && p.arrival_time <= current_time {
            p.state = ProcessState::Ready;
            newly_ready_processes.push(p.id);
        }
    }

    // Add newly ready processes to the queue
    for id in newly_ready_processes {
        if !ready_queue.contains(&id) {
            ready_queue.push(id);
        }
    }

    // 2. CPU SCHEDULING (Context Switch / Preemption)
    let scheduler = get_scheduler(algorithm);

    if let Some(active_id) = running_process_id {
        if algorithm == AlgorithmType::RR {
            quantum_remaining -= 1;
            let current_proc = processes.iter().find(|p| p.id == active_id);
            if let Some(p) = current_proc {
                if scheduler.should_preempt(p, &ready_queue, &processes, quantum_remaining) {
                    if p.state != ProcessState::Completed {
                        ready_queue.push(active_id);
                        running_process_id = None;
                    }
                }
            }
        } else {
            let current_proc = processes.iter().find(|p| p.id == active_id);
            if let Some(p) = current_proc {
                if scheduler.should_preempt(p, &ready_queue, &processes, quantum_remaining) {
                    if !ready_queue.contains(&active_id) {
                        ready_queue.push(active_id);
                    }
                    running_process_id = None;
                }
            }
        }
    }

    // Selection Logic (If CPU Free)
    if running_process_id.is_none() && !ready_queue.is_empty() {
        if let Some(next_id) = scheduler.schedule(&ready_queue, &processes) {
            if let Some(pos) = ready_queue.iter().position(|&id| id == next_id) {
                ready_queue.remove(pos);
            }
            running_process_id = Some(next_id);

            if algorithm == AlgorithmType::RR {
                quantum_remaining = time_quantum - 1;
            }
        }
    }

    // 3. EXECUTION
    let mut active_id_to_null = false;
    let mut runner_id: Option<i32> = None;

    if let Some(active_id) = running_process_id {
        runner_id = Some(active_id);
        if let Some(p) = processes.iter_mut().find(|p| p.id == active_id) {
            let next_remaining = p.remaining_time - 1;
            if p.start_time.is_none() {
                p.start_time = Some(current_time);
            }

            if next_remaining <= 0 {
                // Completed
                let finish_time = current_time + 1;
                let tat = finish_time - p.arrival_time;
                let wt = tat - p.burst_time;

                p.state = ProcessState::Completed;
                p.remaining_time = 0;
                p.completion_time = Some(finish_time);
                p.turnaround_time = tat;
                p.waiting_time = wt;

                if !completed_process_ids.contains(&p.id) {
                    completed_process_ids.push(p.id);
                }
                active_id_to_null = true;
            } else {
                p.state = ProcessState::Running;
                p.remaining_time = next_remaining;
            }
        }
    }

    if active_id_to_null {
        running_process_id = None;
    }

    // Update other processes states
    for p in processes.iter_mut() {
        if running_process_id != Some(p.id) && ready_queue.contains(&p.id) {
            p.state = ProcessState::Ready;
        }
    }

    // 4. GANTT CHART UPDATE
    if let Some(rid) = runner_id {
        let mut appended = false;
        if let Some(last) = gantt_chart.last_mut() {
            if last.process_id == Some(rid) && last.end_time == current_time {
                last.end_time = current_time + 1;
                appended = true;
            }
        }
        if !appended {
            gantt_chart.push(crate::simulation::types::GanttBlock {
                process_id: Some(rid),
                start_time: current_time,
                end_time: current_time + 1,
            });
        }
    } else {
        // IDLE
        let has_pending = processes.iter().any(|p| p.state != ProcessState::Completed);
        if has_pending {
            let mut appended = false;
            if let Some(last) = gantt_chart.last_mut() {
                if last.process_id.is_none() && last.end_time == current_time {
                    last.end_time = current_time + 1;
                    appended = true;
                }
            }
            if !appended {
                gantt_chart.push(crate::simulation::types::GanttBlock {
                    process_id: None,
                    start_time: current_time,
                    end_time: current_time + 1,
                });
            }
        }
    }

    SimulationState {
        current_time: current_time + 1,
        processes,
        ready_queue,
        running_process_id,
        completed_process_ids,
        gantt_chart,
        algorithm,
        time_quantum,
        quantum_remaining,
        is_playing: state.is_playing,
        speed: state.speed,
    }
}
