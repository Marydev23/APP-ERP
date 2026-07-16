import sqlite3
from werkzeug.security import generate_password_hash

# Nome do banco
bancoDados = "meu_banco.db"

# Conectar ao banco
conn = sqlite3.connect(bancoDados)
cur = conn.cursor()

# Habilitar 
cur.execute("PRAGMA foreign_keys = ON;")

# ========================
# TABELA USUARIOS
# ===============a=========
cur.execute("""
CREATE TABLE IF NOT EXISTS usuarios (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Nome TEXT NOT NULL,
    Email TEXT UNIQUE NOT NULL,
    Senha TEXT NOT NULL,
    CriadoEm TEXT DEFAULT (datetime('now','localtime'))
);
""")

# ========================
# USUÁRIO PADRÃO (COM HASH)
# ========================


senha_hash = generate_password_hash("admin123")

cur.execute("""
INSERT OR IGNORE INTO usuarios (Nome, Email, Senha)
VALUES (?, ?, ?)
""", ("Leia", "supervasos@gmail.com", senha_hash))
# ========================
# TABELA CATEGORIA
# ========================
cur.execute("""
CREATE TABLE IF NOT EXISTS categorias (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Nome TEXT NOT NULL
);
""")



# ========================
# TABELA FUNCIONÁRIOS
# ========================
cur.execute("""
CREATE TABLE IF NOT EXISTS funcionarios (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Nome TEXT NOT NULL,
    Cargo TEXT,
    Endereco TEXT,
    Telefone TEXT,
    Valor_salario REAL,
    Data_admissao TEXT,
        Data_demissao TEXT,
    
    Status TEXT DEFAULT 'ATIVO',
    CriadoEm TEXT DEFAULT (datetime('now','localtime'))
);
""")

# ========================
# TABELA RECEITAS
# ========================
cur.execute("""
CREATE TABLE IF NOT EXISTS receitas (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    
    Data TEXT NOT NULL,  
    DataRecebimento TEXT ,         
    Descricao TEXT,
    Cliente TEXT,
    CategoriaID TEXT,
    Valor REAL NOT NULL,
    Forma_pagamento TEXT,
    Desconto INTEGER,
    ValorTotal REAL NOT NULL,
    Status TEXT,
    CriadoEm TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (CategoriaID) REFERENCES categorias(ID) ON DELETE SET NULL
);
""")

# ========================
# TABELA DESPESAS
# ========================
cur.execute("""
CREATE TABLE IF NOT EXISTS despesas (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    DataPagamento TEXT,
    DataVencimento TEXT NOT NULL,
    Nome TEXT,
    Descricao TEXT,
    Valor REAL NOT NULL,
    Status TEXT, 
    CategoriaID TEXT,
    CriadoEm TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (CategoriaID) REFERENCES categorias(ID) ON DELETE SET NULL
);
""")


# ========================
# TABELA EMPRESA
# ========================
cur.execute("""
CREATE TABLE empresa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  cnpj TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  telefone TEXT,
  email TEXT,
  site TEXT,
  instagran TEXT,
  slogan TEXT,
  logo TEXT
);
""")

# ========================
# TABELA PRODUTOS
# ========================
cur.execute("""
CREATE TABLE IF NOT EXISTS produtos (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Nome_produto TEXT NOT NULL,
    Valor_unitario REAL NOT NULL,
    CategoriaID INTEGER,
    CriadoEm TEXT DEFAULT (datetime('now','localtime'))
);
""")

# ========================
# TABELA ORCAMENTOS
# ========================
cur.execute("""
CREATE TABLE IF NOT EXISTS orcamentos (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Cliente TEXT,
    CNPJ TEXT,
    Endereco TEXT,
    Contato TEXT,
    Frete REAL,
    Total REAL,
    CriadoEm TEXT DEFAULT (datetime('now','localtime'))
);
""")

cur.execute("""
ALTER TABLE orcamentos
ADD COLUMN empresa_id INTEGER
""")

# ========================
# TABELA ITENS DO ORÇAMENTO
# ========================
cur.execute("""
CREATE TABLE IF NOT EXISTS itens_produtos (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    OrcamentoID INTEGER,
    ProdutoID INTEGER,
    Descricao TEXT,
    Quantidade INTEGER,
    Preco_unitario REAL,
    Valor_total REAL,
    CriadoEm TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (OrcamentoID) REFERENCES orcamentos(ID),
    FOREIGN KEY (ProdutoID) REFERENCES produtos(ID)
);
""")

# Salvar e fecha
conn.commit()
conn.close()

print("Banco COMPLETO criado com sucesso!")
