
import Foundation

class Tab: Identifiable, ObservableObject {
    let id: UUID
    @Published var title: String
    @Published var root: PaneNode
    @Published var activePaneId: UUID?
    
    init(root: PaneNode) {
        self.id = UUID()
        self.title = "Terminal"
        self.root = root
        
        // Auto-set active pane to the first available pane
        if case .pane(let p) = root {
            self.activePaneId = p.id
            self.title = p.session.title
        }
    }
    
    var activePane: Pane? {
        guard let id = activePaneId else { return nil }
        return root.findPane(id: id)
    }
}
