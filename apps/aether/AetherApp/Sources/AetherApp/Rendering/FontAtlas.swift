import Metal
import CoreText
import CoreGraphics
import Foundation
import Cocoa

class FontAtlas {
    let texture: MTLTexture
    let device: MTLDevice
    
    private var glyphCache: [GlyphKey: GlyphInfo] = [:]
    private let packer: ShelfPacker
    private let ctFont: CTFont
    
    let cellWidth: CGFloat
    let cellHeight: CGFloat
    let ascent: CGFloat
    let descent: CGFloat
    let scale: CGFloat
    
    struct GlyphKey: Hashable {
        let character: UInt32
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
        
        let descriptor = CTFontDescriptorCreateWithAttributes([
            kCTFontNameAttribute: fontName as CFString,
            kCTFontSizeAttribute: scaledFontSize as CFNumber
        ] as CFDictionary)
        self.ctFont = CTFontCreateWithFontDescriptor(descriptor, scaledFontSize, nil)
        
        self.ascent = CTFontGetAscent(ctFont)
        self.descent = CTFontGetDescent(ctFont)
        
        // Calculate cell metrics based on 'M'
        var glyph = CTFontGetGlyphWithName(ctFont, "M" as CFString)
        var advance = CGSize.zero
        CTFontGetAdvancesForGlyphs(ctFont, .horizontal, &glyph, &advance, 1)
        self.cellWidth = advance.width
        self.cellHeight = ascent + descent + CTFontGetLeading(ctFont)
        
        // Initialize atlas texture (2048x2048 single channel 8-bit)
        let textureDesc = MTLTextureDescriptor.texture2DDescriptor(pixelFormat: .r8Unorm, width: 2048, height: 2048, mipmapped: false)
        textureDesc.usage = [.shaderRead]
        guard let tex = device.makeTexture(descriptor: textureDesc) else {
            throw NSError(domain: "AetherApp", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to create atlas texture"])
        }
        self.texture = tex
        
        self.packer = ShelfPacker(width: 2048, height: 2048)
        
        // Create solid white pixel for background drawing
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
        let key = GlyphKey(character: char, bold: bold, italic: italic)
        if let info = glyphCache[key] {
            return info
        }
        
        let info = rasterizeGlyph(char, bold: bold, italic: italic)
        glyphCache[key] = info
        return info
    }
    
    private func rasterizeGlyph(_ char: UInt32, bold: Bool, italic: Bool) -> GlyphInfo {
        // Create variations if needed (bold/italic)
        // For simplicity, we currently just use the base font. 
        // Real implementation would use CTFontCreateCopyWithSymbolicTraits.
        
        guard let scalar = UnicodeScalar(char) else {
            return GlyphInfo(u: 0, v: 0, width: 0, height: 0, bearingX: 0, bearingY: 0)
        }
        
        let string = String(scalar)
        let cfString = string as CFString
        let range = CFRangeMake(0, CFStringGetLength(cfString))
        // Find best font for this character (cascading)
        let glyphFont = CTFontCreateForString(ctFont, cfString, range)
        
        // Use the fallback font (glyphFont) instead of the base font (ctFont)
        let attrString = NSAttributedString(string: string, attributes: [.font: glyphFont, .foregroundColor: NSColor.white])
        let line = CTLineCreateWithAttributedString(attrString)
        
        let runArray = CTLineGetGlyphRuns(line)
        guard CFArrayGetCount(runArray) > 0 else {
            return GlyphInfo(u: 0, v: 0, width: 0, height: 0, bearingX: 0, bearingY: 0)
        }
        
        let run = unsafeBitCast(CFArrayGetValueAtIndex(runArray, 0), to: CTRun.self)
        var glyph = CGGlyph()
        var position = CGPoint.zero
        CTRunGetGlyphs(run, CFRangeMake(0, 1), &glyph)
        CTRunGetPositions(run, CFRangeMake(0, 1), &position)
        
        let bounds = CTRunGetImageBounds(run, nil, CFRangeMake(0, 1))
        let width = Int(ceil(bounds.width))
        let height = Int(ceil(bounds.height))
        
        guard width > 0 && height > 0 else {
             return GlyphInfo(u: 0, v: 0, width: 0, height: 0, bearingX: 0, bearingY: 0)
        }
        
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
        
        ctx.translateBy(x: -bounds.origin.x, y: -bounds.origin.y)
        CTRunDraw(run, ctx, CFRangeMake(0, 1))
        
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
