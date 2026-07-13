import { Layout } from "../components/Layout";
import { seedStitchDefinitions } from "../domain/crochetDesigner";

export function PatternLibraryPage() {
  return (
    <Layout pageClassName="content-page" currentPage="library">
      <main className="page-main">
        <section className="page-title">
          <p className="eyebrow">Data library</p>
          <h1>Crochet stitch library</h1>
          <p>
            The working stitch set that powers FiberCAD's freestyle editor, chart builder, symbol
            legend, and finished-project simulator.
          </p>
        </section>

        <section className="workspace-panel" aria-label="Pattern library preview">
          <div className="table-heading">
            <div>
              <h2>Current MVP stitch definitions</h2>
              <p>US terminology is the default for the first crochet designer pass.</p>
            </div>
            <span>{seedStitchDefinitions.length} entries</span>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Abbr.</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Multiple</th>
                  <th>Density</th>
                  <th>Turning chain</th>
                </tr>
              </thead>
              <tbody>
                {seedStitchDefinitions.map((stitch) => (
                  <tr key={stitch.id}>
                    <td>{stitch.abbreviation}</td>
                    <td>{stitch.name}</td>
                    <td>{stitch.category}</td>
                    <td>{stitch.baseStitchMultiple}</td>
                    <td>{stitch.fabricDensity}</td>
                    <td>{stitch.turningChain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </Layout>
  );
}
