use bollard::Docker;
use bollard::container::{Config, CreateContainerOptions};
use bollard::models::HostConfig;
use bollard::exec::{CreateExecOptions, StartExecResults};
use futures::StreamExt;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{Mutex, broadcast};
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub enum Language {
    Python,
    Cpp,
}

impl Language {
    fn image_name(&self) -> &str {
        match self {
            Language::Python => "okernel/python-runner",
            Language::Cpp => "okernel/cpp-runner",
        }
    }
}

#[derive(Clone)]
pub struct ContainerManager {
    docker: Docker,
    // Map of Language -> ContainerID
    active_containers: Arc<Mutex<HashMap<Language, String>>>,
    // Map of JobID -> Broadcast Sender
    job_channels: Arc<Mutex<HashMap<String, broadcast::Sender<String>>>>,
}

impl ContainerManager {
    pub fn new() -> Result<Self, bollard::errors::Error> {
        let docker = Docker::connect_with_local_defaults()?;
        Ok(Self {
            docker,
            active_containers: Arc::new(Mutex::new(HashMap::new())),
            job_channels: Arc::new(Mutex::new(HashMap::new())),
        })
    }
    
    pub async fn subscribe(&self, job_id: &str) -> Option<broadcast::Receiver<String>> {
        let channels = self.job_channels.lock().await;
        channels.get(job_id).map(|sender| sender.subscribe())
    }

    /// Spawns a runner container for a specific language if one isn't already running
    pub async fn ensure_runner(&self, lang: Language) -> Result<String, String> {
        let mut active = self.active_containers.lock().await;

        // Check if we already have a live container for this language
        if let Some(id) = active.get(&lang) {
            // Ping container to ensure it's still alive
            match self.docker.inspect_container(id, None).await {
                Ok(info) => {
                    if let Some(state) = info.state {
                        if state.running.unwrap_or(false) {
                            return Ok(id.clone());
                        }
                    }
                },
                Err(_) => {
                    tracing::warn!("Container {} ({:?}) found in state but not reachable, removing.", id, lang);
                }
            }
            // If we are here, container is dead or invalid
            active.remove(&lang);
        }

        // Check if we need to build the image (simplistic check: just try to create, if fail with 404, build)
        // Actually, let's just verify if the image exists
        /* 
        if self.docker.inspect_image(lang.image_name()).await.is_err() {
            tracing::info!("Image {} not found, building...", lang.image_name());
            self.build_image(lang.clone()).await?;
        }
        */

        // Spawn new container
        tracing::info!("Spawning new runner for {:?}", lang);
        
        // Define host config (security limits would go here)
        let host_config = HostConfig {
            memory: Some(256 * 1024 * 1024), // 256 MB limit
            nano_cpus: Some(1_000_000_000), // 1 CPU
            network_mode: Some("none".to_string()), // No network
            ..Default::default()
        };

        let config = Config {
            image: Some(lang.image_name()),
            attach_stdin: Some(true),
            attach_stdout: Some(true),
            attach_stderr: Some(true),
            open_stdin: Some(true),
            host_config: Some(host_config),
            ..Default::default()
        };

        let container_name = format!("okernel-{}-runner-{}", match lang {
            Language::Python => "py",
            Language::Cpp => "cpp",
        }, Uuid::new_v4().to_string().chars().take(8).collect::<String>());

        let id = self.docker.create_container(
            Some(CreateContainerOptions { 
                name: container_name.clone(),
                platform: None, 
            }),
            config,
        ).await.map_err(|e| format!("Failed to create container: {}", e))?.id;

        self.docker.start_container::<String>(&id, None).await
            .map_err(|e| format!("Failed to start container: {}", e))?;

        tracing::info!("Started runner {} ({})", id, container_name);
        
        active.insert(lang, id.clone());
        Ok(id)
    }

    /// Executes code in the runner container, collects full trace, uploads to Supabase
    /// Returns Job ID on success
    pub async fn execute(&self, lang: Language, code: String) -> Result<String, String> {
        // 1. Get container ID
        let id = self.ensure_runner(lang.clone()).await?;
        let job_id = Uuid::new_v4().to_string();

        // 2. Prepare command
        let cmd = match lang {
            Language::Python => crate::profiler::python::PythonProfiler::wrap_command(&code),
            Language::Cpp => crate::profiler::cpp::CppProfiler::wrap_command(&code),
        };
        
        // 3. Create exec instance
        let exec_config = CreateExecOptions {
            cmd: Some(cmd.iter().map(|s| s.as_str()).collect()),
            attach_stdout: Some(true),
            attach_stderr: Some(true),
            ..Default::default()
        };

        let exec_id = self.docker.create_exec(&id, exec_config).await
            .map_err(|e| format!("Failed to create exec: {}", e))?
            .id;

        // 4. Start exec and collect output
        let mut trace_events = Vec::new();
        // We'll also collect logs if we want to store them separately or just rely on the trace
        
        if let Ok(StartExecResults::Attached { mut output, .. }) = self.docker.start_exec(&exec_id, None).await {
            while let Some(msg) = output.next().await {
                if let Ok(log_output) = msg {
                    let log_str = log_output.to_string();
                    for line in log_str.split('\n') {
                        if line.is_empty() { continue; }
                        if line.contains("__SYSCORE_EVENT__") {
                            if let Some(json_str) = line.split("__SYSCORE_EVENT__").nth(1) {
                                if let Ok(event) = serde_json::from_str::<serde_json::Value>(json_str) {
                                    trace_events.push(event);
                                }
                            }
                        } else {
                            // Capture standard output
                            let log_event = serde_json::json!({
                                "type": "Stdout",
                                "content": line
                            });
                            trace_events.push(log_event);
                        }
                    }
                }
            }
        } else {
             return Err("Failed to attach to exec output".to_string());
        }

        if !trace_events.is_empty() {
            tracing::info!("Uploading {} events for job {}", trace_events.len(), job_id);
            if let Err(e) = crate::server::trace_store::upload_trace(&job_id, trace_events).await {
                tracing::error!("Failed to upload trace: {}", e);
                // We don't fail the request, but frontend won't find trace.
                return Err(format!("Trace upload failed: {}", e));
            }
        } else {
            tracing::warn!("No trace events collected for job {}", job_id);
        }
        
        Ok(job_id)
    }

    pub async fn build_image(&self, lang: Language) -> Result<(), String> {
        use bollard::image::BuildImageOptions;
        
        // Simple tar logic: rely on system 'tar' command for simplicity in this scaffold
        // In prod, use `tar` crate in-memory
        let path = match lang {
            Language::Python => "docker/python",
            Language::Cpp => "docker/cpp",
        };
        
        // Check if we are in syscore root or project root
        // Simplistic: if docker/ doesn't exist, try syscore/docker
        let path = if std::path::Path::new(path).exists() {
            path.to_string()
        } else {
            format!("syscore/{}", path)
        };
        
        let output = std::process::Command::new("tar")
            .arg("-czf")
            .arg("-")
            .arg("--disable-copyfile") // macOS specific: don't include ._ files
            .arg("--exclude=.DS_Store")
            .arg("--no-xattrs") // Added based on instruction
            .arg("-C")
            .arg(path)
            .arg(".")
            .output()
            .map_err(|e| format!("Tar execution failed: {}", e))?;
            
        if !output.status.success() {
            return Err(format!("Tar failed: {:?}", output.stderr));
        }
        
        let build_options = BuildImageOptions {
            t: lang.image_name(),
            ..Default::default()
        };
        
        let mut stream = self.docker.build_image(
            build_options, 
            None, 
            Some(output.stdout.into())
        );
        
        while let Some(msg) = stream.next().await {
            match msg {
                Ok(info) => {
                    if let Some(s) = info.stream {
                        tracing::debug!("Build: {}", s.trim());
                    }
                    if let Some(e) = info.error {
                        return Err(format!("Build failed: {}", e));
                    }
                },
                Err(e) => return Err(format!("Build stream error: {}", e)),
            }
        }
        
        Ok(())
    }
}
