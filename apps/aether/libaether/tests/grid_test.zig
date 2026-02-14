const std = @import("std");
const Grid = @import("aether_lib").Grid;
const Cell = @import("aether_lib").Cell;
const allocator = std.testing.allocator;

test "Grid initialization" {
    var grid = try Grid.init(allocator, 24, 80, 100);
    defer grid.deinit();

    try std.testing.expectEqual(@as(u32, 24), grid.rows);
    try std.testing.expectEqual(@as(u32, 80), grid.cols);
    try std.testing.expectEqual(@as(u32, 100), grid.scrollback_capacity);
    try std.testing.expect(grid.active.len == 24);
    try std.testing.expect(grid.dirty);
}

test "Cell access and modification" {
    var grid = try Grid.init(allocator, 10, 10, 0);
    defer grid.deinit();

    const cell_ptr = grid.getCell(0, 0);
    try std.testing.expect(cell_ptr != null);
    
    if (cell_ptr) |cell| {
        cell.codepoint = 'X';
        cell.fg_color = 0x12345678;
        cell.flags.bold = true;
    }

    const const_cell = grid.getCellConst(0, 0);
    try std.testing.expect(const_cell != null);
    if (const_cell) |cell| {
        try std.testing.expectEqual(@as(u32, 'X'), cell.codepoint);
        try std.testing.expectEqual(@as(u32, 0x12345678), cell.fg_color);
        try std.testing.expect(cell.flags.bold);
    }
}

test "Cursor movement" {
    var grid = try Grid.init(allocator, 10, 10, 0);
    defer grid.deinit();

    grid.moveCursor(5, 5);
    try std.testing.expectEqual(@as(u32, 5), grid.cursor_row);
    try std.testing.expectEqual(@as(u32, 5), grid.cursor_col);

    grid.moveCursorRel(1, -1);
    try std.testing.expectEqual(@as(u32, 6), grid.cursor_row);
    try std.testing.expectEqual(@as(u32, 4), grid.cursor_col);
    
    // Bounds check
    grid.moveCursor(100, 100);
    try std.testing.expectEqual(@as(u32, 9), grid.cursor_row);
    try std.testing.expectEqual(@as(u32, 9), grid.cursor_col);
}

test "putChar advances cursor" {
    var grid = try Grid.init(allocator, 10, 10, 0);
    defer grid.deinit();

    grid.putChar('A');
    try std.testing.expectEqual(@as(u32, 0), grid.cursor_row);
    try std.testing.expectEqual(@as(u32, 1), grid.cursor_col);

    if (grid.getCellConst(0, 0)) |cell| {
        try std.testing.expectEqual(@as(u32, 'A'), cell.codepoint);
    }
    
    // Wrap around (Latent wrap: cursor stays at col=width until next write)
    grid.moveCursor(0, 9);
    grid.putChar('B');
    try std.testing.expectEqual(@as(u32, 0), grid.cursor_row);
    try std.testing.expectEqual(@as(u32, 10), grid.cursor_col);
    
    // Next char triggers wrap
    grid.putChar('C');
    try std.testing.expectEqual(@as(u32, 1), grid.cursor_row);
    try std.testing.expectEqual(@as(u32, 1), grid.cursor_col); // (1, 0) wrote C -> (1, 1)
}

test "Newline scrolls when at bottom" {
    var grid = try Grid.init(allocator, 2, 5, 10);
    defer grid.deinit();

    grid.putChar('1');
    grid.newLine(); 
    grid.carriageReturn(); // Reset col
    
    try std.testing.expectEqual(@as(u32, 1), grid.cursor_row);
    
    grid.putChar('2');
    grid.newLine(); // Scroll should happen here
    grid.carriageReturn();
    
    try std.testing.expectEqual(@as(u32, 1), grid.cursor_row); // Still at bottom
    
    // Check content was scrolled up
    if (grid.getCellConst(0, 0)) |cell| {
        try std.testing.expectEqual(@as(u32, '2'), cell.codepoint);
    }
}

test "Scrollback stores evicted rows" {
    var grid = try Grid.init(allocator, 2, 5, 5);
    defer grid.deinit();

    grid.putChar('A');
    grid.newLine();
    grid.carriageReturn();
    grid.putChar('B');
    grid.newLine(); 
    grid.carriageReturn(); // 'A' row pushed to scrollback
    
    try std.testing.expectEqual(@as(usize, 1), grid.scrollback.len);
    
    if (grid.scrollback.get(0)) |row| {
        try std.testing.expectEqual(@as(u32, 'A'), row.cells[0].codepoint);
    }
}

test "Resize preserves content" {
    var grid = try Grid.init(allocator, 2, 2, 0);
    defer grid.deinit();

    grid.putChar('A');
    grid.putChar('B');
    // 'B' causes wrap to (1,0) due to 2-col width
    // grid.newLine(); // Removed to avoid double newline
    // grid.carriageReturn();
    grid.putChar('C');
    grid.putChar('D');

    try grid.resize(3, 3);

    try std.testing.expectEqual(@as(u32, 3), grid.rows);
    try std.testing.expectEqual(@as(u32, 3), grid.cols);

    // Verify content preserved and reflowed
    // Original: A B (wrap)
    //           C D
    // New (3 cols): A B C (wrap)
    //               D
    if (grid.getCellConst(0, 0)) |c| try std.testing.expectEqual(@as(u32, 'A'), c.codepoint);
    if (grid.getCellConst(0, 1)) |c| try std.testing.expectEqual(@as(u32, 'B'), c.codepoint);
    if (grid.getCellConst(0, 2)) |c| try std.testing.expectEqual(@as(u32, 'C'), c.codepoint);
    if (grid.getCellConst(1, 0)) |c| try std.testing.expectEqual(@as(u32, 'D'), c.codepoint);
}
