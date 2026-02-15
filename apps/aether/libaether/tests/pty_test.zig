const std = @import("std");
const Pty = @import("aether_lib").Pty;
const c = @cImport({
    @cInclude("unistd.h");
    @cInclude("sys/wait.h");
});

test "PTY creation and destruction" {
    const allocator = std.testing.allocator;
    var pty = try Pty.init(allocator, "/bin/echo");
    defer pty.deinit();

    try std.testing.expect(pty.master_fd >= 0);
    try std.testing.expect(pty.child_pid > 0);
    try std.testing.expect(pty.isAlive());
}

test "PTY read/write roundtrip" {
    const allocator = std.testing.allocator;
    var pty = try Pty.init(allocator, "/bin/cat");
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
    var pty = try Pty.init(allocator, "/bin/sh");
    defer pty.deinit();

    try pty.setSize(24, 80);
    try pty.setSize(40, 100);
}
