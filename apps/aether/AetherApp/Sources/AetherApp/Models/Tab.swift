
import Foundation
import Combine

class Tab: Identifiable, ObservableObject {
    let id: UUID
    @Published var title: String
    @Published var root: PaneNode
    @Published var activePaneId: UUID? {
        didSet {
            if oldValue != activePaneId {
                updateSessionSubscription()
            }
        }
    }
    
    private var cancellables = Set<AnyCancellable>()
    
    init(root: PaneNode) {
        self.id = UUID()
        self.title = "Terminal"
        self.root = root
        
        // Auto-set active pane to the first available pane
        if case .pane(let p) = root {
            self.activePaneId = p.id
            self.title = p.session.title
        }
        
        updateSessionSubscription()
    }
    
    private func updateSessionSubscription() {
        cancellables.removeAll()
        
        guard let session = activePane?.session else { return }
        
        // Initial title sync
        self.title = session.title
        
        // Observe title changes
        session.$title
            .sink { [weak self] newTitle in
                self?.title = newTitle
            }
            .store(in: &cancellables)
    }
    
    var activePane: Pane? {
        guard let id = activePaneId else { return nil }
        return root.findPane(id: id)
    }
}
