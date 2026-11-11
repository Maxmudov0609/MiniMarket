import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppNext from "./AppNext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppNext />
  </StrictMode>
);
