import SwiftUI

@main
struct AetherApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    var body: some Scene {
        WindowGroup("Aether") {
            ZStack(alignment: .top) {
                // Main Window Background (Sidebar Material)
                BackgroundView()
                    .ignoresSafeArea()
                
                // Terminal Content
                GeometryReader { geometry in
                    TerminalViewRepresentable(frame: geometry.frame(in: .local))
                        .frame(width: geometry.size.width, height: geometry.size.height)
                }
                .padding(.top, 28)
                .ignoresSafeArea()
                
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
    func makeNSView(context: Context) -> NSVisualEffectView {
        let view = NSVisualEffectView()
        view.material = .sidebar
        view.blendingMode = .behindWindow
        view.state = .active
        return view
    }
    
    func updateNSView(_ nsView: NSVisualEffectView, context: Context) { }
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
    var frame: CGRect

    func makeNSView(context: Context) -> TerminalView {
        let view = TerminalView(frame: frame)
        view.autoresizingMask = [.width, .height]
        return view
    }
    
    func updateNSView(_ nsView: TerminalView, context: Context) {
        if nsView.frame != frame {
            nsView.frame = frame
        }
    }
}
