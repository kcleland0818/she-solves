import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import townMapBg from "./assets/town-map-bg.jpg";

// Preload the LCP image (town map background) so the browser can fetch it
// in parallel with the JS bundle, reducing LCP resource load delay.
const preloadLink = document.createElement("link");
preloadLink.rel = "preload";
preloadLink.as = "image";
preloadLink.href = townMapBg;
(preloadLink as HTMLLinkElement & { fetchPriority?: string }).fetchPriority = "high";
document.head.appendChild(preloadLink);

createRoot(document.getElementById("root")!).render(<App />);
