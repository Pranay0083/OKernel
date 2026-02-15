import Cocoa

class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        // Initialize Config
        _ = ConfigManager.shared
        
        // Initialize Font Manager (downloads custom font if needed)
        FontManager.shared.setup()
        
        // Make the app appear in the Dock as a regular macOS app
        NSApp.setActivationPolicy(.regular)
        NSApp.activate(ignoringOtherApps: true)
    }
    
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        true
    }
}
