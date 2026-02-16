import Foundation

extension Bundle {
    /// A robust way to find the Aether resource bundle that works in both
    /// development (SPM) and production (App Bundle) environments.
    static var aether: Bundle {
        #if DEBUG
        // In debug/development, SPM's generated module bundle usually works
        // because it has an absolute path fallback to the source tree.
        return Bundle.module
        #else
        // In release/production, we need to be more clever because
        // Bundle.module's generated accessor is very rigid.
        
        let bundleName = "AetherApp_AetherApp.bundle"
        
        // Potential locations for the resource bundle within a .app or parallel to executable
        let candidates: [URL?] = [
            // 1. Standard App Bundle Resources
            Bundle.main.resourceURL?.appendingPathComponent(bundleName),
            
            // 2. Parallel to executable in Contents/MacOS (where SPM executable logic looks)
            Bundle.main.bundleURL.appendingPathComponent("Contents/MacOS/\(bundleName)"),
            
            // 3. Root of the .app (fallback for simplified bundles)
            Bundle.main.bundleURL.appendingPathComponent(bundleName),
            
            // 4. Fallback: Search the entire main bundle for this specific bundle name
            // (Slow, but better than a crash)
            Bundle.main.url(forResource: "AetherApp_AetherApp", withExtension: "bundle")
        ]
        
        for case let url? in candidates {
            if let bundle = Bundle(url: url) {
                return bundle
            }
        }
        
        // If we still haven't found it, try Bundle.module as a last resort
        // (This might crash, but we have no other options)
        return Bundle.module
        #endif
    }
}
