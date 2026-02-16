const std = @import("std");
const Grid = @import("grid.zig").Grid;
const Cell = @import("grid.zig").Cell;
const Row = @import("grid.zig").Row;
const CellFlags = @import("grid.zig").CellFlags;
const Pty = @import("pty.zig").Pty;
const Parser = @import("parser.zig").Parser;

// Callback function pointers (set by host application)
pub var cb_set_title: ?*const fn ([*]const u8, usize) callconv(.c) void = null;
pub var cb_set_clipboard: ?*const fn ([*]const u8, usize) callconv(.c) void = null;
pub var cb_get_clipboard: ?*const fn () callconv(.c) ?[*:0]const u8 = null;

pub const Selection = struct {
    start_row: u32 = 0,
    start_col: u32 = 0,
    end_row: u32 = 0,
    end_col: u32 = 0,
    active: bool = false,

    pub fn contains(self: Selection, row: u32, col: u32) bool {
        if (!self.active) return false;
        // Normalize selection direction
        var min_row = self.start_row;
        var max_row = self.end_row;
        var min_col = self.start_col;
        var max_col = self.end_col;

        if (min_row > max_row) {
            std.mem.swap(u32, &min_row, &max_row);
            std.mem.swap(u32, &min_col, &max_col);
        } else if (min_row == max_row and min_col > max_col) {
             std.mem.swap(u32, &min_col, &max_col);
        }
        
        // However, if rows differ, cols logic is different per row.
        // Start: (min_row, min_col)
        // End: (max_row, max_col) (Assuming normalized)
        
        // Wait, standard normalization:
        // Selection is from (r1, c1) to (r2, c2).
        // If r1 < r2: ok.
        // If r1 > r2: swap.
        // If r1 == r2: ensure c1 <= c2.
        
        // My swap logic above swaps points entirely.
        
        if (row < min_row or row > max_row) return false;
        
        if (min_row == max_row) {
            return col >= min_col and col <= max_col;
        }
        
        if (row == min_row) {
            return col >= min_col;
        } else if (row == max_row) {
             // Use original end_col if we swapped?
             // If we swapped points, max_col is the col of the bottom-most point.
             return col <= max_col;
        }
        return true;
    }
    
    // getText implementation requires iterating grid cells
    // Since Selection is decoupled from Grid in this struct, we pass Grid.
    // However, Grid type is in grid.zig. Circular dep?
    // terminal.zig imports Grid. So it's fine.
    
    // Note: I can't put implementation here easily if it depends on Grid methods that are complex.
    // But Grid is available.
};

pub const MouseTrackingMode = enum(u8) {
    none = 0,
    x10 = 1,    // 1000
    drag = 2,   // 1002
    motion = 3, // 1003
};

pub const MouseEncoding = enum(u8) {
    default = 0,
    utf8 = 1,
    sgr = 2,    // 1006
};

pub const TerminalMode = packed struct {
    cursor_visible: bool = true,
    auto_wrap: bool = true,
    insert_mode: bool = false,
    origin_mode: bool = false,
    line_feed_mode: bool = false,
    bracketed_paste: bool = false,
    focus_reporting: bool = false,
    application_cursor_keys: bool = false,
    mouse_tracking: MouseTrackingMode = .none,
    mouse_encoding: MouseEncoding = .default,
    _padding: u16 = 0, // Adjusted for alignment
};

pub const CursorStyle = enum(u8) {
    block = 0,
    underline = 1,
    bar = 2,
};

pub const SavedCursor = struct {
    row: u32,
    col: u32,
    fg: u32,
    bg: u32,
    flags: CellFlags,
    origin_mode: bool,
};

pub const Cursor = struct {
    row: u32,
    col: u32,
    visible: bool,
    style: CursorStyle,
};

pub const Terminal = struct {
    allocator: std.mem.Allocator,
    grid: Grid,
    pty: ?Pty,
    parser: Parser,

    cursor_row: u32 = 0,
    cursor_col: u32 = 0,
    cursor_style: CursorStyle = .block,

    current_fg: u32 = 0xFFFFFFFF,
    current_bg: u32 = 0xFF000000,
    default_fg: u32 = 0xFFFFFFFF,
    default_bg: u32 = 0xFF000000,
    current_flags: CellFlags = .{},
    
    mode: TerminalMode = .{},
    
    saved_cursor: ?SavedCursor = null,
    
    // Scrolling region (0-indexed, inclusive of top, exclusive of bottom?)
    // Usually top and bottom margin.
    scroll_top: u32 = 0,
    scroll_bottom: u32 = 0,
    
    // Viewport scroll offset (0 = at bottom, >0 = lines up into history)
    scroll_offset: u32 = 0,
    
    selection: Selection = .{},
    
    // Alt Buffer state
    inactive_grid: Grid,
    is_alt_buffer: bool = false,

    tab_stops: std.DynamicBitSet,
    
    dirty: bool = false,

    pub fn scrollView(self: *Terminal, delta: i32) void {
        if (delta < 0) {
            // Scroll up (into history)
            const up = @as(u32, @intCast(-delta));
            self.scroll_offset = @min(self.scroll_offset + up, @as(u32, @intCast(self.grid.scrollback.len)));
        } else {
            // Scroll down (toward bottom)
            const down = @as(u32, @intCast(delta));
            self.scroll_offset = self.scroll_offset -| down;
        }
        self.dirty = true;
    }
    
    pub fn scrollToBottom(self: *Terminal) void {
        self.scroll_offset = 0;
        self.dirty = true;
    }

    pub fn scrollTo(self: *Terminal, offset: u32) void {
        self.scroll_offset = @min(offset, @as(u32, @intCast(self.grid.scrollback.len)));
        self.dirty = true;
    }
    

    pub fn getRenderCell(self: *const Terminal, row: u32, col: u32) ?*const Cell {
        if (self.getRenderRow(row)) |r| {
            if (col < r.cells.len) return &r.cells[col];
        }
        return null;
    }

    pub fn getRenderRow(self: *const Terminal, row: u32) ?*const Row {
        if (self.scroll_offset == 0) {
            if (row >= self.grid.rows) return null;
            return &self.grid.active[row];
        }
        
        // Logic:
        // Visual Row 0 is at scroll_offset distance "back" in history/active buffer.
        // scroll_offset = 1 -> Visual 0 is Scrollback[last], Visual 1 is Active[0].
        // If scroll_offset > row: It's in scrollback.
        
        if (self.scroll_offset > row) {
             const sb_idx = self.scroll_offset - 1 - row;
             return self.grid.getScrollbackRow(sb_idx);
        } else {
            const active_row = row - self.scroll_offset;
            if (active_row >= self.grid.rows) return null;
            return &self.grid.active[active_row];
        }
    }

    pub fn getSelectionText(self: *Terminal, allocator: std.mem.Allocator) ![]u8 {
        if (!self.selection.active) return try allocator.alloc(u8, 0);

        var list = std.ArrayList(u8){};
        defer list.deinit(allocator);

        // Normalize
        var r1 = self.selection.start_row;
        var c1 = self.selection.start_col;
        var r2 = self.selection.end_row;
        var c2 = self.selection.end_col;

        if (r1 > r2 or (r1 == r2 and c1 > c2)) {
            std.mem.swap(u32, &r1, &r2);
            std.mem.swap(u32, &c1, &c2);
        }

        var r = r1;
        while (r <= r2) : (r += 1) {
             const row_ptr = self.getRenderRow(r) orelse break;
             
             const start_col = if (r == r1) c1 else 0;
             const end_col = if (r == r2) c2 else self.grid.cols - 1;
             
             // Clamp
             const actual_end = @min(end_col, row_ptr.cells.len - 1);
             const actual_start = @min(start_col, row_ptr.cells.len);

             var effective_end = actual_end;
             if (!row_ptr.wrapped) {
                 // Trim trailing spaces
                 while (effective_end >= actual_start and effective_end < row_ptr.cells.len) {
                     const cell = row_ptr.cells[effective_end];
                     if (cell.codepoint != ' ' or cell.flags.wide_spacer) { // Treat wide_spacer as part of char before it?
                         // If it's a wide spacer, the previous char is the wide char.
                         // If we are at a wide spacer, we should keep it? No, we skip spacers in the loop.
                         // If we are at space, trim.
                         // But if we have wide char + spacer, and we are at spacer...
                         // Spacer has codepoint? Usually 0 or same?
                         // Assuming spacer codepoint is ignored.
                         break;
                     }
                     if (effective_end == 0) break; // Avoid underflow if usize is unsigned
                     effective_end -= 1;
                 }
                 // If loop finished because effective_end < actual_start, we print nothing.
                 // But wait, if effective_end became actual_start - 1...
                 // The check `effective_end >= actual_start` handles the loop condition.
                 // But `effective_end -= 1` with usize 0 will wrap.
                 // I added check `if (effective_end == 0) break`.
                 // But if `effective_end` was 0 and it was space, we break, keeping 0?
                 // No, if it was space, we want to exclude 0.
                 // Logic:
                 // if cell[0] is space, we want effective_end to be "invalid" or such that loop doesn't run.
                 // Loop runs `while (i <= effective_end)`.
                 // If we want empty, we need `effective_end < i`.
                 // If effective_end is 0 and we want empty, we can't represent -1 with usize.
                 
                 // Better: use `count` or `limit`.
             }
             
             // Re-eval check
             if (!row_ptr.wrapped and effective_end < row_ptr.cells.len and row_ptr.cells[effective_end].codepoint == ' ') {
                 // It means we stopped at 0 and it was space.
                 // We should verify if we should output index 0.
                 // If actual_start=0, effective_end=0, cell[0]=' '. We want output empty.
                 // Loop `i <= 0` runs once.
                 // So we need a flag or signed int?
                 // Or just modify the loop.
             }
             
             // Let's use a simpler loop.
             var i = actual_start;
             while (i <= actual_end) : (i += 1) {
                 // Check if we are in the "trailing space zone"
                 if (!row_ptr.wrapped and i > effective_end) break;
                 
                 // Wait, I need to calculate effective_end correctly first.
                 // If 0 is space, effective_end calculation above stops at 0.
                 // So we still print 0.
             }
             
             // Correct logic for trimming:
             var print_limit = actual_end + 1; // Exclusive
             if (!row_ptr.wrapped) {
                 var curr = actual_end;
                 while (curr >= actual_start) {
                     // Check cell
                     const cell = row_ptr.cells[curr];
                     if (cell.codepoint != ' ') {
                         print_limit = curr + 1;
                         break;
                     }
                     if (curr == 0) {
                         print_limit = 0; // All spaces
                         break;
                     }
                     curr -= 1;
                 }
                 // If we exited while because curr < actual_start (loop finish), it means all spaces found?
                 // Wait, `curr` is usize. `curr >= actual_start`.
                 // If `actual_start` is 0. `curr` goes to 0.
                 // If cell[0] is space: `if (curr == 0) { print_limit = 0; break; }` -> Correct.
                 // If `actual_start` is 5. `curr` goes to 5.
                 // If cell[5] is space: `if (curr == 0)` fails. `curr -= 1` -> 4. Loop terminates.
                 // `print_limit` remains `actual_end + 1`. WRONG.
                 // `print_limit` was init to `actual_end + 1`.
                 // If we find NO non-spaces, `print_limit` should be `actual_start` (print nothing).
                 
                 // Refined:
                 print_limit = actual_start;
                 // Backward scan with optionals/signed?
                 // Iterate `len` count down to 0.
                 var count = actual_end + 1 - actual_start;
                 var k = actual_end;
                 while (count > 0) : (count -= 1) {
                     if (row_ptr.cells[k].codepoint != ' ') {
                         print_limit = k + 1;
                         break;
                     }
                     if (k > 0) k -= 1;
                 }
             }

             i = actual_start;
             while (i < print_limit) : (i += 1) {
                 const cell = row_ptr.cells[i];
                 if (cell.flags.wide_spacer) continue;
                 
                 // Encode codepoint to utf8
                 var buf: [4]u8 = undefined;
                 const cp: u21 = if (cell.codepoint <= 0x10FFFF) @intCast(cell.codepoint) else 0xFFFD;
                 const len = std.unicode.utf8Encode(cp, &buf) catch 0;
                 if (len > 0) {
                    try list.appendSlice(allocator, buf[0..len]);
                 }
             }

             // Add newline if not wrapped and not last line of selection
             if (!row_ptr.wrapped and r < r2) {
                 try list.append(allocator, '\n');
             }
        }
        
        return list.toOwnedSlice(allocator);
    }


    pub fn init(allocator: std.mem.Allocator, rows: u32, cols: u32) !Terminal {
        var tabs = try std.DynamicBitSet.initEmpty(allocator, cols);
        var i: usize = 0;
        while (i < cols) : (i += 8) {
            tabs.set(i);
        }

        return Terminal{
            .allocator = allocator,
            .grid = try Grid.init(allocator, rows, cols, 10000),
            // Alt grid usually doesn't need scrollback, but for simplicity we give it minimal or same?
            // Let's give it 0 scrollback as per xterm standard for alt buffer.
            .inactive_grid = try Grid.init(allocator, rows, cols, 0),
            .pty = null,
            .parser = Parser{},
            .tab_stops = tabs,
            .scroll_bottom = rows, // Default to full screen
        };
    }

    pub fn initWithPty(allocator: std.mem.Allocator, rows: u32, cols: u32, shell: ?[*:0]const u8, cwd: ?[*:0]const u8) !Terminal {
        var term = try init(allocator, rows, cols);
        // Pty.init might fail, so we need to handle cleanup if it does
        term.pty = Pty.init(allocator, shell, cwd) catch |err| {
            term.deinit();
            return err;
        };
        
        if (term.pty) |*p| {
            p.setSize(@intCast(rows), @intCast(cols)) catch {};
        }
        return term;
    }

    pub fn deinit(self: *Terminal) void {
        self.grid.deinit();
        self.inactive_grid.deinit();
        if (self.pty) |*p| p.deinit();
        self.tab_stops.deinit();
    }

    pub fn writeInput(self: *Terminal, data: []const u8) !void {
        if (self.pty) |*p| {
            _ = try p.write(data);
        } else {
            self.parser.feed(self, data);
        }
    }

    pub fn processOutput(self: *Terminal) !void {
        if (self.pty) |*p| {
            var buf: [4096]u8 = undefined;
            // Poll first to avoid blocking if no data
            _ = p.poll() catch |err| {
                 if (err != error.Eof and err != error.ReadFailed) return; // Ignore harmless errors
                 return;
            };
            
            // Read until empty
            while (true) {
                const n = try p.read(&buf);
                if (n == 0) break;
                self.parser.feed(self, buf[0..n]);
                self.dirty = true;
            }
        }
    }

    pub fn putChar(self: *Terminal, c: u32) void {
        const w = wcwidth(c);
        
        // Handle wrapping
        // If we are at the last column and char is wide, we need to wrap immediately
        // because we can't fit 2 cells.
        if (self.mode.auto_wrap) {
            if (self.cursor_col >= self.grid.cols) {
                // Already past end
                if (self.grid.getCell(self.cursor_row, 0)) |_| {
                    self.grid.active[self.cursor_row].wrapped = true;
                }
                self.newLine();
                self.cursor_col = 0;
            } else if (w == 2 and self.cursor_col == self.grid.cols - 1) {
                // Near end, wide char won't fit
                // Clear current cell just in case
                if (self.grid.getCell(self.cursor_row, self.cursor_col)) |cell| {
                    cell.codepoint = ' ';
                    cell.flags = .{};
                }
                if (self.grid.getCell(self.cursor_row, 0)) |_| {
                    self.grid.active[self.cursor_row].wrapped = true;
                }
                self.newLine();
                self.cursor_col = 0;
            }
        } else if (self.cursor_col >= self.grid.cols) {
            self.cursor_col = self.grid.cols - 1;
        }

        // Apply char
        if (self.grid.getCell(self.cursor_row, self.cursor_col)) |cell| {
            cell.codepoint = c;
            cell.fg_color = self.current_fg;
            cell.bg_color = self.current_bg;
            cell.flags = self.current_flags;
            if (w == 2) {
                cell.flags.wide = true;
            }
        }
        
        self.cursor_col += 1;
        
        // Handle second cell for wide char
        if (w == 2) {
            if (self.cursor_col < self.grid.cols) {
                if (self.grid.getCell(self.cursor_row, self.cursor_col)) |cell| {
                     // Spacer
                     cell.codepoint = ' '; // or 0
                     cell.fg_color = self.current_fg;
                     cell.bg_color = self.current_bg;
                     cell.flags = self.current_flags;
                     cell.flags.wide_spacer = true;
                }
                self.cursor_col += 1;
            }
        }
        
        self.dirty = true;
    }
    
    fn wcwidth(u: u32) u8 {
        if (u < 0x7F) return 1;
        // Basic CJK / Emoji ranges
        if (u >= 0x1100 and (
            (u <= 0x115F) or
            (u == 0x2329) or (u == 0x232A) or
            (u >= 0x2E80 and u <= 0xA4CF and u != 0x303F) or
            (u >= 0xAC00 and u <= 0xD7A3) or
            (u >= 0xF900 and u <= 0xFAFF) or
            (u >= 0xFE10 and u <= 0xFE19) or
            (u >= 0xFE30 and u <= 0xFE6F) or
            (u >= 0xFF00 and u <= 0xFF60) or
            (u >= 0xFFE0 and u <= 0xFFE6) or
            (u >= 0x20000 and u <= 0x2FFFD) or
            (u >= 0x30000 and u <= 0x3FFFD)
        )) return 2;
        
        // Emoji (Simple check for common ranges)
        if (u >= 0x1F300 and u <= 0x1F6FF) return 2; // Misc Symbols and Pictographs
        if (u >= 0x1F900 and u <= 0x1F9FF) return 2; // Supplemental Symbols and Pictographs
        if (u >= 0x1F1E6 and u <= 0x1F1FF) return 2; // Flags? Usually 1 but rendered wide
        
        return 1;
    }

    // --- Cursor Movement ---
    
    pub fn cursorUp(self: *Terminal, n: u16) void {
        const amount = @as(u32, n);
        if (self.cursor_row >= self.scroll_top + amount) {
             self.cursor_row -= amount;
        } else {
             self.cursor_row = self.scroll_top;
        }
        self.dirty = true;
    }

    pub fn cursorDown(self: *Terminal, n: u16) void {
        const amount = @as(u32, n);
        if (self.cursor_row + amount < self.scroll_bottom) {
            self.cursor_row += amount;
        } else {
            self.cursor_row = self.scroll_bottom - 1;
        }
        self.dirty = true;
    }

    pub fn cursorForward(self: *Terminal, n: u16) void {
        const amount = @as(u32, n);
        self.cursor_col = @min(self.cursor_col + amount, self.grid.cols - 1);
        self.dirty = true;
    }

    pub fn cursorBack(self: *Terminal, n: u16) void {
        const amount = @as(u32, n);
        if (self.cursor_col >= amount) {
            self.cursor_col -= amount;
        } else {
            self.cursor_col = 0;
        }
        self.dirty = true;
    }

    pub fn setCursorPos(self: *Terminal, row: u16, col: u16) void {
        // ANSI is 1-based, we are 0-based
        var r = if (row > 0) row - 1 else 0;
        const c = if (col > 0) col - 1 else 0;
        
        if (self.mode.origin_mode) {
            r += @intCast(self.scroll_top);
        }
        
        self.cursor_row = @min(r, self.grid.rows - 1);
        self.cursor_col = @min(c, self.grid.cols - 1);
        self.dirty = true;
    }

    // --- Erase Operations ---

    pub fn eraseDisplay(self: *Terminal, mode: u16) void {
        // 0=below, 1=above, 2=all
        switch (mode) {
            0 => { // Clear from cursor to end of screen
                self.eraseLine(0); // Clear rest of current line
                var r = self.cursor_row + 1;
                while (r < self.grid.rows) : (r += 1) {
                    self.clearRow(r);
                }
            },
            1 => { // Clear from start of screen to cursor
                var r: u32 = 0;
                while (r < self.cursor_row) : (r += 1) {
                    self.clearRow(r);
                }
                self.eraseLine(1); // Clear start of current line to cursor
            },
            2 => { // Clear all
                self.grid.clearScreen();
                // clearScreen in grid usually resets cursor, but ANSI ED 2 doesn't imply cursor reset unless specified. 
                // Wait, `grid.clearScreen` does reset cursor. Let's fix grid behavior or just manually clear.
                // Standard ED 2 just clears, doesn't move cursor.
                // Re-implement manually to be safe or update grid.
                // Let's assume grid.clearScreen is what we want for now but restore cursor.
                const r = self.cursor_row;
                const c = self.cursor_col;
                // Actually grid.clearScreen is implemented to reset cursor. Let's re-implement clearing here without cursor reset.
                var i: u32 = 0;
                while (i < self.grid.rows) : (i += 1) {
                    self.clearRow(i);
                }
                self.cursor_row = r;
                self.cursor_col = c;
            },
            else => {},
        }
        self.dirty = true;
    }

    fn clearRow(self: *Terminal, row_idx: u32) void {
        if (row_idx >= self.grid.rows) return;
        const row = &self.grid.active[row_idx];
        for (row.cells) |*cell| {
            cell.codepoint = ' ';
            cell.fg_color = self.current_fg; // Usually ED uses current background color, but let's stick to default behavior or passed args? 
            // Standard says "erased with the current background color".
            cell.fg_color = self.current_fg;
            cell.bg_color = self.current_bg;
            cell.flags = .{};
        }
        row.dirty = true;
    }

    pub fn eraseLine(self: *Terminal, mode: u16) void {
        // 0=right, 1=left, 2=all
        if (self.cursor_row >= self.grid.rows) return;
        const row = &self.grid.active[self.cursor_row];
        
        var start: u32 = 0;
        var end: u32 = self.grid.cols;

        switch (mode) {
            0 => start = self.cursor_col,
            1 => end = self.cursor_col + 1,
            2 => {},
            else => return,
        }

        start = @min(start, self.grid.cols);
        end = @min(end, self.grid.cols);

        var i = start;
        while (i < end) : (i += 1) {
            row.cells[i].codepoint = ' ';
            row.cells[i].bg_color = self.current_bg;
            row.cells[i].fg_color = self.current_fg;
            row.cells[i].flags = .{};
        }
        row.dirty = true;
        self.dirty = true;
    }
    
    // --- Advanced Editing ---
    
    pub fn insertChars(self: *Terminal, n: u32) void {
        const row = &self.grid.active[self.cursor_row];
        const count = @min(n, self.grid.cols - self.cursor_col);
        if (count == 0) return;
        
        const src_start = self.cursor_col;
        const src_end = self.grid.cols - count;
        const dst_start = self.cursor_col + count;
        
        // Move [src_start, src_end) -> [dst_start, cols)
        // Check overlap (src < dst, copy backwards)
        var i: u32 = 0;
        while (i < src_end - src_start) : (i += 1) {
            const idx = (src_end - 1) - i;
            row.cells[dst_start + idx] = row.cells[src_start + idx];
        }
        
        // Clear inserted
        for (0..count) |j| {
            row.cells[src_start + @as(u32, @intCast(j))] = Cell.init(' ', self.current_fg, self.current_bg);
        }
        row.dirty = true;
        self.dirty = true;
    }
    
    pub fn deleteChars(self: *Terminal, n: u32) void {
        const row = &self.grid.active[self.cursor_row];
        const count = @min(n, self.grid.cols - self.cursor_col);
        if (count == 0) return;
        
        const src_start = self.cursor_col + count;
        const dst_start = self.cursor_col;
        const copy_len = self.grid.cols - src_start;
        
        // Move [src_start, cols) -> [dst_start, ...)
        for (0..copy_len) |i| {
            row.cells[dst_start + @as(u32, @intCast(i))] = row.cells[src_start + @as(u32, @intCast(i))];
        }
        
        // Clear end
        const clear_start = self.grid.cols - count;
        for (0..count) |i| {
            row.cells[clear_start + @as(u32, @intCast(i))] = Cell.init(' ', self.current_fg, self.current_bg);
        }
        row.dirty = true;
        self.dirty = true;
    }
    
    pub fn eraseChars(self: *Terminal, n: u32) void {
        const row = &self.grid.active[self.cursor_row];
        const count = @min(n, self.grid.cols - self.cursor_col);
        for (0..count) |i| {
            var cell = &row.cells[self.cursor_col + @as(u32, @intCast(i))];
            cell.codepoint = ' ';
            cell.fg_color = self.current_fg;
            cell.bg_color = self.current_bg;
            cell.flags = .{};
        }
        row.dirty = true;
        self.dirty = true;
    }
    
    pub fn insertLines(self: *Terminal, n: u32) void {
        // Only affects scroll region
        if (self.cursor_row < self.scroll_top or self.cursor_row >= self.scroll_bottom) return;
        
        const count = @min(n, self.scroll_bottom - self.cursor_row);
        // Move down: [cursor_row, bottom-n) -> [cursor_row+n, bottom)
        // Copy rows backwards to avoid overwrite
        // Wait, Grid stores rows. We can swap rows?
        // But referencing them is tricky. Just copy data for now or swapping if Grid supports it?
        // Let's rely on manual copy for safety.
        
        var i: u32 = 0;
        const num_move = (self.scroll_bottom - self.cursor_row) - count;
        
        while (i < num_move) : (i += 1) {
            const src_idx = (self.scroll_bottom - count - 1) - i;
            const dst_idx = (self.scroll_bottom - 1) - i;
            // DO NOT copy struct: self.grid.active[dst_idx] = self.grid.active[src_idx]; (Causes double free/leak)
            // Copy contents only:
            @memcpy(self.grid.active[dst_idx].cells, self.grid.active[src_idx].cells);
            self.grid.active[dst_idx].dirty = true;
        }
        
        // Clear inserted lines
        for (0..count) |j| {
            self.clearRow(self.cursor_row + @as(u32, @intCast(j)));
        }
        self.dirty = true;
    }

    pub fn deleteLines(self: *Terminal, n: u32) void {
        if (self.cursor_row < self.scroll_top or self.cursor_row >= self.scroll_bottom) return;
        
        const count = @min(n, self.scroll_bottom - self.cursor_row);
        
        // Move up: [cursor_row + n, bottom) -> [cursor_row, bottom - n)
        const num_move = (self.scroll_bottom - self.cursor_row) - count;
        for (0..num_move) |i| {
             const src_idx = self.cursor_row + count + @as(u32, @intCast(i));
             const dst_idx = self.cursor_row + @as(u32, @intCast(i));
             @memcpy(self.grid.active[dst_idx].cells, self.grid.active[src_idx].cells);
             self.grid.active[dst_idx].dirty = true;
        }
        
        // Clear bottom lines
        for (0..count) |j| {
            self.clearRow(self.scroll_bottom - 1 - @as(u32, @intCast(j)));
        }
        self.dirty = true;
    }

    // --- Modes ---


    pub fn setPrivateMode(self: *Terminal, mode: u16, enabled: bool) void {
        switch (mode) {
            25 => self.mode.cursor_visible = enabled,
            7 => self.mode.auto_wrap = enabled,
            1 => self.mode.application_cursor_keys = enabled, // DECCKM
            
            // Mouse Tracking
            1000 => { // X11 Mouse (Click only)
                self.mode.mouse_tracking = if (enabled) .x10 else .none;
            },
            1002 => { // Drag Mouse (Click + Drag)
                self.mode.mouse_tracking = if (enabled) .drag else .none;
            },
            1003 => { // All Motion
                self.mode.mouse_tracking = if (enabled) .motion else .none;
            },
            1006 => { // SGR Encoding
                self.mode.mouse_encoding = if (enabled) .sgr else .default;
            },

            // Alternate Screen Buffer
            47, 1047 => {
                if (enabled and !self.is_alt_buffer) {
                    self.switchBuffer(true, false);
                } else if (!enabled and self.is_alt_buffer) {
                    self.switchBuffer(false, false);
                }
            },
            1049 => {
                if (enabled and !self.is_alt_buffer) {
                    self.switchBuffer(true, true);
                } else if (!enabled and self.is_alt_buffer) {
                    self.switchBuffer(false, true);
                }
            },
            else => {},
        }
        self.dirty = true;
    }

    fn switchBuffer(self: *Terminal, to_alt: bool, clear_alt: bool) void {
        if (to_alt) {
            // Main -> Alt
            // Save state of MAIN buffer
            self.grid.saved_cursor = .{
                .row = self.cursor_row,
                .col = self.cursor_col,
                .fg_color = self.current_fg,
                .bg_color = self.current_bg,
                .flags = self.current_flags,
                .origin_mode = self.mode.origin_mode,
                .auto_wrap = self.mode.auto_wrap,
            };
            
            // Swap to ALT buffer (inactive_grid)
            std.mem.swap(Grid, &self.grid, &self.inactive_grid);
            self.is_alt_buffer = true;
            
            if (clear_alt) {
                self.grid.clearScreen();
                self.cursor_row = 0;
                self.cursor_col = 0;
                // self.resetAttributes(); // Optional? Usually 1049 doesn't reset SGR?
            }
        } else {
            // Alt -> Main
            // Swap back
            std.mem.swap(Grid, &self.grid, &self.inactive_grid);
            self.is_alt_buffer = false;
            
            // Restore state of MAIN buffer
            const restored = self.grid.saved_cursor;
            self.cursor_row = restored.row;
            self.cursor_col = restored.col;
            self.current_fg = restored.fg_color;
            self.current_bg = restored.bg_color;
            self.current_flags = restored.flags;
            self.mode.origin_mode = restored.origin_mode;
            self.mode.auto_wrap = restored.auto_wrap;
        }
        
        // Reset scroll region when switching buffers? 
        // Typically Altscreen has full scroll region.
        // We should save scroll region too? 
        // XTerm saves margins with cursor usually.
        // Let's reset to full screen for now.
        self.scroll_top = 0;
        self.scroll_bottom = self.grid.rows;
        
        // Mark everything dirty
        self.dirty = true;
        self.grid.dirty_rows.setRangeValue(.{ .start = 0, .end = self.grid.rows }, true);
    }

    // --- Cursor Save/Restore ---

    pub fn saveCursor(self: *Terminal) void {
        self.saved_cursor = SavedCursor{
            .row = self.cursor_row,
            .col = self.cursor_col,
            .fg = self.current_fg,
            .bg = self.current_bg,
            .flags = self.current_flags,
            .origin_mode = self.mode.origin_mode,
        };
    }

    pub fn restoreCursor(self: *Terminal) void {
        if (self.saved_cursor) |saved| {
            self.cursor_row = saved.row;
            self.cursor_col = saved.col;
            self.current_fg = saved.fg;
            self.current_bg = saved.bg;
            self.current_flags = saved.flags;
            self.mode.origin_mode = saved.origin_mode;
            self.dirty = true;
        }
    }

    // --- Scroll Region ---

    pub fn setScrollRegion(self: *Terminal, top: u16, bottom: u16) void {
        // 1-based args
        const t = if (top > 0) top - 1 else 0;
        // bottom is inclusive in ANSI, so if bottom is sent, it's the index of the last line.
        // our scroll_bottom is exclusive (limit)
        // Wait, normally `bottom` is the line number. 
        // If args are 1;24, t=0, b=24.
        const b = if (bottom > 0) bottom else self.grid.rows;
        
        self.scroll_top = @min(t, self.grid.rows - 1);
        self.scroll_bottom = @min(@as(u32, b), self.grid.rows);
        
        if (self.scroll_top >= self.scroll_bottom) {
            self.scroll_top = 0;
            self.scroll_bottom = self.grid.rows;
        }
        
        // DECSTBM also moves cursor to home
        self.cursor_row = if (self.mode.origin_mode) self.scroll_top else 0;
        self.cursor_col = 0;
    }

    // --- Attributes ---

    pub fn resetAttributes(self: *Terminal) void {
        self.current_fg = self.default_fg;
        self.current_bg = self.default_bg;
        self.current_flags = .{};
    }

    // --- Control Characters ---

    pub fn bell(self: *Terminal) void {
        // TODO: Ring bell
        _ = self;
    }

    pub fn backspace(self: *Terminal) void {
        if (self.cursor_col > 0) {
            self.cursor_col -= 1;
        }
        self.dirty = true;
    }

    pub fn tab(self: *Terminal) void {
        var next_col = self.cursor_col + 1;
        while (next_col < self.grid.cols) {
            if (self.tab_stops.isSet(next_col)) break;
            next_col += 1;
        }
        if (next_col >= self.grid.cols) next_col = self.grid.cols - 1;
        self.cursor_col = @intCast(next_col);
        self.dirty = true;
    }

    pub fn lineFeed(self: *Terminal) void {
        self.newLine();
        self.dirty = true;
    }

    pub fn carriageReturn(self: *Terminal) void {
        self.cursor_col = 0;
        self.dirty = true;
    }

    pub fn execute(self: *Terminal, cmd: u8) void {
        switch (cmd) {
            0x0A => self.lineFeed(),
            0x0D => self.carriageReturn(),
            0x08 => self.backspace(),
            0x09 => self.tab(),
            0x07 => self.bell(),
            else => {},
        }
    }
    
    pub fn csiDispatch(self: *Terminal, params: []const u16, intermediates: []const u8, final: u8) void {
        const p1_def1 = if (params.len > 0 and params[0] > 0) params[0] else 1;
        
        // Handle Private Modes (?25h etc)
        if (intermediates.len > 0 and intermediates[0] == '?') {
            switch (final) {
                'h' => { // SM - Set Mode
                    for (params) |p| self.setPrivateMode(p, true);
                },
                'l' => { // RM - Reset Mode
                    for (params) |p| self.setPrivateMode(p, false);
                },
                else => {},
            }
            return;
        }

        switch (final) {
            'A' => self.cursorUp(p1_def1),
            'B' => self.cursorDown(p1_def1),
            'C' => self.cursorForward(p1_def1),
            'D' => self.cursorBack(p1_def1),
            'E' => { // Next Line
                self.cursorDown(p1_def1);
                self.cursor_col = 0;
            },
            'F' => { // Preceding Line
                self.cursorUp(p1_def1);
                self.cursor_col = 0;
            },
            'G' => { // CHA - Cursor Horizontal Absolute
                const col = p1_def1;
                self.cursor_col = if (col > 0) @min(@as(u32, col) - 1, self.grid.cols - 1) else 0;
                self.dirty = true;
            },
            'H', 'f' => { // CUP - Cursor Position
                const row = if (params.len > 0 and params[0] > 0) params[0] else 1;
                const col = if (params.len > 1 and params[1] > 0) params[1] else 1;
                self.setCursorPos(row, col);
            },
            'J' => { // ED - Erase in Display
                const mode = if (params.len > 0) params[0] else 0;
                std.debug.print("DEBUG: CSI J (Erase Display) Mode: {d}\n", .{mode});
                self.eraseDisplay(mode);
            },
            'K' => { // EL - Erase in Line
                const mode = if (params.len > 0) params[0] else 0;
                self.eraseLine(mode);
            },
            'm' => self.setGraphicsRendition(params),
            'n' => { // DSR - Device Status Report
                if (params.len > 0 and params[0] == 6) {
                    // Report cursor position: ESC [ row ; col R
                    var buf: [32]u8 = undefined;
                    // Provide 1-based coords
                    const r = if (self.mode.origin_mode) self.cursor_row - self.scroll_top + 1 else self.cursor_row + 1;
                    const c = self.cursor_col + 1;
                    const text = std.fmt.bufPrint(&buf, "\x1B[{d};{d}R", .{r, c}) catch "";
                    self.writeInput(text) catch {};
                }
            },
            's' => self.saveCursor(),
            'u' => self.restoreCursor(),
            else => {},
        }
    }

    fn setGraphicsRendition(self: *Terminal, params: []const u16) void {
        if (params.len == 0) {
            self.resetAttributes();
            return;
        }

        var i: usize = 0;
        while (i < params.len) : (i += 1) {
            const param = params[i];
            switch (param) {
                0 => self.resetAttributes(),
                1 => self.current_flags.bold = true,
                2 => self.current_flags.dim = true,
                3 => self.current_flags.italic = true,
                4 => self.current_flags.underline = true,
                5 => {}, // Blink?
                7 => self.current_flags.reverse = true,
                8 => self.current_flags.hidden = true,
                9 => self.current_flags.strikethrough = true,
                22 => { // Normal (no bold/dim)
                    self.current_flags.bold = false;
                    self.current_flags.dim = false;
                },
                23 => self.current_flags.italic = false,
                24 => self.current_flags.underline = false,
                27 => self.current_flags.reverse = false,
                28 => self.current_flags.hidden = false,
                29 => self.current_flags.strikethrough = false,
                30...37 => { // FG 0-7
                    self.current_fg = 0xFF000000 | ansiColor(param - 30);
                },
                38 => { // FG Extended
                    if (i + 1 < params.len) {
                        const mode = params[i+1];
                        if (mode == 5 and i + 2 < params.len) { // 256 color
                            const idx = params[i+2];
                            self.current_fg = 0xFF000000 | xtermColor(idx);
                            i += 2;
                        } else if (mode == 2 and i + 4 < params.len) { // TrueColor
                            const r = params[i+2];
                            const g = params[i+3];
                            const b = params[i+4];
                            self.current_fg = 0xFF000000 | (@as(u32, r) << 16) | (@as(u32, g) << 8) | @as(u32, b);
                            i += 4;
                        }
                    }
                },
                39 => self.current_fg = self.default_fg,
                40...47 => { // BG 0-7
                    self.current_bg = 0xFF000000 | ansiColor(param - 40);
                },
                48 => { // BG Extended
                    if (i + 1 < params.len) {
                         const mode = params[i+1];
                         if (mode == 5 and i + 2 < params.len) {
                             const idx = params[i+2];
                             self.current_bg = 0xFF000000 | xtermColor(idx);
                             i += 2;
                         } else if (mode == 2 and i + 4 < params.len) {
                             const r = params[i+2];
                             const g = params[i+3];
                             const b = params[i+4];
                             self.current_bg = 0xFF000000 | (@as(u32, r) << 16) | (@as(u32, g) << 8) | @as(u32, b);
                             i += 4;
                         }
                    }
                },
                49 => self.current_bg = self.default_bg,
                90...97 => { // FG Bright
                    self.current_fg = 0xFF000000 | ansiBrightColor(param - 90);
                },
                100...107 => { // BG Bright
                    self.current_bg = 0xFF000000 | ansiBrightColor(param - 100);
                },
                else => {},
            }
        }
    }

    fn ansiColor(idx: u16) u32 {
        const colors = [_]u32{
            0x000000, 0xCD0000, 0x00CD00, 0xCDCD00,
            0x0000EE, 0xCD00CD, 0x00CDCD, 0xE5E5E5,
        };
        if (idx < 8) return colors[idx];
        return 0xFFFFFF;
    }

    fn ansiBrightColor(idx: u16) u32 {
         const colors = [_]u32{
            0x7F7F7F, 0xFF0000, 0x00FF00, 0xFFFF00,
            0x5C5CFF, 0xFF00FF, 0x00FFFF, 0xFFFFFF,
        };
        if (idx < 8) return colors[idx];
        return 0xFFFFFF;
    }

    fn xtermColor(idx: u16) u32 {
        if (idx < 16) {
            if (idx < 8) return ansiColor(idx);
            return ansiBrightColor(idx - 8);
        }
        if (idx < 232) {
            // 6x6x6 cube
            const i = idx - 16;
            // Value steps: 0, 95, 135, 175, 215, 255
            const r_v = (i / 36);
            const g_v = (i / 6) % 6;
            const b_v = i % 6;
            const r = if (r_v > 0) r_v * 40 + 55 else 0;
            const g = if (g_v > 0) g_v * 40 + 55 else 0;
            const b = if (b_v > 0) b_v * 40 + 55 else 0;
            return (@as(u32, r) << 16) | (@as(u32, g) << 8) | @as(u32, b);
        }
        // Grayscale 232-255
        const gray = (idx - 232) * 10 + 8;
        return (@as(u32, gray) << 16) | (@as(u32, gray) << 8) | @as(u32, gray);
    }

    fn newLine(self: *Terminal) void {
        if (self.cursor_row + 1 < self.scroll_bottom) {
            self.cursor_row += 1;
        } else {
            self.scrollUp();
        }
        if (self.mode.line_feed_mode) {
             self.cursor_col = 0;
        }
    }
    
    fn scrollUp(self: *Terminal) void {
        // We need to scroll the region between scroll_top and scroll_bottom
        if (self.scroll_top == 0 and self.scroll_bottom == self.grid.rows) {
            // Full screen scroll
            self.grid.scrollUp(1);
        } else {
             // Partial scroll - complex! 
             // Ideally we implement grid.scrollRegion.
             // For now, let's just do nothing or implement a simple shift for the active lines.
             // A proper implementation requires moving rows around in the active buffer.
             // Let's implement a simple version here.
             
             // 1. Move rows up
             var i = self.scroll_top;
             while (i < self.scroll_bottom - 1) : (i += 1) {
                 // Swap pointers or copy content? Grid uses pointers in `active`.
                 // We can swap the content of row i with i+1?
                 // Grid structure: active: []Row. Row contains cells: []Cell.
                 // We can just swap the pointers in active[]? 
                 // But Grid owns the memory.
                 
                 // Safe way: copy content.
                 const dest = &self.grid.active[i];
                 const src = &self.grid.active[i+1];
                 @memcpy(dest.cells, src.cells);
                 dest.dirty = true;
             }
             
             // 2. Clear last row
             const last = &self.grid.active[self.scroll_bottom - 1];
             for (last.cells) |*c| {
                 c.* = Cell{
                     .bg_color = self.current_bg, // Fill with current bg
                     // .fg_color = self.current_fg
                 };
             }
             last.dirty = true;
        }
    }

    pub fn resize(self: *Terminal, rows: u32, cols: u32) !void {
        if (self.grid.rows == rows and self.grid.cols == cols) return;
        
        // Sync Terminal cursor state TO Grid before resize
        // Grid.resize relies on this to calculate scroll offset and adjust cursor
        self.grid.cursor_row = self.cursor_row;
        self.grid.cursor_col = self.cursor_col;
        
        try self.grid.resize(rows, cols);
        try self.inactive_grid.resize(rows, cols); // Also resize the backup/alt grid
        
        // Sync cursor BACK from grid (Smart Reflow updated it)
        self.cursor_row = self.grid.cursor_row;
        self.cursor_col = self.grid.cursor_col;
        
        // Safety clamp (should be handled by grid, but good to be sure)
        if (self.cursor_row >= rows) self.cursor_row = rows - 1;
        if (self.cursor_col >= cols) self.cursor_col = cols - 1;
        
        // Update scroll region if it was full screen
        // Always reset scroll region to full screen on resize.
        // Applications (like vim/tmux) responsible for setting margins will handle SIGWINCH 
        // and re-apply them if needed. This prevents the "stuck at 24 lines" issue.
        self.scroll_top = 0;
        self.scroll_bottom = rows;
        
        // Rebuild tab stops
        self.tab_stops.deinit();
        self.tab_stops = try std.DynamicBitSet.initEmpty(self.allocator, cols);
        var i: usize = 0;
        while (i < cols) : (i += 8) {
            self.tab_stops.set(i);
        }
        
        if (self.pty) |*p| {
             try p.setSize(@intCast(rows), @intCast(cols));
        }
        self.dirty = true;
    }

    pub fn sendMouseEvent(self: *Terminal, button: u8, pressed: bool, row: u32, col: u32, dragging: bool) bool {
        // Check if mouse tracking is enabled
        if (self.mode.mouse_tracking == .none) return false;

        // If dragging but mode is only x10 (click), ignore & return false?
        // Or return true meaning "we are in a mode but this event is ignored"?
        // If we return false, local selection starts.
        // If x10 mode is on, we probably shouldn't select text?
        // Text selection should only happen if mouse reporting is OFF or forced (Shift).
        // Let's return true if tracking is != .none.
        
        // If dragging but mode is only x10 (click), ignore
        if (dragging and self.mode.mouse_tracking == .x10) return true;
        
        // If release event and mode is x10, ignore (x10 only sends press)
        if (!pressed and self.mode.mouse_tracking == .x10) return true;
        
        if (self.mode.mouse_encoding == .sgr) {
            // SGR Parsing: CSI < button ; x ; y M (press) or m (release)
            // Button: 0=Left, 1=Middle, 2=Right, 3=Release(legacy) -> SGR preserves button on release
            // Modifiers: Shift=4, Meta=8, Ctrl=16
            // Motion: +32
            // Scroll: 64+
            
            var btn_code = button;
            if (dragging) btn_code += 32;
            
            // For SGR, we send 'M' for press/drag, 'm' for release.
            // But we also include the button code.
            const suffix: u8 = if (pressed) 'M' else 'm';
            
            // 1-based coordinates
            const x = col + 1;
            const y = row + 1;
            
            var buf: [64]u8 = undefined;
            const text = std.fmt.bufPrint(&buf, "\x1B[<{d};{d};{d}{c}", .{ btn_code, x, y, suffix }) catch return true;
            self.writeInput(text) catch {};
        } else {
            // Default X10/Normal encoding
            // CSI M Cb Cx Cy
            // Cb = button + 32
            // Cx = x + 33
            // Cy = y + 33
            // Limited to 223 columns/rows (byte wraps)
            // Deprecated but good fallback. We only implement SGR for now as it's what modern apps need.
        }
        return true;
    }

    pub fn getGrid(self: *Terminal) *Grid {
        return &self.grid;
    }

    pub fn getCursor(self: *const Terminal) Cursor {
        return Cursor{
            .row = self.cursor_row,
            .col = self.cursor_col,
            .visible = self.mode.cursor_visible,
            .style = self.cursor_style,
        };
    }

    pub fn setCursorStyle(self: *Terminal, style: CursorStyle) void {
        self.cursor_style = style;
        self.dirty = true;
    }

    pub fn isDirty(self: *const Terminal) bool {
        return self.dirty;
    }

    pub fn markClean(self: *Terminal) void {
        self.dirty = false;
    }
    
    pub fn setTitle(self: *Terminal, title: []const u8) void {
        _ = self;
        if (cb_set_title) |cb| {
            cb(title.ptr, title.len);
        }
    }
    
    pub fn setClipboard(self: *Terminal, selection: u8, data: []const u8) void {
        _ = self;
        if (selection == 'c') {
            if (cb_set_clipboard) |cb| {
                cb(data.ptr, data.len);
            }
        }
    }
    
    pub fn queryClipboard(self: *Terminal, selection: u8) void {
        if (selection == 'c') {
            if (cb_get_clipboard) |cb| {
                if (cb()) |ptr| {
                    const len = std.mem.len(ptr);
                    const data = ptr[0..len];
                    if (self.pty) |*p| {
                        _ = p.write("\x1B]52;c;") catch {};
                        _ = p.write(data) catch {};
                        _ = p.write("\x07") catch {};
                    }
                }
            }
        }
    }
};
