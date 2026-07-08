"""In-memory state for the single-client hackathon demo (no DB, no persistence, no locking)."""
from typing import Any, Dict

extractions: Dict[str, Any] = {}
validations: Dict[str, Any] = {}
