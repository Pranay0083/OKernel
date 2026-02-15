# Contributing to Aether

Thank you for your interest in contributing!

## Development Setup

### Prerequisites
- macOS 13.0+
- Zig 0.15+
- Swift 5.9+
- Xcode Command Line Tools

### Building
```bash
# Clone the repo
git clone https://github.com/aether-term/aether.git
cd aether/apps/aether

# Build Zig library
cd libaether
zig build

# Run tests
zig build test

# Build Swift app
cd ../AetherApp
swift build
```

## Code Style

### Zig
- Follow Zig style guide
- Use explicit error handling
- Document public functions

### Swift
- Follow Swift API Design Guidelines
- Use SwiftFormat for consistency
- Prefer value types

## Pull Requests

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit PR with clear description

## Issue Reports

Include:
- macOS version
- Aether version
- Steps to reproduce
- Expected vs actual behavior
