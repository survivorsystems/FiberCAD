import { Layout } from "../components/Layout";
import { FreestyleEditor } from "../components/FreestyleEditor";

export function CreatePatternPage() {
  return (
    <Layout pageClassName="content-page" currentPage="create">
      <main className="page-main">
        <section className="page-title">
          <p className="eyebrow">Rules-based simulator</p>
          <h1>Preview Builder</h1>
          <p>
            Add crochet rows, see them rendered as proportional stitch strips on a blank SVG
            canvas, and rotate the preview while the written pattern updates from the same data.
          </p>
        </section>

        <FreestyleEditor />
      </main>
    </Layout>
  );
}
