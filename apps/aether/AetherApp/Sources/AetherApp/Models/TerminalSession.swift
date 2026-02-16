import Foundation
import CAether
import Combine

class TerminalSession: Identifiable, ObservableObject {
    let id: UUID
    @Published var title: String
    @Published var windowTitle: String = "Aether"
    
    private(set) var terminal: OpaquePointer?
    let scrollState: TerminalScrollState
    
    init() {
        self.id = UUID()
        self.title = "Terminal"
        self.windowTitle = "Aether"
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
        
        // 1. Get TTY & CWD
        var ttyBuf = [Int8](repeating: 0, count: 64)
        _ = aether_get_tty(term, &ttyBuf, 64)
        let ttyName = String(cString: ttyBuf)
        
        var cwdBuf = [Int8](repeating: 0, count: 1024)
        _ = aether_get_cwd(pid, &cwdBuf, 1024)
        let cwdPath = String(cString: cwdBuf)
        
        // Window Title Logic (User@Host:PWD)
        let user = NSUserName()
        let host = ProcessInfo.processInfo.hostName
        let home = FileManager.default.homeDirectoryForCurrentUser.path
        let displayPath = cwdPath.replacingOccurrences(of: home, with: "~")
        let longTitle = "\(user)@\(host):\(displayPath)"
                // Tab Title Logic (Process Name)
        let cleanTty = ttyName.replacingOccurrences(of: "/dev/", with: "")
        
         if !cleanTty.isEmpty {
            DispatchQueue.global(qos: .background).async { [weak self] in
                guard let self = self else { return }
                
                // Tab Title Logic
                // User wants "only the last folder name" for path-based titles.
                let cwdUrl = URL(fileURLWithPath: cwdPath)
                let folderName = cwdPath == "/" ? "/" : cwdUrl.lastPathComponent
                
                // Get Process Name
                var shortTitle = "Terminal"
                if let proc = self.getForegroundProcess(tty: cleanTty) {
                     shortTitle = proc
                }
                
                let style = ConfigManager.shared.config.ui.tabs.titleStyle
                var tabTitle = shortTitle
                
                if style == .path {
                    tabTitle = folderName // Was displayPath
                } else if style == .smart {
                     if let name = self.getForegroundProcess(tty: cleanTty), !name.contains("login"), !name.contains("-zsh"), !name.contains("zsh") {
                         tabTitle = name
                     } else {
                         // Fallback to Folder Name
                         tabTitle = folderName
                     }
                } else {
                    // .process
                    tabTitle = shortTitle
                }
                
                DispatchQueue.main.async {
                    self.title = tabTitle
                    self.windowTitle = longTitle
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
