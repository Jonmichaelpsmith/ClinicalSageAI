"""Widget persistence layer (org + user scoped)."""
import sqlite3, json, pathlib
DB = pathlib.Path('data/widgets.db'); DB.parent.mkdir(exist_ok=True)
conn = sqlite3.connect(DB)
conn.row_factory = sqlite3.Row
conn.execute('''CREATE TABLE IF NOT EXISTS widget (
  id INTEGER PRIMARY KEY,
  org TEXT,
  user TEXT,
  name TEXT,
  sql TEXT,
  type TEXT,
  layout TEXT
);'''); conn.commit()

def list_widgets(org: str, user: str):
    cur = conn.execute('SELECT * FROM widget WHERE org=? AND user=?', (org, user))
    return [dict(r) for r in cur.fetchall()]

def save_widget(org: str, user: str, wd: dict):
    if wd.get('id'):
        conn.execute('UPDATE widget SET name=?, sql=?, type=?, layout=? WHERE id=? AND user=?',
                    (wd['name'], wd['sql'], wd['type'], json.dumps(wd['layout']), wd['id'], user))
    else:
        conn.execute('INSERT INTO widget(org,user,name,sql,type,layout) VALUES(?,?,?,?,?,?)',
                    (org, user, wd['name'], wd['sql'], wd['type'], json.dumps(wd['layout'])))
    conn.commit()
