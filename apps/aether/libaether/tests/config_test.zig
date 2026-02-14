const std = @import("std");
const aether = @import("aether_lib");

test "parse hex color" {
    try std.testing.expectEqual(@as(u32, 0xFF1E1E2E), try aether.parseHexColor("#1e1e2e"));
    try std.testing.expectEqual(@as(u32, 0xFFCDD6F4), try aether.parseHexColor("#cdd6f4"));
    try std.testing.expectError(error.InvalidColor, aether.parseHexColor("invalid"));
}

test "parse simple config" {
    const toml =
        \\[window]
        \\columns = 120
        \\rows = 40
        \\
        \\[font]
        \\size = 16.0
    ;
    const cfg = try aether.TomlParser.parse(std.testing.allocator, toml);
    try std.testing.expectEqual(@as(u32, 120), cfg.window.columns);
    try std.testing.expectEqual(@as(u32, 40), cfg.window.rows);
    try std.testing.expectEqual(@as(f32, 16.0), cfg.font.size);
}
