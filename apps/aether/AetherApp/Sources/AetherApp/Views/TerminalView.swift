import Cocoa
import MetalKit
import CAether

import Combine

class TerminalView: MTKView {
    var renderer: TerminalRenderer?
    
    // Session State
    var terminalSession: TerminalSession
    var onAction: ((String) -> Void)?
    
    // Convenience accessors
    var terminal: OpaquePointer? { terminalSession.terminal }
    var scrollState: TerminalScrollState { terminalSession.scrollState }

    private var hasMouseDragged = false
    
    // Smart Blink State
    private var lastInputTime: TimeInterval = 0
    
    private var cancellables = Set<AnyCancellable>()
    
    // Custom Fullscreen State
    private var isCustomFullScreen = false
    private var savedFrame: NSRect = .zero
    
    override var intrinsicContentSize: NSSize {
        return NSSize(width: 800, height: 600)
    }
    
    override func layout() {
        super.layout()
        if let window = self.window {
             self.layer?.contentsScale = window.backingScaleFactor
             let newSize = CGSize(width: self.bounds.width * window.backingScaleFactor, 
                                  height: self.bounds.height * window.backingScaleFactor)
             self.drawableSize = newSize
             // Explicitly notify renderer since autoResizeDrawable is false
             renderer?.mtkView(self, drawableSizeWillChange: newSize)
        }
    }
    
    override var acceptsFirstResponder: Bool { true }
    override var isFlipped: Bool { true }
    
    override func mouseDragged(with event: NSEvent) {
        guard let terminal = terminal else { return }
        
        // Autoscroll check
        let loc = convert(event.locationInWindow, from: nil)
        if loc.y > self.bounds.height {
             // Above view -> Scroll History (Up)
             aether_scroll_view(terminal, -1)
        } else if loc.y < 0 {
             // Below view -> Scroll Bottom (Down)
             aether_scroll_view(terminal, 1)
        }
        
        // Update Selection
        let (r, c) = pointToGrid(event.locationInWindow)
        aether_selection_drag(terminal, UInt32(r), UInt32(c))
        
        self.setNeedsDisplay(self.bounds)
    }
    
    override func scrollWheel(with event: NSEvent) {
        guard let terminal = terminal else { return }
        
        var dy = event.scrollingDeltaY
        
        // Logic to respect "Natural Scrolling" config:
        // System Event magnitude is consistent, but sign depends on system pref.
        // isDirectionInvertedFromDevice is TRUE if "Natural Scrolling" is enabled in OS.
        // We want:
        // If config.natural == true: Behaves like OS Natural.
        // If config.natural == false: Behaves like OS Classic (Unnatural).
        
        let wantNatural = ConfigManager.shared.config.ui.scroll.naturalScrolling
        let isSystemNatural = event.isDirectionInvertedFromDevice
        
        if wantNatural != isSystemNatural {
            dy = -dy
        }
        
        let speed = ConfigManager.shared.config.ui.scroll.speed
        let delta = Int32(dy * Double(speed))
        if delta != 0 {
            // Mouse wheel scrolls view (relative)
            aether_scroll_view(terminal, delta)
            self.setNeedsDisplay(self.bounds)
        }
    }
    
    // Helper for grid coordinates
    private func pointToGrid(_ point: CGPoint) -> (Int, Int) {
        let loc = self.convert(point, from: nil)
        if let renderer = renderer, let (_, r, c) = renderer.convertPointToGrid(loc) {
            return (Int(r), Int(c))
        }
        return (0, 0)
    }
    
    func scrollTo(t: Double) {
        // t: 0.0 (top/oldest) to 1.0 (bottom/newest)
        guard let terminal = terminal else { return }
        let info = aether_get_scroll_info(terminal)
        let maxScroll = Double(info.scrollback_rows)
        
        // Offset 0 = bottom (t=1.0)
        // Offset max = top (t=0.0)
        // offset = (1.0 - t) * maxScroll
        
        let newOffset = UInt32((1.0 - t) * maxScroll)
        aether_scroll_to(terminal, newOffset)
    }
    
    init(frame frameRect: CGRect, device: MTLDevice?, session: TerminalSession) {
        self.terminalSession = session
        super.init(frame: frameRect, device: device ?? MTLCreateSystemDefaultDevice())
        
        self.colorPixelFormat = .bgra8Unorm
        self.clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0)
        
        self.isPaused = false
        self.enableSetNeedsDisplay = false
        self.preferredFramesPerSecond = 30
        self.autoResizeDrawable = false 
        
        AetherBridge.registerCallbacks()
        // ... (env vars)
        setenv("TERM", "xterm-256color", 1)
        setenv("LANG", "en_US.UTF-8", 1)
        setenv("LC_ALL", "en_US.UTF-8", 1)
        setenv("COLORTERM", "truecolor", 1)
        
        // Terminal is now managed by session
        
        do {
            self.renderer = try TerminalRenderer(metalView: self, scrollState: self.terminalSession.scrollState)
            self.renderer?.terminal = self.terminal
            self.delegate = self.renderer
        } catch {
            print("Failed to init renderer: \(error)")
        }
        
        // Listen for scrollbar changes
        self.scrollState.userScrollRequest
            .sink { [weak self] t in
                guard let self = self else { return }
                self.scrollTo(t: t)
            }
            .store(in: &cancellables)
        
        NotificationCenter.default.addObserver(self, selector: #selector(handleThemeChange(_:)), name: NSNotification.Name("AetherThemeChanged"), object: nil)
    }

    override var isOpaque: Bool { false }

    override func viewDidMoveToWindow() {
        super.viewDidMoveToWindow()
        configureWindowAppearance()
    }
    
    private func configureWindowAppearance() {
        guard let window = self.window else { return }
        
        // Unified Title Bar Look
        // Content flows under title bar (.fullSizeContentView)
        // Title bar is transparent (we draw a blur view behind it in SwiftUI)
        window.titlebarAppearsTransparent = true
        window.styleMask.insert(.fullSizeContentView)
        window.titleVisibility = .visible // Ensure title "Aether" is visible
        window.title = "Aether"
        
        window.isOpaque = false
        window.backgroundColor = .clear
        
        // Disable Native Fullscreen to prevent SkyLight crash on transparent windows
        window.collectionBehavior = [.fullScreenNone, .managed]
        
        // Intercept Green Button -> Maximize (Zoom) instead of Fullscreen
        if let zoomButton = window.standardWindowButton(.zoomButton) {
            zoomButton.target = window
            zoomButton.action = #selector(NSWindow.zoom(_:))
        }
        
        self.layer?.isOpaque = false
    }
    
    func updateConfig(_ config: AetherConfig) {
        guard let window = self.window else { return }
        window.alphaValue = CGFloat(config.window.opacity)
        
        switch config.window.titleBar {
        case .hidden:
            window.titleVisibility = .hidden
            window.titlebarAppearsTransparent = true
        case .native:
            window.titleVisibility = .visible
            window.titlebarAppearsTransparent = false
        case .transparent:
            window.titleVisibility = .visible
            window.titlebarAppearsTransparent = true
        }
    }
    
    // MARK: - Custom Fullscreen (With Title Bar)
    
    @objc func toggleCustomFullScreen(_ sender: Any?) {
        guard let window = self.window, let screen = window.screen ?? NSScreen.main else { return }
        
        if isCustomFullScreen {
            exitCustomFullScreen(window: window)
        } else {
            enterCustomFullScreen(window: window, screen: screen)
        }
    }
    
    private func enterCustomFullScreen(window: NSWindow, screen: NSScreen) {
        savedFrame = window.frame
        isCustomFullScreen = true
        
        // Hide Dock/Menu Bar
        NSApp.presentationOptions = [.autoHideMenuBar, .autoHideDock]
        
        // Maximize to Screen Frame
        // IMPORTANT: We keep .titled so the title bar stays visible!
        window.setFrame(screen.frame, display: true, animate: true)
    }
    
    private func exitCustomFullScreen(window: NSWindow) {
        isCustomFullScreen = false
        
        // Restore Dock/Menu Bar
        NSApp.presentationOptions = []
        
        // Restore Frame
        window.setFrame(savedFrame, display: true, animate: true)
    }
    
    required init(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
        // Terminal lifecycle is managed by TerminalSession
    }
    
    @objc private func handleThemeChange(_ notification: Notification) {
        guard let name = notification.object as? String, let renderer = renderer else { return }
        renderer.setTheme(name)
        
        // Update background color from theme
        let theme = ConfigManager.shared.config.colors.resolveTheme()
        if let bg = parseColor(theme.background) {
            self.clearColor = bg
        } else {
             // Fallback for "Default" transparent
             self.clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0.0)
        }
        
        self.setNeedsDisplay(self.bounds)
    }
    
    // Helper to reuse ConfigManager's parsing logic logic locally or just adding minimal one here
    private func parseColor(_ hex: String) -> MTLClearColor? {
        let argb = ConfigManager.shared.parseColor(hex)
        let a = Double((argb >> 24) & 0xFF) / 255.0
        let r = Double((argb >> 16) & 0xFF) / 255.0
        let g = Double((argb >> 8) & 0xFF) / 255.0
        let b = Double(argb & 0xFF) / 255.0
        return MTLClearColor(red: r, green: g, blue: b, alpha: a)
    }
    
    override func keyDown(with event: NSEvent) {
        lastInputTime = CACurrentMediaTime()
        renderer?.updateLastInputTime(lastInputTime)
        
        let modifiers = event.modifierFlags
        
        // 1. Resolve Key Binding
        if let keyStr = keyString(for: event) {
            if let action = ConfigManager.shared.config.keys.bindings[keyStr] {
                if performAction(action) {
                    return
                }
            }
        }
        
        // 2. Default Input Handling
        // Key Mapping
        switch event.keyCode {
        case 36:  sendBytes([0x0D])
        case 51:  sendBytes([0x7F])
        case 53:  
             if isCustomFullScreen { toggleCustomFullScreen(nil); return }
             sendBytes([0x1B])
        case 48:  sendBytes([0x09])
        case 126: sendBytes([0x1B, 0x5B, 0x41])
        case 125: sendBytes([0x1B, 0x5B, 0x42])
        case 124: sendBytes([0x1B, 0x5B, 0x43])
        case 123: sendBytes([0x1B, 0x5B, 0x44])
        case 115: sendBytes([0x1B, 0x5B, 0x48])
        case 119: sendBytes([0x1B, 0x5B, 0x46])
        case 116: sendBytes([0x1B, 0x5B, 0x35, 0x7E])
        case 121: sendBytes([0x1B, 0x5B, 0x36, 0x7E])
        case 117: sendBytes([0x1B, 0x5B, 0x33, 0x7E])
        default:
            if modifiers.contains(.control), let chars = event.charactersIgnoringModifiers {
                if let char = chars.unicodeScalars.first {
                    let code = char.value
                    if code >= 0x61 && code <= 0x7A {
                        sendBytes([UInt8(code - 0x60)])
                        return
                    }
                    if code == 0x5B {
                        sendBytes([0x1B])
                        return
                    }
                }
            }
            if let chars = event.characters {
                sendBytes(Array(chars.utf8))
            }
        }
        
        self.setNeedsDisplay(self.bounds)
    }
    
    private func sendBytes(_ bytes: [UInt8]) {
        guard let terminal = terminal else { return }
        bytes.withUnsafeBufferPointer { ptr in
            if let base = ptr.baseAddress {
                _ = aether_write_input(terminal, base, ptr.count)
            }
        }
    }
    
    // --- Mouse Handling ---
    
    override func mouseDown(with event: NSEvent) {
        let point = self.convert(event.locationInWindow, from: nil)
        guard let terminal = terminal, let renderer = renderer else { return }
        
        if let (_, r, c) = renderer.convertPointToGrid(point) {
            // Check if application wants mouse events
            if aether_mouse_event(terminal, 0, true, r, c, false) {
                self.setNeedsDisplay(self.bounds)
                return
            }
            
            aether_selection_start(terminal, r, c)
            self.setNeedsDisplay(self.bounds)
        }
    }
    
    override func mouseUp(with event: NSEvent) {
        let point = self.convert(event.locationInWindow, from: nil)
        guard let terminal = terminal, let renderer = renderer else { return }
        
        if let (_, r, c) = renderer.convertPointToGrid(point) {
            // Release event (Button 0)
            if aether_mouse_event(terminal, 0, false, r, c, hasMouseDragged) {
                 self.setNeedsDisplay(self.bounds)
                 hasMouseDragged = false
                 return
            }
            
            aether_selection_end(terminal, r, c)
        }
        
        if event.clickCount == 1 && !hasMouseDragged {
            aether_selection_clear(terminal)
        }
        hasMouseDragged = false
        self.setNeedsDisplay(self.bounds)
    }
    
    private func copySelection() {
        guard let terminal = terminal else { return }
        if let ptr = aether_get_selection(terminal) {
             let str = String(cString: ptr)
             aether_free_string(ptr)
             
             if !str.isEmpty {
                 let board = NSPasteboard.general
                 board.clearContents()
                 board.setString(str, forType: .string)
             }
        }
    }
    private func performAction(_ action: String) -> Bool {
        switch action {
        case "copy":
            copySelection()
            return true
        case "paste":
            let board = NSPasteboard.general
            if let str = board.string(forType: .string) {
                sendBytes(Array(str.utf8))
            }
            return true
        case "toggle_fullscreen":
            toggleCustomFullScreen(nil)
            return true
        case "new_tab":
            onAction?("new_tab")
            return true
        case "close_tab":
            onAction?("close_tab")
            return true
        case "new_window":
            print("Action not implemented yet: \(action)")
            return true
        default:
            return false
        }
    }
    
    private func keyString(for event: NSEvent) -> String? {
        var str = ""
        let mod = event.modifierFlags
        
        if mod.contains(.command) { str += "cmd+" }
        if mod.contains(.control) { str += "ctrl+" }
        if mod.contains(.option) { str += "opt+" }
        if mod.contains(.shift) { str += "shift+" }
        
        if let char = event.charactersIgnoringModifiers?.lowercased() {
             if event.keyCode == 36 { return str + "enter" }
             if event.keyCode == 53 { return str + "esc" }
             if event.keyCode == 48 { return str + "tab" }
             if event.keyCode == 51 { return str + "backspace" }
             
             if event.keyCode == 123 { return str + "left" }
             if event.keyCode == 124 { return str + "right" }
             if event.keyCode == 125 { return str + "down" }
             if event.keyCode == 126 { return str + "up" }
             
             if !char.isEmpty {
                 return str + char
             }
        }
        return nil
    }
}
