import Foundation
import SwiftUI

// Represents the entire state of a saved session window
struct SavedSessionState: Codable, Identifiable {
    var id: UUID = UUID()
    let timestamp: Date
    let tabs: [SavedTab]
    let activeTabId: UUID?
    
    // For "Restore Last Session", we might just want a single list of tabs.
    // usage: history = [SavedSessionState]
}

struct SavedTab: Codable, Identifiable {
    let id: UUID
    let title: String
    let root: SavedPaneNode
    let activePaneId: UUID?
}

indirect enum SavedPaneNode: Codable {
    case pane(SavedPane)
    case split(id: UUID, axis: Axis, first: SavedPaneNode, second: SavedPaneNode, splitLocation: CGFloat)
}

struct SavedPane: Codable, Identifiable {
    let id: UUID
    let cwd: String
    let title: String
    // We can't save process state easily, but we can save:
    // - Env vars?
    // - Command that was running? (maybe not robust to restore)
}

// Axis needs to be Codable
extension Axis: Codable { }
