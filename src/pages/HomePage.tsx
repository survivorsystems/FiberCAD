import { Layout } from "../components/Layout";

export function HomePage() {
  return (
    <Layout pageClassName="hero-page" currentPage="home">
      <main className="hero">
        <section className="hero-copy" aria-labelledby="hero-title">
          <p className="eyebrow">Crochet charts, symbols, and finished previews</p>
          <h1 id="hero-title">Welcome to FiberCAD! The first project builder for fiber artists</h1>
          <p>
            Build charts with real stitch symbols, shape colorwork row by row, and preview how
            your Tunisian-inspired ideas could become finished fiber art.
          </p>
          <div className="hero-actions" aria-label="Main actions">
            <a className="button primary" href="#/create-your-own-pattern">
              Start designing
            </a>
            <a className="button secondary" href="#/pattern-library">
              Browse patterns
            </a>
          </div>
        </section>

        <section className="preview-strip" aria-label="MVP feature preview">
          <article className="preview-card">
            <strong>Symbol-first charts</strong>
            <span>Place crochet stitches on a grid and let the legend build itself.</span>
          </article>
          <article className="preview-card">
            <strong>Finished look preview</strong>
            <span>Translate stitch, color, gauge, and repeat choices into a fabric estimate.</span>
          </article>
          <article className="preview-card">
            <strong>Pattern output</strong>
            <span>Move from chart to row-by-row instructions when the design is ready.</span>
          </article>
        </section>
      </main>
    </Layout>
  );
}
