from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from services.receita_service import ReceitaService


receita_bp = Blueprint(
    "receita",
    __name__
)


def receita_to_dict(receita):

    return {
        "id": receita.id,
        "empresa_id": receita.empresa_id,
        "cliente_id": receita.cliente_id,
        "categoria_id": receita.categoria_id,

        "data": (
            receita.data.isoformat()
            if receita.data
            else None
        ),

        "data_recebimento": (
            receita.data_recebimento.isoformat()
            if receita.data_recebimento
            else None
        ),

        "descricao": receita.descricao,

        "valor": (
            str(receita.valor)
            if receita.valor is not None
            else "0.00"
        ),

        "forma_pagamento": receita.forma_pagamento,

        "desconto": (
            str(receita.desconto)
            if receita.desconto is not None
            else "0.00"
        ),

        "valor_total": (
            str(receita.valor_total)
            if receita.valor_total is not None
            else "0.00"
        ),

        "status": receita.status,

        "criado_em": (
            receita.criado_em.isoformat()
            if receita.criado_em
            else None
        ),

        "atualizado_em": (
            receita.atualizado_em.isoformat()
            if receita.atualizado_em
            else None
        )
    }


# ==========================================================
# CADASTRAR RECEITA
# ==========================================================

@receita_bp.route("/", methods=["POST"])
@jwt_required()
def registrar():

    dados = request.get_json()

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    receita = ReceitaService.registrar(
        dados,
        empresa_id
    )

    return jsonify({
        "mensagem": "Receita cadastrada com sucesso",
        "receita": receita_to_dict(receita)
    }), 201


# ==========================================================
# LISTAR RECEITAS
# ==========================================================

@receita_bp.route("/", methods=["GET"])
@jwt_required()
def listar():

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    receitas = ReceitaService.listar(
        empresa_id
    )

    return jsonify([
        receita_to_dict(receita)
        for receita in receitas
    ]), 200


# ==========================================================
# BUSCAR RECEITA
# ==========================================================

@receita_bp.route(
    "/<int:receita_id>",
    methods=["GET"]
)
@jwt_required()
def buscar(receita_id):

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    receita = ReceitaService.buscar_por_id(
        receita_id,
        empresa_id
    )

    return jsonify(
        receita_to_dict(receita)
    ), 200


# ==========================================================
# ATUALIZAR RECEITA
# ==========================================================

@receita_bp.route(
    "/<int:receita_id>",
    methods=["PUT"]
)
@jwt_required()
def atualizar(receita_id):

    dados = request.get_json()

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    receita = ReceitaService.atualizar(
        receita_id,
        dados,
        empresa_id
    )

    return jsonify({
        "mensagem": "Receita atualizada com sucesso",
        "receita": receita_to_dict(receita)
    }), 200


# ==========================================================
# EXCLUIR RECEITA
# ==========================================================

@receita_bp.route(
    "/<int:receita_id>",
    methods=["DELETE"]
)
@jwt_required()
def excluir(receita_id):

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    ReceitaService.excluir(
        receita_id,
        empresa_id
    )

    return jsonify({
        "mensagem": "Receita excluída com sucesso"
    }), 200