# region_rules.py – required Module‑1 folders / documents per region
FDA_RULES = {
    'required_modules': ['m1.0', 'm1.1', 'm1.3', 'm1.15.2'],
    'display': 'US‑FDA'
}
EMA_RULES = {
    'required_modules': ['m1.0', 'm1.2', 'm1.3', 'm1.5'],
    'display': 'EU‑EMA'
}
PMDA_RULES = {
    'required_modules': ['m1.0', 'm1.1', 'jp-annex'],
    'display': 'JP‑PMDA'
}

REGION_RULES = {
    'FDA': FDA_RULES,
    'EMA': EMA_RULES,
    'PMDA': PMDA_RULES,
}

def get_required_modules(region: str):
    return REGION_RULES.get(region, {}).get('required_modules', [])