# Theme Authoring Guide

This guide explains how to create and publish themes for Aether Terminal.

## Theme Structure

A theme is a TOML file with two sections:

### Metadata (Required)
```toml
[metadata]
name = "theme-name"           # Unique identifier (lowercase, hyphens)
author = "Your Name"
version = "1.0.0"             # Semver
description = "Brief description"
```

### Colors (Required)
```toml
[colors]
background = "#RRGGBB"        # Terminal background
foreground = "#RRGGBB"        # Default text color
cursor = "#RRGGBB"            # Cursor color
selection = "#RRGGBB"         # Selection highlight
```

### Palette (Required)
The 16 ANSI colors:
```toml
[palette]
black = "#RRGGBB"
red = "#RRGGBB"
green = "#RRGGBB"
yellow = "#RRGGBB"
blue = "#RRGGBB"
magenta = "#RRGGBB"
cyan = "#RRGGBB"
white = "#RRGGBB"
bright_black = "#RRGGBB"
bright_red = "#RRGGBB"
bright_green = "#RRGGBB"
bright_yellow = "#RRGGBB"
bright_blue = "#RRGGBB"
bright_magenta = "#RRGGBB"
bright_cyan = "#RRGGBB"
bright_white = "#RRGGBB"
```

## Color Format

Colors must be in hex format:
- 6-digit: `#RRGGBB` (opaque)
- 8-digit: `#AARRGGBB` (with alpha)

## Testing Your Theme

1. Save your theme to `~/.config/aether/themes/my-theme.toml`
2. Preview: `aether theme preview my-theme`
3. Apply: `aether theme set my-theme`

## Publishing to Registry

1. Fork https://github.com/aether-term/themes
2. Add your theme to `themes/`
3. Update `index.json`
4. Submit a Pull Request

### Quality Guidelines

- [ ] All 16 palette colors defined
- [ ] Sufficient contrast (4.5:1 minimum)
- [ ] Tested with common tools (vim, htop, git)
- [ ] No copyrighted assets
