import Foundation
import SwiftUI
import Combine

class SessionManager: ObservableObject {
    static let shared = SessionManager()
    
    @Published var savedSessions: [SavedSessionState] = []
    
    // Weak reference to the active TabManager to allow saving from AppDelegate
    weak var tabManager: TabManager?
    
    private let maxSessions: Int = 10
    private let fileName = "sessions.json"
    private let lock = NSLock()
    private var isSaving = false
    
    private var fileURL: URL? {
        guard let appSupport = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first else {
            return nil
        }
        let folder = appSupport.appendingPathComponent("Aether")
        try? FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        let url = folder.appendingPathComponent(fileName)
        print("[SessionManager] File URL: \(url.path)")
        return url
    }
    
    init() {
        loadSessions()
    }
    
    // MARK: - Save
    
    func saveSession(tabs: [Tab], activeTabId: UUID?) {
        lock.lock()
        defer { lock.unlock() }
        
        let savedTabs = tabs.map { convert(tab: $0) }
        
        let newState = SavedSessionState(
            timestamp: Date(),
            tabs: savedTabs,
            activeTabId: activeTabId
        )
        
        // Update state and persist immediately
        var newSessions = [newState] + self.savedSessions
        if newSessions.count > self.maxSessions {
            newSessions = Array(newSessions.prefix(self.maxSessions))
        }
        
        self.savedSessions = newSessions
        self.persistToDisk()
    }
    
    private func persistToDisk() {
        guard let url = fileURL else { return }
        do {
            let data = try JSONEncoder().encode(savedSessions)
            try data.write(to: url)
            print("[SessionManager] Saved \(savedSessions.count) sessions to \(url.path)")
        } catch {
            print("[SessionManager] Failed to save: \(error)")
        }
    }
    
    // MARK: - Load
    
    func loadSessions() {
        guard let url = fileURL else { return }
        if !FileManager.default.fileExists(atPath: url.path) {
            print("[SessionManager] No saved sessions file found at \(url.path)")
            return
        }
        
        do {
            let data = try Data(contentsOf: url)
            let decoded = try JSONDecoder().decode([SavedSessionState].self, from: data)
            // Sort by timestamp descending to ensure the newest is first
            savedSessions = decoded.sorted { $0.timestamp > $1.timestamp }
            print("[SessionManager] Loaded \(savedSessions.count) sessions from disk.")
        } catch {
            print("[SessionManager] Failed to load: \(error)")
        }
    }
    
    func restoreLastSession() -> SavedSessionState? {
        return savedSessions.sorted { $0.timestamp > $1.timestamp }.first
    }
    
    // MARK: - Converters
    
    private func convert(tab: Tab) -> SavedTab {
        return SavedTab(
            id: tab.id,
            title: tab.title,
            root: convert(node: tab.root),
            activePaneId: tab.activePaneId
        )
    }
    
    private func convert(node: PaneNode) -> SavedPaneNode {
        switch node {
        case .pane(let pane):
            return .pane(SavedPane(
                id: pane.id,
                cwd: getCwd(for: pane.session),
                title: pane.session.title,
                history: pane.session.getHistory()
            ))
        case .split(let id, let axis, let first, let second, let loc):
            return .split(
                id: id,
                axis: axis,
                first: convert(node: first),
                second: convert(node: second),
                splitLocation: loc
            )
        }
    }
    
    // Convert back functionality will be in TabManager or similar
    
    // MARK: - Helpers
    
    private func getCwd(for session: TerminalSession) -> String {
        // We need a way to get CWD from session.
        // TerminalSession has it inside `updateTitle` but doesn't expose it directly as a property.
        // We should add `cwd` property to TerminalSession or expose `aether_get_cwd`.
        return session.currentCwd ?? FileManager.default.homeDirectoryForCurrentUser.path
    }
}
