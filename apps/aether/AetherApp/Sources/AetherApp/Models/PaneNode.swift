
import Foundation
import SwiftUI

// Represents a single pane containing a terminal session
class Pane: Identifiable, ObservableObject {
    let id: UUID
    @Published var session: TerminalSession
    
    init(session: TerminalSession) {
        self.id = UUID()
        self.session = session
    }
}

// Represents the layout tree: either a single pane or a split container
indirect enum PaneNode: Identifiable {
    var id: UUID {
        switch self {
        case .pane(let pane): return pane.id
        case .split(let id, _, _, _, _): return id
        }
    }
    
    case pane(Pane)
    case split(id: UUID, axis: Axis, first: PaneNode, second: PaneNode, splitLocation: CGFloat)
    
    // Helper to find a pane by ID
    func findPane(id: UUID) -> Pane? {
        switch self {
        case .pane(let pane):
            return pane.id == id ? pane : nil
        case .split(_, _, let first, let second, _):
            return first.findPane(id: id) ?? second.findPane(id: id)
        }
    }
    
    // Helper to replace a node (for splitting or closing)
    // Returns the new node, or nil if the node should be removed (e.g. closing the last pane in a split)
    func replace(id: UUID, with newNode: PaneNode) -> PaneNode {
        if self.id == id {
            return newNode
        }
        
        switch self {
        case .pane:
            return self
        case .split(let splitId, let axis, let first, let second, let loc):
            let newFirst = first.replace(id: id, with: newNode)
            let newSecond = second.replace(id: id, with: newNode)
            return .split(id: splitId, axis: axis, first: newFirst, second: newSecond, splitLocation: loc)
        }
    }
    
    // Remove a pane by ID. Returns nil if the resulting node is empty/invalid (should be handled by parent).
    // If a split loses one child, it should collapse to the other child.
    func remove(id: UUID) -> PaneNode? {
        switch self {
        case .pane(let pane):
            return pane.id == id ? nil : self
            
        case .split(let splitId, let axis, let first, let second, let loc):
            let newFirst = first.remove(id: id)
            let newSecond = second.remove(id: id)
            
            if let newFirst = newFirst, let newSecond = newSecond {
                // Both children still exist
                return .split(id: splitId, axis: axis, first: newFirst, second: newSecond, splitLocation: loc)
            } else if let newFirst = newFirst {
                // Second child removed, collapse to first
                return newFirst
            } else if let newSecond = newSecond {
                // First child removed, collapse to second
                return newSecond
            } else {
                // Both removed
                return nil
            }
        }
    }
    
    // List all panes in traversal order (useful for finding neighbors)
    func flatPanes() -> [Pane] {
        switch self {
        case .pane(let p): return [p]
        case .split(_, _, let first, let second, _):
            return first.flatPanes() + second.flatPanes()
        }
    }
}
