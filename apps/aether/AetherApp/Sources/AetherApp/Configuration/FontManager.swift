import Foundation
import AppKit
import CoreText

class FontManager: ObservableObject {
    static let shared = FontManager()
    
    private let fontCacheDir: URL
    
    // Published so UI can react if needed (e.g. font loaded)
    @Published var isFontLoading: Bool = false
    @Published var loadError: String? = nil
    
    private init() {
        let fileManager = FileManager.default
        let home = fileManager.homeDirectoryForCurrentUser
        self.fontCacheDir = home.appendingPathComponent(".config/aether/fonts")
        
        try? fileManager.createDirectory(at: fontCacheDir, withIntermediateDirectories: true)
    }
    
    /// Loads the configured font. If a download URL is present, downloads it first.
    func setup() {
        let config = ConfigManager.shared.config.font
        
        if let urlString = config.downloadUrl, let url = URL(string: urlString) {
            downloadAndRegisterFont(from: url)
        } else {
            // Just ensure system font is available?
            // If custom family is set but not installed, system usually falls back.
            // We can check availability here if we want.
        }
    }
    
    func downloadAndRegisterFont(from url: URL) {
        let filename = url.lastPathComponent
        let localURL = fontCacheDir.appendingPathComponent(filename)
        
        if FileManager.default.fileExists(atPath: localURL.path) {
            registerFont(at: localURL)
            return
        }
        
        print("Downloading font from \(url)...")
        isFontLoading = true
        
        let task = URLSession.shared.downloadTask(with: url) { [weak self] tempURL, response, error in
            DispatchQueue.main.async {
                self?.isFontLoading = false
                if let error = error {
                    print("Font download failed: \(error)")
                    self?.loadError = error.localizedDescription
                    return
                }
                
                guard let tempURL = tempURL else { return }
                
                do {
                    try FileManager.default.moveItem(at: tempURL, to: localURL)
                    self?.registerFont(at: localURL)
                } catch {
                    print("Failed to save font: \(error)")
                }
            }
        }
        task.resume()
    }
    
    private func registerFont(at url: URL) {
        // Create a provider
        guard let provider = CGDataProvider(url: url as CFURL) else {
            print("Failed to create font provider for \(url)")
            return
        }
        
        // Try creating font to verify
        guard let font = CGFont(provider) else {
            print("Failed to create CGFont from \(url)")
            return
        }
        
        var error: Unmanaged<CFError>?
        if !CTFontManagerRegisterGraphicsFont(font, &error) {
            // It might already be registered by the system or previous run
            print("Failed to register font: \(error?.takeUnretainedValue().localizedDescription ?? "Unknown error") (This is normal if already registered)")
        } else {
            print("Successfully registered font: \(font.fullName as String? ?? "Unknown")")
            
            // Notify Renderer to reload font atlas?
            // Renderer checks config.font.family.
            // If we just registered it, we might need to trigger a redraw or atlas rebuild.
            // Simplest way: Notification.
            NotificationCenter.default.post(name: NSNotification.Name("AetherFontLoaded"), object: nil)
        }
    }
}
