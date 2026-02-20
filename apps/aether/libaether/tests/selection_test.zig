const std = @import("std");
const Terminal = @import("libaether").Terminal;
const Cell = @import("libaether").Cell;

test "Selection: Simple word selection" {
    const allocator = std.testing.allocator;
    var term = try Terminal.init(allocator, 10, 20, 10000);
    defer term.deinit();

    try term.writeInput("Hello World");
    
    // Select "Hello" (cols 0-4)
    term.selection.active = true;
    term.selection.start_row = 0;
    term.selection.start_col = 0;
    term.selection.end_row = 0;
    term.selection.end_col = 4;

    const text = try term.getSelectionText(allocator);
    defer allocator.free(text);
    
    try std.testing.expectEqualStrings("Hello", text);
}

test "Selection: Multi-line hard newline" {
    const allocator = std.testing.allocator;
    var term = try Terminal.init(allocator, 10, 20, 10000);
    defer term.deinit();

    try term.writeInput("Line 1\r\nLine 2");
    
    // Select both lines
    term.selection.active = true;
    term.selection.start_row = 0;
    term.selection.start_col = 0;
    term.selection.end_row = 1;
    term.selection.end_col = 5; // "Line 2" len is 6 (0-5)

    const text = try term.getSelectionText(allocator);
    defer allocator.free(text);
    
    try std.testing.expectEqualStrings("Line 1\nLine 2", text);
}

test "Selection: Wrapped line (no newline)" {
    const allocator = std.testing.allocator;
    var term = try Terminal.init(allocator, 10, 5, 10000); // 5 cols wide
    defer term.deinit();

    // "123456789" -> "12345" (wrapped) / "6789 "
    try term.writeInput("123456789");
    
    // Select everything
    term.selection.active = true;
    term.selection.start_row = 0;
    term.selection.start_col = 0;
    term.selection.end_row = 1;
    term.selection.end_col = 3; 

    const text = try term.getSelectionText(allocator);
    defer allocator.free(text);
    
    // Should NOT have \n between 5 and 6
    try std.testing.expectEqualStrings("123456789", text);
}

test "Selection: Scrollback" {
    const allocator = std.testing.allocator;
    var term = try Terminal.init(allocator, 4, 10, 10000); // 4 rows
    defer term.deinit();

    // Fill screen and scroll
    // Row 0
    try term.writeInput("Row 0\r\n");
    try term.writeInput("Row 1\r\n");
    try term.writeInput("Row 2\r\n");
    try term.writeInput("Row 3\r\n");
    try term.writeInput("Row 4"); // This forces scroll. Row 0 goes to scrollback.

    // Active grid now has Row 1, 2, 3, 4.
    // Scrollback has Row 0.
    
    // Scroll view up to see history
    term.scrollView(-1); // Offset 1
    
    // Now visual row 0 should be "Row 0" (from scrollback)
    // Visual row 1 should be "Row 1" (from active[0])
    
    // Select "Row 0" (which is at stable index -1)
    term.selection.active = true;
    term.selection.start_row = -1;
    term.selection.start_col = 0;
    term.selection.end_row = -1;
    term.selection.end_col = 4;

    const text = try term.getSelectionText(allocator);
    defer allocator.free(text);
    
    try std.testing.expectEqualStrings("Row 0", text);
}

test "Selection: Reverse direction" {
    const allocator = std.testing.allocator;
    var term = try Terminal.init(allocator, 10, 20, 10000);
    defer term.deinit();

    try term.writeInput("Hello");
    
    term.selection.active = true;
    term.selection.start_row = 0;
    term.selection.start_col = 4; // 'o'
    term.selection.end_row = 0;
    term.selection.end_col = 0; // 'H'

    const text = try term.getSelectionText(allocator);
    defer allocator.free(text);
    
    try std.testing.expectEqualStrings("Hello", text);
}
