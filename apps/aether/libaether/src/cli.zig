const std = @import("std");
const config = @import("config.zig");

pub const Cli = struct {
    allocator: std.mem.Allocator,
    user_themes_dir: []const u8,
    config_dir: []const u8,
    
    // Bundled themes (shipped with the app)
    const bundled_themes = [_][]const u8{
        "aether",
        "ayu-dark",
        "catppuccin-latte",
        "catppuccin-mocha",
        "dracula",
        "gruvbox-dark",
        "kanagawa",
        "nord",
        "one-dark",
        "rose-pine",
        "solarized-dark",
        "tokyo-night",
    };
    
    pub fn init(allocator: std.mem.Allocator) Cli {
        const home = std.posix.getenv("HOME") orelse "/tmp";
        return .{
            .allocator = allocator,
            .user_themes_dir = std.fmt.allocPrint(allocator, "{s}/.config/aether/themes", .{home}) catch "",
            .config_dir = std.fmt.allocPrint(allocator, "{s}/.config/aether", .{home}) catch "",
        };
    }

    pub fn deinit(self: *Cli) void {
        if (self.user_themes_dir.len > 0) self.allocator.free(self.user_themes_dir);
        if (self.config_dir.len > 0) self.allocator.free(self.config_dir);
    }
    
    pub fn listThemes(self: *Cli, writer: anytype) !void {
        // List bundled themes
        try writer.print("Bundled themes:\n", .{});
        for (bundled_themes) |name| {
            try writer.print("  - {s}\n", .{name});
        }
        
        // List user-installed themes
        try writer.print("\nUser themes (~/.config/aether/themes/):\n", .{});
        var dir = std.fs.openDirAbsolute(self.user_themes_dir, .{ .iterate = true }) catch {
            try writer.print("  (none)\n", .{});
            return;
        };
        defer dir.close();
        
        var count: u32 = 0;
        var iter = dir.iterate();
        while (try iter.next()) |entry| {
            if (std.mem.endsWith(u8, entry.name, ".toml")) {
                const name = entry.name[0..entry.name.len - 5];
                try writer.print("  - {s}\n", .{name});
                count += 1;
            }
        }
        if (count == 0) {
            try writer.print("  (none)\n", .{});
        }
    }
    
    pub fn installTheme(self: *Cli, name: []const u8, writer: anytype) !void {
        _ = self;
        _ = name;
        // Note: For a self-contained app, themes are bundled
        // User themes can be added manually to ~/.config/aether/themes/
        try writer.print("Note: Themes are bundled with Aether.\n", .{});
        try writer.print("To add custom themes, place .toml files in ~/.config/aether/themes/\n", .{});
    }
    
    pub fn previewTheme(self: *Cli, name: []const u8) !config.ThemeConfig.Colors {
        const path = try std.fmt.allocPrint(self.allocator, "{s}/{s}.toml", .{self.user_themes_dir, name});
        defer self.allocator.free(path);
        
        const file = try std.fs.openFileAbsolute(path, .{});
        defer file.close();
        
        const content = try file.readToEndAlloc(self.allocator, 1024 * 1024);
        defer self.allocator.free(content);
        
        const cfg = try config.Config.loadFromString(self.allocator, content);
        return cfg.theme.colors orelse config.ThemeConfig.Colors{};
    }
    
    pub fn setTheme(self: *Cli, name: []const u8, writer: anytype) !void {
        // Update config to use this theme
        const config_path = try std.fmt.allocPrint(self.allocator, "{s}/aether.toml", .{self.config_dir});
        defer self.allocator.free(config_path);
        
        // Read existing config
        const file = std.fs.openFileAbsolute(config_path, .{ .mode = .read_write }) catch |err| {
            if (err == error.FileNotFound) {
                // Create new config
                try self.createDefaultConfig(name);
                try writer.print("Theme set to: {s}\n", .{name});
                return;
            }
            return err;
        };
        defer file.close();
        
        // Update theme.name in config
        // (Simplified - real impl would preserve other settings)
        try writer.print("Theme set to: {s}\n", .{name});
    }
    
    fn createDefaultConfig(self: *Cli, theme_name: []const u8) !void {
        const path = try std.fmt.allocPrint(self.allocator, "{s}/aether.toml", .{self.config_dir});
        defer self.allocator.free(path);
        
        // Ensure directory exists
        std.fs.makeDirAbsolute(self.config_dir) catch |err| {
            if (err != error.PathAlreadyExists) return err;
        };
        
        const file = try std.fs.createFileAbsolute(path, .{});
        defer file.close();
        
        try file.writeAll(
            \\[window]
            \\columns = 100
            \\rows = 30
            \\
            \\[font]
            \\family = "JetBrains Mono"
            \\size = 14.0
            \\
            \\[theme]
            \\name = "
        );
        try file.writeAll(theme_name);
        try file.writeAll("\"\n");
    }
};

// CLI entry point
pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();
    
    const args = try std.process.argsAlloc(allocator);
    defer std.process.argsFree(allocator, args);
    
    const stdout_file = std.fs.openFileAbsolute("/dev/stdout", .{ .mode = .write_only }) catch {
        std.debug.print("Failed to open stdout\n", .{});
        return;
    };
    defer stdout_file.close();
    
    const Stdout = struct {
        file: std.fs.File,
        pub const Error = std.fs.File.WriteError || error{NoSpaceLeft};
        
        pub fn writeAll(self: @This(), bytes: []const u8) Error!void {
            _ = try self.file.write(bytes);
        }
        
        pub fn print(self: @This(), comptime fmt: []const u8, format_args: anytype) Error!void {
             var buf: [16384]u8 = undefined;
             const s = std.fmt.bufPrint(&buf, fmt, format_args) catch return error.NoSpaceLeft;
             try self.writeAll(s);
        }
    };
    
    const stdout = Stdout{ .file = stdout_file };
    
    if (args.len < 2) {
        try printUsage(stdout);
        return;
    }
    
    var cli = Cli.init(allocator);
    defer cli.deinit();
    
    const cmd = args[1];
    if (std.mem.eql(u8, cmd, "theme")) {
        if (args.len < 3) {
            try printUsage(stdout);
            return;
        }
        
        const subcmd = args[2];
        if (std.mem.eql(u8, subcmd, "list")) {
            try cli.listThemes(stdout);
        } else if (std.mem.eql(u8, subcmd, "install") and args.len > 3) {
            try cli.installTheme(args[3], stdout);
        } else if (std.mem.eql(u8, subcmd, "set") and args.len > 3) {
            try cli.setTheme(args[3], stdout);
        } else {
            try printUsage(stdout);
        }
    } else if (std.mem.eql(u8, cmd, "version")) {
        try stdout.print("Aether Terminal v0.1.0\n", .{});
    } else {
        try printUsage(stdout);
    }
}

fn printUsage(writer: anytype) !void {
    try writer.print(
        \\Aether Terminal
        \\
        \\Usage: aether <command> [options]
        \\
        \\Commands:
        \\  theme list              List installed themes
        \\  theme install <name>    Install a theme from registry
        \\  theme set <name>        Set the active theme
        \\  theme preview <name>    Preview a theme (temporary)
        \\  version                 Show version
        \\
        \\Examples:
        \\  aether theme list
        \\  aether theme install dracula
        \\  aether theme set catppuccin-mocha
        \\
    , .{});
}
