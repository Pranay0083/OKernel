const std = @import("std");

const c = @cImport({
    @cInclude("util.h");      // openpty on macOS (Darwin)
    @cInclude("sys/ioctl.h"); // ioctl, TIOCSWINSZ
    @cInclude("signal.h");    // kill, SIGWINCH
    @cInclude("spawn.h");     // posix_spawn
    @cInclude("termios.h");   // termios
    @cInclude("unistd.h");    // close, read, write
    @cInclude("fcntl.h");     // fcntl
    @cInclude("errno.h");
    @cInclude("pwd.h");       // getpwuid
    @cInclude("stdlib.h");
});

pub const RingBuffer = struct {
    data: []u8,
    read_pos: usize,
    write_pos: usize,
    count: usize,
    capacity: usize,
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator, size: usize) !RingBuffer {
        const buffer = try allocator.alloc(u8, size);
        return RingBuffer{
            .data = buffer,
            .read_pos = 0,
            .write_pos = 0,
            .count = 0,
            .capacity = size,
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *RingBuffer) void {
        self.allocator.free(self.data);
    }

    pub fn write(self: *RingBuffer, buf: []const u8) usize {
        var written: usize = 0;
        while (written < buf.len and self.count < self.capacity) {
            self.data[self.write_pos] = buf[written];
            self.write_pos = (self.write_pos + 1) % self.capacity;
            self.count += 1;
            written += 1;
        }
        return written;
    }

    pub fn read(self: *RingBuffer, buf: []u8) usize {
        var read_bytes: usize = 0;
        while (read_bytes < buf.len and self.count > 0) {
            buf[read_bytes] = self.data[self.read_pos];
            self.read_pos = (self.read_pos + 1) % self.capacity;
            self.count -= 1;
            read_bytes += 1;
        }
        return read_bytes;
    }

    pub fn isFull(self: *const RingBuffer) bool {
        return self.count == self.capacity;
    }
};

pub const Pty = struct {
    master_fd: c_int,
    child_pid: c.pid_t,
    read_buffer: RingBuffer,
    allocator: std.mem.Allocator,
    tty_name: [64]u8,
    
    pub fn init(allocator: std.mem.Allocator, shell_path: ?[*:0]const u8) !Pty {
        var master: c_int = undefined;
        var slave: c_int = undefined;
        var name_buf: [64]u8 = undefined;

        if (c.openpty(&master, &slave, &name_buf, null, null) == -1) {
            return error.OpenPtyFailed;
        }
        errdefer _ = c.close(master);
        errdefer _ = c.close(slave);

        const flags = c.fcntl(master, c.F_GETFL, @as(c_int, 0));
        if (flags != -1) {
            _ = c.fcntl(master, c.F_SETFL, flags | c.O_NONBLOCK);
        }

        var file_actions: c.posix_spawn_file_actions_t = undefined;
        if (c.posix_spawn_file_actions_init(&file_actions) != 0) {
            return error.PosixSpawnInitFailed;
        }
        defer _ = c.posix_spawn_file_actions_destroy(&file_actions);

        _ = c.posix_spawn_file_actions_adddup2(&file_actions, slave, 0);
        _ = c.posix_spawn_file_actions_adddup2(&file_actions, slave, 1);
        _ = c.posix_spawn_file_actions_adddup2(&file_actions, slave, 2);
        
        _ = c.posix_spawn_file_actions_addclose(&file_actions, slave);
        _ = c.posix_spawn_file_actions_addclose(&file_actions, master);

        var shell: [*c]const u8 = "/bin/zsh";
        
        if (shell_path) |s| {
            shell = s;
        } else if (c.getenv("SHELL")) |s| {
            shell = s;
        } else if (c.getpwuid(c.getuid())) |pw| {
            shell = pw.*.pw_shell;
        }
        
        // Use -l to force a login shell so PATH and profile are loaded
        var argv = [_]?[*:0]const u8{ @ptrCast(shell), "-l", null };
        const argv_ptr: [*c]const [*c]u8 = @ptrCast(&argv);
        
        // Explicitly set environment to ensure correct terminal behavior
        var envs = [_]?[*:0]const u8{
            "TERM=xterm-256color",
            "LANG=en_US.UTF-8",
            "LC_ALL=en_US.UTF-8",
            "COLORTERM=truecolor",
            "PATH=/usr/bin:/bin:/usr/sbin:/sbin", // Basic PATH
            null
        };
        const envp_ptr: [*c]const [*c]u8 = @ptrCast(&envs);

        var pid: c.pid_t = undefined;
        if (c.posix_spawn(&pid, shell, &file_actions, null, argv_ptr, envp_ptr) != 0) {
            return error.SpawnFailed;
        }

        _ = c.close(slave);

        const rb = try RingBuffer.init(allocator, 64 * 1024);

        return Pty{
            .master_fd = master,
            .child_pid = pid,
            .read_buffer = rb,
            .allocator = allocator,
            .tty_name = name_buf,
        };
    }

    pub fn deinit(self: *Pty) void {
        if (self.isAlive()) {
            _ = c.kill(self.child_pid, c.SIGHUP);
        }
        _ = c.close(self.master_fd);
        self.read_buffer.deinit();
    }

    fn pump(self: *Pty) !usize {
        var buf: [4096]u8 = undefined;
        const n = c.read(self.master_fd, &buf, buf.len);
        
        if (n > 0) {
            return self.read_buffer.write(buf[0..@intCast(n)]);
        } else if (n == 0) {
            return error.Eof;
        } else {
            // Check errno for EAGAIN/EWOULDBLOCK
            const err_val = c.__error().*;
            if (err_val == c.EAGAIN or err_val == c.EWOULDBLOCK) {
                return 0;
            }
            return error.ReadFailed;
        }
    }

    pub fn poll(self: *Pty) !usize {
        return self.pump();
    }

    pub fn read(self: *Pty, buf: []u8) !usize {
        _ = self.pump() catch |err| {
            if (err == error.Eof) {
                if (self.read_buffer.count == 0) return error.Eof;
            } else if (err != error.ReadFailed) {
                // Ignore
            } else {
                return err;
            }
        };

        if (self.read_buffer.count == 0) {
             return 0;
        }

        return self.read_buffer.read(buf);
    }

    pub fn write(self: *Pty, data: []const u8) !usize {
        const n = c.write(self.master_fd, data.ptr, data.len);
        if (n < 0) return error.WriteFailed;
        return @as(usize, @intCast(n));
    }

    pub fn setSize(self: *Pty, rows: u16, cols: u16) !void {
        var ws = c.winsize{
            .ws_row = rows,
            .ws_col = cols,
            .ws_xpixel = 0,
            .ws_ypixel = 0,
        };
        
        // on macOS, ioctl request is unsigned long
        const TIOCSWINSZ_DARWIN: u32 = 0x80087467;
        const req = @as(c_ulong, TIOCSWINSZ_DARWIN);
        
        if (c.ioctl(self.master_fd, req, &ws) == -1) {
            return error.IoctlFailed;
        }
        _ = c.kill(self.child_pid, c.SIGWINCH);
    }

    pub fn isAlive(self: *Pty) bool {
        return c.kill(self.child_pid, 0) == 0;
    }
};
