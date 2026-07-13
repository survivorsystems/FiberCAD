import { CreatePatternPage } from "./pages/CreatePatternPage";
import { HomePage } from "./pages/HomePage";
import { PatternLibraryPage } from "./pages/PatternLibraryPage";

export function App() {
  const path = window.location.pathname;

  if (path === "/create-your-own-pattern") {
    return <CreatePatternPage />;
  }

  if (path === "/pattern-library") {
    return <PatternLibraryPage />;
  }

  return <HomePage />;
}
