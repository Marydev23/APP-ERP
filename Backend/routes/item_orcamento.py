from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from services.item_orcamento_service import ItemOrcamentoService


item_orcamento_bp = Blueprint(
    "item_orcamento",
    __name__
)


def item_to_dict(item):

    return {
        "id": item.id,
        "orcamento_id": item.orcamento_id,
        "produto_id": item.produto_id,
        "descricao": item.descricao,
        "quantidade": item.quantidade,
        "preco_unitario": (
            str(item.preco_unitario)
            if item.preco_unitario is not None
            else None
        ),
        "valor_total": (
            str(item.valor_total)
            if item.valor_total is not None
            else None
        ),
        "criado_em": (
            item.criado_em.isoformat()
            if item.criado_em
            else None
        ),
        "atualizado_em": (
            item.atualizado_em.isoformat()
            if item.atualizado_em
            else None
        )
    }


@item_orcamento_bp.route("/", methods=["POST"])
@jwt_required()
def registrar():

    dados = request.get_json()

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    item = ItemOrcamentoService.registrar(
        dados,
        empresa_id
    )

    return jsonify({
        "mensagem": "Item do orçamento cadastrado com sucesso",
        "item": item_to_dict(item)
    }), 201


@item_orcamento_bp.route("/orcamento/<int:orcamento_id>", methods=["GET"])
@jwt_required()
def listar_por_orcamento(orcamento_id):

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    itens = ItemOrcamentoService.listar_por_orcamento(
        orcamento_id,
        empresa_id
    )

    return jsonify([
        item_to_dict(item)
        for item in itens
    ]), 200


@item_orcamento_bp.route("/<int:item_id>", methods=["GET"])
@jwt_required()
def buscar(item_id):

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    item = ItemOrcamentoService.buscar_por_id(
        item_id,
        empresa_id
    )

    return jsonify(
        item_to_dict(item)
    ), 200


@item_orcamento_bp.route("/<int:item_id>", methods=["PUT"])
@jwt_required()
def atualizar(item_id):

    dados = request.get_json()

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    item = ItemOrcamentoService.atualizar(
        item_id,
        dados,
        empresa_id
    )

    return jsonify({
        "mensagem": "Item do orçamento atualizado com sucesso",
        "item": item_to_dict(item)
    }), 200


@item_orcamento_bp.route("/<int:item_id>", methods=["DELETE"])
@jwt_required()
def excluir(item_id):

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    ItemOrcamentoService.excluir(
        item_id,
        empresa_id
    )

    return jsonify({
        "mensagem": "Item do orçamento excluído com sucesso"
    }), 200