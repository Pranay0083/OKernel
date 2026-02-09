mod docker;
mod server;
mod profiler;
mod simulation;
mod vm;

use axum::{
    routing::{get, post},
    Router,
};
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use crate::docker::manager::ContainerManager;
use crate::server::routes::{execute_handler, simulate_tick_handler, vm_malloc_handler, vm_write_handler, vm_reset_handler, vm_fs_handler};
use crate::server::websocket::websocket_handler;

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "syscore=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("SysCore Engine v2.0 initializing...");
    tracing::info!("CWD: {:?}", std::env::current_dir().ok());

    // Initialize Docker connection
    let container_manager = match ContainerManager::new() {
        Ok(cm) => {
            tracing::info!("Docker connection established");
            cm
        },
        Err(e) => {
            tracing::error!("Failed to connect to Docker: {}", e);
            std::process::exit(1);
        }
    };

    // Pre-flight check: Ensure Docker is actually running and usable
    if let Err(e) = container_manager.health_check().await {
        tracing::error!("CRITICAL: Docker health check failed. The execution engine cannot start.");
        tracing::error!("Reason: {}", e);
        tracing::error!("Please ensure Docker Desktop/Engine is running.");
        std::process::exit(1); 
    }

    // Build application with routes
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/execute", post(execute_handler))
        .route("/api/simulate/cpu/tick", post(simulate_tick_handler))
        .route("/api/vm/malloc", post(vm_malloc_handler))
        .route("/api/vm/write", post(vm_write_handler))
        .route("/api/vm/reset", post(vm_reset_handler))
        .route("/api/vm/fs/ls", post(vm_fs_handler))
        .route("/api/vm/fs/create", post(vm_fs_handler))
        .route("/ws/stream", get(websocket_handler))
        .layer(
            tower_http::cors::CorsLayer::new()
                .allow_origin([
                    "https://www.hackmist.tech".parse().unwrap(),
                    "https://hackmist.tech".parse().unwrap(),
                    "http://localhost:5173".parse().unwrap(),
                ])
                .allow_methods([
                    axum::http::Method::GET,
                    axum::http::Method::POST,
                    axum::http::Method::OPTIONS,
                ])
                .allow_headers([
                    axum::http::header::CONTENT_TYPE,
                    axum::http::header::AUTHORIZATION,
                ]),
        )
        .with_state(container_manager);

    // Address to listen on
    let addr = SocketAddr::from(([127, 0, 0, 1], 3001));
    tracing::info!("Listening on {}", addr);

    // Start server
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> String {
    let version = option_env!("SYSCORE_VERSION").unwrap_or("unknown");
    format!("SysCore Backend: ONLINE (Build: {})", version)
}
