from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from services.item_venda_service import ItemVendaService


item_venda_bp = Blueprint(
    "item_venda",
    __name__
)


def item_to_dict(item):

    return {
        "id": item.id,
        "venda_id": item.venda_id,
        "produto_id": item.produto_id,
        "descricao": item.descricao,
        "quantidade": item.quantidade,
        "preco_unitario": (
            str(item.preco_unitario)
            if item.preco_unitario is not None
            else None
        ),
        "desconto": (
            str(item.desconto)
            if item.desconto is not None
            else "0.00"
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


@item_venda_bp.route("/", methods=["POST"])
@jwt_required()
def registrar():

    dados = request.get_json()

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    item = ItemVendaService.registrar(
        dados,
        empresa_id
    )

    return jsonify({
        "mensagem": "Item da venda cadastrado com sucesso",
        "item": item_to_dict(item)
    }), 201


@item_venda_bp.route("/venda/<int:venda_id>", methods=["GET"])
@jwt_required()
def listar_por_venda(venda_id):

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    itens = ItemVendaService.listar_por_venda(
        venda_id,
        empresa_id
    )

    return jsonify([
        item_to_dict(item)
        for item in itens
    ]), 200


@item_venda_bp.route("/<int:item_id>", methods=["GET"])
@jwt_required()
def buscar(item_id):

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    item = ItemVendaService.buscar_por_id(
        item_id,
        empresa_id
    )

    return jsonify(
        item_to_dict(item)
    ), 200


@item_venda_bp.route("/<int:item_id>", methods=["PUT"])
@jwt_required()
def atualizar(item_id):

    dados = request.get_json()

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    item = ItemVendaService.atualizar(
        item_id,
        dados,
        empresa_id
    )

    return jsonify({
        "mensagem": "Item da venda atualizado com sucesso",
        "item": item_to_dict(item)
    }), 200


@item_venda_bp.route("/<int:item_id>", methods=["DELETE"])
@jwt_required()
def excluir(item_id):

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    ItemVendaService.excluir(
        item_id,
        empresa_id
    )

    return jsonify({
        "mensagem": "Item da venda excluído com sucesso"
    }), 200