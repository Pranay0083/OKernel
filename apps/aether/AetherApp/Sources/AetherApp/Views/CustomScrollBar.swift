import SwiftUI

struct CustomScrollBar: View {
    @ObservedObject var scrollState: TerminalScrollState
    var onScroll: (Double) -> Void // 0.0 to 1.0
    
    var body: some View {
        GeometryReader { geo in
            let height = geo.size.height
            // Calculate handle height
            // Proportion: visible / total
            let total = max(1, Double(scrollState.totalRows))
            let visible = Double(scrollState.visibleRows)
            let proportion = max(0.1, min(1.0, visible / total))
            let handleHeight = max(20, height * proportion)
            
            // Calculate handle position
            // offset 0 = bottom. offset max = top.
            // UI: top (y=0) is top of history. bottom (y=height) is row 0.
            
            // Normalized offset (0..1) where 0 is bottom (latest), 1 is top (oldest).
            // scrollState.viewportOffset / scrollState.scrollbackRows
            
            // But usually scrollbar: top (0) is oldest, bottom (1) is newest.
            // Terminal offset: 0 is newest.
            
            // So:
            // max_scroll = scrollbackRows
            // current_scroll = viewportOffset
            // fraction_from_bottom = current_scroll / max_scroll (if max > 0)
            
            // Position of handle center or top?
            // Let's use handle top.
            // Track height = height
            // Scrollable area = height - handleHeight
            
            // detailed calculation:
            // normalized_pos (0=top/oldest, 1=bottom/newest)
            // If offset = max (oldest), pos = 0
            // If offset = 0 (newest), pos = 1
            
            let maxScroll = Double(scrollState.scrollbackRows)
            let currentOffset = Double(scrollState.viewportOffset)
            
            // Inverted logic:
            // 0 offset -> Bottom (1.0)
            // Max offset -> Top (0.0)
            
            let t = maxScroll > 0 ? 1.0 - (currentOffset / maxScroll) : 1.0
            
            let width = geo.size.width
            
            // y position range: 0 to (height - handleHeight)
            let yPos = t * (height - handleHeight)
            
            ZStack(alignment: .top) {
                // Track
                Rectangle()
                    .fill(Color.white.opacity(0.1))
                    .frame(width: max(2, width * 0.5)) // 50% width
                
                // Handle
                RoundedRectangle(cornerRadius: 3)
                    .fill(Color.white.opacity(0.3))
                    .frame(width: max(4, width * 0.5), height: handleHeight)
                    .offset(y: yPos)
                    .gesture(
                        DragGesture(minimumDistance: 0)
                            .onChanged { value in
                                // Calculate new t based on drag location
                                let dragY = value.location.y
                                let usableHeight = height - handleHeight
                                let newT = max(0, min(1, dragY / usableHeight))
                                
                                // Map t back to onScroll (0.0=top, 1.0=bottom)
                                onScroll(newT)
                            }
                    )
            }
            .frame(width: width) // Fill provided width
            .contentShape(Rectangle())
        }
        // No fixed frame here, parent controls it
    }
}
