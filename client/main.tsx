// /client/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App"; // or "./App.tsx"

const el = document.getElementById("root")!;
createRoot(el).render(<App />);
