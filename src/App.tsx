import { CreatePatternPage } from "./pages/CreatePatternPage";
import { HomePage } from "./pages/HomePage";
import { PatternLibraryPage } from "./pages/PatternLibraryPage";

export function App() {
  const path = window.location.pathname;
  const hashRoute = window.location.hash.replace(/^#/, "");
  const route = hashRoute || path;

  if (route === "/create-your-own-pattern") {
    return <CreatePatternPage />;
  }

  if (route === "/pattern-library") {
    return <PatternLibraryPage />;
  }

  return <HomePage />;
}
