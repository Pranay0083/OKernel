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
    // History data
    var history: [SavedRow]?
}

struct SavedRow: Codable {
    let cells: [SavedCell]
    let wrapped: Bool
}

struct SavedCell: Codable {
    let cp: UInt32
    let fg: UInt32
    let bg: UInt32
    let f: UInt16
}

// Axis needs to be Codable
extension Axis: @retroactive Codable { }
