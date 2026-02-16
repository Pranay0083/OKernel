import SwiftUI

@main
struct AetherApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject var tabManager = TabManager()
    @ObservedObject var configManager = ConfigManager.shared
    
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
                    
                    if let session = tabManager.activeSession {
                        TerminalViewRepresentable(
                            session: session,
                            config: configManager.config,
                            onAction: { action in
                                handleAction(action, in: session)
                            }
                        )
                        .id(session.id) // Force recreate view when session changes
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else {
                         // Fallback?
                         Color.black
                    }
                }
                .layoutPriority(1)
                .ignoresSafeArea()

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
        }
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
    func handleAction(_ action: String, in session: TerminalSession) {
        switch action {
        case "new_tab":
            tabManager.addTab()
        case "close_tab":
            tabManager.closeTab(id: session.id)
        default:
            break
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

struct TerminalViewRepresentable: NSViewRepresentable {
    var session: TerminalSession
    var config: AetherConfig
    var onAction: (String) -> Void

    func makeNSView(context: Context) -> TerminalView {
        let view = TerminalView(
            frame: .zero,
            device: MTLCreateSystemDefaultDevice(),
            session: session,
            onTitleChange: { newTitle in
                // Find window and set title? 
                // TerminalView already sets window.title. 
                // But if we want to bubble up, we can.
                // For now, TerminalView setting self.window.title is enough for the window it's in.
            }
        )
        view.autoresizingMask = [.width, .height]
        view.updateConfig(config)
        view.onAction = onAction
        return view
    }
    
    func updateNSView(_ nsView: TerminalView, context: Context) {
        nsView.updateConfig(config)
        nsView.onAction = onAction
        // Since we force recreate on session change via .id(session.id), we don't need to manually update session pointer here.
    }
    
    func sizeThatFits(_ proposal: ProposedViewSize, nsView: TerminalView, context: Context) -> CGSize {
        let width = proposal.width ?? 800
        let height = proposal.height ?? 600
        return CGSize(width: width, height: height)
    }
}
