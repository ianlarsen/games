import XCTest

final class RobotBunnyInSpaceUITests: XCTestCase {
    func testOfflineGameplayAndBackgroundResume() throws {
        continueAfterFailure = false
        XCUIDevice.shared.orientation = .landscapeLeft
        let app = XCUIApplication()
        app.launch()
        defer { app.terminate() }
        let start = app.buttons["TAP TO START"]
        XCTAssertTrue(start.waitForExistence(timeout: 30), "Bundled artwork must finish loading offline")
        start.tap()
        let pause = app.buttons["Pause"]
        XCTAssertTrue(pause.waitForExistence(timeout: 10))
        let jump = app.buttons["Jump"]
        let laser = app.buttons["Fire laser"]
        XCTAssertTrue(jump.isHittable)
        XCTAssertTrue(laser.isHittable)
        jump.tap()
        laser.press(forDuration: 0.4)
        // Move right with the joystick while the original game is running.
        let joystick = app.otherElements["Move left or right with the joystick. Keyboard: arrow keys or A and D."]
        XCTAssertTrue(joystick.exists)
        joystick.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).press(
            forDuration: 0.1,
            thenDragTo: joystick.coordinate(withNormalizedOffset: CGVector(dx: 0.9, dy: 0.5)),
            withVelocity: .slow,
            thenHoldForDuration: 0.5)
        // Repeated releases after dragging beyond the base exercise UIKit/WebKit capture.
        for _ in 0..<4 {
            joystick.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).press(
                forDuration: 0.05,
                thenDragTo: joystick.coordinate(withNormalizedOffset: CGVector(dx: 1.7, dy: 0.3)),
                withVelocity: .fast,
                thenHoldForDuration: 0.15)
        }
        let gameplay = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        gameplay.name = "Robot Bunny offline gameplay"
        gameplay.lifetime = .keepAlways
        add(gameplay)
        pause.tap()
        let resume = app.buttons["Resume"]
        XCTAssertTrue(resume.waitForExistence(timeout: 5))
        resume.tap()
        XCUIDevice.shared.press(.home)
        app.activate()
        XCTAssertTrue(resume.waitForExistence(timeout: 10), "Returning from background requires explicit Resume")
        resume.tap()
        XCTAssertTrue(pause.isHittable)
        let resumed = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        resumed.name = "Robot Bunny resumed gameplay"
        resumed.lifetime = .keepAlways
        add(resumed)
    }
    func testAlternateEditionOffline() throws {
        continueAfterFailure = false
        XCUIDevice.shared.orientation = .landscapeLeft
        let app = XCUIApplication()
        app.launch()
        defer { app.terminate() }
        XCTAssertTrue(app.buttons["TAP TO START"].waitForExistence(timeout: 30), "Wait for the start screen layout and artwork before tapping its link")
        let alternate = app.links["PLAY PHASER EDITION"]
        XCTAssertTrue(alternate.waitForExistence(timeout: 30))
        alternate.tap()
        let start = app.buttons["Start run"]
        XCTAssertTrue(start.waitForExistence(timeout: 30), "Bundled Phaser and artwork must load offline")
        start.tap()
        let jump = app.buttons["JUMP"]
        XCTAssertTrue(jump.waitForExistence(timeout: 10))
        jump.tap()
        app.buttons["FIRE"].press(forDuration: 0.4)
        app.buttons["Pause"].tap()
        let resume = app.buttons["Resume"].firstMatch
        XCTAssertTrue(resume.waitForExistence(timeout: 5))
        resume.tap()
        let screenshot = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        screenshot.name = "Phaser edition offline gameplay"
        screenshot.lifetime = .keepAlways
        add(screenshot)
    }

}
