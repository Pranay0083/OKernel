import Foundation
import AppKit
import CoreText

class FontManager: ObservableObject {
    static let shared = FontManager()
    
    private let fontCacheDir: URL
    
    // Published so UI can react if needed (e.g. font loaded)
    @Published var isFontLoading: Bool = false
    @Published var loadError: String? = nil
    
    private var registeredFamilies: Set<String> = []
    
    private init() {
        let fileManager = FileManager.default
        let home = fileManager.homeDirectoryForCurrentUser
        self.fontCacheDir = home.appendingPathComponent(".config/aether/fonts")
        
        try? fileManager.createDirectory(at: fontCacheDir, withIntermediateDirectories: true)
    }
    
    /// Loads the configured font. If missing, attempts to download from Google Fonts.
    func setup() {
        let config = ConfigManager.shared.config.font
        let family = config.family
        
        // Scan for existing cached fonts first
        scanAndRegisterCachedFonts()
        
        if !isFontAvailable(family) {
            print("FontManager: Font '\(family)' not found. Attempting Google Fonts download...")
            let escapedFamily = family.replacingOccurrences(of: " ", with: "+")
            if let url = URL(string: "https://fonts.google.com/download?family=\(escapedFamily)") {
                downloadAndRegisterFont(from: url)
            }
        }
    }
    
    private func scanAndRegisterCachedFonts() {
        let enumerator = FileManager.default.enumerator(at: fontCacheDir, includingPropertiesForKeys: nil)
        while let fileURL = enumerator?.nextObject() as? URL {
            let ext = fileURL.pathExtension.lowercased()
            if ext == "ttf" || ext == "otf" {
                registerFont(at: fileURL)
            }
        }
    }
    
    private func isFontAvailable(_ family: String) -> Bool {
        if registeredFamilies.contains(family) { return true }
        
        // System check
        let font = NSFont(name: family, size: 12)
        return font != nil || NSFontManager.shared.availableFontFamilies.contains(family)
    }
    
    func downloadAndRegisterFont(from url: URL) {
        // We'll try to fetch the Google Fonts CSS first to get a direct .ttf/.otf URL.
        // If that fails, we fallback to the requested URL (which might be the ZIP download).
        
        print("FontManager: Attempting to resolve direct URL from: \(url)")
        isFontLoading = true
        loadError = nil
        
        let familyParam = URLComponents(url: url, resolvingAgainstBaseURL: false)?
            .queryItems?.first(where: { $0.name == "family" })?.value ?? ""
        
        let escapedFamily = familyParam.replacingOccurrences(of: " ", with: "+")
        let cssURLString = "https://fonts.googleapis.com/css2?family=\(escapedFamily)"
        
        guard let cssURL = URL(string: cssURLString) else {
            self.downloadDirect(from: url, isZip: true)
            return
        }
        
        let task = URLSession.shared.dataTask(with: cssURL) { [weak self] data, response, error in
            if let data = data, let css = String(data: data, encoding: .utf8) {
                // Simple regex to find the first url(...) in the CSS
                if let match = css.range(of: "url\\((.*?)\\)", options: .regularExpression) {
                    let fullUrlStr = String(css[match])
                    let rawUrl = fullUrlStr.replacingOccurrences(of: "url(", with: "").replacingOccurrences(of: ")", with: "").trimmingCharacters(in: .punctuationCharacters)
                    
                    if let directURL = URL(string: rawUrl) {
                        print("FontManager: Resolved direct URL: \(directURL)")
                        self?.downloadDirect(from: directURL, isZip: false)
                        return
                    }
                }
            }
            
            // Fallback
            print("FontManager: CSS resolution failed, falling back to ZIP download")
            self?.downloadDirect(from: url, isZip: true)
        }
        task.resume()
    }
    
    private func downloadDirect(from url: URL, isZip: Bool) {
        let task = URLSession.shared.downloadTask(with: url) { [weak self] tempURL, response, error in
            DispatchQueue.main.async {
                self?.isFontLoading = false
                if let error = error {
                    print("FontManager: Download failed: \(error)")
                    self?.loadError = error.localizedDescription
                    return
                }
                
                guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                    print("FontManager: Invalid server response")
                    return
                }
                
                if let tempURL = tempURL {
                    if isZip {
                        // Handle ZIP download
                        let zipURL = self?.fontCacheDir.appendingPathComponent(UUID().uuidString + ".zip")
                        if let zipURL = zipURL {
                            try? FileManager.default.moveItem(at: tempURL, to: zipURL)
                            self?.extractAndRegisterZip(at: zipURL)
                            try? FileManager.default.removeItem(at: zipURL)
                        }
                    } else {
                        // Handle direct TTF/OTF download
                        let ext = url.pathExtension.isEmpty ? "ttf" : url.pathExtension
                        let fontURL = self?.fontCacheDir.appendingPathComponent(UUID().uuidString + "." + ext)
                        if let fontURL = fontURL {
                            try? FileManager.default.moveItem(at: tempURL, to: fontURL)
                            self?.registerFont(at: fontURL)
                        }
                    }
                }
            }
        }
        task.resume()
    }
    
    private func extractAndRegisterZip(at zipURL: URL) {
        let destinationDir = fontCacheDir.appendingPathComponent(UUID().uuidString)
        try? FileManager.default.createDirectory(at: destinationDir, withIntermediateDirectories: true)
        
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/unzip")
        process.arguments = ["-o", zipURL.path, "-d", destinationDir.path]
        
        do {
            try process.run()
            process.waitUntilExit()
            
            // Scan for font files recursively
            let enumerator = FileManager.default.enumerator(at: destinationDir, includingPropertiesForKeys: nil)
            while let fileURL = enumerator?.nextObject() as? URL {
                let ext = fileURL.pathExtension.lowercased()
                if ext == "ttf" || ext == "otf" {
                    registerFont(at: fileURL)
                }
            }
        } catch {
            print("Zip extraction failed: \(error)")
        }
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
            print("FontManager: Registration note: \(error?.takeUnretainedValue().localizedDescription ?? "Unknown error")")
        }
        
        let ctFont = CTFontCreateWithGraphicsFont(font, 0, nil, nil)
        let familyName = CTFontCopyFamilyName(ctFont) as String
        if !registeredFamilies.contains(familyName) {
            registeredFamilies.insert(familyName)
            print("Successfully registered font: \(familyName)")
            NotificationCenter.default.post(name: NSNotification.Name("AetherFontLoaded"), object: nil)
        }
    }
}
