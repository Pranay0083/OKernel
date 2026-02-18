import SwiftUI

struct SessionRestoreView: View {
    @Binding var isPresented: Bool
    var onRestore: () -> Void
    var onFresh: () -> Void
    
    @State private var dontAskAgain: Bool = false
    
    var body: some View {
        ZStack {
            // Minimal dimming
            Color.black.opacity(0.2)
                .ignoresSafeArea()
            
            VStack(spacing: 24) {
                VStack(spacing: 8) {
                    Text("Restore Session")
                        .font(.headline)
                        .fontWeight(.semibold)
                    
                    Text("Would you like to restore your previous tabs and windows?")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                
                VStack(spacing: 12) {
                    Button(action: {
                        handleChoice(restore: true)
                    }) {
                        Text("Restore")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 6)
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.large)
                    
                    Button(action: {
                        handleChoice(restore: false)
                    }) {
                        Text("Start Fresh")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 6)
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.large)
                }
                .padding(.horizontal)
                
                Toggle("Don't ask again", isOn: $dontAskAgain)
                    .toggleStyle(.checkbox)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(24)
            .frame(width: 320)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(nsColor: .windowBackgroundColor))
                    .shadow(color: .black.opacity(0.2), radius: 10, x: 0, y: 5)
            )
            .complexModifier() // Just a placeholder comment to ensure swift syntax is valid
        }
    }
    
    private func handleChoice(restore: Bool) {
        if dontAskAgain {
            // Update config
            var newConfig = ConfigManager.shared.config
            newConfig.session.restoreStrategy = restore ? .always : .never
            ConfigManager.shared.config = newConfig
            ConfigManager.shared.saveConfig()
        }
        
        if restore {
            onRestore()
        } else {
            onFresh()
        }
        
        withAnimation(.easeOut(duration: 0.2)) {
            isPresented = false
        }
    }
}

extension View {
    // Helper to ensure we don't hold invalid modifiers
    func complexModifier() -> some View {
        self
    }
}
