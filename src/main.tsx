import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HeroAnimation } from "./components/HeroAnimation";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HeroAnimation />
  </StrictMode>
);
