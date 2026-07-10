import { IconCheck, IconX } from "@tabler/icons-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SubmitCeisaResponse } from "@/lib/api";

// Figma: "New declaration — CEISA response" modal (96:689). PRD §5.5 FR-5.x.
// Renders the SIMULATED /api/submit-ceisa response (ADR-002). MUST show the
// exact string "Simulated CEISA Response (Demo Mode)" (FR-5.5) — this is a
// credibility rule; never contact real DJBC. Beacukai assigns a response code
// to every submission: a REST code on accept, or a CEISA error code on reject.
const LANE: Record<"GREEN" | "YELLOW" | "RED", { label: string; text: string }> = {
  GREEN: { label: "Green (auto-release)", text: "text-success" },
  YELLOW: { label: "Yellow (document check)", text: "text-warning" },
  RED: { label: "Red (physical inspection)", text: "text-destructive" },
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Format the ISO ack timestamp as day-first + WIB time, reading the components
// straight from the string so the +07:00 wall-clock time is shown as sent.
function formatTimestamp(iso: string): string {
  const m = iso.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return iso;
  const [, year, month, day, hour, minute] = m;
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year} · ${hour}:${minute} WIB`;
}

function DetailRow({
  label,
  value,
  mono,
  valueClass,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[200px] shrink-0 text-body-sm text-faint">{label}</span>
      <span
        className={cn(
          mono ? "font-mono text-mono-sm" : "text-body-sm",
          valueClass ?? "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function CeisaSubmitModal({
  open,
  response,
  onClose,
  onDone,
}: {
  open: boolean;
  response: SubmitCeisaResponse | null;
  onClose: () => void;
  onDone: () => void;
}) {
  if (!response) return null;
  const { ceisa_ack, ceisa_payload } = response;
  const rejected = ceisa_ack.status === "REJECTED";
  const lane = ceisa_ack.estimated_clearance_lane
    ? LANE[ceisa_ack.estimated_clearance_lane]
    : null;
  const payloadJson = JSON.stringify(ceisa_payload, null, 2);

  const registrationNo =
    typeof ceisa_payload.registration_no === "string"
      ? ceisa_payload.registration_no
      : null;
  const ajuNumber =
    typeof ceisa_payload.nomor_aju === "string"
      ? ceisa_payload.nomor_aju
      : null;

  function downloadJson() {
    const blob = new Blob([JSON.stringify(response, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${ceisa_ack.pib_number || "ceisa-response"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="w-[540px] max-w-full"
      labelledBy="ceisa-response-title"
    >
      <div className="flex flex-col gap-4 px-7 pb-6 pt-7">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full",
              rejected ? "bg-destructive" : "bg-success",
            )}
          >
            {rejected ? (
              <IconX size={20} stroke={2.5} className="text-inverse" />
            ) : (
              <IconCheck size={20} stroke={2.5} className="text-inverse" />
            )}
          </span>
          <h2
            id="ceisa-response-title"
            className="text-2xl font-medium text-foreground"
          >
            {rejected ? "Submission rejected" : "Submission received"}
          </h2>
        </div>

        {/* FR-5.5 — mandated exact string, do not alter. */}
        <div className="rounded bg-accent-subtle px-3 py-2.5">
          <span className="text-sm font-medium text-primary">
            Simulated CEISA Response (Demo Mode)
          </span>
        </div>

        <p className="text-body-sm text-faint">
          {rejected
            ? "CEISA would return this validation error. No data was transmitted to DJBC."
            : "Synthetic acknowledgment. No data was transmitted to DJBC."}
        </p>

        {rejected ? (
          // Rejection: the beacukai error code is the headline result.
          ceisa_ack.response_code && (
            <div className="flex flex-col gap-1 rounded border border-destructive bg-elevated p-3.5">
              <span className="font-mono text-sm font-medium text-destructive">
                Error {ceisa_ack.response_code}
              </span>
              <span className="text-body-sm text-muted-foreground">
                {ceisa_ack.response_message}
              </span>
            </div>
          )
        ) : (
          // Accept: acknowledgment details, including the REST response code.
          <div className="flex flex-col gap-2.5 rounded border border-border p-3.5">
            {registrationNo && (
              <DetailRow label="Registration no." value={registrationNo} mono />
            )}
            <DetailRow label="PIB number" value={ceisa_ack.pib_number} mono />
            {ajuNumber && <DetailRow label="Aju number" value={ajuNumber} mono />}
            {ceisa_ack.response_code && (
              <DetailRow
                label="Response code"
                value={`${ceisa_ack.response_code} · ${ceisa_ack.response_message ?? ""}`}
              />
            )}
            {lane && (
              <DetailRow
                label="Customs channel"
                value={lane.label}
                valueClass={lane.text}
              />
            )}
            <DetailRow
              label="Received"
              value={formatTimestamp(ceisa_ack.received_at)}
            />
          </div>
        )}

        <span className="text-xs font-medium text-faint">
          Transmitted payload (simulated)
        </span>
        <pre className="overflow-x-auto rounded bg-deep px-3.5 py-3 font-mono text-mono-sm text-inverse">
          {payloadJson}
        </pre>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={downloadJson}>
            Download JSON
          </Button>
          {rejected ? (
            <Button onClick={onClose}>Back to review</Button>
          ) : (
            <Button onClick={onDone}>Back to dashboard</Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
