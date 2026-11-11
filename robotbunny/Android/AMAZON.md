# Amazon Fire tablet distribution

Build with `../scripts/build-amazon.sh`. The same application ID, resources, save keys and native shell serve both stores. This does not require Google Play Services or an Amazon SDK. No TV/Vega support is implemented. Do not enable Fire TV devices in the Amazon Console.

Unsigned builds are preparation artifacts, not installable customer releases. The signing environment variables documented in README.md also apply to Release APKs. Use a secured production key, never the debug certificate. The OTG PlayShift Google upload-key reset is unrelated to this Amazon release. Amazon normally re-signs store binaries using its developer-account certificate; this can prevent replacing a Google Play-installed copy without uninstalling. Do not instruct existing users to uninstall without warning that local progress will be lost.

Compatibility must be verified on real Fire hardware. minSdk23 excludes Fire OS5/API22. Android API36 emulator tests and Chromium touch tests are not Amazon WebView tests. JavaScript syntax, AndroidX runtime behavior, WebGL alternate gameplay, audio, lifecycle, Amazon navigation overlays, and storage across a signed update need device validation. Select only verified models in the Console; API-level compatibility alone is insufficient.

Amazon listing assets: PNG icons 114x114 and 512x512, at least three tablet screenshots in accepted dimensions, optional 1024x500 promotional image. Supplied artwork is preserved. Current screenshot drafts are from an Android tablet emulator and must be checked against Fire-device behavior before submission.

Paid draft base price is USD5.00, following the owner's Google Play choice. Confirm actual Amazon-console pricing, payment/tax setup, content rating, audience, privacy/support URLs and required owner legal attestations. The app itself does not collect data; review any Amazon-added wrapper/DRM behavior before certifying the final store privacy label. No DRM SDK was added.

References:
- https://developer.amazon.com/docs/app-submission/understanding-submission.html
- https://developer.amazon.com/docs/app-submission/appstore-details.html
- https://developer.amazon.com/docs/fire-tablets/hybrid-apps-overview.html
