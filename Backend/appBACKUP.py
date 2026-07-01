import uuid

from flask import Flask, request, jsonify, send_from_directory
import sqlite3
from flask_cors import CORS
import os
from datetime import datetime, timedelta  
from flask import send_from_directory


app = Flask(__name__)
CORS(app)

# ===============================
# Conexão correta com o banco
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "meu_banco.db")


IMAGES_FOLDER = "imagens"
os.makedirs(IMAGES_FOLDER, exist_ok=True)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ===============================
# USUÁRIOS
# ===============================

@app.route("/usuarios", methods=["GET"])
def listar_usuarios():
    conn = get_db()
    cur = conn.execute("SELECT * FROM usuarios")
    dados = cur.fetchall()
    usuarios = [{"ID": row["ID"], "Nome": row["Nome"], "Email": row["Email"]} for row in dados]
    return jsonify(usuarios)

@app.route("/usuarios", methods=["POST"])
def cadastrar_usuarios():
    data = request.json
    nome = data.get("Nome")
    email = data.get("Email")
    senha = data.get("Senha")

    if not nome or not email or not senha:
        return {"erro": "Todos os campos são obrigatórios"}, 400

    try:
        conn = get_db()
        conn.execute("INSERT INTO usuarios (Nome, Email, Senha) VALUES (?, ?, ?)", (nome, email, senha))
        conn.commit()
    except sqlite3.IntegrityError:
        return {"erro": "Email já cadastrado!"}, 400

    return {"mensagem": "Usuário cadastrado com sucesso!"}, 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("Email")
    senha = data.get("Senha")

    if not email or not senha:
        return {"erro": "Email e senha são obrigatórios"}, 400

    conn = get_db()
    cur = conn.execute("SELECT * FROM usuarios WHERE Email=?", (email,))
    usuario = cur.fetchone()

    if not usuario:
        return {"erro": "Usuário não encontrado"}, 404
    if usuario["Senha"] != senha:
        return {"erro": "Senha incorreta"}, 401

    return {"mensagem": "Login bem-sucedido!", "usuario": {"ID": usuario["ID"], "Nome": usuario["Nome"], "Email": usuario["Email"]}}

@app.route("/usuarios/<int:id>/senha", methods=["PUT"])
def atualizar_senha(id):
    data = request.json
    nova_senha = data.get("Senha")
    if not nova_senha:
        return {"erro": "A nova senha é obrigatória"}, 400

    conn = get_db()
    cur = conn.execute("UPDATE usuarios SET Senha = ? WHERE ID = ?", (nova_senha, id))
    conn.commit()

    if cur.rowcount == 0:
        return {"erro": "Usuário não encontrado"}, 404
    return {"mensagem": "Senha atualizada com sucesso!"}

@app.route("/usuarios/<int:id>", methods=["DELETE"])
def deletar_usuario(id):
    conn = get_db()
    cur = conn.execute("DELETE FROM usuarios WHERE ID = ?", (id,))
    conn.commit()
    if cur.rowcount == 0:
        return {"erro": "Usuário não encontrado"}, 404
    return {"mensagem": "Usuário deletado com sucesso!"}

# ===============================
# RECEITAS
# ===============================



@app.route("/receitas", methods=["POST"])
def cadastrar_receitas():
    data = request.json

    # ===== tratar valor =====
    try:
        valor = float(str(data.get("Valor") or 0).replace(",", "."))
    except:
        return {"erro": "Valor inválido"}, 400

    data_receita = data.get("Data")
    cliente = data.get("Cliente")
    descricao = data.get("Descricao")
    forma_pagamento = data.get("Forma_pagamento")
    categoria_id = data.get("CategoriaID")

    if not data_receita:
        return {"erro": "Data é obrigatória!"}, 400

    parcelas = int(data.get("Parcelas") or 1)

    # ===== boleto =====
    data_recebimento = data.get("DataRecebimento")

    if forma_pagamento == "Boleto":
        if not data_recebimento:
            data_recebimento = (
                datetime.strptime(data_receita, "%Y-%m-%d") + timedelta(days=7)
            ).strftime("%Y-%m-%d")
    else:
        data_recebimento = data_receita

    # ===== cálculo financeiro =====
 
    # ===== cálculo financeiro =====
    desconto = 0
    status = "Pago"
    valor_total = valor  # 🔥 garante que sempre exista

    if forma_pagamento == "Cartão de crédito":
        taxa = 0.0498
        taxa_parcela = taxa + (0.01 * (parcelas - 1))
        desconto = round(valor * taxa_parcela, 2)
        valor_total = round(valor - desconto, 2)

    elif forma_pagamento == "Cartão de débito":
        taxa = 0.0169
        desconto = round(valor * taxa, 2)
        valor_total = round(valor - desconto, 2)

    elif forma_pagamento == "Boleto":
        status = "Em aberto"
    

            

    # ===== inserir no banco =====
    conn = get_db()
    conn.execute("""
        INSERT INTO receitas
        (Valor, Data, Cliente, Descricao, Forma_pagamento,
        CategoriaID, DataRecebimento, ValorTotal, Desconto, Status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        valor,
        data_receita,
        cliente,
        descricao,
        forma_pagamento,
        categoria_id,
        data_recebimento,
        valor_total,
        desconto,
        status
    ))

    conn.commit()

    return {"mensagem": "Receita cadastrada com sucesso!"}, 201



@app.route("/receitas/<int:id>", methods=["PUT"])
def editar_receitas(id):
    data = request.json

    try:
        valor = float(str(data.get("Valor") or 0).replace(",", "."))
    except:
        return {"erro": "Valor inválido"}, 400

    data_receita = data.get("Data")
    cliente = data.get("Cliente")
    descricao = data.get("Descricao")
    forma_pagamento = data.get("Forma_pagamento")
    categoria_id = data.get("CategoriaID")
    parcelas = int(data.get("Parcelas") or 1)
    desconto = float(data.get("Desconto") or 0)
    status = data.get("Status") or "Pago"

    if not data_receita:
        return {"erro": "Data é obrigatória!"}, 400

    # ===== boleto =====
    data_recebimento = data.get("DataRecebimento")
    if forma_pagamento == "Boleto" and not data_recebimento:
        data_recebimento = (
            datetime.strptime(data_receita, "%Y-%m-%d") + timedelta(days=7)
        ).strftime("%Y-%m-%d")
    elif not data_recebimento:
        data_recebimento = data_receita

    # ===== valor total =====
    if forma_pagamento == "Cartão de crédito":
        taxa = 0.0498
        taxa_parcela = taxa + (0.01 * (parcelas - 1))
        valor_total = round(valor - (valor * taxa_parcela), 2)
    elif forma_pagamento == "Cartão de débito":
        taxa = 0.0169
        valor_total = round(valor - (valor * taxa), 2)
    else:
        valor_total = valor

    conn = get_db()
    cur = conn.execute("""
        UPDATE receitas
        SET Valor=?, Data=?, Cliente=?, Descricao=?,
            Forma_pagamento=?, CategoriaID=?,
            DataRecebimento=?, ValorTotal=?,
            Desconto=?, Status=?
        WHERE ID=?
    """, (
        valor,
        data_receita,
        cliente,
        descricao,
        forma_pagamento,
        categoria_id,
        data_recebimento,
        valor_total,
        desconto,
        status,
        id
    ))

    conn.commit()
    conn.close()

    if cur.rowcount == 0:
        return {"erro": "Receita não encontrada!"}, 404

    return {"mensagem": "Receita atualizada com sucesso!"}




@app.route("/receitas", methods=["GET"])
def listar_receitas():
    busca = request.args.get("busca", "").lower()  # pega o parâmetro de busca
    conn = get_db()

    sql = """
        SELECT receitas.*, COALESCE(categorias.Nome,'Sem Categoria') AS Categoria
        FROM receitas
        LEFT JOIN categorias ON categorias.ID = receitas.CategoriaID
    """

    
    if busca:
        sql += """
        WHERE LOWER(receitas.Descricao) LIKE ? OR LOWER(receitas.Cliente) LIKE ?
        """
        params = (f"%{busca}%", f"%{busca}%")
    else:
        params = ()

    
    sql += """
        ORDER BY 
            CASE 
                WHEN Status = 'Em aberto' THEN 0
                ELSE 1
            END,
            Data DESC,
            ID DESC
    """

    cur = conn.execute(sql, params)
    dados = cur.fetchall()
    receitas = [
        {
            "ID": row["ID"],
            "Valor": row["Valor"],
            "Data": row["Data"],
            "Cliente": row["Cliente"],
            "Descricao": row["Descricao"],
            "Forma_pagamento": row["Forma_pagamento"],
            "CategoriaID": row["CategoriaID"],
            "Categoria": row["Categoria"],
            "DataRecebimento": row["DataRecebimento"],
            "ValorTotal": row["ValorTotal"],
            "Desconto": row["Desconto"],
            "Status": row["Status"],
            "CriadoEm": row["CriadoEm"]
        }
        for row in dados
    ]
    return jsonify(receitas)



@app.route("/receitas/<int:id>", methods=["DELETE"])
def excluir_receitas(id):
    conn = get_db()
    cur = conn.execute("DELETE FROM receitas WHERE ID = ?", (id,))
    conn.commit()
    if cur.rowcount == 0:
        return {"erro": "Receita não encontrada!"}, 404
    return {"mensagem": "Receita excluída com sucesso!"}

# ===============================
# DESPESAS
# ===============================



@app.route("/despesas", methods=["POST"])
def cadastrar_despesa():
    data = request.json

    data_despesa = data.get("DataPagamento")
    data_vencimento = data.get("DataVencimento")
    nome = data.get("Nome")
    descricao = data.get("Descricao")
    status = data.get("Status")
    categoria_id = data.get("CategoriaID")

    try:
        valor = float(str(data.get("Valor")).replace(",", "."))
    except:
        return {"erro": "Valor inválido!"}, 400

    if not valor or not data_vencimento:
        return {"erro": "Valor e Data de Vencimento são obrigatórios!"}, 400

    conn = get_db()
    try:
        conn.execute("""
            INSERT INTO despesas 
            (DataPagamento, DataVencimento, Nome, Descricao, Valor, Status, CategoriaID)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (data_despesa, data_vencimento, nome, descricao, valor, status, categoria_id))

        conn.commit()
        return {"mensagem": "Despesa cadastrada com sucesso!"}, 201
    finally:
        conn.close()

@app.route("/despesas", methods=["GET"])
def listar_despesas():
    conn = get_db()
    cur = conn.execute("""
        SELECT despesas.*, 
        COALESCE(categorias.Nome,'Sem Categoria') AS Categoria
        FROM despesas
        LEFT JOIN categorias ON categorias.ID = despesas.CategoriaID
        ORDER BY DataPagamento DESC
        """)
    dados = cur.fetchall()

    despesas = [
        {
            "ID": row["ID"],
            "DataPagamento": row["DataPagamento"],
            "DataVencimento": row["DataVencimento"],
            "Nome": row["Nome"],
            "Descricao": row["Descricao"],
            "Valor": row["Valor"],
            "Status": row["Status"],
            "CategoriaID": row["CategoriaID"],
            "Categoria": row["Categoria"],
            "CriadoEm": row["CriadoEm"],
        }
        for row in dados
    ]

    conn.close()
    return jsonify(despesas)


@app.route("/despesas/<int:id>", methods=["PUT"])
def editar_despesa(id):
    data = request.json

    data_despesa = data.get("DataPagamento")
    data_vencimento = data.get("DataVencimento")
    nome = data.get("Nome")
    descricao = data.get("Descricao")
    valor = data.get("Valor")
    status = data.get("Status")
    categoria_id = data.get("CategoriaID")

    conn = get_db()
    cur = conn.execute("""
        UPDATE despesas
        SET DataPagamento = ?, 
            DataVencimento = ?, 
            Nome = ?, 
            Descricao = ?, 
            Valor = ?, 
            Status = ?, 
            CategoriaID = ?
        WHERE ID = ?
    """, (data_despesa, data_vencimento, nome, descricao, valor, status, categoria_id, id))

    conn.commit()

    if cur.rowcount == 0:
        conn.close()
        return {"erro": "Despesa não encontrada!"}, 404

    conn.close()
    return {"mensagem": "Despesa atualizada com sucesso!"}



@app.route("/despesas/<int:id>", methods=["DELETE"])
def excluir_despesa(id):
    conn = get_db()
    cur = conn.execute("DELETE FROM despesas WHERE ID = ?", (id,))
    conn.commit()
    if cur.rowcount == 0:
        return {"erro": "Despesa não encontrada!"}, 404
    return {"mensagem": "Despesa excluída com sucesso!"}



# ===============================
# LISTAR FUNCIONÁRIOS
# ===============================
@app.route("/funcionarios", methods=["GET"])
def listar_funcionarios():
    conn = get_db()
    cur = conn.execute("SELECT * FROM funcionarios")
    dados = cur.fetchall()

    funcionarios = []
    for row in dados:
        funcionarios.append({
            "ID": row["ID"],
            "Nome": row["Nome"],
            "Cargo": row["Cargo"],
            "Telefone": row["Telefone"],
            "Endereco": row["Endereco"],
            "Valor_salario": row["Valor_salario"],
            "Data_admissao": row["Data_admissao"],
            "Status": row["Status"],
            "Data_demissao": row["Data_demissao"],
            "CriadoEm": row["CriadoEm"]
        })

    return jsonify(funcionarios)


# ===============================
# CADASTRAR FUNCIONÁRIO
# ===============================
@app.route("/funcionarios", methods=["POST"])
def cadastrar_funcionario():
    data = request.json

    nome = data.get("Nome")
    cargo = data.get("Cargo")
    telefone = data.get("Telefone")
    endereco = data.get("Endereco")
    valor_salario = data.get("Valor_salario")
    data_admissao = data.get("Data_admissao")
    status = data.get("Status", "ATIVO")

    data_demissao = None
    if status == "INATIVO":
        data_demissao = datetime.now().strftime("%Y-%m-%d")

    if not nome or not cargo:
        return {"erro": "Nome e Cargo são obrigatórios!"}, 400

    conn = get_db()
    conn.execute("""
        INSERT INTO funcionarios
        (Nome, Cargo, Telefone, Endereco, Valor_salario, Data_admissao, Status, Data_demissao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        nome,
        cargo,
        telefone,
        endereco,
        valor_salario,
        data_admissao,
        status,
        data_demissao
    ))
    conn.commit()

    return {"mensagem": "Funcionário cadastrado com sucesso!"}, 201


# ===============================
# EDITAR FUNCIONÁRIO
# ===============================
@app.route("/funcionarios/<int:id>", methods=["PUT"])
def editar_funcionario(id):
    data = request.json

    nome = data.get("Nome")
    cargo = data.get("Cargo")
    telefone = data.get("Telefone")
    endereco = data.get("Endereco")
    valor_salario = data.get("Valor_salario")
    data_admissao = data.get("Data_admissao")
    status = data.get("Status")

    data_demissao = None
    if status == "INATIVO":
        data_demissao = datetime.now().strftime("%Y-%m-%d")

    conn = get_db()
    cur = conn.execute("""
        UPDATE funcionarios SET
            Nome = ?,
            Cargo = ?,
            Telefone = ?,
            Endereco = ?,
            Valor_salario = ?,
            Data_admissao = ?,
            Status = ?,
            Data_demissao = ?
        WHERE ID = ?
    """, (
        nome,
        cargo,
        telefone,
        endereco,
        valor_salario,
        data_admissao,
        status,
        data_demissao,
        id
    ))
    conn.commit()

    if cur.rowcount == 0:
        return {"erro": "Funcionário não encontrado"}, 404

    return {"mensagem": "Funcionário atualizado com sucesso!"}


# ===============================
# EXCLUIR FUNCIONÁRIO
# ===============================
@app.route("/funcionarios/<int:id>", methods=["DELETE"])
def excluir_funcionario(id):
    conn = get_db()
    cur = conn.execute("DELETE FROM funcionarios WHERE ID = ?", (id,))
    conn.commit()

    if cur.rowcount == 0:
        return {"erro": "Funcionário não encontrado"}, 404

    return {"mensagem": "Funcionário excluído com sucesso!"}

# ===============================
# CATEGORIAS
# ===============================

@app.route("/categorias", methods=["GET"])
def listar_categorias():
    conn = get_db()
    cur = conn.execute("SELECT * FROM categorias ORDER BY Nome ASC")
    dados = cur.fetchall()
    categorias = [{"ID": row["ID"], "Nome": row["Nome"]} for row in dados]
    return jsonify(categorias)




# Pasta para salvar as imagens  ns
@app.route('/imagens/<path:nome>')
def imagens(nome):
    return send_from_directory('imagens', nome)

# ===============================
# EMPRESA CADASTRAR
# ===============================

@app.route("/empresa", methods=["POST"])
def salvar_empresa():
    conn = get_db()

   
    data = request.form or request.json 


    nome = data.get("nome")
    cnpj = data.get("cnpj")
    endereco = data.get("endereco")
    cidade = data.get("cidade")
    estado = data.get("estado")
    cep = data.get("cep")
    telefone = data.get("telefone")
    email = data.get("email")
    site = data.get("site")
    instagran = data.get("instagran")
    slogan = data.get("slogan")
 
    logo_file = request.files.get("logo")
    logo_path = None
    if logo_file:
        logo_filename = f"{uuid.uuid4()}_{logo_file.filename}"
        logo_path = os.path.join(IMAGES_FOLDER, logo_filename)
        logo_file.save(logo_path)

  
    conn.execute("""
        INSERT OR REPLACE INTO empresa
        (id, nome, cnpj, endereco, cidade, estado, cep, telefone, email, site, instagran, slogan, logo)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (nome, cnpj, endereco, cidade, estado, cep, telefone, email, site, instagran, slogan, logo_path))
    conn.commit()

    return jsonify({"mensagem": "Empresa salva com sucesso!", "logo": logo_path})




@app.route("/empresa", methods=["GET"])
def get_empresa():
    conn = get_db()
    empresa = conn.execute("SELECT * FROM empresa WHERE id = 1").fetchone()
    if empresa:
        return jsonify(dict(empresa))
    return jsonify({"erro": "Empresa não encontrada"}), 404






@app.route("/empresa/<int:id>", methods=["PUT"])
def editar_empresa(id):
    conn = get_db()

    nome = request.form.get("nome")
    cnpj = request.form.get("cnpj")
    endereco = request.form.get("endereco")
    cidade = request.form.get("cidade")
    estado = request.form.get("estado")
    cep = request.form.get("cep")
    telefone = request.form.get("telefone")
    email = request.form.get("email")
    site = request.form.get("site")
    instagram = request.form.get("instagram")
    slogan = request.form.get("slogan")

    logo_file = request.files.get("logo")
    logo_path = None
    if logo_file:
        logo_filename = f"{uuid.uuid4()}_{logo_file.filename}"
        logo_path = os.path.join(IMAGES_FOLDER, logo_filename)
        logo_file.save(logo_path)

    cur = conn.execute("""
        UPDATE empresa SET
            nome = ?, cnpj = ?, endereco = ?, cidade = ?, estado = ?, cep = ?,
            telefone = ?, email = ?, site = ?, instagran = ?, slogan = ?, logo = ?
        WHERE id = ?
    """, (nome, cnpj, endereco, cidade, estado, cep, telefone, email, site, instagram, slogan, logo_path, id))

    conn.commit()

    if cur.rowcount == 0:
        return {"erro": "Empresa não encontrada"}, 404

    return jsonify({"mensagem": "Empresa atualizada com sucesso!", "logo": logo_path})







# ===============================
# LISTAR PRODUTOS
# ===============================

@app.route("/produtos", methods=["GET"])
def listar_produtos():

    conn = get_db()

    produtos = conn.execute("SELECT * FROM produtos").fetchall()

    resultado = []

    for p in produtos:
        resultado.append({
            "id": p["ID"],
            "Nome_produto": p["Nome_produto"],
            "Valor_unitario": p["Valor_unitario"],
            "CategoriaID": p["CategoriaID"]
        })

    return jsonify(resultado)


# ===============================
# CRIAR PRODUTO
# ===============================

@app.route("/produtos", methods=["POST"])
def criar_produto():

    data = request.json

    nome = data.get("Nome_produto")
    valor = data.get("Valor_unitario")
    categoria = data.get("CategoriaID")

    if not nome or not valor:
        return {"erro": "Nome e valor obrigatórios"}, 400

    conn = get_db()

    conn.execute(
        """
        INSERT INTO produtos
        (Nome_produto, Valor_unitario, CategoriaID)
        VALUES (?, ?, ?)
        """,
        (nome, valor, categoria)
    )

    conn.commit()

    return {"mensagem": "Produto cadastrado"}, 201


# ===============================
# SALVAR ORÇAMENTO
# ===============================

@app.route("/orcamentos", methods=["POST"])
def salvar_orcamento():

    data = request.json

    cliente = data.get("cliente")
    cnpj = data.get("cnpj")
    endereco = data.get("endereco")
    contato = data.get("contato")
    frete = data.get("frete")
    total = data.get("total")
    itens = data.get("itens")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO orcamentos
        (Cliente, CNPJ, Endereco, Contato, Frete,  Total)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (cliente, cnpj, endereco, contato, frete,  total))

    orcamento_id = cursor.lastrowid

    for item in itens:

        cursor.execute("""
            INSERT INTO itens_produtos
            (OrcamentoID, ProdutoID, Descricao, Quantidade, Preco_unitario, Valor_total)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            orcamento_id,
            item["id"],
            item["nome"],
            item["quantidade"],
            item["preco"],
            item["total"]
        ))

    conn.commit()

    return {"mensagem": "Orçamento salvo com sucesso"}


# ===============================
# LISTAR ORÇAMENTOS
# ===============================

@app.route("/orcamentos", methods=["GET"])
def listar_orcamentos():

    conn = get_db()

    orcamentos = conn.execute("""
        SELECT * FROM orcamentos
        ORDER BY ID DESC
    """).fetchall()

    lista = []

    for o in orcamentos:
        lista.append(dict(o))

    return jsonify(lista)


# ===============================
# LISTAR ITENS DE UM ORÇAMENTO
# ===============================

@app.route("/orcamentos/<int:id>/itens", methods=["GET"])
def listar_itens(id):

    conn = get_db()

    itens = conn.execute("""
        SELECT * FROM itens_produtos
        WHERE OrcamentoID = ?
    """, (id,)).fetchall()

    lista = []

    for i in itens:
        lista.append(dict(i))

    return jsonify(lista)


# ===============================
# DELETAR ITEM
# ===============================

@app.route("/itens/<int:id>", methods=["DELETE"])
def deletar_item(id):

    conn = get_db()

    conn.execute(
        "DELETE FROM itens_produtos WHERE ID = ?",
        (id,)
    )

    conn.commit()

    return {"mensagem": "Item removido"}



# ===============================
# API PARA GERAR ORÇAMENTO EM PDF AQUI
# ===============================

@app.route("/empresa", methods=["GET"])
def dados_empresa():
    conn = get_db()
    empresa = conn.execute("SELECT * FROM empresa LIMIT 1").fetchone()  # assumindo só 1 empresa
    if empresa:
        return jsonify(dict(empresa))
    return jsonify({"erro": "Empresa não encontrada"}), 404



# ===============================
# Rodar servidor
# ===============================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
