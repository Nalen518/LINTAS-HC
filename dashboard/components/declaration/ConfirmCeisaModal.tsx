import { IconAlertTriangle } from "@tabler/icons-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { ValidateResponse } from "@/lib/api";

// Figma: "New declaration — Submit confirm" modal (94:646). PRD §5.16 FR-16.x.
// Confirmation before the SIMULATED submit (ADR-002). The risk callout shows
// only when the real validation flags risk or unresolved warnings.
export function ConfirmCeisaModal({
  open,
  validation,
  submitting,
  error,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  validation: ValidateResponse;
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const hasRisk =
    validation.risk_level !== "Low" || validation.warnings.length > 0;
  const count = validation.warnings.length;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      className="w-[480px] max-w-full"
      labelledBy="confirm-ceisa-title"
    >
      <div className="flex flex-col gap-4 px-7 pb-6 pt-7">
        <h2
          id="confirm-ceisa-title"
          className="text-2xl font-medium text-foreground"
        >
          Submit to CEISA?
        </h2>
        <p className="text-sm text-muted-foreground">
          You&apos;re about to submit this declaration to CEISA. This is a demo
          simulation — nothing is transmitted to DJBC.
        </p>

        {hasRisk && (
          <div className="flex gap-2.5 rounded bg-elevated p-3">
            <IconAlertTriangle
              size={18}
              stroke={1.75}
              className="mt-px shrink-0 text-warning"
            />
            <p className="text-body-sm text-muted-foreground">
              This declaration is {validation.risk_level.toLowerCase()} risk
              with {count} unresolved {count === 1 ? "warning" : "warnings"}.
              Submit anyway?
            </p>
          </div>
        )}

        {error && <p className="text-body-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit to CEISA"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
