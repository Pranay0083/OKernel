
import Foundation
import Combine
import SwiftUI

enum MoveDirection {
    case left, right, up, down
}

class TabManager: ObservableObject {
    @Published var tabs: [Tab] = []
    @Published var activeTabId: UUID?
    @Published var isFullScreen: Bool = false
    
    init() {
        // Start with one tab
        addTab()
    }
    
    var activeTab: Tab? {
        tabs.first(where: { $0.id == activeTabId })
    }
    
    var activeSession: TerminalSession? {
        activeTab?.activePane?.session
    }
    
    func addTab() {
        let session = TerminalSession()
        let pane = Pane(session: session)
        let root = PaneNode.pane(pane)
        let newTab = Tab(root: root)
        
        tabs.append(newTab)
        activeTabId = newTab.id
    }
    
    func closeTab(id: UUID) {
        guard let index = tabs.firstIndex(where: { $0.id == id }) else { return }
        
        // Cleanup sessions...
        tabs.remove(at: index)
        
        if tabs.isEmpty {
            addTab()
        } else if activeTabId == id {
            let newIndex = min(index, tabs.count - 1)
            activeTabId = tabs[newIndex].id
        }
    }
    
    func activateTab(id: UUID) {
        if tabs.contains(where: { $0.id == id }) {
            activeTabId = id
        }
    }
    
    // MARK: - Pane Management
    
    func setActivePane(paneId: UUID) {
        if activeTab?.activePaneId != paneId {
            activeTab?.activePaneId = paneId
            self.objectWillChange.send() // Notify AetherApp to update scrollbar/etc
        }
    }
    
    func splitPane(axis: Axis) {
        guard let tab = activeTab, let activePaneId = tab.activePaneId else { return }
        
        let newSession = TerminalSession()
        let newPane = Pane(session: newSession)
        
        // Inherit CWD?
        // Basic inherited CWD
        if tab.activePane?.session != nil {
            // Need a way to extract CWD from session if we want to inherit, 
            // but TerminalSession tracks it via polling.
            // But we don't have an easy way to pass it to new pty yet without modifying `TerminalSession.init`.
        }
        
        guard let currentPane = tab.root.findPane(id: activePaneId) else { return }
        
        let currentPaneNode = PaneNode.pane(currentPane)
        let newPaneNode = PaneNode.pane(newPane)
        
        let splitNode = PaneNode.split(
            id: UUID(),
            axis: axis,
            first: currentPaneNode,
            second: newPaneNode,
            splitLocation: 0.5
        )
        
        tab.root = tab.root.replace(id: activePaneId, with: splitNode)
        tab.activePaneId = newPane.id
        
        // Notify observers to update UI (scrollbar, title, etc)
        self.objectWillChange.send()
    }
    
    func closeActivePane() {
        guard let tab = activeTab, let activePaneId = tab.activePaneId else { return }
        
        if case .pane = tab.root {
            closeTab(id: tab.id)
            return
        }
        
        if let newRoot = tab.root.remove(id: activePaneId) {
            tab.root = newRoot
            if let first = findFirstPane(node: newRoot) {
                tab.activePaneId = first.id
            }
        } else {
            closeTab(id: tab.id)
        }
    }
    
    private func findFirstPane(node: PaneNode) -> Pane? {
        switch node {
        case .pane(let p): return p
        case .split(_, _, let first, _, _): return findFirstPane(node: first)
        }
    }
    
    // MARK: - Focus Navigation
    
    func moveFocus(direction: MoveDirection) {
        guard let tab = activeTab, let activeId = tab.activePaneId else { return }
        
        // This is complex because we need spatial awareness of the tree.
        // Simplified approach: iterate "flat" list of panes for Left/Right if it matches visual order?
        // No, tree structure matters.
        
        // Real logic: Traverse up from active pane to find the first split node that separates us 
        // from a neighbor in the desired direction.
        
        // Since `PaneNode` is a value type enum (mostly), we don't have parent pointers.
        // We have to search from root.
        
        if let nextPane = findNeighbor(node: tab.root, targetId: activeId, direction: direction) {
            tab.activePaneId = nextPane.id
        }
    }
    
    // Returns the pane that is spatially "next" to targetId in 'direction'
    private func findNeighbor(node: PaneNode, targetId: UUID, direction: MoveDirection) -> Pane? {
        // Recursive search for the split that contains targetId and has a sibling in direction
        
        switch node {
        case .pane:
            return nil // Leaf node has no neighbors inside itself
            
        case .split(_, let axis, let first, let second, _):
            // Check if target is in first or second child
            let inFirst = first.findPane(id: targetId) != nil
            let inSecond = second.findPane(id: targetId) != nil
            
            if inFirst {
                // Target is in the 'first' child (Left or Top)
                
                // If we want to move Right (and axis is horizontal), the neighbor is in 'second'.
                if axis == .horizontal && direction == .right {
                    // Find the "left-most" pane in 'second'
                    return findFirstPane(node: second)
                }
                // If we want to move Down (and axis is vertical), neighbor is in 'second'
                if axis == .vertical && direction == .down {
                    return findFirstPane(node: second)
                }
                
                // Otherwise, the neighbor must be inside 'first' (recurse)
                // OR it's outside this split entirely (return nil, let recursion unwind)
                if let found = findNeighbor(node: first, targetId: targetId, direction: direction) {
                    return found
                }
            } else if inSecond {
                // Target is in 'second' child (Right or Bottom)
                
                // If moving Left (and axis horizontal), neighbor is in 'first'
                if axis == .horizontal && direction == .left {
                    // Find "right-most" pane in 'first'? Or just last used?
                    // Let's pick adjacent edge -> "right-most" pane of 'first'
                    return findLastPane(node: first)
                }
                // If moving Up (and axis vertical), neighbor is in 'first'
                if axis == .vertical && direction == .up {
                    return findLastPane(node: first)
                }
                
                // Recurse inside second
                if let found = findNeighbor(node: second, targetId: targetId, direction: direction) {
                    return found
                }
            }
        }
        
        return nil // Not found in this subtree context
    }
    
    private func findLastPane(node: PaneNode) -> Pane? {
        switch node {
        case .pane(let p): return p
        case .split(_, _, _, let second, _): return findLastPane(node: second)
        }
    }
    // MARK: - Session Restoration
        
    func restore(from state: SavedSessionState) {
        // Clear existing tabs
        // But we must ensure we don't leak resources (terminal sessions)
        // Tab.deinit -> Pane.deinit -> TerminalSession.deinit -> aether_terminal_free
        // So just replacing the array should work.
        
        var newTabs: [Tab] = []
        
        for savedTab in state.tabs {
            if let root = restoreNode(savedTab.root) {
                let tab = Tab(root: root, id: savedTab.id)
                tab.activePaneId = savedTab.activePaneId
                tab.title = savedTab.title
                newTabs.append(tab)
            }
        }
        
        if !newTabs.isEmpty {
            self.tabs = newTabs
            self.activeTabId = state.activeTabId
        } else {
            // Fallback if restoration failed
            if self.tabs.isEmpty {
                addTab()
            }
        }
    }
    
    private func restoreNode(_ node: SavedPaneNode) -> PaneNode? {
        switch node {
        case .pane(let savedPane):
            let session = TerminalSession(cwd: savedPane.cwd)
            // Restore title if possible? 
            // Session title is dynamic based on shell, but we can start with saved title.
            session.title = savedPane.title
            
            // Restore History
            if let history = savedPane.history {
                session.restoreHistory(history)
            }
            
            let pane = Pane(session: session, id: savedPane.id)
             
             return .pane(pane)
             
        case .split(let id, let axis, let first, let second, let loc):
            guard let firstNode = restoreNode(first),
                  let secondNode = restoreNode(second) else {
                return nil
            }
            return .split(id: id, axis: axis, first: firstNode, second: secondNode, splitLocation: loc)
        }
    }
}
