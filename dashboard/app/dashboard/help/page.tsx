// Figma: "Help" (100:1551). PRD §5.14. Glossary (source: docs/GLOSSARY.md) +
// FAQ. Static content — no interactivity needed.
type Term = { term: string; definition: string };

const GLOSSARY: Term[] = [
  { term: "CEISA", definition: "DJBC's electronic customs system for declarations and clearance." },
  { term: "PIB", definition: "Pemberitahuan Impor Barang, or the import declaration document." },
  { term: "Permendag", definition: "Ministry of Trade regulation governing import rules (currently 16/2025)." },
  { term: "HS code", definition: "Harmonized System code that classifies goods for tariffs." },
  { term: "SPPB", definition: "Surat Persetujuan Pengeluaran Barang, or goods release approval." },
  { term: "PPJK", definition: "Licensed customs brokerage / freight-forwarding company." },
  { term: "Bea Masuk", definition: "Import duty, charged by HS code." },
  { term: "PPN / PPh 22", definition: "Value-added tax (11%) and import income tax (2.5%)." },
  { term: "KURS", definition: "Customs exchange rate used to convert USD to IDR." },
  { term: "SHAP", definition: "Method that shows each factor's contribution to the risk score." },
  { term: "Confidence score", definition: "How sure the model is that a field was read correctly." },
  { term: "Cross-document check", definition: "Compares values across CI, PL, and BoL for mismatches." },
];

const FAQ: { question: string; answer: string }[] = [
  {
    question: "Why is a declaration high risk when confidence is high?",
    answer:
      "Confidence is how sure we are we read the documents correctly; risk is how likely the values are to be flagged. They're independent.",
  },
  {
    question: "Which documents do I need?",
    answer: "All three: Commercial Invoice, Packing List, and Bill of Lading.",
  },
  {
    question: "Can I change the predicted HS code?",
    answer:
      "Yes, the prediction is a suggestion. You can override it before submitting.",
  },
  {
    question: "Where do the time and cost estimates come from?",
    answer:
      "From the assumptions you set in Settings; they're clearly labelled as estimates.",
  },
];

function TermRow({ term, definition }: Term) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-foreground">{term}</span>
      <span className="text-body-sm text-faint">{definition}</span>
    </div>
  );
}

export default function HelpPage() {
  const left = GLOSSARY.slice(0, 6);
  const right = GLOSSARY.slice(6);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-medium text-foreground">Help &amp; about</h1>

      {/* Glossary */}
      <div className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6">
        <span className="text-sm font-medium text-foreground">Glossary</span>
        <div className="flex gap-10">
          <div className="flex flex-1 flex-col gap-4">
            {left.map((t) => (
              <TermRow key={t.term} {...t} />
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-4">
            {right.map((t) => (
              <TermRow key={t.term} {...t} />
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
        <span className="text-sm font-medium text-foreground">
          Frequently asked questions
        </span>
        <div className="flex flex-col">
          {FAQ.map((item, i) => (
            <div key={item.question}>
              {i > 0 && <span className="my-4 block h-px bg-border" />}
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  {item.question}
                </span>
                <span className="text-body-sm text-faint">{item.answer}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
