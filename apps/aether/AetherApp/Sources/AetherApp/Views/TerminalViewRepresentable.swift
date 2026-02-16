
import SwiftUI
import MetalKit

struct TerminalViewRepresentable: NSViewRepresentable {
    var session: TerminalSession
    var config: AetherConfig
    var isActive: Bool // New property to track focus state
    var onAction: (String) -> Bool
    var onSelect: (() -> Void)?

    func makeNSView(context: Context) -> TerminalView {
        let view = TerminalView(
            frame: .zero,
            device: MTLCreateSystemDefaultDevice(),
            session: session
        )
        view.autoresizingMask = [.width, .height]
        view.updateConfig(config)
        view.onAction = onAction
        view.onSelect = onSelect
        return view
    }
    
    func updateNSView(_ nsView: TerminalView, context: Context) {
        nsView.terminalSession = session 
        nsView.updateConfig(config)
        nsView.isActive = isActive // Update view state
        nsView.onAction = onAction
        nsView.onSelect = onSelect
        
        // Ensure we request a redraw if the frame is valid but maybe empty content
        if nsView.frame.width > 0 && nsView.frame.height > 0 {
            nsView.setNeedsDisplay(nsView.bounds)
        }
    }
    
    func sizeThatFits(_ proposal: ProposedViewSize, nsView: TerminalView, context: Context) -> CGSize {
        let width = proposal.width ?? 800
        let height = proposal.height ?? 600
        return CGSize(width: width, height: height)
    }
}
