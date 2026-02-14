const std = @import("std");

pub const Config = struct {
    // Window settings
    window: WindowConfig = .{},
    // Font settings
    font: FontConfig = .{},
    // Theme reference or inline colors
    theme: ThemeConfig = .{},

    pub fn load(allocator: std.mem.Allocator, path: []const u8) !Config {
        const file = try std.fs.cwd().openFile(path, .{});
        defer file.close();

        const stat = try file.stat();
        const content = try allocator.alloc(u8, stat.size);
        defer allocator.free(content);

        _ = try file.readAll(content);
        return TomlParser.parse(allocator, content);
    }

    pub fn loadFromString(allocator: std.mem.Allocator, content: []const u8) !Config {
        return TomlParser.parse(allocator, content);
    }
};

pub const WindowConfig = struct {
    columns: u32 = 80,
    rows: u32 = 24,
    padding_x: u32 = 10,
    padding_y: u32 = 10,
    decorations: Decorations = .native,
    opacity: f32 = 1.0,

    pub const Decorations = enum { native, transparent, buttonless };
};

pub const FontConfig = struct {
    family: []const u8 = "JetBrains Mono",
    size: f32 = 14.0,
    bold_family: ?[]const u8 = null,
    italic_family: ?[]const u8 = null,
    ligatures: bool = true,
};

pub const ThemeConfig = struct {
    name: ?[]const u8 = null,  // Reference to theme file
    colors: ?Colors = null,    // Inline colors

    pub const Colors = struct {
        background: u32 = 0xFF1E1E2E,
        foreground: u32 = 0xFFCDD6F4,
        cursor: u32 = 0xFFF5E0DC,
        selection: u32 = 0xFF45475A,

        // ANSI 16 colors
        black: u32 = 0xFF45475A,
        red: u32 = 0xFFF38BA8,
        green: u32 = 0xFFA6E3A1,
        yellow: u32 = 0xFFF9E2AF,
        blue: u32 = 0xFF89B4FA,
        magenta: u32 = 0xFFF5C2E7,
        cyan: u32 = 0xFF94E2D5,
        white: u32 = 0xFFBAC2DE,

        bright_black: u32 = 0xFF585B70,
        bright_red: u32 = 0xFFF38BA8,
        bright_green: u32 = 0xFFA6E3A1,
        bright_yellow: u32 = 0xFFF9E2AF,
        bright_blue: u32 = 0xFF89B4FA,
        bright_magenta: u32 = 0xFFF5C2E7,
        bright_cyan: u32 = 0xFF94E2D5,
        bright_white: u32 = 0xFFA6ADC8,
    };
};

// TOML Parser
pub const TomlParser = struct {
    allocator: std.mem.Allocator,
    content: []const u8,
    pos: usize = 0,
    current_section: []const u8 = "",

    pub fn parse(allocator: std.mem.Allocator, content: []const u8) !Config {
        var parser = TomlParser{ .allocator = allocator, .content = content };
        return parser.parseConfig();
    }

    fn parseConfig(self: *TomlParser) !Config {
        var config = Config{};

        while (self.pos < self.content.len) {
            self.skipWhitespace();
            if (self.pos >= self.content.len) break;

            const c = self.content[self.pos];
            if (c == '#') {
                self.skipLine();
            } else if (c == '[') {
                self.current_section = try self.parseSection();
            } else if (c == '\n' or c == '\r') {
                self.pos += 1;
            } else {
                const kv = try self.parseKeyValue();
                try self.applyKeyValue(&config, kv);
            }
        }

        return config;
    }

    fn skipWhitespace(self: *TomlParser) void {
        while (self.pos < self.content.len) {
            const c = self.content[self.pos];
            if (c == ' ' or c == '\t' or c == '\r' or c == '\n') {
                self.pos += 1;
            } else {
                break;
            }
        }
    }

    fn skipLine(self: *TomlParser) void {
        while (self.pos < self.content.len) {
            if (self.content[self.pos] == '\n') {
                self.pos += 1;
                break;
            }
            self.pos += 1;
        }
    }

    fn parseSection(self: *TomlParser) ![]const u8 {
        self.pos += 1; // Skip '['
        const start = self.pos;
        while (self.pos < self.content.len and self.content[self.pos] != ']') {
            self.pos += 1;
        }
        if (self.pos >= self.content.len) return error.InvalidSection;
        const section = self.content[start..self.pos];
        self.pos += 1; // Skip ']'
        return std.mem.trim(u8, section, " \t");
    }

    const KeyValue = struct {
        key: []const u8,
        value: []const u8,
    };

    fn parseKeyValue(self: *TomlParser) !KeyValue {
        const start_key = self.pos;
        while (self.pos < self.content.len and self.content[self.pos] != '=') {
            if (self.content[self.pos] == '\n') return error.InvalidKeyValue;
            self.pos += 1;
        }
        if (self.pos >= self.content.len) return error.InvalidKeyValue;

        const key = std.mem.trim(u8, self.content[start_key..self.pos], " \t");
        self.pos += 1; // Skip '='

        // Skip whitespace after =
        while (self.pos < self.content.len and (self.content[self.pos] == ' ' or self.content[self.pos] == '\t')) {
            self.pos += 1;
        }

        const start_val = self.pos;
        // Basic value parsing (to end of line or comment)
        while (self.pos < self.content.len) {
            const c = self.content[self.pos];
            if (c == '\n' or c == '#') break;
            self.pos += 1;
        }
        
        var value = std.mem.trim(u8, self.content[start_val..self.pos], " \t\r");
        
        // Remove quotes if present
        if (value.len >= 2 and value[0] == '"' and value[value.len-1] == '"') {
            value = value[1..value.len-1];
        }

        return KeyValue{ .key = key, .value = value };
    }

    fn applyKeyValue(self: *TomlParser, config: *Config, kv: KeyValue) !void {
        if (std.mem.eql(u8, self.current_section, "window")) {
            if (std.mem.eql(u8, kv.key, "columns")) config.window.columns = try std.fmt.parseInt(u32, kv.value, 10);
            if (std.mem.eql(u8, kv.key, "rows")) config.window.rows = try std.fmt.parseInt(u32, kv.value, 10);
            if (std.mem.eql(u8, kv.key, "padding_x")) config.window.padding_x = try std.fmt.parseInt(u32, kv.value, 10);
            if (std.mem.eql(u8, kv.key, "padding_y")) config.window.padding_y = try std.fmt.parseInt(u32, kv.value, 10);
            if (std.mem.eql(u8, kv.key, "opacity")) config.window.opacity = try std.fmt.parseFloat(f32, kv.value);
            if (std.mem.eql(u8, kv.key, "decorations")) {
                 if (std.mem.eql(u8, kv.value, "transparent")) config.window.decorations = .transparent;
                 if (std.mem.eql(u8, kv.value, "buttonless")) config.window.decorations = .buttonless;
                 if (std.mem.eql(u8, kv.value, "native")) config.window.decorations = .native;
            }
        } else if (std.mem.eql(u8, self.current_section, "font")) {
            if (std.mem.eql(u8, kv.key, "family")) config.font.family = kv.value; // Note: lifetime is bound to input
            if (std.mem.eql(u8, kv.key, "size")) config.font.size = try std.fmt.parseFloat(f32, kv.value);
            if (std.mem.eql(u8, kv.key, "ligatures")) config.font.ligatures = std.mem.eql(u8, kv.value, "true");
        } else if (std.mem.eql(u8, self.current_section, "theme")) {
            if (std.mem.eql(u8, kv.key, "name")) config.theme.name = kv.value;
        }
    }
};

// Parse hex color "#RRGGBB" or "#AARRGGBB"
pub fn parseHexColor(hex: []const u8) !u32 {
    if (hex.len == 0 or hex[0] != '#') return error.InvalidColor;

    const digits = hex[1..];
    if (digits.len == 6) {
        const rgb = try std.fmt.parseInt(u24, digits, 16);
        return 0xFF000000 | @as(u32, rgb);
    } else if (digits.len == 8) {
        return try std.fmt.parseInt(u32, digits, 16);
    }
    return error.InvalidColor;
}
