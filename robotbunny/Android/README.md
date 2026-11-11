# Robot Bunny for Android

The Android app packages the same offline runtime files used by the iOS target. The web source in the parent folder is the single source for both platforms. The Android shell adds immersive landscape display, safe touch/HUD insets without shrinking the background, native Back-to-pause and exit confirmation, app-background suspension, saved WebView storage, and visible reload recovery.

Package: `com.primeresolvesolutions.robotbunny` (available in the verified Play account; first-app registration still pending). Version: `1.2`, version code `1`. Android version codes are independent of iOS build numbers. Minimum Android API 23; compile/target API 36. No app Internet permission, external runtime dependencies, ads, billing or analytics. Android cloud backup is disabled. Local progress is independent of the iOS install and is deleted if Android app storage is cleared or the app is uninstalled.

## Build

Use `../scripts/build-android.sh` from any working directory, or `./gradlew :app:assembleDebug :app:bundleRelease :app:lintRelease` from this directory with Java 17, Android SDK 36, and Gradle 8.13 available. `local.properties` is machine-local and excluded from exports. The wrapper distribution has a pinned SHA-256. The shared resource copy is deterministic and excludes AppleDouble files.

Without signing environment variables the Release AAB is intentionally unsigned. Supply `ROBOT_BUNNY_KEYSTORE`, `ROBOT_BUNNY_KEY_ALIAS`, `ROBOT_BUNNY_STORE_PASSWORD`, and `ROBOT_BUNNY_KEY_PASSWORD` through a secure local process when the owner chooses the upload key. Do not save passwords in source, command history or chat. No production upload key was generated or changed by this preparation.

## Verification

The included Android instrumentation tests cover offline original/alternate gameplay, ten real multitouch joystick releases while Fire is held, uniform full-screen canvas bounds, native Back-to-pause, background/foreground requiring Resume, storage after activity recreation, local navigation restrictions and main-frame error recovery.

Run `./gradlew :app:connectedDebugAndroidTest` against an Android emulator or device. The `qa` build type copies Release R8/resource-shrinking settings but uses a debug certificate and `.qa` package suffix for local verification. It must never be uploaded to Play. Build it with `-ProbotBunnyTestBuildType=qa :app:assembleQa :app:assembleQaAndroidTest`. The actual Play artifact is `app/build/outputs/bundle/release/app-release.aab`.

A continuously rendering game does not become idle, so tests dispatch to the main thread directly instead of using ActivityScenario.onActivity after gameplay begins. The emulator's first-use immersive-mode tutorial must be dismissed before touch tests. ADB 37 on this Mac repeatedly aborted in its host USB stack; an isolated official Google ADB 35.0.2 server was used for completed tests, without replacing the SDK. The delivered readiness report records final results and limitations.

## Google Play preparation

The output folder contains an unsigned AAB, installable debug APK, launcher/Play icons, feature graphic, real phone/tablet screenshots, listing/release-note text, Data safety draft and privacy-policy draft. The Play app-creation form is prepared but legal attestations and pricing remain with the account owner. A public privacy-policy URL, support contact, target-audience selection and content-rating questionnaire must be completed before submission. OTG PlayShift's pending upload-key reset applies to OTG's app record; this new Robot Bunny package has its own Play App Signing/upload-key configuration.

Physical devices, older Android versions, audible output/real interruptions, Bluetooth routing, human accessibility use and long-session thermal/battery performance remain unverified. Do not equate emulator tests with production approval.
