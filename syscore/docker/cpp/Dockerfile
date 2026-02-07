FROM gcc:13-slim

# Install profiling tools
RUN apt-get update && apt-get install -y \
    strace \
    linux-perf \
    valgrind \
    gdb \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m runner
USER runner
WORKDIR /home/runner

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
