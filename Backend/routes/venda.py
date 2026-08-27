from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from services.venda_service import VendaService


venda_bp = Blueprint(
    "venda",
    __name__
)


def venda_to_dict(venda):

    return {
        "id": venda.id,
        "empresa_id": venda.empresa_id,
        "cliente_id": venda.cliente_id,

        "data_venda": (
            venda.data_venda.isoformat()
            if venda.data_venda
            else None
        ),

        "subtotal": (
            str(venda.subtotal)
            if venda.subtotal is not None
            else "0.00"
        ),

        "desconto": (
            str(venda.desconto)
            if venda.desconto is not None
            else "0.00"
        ),

        "taxa_pagamento": (
            str(venda.taxa_pagamento)
            if venda.taxa_pagamento is not None
            else "0.00"
        ),

        "percentual_taxa": (
            str(venda.percentual_taxa)
            if venda.percentual_taxa is not None
            else "0.00"
        ),

        "total": (
            str(venda.total)
            if venda.total is not None
            else "0.00"
        ),

        "forma_pagamento": venda.forma_pagamento,

        "parcelas": venda.parcelas,

        "status": venda.status,

        "observacao": venda.observacao,

        "criado_em": (
            venda.criado_em.isoformat()
            if venda.criado_em
            else None
        ),

        "atualizado_em": (
            venda.atualizado_em.isoformat()
            if venda.atualizado_em
            else None
        )
    }


# ==========================================================
# CADASTRAR VENDA
# ==========================================================

@venda_bp.route("/", methods=["POST"])
@jwt_required()
def registrar():

    dados = request.get_json()

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    venda = VendaService.registrar(
        dados,
        empresa_id
    )

    return jsonify({
        "mensagem": "Venda cadastrada com sucesso",
        "venda": venda_to_dict(venda)
    }), 201


# ==========================================================
# LISTAR VENDAS
# ==========================================================

@venda_bp.route("/", methods=["GET"])
@jwt_required()
def listar():

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    vendas = VendaService.listar(
        empresa_id
    )

    return jsonify([
        venda_to_dict(venda)
        for venda in vendas
    ]), 200


# ==========================================================
# BUSCAR VENDA
# ==========================================================

@venda_bp.route(
    "/<int:venda_id>",
    methods=["GET"]
)
@jwt_required()
def buscar(venda_id):

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    venda = VendaService.buscar_por_id(
        venda_id,
        empresa_id
    )

    return jsonify(
        venda_to_dict(venda)
    ), 200


# ==========================================================
# ATUALIZAR VENDA
# ==========================================================

@venda_bp.route(
    "/<int:venda_id>",
    methods=["PUT"]
)
@jwt_required()
def atualizar(venda_id):

    dados = request.get_json()

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    venda = VendaService.atualizar(
        venda_id,
        dados,
        empresa_id
    )

    return jsonify({
        "mensagem": "Venda atualizada com sucesso",
        "venda": venda_to_dict(venda)
    }), 200


# ==========================================================
# RECALCULAR VENDA
# ==========================================================

@venda_bp.route(
    "/<int:venda_id>/recalcular",
    methods=["PUT"]
)
@jwt_required()
def recalcular(venda_id):

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    venda = VendaService.recalcular(
        venda_id,
        empresa_id
    )

    return jsonify({
        "mensagem": "Venda recalculada com sucesso",
        "venda": venda_to_dict(venda)
    }), 200


# ==========================================================
# EXCLUIR VENDA
# ==========================================================

@venda_bp.route(
    "/<int:venda_id>",
    methods=["DELETE"]
)
@jwt_required()
def excluir(venda_id):

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    VendaService.excluir(
        venda_id,
        empresa_id
    )

    return jsonify({
        "mensagem": "Venda excluída com sucesso"
    }), 200