import UIKit
import WebKit
import AVFAudio

final class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {
    private var webView: WKWebView!
    private var recoveryView: UIView?
    private var resourceRoot: URL? { Bundle.main.resourceURL?.appendingPathComponent("www", isDirectory: true) }

    override var prefersStatusBarHidden: Bool { true }
    override var prefersHomeIndicatorAutoHidden: Bool { true }
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask { .landscape }
    override var preferredInterfaceOrientationForPresentation: UIInterfaceOrientation { .landscapeLeft }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        // Ambient audio respects the silent switch and other apps' audio.
        try? AVAudioSession.sharedInstance().setCategory(.ambient, mode: .default, options: [.mixWithOthers])
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        // Keep the same default persistent store and www/index.html location.
        config.websiteDataStore = .default()
        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = .black
        webView.scrollView.backgroundColor = .black
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.showsVerticalScrollIndicator = false
        webView.scrollView.showsHorizontalScrollIndicator = false
        view.addSubview(webView)
        webView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])
        let center = NotificationCenter.default
        center.addObserver(self, selector: #selector(audioInterrupted(_:)), name: AVAudioSession.interruptionNotification, object: nil)
        loadGame()
    }

    deinit { NotificationCenter.default.removeObserver(self) }

    @objc func pauseGame() {
        webView.evaluateJavaScript("window.dispatchEvent(new Event('rb:background'))", completionHandler: nil)
        webView.setAllMediaPlaybackSuspended(true, completionHandler: nil)
    }

    @objc func activateMedia() {
        // The game keeps its Resume panel; returning to the app never starts a run.
        webView.setAllMediaPlaybackSuspended(false, completionHandler: nil)
    }

    @objc private func audioInterrupted(_ notification: Notification) {
        if let value = notification.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt,
           value == AVAudioSession.InterruptionType.began.rawValue { pauseGame() }
        else { activateMedia() }
    }

    @objc private func loadGame() {
        recoveryView?.removeFromSuperview()
        recoveryView = nil
        guard let root = resourceRoot,
              FileManager.default.fileExists(atPath: root.appendingPathComponent("index.html").path) else {
            showRecovery("Game resources are missing. Please reinstall the app from the App Store.", retry: false)
            return
        }
        webView.loadFileURL(root.appendingPathComponent("index.html"), allowingReadAccessTo: root)
    }

    private func showRecovery(_ message: String, retry: Bool = true) {
        guard recoveryView == nil else { return }
        let panel = UIStackView()
        panel.axis = .vertical
        panel.spacing = 20
        panel.alignment = .center
        panel.backgroundColor = .black
        panel.isLayoutMarginsRelativeArrangement = true
        panel.directionalLayoutMargins = NSDirectionalEdgeInsets(top: 24, leading: 24, bottom: 24, trailing: 24)
        let label = UILabel()
        label.text = message
        label.textColor = .white
        label.numberOfLines = 0
        label.textAlignment = .center
        label.font = .preferredFont(forTextStyle: .body)
        label.adjustsFontForContentSizeCategory = true
        panel.addArrangedSubview(label)
        if retry {
            let button = UIButton(type: .system)
            button.configuration = .filled()
            button.setTitle("Reload game", for: .normal)
            button.titleLabel?.font = .preferredFont(forTextStyle: .headline)
            button.titleLabel?.adjustsFontForContentSizeCategory = true
            button.heightAnchor.constraint(greaterThanOrEqualToConstant: 44).isActive = true
            button.addTarget(self, action: #selector(loadGame), for: .touchUpInside)
            panel.addArrangedSubview(button)
        }
        view.addSubview(panel)
        panel.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            panel.centerXAnchor.constraint(equalTo: view.safeAreaLayoutGuide.centerXAnchor),
            panel.centerYAnchor.constraint(equalTo: view.safeAreaLayoutGuide.centerYAnchor),
            panel.widthAnchor.constraint(lessThanOrEqualTo: view.safeAreaLayoutGuide.widthAnchor, constant: -24)
        ])
        recoveryView = panel
        UIAccessibility.post(notification: .screenChanged, argument: label)
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        showRecovery("The game was interrupted. Reload to start a new run. Completed-run progress is retained.")
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        if (error as NSError).code != NSURLErrorCancelled { showRecovery("The game could not load. Try reloading.") }
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        if (error as NSError).code != NSURLErrorCancelled { showRecovery("The game could not load. Try reloading.") }
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
        if url.absoluteString == "about:blank" { decisionHandler(.allow); return }
        if url.isFileURL, let root = resourceRoot,
           url.standardizedFileURL.path.hasPrefix(root.standardizedFileURL.path + "/") {
            decisionHandler(.allow)
        } else { decisionHandler(.cancel) }
    }

    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = UIAlertController(title: "Robot Bunny", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler() })
        if presentedViewController == nil { present(alert, animated: true) }
        else { completionHandler() }
    }
}
