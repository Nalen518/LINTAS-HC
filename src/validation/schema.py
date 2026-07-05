from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class DocumentItem(BaseModel):
    description: str
    quantity: float
    hs_code: Optional[str] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None

class CommercialInvoice(BaseModel):
    document_type: str = "Commercial Invoice"
    invoice_number: Optional[str] = None
    importer_name: Optional[str] = None
    importer_tax_id: Optional[str] = None
    currency: Optional[str] = None
    total_value: Optional[float] = None
    items: List[DocumentItem] = Field(default_factory=list)
    confidence_scores: Dict[str, float] = Field(default_factory=dict) # Field level OCR confidence

class PackingList(BaseModel):
    document_type: str = "Packing List"
    pl_number: Optional[str] = None
    total_gross_weight: Optional[float] = None
    items: List[DocumentItem] = Field(default_factory=list)
    confidence_scores: Dict[str, float] = Field(default_factory=dict)

class BillOfLading(BaseModel):
    document_type: str = "Bill of Lading"
    bl_number: Optional[str] = None
    shipper_name: Optional[str] = None
    consignee_name: Optional[str] = None
    total_gross_weight: Optional[float] = None
    confidence_scores: Dict[str, float] = Field(default_factory=dict)

class ExtractedDocuments(BaseModel):
    commercial_invoice: Optional[CommercialInvoice] = None
    packing_list: Optional[PackingList] = None
    bill_of_lading: Optional[BillOfLading] = None
    import_permits: List[str] = Field(default_factory=list) # e.g. ["PI_Besi_Baja", "LS_Tekstil"]
