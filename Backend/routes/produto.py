from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from services.produto_service import ProdutoService


produto = Blueprint("produto", __name__)


# ==========================================================
# CADASTRAR PRODUTO
# ==========================================================

@produto.route("/register", methods=["POST"])
@jwt_required()
def register():

    dados = request.get_json()

    empresa_id = get_jwt()["empresa_id"]

    novo_produto = ProdutoService.registrar(
        dados,
        empresa_id
    )

    return jsonify({
        "mensagem": "Produto cadastrado com sucesso.",
        "id": novo_produto.id
    }), 201


# ==========================================================
# LISTAR PRODUTOS
# ==========================================================

@produto.route("/", methods=["GET"])
@jwt_required()
def listar():

    empresa_id = get_jwt()["empresa_id"]

    produtos = ProdutoService.listar(
        empresa_id
    )

    lista = []

    for produto in produtos:

        lista.append({
            "id": produto.id,
            "nome": produto.nome,
            "descricao": produto.descricao,
            "valor_unitario": float(produto.valor_unitario),
            "estoque": produto.estoque,
            "ativo": produto.ativo,
            "categoria_id": produto.categoria_id
        })

    return jsonify(lista), 200


# ==========================================================
# BUSCAR PRODUTO POR ID
# ==========================================================

@produto.route("/<int:id>", methods=["GET"])
@jwt_required()
def buscar_produto(id):

    empresa_id = get_jwt()["empresa_id"]

    produto = ProdutoService.buscar_por_id(
        id,
        empresa_id
    )

    return jsonify({
        "id": produto.id,
        "nome": produto.nome,
        "descricao": produto.descricao,
        "valor_unitario": float(produto.valor_unitario),
        "estoque": produto.estoque,
        "ativo": produto.ativo,
        "categoria_id": produto.categoria_id
    }), 200


# ==========================================================
# ATUALIZAR PRODUTO
# ==========================================================

@produto.route("/<int:id>", methods=["PUT"])
@jwt_required()
def atualizar(id):

    dados = request.get_json()

    empresa_id = get_jwt()["empresa_id"]

    produto_atualizado = ProdutoService.atualizar(
        id,
        dados,
        empresa_id
    )

    return jsonify({
        "mensagem": "Produto atualizado com sucesso.",
        "id": produto_atualizado.id
    }), 200


# ==========================================================
# DELETAR PRODUTO
# ==========================================================

@produto.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def deletar(id):

    empresa_id = get_jwt()["empresa_id"]

    ProdutoService.deletar(
        id,
        empresa_id
    )

    return jsonify({
        "mensagem": "Produto removido com sucesso."
    }), 200