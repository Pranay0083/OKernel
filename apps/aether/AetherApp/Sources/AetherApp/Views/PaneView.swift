
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
            TerminalPaneView(
                session: pane.session,
                paneId: pane.id,
                tabManager: tabManager,
                config: config,
                onAction: onAction
            )
            
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

struct TerminalPaneView: View {
    @ObservedObject var session: TerminalSession
    let paneId: UUID
    @ObservedObject var tabManager: TabManager
    let config: AetherConfig
    let onAction: (String, TerminalSession) -> Bool

    var body: some View {
        ZStack {
            TerminalViewRepresentable(
                session: session,
                config: config,
                isActive: tabManager.activeTab?.activePaneId == paneId,
                onAction: { action in
                    onAction(action, session)
                },
                onSelect: {
                    tabManager.setActivePane(paneId: paneId)
                }
            )
            .id(paneId)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            // Visual indicator for active/inactive
            .opacity(tabManager.activeTab?.activePaneId == paneId ? 1.0 : 0.6)
            .animation(.easeInOut(duration: 0.1), value: tabManager.activeTab?.activePaneId)

            if session.isLoading {
                CircleLoader()
                    .transition(.opacity)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color.black.opacity(0.2))
                    .zIndex(1)
            }
        }
        .animation(.easeInOut(duration: 0.2), value: session.isLoading)
    }
}

struct CircleLoader: View {
    @State private var isAnimating = false
    
    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.white.opacity(0.1), lineWidth: 4)
                .frame(width: 40, height: 40)
            
            Circle()
                .trim(from: 0, to: 0.7)
                .stroke(
                    LinearGradient(
                        gradient: Gradient(colors: [Color.white, Color.white.opacity(0.3)]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    style: StrokeStyle(lineWidth: 4, lineCap: .round)
                )
                .frame(width: 40, height: 40)
                .rotationEffect(Angle(degrees: isAnimating ? 360 : 0))
                .onAppear {
                    withAnimation(Animation.linear(duration: 0.8).repeatForever(autoreverses: false)) {
                        isAnimating = true
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
