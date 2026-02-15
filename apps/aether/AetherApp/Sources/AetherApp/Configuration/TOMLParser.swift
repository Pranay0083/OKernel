import Foundation

class SimpleTOMLParser {
    static func parse(toml: String) -> [String: Any] {
        var root: [String: Any] = [:]
        var currentSection: String = ""
        
        // Helper to set nested value
        func setValue(_ key: String, _ value: Any) {
            let keys = key.split(separator: ".").map { String($0) }
            guard !keys.isEmpty else { return }
            
            var currentDict = root
            var pathStack: [String] = []
            
            // Navigate to parent
            for i in 0..<(keys.count - 1) {
                let k = keys[i]
                pathStack.append(k)
                
                if let existing = currentDict[k] as? [String: Any] {
                    currentDict = existing
                } else {
                    // Create new dict
                    currentDict[k] = [String: Any]()
                    // We need to update the root text... this logic is flawed for deep nesting if specific nodes are values.
                    // Better approach:
                    // We can't easily modify 'root' by traversing 'currentDict' copy.
                    // We need to re-traverse from root to set.
                }
            }
        }
        
        // Robust nested setter
        func setNested(path: [String], value: Any, in dict: inout [String: Any]) {
            if path.isEmpty { return }
            let key = path[0]
            
            if path.count == 1 {
                dict[key] = value
            } else {
                var subDict = (dict[key] as? [String: Any]) ?? [String: Any]()
                setNested(path: Array(path.dropFirst()), value: value, in: &subDict)
                dict[key] = subDict
            }
        }
        
        let lines = toml.components(separatedBy: .newlines)
        
        for line in lines {
            let trimmed = line.trimmingCharacters(in: .whitespaces)
            if trimmed.isEmpty || trimmed.hasPrefix("#") { continue }
            
            if trimmed.hasPrefix("[") && trimmed.hasSuffix("]") {
                // Section
                let content = trimmed.dropFirst().dropLast()
                currentSection = String(content)
            } else if let range = trimmed.range(of: "=") {
                // Key = Value
                let keyPart = String(trimmed[..<range.lowerBound]).trimmingCharacters(in: .whitespaces)
                let valuePart = String(trimmed[range.upperBound...]).trimmingCharacters(in: .whitespaces)
                
                let key = currentSection.isEmpty ? keyPart : "\(currentSection).\(keyPart)"
                let value = parseValue(valuePart)
                
                let path = key.split(separator: ".").map { String($0) }
                setNested(path: path, value: value, in: &root)
            }
        }
        
        return root
    }
    
    private static func parseValue(_ raw: String) -> Any {
        // String
        if raw.hasPrefix("\"") && raw.hasSuffix("\"") {
            return String(raw.dropFirst().dropLast())
        }
        // Boolean
        if raw == "true" { return true }
        if raw == "false" { return false }
        
        // Number
        if let intVal = Int(raw) { return intVal }
        if let doubleVal = Double(raw) { return doubleVal }
        
        // Array (simplified, single line)
        if raw.hasPrefix("[") && raw.hasSuffix("]") {
            // Not supporting arrays deeply yet for this simple config
            return [] 
        }
        
        // Fallback (maybe unquoted string?)
        return raw
    }
}
