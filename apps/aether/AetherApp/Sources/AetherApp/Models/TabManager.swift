import Foundation
import Combine

class TabManager: ObservableObject {
    @Published var tabs: [TerminalSession] = []
    @Published var activeTabId: UUID?
    
    init() {
        // Start with one tab
        addTab()
    }
    
    func addTab() {
        let newSession = TerminalSession()
        tabs.append(newSession)
        activeTabId = newSession.id
    }
    
    func closeTab(id: UUID) {
        guard let index = tabs.firstIndex(where: { $0.id == id }) else { return }
        
        tabs.remove(at: index)
        
        if tabs.isEmpty {
            // Ideally should close window or app, but for now add a new tab so it's never empty
            addTab()
        } else if activeTabId == id {
            // Switch to adjacent tab
            let newIndex = min(index, tabs.count - 1)
            activeTabId = tabs[newIndex].id
        }
    }
    
    func activateTab(id: UUID) {
        if tabs.contains(where: { $0.id == id }) {
            activeTabId = id
        }
    }
    
    var activeSession: TerminalSession? {
        tabs.first(where: { $0.id == activeTabId })
    }
}
