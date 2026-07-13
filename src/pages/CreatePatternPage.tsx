import { Layout } from "../components/Layout";
import { FreestyleEditor } from "../components/FreestyleEditor";

export function CreatePatternPage() {
  return (
    <Layout pageClassName="content-page" currentPage="create">
      <main className="page-main">
        <FreestyleEditor />
      </main>
    </Layout>
  );
}
