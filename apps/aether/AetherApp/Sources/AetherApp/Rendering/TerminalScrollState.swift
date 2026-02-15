import SwiftUI
import Combine

class TerminalScrollState: ObservableObject {
    @Published var totalRows: UInt32 = 0
    @Published var visibleRows: UInt32 = 0
    @Published var scrollbackRows: UInt32 = 0
    @Published var viewportOffset: UInt32 = 0
    
    // Normalized position for scrollbar (0.0 = top of history, 1.0 = bottom)
    // Actually, terminal usually does: 0 offset = bottom. Max offset = top.
    // So 1.0 = bottom (offset 0), 0.0 = top (offset max).
    // Let's expose a helper for the UI.
    
    // Command request from UI to Terminal
    let userScrollRequest = PassthroughSubject<Double, Never>() // t: 0.0 to 1.0
}
