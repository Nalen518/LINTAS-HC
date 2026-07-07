import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page-header";
import { ResultsView } from "@/components/declaration/ResultsView";
import { HISTORY_DECLARATIONS } from "@/lib/mock-data";
import extractFixture from "@/fixtures/extract.json";
import validateFixture from "@/fixtures/validate.json";
import hsFixture from "@/fixtures/predict-hs-code.json";
import type {
  ExtractResponse,
  ValidateResponse,
  PredictHsCodeResponse,
} from "@/lib/api";

// Read-only declaration detail (FR-12.x). No dedicated Figma frame — reuses the
// Results screen in read-only mode (no submit). Until declarations are
// persisted per-id, it renders the canonical stored run (fixtures); the row
// metadata (importer/date) comes from the History entry.
export default function HistoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const declaration = HISTORY_DECLARATIONS.find((d) => d.id === params.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard/history"
          className="flex w-fit items-center gap-1.5 text-body-sm text-link hover:underline"
        >
          <IconArrowLeft size={16} stroke={1.75} />
          Back to history
        </Link>
        <PageHeader
          title={params.id}
          subtitle={
            declaration
              ? `${declaration.importer} · read-only`
              : "Read-only declaration detail"
          }
        />
      </div>

      {declaration ? (
        <>
          <div className="rounded border border-border bg-elevated px-4 py-2.5 text-body-sm text-muted-foreground">
            Read-only view of a stored declaration.
          </div>
          <ResultsView
            extraction={extractFixture as unknown as ExtractResponse}
            validation={validateFixture as unknown as ValidateResponse}
            hsPrediction={hsFixture as unknown as PredictHsCodeResponse}
            readOnly
            shareId={params.id}
          />
        </>
      ) : (
        <p className="text-body-sm text-faint">
          Declaration {params.id} was not found.
        </p>
      )}
    </div>
  );
}
