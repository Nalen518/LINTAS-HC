// Figma: "New declaration — Extraction degraded" frame (100:1785).
// PRD FR-2.2 fallback (ADR-003): LayoutLMv3/TableTransformer failed, the
// pipeline degraded to Docling + PaddleOCR + Ollama. Warning banner
// explains what degraded and that results may have lower confidence;
// workflow continues with partial results (ARCHITECTURE §6 — never crash
// the whole request).
// TODO(step 6): build to Figma spec.
export function ExtractionDegraded() {
  return null;
}
