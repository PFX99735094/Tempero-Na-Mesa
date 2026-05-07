import sqlite3
import os

os.chdir(r'C:\Users\Claudio\Desktop\Saas')

conn = sqlite3.connect('db.sqlite3')
cur = conn.cursor()

# Check tables
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cur.fetchall()]
print("Tables:", tables)

if 'vendas_cliente' in tables:
    cur.execute('PRAGMA table_info(vendas_cliente)')
    cols = [c[1] for c in cur.fetchall()]
    print("vendas_cliente columns:", cols)
    
    if 'senha' not in cols:
        cur.execute('ALTER TABLE vendas_cliente ADD COLUMN senha VARCHAR(128) DEFAULT ""')
        conn.commit()
        print("Added 'senha' column")
    else:
        print("Column 'senha' already exists")

conn.close()
print("Done!")