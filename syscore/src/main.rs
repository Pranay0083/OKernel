mod docker;
mod server;
mod profiler;

use axum::{
    routing::{get, post},
    Router,
};
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use crate::docker::manager::ContainerManager;
use crate::server::routes::execute_handler;
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

    // Build application with routes
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/execute", post(execute_handler))
        .route("/ws/stream", get(websocket_handler))
        .layer(
            tower_http::cors::CorsLayer::new()
                .allow_origin(tower_http::cors::Any)
                .allow_methods(tower_http::cors::Any)
                .allow_headers(tower_http::cors::Any),
        )
        .with_state(container_manager);

    // Address to listen on
    let addr = SocketAddr::from(([127, 0, 0, 1], 3001));
    tracing::info!("Listening on {}", addr);

    // Start server
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> &'static str {
    "SysCore Backend: ONLINE"
}
