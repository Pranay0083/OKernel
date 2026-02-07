FROM python:3.11-slim

# Install profiling tools
RUN apt-get update && apt-get install -y \
    strace \
    linux-perf \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Install Python profilers
RUN pip install py-spy memory_profiler

# Create non-root user
RUN useradd -m runner
USER runner
WORKDIR /home/runner

# Entrypoint that wraps execution with profiling
COPY entrypoint.sh /entrypoint.sh
COPY runner.py /runner.py
ENTRYPOINT ["/entrypoint.sh"]
