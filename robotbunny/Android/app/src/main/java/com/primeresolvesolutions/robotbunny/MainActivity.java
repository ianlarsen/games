package com.primeresolvesolutions.robotbunny;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.activity.ComponentActivity;
import androidx.activity.OnBackPressedCallback;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.webkit.WebResourceErrorCompat;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;
import java.io.ByteArrayInputStream;
import java.util.Collections;

/** Offline Android shell; game files and save keys are shared with the iOS source. */
public final class MainActivity extends ComponentActivity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String ROOT = "/assets/www/";
    static final String HOME = "https://" + HOST + ROOT + "index.html";
    private FrameLayout container;
    private WebView webView;
    private View errorView;
    private Insets safeInsets = Insets.NONE;
    private boolean inactive = true;

    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        container = new FrameLayout(this);
        container.setBackgroundColor(Color.BLACK);
        setContentView(container);
        ViewCompat.setOnApplyWindowInsetsListener(container, (view, insets) -> {
            Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets gestures = insets.getInsets(WindowInsetsCompat.Type.systemGestures());
            safeInsets = Insets.of(bars.left, bars.top, bars.right, Math.max(bars.bottom, gestures.bottom));
            applySafeInsets();
            // Background stays edge to edge; only HUD and controls consume safe insets.
            return insets;
        });
        createWebView(state);
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override public void handleOnBackPressed() { handleBack(); }
        });
        immersive();
    }

    private void immersive() {
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        controller.hide(WindowInsetsCompat.Type.systemBars());
    }

    private void applySafeInsets() {
        if (webView == null) return;
        float density = getResources().getDisplayMetrics().density;
        String script = "(()=>{if(!document.documentElement)return;const s=document.documentElement.style;"
                + "s.setProperty('--safe-left','" + safeInsets.left / density + "px');"
                + "s.setProperty('--safe-top','" + safeInsets.top / density + "px');"
                + "s.setProperty('--safe-right','" + safeInsets.right / density + "px');"
                + "s.setProperty('--safe-bottom','" + safeInsets.bottom / density + "px');})()";
        webView.evaluateJavascript(script, null);
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void createWebView(Bundle state) {
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
        webView = new WebView(this);
        webView.setBackgroundColor(Color.BLACK);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setSupportMultipleWindows(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        webView.setWebChromeClient(new WebChromeClient());
        WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        webView.setWebViewClient(new WebViewClientCompat() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (isLocal(request.getUrl())) {
                    WebResourceResponse response = loader.shouldInterceptRequest(request.getUrl());
                    if (response != null) return response;
                    return denied(404, "Not Found");
                }
                return denied(403, "Forbidden");
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !isLocal(request.getUrl());
            }
            @Override public void onPageFinished(WebView view, String url) {
                applySafeInsets();
                if (inactive) pauseGame();
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceErrorCompat error) {
                if (request.isForMainFrame()) showError();
            }
            @Override public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse error) {
                if (request.isForMainFrame()) showError();
            }
            @Override public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                container.removeView(view); view.destroy(); webView = null; showError(); return true;
            }
        });
        container.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        if (state == null || webView.restoreState(state) == null) webView.loadUrl(HOME);
    }

    private static WebResourceResponse denied(int code, String reason) {
        return new WebResourceResponse("text/plain", "UTF-8", code, reason,
                Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
    }

    static boolean isLocal(Uri uri) {
        return "https".equals(uri.getScheme()) && HOST.equals(uri.getHost())
                && (uri.getPort() == -1 || uri.getPort() == 443)
                && uri.getPath() != null && uri.getPath().startsWith(ROOT)
                && !uri.getPath().contains("/../");
    }

    private void handleBack() {
        if (errorView != null) { reloadHome(); return; }
        if (webView == null) { showError(); return; }
        // Returning from the optional edition uses its actual browser history.
        if (webView.getUrl() != null && webView.getUrl().contains("/engine/")) {
            if (webView.canGoBack()) webView.goBack(); else reloadHome();
            return;
        }
        webView.evaluateJavascript("(()=>{const shop=document.getElementById('shop-overlay');"
                + "if(shop?.classList.contains('active')){document.getElementById('shop-close').click();return true;}"
                + "if(document.getElementById('perk-overlay')?.classList.contains('active'))return true;"
                + "const start=document.getElementById('start-screen');const panel=document.getElementById('rb-pause-panel');"
                + "if(start?.classList.contains('hidden')&&panel?.hidden){document.getElementById('rb-pause').click();return true;}"
                + "return false;})()", handled -> {
            if ("true".equals(handled) || isFinishing()) return;
            new AlertDialog.Builder(this).setTitle("Exit Robot Bunny?")
                    .setMessage("Earned coins, upgrades and high scores stay on this device. The current run will end.")
                    .setNegativeButton("Keep playing", (dialog, which) -> immersive())
                    .setPositiveButton("Exit", (dialog, which) -> finish()).show();
        });
    }

    private void showError() {
        if (errorView != null || isFinishing()) return;
        LinearLayout panel = new LinearLayout(this);
        panel.setOrientation(LinearLayout.VERTICAL); panel.setGravity(Gravity.CENTER);
        panel.setPadding(32, 32, 32, 32); panel.setBackgroundColor(Color.BLACK);
        TextView text = new TextView(this); text.setText(R.string.load_error);
        text.setTextColor(Color.WHITE); text.setTextSize(20); text.setGravity(Gravity.CENTER);
        Button retry = new Button(this); retry.setText(R.string.reload_game);
        retry.setOnClickListener(view -> reloadHome()); panel.addView(text); panel.addView(retry);
        errorView = panel; container.addView(panel, new FrameLayout.LayoutParams(-1, -1));
        text.announceForAccessibility(getString(R.string.load_error));
    }

    private void reloadHome() {
        if (errorView != null) { container.removeView(errorView); errorView = null; }
        if (webView == null) createWebView(null); else webView.loadUrl(HOME);
    }

    private void pauseGame() {
        if (webView == null) return;
        webView.evaluateJavascript("window.dispatchEvent(new Event('rb:background'));"
                + "document.querySelectorAll('audio,video').forEach(m=>m.pause());"
                + "document.getElementById('pause')?.textContent==='Pause'&&document.getElementById('pause').click();", null);
    }

    @Override protected void onSaveInstanceState(Bundle state) {
        if (webView != null) webView.saveState(state);
        super.onSaveInstanceState(state);
    }

    @Override protected void onPause() {
        inactive = true; pauseGame();
        if (webView != null) { webView.onPause(); webView.pauseTimers(); }
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        super.onPause();
    }

    @Override protected void onResume() {
        super.onResume(); inactive = false; immersive();
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (webView != null) { webView.resumeTimers(); webView.onResume(); }
        // WebView owns audio focus for its media. A second native focus request
        // would compete with WebView and pause the game as soon as music starts.
    }

    @Override public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (!hasFocus) pauseGame();
        else immersive();
    }

    @Override protected void onDestroy() {
        if (webView != null) { container.removeView(webView); webView.destroy(); webView = null; }
        super.onDestroy();
    }
}
