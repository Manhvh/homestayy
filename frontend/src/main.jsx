import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import toast from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./context/AppContext.jsx";

// Ensure only 1 toast notification is displayed at a time (no duplicate/stacked toasts)
const SINGLE_TOAST_ID = "homestay-single-toast";
const origSuccess = toast.success.bind(toast);
const origError = toast.error.bind(toast);
const origLoading = toast.loading.bind(toast);

toast.success = (message, options = {}) =>
  origSuccess(message, { id: SINGLE_TOAST_ID, ...options });

toast.error = (message, options = {}) =>
  origError(message, { id: SINGLE_TOAST_ID, ...options });

toast.loading = (message, options = {}) =>
  origLoading(message, { id: SINGLE_TOAST_ID, ...options });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>
);
