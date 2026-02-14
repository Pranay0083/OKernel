import Cocoa
import MetalKit
import CAether

class TerminalView: MTKView {
    var renderer: TerminalRenderer?
    var terminal: OpaquePointer?
    private var hasMouseDragged = false
    
    // Custom Fullscreen State
    private var isCustomFullScreen = false
    private var savedFrame: NSRect = .zero
    
    override var acceptsFirstResponder: Bool { true }
    override var isFlipped: Bool { true }
    
    override func scrollWheel(with event: NSEvent) {
        guard let terminal = terminal else { return }
        let delta = Int32(event.scrollingDeltaY)
        if delta != 0 {
            aether_scroll_view(terminal, delta)
            self.setNeedsDisplay(self.bounds)
        }
    }
    
    override init(frame frameRect: CGRect, device: MTLDevice?) {
        super.init(frame: frameRect, device: device ?? MTLCreateSystemDefaultDevice())
        
        self.colorPixelFormat = .bgra8Unorm
        self.clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0)
        
        self.isPaused = false
        self.enableSetNeedsDisplay = false
        self.preferredFramesPerSecond = 30
        
        AetherBridge.registerCallbacks()
        
        setenv("TERM", "xterm-256color", 1)
        setenv("LANG", "en_US.UTF-8", 1)
        setenv("LC_ALL", "en_US.UTF-8", 1)
        setenv("COLORTERM", "truecolor", 1)
        
        self.terminal = aether_terminal_with_pty(24, 80, nil)
        
        do {
            self.renderer = try TerminalRenderer(metalView: self)
            self.renderer?.terminal = self.terminal
            self.delegate = self.renderer
        } catch {
            print("Failed to init renderer: \(error)")
        }
        
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
        if let term = terminal {
            aether_terminal_free(term)
        }
    }
    
    @objc private func handleThemeChange(_ notification: Notification) {
        guard let name = notification.object as? String, let renderer = renderer else { return }
        renderer.setTheme(name)
        
        switch name {
        case "Solarized Dark":
            self.clearColor = MTLClearColor(red: 0/255, green: 43/255, blue: 54/255, alpha: 0.85)
        case "Dracula":
            self.clearColor = MTLClearColor(red: 40/255, green: 42/255, blue: 54/255, alpha: 0.85)
        case "OneDark":
            self.clearColor = MTLClearColor(red: 40/255, green: 44/255, blue: 52/255, alpha: 0.85)
        default:
            self.clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0.0)
        }
        
        self.setNeedsDisplay(self.bounds)
    }
    
    override func keyDown(with event: NSEvent) {
        let modifiers = event.modifierFlags
        
        // Cmd+C / Cmd+V / Cmd+Enter / Esc
        if modifiers.contains(.command) && event.charactersIgnoringModifiers == "c" {
            copySelection()
            return
        }
        if modifiers.contains(.command) && event.charactersIgnoringModifiers == "v" {
             let board = NSPasteboard.general
             if let str = board.string(forType: .string) {
                 sendBytes(Array(str.utf8))
             }
             return
        }
        if modifiers.contains(.command) && event.keyCode == 36 { // Cmd+Enter
            toggleCustomFullScreen(nil)
            return
        }
        if event.keyCode == 53 && isCustomFullScreen { // Esc
            toggleCustomFullScreen(nil)
            return
        }
        
        // Key Mapping
        switch event.keyCode {
        case 36:  sendBytes([0x0D])
        case 51:  sendBytes([0x7F])
        case 53:  sendBytes([0x1B])
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
    
    override func mouseDragged(with event: NSEvent) {
        let point = self.convert(event.locationInWindow, from: nil)
        guard let terminal = terminal, let renderer = renderer else { return }
        
        if let (_, r, c) = renderer.convertPointToGrid(point) {
            // Drag event (Button 0 assumed for left drag)
            if aether_mouse_event(terminal, 0, true, r, c, true) {
                self.setNeedsDisplay(self.bounds)
                return
            }

            hasMouseDragged = true
            aether_selection_drag(terminal, r, c)
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
}
