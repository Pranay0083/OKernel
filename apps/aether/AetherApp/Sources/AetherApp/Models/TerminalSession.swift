import Foundation
import CAether
import Combine

class TerminalSession: Identifiable, ObservableObject {
    let id: UUID
    @Published var title: String
    
    private(set) var terminal: OpaquePointer?
    let scrollState: TerminalScrollState
    
    init() {
        self.id = UUID()
        self.title = "Terminal"
        self.scrollState = TerminalScrollState()
        
        // Initialize backend terminal
        self.terminal = aether_terminal_with_pty(24, 80, nil)
        
        startPolling()
    }
    
    deinit {
        stopPolling()
        if let term = terminal {
            aether_terminal_free(term)
        }
    }
    
    func resize(cols: Int, rows: Int) {
        guard let term = terminal else { return }
        _ = aether_resize(term, UInt32(rows), UInt32(cols))
    }

    
    // Polling for title
    private var timer: Timer?
    
    func startPolling() {
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            self?.updateTitle()
        }
    }
    
    func stopPolling() {
        timer?.invalidate()
        timer = nil
    }
    
    private func updateTitle() {
        guard let term = terminal else { return }
        let pid = aether_get_pid(term)
        if pid <= 0 { return }
        
        // 1. Get TTY Name
        var ttyBuf = [Int8](repeating: 0, count: 64)
        _ = aether_get_tty(term, &ttyBuf, 64)
        let ttyName = String(cString: ttyBuf)
        
        // 2. Get CWD (of shell)
        var cwdBuf = [Int8](repeating: 0, count: 1024)
        _ = aether_get_cwd(pid, &cwdBuf, 1024)
        let cwdPath = String(cString: cwdBuf)
        // let cwdName = URL(fileURLWithPath: cwdPath).lastPathComponent
        
        // 3. Find Foreground Process
        // Clean tty name for ps (e.g. /dev/ttys003 -> ttys003)
        let cleanTty = ttyName.replacingOccurrences(of: "/dev/", with: "")
        
        if !cleanTty.isEmpty {
            DispatchQueue.global(qos: .background).async { [weak self] in
                guard let self = self else { return }
                
                // Fetch config
                let style = ConfigManager.shared.config.ui.tabs.titleStyle
                
                // Format CWD
                let home = FileManager.default.homeDirectoryForCurrentUser.path
                let displayPath = cwdPath.replacingOccurrences(of: home, with: "~")
                
                var newTitle = "Terminal"
                
                switch style {
                case .path:
                    newTitle = displayPath
                case .process:
                    if let proc = self.getForegroundProcess(tty: cleanTty) {
                        newTitle = proc
                    } else {
                        newTitle = "Terminal"
                    }
                case .smart:
                    // Smart: Show process if running (not shell), else show path
                    let proc = self.getForegroundProcess(tty: cleanTty)
                    if let name = proc, !name.contains("login"), !name.contains("-zsh"), !name.contains("zsh") {
                         newTitle = name
                    } else {
                         newTitle = displayPath
                    }
                }
                
                DispatchQueue.main.async {
                    self.title = newTitle
                }
            }
        }
    }
    
    private func getForegroundProcess(tty: String) -> String? {
        // Run ps -t <tty> -o state,comm
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/bin/ps")
        process.arguments = ["-t", tty, "-o", "state,comm"]
        
        let pipe = Pipe()
        process.standardOutput = pipe
        
        do {
            try process.run()
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            if let output = String(data: data, encoding: .utf8) {
                let lines = output.components(separatedBy: .newlines)
                // Skip header. Look for '+' in state column.
                // Output format:
                // STATE COMM
                // S+    /bin/zsh
                // R+    vim
                
                for line in lines.dropFirst() {
                    let trim = line.trimmingCharacters(in: .whitespaces)
                    if trim.isEmpty { continue }
                    
                    if trim.starts(with: "R+") || trim.contains("+") {
                        // Extract command
                        // Split by space? 'S+ /bin/zsh' -> ['S+', '/bin/zsh']
                        // But command can have spaces? `ps -o comm` usually gives command name/path.
                        // `state` is single word.
                        
                        // Simple parse: find first space
                        if let range = trim.range(of: " ") {
                            let state = trim[..<range.lowerBound]
                            if state.contains("+") {
                                let comm = trim[range.upperBound...].trimmingCharacters(in: .whitespaces)
                                return URL(fileURLWithPath: comm).lastPathComponent
                            }
                        }
                    }
                }
            }
        } catch {
            print("Failed to run ps: \(error)")
        }
        return nil
    }
}
