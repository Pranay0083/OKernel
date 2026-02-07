#!/bin/bash
# Keep container alive and waiting for input
# Simple read loop
while true; do
    read -r line
    # If using as an execution engine, we would parse 'line' as command/code
    # For now, just echo "Alive"
    echo "Container Alive: Received $line"
done
