const std = @import("std");

pub fn build(b: *std.Build) void {
    // Use native target to get correct SDK headers
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // Create a module for the library code to be reused
    const lib_mod = b.createModule(.{
        .root_source_file = b.path("src/main.zig"),
        .target = target,
        .optimize = optimize,
    });

    // Static Library
    const lib = b.addLibrary(.{
        .linkage = .static,
        .name = "aether",
        .root_module = lib_mod,
    });
    
    // Link libc
    lib.linkLibC();

    // Install the library artifact
    b.installArtifact(lib);

    // Tests for main.zig (inline tests)
    const main_tests = b.addTest(.{
        .root_module = lib_mod,
    });
    main_tests.linkLibC();
    
    // Grid tests
    const grid_tests = b.addTest(.{
        .root_module = b.createModule(.{
            .root_source_file = b.path("tests/grid_test.zig"),
            .target = target,
            .optimize = optimize,
            .imports = &.{
                .{ .name = "aether_lib", .module = lib_mod },
            },
        }),
    });
    grid_tests.linkLibC();

    // Terminal tests
    const terminal_tests = b.addTest(.{
        .root_module = b.createModule(.{
            .root_source_file = b.path("tests/terminal_test.zig"),
            .target = target,
            .optimize = optimize,
            .imports = &.{
                .{ .name = "aether_lib", .module = lib_mod },
            },
        }),
    });
    terminal_tests.linkLibC();

    // Pty tests
    const pty_tests = b.addTest(.{
        .root_module = b.createModule(.{
            .root_source_file = b.path("tests/pty_test.zig"),
            .target = target,
            .optimize = optimize,
            .imports = &.{
                .{ .name = "aether_lib", .module = lib_mod },
            },
        }),
    });
    pty_tests.linkLibC();

    // Config tests
    const config_tests = b.addTest(.{
        .root_module = b.createModule(.{
            .root_source_file = b.path("tests/config_test.zig"),
            .target = target,
            .optimize = optimize,
            .imports = &.{
                .{ .name = "aether_lib", .module = lib_mod },
            },
        }),
    });
    config_tests.linkLibC();

    // Grid Reflow tests (REMOVED - Reflow logic replaced by Crop/Extend)
    // const grid_reflow_tests = b.addTest(.{
    //     .root_module = b.createModule(.{
    //         .root_source_file = b.path("tests/grid_reflow_test.zig"),
    //         .target = target,
    //         .optimize = optimize,
    //         .imports = &.{
    //             .{ .name = "libaether", .module = lib_mod },
    //         },
    //     }),
    // });
    // grid_reflow_tests.linkLibC();
    
    const run_main_tests = b.addRunArtifact(main_tests);
    const run_grid_tests = b.addRunArtifact(grid_tests);

    // Grid Scrollback tests
    const grid_scrollback_tests = b.addTest(.{
        .root_module = b.createModule(.{
            .root_source_file = b.path("tests/grid_scrollback_test.zig"),
            .target = target,
            .optimize = optimize,
            .imports = &.{
                .{ .name = "libaether", .module = lib_mod },
            },
        }),
    });
    grid_scrollback_tests.linkLibC();

    // Selection tests
    const selection_tests = b.addTest(.{
        .root_module = b.createModule(.{
            .root_source_file = b.path("tests/selection_test.zig"),
            .target = target,
            .optimize = optimize,
            .imports = &.{
                .{ .name = "libaether", .module = lib_mod },
            },
        }),
    });
    selection_tests.linkLibC();

    // const run_grid_reflow_tests = b.addRunArtifact(grid_reflow_tests);
    const run_grid_scrollback_tests = b.addRunArtifact(grid_scrollback_tests);
    const run_selection_tests = b.addRunArtifact(selection_tests);
    const run_terminal_tests = b.addRunArtifact(terminal_tests);
    const run_pty_tests = b.addRunArtifact(pty_tests);
    const run_config_tests = b.addRunArtifact(config_tests);

    const test_step = b.step("test", "Run library tests");
    test_step.dependOn(&run_main_tests.step);
    test_step.dependOn(&run_grid_tests.step);
    // test_step.dependOn(&run_grid_reflow_tests.step);
    test_step.dependOn(&run_grid_scrollback_tests.step);
    test_step.dependOn(&run_selection_tests.step);
    test_step.dependOn(&run_terminal_tests.step);
    test_step.dependOn(&run_pty_tests.step);
    test_step.dependOn(&run_config_tests.step);


    // Create config module
    const config_module = b.createModule(.{
        .root_source_file = b.path("src/config.zig"),
    });

    // Add CLI executable
    const cli_exe = b.addExecutable(.{
        .name = "aether",
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/cli.zig"),
            .target = target,
            .optimize = optimize,
        }),
    });

    // Add module dependencies
    cli_exe.root_module.addImport("config", config_module);

    b.installArtifact(cli_exe);
}
