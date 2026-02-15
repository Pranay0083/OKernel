const std = @import("std");

test "ArrayList init" {
    var list = try std.ArrayList(u8).initCapacity(std.testing.allocator, 10);
    defer list.deinit(std.testing.allocator);
    try list.append(std.testing.allocator, 1);
}
