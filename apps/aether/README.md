# Aether Terminal

A high-performance, GPU-accelerated terminal emulator for macOS with a community-driven theme ecosystem.

## Features

- **Blazing Fast**: Metal-accelerated rendering with sub-16ms input latency
- **Beautiful**: 12+ built-in themes with TrueColor (24-bit) support
- **Customizable**: Hot-reloadable TOML configuration
- **Modern**: Full Unicode support, ligatures, and Kitty keyboard protocol
- **Native**: Built with Swift and feels right at home on macOS

## Installation

### Homebrew (Recommended)
```bash
brew install --cask aether-terminal
```

### From Source
```bash
# Build Zig core
cd libaether
zig build -Doptimize=ReleaseFast

# Build Swift app
cd ../AetherApp
swift build -c release
```

## Configuration

Configuration lives at `~/.config/aether/aether.toml`:

```toml
[window]
columns = 100
rows = 30
padding_x = 12
padding_y = 12
opacity = 0.95

[font]
family = "JetBrains Mono"
size = 14.0
ligatures = true

[theme]
name = "catppuccin-mocha"
```

## Themes

### Built-in Themes
- Catppuccin (Mocha, Latte)
- Dracula
- Nord
- Gruvbox Dark
- Tokyo Night
- Solarized Dark
- One Dark
- Ayu Dark
- Rosé Pine
- Kanagawa
- Aether (Signature)

### Installing Themes
```bash
aether theme list
aether theme install <name>
aether theme set <name>
```

### Creating Your Own Theme

Create a `.toml` file:

```toml
[metadata]
name = "my-theme"
author = "Your Name"
version = "1.0.0"

[colors]
background = "#1e1e2e"
foreground = "#cdd6f4"
cursor = "#f5e0dc"
selection = "#45475a"

[palette]
black = "#45475a"
red = "#f38ba8"
green = "#a6e3a1"
yellow = "#f9e2af"
blue = "#89b4fa"
magenta = "#f5c2e7"
cyan = "#94e2d5"
white = "#bac2de"
bright_black = "#585b70"
bright_red = "#f38ba8"
bright_green = "#a6e3a1"
bright_yellow = "#f9e2af"
bright_blue = "#89b4fa"
bright_magenta = "#f5c2e7"
bright_cyan = "#94e2d5"
bright_white = "#a6adc8"
```

Save to `~/.config/aether/themes/my-theme.toml` and activate with:
```bash
aether theme set my-theme
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd+N | New Window |
| Cmd+T | New Tab |
| Cmd+W | Close Tab |
| Cmd+, | Preferences |
| Cmd+K | Clear Screen |
| Cmd+Up | Previous Prompt |
| Cmd+Down | Next Prompt |
| Page Up/Down | Scroll History |

## Architecture

Aether uses a hybrid architecture for maximum performance:

- **Zig Core (libaether)**: Terminal emulation, ANSI parsing, grid management
- **Swift/Metal Frontend**: Native macOS UI with GPU-accelerated rendering
- **C-ABI Bridge**: Zero-overhead communication between Zig and Swift

### Performance Targets
- Input latency: < 16ms
- Frame rate: 60+ FPS
- Throughput: > 500MB/s
- Memory: < 50MB idle

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE)
