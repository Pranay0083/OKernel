const std = @import("std");
const Terminal = @import("aether_lib").Terminal;
const Grid = @import("aether_lib").Grid;

test "Terminal initialization" {
    var term = try Terminal.init(std.testing.allocator, 24, 80);
    defer term.deinit();

    try std.testing.expectEqual(@as(u32, 24), term.grid.rows);
    try std.testing.expectEqual(@as(u32, 80), term.grid.cols);
    try std.testing.expectEqual(@as(u32, 0), term.cursor_row);
    try std.testing.expectEqual(@as(u32, 0), term.cursor_col);
}

test "Write characters" {
    var term = try Terminal.init(std.testing.allocator, 24, 80);
    defer term.deinit();

    term.putChar('A');
    term.putChar('B');
    term.putChar('C');

    try std.testing.expectEqual(@as(u32, 0), term.cursor_row);
    try std.testing.expectEqual(@as(u32, 3), term.cursor_col);

    if (term.grid.getCell(0, 0)) |cell| {
        try std.testing.expectEqual(@as(u32, 'A'), cell.codepoint);
    }
    if (term.grid.getCell(0, 1)) |cell| {
        try std.testing.expectEqual(@as(u32, 'B'), cell.codepoint);
    }
}

test "Newline behavior" {
    var term = try Terminal.init(std.testing.allocator, 24, 80);
    defer term.deinit();

    term.putChar('A');
    term.execute(0x0A); // LF

    try std.testing.expectEqual(@as(u32, 1), term.cursor_row);
    // LF doesn't reset col unless line_feed_mode is set, or implicit CR?
    // Unix LF usually just goes down. CR goes to 0.
    // My implementation of LF:
    // fn newLine(self: *Terminal) void {
    //    self.cursor_row += 1;
    //    ...
    //    if (self.mode.line_feed_mode) { self.cursor_col = 0; }
    // }
    // Default mode is false. So col should be 1.
    try std.testing.expectEqual(@as(u32, 1), term.cursor_col);

    term.execute(0x0D); // CR
    try std.testing.expectEqual(@as(u32, 0), term.cursor_col);
}

test "Scrolling behavior" {
    var term = try Terminal.init(std.testing.allocator, 2, 5); // 2 rows
    defer term.deinit();

    // Row 0
    term.putChar('1'); 
    term.execute(0x0A); // Row 1
    term.execute(0x0D);
    
    // Row 1
    term.putChar('2');
    term.execute(0x0A); // Scroll! cursor stays at Row 1, content moves up
    term.execute(0x0D);

    try std.testing.expectEqual(@as(u32, 1), term.cursor_row);
    
    // Check Row 0 (should be '2')
    if (term.grid.getCell(0, 0)) |cell| {
        try std.testing.expectEqual(@as(u32, '2'), cell.codepoint);
    }
    // Check Row 1 (should be empty/new)
    if (term.grid.getCell(1, 0)) |cell| {
        try std.testing.expectEqual(@as(u32, ' '), cell.codepoint);
    }
}

test "Resize" {
    var term = try Terminal.init(std.testing.allocator, 5, 5);
    defer term.deinit();

    term.putChar('X');
    try term.resize(10, 10);

    try std.testing.expectEqual(@as(u32, 10), term.grid.rows);
    try std.testing.expectEqual(@as(u32, 10), term.grid.cols);
    
    // Check if content preserved
    if (term.grid.getCell(0, 0)) |cell| {
        try std.testing.expectEqual(@as(u32, 'X'), cell.codepoint);
    }
}
