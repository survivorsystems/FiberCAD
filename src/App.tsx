import { useEffect, useState } from "react";
import { CreatePatternPage } from "./pages/CreatePatternPage";
import { HomePage } from "./pages/HomePage";
import { PatternLibraryPage } from "./pages/PatternLibraryPage";

function currentRoute() {
  return window.location.hash.replace(/^#/, "") || window.location.pathname;
}

export function App() {
  const [route, setRoute] = useState(currentRoute);

  useEffect(() => {
    const updateRoute = () => setRoute(currentRoute());

    window.addEventListener("hashchange", updateRoute);
    window.addEventListener("popstate", updateRoute);

    return () => {
      window.removeEventListener("hashchange", updateRoute);
      window.removeEventListener("popstate", updateRoute);
    };
  }, []);

  if (route === "/create-your-own-pattern") {
    return <CreatePatternPage />;
  }

  if (route === "/pattern-library") {
    return <PatternLibraryPage />;
  }

  return <HomePage />;
}
