const std = @import("std");
const Allocator = std.mem.Allocator;

pub const CellFlags = packed struct(u16) {
    bold: bool = false,
    italic: bool = false,
    underline: bool = false,
    strikethrough: bool = false,
    dim: bool = false,
    hidden: bool = false,
    reverse: bool = false,
    wide: bool = false,         // Wide character (takes 2 cells)
    wide_spacer: bool = false,  // Placeholder for wide char
    _padding: u7 = 0,
};

pub const Cell = extern struct {
    codepoint: u32 = ' ',       // Unicode codepoint (space default)
    fg_color: u32 = 0xFFFFFFFF, // Foreground ARGB (white default)
    bg_color: u32 = 0xFF000000, // Background ARGB (black default)  
    flags: CellFlags = .{},     // Packed attributes
    semantic_id: u16 = 0,       // For shell integration
    
    pub fn init(codepoint: u32, fg: u32, bg: u32) Cell {
        return .{
            .codepoint = codepoint,
            .fg_color = fg,
            .bg_color = bg,
            .flags = .{}, 
        };
    }
};

pub const Row = struct {
    cells: []Cell,
    dirty: bool = true,
    wrapped: bool = false,  // Line was wrapped from previous
    semantic_prompt: bool = false,  // OSC 133 prompt marker
    allocator: Allocator,

    pub fn init(allocator: Allocator, cols: u32) !Row {
        const cells = try allocator.alloc(Cell, cols);
        for (cells) |*c| {
            c.* = Cell{};
        }
        return Row{
            .cells = cells,
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *Row) void {
        self.allocator.free(self.cells);
    }
    
    pub fn resize(self: *Row, new_cols: u32) !void {
        if (new_cols == self.cells.len) return;
        
        const old_cells = self.cells;
        const new_cells = try self.allocator.alloc(Cell, new_cols);
        
        const copy_len = @min(old_cells.len, new_cols);
        @memcpy(new_cells[0..copy_len], old_cells[0..copy_len]);
        
        // Initialize new cells if expanding
        if (new_cols > old_cells.len) {
            for (new_cells[old_cells.len..]) |*c| {
                c.* = Cell{};
            }
        }
        
        self.allocator.free(old_cells);
        self.cells = new_cells;
        self.dirty = true;
    }
};

pub fn RingBuffer(comptime T: type) type {
    return struct {
        data: []T,
        head: usize = 0, // Write index
        tail: usize = 0, // Read index (oldest)
        len: usize = 0,
        allocator: Allocator,

        const Self = @This();

        pub fn init(allocator: Allocator, capacity_val: u32) !Self {
            const data = try allocator.alloc(T, capacity_val);
            return Self{
                .data = data,
                .allocator = allocator,
            };
        }

        pub fn deinit(self: *Self) void {
            self.allocator.free(self.data);
        }

        pub fn push(self: *Self, item: T) ?T {
            if (self.data.len == 0) return item; // No capacity

            var evicted: ?T = null;
            if (self.len == self.data.len) {
                // Buffer full, overwrite head (which is same as tail)
                evicted = self.data[self.head];
                self.data[self.head] = item;
                self.head = (self.head + 1) % self.data.len;
                self.tail = (self.tail + 1) % self.data.len;
            } else {
                self.data[self.head] = item;
                self.head = (self.head + 1) % self.data.len;
                self.len += 1;
            }
            return evicted;
        }

        pub fn get(self: *Self, index: usize) ?*T {
            if (index >= self.len) return null;
            const physical_index = (self.tail + index) % self.data.len;
            return &self.data[physical_index];
        }

        pub fn capacity(self: *Self) usize {
            return self.data.len;
        }
    };
}

pub const ClearMode = enum { to_end, to_start, all };


pub const GridCursorState = struct {
    row: u32 = 0,
    col: u32 = 0,
    fg_color: u32 = 0xFFFFFFFF,
    bg_color: u32 = 0xFF000000,
    flags: CellFlags = .{},
    origin_mode: bool = false,
    auto_wrap: bool = true,
};

pub const Grid = struct {
    allocator: std.mem.Allocator,
    rows: u32,
    cols: u32,
    
    // Active screen (visible area)
    active: []Row,
    
    // Scrollback ring buffer
    scrollback: RingBuffer(Row),
    scrollback_capacity: u32,
    
    // Cursor state
    cursor_row: u32 = 0,
    cursor_col: u32 = 0,
    
    // Saved Cursor state (for Alt Buffer switching)
    saved_cursor: GridCursorState = .{},
    
    // Dirty tracking
    dirty: bool = true,
    dirty_rows: std.DynamicBitSet,
    
    pub fn init(allocator: Allocator, rows: u32, cols: u32, scrollback: u32) !Grid {
        var active_rows = try allocator.alloc(Row, rows);
        errdefer allocator.free(active_rows);
        
        var initialized_rows: usize = 0;
        errdefer {
             for (active_rows[0..initialized_rows]) |*r| r.deinit();
        }

        for (active_rows) |*row| {
            row.* = try Row.init(allocator, cols);
            initialized_rows += 1;
        }
        
        var sb = try RingBuffer(Row).init(allocator, scrollback);
        errdefer sb.deinit();
        
        var dirty_bitset = try std.DynamicBitSet.initEmpty(allocator, rows);
        dirty_bitset.setRangeValue(.{ .start = 0, .end = rows }, true);

        return Grid{
            .allocator = allocator,
            .rows = rows,
            .cols = cols,
            .active = active_rows,
            .scrollback = sb,
            .scrollback_capacity = scrollback,
            .dirty_rows = dirty_bitset,
        };
    }
    
    pub fn deinit(self: *Grid) void {
        for (self.active) |*row| {
            row.deinit();
        }
        self.allocator.free(self.active);
        
        var i: usize = 0;
        while (i < self.scrollback.len) : (i += 1) {
            if (self.scrollback.get(i)) |row| {
                row.deinit();
            }
        }
        self.scrollback.deinit();
        self.dirty_rows.deinit();
    }
    
    pub fn getCell(self: *Grid, row: u32, col: u32) ?*Cell {
        if (row >= self.rows or col >= self.cols) return null;
        return &self.active[row].cells[col];
    }
    
    pub fn getCellConst(self: *const Grid, row: u32, col: u32) ?*const Cell {
        if (row >= self.rows or col >= self.cols) return null;
        return &self.active[row].cells[col];
    }
    
    pub fn putChar(self: *Grid, char: u32) void {
        if (self.cursor_col >= self.cols) {
            self.active[self.cursor_row].wrapped = true;
            self.newLine();
            self.cursor_col = 0;
        }
        
        if (self.getCell(self.cursor_row, self.cursor_col)) |cell| {
            cell.codepoint = char;
            self.markRowDirty(self.cursor_row);
        }
        
        self.cursor_col += 1;
    }
    
    pub fn newLine(self: *Grid) void {
        self.cursor_row += 1;
        if (self.cursor_row >= self.rows) {
            self.scrollUp(1);
            self.cursor_row = self.rows - 1;
        }
    }
    
    pub fn carriageReturn(self: *Grid) void {
        self.cursor_col = 0;
    }
    
    pub fn moveCursor(self: *Grid, row: u32, col: u32) void {
        self.cursor_row = @min(row, self.rows - 1);
        self.cursor_col = @min(col, self.cols - 1);
    }
    
    pub fn moveCursorRel(self: *Grid, d_row: i32, d_col: i32) void {
        const new_row = @as(i64, self.cursor_row) + d_row;
        const new_col = @as(i64, self.cursor_col) + d_col;
        
        self.cursor_row = @intCast(std.math.clamp(new_row, 0, self.rows - 1));
        self.cursor_col = @intCast(std.math.clamp(new_col, 0, self.cols - 1));
    }
    
    pub fn getScrollbackRow(self: *const Grid, offset: usize) ?*const Row {
        if (offset >= self.scrollback.len) return null;
        // RingBuffer.get takes *Self, need to check if we can make it const or access data directly
        // RingBuffer logic:
        // physical_index = (self.tail + index) % self.data.len;
        // return &self.data[physical_index];
        // All members are accessible.
        
        // Wait, RingBuffer.get in grid.zig line 109 takes *Self.
        // I should probably access RingBuffer internals directly here or update RingBuffer.get to be const.
        // Let's update RingBuffer.get first?
        // RingBuffer is generic inside grid.zig.
        
        // Actually, let's look at RingBuffer implementation in grid.zig
        return self.scrollback_get_const(offset);
    }

    fn scrollback_get_const(self: *const Grid, offset: usize) ?*const Row {
         // Re-implement get logic for const access to avoid changing RingBuffer everywhere if used mutably
         // or just cast away const if I'm lazy (unsafe).
         // Better: implement getConst in RingBuffer.
         // But RingBuffer is a type returned by function.
         
         const sb = &self.scrollback;
         if (offset >= sb.len) return null;
         const index = sb.len - 1 - offset;
         const p_idx = (sb.tail + index) % sb.data.len;
         return &sb.data[p_idx];
    }

    
    pub fn scrollUp(self: *Grid, lines: u32) void {
        var i: u32 = 0;
        while (i < lines) : (i += 1) {
            const top_row = self.active[0];
            
            if (self.scrollback.push(top_row)) |evicted_row| {
                // Reuse evicted row structure for new line
                var recycled_row = evicted_row;
                // Reset content
                for (recycled_row.cells) |*c| c.* = Cell{};
                recycled_row.dirty = true;
                recycled_row.wrapped = false;
                
                // Shift active rows
                std.mem.copyForwards(Row, self.active[0..self.rows-1], self.active[1..self.rows]);
                
                self.active[self.rows - 1] = recycled_row;
            } else {
                // No eviction, just shift and create new
                std.mem.copyForwards(Row, self.active[0..self.rows-1], self.active[1..self.rows]);
                // Panic if allocation fails is acceptable for this constrained task
                self.active[self.rows - 1] = Row.init(self.allocator, self.cols) catch unreachable;
            }
        }
        
        self.dirty = true;
        self.dirty_rows.setRangeValue(.{ .start = 0, .end = self.rows }, true);
    }
    
    pub fn scrollDown(self: *Grid, lines: u32) void {
        var i: u32 = 0;
        while (i < lines) : (i += 1) {
            // Check if we can pull from scrollback?
            // Actually DEC SD / CSI T usually just scrolls the screen down and fills with empty space at top.
            // It doesn't necessarily pull from history unless it's a specific "unscroll" operation.
            // Standard CSI T behavior is to insert empty lines at the top of the scroll region.
            
            // Reuse the last row for the new top row
            const last_row = self.active[self.rows - 1];
            
            // Shift active rows down
            std.mem.copyBackwards(Row, self.active[1..self.rows], self.active[0..self.rows-1]);
            
            // Clear the recycled row and put it at the top
            var recycled_row = last_row;
            for (recycled_row.cells) |*c| c.* = Cell{};
            recycled_row.dirty = true;
            recycled_row.wrapped = false;
            
            self.active[0] = recycled_row;
        }
        
        self.dirty = true;
        self.dirty_rows.setRangeValue(.{ .start = 0, .end = self.rows }, true);
    }
    
    pub fn clearScreen(self: *Grid) void {
        for (self.active) |*row| {
            for (row.cells) |*c| c.* = Cell{};
            row.dirty = true;
        }
        self.dirty = true;
        self.dirty_rows.setRangeValue(.{ .start = 0, .end = self.rows }, true);
        self.cursor_row = 0;
        self.cursor_col = 0;
    }

    // Removed ReflowResult struct.
    
    pub fn clearLine(self: *Grid, mode: ClearMode) void {
        if (self.cursor_row >= self.rows) return;
        var row = &self.active[self.cursor_row];
        
        const start = switch (mode) {
            .to_end => self.cursor_col,
            .to_start => 0,
            .all => 0,
        };
        
        const end = switch (mode) {
            .to_end => self.cols,
            .to_start => self.cursor_col + 1,
            .all => self.cols,
        };
        
        for (row.cells[start..end]) |*c| {
            c.* = Cell{};
        }
        row.dirty = true;
        self.markRowDirty(self.cursor_row);
    }
    
    pub fn clearToEndOfLine(self: *Grid) void {
        self.clearLine(.to_end);
    }
    
    // SIMPLIFIED RESIZE: Crop/Extend (No Reflow)
    // The previous reflow logic was buggy and caused data loss.
    // For stability, we use standard crop/extend behavior.
    
    pub fn resize(self: *Grid, new_rows: u32, new_cols: u32) !void {
        if (new_rows == self.rows and new_cols == self.cols) return;
        
        // 1. Allocate new active buffer
        var new_active = try self.allocator.alloc(Row, new_rows);
        errdefer self.allocator.free(new_active);
        
        // Initialize new_active with empty rows first
        for (new_active) |*row| {
             row.* = try Row.init(self.allocator, new_cols);
        }
        errdefer {
             for (new_active) |*r| r.deinit();
        }

        // 2. Determine Scroll Offset (How many lines to push to history)
        var scroll_offset: u32 = 0;
        
        // Use the MAX of cursor_row and the last utilized row. 
        // This ensures if there is text at the bottom (but cursor is at top), we anchor to the text.
        const last_content_row = self.findLastNonEmptyRow();
        const anchor_row = @max(self.cursor_row, last_content_row);
        
        if (new_rows < self.rows and anchor_row >= new_rows) {
             scroll_offset = anchor_row - new_rows + 1;
        }
        
        var src_idx: u32 = 0;

        // 3a. Push to Scrollback (Move Ownership)
        var lines_to_push = scroll_offset;
        while (src_idx < self.rows and lines_to_push > 0) : (src_idx += 1) {
             const row = self.active[src_idx];
             const evicted = self.scrollback.push(row);
             if (evicted) |r| {
                 var ev = r;
                 ev.deinit(); 
             }
             lines_to_push -= 1;
        }
        
        // 3b. Move to New Active (Move Ownership + Resize Cols)
        var dst_idx: u32 = 0;
        while (src_idx < self.rows and dst_idx < new_rows) {
             var row = self.active[src_idx];
             src_idx += 1;
             
             if (new_cols != self.cols) {
                  row.resize(new_cols) catch {};
             }
             
             new_active[dst_idx].deinit(); 
             new_active[dst_idx] = row;
             dst_idx += 1;
        }
        
        // 4. Cleanup Old Active (Only Unmoved Rows)
        while (src_idx < self.rows) : (src_idx += 1) {
            self.active[src_idx].deinit();
        }
        self.allocator.free(self.active);

        // 5. Update State
        self.active = new_active;
        
        if (self.cursor_row >= scroll_offset) {
            self.cursor_row -= scroll_offset;
        }
        self.rows = new_rows;
        self.cols = new_cols;

        // Clamp Cursor
        self.cursor_row = @min(self.cursor_row, new_rows - 1);
        self.cursor_col = @min(self.cursor_col, new_cols - 1);

        // Reset Dirty
        self.dirty_rows.deinit();
        self.dirty_rows = try std.DynamicBitSet.initEmpty(self.allocator, new_rows);
        self.dirty_rows.setRangeValue(.{ .start = 0, .end = new_rows }, true);
        self.dirty = true;
    }
    
    // Removed complex reflowContent function entirely.

    
    pub fn isDirty(self: *const Grid) bool {
        return self.dirty;
    }
    
    pub fn markClean(self: *Grid) void {
        self.dirty = false;
        self.dirty_rows.setRangeValue(.{ .start = 0, .end = self.rows }, false);
    }
    
    pub fn markRowDirty(self: *Grid, row: u32) void {
        if (row < self.rows) {
             self.dirty_rows.set(row);
             self.dirty = true;
        }
    }

    pub fn findLastNonEmptyRow(self: *const Grid) u32 {
        var r = self.rows;
        while (r > 0) : (r -= 1) {
            const row = &self.active[r - 1];
            var empty = true;
            for (row.cells) |cell| {
                if (cell.codepoint != ' ' or cell.bg_color != self.active[0].cells[0].bg_color) {
                    empty = false;
                    break;
                }
            }
            if (!empty) return r - 1;
        }
        return 0;
    }

    // --- History Export/Import ---

    pub fn getTotalRows(self: *const Grid) u32 {
        return self.rows + @as(u32, @intCast(self.scrollback.len));
    }

    pub fn getHistoryRow(self: *const Grid, idx: u32) ?*const Row {
        const sb_len = @as(u32, @intCast(self.scrollback.len));
        if (idx < sb_len) {
            // It's in scrollback. 
            // offset 0 is MOST RECENT.
            // So for history export, we want OLDEST first.
            // Oldest is sb_len - 1.
            const sb_offset = sb_len - 1 - idx;
            return self.getScrollbackRow(sb_offset);
        } else {
            const active_idx = idx - sb_len;
            if (active_idx < self.rows) {
                return &self.active[active_idx];
            }
        }
        return null;
    }

    pub fn clearHistory(self: *Grid) void {
        // Clear scrollback
        var i: usize = 0;
        while (i < self.scrollback.len) : (i += 1) {
            if (self.scrollback.get(i)) |row| {
                row.deinit();
            }
        }
        self.scrollback.len = 0;
        self.scrollback.head = 0;
        self.scrollback.tail = 0;
        
        // Clear active
        self.clearScreen();
    }

    pub fn appendHistoryRow(self: *Grid, cells: []const Cell, wrapped: bool) !void {
        // This is used for restoration. We append to history, which effectively pushes current lines up.
        // Actually, if we are restoring, we probably want to fill the scrollback first, then the active buffer.
        
        // Simple strategy: Always push current active[0] to scrollback and put new row at active[rows-1]
        // But if we are restoring, we are starting from empty.
        
        // Let's implement a more direct 'restore' that fills the grid.
        _ = self;
        _ = cells;
        _ = wrapped;
    }
};
