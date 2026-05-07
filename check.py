import sqlite3
conn = sqlite3.connect('db.sqlite3')
c = conn.cursor()
c.execute('SELECT name FROM sqlite_master WHERE type="table"')
tables = c.fetchall()
print("Tables:", tables)

if ('vendas_cliente',) in tables:
    c.execute('PRAGMA table_info(vendas_cliente)')
    cols = c.fetchall()
    print("Columns:", [col[1] for col in cols])
    
    has_senha = any(col[1] == 'senha' for col in cols)
    if not has_senha:
        c.execute('ALTER TABLE vendas_cliente ADD COLUMN senha VARCHAR(128) DEFAULT ""')
        conn.commit()
        print("Added senha column")
    else:
        print("senha column already exists")

conn.close()