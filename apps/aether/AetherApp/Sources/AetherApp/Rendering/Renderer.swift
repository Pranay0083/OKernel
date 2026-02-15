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
    let fontAtlas: FontAtlas
    
    private var instanceBuffer: MTLBuffer?
    private var viewportSize: SIMD2<Float> = .zero
    private var scaleFactor: Float = 2.0  // Retina: drawable pixels / view points
    private let lock = NSLock()
    
    // Terminal state (from Zig)
    var terminal: OpaquePointer?
    var rows: Int = 24
    var cols: Int = 80
    
    init(metalView: MTKView) throws {
        guard let device = metalView.device else {
            throw NSError(domain: "AetherApp", code: 2, userInfo: [NSLocalizedDescriptionKey: "Metal view has no device"])
        }
        self.device = device
        
        guard let queue = device.makeCommandQueue() else {
             throw NSError(domain: "AetherApp", code: 3, userInfo: [NSLocalizedDescriptionKey: "Failed to create command queue"])
        }
        self.commandQueue = queue
        
        // Load shaders — SPM doesn't compile .metal into .metallib,
        // so we compile from source at runtime
        let library: MTLLibrary
        if let metalURL = Bundle.module.url(forResource: "Shaders", withExtension: "metal"),
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
                NSLocalizedDescriptionKey: "Failed to find Shaders.metal in resource bundle"
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
        self.fontAtlas = try FontAtlas(device: device, fontName: "Menlo", fontSize: 14.0, scale: scale)
        self.scaleFactor = Float(scale)
        
        super.init()
        
        // Apply initial theme from config
        applyTheme(ConfigManager.shared.config.theme)
    }
    
    func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {
        guard size.width > 0 && size.height > 0 else { return }
        
        lock.lock()
        defer { lock.unlock() }
        
        viewportSize = SIMD2<Float>(Float(size.width), Float(size.height))
        // Calculate scale factor: drawable pixels / view points
        let viewWidth = view.bounds.width
        if viewWidth > 0 {
            scaleFactor = Float(size.width / viewWidth)
        }
        recalculateGridSizeInternal()
        
        print("DEBUG: Resize -> Viewport: \(viewportSize), Scale: \(scaleFactor), Rows: \(rows), Cols: \(cols)")
        
        // Force a redraw so the terminal repaints with the new grid dimensions
        forceNextFrame = true
    }
    
    func draw(in view: MTKView) {
        lock.lock()
        defer { lock.unlock() }
        
        guard let terminal = terminal,
              let drawable = view.currentDrawable,
              let descriptor = view.currentRenderPassDescriptor else { return }
        
        // Process any pending PTY output
        aether_process_output(terminal)
        
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
        let blinkRate = max(0.1, min(10.0, ConfigManager.shared.config.cursorBlinkRate ?? 2.0))
        let blinkPeriod = 1.0 / Float(blinkRate) // seconds per full blink cycle
        let cursorPhase = fmod(Float(now), blinkPeriod)
        let isCursorBlinkOn = cursor.visible && (cursorPhase < blinkPeriod * 0.5)
        
        let ratio = scaleFactor / Float(fontAtlas.scale)
        let cw = Float(fontAtlas.cellWidth) * ratio
        let ch = Float(fontAtlas.cellHeight) * ratio
        let lineSpacing = max(1.0, min(3.0, ConfigManager.shared.config.lineSpacing ?? 1.2))
        let rowHeight = ch * lineSpacing // Extra vertical space between lines
        let ascentScaled = Float(fontAtlas.ascent) * ratio
        let solidRect = fontAtlas.getSolidRect()
        
        let padPx = PADDING * scaleFactor
        
        // Selection highlight color from config (or default semi-transparent blue)
        let selHex = ConfigManager.shared.config.theme.selectionColor ?? "#5A3399FF"
        let selRaw = ConfigManager.shared.parseColor(selHex)
        let selA = Float((selRaw >> 24) & 0xFF) / 255.0
        let selR = Float((selRaw >> 16) & 0xFF) / 255.0
        let selG = Float((selRaw >> 8) & 0xFF) / 255.0
        let selB = Float(selRaw & 0xFF) / 255.0
        let selectionBG = SIMD4<Float>(selR, selG, selB, selA)
        
        // Pass 1: Backgrounds
        for r in 0..<UInt32(rows) {
            for c in 0..<UInt32(cols) {
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
                
                let fg = colorFromARGB(fgColorVal)
                // Glyph background must be transparent — backgrounds are handled in Pass 1
                let cellBG = SIMD4<Float>(0, 0, 0, 0)
                
                // Glyph Rendering
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
                             bgColor: cellBG,
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
                             bgColor: cellBG,
                             flags: shaderFlags
                         )
                         instances.append(fgInst)
                     }
                }
                
                // Cursor Rendering (Beam)
                // Draw AFTER glyph (on top)
                if isCursorBlinkOn && r == cursor.row && c == cursor.col {
                    let cursorColor = colorFromARGB(0xFFFFFFFF) // White beam
                    let beamWidth: Float = 2.0 // Fixed 2 points
                    
                    let cursorInst = GlyphInstance(
                        position: SIMD2<Float>(x, y), // Left edge
                        size: SIMD2<Float>(beamWidth, rowHeight),
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
        let lineSpacing = max(1.0, min(3.0, ConfigManager.shared.config.lineSpacing ?? 1.2))
        let rowH = cellH * lineSpacing
        
        let padPx = PADDING * scaleFactor
        let availableW = max(0, viewportSize.x - (padPx * 2))
        let availableH = max(0, viewportSize.y - (padPx * 2))
        
        let newCols = max(1, Int(availableW / cellW))
        let newRows = max(1, Int(availableH / rowH))
        
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

    func applyTheme(_ theme: ThemeConfig) {
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
        // Build a temporary theme config from hardcoded values if needed,
        // or just load from ConfigManager if we added them there.
        // For now, let's map the menu names to the static presets in ConfigManager.
        switch name {
        case "Solarized Dark":
            applyTheme(ThemeConfig.solarizedDark)
        case "Dracula":
             applyTheme(ThemeConfig.dracula)
        case "OneDark":
             applyTheme(ThemeConfig.oneDark)
        default:
             // Default or Custom from config
             applyTheme(ConfigManager.shared.config.theme)
        }
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
