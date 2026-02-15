import SwiftUI

@main
struct AetherApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject var scrollState = TerminalScrollState()
    @ObservedObject var configManager = ConfigManager.shared
    
    var body: some Scene {
        WindowGroup("Aether") {
            ZStack(alignment: .top) {
                // Main Window Background
                BackgroundView(material: configManager.config.window.blurType.material)
                    .ignoresSafeArea()
                
                HStack(spacing: 0) {
                    // Terminal Content
                    TerminalViewRepresentable(scrollState: scrollState, config: configManager.config)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .layoutPriority(1) // Ensures it takes space first
                        .padding(.top, 28)
                        .ignoresSafeArea()
                    
                    // ScrollBar
                    if configManager.config.ui.scrollbar.visible {
                        CustomScrollBar(scrollState: scrollState) { t in
                            scrollState.userScrollRequest.send(t)
                        }
                        .frame(width: configManager.config.ui.scrollbar.width)
                        .padding(.top, configManager.config.ui.scrollbar.padding.top)
                        .padding(.bottom, configManager.config.ui.scrollbar.padding.bottom)
                        .layoutPriority(0)
                        .background(Color.black.opacity(0.1))
                    }
                }
                
                // Unified Title Bar Background ("Navbar")
                // A visual strip at the top to back the traffic lights and title
                HeaderView()
                    .frame(height: 28)
                    .frame(maxWidth: .infinity)
                    .background(VisualEffectView(material: .headerView, blendingMode: .withinWindow))
                    .ignoresSafeArea()
            }
            .background(Color.clear)
        }
        .commands {
            CommandGroup(replacing: .newItem) { }
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
    @ObservedObject var scrollState: TerminalScrollState
    var config: AetherConfig // Pass config

    func makeNSView(context: Context) -> TerminalView {
        let view = TerminalView(frame: .zero, device: MTLCreateSystemDefaultDevice(), scrollState: scrollState)
        view.autoresizingMask = [.width, .height]
        // Apply initial config
        view.updateConfig(config)
        return view
    }
    
    func updateNSView(_ nsView: TerminalView, context: Context) {
        nsView.updateConfig(config)
    }
    
    func sizeThatFits(_ proposal: ProposedViewSize, nsView: TerminalView, context: Context) -> CGSize {
        let width = proposal.width ?? 800
        let height = proposal.height ?? 600
        return CGSize(width: width, height: height)
    }
}
