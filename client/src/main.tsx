import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set the page title
document.title = "TrialSage - AI-Powered CSR Intelligence Platform";

// Set favicon if needed (using a font-based solution to avoid binary files)
const faviconElement = document.createElement('link');
faviconElement.rel = 'icon';
faviconElement.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📊</text></svg>';
document.head.appendChild(faviconElement);

createRoot(document.getElementById("root")!).render(<App />);
