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
    
    // Extern declaration for macOS extension
    extern fn posix_spawn_file_actions_addchdir_np(
        file_actions: *c.posix_spawn_file_actions_t,
        path: [*c]const u8
    ) c_int;



    pub fn init(allocator: std.mem.Allocator, shell_path: ?[*:0]const u8, cwd: ?[*:0]const u8, ctrlc_sends_sigint: bool) !Pty {
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

        // Configure termios for the slave PTY to handle signals
        var tio: c.termios = undefined;
        if (c.tcgetattr(slave, &tio) == 0) {
            // Enable signals (ISIG), extended functions (IEXTEN) if requested
            if (ctrlc_sends_sigint) {
                tio.c_lflag |= c.ISIG | c.IEXTEN;
                // Ensure VINTR is set to 0x03 (Ctrl+C)
                tio.c_cc[c.VINTR] = 0x03;
            } else {
                tio.c_lflag &= ~(@as(u32, @intCast(c.ISIG)));
            }
            // Set attributes
            _ = c.tcsetattr(slave, c.TCSANOW, &tio);
        }

        const pid = try std.posix.fork();
        if (pid == 0) {
            // Child
            _ = c.setsid();
            _ = c.ioctl(slave, c.TIOCSCTTY, @as(c_int, 0));
            
            _ = c.dup2(slave, 0);
            _ = c.dup2(slave, 1);
            _ = c.dup2(slave, 2);
            _ = c.close(slave);
            _ = c.close(master);

            if (cwd) |working_dir| {
                _ = c.chdir(working_dir);
            }

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
            
            // Explicitly set environment
            var env_count: usize = 5; // Base 5
            if (c.getenv("HOME") != null) env_count += 1;
            // SHELL is always added
            env_count += 1;
            env_count += 1; // null terminator

            const env_slice = allocator.alloc([*c]const u8, env_count) catch {
                c.exit(1); // Cannot allocate, exit child
            };
            defer allocator.free(env_slice); // This defer won't run if execve succeeds

            var env_idx: usize = 0;
            env_slice[env_idx] = "TERM=xterm-256color"; env_idx += 1;
            env_slice[env_idx] = "LANG=en_US.UTF-8"; env_idx += 1;
            env_slice[env_idx] = "LC_ALL=en_US.UTF-8"; env_idx += 1;
            env_slice[env_idx] = "COLORTERM=truecolor"; env_idx += 1;
            env_slice[env_idx] = "PATH=/usr/bin:/bin:/usr/sbin:/sbin"; env_idx += 1;
            
            // Add HOME
            var home_s: []u8 = undefined;
            var has_home = false;
            if (c.getenv("HOME")) |h| {
                home_s = std.fmt.allocPrint(allocator, "HOME={s}\x00", .{std.mem.span(h)}) catch {
                    c.exit(1);
                };
                has_home = true;
                env_slice[env_idx] = @ptrCast(home_s.ptr); env_idx += 1;
            }
            defer if (has_home) allocator.free(home_s);

            // Add SHELL
            var shell_s: []u8 = undefined;
            shell_s = std.fmt.allocPrint(allocator, "SHELL={s}\x00", .{std.mem.span(shell)}) catch {
                c.exit(1);
            };
            env_slice[env_idx] = @ptrCast(shell_s.ptr); env_idx += 1;
            defer allocator.free(shell_s);

            env_slice[env_idx] = null; // Terminator

            const envp_ptr: [*c]const [*c]u8 = @ptrCast(env_slice.ptr);
            const argv_ptr: [*c]const [*c]u8 = @ptrCast(&argv[0]);
            
            _ = c.execve(shell, argv_ptr, envp_ptr);
            c.exit(1); // Should not reach here
        }

        // Parent
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
                // Do not log EAGAIN to avoid flooding
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
        
        if (c.ioctl(self.master_fd, c.TIOCSWINSZ, &ws) == -1) {
            // Usually returns error if PTY not fully ready, ignore
            return;
        }
    }

    pub fn isAlive(self: *Pty) bool {
        return c.kill(self.child_pid, 0) == 0;
    }
};
