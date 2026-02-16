
import SwiftUI

@main
struct AetherApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject var tabManager = TabManager()
    @ObservedObject var configManager = ConfigManager.shared
    
    // Leader Key State
    @State private var isWindowMode = false
    
    var body: some Scene {
        WindowGroup("Aether") {
            ZStack(alignment: .top) {
                // Main Window Background
                BackgroundView(material: configManager.config.window.blurType.material)
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Spacer for Title Bar
                    Color.clear.frame(height: 28)
                    
                    TabBarView(
                        tabManager: tabManager,
                        onNewTab: { tabManager.addTab() },
                        onCloseTab: { id in tabManager.closeTab(id: id) }
                    )
                    .frame(height: 28)
                    .background(Color.clear)
                    
                    if let tab = tabManager.activeTab {
                        TabContentView(
                            tab: tab,
                            tabManager: tabManager,
                            configManager: configManager,
                            onHandleAction: { action, session in
                                return handleAction(action, in: session)
                            }
                        )
                        .id(tab.id) // Identify by tab ID so switching tabs refreshes view tree
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else {
                        // Fallback?
                        Color.black
                    }
                }
                .layoutPriority(1)
                .ignoresSafeArea()
                
                // Window Mode Indicator
                if isWindowMode {
                    VStack {
                        Spacer()
                        HStack {
                            Spacer()
                            Text("WINDOW MODE")
                                .font(.system(size: 10, weight: .bold))
                                .padding(6)
                                .background(Color.yellow) // User said blue border is bad, so maybe yellow warning color?
                                .foregroundColor(.black)
                                .cornerRadius(4)
                                .padding()
                        }
                    }
                }

                // ScrollBar - Attach to active session
                if configManager.config.ui.scrollbar.visible, let session = tabManager.activeSession {
                    HStack {
                        Spacer()
                        CustomScrollBar(scrollState: session.scrollState) { t in
                            session.scrollState.userScrollRequest.send(t)
                        }
                        .frame(width: configManager.config.ui.scrollbar.width)
                        .padding(.top, 28 + configManager.config.ui.scrollbar.padding.top) // Offset for tab bar
                        .padding(.bottom, configManager.config.ui.scrollbar.padding.bottom)
                        .layoutPriority(0)
                        .background(Color.black.opacity(0.1))
                    }
                }
            }
            .background(Color.clear)
            .frame(minWidth: 800, minHeight: 600)
            // Global key listener for window mode arrows? 
            // It's tricky to capture arrows at the Scene level if TerminalView consumes them.
            // TerminalView consumes keys via keyDown. 
            // Since TerminalView calls handleAction for mapped keys, we can handle it there.
        }
        // Force minimum window size at the App/Scene level
        .windowResizability(.contentSize)
        .commands {
            CommandGroup(replacing: .newItem) {
                Button("New Tab") { tabManager.addTab() }
                    .keyboardShortcut("t", modifiers: .command)
                Button("Close Tab") {
                    if let id = tabManager.activeTabId {
                        tabManager.closeTab(id: id)
                    }
                }
                .keyboardShortcut("w", modifiers: .command)
                
                // Split Commands
                Button("Split Horizontally") {
                    print("Menu Command: Split Horizontally Triggered")
                    tabManager.splitPane(axis: .horizontal)
                }
                .keyboardShortcut("d", modifiers: .command)
                
                Button("Split Vertically") {
                    print("Menu Command: Split Vertically Triggered")
                    tabManager.splitPane(axis: .vertical)
                }
                .keyboardShortcut("d", modifiers: [.command, .shift])
                
                Button("Close Pane") {
                    tabManager.closeActivePane()
                }
                .keyboardShortcut("w", modifiers: [.command, .shift])
            }
            // Themes menu...
            CommandMenu("Themes") {
                Button("Transparent (Default)") {
                    NotificationCenter.default.post(name: NSNotification.Name("AetherThemeChanged"), object: "Default")
                }
                Button("Solarized Dark") {
                     NotificationCenter.default.post(name: NSNotification.Name("AetherThemeChanged"), object: "Solarized Dark")
                }
                Button("Dracula") {
                     NotificationCenter.default.post(name: NSNotification.Name("AetherThemeChanged"), object: "Dracula")
                }
                Button("OneDark") {
                     NotificationCenter.default.post(name: NSNotification.Name("AetherThemeChanged"), object: "OneDark")
                }
            }
        }
    }
    
    // Returns true if action was handled, false if it should fall through (e.g. to terminal input)
    func handleAction(_ action: String, in session: TerminalSession) -> Bool {
        if isWindowMode {
            // In window mode, we hijack navigation keys
            switch action {
            case "focus_left": tabManager.moveFocus(direction: .left)
            case "focus_right": tabManager.moveFocus(direction: .right)
            case "focus_up": tabManager.moveFocus(direction: .up)
            case "focus_down": tabManager.moveFocus(direction: .down) 
            default: return false // Let other actions fall through if needed, or consume?
            }
            isWindowMode = false
            return true
        }
        
        switch action {
        case "enter_window_mode":
            isWindowMode = true
            return true
        case "split_horizontal":
            tabManager.splitPane(axis: .horizontal)
            return true
        case "split_vertical":
            tabManager.splitPane(axis: .vertical)
            return true
        case "close_pane":
            tabManager.closeActivePane()
            return true
        case "new_tab":
            tabManager.addTab()
            return true
        case "close_tab":
            // Find tab containing session
            if let tab = tabManager.tabs.first(where: { 
                // Simple check if root is pane, real check would be recursive search
                // But generally session.id is enough info if we track it.
                // For now, assume close_tab means close active tab
                $0.id == tabManager.activeTabId 
            }) {
                tabManager.closeTab(id: tab.id)
            }
            return true
        case "new_window":
            return true // Consumed but nothing happens
        default:
            // For navigation keys (focus_left, etc) when NOT in window mode:
            // Return FALSE so TerminalView sends the key event to the shell.
            return false
        }
    }
}

// Just an empty container for the visual effect, maybe a separator line
struct HeaderView: View {
    var body: some View {
        VStack {
            Spacer()
            Divider()
                .opacity(0.1)
        }
    }
}

struct BackgroundView: NSViewRepresentable {
    var material: NSVisualEffectView.Material = .sidebar

    func makeNSView(context: Context) -> NSVisualEffectView {
        let view = NSVisualEffectView()
        view.material = material
        view.blendingMode = .behindWindow
        view.state = .active
        return view
    }
    
    func updateNSView(_ nsView: NSVisualEffectView, context: Context) {
        nsView.material = material
    }
}

struct TabContentView: View {
    @ObservedObject var tab: Tab
    @ObservedObject var tabManager: TabManager
    @ObservedObject var configManager: ConfigManager
    
    // Closure to handle actions, passed from parent
    let onHandleAction: (String, TerminalSession) -> Bool
    
    var body: some View {
        PaneView(
            node: tab.root,
            tabManager: tabManager,
            config: configManager.config,
            onAction: onHandleAction
        )
    }
}

struct VisualEffectView: NSViewRepresentable {
    var material: NSVisualEffectView.Material
    var blendingMode: NSVisualEffectView.BlendingMode

    func makeNSView(context: Context) -> NSVisualEffectView {
        let view = NSVisualEffectView()
        view.material = material
        view.blendingMode = blendingMode
        view.state = .active
        return view
    }

    func updateNSView(_ nsView: NSVisualEffectView, context: Context) {
        nsView.material = material
        nsView.blendingMode = blendingMode
    }
}
