const std = @import("std");
pub const Terminal = @import("terminal.zig").Terminal;
const terminal_mod = @import("terminal.zig");
pub const Grid = @import("grid.zig").Grid;
pub const Cell = @import("grid.zig").Cell;
pub const Pty = @import("pty.zig").Pty;
pub const Config = @import("config.zig").Config;
pub const TomlParser = @import("config.zig").TomlParser;
pub const parseHexColor = @import("config.zig").parseHexColor;

const c = @cImport({
    @cInclude("libproc.h");
    @cInclude("sys/errno.h");
});

// Use C allocator (malloc) for better performance and thread safety in release
var gpa = std.heap.c_allocator;

// Callback registration functions (called from Swift)
pub export fn aether_set_title_callback(cb: ?*const fn ([*]const u8, usize) callconv(.c) void) void {
    terminal_mod.cb_set_title = cb;
}

pub export fn aether_set_clipboard_callback(cb: ?*const fn ([*]const u8, usize) callconv(.c) void) void {
    terminal_mod.cb_set_clipboard = cb;
}

pub export fn aether_set_get_clipboard_callback(cb: ?*const fn () callconv(.c) ?[*:0]const u8) void {
    terminal_mod.cb_get_clipboard = cb;
}
pub export fn aether_terminal_new(rows: u32, cols: u32) ?*Terminal {
    const term = gpa.create(Terminal) catch return null;
    term.* = Terminal.init(gpa, rows, cols) catch {
        gpa.destroy(term);
        return null;
    };
    return term;
}

pub export fn aether_terminal_with_pty(rows: u32, cols: u32, shell: ?[*:0]const u8, cwd: ?[*:0]const u8, ctrlc_sends_sigint: bool) ?*Terminal {
    const term = gpa.create(Terminal) catch return null;
    term.* = Terminal.initWithPty(gpa, rows, cols, shell, cwd, ctrlc_sends_sigint) catch {
        gpa.destroy(term);
        return null;
    };
    return term;
}

pub export fn aether_terminal_free(term: ?*Terminal) void {
    if (term) |t| {
        t.deinit();
        gpa.destroy(t);
    }
}

pub export fn aether_write_input(term: ?*Terminal, data: [*]const u8, len: usize) i32 {
    if (term) |t| {
        t.writeInput(data[0..len]) catch return -1;
        return @intCast(len);
    }
    return -1;
}

pub export fn aether_process_output(term: ?*Terminal) void {
    if (term) |t| {
        t.processOutput() catch {};
    }
}


pub export fn aether_get_cell(term: ?*const Terminal, row: u32, col: u32) ?*const Cell {
    if (term) |t| {
        return t.getRenderCell(row, col);
    }
    return null;
}

pub export fn aether_scroll_view(term: ?*Terminal, delta: i32) void {
    if (term) |t| {
        t.scrollView(delta);
    }
}

pub export fn aether_scroll_to_bottom(term: ?*Terminal) void {
    if (term) |t| {
        t.scrollToBottom();
    }
}

pub export fn aether_selection_start(term: ?*Terminal, row: u32, col: u32) void {
    if (term) |t| {
        t.selection.active = true;
        const stable_r = @as(i32, @intCast(row)) - @as(i32, @intCast(t.scroll_offset));
        t.selection.start_row = stable_r;
        t.selection.start_col = col;
        t.selection.end_row = stable_r;
        t.selection.end_col = col;
        t.dirty = true;
    }
}

pub export fn aether_selection_drag(term: ?*Terminal, row: u32, col: u32) void {
    if (term) |t| {
        if (t.selection.active) {
            const stable_r = @as(i32, @intCast(row)) - @as(i32, @intCast(t.scroll_offset));
            t.selection.end_row = stable_r;
            t.selection.end_col = col;
            t.dirty = true;
        }
    }
}

pub export fn aether_selection_end(term: ?*Terminal, row: u32, col: u32) void {
    if (term) |t| {
        if (t.selection.active) {
             const stable_r = @as(i32, @intCast(row)) - @as(i32, @intCast(t.scroll_offset));
             t.selection.end_row = stable_r;
             t.selection.end_col = col;
             t.dirty = true;
        }
    }
}

pub export fn aether_selection_clear(term: ?*Terminal) void {
    if (term) |t| {
        t.selection.active = false;
        t.dirty = true;
    }
}

pub export fn aether_selection_is_active(term: ?*Terminal) bool {
    if (term) |t| return t.selection.active;
    return false;
}

pub export fn aether_selection_contains(term: ?*Terminal, row: u32, col: u32) bool {
    if (term) |t| {
        return t.selection.contains(row, col, t.scroll_offset);
    }
    return false;
}

pub export fn aether_get_selection(term: ?*Terminal) ?[*:0]u8 {
    if (term) |t| {
        const text = t.getSelectionText(gpa) catch return null;
        // Append null terminator? toOwnedSlice returns slice.
        // We need a null-terminated string for C.
        // Reallocate or just append null?
        // Zig slices are not null terminated by default unless Sentinel is used.
        // But getSelectionText returns []u8.
        
        // Let's create a null-terminated copy.
        const c_str = gpa.allocSentinel(u8, text.len, 0) catch {
            gpa.free(text);
            return null;
        };
        @memcpy(c_str, text);
        gpa.free(text);
        return c_str;
    }
    return null;
}

pub export fn aether_free_string(str: ?[*:0]u8) void {
    if (str) |s| {
        gpa.free(std.mem.span(s));
    }
}

pub export fn aether_set_cursor_style(term: ?*Terminal, style: u8) void {
    if (term) |t| {
        if (style > 2) return;
        t.setCursorStyle(@enumFromInt(style));
    }
}

pub export fn aether_get_cursor(term: ?*const Terminal) extern struct { row: u32, col: u32, visible: bool, style: u8 } {
    if (term) |t| {
        const cur = t.getCursor();
        return .{ .row = cur.row, .col = cur.col, .visible = cur.visible, .style = @intFromEnum(cur.style) };
    }
    return .{ .row = 0, .col = 0, .visible = false, .style = 0 };
}

pub const AetherScrollInfo = extern struct {
    total_rows: u32,
    visible_rows: u32,
    scrollback_rows: u32,
    viewport_offset: u32,
};

pub export fn aether_get_scroll_info(term: ?*Terminal) AetherScrollInfo {
    if (term) |t| {
        return AetherScrollInfo{
            .total_rows = t.grid.rows + @as(u32, @intCast(t.grid.scrollback.len)),
            .visible_rows = t.grid.rows,
            .scrollback_rows = @as(u32, @intCast(t.grid.scrollback.len)),
            .viewport_offset = t.scroll_offset,
        };
    }
    return AetherScrollInfo{ .total_rows = 0, .visible_rows = 0, .scrollback_rows = 0, .viewport_offset = 0 };
}

pub export fn aether_scroll_to(term: ?*Terminal, offset: u32) void {
    if (term) |t| {
        t.scrollTo(offset);
    }
}

pub export fn aether_resize(term: ?*Terminal, rows: u32, cols: u32) bool {
    if (term) |t| {
        if (t.grid.rows == rows and t.grid.cols == cols) return true;
        t.resize(rows, cols) catch return false;
        return true;
    }
    return false;
}



pub export fn aether_mouse_event(term: ?*Terminal, button: u8, pressed: bool, row: u32, col: u32, dragging: bool) bool {
    if (term) |t| {
        return t.sendMouseEvent(button, pressed, row, col, dragging);
    }
    return false;
}

pub export fn aether_is_dirty(term: ?*const Terminal) bool {
    if (term) |t| return t.isDirty();
    return false;
}

pub export fn aether_mark_clean(term: ?*Terminal) void {
    if (term) |t| t.markClean();
}

pub export fn aether_get_pid(term: ?*const Terminal) i32 {
    if (term) |t| {
        if (t.pty) |p| {
            return p.child_pid;
        }
    }
    return -1;
}

pub export fn aether_get_tty(term: ?*const Terminal, buf: [*]u8, len: usize) usize {
    if (term) |t| {
        if (t.pty) |p| {
            // Find null terminator or end
            var name_len: usize = 0;
            while (name_len < p.tty_name.len and p.tty_name[name_len] != 0) : (name_len += 1) {}
            
            const to_copy = @min(len - 1, name_len);
            @memcpy(buf[0..to_copy], p.tty_name[0..to_copy]);
            buf[to_copy] = 0;
            return to_copy;
        }
    }
    return 0;
}

pub export fn aether_get_cwd(pid: i32, buf: [*]u8, len: usize) usize {
    var vnode_info: c.proc_vnodepathinfo = undefined;
    const res = c.proc_pidinfo(pid, c.PROC_PIDVNODEPATHINFO, 0, &vnode_info, @sizeOf(c.proc_vnodepathinfo));
    if (res > 0) {
        const path = &vnode_info.pvi_cdir.vip_path;
        // path is [1024]u8
        var path_len: usize = 0;
        while (path_len < 1024 and path[path_len] != 0) : (path_len += 1) {}
        
        const to_copy = @min(len - 1, path_len);
        @memcpy(buf[0..to_copy], path[0..to_copy]);
        buf[to_copy] = 0;
        return to_copy;
    }
    return 0;
}

pub export fn aether_get_cols(term: ?*const Terminal) u32 {
    if (term) |t| {
        return t.grid.cols;
    }
    return 80;
}

pub export fn aether_get_rows(term: ?*const Terminal) u32 {
    if (term) |t| {
        return t.grid.rows;
    }
    return 24;
}

// --- History API ---

pub export fn aether_terminal_get_history_count(term: ?*const Terminal) u32 {
    if (term) |t| return t.getHistoryCount();
    return 0;
}

pub export fn aether_terminal_get_history_row(term: ?*const Terminal, idx: u32, cells: [*]Cell) bool {
    if (term) |t| {
        if (t.getHistoryRow(idx)) |row| {
            @memcpy(cells[0..t.grid.cols], row.cells[0..t.grid.cols]);
            return true;
        }
    }
    return false;
}

pub export fn aether_terminal_get_row_metadata(term: ?*const Terminal, idx: u32) extern struct { wrapped: bool, semantic_prompt: bool } {
    if (term) |t| {
        if (t.getHistoryRow(idx)) |row| {
            return .{ .wrapped = row.wrapped, .semantic_prompt = row.semantic_prompt };
        }
    }
    return .{ .wrapped = false, .semantic_prompt = false };
}

pub export fn aether_terminal_clear_history(term: ?*Terminal) void {
    if (term) |t| t.clearHistory();
}

pub export fn aether_terminal_append_history_row(term: ?*Terminal, cells: [*]const Cell, cells_len: u32, wrapped: bool, semantic_prompt: bool) bool {
    if (term) |t| {
        // We want to fill the grid from top to bottom during restoration.
        // To avoid black space, we fill the active grid first, then scroll.
        
        const cols = t.grid.cols;
        const rows = t.grid.rows;
        const to_copy = @min(cols, cells_len);
        
        if (t.cursor_row < rows) {
            // Still filling the initial screen
            const row_idx = t.cursor_row;
            @memcpy(t.grid.active[row_idx].cells[0..to_copy], cells[0..to_copy]);
            
            // Fill remaining columns with empty cells if input was shorter
            if (to_copy < cols) {
                for (t.grid.active[row_idx].cells[to_copy..]) |*cell| {
                    cell.* = Cell{};
                }
            }
            
            t.grid.active[row_idx].wrapped = wrapped;
            t.grid.active[row_idx].semantic_prompt = semantic_prompt;
            t.grid.active[row_idx].dirty = true;
            
            // Move cursor to next line for next append, or stay at bottom
            if (t.cursor_row + 1 < rows) {
                t.cursor_row += 1;
            } else {
                // We just filled the last row.
                // Keep cursor at last row.
                t.cursor_row = rows - 1;
            }
        } else {
            // Screen is full, push top row to history and append at bottom
            t.grid.scrollUp(1);
            const last_idx = rows - 1;
            @memcpy(t.grid.active[last_idx].cells[0..to_copy], cells[0..to_copy]);
            
            if (to_copy < cols) {
                for (t.grid.active[last_idx].cells[to_copy..]) |*cell| {
                    cell.* = Cell{};
                }
            }
            
            t.grid.active[last_idx].wrapped = wrapped;
            t.grid.active[last_idx].semantic_prompt = semantic_prompt;
            t.grid.active[last_idx].dirty = true;
            
            t.cursor_row = rows - 1;
        }
        
        // Sync Grid cursor (important for some internal operations)
        t.grid.cursor_row = t.cursor_row;
        t.grid.cursor_col = 0;
        
        t.dirty = true;
        return true;
    }
    return false;
}

pub export fn aether_version() [*:0]const u8 {
    return "0.1.0";
}
