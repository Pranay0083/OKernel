import XCTest
@testable import AetherApp

final class TabManagerTests: XCTestCase {
    func testAddTab() {
        let manager = TabManager()
        XCTAssertEqual(manager.tabs.count, 1) // Initial tab
        
        manager.addTab()
        XCTAssertEqual(manager.tabs.count, 2)
        XCTAssertEqual(manager.activeTabId, manager.tabs.last?.id)
    }
    
    func testCloseTab() {
        let manager = TabManager()
        manager.addTab()
        let tabToClose = manager.tabs[0]
        
        manager.closeTab(id: tabToClose.id)
        XCTAssertEqual(manager.tabs.count, 1)
        XCTAssertNotEqual(manager.tabs[0].id, tabToClose.id)
    }
    
    func testCloseOnlyTab() {
        let manager = TabManager()
        let tabId = manager.tabs[0].id
        
        manager.closeTab(id: tabId)
        XCTAssertEqual(manager.tabs.count, 1) // Should create a new one
        XCTAssertNotEqual(manager.tabs[0].id, tabId)
    }
    
    func testActivateTab() {
        let manager = TabManager()
        manager.addTab()
        let firstTabId = manager.tabs[0].id
        let secondTabId = manager.tabs[1].id
        
        manager.activateTab(id: firstTabId)
        XCTAssertEqual(manager.activeTabId, firstTabId)
        
        manager.activateTab(id: secondTabId)
        XCTAssertEqual(manager.activeTabId, secondTabId)
    }
}
