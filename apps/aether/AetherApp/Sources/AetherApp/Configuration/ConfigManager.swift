import Foundation
import AppKit

struct AetherConfig: Codable {
    var theme: ThemeConfig
    var font: FontConfig
    var cursorBlinkRate: Float? // Blinks per second (0.1 to 10.0), default 2.0
    var lineSpacing: Float?     // Line height multiplier (1.0 = tight, 1.5 = spacious), default 1.2
}

struct FontConfig: Codable {
    var size: Float
    var name: String
}

struct ThemeConfig: Codable {
    var name: String
    var background: String // Hex #RRGGBB or #AARRGGBB
    var foreground: String
    var selectionColor: String? // Hex #AARRGGBB for selection highlight (optional)
    var palette: [String] // 16 ANSI colors
    
    static let dracula = ThemeConfig(
        name: "Dracula",
        background: "#00000000", // Transparent
        foreground: "#F8F8F2",
        palette: [
            "#21222C", "#FF5555", "#50FA7B", "#F1FA8C",
            "#BD93F9", "#FF79C6", "#8BE9FD", "#F8F8F2", // Blue is #BD93F9 (Purple-ish) to be visible
            "#6272A4", "#FF6E6E", "#69FF94", "#FFFFC7",
            "#D6ACFF", "#FF92DF", "#A4FFFF", "#FFFFFF"
        ]
    )
    
    static let solarizedDark = ThemeConfig(
        name: "Solarized Dark",
        background: "#00000000",
        foreground: "#839496",
        palette: [
            "#073642", "#DC322F", "#859900", "#B58900",
            "#268BD2", "#D33682", "#2AA198", "#EEE8D5",
            "#002B36", "#CB4B16", "#586E75", "#657B83",
            "#839496", "#6C71C4", "#93A1A1", "#FDF6E3"
        ]
    )
    
    // OneDark with lighter blue
    static let oneDark = ThemeConfig(
        name: "OneDark",
        background: "#00000000",
        foreground: "#ABB2BF",
        palette: [
            "#282C34", "#E06C75", "#98C379", "#E5C07B",
            "#61AFEF", "#C678DD", "#56B6C2", "#ABB2BF",
            "#5C6370", "#E06C75", "#98C379", "#E5C07B",
            "#61AFEF", "#C678DD", "#56B6C2", "#FFFFFF"
        ]
    )
}

class ConfigManager {
    static let shared = ConfigManager()
    
    var config: AetherConfig
    
    private init() {
        self.config = AetherConfig(theme: .dracula, font: FontConfig(size: 14.0, name: "Menlo"))
        loadConfig()
    }
    
    func loadConfig() {
        let fileManager = FileManager.default
        let home = fileManager.homeDirectoryForCurrentUser
        let configPath = home.appendingPathComponent(".config/aether/config.json")
        
        guard fileManager.fileExists(atPath: configPath.path) else {
            // Create default if not exists
            saveConfig()
            return
        }
        
        do {
            let data = try Data(contentsOf: configPath)
            let decoder = JSONDecoder()
            self.config = try decoder.decode(AetherConfig.self, from: data)
            print("Loaded config from \(configPath.path)")
        } catch {
            print("Failed to load config: \(error)")
        }
    }
    
    func saveConfig() {
        let fileManager = FileManager.default
        let home = fileManager.homeDirectoryForCurrentUser
        let configDir = home.appendingPathComponent(".config/aether")
        let configPath = configDir.appendingPathComponent("config.json")
        
        do {
            try fileManager.createDirectory(at: configDir, withIntermediateDirectories: true)
            let encoder = JSONEncoder()
            encoder.outputFormatting = .prettyPrinted
            let data = try encoder.encode(config)
            try data.write(to: configPath)
        } catch {
            print("Failed to save config: \(error)")
        }
    }
    
    // Helper: Hex String to UInt32 (0xAARRGGBB)
    func parseColor(_ hex: String) -> UInt32 {
        var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")
        
        var rgb: UInt64 = 0
        Scanner(string: hexSanitized).scanHexInt64(&rgb)
        
        if hexSanitized.count == 6 {
            return UInt32(0xFF000000) | UInt32(rgb)
        } else if hexSanitized.count == 8 {
            return UInt32(rgb)
        }
        return 0xFFFFFFFF
    }
}
