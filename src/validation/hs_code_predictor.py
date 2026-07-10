"""Heuristic HS code suggester (no trained classifier exists in this repo yet).

Keyword-matches an item description against a small curated set of common HS
chapters. This is a placeholder for a real ML/lookup-table classifier -
confidence is a rough proxy for keyword-match strength, not a calibrated
probability.
"""
from typing import Dict, List

HS_CATALOG: List[dict] = [
    {
        "prefix": "72",
        "code": "720810",
        "label": "Iron and Steel",
        "keywords": ["iron", "steel", "besi", "baja", "coil", "billet", "rebar", "hot-rolled", "cold-rolled", "stainless"],
        "alternatives": [
            {"code": "720825", "reasoning": "Also cold-rolled coil but for a narrower thickness/width band."},
            {"code": "720839", "reasoning": "General flat-rolled iron/steel products."},
        ],
    },
    {
        "prefix": "61",
        "code": "610910",
        "label": "Apparel and clothing accessories, knitted",
        "keywords": ["garment", "textile", "apparel", "clothing", "shirt", "t-shirt", "fabric", "knit", "knitted", "cotton"],
        "alternatives": [
            {"code": "620462", "reasoning": "Woven (non-knitted) trousers/garments, if the fabric is woven rather than knit."},
            {"code": "630900", "reasoning": "Used/worn clothing, if the shipment is second-hand."},
        ],
    },
    {
        "prefix": "87",
        "code": "870323",
        "label": "Motor vehicles",
        "keywords": ["vehicle", "car", "sedan", "truck", "motorcycle", "automobile", "chassis"],
        "alternatives": [
            {"code": "870421", "reasoning": "Goods transport vehicles (trucks) under 5 tonnes gross weight."},
            {"code": "871120", "reasoning": "Motorcycles, if the item is two-wheeled."},
        ],
    },
    {
        "prefix": "85",
        "code": "851712",
        "label": "Electronics and electrical machinery",
        "keywords": ["electronic", "phone", "smartphone", "circuit", "battery", "charger", "cable", "computer", "laptop", "semiconductor"],
        "alternatives": [
            {"code": "847130", "reasoning": "Portable computers/laptops rather than telephony equipment."},
            {"code": "854231", "reasoning": "Integrated circuits/processors, if the item is a bare component."},
        ],
    },
    {
        "prefix": "39",
        "code": "392690",
        "label": "Plastics and articles thereof",
        "keywords": ["plastic", "polymer", "pvc", "polyethylene", "polypropylene", "resin"],
        "alternatives": [
            {"code": "390120", "reasoning": "Polyethylene in primary (raw pellet/resin) form."},
            {"code": "392321", "reasoning": "Plastic packaging such as sacks and bags."},
        ],
    },
    {
        "prefix": "84",
        "code": "847989",
        "label": "Machinery and mechanical appliances",
        "keywords": ["machine", "machinery", "engine", "pump", "compressor", "turbine", "equipment", "industrial"],
        "alternatives": [
            {"code": "845011", "reasoning": "Household washing machines, if the item is consumer-grade."},
            {"code": "841381", "reasoning": "Pumps for liquids, if the item is specifically a pump."},
        ],
    },
]


def predict_hs_code(item_description: str, country_of_origin: str = "", unit_of_measure: str = "") -> Dict:
    text = (item_description or "").lower()

    best_entry = None
    best_hits = 0
    for entry in HS_CATALOG:
        hits = sum(1 for kw in entry["keywords"] if kw in text)
        if hits > best_hits:
            best_hits = hits
            best_entry = entry

    if not best_entry or best_hits == 0:
        return {
            "suggested_hs_code": "000000",
            "confidence": 10,
            "reasoning": (
                f"No confident keyword match found for '{item_description}'. "
                "This is a heuristic placeholder, not a trained classifier - manual HS classification is recommended."
            ),
            "alternative_codes": [],
        }

    # Rough confidence proxy: more keyword hits = stronger match. Capped well
    # below 100 to avoid overselling the precision of a keyword heuristic.
    confidence = min(90, 40 + best_hits * 15)

    reasoning = (
        f"Description matches HS Chapter {best_entry['prefix']} ({best_entry['label']}) "
        f"based on {best_hits} keyword indicator(s); suggested subheading {best_entry['code']}."
    )

    return {
        "suggested_hs_code": best_entry["code"],
        "confidence": confidence,
        "reasoning": reasoning,
        "alternative_codes": best_entry["alternatives"][:2],
    }
