// Figma: "New declaration — CEISA response" frame (96:503). PRD §5.5 FR-5.x.
// MUST render the exact text "Simulated CEISA Response (Demo Mode)" (FR-5.5)
// — credibility rule, breaking it invalidates the demo. Never attempt a real
// DJBC call (ADR-002). Shows ceisa_payload JSON (mono, IDR code allowed
// inside the payload only) + ceisa_ack: status, synthetic PIB number,
// received_at, estimated clearance lane. Data from /api/submit-ceisa
// (API_CONTRACT §4, `simulated: true` always).
// TODO(step 5): build to Figma spec.
export function CeisaSubmitModal() {
  return null;
}
