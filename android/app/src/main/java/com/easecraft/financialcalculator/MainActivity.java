package com.easecraft.financialcalculator;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable edge-to-edge display for Android 15+ compatibility
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        // Enable WebView debugging (REMOVE in final production)
        WebView.setWebContentsDebuggingEnabled(true);

        // Clear cache on version update
        clearCacheIfNeeded();
    }

    private void clearCacheIfNeeded() {
        try {
            String currentVersion = getPackageManager()
                .getPackageInfo(getPackageName(), 0).versionName;

            String storedVersion = getPreferences(MODE_PRIVATE)
                .getString("app_version", "");

            if (!currentVersion.equals(storedVersion)) {
                // Version changed - clear cache
                clearApplicationCache();

                getPreferences(MODE_PRIVATE)
                    .edit()
                    .putString("app_version", currentVersion)
                    .apply();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void clearApplicationCache() {
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().clearCache(true);
                getBridge().getWebView().clearHistory();
            }

            deleteDatabase("webview.db");
            deleteDatabase("webviewCache.db");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
