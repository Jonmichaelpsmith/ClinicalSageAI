import json, os
DATA_DIR = "data/projects"

def _path(pid: str): return f"{DATA_DIR}/{pid}.json"

def load(pid: str) -> dict | None:
    try:
        with open(_path(pid)) as f: return json.load(f)
    except FileNotFoundError:
        return None

def save(pid: str, record: dict):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(_path(pid), "w") as f: json.dump(record, f, indent=2)

def list_projects() -> list[dict]:
    os.makedirs(DATA_DIR, exist_ok=True)
    out=[]
    for fn in os.listdir(DATA_DIR):
        if fn.endswith(".json"):
            with open(f"{DATA_DIR}/{fn}") as f: out.append(json.load(f))
    return out