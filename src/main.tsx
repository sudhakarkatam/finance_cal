// Global error handler - catches errors and shows them instead of blank screen
window.addEventListener("error", (event) => {
  console.error("Global Error:", event.error);
  const errorDiv = document.createElement("div");
  errorDiv.style.cssText =
    "padding:20px;font-family:Arial;background:#fff;height:100vh;overflow:auto;";
  errorDiv.innerHTML = `
    <h1 style="color:red;">App Error</h1>
    <p><strong>Message:</strong> ${event.error?.message || "Unknown error"}</p>
    <pre style="background:#f5f5f5;padding:10px;overflow:auto;border:1px solid #ddd;border-radius:4px;margin:10px 0;">
${event.error?.stack || "No stack trace"}
    </pre>
    <button onclick="location.reload()" style="padding:10px 20px;margin-top:20px;cursor:pointer;background:#4CAF50;color:white;border:none;border-radius:4px;font-size:14px;">
      Reload App
    </button>
    <button onclick="localStorage.clear();location.reload()" style="padding:10px 20px;margin-top:20px;margin-left:10px;cursor:pointer;background:#f44336;color:white;border:none;border-radius:4px;font-size:14px;">
      Clear Cache & Reload
    </button>
  `;
  document.body.innerHTML = "";
  document.body.appendChild(errorDiv);
});

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { CurrencyProvider } from "./context/CurrencyContext";
import "./index.css";

// Function to update CSS variables with safe area insets
const updateSafeAreaInsets = () => {
  const root = document.documentElement;

  // Get safe area insets from CSS env()
  const safeAreaTop =
    getComputedStyle(root).getPropertyValue("padding-top") || "0px";
  const safeAreaBottom =
    getComputedStyle(root).getPropertyValue("padding-bottom") || "0px";
  const safeAreaLeft =
    getComputedStyle(root).getPropertyValue("padding-left") || "0px";
  const safeAreaRight =
    getComputedStyle(root).getPropertyValue("padding-right") || "0px";

  // Set CSS custom properties for easier access
  root.style.setProperty("--sai-top", safeAreaTop);
  root.style.setProperty("--sai-bottom", safeAreaBottom);
  root.style.setProperty("--sai-left", safeAreaLeft);
  root.style.setProperty("--sai-right", safeAreaRight);
};

// Ensure dark mode or system theme is applied on app startup
const applyInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem("app-theme") || "system";
    const isDark =
      savedTheme === "dark" ||
      (savedTheme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  } catch (e) {
    console.error("Failed to load initial theme:", e);
  }
};

applyInitialTheme();

// Initialize Capacitor and safe area handling
const initializeApp = async () => {
  try {
    // Check if running in Capacitor (native app)
    try {
      const { Capacitor } = await import("@capacitor/core");

      // Wait for platform to be ready
      if (Capacitor.isNativePlatform()) {
        console.log("Running on native platform:", Capacitor.getPlatform());

        // Update safe areas after a short delay to ensure native UI is ready
        setTimeout(updateSafeAreaInsets, 100);
        setTimeout(updateSafeAreaInsets, 500);
        setTimeout(updateSafeAreaInsets, 1000);
      }
    } catch (error) {
      console.log("Capacitor not available, running as web app");
    }

    // Update safe areas on orientation change
    window.addEventListener("orientationchange", () => {
      setTimeout(updateSafeAreaInsets, 100);
      setTimeout(updateSafeAreaInsets, 500);
    });

    // Update safe areas on resize
    window.addEventListener("resize", () => {
      setTimeout(updateSafeAreaInsets, 100);
    });

    // Initial update
    updateSafeAreaInsets();
  } catch (error) {
    console.error("Failed to initialize app:", error);
    throw error;
  }
};

// Register Service Worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("Service Worker registered"))
      .catch((error) =>
        console.error("Service Worker registration failed:", error),
      );
  });
}

// Initialize app
initializeApp()
  .then(() => {
    const root = document.getElementById("root");
    if (!root) {
      throw new Error("Root element not found");
    }
    createRoot(root).render(
      <CurrencyProvider>
        <App />
      </CurrencyProvider>
    );
  })
  .catch((error) => {
    console.error("App initialization failed:", error);
    document.body.innerHTML = `
      <div style="padding:20px;text-align:center;font-family:Arial;background:#fff;height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;">
        <h1 style="color:#f44336;margin-bottom:20px;">Failed to Load App</h1>
        <p style="color:#666;margin-bottom:10px;">${error.message}</p>
        <div style="margin-top:20px;">
          <button onclick="location.reload()" style="padding:12px 24px;cursor:pointer;background:#4CAF50;color:white;border:none;border-radius:4px;font-size:16px;margin:5px;">
            Retry
          </button>
          <button onclick="localStorage.clear();location.reload()" style="padding:12px 24px;cursor:pointer;background:#f44336;color:white;border:none;border-radius:4px;font-size:16px;margin:5px;">
            Clear Data & Retry
          </button>
        </div>
      </div>
    `;
  });
