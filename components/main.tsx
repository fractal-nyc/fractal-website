import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./tailwind.css";
import "./styles.css";
import { ComponentLibraryApp } from "./ComponentLibraryApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode><ComponentLibraryApp /></StrictMode>,
);
