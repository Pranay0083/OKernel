FROM python:3.11-slim

# Install profiling tools
RUN apt-get update && apt-get install -y \
    strace \
    linux-perf \
    valgrind \
    gdb \
    g++ \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m runner
USER runner
WORKDIR /home/runner

COPY entrypoint.sh /entrypoint.sh
COPY runner.py /runner.py
ENTRYPOINT ["/entrypoint.sh"]
