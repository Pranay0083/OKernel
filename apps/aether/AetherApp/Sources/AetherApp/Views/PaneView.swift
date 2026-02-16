
import SwiftUI

struct PaneView: View {
    let node: PaneNode
    @ObservedObject var tabManager: TabManager // To handle selection/active pane
    let config: AetherConfig
    let onAction: (String, TerminalSession) -> Bool
    
    var body: some View {
        ManagedSplitView(node: node, tabManager: tabManager, config: config, onAction: onAction)
    }
}

// Separate struct to handle the split logic more cleanly
struct ManagedSplitView: View {
    let node: PaneNode
    @ObservedObject var tabManager: TabManager
    let config: AetherConfig
    let onAction: (String, TerminalSession) -> Bool
    
    var body: some View {
        switch node {
        case .pane(let pane):
            TerminalViewRepresentable(
                session: pane.session,
                config: config,
                isActive: tabManager.activeTab?.activePaneId == pane.id,
                onAction: { action in
                    onAction(action, pane.session)
                },
                onSelect: {
                    tabManager.setActivePane(paneId: pane.id)
                }
            )
            .id(pane.id) 
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            // Visual indicator for active/inactive
            .opacity(tabManager.activeTab?.activePaneId == pane.id ? 1.0 : 0.6)
            .animation(.easeInOut(duration: 0.1), value: tabManager.activeTab?.activePaneId)
            
        case .split(_, let axis, let first, let second, _):
            if axis == .horizontal {
                HSplitView {
                    ManagedSplitView(node: first, tabManager: tabManager, config: config, onAction: onAction)
                        .layoutPriority(1)
                    
                    ManagedSplitView(node: second, tabManager: tabManager, config: config, onAction: onAction)
                        .layoutPriority(1)
                }
            } else {
                VSplitView {
                    ManagedSplitView(node: first, tabManager: tabManager, config: config, onAction: onAction)
                        .layoutPriority(1)
                    
                    ManagedSplitView(node: second, tabManager: tabManager, config: config, onAction: onAction)
                        .layoutPriority(1)
                }
            }
        }
    }
}

extension View {
    func splitViewDividerStyle() -> some View {
        self
    }
}
