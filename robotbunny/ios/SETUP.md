# Robot Bunny iOS project

Open `RobotBunnyInSpace.xcodeproj` and use the shared RobotBunnyInSpace scheme.
The project supports iPhone and iPad in landscape, with a minimum of iOS 16.

The existing App Store Connect record was verified before configuring this project:

- App: Robot Bunny, Apple ID 6761727530
- Bundle ID: `com.primeresolvesolutions.robot-bunny`
- Developer team: `2KK4H3LM67`
- Update: version 1.1, build 3

The supplied T7 source contained Swift wrapper templates and a setup guide, but no
Xcode project. This project builds those sources with UIKit, WebKit, and AVFAudio.
The app adopts UIScene lifecycle, pauses on inactivity, and presents a reload
option if WebKit fails. The original default persistent WebKit store, `www/index.html`
entry point, and original `rb_*` save keys remain in use. No store is cleared.

The original game is the default. The existing Phaser 3.90.0 edition remains an
optional, separately scored mode. Its shop/perk features differ, so it has not
replaced the original game.

A build phase runs `../scripts/prepare-ios-bundle.py` to copy and verify the
runtime files, images, audio, and committed Phaser build. It retains the `www/`
folder structure and excludes development dependencies. Internet access and npm
are not required to build or play the packaged game.

All 18 iPhone, iPad, and App Store icon entries are filled in Assets.xcassets.
The source artwork named app-icon-1024.png is actually 1254 by 1254 pixels; the
catalog includes a correctly resized opaque 1024-pixel marketing icon.
Original artwork is separately backed up before lossless PNG recompression.

The UI test target checks both game editions on iPhone and iPad. Test runs close
the app afterward. Physical-device performance, long sessions, VoiceOver play,
and an upgrade over the released App Store binary require separate verification.

Do not change the app identifier or team to work around signing errors. Future
uploads require a new build number. Keep the existing App Store release policy
unless an intentional release-policy change is authorized.
