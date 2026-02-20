const std = @import("std");
const Terminal = @import("terminal.zig").Terminal;

pub const State = enum {
    ground,
    escape,
    escape_intermediate,
    csi_entry,
    csi_param,
    csi_intermediate,
    csi_ignore,
    dcs_entry,
    dcs_param,
    dcs_intermediate,
    dcs_passthrough,
    dcs_ignore,
    osc_string,
    sos_pm_apc_string,
};

pub const Parser = struct {
    state: State = .ground,
    params: [16]u16 = [_]u16{0} ** 16,
    param_count: u8 = 0,
    intermediates: [4]u8 = [_]u8{0} ** 4,
    intermediate_count: u8 = 0,
    osc_buffer: [256]u8 = undefined, // Small buffer for OSC
    osc_len: usize = 0,
    
    // UTF-8 State
    utf8_buf: [4]u8 = undefined,
    utf8_len: u8 = 0,
    utf8_expected: u8 = 0,
    
    pub fn feed(self: *Parser, terminal: *Terminal, data: []const u8) void {
        for (data) |byte| {
            self.advance(terminal, byte);
        }
    }
    
    fn advance(self: *Parser, terminal: *Terminal, byte: u8) void {
        // Handle C0 controls anywhere (0x00-0x1F)
        if (byte < 0x20) {
            // Cancel any pending UTF-8 sequence on control char
            self.utf8_len = 0; 
            
            switch (byte) {
                0x00 => {}, // NUL ignore
                0x07 => terminal.bell(),
                0x08 => terminal.backspace(),
                0x09 => terminal.tab(),
                0x0A, 0x0B, 0x0C => terminal.lineFeed(),
                0x0D => terminal.carriageReturn(),
                0x1B => {
                    self.state = .escape;
                    return;
                },
                0x18, 0x1A => { // CAN, SUB -> execute then ground
                    self.state = .ground;
                    return;
                },
                else => {}, // Ignore others
            }
            if (self.state != .osc_string) return;
        }
        
        switch (self.state) {
            .ground => self.handleGround(terminal, byte),
            .escape => self.handleEscape(terminal, byte),
            .escape_intermediate => self.handleEscapeIntermediate(terminal, byte),
            .csi_entry => self.handleCsiEntry(terminal, byte),
            .csi_param => self.handleCsiParam(terminal, byte),
            .csi_intermediate => self.handleCsiIntermediate(terminal, byte),
            .csi_ignore => self.handleCsiIgnore(terminal, byte),
            // Minimal OSC support
            .osc_string => self.handleOscString(terminal, byte),
            else => self.state = .ground, // Fallback
        }
    }
    
    fn handleGround(self: *Parser, terminal: *Terminal, byte: u8) void {
        if (byte < 0x80) {
            // ASCII - reset UTF-8 state if we were expecting something
            if (self.utf8_len > 0) {
                 // Invalid sequence interrupted by ASCII.
                 // Conventionally emit Replacement, or just drop.
                 terminal.putChar(0xFFFD);
                 self.utf8_len = 0;
            }
            if (byte >= 0x20 and byte <= 0x7E) {
                terminal.putChar(byte);
            }
        } else {
            // UTF-8 byte
            if (self.utf8_len == 0) {
                // Determine length
                const len = std.unicode.utf8ByteSequenceLength(byte) catch {
                    terminal.putChar(0xFFFD); // Invalid start byte
                    return;
                };
                self.utf8_expected = len;
                self.utf8_buf[0] = byte;
                self.utf8_len = 1;
            } else {
                // Continuation byte
                if (self.utf8_len < self.utf8_expected) {
                    self.utf8_buf[self.utf8_len] = byte;
                    self.utf8_len += 1;
                } else {
                    // Overflow/Invalid state? Reset
                    terminal.putChar(0xFFFD);
                    self.utf8_len = 0;
                    // Should we re-process this byte as start?
                    // Simplified: just drop and check if it's a start
                    _ = self.handleGround(terminal, byte); // Recurse once
                    return;
                }
            }
            
            if (self.utf8_len == self.utf8_expected) {
                const slice = self.utf8_buf[0..self.utf8_len];
                const codepoint = std.unicode.utf8Decode(slice) catch {
                    terminal.putChar(0xFFFD);
                    self.utf8_len = 0;
                    return;
                };
                terminal.putChar(codepoint);
                self.utf8_len = 0;
            }
        }
    }
    
    fn handleEscape(self: *Parser, terminal: *Terminal, byte: u8) void {
        switch (byte) {
            '[' => {
                self.resetParams();
                self.state = .csi_entry;
            },
            ']' => {
                self.osc_len = 0;
                self.state = .osc_string;
            },
            '(' => self.state = .escape_intermediate, // G0 set
            ')' => self.state = .escape_intermediate, // G1 set
            // Simple Escape sequences
            '7' => { terminal.saveCursor(); self.state = .ground; },
            '8' => { terminal.restoreCursor(); self.state = .ground; },
            // ... others
            else => self.state = .ground, 
        }
    }
    
    fn handleEscapeIntermediate(self: *Parser, terminal: *Terminal, byte: u8) void {
        _ = terminal;
        _ = byte;
        // Ignore character sets for now
        self.state = .ground;
    }

    fn handleCsiEntry(self: *Parser, terminal: *Terminal, byte: u8) void {
        if (byte >= '0' and byte <= '9') {
            self.param_count = 1; // Start first param
            self.params[0] = byte - '0';
            self.state = .csi_param;
        } else if (byte == ';') {
            self.param_count = 1; // Implicit 0
            self.params[0] = 0;
            self.state = .csi_param; 
            // Wait, usually ';' means param separator. If at start, first param is default (0).
            // Then we move to next.
            if (self.param_count < 15) {
                self.param_count += 1; // Now at index 1
            }
        } else if (byte >= 0x20 and byte <= 0x2F) {
            // Intermediate bytes
            if (self.intermediate_count < 4) {
                self.intermediates[self.intermediate_count] = byte;
                self.intermediate_count += 1;
            }
            self.state = .csi_intermediate;
        } else if (byte >= 0x30 and byte <= 0x3F) {
            // Parameters and separators handled above (0-9, ;)
            // But 0x3A-0x3F are also parameter bytes (:, <, =, >, ?)
             // ... [logic for ?, >, <] ...
            if (byte == '?' or byte == '>' or byte == '<') {
                if (self.intermediate_count < 4) {
                    self.intermediates[self.intermediate_count] = byte;
                    self.intermediate_count += 1;
                }
                self.state = .csi_param; 
            } else {
                 self.state = .csi_param;
            }
        } else if (byte >= 0x40 and byte <= 0x7E) {
            self.dispatchCsi(terminal, byte);
            self.state = .ground;
        } else {
            self.state = .csi_ignore;
        }
    }
    
    fn handleCsiParam(self: *Parser, terminal: *Terminal, byte: u8) void {
        if (byte >= '0' and byte <= '9') {
            if (self.param_count == 0) self.param_count = 1;
            const idx = self.param_count - 1;
            // Saturating add to prevent overflow
            const old = self.params[idx];
            if (old < 6000) { // Reasonable limit
                 self.params[idx] = old * 10 + (byte - '0');
            }
        } else if (byte == ';') {
             if (self.param_count == 0) self.param_count = 1; // First was 0
             if (self.param_count < 16) self.param_count += 1;
        } else if (byte >= 0x20 and byte <= 0x2F) {
            // Intermediate inside param state -> switch to intermediate
            if (self.intermediate_count < 4) {
                self.intermediates[self.intermediate_count] = byte;
                self.intermediate_count += 1;
            }
            self.state = .csi_intermediate;
        } else if (byte >= 0x40 and byte <= 0x7E) {
            if (self.param_count == 0) self.param_count = 1; // Default 0
            self.dispatchCsi(terminal, byte);
            self.state = .ground;
        } else {
            self.state = .csi_ignore;
        }
    }
    
    fn handleCsiIntermediate(self: *Parser, terminal: *Terminal, byte: u8) void {
        if (byte >= 0x40 and byte <= 0x7E) {
            // Dispatch with intermediates
            self.dispatchCsi(terminal, byte);
             self.state = .ground;
        } else if (byte >= 0x20 and byte <= 0x2F) {
            // Another intermediate
            if (self.intermediate_count < 4) {
                self.intermediates[self.intermediate_count] = byte;
                self.intermediate_count += 1;
            }
        } else if (byte < 0x20) {
            // C0/C1 - handled in advance
        } else {
             self.state = .csi_ignore;
        }
    }
    
    fn handleCsiIgnore(self: *Parser, terminal: *Terminal, byte: u8) void {
        _ = terminal;
        if (byte >= 0x40 and byte <= 0x7E) {
            self.state = .ground;
        }
    }
    
    fn handleOscString(self: *Parser, terminal: *Terminal, byte: u8) void {
        if (byte == 0x07) { // BEL terminates
            self.finalizeOsc(terminal);
            self.state = .ground;
        } else if (byte == 0x1B) { // ESC terminates (should be handled by advance, but just in case)
             // If we reach here, it means 0x1B was treated as data? No, advance catches it.
        } else {
             if (self.osc_len < self.osc_buffer.len) {
                 self.osc_buffer[self.osc_len] = byte;
                 self.osc_len += 1;
             }
        }
    }
    
    fn finalizeOsc(self: *Parser, terminal: *Terminal) void {
        const data = self.osc_buffer[0..self.osc_len];
        if (data.len == 0) return;

        var i: usize = 0;
        var cmd_val: u16 = 0;
        var has_cmd = false;
        
        while (i < data.len) : (i += 1) {
            const c = data[i];
            if (c >= '0' and c <= '9') {
                cmd_val = cmd_val * 10 + (c - '0');
                has_cmd = true;
            } else if (c == ';') {
                i += 1;
                break;
            } else {
                break;
            }
        }
        
        if (!has_cmd) return;
        const payload = if (i <= data.len) data[i..] else "";
        
        switch (cmd_val) {
            0, 2 => {
                // Title
                terminal.setTitle(payload);
            },
            52 => {
                // Clipboard: 52;c;base64
                if (payload.len >= 2 and payload[1] == ';') {
                    const selection = payload[0];
                    const content = payload[2..];
                    if (content.len > 0 and content[0] == '?') {
                         terminal.queryClipboard(selection);
                    } else {
                         terminal.setClipboard(selection, content);
                    }
                }
            },
            else => {},
        }
        self.osc_len = 0;
    }
    
    fn dispatchCsi(self: *Parser, terminal: *Terminal, final: u8) void {
        const params = self.params[0..self.param_count];
        const private = self.intermediate_count > 0 and self.intermediates[0] == '?';
        
        switch (final) {
            'A' => terminal.cursorUp(getParam(params, 0, 1)),
            'B' => terminal.cursorDown(getParam(params, 0, 1)),
            'C' => terminal.cursorForward(getParam(params, 0, 1)),
            'D' => terminal.cursorBack(getParam(params, 0, 1)),
            'H', 'f' => terminal.setCursorPos(getParam(params, 0, 1), getParam(params, 1, 1)),
            'J' => terminal.eraseDisplay(getParam(params, 0, 0)),
            'K' => terminal.eraseLine(getParam(params, 0, 0)),
            'L' => terminal.insertLines(getParam(params, 0, 1)),
            'M' => terminal.deleteLines(getParam(params, 0, 1)),
            'P' => terminal.deleteChars(getParam(params, 0, 1)),
            'E' => terminal.cursorNextLine(getParam(params, 0, 1)),
            'F' => terminal.cursorPrecedingLine(getParam(params, 0, 1)),
            'G' => terminal.cursorHorizontalAbsolute(getParam(params, 0, 1)),
            'S' => terminal.scrollUp(getParam(params, 0, 1)),
            'T' => terminal.scrollDown(getParam(params, 0, 1)),
            'X' => terminal.eraseChars(getParam(params, 0, 1)),
            '@' => terminal.insertChars(getParam(params, 0, 1)),
            'm' => self.handleSgr(terminal, params),
            'h' => if (private) terminal.setPrivateMode(getParam(params, 0, 0), true),
            'l' => if (private) terminal.setPrivateMode(getParam(params, 0, 0), false),
            's' => terminal.saveCursor(),
            'u' => terminal.restoreCursor(),
            'r' => terminal.setScrollRegion(getParam(params, 0, 0), getParam(params, 1, 0)),
            'n' => terminal.deviceStatusReport(getParam(params, 0, 0)),
            'c' => terminal.deviceAttributes(),
            'q' => {
                 // DECSCUSR: CSI Ps SP q
                 if (self.intermediate_count > 0 and self.intermediates[0] == ' ') {
                     const style = getParam(params, 0, 1); // Default 1 (Blink Block)
                     switch (style) {
                         0, 1 => terminal.setCursorStyle(.block), // Blink Block
                         2 => terminal.setCursorStyle(.block),    // Steady Block (TODO: separate blink state?)
                         3 => terminal.setCursorStyle(.underline), // Blink Underline
                         4 => terminal.setCursorStyle(.underline), // Steady Underline
                         5 => terminal.setCursorStyle(.bar),       // Blink Bar
                         6 => terminal.setCursorStyle(.bar),       // Steady Bar
                         else => {},
                     }
                 }
            },
            else => {},
        }
    }
    
    fn getParam(params: []const u16, idx: usize, default: u16) u16 {
        if (idx < params.len) {
             const val = params[idx];
             if (val == 0) return default;
             return val;
        }
        return default;
    }
    
    fn handleSgr(self: *Parser, terminal: *Terminal, params: []const u16) void {
        _ = self;
        if (params.len == 0) {
            terminal.resetAttributes();
            return;
        }
        
        var i: usize = 0;
        while (i < params.len) : (i += 1) {
            const p = params[i];
            switch (p) {
                0 => terminal.resetAttributes(),
                1 => terminal.current_flags.bold = true,
                2 => terminal.current_flags.dim = true,
                3 => terminal.current_flags.italic = true,
                4 => terminal.current_flags.underline = true,
                7 => terminal.current_flags.reverse = true,
                22 => { terminal.current_flags.bold = false; terminal.current_flags.dim = false; },
                23 => terminal.current_flags.italic = false,
                24 => terminal.current_flags.underline = false,
                27 => terminal.current_flags.reverse = false,
                30...37 => terminal.current_fg = standardColor(p - 30),
                38 => {
                    // Extended foreground
                    if (i + 2 < params.len and params[i + 1] == 5) {
                        terminal.current_fg = color256(params[i + 2]);
                        i += 2;
                    } else if (i + 4 < params.len and params[i + 1] == 2) {
                        terminal.current_fg = rgb(params[i + 2], params[i + 3], params[i + 4]);
                        i += 4;
                    }
                },
                39 => terminal.current_fg = terminal.default_fg,
                40...47 => terminal.current_bg = standardColor(p - 40),
                48 => {
                    // Extended background
                    if (i + 2 < params.len and params[i + 1] == 5) {
                        terminal.current_bg = color256(params[i + 2]);
                        i += 2;
                    } else if (i + 4 < params.len and params[i + 1] == 2) {
                        terminal.current_bg = rgb(params[i + 2], params[i + 3], params[i + 4]);
                        i += 4;
                    }
                },
                49 => terminal.current_bg = terminal.default_bg,
                90...97 => terminal.current_fg = brightColor(p - 90),
                100...107 => terminal.current_bg = brightColor(p - 100),
                else => {},
            }
        }
    }
    
    fn resetParams(self: *Parser) void {
        self.param_count = 0;
        self.intermediate_count = 0;
        @memset(&self.params, 0);
        @memset(&self.intermediates, 0);
    }
};

fn standardColor(idx: u16) u32 {
    const colors = [_]u32{
        0xFF000000, // Black
        0xFFCD0000, // Red
        0xFF00CD00, // Green
        0xFFCDCD00, // Yellow
        0xFF0000EE, // Blue
        0xFFCD00CD, // Magenta
        0xFF00CDCD, // Cyan
        0xFFE5E5E5, // White
    };
    if (idx < 8) return colors[idx];
    return 0xFFFFFFFF;
}

fn brightColor(idx: u16) u32 {
    const colors = [_]u32{
        0xFF7F7F7F, // Bright Black
        0xFFFF0000, // Bright Red
        0xFF00FF00, // Bright Green
        0xFFFFFF00, // Bright Yellow
        0xFF5C5CFF, // Bright Blue
        0xFFFF00FF, // Bright Magenta
        0xFF00FFFF, // Bright Cyan
        0xFFFFFFFF, // Bright White
    };
    if (idx < 8) return colors[idx];
    return 0xFFFFFFFF;
}

fn color256(idx: u16) u32 {
    if (idx < 16) {
        if (idx < 8) return standardColor(idx);
        return brightColor(idx - 8);
    }
    if (idx < 232) {
        // 6x6x6 cube
        var i = idx - 16;
        const b = (i % 6) * 51; // 0..255
        i /= 6;
        const g = (i % 6) * 51;
        i /= 6;
        const r = i * 51;
        return rgb(@intCast(r), @intCast(g), @intCast(b));
    }
    // Grayscale
    const i = idx - 232;
    const v = i * 10 + 8;
    return rgb(@intCast(v), @intCast(v), @intCast(v));
}

fn rgb(r: u16, g: u16, b: u16) u32 {
    return 0xFF000000 | (@as(u32, r) << 16) | (@as(u32, g) << 8) | @as(u32, b);
}

test "Parser CSI Cursor" {
    const allocator = std.testing.allocator;
    var term = try Terminal.init(allocator, 24, 80, 10000);
    defer term.deinit();
    
    // Move cursor to 10,10
    // ANSI is 1-based, so 11,11
    try term.writeInput("\x1B[11;11H");
    try std.testing.expectEqual(@as(u32, 10), term.cursor_row);
    try std.testing.expectEqual(@as(u32, 10), term.cursor_col);
    
    // Move up 5
    try term.writeInput("\x1B[5A");
    try std.testing.expectEqual(@as(u32, 5), term.cursor_row);
}

test "Parser Colors" {
    const allocator = std.testing.allocator;
    var term = try Terminal.init(allocator, 24, 80, 10000);
    defer term.deinit();
    
    // Set Red
    try term.writeInput("\x1B[31m");
    try std.testing.expectEqual(@as(u32, 0xFFCD0000), term.current_fg);
    
    // Reset
    try term.writeInput("\x1B[0m");
    try std.testing.expectEqual(@as(u32, 0xFFFFFFFF), term.default_fg);
}
