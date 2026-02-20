import Metal
import CoreText
import CoreGraphics
import Foundation
import Cocoa

class FontAtlas {
    let texture: MTLTexture
    let device: MTLDevice
    
    private var glyphCache: [GlyphKey: GlyphInfo] = [:]
    private var charToGlyphCache: [UInt32: CGGlyph] = [:]
    private let packer: ShelfPacker
    let ctFont: CTFont
    
    let cellWidth: CGFloat
    let cellHeight: CGFloat
    let ascent: CGFloat
    let descent: CGFloat
    let scale: CGFloat
    
    struct GlyphKey: Hashable {
        let glyph: CGGlyph
        let fontName: String // PostScript name
        let bold: Bool
        let italic: Bool
    }
    
    struct GlyphInfo {
        let u: Float
        let v: Float
        let width: Float
        let height: Float
        let bearingX: Float
        let bearingY: Float
    }
    
    init(device: MTLDevice, fontName: String, fontSize: CGFloat, scale: CGFloat) throws {
        self.device = device
        self.scale = scale
        
        // Create font at scaled size (e.g. 14 * 2 = 28px for Retina)
        let scaledFontSize = fontSize * scale
        
        // Font Fallback List
        let requested = fontName
        let fallbacks = ["Menlo", "Monaco", "Courier New", "Andale Mono"]
        let candidates = [requested] + fallbacks
        
        var bestFont: CTFont?
        
        for name in candidates {
            let descriptor = CTFontDescriptorCreateWithAttributes([
                kCTFontNameAttribute: name as CFString,
                kCTFontSizeAttribute: scaledFontSize as CFNumber
            ] as CFDictionary)
            
            let font = CTFontCreateWithFontDescriptor(descriptor, scaledFontSize, nil)
            let actualName = CTFontCopyFullName(font) as String
            
            // Check if we got what we asked for
            // If we ask for "SF Mono" and get "Helvetica", we should reject it.
            // If we ask for "Menlo" and get "Menlo Regular", we accept it.
            
            // Special case for SF Mono which might have system prefixes
            let match = actualName.localizedCaseInsensitiveContains(name) || 
                       (name == "SF Mono" && actualName.contains("SF Mono"))
            
            if match {
                 bestFont = font
                 break
            }
        }
        
        // Final fallback
        let finalFont = bestFont ?? CTFontCreateWithFontDescriptor(
            CTFontDescriptorCreateWithAttributes([
                kCTFontNameAttribute: "Menlo" as CFString,
                kCTFontSizeAttribute: scaledFontSize as CFNumber
            ] as CFDictionary),
            scaledFontSize, nil)
            
        self.ctFont = finalFont
        print("FontAtlas: Loaded font '\(CTFontCopyFullName(finalFont) as String)' (Requested: '\(fontName)')")
        
        // Solid pixel
        self.ascent = CTFontGetAscent(ctFont)
        self.descent = CTFontGetDescent(ctFont)
        
        // Calculate cell metrics
        // For monospaced fonts, all advances are the same so averaging doesn't matter.
        // For proportional/cursive fonts, averaging gives a representative cell width
        // that keeps the grid tight and text naturally connected.
        let sampleChars = "abcdefghijklmnopqrstuvwxyz0123456789"
        var totalAdvance: CGFloat = 0
        var sampleCount: CGFloat = 0
        for char in sampleChars.unicodeScalars {
            var g = CTFontGetGlyphWithName(ctFont, String(char) as CFString)
            if g == 0 {
                // Fallback: get glyph via character
                var ch = UniChar(char.value)
                CTFontGetGlyphsForCharacters(ctFont, &ch, &g, 1)
            }
            if g != 0 {
                var adv = CGSize.zero
                CTFontGetAdvancesForGlyphs(ctFont, .horizontal, &g, &adv, 1)
                totalAdvance += adv.width
                sampleCount += 1
            }
        }
        if sampleCount > 0 {
            self.cellWidth = ceil(totalAdvance / sampleCount)
        } else {
            // Fallback to 'M'
            var glyph = CTFontGetGlyphWithName(ctFont, "M" as CFString)
            var advance = CGSize.zero
            CTFontGetAdvancesForGlyphs(ctFont, .horizontal, &glyph, &advance, 1)
            self.cellWidth = ceil(advance.width)
        }
        self.cellHeight = ceil(ascent + descent + CTFontGetLeading(ctFont))
        
        // Initialize atlas texture
        let textureDesc = MTLTextureDescriptor.texture2DDescriptor(pixelFormat: .r8Unorm, width: 2048, height: 2048, mipmapped: false)
        textureDesc.usage = [.shaderRead]
        guard let tex = device.makeTexture(descriptor: textureDesc) else {
            throw NSError(domain: "AetherApp", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to create atlas texture"])
        }
        self.texture = tex
        
        self.packer = ShelfPacker(width: 2048, height: 2048)
        
        // Create solid white pixel
        _ = createSolidPixel()
    }
    
    private var solidRect: GlyphInfo?
    
    func getSolidRect() -> GlyphInfo {
        if let rect = solidRect { return rect }
        return createSolidPixel()
    }
    
    private func createSolidPixel() -> GlyphInfo {
        let width = 1
        let height = 1
        
        guard let (x, y) = packer.pack(width: width, height: height) else {
            return GlyphInfo(u: 0, v: 0, width: 0, height: 0, bearingX: 0, bearingY: 0)
        }
        
        let pixel: [UInt8] = [255]
        let region = MTLRegionMake2D(x, y, width, height)
        texture.replace(region: region, mipmapLevel: 0, withBytes: pixel, bytesPerRow: 1)
        
        let texWidth = Float(texture.width)
        let texHeight = Float(texture.height)
        
        let info = GlyphInfo(
            u: Float(x) / texWidth,
            v: Float(y) / texHeight,
            width: Float(width) / texWidth,
            height: Float(height) / texHeight,
            bearingX: 0,
            bearingY: 0
        )
        solidRect = info
        return info
    }
    
    func getGlyph(_ char: UInt32, bold: Bool, italic: Bool) -> GlyphInfo {
        // Fallback to primary font if no font provided
        return getGlyph(char, font: ctFont, bold: bold, italic: italic)
    }
    
    func getGlyph(_ char: UInt32, font: CTFont, bold: Bool, italic: Bool) -> GlyphInfo {
        let glyph = CTFontGetGlyphWithName(font, String(UnicodeScalar(char)!) as CFString)
        return getGlyph(glyph, font: font, bold: bold, italic: italic)
    }
    
    func getGlyph(_ glyph: CGGlyph, bold: Bool, italic: Bool) -> GlyphInfo {
        return getGlyph(glyph, font: ctFont, bold: bold, italic: italic)
    }
    
    func getGlyph(_ glyph: CGGlyph, font: CTFont, bold: Bool, italic: Bool) -> GlyphInfo {
        let fontName = CTFontCopyPostScriptName(font) as String
        let key = GlyphKey(glyph: glyph, fontName: fontName, bold: bold, italic: italic)
        
        if let info = glyphCache[key] {
            return info
        }
        
        let info = rasterizeGlyph(glyph, font: font, bold: bold, italic: italic)
        glyphCache[key] = info
        return info
    }
    
    private func rasterizeGlyph(_ glyph: CGGlyph, font: CTFont, bold: Bool, italic: Bool) -> GlyphInfo {
        // Create a single-glyph run
        var glyph = glyph
        
        // We'll use CTRunDraw but we need to create a run with the specific glyph.
        // Actually, it's easier to just use CTFontDrawGlyphs if we have the context.
        
        let bounds = CTFontGetBoundingRectsForGlyphs(font, .horizontal, &glyph, nil, 1)
        let width = Int(ceil(bounds.width))
        let height = Int(ceil(bounds.height))
        
        if width == 0 || height == 0 {
            // print("FontAtlas: Zero size glyph \(glyph) for font \(CTFontCopyFullName(ctFont) as String)")
            return GlyphInfo(u: 0, v: 0, width: 0, height: 0, bearingX: 0, bearingY: 0)
        }
        
        // print("FontAtlas: Rasterizing glyph \(glyph), size \(width)x\(height), bearing (\(bounds.origin.x), \(bounds.origin.y))")
        
        // Pack into atlas
        guard let (x, y) = packer.pack(width: width, height: height) else {
            print("Atlas full!")
            return GlyphInfo(u: 0, v: 0, width: 0, height: 0, bearingX: 0, bearingY: 0)
        }
        
        // Draw to context
        let colorSpace = CGColorSpaceCreateDeviceGray()
        guard let ctx = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: width, space: colorSpace, bitmapInfo: CGImageAlphaInfo.none.rawValue) else {
            return GlyphInfo(u: 0, v: 0, width: 0, height: 0, bearingX: 0, bearingY: 0)
        }
        
        // Clear context to zero (alpha 0 in atlas)
        ctx.setFillColor(gray: 0.0, alpha: 1.0)
        ctx.fill(CGRect(x: 0, y: 0, width: width, height: height))
        
        // Use white for font drawing (alpha 1 in atlas)
        ctx.setFillColor(gray: 1.0, alpha: 1.0)
        ctx.translateBy(x: -bounds.origin.x, y: -bounds.origin.y)
        
        var g = glyph
        var p = CGPoint.zero
        CTFontDrawGlyphs(font, &g, &p, 1, ctx)
        
        // Upload to texture
        if let data = ctx.data {
            let region = MTLRegionMake2D(x, y, width, height)
            texture.replace(region: region, mipmapLevel: 0, withBytes: data, bytesPerRow: width)
        }
        
        let texWidth = Float(texture.width)
        let texHeight = Float(texture.height)
        
        return GlyphInfo(
            u: Float(x) / texWidth,
            v: Float(y) / texHeight,
            width: Float(width) / texWidth,
            height: Float(height) / texHeight,
            bearingX: Float(bounds.origin.x),
            bearingY: Float(bounds.origin.y)
        )
    }
}

// Shelf bin packing for atlas
class ShelfPacker {
    var shelves: [(y: Int, height: Int, x: Int)] = []
    let width: Int
    let height: Int
    var currentY: Int = 0
    
    init(width: Int, height: Int) {
        self.width = width
        self.height = height
    }
    
    func pack(width: Int, height: Int) -> (x: Int, y: Int)? {
        // Try to fit in existing shelves
        for i in 0..<shelves.count {
            if shelves[i].height >= height && (self.width - shelves[i].x) >= width {
                let x = shelves[i].x
                let y = shelves[i].y
                shelves[i].x += width
                return (x, y)
            }
        }
        
        // Create new shelf
        if currentY + height <= self.height {
            let newY = currentY
            currentY += height
            shelves.append((y: newY, height: height, x: width))
            return (0, newY)
        }
        
        return nil
    }
}
