import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import archive from "@/data/cap-archive.html?raw";
import "./CapPage.css";

/** Reviewed first-party snapshot, not runtime HTML from a remote service.
 * Source scripts, event handlers, forms and executable URLs were removed;
 * disclosures are native details/summary. See docs/cap-archive.md. */
export function CapPage() {
  useDocumentMeta({ title: "Campus Accelerator Program — Historical Archive | Fractal NYC" });
  return (
    <main className="cap-page">
      <Navbar />
      <div className="cap-archive">
        <aside className="cap-archive-notice">
          <strong>Historical archive</strong> — The Campus Accelerator Program is not currently active.
          The information below is preserved for reference.
        </aside>
        <div dangerouslySetInnerHTML={{ __html: archive }} />
      </div>
      <Footer />
    </main>
  );
}
