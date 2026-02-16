import SwiftUI

struct StartupView: View {
    @Binding var isPresented: Bool
    
    enum Stage {
        case logo
        case intro
        case letter
    }
    
    @State private var stage: Stage = .logo
    @State private var opacity = 0.0
    @State private var scale = 0.95
    
    // Letter Animation States
    @State private var letterOpacity = 0.0
    @State private var letterYOffset = 20.0
    
    var body: some View {
        ZStack {
            // Background - Dynamic based on stage?
            // Keep consistent dark glass for Logo/Intro, maybe different for Letter?
            // Let's keep it consistent for seamlessness.
            VisualEffectView(material: .hudWindow, blendingMode: .behindWindow)
                .ignoresSafeArea()
            
            Color.black.opacity(0.6)
                .ignoresSafeArea()
            
            // Content
            Group {
                switch stage {
                case .logo:
                    LogoStage()
                        .transition(.opacity)
                case .intro:
                    IntroStage(onNext: {
                        withAnimation(.easeInOut(duration: 0.5)) {
                            stage = .letter
                        }
                    })
                    .transition(.opacity.combined(with: .move(edge: .trailing)))
                case .letter:
                    LetterStage(onFinish: initializeApp)
                        .transition(.asymmetric(insertion: .move(edge: .bottom).combined(with: .opacity), removal: .opacity))
                }
            }
        }
        .onAppear {
            // Stage 1: Logo Auto-Advance
            withAnimation(.easeOut(duration: 1.0)) {
                opacity = 1.0
                scale = 1.0
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                withAnimation(.easeInOut(duration: 0.8)) {
                    stage = .intro
                }
            }
        }
    }
    
    private func initializeApp() {
        // Initialize Config
        initializeConfig()
        
        // Set seen state
        UserDefaults.standard.set(true, forKey: "hasSeenStartup")
        
        // Animate out
        withAnimation(.easeIn(duration: 0.4)) {
            opacity = 0
            scale = 1.1
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
             isPresented = false
        }
    }
    
    private func initializeConfig() {
        let fileManager = FileManager.default
        let home = fileManager.homeDirectoryForCurrentUser
        let configDir = home.appendingPathComponent(".config/aether")
        let configPath = configDir.appendingPathComponent("config.json")
        
        if !fileManager.fileExists(atPath: configPath.path) {
            print("Startup: Creating default config...")
            ConfigManager.shared.saveConfig()
        }
    }
}

// MARK: - Stage 1: The Brand
struct LogoStage: View {
    @State private var glowOpacity = 0.0
    @State private var scale = 0.8
    
    var body: some View {
        ZStack {
            // Transparent background for "Desktop" feel
            Color.clear 
            
            ZStack {
                // Subtle glow behind
                Circle()
                    .fill(Color.blue.opacity(glowOpacity))
                    .frame(width: 180, height: 180)
                    .blur(radius: 50)
                
                if let logoPath = Bundle.aether.path(forResource: "logo", ofType: "png"),
                   let logoImage = NSImage(contentsOfFile: logoPath) {
                    Image(nsImage: logoImage)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 128, height: 128)
                        .shadow(color: .black.opacity(0.3), radius: 20, x: 0, y: 10)
                } else {
                    Image(systemName: "terminal.fill")
                        .font(.system(size: 80))
                        .foregroundStyle(.white)
                }
            }
            .scaleEffect(scale)
        }
        .onAppear {
            withAnimation(.easeOut(duration: 1.2)) {
                scale = 1.0
                glowOpacity = 0.4
            }
        }
    }
}

// MARK: - Stage 2: The Identity
struct IntroStage: View {
    var onNext: () -> Void
    @State private var contentOpacity = 0.0
    @State private var cursorBlink = true
    @State private var hover = false
    @State private var eventMonitor: Any?
    let monoFont = "Courier New"
    
    var body: some View {
        ZStack {
            // Deep Black Background
            Color.black.ignoresSafeArea()
            
            VStack(alignment: .leading, spacing: 0) {
                Spacer()
                
                // Super-Human Builder Typography
                VStack(alignment: .leading, spacing: 5) {
                    Text("UNLEASH THE")
                        .font(.system(size: 14, weight: .bold, design: .monospaced))
                        .foregroundStyle(.green)
                        .tracking(4)
                    
                    Text("SUPER-HUMAN")
                        .font(.system(size: 80, weight: .black, design: .default))
                        .foregroundStyle(.white)
                        .tracking(-2)
                    
                    Text("BUILDER.")
                        .font(.system(size: 80, weight: .black, design: .default))
                        .foregroundStyle(.white)
                        .tracking(-2)
                        .padding(.top, -10)
                }
                
                Spacer().frame(height: 40)
                
                // Narrative Content
                VStack(alignment: .leading, spacing: 12) {
                    Text("Aether is a precision augment for your workflow.")
                        .font(.custom(monoFont, size: 18))
                        .foregroundStyle(.white.opacity(0.9))
                    
                    Text("Obsidian-grade reliability. Native Metal performance. A terminal core designed to vanish, leaving only your speed of execution.")
                        .font(.custom(monoFont, size: 16))
                        .foregroundStyle(.gray)
                        .lineSpacing(4)
                        .frame(maxWidth: 500)
                }
                
                Spacer()
                
                // Prompt Interaction
                Button(action: onNext) {
                    HStack(spacing: 0) {
                        Text(hover ? "[ CLICK TO START ]" : "> INITIALIZE_AUGMENT")
                            .font(.custom(monoFont, size: 20))
                            .fontWeight(.bold)
                            .foregroundStyle(.green)
                            .shadow(color: .green.opacity(0.5), radius: 5)
                        
                        if cursorBlink {
                            Rectangle()
                                .fill(Color.green)
                                .frame(width: 12, height: 24)
                                .offset(y: 2)
                                .padding(.leading, 8)
                        }
                    }
                    .padding(.vertical, 10)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .onHover { hover = $0 }
                
                Spacer().frame(height: 80)
            }
            .padding(.leading, 80)
            .opacity(contentOpacity)
        }
        .onAppear {
            withAnimation(.easeOut(duration: 1.0)) {
                contentOpacity = 1.0
            }
            withAnimation(.easeInOut(duration: 0.5).repeatForever()) {
                cursorBlink.toggle()
            }
            
            // Robust Enter Key Listener using NSEvent
            eventMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { event in
                // Check for return (36) or enter (76)
                if event.keyCode == 36 || event.keyCode == 76 {
                    if self.contentOpacity > 0.9 { // Only if visible
                        onNext()
                        return nil // Swallow event
                    }
                }
                return event
            }
        }
        .onDisappear {
            if let monitor = eventMonitor {
                NSEvent.removeMonitor(monitor)
                eventMonitor = nil
            }
        }
    }
}

// MARK: - Stage 3: The Letter
struct LetterStage: View {
    var onFinish: () -> Void
    @State private var appear = false
    @State private var hover = false
    
    var body: some View {
        ZStack {
            // Dark background
            Color.black.opacity(0.9).ignoresSafeArea()
            
            VStack {
                // The Letter
                VStack(alignment: .leading, spacing: 24) {
                    // Header
                    HStack {
                        Text("FROM THE DESK OF OKERNEL")
                            .font(.custom("Courier New", size: 12))
                            .tracking(2)
                            .foregroundStyle(.black.opacity(0.4))
                        Spacer()
                        Text("EST. 2026")
                            .font(.custom("Courier New", size: 12))
                            .foregroundStyle(.black.opacity(0.4))
                    }
                    .padding(.bottom, 20)
                    .overlay(Rectangle().frame(height: 1).foregroundColor(.black.opacity(0.2)), alignment: .bottom)
                    
                    Text("Dear Builder,")
                        .font(.custom("Times New Roman", size: 24))
                        .fontWeight(.bold)
                        .foregroundStyle(.black.opacity(0.9))
                    
                    Text("This tool was built for you.")
                        .font(.custom("Times New Roman", size: 22))
                        .foregroundStyle(.black.opacity(0.85))
                    
                    Text("In an era of generated noise and heavy abstractions, Aether is a return to first principles. It is native, it is raw, and it respects your machine's resources.")
                        .font(.custom("Times New Roman", size: 22))
                        .foregroundStyle(.black.opacity(0.85))
                        .lineSpacing(6)
                        .fixedSize(horizontal: false, vertical: true) // Allow text to wrap properly
                    
                    Text("We handcrafted this engine to be as fast as your thought process. If you find any friction—any bug—tell us immediately. We serve the builders.")
                        .font(.custom("Times New Roman", size: 22))
                        .foregroundStyle(.black.opacity(0.85))
                        .lineSpacing(6)
                        .fixedSize(horizontal: false, vertical: true)
                    
                    Spacer()
                    
                    VStack(alignment: .leading, spacing: 14) {
                        LinkRow(icon: "envelope.fill", text: "vaidityatanwar2207@gmail.com", url: "mailto:vaidityatanwar2207@gmail.com", font: "Courier New")
                        LinkRow(icon: "globe", text: "github.com/Vaiditya2207/OKernel/issues", url: "https://github.com/Vaiditya2207/OKernel/issues", font: "Courier New")
                    }
                    
                    HStack {
                        // The "Button" - deeply integrated into the letter
                        Button(action: onFinish) {
                            HStack(spacing: 8) {
                                Text("[ INITIALIZE ]")
                                    .font(.custom("Courier New", size: 16))
                                    .fontWeight(.bold)
                                    .tracking(1)
                                    .foregroundStyle(hover ? .black : .black.opacity(0.6))
                            }
                            .padding(.vertical, 8)
                            .padding(.horizontal, 12)
                            .background(
                                RoundedRectangle(cornerRadius: 4)
                                    .stroke(Color.black.opacity(hover ? 0.8 : 0.3), lineWidth: 1)
                            )
                        }
                        .buttonStyle(.plain)
                        .onHover { hover = $0 }

                        Spacer()
                        VStack(alignment: .trailing) {
                            Text("Sincerely,")
                                .font(.custom("Times New Roman", size: 20))
                                .foregroundStyle(.black.opacity(0.8))
                            
                            Text("OKernel")
                                .font(.custom("Zapfino", size: 42)) // The Signature
                                .foregroundStyle(.black.opacity(0.9))
                                .rotationEffect(.degrees(-5))
                                .padding(.trailing, 20)
                        }
                    }
                }
                .padding(60)
                .frame(width: 700, height: 750) // HUGE Letter
                .background(
                    Color(red: 253/255, green: 246/255, blue: 227/255) // Solarized Base3
                )
                .cornerRadius(2)
                .shadow(color: .black.opacity(0.5), radius: 40, x: 0, y: 20)
                .rotationEffect(.degrees(appear ? 0 : 2))
                .scaleEffect(appear ? 1.0 : 0.95)
                .opacity(appear ? 1.0 : 0.0)
                
                Spacer().frame(height: 40)
            }
        }
        .onAppear {
            withAnimation(.spring(response: 1.0, dampingFraction: 0.8)) {
                appear = true
            }
        }
    }
}

// Helpers
struct FeatureBadge: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 12))
            Text(text)
                .font(.system(size: 12, weight: .semibold))
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color.white.opacity(0.1))
        .cornerRadius(20)
        .foregroundStyle(.white.opacity(0.9))
    }
}

struct LinkRow: View {
    let icon: String
    let text: String
    let url: String
    var font: String = "Times New Roman"
    
    @State private var hover = false
    
    var body: some View {
        Button(action: {
            if let u = URL(string: url) {
                NSWorkspace.shared.open(u)
            }
        }) {
            HStack {
                Image(systemName: icon)
                    .foregroundStyle(.gray)
                Text(text)
                    .font(.custom(font, size: 14))
                    .foregroundStyle(hover ? .blue : .black.opacity(0.7))
                    .underline(hover)
            }
        }
        .buttonStyle(.plain)
        .onHover { hover = $0 }
    }
}
