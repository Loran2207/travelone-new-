import { createRoot } from "react-dom/client";
import "iconify-icon"; // <iconify-icon> web component (loads icons from the Iconify CDN)
import "leaflet/dist/leaflet.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/map.css";
import "./styles/trips.css";
import "./styles/app.css";
import "./styles/leaflet.css";
import { App } from "./App";

// No <StrictMode>: react-leaflet v4 dislikes the dev double-mount.
createRoot(document.getElementById("root")!).render(<App />);
