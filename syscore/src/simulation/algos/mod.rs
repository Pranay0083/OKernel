use crate::simulation::types::{AlgorithmType, Process};

pub trait Scheduler {
    fn schedule(&self, queue: &[i32], processes: &[Process]) -> Option<i32>;
    fn should_preempt(
        &self,
        current: &Process,
        queue: &[i32],
        processes: &[Process],
        quantum_remaining: i32,
    ) -> bool;
}

pub struct FCFSScheduler;
impl Scheduler for FCFSScheduler {
    fn schedule(&self, queue: &[i32], _processes: &[Process]) -> Option<i32> {
        queue.first().copied()
    }
    fn should_preempt(
        &self,
        _current: &Process,
        _queue: &[i32],
        _processes: &[Process],
        _quantum_remaining: i32,
    ) -> bool {
        false
    }
}

pub struct RRScheduler;
impl Scheduler for RRScheduler {
    fn schedule(&self, queue: &[i32], _processes: &[Process]) -> Option<i32> {
        queue.first().copied()
    }
    fn should_preempt(
        &self,
        _current: &Process,
        _queue: &[i32],
        _processes: &[Process],
        quantum_remaining: i32,
    ) -> bool {
        quantum_remaining < 0
    }
}

pub struct SJFScheduler;
impl Scheduler for SJFScheduler {
    fn schedule(&self, queue: &[i32], processes: &[Process]) -> Option<i32> {
        if queue.is_empty() {
            return None;
        }

        let mut best_id = queue[0];
        let mut min_remaining = i32::MAX;
        let mut min_arrival = i32::MAX;

        for &id in queue {
            if let Some(p) = processes.iter().find(|p| p.id == id) {
                if p.remaining_time < min_remaining {
                    min_remaining = p.remaining_time;
                    min_arrival = p.arrival_time;
                    best_id = id;
                } else if p.remaining_time == min_remaining && p.arrival_time < min_arrival {
                    min_arrival = p.arrival_time;
                    best_id = id;
                }
            }
        }
        Some(best_id)
    }
    fn should_preempt(
        &self,
        _current: &Process,
        _queue: &[i32],
        _processes: &[Process],
        _quantum_remaining: i32,
    ) -> bool {
        false
    }
}

pub struct SRTFScheduler;
impl Scheduler for SRTFScheduler {
    fn schedule(&self, queue: &[i32], processes: &[Process]) -> Option<i32> {
        if queue.is_empty() {
            return None;
        }

        let mut best_id = queue[0];
        let mut min_remaining = i32::MAX;
        let mut min_arrival = i32::MAX;

        for &id in queue {
            if let Some(p) = processes.iter().find(|p| p.id == id) {
                if p.remaining_time < min_remaining {
                    min_remaining = p.remaining_time;
                    min_arrival = p.arrival_time;
                    best_id = id;
                } else if p.remaining_time == min_remaining && p.arrival_time < min_arrival {
                    min_arrival = p.arrival_time;
                    best_id = id;
                }
            }
        }
        Some(best_id)
    }
    fn should_preempt(
        &self,
        current: &Process,
        queue: &[i32],
        processes: &[Process],
        _quantum_remaining: i32,
    ) -> bool {
        for &id in queue {
            if let Some(p) = processes.iter().find(|p| p.id == id) {
                if p.remaining_time < current.remaining_time {
                    return true;
                }
            }
        }
        false
    }
}

pub struct PriorityScheduler;
impl Scheduler for PriorityScheduler {
    fn schedule(&self, queue: &[i32], processes: &[Process]) -> Option<i32> {
        if queue.is_empty() {
            return None;
        }

        let mut best_id = queue[0];
        let mut min_priority = i32::MAX;
        let mut min_arrival = i32::MAX;

        for &id in queue {
            if let Some(p) = processes.iter().find(|p| p.id == id) {
                if p.priority < min_priority {
                    min_priority = p.priority;
                    min_arrival = p.arrival_time;
                    best_id = id;
                } else if p.priority == min_priority && p.arrival_time < min_arrival {
                    min_arrival = p.arrival_time;
                    best_id = id;
                }
            }
        }
        Some(best_id)
    }
    fn should_preempt(
        &self,
        current: &Process,
        queue: &[i32],
        processes: &[Process],
        _quantum_remaining: i32,
    ) -> bool {
        for &id in queue {
            if let Some(p) = processes.iter().find(|p| p.id == id) {
                if p.priority < current.priority {
                    return true;
                }
            }
        }
        false
    }
}

pub fn get_scheduler(algo: AlgorithmType) -> Box<dyn Scheduler> {
    match algo {
        AlgorithmType::FCFS => Box::new(FCFSScheduler),
        AlgorithmType::RR => Box::new(RRScheduler),
        AlgorithmType::SJF => Box::new(SJFScheduler),
        AlgorithmType::SRTF => Box::new(SRTFScheduler),
        AlgorithmType::PRIORITY => Box::new(PriorityScheduler),
    }
}
