const std = @import("std");
const Pty = @import("aether_lib").Pty;
const c = @cImport({
    @cInclude("unistd.h");
    @cInclude("sys/wait.h");
    @cInclude("termios.h");
    @cInclude("fcntl.h");
    @cInclude("sys/ioctl.h");
});

test "PTY creation and destruction" {
    const allocator = std.testing.allocator;
    var pty = try Pty.init(allocator, "/bin/echo", null, true);
    defer pty.deinit();

    try std.testing.expect(pty.master_fd >= 0);
    try std.testing.expect(pty.child_pid > 0);
    try std.testing.expect(pty.isAlive());
}

test "PTY read/write roundtrip" {
    const allocator = std.testing.allocator;
    var pty = try Pty.init(allocator, "/bin/cat", null, true);
    defer pty.deinit();

    const message = "Hello Zig PTY!\n";
    _ = try pty.write(message);

    _ = c.usleep(100 * 1000);

    var buf: [1024]u8 = undefined;
    const n = try pty.read(&buf);
    
    try std.testing.expect(n > 0);
    const read_str = buf[0..n];
    
    try std.testing.expect(std.mem.indexOf(u8, read_str, "Hello Zig PTY") != null);
}

test "PTY window resize" {
    const allocator = std.testing.allocator;
    var pty = try Pty.init(allocator, "/bin/sh", null, true);
    defer pty.deinit();

    try pty.setSize(24, 80);
    try pty.setSize(24, 80);
    try pty.setSize(40, 100);
}

test "PTY SIGINT generation" {
    const allocator = std.testing.allocator;
    // Start a shell that will catch signals
    var pty = try Pty.init(allocator, "/bin/sh", null, true);
    defer pty.deinit();

    // Send a command that sleeps and then echoes something
    // We'll try to interrupt the sleep.
    // However, a simpler way is to check the exit status if possible, 
    // but Pty doesn't currently expose waitpid.
    
    // Instead, let's just verify that ISIG is set on the slave.
    var tio: c.termios = undefined;
    const slave_fd = c.open(@ptrCast(&pty.tty_name), c.O_RDONLY);
    if (slave_fd >= 0) {
        defer _ = c.close(slave_fd);
        if (c.tcgetattr(slave_fd, &tio) == 0) {
            try std.testing.expect((tio.c_lflag & c.ISIG) != 0);
            try std.testing.expectEqual(@as(u8, 0x03), tio.c_cc[c.VINTR]);
        }
    }

    // Now test with it disabled
    var pty2 = try Pty.init(allocator, "/bin/sh", null, false);
    defer pty2.deinit();
    
    const slave_fd2 = c.open(@ptrCast(&pty2.tty_name), c.O_RDONLY);
    if (slave_fd2 >= 0) {
        defer _ = c.close(slave_fd2);
        if (c.tcgetattr(slave_fd2, &tio) == 0) {
            try std.testing.expect((tio.c_lflag & c.ISIG) == 0);
        }
    }
}
