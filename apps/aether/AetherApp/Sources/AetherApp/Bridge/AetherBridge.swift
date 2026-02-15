import Foundation
import AppKit
import CAether

// Global callback functions that Zig will call
private func titleCallback(data: UnsafePointer<UInt8>?, len: Int) {
    guard let data = data else { return }
    let title = String(bytes: UnsafeBufferPointer(start: data, count: len), encoding: .utf8) ?? ""
    DispatchQueue.main.async {
        NSApp.keyWindow?.title = title
    }
}

private func clipboardSetCallback(data: UnsafePointer<UInt8>?, len: Int) {
    guard let data = data else { return }
    let str = String(bytes: UnsafeBufferPointer(start: data, count: len), encoding: .utf8) ?? ""
    DispatchQueue.main.async {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(str, forType: .string)
    }
}

private func clipboardGetCallback() -> UnsafePointer<CChar>? {
    // Note: This is tricky because we need to return a pointer that outlives the call
    // For simplicity, we'll return nil and handle clipboard reads differently
    return nil
}

class AetherBridge {
    private var terminal: OpaquePointer?
    
    static var callbacksRegistered = false
    
    static func registerCallbacks() {
        guard !callbacksRegistered else { return }
        aether_set_title_callback(titleCallback)
        aether_set_clipboard_callback(clipboardSetCallback)
        aether_set_get_clipboard_callback(clipboardGetCallback)
        callbacksRegistered = true
    }

    init(rows: UInt32, cols: UInt32, shell: String? = nil) {
        // Register callbacks before creating terminal
        Self.registerCallbacks()
        
        if let shell = shell {
            terminal = shell.withCString { cShell in
                aether_terminal_with_pty(rows, cols, cShell)
            }
        } else {
            terminal = aether_terminal_with_pty(rows, cols, nil)
        }
    }
    
    init(rows: UInt32, cols: UInt32, withPty: Bool) {
        Self.registerCallbacks()
        
        if withPty {
            terminal = aether_terminal_with_pty(rows, cols, nil)
        } else {
            terminal = aether_terminal_new(rows, cols)
        }
    }

    deinit {
        if let term = terminal {
            aether_terminal_free(term)
        }
    }

    func version() -> String {
        guard let ptr = aether_version() else { return "" }
        return String(cString: ptr)
    }
    
    func writeInput(_ data: Data) {
        guard let term = terminal else { return }
        data.withUnsafeBytes { (ptr: UnsafeRawBufferPointer) in
            if let baseAddress = ptr.baseAddress {
                _ = aether_write_input(term, baseAddress.assumingMemoryBound(to: UInt8.self), ptr.count)
            }
        }
    }
    
    func writeInput(_ string: String) {
        guard let data = string.data(using: .utf8) else { return }
        writeInput(data)
    }
    
    func processOutput() {
        guard let term = terminal else { return }
        aether_process_output(term)
    }
    
    func getCell(row: UInt32, col: UInt32) -> AetherCell? {
        guard let term = terminal else { return nil }
        guard let cellPtr = aether_get_cell(term, row, col) else { return nil }
        return cellPtr.pointee
    }
    
    func resize(rows: UInt32, cols: UInt32) -> Bool {
        guard let term = terminal else { return false }
        return aether_resize(term, rows, cols)
    }
    
    func getCursor() -> AetherCursor {
        guard let term = terminal else {
            return AetherCursor(row: 0, col: 0, visible: false, style: 0)
        }
        return aether_get_cursor(term)
    }
    
    func isDirty() -> Bool {
        guard let term = terminal else { return false }
        return aether_is_dirty(term)
    }
    
    func markClean() {
        guard let term = terminal else { return }
        aether_mark_clean(term)
    }
    
    // Scrolling
    func scrollView(delta: Int32) {
        guard let term = terminal else { return }
        aether_scroll_view(term, delta)
    }
    
    func scrollTo(offset: UInt32) {
        guard let term = terminal else { return }
        aether_scroll_to(term, offset)
    }
    
    func scrollToBottom() {
        guard let term = terminal else { return }
        aether_scroll_to_bottom(term)
    }
    
    func getScrollInfo() -> AetherScrollInfo {
        guard let term = terminal else {
            return AetherScrollInfo(total_rows: 0, visible_rows: 0, scrollback_rows: 0, viewport_offset: 0)
        }
        return aether_get_scroll_info(term)
    }
    
    // Selection
    func selectionStart(row: UInt32, col: UInt32) {
        guard let term = terminal else { return }
        aether_selection_start(term, row, col)
    }
    
    func selectionDrag(row: UInt32, col: UInt32) {
        guard let term = terminal else { return }
        aether_selection_drag(term, row, col)
    }
    
    func selectionEnd(row: UInt32, col: UInt32) {
        guard let term = terminal else { return }
        aether_selection_end(term, row, col)
    }
    
    func selectionClear() {
        guard let term = terminal else { return }
        aether_selection_clear(term)
    }
    
    func selectionIsActive() -> Bool {
        guard let term = terminal else { return false }
        return aether_selection_is_active(term)
    }
    
    func selectionContains(row: UInt32, col: UInt32) -> Bool {
        guard let term = terminal else { return false }
        return aether_selection_contains(term, row, col)
    }
    
    func getSelectionText() -> String? {
        guard let term = terminal else { return nil }
        guard let ptr = aether_get_selection(term) else { return nil }
        let str = String(cString: ptr)
        aether_free_string(ptr)
        return str
    }
}
