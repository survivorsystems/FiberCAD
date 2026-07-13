import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
  pageClassName: "hero-page" | "content-page";
  currentPage?: "home" | "create" | "library";
};

export function Layout({ children, pageClassName, currentPage }: LayoutProps) {
  return (
    <div className={pageClassName}>
      <header className="topbar" aria-label="Primary navigation">
        <a className="brand" href="/" aria-label="FiberCAD home">
          <span className="brand-mark">F</span>
          <span>FiberCAD</span>
        </a>
        <nav className="nav">
          <a href="/create-your-own-pattern" aria-current={currentPage === "create" ? "page" : undefined}>
            Create your own pattern
          </a>
          <a href="/pattern-library" aria-current={currentPage === "library" ? "page" : undefined}>
            Pattern library
          </a>
        </nav>
      </header>
      {children}
    </div>
  );
}
