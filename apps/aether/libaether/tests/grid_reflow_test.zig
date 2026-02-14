const std = @import("std");
const Grid = @import("libaether").Grid;
const Cell = @import("libaether").Cell;

test "Grid reflows text on resize" {
    const allocator = std.testing.allocator;
    
    // Create 4x10 grid with scrollback
    var grid = try Grid.init(allocator, 4, 10, 100);
    defer grid.deinit();
    
    // Fill first line with "1234567890"
    for (0..10) |i| {
        grid.putChar(@intCast('0' + i % 10));
    }
    
    // Fill second line with "ABCDE"
    grid.cursor_row = 1;
    grid.cursor_col = 0;
    for (0..5) |i| {
        grid.putChar(@intCast('A' + i));
    }
    
    // Resize to 5 cols (should wrap first line)
    // "12345"
    // "67890" (wrapped)
    // "ABCDE"
    try grid.resize(4, 5);
    
    try std.testing.expectEqual(@as(u32, 5), grid.cols);
    
    const row0 = grid.active[0];
    try std.testing.expectEqual(@as(u32, '0'), row0.cells[0].codepoint);
    try std.testing.expectEqual(@as(u32, '4'), row0.cells[4].codepoint);
    
    const row1 = grid.active[1];
    try std.testing.expectEqual(@as(u32, '5'), row1.cells[0].codepoint);
    try std.testing.expectEqual(@as(u32, '9'), row1.cells[4].codepoint);
    try std.testing.expect(!row1.wrapped);
    
    const row2 = grid.active[2];
    try std.testing.expectEqual(@as(u32, 'A'), row2.cells[0].codepoint);
    try std.testing.expectEqual(@as(u32, 'E'), row2.cells[4].codepoint);
}
