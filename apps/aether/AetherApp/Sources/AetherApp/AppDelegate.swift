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
    
    func applicationWillTerminate(_ notification: Notification) {
        // Ensure session is saved on quit
        if let tabManager = SessionManager.shared.tabManager {
            print("[AppDelegate] Saving session on terminate")
            SessionManager.shared.saveSession(tabs: tabManager.tabs, activeTabId: tabManager.activeTabId)
        }
    }
}
