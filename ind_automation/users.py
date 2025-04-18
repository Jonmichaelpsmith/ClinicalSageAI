import json, os, datetime
from pathlib import Path
from passlib.hash import bcrypt
USERS_FILE = Path("data/users.json")
USERS_FILE.parent.mkdir(parents=True, exist_ok=True)

def _load():
    if USERS_FILE.exists(): return json.loads(USERS_FILE.read_text())
    return {}

def _save(data): USERS_FILE.write_text(json.dumps(data, indent=2))

def create(username, password, role="user"):
    data = _load()
    if username in data: raise ValueError("exists")
    data[username] = {"pw": bcrypt.hash(password), "role": role, "created": str(datetime.date.today())}
    _save(data)

def verify(username, password):
    d = _load().get(username)
    return d and bcrypt.verify(password, d["pw"])

def get_role(username):
    d = _load().get(username); return d and d.get("role")