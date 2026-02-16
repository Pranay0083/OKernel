import Metal
import MetalKit
import simd
import CAether
import AppKit
import QuartzCore
import Darwin

class TerminalRenderer: NSObject, MTKViewDelegate {
    let device: MTLDevice
    let commandQueue: MTLCommandQueue
    let pipelineState: MTLRenderPipelineState
    var fontAtlas: FontAtlas
    let scrollState: TerminalScrollState
    
    var isActive: Bool = true {
        didSet {
            // Force redraw on focus change
            forceNextFrame = true
        }
    }
    
    private var lastInputTime: TimeInterval = 0
    
    private var instanceBuffer: MTLBuffer?
    private var viewportSize: SIMD2<Float> = .zero
    private var scaleFactor: Float = 2.0  // Retina: drawable pixels / view points

    // private let lock = NSLock() // Removed in favor of session.lock
    
    // Terminal state (accessed via session)
    weak var session: TerminalSession?
    
    var terminal: OpaquePointer? {
        session?.terminal
    }
    
    var rows: Int = 24
    var cols: Int = 80
    
    init(metalView: MTKView, session: TerminalSession) throws {
        self.session = session
        self.scrollState = session.scrollState
        guard let device = metalView.device else {
            throw NSError(domain: "AetherApp", code: 2, userInfo: [NSLocalizedDescriptionKey: "Metal view has no device"])
        }
        self.device = device
        
        guard let queue = device.makeCommandQueue() else {
             throw NSError(domain: "AetherApp", code: 3, userInfo: [NSLocalizedDescriptionKey: "Failed to create command queue"])
        }
        self.commandQueue = queue
        
        // Load shaders - using robust bundle finder
        let library: MTLLibrary
        let resourceBundle = Bundle.aether
        if let metalURL = resourceBundle.url(forResource: "Shaders", withExtension: "metal"),
           let shaderSource = try? String(contentsOf: metalURL, encoding: .utf8) {
            do {
                library = try device.makeLibrary(source: shaderSource, options: nil)
            } catch {
                throw NSError(domain: "AetherApp", code: 4, userInfo: [
                    NSLocalizedDescriptionKey: "Failed to compile Metal shaders: \(error.localizedDescription)"
                ])
            }
        } else {
            throw NSError(domain: "AetherApp", code: 4, userInfo: [
                NSLocalizedDescriptionKey: "Failed to find Shaders.metal in Aether bundle (\(resourceBundle.bundlePath))"
            ])
        }
        
        let vertexFunction = library.makeFunction(name: "vertex_main")
        let fragmentFunction = library.makeFunction(name: "fragment_main")
        
        let pipelineDescriptor = MTLRenderPipelineDescriptor()
        pipelineDescriptor.vertexFunction = vertexFunction
        pipelineDescriptor.fragmentFunction = fragmentFunction
        pipelineDescriptor.colorAttachments[0].pixelFormat = metalView.colorPixelFormat
        
        // Enable alpha blending
        pipelineDescriptor.colorAttachments[0].isBlendingEnabled = true
        pipelineDescriptor.colorAttachments[0].sourceRGBBlendFactor = .sourceAlpha
        pipelineDescriptor.colorAttachments[0].destinationRGBBlendFactor = .oneMinusSourceAlpha
        pipelineDescriptor.colorAttachments[0].sourceAlphaBlendFactor = .sourceAlpha
        pipelineDescriptor.colorAttachments[0].destinationAlphaBlendFactor = .oneMinusSourceAlpha
        
        self.pipelineState = try device.makeRenderPipelineState(descriptor: pipelineDescriptor)
        
        // Initialize FontAtlas with proper scale
        let scale = metalView.window?.backingScaleFactor ?? NSScreen.main?.backingScaleFactor ?? 2.0
        let fontConfig = ConfigManager.shared.config.font
        self.fontAtlas = try FontAtlas(device: device, fontName: fontConfig.family, fontSize: CGFloat(fontConfig.size), scale: scale)
        self.scaleFactor = Float(scale)
        
        super.init()
        
        // Apply initial theme from config
        applyTheme(ConfigManager.shared.config.colors.resolveTheme())
        
        
        NotificationCenter.default.addObserver(self, selector: #selector(handleFontLoaded), name: NSNotification.Name("AetherFontLoaded"), object: nil)
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
    
    @objc private func handleFontLoaded() {
        session?.lock.lock()
        defer { session?.lock.unlock() }
        
        do {
            let fontConfig = ConfigManager.shared.config.font
            let scale = CGFloat(scaleFactor)
            self.fontAtlas = try FontAtlas(device: device, fontName: fontConfig.family, fontSize: CGFloat(fontConfig.size), scale: scale)
            forceNextFrame = true
            print("Renderer: Font reloaded - \(fontConfig.family)")
        } catch {
            print("Renderer: Failed to reload font: \(error)")
        }
    }
    
    func updateLastInputTime(_ time: TimeInterval) {
        self.lastInputTime = time
        // Force redraw to ensure cursor state updates immediately (e.g. stops blinking)
        self.forceNextFrame = true
    }
    
    func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {
        if size.width == 0 || size.height == 0 { return }
        
        // Log thread to see if this is Main
        print("Renderer: mtkView drawableSizeWillChange to \(size) on thread: \(Thread.current.isMainThread ? "Main" : "Background")")
        
        session?.lock.lock()
        defer { session?.lock.unlock() }
        
        viewportSize = SIMD2<Float>(Float(size.width), Float(size.height))
        // Calculate scale factor: drawable pixels / view points
        let viewWidth = view.bounds.width
        if viewWidth > 0 {
            scaleFactor = Float(size.width / viewWidth)
        }
        // Update Viewport State Only
        // WE DO NOT CALL recalculateGridSizeInternal (aether_resize) HERE!
        // That is now exclusively handled by resize() on the background thread.
        
        // Force a redraw so the terminal repaints with the new viewport/scale
        forceNextFrame = true
        if scrollState.viewportOffset == 0 {
             if let terminal = terminal {
                 aether_scroll_to(terminal, 0)
             }
        }
        
        // Force a redraw so the terminal repaints with the new grid dimensions
        forceNextFrame = true
    }
    
    // Thread-safe resize called from TerminalView (possibly background thread)
    func resize(drawableSize size: CGSize, viewWidth: CGFloat) {
        if size.width == 0 || size.height == 0 { return }
        
        print("Renderer: resize to \(size) on thread: \(Thread.current.isMainThread ? "Main" : "Background")")
        
        session?.lock.lock()
        defer { session?.lock.unlock() }
        
        viewportSize = SIMD2<Float>(Float(size.width), Float(size.height))
        
        if viewWidth > 0 {
            scaleFactor = Float(size.width / viewWidth)
        }
        
        recalculateGridSizeInternal()
        
        // Force a full clear/redraw on resize to prevent "garbage" text/artifacts
        // logic: if possible, tell renderer to clear background? 
        // For now, ensuring forceNextFrame is true is best we can do in Swift.
        // The artifact might be from the PTY side. 
        
        if scrollState.viewportOffset == 0 {
             if let terminal = terminal {
                 aether_scroll_to(terminal, 0)
             }
        }
        
        forceNextFrame = true
    }
    
    func draw(in view: MTKView) {
        // Non-blocking lock attempt.
        // If the background thread is resizing (holding lock), we simply SKIP this frame.
        // This prevents the Main Thread from freezing/hanging while waiting for heavy resize ops.
        guard let session = session else { return }
        if !session.lock.try() {
            return
        }
        defer { session.lock.unlock() }
        
        guard let terminal = terminal,
              let drawable = view.currentDrawable,
              let descriptor = view.currentRenderPassDescriptor else {
            print("DEBUG: draw skipped - terminal: \(terminal != nil), drawable: \(view.currentDrawable != nil), descriptor: \(view.currentRenderPassDescriptor != nil)")
            return
        }
        
        
        // REMOVED: aether_process_output(terminal)
        // This is now handled by TerminalSession's background IO loop.
        // Doing I/O on the render thread caused massive stalls and contention.

        
        // Update scroll state for UI
        let scrollInfo = aether_get_scroll_info(terminal)
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            // Only update if changed to avoid excessive view updates
            if self.scrollState.viewportOffset != scrollInfo.viewport_offset ||
               self.scrollState.totalRows != scrollInfo.total_rows {
                self.scrollState.totalRows = scrollInfo.total_rows
                self.scrollState.visibleRows = scrollInfo.visible_rows
                self.scrollState.scrollbackRows = scrollInfo.scrollback_rows
                self.scrollState.viewportOffset = scrollInfo.viewport_offset
            }
        }
        
        // Always redraw at 30fps for smooth cursor blink.
        // The isDirty check was skipping frames when idle, preventing cursor animation.
        forceNextFrame = false
        
        // Build instance buffer from grid
        let instances = buildInstances()
        updateInstanceBuffer(instances)
        
        // Encode render commands
        guard let commandBuffer = commandQueue.makeCommandBuffer(),
              let encoder = commandBuffer.makeRenderCommandEncoder(descriptor: descriptor) else { return }
        
        encoder.setRenderPipelineState(pipelineState)
        if let buffer = instanceBuffer {
            encoder.setVertexBuffer(buffer, offset: 0, index: 0)
        }
        encoder.setVertexBytes(&viewportSize, length: MemoryLayout<SIMD2<Float>>.size, index: 1)
        encoder.setFragmentTexture(fontAtlas.texture, index: 0)
        
        // Single instanced draw call
        if !instances.isEmpty {
            encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: 6, instanceCount: instances.count)
        }
        
        encoder.endEncoding()
        commandBuffer.present(drawable)
        commandBuffer.commit()
        
        aether_mark_clean(terminal)
    }
    
    private func buildInstances() -> [GlyphInstance] {
        var instances: [GlyphInstance] = []
        guard let terminal = terminal else { return [] }
        
        let cursor = aether_get_cursor(terminal)
        let now = CACurrentMediaTime()
        let blinkRate = max(0.1, min(10.0, ConfigManager.shared.config.cursor.blinkRate))
        let blinkPeriod = 1.0 / Float(blinkRate) // seconds per full blink cycle
        
        // Smart Blink Logic
        // Smart Blink Logic
        
        // Smart Blink / Inactive Logic
        var isCursorBlinkOn = false
        if isActive {
            if ConfigManager.shared.config.cursor.smartBlink {
                let timeSinceInput = now - lastInputTime
                if timeSinceInput < 0.5 {
                    isCursorBlinkOn = true
                } else {
                    let cursorPhase = fmod(Float(now), blinkPeriod)
                    isCursorBlinkOn = cursor.visible && (cursorPhase < blinkPeriod * 0.5)
                }
            } else {
                let cursorPhase = fmod(Float(now), blinkPeriod)
                isCursorBlinkOn = cursor.visible && (cursorPhase < blinkPeriod * 0.5)
            }
            if !ConfigManager.shared.config.cursor.blink {
                isCursorBlinkOn = cursor.visible
            }
        } else {
            // Inactive: Always show cursor (no blink), but maybe diff style
            isCursorBlinkOn = cursor.visible
        }
        
        let ratio = scaleFactor / Float(fontAtlas.scale)
        let cw = Float(fontAtlas.cellWidth) * ratio
        let ch = Float(fontAtlas.cellHeight) * ratio
        let lineSpacing = max(1.0, min(3.0, ConfigManager.shared.config.font.lineHeight))
        let rowHeight = ch * lineSpacing // Extra vertical space between lines
        let ascentScaled = Float(fontAtlas.ascent) * ratio
        let solidRect = fontAtlas.getSolidRect()
        
        // Cursor Config
        let cursorLimit = ConfigManager.shared.config.cursor
        let style = cursorLimit.style
        let isBlock = (style == .block)
        
        // Selection Highlight Color
        let selHex = ConfigManager.shared.config.colors.selection ?? "#5A3399FF"
        let selRaw = ConfigManager.shared.parseColor(selHex)
        let selA = Float((selRaw >> 24) & 0xFF) / 255.0
        let selR = Float((selRaw >> 16) & 0xFF) / 255.0
        let selG = Float((selRaw >> 8) & 0xFF) / 255.0
        let selB = Float(selRaw & 0xFF) / 255.0
        let selectionBG = SIMD4<Float>(selR, selG, selB, selA)
        
        let padPx = PADDING * scaleFactor
        
        // Pass 1: Backgrounds
        let isCursorVisibleInViewport = (scrollState.viewportOffset == 0)
        
        for r in 0..<UInt32(rows) {
            for c in 0..<UInt32(cols) {
                // If this is the cursor and it's a BLOCK, SKIP background drawing in Pass 1.
                // We will draw the inverted block in Pass 2.
                if isCursorBlinkOn && isBlock && isCursorVisibleInViewport && r == cursor.row && c == cursor.col {
                    continue
                }
                
                guard let cellPtr = aether_get_cell(terminal, r, c) else { continue }
                let cell = cellPtr.pointee
                
                // Flags: 7=Wide(0x80), 8=Spacer(0x100)
                let flags = cell.flags
                let isWide = (flags & 0x0080) != 0
                let isSpacer = (flags & 0x0100) != 0
                
                if isSpacer { continue } // Skip spacers, let the wide char cover it
                
                let x = Float(c) * cw + padPx
                let y = Float(r) * rowHeight + padPx
                
                let bgColorVal = cell.bg_color
                let isSelected = aether_selection_contains(terminal, r, c)
                
                // Draw cell BG if not default black
                if bgColorVal != 0xFF000000 {
                     let cellBG = colorFromARGB(bgColorVal)
                     let width = isWide ? cw * 2.0 : cw
                     
                     let bgInst = GlyphInstance(
                         position: SIMD2<Float>(x, y),
                         size: SIMD2<Float>(width, rowHeight),
                         texCoord: SIMD2<Float>(solidRect.u, solidRect.v),
                         texSize: SIMD2<Float>(solidRect.width, solidRect.height),
                         fgColor: cellBG,
                         bgColor: cellBG,
                         flags: 0
                     )
                     instances.append(bgInst)
                }
                
                // Draw selection overlay (semi-transparent blue on top of content)
                if isSelected {
                     let width = isWide ? cw * 2.0 : cw
                     let selInst = GlyphInstance(
                         position: SIMD2<Float>(x, y),
                         size: SIMD2<Float>(width, rowHeight),
                         texCoord: SIMD2<Float>(solidRect.u, solidRect.v),
                         texSize: SIMD2<Float>(solidRect.width, solidRect.height),
                         fgColor: selectionBG,
                         bgColor: selectionBG,
                         flags: 0
                     )
                     instances.append(selInst)
                }
            }
        }
        
        // Pass 2: Foregrounds & Cursor
        for r in 0..<UInt32(rows) {
            for c in 0..<UInt32(cols) {
                guard let cellPtr = aether_get_cell(terminal, r, c) else { continue }
                let cell = cellPtr.pointee
                
                let flags = cell.flags
                let isSpacer = (flags & 0x0100) != 0
                if isSpacer { continue }
                
                // Flags handling for shader
                // We pass `flags` cast to UInt32.
                // Powerline flags logic needs to be preserved or re-implemented.
                
                let x = Float(c) * cw + padPx
                let y = Float(r) * rowHeight + padPx
                
                let fgColorVal = cell.fg_color
                var fg = colorFromARGB(fgColorVal)
                var bg = SIMD4<Float>(0, 0, 0, 0) // Default transparent
                
                // Cursor Rendering Logic
                // 1. Only draw/invert cursor if we are at the bottom of the history (offset 0)
                //    This prevents the cursor from "floating" over history when scrolling up.
                let isCursorVisibleInViewport = (scrollState.viewportOffset == 0)
                
                // Determine effective cursor style
                // Priority: LibAether state (dynamic) -> Config (default)
                // But LibAether default is 0 (Block).
                // Let's use LibAether style mapping: 0=Block, 1=Underline, 2=Bar
                var effectiveStyle = ConfigManager.shared.config.cursor.style
                
                // Map dynamic style from Zig
                switch cursor.style {
                case 1: effectiveStyle = .underline
                case 2: effectiveStyle = .beam
                default: break // 0 is Block, or fallback
                }
                
                let currentStyle = effectiveStyle // derived from state
                let isBlock = (currentStyle == .block)

                // Handle Block Cursor Inversion
                if isCursorBlinkOn && isBlock && isCursorVisibleInViewport && r == cursor.row && c == cursor.col {
                    // Invert:
                    // New FG = Effective BG (default to black if valid)
                    // New BG = Effective FG
                    
                    let bgVal = cell.bg_color
                    let effectiveBG = (bgVal == 0xFF000000) ? colorFromARGB(0xFF000000) : colorFromARGB(bgVal)
                    let effectiveFG = fg
                    
                    var newFG = effectiveBG
                    var newBG = effectiveFG
                    
                    if !isActive {
                         // Inactive Cursor: Grey Hollow-ish look (Stroke?) 
                         // Or just Grey Block.
                         newBG = SIMD4<Float>(0.5, 0.5, 0.5, 1.0) // Grey
                         newFG = effectiveFG // Keep text color mostly same? Or invert against grey?
                         // Let's force text to simple black or white for readability
                         newFG = SIMD4<Float>(0, 0, 0, 1)
                    }
                    
                    // Fix for "Transparent Lens": If newFG (Old BG) is transparent, text becomes invisible.
                    // Force newFG to be opaque contrast color.
                    // Also ensure the cursor block itself (newBG) is opaque.
                    
                    var safeNewBG = newBG
                    if safeNewBG.w < 1.0 {
                        safeNewBG.w = 1.0 
                    }
                    
                    // Contrast check skipped for inactive grey cursor to keep it simple
                    if isActive && (newFG.w < 0.1 || (safeNewBG.w > 0.9 && distance(newFG, safeNewBG) < 0.1)) {
                        let lum = 0.299 * newBG.x + 0.587 * newBG.y + 0.114 * newBG.z
                        if lum > 0.5 {
                            newFG = SIMD4<Float>(0, 0, 0, 1) // Black Text on Light Block
                        } else {
                            newFG = SIMD4<Float>(1, 1, 1, 1) // White Text on Dark Block
                        }
                    }
                    
                    fg = newFG
                    bg = newBG
                }
                
                if cell.codepoint != 0 && cell.codepoint != 32 {
                     let isPowerline = (cell.codepoint >= 0xE0B0 && cell.codepoint <= 0xE0B3)
                     var shaderFlags: UInt32 = UInt32(flags)
                     
                     if isPowerline {
                         switch cell.codepoint {
                         case 0xE0B0: shaderFlags |= 0x80000000 | (0 << 28)
                         case 0xE0B1: shaderFlags |= 0x80000000 | (1 << 28)
                         case 0xE0B2: shaderFlags |= 0x80000000 | (2 << 28)
                         case 0xE0B3: shaderFlags |= 0x80000000 | (3 << 28)
                         default: break
                         }
                         
                         let plInst = GlyphInstance(
                             position: SIMD2<Float>(x, y),
                             size: SIMD2<Float>(cw, ch),
                             texCoord: SIMD2<Float>(solidRect.u, solidRect.v),
                             texSize: SIMD2<Float>(solidRect.width, solidRect.height),
                             fgColor: fg,
                             bgColor: bg,
                             flags: shaderFlags
                         )
                         instances.append(plInst)
                     } else {
                         // Normal Glyph
                         let glyph = fontAtlas.getGlyph(cell.codepoint, bold: false, italic: false)
                         let glyphPixelW = glyph.width * Float(fontAtlas.texture.width)
                         let glyphPixelH = glyph.height * Float(fontAtlas.texture.height)
                         // Scale glyph visually
                         let glyphW = glyphPixelW * ratio
                         let glyphH = glyphPixelH * ratio
                         
                         let glyphX = x + glyph.bearingX * ratio
                         let glyphOriginY = y + ascentScaled - (glyph.bearingY * ratio + glyphH)
                         
                         let fgInst = GlyphInstance(
                             position: SIMD2<Float>(glyphX, glyphOriginY),
                             size: SIMD2<Float>(glyphW, glyphH),
                             texCoord: SIMD2<Float>(glyph.u, glyph.v),
                             texSize: SIMD2<Float>(glyph.width, glyph.height),
                             fgColor: fg,
                             bgColor: bg,
                             flags: shaderFlags
                         )
                         instances.append(fgInst)
                     }
                }
                
                // Cursor Geometry Logic
                // User wants cursor to match "text height" (ascent + descent) and be centered.
                
                let ascent = Float(fontAtlas.ascent) * ratio
                let descent = Float(fontAtlas.descent) * ratio
                let textHeight = ascent + descent
                
                // Text is rendered from the top (y), so we should align cursor to top (y) to match.
                // Centering in rowHeight causes misalignment if line spacing is large.
                let textOffsetY: Float = 0.0
                
                if isCursorBlinkOn && isBlock && isCursorVisibleInViewport && r == cursor.row && c == cursor.col && (cell.codepoint == 0 || cell.codepoint == 32) {
                    // Empty cell block cursor
                    let blockInst = GlyphInstance(
                        position: SIMD2<Float>(x, y + textOffsetY),
                        size: SIMD2<Float>(cw, textHeight),
                        texCoord: SIMD2<Float>(solidRect.u, solidRect.v),
                        texSize: SIMD2<Float>(solidRect.width, solidRect.height),
                        fgColor: bg, 
                        bgColor: bg,
                        flags: 0
                    )
                    instances.append(blockInst)
                }
                
                // Cursor Rendering (Beam / Underline)
                if isCursorBlinkOn && !isBlock && isCursorVisibleInViewport && r == cursor.row && c == cursor.col {
                    let cursorColor = colorFromARGB(0xFFFFFFFF) // White
                    
                    var rectSize: SIMD2<Float> = .zero
                    var rectPos: SIMD2<Float> = SIMD2<Float>(x, y)
                    
                    if currentStyle == .beam {
                        rectSize = SIMD2<Float>(2.0, textHeight) // Match text height
                        rectPos.y = y + textOffsetY // Center it
                    } else if currentStyle == .underline {
                        rectSize = SIMD2<Float>(cw, 2.0)
                        rectPos.y = y + rowHeight - 2.0 // Keep at bottom of ROW
                    }
                    
                    if rectSize.x > 0 {
                        let cursorInst = GlyphInstance(
                            position: rectPos,
                            size: rectSize,
                            texCoord: SIMD2<Float>(solidRect.u, solidRect.v),
                            texSize: SIMD2<Float>(solidRect.width, solidRect.height),
                            fgColor: cursorColor,
                            bgColor: cursorColor,
                            flags: 0
                        )
                        instances.append(cursorInst)
                    }
                } else if !isActive && isCursorBlinkOn && !isBlock && isCursorVisibleInViewport && r == cursor.row && c == cursor.col {
                    // Inactive Beam/Underline -> Draw Hollow/Grey
                    let cursorColor = SIMD4<Float>(0.5, 0.5, 0.5, 1.0)
                     
                    var rectSize: SIMD2<Float> = .zero
                    var rectPos: SIMD2<Float> = SIMD2<Float>(x, y)
                    
                    if currentStyle == .beam {
                        rectSize = SIMD2<Float>(2.0, textHeight) // Match text height
                        rectPos.y = y + textOffsetY // Center it
                    } else if currentStyle == .underline {
                        rectSize = SIMD2<Float>(cw, 2.0)
                        rectPos.y = y + rowHeight - 2.0 // Keep at bottom of ROW
                    }
                    
                    if rectSize.x > 0 {
                        let cursorInst = GlyphInstance(
                            position: rectPos,
                            size: rectSize,
                            texCoord: SIMD2<Float>(solidRect.u, solidRect.v),
                            texSize: SIMD2<Float>(solidRect.width, solidRect.height),
                            fgColor: cursorColor,
                            bgColor: cursorColor,
                            flags: 0
                        )
                        instances.append(cursorInst)
                    }
                }
            }
        }
        
        return instances
    }
    
    private let PADDING: Float = 10.0
    
    /// Convert view point (local coords) to Grid (row, col)
    func convertPointToGrid(_ point: CGPoint) -> (uint: UInt32, row: UInt32, col: UInt32)? {
        guard viewportSize.x > 0 && viewportSize.y > 0 else { return nil }
        
        // Adjust for padding (in points)
        let x = point.x - CGFloat(PADDING)
        let y = point.y - CGFloat(PADDING)
        
        let ratio = scaleFactor / Float(fontAtlas.scale)
        let atlasW = Float(fontAtlas.cellWidth)
        let atlasH = Float(fontAtlas.cellHeight)
        let effectiveW = Double(atlasW * ratio / scaleFactor) // Points
        let effectiveH = Double(atlasH * ratio / scaleFactor) // Points
        
        let c = Int(Double(x) / effectiveW)
        let r = Int(Double(y) / effectiveH)
        
        if c >= 0 && c < cols && r >= 0 && r < rows {
             return (0, UInt32(r), UInt32(c))
        }
        return nil
    }
    
    private func updateInstanceBuffer(_ instances: [GlyphInstance]) {
        guard !instances.isEmpty else { return }
        let size = instances.count * MemoryLayout<GlyphInstance>.stride
        if instanceBuffer == nil || instanceBuffer!.length < size {
            instanceBuffer = device.makeBuffer(length: size, options: .storageModeShared)
        }
        guard let buffer = instanceBuffer else { return }
        buffer.contents().copyMemory(from: instances, byteCount: size)
    }
    
    private func recalculateGridSizeInternal() {
        guard viewportSize.x > 0 && viewportSize.y > 0 else { return }
        
        // PADDING is in points. viewportSize is in pixels.
        // We need consistent units. Let's work entirely in physical pixels (backing store).
        
        // FontAtlas gives metrics in pixels if scale was passed correctly during init.
        // However, let's be explicit:
        // cellWidth/Height in FontAtlas * (current_view_scale / font_atlas_scale) = physical pixels on screen of a cell?
        
        let ratio = scaleFactor / Float(fontAtlas.scale)
        let cellW = Float(fontAtlas.cellWidth) * ratio
        let cellH = Float(fontAtlas.cellHeight) * ratio
        let lineSpacing = max(1.0, min(3.0, ConfigManager.shared.config.font.lineHeight))
        let rowH = cellH * lineSpacing
        
        let padPx = PADDING * scaleFactor
        let availableW = max(0, viewportSize.x - (padPx * 2))
        let availableH = max(0, viewportSize.y - (padPx * 2))
        
        // Enforce minimum dimensions (e.g. 2x2) to prevent core crashes
        let newCols = max(2, Int(availableW / cellW))
        let newRows = max(2, Int(availableH / rowH))
        
        if newCols != cols || newRows != rows {
            cols = newCols
            rows = newRows
            if let terminal = terminal {
                _ = aether_resize(terminal, UInt32(rows), UInt32(cols))
                // Force redraw after resize to prevent "disappearing content"
                forceNextFrame = true
            }
        }
    }
    
    private var colorMap: [UInt32: UInt32] = [:]
    
    // ... (init, etc.) ...
    
    private var forceNextFrame = false

    private func applyInitialState() {
        guard let terminal = terminal else { return }
        
        // Sync Dimensions
        self.rows = Int(aether_get_rows(terminal))
        self.cols = Int(aether_get_cols(terminal))
        
        // Apply Cursor Style
        let style = ConfigManager.shared.config.cursor.style
        var zigStyle: UInt8 = 0
        switch style {
        case .block: zigStyle = 0
        case .underline: zigStyle = 1
        case .beam: zigStyle = 2
        }
        aether_set_cursor_style(terminal, zigStyle)
        
        forceNextFrame = true
    }
    
    func applyTheme(_ theme: Theme) {
        colorMap.removeAll()
        // Default ANSI mapping (Zig internal defaults -> Theme Palette)
        let defaults: [UInt32] = [
            0xFF000000, // Black
            0xFFCD0000, // Red
            0xFF00CD00, // Green
            0xFFCDCD00, // Yellow
            0xFF0000EE, // Blue
            0xFFCD00CD, // Magenta
            0xFF00CDCD, // Cyan
            0xFFE5E5E5, // White
            0xFF7F7F7F, // Bright Black
            0xFFFF0000, // Bright Red
            0xFF00FF00, // Bright Green
            0xFFFFFF00, // Bright Yellow
            0xFF5C5CFF, // Bright Blue
            0xFFFF00FF, // Bright Magenta
            0xFF00FFFF, // Bright Cyan
            0xFFFFFFFF  // Bright White
        ]
        
        let parser = ConfigManager.shared
        
        for (i, defaultColor) in defaults.enumerated() {
            if i < theme.palette.count {
                let themeColor = parser.parseColor(theme.palette[i])
                colorMap[defaultColor] = themeColor
            }
        }
        
        // Force redraw to apply colors immediately
        forceNextFrame = true
    }
    
    // Legacy support for menu
    func setTheme(_ name: String) {
        // Update global config
        ConfigManager.shared.config.colors.scheme = name
        let theme = ConfigManager.shared.config.colors.resolveTheme()
        applyTheme(theme)
    }

    /// Decode ARGB color from Zig terminal (format: 0xAARRGGBB) using Theme mapping
    private func colorFromARGB(_ color: UInt32) -> SIMD4<Float> {
        let mapped = colorMap[color] ?? color
        let a = Float((mapped >> 24) & 0xFF) / 255.0
        let r = Float((mapped >> 16) & 0xFF) / 255.0
        let g = Float((mapped >> 8) & 0xFF) / 255.0
        let b = Float(mapped & 0xFF) / 255.0
        return SIMD4<Float>(r, g, b, a)
    }

}
