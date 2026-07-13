import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "../styles.css";
import "./styles/react-app.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("FiberCAD root element is missing.");
}

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
