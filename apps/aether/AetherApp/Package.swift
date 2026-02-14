// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "AetherApp",
    platforms: [.macOS(.v13)],
    targets: [
        .executableTarget(
            name: "AetherApp",
            dependencies: [],
            path: "Sources/AetherApp",
            exclude: ["Resources/Info.plist"],
            resources: [
                .process("Rendering/Shaders.metal")
            ],
            swiftSettings: [
                .unsafeFlags(["-I", "Sources/AetherApp/Bridge"]),
                .unsafeFlags(["-Xcc", "-fmodule-map-file=Sources/AetherApp/Bridge/module.modulemap"])
            ],
            linkerSettings: [
                .unsafeFlags(["-L", "../libaether/zig-out/lib"]),
                .linkedLibrary("aether"),
            ]
        )
    ]
)
