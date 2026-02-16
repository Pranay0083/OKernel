import SwiftUI

struct TabBarView: View {
    @ObservedObject var tabManager: TabManager
    var onNewTab: () -> Void
    var onCloseTab: (UUID) -> Void
    
    var body: some View {
        HStack(spacing: 0) {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 1) {
                    ForEach(tabManager.tabs) { tab in
                        TabItemView(
                            session: tab,
                            isActive: tabManager.activeTabId == tab.id,
                            onClose: { onCloseTab(tab.id) }
                        )
                        .onTapGesture {
                            tabManager.activateTab(id: tab.id)
                        }
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            // New Tab Button
            Button(action: onNewTab) {
                Image(systemName: "plus")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.secondary)
                    .frame(width: 28, height: 28)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .padding(.trailing, 5) // Margin from right edge
        }
        .frame(height: 28) // Matches header height
        .background(Color.black.opacity(0.1))
    }
}

struct TabItemView: View {
    @ObservedObject var session: TerminalSession
    var isActive: Bool
    @ObservedObject var configManager = ConfigManager.shared
    var onClose: () -> Void
    @State private var isHovering = false
    
    var body: some View {
        HStack(spacing: 6) {
            Text(session.title)
                .font(.system(size: 11, weight: .medium, design: .monospaced))
                .foregroundColor(isActive ? .primary : .secondary)
                .lineLimit(1)
            
            if isHovering || isActive {
                Button(action: onClose) {
                    Image(systemName: "xmark")
                        .font(.system(size: 8, weight: .bold))
                        .foregroundColor(.secondary)
                        .frame(width: 14, height: 14)
                        .background(Color.white.opacity(0.1))
                        .clipShape(Circle())
                }
                .buttonStyle(.plain)
            } else {
                 // Spacing placeholder
                 Color.clear.frame(width: 14, height: 14)
            }
        }
        .padding(.horizontal, configManager.config.ui.tabs.horizontalPadding)
        .frame(height: 28 - (configManager.config.ui.tabs.verticalPadding * 2)) 
        .background(
            RoundedRectangle(cornerRadius: configManager.config.ui.tabs.cornerRadius)
                .fill(isActive ? Color.white.opacity(0.1) : Color.clear)
        )
        .onHover { hover in isHovering = hover }
    }
}
