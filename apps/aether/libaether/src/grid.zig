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
        _ = self;
        _ = lines;
        // Placeholder as discussed
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
    
    pub fn resize(self: *Grid, new_rows: u32, new_cols: u32) !void {
        if (new_rows == self.rows and new_cols == self.cols) return;
        
        // Create new active area
        var new_active = try self.allocator.alloc(Row, new_rows);
        for (new_active) |*row| {
            row.* = try Row.init(self.allocator, new_cols);
        }
        
        // Copy existing content with reflow
        // Copy existing content with reflow
        if (new_cols != self.cols) {
            // Reflow: rewrap lines based on new column count
            const res = try self.reflowContent(new_active, new_cols);
            // Update cursor position from reflow result
            // (We assign to self.cursor_row later, but need to store it to avoid overwrite by clamp?)
            // Actually, we assign self.rows = new_rows later.
            // Let's store result and apply it after swapping active.
            self.cursor_row = res.cursor_row;
            self.cursor_col = res.cursor_col;
        } else {
            // Same width: just copy rows
            const copy_rows = @min(self.rows, new_rows);
            for (0..copy_rows) |i| {
                const src = &self.active[i];
                const dst = &new_active[i];
                const copy_cols = @min(self.cols, new_cols);
                @memcpy(dst.cells[0..copy_cols], src.cells[0..copy_cols]);
                dst.dirty = true;
                dst.wrapped = src.wrapped;
            }
        }
        
        // Free old active area
        for (self.active) |*row| row.deinit();
        self.allocator.free(self.active);
        
        self.active = new_active;
        self.rows = new_rows;
        self.cols = new_cols;
        
        // Clamp cursor
        self.cursor_row = @min(self.cursor_row, new_rows - 1);
        self.cursor_col = @min(self.cursor_col, new_cols - 1);
        
        self.dirty_rows.deinit();
        self.dirty_rows = try std.DynamicBitSet.initEmpty(self.allocator, new_rows);
        self.dirty_rows.setRangeValue(.{ .start = 0, .end = new_rows }, true);
        self.dirty = true;
    }

    pub const ReflowResult = struct {
        cursor_row: u32,
        cursor_col: u32,
    };

    fn reflowContent(self: *Grid, new_active: []Row, new_cols: u32) !ReflowResult {
        // 1. Collect all text content as logical lines
        var logical_lines = std.ArrayListUnmanaged([]Cell){};
        defer {
            for (logical_lines.items) |line| self.allocator.free(line);
            logical_lines.deinit(self.allocator);
        }
        
        // Logical cursor tracking
        var cursor_logic_line_idx: ?usize = null;
        var cursor_logic_offset: usize = 0;
        var current_logic_line_idx: usize = 0;
        
        // Build logical lines by combining wrapped rows
        var current_line = std.ArrayListUnmanaged(Cell){};
        defer current_line.deinit(self.allocator);
        
        // Helper to track cursor position during collection
        // Cursor is at (self.cursor_row, self.cursor_col)
        var row_idx: u32 = 0;

        for (self.active) |*row| {
            // Check if cursor is on this row
            if (row_idx == self.cursor_row) {
                cursor_logic_line_idx = current_logic_line_idx;
                cursor_logic_offset = current_line.items.len + self.cursor_col;
            }
            
            try current_line.appendSlice(self.allocator, row.cells);
            
            if (!row.wrapped) {
                // End of logical line
                try logical_lines.append(self.allocator, try current_line.toOwnedSlice(self.allocator));
                // current_line is now empty but capacity transferred. Re-init? 
                // toOwnedSlice returns slice owned by caller. ArrayList is defunct?
                // No, toOwnedSlice resets list to empty but invalidates previous pointer?
                // Wait, toOwnedSlice makes the list empty and capacity 0.
                // We need a fresh list or re-init?
                // current_line = std.ArrayList(Cell).init(self.allocator); 
                // But `defer deinit` runs on scope exit.
                // Modifying deferred variable is dangerous.
                // Better pattern: use new list each iteration or reinit.
                // std.ArrayList doesn't have `clearRetainingCapacity` after toOwnedSlice.
                // We must re-init.
                current_line = std.ArrayListUnmanaged(Cell){};
                current_logic_line_idx += 1;
            }
            row_idx += 1;
        }
        
        // Handle trailing wrapped line (shouldn't happen if last row is not wrapped usually, but safe)
        if (current_line.items.len > 0) {
            // If cursor was on last row and it was wrapped (incomplete logical line at end of buffer)
            // But active buffer usually ends with non-wrapped empty lines unless text fills it.
            // If cursor was here:
             if (row_idx == self.cursor_row) { // row_idx is now past end? No, loop finished.
                 // This case is tricky if cursor was beyond last active row? No, cursor is clamped.
             }
             // Wait, if self.cursor_row was past last row (shouldn't be), we missed it.
             // If cursor was on the very last processed row, we captured it inside loop.
             
            try logical_lines.append(self.allocator, try current_line.toOwnedSlice(self.allocator));
        }
        
        // If cursor wasn't found (e.g. cursor at bottom empty area where no logical line exists yet?)
        // The loop covers all `active` rows.
        // If `active` rows are empty, they form empty logical lines.
        // So cursor should be found. 
        // Except if cursor_row >= active.len.
        
        // 2. Calculate newly needed rows
        var total_needed_rows: usize = 0;
        var cursor_final_row: u32 = 0;
        var cursor_final_col: u32 = 0;
        
        // Pre-calculate layout to find overflow
        // We need to know where each logical line STARTS in the new layout.
        var line_start_rows = std.ArrayListUnmanaged(usize){};
        defer line_start_rows.deinit(self.allocator);
        
        for (logical_lines.items) |line| {
            try line_start_rows.append(self.allocator, total_needed_rows);
            // Number of rows this line takes
            var rows_for_line: usize = 0;
            if (line.len == 0) {
                rows_for_line = 1;
            } else {
                rows_for_line = (line.len + new_cols - 1) / new_cols;
            }
            total_needed_rows += rows_for_line;
        }
        
        // 3. Determine Skip (Overflow handling)
        // If we have more rows than fit, we align to BOTTOM.
        // i.e., we skip the top (total - new_rows).
        var skip_rows: usize = 0;
        if (total_needed_rows > new_active.len) {
            skip_rows = total_needed_rows - new_active.len;
            
            // Should we push skipped rows to scrollback?
            // Yes, if we want to preserve history.
            // But we can't easily execute "scrollUp" here without modifying `active`.
            // We can manually push to `self.scrollback`.
            // But we need to construct Rows.
            // Complex. For now, let's just drop them (standard resize behavior often drops top).
            // Better: Just drop.
        }
        
        // 4. Fill New Active Rows
        // 4. Fill New Active Rows
        // unused variable removed
        // Actually, we iterate logical lines and place them.
        // Virtual row index from 0 to total_needed_rows.
        
        var virtual_row: usize = 0;
        
        for (logical_lines.items, 0..) |line, l_idx| {
            var col_idx: usize = 0;
            
            // Loop for each physical row of this logical line
            while (col_idx < line.len or (col_idx == 0 and line.len == 0)) {
                
                const chunk_len = @min(@as(usize, new_cols), line.len - col_idx);
                
                // Visible check
                if (virtual_row >= skip_rows and (virtual_row - skip_rows) < new_active.len) {
                    const dst_r = virtual_row - skip_rows;
                    var row = &new_active[dst_r];
                    
                    if (chunk_len > 0) {
                         @memcpy(row.cells[0..chunk_len], line[col_idx..col_idx+chunk_len]);
                    }
                    
                    // Logic for wrapped flag
                    // If this isn't the last chunk of the logical line, it's wrapped.
                    if (col_idx + chunk_len < line.len) {
                        row.wrapped = true;
                    }
                    // Else dirty=true (default)
                }
                
                // Track Cursor
                if (cursor_logic_line_idx) |c_idx| {
                    if (c_idx == l_idx) {
                        // Cursor is on this logical line.
                        // Is it in this chunk?
                        // Cursor offset: cursor_logic_offset
                        // Chunk range: [col_idx, col_idx + new_cols)
                        if (cursor_logic_offset >= col_idx and cursor_logic_offset < col_idx + new_cols) {
                            // Found it!
                            // Calculate where it lands
                            if (virtual_row >= skip_rows) {
                                cursor_final_row = @intCast(virtual_row - skip_rows);
                                cursor_final_col = @intCast(cursor_logic_offset - col_idx);
                            } else {
                                // Cursor scrolled off top?
                                // Clamp to top?
                                cursor_final_row = 0;
                                cursor_final_col = @intCast(cursor_logic_offset - col_idx);
                            }
                        }
                    }
                }
                
                if (chunk_len > 0) {
                    col_idx += chunk_len;
                } else {
                    col_idx += 1; // consume empty line
                }
                
                virtual_row += 1;
                
                if (col_idx >= line.len and line.len > 0) break;
            }
        }
        
        // If cursor was beyond end (e.g. at end of line), clamp
        if (cursor_final_col >= new_cols) cursor_final_col = new_cols - 1;
        if (cursor_final_row >= new_active.len) cursor_final_row = @intCast(new_active.len - 1);
        
        return ReflowResult{ .cursor_row = cursor_final_row, .cursor_col = cursor_final_col };
    }
    
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
};
