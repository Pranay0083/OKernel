import simd

struct GlyphInstance {
    var position: SIMD2<Float>
    var size: SIMD2<Float>
    var texCoord: SIMD2<Float>
    var texSize: SIMD2<Float>
    var fgColor: SIMD4<Float>
    var bgColor: SIMD4<Float>
    var flags: UInt32
}
