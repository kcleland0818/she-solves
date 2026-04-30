import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import townMapBg from "./assets/town-map-bg.jpg";
import { applyTheme, getInitialTheme } from "./lib/theme";
import { applyMotionPref, getStoredMotion } from "./lib/motion";
import {
  applyColorMode,
  getStoredColorMode,
  subscribeToSystemColorMode,
} from "./lib/color-mode";

// Apply persisted theme + motion + color-mode before React mounts (avoid flash).
applyTheme(getInitialTheme());
applyMotionPref(getStoredMotion());
applyColorMode(getStoredColorMode());
// Keep "system" mode in sync if the OS color scheme changes at runtime.
subscribeToSystemColorMode(() => applyColorMode(getStoredColorMode()));

// Preload the LCP image (town map background) so the browser can fetch it
// in parallel with the JS bundle, reducing LCP resource load delay.
const preloadLink = document.createElement("link");
preloadLink.rel = "preload";
preloadLink.as = "image";
preloadLink.href = townMapBg;
(preloadLink as HTMLLinkElement & { fetchPriority?: string }).fetchPriority = "high";
document.head.appendChild(preloadLink);

createRoot(document.getElementById("root")!).render(<App />);
