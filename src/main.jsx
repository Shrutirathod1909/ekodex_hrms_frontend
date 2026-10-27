import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { PermissionProvider } from "../src/components/context/PermissionsContext";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PermissionProvider>
      <App />
    </PermissionProvider>
  </StrictMode>,
);
