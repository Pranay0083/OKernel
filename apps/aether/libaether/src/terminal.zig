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
    start_row: i32 = 0,
    start_col: u32 = 0,
    end_row: i32 = 0,
    end_col: u32 = 0,
    active: bool = false,

    pub fn contains(self: Selection, view_row: u32, view_col: u32, scroll_offset: u32) bool {
        if (!self.active) return false;
        
        // Convert viewport row to stable row
        // Stable Row = Viewport Row - Scroll Offset
        // e.g. If Offset=10, Viewport 0 is Stable -10.
        const r_stable = @as(i32, @intCast(view_row)) - @as(i32, @intCast(scroll_offset));
        
        // Normalize selection direction
        var min_row = self.start_row;
        var max_row = self.end_row;
        var min_col = self.start_col;
        var max_col = self.end_col;

        if (min_row > max_row) {
            std.mem.swap(i32, &min_row, &max_row);
            std.mem.swap(u32, &min_col, &max_col);
        } else if (min_row == max_row and min_col > max_col) {
             std.mem.swap(u32, &min_col, &max_col);
        }
        
        if (r_stable < min_row or r_stable > max_row) return false;
        
        if (min_row == max_row) {
            return view_col >= min_col and view_col <= max_col;
        }
        
        if (r_stable == min_row) {
            return view_col >= min_col;
        } else if (r_stable == max_row) {
             return view_col <= max_col;
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
            std.mem.swap(i32, &r1, &r2);
            std.mem.swap(u32, &c1, &c2);
        }

        var r = r1;
        
        while (r <= r2) : (r += 1) {
             // Stable Row 'r' to Internal Lookup
             // Stable 0 = Active[0].
             // Stable -1 = Scrollback[0] (Most recent).
             // Stable -N = Scrollback[N-1].
             
             var row_ptr: ?*const Row = null;
             
             if (r >= 0) {
                 const active_idx = @as(u32, @intCast(r));
                 if (active_idx < self.grid.rows) {
                     row_ptr = &self.grid.active[active_idx];
                 }
             } else {
                 // Scrollback
                 // r = -1 -> sb_idx = 0.
                 // r = -k -> sb_idx = k-1.
                 // r = -k. -r = k. k-1 = -r - 1.
                 // Check bounds against scrollback len
                 const abs_r = -r; // positive
                 if (abs_r > 0) {
                     const sb_idx = @as(u32, @intCast(abs_r - 1));
                     // getScrollbackRow handles scaling/wrapping internally?
                     // Grid.getScrollbackRow usually takes index 0..len-1.
                     // 0 is most recent? Yes usually.
                     row_ptr = self.grid.getScrollbackRow(sb_idx);
                 }
             }
             
             if (row_ptr) |rp| {
                 const start_col = if (r == r1) c1 else 0;
                 const end_col = if (r == r2) c2 else self.grid.cols - 1;
                 
                 // Clamp
                 const actual_end = @min(end_col, rp.cells.len - 1);
                 const actual_start = @min(start_col, rp.cells.len);
                 
                 // Trim trailing spaces
                 var print_limit = actual_start;
                 if (!rp.wrapped) {
                      var count = actual_end + 1 - actual_start;
                      var k = actual_end;
                      while (count > 0) : (count -= 1) {
                          if (rp.cells[k].codepoint != ' ') {
                              print_limit = k + 1;
                              break;
                          }
                          if (k > 0) k -= 1;
                      }
                 } else {
                     print_limit = actual_end + 1;
                 }
    
                 var i = actual_start;
                 while (i < print_limit) : (i += 1) {
                     const cell = rp.cells[i];
                     if (cell.flags.wide_spacer) continue;
                     
                     var buf: [4]u8 = undefined;
                     const cp: u21 = if (cell.codepoint <= 0x10FFFF) @intCast(cell.codepoint) else 0xFFFD;
                     const len = std.unicode.utf8Encode(cp, &buf) catch 0;
                     if (len > 0) {
                        try list.appendSlice(allocator, buf[0..len]);
                     }
                 }
    
                 if (!rp.wrapped and r < r2) {
                     try list.append(allocator, '\n');
                 }
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

    pub fn initWithPty(allocator: std.mem.Allocator, rows: u32, cols: u32, shell: ?[*:0]const u8, cwd: ?[*:0]const u8, ctrlc_sends_sigint: bool) !Terminal {
        var term = try init(allocator, rows, cols);
        // Pty.init might fail, so we need to handle cleanup if it does
        term.pty = Pty.init(allocator, shell, cwd, ctrlc_sends_sigint) catch |err| {
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

    pub fn cursorNextLine(self: *Terminal, n: u16) void {
        self.cursorDown(n);
        self.cursor_col = 0;
    }

    pub fn cursorPrecedingLine(self: *Terminal, n: u16) void {
        self.cursorUp(n);
        self.cursor_col = 0;
    }

    pub fn cursorHorizontalAbsolute(self: *Terminal, n: u16) void {
        const col = if (n > 0) n - 1 else 0;
        self.cursor_col = @min(@as(u32, col), self.grid.cols - 1);
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

    pub fn scrollUp(self: *Terminal, n: u16) void {
        for (0..n) |_| self.scrollUpOne();
    }

    pub fn scrollDown(self: *Terminal, n: u16) void {
        for (0..n) |_| self.scrollDownOne();
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
    
    // csiDispatch removed - now handled in parser.zig


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
            self.scrollUpOne();
        }
        if (self.mode.line_feed_mode) {
             self.cursor_col = 0;
        }
    }
    
    fn scrollUpOne(self: *Terminal) void {
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

    fn scrollDownOne(self: *Terminal) void {
        if (self.scroll_top == 0 and self.scroll_bottom == self.grid.rows) {
            self.grid.scrollDown(1);
        } else {
             // Partial scroll down
             var i = self.scroll_bottom - 1;
             while (i > self.scroll_top) : (i -= 1) {
                 const dest = &self.grid.active[i];
                 const src = &self.grid.active[i-1];
                 @memcpy(dest.cells, src.cells);
                 dest.dirty = true;
             }
             
             const first = &self.grid.active[self.scroll_top];
             for (first.cells) |*c| {
                 c.* = Cell{
                     .bg_color = self.current_bg,
                 };
             }
             first.dirty = true;
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

    // --- History ---

    pub fn getHistoryCount(self: *const Terminal) u32 {
        return self.grid.getTotalRows();
    }

    pub fn getHistoryRow(self: *const Terminal, idx: u32) ?*const Row {
        return self.grid.getHistoryRow(idx);
    }

    pub fn clearHistory(self: *Terminal) void {
        self.grid.clearHistory();
        self.cursor_row = 0;
        self.cursor_col = 0;
        self.dirty = true;
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

    // --- Terminal Queries (Responses sent back to PTY) ---

    pub fn deviceAttributes(self: *Terminal) void {
        // CSI ? 62 ; 1 ; 2 ; 4 ; 6 ; 9 ; 15 ; 22 c (xterm-like response)
        self.writeInput("\x1B[?62;1;2;4;6;9;15;22c") catch {};
    }

    pub fn deviceStatusReport(self: *Terminal, param: u16) void {
        switch (param) {
            5 => self.writeInput("\x1B[0n") catch {}, // Status OK
            6 => self.cursorPositionReport(),
            else => {},
        }
    }

    pub fn cursorPositionReport(self: *Terminal) void {
        var buf: [32]u8 = undefined;
        // CPR: CSI r ; c R (1-indexed)
        const response = std.fmt.bufPrint(&buf, "\x1B[{d};{d}R", .{ self.cursor_row + 1, self.cursor_col + 1 }) catch return;
        self.writeInput(response) catch {};
    }
};
