const std = @import("std");
const Grid = @import("libaether").Grid;

test "Grid scrollback ring buffer" {
    const allocator = std.testing.allocator;
    var grid = try Grid.init(allocator, 2, 5, 2); // 2 rows, 2 scrollback
    defer grid.deinit();

    // Fill row 0 with 'A'
    for (0..5) |_| grid.putChar('A');
    grid.newLine();
    grid.carriageReturn();
    
    // Fill row 1 with 'B'
    for (0..5) |_| grid.putChar('B');
    grid.newLine(); // 'A' should go to scrollback
    grid.carriageReturn();
    
    // Check scrollback
    // Only 1 scroll should have happened (when filling B and calling newLine)
    // Wait, Filling 'A' -> cursor at (0, 5). newLine -> (1, 5). CR -> (1, 0).
    // Filling 'B' -> cursor at (1, 5). newLine -> (2, 5) -> Scroll! -> (1, 5).
    
    try std.testing.expectEqual(@as(usize, 1), grid.scrollback.len);
    
    const sb_row = grid.getScrollbackRow(0);
    try std.testing.expect(sb_row != null);
    try std.testing.expectEqual(@as(u32, 'A'), sb_row.?.cells[0].codepoint);

    
    // Add another line 'C'
    for (0..5) |_| grid.putChar('C');
    grid.newLine(); // 'B' should go to scrollback
    grid.carriageReturn();
    
    // Scrollback: 0='B', 1='A'
    const sb_row0 = grid.getScrollbackRow(0);
    try std.testing.expectEqual(@as(u32, 'B'), sb_row0.?.cells[0].codepoint);
    
    const sb_row1 = grid.getScrollbackRow(1);
    try std.testing.expectEqual(@as(u32, 'A'), sb_row1.?.cells[0].codepoint);
    
    // Add 'D', should evict 'A'
    for (0..5) |_| grid.putChar('D');
    grid.newLine();
    grid.carriageReturn();
    
    // Scrollback: 0='C', 1='B'. 'A' is gone.
    const sb_row2 = grid.getScrollbackRow(1); // Oldest
    try std.testing.expectEqual(@as(u32, 'B'), sb_row2.?.cells[0].codepoint);
    
    try std.testing.expect(grid.getScrollbackRow(2) == null);
}
